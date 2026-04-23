"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { DEMO_STORE_IDS } from "@/lib/nightos/constants";
import { isMockAuthDisabled } from "@/lib/nightos/env";
import { mockCasts } from "@/lib/nightos/mock-data";
import { onboardingSchema, signupSchema } from "@/lib/nightos/validation";

export async function mockLogin(castId: string) {
  if (isMockAuthDisabled()) {
    throw new Error("Mock login is disabled on this environment");
  }

  // Validate against known cast IDs so random values can't be set
  const known = mockCasts.some((c) => c.id === castId);
  if (!known) {
    throw new Error("Unknown cast ID");
  }

  cookies().set("nightos.mock-cast-id", castId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: "lax",
  });
  redirect("/");
}

export async function mockLogout() {
  cookies().delete("nightos.mock-cast-id");

  // Also sign out of Supabase if configured
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const { createServerSupabaseClient } = await import(
        "@/lib/supabase/server"
      );
      const supabase = createServerSupabaseClient();
      await supabase.auth.signOut();
    } catch {
      // ignore — cookie cleanup is best-effort
    }
  }

  redirect("/auth/login");
}

export async function emailLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { error: "Supabase が未設定のためメールログインは利用できません" };
  }

  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: `ログインに失敗しました: ${error.message}` };
  }

  // Clear any mock cookie so the Supabase session takes precedence
  cookies().delete("nightos.mock-cast-id");
  redirect("/");
}

/**
 * Register a new user via Supabase Auth. Depending on the project's
 * "Confirm email" setting, the returned session may be null (user has
 * to click the link in their inbox first) or active (session started
 * immediately).
 */
export async function emailSignup(
  formData: FormData,
): Promise<{ error?: string; pendingConfirmation?: boolean }> {
  const parsed = signupSchema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
  });
  if (!parsed.success) {
    return { error: zodFirstMessage(parsed.error) };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { error: "Supabase が未設定のため新規登録は利用できません" };
  }

  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = createServerSupabaseClient();

  const origin = resolveOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.name },
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    return { error: `登録に失敗しました: ${error.message}` };
  }

  // If the project requires email confirmation, session will be null
  // until the user clicks the link.
  if (!data.session) {
    return { pendingConfirmation: true };
  }

  cookies().delete("nightos.mock-cast-id");
  redirect("/onboarding");
}

/**
 * Finalize the new cast record for the logged-in user. Creates the
 * store if the form asked for a brand new one, then inserts a cast
 * row wired to the auth user. Safe to call twice — the cast lookup
 * short-circuits if a row already exists.
 */
export async function completeOnboarding(
  formData: FormData,
): Promise<{ error?: string }> {
  const parsed = onboardingSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    storeId: stringOrUndef(formData.get("storeId")),
    newStoreName: stringOrUndef(formData.get("newStoreName")),
    venueType: String(formData.get("venueType") ?? "cabaret"),
    clubRole: stringOrUndef(formData.get("clubRole")) ?? "help",
  });
  if (!parsed.success) {
    return { error: zodFirstMessage(parsed.error) };
  }
  const input = parsed.data;

  if (!input.storeId && !input.newStoreName) {
    return { error: "店舗を選ぶか、新しい店舗名を入力してください" };
  }
  if (input.storeId && DEMO_STORE_IDS.includes(input.storeId)) {
    return {
      error:
        "デモ用の店舗には参加できません。別の店舗を選ぶか、新しい店舗を作成してください。",
    };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { error: "Supabase が未設定のため登録できません" };
  }

  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "セッションが見つかりません。もう一度ログインしてください。" };
  }

  // Already onboarded?
  const { data: existing } = await supabase
    .from("nightos_casts")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (existing) {
    redirect("/");
  }

  // Resolve / create store.
  let storeId = input.storeId ?? "";
  if (!storeId && input.newStoreName) {
    storeId = `store_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    const { error: storeErr } = await supabase
      .from("nightos_stores")
      .insert({ id: storeId, name: input.newStoreName });
    if (storeErr) {
      return { error: `店舗の作成に失敗しました: ${storeErr.message}` };
    }
  }

  const castId = `cast_${user.id.slice(0, 8)}_${Date.now().toString(36)}`;
  const { error: castErr } = await supabase.from("nightos_casts").insert({
    id: castId,
    store_id: storeId,
    name: input.name,
    club_role: input.clubRole ?? "help",
    auth_user_id: user.id,
  });
  if (castErr) {
    return { error: `キャスト登録に失敗しました: ${castErr.message}` };
  }

  redirect("/");
}

function resolveOrigin(): string {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

function stringOrUndef(v: FormDataEntryValue | null): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length > 0 ? s : undefined;
}

function zodFirstMessage(err: z.ZodError): string {
  return err.issues[0]?.message ?? "入力内容に誤りがあります";
}
