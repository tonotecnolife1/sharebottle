import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SAKURA_MAMA_MODEL } from "@/lib/nightos/constants";
import { buildRegionContextLine } from "@/lib/nightos/regions";
import { getCustomerContext } from "@/lib/nightos/supabase-queries";
import { generateTemplateSchema, parseBody } from "@/lib/nightos/validation";
import type { CustomerContext } from "@/types/nightos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `あなたは銀座の高級クラブのママ「さくらママ」です。30年の経験を持ち、キャストの代わりに送るLINE文面を1つだけ作ります。

# 役割

- キャストが送る前提のLINE文面を、その顧客の情報に合わせて1つだけ提案する
- 顧客の特徴・前回の話題・キープボトル・来店頻度・カテゴリを踏まえる

# トーンとスタイル

- 実際のキャストが送るような、自然で品のある日本語
- 「〜です」「〜ね」「〜ます」を中心にした柔らかい敬語
- 絵文字は1〜3個まで（🌸 ✨ 💌 🥂 ☕ 🌙 💕 😊 など、品が落ちないもの）
- 顧客のカテゴリに合わせて温度感を調整:
  - VIP: 少し改まった敬語、絵文字は控えめ
  - 常連: 親しみやすく、絵文字も自然に
  - 新規: 距離感を保ちつつ温かく

# 禁止事項

- 長文（3〜5行以内が理想）
- 説教臭い言い回し
- 「いつもありがとうございます」「お疲れ様です」のような定型句のみ
- ハート爆撃（💕💕💕 のような連続絵文字）
- AIっぽい前置き

# 出力フォーマット

文面のみを返してください。前置き、解説、引用符、絵文字での装飾などは一切不要です。
顧客名を省略する代わりに「{姓}」プレースホルダを使ってください（クライアント側で置換します）。
`;

interface RequestBody {
  customerId: string;
  castId: string;
  category: "thanks" | "invite" | "birthday" | "seasonal";
}

interface ApiResponse {
  isStub: boolean;
  body: string;
}

export async function POST(req: Request) {
  const parsed = await parseBody(req, generateTemplateSchema);
  if (parsed instanceof NextResponse) return parsed;
  const body: RequestBody = parsed;

  const context = await getCustomerContext(body.castId, body.customerId);
  if (!context) {
    return NextResponse.json({ error: "customer_not_found" }, { status: 404 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    const response: ApiResponse = {
      isStub: true,
      body: buildStubTemplate(context, body.category),
    };
    return NextResponse.json(response);
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const userMessage = buildUserMessage(context, body.category);
    const response = await client.messages.create({
      model: SAKURA_MAMA_MODEL,
      max_tokens: 400,
      temperature: 0.85,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });
    const text = extractText(response.content);
    const apiResponse: ApiResponse = { isStub: false, body: text };
    return NextResponse.json(apiResponse);
  } catch (err) {
    console.error("[generate-template] Claude call failed:", err);
    const response: ApiResponse = {
      isStub: true,
      body: buildStubTemplate(context, body.category),
    };
    return NextResponse.json(response);
  }
}

function buildUserMessage(
  context: CustomerContext,
  category: RequestBody["category"],
): string {
  const { customer, memo, bottles } = context;
  const lines: string[] = [];
  lines.push("[顧客カルテ]");
  lines.push(`名前: ${customer.name}`);
  if (customer.job) lines.push(`職業: ${customer.job}`);
  lines.push(
    `カテゴリ: ${customer.category === "vip" ? "VIP" : customer.category === "new" ? "新規" : "常連"}`,
  );
  if (customer.favorite_drink)
    lines.push(`好きなお酒: ${customer.favorite_drink}`);
  if (customer.region) {
    const regionLine = buildRegionContextLine(customer.region);
    if (regionLine) lines.push(regionLine);
  }
  if (bottles.length > 0) {
    const b = bottles[0];
    lines.push(`キープボトル: ${b.brand}`);
  }
  if (memo?.last_topic) lines.push(`前回の話題: ${memo.last_topic}`);
  if (memo?.service_tips) lines.push(`接客のコツ: ${memo.service_tips}`);
  if (memo?.next_topics) lines.push(`次回の話題候補: ${memo.next_topics}`);
  if (customer.store_memo) lines.push(`店舗メモ: ${customer.store_memo}`);
  lines.push("");

  const categoryLabel = {
    thanks: "お礼",
    invite: "お誘い（再来店）",
    birthday: "誕生日のお祝い",
    seasonal: "季節の挨拶",
  }[category];

  lines.push(`[依頼内容]`);
  lines.push(`このお客様向けの「${categoryLabel}」のLINE文面を1つだけ作ってください。`);
  lines.push(`顧客名は「{姓}」というプレースホルダで置いてください。`);

  return lines.join("\n");
}

function buildStubTemplate(
  context: CustomerContext,
  category: RequestBody["category"],
): string {
  const surname = context.customer.name.split(/\s|　/)[0];
  const lastTopic = context.memo?.last_topic;
  const bottle = context.bottles[0];

  switch (category) {
    case "thanks":
      return `{姓}さん、昨日はありがとうございました🌸 ${
        lastTopic ? `${lastTopic}のお話` : "お話"
      }、本当に楽しかったです。また続き、聞かせてくださいね😊`;
    case "invite":
      return `{姓}さん、お元気ですか？✨ ${
        lastTopic ? `${lastTopic}のその後、` : ""
      }気になってました。${
        bottle ? `${bottle.brand}もまだ残ってます🥂 ` : ""
      }お時間できたらお顔見せてくださいね。`;
    case "birthday":
      return `{姓}さん、お誕生日おめでとうございます🌸 ${
        context.customer.name
      }さんにとって素敵な1年になりますように✨ お祝い、お店で待ってますね💕`;
    case "seasonal":
      return `{姓}さん、季節の変わり目ですが体調崩されてませんか？☕ またお時間ある時にお店で一息つきにいらしてくださいね🌙`;
  }
}

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}
