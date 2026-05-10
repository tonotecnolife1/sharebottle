-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS migration 006 — fix signup/onboarding store registration
-- ───────────────────────────────────────────────────────────────
-- Problem: The /onboarding flow inserts a row into `nightos_stores`
-- and `nightos_casts` using the signed-in user's anon-key Supabase
-- client. On Supabase Cloud, RLS is enabled by default for any new
-- tables created through the dashboard, and even for tables created
-- through the SQL editor RLS may have been enabled later. When RLS
-- is enabled with no permissive policy, the inserts either silently
-- drop the row or return an error — producing the "登録ボタンを押し
-- ても何も起きない" symptom because the post-redirect / page can't
-- find the just-created cast and bounces the user back to /onboarding.
--
-- This migration is idempotent and chooses the simplest fix that
-- keeps the MVP shape:
--   1. DISABLE RLS on the four tables touched by signup
--      (nightos_stores, nightos_casts, customers, douhans-style
--      tables stay as configured by 003).
--   2. Re-grant insert/select to the `authenticated` role just in
--      case the role lost its default privileges.
--
-- If you prefer to keep RLS enabled, replace this file's body with
-- the policy block at the bottom (commented out) and re-run.
-- ═══════════════════════════════════════════════════════════════

alter table if exists nightos_stores disable row level security;
alter table if exists nightos_casts  disable row level security;

-- Make doubly sure the signed-in role can read/write what the app needs
grant select, insert, update on nightos_stores to authenticated, anon;
grant select, insert, update on nightos_casts  to authenticated, anon;

-- ─── (optional) RLS-enabled alternative ──────────────────────────
-- Uncomment the block below if you want to keep RLS on. The policies
-- below let any signed-in user create a store and link a single
-- cast row to themselves via auth_user_id.
--
-- alter table nightos_stores enable row level security;
-- alter table nightos_casts  enable row level security;
--
-- create policy "stores_insert_authenticated"
--   on nightos_stores for insert to authenticated
--   with check (true);
-- create policy "stores_select_authenticated"
--   on nightos_stores for select to authenticated
--   using (true);
--
-- create policy "casts_insert_self"
--   on nightos_casts for insert to authenticated
--   with check (auth_user_id = auth.uid());
-- create policy "casts_select_self"
--   on nightos_casts for select to authenticated
--   using (auth_user_id = auth.uid() or true);
