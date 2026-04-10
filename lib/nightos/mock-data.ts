import type {
  Bottle,
  Cast,
  CastMemo,
  Customer,
  Store,
  Visit,
} from "@/types/nightos";
import { CURRENT_STORE_ID } from "./constants";

// Fixed "today" for deterministic follow-target selection in mock mode.
// Matches the spec's reference date (last-visit dates are in early March).
export const MOCK_TODAY = new Date("2026-03-19T00:00:00+09:00");

export const mockStores: Store[] = [
  { id: CURRENT_STORE_ID, name: "CLUB NIGHTOS 銀座本店" },
];

export const mockCasts: Cast[] = [
  {
    id: "cast1",
    store_id: CURRENT_STORE_ID,
    name: "あかり",
    nomination_count: 18,
    monthly_sales: 1_840_000,
    repeat_rate: 0.72,
  },
  {
    id: "cast2",
    store_id: CURRENT_STORE_ID,
    name: "みさき",
    nomination_count: 14,
    monthly_sales: 1_420_000,
    repeat_rate: 0.65,
  },
];

export const mockCustomers: Customer[] = [
  {
    id: "cust1",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "田中 太郎",
    birthday: "1975-09-12",
    job: "IT企業経営",
    favorite_drink: "山崎12年ロック",
    category: "vip",
    store_memo: "息子さんの大学受験の話題はNG（落ちた）",
    created_at: "2025-04-01T19:00:00+09:00",
  },
  {
    id: "cust2",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "高橋 誠",
    birthday: "1988-06-03",
    job: "金融ディーラー",
    favorite_drink: "白州ハイボール",
    category: "new",
    store_memo: null,
    created_at: "2026-02-20T20:00:00+09:00",
  },
  {
    id: "cust3",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "渡辺 浩二",
    birthday: "1968-03-25",
    job: "不動産会社役員",
    favorite_drink: "マッカラン12年ロック",
    category: "vip",
    store_memo: "有馬記念はお気に入りの話題",
    created_at: "2024-11-10T19:30:00+09:00",
  },
  {
    id: "cust4",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast2",
    name: "佐藤 健一",
    birthday: "1979-11-08",
    job: "広告代理店",
    favorite_drink: "響JH水割り",
    category: "regular",
    store_memo: null,
    created_at: "2025-07-15T20:00:00+09:00",
  },
];

export const mockBottles: Bottle[] = [
  {
    id: "btl1",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust1",
    brand: "山崎12年",
    total_glasses: 20,
    remaining_glasses: 8,
    kept_at: "2026-01-10T20:00:00+09:00",
  },
  {
    id: "btl2",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust3",
    brand: "マッカラン12年",
    total_glasses: 20,
    remaining_glasses: 3,
    kept_at: "2025-12-20T20:30:00+09:00",
  },
  {
    id: "btl3",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust1",
    brand: "白州12年",
    total_glasses: 20,
    remaining_glasses: 6,
    kept_at: "2026-02-01T20:30:00+09:00",
  },
  {
    id: "btl4",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust4",
    brand: "響 JH",
    total_glasses: 20,
    remaining_glasses: 12,
    kept_at: "2026-02-14T20:00:00+09:00",
  },
];

// 来店履歴（フォロー対象判定で使用）
// 田中太郎: 来店12回, 最終 2026-03-07 (12日前 → 要フォロー)
// 高橋 誠: 来店3回, 最終 2026-03-08 (11日前 → 指名化チャンス・新規)
// 渡辺浩二: 来店20回, 最終 2026-02-28 (19日前 → 誕生日3/25間近)
// 佐藤健一: 来店8回, 最終 2026-03-12 (7日前)
export const mockVisits: Visit[] = [
  // 田中太郎 — VIPは毎週ペースで来ていたのが12日空いている → 要フォロー
  ...generateVisitSeries({
    customer_id: "cust1",
    cast_id: "cast1",
    lastVisit: "2026-03-07",
    intervalDays: 7,
    count: 12,
    is_nominated: true,
  }),
  // 高橋誠 — 新規3回
  ...generateVisitSeries({
    customer_id: "cust2",
    cast_id: "cast1",
    lastVisit: "2026-03-08",
    intervalDays: 10,
    count: 3,
    is_nominated: false,
  }),
  // 渡辺浩二 — VIP20回
  ...generateVisitSeries({
    customer_id: "cust3",
    cast_id: "cast1",
    lastVisit: "2026-02-28",
    intervalDays: 9,
    count: 20,
    is_nominated: true,
  }),
  // 佐藤健一 — みさき担当
  ...generateVisitSeries({
    customer_id: "cust4",
    cast_id: "cast2",
    lastVisit: "2026-03-12",
    intervalDays: 12,
    count: 8,
    is_nominated: true,
  }),
];

function generateVisitSeries(opts: {
  customer_id: string;
  cast_id: string;
  lastVisit: string; // YYYY-MM-DD
  intervalDays: number;
  count: number;
  is_nominated: boolean;
}): Visit[] {
  const visits: Visit[] = [];
  const last = new Date(opts.lastVisit + "T20:00:00+09:00");
  for (let i = 0; i < opts.count; i++) {
    const d = new Date(last);
    d.setDate(d.getDate() - i * opts.intervalDays);
    visits.push({
      id: `visit_${opts.customer_id}_${i}`,
      store_id: CURRENT_STORE_ID,
      customer_id: opts.customer_id,
      cast_id: opts.cast_id,
      table_name: i === 0 ? "T3" : null,
      is_nominated: opts.is_nominated,
      visited_at: d.toISOString(),
    });
  }
  return visits;
}

export const mockCastMemos: CastMemo[] = [
  {
    id: "memo1",
    customer_id: "cust1",
    cast_id: "cast1",
    last_topic: "4月のゴルフ旅行の計画",
    service_tips:
      "最初は仕事の話から入る。2杯目以降にプライベート。山崎12年ロックが定番。息子さんの受験の話題は避ける（店舗メモ参照）。",
    next_topics: "春のゴルフ旅行の持ち物、新しく開業したクライアント先",
    visit_notes: null,
    updated_at: "2026-03-07T23:30:00+09:00",
  },
  {
    id: "memo2",
    customer_id: "cust2",
    cast_id: "cast1",
    last_topic: "通い始めたジムのパーソナルトレーナーが厳しい",
    service_tips: "ボトル提案はまだ早い。まず2〜3回指名を取りに行く。",
    next_topics: "トレーニングの進捗、ボディメイク。",
    visit_notes: null,
    updated_at: "2026-03-08T23:45:00+09:00",
  },
  {
    id: "memo3",
    customer_id: "cust3",
    cast_id: "cast1",
    last_topic: "有馬記念でドウデュースの話",
    service_tips:
      "競馬と不動産の話がツボ。マッカラン12年を切らさないように店舗に共有。",
    next_topics: "春のGIシリーズ、桜花賞の予想。",
    visit_notes: null,
    updated_at: "2026-02-28T23:00:00+09:00",
  },
];
