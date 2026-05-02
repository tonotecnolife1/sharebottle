# NIGHTOS 本番デプロイ Runbook

**目的**: PC を開いてから **30〜45 分**で本番環境を立ち上げ、最低限の動作確認まで完了する。

**対象**: 初回デプロイ、または環境を作り直すとき。
ステップは**上から順番に実行**すれば良いように並べてある。

> 補足ドキュメント
> - 詳細手順とトラブルシュート → `supabase/MIGRATE.md`
> - 障害時の対応 → `OPS_RUNBOOK.md`
> - リリース全体タスク → `RELEASE_CHECKLIST.md`

---

## 0. 事前準備（5 分）

以下のアカウントが必要。先に作成・ログイン状態にしておく。

- [ ] **Supabase** プロジェクト（無料 Tier 可、本番は **Pro** 推奨）
- [ ] **Vercel** プロジェクト（GitHub 連携済み）
- [ ] **Anthropic** API キー（https://console.anthropic.com/）
- [ ] 独自ドメイン（任意 — まずは `*.vercel.app` で動作確認するのが安全）

---

## 1. Supabase スキーマ適用（10 分）

1. Supabase Dashboard → 対象プロジェクト → **SQL Editor** → **New query**
2. **以下のファイルを順番に**コピペして **Run** を押す（各ファイルとも `if not exists` 付きなので冪等）

   ```
   supabase/migrations/002_nightos_schema.sql
   supabase/migrations/003_schema_additions.sql
   supabase/migrations/004_team_chat.sql
   supabase/migrations/005_customer_region.sql
   supabase/migrations/006_signup_rls_fix.sql   ← 必須(新規登録の店舗作成のため)
   supabase/migrations/007_b4_rls_extra_tables.sql ← 必須(クーポン・連絡が消えないため)
   ```

3. **適用確認** — SQL Editor で次を実行し、それぞれ期待通りか確認：

   ```sql
   -- (a) 主要テーブルが揃っているか
   select count(*)
     from information_schema.tables
    where table_schema = 'public'
      and table_name in (
        'nightos_stores', 'nightos_casts',
        'customers', 'visits', 'bottles', 'cast_memos',
        'douhans', 'cast_goals',
        'cast_messages', 'cast_requests',
        'follow_logs', 'ai_chats', 'coupons',
        'team_chat_rooms', 'team_chat_room_members', 'team_chat_messages'
      );
   -- 期待: 16

   -- (b) 003 が当たっているか (auth_user_id カラム)
   select column_name from information_schema.columns
    where table_name = 'nightos_casts' and column_name = 'auth_user_id';
   -- 期待: 1 行

   -- (c) 006/007 が当たっているか (RLS off)
   select tablename, rowsecurity from pg_tables
    where schemaname = 'public'
      and tablename in (
        'nightos_stores','nightos_casts','customers','visits','bottles',
        'cast_messages','cast_requests','coupons','douhans'
      );
   -- 期待: rowsecurity = false の 9 行
   ```

> ✋ **失敗した場合** → `supabase/MIGRATE.md` のトラブルシュート参照。

---

## 2. Vercel 環境変数設定（10 分）

Vercel Dashboard → 対象プロジェクト → **Settings** → **Environment Variables**

以下を **Production** と **Preview** の両方にチェックを入れて追加。

| Key | 値 / 取得元 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → `service_role` `secret` 🔒 |
| `ANTHROPIC_API_KEY` | Anthropic console → API Keys |
| `NIGHTOS_DISABLE_MOCK_AUTH` | `true`（**本番では必ず**。デモログインを無効化） |
| `NEXT_PUBLIC_APP_URL` | `https://<your-domain>` （独自ドメイン取得後。なければ `*.vercel.app`） |

**設定しないこと**:
- `NIGHTOS_SETUP_SECRET` — **本番では未設定が正解**。設定すると `/setup` UI と `/api/setup`/`/api/setup-auth` が復活してしまう

設定が終わったら **Deployments** タブ → 最新の Production を **Redeploy**
（環境変数はビルド時に焼き込まれるため）。

---

## 3. 本番 URL でスモークテスト（10 分）

