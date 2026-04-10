import type { FollowLog } from "@/types/nightos";

export type TemplateCategory = FollowLog["template_type"];

export interface Template {
  id: string;
  category: TemplateCategory;
  label: string;
  /** Uses `{顧客名}` / `{ボトル名}` / `{前回の話題}` / `{姓}` placeholders. */
  body: string;
  description: string;
}

export const TEMPLATE_CATEGORIES: {
  value: TemplateCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "thanks",
    label: "お礼",
    description: "来店翌日に送る温かいお礼",
  },
  {
    value: "invite",
    label: "お誘い",
    description: "来店間隔が空いたお客様へ",
  },
  {
    value: "birthday",
    label: "お祝い",
    description: "誕生日・記念日に",
  },
  {
    value: "seasonal",
    label: "季節の挨拶",
    description: "季節の変わり目や行事で",
  },
];

export const TEMPLATES: Template[] = [
  // ─── お礼 ───
  {
    id: "thanks-casual",
    category: "thanks",
    label: "親しみやすく",
    body:
      "{姓}さん、昨日はありがとうございました。{前回の話題}のお話、本当に楽しかったです。また近いうちにお顔を見せてくださいね。",
    description: "話題を1つだけ入れた短めのお礼",
  },
  {
    id: "thanks-formal",
    category: "thanks",
    label: "丁寧に",
    body:
      "{顧客名}様、昨晩はご来店いただきありがとうございました。また{ボトル名}のお相手をさせていただける日を楽しみにしております。",
    description: "VIPや初期のお客様向け",
  },
  {
    id: "thanks-sweet",
    category: "thanks",
    label: "甘えた感じ",
    body:
      "{姓}さん、昨日は会えて嬉しかったです。{前回の話題}の続き、また聞かせてくださいね。寂しくならないうちにお待ちしてます。",
    description: "もう一歩距離を縮めたい時",
  },

  // ─── お誘い ───
  {
    id: "invite-gentle",
    category: "invite",
    label: "やんわり",
    body:
      "{姓}さん、お元気ですか？{ボトル名}もまだ残っているので、お時間できたらお顔を見せてくださいね。",
    description: "プレッシャーをかけない再来店のきっかけ",
  },
  {
    id: "invite-topic",
    category: "invite",
    label: "話題つき",
    body:
      "{姓}さん、お久しぶりです。{前回の話題}のその後、気になってます。今度お話聞かせてくださいね。",
    description: "前回の会話を覚えていることを示す",
  },

  // ─── お祝い ───
  {
    id: "birthday-warm",
    category: "birthday",
    label: "温かく",
    body:
      "{姓}さん、お誕生日おめでとうございます。素敵な1年になりますように。お祝い、お店で待ってますね。",
    description: "当日朝の送信に",
  },
  {
    id: "birthday-ahead",
    category: "birthday",
    label: "前祝い",
    body:
      "{姓}さん、もうすぐお誕生日ですね。お店でお祝いさせてください。{ボトル名}も準備してお待ちしています。",
    description: "来店を誘う目的のお祝い",
  },

  // ─── 季節 ───
  {
    id: "seasonal-generic",
    category: "seasonal",
    label: "一般",
    body:
      "{姓}さん、季節の変わり目、体調崩されていませんか？またお時間あるときにお店で一息つきにいらしてくださいね。",
    description: "気遣いベースの季節挨拶",
  },
];

// ═══════════════ Placeholder resolution ═══════════════

export interface FillContext {
  customerName?: string | null;
  surname?: string | null;
  bottleBrand?: string | null;
  lastTopic?: string | null;
}

/**
 * Replace `{顧客名}` `{姓}` `{ボトル名}` `{前回の話題}` tokens with context
 * values. If a value is missing the sentence containing the token is removed
 * gracefully so the output stays natural.
 */
export function fillTemplate(body: string, ctx: FillContext): string {
  const replacements: Record<string, string | null | undefined> = {
    "{顧客名}": ctx.customerName,
    "{姓}": ctx.surname,
    "{ボトル名}": ctx.bottleBrand,
    "{前回の話題}": ctx.lastTopic,
  };

  // If a token has no value, drop the sentence it belongs to (split by 。)
  // so the output doesn't contain stray placeholders.
  const sentences = body.split(/(?<=。)/);
  const kept = sentences.filter((s) => {
    const tokens = s.match(/\{[^}]+\}/g) ?? [];
    return tokens.every((tok) => {
      const val = replacements[tok];
      return val !== null && val !== undefined && val !== "";
    });
  });

  let result = kept.join("");
  for (const [token, value] of Object.entries(replacements)) {
    if (value) result = result.split(token).join(value);
  }

  // If everything got stripped, fall back to a minimal safe string.
  if (!result.trim()) {
    return (
      (ctx.surname ?? ctx.customerName ?? "お客様") +
      "さん、またお顔を見せてくださいね。"
    );
  }
  return result;
}

export function surnameOf(fullName: string): string {
  // Japanese full names are "姓 名". Split by full-width space, then half-width.
  const part = fullName.split(/\s|　/)[0];
  return part || fullName;
}
