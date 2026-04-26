/**
 * 47都道府県 + 8地方区分。顧客の「普段の活動エリア」を選ぶ画面と、
 * AI に「気候を踏まえた話題」を促すプロンプトの両方で使う。
 *
 * 実際の天気はリアルタイム API には繋いでおらず、Claude が地方
 * 区分から季節 / 気候を推論する前提で使う（東北は雪が多い、沖縄は
 * 温暖、など）。本格的な天気連動が必要になったら OpenWeather 等を
 * クライアントの API key で噛ませて WeatherContext を組み立て、
 * AI プロンプトに合流させる予定。
 */

export type RegionKey =
  | "hokkaido"
  | "tohoku"
  | "kanto"
  | "chubu"
  | "kinki"
  | "chugoku"
  | "shikoku"
  | "kyushu";

export interface Region {
  key: RegionKey;
  label: string;
  /** Short climate hint AI can lean on when reasoning about season/weather. */
  climateHint: string;
  prefectures: string[];
}

export const REGIONS: Region[] = [
  {
    key: "hokkaido",
    label: "北海道",
    climateHint: "冬は−10℃前後の極寒・積雪、夏は涼しい",
    prefectures: ["北海道"],
  },
  {
    key: "tohoku",
    label: "東北",
    climateHint: "冬は寒く積雪が多い（特に日本海側）、夏は短く涼しい",
    prefectures: [
      "青森県",
      "岩手県",
      "宮城県",
      "秋田県",
      "山形県",
      "福島県",
    ],
  },
  {
    key: "kanto",
    label: "関東",
    climateHint: "冬は乾燥した晴天、夏は高温多湿。梅雨は6〜7月",
    prefectures: [
      "茨城県",
      "栃木県",
      "群馬県",
      "埼玉県",
      "千葉県",
      "東京都",
      "神奈川県",
    ],
  },
  {
    key: "chubu",
    label: "中部",
    climateHint:
      "日本海側（北陸）は冬の積雪、太平洋側は温暖、内陸（甲信）は寒暖差大",
    prefectures: [
      "新潟県",
      "富山県",
      "石川県",
      "福井県",
      "山梨県",
      "長野県",
      "岐阜県",
      "静岡県",
      "愛知県",
    ],
  },
  {
    key: "kinki",
    label: "近畿",
    climateHint: "夏は猛暑日が多い盆地気候、冬は穏やかだが京都は底冷え",
    prefectures: [
      "三重県",
      "滋賀県",
      "京都府",
      "大阪府",
      "兵庫県",
      "奈良県",
      "和歌山県",
    ],
  },
  {
    key: "chugoku",
    label: "中国",
    climateHint:
      "瀬戸内（南）は温暖少雨、日本海側（北）は冬の積雪・曇天が多い",
    prefectures: [
      "鳥取県",
      "島根県",
      "岡山県",
      "広島県",
      "山口県",
    ],
  },
  {
    key: "shikoku",
    label: "四国",
    climateHint: "瀬戸内側は温暖少雨、太平洋側（高知）は雨量が多く台風影響大",
    prefectures: ["徳島県", "香川県", "愛媛県", "高知県"],
  },
  {
    key: "kyushu",
    label: "九州・沖縄",
    climateHint: "全体に温暖で梅雨と台風の影響が大きい。沖縄は亜熱帯",
    prefectures: [
      "福岡県",
      "佐賀県",
      "長崎県",
      "熊本県",
      "大分県",
      "宮崎県",
      "鹿児島県",
      "沖縄県",
    ],
  },
];

/** Flat list of prefecture names. Useful for `<datalist>` and validation. */
export const ALL_PREFECTURES: readonly string[] = REGIONS.flatMap(
  (r) => r.prefectures,
);

/**
 * Given a prefecture name, return its parent region. Returns null when the
 * value is empty or doesn't match any known prefecture (rare — input is
 * a select, not free text).
 */
export function findRegion(prefecture: string | null | undefined): Region | null {
  if (!prefecture) return null;
  return (
    REGIONS.find((r) => r.prefectures.includes(prefecture)) ?? null
  );
}

/**
 * Build the short text appended to AI system prompts when a customer's
 * region is known. e.g.:
 *   "活動エリア: 東京都（関東 / 冬は乾燥した晴天、夏は高温多湿）"
 */
export function buildRegionContextLine(prefecture: string | null | undefined): string | null {
  const region = findRegion(prefecture);
  if (!region || !prefecture) return null;
  return `活動エリア: ${prefecture}（${region.label} / ${region.climateHint}）`;
}
