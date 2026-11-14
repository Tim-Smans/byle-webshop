-- Discounts for Art by Lé
--
-- 1. Per art piece a sale percentage ("discountPercent", 1-99, null = none).
-- 2. Discount codes, valid on the art pieces in an order (never on shipping).
--
-- All prices are computed in the database (price_cart), used by both the
-- checkout preview and create_order, so what the customer sees is exactly
-- what they pay.
--
-- OrderItem."price" stays what the customer actually paid for that work,
-- after the sale and their share of the code discount. Refunds, invoices and
-- credit notes keep working per work without changes.
--
-- Run in the Supabase SQL editor. Safe to run multiple times.

begin;

-- ---------------------------------------------------------------------------
-- ArtPiece: sale percentage
-- ---------------------------------------------------------------------------

alter table public."ArtPiece"
  add column if not exists "discountPercent" integer;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ArtPiece_discountPercent_check') then
    alter table public."ArtPiece"
      add constraint "ArtPiece_discountPercent_check"
      check ("discountPercent" is null or "discountPercent" between 1 and 99);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- DiscountCode
-- ---------------------------------------------------------------------------

create table if not exists public."DiscountCode" (
  "id"               uuid primary key default gen_random_uuid(),
  -- Stored in capitals; customers may type it in any case
  "code"             text not null check ("code" ~ '^[A-Z0-9_-]{3,40}$'),
  -- Internal note, never shown to customers
  "description"      text,
  "type"             text not null check ("type" in ('percent', 'amount')),
  "value"            numeric(10, 2) not null check ("value" > 0),
  -- Minimum amount of the works (after sale prices), excl. shipping
  "minOrderAmount"   numeric(10, 2) check ("minOrderAmount" is null or "minOrderAmount" > 0),
  "maxUses"          integer check ("maxUses" is null or "maxUses" > 0),
  -- Calendar days in Belgian time, both inclusive
  "validFrom"        date,
  "validUntil"       date,
  -- Not applied to works that already have a sale percentage
  "excludeSaleItems" boolean not null default false,
  "isActive"         boolean not null default true,
  "createdAt"        timestamptz not null default now(),
  "updatedAt"        timestamptz not null default now(),

  constraint "DiscountCode_percent_check" check ("type" <> 'percent' or "value" < 100),
  constraint "DiscountCode_dates_check" check (
    "validFrom" is null or "validUntil" is null or "validFrom" <= "validUntil"
  )
);

create unique index if not exists "DiscountCode_code_key" on public."DiscountCode" ("code");

drop trigger if exists "DiscountCode_updated_at" on public."DiscountCode";
create trigger "DiscountCode_updated_at"
  before update on public."DiscountCode"
  for each row execute function public.set_updated_at();

alter table public."DiscountCode" enable row level security;

-- ---------------------------------------------------------------------------
-- Order / OrderItem: discount snapshot
-- ---------------------------------------------------------------------------

alter table public."Order"
  add column if not exists "discountCodeId" uuid references public."DiscountCode" ("id") on delete set null,
  -- Snapshot of the code as used, kept when the code is deleted
  add column if not exists "discountCode"   text,
  -- Discount from the code (sale discounts are already in the item prices)
  add column if not exists "discountAmount" numeric(10, 2) not null default 0 check ("discountAmount" >= 0);

create index if not exists "Order_discountCodeId_idx" on public."Order" ("discountCodeId");

-- "subtotal" is the sum of the works at their (sale) price, before the code.
-- total = subtotal - discountAmount + shippingCost

alter table public."OrderItem"
  -- Normal price of the work; null for orders from before discounts existed
  add column if not exists "originalPrice"   numeric(10, 2),
  -- Sale percentage at the moment of ordering
  add column if not exists "discountPercent" integer,
  -- This work's share of the code discount ("price" is already reduced by it)
  add column if not exists "codeDiscount"    numeric(10, 2) not null default 0 check ("codeDiscount" >= 0);

