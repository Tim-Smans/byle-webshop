-- Withdrawal only from shipping on. Before that the customer cancels the
-- order (immediate full refund) instead. Same function as in 004, only the
-- allowed order statuses changed. Safe to run multiple times.

begin;

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
  if v_status is null or v_status not in ('shipped', 'delivered', 'completed', 'withdrawn') then
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

commit;
