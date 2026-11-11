-- Announcement banner for Art by Lé
--
-- A bar under the navigation with one or more messages that take turns.
-- The whole bar has an on/off switch (SiteSetting "announcementBar"), every
-- message too. A message can show a discount code (click = copy, applied
-- automatically at checkout) and a countdown to the end of the action.
--
-- Read on the server only (service role): the banner needs to know whether
-- the linked discount code is still usable, and discount codes must never be
-- readable with the public key.
--
-- Run in the Supabase SQL editor after 009. Safe to run multiple times.

begin;

create table if not exists public."SiteSetting" (
  "key"       text primary key,
  "value"     jsonb not null,
  "updatedAt" timestamptz not null default now()
);

drop trigger if exists "SiteSetting_updated_at" on public."SiteSetting";
create trigger "SiteSetting_updated_at"
  before update on public."SiteSetting"
  for each row execute function public.set_updated_at();

insert into public."SiteSetting" ("key", "value")
values ('announcementBar', '{"enabled": false}')
on conflict ("key") do nothing;

create table if not exists public."Announcement" (
  "id"             uuid primary key default gen_random_uuid(),
  "message"        text not null check (char_length("message") between 1 and 200),
  -- Internal or external link, e.g. /gallery?collectionId=korting
  "linkUrl"        text check ("linkUrl" is null or "linkUrl" ~ '^(/|https://)'),
  "linkLabel"      text check ("linkLabel" is null or char_length("linkLabel") <= 40),
  -- Shown as a chip; the message is hidden while the code is not usable
  "discountCodeId" uuid references public."DiscountCode" ("id") on delete set null,
  "theme"          text not null default 'oker'
                     check ("theme" in ('oker', 'bruin', 'creme', 'teal', 'feest')),
  -- Countdown to "endsAt" (or the end date of the discount code)
  "showCountdown"  boolean not null default false,
  "startsAt"       timestamptz,
  "endsAt"         timestamptz,
  "isActive"       boolean not null default true,
  "sortOrder"      integer not null default 0,
  "createdAt"      timestamptz not null default now(),
  "updatedAt"      timestamptz not null default now(),

  constraint "Announcement_dates_check" check (
    "startsAt" is null or "endsAt" is null or "startsAt" < "endsAt"
  )
);

create index if not exists "Announcement_sortOrder_idx" on public."Announcement" ("sortOrder", "createdAt");

drop trigger if exists "Announcement_updated_at" on public."Announcement";
create trigger "Announcement_updated_at"
  before update on public."Announcement"
  for each row execute function public.set_updated_at();

-- Service role only (no policies)
alter table public."SiteSetting"  enable row level security;
alter table public."Announcement" enable row level security;

commit;