-- Sale price, rounded to the cent. Kept in sync with getSalePrice() in
-- lib/shop/discount.ts (that one is only for display).
create or replace function public.sale_price(p_price numeric, p_discount_percent integer)
returns numeric
language sql
immutable
as $$
  select case
    when p_discount_percent between 1 and 99 then round(p_price * (100 - p_discount_percent) / 100, 2)
    else round(p_price, 2)
  end;
$$;

-- ---------------------------------------------------------------------------
-- price_cart: prices the given art pieces with their sale percentage and an
-- optional discount code. Does not check availability (create_order does).
--
-- Raises (message is the error code, mapped to a friendly text in the app):
--   UNKNOWN_ART_PIECE, DISCOUNT_INVALID, DISCOUNT_NOT_STARTED,
--   DISCOUNT_EXPIRED, DISCOUNT_USED_UP, DISCOUNT_MIN_AMOUNT (detail: the
--   minimum), DISCOUNT_NOT_APPLICABLE
-- ---------------------------------------------------------------------------

create or replace function public.price_cart(
  p_art_piece_ids text[],
  p_discount_code text default null
)
returns table (
  "artPieceId"      text,
  "originalPrice"   numeric,
  "discountPercent" integer,
  "salePrice"       numeric,
  "codeDiscount"    numeric,
  "discountCodeId"  uuid,
  "discountCode"    text
)
language plpgsql
as $$
declare
  v_ids            text[];
  v_found          integer;
  v_code           public."DiscountCode"%rowtype;
  v_has_code       boolean := false;
  v_today          date := (now() at time zone 'Europe/Brussels')::date;
  v_used           integer;
  v_sale_total     numeric(10, 2);
  v_eligible_total numeric(10, 2);
  v_amount         numeric(10, 2) := 0;
begin
  select coalesce(array_agg(distinct id), '{}') into v_ids from unnest(p_art_piece_ids) as id;

  select count(*) into v_found from public."ArtPiece" where "id" = any(v_ids);
  if v_found <> cardinality(v_ids) then
    raise exception 'UNKNOWN_ART_PIECE';
  end if;

  if nullif(trim(coalesce(p_discount_code, '')), '') is not null then
    -- Locked, so two checkouts cannot both take the last use
    select * into v_code from public."DiscountCode"
      where "code" = upper(trim(p_discount_code))
      for update;

    if not found or not v_code."isActive" then
      raise exception 'DISCOUNT_INVALID';
    end if;
    if v_code."validFrom" is not null and v_today < v_code."validFrom" then
      raise exception 'DISCOUNT_NOT_STARTED';
    end if;
    if v_code."validUntil" is not null and v_today > v_code."validUntil" then
      raise exception 'DISCOUNT_EXPIRED';
    end if;

    if v_code."maxUses" is not null then
      -- Unpaid orders that expired or were cancelled give their use back
      select count(*) into v_used from public."Order" o
        where o."discountCodeId" = v_code."id" and o."status" not in ('expired', 'cancelled');
      if v_used >= v_code."maxUses" then
        raise exception 'DISCOUNT_USED_UP';
      end if;
    end if;

    v_has_code := true;
  end if;

  -- Sale prices
  select
    coalesce(sum(public.sale_price(ap."price"::numeric, ap."discountPercent")), 0),
    coalesce(sum(public.sale_price(ap."price"::numeric, ap."discountPercent")) filter (
      where not (coalesce(v_code."excludeSaleItems", false) and ap."discountPercent" is not null)
    ), 0)
    into v_sale_total, v_eligible_total
    from public."ArtPiece" ap where ap."id" = any(v_ids);

  if v_has_code then
    if v_code."minOrderAmount" is not null and v_sale_total < v_code."minOrderAmount" then
      raise exception 'DISCOUNT_MIN_AMOUNT' using detail = v_code."minOrderAmount"::text;
    end if;
    if v_eligible_total <= 0 then
      raise exception 'DISCOUNT_NOT_APPLICABLE';
    end if;
    if v_code."type" = 'amount' then
      v_amount := least(v_code."value", v_eligible_total);
    end if;
  end if;

  return query
  with lines as (
    select
      ap."id" as id,
      ap."price"::numeric as original_price,
      case when ap."discountPercent" between 1 and 99 then ap."discountPercent" end as pct,
      public.sale_price(ap."price"::numeric, ap."discountPercent") as sale_price,
      v_has_code and not (coalesce(v_code."excludeSaleItems", false) and ap."discountPercent" is not null) as eligible
    from public."ArtPiece" ap
    where ap."id" = any(v_ids)
  ),
  shares as (
    select
      l.*,
      case
        when not l.eligible then 0::numeric
        when v_code."type" = 'percent' then round(l.sale_price * v_code."value" / 100, 2)
        -- Fixed amount: spread over the works in proportion to their price
        else round(v_amount * l.sale_price / v_eligible_total, 2)
      end as raw_share,
      row_number() over (partition by l.eligible order by l.id desc) as rn
    from lines l
  )
  select
    s.id,
    s.original_price,
    s.pct,
    s.sale_price,
    case
      -- The last work gets the rounding difference, so the shares add up exactly
      when s.eligible and v_code."type" = 'amount' and s.rn = 1
        then v_amount - (sum(s.raw_share) over (partition by s.eligible) - s.raw_share)
      else s.raw_share
    end,
    case when v_has_code then v_code."id" end,
    case when v_has_code then v_code."code" end
  from shares s
  order by s.id;
