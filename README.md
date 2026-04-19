# NIGHTOS

夜のお店（キャバクラ・ラウンジ・クラブ）向けワークスペースの検証版 MVP。
**「店舗が入力 → お姉さん/ママが育成 → キャストが活用」** のデータフローが動作します。

---

## 動作モード

NIGHTOS は 3 つのモードを自動で切り替えます。

| モード | トリガー | 用途 |
|---|---|---|
| **モック** | 環境変数なし | ローカル開発・デモ |
| **Supabase 接続** | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 永続化テスト |
| **AI (Claude)** | `ANTHROPIC_API_KEY` | さくらママの実応答（他 2 モードと併用可） |

どのモードでも UI は同一。クエリ層 (`lib/nightos/supabase-queries.ts`) が env を見て切り替えます。

---

## 1分で動かす（モック / ローカル）

```bash
git clone https://github.com/tonotecnolife1/sharebottle.git
cd sharebottle
npm install
npm run dev
```

ブラウザで **http://localhost:3000** → 自動で `/auth/login` に遷移  → キャストを選んでログイン。
環境変数の設定は**一切不要**です。

- モックデータで全画面が動作（in-memory）
- さくらママ AI は API キーなしでもペルソナ準拠のスタブ応答
- ログアウトはアプリ右上の「切替」から

---

## Vercel デプロイ手順（最短）

本リポジトリの `main` ブランチが Vercel に自動デプロイされる構成です。

1. https://vercel.com/new で `tonotecnolife1/sharebottle` をインポート
2. Production Branch = `main`
3. Environment Variables は空のままでも動作します（モックモード）
4. Deploy → `https://<your-project>.vercel.app`

`/` にアクセスすると `/auth/login` にリダイレクトされ、キャスト選択後にアプリへ入ります。

### 開発ブランチを検証したい時

Vercel は PR ごとに Preview URL を自動発行します。`claude/nightos-mvp-development-nQHc4` 等の作業ブランチに push すると、コメントに Preview URL が貼られます。

---

## Supabase 実接続モード（永続化テスト）

モックは「タブを閉じたら消える」ので、複数ユーザーで同じデータを見たいときは Supabase に接続します。

### 手順

