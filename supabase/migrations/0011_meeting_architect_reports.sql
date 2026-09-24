-- Meeting Architect report history. Mirrors career_guidance_reports (inputs
-- + full report_data JSON + timestamp), plus who generated it — unlike
-- career_guidance_reports, which is anonymous.
--
-- Run this against the project's Supabase Postgres instance (SQL editor or
-- `psql`/`supabase db`), same by-hand convention as the other migrations in
-- this folder.

create table if not exists meeting_architect_reports (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  account_id      uuid references client_accounts(id) on delete set null,
  user_id         uuid references client_users(id) on delete set null,
  user_email      text,
  meeting_type    text not null,
  input_mode      text not null,          -- 'roster' | 'relationship' | 'none'
  purpose         text not null,
  purpose_edited  boolean not null default false,
  objectives      text not null,
  challenges      text not null,
  group_data      jsonb,                  -- roster, single relationship, or audience-context note, per input_mode
  total_minutes   integer not null,
  own_profile     text,                   -- e.g. 'WHY-WHAT' at generation time; null if no completed assessment
  report_data     jsonb not null          -- model output plus the computed timed agenda
);

create index if not exists meeting_architect_reports_user_created_idx on meeting_architect_reports (user_id, created_at);
create index if not exists meeting_architect_reports_account_created_idx on meeting_architect_reports (account_id, created_at);
