-- MindPrint(tm) AI Companions + Client Library
-- Run this against the project's Supabase Postgres instance (SQL editor or
-- `psql`/`supabase db` with a connection string) before granting any
-- companion or library license, and before running
-- library-pipeline/seed_library.js.
--
-- This repo talks to Supabase purely over its REST APIs (see lib/supabase.js,
-- lib/supabaseStorage.js) using SUPABASE_SERVICE_KEY, so there is no ORM
-- migration runner wired up; this file is the source of truth to apply by
-- hand.

create table if not exists tool_sessions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  user_id uuid not null,
  tool text not null,           -- 'precision' | 'purpose' | 'progress'
  mode text not null,           -- e.g. 'decompose', 'brief', 'threshold'
  profile text,                 -- e.g. 'WHY-WHAT'
  tokens_input int,
  tokens_output int,
  created_at timestamptz not null default now()
);

create index if not exists tool_sessions_user_created_idx on tool_sessions (user_id, created_at);
create index if not exists tool_sessions_account_idx on tool_sessions (account_id);

create table if not exists library_items (
  id uuid primary key default gen_random_uuid(),
  tool_num int not null unique,
  collection text not null check (collection in ('A', 'B', 'C', 'D', 'E')),
  title text not null,
  support_mode text not null,   -- 'Scaffold' | 'Replace' | 'Support' | 'Teach'
  onepager_path text,           -- storage object path in the "library" bucket
  kit_path text,                -- storage object path in the "library" bucket
  created_at timestamptz not null default now()
);

create index if not exists library_items_collection_idx on library_items (collection);

-- Private bucket: files are never served from a public URL. The portal signs
-- short-lived URLs server-side (see lib/supabaseStorage.js, called from
-- pages/api/portal/library-file.js) only after checking the caller's
-- account_licenses, so an unlicensed collection is never reachable even if a
-- signed URL leaks.
insert into storage.buckets (id, name, public)
values ('library', 'library', false)
on conflict (id) do nothing;
