# NIGHTOS 本番リリース 残タスク

実装/コードレベルで本番化に必要なタスクを優先度別にまとめる。
（UI ブラッシュアップは別途）

凡例: 🔴 ブロッカー / 🟡 必須 / 🟢 推奨 / 🔵 運用

---

## 🔴 ブロッカー — これがないと本番デプロイ不可

### B1. Supabase スキーマを本番 DB に適用
`supabase/migrations/` の 002〜006 を本番プロジェクトの SQL Editor で順次実行。
特に **006 は前回 fix で追加**したもので、これを当てないと新規登録の店舗作成が落ちる。

- [ ] 002_nightos_schema.sql
- [ ] 003_schema_additions.sql（`auth_user_id` 等を追加）
- [ ] 004_team_chat.sql
- [ ] 005_customer_region.sql
- [ ] 006_signup_rls_fix.sql（**最重要 — RLS off + grant**）
- [ ] migration 適用後、`select * from nightos_casts limit 1` 等で各テーブル疎通確認

### B2. 本番環境変数を Vercel Production に設定
`.env.example` の通り。Production と Preview の両方で同じ値。

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`（**サーバーサイドのみ**。Public 設定にしないこと）
- [ ] `ANTHROPIC_API_KEY`（さくらママ AI / 名刺OCR / メモ抽出が依存）
- [ ] `NIGHTOS_DISABLE_MOCK_AUTH=true`（**未設定だとデモログインが本番で生きてしまう**）

### B3. デモ専用エンドポイントを本番から遮断
**現状リスク**: `/setup` ページと `/api/setup-auth` が `secret=nightos-setup-2026` という**ハードコード文字列**でのみ保護されている。URL を知る人なら誰でも `nightos2026` というパスワードで `cast1〜cast_oneesan4` のテストユーザーを生成できる。

- [ ] `app/api/setup-auth/route.ts` に `if (process.env.NODE_ENV === "production") return 404;` または **強い env secret 必須**化
- [ ] `app/api/setup/route.ts` も同様
- [ ] `app/setup/page.tsx` を本番ビルドで除外（または env ガード）
- [ ] 同梱の `mockCasts` import を本番 bundle に入れない方針を決める（dynamic import + env 分岐）

### B4. 主要機能の Supabase 永続化が未実装
**現状**: 40 個の query 関数のうち **9 個が mock 専用**。本番でも in-memory mock data に書き、サーバー再起動・別インスタンスで消える。複数ユーザー同士でデータが混線する。

mock 専用のまま残っている機能（要 real impl 追加）:

- [ ] `getCustomerCoupons`（来店客のクーポン一覧）
- [ ] `getCustomerStoreOverviews`（来店客 home の店舗別サマリ）
- [ ] `getCustomerBottleViews`（来店客のキープボトル一覧）
- [ ] `sendCastMessage` / `getUnreadCastMessages` / `markCastMessageRead`（店舗→キャスト連絡）
- [ ] `sendCastRequest` / `getUnresolvedCastRequests` / `resolveCastRequest`（キャスト→店舗依頼）
- [ ] `getDouhanSummary`（同伴サマリ）

→ 各機能について `lib/nightos/supabase-real.ts` に `〜Real` を実装、`supabase-queries.ts` で `withFallback` に組み込む。
→ 必要なテーブルが未作成なら migration 007 で追加。

### B5. RLS 方針の確定
`006_signup_rls_fix.sql` は MVP 高速化のため **RLS を off** にしている。
本番でこれを許容するか、ユーザーごとにアクセス制限を入れるかを決定。

- [ ] 方針: RLS off で運用（Service Role を Server Action 内でのみ使う前提）→ もしくは
- [ ] 方針: RLS on + policy 整備（`006` の commented-out ブロックがベース）
- [ ] 決定後、それに合わせた policy を migration 007 で追加 / 確認

### B6. デモ tenancy が本番に紛れない仕組み
`DEMO_STORE_IDS = ["store1"]` `DEMO_CAST_IDS = [cast1, cast_oneesan2 ...]` が
ハードコードされている。デモ用ストア／キャストが本番 DB にも存在することになり、
検索・集計時に混入する可能性。

- [ ] 本番 DB には **デモ用シードを入れない**ことを決定（推奨）
- [ ] `seed_nightos.sql` を本番では実行しない
- [ ] フロントの「デモを試す」ボタンは `NIGHTOS_DISABLE_MOCK_AUTH=true` で完全非表示になることを E2E で確認

---

## 🟡 必須 — リリース当日までに

### M1. 認証フローの完全動作確認
- [ ] Supabase Auth の **Email Confirmation 設定**を決定（要確認 → 確認メール必須にする / しない）
- [ ] パスワードリセット導線（`/auth/reset-password` 等）— **未実装。要追加**
- [ ] パスワード変更フロー（ログイン後の設定画面）— **未実装**
- [ ] 退会／アカウント削除フロー — **未実装**（個人情報保護法対応のため必要）
- [ ] メールアドレス変更フロー — **未実装**

### M2. 法務ページ
- [ ] プライバシーポリシー（`/privacy`）
- [ ] 利用規約（`/terms`）
- [ ] 特定商取引法表記（有償化する場合）
- [ ] 上記 3 つへのリンクを fooot / signup / onboarding に設置
- [ ] Cookie 同意バナー（必要に応じて）

### M3. エラー追跡 / ログ
- [ ] Sentry もしくは類似サービスの導入（最低 frontend）
- [ ] `app/error.tsx` `app/global-error.tsx` 確認・整備
- [ ] Server Action のエラーログ出力先決定
- [ ] `/api/setup-auth` 等で `console.log` に **平文パスワードを出している箇所**がないか再確認

### M4. AI 機能の本番モード切替
**現状**: `ANTHROPIC_API_KEY` 未設定だと「デモ応答モードです」というスタブ文言が UI に出る。

- [ ] `ANTHROPIC_API_KEY` を本番に設定
- [ ] レート制限 / コスト上限の設定（Anthropic 側 + アプリ内）
- [ ] AI 応答の保存ポリシー（学習に使われない設定／監査ログ）

### M5. 本番ドメイン & SSL
- [ ] 独自ドメイン取得・Vercel に紐付け
- [ ] `metadata.metadataBase` を本番 URL に設定（`app/layout.tsx`）
- [ ] OpenGraph 画像 / favicon の本番版
- [ ] Manifest（`/manifest.json`）の `start_url`、`name`、`short_name` を本番値に

### M6. データ取り扱い
- [ ] 本番 DB の **バックアップ自動化**（Supabase Pro なら point-in-time recovery）
- [ ] 顧客個人情報（氏名・誕生日・職業・LINE スクショ等）の保管方針
- [ ] スクショ画像のストレージ場所（Supabase Storage）と保持期間ポリシー

---

## 🟢 推奨 — リリース直後〜1ヶ月内

### R1. UI ブラッシュアップ（design.md §7 残）
※ 後でやる宣言済み。残スコープ:
- [ ] cast home の SummaryCards / DouhanTracker / FollowTargetList サブコンポーネント
- [ ] store dashboard / funnel / douhan-pace
- [ ] ruri-mama 画面 / customer-card 詳細
- [ ] mama 系画面群

### R2. テスト
- [ ] E2E テスト（Playwright が demo/ にあるので拡張）
  - [ ] 新規登録 → onboarding → cast home の通り
  - [ ] 店舗作成 → 顧客登録 → 来店登録
  - [ ] デモログイン全 4 役割
- [ ] 既存 vitest（77 件）のカバレッジ確認

### R3. オンボーディング UX
- [ ] サインアップ後の最初のチュートリアル
- [ ] サンプルデータ生成オプション（個人 demo 用）
- [ ] 各画面のヘルプテキスト / FAQ

### R4. パフォーマンス
- [ ] Lighthouse / Web Vitals で計測
- [ ] 画像最適化（next/image）
- [ ] バンドルサイズ確認（mockCasts / mock-data.ts は本番不要 → tree-shake）

### R5. 機能完備
- [ ] 通知（プッシュ / メール）
- [ ] PWA インストール導線
- [ ] CSV エクスポート（顧客一覧、来店履歴等）

---

## 🔵 運用 — リリース後継続

### O1. 監視・アラート
- [ ] uptime monitor（vercel cron 等）
- [ ] Anthropic / Supabase の月次コスト追跡
- [ ] エラーレート閾値アラート

### O2. インシデント対応
- [ ] 障害時の連絡先 / 切り戻し手順
- [ ] DB 破損時のリストア runbook
- [ ] セキュリティ脆弱性開示窓口

### O3. ドキュメント
- [ ] CLAUDE.md / README に「本番運用」セクション追加
- [ ] migration 適用手順を `supabase/README.md` 等に
- [ ] 環境変数表のメンテ

---

## まとめ

最低限、🔴 ブロッカー 6 件 + 🟡 必須 6 件の **12 件** が片付かないと本番公開すべきでない。

特に優先度トップ:
1. **B3 デモエンドポイントの遮断** — セキュリティ事故になる
2. **B4 mock 専用機能の永続化** — クーポン・店舗連絡が失われる
3. **M1 退会フロー** — 個人情報保護法対応
4. **M2 法務ページ** — 公開時に揃っていないと炎上要因

これらは完了の見通しが立つまで「クローズドβ」運用を強く推奨。
