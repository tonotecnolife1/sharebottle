import type { CustomerContext, Intent } from "@/types/nightos";

/**
 * Deterministic "さくらママ" replies used when ANTHROPIC_API_KEY is unset
 * OR when the live Claude call errors out. Customer-aware: if a context
 * is provided the name and last topic are woven into the reply.
 *
 * Format matches the real system prompt's 3-section structure so the UX
 * is consistent when switching between modes.
 */
export function generateStubReply(opts: {
  intent: Intent;
  hearingContext: Record<string, string>;
  customer?: CustomerContext | null;
  userText: string;
}): string {
  const { intent, hearingContext, customer } = opts;
  const name = customer?.customer.name ?? "お客様";
  const surname = (customer?.customer.name ?? "お客様").split(/\s|　/)[0];
  const lastTopic = customer?.memo?.last_topic ?? null;
  const bottle = customer?.bottles[0] ?? null;
  const isVip = customer?.customer.category === "vip";

  if (intent === "follow") {
    const purpose = hearingContext["purpose"] ?? "お礼";
    const tone = hearingContext["tone"] ?? "親しみやすく";
    const mood = hearingContext["mood"] ?? "落ち着いた";

    const moodComment =
      mood === "盛り上がった"
        ? "前回盛り上がったなら、勢いを残したまま軽めで送るのが正解ね。"
        : mood === "元気なかった"
          ? "元気なかったなら、励ましすぎず「近くにいるよ」感だけ残すの。"
          : mood === "覚えてない"
            ? "覚えてないなら無理に前回の話を引用しないで、さっぱり短く送って。"
            : "落ち着いた感じだったなら、言葉を少なめにして間合いを大事にしてね。";

    const topicLine = lastTopic
      ? `${lastTopic}のお話、とても楽しかったです。続き、また聞かせてくださいね。`
      : `お話できて楽しかったです。また近いうちにお顔を見せてくださいね。`;

    const bottleLine = bottle
      ? `\nあ、${bottle.brand}もまだ${bottle.remaining_glasses}杯残ってますよ。`
      : "";

    return `**【アドバイス】**
${name}さまへの${purpose}の連絡ね。${tone}送るのが正解よ。${moodComment}

**【文面例】**
「${surname}さま、先日はありがとうございました。${topicLine}${bottleLine}」

**【なぜ効くか】**
具体的な話題を一つだけ織り込むのがポイントよ。「また会いたい」を重くならずに伝えるの。${
      isVip
        ? "VIPには「自分の居場所がある」実感を添えるのが効くから、ボトルの残量も自然に混ぜておく。"
        : "夜の連絡は短くて温度があるものが一番残る、長文は読まれないから気をつけて。"
    }`;
  }

  if (intent === "serving") {
    const situation = hearingContext["situation"] ?? "会話が続かない";

    const advice =
      situation === "会話が続かない"
        ? lastTopic
          ? `前回${lastTopic}で盛り上がったでしょ、その続きを聞くの。「あの話、その後どうなりました？」で十分よ。`
          : "まずはお仕事の話から。近況を聞く姿勢が伝われば、自然と口が開いてくるわ。"
        : situation === "ボトル提案したい"
          ? isVip
            ? "VIPには直接勧めずに「最近入った銘柄」の話から入るの。選ぶ楽しみを渡すのがコツ。"
            : "まだ早いかも。2〜3回目までは指名を取るのが先よ、ボトルはその後。"
          : situation === "指名につなげたい"
            ? "直接「指名してね」は禁句。代わりに「続きを話す相手」として記憶に残すの。"
            : "機嫌悪い時は無理に話さないで。静かに寄り添って、お酒のペースに合わせるだけでいいわ。";

    const exampleText =
      situation === "指名につなげたい"
        ? lastTopic
          ? `「${surname}さま、さっきの${lastTopic}の話、気になって私も調べちゃった。次いらした時に続き聞かせてくださいね。」`
          : `「${surname}さま、今日お話できて嬉しかったです。次は私の勝手なおすすめも聞いてもらいたいし、またぜひ。」`
        : situation === "ボトル提案したい"
          ? `「${surname}さま、最近入ったボトルで面白いのがあるんです。次いらした時に一杯試してみませんか？」`
          : situation === "機嫌悪い時"
            ? "（言葉を控えて、同じペースでお酒を合わせる）"
            : lastTopic
              ? `「${lastTopic}、その後どうなりました？」`
              : `「お仕事、最近はお忙しいですか？」`;

    return `**【アドバイス】**
${advice}

**【文面例】**
${exampleText}

**【なぜ効くか】**
人は自分の話を覚えてくれてる相手に心を開くの。無理に話題を探すより、前回の延長線に乗せる方がずっと自然。${
      isVip ? "VIPほどこの「覚えてる感」に弱いのよ。" : ""
    }`;
  }

  if (intent === "strategy") {
    const cause = hearingContext["cause"] ?? "わからない";
    const freq = hearingContext["frequency"] ?? "週数回";

    const advice =
      cause === "指名化できない"
        ? "指名化できない時は、だいたい「押しすぎ」か「印象に残ってない」のどちらかよ。"
        : cause === "常連離れ"
          ? "常連が離れるのは、あなたが「変わった」と思われてる時が多い。逆に昔と同じ接し方が一番効くわ。"
          : cause === "新規来ない"
            ? "新規が来ないのは紹介のチャンネルが細ってるから。既存客に「連れてきてほしい」じゃなく「この人にも会わせたい」と言う。"
            : "まず連絡の頻度を整えるのが先ね。それで半分解決するから。";

    const exampleText = `「${surname}さま、お元気ですか？最近こんな面白いお客様にお会いしたんです。きっと気が合うと思うので、今度ご一緒しません？」`;

    return `**【アドバイス】**
${advice}${freq === "ほぼしてない" ? "まずはLINEの頻度を上げて、24時間以内のお礼だけは必ず送ること。" : ""}

**【文面例】**
${exampleText}

**【なぜ効くか】**
夜のお客様は「忘れられてない」という実感で通うの。大袈裟な営業より、回数と短さの方が効く。3週間これを続けてみて、変化が見えてこなければまた相談して。`;
  }

  // freeform
  return `**【アドバイス】**
${name}さまについてね。${
    lastTopic
      ? `前回${lastTopic}で盛り上がっていたなら、その延長線で話題を作るのが一番自然よ。`
      : "まず前回のお話を思い出して、自然な流れで続きを聞いてみて。"
  }

**【文面例】**
${
  lastTopic
    ? `「${surname}さま、${lastTopic}のこと、その後どうなりましたか？ふと気になって連絡してしまいました。」`
    : `「${surname}さま、お元気ですか？またお顔を見せてくださいね。」`
}

**【なぜ効くか】**
覚えていることを示すだけで、お客様の「自分は大事にされている」という実感が強まるの。それが指名の根っこよ。`;
}
