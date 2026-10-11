-- Order functions for Art by Lé (checkout)
--
-- All stock handling happens inside the database, in one transaction per
-- call, with row locks on the art pieces. That is what guarantees a unique
-- work can never be sold twice, even when two people check out at once.
--
-- Only callable by the service role (server-side). Safe to run multiple times.

begin;

-- ---------------------------------------------------------------------------
-- create_order: validates availability, computes all amounts from database
-- prices, creates the order + items and reserves the art pieces.
--
-- Raises (message is the error code, mapped to a friendly text in the app):
--   EMPTY_CART, UNKNOWN_ART_PIECE, UNAVAILABLE, SHIPPING_COUNTRY
-- ---------------------------------------------------------------------------

create or replace function public.create_order(
  p_art_piece_ids         text[],
  p_customer              jsonb,
  p_shipping_method       text,
  p_shipping_country_code text,
  p_vat_rate              numeric,
  p_terms_version         text,
  p_reservation_minutes   integer
)
returns table ("orderId" uuid, "orderNumber" text, "accessToken" text, "total" numeric)
language plpgsql
as $$
declare
  v_ids       text[];
  v_found     integer;
  v_subtotal  numeric(10, 2);
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

  select sum("price"), bool_or("sizeClass" = 'large')
    into v_subtotal, v_has_large
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

  v_total := v_subtotal + v_shipping;
  -- Prices include VAT; extract the VAT part
  v_vat := round(v_total - v_total / (1 + p_vat_rate / 100), 2);

  insert into public."Order" (
    "customerFirstName", "customerLastName", "customerEmail", "customerPhone",
    "companyName", "vatNumber",
    "shippingMethod", "shippingCountryCode", "shippingStreet", "shippingPostalCode", "shippingCity",
    "billingSameAsShipping", "billingCountryCode", "billingStreet", "billingPostalCode", "billingCity",
    "subtotal", "shippingCost", "total", "vatAmount",
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
    v_subtotal, v_shipping, v_total, v_vat,
    p_terms_version, now()
  )
  returning * into v_order;

  insert into public."OrderItem" (
    "orderId", "artPieceId", "title", "dimensions", "imageUrl", "sizeClass", "price", "vatRate"
  )
  select
    v_order."id", ap."id", ap."title", ap."dimensions",
    (select img."url" from public."Image" img where img."pieceId" = ap."id" order by img."index" limit 1),
    ap."sizeClass", ap."price", p_vat_rate
  from public."ArtPiece" ap
  where ap."id" = any(v_ids);

  update public."ArtPiece"
    set "status" = 'reserved',
        "reservedUntil" = now() + make_interval(mins => p_reservation_minutes),
        "reservedByOrderId" = v_order."id"
    where "id" = any(v_ids);

  insert into public."OrderEvent" ("orderId", "type", "message", "actor")
  values (v_order."id", 'created', 'Bestelling aangemaakt, wacht op betaling', 'customer');

  return query select v_order."id", v_order."orderNumber", v_order."accessToken", v_order."total";
end $$;

-- ---------------------------------------------------------------------------
-- mark_order_paid: idempotent. Marks the order paid and its pieces sold.
-- A payment can arrive after the reservation expired; if a piece was sold to
-- someone else in the meantime, the order still becomes paid (the money is
-- in) and a 'stock_conflict' event tells the admin a refund is needed.
-- Returns the number of conflicting pieces.
-- ---------------------------------------------------------------------------

create or replace function public.mark_order_paid(
  p_order_id           uuid,
  p_sold_collection_id text
)
returns integer
language plpgsql
as $$
declare
  v_status    text;
  v_conflicts integer;
begin
  select "status" into v_status from public."Order" where "id" = p_order_id for update;
  if v_status is null then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  -- Already processed
  if v_status not in ('pending_payment', 'expired', 'cancelled') then
    return 0;
  end if;

  perform 1 from public."ArtPiece" ap
    join public."OrderItem" oi on oi."artPieceId" = ap."id"
    where oi."orderId" = p_order_id
    order by ap."id"
    for update of ap;

  select count(*) into v_conflicts
    from public."OrderItem" oi
    join public."ArtPiece" ap on ap."id" = oi."artPieceId"
    where oi."orderId" = p_order_id
      and (
        ap."status" = 'sold'
        or (ap."status" = 'reserved' and ap."reservedByOrderId" <> p_order_id and ap."reservedUntil" > now())
      );

  -- Move to the "sold" collection when it exists in this database (it may be
  -- missing in a preview/branch database); otherwise keep the collection
  update public."ArtPiece" ap
    set "status" = 'sold',
        "collectionId" = coalesce(
          (select c."id" from public."Collection" c where c."id"::text = p_sold_collection_id),
          ap."collectionId"
        )
    from public."OrderItem" oi
    where oi."orderId" = p_order_id
      and oi."artPieceId" = ap."id"
      and ap."status" <> 'sold'
      and not (ap."status" = 'reserved' and ap."reservedByOrderId" <> p_order_id and ap."reservedUntil" > now());

  update public."Order" set "status" = 'paid', "paidAt" = now() where "id" = p_order_id;

  insert into public."OrderEvent" ("orderId", "type", "message", "actor")
  values (p_order_id, 'paid', 'Betaling ontvangen', 'mollie');

  if v_conflicts > 0 then
    insert into public."OrderEvent" ("orderId", "type", "message", "actor", "data")
    values (
      p_order_id, 'stock_conflict',
      'Betaald nadat de reservatie verlopen was: een of meer werken waren intussen aan iemand anders verkocht. Terugbetaling nodig.',
      'system', jsonb_build_object('conflicts', v_conflicts)
    );
  end if;

  return v_conflicts;
end $$;

-- ---------------------------------------------------------------------------
-- release_order: payment failed, expired or was cancelled. Frees the pieces
-- that are still reserved for this order. Only acts on unpaid orders.
-- ---------------------------------------------------------------------------

create or replace function public.release_order(
  p_order_id   uuid,
  p_new_status text
)
returns void
language plpgsql
as $$
begin
  if p_new_status not in ('expired', 'cancelled') then
    raise exception 'INVALID_STATUS';
  end if;

  update public."Order"
    set "status" = p_new_status,
        "cancelledAt" = case when p_new_status = 'cancelled' then now() else "cancelledAt" end
    where "id" = p_order_id and "status" = 'pending_payment';

  if not found then
    return;
  end if;

  update public."ArtPiece"
    set "status" = 'available'
    where "reservedByOrderId" = p_order_id and "status" = 'reserved';

  insert into public."OrderEvent" ("orderId", "type", "message", "actor")
  values (
    p_order_id, p_new_status,
    case when p_new_status = 'expired' then 'Betaling verlopen of mislukt, werken terug beschikbaar'
         else 'Betaling geannuleerd, werken terug beschikbaar' end,
    'mollie'
  );
end $$;

revoke execute on function public.create_order(text[], jsonb, text, text, numeric, text, integer) from public, anon, authenticated;
revoke execute on function public.mark_order_paid(uuid, text) from public, anon, authenticated;
revoke execute on function public.release_order(uuid, text) from public, anon, authenticated;
grant  execute on function public.create_order(text[], jsonb, text, text, numeric, text, integer) to service_role;
grant  execute on function public.mark_order_paid(uuid, text) to service_role;
grant  execute on function public.release_order(uuid, text) to service_role;

commit;
