-- MindPrint(tm) Language Mirror: hidden, token-gated public tool
-- Run this against the project's Supabase Postgres instance (SQL editor or
-- `psql`/`supabase db` with a connection string), same convention as the
-- prior migrations in this folder: this repo talks to Supabase purely over
-- its REST APIs (see lib/supabase.js) using SUPABASE_SERVICE_KEY, so there
-- is no ORM migration runner wired up; this file is the source of truth to
-- apply by hand.
--
-- mirror_tokens is deliberately separate from the existing assessment
-- `tokens` table and must never interact with it or its logic.
--
-- daily_count / daily_count_date are not part of the originally requested
-- column list; they were added so use_count can stay a true lifetime total
-- (shown in admin) while the 20-reads-per-token-per-day cap is enforced off
-- a value that actually resets, per Ray's approval.

create table if not exists mirror_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,      -- unguessable, 32+ chars (crypto.randomUUID())
  label text not null,             -- who it was issued to, e.g. "Kari pilot"
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  use_count int not null default 0,       -- lifetime total
  daily_count int not null default 0,     -- resets when daily_count_date rolls over
  daily_count_date date
);

create index if not exists mirror_tokens_token_idx on mirror_tokens (token);

create table if not exists writing_samples (
  id uuid primary key default gen_random_uuid(),
  mirror_token_id uuid not null,
  sample_text text not null,
  mirror_output text not null,
  consented boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists writing_samples_token_idx on writing_samples (mirror_token_id, created_at);
