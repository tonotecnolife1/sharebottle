// Hardcoded defaults for the MVP (no auth).
// `CURRENT_CAST_ID` is the cast shown after picking "キャスト（あかり）" on the role selector.

export const CURRENT_STORE_ID = "store1";
export const CURRENT_CAST_ID = "cast1"; // あかり
export const CURRENT_MAMA_ID = "cast_mama1"; // さくら（ママ）— mama ロール時に使用

export const CURRENT_CUSTOMER_ID = "cust1"; // 田中太郎（来店客モード用）

export const ROLE_STORAGE_KEY = "nightos.role";
export const VENUE_TYPE_STORAGE_KEY = "nightos.venue-type";

// ── Venue type ──
// クラブ: ママ・お姉さん・キャストの階層構造。同伴が重要。担当制。
// キャバクラ: 指名制。フリー→指名の指名化が最重要。
export type VenueType = "club" | "cabaret";

// ── Club role hierarchy ──
// ママ: 店舗のオーナー/管理者。役職給あり。全顧客を管理。
// お姉さん: 担当を持つ。同伴ノルマあり。お姉さんの売上はママの売上に直結しない。
// キャスト（help 役割）: お姉さんの補助。担当なし。
export type ClubRole = "mama" | "oneesan" | "help";

// Claude Haiku 4.5 — コスパ重視。
export const SAKURA_MAMA_MODEL = "claude-haiku-4-5-20251001";

/** @deprecated Use SAKURA_MAMA_MODEL instead */
export const RURI_MAMA_MODEL = SAKURA_MAMA_MODEL;
