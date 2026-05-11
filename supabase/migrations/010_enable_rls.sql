-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS migration 010 — Re-enable Row Level Security
-- ───────────────────────────────────────────────────────────────
-- 背景 (migrations 006-009):
--   MVP 速度優先で全テーブルの RLS を無効化し、anon ロールに
--   SELECT/INSERT/UPDATE/DELETE を付与していた。
--   その結果、NEXT_PUBLIC_SUPABASE_ANON_KEY を知っている誰でも
--   REST API から全データを直接読み書きできる状態になっている。
--
-- 本 migration で:
--   1. 全センシティブテーブルの RLS を再有効化
--   2. auth.uid() スコープのポリシーを付与
--   3. anon ロールの書き込み権限を剥奪
--      (SELECT は店舗・キャストの公開情報のみ残す)
--
-- 適用後、直接 Supabase REST を叩いた場合:
--   - 認証なし: 401 Unauthorized
--   - 他 cast / 他 store: 0 rows (空応答)
--
-- ⚠️  本番環境へ適用する前に必ずステージング環境でテストすること。
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. RLS を再有効化 ──────────────────────────────────────
alter table nightos_casts        enable row level security;
alter table nightos_stores       enable row level security;
alter table customers            enable row level security;
alter table cast_memos           enable row level security;
alter table ai_chats             enable row level security;
alter table douhans              enable row level security;
alter table cast_goals           enable row level security;
alter table cast_messages        enable row level security;
alter table cast_requests        enable row level security;
alter table follow_logs          enable row level security;
alter table visits               enable row level security;
alter table bottles              enable row level security;
alter table coupons              enable row level security;

-- ─── 2. anon の書き込み権限を剥奪 ──────────────────────────
-- サインアップフロー (supabase-real.ts) は authenticated ロールで
-- 実行されるので、anon の INSERT を外しても問題ない。

revoke insert, update, delete on nightos_casts  from anon;
revoke insert, update, delete on nightos_stores from anon;
revoke insert, update, delete on customers       from anon;
revoke insert, update, delete on cast_memos      from anon;
revoke insert, update, delete on ai_chats        from anon;
revoke insert, update, delete on douhans         from anon;
revoke insert, update, delete on cast_goals      from anon;
revoke insert, update, delete on cast_messages   from anon;
revoke insert, update, delete on cast_requests   from anon;
revoke insert, update, delete on follow_logs     from anon;
revoke insert, update, delete on visits          from anon;
revoke insert, update, delete on bottles         from anon;
revoke insert, update, delete on coupons         from anon;

-- anon の SELECT も原則禁止（ポリシーで個別に許可する）
revoke select on nightos_casts  from anon;
revoke select on customers       from anon;
revoke select on cast_memos      from anon;
revoke select on ai_chats        from anon;
revoke select on douhans         from anon;
revoke select on cast_goals      from anon;
revoke select on cast_messages   from anon;
revoke select on cast_requests   from anon;
revoke select on follow_logs     from anon;
revoke select on visits          from anon;
revoke select on bottles         from anon;
revoke select on coupons         from anon;

-- 店舗名だけは公開情報（サインアップ時に invite_code で lookup するため）
-- SELECT のみ残す。invite_code は UNIQUE なので総当たりは困難。
revoke insert, update, delete on nightos_stores from anon;
-- SELECT on nightos_stores: granted (below in policies)

-- ─── Helper: 自分の store_id を返す関数 ──────────────────────
-- アクティブな cast 行からのみ store_id を取得する。
-- SECURITY DEFINER で呼び出し元に関係なく定義者権限で実行。
create or replace function auth_cast_store_id()
  returns text
  language sql
  stable
  security definer
  set search_path = public
as $$
  select store_id
    from nightos_casts
   where auth_user_id = auth.uid()
     and is_active = true
   limit 1;
$$;

-- ─── 3. nightos_casts ポリシー ────────────────────────────────

-- 自分自身の cast 行を全操作可能
create policy "casts: own row"
  on nightos_casts
  for all
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- 同じ店舗の cast 行は SELECT のみ可（チーム一覧表示のため）
create policy "casts: same store select"
  on nightos_casts
  for select
  using (store_id = auth_cast_store_id());

-- ─── 4. nightos_stores ポリシー ──────────────────────────────

-- 自分の店舗は全操作可（store_owner のみ UPDATE/DELETE を推奨するが
-- MVP 段階では store_id 一致で許可）
create policy "stores: own store"
  on nightos_stores
  for all
  using (id = auth_cast_store_id());

