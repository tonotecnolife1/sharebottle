-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS migration 009 — store transfer support
-- ───────────────────────────────────────────────────────────────
-- Use case: a cast / store_staff moves from store A to store B.
-- We don't want to:
--   (a) DELETE the original cast row — store A's historical visits /
--       bottles / memos reference it, so we'd lose attribution.
--   (b) UPDATE store_id in place — the cast's new colleagues at store
--       B would see store A's customer / visit / bottle history because
--       they'd all share the same cast_id.
--
-- Approach:
--   * Add nightos_casts.is_active boolean. true = currently active at
--     that store. Old rows stay readable (= "卒業したキャスト") but
--     don't appear in active queries.
--   * Drop the global UNIQUE on auth_user_id and replace it with a
--     PARTIAL unique index that only enforces uniqueness across the
--     active rows. The deactivated rows can keep auth_user_id, but
--     practically we'll NULL it on transfer so there's no doubt.
--
-- Once this is in place, "transfer to a new store" becomes:
--   1. UPDATE old row SET is_active=false, auth_user_id=NULL
--   2. INSERT new row with new store_id, same auth_user_id, is_active=true
-- and the user signs in to the new store with their existing account.
-- ═══════════════════════════════════════════════════════════════

alter table nightos_casts
  add column if not exists is_active boolean not null default true;

create index if not exists nightos_casts_active_store_idx
  on nightos_casts (store_id, is_active);

-- Replace the global UNIQUE constraint with a PARTIAL UNIQUE index.
-- The constraint name created by `auth_user_id uuid unique` in
-- migration 003 is conventionally nightos_casts_auth_user_id_key.
-- Drop it if present (idempotent).
do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'nightos_casts_auth_user_id_key'
  ) then
    alter table nightos_casts drop constraint nightos_casts_auth_user_id_key;
  end if;
end $$;

create unique index if not exists nightos_casts_active_auth_user_id_uniq
  on nightos_casts (auth_user_id)
  where is_active = true and auth_user_id is not null;

-- 008 disabled RLS already; restate so this migration is self-contained.
alter table if exists nightos_casts disable row level security;
grant select, insert, update on nightos_casts to authenticated, anon;
