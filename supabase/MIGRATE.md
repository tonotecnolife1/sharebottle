# NIGHTOS 本番デプロイ手順

`RELEASE_CHECKLIST.md` の **B1 + B2** に対応するオペレーション手順。
Supabase ダッシュボードと Vercel ダッシュボードでの作業をまとめている。

---

## B1. Supabase スキーマを本番 DB に適用

`supabase/migrations/` 以下のファイルを **番号順** に実行する。
すべてのマイグレーションは `if not exists` / `if exists` 付きで**冪等**なので、
途中で失敗しても再実行すれば良い。

### 手順

1. **Supabase Dashboard** を開く: https://supabase.com/dashboard
2. 対象プロジェクト（**`nightos`** などプロジェクト名で探す）を選択
3. 左メニュー **SQL Editor** → **New query**
4. 以下の順で各ファイルの内容を貼り付け → **Run** を押す

| 順 | ファイル | 中身（要約） |
|----|---------|-------------|
| 1 | `supabase/migrations/002_nightos_schema.sql` | 主要テーブル: `nightos_stores`, `nightos_casts`, `customers`, `visits`, `bottles`, `cast_memos` |
| 2 | `supabase/migrations/003_schema_additions.sql` | `nightos_casts.auth_user_id` / `club_role`、`douhans` / `cast_goals` / `cast_messages` / `cast_requests` / `coupons` |
| 3 | `supabase/migrations/004_team_chat.sql` | チームチャット用テーブル |
| 4 | `supabase/migrations/005_customer_region.sql` | `customers.region` カラム追加 |
| 5 | `supabase/migrations/006_signup_rls_fix.sql` | **🔴 最重要** — `nightos_stores` / `nightos_casts` の RLS を disable + `authenticated` `anon` ロールに `select/insert/update` を grant。これが当たっていないと新規登録の店舗作成で**サイレントに失敗**する |
| 6 | `supabase/migrations/007_b4_rls_extra_tables.sql` | 🔴 同等に必須 — `cast_messages` / `cast_requests` / `coupons` / `douhans` / `cast_goals` / `follow_logs` / `ai_chats` 等で RLS を disable + grant。B4 で mock-only → 実 DB 化した機能が、本番で「保存はできているように見えるが読めない」状態になるのを防ぐ |

### 適用後の動作確認（SQL Editor で実行）

```sql
-- 1. すべてのテーブルが存在するか
select table_name from information_schema.tables
 where table_schema = 'public' and table_name like 'nightos%' or table_name in ('customers','visits','bottles','cast_memos','douhans','cast_goals','cast_messages','cast_requests','coupons');
-- 期待: 13 テーブル前後

-- 2. nightos_casts に auth_user_id カラムがあるか（migration 003 適用確認）
select column_name from information_schema.columns
 where table_name = 'nightos_casts' and column_name = 'auth_user_id';
-- 期待: 1 行返る

-- 3. RLS が disable になっているか（migration 006 適用確認）
select tablename, rowsecurity from pg_tables
 where schemaname = 'public' and tablename in ('nightos_stores','nightos_casts');
-- 期待: rowsecurity = false の 2 行

-- 4. anon / authenticated に insert 権限があるか
select grantee, privilege_type from information_schema.role_table_grants
 where table_name = 'nightos_stores' and grantee in ('anon','authenticated');
-- 期待: select / insert / update が anon と authenticated 両方に
```

---

## B2. Vercel Production の環境変数

### 手順

1. **Vercel Dashboard** を開く: https://vercel.com/dashboard
2. 対象プロジェクト（**`nightos`**）を選択
3. **Settings** → **Environment Variables**
4. 以下を追加。`Environment` 列は **Production** と **Preview** の両方に
   チェックを入れる（Development は任意）
5. 既存の値があれば **上書き**

| Key | Value 例 / 取得元 | スコープ |
|-----|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` — Supabase Dashboard → Project Settings → API → Project URL | Production + Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → API → `anon` `public` key | Production + Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → API → `service_role` `secret` key — **🔴 絶対に Public 設定にしないこと** | Production + Preview |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/ で取得 | Production + Preview |
| `NIGHTOS_DISABLE_MOCK_AUTH` | `true` （**この値固定**。未設定だと本番でデモログインが残る） | Production + Preview |

### 適用後の動作確認

1. Vercel **Deployments** タブ → **Redeploy** （Production の最新を再デプロイ）
2. ビルド完了後、本番 URL を開く
3. ログイン画面に **「デモを試す」ボタンが表示されない** ことを確認（消えていれば
   `NIGHTOS_DISABLE_MOCK_AUTH=true` が効いている）
4. 新規登録 → メール → onboarding → 店舗名入力 → 「はじめる」 まで完走できることを確認
5. キャスト home で「今朝のさくらママから」が**スタブでなく実応答**を返すことを確認
   （冒頭に「デモ応答モードです」が出ていなければ `ANTHROPIC_API_KEY` が効いている）

---

## トラブルシューティング

### 新規登録で「店舗の作成に失敗しました: ...」が出る
→ B1 の migration **006** が適用されていない可能性が高い。SQL Editor で
`select tablename, rowsecurity from pg_tables where schemaname='public'`
を実行し、`nightos_stores` の `rowsecurity` が `f` になっていることを確認。

### 「キャスト登録に失敗しました: column "auth_user_id" does not exist」
→ migration **003** が適用されていない。002 → 003 の順で再実行。

### 「登録ボタンを押しても何も起きない」（エラーも出ない）
→ Vercel **Functions** ログで `[onboarding] post-insert read-back failed`
を検索。サーバー側の生エラーを確認できる。

### さくらママが「デモ応答モードです」を返す
→ `ANTHROPIC_API_KEY` が未設定または無効。Vercel env vars を確認。

### デモログイン UI が本番に残っている
→ `NIGHTOS_DISABLE_MOCK_AUTH=true` が未設定。Vercel env vars を追加 →
**Redeploy** を忘れずに（env vars はビルド時に焼き込まれるため再デプロイ必要）。
