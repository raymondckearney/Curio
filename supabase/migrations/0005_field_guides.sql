-- MindPrint(tm) Communication Field Guides
-- Run this against the project's Supabase Postgres instance (SQL editor or
-- `psql`/`supabase db` with a connection string) before seeding the six
-- field-guide rows or granting field-guide access.
--
-- Field guides are a second content type in library_items alongside the 43
-- tertiary-support tools: one per MindPrint profile, keyed by `profile`
-- rather than `tool_num`/`collection`. tool_num, collection, and
-- support_mode don't apply to this content type, so they're relaxed to
-- nullable rather than given placeholder values (item_type is the
-- discriminator; a fake collection letter or support_mode string would
-- pollute those real vocabularies). Postgres allows any number of NULLs
-- under a UNIQUE constraint, so tool_num stays unique for the 43 tools.

alter table library_items alter column tool_num drop not null;
alter table library_items alter column collection drop not null;
alter table library_items alter column support_mode drop not null;

alter table library_items add column if not exists item_type text not null default 'tool';
alter table library_items add column if not exists profile text;

create index if not exists library_items_item_type_idx on library_items (item_type);

-- One field guide per profile; also gives the insert below (and the seed
-- script's upsert) a real conflict target. The 43 existing tool rows all
-- have profile null, and unique constraints treat NULLs as distinct, so
-- this doesn't collide with them.
create unique index if not exists library_items_item_type_profile_idx
  on library_items (item_type, profile);

insert into library_items (item_type, profile, title, onepager_path, kit_path)
values
  ('field_guide', 'WHY-WHAT', 'Communication Field Guide', 'field-guides/Field_Guide_WHY_WHAT.pdf', null),
  ('field_guide', 'WHY-HOW',  'Communication Field Guide', 'field-guides/Field_Guide_WHY_HOW.pdf',  null),
  ('field_guide', 'WHAT-WHY', 'Communication Field Guide', 'field-guides/Field_Guide_WHAT_WHY.pdf', null),
  ('field_guide', 'WHAT-HOW', 'Communication Field Guide', 'field-guides/Field_Guide_WHAT_HOW.pdf', null),
  ('field_guide', 'HOW-WHY',  'Communication Field Guide', 'field-guides/Field_Guide_HOW_WHY.pdf',  null),
  ('field_guide', 'HOW-WHAT', 'Communication Field Guide', 'field-guides/Field_Guide_HOW_WHAT.pdf', null)
on conflict (item_type, profile) do nothing;
