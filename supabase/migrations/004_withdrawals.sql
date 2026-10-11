-- Withdrawals (herroeping) for Art by Lé
--
-- register_withdrawal validates and stores a withdrawal in one transaction:
-- the items must belong to the order, carry the statutory withdrawal right
-- and not already be part of another (non-rejected) withdrawal.
-- The 14-day period itself is checked in the app (Belgian calendar days).
--
-- Raises: ORDER_NOT_PAID, NO_ITEMS, INVALID_ITEMS, ALREADY_WITHDRAWN
-- Only callable by the service role. Safe to run multiple times.

begin;

-- Refund rows are created before Mollie is called (status 'creating'), so a
-- refund can never be started twice for the same withdrawal
create unique index if not exists "Refund_one_per_withdrawal"
  on public."Refund" ("withdrawalId") where "withdrawalId" is not null and "status" <> 'failed';

alter table public."Refund" alter column "mollieRefundId" drop not null;

create or replace function public.register_withdrawal(
  p_order_id           uuid,
  p_name               text,
  p_email              text,
  p_order_number_input text,
  p_reason             text,
  p_order_item_ids     uuid[]
)
returns public."Withdrawal"
language plpgsql
as $$
declare
  v_status     text;
  v_withdrawal public."Withdrawal"%rowtype;
  v_remaining  integer;
begin
  select "status" into v_status from public."Order" where "id" = p_order_id for update;
  if v_status is null or v_status not in ('paid', 'shipped', 'delivered', 'completed', 'withdrawn') then
    raise exception 'ORDER_NOT_PAID';
  end if;

  if coalesce(cardinality(p_order_item_ids), 0) = 0 then
    raise exception 'NO_ITEMS';
  end if;

  if (
    select count(*) from public."OrderItem"
    where "orderId" = p_order_id and "id" = any(p_order_item_ids) and "withdrawalApplicable"
  ) <> cardinality(p_order_item_ids) then
    raise exception 'INVALID_ITEMS';
  end if;

  if exists (
    select 1 from public."WithdrawalItem" wi
    join public."Withdrawal" w on w."id" = wi."withdrawalId"
    where wi."orderItemId" = any(p_order_item_ids) and w."status" <> 'rejected'
  ) then
    raise exception 'ALREADY_WITHDRAWN';
  end if;

  insert into public."Withdrawal" ("orderId", "name", "email", "orderNumberInput", "reason")
  values (p_order_id, p_name, p_email, p_order_number_input, nullif(trim(p_reason), ''))
  returning * into v_withdrawal;

  insert into public."WithdrawalItem" ("withdrawalId", "orderItemId")
  select v_withdrawal."id", unnest(p_order_item_ids);

  -- Whole order withdrawn: show it as such in the admin
  select count(*) into v_remaining
    from public."OrderItem" oi
    where oi."orderId" = p_order_id
      and not exists (
        select 1 from public."WithdrawalItem" wi
        join public."Withdrawal" w on w."id" = wi."withdrawalId"
        where wi."orderItemId" = oi."id" and w."status" <> 'rejected'
      );
  if v_remaining = 0 then
    update public."Order" set "status" = 'withdrawn' where "id" = p_order_id;
  end if;

  insert into public."OrderEvent" ("orderId", "type", "message", "actor", "data")
  values (
    p_order_id, 'withdrawal_registered',
    'Herroeping geregistreerd voor ' || cardinality(p_order_item_ids) || ' werk(en)',
    'customer', jsonb_build_object('withdrawalId', v_withdrawal."id")
  );

  return v_withdrawal;
end $$;

revoke execute on function public.register_withdrawal(uuid, text, text, text, text, uuid[]) from public, anon, authenticated;
grant  execute on function public.register_withdrawal(uuid, text, text, text, text, uuid[]) to service_role;

commit;
