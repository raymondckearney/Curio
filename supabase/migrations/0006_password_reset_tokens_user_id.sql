-- Fix a schema/code mismatch on password_reset_tokens.
--
-- The live table was created with an `email` (not null) column and no
-- user_id column. Every call site that reads or writes this table
-- (pages/api/admin/accounts/invite.js, pages/api/portal/team.js,
-- pages/api/portal/auth/forgot-password.js, reset-password.js,
-- validate-reset-token.js, pages/api/admin/accounts/[id]/resend-invite.js,
-- pages/api/admin/cleanup.js) has always keyed off user_id instead, so every
-- insert has been failing with PGRST204 ("Could not find the 'user_id'
-- column"). Adding the column the code already expects, rather than
-- rewriting five call sites to key off email.
--
-- Run this against the project's Supabase Postgres instance (SQL editor or
-- `psql`/`supabase db` with a connection string), same by-hand convention as
-- the other migrations in this folder.

alter table password_reset_tokens
  add column if not exists user_id uuid references client_users(id) on delete cascade;

-- Not supplied by any current call site; drop the constraint rather than
-- have every insert fail on a column the app never populates.
alter table password_reset_tokens alter column email drop not null;

create index if not exists password_reset_tokens_user_id_idx on password_reset_tokens (user_id);
create index if not exists password_reset_tokens_token_idx on password_reset_tokens (token);
