import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  RURI_MAMA_MODEL,
  RURI_MAMA_SYSTEM_PROMPT,
} from "@/features/ruri-mama/data/system-prompt";
import { generateStubReply } from "@/features/ruri-mama/data/stub-responses";
import { getCustomerContext } from "@/lib/nightos/supabase-queries";
import type {
  CustomerContext,
  Intent,
  RuriMamaRequest,
  RuriMamaResponse,
} from "@/types/nightos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: RuriMamaRequest;
  try {
    body = (await req.json()) as RuriMamaRequest;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.messages?.length || !body.castId) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  // Load customer context (mock or DB depending on env)
  let customerContext: CustomerContext | null = null;
  if (body.customerId) {
    customerContext = await getCustomerContext(body.castId, body.customerId);
  }

  const contextPrefix = buildContextPrefix({
    customer: customerContext,
    hearingContext: body.hearingContext ?? {},
    intent: body.intent,
  });

  // Last user message is the actual query
  const lastUserMsg = [...body.messages]
    .reverse()
    .find((m) => m.role === "user");
  const userText = lastUserMsg?.content ?? "";

  // ── Stub mode ─────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    const reply = generateStubReply({
      intent: body.intent,
      hearingContext: body.hearingContext ?? {},
      customer: customerContext,
      userText,
    });
    return NextResponse.json<RuriMamaResponse>({ reply });
  }

  // ── Live Claude call ──────────────────────────────────────
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Convert the chat history. Prepend the context prefix to the LAST user
    // message so Claude sees the customer info as part of the user's turn.
    const apiMessages = body.messages.map((m, idx) => {
      if (idx === body.messages.length - 1 && m.role === "user") {
        return {
          role: "user" as const,
          content: contextPrefix
            ? `${contextPrefix}\n\n${m.content}`
            : m.content,
        };
      }
      return { role: m.role, content: m.content };
    });

    const response = await client.messages.create({
      model: RURI_MAMA_MODEL,
      max_tokens: 1024,
      system: RURI_MAMA_SYSTEM_PROMPT,
      messages: apiMessages,
    });

    const reply = extractText(response.content);
    return NextResponse.json<RuriMamaResponse>({ reply });
  } catch (err) {
    console.error("[ruri-mama] Claude call failed:", err);
    // Graceful fallback: return a stub reply so the UX never breaks.
    const reply = generateStubReply({
      intent: body.intent,
      hearingContext: body.hearingContext ?? {},
      customer: customerContext,
      userText,
    });
    return NextResponse.json<RuriMamaResponse>({ reply });
  }
}

function buildContextPrefix(opts: {
  customer: CustomerContext | null;
  hearingContext: Record<string, string>;
  intent: Intent;
}): string {
  const lines: string[] = [];

  if (opts.customer) {
    const { customer, memo, bottles } = opts.customer;
    lines.push("[顧客カルテ]");
    lines.push(`名前: ${customer.name}`);
    if (customer.job) lines.push(`職業: ${customer.job}`);
    if (customer.birthday) lines.push(`誕生日: ${customer.birthday}`);
    lines.push(
      `カテゴリ: ${customer.category === "vip" ? "VIP" : customer.category === "new" ? "新規" : "常連"}`,
    );
    if (customer.favorite_drink)
      lines.push(`好きなお酒: ${customer.favorite_drink}`);
    if (bottles.length > 0) {
      const b = bottles[0];
      lines.push(
        `キープボトル: ${b.brand}（残${b.remaining_glasses}杯/${b.total_glasses}杯）`,
      );
    }
    if (customer.store_memo) lines.push(`店舗メモ: ${customer.store_memo}`);
    if (memo?.last_topic) lines.push(`前回の話題: ${memo.last_topic}`);
    if (memo?.service_tips) lines.push(`接客のコツ: ${memo.service_tips}`);
    lines.push("");
  }

  const hearingEntries = Object.entries(opts.hearingContext);
  if (hearingEntries.length > 0) {
    lines.push("[ヒアリング回答]");
    for (const [k, v] of hearingEntries) {
      lines.push(`- ${k}: ${v}`);
    }
    lines.push("");
  }

  if (opts.intent && opts.intent !== "freeform") {
    const intentLabel: Record<Intent, string> = {
      follow: "フォロー・連絡",
      serving: "接客中の急ぎ相談",
      strategy: "営業戦略",
      freeform: "",
    };
    lines.push(`[相談カテゴリ] ${intentLabel[opts.intent]}`);
  }

  return lines.join("\n");
}

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}
