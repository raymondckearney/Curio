-- MindPrint(tm) Profile Detector feedback corpus
-- Run this against the project's Supabase Postgres instance (SQL editor or
-- `psql`/`supabase db` with a connection string), same convention as
-- 0001_companions_library.sql: this repo talks to Supabase purely over its
-- REST APIs (see lib/supabase.js) using SUPABASE_SERVICE_KEY, so there is no
-- ORM migration runner wired up; this file is the source of truth to apply
-- by hand.
--
-- Storage rule (enforced in pages/api/portal/detection-feedback.js, not just
-- documented here): sample_text is stored ONLY when own_writing is true. For
-- third-party writing, only the hash, context, hypothesis, and label are
-- kept, never the text itself.

create table if not exists detection_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamptz not null default now(),
  text_hash text not null,       -- sha256 of the submitted samples
  own_writing boolean not null,
  context text,                  -- optional genre/role/audience note
  hypothesis_raw text not null,  -- the model's full detection output
  actual_profile text,           -- e.g. 'WHY-WHAT', filled in when labeled
  sample_text text               -- present only when own_writing is true
);

create index if not exists detection_feedback_user_created_idx on detection_feedback (user_id, created_at);
create index if not exists detection_feedback_labeled_idx on detection_feedback (actual_profile) where actual_profile is not null;
