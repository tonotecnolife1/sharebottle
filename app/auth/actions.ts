"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isMockAuthDisabled } from "@/lib/nightos/env";
import { mockCasts } from "@/lib/nightos/mock-data";
import {
  changeStoreSchema,
  signupCastSchema,
  signupCustomerSchema,
  signupOwnerSchema,
  signupStaffSchema,
} from "@/lib/nightos/validation";
import { reportError } from "@/lib/nightos/error-reporter";

// ═══════════════ Mock auth (dev only) ═══════════════

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

// ═══════════════ Email login ═══════════════

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

// ═══════════════ Sign up (per role) ═══════════════
//
// 4 separate server actions, one per app entry point. Each is reached
// from /cast/auth/signup, /store/auth/signup-staff, /store/auth/signup-owner,
// or /customer/auth/signup. The role is *implied by the URL the user
// came from*, never accepted from the client. The role + role-specific
// fields are stashed into auth.users.user_metadata under `pending_*`
// keys; /auth/finalize then materialises the cast / customer row.

interface SignupResult {
  error?: string;
  pendingConfirmation?: boolean;
}

export async function signupAsCast(formData: FormData): Promise<SignupResult> {
  const parsed = signupCastSchema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    inviteCode: String(formData.get("inviteCode") ?? "")
      .replace(/[\s-]/g, "")
      .toUpperCase(),
  });
  if (!parsed.success) return { error: zodFirstMessage(parsed.error) };

  const supabase = await requireSupabase();
  if ("error" in supabase) return supabase;

  const lookup = await lookupStoreByInviteCode(supabase.client, parsed.data.inviteCode);
  if ("error" in lookup) return { error: lookup.error };

  const origin = resolveOrigin();
  const { data, error } = await supabase.client.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.name,
        pending_role: "cast",
        pending_display_name: parsed.data.name,
        pending_invite_code: parsed.data.inviteCode,
      },
      emailRedirectTo: `${origin}/auth/callback?next=/auth/finalize`,
    },
  });

  if (error) return { error: `登録に失敗しました: ${error.message}` };
  if (!data.session) return { pendingConfirmation: true };

  cookies().delete("nightos.mock-cast-id");
  redirect("/auth/finalize");
}

export async function signupAsStaff(formData: FormData): Promise<SignupResult> {
  const parsed = signupStaffSchema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    inviteCode: String(formData.get("inviteCode") ?? "")
      .replace(/[\s-]/g, "")
      .toUpperCase(),
  });
  if (!parsed.success) return { error: zodFirstMessage(parsed.error) };

  const supabase = await requireSupabase();
  if ("error" in supabase) return supabase;

  const lookup = await lookupStoreByInviteCode(supabase.client, parsed.data.inviteCode);
  if ("error" in lookup) return { error: lookup.error };

  const origin = resolveOrigin();
  const { data, error } = await supabase.client.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.name,
        pending_role: "store_staff",
        pending_display_name: parsed.data.name,
        pending_invite_code: parsed.data.inviteCode,
      },
      emailRedirectTo: `${origin}/auth/callback?next=/auth/finalize`,
    },
  });

  if (error) return { error: `登録に失敗しました: ${error.message}` };
  if (!data.session) return { pendingConfirmation: true };

  cookies().delete("nightos.mock-cast-id");
  redirect("/auth/finalize");
}

export async function signupAsOwner(formData: FormData): Promise<SignupResult> {
  const parsed = signupOwnerSchema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    venueType: String(formData.get("venueType") ?? "cabaret"),
    newStoreName: String(formData.get("newStoreName") ?? "").trim(),
  });
  if (!parsed.success) return { error: zodFirstMessage(parsed.error) };

  const supabase = await requireSupabase();
  if ("error" in supabase) return supabase;

  const origin = resolveOrigin();
  const { data, error } = await supabase.client.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.name,
        pending_role: "store_owner",
        pending_display_name: parsed.data.name,
        pending_venue_type: parsed.data.venueType,
        pending_new_store_name: parsed.data.newStoreName,
      },
      emailRedirectTo: `${origin}/auth/callback?next=/auth/finalize`,
    },
  });

  if (error) return { error: `登録に失敗しました: ${error.message}` };
  if (!data.session) return { pendingConfirmation: true };

  cookies().delete("nightos.mock-cast-id");
  redirect("/auth/finalize");
}

export async function signupAsCustomer(
  formData: FormData,
): Promise<SignupResult> {
  const parsed = signupCustomerSchema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
  });
  if (!parsed.success) return { error: zodFirstMessage(parsed.error) };

  const supabase = await requireSupabase();
  if ("error" in supabase) return supabase;

  const origin = resolveOrigin();
  const { data, error } = await supabase.client.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.name,
        pending_role: "customer",
        pending_display_name: parsed.data.name,
      },
      emailRedirectTo: `${origin}/auth/callback?next=/auth/finalize`,
    },
  });

  if (error) return { error: `登録に失敗しました: ${error.message}` };
  if (!data.session) return { pendingConfirmation: true };

  cookies().delete("nightos.mock-cast-id");
  redirect("/auth/finalize");
}