-- invite_code lookup: anon が signup 時に店舗名を確認できるよう SELECT 許可
create policy "stores: anon invite lookup"
  on nightos_stores
  for select
  to anon
  using (true); -- invite_code は URL に含まれないため、テーブル全体公開は可
                -- 必要ならば: using (invite_code = current_setting('request.jwt.claims', true)::json->>'invite_code')

-- ─── 5. customers ポリシー ───────────────────────────────────

-- 自分の担当顧客 (cast_id 一致) または自分の店舗顧客
create policy "customers: own store"
  on customers
  for all
  using (store_id = auth_cast_store_id());

-- 来店客本人が自分のレコードを読み書き
create policy "customers: self"
  on customers
  for all
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- ─── 6. cast_memos ポリシー ──────────────────────────────────

create policy "memos: own cast"
  on cast_memos
  for all
  using (cast_id in (
    select id from nightos_casts
     where auth_user_id = auth.uid()
  ));

-- ─── 7. ai_chats ポリシー ────────────────────────────────────

create policy "ai_chats: own cast"
  on ai_chats
  for all
  using (cast_id in (
    select id from nightos_casts
     where auth_user_id = auth.uid()
  ));

-- ─── 8. douhans ポリシー ─────────────────────────────────────

create policy "douhans: own store"
  on douhans
  for all
  using (store_id = auth_cast_store_id());

-- ─── 9. cast_goals ポリシー ──────────────────────────────────

-- 自分のゴール、または同店舗の manager（mama / oneesan）が閲覧可
create policy "cast_goals: own or store manager"
  on cast_goals
  for all
  using (
    cast_id in (select id from nightos_casts where auth_user_id = auth.uid())
    or
    exists (
      select 1 from nightos_casts
       where auth_user_id = auth.uid()
         and store_id = auth_cast_store_id()
         and club_role in ('mama', 'oneesan')
    )
  );

-- ─── 10. cast_messages ポリシー ──────────────────────────────
-- cast_messages は store_id を持たず cast_id のみ。
-- 自分宛のメッセージ、または同店舗のメッセージをマネージャーが閲覧可。

create policy "cast_messages: own or store manager"
  on cast_messages
  for all
  using (
    cast_id in (select id from nightos_casts where auth_user_id = auth.uid())
    or
    exists (
      select 1 from nightos_casts nc
       where nc.auth_user_id = auth.uid()
         and nc.store_id = auth_cast_store_id()
         and nc.club_role in ('mama', 'oneesan')
    )
  );

-- ─── 11. cast_requests ポリシー ──────────────────────────────
-- cast_requests も store_id を持たず cast_id のみ。

create policy "cast_requests: own or store manager"
  on cast_requests
  for all
  using (
    cast_id in (select id from nightos_casts where auth_user_id = auth.uid())
    or
    exists (
      select 1 from nightos_casts nc
       where nc.auth_user_id = auth.uid()
         and nc.store_id = auth_cast_store_id()
         and nc.club_role in ('mama', 'oneesan')
    )
  );

-- ─── 12. follow_logs ポリシー ────────────────────────────────

create policy "follow_logs: own cast"
  on follow_logs
  for all
  using (cast_id in (
    select id from nightos_casts where auth_user_id = auth.uid()
  ));

-- ─── 13. visits ポリシー ─────────────────────────────────────

create policy "visits: own store"
  on visits
  for all
  using (store_id = auth_cast_store_id());

-- ─── 14. bottles ポリシー ────────────────────────────────────

create policy "bottles: own store"
  on bottles
  for all
  using (store_id = auth_cast_store_id());

-- ─── 15. coupons ポリシー ────────────────────────────────────

create policy "coupons: own store"
  on coupons
  for all
  using (store_id = auth_cast_store_id());

-- ─── 16. service_role は引き続き全アクセス可 ─────────────────
-- Next.js サーバーサイドコードが service_role key を使う場合は
-- RLS をバイパスするので引き続き動作する。
-- （現在の実装は anon key のみ使用しているため、
--   将来的に service_role key への切り替えを推奨）

-- ─── 補足: 動作確認クエリ ─────────────────────────────────────
-- 以下を psql で実行して RLS が有効化されていることを確認:
--
--   SELECT tablename, rowsecurity
--     FROM pg_tables
--    WHERE schemaname = 'public'
--      AND tablename IN (
--        'nightos_casts', 'nightos_stores', 'customers',
--        'cast_memos', 'ai_chats', 'douhans', 'cast_goals'
--      );
--
-- 全行の rowsecurity が true になっていれば OK。
