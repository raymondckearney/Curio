-- Foundation for the manager role: lets an enterprise account be split into
-- sub-teams, each with its own manager who can see and act on their team
-- only, while the account owner keeps full account-wide visibility exactly
-- as today. Everything here is additive and nullable — no existing account
-- changes behavior until a team is actually created and someone is
-- assigned to it, so this is safe to run against production at any time,
-- independent of when the application code that uses it ships.
--
-- Run this against the project's Supabase Postgres instance (SQL editor or
-- `psql`/`supabase db`), same by-hand convention as the other migrations in
-- this folder.

create table if not exists teams (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references client_accounts(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists teams_account_id_idx on teams (account_id);

-- One team per person: a manager manages exactly the team they belong to;
-- a member's team_id says which team's manager/roster they're part of.
-- Null means "no team" — every existing user today, and every owner going
-- forward (owners aren't scoped to a team, they see the whole account).
alter table client_users add column if not exists team_id uuid references teams(id) on delete set null;
create index if not exists client_users_team_id_idx on client_users (team_id);

-- Tags which team a candidate's assessment token belongs to, so a manager's
-- token pool / results / analytics views can be scoped without touching
-- anything else about how tokens already work. Null means "enterprise-wide
-- / unassigned", i.e. every token that exists today, and every self-serve
-- individual token going forward.
alter table tokens add column if not exists team_id uuid references teams(id) on delete set null;
create index if not exists tokens_team_id_idx on tokens (team_id);
