-- ============================================================
-- SHAREBOTTLE MVP - Initial Schema
-- ============================================================
-- Migration: 001_initial_schema.sql
-- Description: 全テーブル・インデックス・トリガー・RLSの初期構築
-- ============================================================

-- =========================
-- 0. Extensions
-- =========================
create extension if not exists "uuid-ossp";

-- =========================
-- 1. stores（店舗マスタ）
-- =========================
-- MVPでは1店舗固定。マルチテナント拡張に備えてテーブルは用意する。
create table stores (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text unique,                          -- URL用スラッグ（将来用）
  created_at  timestamptz not null default now()
);

comment on table stores is '店舗マスタ。MVPでは1店舗のみ使用。';

-- =========================
-- 2. user_profiles（ユーザープロフィール）
-- =========================
-- Supabase Auth の auth.users と 1:1 で紐付く。
-- auth.users の作成時に自動でレコードが作られるよう trigger を設定する。
create table user_profiles (
  id                          uuid primary key default uuid_generate_v4(),
  user_id                     uuid not null unique references auth.users(id) on delete cascade,
  display_name                text not null default '',
  full_name                   text,
  email                       text not null default '',
  phone                       text,
  avatar_url                  text,
  -- 通知設定
  notification_order_updates  boolean not null default true,
  notification_earnings       boolean not null default true,
  notification_promotions     boolean not null default false,
  notification_email          boolean not null default true,
  -- タイムスタンプ
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

comment on table user_profiles is 'ユーザープロフィール。auth.usersと1:1。通知設定も含む。';

create index idx_user_profiles_user_id on user_profiles(user_id);

-- =========================
-- 3. bottle_masters（ボトル銘柄マスタ）
-- =========================
-- 店舗で取り扱うボトルの銘柄情報。MVPではseedで投入。
create table bottle_masters (
  id                          uuid primary key default uuid_generate_v4(),
  name                        text not null,
  category                    text not null default '',
  -- カテゴリ例: シングルモルト, ブレンデッド, ピュアモルト, グレーン
  image_url                   text,
  flavor_notes                text[] not null default '{}',
  reference_purchase_price    integer not null default 0,
  -- 参考取得価格（円）
  recommended_price_per_glass integer not null default 0,
  -- 推奨1杯単価（円）
  default_total_glasses       integer not null default 20,
  -- 1本あたりの標準杯数
  is_popular                  boolean not null default false,
  sort_order                  integer not null default 0,
  -- 表示順制御用
  created_at                  timestamptz not null default now()
);

comment on table bottle_masters is 'ボトル銘柄マスタ。参考価格・推奨単価・標準杯数を保持。';

create index idx_bottle_masters_is_popular on bottle_masters(is_popular) where is_popular = true;

-- =========================
-- 4. user_bottles（ユーザー保有ボトル）
-- =========================
-- ユーザーが店舗にキープしているボトル。
-- 残量・消費杯数・シェア設定などの運用状態を保持。
create table user_bottles (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  bottle_master_id        uuid not null references bottle_masters(id) on delete restrict,
  store_id                uuid not null references stores(id) on delete restrict,
  display_owner_name      text not null default '',
  -- メニュー上の表示名（例: 田中様）
  purchase_price          integer not null default 0,
  -- 実際の購入価格（参考値）
  price_per_glass         integer not null default 0,
  -- シェア時の1杯単価
  total_glasses           integer not null default 20,
  -- ボトルの総杯数
  remaining_glasses       integer not null default 20,
  -- 残り杯数
  self_consumed_glasses   integer not null default 0,
  -- 自己消費杯数
  shared_consumed_glasses integer not null default 0,
  -- シェア利用杯数
  share_enabled           boolean not null default true,
  -- シェア設定 ON/OFF
  acquired_at             date not null default current_date,
  -- ボトル取得日
  status                  text not null default 'active'
                          check (status in ('active', 'empty', 'removed')),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  -- 整合性制約
  constraint chk_remaining_glasses
    check (remaining_glasses >= 0 and remaining_glasses <= total_glasses),
  constraint chk_consumed_total
    check (self_consumed_glasses + shared_consumed_glasses + remaining_glasses = total_glasses)
);

comment on table user_bottles is 'ユーザー保有ボトル。残量・消費・シェア設定を管理。';
comment on column user_bottles.status is 'active: 利用中, empty: 空, removed: 撤去済み';

create index idx_user_bottles_user_id on user_bottles(user_id);
create index idx_user_bottles_store_id on user_bottles(store_id);
create index idx_user_bottles_store_active on user_bottles(store_id, status)
  where status = 'active';

-- =========================
-- 5. bottle_transactions（取引履歴）
-- =========================
-- シェア利用・自己消費の記録。収益計算の元データ。
create table bottle_transactions (
  id                  uuid primary key default uuid_generate_v4(),
  user_bottle_id      uuid not null references user_bottles(id) on delete cascade,
  transaction_type    text not null check (transaction_type in ('self', 'shared')),
  glasses             integer not null default 1 check (glasses > 0),
  -- 杯数
  gross_amount        integer not null default 0,
  -- 税込総額（= glasses × price_per_glass）
  fee_amount          integer not null default 0,
  -- プラットフォーム手数料
  net_amount          integer not null default 0,
  -- 実質収益（= gross_amount - fee_amount）
  consumed_by_name    text,
  -- 利用者名（シェア時のみ。例: 山田様）
  happened_at         timestamptz not null default now(),
  -- 実際の取引発生日時
  created_at          timestamptz not null default now()
);

comment on table bottle_transactions is '取引履歴。シェア利用と自己消費を記録。';
comment on column bottle_transactions.transaction_type is 'self: 自己消費, shared: シェア利用';
comment on column bottle_transactions.fee_amount is 'MVPでは gross_amount × 10% で計算';

create index idx_bottle_transactions_user_bottle_id
  on bottle_transactions(user_bottle_id);
create index idx_bottle_transactions_happened_at
  on bottle_transactions(happened_at desc);

-- =========================
-- 6. payouts（出金履歴）
-- =========================
-- MVPでは表示のみ。実送金処理は行わない。
create table payouts (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  amount          integer not null check (amount > 0),
  payout_method   text not null default 'paypay',
  -- MVPでは paypay 固定
  status          text not null default 'pending'
                  check (status in ('pending', 'completed', 'failed')),
  requested_at    timestamptz not null default now(),
  completed_at    timestamptz
);

comment on table payouts is '出金履歴。MVPでは画面表示のみ、実送金なし。';

create index idx_payouts_user_id on payouts(user_id);
create index idx_payouts_requested_at on payouts(requested_at desc);


-- ============================================================
-- Triggers
-- ============================================================

-- --------------------------
-- updated_at 自動更新トリガー
-- --------------------------
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at_column();

create trigger trg_user_bottles_updated_at
  before update on user_bottles
  for each row execute function update_updated_at_column();

-- --------------------------
-- 新規ユーザー登録時に user_profiles を自動作成
-- --------------------------
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into user_profiles (user_id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ============================================================
-- Views（便利ビュー）
-- ============================================================

-- --------------------------
-- ホーム画面用: シェア可能ボトル一覧
-- --------------------------
create or replace view v_bottle_menu as
select
  ub.id,
  bm.name,
  bm.image_url,
  ub.remaining_glasses,
  ub.price_per_glass,
  ub.display_owner_name as owner_name,
  bm.is_popular,
  bm.flavor_notes,
  bm.category,
  ub.store_id
from user_bottles ub
join bottle_masters bm on bm.id = ub.bottle_master_id
where ub.status = 'active'
  and ub.share_enabled = true
  and ub.remaining_glasses > 0
order by bm.is_popular desc, bm.sort_order asc;

comment on view v_bottle_menu is 'ホーム画面表示用。シェア有効かつ残量ありのボトル一覧。';

-- --------------------------
-- 収益管理用: ユーザー別月次サマリ
-- --------------------------
create or replace view v_user_monthly_earnings as
select
  ub.user_id,
  date_trunc('month', bt.happened_at) as month,
  count(*)::integer as transaction_count,
  sum(bt.gross_amount)::integer as gross_total,
  sum(bt.fee_amount)::integer as fee_total,
  sum(bt.net_amount)::integer as net_total,
  case
    when count(*) > 0
    then (sum(bt.gross_amount) / count(*))::integer
    else 0
  end as avg_price
from bottle_transactions bt
join user_bottles ub on ub.id = bt.user_bottle_id
where bt.transaction_type = 'shared'
group by ub.user_id, date_trunc('month', bt.happened_at);

comment on view v_user_monthly_earnings is '収益管理画面用。ユーザー別の月次収益集計。';


-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- --------------------------
-- RLS 有効化
-- --------------------------
alter table stores enable row level security;
alter table user_profiles enable row level security;
alter table bottle_masters enable row level security;
alter table user_bottles enable row level security;
alter table bottle_transactions enable row level security;
alter table payouts enable row level security;

-- --------------------------
-- stores: 全員読み取り可
-- --------------------------
create policy "stores_select_all"
  on stores for select
  using (true);

-- --------------------------
-- user_profiles: 自分のプロフィールのみ読み書き
-- --------------------------
create policy "profiles_select_own"
  on user_profiles for select
  using (auth.uid() = user_id);

create policy "profiles_update_own"
  on user_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- insert は trigger が security definer で行うため、ユーザーからの直接insertは不要

-- --------------------------
-- bottle_masters: 全員読み取り可
-- --------------------------
create policy "bottle_masters_select_all"
  on bottle_masters for select
  using (true);

-- --------------------------
-- user_bottles: 自分のボトルは全操作可、他人のボトルはシェア有効のみ読み取り可
-- --------------------------
create policy "user_bottles_select_own"
  on user_bottles for select
  using (auth.uid() = user_id);

create policy "user_bottles_select_shared"
  on user_bottles for select
  using (
    share_enabled = true
    and status = 'active'
    and remaining_glasses > 0
  );

create policy "user_bottles_insert_own"
  on user_bottles for insert
  with check (auth.uid() = user_id);

create policy "user_bottles_update_own"
  on user_bottles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- --------------------------
-- bottle_transactions: 自分のボトルに紐づく取引のみ読み取り可
-- --------------------------
create policy "transactions_select_own"
  on bottle_transactions for select
  using (
    exists (
      select 1 from user_bottles ub
      where ub.id = bottle_transactions.user_bottle_id
        and ub.user_id = auth.uid()
    )
  );

-- insert はMVPではスタッフ or server action 経由を想定。
-- 当面は service_role key で操作する。
-- 将来的にはスタッフ用の insert policy を追加。

-- --------------------------
-- payouts: 自分の出金のみ読み取り可
-- --------------------------
create policy "payouts_select_own"
  on payouts for select
  using (auth.uid() = user_id);

create policy "payouts_insert_own"
  on payouts for insert
  with check (auth.uid() = user_id);


-- ============================================================
-- 未ログインユーザー（anon）向けポリシー
-- ============================================================
-- ホーム画面はログインなしで閲覧可能にする。
-- Supabase の anon key でアクセスした場合、auth.uid() は null になる。
-- bottle_masters と v_bottle_menu は anon でも読み取り可能にする必要がある。

-- bottle_masters は上記の "bottle_masters_select_all" で対応済み（using(true)）。

-- user_bottles の "user_bottles_select_shared" も using 条件に
-- auth.uid() を含まないため、anon でも条件に合致するレコードは読み取り可能。

-- ただし view 経由でアクセスする場合、view は定義者の権限で実行されるため
-- RLS の影響を受けない場合がある。
-- MVPでは Server Component から service_role key で取得することで解決する。
-- 将来的には anon 用の明示的なポリシーを整理する。
