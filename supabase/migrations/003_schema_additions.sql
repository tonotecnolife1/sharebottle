-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS schema additions (003)
-- Adds columns and tables needed for full Supabase mode + auth.
-- ═══════════════════════════════════════════════════════════════

-- ─── nightos_casts: add role + hierarchy columns ───────────────
alter table nightos_casts add column if not exists club_role text
  check (club_role in ('mama', 'oneesan', 'help'));
alter table nightos_casts add column if not exists assigned_oneesan_id text
  references nightos_casts(id) on delete set null;
alter table nightos_casts add column if not exists auth_user_id uuid unique;

create index if not exists casts_store_role_idx
  on nightos_casts(store_id, club_role);
create index if not exists casts_oneesan_idx
  on nightos_casts(assigned_oneesan_id);

-- ─── customers: add funnel + referral columns ─────────────────
alter table customers add column if not exists referred_by_customer_id text
  references customers(id) on delete set null;
alter table customers add column if not exists funnel_stage text
  default 'store_only'
  check (funnel_stage in ('store_only', 'assigned', 'line_exchanged'));
alter table customers add column if not exists line_exchanged_cast_id text
  references nightos_casts(id) on delete set null;
alter table customers add column if not exists line_exchanged_at timestamptz;
alter table customers add column if not exists manager_cast_id text
  references nightos_casts(id) on delete set null;

-- ─── douhans (同伴) ──────────────────────────────────────────
create table if not exists douhans (
  id text primary key,
  cast_id text references nightos_casts(id) on delete cascade,
  customer_id text references customers(id) on delete cascade,
  store_id text references nightos_stores(id) on delete cascade,
  date text not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'cancelled')),
  note text,
  cancellation_reason text,
  cancelled_at timestamptz
);

create index if not exists douhans_cast_date_idx on douhans(cast_id, date);
create index if not exists douhans_store_idx on douhans(store_id, date);

-- ─── cast_goals (月次目標) ────────────────────────────────────
create table if not exists cast_goals (
  cast_id text primary key references nightos_casts(id) on delete cascade,
  sales_goal bigint default 1000000,
  douhan_goal int default 3,
  note text,
  set_by text references nightos_casts(id) on delete set null,
  updated_at timestamptz default now()
);

-- ─── cast_messages (store → cast) ─────────────────────────────
create table if not exists cast_messages (
  id text primary key,
  cast_id text references nightos_casts(id) on delete cascade,
  message text not null,
  sent_at timestamptz default now(),
  read boolean default false
);

create index if not exists cast_messages_cast_idx
  on cast_messages(cast_id, read, sent_at desc);

-- ─── cast_requests (cast → store) ─────────────────────────────
create table if not exists cast_requests (
  id text primary key,
  cast_id text references nightos_casts(id) on delete cascade,
  cast_name text not null,
  message text not null,
  sent_at timestamptz default now(),
  resolved boolean default false
);

-- ─── coupons ──────────────────────────────────────────────────
create table if not exists coupons (
  id text primary key,
  customer_id text references customers(id) on delete cascade,
  store_id text references nightos_stores(id) on delete cascade,
  store_name text,
  type text check (type in ('drink', 'discount', 'birthday', 'vip')),
  title text not null,
  description text,
  valid_from timestamptz not null,
  valid_until timestamptz not null,
  used_at timestamptz,
  code text
);

create index if not exists coupons_customer_idx
  on coupons(customer_id, valid_until desc);
