-- Invoicing for Art by Lé
--
-- issue_invoice takes the next number and inserts the invoice in one
-- transaction. If anything fails, the counter rolls back too, so invoice
-- numbers stay gapless (Belgian invoicing rules).
--
-- Only callable by the service role. Safe to run multiple times.

begin;

-- At most one regular invoice per order (credit notes can be several)
create unique index if not exists "Invoice_one_invoice_per_order"
  on public."Invoice" ("orderId") where "type" = 'invoice';

create or replace function public.issue_invoice(
  p_order_id            uuid,
  p_type                text,
  p_credited_invoice_id uuid,
  p_seller              jsonb,
  p_buyer               jsonb,
  p_lines               jsonb,
  p_subtotal_excl_vat   numeric,
  p_vat_amount          numeric,
  p_total               numeric
)
returns public."Invoice"
language plpgsql
as $$
declare
  v_invoice public."Invoice"%rowtype;
begin
  -- Serialize invoicing per order
  perform 1 from public."Order" where "id" = p_order_id for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  -- Idempotent for the regular invoice
  if p_type = 'invoice' then
    select * into v_invoice from public."Invoice"
      where "orderId" = p_order_id and "type" = 'invoice';
    if found then
      return v_invoice;
    end if;
  end if;

  insert into public."Invoice" (
    "orderId", "type", "invoiceNumber", "creditedInvoiceId",
    "seller", "buyer", "lines", "subtotalExclVat", "vatAmount", "total"
  ) values (
    p_order_id, p_type,
    public.next_invoice_number(extract(year from now() at time zone 'Europe/Brussels')::integer),
    p_credited_invoice_id,
    p_seller, p_buyer, p_lines, p_subtotal_excl_vat, p_vat_amount, p_total
  )
  returning * into v_invoice;

  insert into public."OrderEvent" ("orderId", "type", "message", "actor", "data")
  values (
    p_order_id,
    case when p_type = 'invoice' then 'invoice_issued' else 'credit_note_issued' end,
    case when p_type = 'invoice' then 'Factuur ' else 'Creditnota ' end || v_invoice."invoiceNumber" || ' aangemaakt',
    'system',
    jsonb_build_object('invoiceId', v_invoice."id")
  );

  return v_invoice;
end $$;

revoke execute on function public.issue_invoice(uuid, text, uuid, jsonb, jsonb, jsonb, numeric, numeric, numeric) from public, anon, authenticated;
grant  execute on function public.issue_invoice(uuid, text, uuid, jsonb, jsonb, jsonb, numeric, numeric, numeric) to service_role;

commit;
