"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { DEMO_STORE_IDS } from "@/lib/nightos/constants";
import { isMockAuthDisabled } from "@/lib/nightos/env";
import { mockCasts } from "@/lib/nightos/mock-data";
import {
  onboardingSchema,
  signupSchema,
  type OnboardingInput,
} from "@/lib/nightos/validation";
import { reportError } from "@/lib/nightos/error-reporter";

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
 * Finalize the account-level role for the signed-in user (migration 008).
 *
 * Branches by `role`:
 *   - `store_owner` : creates a new store + owner cast row
 *   - `cast`        : joins an existing store via invite code, sets club_role
 *   - `store_staff` : joins an existing store via invite code
 *   - `customer`    : creates a customers row linked by auth_user_id
 *
 * Validation is delegated to onboardingSchema (discriminatedUnion).
 *
 * Idempotent: if a cast OR customer row already exists for this user,
 * redirects to "/" instead of double-inserting.
 */
export async function completeOnboarding(
  formData: FormData,
): Promise<{ error?: string }> {
  const rawRole = String(formData.get("role") ?? "").trim();
  // Pull all known fields; the discriminated union picks what it needs.
  const parsed = onboardingSchema.safeParse({
    role: rawRole,
    name: String(formData.get("name") ?? "").trim(),
    venueType: stringOrUndef(formData.get("venueType")) ?? "cabaret",
    newStoreName: stringOrUndef(formData.get("newStoreName")) ?? "",
    inviteCode: (stringOrUndef(formData.get("inviteCode")) ?? "")
      .replace(/[\s-]/g, "")
      .toUpperCase(),
    clubRole: stringOrUndef(formData.get("clubRole")) ?? "help",
  });
  if (!parsed.success) {
    return { error: zodFirstMessage(parsed.error) };
  }
  const input = parsed.data;

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
    return {
      error: "セッションが見つかりません。もう一度ログインしてください。",
    };
  }

  // Idempotency: already a cast or customer? Just redirect.
  const [{ data: existingCast }, { data: existingCustomer }] = await Promise.all(
    [
      supabase
        .from("nightos_casts")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle(),
      supabase
        .from("customers")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle(),
    ],
  );
  if (existingCast || existingCustomer) {
    redirect("/");
  }

  if (input.role === "customer") {
    return await onboardCustomer(supabase, user.id, input.name);
  }

  // All non-customer roles create a nightos_casts row.
  let storeId: string;
  if (input.role === "store_owner") {
    const created = await createStoreForOwner(supabase, user.id, input);
    if ("error" in created) return { error: created.error };
    storeId = created.storeId;
  } else {
    // cast / store_staff: invite code → existing store
    const looked = await lookupStoreByInvite(supabase, user.id, input.inviteCode);
    if ("error" in looked) return { error: looked.error };
    storeId = looked.storeId;
  }

  return await onboardCastRow(supabase, user.id, storeId, input);
}

// ─── Onboarding helpers ──────────────────────────────────────────

type OnboardingResult = { error?: string } | never;

/**
 * Write the user's role + store info to auth.users.user_metadata so it
 * shows up in the Supabase Authentication → Users dashboard
 * (click into a user → "User Metadata" panel).
 *
 * Non-fatal: if the update fails the redirect still happens.
 * Source of truth is still nightos_casts / customers + the SQL view in
 * supabase/USERS_VIEW.md — this is a convenience surface only.
 */
async function setUserMetadata(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  payload: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase.auth.updateUser({ data: payload });
  if (error) {
    reportError(error, {
      scope: "onboarding.metadata-update",
      extra: { payload },
    });
  }
}

async function onboardCustomer(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
  name: string,
): Promise<OnboardingResult> {
  const customerId = `cust_self_${userId.slice(0, 8)}_${Date.now().toString(36)}`;
  // 来店客はサインアップ時点では店舗紐付けなし。store_id は最初の来店登録で
  // 店舗側スタッフが紐付ける。MVP 期は CURRENT_STORE_ID をプレースホルダ
  // として使いたいところだが、本番では各店舗の DB が共通なので NULLABLE 化
  // が望ましい — マイグレーションで store_id を nullable にする検討は別途。
  // 暫定: customers.store_id NOT NULL のため、最初に登録された (= owner が
  // 作った) 店舗を取得して紐付ける。実害は customer/home の集計が一店舗
  // に偏ること程度。
  const { data: anyStore } = await supabase
    .from("nightos_stores")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const placeholderStoreId = (anyStore?.id as string | undefined) ?? "store1";

  const { error: custErr } = await supabase.from("customers").insert({
    id: customerId,
    store_id: placeholderStoreId,
    cast_id: null,
    name,
    auth_user_id: userId,
    funnel_stage: "store_only",
  });
  if (custErr) {
    reportError(custErr, {
      scope: "onboarding.customer-insert",
      userId,
      extra: { customerId, code: custErr.code, hint: custErr.hint },
    });
    return {
      error: `登録に失敗しました: ${custErr.message}${
        custErr.hint ? `（ヒント: ${custErr.hint}）` : ""
      }`,
    };
  }

  await setUserMetadata(supabase, {
    role: "customer",
    customer_id: customerId,
    display_name: name,
  });

  redirect("/");
}

