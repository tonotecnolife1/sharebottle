# 顧客相関マップ & 同伴ペース管理 設計書

## 背景と目的

### 解決したい課題
1. **顧客の繋がり（紹介ネットワーク）が見えない**
   - A顧客が紹介で B・C を連れてきても、その関係が紙や記憶頼り
   - 紹介チェーンが途切れたり、B・Cの担当が曖昧になる
2. **顧客ファネルが数値化されていない**
   - 店舗入力だけの顧客 → 姉さんが付いた顧客 → LINE交換済み顧客の3段階
   - どこで離脱してるかが可視化されない
3. **同伴ペース管理が属人的**
   - 週2回・月7回ノルマの達成状況が日々見えない
   - 月末に気づいた時にはもう遅い
   - 店舗スタッフもキャスト別のペースを把握できていない

### 目指す状態
- 顧客相関図を見れば、誰の紹介チェーンがどう広がっているか一目でわかる
- 店舗・ママ・姉さん・キャストそれぞれの視点で、同伴ペースを週次で把握
- LINE交換のステータス管理が自然にフローに組み込まれている

---

## データモデル

### 1. Customer の拡張

```ts
interface Customer {
  // 既存フィールド...
  id, store_id, cast_id, name, birthday, job,
  favorite_drink, category, store_memo, created_at,

  // 追加フィールド
  /** 紹介してくれた既存顧客の id。null = 自己来店または店舗経由 */
  referred_by_customer_id: string | null;

  /**
   * ファネルステージ:
   * - "store_only": 店舗スタッフが登録しただけ、担当なし
   * - "assigned":   姉さんが担当についた（初回以降）
   * - "line_exchanged": LINE交換済み（能動的フォロー可能）
   */
  funnel_stage: "store_only" | "assigned" | "line_exchanged";

  /** LINE交換した担当キャスト id。funnel_stage = line_exchanged の時のみ */
  line_exchanged_cast_id: string | null;

  /** LINE交換した日時 */
  line_exchanged_at: string | null;
}
```

### 2. CustomerRelation（新テーブル・派生でも可）

Customer 側の `referred_by_customer_id` で十分な情報だが、
紹介ツリーの可視化で使いやすい派生ビュー型を用意:

```ts
interface CustomerReferralNode {
  customer: Customer;
  assignedCast: Cast | null;
  children: CustomerReferralNode[]; // このお客様が紹介した人たち
  depth: number; // root からの深さ
}
```

### 3. 同伴ペース集計

既存の `Douhan[]` をベースに派生:

```ts
interface DouhanPaceStats {
  castId: string;
  castName: string;
  club_role?: "mama" | "oneesan" | "help";

  // 今週（月〜日）
  thisWeekCount: number;
  weekTarget: number; // デフォルト 2

  // 今月
  thisMonthCount: number;
  monthTarget: number; // デフォルト 7

  // ペースアラート
  status: "on_pace" | "behind" | "meeting_risk";
  // - on_pace: 週次も月次も達成ペース
  // - behind: 月初〜中盤で現時点のペースが不足
  // - meeting_risk: 月末時点で7回未達 → ミーティング対象
}
```

---

## UI 仕様

### 【新規】 `/mama/map` — 顧客相関図（ママ/姉さん用）

#### レイアウト
```
[ヘッダー: 顧客相関図]
[フィルタ: 全て / 自分の担当 / 姉さん別]
[検索バー: 顧客名]

[ツリー表示領域]
  田中太郎さま（VIP・あかり担当）
    ├─ 高橋誠さま（新規・あかり担当）🆕
    ├─ 山本隆さま（VIP・ゆき担当）
    │   └─ 鈴木大輔さま（新規・あやな担当）🆕
    └─ 中村慎太郎さま（常連・あかり担当）

  渡辺浩二さま（VIP・ゆき担当） -- 自己来店
    └─ 佐藤健一さま（常連・あやな担当）
```

#### 各ノードの表示
- **顧客名**（さま付け）
- **カテゴリバッジ**（VIP/常連/新規）
- **担当キャスト**（アバター/頭文字）
- **ファネルステージ**（アイコンで表現）:
  - 🏪 = store_only（店舗登録のみ）
  - 👤 = assigned（担当あり）
  - 💬 = line_exchanged（LINE交換済み）
- **紹介実績バッジ**: このお客様が何人紹介したか `→3人紹介`

#### インタラクション
- ノードタップ → 顧客カルテへ遷移
- ピンチズーム対応
- 姉さん別フィルタで特定チームだけの相関図表示

---

