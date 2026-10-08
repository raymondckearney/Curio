-- Team Builder (portal tool). Rosters, names, skills and document text are
-- never stored. A run records the shape of the work and the engine result
-- with people as labels (P1, Seat A...), plus who ran it.

create table if not exists team_builder_runs (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz default now(),
  account_id     uuid references client_accounts(id) on delete set null,
  user_id        uuid references client_users(id) on delete set null,
  mode           text not null,               -- 'roster' or 'design'
  weeks          int,
  hours          int,
  activity_count int,
  profiles       text[],                      -- profiles only, no names
  result_summary jsonb not null               -- engine output with labels, never names
);
create index if not exists team_builder_runs_created_idx on team_builder_runs (created_at desc);

-- Activities that matched nothing on the taxonomy, so Ray can review
-- whether the list needs new entries.
create table if not exists team_builder_unlisted_activities (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  run_id        uuid references team_builder_runs(id) on delete cascade,
  activity_name text not null,
  tag_set       text not null,
  evidence      text
);

-- One row per AI call, for the daily caps (20 document reads, 200
-- narrative calls per user per day). No content.
create table if not exists team_builder_calls (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  kind        text not null,                 -- 'extract' or 'narrative'
  user_id     uuid references client_users(id) on delete cascade,
  account_id  uuid references client_accounts(id) on delete cascade
);
create index if not exists team_builder_calls_user_day_idx on team_builder_calls (user_id, kind, created_at);