1. **Supabase プロジェクト作成** (https://supabase.com/dashboard)
2. **SQL Editor** で以下を順番に実行:
   - `supabase/migrations/002_nightos_schema.sql` （テーブル定義）
   - `supabase/migrations/003_schema_additions.sql` （role / 同伴 / 目標 追加）

   いずれも `create ... if not exists` / `add column if not exists` なので再実行安全。

3. **Vercel (または .env.local) に env 設定**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

4. **テストデータ投入**: デプロイ後のアプリで `/setup` を開く
   - 「テストデータを投入」ボタンを押すと `/api/setup` 経由でモックと同じシードが `upsert` されます
   - キャスト9名・顧客38名・来店履歴・ボトル・同伴予定など
   - 複数回押しても安全（`on conflict do update`）

5. **ログインして動作確認**: `/auth/login` → キャスト選択

### `/api/setup` エンドポイント仕様

```
POST /api/setup?secret=nightos-setup-2026
```

- シークレットは `app/api/setup/route.ts` 内に定数として定義（必要なら書き換え）
- Supabase の env が未設定ならエラー
- 投入件数のサマリと詳細ログを JSON で返す

---

## 本物のさくらママ (Claude API) を有効化

```bash
cp .env.example .env.local
# .env.local に ANTHROPIC_API_KEY=sk-ant-... を設定
```

Vercel の場合は Environment Variables に `ANTHROPIC_API_KEY` を追加するだけ。

- モデル: `claude-haiku-4-5-20251001`（コスパ重視。約 $0.005/回）
- システムプロンプト: `features/ruri-mama/data/system-prompt.ts`
- キー無効・通信失敗時はスタブ応答に自動フォールバック

---

## 認証について

NIGHTOS は 2 つのログイン方式を併用しています。

### デモモード（キャスト選択）
- `/auth/login` で 5 名のキャストから選択
- httpOnly cookie `nightos.mock-cast-id` を発行
- 環境変数なしで動作

### 実モード（メール / パスワード）
- Supabase Auth を使用
- `/api/setup-auth?secret=...` でテスト Auth ユーザーを 5 名作成 + cast に紐付け
- 必要な env: `SUPABASE_SERVICE_ROLE_KEY`（作成時のみ）
- テストアカウント: `akari@test.nightos` / `nightos2026` 等

`middleware.ts` がどちらの cookie でも認証済みと判定。`getCurrentCast()` は Supabase セッションを優先し、無ければ mock cookie を読みます。

---

## 3分デモシナリオ

### 【前半】キャスト側の価値提案
1. `/auth/login` → **「あかり」** を選択
2. `/cast/home` で画面上部を見せる
   - **指名18本・リピート率72%・連絡が必要3人** のサマリ
   - アメジスト色の **「さくらママに相談」** カード
   - 今日連絡するお客様3人（渡辺=誕生日、田中=間隔空き、高橋=指名化チャンス）
3. **田中太郎** をタップ → `/cast/customers/cust1`
   - ベージュの **「店舗からの共有情報」(閲覧のみ)**
   - ピンク破線の **「個人メモ」(編集OK)** を書き換え → 保存
4. **「テンプレートで連絡」** → お礼テンプレートに `{姓}` `{前回の話題}` が埋まる → コピー
5. 下タブ **「さくらママ」** → 田中太郎を選択して「お礼のLINEを送りたい」
   - チップで段階ヒアリング → アドバイス+文面例+理由 の 3 点セット応答

### 【中盤】ママ / お姉さん側の育成
6. 「切替」→ 「ゆき」でログイン → `/mama/home`
7. `/mama/team` で **育成リマインダ**（1on1 空き・目標ノート未設定）を確認
8. キャスト別カルテで目標設定・1on1 チャットへ導線

### 【後半】店舗側の入力フロー
9. 「切替」→ 店舗スタッフ → `/store`
10. 顧客登録 → 来店登録 → ボトル登録 → ダッシュボードで効果確認
11. キャストに戻ると入力結果が連絡リストに反映されている

---

## 主要ルート

| ロール | パス | 内容 |
|---|---|---|
| 共通 | `/auth/login` | キャスト選択ログイン |
| 共通 | `/setup` | Supabase テストデータ投入 UI |
| キャスト | `/cast/home` | 連絡リスト・サマリ |
| キャスト | `/cast/customers/[id]` | 顧客カルテ |
| キャスト | `/cast/templates` | メッセージテンプレート |
| キャスト | `/cast/ruri-mama` | さくらママ AI |
| キャスト | `/cast/stats` | 個人の売上・指名推移 |
| キャスト | `/cast/chat` | チーム内チャット |
| ママ | `/mama/home` | ママダッシュボード |
| ママ | `/mama/team` | チーム一覧・育成リマインダ |
| ママ | `/mama/team/[castId]` | キャスト別カルテ |
| ママ | `/mama/customers` | 全顧客 / マップ |
| 店舗 | `/store` | 店舗ハブ |
| 店舗 | `/store/customers/new` | 顧客登録 |
| 店舗 | `/store/visits/new` | 来店登録 |
| 店舗 | `/store/bottles/new` | ボトル登録 |
| 店舗 | `/store/dashboard` | 効果ダッシュボード |
| 店舗 | `/store/approvals` | キャスト申請承認 |
| API | `/api/ruri-mama` | Claude 呼出し |
| API | `/api/setup` | Supabase シード投入 |
| API | `/api/setup-auth` | Auth ユーザー作成 + cast 紐付け |

---

## 技術スタック

- Next.js 14 (App Router) + TypeScript strict
- Tailwind CSS（pearl / champagne / rose-gold / amethyst / blush）
- Noto Sans JP + Cormorant Garamond
- Supabase (Postgres)
- Anthropic Claude API (`claude-haiku-4-5-20251001`)
- Lucide React

---

## ディレクトリ構成

```
app/
  auth/login/              キャスト選択ログイン
  setup/                   Supabase シード投入 UI
  cast/                    キャスト向け
  mama/                    ママ / お姉さん向け
  store/                   店舗スタッフ向け
  api/
    ruri-mama/route.ts     Claude 呼出し
    setup/route.ts         DB シード

components/nightos/        NIGHTOS 用 UI kit

features/
  cast-home/               連絡リスト
  customer-card/           顧客カルテ
  templates/               テンプレート
  ruri-mama/               AI チャット
  team-management/         ママ側チーム管理
  team-chat/               1on1 / グループチャット
  store-dashboard/         店舗ダッシュボード
  customer-registration/   顧客登録
  visit-registration/      来店登録
  bottle-registration/     ボトル登録

lib/nightos/
  auth.ts                  ログイン cast 解決
  cast-context.tsx         クライアント用 CastProvider
  constants.ts             CURRENT_CAST_ID, MOCK_TODAY 等
  mock-data.ts             モックシード
  supabase-queries.ts      withFallback パターンで mock/real 切替
  supabase-real.ts         Supabase 実クエリ

middleware.ts              未ログインリダイレクト
supabase/migrations/
  002_nightos_schema.sql
  003_schema_additions.sql
```

---

## 設計方針

- **3 層フォールバック**: env 無し→モック / Supabase エラー→モック / Claude エラー→スタブ。どのモードでも画面は止まらない
- **クエリ境界でモード判定**: `lib/nightos/supabase-queries.ts` の各関数が env を見て切替。Supabase client factory は env 必須なので、呼ぶ前にチェックする必要がある
- **CastProvider**: サーバーで cookie から cast を解決 → Context でクライアントに渡す（propドリル禁止）
- **Server Component 優先**: インタラクティブ部分のみ Client
- **Server Actions**: フォーム送信は Server Actions + `revalidatePath`
- **TEXT PK**: 全テーブル PK が TEXT でモック ID と DB ID が同じ値になる（モード切替時のデータ互換性）

---

## トラブルシューティング

**ログイン画面がループする**
`middleware.ts` が cookie を認識していない可能性。ブラウザの cookie をクリアして再度ログイン。

**`/setup` でエラーが出る**
Supabase env が Vercel に設定されていない、またはマイグレーション 002/003 が未実行の可能性。SQL Editor で再実行。

**さくらママが同じ応答を返す**
`ANTHROPIC_API_KEY` 未設定でスタブモード。設定すれば実応答になります。
