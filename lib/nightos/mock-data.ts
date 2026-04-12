import type {
  Bottle,
  Cast,
  CastMemo,
  Customer,
  LineScreenshot,
  Store,
  Visit,
} from "@/types/nightos";
import { CURRENT_STORE_ID } from "./constants";

/**
 * Mutable in-memory list of imported LINE screenshots. Starts empty;
 * grows as the cast uses the import feature in the demo session.
 * Resets on server restart (mock mode only).
 */
export const mockScreenshots: LineScreenshot[] = [];

/**
 * Store → cast messages. Stored in memory, displayed as a banner on
 * the cast home screen.
 */
export interface StoreToCastMessage {
  id: string;
  cast_id: string;
  message: string;
  sent_at: string;
  read: boolean;
}

export const mockCastMessages: StoreToCastMessage[] = [];

/**
 * Cast → store requests. Displayed on the store hub.
 */
export interface CastToStoreRequest {
  id: string;
  cast_id: string;
  cast_name: string;
  message: string;
  sent_at: string;
  resolved: boolean;
}

export const mockCastRequests: CastToStoreRequest[] = [];

// ═══════════════ Customer (来店客) mock data ═══════════════

import type { Coupon } from "@/types/nightos";

export const mockCoupons: Coupon[] = [
  {
    id: "coupon1",
    customer_id: "cust1",
    store_id: "store1",
    store_name: "CLUB NIGHTOS 銀座本店",
    type: "drink",
    title: "ドリンク1杯サービス",
    description: "10回来店達成記念 — お好きなドリンクを1杯プレゼント",
    valid_from: "2026-03-01",
    valid_until: "2026-04-30",
    used_at: null,
    code: "NIGHT-D10",
  },
  {
    id: "coupon2",
    customer_id: "cust1",
    store_id: "store1",
    store_name: "CLUB NIGHTOS 銀座本店",
    type: "birthday",
    title: "バースデーシャンパン 🥂",
    description: "お誕生月限定 — シャンパン1杯プレゼント",
    valid_from: "2026-09-01",
    valid_until: "2026-09-30",
    used_at: null,
    code: "NIGHT-BD26",
  },
  {
    id: "coupon3",
    customer_id: "cust1",
    store_id: "store1",
    store_name: "CLUB NIGHTOS 銀座本店",
    type: "vip",
    title: "VIPラウンジ無料利用",
    description: "VIP会員特典 — VIPルームを無料でご利用いただけます",
    valid_from: "2026-01-01",
    valid_until: "2026-12-31",
    used_at: null,
    code: "NIGHT-VIP",
  },
  {
    id: "coupon4",
    customer_id: "cust1",
    store_id: "store1",
    store_name: "CLUB NIGHTOS 銀座本店",
    type: "discount",
    title: "累計利用感謝 10%OFF",
    description: "累計¥300,000利用達成 — 次回会計から10%オフ",
    valid_from: "2026-02-15",
    valid_until: "2026-05-15",
    used_at: "2026-03-07T20:00:00+09:00",
    code: "NIGHT-THX10",
  },
  // ── Lounge ÉTOILE 六本木 ──
  {
    id: "coupon5",
    customer_id: "cust1",
    store_id: "store2",
    store_name: "Lounge ÉTOILE 六本木",
    type: "drink",
    title: "5回来店記念 シャンパンサービス",
    description: "5回来店達成 — グラスシャンパンを1杯プレゼント 🥂",
    valid_from: "2026-03-10",
    valid_until: "2026-05-10",
    used_at: null,
    code: "ETOILE-5V",
  },
  {
    id: "coupon6",
    customer_id: "cust1",
    store_id: "store2",
    store_name: "Lounge ÉTOILE 六本木",
    type: "discount",
    title: "初回来店ウェルカム 15%OFF",
    description: "初回ご来店のお客様限定 — 次回会計から15%オフ",
    valid_from: "2026-01-15",
    valid_until: "2026-03-15",
    used_at: "2026-02-20T21:00:00+09:00",
    code: "ETOILE-WEL",
  },
  // ── BAR VELVET 赤坂 ──
  {
    id: "coupon7",
    customer_id: "cust1",
    store_id: "store3",
    store_name: "BAR VELVET 赤坂",
    type: "drink",
    title: "新規登録キャンペーン",
    description: "アプリ登録特典 — お好きなウイスキー1杯プレゼント 🥃",
    valid_from: "2026-03-01",
    valid_until: "2026-06-01",
    used_at: null,
    code: "VELVET-NEW",
  },
];

