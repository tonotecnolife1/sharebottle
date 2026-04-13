# NIGHTOS

夜のお店（キャバクラ・ラウンジ・クラブ）向けワークスペースの検証版 MVP。  
**「店舗が入力 → キャストが活用」** のデータフロー全体が動作します。

---

## 1分で動かす（モックモード）

```bash
git clone https://github.com/tonotecnolife1/sharebottle.git
cd sharebottle
git checkout claude/nightos-mvp-development-nQHc4
npm install
npm run dev
```

ブラウザで **http://localhost:3000** を開くだけ。  
環境変数の設定は**一切不要**です。

- モックデータで全画面が動作
- さくらママ AI は API キーなしでもペルソナ準拠のスタブ応答を返します
- Supabase 接続なしでも店舗フォーム・キャストの顧客カルテ編集すべて動作（in-memory）

---

## 全12ルート

| ロール | パス | 内容 |
|---|---|---|
| — | `/` | ロール選択（店舗 / キャスト） |
| キャスト | `/cast/home` | **C-1** 指名・リピート率・要フォロー + AIが選んだフォロー対象リスト |
| キャスト | `/cast/customers/[id]` | **C-2** 顧客カルテ（店舗情報は閲覧のみ、個人メモは編集可） |
| キャスト | `/cast/templates` | **C-3** メッセージテンプレート（顧客情報を自動挿入） |
| キャスト | `/cast/ruri-mama` | **C-4** さくらママ AI チャット（段階的ヒアリング） |
| 店舗 | `/store` | ハブ画面 |
| 店舗 | `/store/customers/new` | **S-1** 顧客登録 |
| 店舗 | `/store/visits/new` | **S-2** 来店登録（テーブル + 顧客検索 + 指名トグル） |
| 店舗 | `/store/bottles/new` | **S-3** ボトル登録 |
| 店舗 | `/store/dashboard` | **S-4** 効果ダッシュボード |
| API | `/api/ruri-mama` | Claude 呼出し（キー未設定時はスタブ） |

---

## 3分デモシナリオ

人に見せる時のおすすめフローです。

### 【前半】キャスト側の価値提案
1. `/` → **「キャスト（あかり）」** を選択
2. `/cast/home` で画面上部を見せる
   - **指名18本・リピート率72%・要フォロー3人** のサマリ
   - アメジスト色の **「さくらママに相談」** カード
   - 今日のフォロー対象3人（渡辺=誕生日、田中=間隔空き、高橋=指名化チャンス）
3. **田中太郎** のカードをタップ → `/cast/customers/cust1`
   - ベージュの **「店舗からの共有情報」(閲覧のみ)**
   - ピンク破線の **「個人メモ」(編集OK)** を「編集する」→ 書き換え → 「保存」
4. **「テンプレートで連絡」** をタップ → `/cast/templates?customerId=cust1`
   - 田中太郎が自動選択、お礼テンプレートに **「{姓}」「{前回の話題}」** が埋まっている
   - **「コピーしてLINEへ」** → コピー完了
5. 下タブで **「さくらママ」** → `/cast/ruri-mama`
   - 顧客を田中太郎に切替、「お礼のLINEを送りたい」と入力
   - 3問のチップ **（お礼 → 盛り上がった → 親しみやすく）** をタップ
   - さくらママが **アドバイス + 具体的な文面例 + なぜ効くか** の3点セットで回答

### 【後半】店舗側の入力フロー
6. 下タブで **「切替」** → `/`
7. **「店舗スタッフ」** を選択 → `/store` ハブ
8. **顧客登録** → 「山田 次郎」を追加、担当=あかり
9. **来店登録** → 山田さんを検索で選択 (自動で担当=あかり) → T3 → 指名あり → 通知
10. **ボトル登録** → 響21年を山田さんに20杯 → 登録
11. **効果ダッシュボード** でトレンドと各キャスト成績を見せる
12. 下タブで切替 → キャスト → `/cast/home` に戻ると **「高橋誠」の隣に「山田 次郎」が指名化チャンスで追加されている**

**「店舗が入力したデータが、即座にキャスト側画面で活用される」**ことがこのシナリオの肝です。

---

## 公開して人に見せる（Vercel デプロイ）

もっとも簡単なのは Vercel の GitHub 連携です。

1. https://vercel.com/new にアクセス
2. GitHub を連携して `tonotecnolife1/sharebottle` をインポート
3. ブランチを `claude/nightos-mvp-development-nQHc4` に変更
4. Environment Variables（**任意**、設定しなくても動きます）:
   - `ANTHROPIC_API_KEY` — 本物のさくらママ応答が欲しい時
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — DB 接続する時
5. Deploy → `https://nightos-xxx.vercel.app` が発行されます

CLI で上げたい場合は:

