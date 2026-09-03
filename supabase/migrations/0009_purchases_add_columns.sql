-- Add missing columns to the existing purchases table.
-- These were in the original insert logic but not in the manually-created table.

alter table purchases
  add column if not exists amount       numeric(10, 2),
  add column if not exists token_count  int,
  add column if not exists created_at   timestamptz not null default now();

-- Indexes for common lookups (safe to run even if they already exist)
create index if not exists purchases_stripe_session_id_idx on purchases (stripe_session_id);
create index if not exists purchases_engagement_id_idx     on purchases (engagement_id);
create index if not exists purchases_buyer_email_idx       on purchases (buyer_email);