// ═══════════════ Store transfer (migration 009) ═══════════════
//
// "Cast / staff moved to another store" flow. Visible from /settings.
// Implementation:
//   1. Soft-deactivate the user's current cast row (is_active=false,
//      auth_user_id=NULL) so historical visits/bottles/memos at the
//      old store retain attribution.
//   2. Insert a NEW cast row at the new store with the user's
//      auth_user_id and same display name. This is what the user
//      sees on next page load.
//
// The partial unique index from migration 009 ensures auth_user_id is
// unique only across active rows.

export async function changeStore(
  formData: FormData,
): Promise<{ error?: string }> {
  const parsed = changeStoreSchema.safeParse({
    inviteCode: String(formData.get("inviteCode") ?? "")
      .replace(/[\s-]/g, "")
      .toUpperCase(),
  });
  if (!parsed.success) return { error: zodFirstMessage(parsed.error) };

  const supabase = await requireSupabase();
  if ("error" in supabase) return supabase;

  const {
    data: { user },
  } = await supabase.client.auth.getUser();
  if (!user) {
    return { error: "ログインしてからお試しください。" };
  }

  // Look up the new store by invite code
  const lookup = await lookupStoreByInviteCode(
    supabase.client,
    parsed.data.inviteCode,
  );
  if ("error" in lookup) return { error: lookup.error };

  // Find the user's current active cast row
  const { data: oldCast, error: oldErr } = await supabase.client
    .from("nightos_casts")
    .select("id, store_id, name, user_role")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (oldErr) {
    reportError(oldErr, {
      scope: "changeStore.lookup-current",
      userId: user.id,
    });
    return { error: `現在の所属店舗を取得できませんでした: ${oldErr.message}` };
  }
  if (!oldCast) {
    return { error: "現在の所属店舗が見つかりません。" };
  }
  if (oldCast.store_id === lookup.storeId) {
    return { error: "既にこの店舗に所属しています。" };
  }

  const userRole = (oldCast.user_role as "cast" | "store_staff" | "store_owner" | null) ?? "cast";
  if (userRole === "store_owner") {
    return {
      error:
        "店舗オーナーは店舗を移動できません（店舗を譲渡したい場合は管理者にご連絡ください）。",
    };
  }

  // 1. Deactivate the old row (NULL out auth_user_id so the partial
  //    unique on (auth_user_id) WHERE is_active=true allows the new row).
  const { error: deactivateErr } = await supabase.client
    .from("nightos_casts")
    .update({ is_active: false, auth_user_id: null })
    .eq("id", oldCast.id);
  if (deactivateErr) {
    reportError(deactivateErr, {
      scope: "changeStore.deactivate-old",
      userId: user.id,
      extra: { oldCastId: oldCast.id, code: deactivateErr.code },
    });
    return {
      error: `店舗移動の準備に失敗しました: ${deactivateErr.message}`,
    };
  }

  // 2. Insert a new active row at the destination store.
  const newCastId = `cast_${user.id.slice(0, 8)}_${Date.now().toString(36)}`;
  const { error: newErr } = await supabase.client
    .from("nightos_casts")
    .insert({
      id: newCastId,
      store_id: lookup.storeId,
      name: oldCast.name as string,
      user_role: userRole,
      club_role: userRole === "cast" ? "help" : null,
      auth_user_id: user.id,
      is_active: true,
    });
  if (newErr) {
    // Roll back the deactivation so the user can retry.
    await supabase.client
      .from("nightos_casts")
      .update({ is_active: true, auth_user_id: user.id })
      .eq("id", oldCast.id);
    reportError(newErr, {
      scope: "changeStore.insert-new",
      userId: user.id,
      extra: { newCastId, newStoreId: lookup.storeId, code: newErr.code },
    });
    return {
      error: `新しい店舗への所属作成に失敗しました: ${newErr.message}`,
    };
  }

  // Update user_metadata to reflect the new store
  const { data: storeRow } = await supabase.client
    .from("nightos_stores")
    .select("name")
    .eq("id", lookup.storeId)
    .maybeSingle();
  await supabase.client.auth.updateUser({
    data: {
      cast_id: newCastId,
      store_id: lookup.storeId,
      store_name: (storeRow?.name as string | undefined) ?? null,
      store_invite_code: null, // owners only — clear in case it was lingering
    },
  });

  redirect("/");
}

// ═══════════════ Helpers ═══════════════

