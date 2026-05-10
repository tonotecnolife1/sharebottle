import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isSetupRequestAuthorized } from "@/lib/nightos/admin-gate";

/**
 * POST /api/setup/new-store?secret=<NIGHTOS_SETUP_SECRET>
 *
 * Creates a new store and its owner account. Used by developers
 * to onboard new nightclub clients — store owners cannot self-register.
 *
 * Body: { email, password, ownerName, storeName, venueType }
 *
 * What it does:
 *   1. Creates a Supabase Auth user (email confirmed immediately)
 *   2. Creates a nightos_stores row with auto-generated invite_code
 *   3. Creates a nightos_casts row (user_role: store_owner, club_role: mama)
 *   4. Links auth_user_id → nightos_casts
 *
 * Returns: { storeId, storeName, inviteCode, castId, email }
 */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!isSetupRequestAuthorized(secret)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required." },
      { status: 400 },
    );
  }

  let body: {
    email?: string;
    password?: string;
    ownerName?: string;
    storeName?: string;
    venueType?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, password, ownerName, storeName, venueType } = body;

  if (!email || !password || !ownerName || !storeName || !venueType) {
    return NextResponse.json(
      { error: "email, password, ownerName, storeName, venueType are required" },
      { status: 400 },
    );
  }
  if (venueType !== "club" && venueType !== "cabaret") {
    return NextResponse.json(
      { error: "venueType must be 'club' or 'cabaret'" },
      { status: 400 },
    );
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // 1. Create auth user
  const { data: created, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: ownerName,
      role: "store_owner",
    },
  });

  if (authErr) {
    return NextResponse.json(
      { error: `Auth user creation failed: ${authErr.message}` },
      { status: 400 },
    );
  }

  const authUserId = created.user.id;

  // 2. Generate IDs and invite code
  const storeId = `store-${Date.now()}`;
  const castId = `cast-owner-${Date.now()}`;
  const inviteCode = generateInviteCode();

  // 3. Create store
  const { error: storeErr } = await admin.from("nightos_stores").insert({
    id: storeId,
    name: storeName,
    venue_type: venueType,
    invite_code: inviteCode,
  });

  if (storeErr) {
    // Clean up auth user to avoid orphaned accounts
    await admin.auth.admin.deleteUser(authUserId);
    return NextResponse.json(
      { error: `Store creation failed: ${storeErr.message}` },
      { status: 500 },
    );
  }

  // 4. Create cast row for the owner
  const { error: castErr } = await admin.from("nightos_casts").insert({
    id: castId,
    store_id: storeId,
    name: ownerName,
    auth_user_id: authUserId,
    user_role: "store_owner",
    club_role: "mama",
    nomination_count: 0,
    monthly_sales: 0,
    repeat_rate: 0,
    is_active: true,
  });

  if (castErr) {
    await admin.auth.admin.deleteUser(authUserId);
    await admin.from("nightos_stores").delete().eq("id", storeId);
    return NextResponse.json(
      { error: `Cast record creation failed: ${castErr.message}` },
      { status: 500 },
    );
  }

  // 5. Write canonical metadata to auth.users
  await admin.auth.admin.updateUserById(authUserId, {
    user_metadata: {
      display_name: ownerName,
      role: "store_owner",
      cast_id: castId,
      store_id: storeId,
      store_name: storeName,
      store_invite_code: inviteCode,
      club_role: "mama",
    },
  });

  return NextResponse.json({
    success: true,
    email,
    storeId,
    storeName,
    castId,
    inviteCode,
    venueType,
    message: `Store "${storeName}" created. Owner can log in at /store/auth/login`,
  });
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}
