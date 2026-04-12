import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { RURI_MAMA_MODEL } from "@/lib/nightos/constants";
import { getCustomerContext } from "@/lib/nightos/supabase-queries";
import type { MemoExtractionResult } from "@/types/nightos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `あなたは銀座のクラブのキャストの「個人メモ」を更新するアシスタントです。

入力として受け取るもの:
- LINEのスクリーンショット画像（顧客とキャストの会話）
- 顧客の名前と現在の個人メモ

タスク: スクリーンショットを読み取り、メモの更新案を提案してください。

# 出力形式

必ず以下のJSON形式のみを返してください。前置きや説明文は不要、コードブロックも不要、JSON単体を返してください。

{
  "summary": "スクショの内容を1〜2文で要約（日本語）",
  "last_topic": "直近の話題（既存の話題を上書きする形で新しい値、または変更不要ならnull）",
  "service_tips": "新しく分かった接客のコツ、または変更不要ならnull",
  "next_topics": "次回の会話で使えそうな話題の候補、または変更不要ならnull",
  "confidence": "high または medium または low"
}

# 各フィールドのルール

- last_topic: スクショの会話で実際に話されていた話題を簡潔に。例: 「4月のゴルフ旅行と新しいクラブ」
- service_tips: スクショから読み取れた接客のヒント（例: 「夜遅い返信が多い」「丁寧な敬語を好む」）。新情報がなければ null
- next_topics: 次回の会話のフックになりそうな話題（例: 「ゴルフの結果」「新規プロジェクトの進捗」）。読み取れなければ null
- confidence: 抽出の確信度
  - high: 会話内容がはっきり読み取れた
  - medium: 一部読み取れた
  - low: ほとんど読み取れない、または推測が多い

# 注意

- スクショから読み取れない情報は推測しない、null を返す
- 既存メモの内容を尊重する（不要な上書きをしない）
- 個人情報（電話番号など）はメモに含めない
- 短く、具体的に書く（長文は禁止）
`;

const STUB_RESULT: MemoExtractionResult = {
  summary:
    "デモ応答モードです。ANTHROPIC_API_KEY を Vercel に設定すると、本物の Claude vision でスクショの内容を解析します。",
  last_topic: "（デモ）スクショから読み取った話題がここに入ります",
  service_tips: "（デモ）読み取った接客のコツがここに入ります",
  next_topics: "（デモ）次回使える話題の候補がここに入ります",
  confidence: "low",
};

interface RequestBody {
  imageBase64: string;
  customerId: string;
  castId: string;
}

interface ExtractMemoResponse {
  isStub: boolean;
  result: MemoExtractionResult;
}

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.imageBase64 || !body.customerId || !body.castId) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  // Stub mode — no API key set
  if (!process.env.ANTHROPIC_API_KEY) {
    const response: ExtractMemoResponse = {
      isStub: true,
      result: STUB_RESULT,
    };
    return NextResponse.json(response);
  }

  // Strip data URL prefix if present
  const dataUrlMatch = body.imageBase64.match(
    /^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,(.+)$/,
  );
  if (!dataUrlMatch) {
    return NextResponse.json(
      { error: "invalid_image_format" },
      { status: 400 },
    );
  }
  const mediaType = dataUrlMatch[1];
  const imageData = dataUrlMatch[2];

  // Load customer context for richer prompt
  const customerContext = await getCustomerContext(
    body.castId,
    body.customerId,
  );
  const customerName = customerContext?.customer.name ?? "（顧客名不明）";
  const memo = customerContext?.memo;
  const currentMemoText = memo
    ? `現在のメモ:\n- 前回の話題: ${memo.last_topic ?? "（未入力）"}\n- 接客のコツ: ${memo.service_tips ?? "（未入力）"}\n- 次回の話題候補: ${memo.next_topics ?? "（未入力）"}`
    : "現在のメモはまだありません。";

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: RURI_MAMA_MODEL,
      max_tokens: 1024,
      temperature: 0.3, // lower for structured output
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type:
                  mediaType as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
                data: imageData,
              },
            },
            {
              type: "text",
              text: `顧客: ${customerName}\n\n${currentMemoText}\n\nこのLINEスクショを読み取って、メモの更新案をJSON形式のみで返してください。`,
            },
          ],
        },
      ],
    });

    const text = extractText(response.content);
    const result = parseExtractionJson(text);
    const apiResponse: ExtractMemoResponse = { isStub: false, result };
    return NextResponse.json(apiResponse);
  } catch (err) {
    console.error("[extract-memo] Claude vision call failed:", err);
    // Fall back to stub on error
    const response: ExtractMemoResponse = {
      isStub: true,
      result: {
        ...STUB_RESULT,
        summary:
          "スクショの解析に失敗しました。画像が大きすぎる、または読み取れない可能性があります。",
      },
    };
    return NextResponse.json(response);
  }
}

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}

function parseExtractionJson(text: string): MemoExtractionResult {
  // Strip markdown code fences if Claude included them despite instructions
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    const confidence = ["high", "medium", "low"].includes(parsed.confidence)
      ? parsed.confidence
      : "medium";
    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      last_topic: nullable(parsed.last_topic),
      service_tips: nullable(parsed.service_tips),
      next_topics: nullable(parsed.next_topics),
      confidence,
    };
  } catch {
    // If JSON parse fails, extract a sentence from the raw text
    return {
      summary: text.slice(0, 200) || "解析結果のフォーマットが不正でした",
      last_topic: null,
      service_tips: null,
      next_topics: null,
      confidence: "low",
    };
  }
}

function nullable(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