end $$;


-- ---------------------------------------------------------------------------
-- create_order: now with sale prices and an optional discount code.
-- p_discount_code has a default, so the code that is still live (without it)
-- keeps working until the new code is deployed.
--
-- Raises the codes of price_cart, plus: EMPTY_CART, UNAVAILABLE,
-- SHIPPING_COUNTRY, DISCOUNT_TOO_HIGH
-- ---------------------------------------------------------------------------

drop function if exists public.create_order(text[], jsonb, text, text, numeric, text, integer);

create or replace function public.create_order(
  p_art_piece_ids         text[],
  p_customer              jsonb,
  p_shipping_method       text,
  p_shipping_country_code text,
  p_vat_rate              numeric,
  p_terms_version         text,
  p_reservation_minutes   integer,
  p_discount_code         text default null
)
returns table ("orderId" uuid, "orderNumber" text, "accessToken" text, "total" numeric)
language plpgsql
as $$
declare
  v_ids       text[];
  v_found     integer;
  v_lines     jsonb;
  v_subtotal  numeric(10, 2);
  v_discount  numeric(10, 2);
  v_code_id   uuid;
  v_code      text;
  v_has_large boolean;
  v_shipping  numeric(10, 2) := 0;
  v_total     numeric(10, 2);
  v_vat       numeric(10, 2);
  v_order     public."Order"%rowtype;
