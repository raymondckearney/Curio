-- Foundation for the weekly profile-tip email: per-user send progress, an
-- opt-out flag, a send-history log, and a tiny generic settings table used
-- as the feature's on/off switch. Everything here is additive/nullable-safe
-- with sane defaults — no existing account or user changes behavior until
-- the feature is explicitly turned on from Admin -> Emails.
--
-- Run this against the project's Supabase Postgres instance (SQL editor or
-- `psql`/`supabase db`), same by-hand convention as the other migrations in
-- this folder.

-- How many of their 20 profile tips this person has already received, and
-- whether they've asked to stop. Both default to "brand new, still
-- subscribed" so every existing user starts at Tip 1 whenever the feature
-- is turned on.
alter table client_users add column if not exists tip_index integer not null default 0;
alter table client_users add column if not exists weekly_tip_opt_out boolean not null default false;

-- Send history / audit log. Also lets a retried or overlapping cron run
-- check what already went out this cycle instead of trusting tip_index
-- alone, since tip_index and the send row are written together but not
-- atomically (Supabase REST, no multi-table transaction here).
create table if not exists weekly_tip_sends (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references client_users(id) on delete cascade,
  profile_slug  text not null,
  tip_number    integer not null,
  sent_at       timestamptz not null default now()
);

create index if not exists weekly_tip_sends_user_id_idx on weekly_tip_sends (user_id);

-- Small generic key/value settings store — the weekly-tips on/off switch
-- lives here as one row (key = 'weekly_tips_enabled', value = 'true' |
-- 'false'), toggleable from Admin -> Emails without a deploy. Generic on
-- purpose so any future admin-togglable flag can reuse this same table
-- instead of a one-off column somewhere.
create table if not exists app_settings (
  key         text primary key,
  value       text,
  updated_at  timestamptz not null default now()
);

-- Starts OFF. Flip this to 'true' from the admin panel when ready to
-- actually start sending — never by editing this row directly, so the
-- change is logged the same way any other admin action is.
insert into app_settings (key, value)
values ('weekly_tips_enabled', 'false')
on conflict (key) do nothing;
