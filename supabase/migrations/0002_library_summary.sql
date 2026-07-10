-- Adds a card-summary field to library_items so the /portal/library grid
-- can show what each guide covers without clicking into it. Run after
-- 0001_companions_library.sql, then re-run `npm run seed:library` to
-- backfill summary for all 43 rows.

alter table library_items add column if not exists summary text;