// Fixed "today" for deterministic follow-target selection in mock mode.
// Matches the spec's reference date (last-visit dates are in early March).
export const MOCK_TODAY = new Date("2026-03-19T00:00:00+09:00");

export const mockStores: Store[] = [
  { id: CURRENT_STORE_ID, name: "CLUB NIGHTOS 銀座本店" },
  { id: "store2", name: "Lounge ÉTOILE 六本木" },
  { id: "store3", name: "BAR VELVET 赤坂" },
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
  // ── Lounge ÉTOILE 六本木 ──
  {
    id: "cast3",
    store_id: "store2",
    name: "りな",
    nomination_count: 22,
    monthly_sales: 2_100_000,
    repeat_rate: 0.78,
  },
  // ── BAR VELVET 赤坂 ──
  {
    id: "cast4",
    store_id: "store3",
    name: "ゆい",
    nomination_count: 10,
    monthly_sales: 980_000,
    repeat_rate: 0.60,
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
  // ── あかり担当の追加顧客（様々なステータス） ──
  {
    id: "cust5",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "山本 隆",
    birthday: "1972-04-02",
    job: "弁護士",
    favorite_drink: "ドンペリニヨン",
    category: "vip",
    store_memo: "離婚調停中のため家庭の話題はNG。ゴルフと車が好き",
    created_at: "2025-01-10T19:00:00+09:00",
  },
  {
    id: "cust6",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "中村 慎太郎",
    birthday: "1985-12-20",
    job: "外資系コンサル",
    favorite_drink: "白州ハイボール",
    category: "regular",
    store_memo: "出張が多い。月末に来ることが多い",
    created_at: "2025-06-01T20:00:00+09:00",
  },
  {
    id: "cust7",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "鈴木 大輔",
    birthday: "1990-08-15",
    job: "IT スタートアップ CEO",
    favorite_drink: "ジャックダニエル",
    category: "new",
    store_memo: null,
    created_at: "2026-03-10T20:30:00+09:00",
  },
  {
    id: "cust8",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "木村 亮介",
    birthday: "1965-01-30",
    job: "建設会社会長",
    favorite_drink: "響21年ロック",
    category: "vip",
    store_memo: "接待利用が多い。静かなテーブル希望。犬の話が好き",
    created_at: "2024-08-01T19:00:00+09:00",
  },
  {
    id: "cust9",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "小林 翔太",
    birthday: "1993-03-28",
    job: "医師（外科）",
    favorite_drink: "グレンリベット12年",
    category: "regular",
    store_memo: "夜勤明けに来ることがある。お酒は控えめ",
    created_at: "2025-09-15T21:00:00+09:00",
  },
  {
    id: "cust10",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "松田 健太郎",
    birthday: "1980-07-07",
    job: "飲食店オーナー",
    favorite_drink: "クリュッグ",
    category: "regular",
    store_memo: "同業者なので接客の話は避ける。音楽好き（ジャズ）",
    created_at: "2025-03-20T20:00:00+09:00",
  },
  {
    id: "cust11",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "伊藤 雅人",
    birthday: "1978-11-15",
    job: "証券会社部長",
    favorite_drink: "マッカラン18年",
    category: "vip",
    store_memo: "ワインにも詳しい。知的な会話を好む",
    created_at: "2024-12-01T19:30:00+09:00",
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
  // ── 追加顧客のボトル ──
  {
    id: "btl8",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust5",
    brand: "ドンペリニヨン",
    total_glasses: 6,
    remaining_glasses: 2,
    kept_at: "2026-01-20T20:00:00+09:00",
  },
  {
    id: "btl9",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust8",
    brand: "響21年",
    total_glasses: 20,
    remaining_glasses: 4,
    kept_at: "2025-12-10T19:30:00+09:00",
  },
  {
    id: "btl10",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust10",
    brand: "クリュッグ",
    total_glasses: 6,
    remaining_glasses: 5,
    kept_at: "2026-03-01T20:00:00+09:00",
  },
  {
    id: "btl11",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust11",
    brand: "マッカラン18年",
    total_glasses: 20,
    remaining_glasses: 12,
    kept_at: "2026-02-01T19:30:00+09:00",
  },
  // ── 田中太郎が Lounge ÉTOILE 六本木 でキープ ──
  {
    id: "btl5",
    store_id: "store2",
    customer_id: "cust1",
    brand: "ドンペリニヨン",
    total_glasses: 6,
    remaining_glasses: 4,
    kept_at: "2026-02-20T21:00:00+09:00",
  },
  {
    id: "btl6",
    store_id: "store2",
    customer_id: "cust1",
    brand: "グレンリベット12年",
    total_glasses: 20,
    remaining_glasses: 14,
    kept_at: "2026-01-30T20:30:00+09:00",
  },
  // ── 田中太郎が BAR VELVET 赤坂 でキープ ──
  {
    id: "btl7",
    store_id: "store3",
    customer_id: "cust1",
    brand: "竹鶴17年",
    total_glasses: 20,
    remaining_glasses: 18,
    kept_at: "2026-03-01T21:00:00+09:00",
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
  // ── 田中太郎の他店舗来店 ──
  // Lounge ÉTOILE 六本木 — 5回, りな指名
  ...generateVisitSeries({
    customer_id: "cust1",
    cast_id: "cast3",
    lastVisit: "2026-03-10",
    intervalDays: 14,
    count: 5,
    is_nominated: true,
    store_id: "store2",
  }),
  // BAR VELVET 赤坂 — 3回, ゆい指名
  ...generateVisitSeries({
    customer_id: "cust1",
    cast_id: "cast4",
    lastVisit: "2026-03-05",
    intervalDays: 21,
    count: 3,
    is_nominated: true,
    store_id: "store3",
  }),
  // ── 追加顧客の来店履歴（あかり担当、様々なパターン） ──
  // cust5 山本隆 — VIP、毎週来店していたが35日空き → VIP要注意
  ...generateVisitSeries({
    customer_id: "cust5",
    cast_id: "cast1",
    lastVisit: "2026-02-12",
    intervalDays: 7,
    count: 15,
    is_nominated: true,
  }),
  // cust6 中村慎太郎 — 常連、月1ペースで安定 → アクティブ
  ...generateVisitSeries({
    customer_id: "cust6",
    cast_id: "cast1",
    lastVisit: "2026-03-15",
    intervalDays: 30,
    count: 8,
    is_nominated: true,
  }),
  // cust7 鈴木大輔 — 新規、2回だけ → 新規
  ...generateVisitSeries({
    customer_id: "cust7",
    cast_id: "cast1",
    lastVisit: "2026-03-14",
    intervalDays: 5,
    count: 2,
    is_nominated: false,
  }),
  // cust8 木村亮介 — VIP、40日来てない → 休眠
  ...generateVisitSeries({
    customer_id: "cust8",
    cast_id: "cast1",
    lastVisit: "2026-02-05",
    intervalDays: 14,
    count: 25,
    is_nominated: true,
  }),
  // cust9 小林翔太 — 常連、2週間ペースだが20日空き → 要フォロー
  ...generateVisitSeries({
    customer_id: "cust9",
    cast_id: "cast1",
    lastVisit: "2026-02-27",
    intervalDays: 14,
    count: 6,
    is_nominated: true,
  }),
  // cust10 松田健太郎 — 常連、3週間ペースで安定 → アクティブ
  ...generateVisitSeries({
    customer_id: "cust10",
    cast_id: "cast1",
    lastVisit: "2026-03-16",
    intervalDays: 21,
    count: 10,
    is_nominated: true,
  }),
  // cust11 伊藤雅人 — VIP、10日ペースで安定 → アクティブ
  ...generateVisitSeries({
    customer_id: "cust11",
    cast_id: "cast1",
    lastVisit: "2026-03-18",
    intervalDays: 10,
    count: 12,
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
  store_id?: string;
}): Visit[] {
  const storeId = opts.store_id ?? CURRENT_STORE_ID;
  const visits: Visit[] = [];
  const last = new Date(opts.lastVisit + "T20:00:00+09:00");
  for (let i = 0; i < opts.count; i++) {
    const d = new Date(last);
    d.setDate(d.getDate() - i * opts.intervalDays);
    visits.push({
      id: `visit_${opts.customer_id}_${storeId}_${i}`,
      store_id: storeId,
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
  // ── 追加顧客のメモ ──
  {
    id: "memo5",
    customer_id: "cust5",
    cast_id: "cast1",
    last_topic: "新車のポルシェ（タイカン）を納車した話",
    service_tips:
      "知識人タイプ。ゴルフと車の話から入ると盛り上がる。ドンペリは特別な日のみ。",
    next_topics: "ゴルフのラウンド結果、車の慣らし運転",
    visit_notes: null,
    updated_at: "2026-02-12T23:00:00+09:00",
  },
  {
    id: "memo6",
    customer_id: "cust6",
    cast_id: "cast1",
    last_topic: "海外出張（シンガポール）のお土産",
    service_tips:
      "月末に来る傾向。出張の話を聞くと喜ぶ。あまり甘いお酒は飲まない。",
    next_topics: "次の出張先、シンガポールのレストラン",
    visit_notes: null,
    updated_at: "2026-03-15T23:30:00+09:00",
  },
  {
    id: "memo7",
    customer_id: "cust7",
    cast_id: "cast1",
    last_topic: "自社のプロダクトローンチが近い",
    service_tips:
      "新規なのでまだ距離感を測っている。仕事の話が中心。ボトル提案は3回目以降。",
    next_topics: "プロダクトローンチの結果、資金調達",
    visit_notes: null,
    updated_at: "2026-03-14T23:00:00+09:00",
  },
  {
    id: "memo8",
    customer_id: "cust8",
    cast_id: "cast1",
    last_topic: "飼い犬（柴犬のコタロー）の体調",
    service_tips:
      "静かな席を好む。接待相手がいる時は控えめに。犬の話は必ず盛り上がる。",
    next_topics: "コタローの回復、春の庭づくり",
    visit_notes: null,
    updated_at: "2026-02-05T22:00:00+09:00",
  },
  {
    id: "memo9",
    customer_id: "cust9",
    cast_id: "cast1",
    last_topic: "学会発表の準備で忙しい",
    service_tips:
      "夜勤明けのことがある。疲れてる時は静かに寄り添う。お酒は1〜2杯で止める。",
    next_topics: "学会発表の結果、最近観た映画",
    visit_notes: null,
    updated_at: "2026-02-27T23:00:00+09:00",
  },
  {
    id: "memo10",
    customer_id: "cust10",
    cast_id: "cast1",
    last_topic: "自分の店のリニューアル工事",
    service_tips:
      "同業者なので接客論はNG。ジャズと料理の話で盛り上がる。シャンパン好き。",
    next_topics: "リニューアル後のメニュー、春のジャズライブ",
    visit_notes: null,
    updated_at: "2026-03-16T23:30:00+09:00",
  },
  {
    id: "memo11",
    customer_id: "cust11",
    cast_id: "cast1",
    last_topic: "ワインセラーに新しく入れたブルゴーニュ",
    service_tips:
      "知的な会話を好む。ウイスキーとワインに詳しい。褒められるのが好き。",
    next_topics: "ブルゴーニュのテイスティング、最近読んだ本",
    visit_notes: null,
    updated_at: "2026-03-18T23:00:00+09:00",
  },
];
