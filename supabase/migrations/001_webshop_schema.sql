-- Webshop schema for Art by Lé (phase 1)
--
-- Adds orders, payments, withdrawals (herroeping), refunds, invoices and
-- shipping rates. All new tables are RLS-locked without policies: they are
-- only reachable through the service role on the server, behind isAdmin()
-- or a validated server action.
--
-- Run in the Supabase SQL editor. Safe to run multiple times.

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- ArtPiece: size class (for shipping) and sale status
-- ---------------------------------------------------------------------------

alter table public."ArtPiece"
  add column if not exists "sizeClass" text not null default 'small',
  add column if not exists "status" text not null default 'available',
  add column if not exists "reservedUntil" timestamptz,
  add column if not exists "reservedByOrderId" uuid;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ArtPiece_sizeClass_check') then
    alter table public."ArtPiece"
      add constraint "ArtPiece_sizeClass_check" check ("sizeClass" in ('small', 'large'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ArtPiece_status_check') then
    alter table public."ArtPiece"
      add constraint "ArtPiece_status_check" check ("status" in ('available', 'reserved', 'sold'));
  end if;
end $$;

update public."ArtPiece" set "status" = 'sold' where "isSold" = true and "status" <> 'sold';

-- Keep the legacy "isSold" flag and the new "status" in sync while both exist.
-- Whichever column changed wins.
create or replace function public.sync_art_piece_status()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new."isSold" then
      new."status" = 'sold';
    end if;
  elsif new."status" is distinct from old."status" then
    new."isSold" = (new."status" = 'sold');
  elsif new."isSold" is distinct from old."isSold" then
    new."status" = case when new."isSold" then 'sold' else 'available' end;
  end if;

  if new."status" <> 'reserved' then
    new."reservedUntil" = null;
    new."reservedByOrderId" = null;
  end if;

  return new;
end $$;

drop trigger if exists "ArtPiece_sync_status" on public."ArtPiece";
create trigger "ArtPiece_sync_status"
  before insert or update on public."ArtPiece"
  for each row execute function public.sync_art_piece_status();

-- ---------------------------------------------------------------------------
-- ShippingRate: per country, one price for small and one for large works.
-- An order pays the rate of its largest work once.
-- ---------------------------------------------------------------------------

create table if not exists public."ShippingRate" (
  "id"          uuid primary key default gen_random_uuid(),
  "countryCode" char(2) not null unique,
  "countryName" text not null,
  "priceSmall"  numeric(10, 2) not null check ("priceSmall" >= 0),
  "priceLarge"  numeric(10, 2) not null check ("priceLarge" >= 0),
  "isActive"    boolean not null default true,
  "sortOrder"   integer not null default 0,
  "createdAt"   timestamptz not null default now(),
  "updatedAt"   timestamptz not null default now()
);

drop trigger if exists "ShippingRate_updated_at" on public."ShippingRate";
create trigger "ShippingRate_updated_at"
  before update on public."ShippingRate"
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Order
-- ---------------------------------------------------------------------------

create sequence if not exists public.order_number_seq;

create or replace function public.next_order_number()
returns text
language sql
as $$
  select 'ABL-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 4, '0');
$$;

create table if not exists public."Order" (
  "id"                    uuid primary key default gen_random_uuid(),
  "orderNumber"           text not null unique default public.next_order_number(),
  -- Secret for the customer's order link (no customer accounts)
  "accessToken"           text not null unique default encode(gen_random_bytes(24), 'hex'),
  "status"                text not null default 'pending_payment' check ("status" in (
                            'pending_payment', 'paid', 'shipped', 'delivered', 'completed',
                            'expired', 'cancelled', 'withdrawn', 'refunded'
                          )),

  "customerFirstName"     text not null,
  "customerLastName"      text not null,
  "customerEmail"         text not null,
  "customerPhone"         text,
  "companyName"           text,
  "vatNumber"             text,

  "shippingMethod"        text not null check ("shippingMethod" in ('ship', 'pickup')),
  "shippingCountryCode"   char(2),
  "shippingStreet"        text,
  "shippingPostalCode"    text,
  "shippingCity"          text,

  "billingSameAsShipping" boolean not null default true,
  "billingCountryCode"    char(2),
  "billingStreet"         text,
  "billingPostalCode"     text,
  "billingCity"           text,

  -- All amounts in EUR, incl. VAT
  "subtotal"              numeric(10, 2) not null check ("subtotal" >= 0),
  "shippingCost"          numeric(10, 2) not null default 0 check ("shippingCost" >= 0),
  "total"                 numeric(10, 2) not null check ("total" >= 0),
  "vatAmount"             numeric(10, 2) not null default 0,
  "currency"              char(3) not null default 'EUR',

  "termsVersion"          text not null,
  "termsAcceptedAt"       timestamptz not null,

  "trackingUrl"           text,
  "adminNote"             text,

  "createdAt"             timestamptz not null default now(),
  "updatedAt"             timestamptz not null default now(),
  "paidAt"                timestamptz,
  "shippedAt"             timestamptz,
  -- Start of the 14-day withdrawal period
  "deliveredAt"           timestamptz,
  "completedAt"           timestamptz,
  "cancelledAt"           timestamptz,

  constraint "Order_shipping_address_check" check (
    "shippingMethod" = 'pickup' or (
      "shippingCountryCode" is not null and "shippingStreet" is not null
      and "shippingPostalCode" is not null and "shippingCity" is not null
    )
  )
);

create index if not exists "Order_status_idx" on public."Order" ("status");
create index if not exists "Order_customerEmail_idx" on public."Order" (lower("customerEmail"));
create index if not exists "Order_createdAt_idx" on public."Order" ("createdAt" desc);

drop trigger if exists "Order_updated_at" on public."Order";
create trigger "Order_updated_at"
  before update on public."Order"
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- OrderItem: snapshot of the art piece at the moment of ordering
-- ---------------------------------------------------------------------------

create table if not exists public."OrderItem" (
  "id"                   uuid primary key default gen_random_uuid(),
  "orderId"              uuid not null references public."Order" ("id") on delete cascade,
  "artPieceId"           text references public."ArtPiece" ("id") on delete set null,
  "title"                text not null,
  "dimensions"           text,
  "imageUrl"             text,
  "sizeClass"            text not null check ("sizeClass" in ('small', 'large')),
  "price"                numeric(10, 2) not null check ("price" >= 0),
  "vatRate"              numeric(5, 2) not null,
  -- false for custom work (maatwerk): no statutory withdrawal right
  "withdrawalApplicable" boolean not null default true,
  "createdAt"            timestamptz not null default now()
);

create index if not exists "OrderItem_orderId_idx" on public."OrderItem" ("orderId");
create index if not exists "OrderItem_artPieceId_idx" on public."OrderItem" ("artPieceId");

-- ---------------------------------------------------------------------------
-- Payment (Mollie)
-- ---------------------------------------------------------------------------

create table if not exists public."Payment" (
  "id"              uuid primary key default gen_random_uuid(),
  "orderId"         uuid not null references public."Order" ("id") on delete cascade,
  "molliePaymentId" text not null unique,
  "status"          text not null,
  "method"          text,
  "amount"          numeric(10, 2) not null,
  "raw"             jsonb,
  "createdAt"       timestamptz not null default now(),
  "updatedAt"       timestamptz not null default now()
);

create index if not exists "Payment_orderId_idx" on public."Payment" ("orderId");

drop trigger if exists "Payment_updated_at" on public."Payment";
create trigger "Payment_updated_at"
  before update on public."Payment"
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Withdrawal (herroeping)
-- ---------------------------------------------------------------------------

create table if not exists public."Withdrawal" (
  "id"               uuid primary key default gen_random_uuid(),
  "orderId"          uuid not null references public."Order" ("id") on delete cascade,
  -- Exactly as entered by the customer
  "name"             text not null,
  "email"            text not null,
  "orderNumberInput" text not null,
  "reason"           text,
  "status"           text not null default 'registered' check ("status" in (
                       'registered', 'return_received', 'refunded', 'rejected'
                     )),
  "submittedAt"      timestamptz not null default now(),
  "returnReceivedAt" timestamptz,
  "refundedAt"       timestamptz,
  "adminNote"        text,
  "updatedAt"        timestamptz not null default now()
);

create index if not exists "Withdrawal_orderId_idx" on public."Withdrawal" ("orderId");
create index if not exists "Withdrawal_status_idx" on public."Withdrawal" ("status");

drop trigger if exists "Withdrawal_updated_at" on public."Withdrawal";
create trigger "Withdrawal_updated_at"
  before update on public."Withdrawal"
  for each row execute function public.set_updated_at();

create table if not exists public."WithdrawalItem" (
  "withdrawalId" uuid not null references public."Withdrawal" ("id") on delete cascade,
  "orderItemId"  uuid not null references public."OrderItem" ("id") on delete cascade,
  primary key ("withdrawalId", "orderItemId")
);

-- ---------------------------------------------------------------------------
-- Refund (Mollie)
-- ---------------------------------------------------------------------------

create table if not exists public."Refund" (
  "id"             uuid primary key default gen_random_uuid(),
  "orderId"        uuid not null references public."Order" ("id") on delete cascade,
  "withdrawalId"   uuid references public."Withdrawal" ("id") on delete set null,
  "mollieRefundId" text unique,
  "amount"         numeric(10, 2) not null check ("amount" > 0),
  "status"         text not null,
  "createdAt"      timestamptz not null default now(),
  "updatedAt"      timestamptz not null default now()
);

create index if not exists "Refund_orderId_idx" on public."Refund" ("orderId");

drop trigger if exists "Refund_updated_at" on public."Refund";
create trigger "Refund_updated_at"
  before update on public."Refund"
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- OrderEvent: audit trail per order
-- ---------------------------------------------------------------------------

create table if not exists public."OrderEvent" (
  "id"        uuid primary key default gen_random_uuid(),
  "orderId"   uuid not null references public."Order" ("id") on delete cascade,
  "type"      text not null,
  "message"   text,
  "actor"     text not null check ("actor" in ('system', 'admin', 'customer', 'mollie')),
  "data"      jsonb,
  "createdAt" timestamptz not null default now()
);

create index if not exists "OrderEvent_orderId_idx" on public."OrderEvent" ("orderId", "createdAt");

-- ---------------------------------------------------------------------------
-- Invoice / credit note
--
-- Numbers are gapless and sequential per year (Belgian invoicing rules), so
-- they come from a locked counter row instead of a sequence. Invoices are
-- immutable: corrections happen through a credit note.
-- ---------------------------------------------------------------------------

create table if not exists public."InvoiceCounter" (
  "year"       integer primary key,
  "lastNumber" integer not null default 0
);

create or replace function public.next_invoice_number(p_year integer)
returns text
language plpgsql
as $$
declare
  v_number integer;
begin
  insert into public."InvoiceCounter" ("year", "lastNumber")
  values (p_year, 1)
  on conflict ("year") do update set "lastNumber" = public."InvoiceCounter"."lastNumber" + 1
  returning "lastNumber" into v_number;

  return p_year::text || '-' || lpad(v_number::text, 4, '0');
end $$;

create table if not exists public."Invoice" (
  "id"                uuid primary key default gen_random_uuid(),
  "orderId"           uuid not null references public."Order" ("id") on delete restrict,
  "type"              text not null check ("type" in ('invoice', 'credit_note')),
  "invoiceNumber"     text not null unique,
  "creditedInvoiceId" uuid references public."Invoice" ("id") on delete restrict,
  "issuedAt"          timestamptz not null default now(),
  -- Snapshots, so an invoice never changes when other data does
  "seller"            jsonb not null,
  "buyer"             jsonb not null,
  "lines"             jsonb not null,
  "subtotalExclVat"   numeric(10, 2) not null,
  "vatAmount"         numeric(10, 2) not null,
  "total"             numeric(10, 2) not null,
  "createdAt"         timestamptz not null default now(),

  constraint "Invoice_credit_note_check" check (
    ("type" = 'credit_note') = ("creditedInvoiceId" is not null)
  )
);

create index if not exists "Invoice_orderId_idx" on public."Invoice" ("orderId");

create or replace function public.prevent_invoice_change()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Invoices are immutable; create a credit note instead';
end $$;

drop trigger if exists "Invoice_immutable" on public."Invoice";
create trigger "Invoice_immutable"
  before update or delete on public."Invoice"
  for each row execute function public.prevent_invoice_change();

-- ---------------------------------------------------------------------------
-- Security: RLS on, no policies (service role only); functions not callable
-- by anon/authenticated.
-- ---------------------------------------------------------------------------

alter table public."ShippingRate"   enable row level security;
alter table public."Order"          enable row level security;
alter table public."OrderItem"      enable row level security;
alter table public."Payment"        enable row level security;
alter table public."Withdrawal"     enable row level security;
alter table public."WithdrawalItem" enable row level security;
alter table public."Refund"         enable row level security;
alter table public."OrderEvent"     enable row level security;
alter table public."InvoiceCounter" enable row level security;
alter table public."Invoice"        enable row level security;

revoke execute on function public.next_order_number()           from public, anon, authenticated;
revoke execute on function public.next_invoice_number(integer)  from public, anon, authenticated;
grant  execute on function public.next_order_number()           to service_role;
grant  execute on function public.next_invoice_number(integer)  to service_role;

revoke usage on sequence public.order_number_seq from public, anon, authenticated;

commit;
