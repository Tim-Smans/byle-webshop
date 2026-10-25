-- The admin enters the carrier's tracking code instead of a tracking link.
-- Safe to run multiple times.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'Order' and column_name = 'trackingUrl'
  ) then
    alter table public."Order" rename column "trackingUrl" to "trackingCode";
  end if;
end $$;
