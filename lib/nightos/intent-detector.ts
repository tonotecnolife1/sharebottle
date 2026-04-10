import type { Intent } from "@/types/nightos";

/**
 * Lightweight keyword classifier that picks the hearing flow to run before
 * calling Claude. Not a substitute for a real classifier — just enough to
 * route the staged chip flow correctly.
 */
const INTENT_KEYWORDS: Record<Intent, string[]> = {
  follow: [
    "連絡",
    "LINE",
    "ライン",
    "お礼",
    "誘い",
    "誕生日",
    "祝い",
    "お祝い",
    "送りたい",
    "メッセージ",
    "文面",
    "アフター",
  ],
  serving: [
    "今",
    "いま",
    "接客中",
    "会話",
    "話が続かない",
    "ボトル提案",
    "指名してもらう",
    "機嫌",
    "盛り上げ",
    "テーブル",
  ],
  strategy: [
    "指名化",
    "常連",
    "売上",
    "戦略",
    "離脱",
    "減って",
    "落ちて",
    "スランプ",
    "客層",
    "新規",
    "リピート",
  ],
  freeform: [],
};

export function detectIntent(text: string): Intent {
  const normalized = text.trim();
  if (!normalized) return "freeform";

  // Count keyword hits per intent; pick the highest.
  let best: Intent = "freeform";
  let bestScore = 0;
  (Object.keys(INTENT_KEYWORDS) as Intent[]).forEach((intent) => {
    if (intent === "freeform") return;
    const score = INTENT_KEYWORDS[intent].reduce(
      (acc, kw) => (normalized.includes(kw) ? acc + 1 : acc),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  });
  return best;
}
