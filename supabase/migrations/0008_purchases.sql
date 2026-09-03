-- Create the purchases table to record self-serve Stripe purchases.
-- Referenced by pages/api/stripe/webhook.js (insert) and
-- pages/api/stripe/session.js (lookup for assessment token resolution).

create table if not exists purchases (
  id                bigint generated always as identity primary key,
  stripe_session_id text        not null unique,
  buyer_name        text,
  buyer_email       text,
  product           text,
  amount            numeric(10, 2),
  engagement_id     text,
  token_count       int,
  created_at        timestamptz not null default now()
);

-- Index the columns used for lookups
create index if not exists purchases_stripe_session_id_idx on purchases (stripe_session_id);
create index if not exists purchases_engagement_id_idx on purchases (engagement_id);
create index if not exists purchases_buyer_email_idx on purchases (buyer_email);
