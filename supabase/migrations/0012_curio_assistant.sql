-- Curio Assistant: a log of what people ask (also the daily-limit counter)
-- and the access requests it creates. Run by hand against the project's
-- Supabase Postgres instance, same as the other migrations in this folder.

create table if not exists assistant_logs (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  account_id      uuid references client_accounts(id) on delete cascade,
  user_id         uuid references client_users(id) on delete cascade,
  query           text not null,
  answer          text,
  recommended_ids text[],
  tokens_input    integer,
  tokens_output   integer
);

create index if not exists assistant_logs_user_created_idx on assistant_logs (user_id, created_at);
create index if not exists assistant_logs_created_idx on assistant_logs (created_at desc);

create table if not exists access_requests (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  account_id     uuid references client_accounts(id) on delete cascade,
  user_id        uuid references client_users(id) on delete cascade,
  user_email     text,
  user_name      text,
  item_id        text not null,             -- catalog id, e.g. 'tool:meeting-architect'
  item_name      text not null,
  item_kind      text,                      -- 'tool' | 'resource' | 'field_guide'
  lock_reason    text not null,             -- 'license' | 'team' | 'role'
  grant_license  text,                      -- license that unlocks it, null if it needs a manual change
  query          text,                      -- what they asked the assistant, if anything
  status         text not null default 'pending' check (status in ('pending', 'granted', 'dismissed')),
  resolved_at    timestamptz
);

create index if not exists access_requests_status_created_idx on access_requests (status, created_at desc);
create index if not exists access_requests_user_item_idx on access_requests (user_id, item_id);