async function requireSupabase(): Promise<
  | { client: import("@supabase/supabase-js").SupabaseClient }
  | { error: string }
> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { error: "Supabase が未設定のためこの機能は利用できません" };
  }
  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  return { client: createServerSupabaseClient() };
}

async function lookupStoreByInviteCode(
  client: import("@supabase/supabase-js").SupabaseClient,
  code: string,
): Promise<{ storeId: string } | { error: string }> {
  const { data, error } = await client
    .from("nightos_stores")
    .select("id")
    .eq("invite_code", code)
    .maybeSingle();
  if (error) {
    return { error: `招待コードの確認に失敗しました: ${error.message}` };
  }
  if (!data) {
    return {
      error:
        "招待コードが見つかりません。所属店舗のオーナーから 8 文字のコードをご確認ください。",
    };
  }
  return { storeId: data.id as string };
}

// ═══════════════ Password reset ═══════════════

/**
 * Step 1 of password reset: user submits their email; Supabase sends
 * them a magic link to /auth/callback?type=recovery, which then
 * forwards to /auth/update-password.
 */
export async function requestPasswordReset(
  formData: FormData,
): Promise<{ error?: string; sent?: boolean }> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email || !email.includes("@")) {
    return { error: "メールアドレスを入力してください" };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { error: "Supabase が未設定のためこの機能は利用できません" };
  }

  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = createServerSupabaseClient();
  const origin = resolveOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });
  if (error) {
    return { error: `送信に失敗しました: ${error.message}` };
  }
  // Always return sent=true (don't leak whether the email is registered).
  return { sent: true };
}

/**
 * Step 2 of password reset: user (now authenticated by the recovery
 * link cookie) submits a new password.
 */
export async function updatePassword(
  formData: FormData,
): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { error: "パスワードは8文字以上で入力してください" };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { error: "Supabase が未設定のためこの機能は利用できません" };
  }

  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = createServerSupabaseClient();

  // Must have an active session (created by the recovery link)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error:
        "セッションが切れています。もう一度メールのリンクから開き直してください。",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: `パスワード更新に失敗しました: ${error.message}` };
  }
  redirect("/");
}

// ═══════════════ Account deletion ═══════════════

/**
 * Permanently delete the signed-in user's account.
 *
 * Cascades:
 * - nightos_casts (auth_user_id = user.id) → cast row + downstream
 *   visits / bottles / cast_memos via FK ON DELETE CASCADE
 * - customers (auth_user_id = user.id) → customer row
 * - Supabase Auth user via admin API (requires SERVICE_ROLE_KEY)
 *
 * After deletion the session cookie is cleared and the user lands on
 * /auth/login.
 */
export async function deleteAccount(): Promise<{ error?: string }> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { error: "Supabase が未設定のためこの機能は利用できません" };
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      error:
        "退会処理のサーバー側の権限が未設定です。管理者にご連絡ください。",
    };
  }

  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "ログインしてからお試しください。" };
  }

  // 1. Delete the cast row (FKs cascade to visits / bottles / memos).
  //    Includes any deactivated rows where auth_user_id was NULL'd —
  //    those need a separate cleanup since they're no longer tied to
  //    this user. For MVP, we leave them (historical data preserved).
  const { error: castErr } = await supabase
    .from("nightos_casts")
    .delete()
    .eq("auth_user_id", user.id);
  if (castErr) {
    reportError(castErr, {
      scope: "deleteAccount.cast-delete",
      userId: user.id,
      extra: { code: castErr.code },
    });
    return {
      error: `データの削除に失敗しました: ${castErr.message}`,
    };
  }

  // 1b. Delete the customer row if any (self-signed-up customer).
  const { error: custErr } = await supabase
    .from("customers")
    .delete()
    .eq("auth_user_id", user.id);
  if (custErr) {
    reportError(custErr, {
      scope: "deleteAccount.customer-delete",
      userId: user.id,
      extra: { code: custErr.code },
    });
    // Non-fatal — proceed to auth user deletion regardless.
  }

  // 2. Delete the auth user via service role
  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { error: authErr } = await admin.auth.admin.deleteUser(user.id);
  if (authErr) {
    // Cast row is already deleted at this point — surface the auth
    // error but don't roll back; the user can retry deletion later
    // and we won't double-delete the (already-gone) cast row.
    reportError(authErr, {
      scope: "deleteAccount.auth-user-delete",
      userId: user.id,
    });
    return {
      error: `アカウントの削除に失敗しました: ${authErr.message}`,
    };
  }

  await supabase.auth.signOut();
  cookies().delete("nightos.mock-cast-id");
  redirect("/auth/login?deleted=1");
}

function resolveOrigin(): string {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

function zodFirstMessage(err: z.ZodError): string {
  return err.issues[0]?.message ?? "入力内容に誤りがあります";
}
