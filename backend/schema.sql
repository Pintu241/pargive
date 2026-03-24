-- ============================================================
-- PARGIVE — Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up all tables
-- ============================================================

-- ─── USERS ────────────────────────────────────────────────────────────────────
create table if not exists users (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  email                text not null unique,
  password_hash        text not null,
  role                 text not null default 'member' check (role in ('member','admin')),
  plan                 text check (plan in ('Contender','Champion')),
  subscription_active  boolean not null default false,
  subscription_status  text not null default 'inactive' check (subscription_status in ('active','inactive','lapsed','cancelled')),
  renew_date           date,
  stripe_customer_id   text unique,
  charity              text,
  charity_pct          integer not null default 10 check (charity_pct between 10 and 50),
  total_donated        integer not null default 0,  -- stored in pence
  total_won            integer not null default 0,  -- stored in pence
  subscribed_at        timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
create table if not exists subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  plan         text not null,
  amount       integer not null,  -- in pence
  interval     text not null check (interval in ('month','year')),
  status       text not null default 'active' check (status in ('active','cancelled','lapsed')),
  started_at   timestamptz not null default now(),
  renew_date   date,
  cancelled_at timestamptz
);

-- ─── SCORES ───────────────────────────────────────────────────────────────────
create table if not exists scores (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  score      integer not null check (score between 1 and 45),
  date       date not null,
  course     text,
  created_at timestamptz not null default now()
);

create index if not exists idx_scores_user_date on scores(user_id, date desc);

-- ─── DRAWS ────────────────────────────────────────────────────────────────────
create table if not exists draws (
  id                 uuid primary key default gen_random_uuid(),
  month              text not null,   -- e.g. "March 2026"
  status             text not null default 'pending' check (status in ('pending','published')),
  numbers            integer[],       -- 5 draw numbers once published
  draw_date          date,
  pool_total         integer default 0,  -- total pool in pence before split
  jackpot            integer default 0,  -- 40% of pool + carryover
  pool4              integer default 0,  -- 35% of pool
  pool3              integer default 0,  -- 25% of pool
  jackpot_carryover  integer default 0,  -- from previous unclaimed jackpot
  winners5           integer default 0,
  winners4           integer default 0,
  winners3           integer default 0,
  mode               text default 'random' check (mode in ('random','algorithmic')),
  published_at       timestamptz,
  created_at         timestamptz not null default now()
);

-- ─── DRAW ENTRIES ─────────────────────────────────────────────────────────────
-- One row per user per draw; records what they entered and what they matched
create table if not exists draw_entries (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  draw_id          uuid not null references draws(id) on delete cascade,
  scores_entered   integer[],
  matched_numbers  integer[],
  tier             text,   -- null / '3-match' / '4-match' / '5-match'
  prize_amount     integer default 0,  -- in pence
  created_at       timestamptz not null default now(),
  unique(user_id, draw_id)
);

-- ─── WINNERS ──────────────────────────────────────────────────────────────────
create table if not exists winners (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  draw_id      uuid not null references draws(id) on delete cascade,
  draw_month   text not null,
  tier         text not null check (tier in ('3-match','4-match','5-match')),
  prize        integer not null,   -- in pence
  status       text not null default 'review' check (status in ('review','pending','paid','rejected')),
  proof_url    text,
  submitted_at timestamptz,
  paid_at      timestamptz,
  created_at   timestamptz not null default now()
);

-- ─── CHARITIES ────────────────────────────────────────────────────────────────
create table if not exists charities (
  id             uuid primary key default gen_random_uuid(),
  name           text not null unique,
  category       text,
  description    text,
  active         boolean not null default true,
  total_received integer not null default 0,   -- in pence
  subscribers    integer not null default 0,
  created_at     timestamptz not null default now()
);

-- ─── DONATIONS ────────────────────────────────────────────────────────────────
create table if not exists donations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  charity    text not null,
  amount     integer not null,   -- in pence
  type       text not null default 'subscription' check (type in ('subscription','one_off')),
  created_at timestamptz not null default now()
);

-- ─── RPC HELPERS ──────────────────────────────────────────────────────────────
-- Atomic increment for total_donated
create or replace function increment_total_donated(p_user_id uuid, p_amount integer)
returns void language sql as $$
  update users set total_donated = total_donated + p_amount where id = p_user_id;
$$;

-- Atomic increment for total_won
create or replace function increment_total_won(p_user_id uuid, p_amount integer)
returns void language sql as $$
  update users set total_won = total_won + p_amount where id = p_user_id;
$$;

-- Auto-update updated_at on users
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on users
  for each row execute function set_updated_at();

-- ─── SEED: DEFAULT CHARITIES ──────────────────────────────────────────────────
insert into charities (name, category, description, active) values
  ('St Andrews Trust',          'Youth Development',  'Supporting young golfers to access and develop in the sport.',      true),
  ('Green Hearts',              'Environment',        'Protecting and restoring the green spaces around golf courses.',    true),
  ('Fairway Foundation',        'Access & Inclusion', 'Making golf accessible to all, regardless of background.',          true),
  ('Links Legacy',              'Heritage',           'Preserving historic links courses for future generations.',          true),
  ('Youth Golf Academy',        'Youth Development',  'Free coaching programmes for under-18s across the UK.',             true),
  ('Disabled Golfers Association','Access & Inclusion','Adaptive golf equipment and coaching for disabled players.',       true),
  ('Course Access Fund',        'Access & Inclusion', 'Subsidising green fees for low-income players.',                   true),
  ('Mental Health Outdoors',    'Wellbeing',          'Using golf and outdoor activity to support mental health recovery.', true)
on conflict (name) do nothing;

-- ─── SEED: FIRST DRAW ─────────────────────────────────────────────────────────
insert into draws (month, status, draw_date, pool_total, jackpot, pool4, pool3)
values ('March 2026', 'pending', '2026-03-31', 50000000, 20000000, 17500000, 12500000)
on conflict do nothing;
