/**
 * Materialise the cast / customer row for a freshly-confirmed user.
 *
 * The new signup flow stores the role + role-specific data in
 * auth.users.user_metadata under `pending_*` keys when supabase.auth.signUp
 * is called. Once the user has a valid session (either immediately, when
 * email confirmation is off, or after the email link in
 * /auth/callback), we read those keys and create the row that
 * actually represents the user inside our domain.
 *
 * This module is server-only (relies on createServerSupabaseClient).
 *
 * Idempotent: if the row already exists, we just return its destination
 * URL — safe to call multiple times.
 */

import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { reportError } from "./error-reporter";
import { generateInviteCode } from "./supabase-real";
import { homePathForRole } from "./auth";
import type { CastUserRole } from "@/types/nightos";

export type FinalizeRole = CastUserRole | "customer";

export interface FinalizeResult {
  /** Where to send the user after we're done (role's home or onboarding/login on error). */
  redirectTo: string;
  /** Friendly error message if finalisation failed. The caller may
   *  surface this; the home redirect remains best-effort. */
  error?: string;
}

/**
 * Read pending_* metadata from auth.users and create the corresponding
 * row in nightos_casts / customers. Updates user_metadata to clear
 * `pending_*` and set the canonical `role` / `store_id` / etc.
 */
export async function finalizeSignedUpUser(): Promise<FinalizeResult> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { redirectTo: "/auth/login", error: "セッションが見つかりません" };
  }

  // Already finalised? Idempotent short-circuit.
  const [castRes, custRes] = await Promise.all([
    supabase
      .from("nightos_casts")
      .select("id, store_id, user_role")
      .eq("auth_user_id", user.id)
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("customers")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle(),
  ]);

  if (castRes.data) {
    return {
      redirectTo: homePathForRole(
        (castRes.data.user_role as CastUserRole) ?? "cast",
      ),
    };
  }
  if (custRes.data) {
    return { redirectTo: "/customer/home" };
  }

  // Pull role + role-specific data from user_metadata.
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const role = meta.pending_role as FinalizeRole | undefined;
  const displayName =
    (meta.pending_display_name as string | undefined) ??
    (meta.display_name as string | undefined) ??
    "";

  if (!role) {
    // No pending role. This can happen when an already-finalised user's
    // cast row exists but auth_user_id is unlinked (seeded rows, store
    // transfer edge cases). Try to recover via canonical cast_id / customer_id
    // stored in metadata before giving up with a login redirect.
    const canonicalRole = meta.role as string | undefined;
    const castId = meta.cast_id as string | undefined;
    const customerId = meta.customer_id as string | undefined;

    if (castId && canonicalRole && canonicalRole !== "customer") {
      const { data: castRow } = await supabase
        .from("nightos_casts")
        .select("id, user_role, auth_user_id")
        .eq("id", castId)
        .eq("is_active", true)
        .maybeSingle();
      if (
        castRow &&
        (castRow.auth_user_id === null || castRow.auth_user_id === user.id)
      ) {
        if (castRow.auth_user_id === null) {
          await supabase
            .from("nightos_casts")
            .update({ auth_user_id: user.id })
            .eq("id", castId);
        }
        return {
          redirectTo: homePathForRole(
            (castRow.user_role as CastUserRole) ?? "cast",
          ),
        };
      }
    }

    if (customerId && canonicalRole === "customer") {
      const { data: custRow } = await supabase
        .from("customers")
        .select("id, auth_user_id")
        .eq("id", customerId)
        .maybeSingle();
      if (
        custRow &&
        (custRow.auth_user_id === null || custRow.auth_user_id === user.id)
      ) {
        if (custRow.auth_user_id === null) {
          await supabase
            .from("customers")
            .update({ auth_user_id: user.id })
            .eq("id", customerId);
        }
        return { redirectTo: "/customer/home" };
      }
    }

    return {
      redirectTo: "/auth/login",
      error: "登録情報が見つかりませんでした。再度サインアップしてください。",
    };
  }

  if (role === "customer") {
    return await finalizeCustomer(supabase, user.id, displayName);
  }

  if (role === "store_owner") {
    const venueType =
      (meta.pending_venue_type as "club" | "cabaret" | undefined) ?? "cabaret";
    const newStoreName =
      (meta.pending_new_store_name as string | undefined) ?? "";
    return await finalizeOwner(
      supabase,
      user.id,
      displayName,
      venueType,
      newStoreName,
    );
  }

  // cast / store_staff: join an existing store by invite code.
  const inviteCode = (meta.pending_invite_code as string | undefined) ?? "";
  return await finalizeJoiner(supabase, user.id, role, displayName, inviteCode);
}

async function finalizeCustomer(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string,
  name: string,
): Promise<FinalizeResult> {
  const customerId = `cust_self_${userId.slice(0, 8)}_${Date.now().toString(36)}`;

  // customers.store_id is NOT NULL in the current schema. For a
  // self-signed-up customer we don't have a store yet, so we attach to
  // the oldest known store as a placeholder. The customer's bottles /
  // coupons accumulate as casts at real stores register them.
  const { data: anyStore } = await supabase
    .from("nightos_stores")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const placeholderStoreId =
    (anyStore?.id as string | undefined) ?? "store1";

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
      scope: "finalizeSignup.customer-insert",
      userId,
      extra: { customerId, code: custErr.code, hint: custErr.hint },
    });
    return {
      redirectTo: "/customer/auth/login",
      error: `登録に失敗しました: ${custErr.message}`,
    };
  }

  await writeCanonicalMetadata(supabase, {
    role: "customer",
    customer_id: customerId,
    display_name: name,
  });

  return { redirectTo: "/customer/home" };
}

