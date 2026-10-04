-- RLS for Art by Lé
--
-- Principle: visitors (anon key) may only READ the catalog.
-- All writes go through the service role (createAdminClient) on the server,
-- behind isAdmin(). The service role bypasses RLS, so it needs no policies.
--
-- Safe to run multiple times.

begin;

-- 1. Enable RLS on EVERY table in public.
--    Tables without a policy below are fully locked for anon/authenticated
--    (only reachable via the service role). That is the safe default, also for
--    tables you add later and forget about.
do $$
declare
  t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;

-- 2. Remove existing policies on the public tables (clean slate)
do $$
declare
  p record;
begin
  for p in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- 3. Public read access for what the website shows
create policy "Public read" on public."ArtPiece"   for select to anon, authenticated using (true);
create policy "Public read" on public."Image"      for select to anon, authenticated using (true);
create policy "Public read" on public."Label"      for select to anon, authenticated using (true);
create policy "Public read" on public."PieceLabel" for select to anon, authenticated using (true);
create policy "Public read" on public."Collection" for select to anon, authenticated using (true);
create policy "Public read" on public."Stats"      for select to anon, authenticated using (true);
create policy "Public read" on public."CvPage"     for select to anon, authenticated using (true);

-- NewsletterSubscriber: deliberately NO policy -> email addresses are not readable
-- with the public key. Signing up goes via a server action (service role).

-- 4. RPC functions: anon must not be allowed to call them.
--    (If they are SECURITY DEFINER they bypass RLS, so this is essential.)
do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('create_art_piece', 'update_art_piece')
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;

-- 5. Storage: the "images" bucket stays public for reads via public URLs
--    (that needs no policy). Remove write policies for anon on storage.objects.
do $$
declare
  p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  loop
    execute format('drop policy %I on storage.objects', p.policyname);
  end loop;
end $$;

commit;

-- Check afterwards:
-- select tablename, rowsecurity from pg_tables where schemaname = 'public';
-- select schemaname, tablename, policyname, cmd, roles from pg_policies
--   where schemaname in ('public', 'storage') order by 1, 2;