> ✋ ローカルでなく **本番 URL** で確認すること。`https://<your-project>.vercel.app` または独自ドメイン。

各項目、**期待される表示**を満たせば OK。

### A. 認証 / 法務系

| # | URL | 期待 |
|---|-----|------|
| A1 | `/auth/login` | 「ログイン」見出し / 「新規登録」ボタン / **「デモを試す」ボタンが出ない**（mock 無効） |
| A2 | `/auth/login` 下部 | 「利用規約」「プライバシー」「特商法表記」のリンク |
| A3 | `/legal/privacy` | プライバシーポリシー雛形が見える |
| A4 | `/legal/terms` | 利用規約雛形が見える |
| A5 | `/legal/tokutei` | 特定商取引法に基づく表記が見える |
| A6 | `/auth/reset-password` | パスワード再設定フォーム |
| A7 | `/setup` | **404**（`NIGHTOS_SETUP_SECRET` 未設定なので隠れていれば OK）|
| A8 | `/setup?secret=anything` | **404**（同上）|

### B. 新規登録（実際に 1 アカウント作る）

1. `/auth/signup` → 仮の名前 / メール / パスワード入力 → 「登録する」
2. メール確認: Supabase Dashboard の Authentication → 設定により
   - **Email confirmation 有効** → 確認メール受信 → リンクタップ → onboarding へ
   - **無効** → 直接 onboarding へ
3. `/onboarding` で 業態 / 新規店舗名 / 源氏名 入力 → 「はじめる」
4. **キャスト home が表示される**こと。エラーになる場合は OPS_RUNBOOK §「新規登録で失敗する」を参照

### C. 主要画面が落ちないか

ログイン後にロール選択画面が出るので、各ロールでアクセス：

| # | パス | 確認 |
|---|------|------|
| C1 | `/cast/home` | 「おかえりなさい」見出し、SummaryCards が空でも崩れない |
| C2 | `/store` | ヒーロー band、「登録」「データ確認・編集」セクション |
| C3 | `/customer/home` | 「ゲストさん」見出し（顧客 cast の場合は名前）|
| C4 | `/settings` | アカウント情報・ログアウト・退会 |

### D. データの永続化（重要 — B4 動作確認）

1. `/store/customers/new` から顧客を 1 件登録
2. ブラウザを完全リロード（Cmd+Shift+R）→ `/store/customers` で**残っていれば OK**
3. 残らない場合: Supabase の RLS / 権限不備（`OPS_RUNBOOK.md` §「データが消える」参照）

### E. CSV エクスポート

1. `/store/customers` → **CSV ダウンロード** ボタン → ファイルが落ちる
2. Excel で開いて **日本語が文字化けしていない**こと（UTF-8 BOM が効いていれば OK）

### F. AI（さくらママ）

1. `/cast/home` の「今朝のさくらママから」が **デモ応答以外**の文章を返す
2. 冒頭に「デモ応答モードです」が出る場合 → `ANTHROPIC_API_KEY` の env 設定漏れ or 無効

---

## 4. 仕上げ（5 分）

- [ ] `NEXT_PUBLIC_APP_URL` を本番ドメインに揃える（OG 画像 / metadataBase 用）
- [ ] `app/layout.tsx` の `metadata.robots: { index: true }` に変更してプッシュ
       （現在 `false` でクローラブロック中）
- [ ] **法務 3 ページ** の `〔運営事業者名〕` 等プレースホルダを実情報に置換 → 法務担当者にレビュー依頼
- [ ] Anthropic console → **Usage limits** で月額コスト上限を設定（推奨: 最初は ¥3,000〜5,000）
- [ ] Supabase → Database → **Backups** で自動バックアップが有効か確認（Pro Tier）

---

## 5. 公開前の最終確認

- [ ] **本番 URL を非エンジニアの誰か 1 人に踏んでもらい、登録〜ログインを通す**
- [ ] エラーが出たら `OPS_RUNBOOK.md` を見ながら原因切り分け
- [ ] OK なら告知（独自ドメイン公開、SNS、招待メール 等）

完了したら、`RELEASE_CHECKLIST.md` の B1, B2, M1 (Email Confirmation), M5
(独自ドメイン), M6 (バックアップ) などをチェック ✅。
