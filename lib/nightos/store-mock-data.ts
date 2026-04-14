// ═══════════════ Store-side static masters + trend fixtures ═══════════════

export const MOCK_TABLES: { id: string; label: string; seats: number }[] = [
  { id: "T1", label: "T1", seats: 4 },
  { id: "T2", label: "T2", seats: 4 },
  { id: "T3", label: "T3", seats: 6 },
  { id: "T4", label: "T4", seats: 6 },
  { id: "T5", label: "T5", seats: 4 },
  { id: "T6", label: "T6", seats: 4 },
  { id: "VIP1", label: "VIP1", seats: 8 },
  { id: "VIP2", label: "VIP2", seats: 8 },
  { id: "C1", label: "カウンター1", seats: 2 },
  { id: "C2", label: "カウンター2", seats: 2 },
];

/**
 * Brand master. Real deployment pulls from a `bottle_masters` table — for
 * MVP this is a static list the store can pick from. New brands can be
 * typed free-form via the "新規追加" option in the form.
 */
// Club mode: ウイスキー＆焼酎がメイン（シャンパンはボトルキープ対象外）
export const MOCK_BRANDS_CLUB: { category: string; brands: string[] }[] = [
  {
    category: "ウイスキー（国産）",
    brands: ["山崎12年", "山崎18年", "白州12年", "白州18年", "響17年", "響21年", "響 JH", "竹鶴17年"],
  },
  {
    category: "ウイスキー（海外）",
    brands: ["マッカラン12年", "マッカラン18年", "グレンフィディック12年", "グレンリベット12年", "ジャックダニエル"],
  },
  {
    category: "焼酎",
    brands: ["森伊蔵", "魔王", "村尾", "佐藤（黒）", "佐藤（白）", "百年の孤独"],
  },
];

export const MOCK_BRANDS: string[] = MOCK_BRANDS_CLUB.flatMap((c) => c.brands);

/**
 * 過去14日分のダミー指名数トレンド（あかり・ゆき）。
 * 実装上は `nightos_casts` + `visits` から計算するところ、MVP では固定配列。
 */
export interface TrendPoint {
  date: string; // YYYY-MM-DD
  cast1: number; // あかり
  cast2: number; // ゆき（姉さん）
}

export const MOCK_NOMINATION_TREND: TrendPoint[] = [
  { date: "2026-03-06", cast1: 2, cast2: 1 },
  { date: "2026-03-07", cast1: 3, cast2: 2 },
  { date: "2026-03-08", cast1: 1, cast2: 2 },
  { date: "2026-03-09", cast1: 2, cast2: 0 },
  { date: "2026-03-10", cast1: 0, cast2: 1 },
  { date: "2026-03-11", cast1: 2, cast2: 2 },
  { date: "2026-03-12", cast1: 3, cast2: 3 },
  { date: "2026-03-13", cast1: 2, cast2: 1 },
  { date: "2026-03-14", cast1: 1, cast2: 2 },
  { date: "2026-03-15", cast1: 0, cast2: 0 },
  { date: "2026-03-16", cast1: 2, cast2: 1 },
  { date: "2026-03-17", cast1: 1, cast2: 1 },
  { date: "2026-03-18", cast1: 3, cast2: 2 },
  { date: "2026-03-19", cast1: 2, cast2: 3 },
];

export interface RepeatPoint {
  week: string; // e.g. "w1"
  label: string; // e.g. "1週目"
  cast1: number; // あかり 0..1
  cast2: number; // ゆき 0..1
}

export const MOCK_REPEAT_TREND: RepeatPoint[] = [
  { week: "w1", label: "1週目", cast1: 0.58, cast2: 0.52 },
  { week: "w2", label: "2週目", cast1: 0.62, cast2: 0.58 },
  { week: "w3", label: "3週目", cast1: 0.66, cast2: 0.6 },
  { week: "w4", label: "4週目", cast1: 0.72, cast2: 0.65 },
];

/**
 * 連絡達成率（follow_logs / 連絡が必要な件数）の直近スナップショット。
 * MVP では固定値。
 */
export const MOCK_FOLLOW_RATE: Record<string, number> = {
  cast1: 0.82, // あかり
  cast_oneesan2: 0.88, // ゆき
  cast_oneesan3: 0.81, // もえ
  cast_oneesan4: 0.90, // れな
  cast_oneesan5: 0.72, // ちひろ
  cast_oneesan6: 0.78, // かなで
  cast_help2: 0.58, // あやな
  cast_help3: 0.62, // みお
  cast_help4: 0.54, // さら
};