### 【新規】 `/store/funnel` — 顧客ファネル（店舗スタッフ用）

```
[全体ファネル]
  店舗登録          48人  ████████████
  担当付き          31人  ████████
  LINE交換済み      22人  ██████
  
  → 担当転換率: 65% / LINE転換率: 71%

[キャスト別ファネル]
  ゆき姉さん    担当15 → LINE 12 (80%)
  あかり姉さん  担当10 → LINE 7  (70%)
  あやなちゃん  担当6  → LINE 3  (50%)  ⚠️要育成

[最近LINE交換]
  ・鈴木さま → あかり姉さん（3/18）
  ・高橋さま → あかり姉さん（3/15）
  ...
```

---

### 【新規】 キャストアプリ: 顧客カードに「LINE交換」ボタン

```
顧客カルテ
───────────
【田中太郎さま】
カテゴリ: VIP / IT企業経営
担当: あかり

[現在のファネルステージ: 👤 担当あり]
[ 💬 LINE交換を記録 ] ← タップで即更新
```

タップ時の動作:
1. Customer.funnel_stage を "line_exchanged" に更新
2. Customer.line_exchanged_cast_id を自分に設定
3. チームチャットの「顧客情報共有」チャンネルに自動通知:
   > 「あかりが田中太郎さまとLINE交換しました 🎉」
4. （姉さんに直接メンションがあると尚良い）

---

### 【新規】 `/mama/map/add-referral` — 紹介関係の登録

既存顧客の詳細画面から「このお客様の紹介で来た方を登録」→
顧客新規登録フォームを `referred_by` プリセットで開く。

---

### 【拡張】 同伴ペース表示

#### キャスト側（既存 `/cast/home` 同伴トラッカー強化）
- 週目標 2回 / 月目標 7回 の **両方を並行表示**
- 月末まで残り日数 + 必要ペース自動計算
- 達成状況を色で表示:
  - 🟢 on_pace
  - 🟡 behind（月初〜中盤で遅れ）
  - 🔴 meeting_risk（月末7回未達濃厚）

#### ママ/姉さん側（`/mama/team` 拡張）
- 各キャストカードに同伴ペースバッジ追加
- 🔴ミーティングリスクの子がいたら一番上に目立つ警告

#### 店舗スタッフ側（新規 `/store/douhan-pace`）
- 全キャスト一覧＋今月の同伴数
- ロールでフィルタ（全て / ママ / 姉さん / キャスト）
- 🔴 meeting_risk の子を店側でも把握
- 月次エクスポート可能（CSV 将来対応）

---

## 実装フェーズ

### Phase 1: データ基盤（本 PR） ✅
- Customer 型拡張
- CustomerReferralNode 派生型
- DouhanPaceStats 型
- モックデータに紹介関係・LINE交換サンプル追加
- `lib/nightos/douhan-pace.ts` ペース計算ユーティリティ
- `lib/nightos/referral-tree.ts` ツリー構築ユーティリティ

### Phase 2: キャスト側UX（次）
- 顧客カルテに「LINE交換」ボタン
- LINE交換時の自動通知（チーム投稿）
- 週次＆月次ペース表示改善

### Phase 3: ママ/姉さん側UX
- `/mama/map` 顧客相関図ページ
- `/mama/team` に同伴ペース警告

### Phase 4: 店舗スタッフ側UX
- `/store/funnel` 顧客ファネル画面
- `/store/douhan-pace` 全キャスト同伴ペース

### Phase 5: 集計・エクスポート
- 月次レポート生成
- Supabase 移行（localStorage から卒業）

---

## API / Supabase スキーマ（将来）

```sql
-- customers テーブルに追加
alter table customers
  add column referred_by_customer_id uuid references customers(id),
  add column funnel_stage text not null default 'store_only'
    check (funnel_stage in ('store_only','assigned','line_exchanged')),
  add column line_exchanged_cast_id uuid references casts(id),
  add column line_exchanged_at timestamptz;

create index customers_referred_by_idx on customers(referred_by_customer_id);
create index customers_funnel_stage_idx on customers(funnel_stage);
```

---

## 未決事項・今後の検討

- **紹介インセンティブ**: 紹介元に何かしらの報酬を与えるか
- **LINE交換の撤回**: ブロックされた場合のステータス戻し機能
- **プライバシー**: 紹介チェーンを全員に公開するか、ママ/姉さんのみか
- **データ移行**: 既存顧客の funnel_stage は初回 "store_only" スタート、以降運用で移行
- **同伴ペースの調整**: 店舗ごとに週目標・月目標を設定可能にするか
