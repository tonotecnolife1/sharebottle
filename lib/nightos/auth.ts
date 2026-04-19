import { cookies } from "next/headers";
import type { Cast } from "@/types/nightos";
import { CURRENT_CAST_ID, CURRENT_MAMA_ID } from "./constants";
import { isMockAuthDisabled } from "./env";
import { mockCasts } from "./mock-data";

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export interface AuthSession {
  userId: string;
  cast: Cast;
}

/**
 * Get the current authenticated cast from the Supabase session.
 * Falls back to mock cast when Supabase is not configured.
 *
 * In mock mode, reads from a cookie `nightos.mock-cast-id` so the
 * role selector can switch between personas without real auth.
 */
export async function getCurrentCast(): Promise<Cast | null> {
  if (!isSupabaseConfigured()) {
    return getMockCast();
  }

  try {
    const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { getCastByAuthUserId } = await import("./supabase-real");
    return getCastByAuthUserId(user.id);
  } catch {
    return getMockCast();
  }
}

/**
 * Get the current cast ID for queries. Returns the authenticated
 * cast's ID, or falls back to the hardcoded mock ID.
 */
export async function getCurrentCastId(): Promise<string> {
  const cast = await getCurrentCast();
  return cast?.id ?? CURRENT_CAST_ID;
}

/**
 * For manager views: get the cast ID of the current user if they
 * have a management role (mama/oneesan), otherwise fall back to
 * CURRENT_MAMA_ID.
 */
export async function getCurrentManagerId(): Promise<string> {
  const cast = await getCurrentCast();
  if (cast && (cast.club_role === "mama" || cast.club_role === "oneesan")) {
    return cast.id;
  }
  return CURRENT_MAMA_ID;
}

/**
 * Check if the current session is authenticated (real or mock).
 */
export async function isAuthenticated(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    // Without Supabase, only mock auth can authenticate — and only if enabled.
    if (isMockAuthDisabled()) return false;
    return !!cookies().get("nightos.mock-cast-id")?.value;
  }
  try {
    const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return true;
    // Supabase configured but no session: fall back to mock cookie if allowed
    if (isMockAuthDisabled()) return false;
    return !!cookies().get("nightos.mock-cast-id")?.value;
  } catch {
    return false;
  }
}

function getMockCast(): Cast | null {
  if (isMockAuthDisabled()) return null;
  const cookieStore = cookies();
  const mockCastId = cookieStore.get("nightos.mock-cast-id")?.value;
  if (!mockCastId) return null;
  return mockCasts.find((c) => c.id === mockCastId) ?? null;
}
