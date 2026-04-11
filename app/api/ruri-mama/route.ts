import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  RURI_MAMA_MODEL,
  RURI_MAMA_SYSTEM_PROMPT,
} from "@/features/ruri-mama/data/system-prompt";
import { generateStubReply } from "@/features/ruri-mama/data/stub-responses";
import { MOCK_TODAY } from "@/lib/nightos/mock-data";
import { getCustomerContext } from "@/lib/nightos/supabase-queries";
import type {
  Bottle,
  CustomerContext,
  Intent,
  RuriMamaRequest,
  RuriMamaResponse,
  Visit,
} from "@/types/nightos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

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

  // "Today" for stats calculation — use MOCK_TODAY when running on mock data
  // so the demo numbers stay consistent with the seed.
  const today = process.env.NEXT_PUBLIC_SUPABASE_URL ? new Date() : MOCK_TODAY;

  const contextPrefix = buildContextPrefix({
    customer: customerContext,
    hearingContext: body.hearingContext ?? {},
    intent: body.intent,
    today,
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
    return NextResponse.json<RuriMamaResponse>({ reply, isStub: true });
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
      max_tokens: 1500,
      temperature: 0.7,
      system: RURI_MAMA_SYSTEM_PROMPT,
      messages: apiMessages,
    });

    const reply = extractText(response.content);
    return NextResponse.json<RuriMamaResponse>({ reply, isStub: false });
  } catch (err) {
    console.error("[ruri-mama] Claude call failed:", err);
    // Graceful fallback: return a stub reply so the UX never breaks.
    // Mark isStub:true so the UI can surface that we're degraded.
    const reply = generateStubReply({
      intent: body.intent,
      hearingContext: body.hearingContext ?? {},
      customer: customerContext,
      userText,
    });
    return NextResponse.json<RuriMamaResponse>({ reply, isStub: true });
  }
}

// ═══════════════════════════════════════════════════════════
// Context prefix — deliberately rich so Claude has enough to
// produce specific, grounded advice. Visit stats, all bottles,
// and every memo field are included.
// ═══════════════════════════════════════════════════════════

function buildContextPrefix(opts: {
  customer: CustomerContext | null;
  hearingContext: Record<string, string>;
  intent: Intent;
  today: Date;
}): string {
  const lines: string[] = [];

  if (opts.customer) {
    const { customer, memo, bottles, visits } = opts.customer;
    lines.push("[顧客カルテ]");
    lines.push(`名前: ${customer.name}`);
    if (customer.job) lines.push(`職業: ${customer.job}`);

    if (customer.birthday) {
      lines.push(`誕生日: ${formatBirthdayWithCountdown(customer.birthday, opts.today)}`);
    }

    lines.push(
      `カテゴリ: ${
        customer.category === "vip"
          ? "VIP"
          : customer.category === "new"
            ? "新規"
            : "常連"
      }`,
    );

    if (customer.favorite_drink)
      lines.push(`好きなお酒: ${customer.favorite_drink}`);

    // Visit stats — lets Ruri-Mama gauge customer temperature
    if (visits.length > 0) {
      lines.push(formatVisitStats(visits, opts.today));
    }

    // ALL bottles, not just the first
    if (bottles.length > 0) {
      lines.push(`キープボトル: ${formatBottles(bottles)}`);
    }

    if (customer.store_memo) lines.push(`店舗メモ: ${customer.store_memo}`);
    if (memo?.last_topic) lines.push(`前回の話題: ${memo.last_topic}`);
    if (memo?.service_tips) lines.push(`接客のコツ: ${memo.service_tips}`);
    if (memo?.next_topics) lines.push(`次回の話題候補: ${memo.next_topics}`);
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
    lines.push("");
  }

  if (lines.length > 0) {
    lines.push("[相談内容]");
  }

  return lines.join("\n");
}

function formatBirthdayWithCountdown(birthday: string, today: Date): string {
  // birthday is YYYY-MM-DD
  const parts = birthday.split("-").map((n) => parseInt(n, 10));
  if (parts.length < 3) return birthday;
  const [, mo, da] = parts;
  if (!mo || !da) return birthday;

  let next = new Date(today.getFullYear(), mo - 1, da);
  if (next.getTime() < today.getTime()) {
    next = new Date(today.getFullYear() + 1, mo - 1, da);
  }
  const daysUntil = Math.floor((next.getTime() - today.getTime()) / DAY_MS);
  const label = `${mo}月${da}日`;
  if (daysUntil <= 14) {
    return `${label}（あと${daysUntil}日）`;
  }
  return label;
}

function formatVisitStats(visits: Visit[], today: Date): string {
  // visits are sorted desc by visited_at in getCustomerContext
  const count = visits.length;
  const lastVisit = new Date(visits[0].visited_at);
  const daysSince = Math.max(
    0,
    Math.floor((today.getTime() - lastVisit.getTime()) / DAY_MS),
  );
  const nominatedCount = visits.filter((v) => v.is_nominated).length;
  const nominationRate = Math.round((nominatedCount / count) * 100);

  let interval = 0;
  if (count >= 2) {
    const gaps: number[] = [];
    for (let i = 0; i < count - 1; i++) {
      const a = new Date(visits[i].visited_at).getTime();
      const b = new Date(visits[i + 1].visited_at).getTime();
      gaps.push(Math.floor((a - b) / DAY_MS));
    }
    interval = Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length);
  }

  const parts = [`来店${count}回`];
  parts.push(daysSince === 0 ? "最終来店今日" : `最終来店${daysSince}日前`);
  if (interval > 0) parts.push(`通常は${interval}日間隔`);
  parts.push(`指名率${nominationRate}%`);
  return `来店: ${parts.join("、")}`;
}

function formatBottles(bottles: Bottle[]): string {
  return bottles
    .map((b) => `${b.brand}（残${b.remaining_glasses}杯/${b.total_glasses}杯）`)
    .join("、");
}

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}