```bash
npx vercel@latest            # 初回ログイン
npx vercel@latest --prod     # 本番デプロイ
```

---

## 本物のさくらママ (Claude API) を有効にする

```bash
cp .env.example .env.local
# .env.local を開いて ANTHROPIC_API_KEY=sk-ant-... を設定
npm run dev
```

モデルは `claude-haiku-4-5-20251001`（コスパ重視。約 $0.005/回）、システムプロンプトは
`features/ruri-mama/data/system-prompt.ts` にあります。  
API キーが無効・通信失敗時はスタブ応答に自動フォールバックします。

---

## Supabase 実接続モード（任意）

モックはプロセス再起動で消えます。永続化したい時のみ:

```bash
# Supabase CLI: https://supabase.com/docs/guides/cli
supabase start
# 表示された anon key と URL を .env.local に書く
supabase db reset   # 002_nightos_schema.sql + seed_nightos.sql を適用
npm run dev
```

現時点では `lib/nightos/supabase-queries.ts` 内のクエリはモックにフォールバックする pass-through 実装です（スキーマと seed は完成）。本物のクエリの実装は次の PR 予定。

---

## 技術スタック

- Next.js 14 (App Router) + TypeScript strict
- Tailwind CSS（NIGHTOS用 light palette: pearl / champagne / rose-gold / amethyst / blush）
- Noto Sans JP + Cormorant Garamond（`<link>` でランタイムロード）
- Supabase (Auth / Postgres) — PR-1 でスキーマ定義、PR-2+ で実接続
- Anthropic Claude API (`claude-haiku-4-5-20251001`, さくらママペルソナ)
- Lucide React（アイコン）

---

## ディレクトリ構成

```
app/
  page.tsx                 ロール選択
  cast/
    layout.tsx             CastTabBar 付きシェル
    home/                  C-1
    customers/[id]/        C-2
    templates/             C-3
    ruri-mama/             C-4
  store/
    layout.tsx             StoreTabBar 付きシェル
    page.tsx               ハブ
    customers/new/         S-1
    visits/new/            S-2
    bottles/new/           S-3
    dashboard/             S-4
  api/
    ruri-mama/route.ts     Claude 呼出し（スタブ fallback）

components/
  nightos/                 NIGHTOS 用 light-mode UI kit
  ui/, shared/             （旧 SHAREBOTTLE 由来・未使用）

features/
  cast-home/               C-1
  customer-card/           C-2
  templates/               C-3
  ruri-mama/               C-4
  store-dashboard/         S-4
  customer-registration/   S-1
  visit-registration/      S-2
  bottle-registration/     S-3

lib/nightos/
  constants.ts             CURRENT_CAST_ID, RURI_MAMA_MODEL など
  mock-data.ts             キャスト側シード（casts, customers, bottles, visits, memos）
  store-mock-data.ts       店舗側シード（tables, brands, trends, follow rates）
  supabase-queries.ts      DB / mock fallback、mutations
  role-store.ts            localStorage ロール切替
  intent-detector.ts       ヒアリングフロー分岐

types/nightos.ts           全ドメイン型

supabase/
  migrations/002_nightos_schema.sql
  seed_nightos.sql

_archive/                  旧 SHAREBOTTLE 実装（tsconfig exclude 済み）
```

---

## 設計方針

- **モックフォールバック**: Supabase 未接続・API キー未設定でも全画面動作
- **Server Component 優先**: ルート層は非同期 RSC、インタラクティブ部分のみ Client
- **Server Actions**: フォーム送信はすべて Server Actions + `useTransition` + `revalidatePath`
- **feature-based 構造**: 画面単位でコンポーネント・データ・アクションをまとめる
- **段階的ヒアリング**: クライアント側ステートマシン。Claude 呼出しは最終ステップで 1 回のみ
- **フォロー対象の自動選定**: 純関数（`features/cast-home/data/follow-selector.ts`）で決定的に計算
- **mock ↔ DB 分岐は query 境界**: `lib/nightos/supabase-queries.ts` の各関数の冒頭で env var を確認し、未設定ならモック実装を返す（client factory は env 必須なので先にチェックする）

---

## 現状のスコープと TODO

**PR-1 〜 PR-3 で完了:**
- 全8画面 + API ルート + UI kit + スキーマ + シード
- Server Actions によるモック書き込み（in-memory upsert）
- Claude API 呼出し + スタブ fallback

**今後のイテレーション候補:**
- `lib/nightos/supabase-queries.ts` の Supabase 実クエリ実装
- Supabase Realtime でキャスト画面の即時更新
- Supabase Auth（現状は localStorage のみ）
- `ai_chats` / `follow_logs` の永続化
- PWA 化 / プッシュ通知
- さくらママの system prompt チューニングと応答品質評価
