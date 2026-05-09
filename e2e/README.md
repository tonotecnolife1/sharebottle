# NIGHTOS E2E (Playwright)

スモークテスト一式。**Playwright は package.json には入れていない**。
CI / 開発者がローカルで実行するときに以下を入れてください。

```sh
# 一回だけ
npm install -D @playwright/test
npx playwright install chromium
```

## 実行

```sh
# dev サーバを別ターミナルで立ち上げてから
npm run dev

# 別ターミナルで
npx playwright test            # ヘッドレス
npx playwright test --headed   # ブラウザを見る
npx playwright test --ui       # 対話的デバッガ
```

`PLAYWRIGHT_BASE_URL` を設定すれば既存の URL（preview / staging）に
向けて実行できる：

```sh
PLAYWRIGHT_BASE_URL=https://nightos.vercel.app npx playwright test
```

## ファイル構成

| File | カバー範囲 |
|------|------|
| `auth.spec.ts` | ログイン UI / 新規登録フォーム / 法務ページ / デモログイン (顧客 + キャストペルソナ選択) |

## 注意

- デモ (mock-auth) ベースなので **`NIGHTOS_DISABLE_MOCK_AUTH=true` が
  設定された環境では一部テストが落ちます**。本番デプロイの URL に
  対しては実行しない or 別の suite を用意してください。
- 新規登録テストは Supabase Auth に到達しないよう client-side バリ
  デーションのみを検証しています（バックエンド疎通は対象外）。
