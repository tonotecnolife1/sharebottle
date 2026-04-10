# NIGHTOS

夜のお店（キャバクラ・ラウンジ・クラブ）向けワークスペースの検証版 MVP。

> 「店舗が入力、キャストが活用」のデータフロー設計。  
> ・店舗向け: これをキャストに使わせると、売上が上がる  
> ・キャスト向け: これを使うと、楽して稼げる

## このイテレーションで実装済み

| 画面 | パス | 内容 |
|------|------|------|
| ロール選択 | `/` | 店舗スタッフ / キャスト（あかり）の切替 |
| C-1 キャストホーム | `/cast/home` | 指名・リピート率・要フォロー数、瑠璃ママ導線、フォロー対象リスト |
| C-4 瑠璃ママ AI チャット | `/cast/ruri-mama` | 顧客コンテキスト付き、段階的ヒアリング、フィードバック |
| 店舗プレースホルダ | `/store` | "準備中" |

**次のイテレーション:** C-2 カルテ / C-3 テンプレート / 店舗側 S-1..S-4 / `ai_chats` 永続化 / 本番 Auth。

## セットアップ

### 1. モードなし（モックデータ + スタブ瑠璃ママ）

```bash
npm install
npm run dev
```

http://localhost:3000 にアクセス → 「キャスト（あかり）」を選択 → 即座に動作します。  
`ANTHROPIC_API_KEY` が未設定の場合、瑠璃ママはペルソナ準拠のスタブ応答を返します。

### 2. 本物の瑠璃ママ (Claude) を有効にする

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

再起動すると `/api/ruri-mama` が `claude-sonnet-4-6` を呼び出します。  
API キーが無効・通信失敗時はスタブ応答へ自動フォールバックします。

### 3. Supabase モード（任意）

```bash
cp .env.local.example .env.local  # もしあれば
supabase start
# NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を .env.local に設定
supabase db reset  # 002_nightos_schema.sql + seed_nightos.sql を適用
npm run dev
```

環境変数が検出されるとクエリ層は自動的に DB モードに切り替わります（PR-1 時点ではまだモックへフォールバックする pass-through 実装）。

## 技術スタック

- Next.js 14 (App Router) + TypeScript strict
- Tailwind CSS（NIGHTOS 用 light palette: pearl / champagne / rose-gold / amethyst）
- Noto Sans JP + Cormorant Garamond
- Supabase (Auth / Postgres) — PR-1 ではスキーマ定義まで
- Anthropic Claude API (`claude-sonnet-4-6`, 瑠璃ママペルソナ)

## ディレクトリ構成

```
app/
  page.tsx               # ロール選択
  layout.tsx             # Noto Sans JP + Cormorant + light theme
  cast/
    layout.tsx
    home/page.tsx        # C-1
    ruri-mama/page.tsx   # C-4
  store/page.tsx         # 店舗側プレースホルダ
  api/
    ruri-mama/route.ts   # Claude 呼出し（API キー未設定時はスタブ応答）
components/
  nightos/               # NIGHTOS 用 light-mode UI kit
  ui/, shared/           # （旧 SHAREBOTTLE 由来・NIGHTOS では未使用）
features/
  cast-home/             # C-1 コンポーネントとフォロー選定ロジック
  ruri-mama/             # C-4 チャット UI + システムプロンプト + スタブ応答
lib/
  nightos/
    constants.ts         # CURRENT_CAST_ID, RURI_MAMA_MODEL など
    mock-data.ts         # SPEC のシードデータ
    supabase-queries.ts  # DB / モック fallback をここで判定
    role-store.ts        # localStorage ロール切替
    intent-detector.ts   # キーワードベースのヒアリング分岐
  supabase/              # client.ts / server.ts（既存をそのまま再利用）
types/
  nightos.ts             # NIGHTOS ドメイン型
supabase/
  migrations/
    002_nightos_schema.sql
  seed_nightos.sql
_archive/                # 旧 SHAREBOTTLE 実装（tsconfig exclude 済み）
```

## 動作確認

1. `npm install && npm run dev`
2. http://localhost:3000 → 「キャスト（あかり）」を選択
3. C-1 ホームで以下を確認:
   - 指名 18本 / リピート率 72% / 要フォロー 3人
   - 瑠璃ママ導線カード（amethyst グラデーション）
   - フォロー対象: 渡辺浩二（誕生日間近）、田中太郎（来店間隔空き）、高橋誠（指名化チャンス）
4. 「瑠璃ママに相談する」→ C-4 チャット
5. 顧客コンテキストで田中太郎を選択 → 「お礼のLINEを送りたい」と送信
6. チップで「お礼」→「盛り上がった」→「親しみやすく」を順にタップ
7. 瑠璃ママから返信（アドバイス + 文面例 + なぜ効くか の 3点セット）
8. 参考になった / ならなかった のボタンが表示される

## 設計方針

- **モックフォールバック**: Supabase 未接続・API キー未設定でも全画面動作
- **Server Component 優先**: ルート層は非同期 RSC、インタラクティブ部分のみ Client
- **feature-based 構造**: 画面単位でコンポーネント・データ・アクションをまとめる
- **段階的ヒアリング**: クライアント側ステートマシン。Claude 呼出しは最終ステップで 1 回のみ
- **フォロー対象の自動選定**: 純関数（`features/cast-home/data/follow-selector.ts`）で決定的に計算
