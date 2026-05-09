-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS migration 008 — account-bound roles
-- ───────────────────────────────────────────────────────────────
-- 現状: アカウントは全員「キャスト」として作成され、role-selector
-- (localStorage) で /cast /store /customer を自由に切替可能。
-- 結果として、ロール境界が DB レベルで強制されていない。
--
-- 本 migration で:
--   1. nightos_casts.user_role を追加
--      ('cast' | 'store_staff' | 'store_owner')
--      既存行は default 'cast'
--   2. nightos_stores.invite_code を追加
--      キャスト/店舗スタッフ用の参加コード（8文字）
--      既存行はランダム値で埋める
--   3. customers.auth_user_id を追加
--      来店客が自分でサインアップ → 顧客行と紐付け
--
-- middleware.ts と onboarding flow がこれらに依存する。
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. user_role on nightos_casts ─────────────────────────────
alter table nightos_casts
  add column if not exists user_role text
    default 'cast'
    check (user_role in ('cast', 'store_staff', 'store_owner'));

-- 既存行の user_role が null の場合は 'cast' で埋める（MVP 方針）
update nightos_casts
   set user_role = 'cast'
 where user_role is null;

-- 以降は not null
alter table nightos_casts
  alter column user_role set not null;

create index if not exists casts_role_idx
  on nightos_casts(store_id, user_role);

-- ─── 2. venue_type + invite_code on nightos_stores ─────────────
alter table nightos_stores
  add column if not exists venue_type text
    check (venue_type in ('club', 'cabaret'));

-- 既存の店舗で venue_type が null なら 'cabaret' でデフォルト
update nightos_stores
   set venue_type = 'cabaret'
 where venue_type is null;

alter table nightos_stores
  alter column venue_type set not null;

alter table nightos_stores
  add column if not exists invite_code text;

-- 既存店舗にユニークな招待コードを発行。
-- A-Z2-9 (混乱しやすい 0/O/1/I を除外) から 8 文字。
-- gen_random_uuid() ベースで衝突確率は実用上無視可。
update nightos_stores
   set invite_code = upper(
     translate(
       substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
       '01iIlLoO',
       'AB23789K'
     )
   )
 where invite_code is null;

-- 切り詰め（万が一 12 文字超になっていた行があれば 8 へ）
update nightos_stores
   set invite_code = substr(invite_code, 1, 8)
 where length(invite_code) > 8;

alter table nightos_stores
  alter column invite_code set not null;

-- 既存名と重複したらユニーク制約で弾かれるので、ユニーク制約は最後に
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'nightos_stores_invite_code_key'
  ) then
    alter table nightos_stores
      add constraint nightos_stores_invite_code_key unique (invite_code);
  end if;
end $$;

-- ─── 3. auth_user_id on customers ──────────────────────────────
alter table customers
  add column if not exists auth_user_id uuid;

-- FK 追加（Supabase の auth.users への参照）
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'customers_auth_user_id_fkey'
  ) then
    alter table customers
      add constraint customers_auth_user_id_fkey
      foreign key (auth_user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

-- ユニーク制約（1 user = 1 customer 行）
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'customers_auth_user_id_key'
  ) then
    alter table customers
      add constraint customers_auth_user_id_key unique (auth_user_id);
  end if;
end $$;

create index if not exists customers_auth_user_idx
  on customers(auth_user_id);

-- ─── 4. RLS off / grants（007 と同じ方針で念のため）──────────
alter table if exists nightos_casts  disable row level security;
alter table if exists nightos_stores disable row level security;
alter table if exists customers      disable row level security;

grant select, insert, update on nightos_casts  to authenticated, anon;
grant select, insert, update on nightos_stores to authenticated, anon;
grant select, insert, update on customers      to authenticated, anon;
