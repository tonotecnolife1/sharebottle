import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mockCasts } from "@/lib/nightos/mock-data";

/**
 * POST /api/setup-auth?secret=nightos-setup-2026
 *
 * Creates 5 test Supabase Auth users and links them to existing
 * cast records via auth_user_id.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY env (only on server).
 *
 * Test accounts:
 *   akari@test.nightos    / nightos2026 → cast1
 *   yuki@test.nightos     / nightos2026 → cast_oneesan2
 *   ayana@test.nightos    / nightos2026 → cast_help2
 *   moe@test.nightos      / nightos2026 → cast_oneesan3
 *   rena@test.nightos     / nightos2026 → cast_oneesan4
 */

const TEST_USERS: { email: string; password: string; castId: string }[] = [
  { email: "akari@test.nightos", password: "nightos2026", castId: "cast1" },
  { email: "yuki@test.nightos", password: "nightos2026", castId: "cast_oneesan2" },
  { email: "ayana@test.nightos", password: "nightos2026", castId: "cast_help2" },
  { email: "moe@test.nightos", password: "nightos2026", castId: "cast_oneesan3" },
  { email: "rena@test.nightos", password: "nightos2026", castId: "cast_oneesan4" },
];

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== "nightos-setup-2026") {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY is required. Get it from Supabase Dashboard → Project Settings → API → service_role key, then set it in env vars.",
      },
      { status: 400 },
    );
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const log: string[] = [];
  const accounts: { email: string; password: string; castId: string; castName: string }[] = [];

  for (const user of TEST_USERS) {
    const cast = mockCasts.find((c) => c.id === user.castId);
    if (!cast) {
      log.push(`Skipped ${user.email}: cast ${user.castId} not found in mock data`);
      continue;
    }

    // Try to create the user
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    let authUserId: string | null = created?.user?.id ?? null;

    if (createErr) {
      // If user already exists, look up the ID
      const isAlreadyExists =
        createErr.message?.toLowerCase().includes("already") ||
        createErr.message?.toLowerCase().includes("registered");
      if (!isAlreadyExists) {
        log.push(`Failed to create ${user.email}: ${createErr.message}`);
        continue;
      }

      const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
      const existing = list?.users.find((u) => u.email === user.email);
      if (!existing) {
        log.push(`User ${user.email} reportedly exists but not found in listUsers`);
        continue;
      }
      authUserId = existing.id;
      log.push(`${user.email}: already exists, reusing`);
    } else {
      log.push(`${user.email}: created`);
    }

    // Link to cast
    if (authUserId) {
      const { error: linkErr } = await admin
        .from("nightos_casts")
        .update({ auth_user_id: authUserId })
        .eq("id", user.castId);
      if (linkErr) {
        log.push(`${user.email}: linked failed — ${linkErr.message}`);
      } else {
        log.push(`${user.email} → ${cast.name} (${user.castId}): linked`);
        accounts.push({
          email: user.email,
          password: user.password,
          castId: user.castId,
          castName: cast.name,
        });
      }
    }
  }

  return NextResponse.json({
    success: true,
    log,
    accounts,
  });
}
