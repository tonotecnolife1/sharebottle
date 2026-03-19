# SHAREBOTTLE

夜のお店（スナック・ラウンジ・クラブ等）で、ユーザーが自分のキープボトルを管理し、シェア利用で収益を得られるプラットフォームのMVP。

## セットアップ

### 1. Supabase なしで動かす場合（モックデータ）

```bash
npm install
npm run dev
```

http://localhost:3000 で全画面がモックデータで動作します。
認証なしで全ページにアクセスできます。

### 2. Supabase ありで動かす場合

```bash
# Supabase CLI が必要
# https://supabase.com/docs/guides/cli

# 環境変数を設定
cp .env.local.example .env.local

# Supabase ローカル起動
supabase start

# 表示される値を .env.local に設定:
# NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<表示されたanon key>

# DB リセット（migration + seed を実行）
supabase db reset

# 開発サーバー起動
npm install
npm run dev
```

### デモアカウント

| ユーザー | メール | パスワード |
|----------|--------|-----------|
| 田中 太郎（メイン） | tanaka@example.com | password123 |
| 佐藤 花子 | sato@example.com | password123 |

## 画面一覧

| パス | 画面 | 認証 |
|------|------|------|
| `/` | ホーム（ボトルメニュー） | 不要 |
| `/bottle/[id]` | ボトル詳細 | 不要 |
| `/login` | ログイン | 不要 |
| `/my-bottles` | マイボトル一覧 | 必要 |
| `/revenue` | 収益管理 | 必要 |
| `/my-page` | マイページ | 必要 |

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres)
- Lucide React (アイコン)

## ディレクトリ構成

```
app/                    # ページ（Route Groups で認証要否を分離）
  (public)/             # 未ログインでもアクセス可
  (app)/                # ログイン必須
  (auth)/               # 認証画面（タブバーなし）
components/
  ui/                   # 汎用UIコンポーネント
  shared/               # アプリ固有の共通コンポーネント
features/               # 画面ごとのコンポーネント・データ・アクション
  home/
  bottle-detail/
  my-bottles/
  revenue/
  my-page/
  auth/
lib/
  supabase/             # Supabaseクライアント
  utils.ts              # ユーティリティ関数
types/                  # 型定義
supabase/
  migrations/           # DBスキーマ
  seed.sql              # デモデータ
```

## 設計方針

- **モックフォールバック**: Supabase 未接続でもモックデータで全画面が動作
- **Server Component 優先**: データ取得は Server Component で行い、インタラクティブ部分のみ Client Component
- **feature-based 構造**: 画面単位でコンポーネント・データ・アクションをまとめる
- **拡張可能なDB設計**: constraint・index・RLS を初期から設定
