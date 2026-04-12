// Hardcoded defaults for the MVP (no auth).
// `CURRENT_CAST_ID` is the cast shown after picking "キャスト（あかり）" on the role selector.

export const CURRENT_STORE_ID = "store1";
export const CURRENT_CAST_ID = "cast1"; // あかり

export const ROLE_STORAGE_KEY = "nightos.role";

// Claude Haiku 4.5 — Anthropic の最新ハイク。Sonnet 4.6 と比べて
// 約 1/3 のコスト（入力 $1 / 出力 $5 per 1M tokens）。few-shot 例の
// おかげで瑠璃ママのペルソナ品質は実用範囲を保てる。
// もし品質が足りないと感じたら "claude-sonnet-4-6" に戻すだけでよい。
export const RURI_MAMA_MODEL = "claude-haiku-4-5-20251001";
