import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 *
 * Returns the connectivity status for Supabase and Claude API.
 * Used by the client-side ConnectionStatus banner to warn users
 * when the app is running on mock/stub data.
 */
export async function GET() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const anthropicConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

  let supabaseOk = false;
  if (supabaseConfigured) {
    try {
      const { createServerSupabaseClient } = await import(
        "@/lib/supabase/server"
      );
      const supabase = createServerSupabaseClient();
      const { error } = await supabase
        .from("nightos_stores")
        .select("id")
        .limit(1);
      supabaseOk = !error;
    } catch {
      supabaseOk = false;
    }
  }

  return NextResponse.json({
    supabase: supabaseConfigured
      ? supabaseOk
        ? "connected"
        : "error"
      : "mock",
    ai: anthropicConfigured ? "configured" : "stub",
  });
}
