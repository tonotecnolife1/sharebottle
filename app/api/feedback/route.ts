import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  DEMO_CAST_IDS,
  DEMO_STORE_IDS,
} from "@/lib/nightos/constants";

export const dynamic = "force-dynamic";

interface SubmitterInfo {
  /** Short human label for Slack, e.g. "tester (akari@foo.com)". */
  label: string;
  /** Stable tag for filtering: "demo" | "tester" | "anonymous". */
  kind: "demo" | "tester" | "anonymous";
}

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

  const submitter = await identifySubmitter();

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
    console.log("[feedback]", JSON.stringify({ ...body, submitter }));
  }

  // Fire-and-forget Slack notification. Never blocks the response.
  await notifySlack(body, submitter).catch(() => {});

  return NextResponse.json({ ok: true });
}

/**
 * Figure out whether this feedback is coming from a demo viewer (mock
 * cookie as one of the seeded personas) or a signed-up tester (real
 * Supabase auth session). Falls back to "anonymous" so the pipeline
 * never hard-fails if a browser clears cookies.
 */
async function identifySubmitter(): Promise<SubmitterInfo> {
  const mockCastId = cookies().get("nightos.mock-cast-id")?.value;
  if (mockCastId && DEMO_CAST_IDS.includes(mockCastId)) {
    return { label: `demo (${mockCastId})`, kind: "demo" };
  }

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const { createServerSupabaseClient } = await import(
        "@/lib/supabase/server"
      );
      const supabase = createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: cast } = await supabase
          .from("nightos_casts")
          .select("name, store_id")
          .eq("auth_user_id", user.id)
          .maybeSingle();
        const storeId = cast?.store_id as string | undefined;
        const kind: SubmitterInfo["kind"] =
          storeId && DEMO_STORE_IDS.includes(storeId) ? "demo" : "tester";
        const label = cast?.name
          ? `${kind} (${cast.name} / ${user.email ?? "no-email"})`
          : `${kind} (${user.email ?? "no-email"})`;
        return { label, kind };
      }
    } catch {
      // fall through to anonymous
    }
  }

  return { label: "anonymous", kind: "anonymous" };
}

async function notifySlack(
  body: {
    text: string;
    page: string;
    timestamp: string;
  },
  submitter: SubmitterInfo,
): Promise<void> {
  const webhook = process.env.SLACK_FEEDBACK_WEBHOOK_URL;
  if (!webhook) return;

  const when = formatJst(body.timestamp);
  const kindEmoji =
    submitter.kind === "tester"
      ? ":bust_in_silhouette:"
      : submitter.kind === "demo"
        ? ":movie_camera:"
        : ":question:";
  const headerTag =
    submitter.kind === "tester"
      ? "(テスター)"
      : submitter.kind === "demo"
        ? "(デモ)"
        : "";

  const payload = {
    text: `:speech_balloon: 新しいフィードバック ${headerTag}`.trim(),
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*:speech_balloon: 新しいフィードバック ${headerTag}*`.trim(),
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
            text: `${kindEmoji} ${escapeForSlack(submitter.label)}  •  :page_facing_up: \`${body.page || "(unknown)"}\`  •  :clock3: ${when}`,
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
