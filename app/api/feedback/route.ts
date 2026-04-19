import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/feedback
 *
 * Stores user feedback. When Supabase is configured, inserts into
 * a `feedback` table. Otherwise logs to stdout (visible in Vercel
 * function logs).
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

  // Try Supabase first
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const { createServerSupabaseClient } = await import(
        "@/lib/supabase/server"
      );
      const supabase = createServerSupabaseClient();
      await supabase.from("feedback").insert({
        text: body.text,
        page: body.page,
        created_at: body.timestamp,
      });
    } catch (err) {
      // Table might not exist — log to console as fallback
      console.log("[feedback]", JSON.stringify(body));
    }
  } else {
    console.log("[feedback]", JSON.stringify(body));
  }

  return NextResponse.json({ ok: true });
}
