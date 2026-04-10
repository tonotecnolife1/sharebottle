import type { CustomerContext, Intent } from "@/types/nightos";

/**
 * Deterministic "瑠璃ママ" replies used when ANTHROPIC_API_KEY is unset.
 * Customer-aware: if a context is provided the name and last topic are woven
 * into the reply so the UX still feels grounded.
 */
export function generateStubReply(opts: {
  intent: Intent;
  hearingContext: Record<string, string>;
  customer?: CustomerContext | null;
  userText: string;
}): string {
  const { intent, hearingContext, customer } = opts;
  const name = customer?.customer.name ?? "お客様";
  const lastTopic = customer?.memo?.last_topic ?? null;
  const bottle = customer?.bottles[0] ?? null;

  if (intent === "follow") {
    const purpose = hearingContext["purpose"] ?? "お礼";
    const tone = hearingContext["tone"] ?? "親しみやすく";
    return [
      `${name}さんへの${purpose}の連絡ね。${tone}送るのが正解よ。`,
      "",
      "【文面例】",
      lastTopic
        ? `${name}さん、昨日はありがとうございました。${lastTopic}の話、とても楽しかったです。また近いうちにお顔を見せてくださいね。`
        : `${name}さん、昨日はありがとうございました。お話できてとても楽しかったです。また近いうちにお顔を見せてくださいね。`,
      "",
      "【なぜ効くか】",
      "具体的な話題を一つだけ入れるのがポイントよ。「また会いたい」の気持ちが伝わる一方で、重くならない。夜の連絡は短くて温度のあるものが一番残るの。",
      bottle
        ? `\n残りの${bottle.brand}（${bottle.remaining_glasses}杯）を次回の来店理由にさりげなく添えるのもいいわね。`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (intent === "serving") {
    const situation = hearingContext["situation"] ?? "会話が続かない";
    return [
      `${situation}ね。${name}さん相手なら焦らないで。`,
      "",
      lastTopic
        ? `【アドバイス】\n前回${lastTopic}の話で盛り上がったでしょ。その続きを聞くの。「あの話、その後どうなりました？」で十分よ。`
        : "【アドバイス】\nまずはお客様の表情を見て、お仕事の話から。近況を聞く姿勢が伝われば、自然と口が開いてくるわ。",
      "",
      "【なぜ効くか】",
      "人は自分の話を覚えてくれている相手に心を開くの。無理に話題を探すより、前回の延長線に乗せる方がずっと自然よ。",
    ].join("\n");
  }

  if (intent === "strategy") {
    const cause = hearingContext["cause"] ?? "わからない";
    const freq = hearingContext["frequency"] ?? "週数回";
    return [
      `${cause}が気になっているのね。フォロー頻度が${freq}なら、まずそこから整えましょ。`,
      "",
      "【アドバイス】",
      "1. 来店から24時間以内のお礼LINEは必ず送る",
      "2. 10日空いたお客様には一言添えて「お変わりないですか」",
      "3. 月1回はキープボトルの残りを知らせる",
      "",
      "【なぜ効くか】",
      "夜のお客様は「忘れられてない」という実感で通うの。大袈裟な営業より、回数と短さの方が効くわ。まずは3週間これを続けてみて。",
    ].join("\n");
  }

  // freeform
  return [
    `${name}さんについてのご相談ね。`,
    "",
    lastTopic
      ? `前回は${lastTopic}で盛り上がっていたようね。その延長線で話題を作るといいわ。`
      : "まずは前回のお話を思い出して、自然な流れで続きを聞いてみて。",
    "",
    "【なぜ効くか】",
    "覚えていることを示すだけで、お客様の「自分は大事にされている」という実感が強まるの。それが指名の根っこよ。",
    "",
    "— （これは ANTHROPIC_API_KEY 未設定時のスタブ応答です。環境変数を設定すると実際の瑠璃ママが答えます。）",
  ].join("\n");
}
