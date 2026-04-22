import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/feedback
 *
 * Stores user feedback and (when configured) pings Slack so the team
 * gets real-time visibility during friends-and-family testing.
 *
 * Flow:
 *   1. Persist to the `feedback` Supabase table (history).
 *   2. If SLACK_FEEDBACK_WEBHOOK_URL is set, POST a formatted message
 *      to Slack. Failures here never fail the user's request.
 *   3. Fall back to stdout logging when neither sink is configured.
 */
export async function POST(req: Request) {
  let body: { text: string; page: string; timestamp: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.text || body.text.length > 1000) {
    return NextResponse.json({ error: "invalid_text" }, { status: 400 });
  }

  let persisted = false;
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const { createServerSupabaseClient } = await import(
        "@/lib/supabase/server"
      );
      const supabase = createServerSupabaseClient();
      const { error } = await supabase.from("feedback").insert({
        text: body.text,
        page: body.page,
        created_at: body.timestamp,
      });
      persisted = !error;
      if (error) {
        console.log("[feedback] supabase insert failed:", error.message);
      }
    } catch (err) {
      console.log("[feedback]", JSON.stringify(body));
    }
  }

  if (!persisted) {
    console.log("[feedback]", JSON.stringify(body));
  }

  // Fire-and-forget Slack notification. Never blocks the response.
  await notifySlack(body).catch(() => {});

  return NextResponse.json({ ok: true });
}

async function notifySlack(body: {
  text: string;
  page: string;
  timestamp: string;
}): Promise<void> {
  const webhook = process.env.SLACK_FEEDBACK_WEBHOOK_URL;
  if (!webhook) return;

  const when = formatJst(body.timestamp);
  const payload = {
    text: `:speech_balloon: 新しいフィードバック`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*:speech_balloon: 新しいフィードバックが届きました*`,
        },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `>>> ${escapeForSlack(body.text)}` },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `:page_facing_up: \`${body.page || "(unknown)"}\`  •  :clock3: ${when}`,
          },
        ],
      },
    ],
  };

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.log(
      `[feedback] slack webhook returned ${res.status}: ${await res.text()}`,
    );
  }
}

function escapeForSlack(text: string): string {
  // Slack mrkdwn: escape &, <, > (control chars). Preserve newlines.
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatJst(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      hour12: false,
    });
  } catch {
    return iso;
  }
}
