-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS MVP schema (002)
-- ───────────────────────────────────────────────────────────────
-- Night-club workspace: stores input customer data, casts consume
-- it via AI-assisted home and Ruri-Mama chat.
-- RLS is disabled for MVP; will be added once Supabase Auth is
-- wired up in a later iteration.
-- ═══════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ─── Parent tables ─────────────────────────────────────────────
create table if not exists nightos_stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists nightos_casts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references nightos_stores(id) on delete cascade,
  name text not null,
  nomination_count int default 0,
  monthly_sales bigint default 0,
  repeat_rate numeric(4,3) default 0,
  created_at timestamptz default now()
);

-- ─── Customers ────────────────────────────────────────────────
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references nightos_stores(id) on delete cascade,
  cast_id uuid references nightos_casts(id) on delete set null,
  name text not null,
  birthday text,
  job text,
  favorite_drink text,
  category text default 'regular' check (category in ('vip', 'regular', 'new')),
  store_memo text,
  created_at timestamptz default now()
);

create index if not exists customers_store_cast_idx
  on customers(store_id, cast_id);

-- ─── Cast personal memos (editable per-cast notes) ─────────────
create table if not exists cast_memos (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  cast_id uuid references nightos_casts(id) on delete cascade,
  last_topic text,
  service_tips text,
  next_topics text,
  visit_notes text,
  updated_at timestamptz default now(),
  unique(customer_id, cast_id)
);

-- ─── Bottles (keep-bottles) ───────────────────────────────────
create table if not exists bottles (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references nightos_stores(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  brand text not null,
  total_glasses int default 20,
  remaining_glasses int default 20,
  kept_at timestamptz default now()
);

create index if not exists bottles_customer_idx on bottles(customer_id);

-- ─── Visits ───────────────────────────────────────────────────
create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references nightos_stores(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  cast_id uuid references nightos_casts(id) on delete set null,
  table_name text,
  is_nominated boolean default false,
  visited_at timestamptz default now()
);

create index if not exists visits_customer_idx on visits(customer_id, visited_at desc);
create index if not exists visits_cast_idx on visits(cast_id, visited_at desc);

-- ─── Follow logs (records of sent follow-up messages) ──────────
create table if not exists follow_logs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  cast_id uuid references nightos_casts(id) on delete cascade,
  template_type text check (template_type in ('thanks', 'invite', 'birthday', 'seasonal')),
  sent_at timestamptz default now()
);

create index if not exists follow_logs_cast_idx on follow_logs(cast_id, sent_at desc);

-- ─── Ruri-Mama AI chat history ─────────────────────────────────
create table if not exists ai_chats (
  id uuid primary key default gen_random_uuid(),
  cast_id uuid references nightos_casts(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  messages jsonb default '[]'::jsonb,
  feedback text check (feedback in ('helpful', 'not_helpful') or feedback is null),
  created_at timestamptz default now()
);

create index if not exists ai_chats_cast_idx on ai_chats(cast_id, created_at desc);
