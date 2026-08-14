-- Cutover support: let old, already-distributed assessment token links keep
-- opening the Typeform embed, while every new token defaults to the native
-- quiz at /quiz. pages/go/[token].js branches on this column.
--
-- Every token that exists at the moment this runs is explicitly stamped
-- 'typeform' — permanently, regardless of when it's eventually clicked.
-- Anything created afterward gets 'native' via the column default, with no
-- code changes needed at any of the three places tokens get inserted
-- (pages/api/stripe/webhook.js, pages/api/admin/accounts/[id]/generate-tokens.js,
-- pages/api/tokens/generate.js).
--
-- Run this against the project's Supabase Postgres instance (SQL editor or
-- `psql`/`supabase db` with a connection string), same by-hand convention as
-- the other migrations in this folder. Run it and confirm the backfill
-- completed BEFORE deploying the pages/go/[token].js change — that code
-- treats anything other than 'typeform' as 'native', so if it ships before
-- every existing row is backfilled, old links would briefly get misrouted
-- to the native quiz instead of Typeform.

alter table tokens add column if not exists quiz_version text;

update tokens set quiz_version = 'typeform' where quiz_version is null;

alter table tokens alter column quiz_version set default 'native';

create index if not exists tokens_quiz_version_idx on tokens (quiz_version);