async function createStoreForOwner(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
  input: Extract<OnboardingInput, { role: "store_owner" }>,
): Promise<{ storeId: string } | { error: string }> {
  const storeId = `store_${userId.slice(0, 8)}_${Date.now().toString(36)}`;
  const { generateInviteCode } = await import("@/lib/nightos/supabase-real");
  const inviteCode = generateInviteCode();

  const { error: storeErr } = await supabase.from("nightos_stores").insert({
    id: storeId,
    name: input.newStoreName,
    venue_type: input.venueType,
    invite_code: inviteCode,
  });
  if (storeErr) {
    reportError(storeErr, {
      scope: "onboarding.store-insert",
      userId,
      extra: { storeId, code: storeErr.code, hint: storeErr.hint },
    });
    return {
      error: `店舗の作成に失敗しました: ${storeErr.message}${
        storeErr.hint ? `（ヒント: ${storeErr.hint}）` : ""
      }`,
    };
  }
  return { storeId };
}

async function lookupStoreByInvite(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
  code: string,
): Promise<{ storeId: string } | { error: string }> {
  if (DEMO_STORE_IDS.length > 0) {
    // Belt-and-suspenders: prevent self-signup into the demo tenancy
    const { data: demo } = await supabase
      .from("nightos_stores")
      .select("id")
      .in("id", DEMO_STORE_IDS as string[])
      .eq("invite_code", code)
      .maybeSingle();
    if (demo) {
      return {
        error:
          "このコードはデモ用の店舗のものです。所属店舗のオーナーから別のコードを受け取ってください。",
      };
    }
  }

  const { data: store, error } = await supabase
    .from("nightos_stores")
    .select("id")
    .eq("invite_code", code)
    .maybeSingle();
  if (error) {
    reportError(error, {
      scope: "onboarding.invite-lookup",
      userId,
      extra: { code, supabaseCode: error.code },
    });
    return { error: `招待コードの確認に失敗しました: ${error.message}` };
  }
  if (!store) {
    return {
      error:
        "招待コードが見つかりません。所属店舗のオーナーにコードをご確認ください。",
    };
  }
  return { storeId: store.id as string };
}

async function onboardCastRow(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
  storeId: string,
  input: Extract<
    OnboardingInput,
    { role: "cast" | "store_staff" | "store_owner" }
  >,
): Promise<OnboardingResult> {
  const castId = `cast_${userId.slice(0, 8)}_${Date.now().toString(36)}`;
  const clubRole =
    input.role === "cast"
      ? input.clubRole
      : input.role === "store_owner"
        ? "mama" // owner はママ相当として扱う（club venue のみ意味あり）
        : null;

  const { error: castErr } = await supabase.from("nightos_casts").insert({
    id: castId,
    store_id: storeId,
    name: input.name,
    user_role: input.role,
    club_role: clubRole,
    auth_user_id: userId,
  });
  if (castErr) {
    reportError(castErr, {
      scope: "onboarding.cast-insert",
      userId,
      castId,
      extra: { storeId, role: input.role, code: castErr.code },
    });
    return {
      error: `登録に失敗しました: ${castErr.message}${
        castErr.hint ? `（ヒント: ${castErr.hint}）` : ""
      }`,
    };
  }

  // Read-back check (RLS / migration 006 が当たっているかの保険)
  const { data: verify, error: verifyErr } = await supabase
    .from("nightos_casts")
    .select("id")
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (verifyErr || !verify) {
    reportError(verifyErr ?? new Error("read-back returned no row"), {
      scope: "onboarding.post-insert-readback",
      userId,
      castId,
      extra: { storeId, role: input.role },
    });
    return {
      error:
        "登録は試行できましたが、データを保存できませんでした。Supabase の migration 006 / 007 が適用されているか確認してください。",
    };
  }

  // Pull the store name + invite code (for owner) so user_metadata is
  // self-explanatory in the Supabase Auth dashboard.
  const { data: storeRow } = await supabase
    .from("nightos_stores")
    .select("name, invite_code")
    .eq("id", storeId)
    .maybeSingle();

  await setUserMetadata(supabase, {
    role: input.role,
    cast_id: castId,
    store_id: storeId,
    store_name: (storeRow?.name as string | undefined) ?? null,
    store_invite_code:
      input.role === "store_owner"
        ? ((storeRow?.invite_code as string | undefined) ?? null)
        : undefined,
    club_role: clubRole,
    display_name: input.name,
  });

  redirect("/");
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

  // 1. Delete the cast row (FKs cascade to visits / bottles / memos)
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

function stringOrUndef(v: FormDataEntryValue | null): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length > 0 ? s : undefined;
}

function zodFirstMessage(err: z.ZodError): string {
  return err.issues[0]?.message ?? "入力内容に誤りがあります";
}
