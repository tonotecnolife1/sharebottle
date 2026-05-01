# NIGHTOS UI Design Guidelines

「AIが量産したテンプレ」感を抜くための実装ルール。新しい画面・既存の改修いずれもこのドキュメントに従う。曖昧な議論を避けるため、**やる/やらない**を二者択一で書く。

---

## 0. ゴール

「自分たちのプロダクトとして長く使いたい」と思える、生活感のあるUI。SaaSランディングっぽい飾り・AIテンプレートっぽい記号を排除し、**用件と読みやすさだけ**を残す。

判定基準：

- スクリーンショットを見て「何のサービスか／何ができるか」が3秒で分かる
- 装飾を全部消しても用件が成立する。装飾は**意味のある強調にだけ**使う
- 同じ画面に**3つ以上の主張色**を置かない

---

## 1. やめるパターン（典型的な「AIっぽさ」）

| # | NG | 理由 |
|---|----|------|
| 1 | `Sparkles` ✨ アイコン＋「MVP」「NEW」バッジを画面トップに置く | テンプレ感の最大要因 |
| 2 | `font-display`（Cormorant Garamond）でブランド名をでかく中央配置 | スタートアップHP感 |
| 3 | `rose-gradient` / `ruri-gradient` で塗ったアイコン円・ボタン | グラデは原則使わない |
| 4 | `tracking-wider uppercase` の英語ラベル（`For Cast`, `FOR OWNER`, `MVP` 等） | 装飾用大文字英語は廃止 |
| 5 | 「○○のワークスペース」「あなたの夜を支える」等の抽象タグライン | 機能名を直接書く |
| 6 | `shadow-glow-amethyst` / `shadow-glow-rose` などの発光シャドウ | やわらかい影だけに留める |
| 7 | `animate-fade-in` を全コンポーネントに付ける | 入退場アニメは必要な所だけ |
| 8 | パステル4色（pearl / champagne / rose / ruri）を1画面で全部使う | 主張色は **1つ** |

---

## 2. 採用するパターン

### 2.1 カラー

- **背景**: `pearl`（#faf7f2）または `pearl-warm`（#fdfcf9）。それ以外は使わない
- **テキスト**: `ink` / `ink-secondary` / `ink-muted` のグレースケール3段
- **アクセント1色**: `amethyst-dark`（#6e4f8f）。**主要な操作1つにつき1箇所だけ**
- **危険・警告**: `rose`（既存の赤）。エラー文字とエラー枠のみ
- **その他のパステル（champagne, roseGold, blush）はデコ目的では使わない**。意味のあるデータ（ロール別、ステータス別）にだけ使う

### 2.2 タイポ

- フォントは **Noto Sans JP 1種類** に統一。`font-display`（セリフ）は使わない
- ヒエラルキー: 画面タイトル `text-display-sm` (1.25rem 600) → セクション見出し `text-body-md font-medium` → 本文 `text-body-sm` → 補足 `text-[11px] text-ink-muted`
- **大文字英語ラベルは禁止**。日本語で具体的に書く
- ブランド名 "NIGHTOS" を**中央で巨大に表示しない**。ヘッダー左上にロゴ程度、または完全省略

### 2.3 コンポーネント

- **Button**:
  - 主要操作 = `bg-ink text-pearl`（黒に近いインク色）。グラデ廃止
  - 副次操作 = `bg-pearl-soft text-ink border border-ink/10`
  - 文字操作 = テキストリンク `text-amethyst-dark underline-offset-2 hover:underline`
- **Card**:
  - 既存の `Card` でOK。ただし枠線・影は既定値を弱める
  - 装飾用に色付き枠 (`!border-amethyst-border` など) を付けるのを禁止。色は中身で出す
- **Icon**:
  - lucide のまま使うが、**円の中に配置して塗りつぶさない**
  - 行頭の小アイコンに留める（16px前後）
  - サイズ32px以上の装飾円アイコンは廃止

### 2.4 レイアウト

- 認証系のセンター配置: `max-w-sm`（旧 `max-w-md` から圧縮）
- 縦余白: `gap-4` 基調（旧 `gap-6` / `gap-8` を詰める）
- カード内 padding: `p-4`（旧 `p-5` 圧縮）
- セクション間の区切りは `border-t border-ink/5` の細線。シャドウやカードを多重に重ねない

### 2.5 コピー

- 「ようこそ」「あなたの〜」等の抽象的歓迎文は書かない
- ボタン文言は動詞で短く: 「ログイン」「登録する」「デモを試す」「店舗を作成」
- 「※」「→」のような記号で説明を補う場合は1行まで
- エラー: 「○○できませんでした: 詳細」のフォーマット。技術用語は出さない

---

## 3. 適用順

1. ✅ 認証/オンボーディング (`app/auth/login`, `app/auth/signup`, `app/onboarding`)
2. ⏳ ロール選択 (`app/role-selector.tsx`)
3. ⏳ Cast ホーム (`app/cast/home`)
4. ⏳ Store ダッシュボード (`app/store/dashboard`)
5. ⏳ Customer ホーム (`app/customer/home`)

優先度の理由: **新規ユーザーが最初に見る画面**から直していく。既存ユーザーが日常使う画面（cast/store/customer）は最後。

---

## 4. レビューチェックリスト

PR を出す/マージする前に毎回確認：

- [ ] `Sparkles` / `MVP` バッジが入っていない
- [ ] `font-display` を使っていない
- [ ] `rose-gradient` / `ruri-gradient` / `gradient-amethyst` を使っていない
- [ ] `tracking-wider uppercase` の装飾大文字英語が無い
- [ ] アクセント色（`amethyst-dark`）を3箇所以上で使っていない
- [ ] 1画面で `shadow-glow-*` を使っていない
- [ ] `animate-fade-in` を装飾目的で付けていない
- [ ] コピーが具体的（抽象タグラインが無い）

---

## 5. 例外

このルールから外したい場合は、**外す理由**をPR本文に1行書く。例: 「ロール選択画面はサービス紹介を兼ねるので display 字体を残す」。
