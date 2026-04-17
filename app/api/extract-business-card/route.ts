import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SAKURA_MAMA_MODEL } from "@/lib/nightos/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `あなたは銀座のクラブの顧客登録を手伝うアシスタントです。
名刺の写真を読み取り、顧客カルテに登録する情報を抽出してください。

# 出力形式
必ず以下のJSON形式のみを返してください。前置きや説明文は不要、コードブロックも不要、JSON単体を返してください。

{
  "name": "お名前（姓と名の間は全角スペース、例: 田中 太郎）",
  "job": "会社名 + 肩書を1行にまとめる（例: 株式会社ABC 代表取締役）、または読み取れない場合は null",
  "store_memo": "名刺に書かれているその他の情報（部署・住所・電話番号・メールアドレス・事業内容など）を店舗メモ用に短くまとめる。読み取れる情報がなければ null",
  "confidence": "high または medium または low"
}

# 各フィールドのルール
- name: 必須。最も確信度の高いお名前を1つだけ。肩書きや敬称（様・殿）は含めない
- job: 会社名と役職/肩書の組み合わせ。英語名の場合は日本語に訳さずそのまま
- store_memo: 担当キャストの参考になりそうな情報を簡潔に。電話番号は含めても良いが短く
- confidence: 抽出の確信度
  - high: 名刺全体がはっきり読み取れた
  - medium: 主要な項目は読み取れた
  - low: 文字がほとんど読み取れない、または名刺ではない可能性

# 注意
- 読み取れない情報は推測しない、null を返す
- 漢字が不明な場合はカタカナで返す
- 画像が名刺でない場合は name を null、confidence を low にする
`;

interface ExtractedBusinessCard {
  name: string | null;
  job: string | null;
  store_memo: string | null;
  confidence: "high" | "medium" | "low";
}

const STUB_RESULT: ExtractedBusinessCard = {
  name: "田中 太郎",
  job: "株式会社サンプル 代表取締役",
  store_memo: "（デモ）ANTHROPIC_API_KEYを設定すると、実際の名刺から情報を自動抽出します",
  confidence: "low",
};

interface RequestBody {
  imageBase64: string;
}

interface ExtractBusinessCardResponse {
  isStub: boolean;
  result: ExtractedBusinessCard;
}

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.imageBase64) {
    return NextResponse.json({ error: "missing_image" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    const response: ExtractBusinessCardResponse = {
      isStub: true,
      result: STUB_RESULT,
    };
    return NextResponse.json(response);
  }

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

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: SAKURA_MAMA_MODEL,
      max_tokens: 1024,
      temperature: 0.2,
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
                  mediaType as
                    | "image/png"
                    | "image/jpeg"
                    | "image/webp"
                    | "image/gif",
                data: imageData,
              },
            },
            {
              type: "text",
              text: "この名刺を読み取って、顧客登録用の情報をJSON形式のみで返してください。",
            },
          ],
        },
      ],
    });

    const text = extractText(response.content);
    const result = parseExtractionJson(text);
    const apiResponse: ExtractBusinessCardResponse = {
      isStub: false,
      result,
    };
    return NextResponse.json(apiResponse);
  } catch (err) {
    console.error("[extract-business-card] Claude vision call failed:", err);
    const response: ExtractBusinessCardResponse = {
      isStub: true,
      result: {
        name: null,
        job: null,
        store_memo: null,
        confidence: "low",
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

function parseExtractionJson(text: string): ExtractedBusinessCard {
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
      name: nullable(parsed.name),
      job: nullable(parsed.job),
      store_memo: nullable(parsed.store_memo),
      confidence,
    };
  } catch {
    return {
      name: null,
      job: null,
      store_memo: null,
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