async function finalizeOwner(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string,
  name: string,
  venueType: "club" | "cabaret",
  newStoreName: string,
): Promise<FinalizeResult> {
  const storeId = `store_${userId.slice(0, 8)}_${Date.now().toString(36)}`;
  const inviteCode = generateInviteCode();

  const { error: storeErr } = await supabase.from("nightos_stores").insert({
    id: storeId,
    name: newStoreName,
    venue_type: venueType,
    invite_code: inviteCode,
  });
  if (storeErr) {
    reportError(storeErr, {
      scope: "finalizeSignup.store-insert",
      userId,
      extra: { storeId, code: storeErr.code, hint: storeErr.hint },
    });
    return {
      redirectTo: "/store/auth/login",
      error: `店舗の作成に失敗しました: ${storeErr.message}`,
    };
  }

  const castId = `cast_${userId.slice(0, 8)}_${Date.now().toString(36)}`;
  const { error: castErr } = await supabase.from("nightos_casts").insert({
    id: castId,
    store_id: storeId,
    name,
    user_role: "store_owner",
    club_role: "mama", // owner はママ相当
    auth_user_id: userId,
    is_active: true,
  });
  if (castErr) {
    reportError(castErr, {
      scope: "finalizeSignup.owner-cast-insert",
      userId,
      castId,
      extra: { storeId, code: castErr.code, hint: castErr.hint },
    });
    return {
      redirectTo: "/store/auth/login",
      error: `登録に失敗しました: ${castErr.message}`,
    };
  }

  await writeCanonicalMetadata(supabase, {
    role: "store_owner",
    cast_id: castId,
    store_id: storeId,
    store_name: newStoreName,
    store_invite_code: inviteCode,
    club_role: "mama",
    display_name: name,
  });

  return { redirectTo: "/store" };
}

async function finalizeJoiner(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string,
  role: "cast" | "store_staff",
  name: string,
  inviteCode: string,
): Promise<FinalizeResult> {
  const normalised = inviteCode.replace(/[\s-]/g, "").toUpperCase();
  if (!normalised) {
    return {
      redirectTo: role === "cast" ? "/cast/auth/login" : "/store/auth/login",
      error: "招待コードが見つかりません。再度サインアップしてください。",
    };
  }

  const { data: store, error: lookupErr } = await supabase
    .from("nightos_stores")
    .select("id, name")
    .eq("invite_code", normalised)
    .maybeSingle();
  if (lookupErr) {
    reportError(lookupErr, {
      scope: "finalizeSignup.invite-lookup",
      userId,
      extra: { code: normalised },
    });
    return {
      redirectTo: role === "cast" ? "/cast/auth/login" : "/store/auth/login",
      error: `招待コードの確認に失敗しました: ${lookupErr.message}`,
    };
  }
  if (!store) {
    return {
      redirectTo: role === "cast" ? "/cast/auth/login" : "/store/auth/login",
      error:
        "招待コードが無効です。所属店舗のオーナーにコードをご確認ください。",
    };
  }

  const castId = `cast_${userId.slice(0, 8)}_${Date.now().toString(36)}`;
  const { error: castErr } = await supabase.from("nightos_casts").insert({
    id: castId,
    store_id: store.id as string,
    name,
    user_role: role,
    // mama/oneesan/help は signup では選ばせず、デフォルト help に
    // 固定。店舗オーナーが後から /mama/team から昇格させられる。
    club_role: role === "cast" ? "help" : null,
    auth_user_id: userId,
    is_active: true,
  });
  if (castErr) {
    reportError(castErr, {
      scope: "finalizeSignup.joiner-cast-insert",
      userId,
      castId,
      extra: { storeId: store.id, role, code: castErr.code },
    });
    return {
      redirectTo: role === "cast" ? "/cast/auth/login" : "/store/auth/login",
      error: `登録に失敗しました: ${castErr.message}`,
    };
  }

  await writeCanonicalMetadata(supabase, {
    role,
    cast_id: castId,
    store_id: store.id as string,
    store_name: (store.name as string | undefined) ?? null,
    club_role: role === "cast" ? "help" : null,
    display_name: name,
  });

  return { redirectTo: homePathForRole(role) };
}

/**
 * After the cast/customer row is in place, replace the `pending_*`
 * keys with canonical role / store / display info on user_metadata so
 * the Supabase Auth dashboard reflects the final state.
 */
async function writeCanonicalMetadata(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  payload: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    data: {
      // Canonical fields
      ...payload,
      // Clear pending_* by setting to null
      pending_role: null,
      pending_display_name: null,
      pending_invite_code: null,
      pending_venue_type: null,
      pending_new_store_name: null,
    },
  });
  if (error) {
    reportError(error, {
      scope: "finalizeSignup.metadata-update",
      extra: { payload },
    });
    // Non-fatal — the cast/customer row is already in place.
  }
}