begin
  select coalesce(array_agg(distinct id), '{}') into v_ids from unnest(p_art_piece_ids) as id;
  if cardinality(v_ids) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  -- Lock the pieces (in a fixed order, to avoid deadlocks)
  perform 1 from public."ArtPiece" where "id" = any(v_ids) order by "id" for update;

  select count(*) into v_found from public."ArtPiece" where "id" = any(v_ids);
  if v_found <> cardinality(v_ids) then
    raise exception 'UNKNOWN_ART_PIECE';
  end if;

  if exists (
    select 1 from public."ArtPiece"
    where "id" = any(v_ids)
      and (
        "isSold"
        or "status" = 'sold'
        or ("status" = 'reserved' and "reservedUntil" > now())
      )
  ) then
    raise exception 'UNAVAILABLE';
  end if;

  select coalesce(jsonb_agg(to_jsonb(pc)), '[]'::jsonb) into v_lines
    from public.price_cart(v_ids, p_discount_code) pc;

  select
    sum((line->>'salePrice')::numeric),
    sum((line->>'codeDiscount')::numeric),
    max(line->>'discountCodeId')::uuid,
    max(line->>'discountCode')
    into v_subtotal, v_discount, v_code_id, v_code
    from jsonb_array_elements(v_lines) as line;

  select bool_or("sizeClass" = 'large') into v_has_large
    from public."ArtPiece" where "id" = any(v_ids);

  if p_shipping_method = 'ship' then
    select case when v_has_large then "priceLarge" else "priceSmall" end
      into v_shipping
      from public."ShippingRate"
      where "countryCode" = p_shipping_country_code and "isActive";
    if not found then
      raise exception 'SHIPPING_COUNTRY';
    end if;
  elsif p_shipping_method <> 'pickup' then
    raise exception 'SHIPPING_COUNTRY';
  end if;

  v_total := v_subtotal - v_discount + v_shipping;
  -- A code may not bring the order (close) to zero: Mollie needs an amount
  if v_discount > 0 and v_total < 1 then
    raise exception 'DISCOUNT_TOO_HIGH';
  end if;
  -- Prices include VAT; extract the VAT part
  v_vat := round(v_total - v_total / (1 + p_vat_rate / 100), 2);

  insert into public."Order" (
    "customerFirstName", "customerLastName", "customerEmail", "customerPhone",
    "companyName", "vatNumber",
    "shippingMethod", "shippingCountryCode", "shippingStreet", "shippingPostalCode", "shippingCity",
    "billingSameAsShipping", "billingCountryCode", "billingStreet", "billingPostalCode", "billingCity",
    "subtotal", "discountAmount", "discountCodeId", "discountCode", "shippingCost", "total", "vatAmount",
    "termsVersion", "termsAcceptedAt"
  ) values (
    p_customer->>'firstName', p_customer->>'lastName', p_customer->>'email', nullif(p_customer->>'phone', ''),
    nullif(p_customer->>'companyName', ''), nullif(p_customer->>'vatNumber', ''),
    p_shipping_method,
    case when p_shipping_method = 'ship' then p_shipping_country_code end,
    case when p_shipping_method = 'ship' then p_customer->>'street' end,
    case when p_shipping_method = 'ship' then p_customer->>'postalCode' end,
    case when p_shipping_method = 'ship' then p_customer->>'city' end,
    coalesce((p_customer->>'billingSameAsShipping')::boolean, true),
    nullif(p_customer->>'billingCountryCode', ''), nullif(p_customer->>'billingStreet', ''),
    nullif(p_customer->>'billingPostalCode', ''), nullif(p_customer->>'billingCity', ''),
    v_subtotal, v_discount, v_code_id, v_code, v_shipping, v_total, v_vat,
    p_terms_version, now()
  )
  returning * into v_order;

  insert into public."OrderItem" (
    "orderId", "artPieceId", "title", "dimensions", "imageUrl", "sizeClass",
    "price", "originalPrice", "discountPercent", "codeDiscount", "vatRate"
  )
  select
    v_order."id", ap."id", ap."title", ap."dimensions",
    (select img."url" from public."Image" img where img."pieceId" = ap."id" order by img."index" limit 1),
    ap."sizeClass",
    line."salePrice" - line."codeDiscount",
    line."originalPrice",
    line."discountPercent",
    line."codeDiscount",
    p_vat_rate
  from jsonb_to_recordset(v_lines) as line (
    "artPieceId" text, "originalPrice" numeric, "discountPercent" integer,
    "salePrice" numeric, "codeDiscount" numeric
  )
  join public."ArtPiece" ap on ap."id" = line."artPieceId";

  update public."ArtPiece"
    set "status" = 'reserved',
        "reservedUntil" = now() + make_interval(mins => p_reservation_minutes),
        "reservedByOrderId" = v_order."id"
    where "id" = any(v_ids);

  insert into public."OrderEvent" ("orderId", "type", "message", "actor", "data")
  values (
    v_order."id", 'created',
    'Bestelling aangemaakt, wacht op betaling'
      || case when v_code is not null then ' (kortingscode ' || v_code || ')' else '' end,
    'customer',
    case when v_code is not null
      then jsonb_build_object('discountCode', v_code, 'discountAmount', v_discount)
    end
  );

  return query select v_order."id", v_order."orderNumber", v_order."accessToken", v_order."total";
end $$;

revoke execute on function public.price_cart(text[], text) from public, anon, authenticated;
revoke execute on function public.create_order(text[], jsonb, text, text, numeric, text, integer, text) from public, anon, authenticated;
grant  execute on function public.price_cart(text[], text) to service_role;
grant  execute on function public.create_order(text[], jsonb, text, text, numeric, text, integer, text) to service_role;

commit;
