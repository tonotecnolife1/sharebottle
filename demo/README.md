# NIGHTOS デモ録画

自動でアプリを操作して動画 + スクリーンショットを生成します。

## セットアップ（初回のみ）

```bash
npm install -D playwright tsx
npx playwright install chromium
```

## 録画する

### ターミナル1: アプリ起動
```bash
npm run dev
```

### ターミナル2: デモ録画実行
```bash
npx tsx demo/record-demo.ts
```

### Vercel 上のデプロイ済みアプリを録画する場合
```bash
DEMO_URL=https://your-app.vercel.app npx tsx demo/record-demo.ts
```

## 出力

- `demo/output/*.webm` — 画面録画動画
- `demo/output/screenshots/*.png` — 各シーンのスクリーンショット（22枚）

## 動画変換（任意）

```bash
# .webm → .mp4 に変換（SNS/LINE で共有しやすい）
ffmpeg -i demo/output/*.webm -c:v libx264 -crf 23 demo/output/nightos-demo.mp4

# GIF に変換（短いループデモ用）
ffmpeg -i demo/output/*.webm -vf "fps=10,scale=390:-1" demo/output/nightos-demo.gif
```

## デモシナリオ（自動実行される内容）

1. ロール選択画面
2. キャスト（あかり）のホーム画面 — サマリ + 朝のブリーフィング + 今日連絡するお客様
3. 田中太郎の顧客カルテ — 来店履歴、店舗情報、個人メモ、LINE取込
4. テンプレート画面 — 田中さん選択済み、お礼テンプレ
5. さくらママ AI チャット — 選択式フロー → お礼 → 盛り上がった → 親しみやすく → 返答
6. キャスト成績ページ — 目標進捗、トレンド
7. 店舗ハブ — KPI、AI ブリーフィング、連絡機能
8. 店舗ダッシュボード — リスク顧客、カテゴリ構成、トレンド
9. 顧客一覧 — 検索 + 編集
10. ボトル管理 — 残量バー、消費ボタン
11. エンド — ロール選択に戻る

所要時間: 約3分（slowMo=400ms で自然な操作感）
