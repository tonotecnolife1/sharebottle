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
      "{姓}さま、昨日はありがとうございました🌸 {前回の話題}のお話、本当に楽しかった。また近いうちにお顔見せてくださいね😊",
    description: "話題を1つだけ入れた短めのお礼",
  },
  {
    id: "thanks-formal",
    category: "thanks",
    label: "丁寧に",
    body:
      "{顧客名}様、昨晩はご来店いただきありがとうございました✨ また{ボトル名}でご一緒させていただける日を楽しみにしております。",
    description: "VIPや初対面のお客様向け",
  },
  {
    id: "thanks-sweet",
    category: "thanks",
    label: "もう一歩距離を縮めたい",
    body:
      "{姓}さま、昨日はお会いできて嬉しかったです💕 {前回の話題}の続き、また聞かせてくださいね。寂しくなっちゃうのでお待ちしてます🌙",
    description: "馴染みのお客様、距離を近づけたい時",
  },

  // ─── お誘い ───
  {
    id: "invite-gentle",
    category: "invite",
    label: "やんわり再来店",
    body:
      "{姓}さま、お元気ですか？✨ {ボトル名}もまだ残ってるので、お時間できたらお顔見せてくださいね。",
    description: "プレッシャーをかけない再来店のきっかけ",
  },
  {
    id: "invite-topic",
    category: "invite",
    label: "話題つきで誘う",
    body:
      "{姓}さま、お久しぶりです🌸 {前回の話題}のその後、気になってました。今度お話聞かせてくださいね😊",
    description: "前回の会話を覚えていることを示す",
  },
  {
    id: "invite-vip",
    category: "invite",
    label: "VIP向け重め",
    body:
      "{顧客名}様、ご無沙汰しております。最近ふと{前回の話題}のことを思い出して、{顧客名}様にお会いしたくなりました。お時間ございましたら、ぜひ🥂",
    description: "VIP・常連のお客様への少し改まった一通",
  },

  // ─── お祝い ───
  {
    id: "birthday-warm",
    category: "birthday",
    label: "誕生日当日",
    body:
      "{姓}さま、お誕生日おめでとうございます🌸 {姓}さまにとって素敵な1年になりますように✨ お祝い、お店で待ってますね💕",
    description: "当日朝の送信に",
  },
  {
    id: "birthday-ahead",
    category: "birthday",
    label: "前祝いで誘う",
    body:
      "{姓}さま、もうすぐお誕生日ですね✨ お店でお祝いさせてください。{ボトル名}も準備してお待ちしてます🥂",
    description: "来店を誘う目的のお祝い",
  },

  // ─── 季節 ───
  {
    id: "seasonal-generic",
    category: "seasonal",
    label: "気遣いベース",
    body:
      "{姓}さま、季節の変わり目ですが体調崩されてませんか？☕ またお時間あるときにお店で一息つきにいらしてくださいね🌙",
    description: "気遣いベースの季節挨拶",
  },
  {
    id: "seasonal-event",
    category: "seasonal",
    label: "イベント・行事",
    body:
      "{姓}さま、いつもありがとうございます🌸 季節の素敵な時間、お店で一緒に過ごせたら嬉しいです✨ お待ちしてますね。",
    description: "桜・花火・年末などイベント時期に",
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
      "さま、またお顔を見せてくださいね。"
    );
  }
  return result;
}

export function surnameOf(fullName: string): string {
  // Japanese full names are "姓 名". Split by full-width space, then half-width.
  const part = fullName.split(/\s|　/)[0];
  return part || fullName;
}
