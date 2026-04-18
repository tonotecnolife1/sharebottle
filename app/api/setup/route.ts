import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  mockCasts,
  mockCustomers,
  mockBottles,
  mockVisits,
  mockCastMemos,
  mockDouhans,
  mockCastGoals,
  mockStores,
} from "@/lib/nightos/mock-data";

/**
 * POST /api/setup
 * Supabase にスキーマ＋テストデータを一括投入する。
 * 一度実行すれば OK。重複は ON CONFLICT で無視。
 */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== "nightos-setup-2026") {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 400 },
    );
  }

  const supabase = createServerSupabaseClient();
  const log: string[] = [];

  try {
    // 1. Create tables via raw SQL (idempotent)
    const { error: schemaErr } = await supabase.rpc("exec_sql", {
      sql: SCHEMA_SQL,
    });
    if (schemaErr) {
      log.push(`Schema via RPC failed (expected if RPC not set up): ${schemaErr.message}`);
      log.push("Skipping schema creation — apply migrations manually via Supabase Dashboard > SQL Editor");
    } else {
      log.push("Schema applied successfully");
    }

    // 2. Seed stores
    const { error: storeErr } = await supabase
      .from("nightos_stores")
      .upsert(
        mockStores.map((s) => ({ id: s.id, name: s.name })),
        { onConflict: "id" },
      );
    log.push(storeErr ? `Stores: ${storeErr.message}` : `Stores: ${mockStores.length} upserted`);

    // 3. Seed casts
    const castRows = mockCasts
      .filter((c) => c.store_id === "store1")
      .map((c) => ({
        id: c.id,
        store_id: c.store_id,
        name: c.name,
        nomination_count: c.nomination_count,
        monthly_sales: c.monthly_sales,
        repeat_rate: c.repeat_rate,
        club_role: c.club_role ?? null,
        assigned_oneesan_id: c.assigned_oneesan_id ?? null,
      }));
    // Insert without assigned_oneesan_id first (to avoid FK issues)
    const castsNoRef = castRows.map((c) => ({ ...c, assigned_oneesan_id: null }));
    const { error: castErr } = await supabase
      .from("nightos_casts")
      .upsert(castsNoRef, { onConflict: "id" });
    log.push(castErr ? `Casts (base): ${castErr.message}` : `Casts: ${castRows.length} upserted`);

    // Update assigned_oneesan_id
    for (const c of castRows.filter((c) => c.assigned_oneesan_id)) {
      await supabase
        .from("nightos_casts")
        .update({ assigned_oneesan_id: c.assigned_oneesan_id })
        .eq("id", c.id);
    }
    log.push("Cast hierarchy updated");

    // 4. Seed customers (without referral links first)
    const custRows = mockCustomers
      .filter((c) => c.store_id === "store1")
      .map((c) => ({
        id: c.id,
        store_id: c.store_id,
        cast_id: c.cast_id,
        name: c.name,
        birthday: c.birthday,
        job: c.job,
        favorite_drink: c.favorite_drink,
        category: c.category,
        store_memo: c.store_memo,
        funnel_stage: c.funnel_stage ?? "store_only",
        line_exchanged_cast_id: c.line_exchanged_cast_id ?? null,
        line_exchanged_at: c.line_exchanged_at ?? null,
        manager_cast_id: c.manager_cast_id ?? null,
      }));
    const { error: custErr } = await supabase
      .from("customers")
      .upsert(custRows, { onConflict: "id" });
    log.push(custErr ? `Customers: ${custErr.message}` : `Customers: ${custRows.length} upserted`);

    // 5. Seed bottles
    const bottleRows = mockBottles
      .filter((b) => b.store_id === "store1")
      .map((b) => ({
        id: b.id,
        store_id: b.store_id,
        customer_id: b.customer_id,
        brand: b.brand,
        total_glasses: b.total_glasses,
        remaining_glasses: b.remaining_glasses,
        kept_at: b.kept_at,
      }));
    const { error: bottleErr } = await supabase
      .from("bottles")
      .upsert(bottleRows, { onConflict: "id" });
    log.push(bottleErr ? `Bottles: ${bottleErr.message}` : `Bottles: ${bottleRows.length} upserted`);

    // 6. Seed cast memos
    const memoRows = mockCastMemos.map((m) => ({
      id: m.id,
      customer_id: m.customer_id,
      cast_id: m.cast_id,
      last_topic: m.last_topic,
      service_tips: m.service_tips,
      next_topics: m.next_topics,
      visit_notes: m.visit_notes,
      updated_at: m.updated_at,
    }));
    const { error: memoErr } = await supabase
      .from("cast_memos")
      .upsert(memoRows, { onConflict: "id" });
    log.push(memoErr ? `Memos: ${memoErr.message}` : `Memos: ${memoRows.length} upserted`);

    // 7. Seed visits (batch in chunks to avoid payload limits)
    const visitRows = mockVisits
      .filter((v) => v.store_id === "store1")
      .map((v) => ({
        id: v.id,
        store_id: v.store_id,
        customer_id: v.customer_id,
        cast_id: v.cast_id,
        table_name: v.table_name,
        is_nominated: v.is_nominated,
        visited_at: v.visited_at,
      }));
    let visitOk = 0;
    let visitFail = 0;
    for (let i = 0; i < visitRows.length; i += 100) {
      const chunk = visitRows.slice(i, i + 100);
      const { error: vErr } = await supabase
        .from("visits")
        .upsert(chunk, { onConflict: "id" });
      if (vErr) visitFail += chunk.length;
      else visitOk += chunk.length;
    }
    log.push(`Visits: ${visitOk} upserted, ${visitFail} failed`);

    // 8. Seed douhans
    const douhanRows = mockDouhans.map((d) => ({
      id: d.id,
      cast_id: d.cast_id,
      customer_id: d.customer_id,
      store_id: d.store_id,
      date: d.date,
      status: d.status,
      note: d.note ?? null,
      cancellation_reason: d.cancellation_reason ?? null,
      cancelled_at: d.cancelled_at ?? null,
    }));
    const { error: douhanErr } = await supabase
      .from("douhans")
      .upsert(douhanRows, { onConflict: "id" });
    log.push(douhanErr ? `Douhans: ${douhanErr.message}` : `Douhans: ${douhanRows.length} upserted`);

    // 9. Seed cast goals
    const goalRows = mockCastGoals.map((g) => ({
      cast_id: g.castId,
      sales_goal: g.salesGoal,
      douhan_goal: g.douhanGoal,
      note: g.note,
      set_by: g.setBy,
      updated_at: g.updatedAt,
    }));
    const { error: goalErr } = await supabase
      .from("cast_goals")
      .upsert(goalRows, { onConflict: "cast_id" });
    log.push(goalErr ? `Goals: ${goalErr.message}` : `Goals: ${goalRows.length} upserted`);

    return NextResponse.json({
      success: true,
      log,
      summary: {
        stores: mockStores.length,
        casts: castRows.length,
        customers: custRows.length,
        bottles: bottleRows.length,
        memos: memoRows.length,
        visits: visitRows.length,
        douhans: douhanRows.length,
        goals: goalRows.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, log },
      { status: 500 },
    );
  }
}

// Schema SQL — matches 002 + 003 migrations
const SCHEMA_SQL = `
-- Parent tables
CREATE TABLE IF NOT EXISTS nightos_stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nightos_casts (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES nightos_stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nomination_count INT DEFAULT 0,
  monthly_sales BIGINT DEFAULT 0,
  repeat_rate NUMERIC(4,3) DEFAULT 0,
  club_role TEXT CHECK (club_role IN ('mama', 'oneesan', 'help')),
  assigned_oneesan_id TEXT REFERENCES nightos_casts(id) ON DELETE SET NULL,
  auth_user_id UUID UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES nightos_stores(id) ON DELETE CASCADE,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  birthday TEXT,
  job TEXT,
  favorite_drink TEXT,
  category TEXT DEFAULT 'regular' CHECK (category IN ('vip', 'regular', 'new')),
  store_memo TEXT,
  referred_by_customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  funnel_stage TEXT DEFAULT 'store_only' CHECK (funnel_stage IN ('store_only', 'assigned', 'line_exchanged')),
  line_exchanged_cast_id TEXT REFERENCES nightos_casts(id) ON DELETE SET NULL,
  line_exchanged_at TIMESTAMPTZ,
  manager_cast_id TEXT REFERENCES nightos_casts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cast_memos (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE CASCADE,
  last_topic TEXT,
  service_tips TEXT,
  next_topics TEXT,
  visit_notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, cast_id)
);

CREATE TABLE IF NOT EXISTS bottles (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES nightos_stores(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  total_glasses INT DEFAULT 20,
  remaining_glasses INT DEFAULT 20,
  kept_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES nightos_stores(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE SET NULL,
  table_name TEXT,
  is_nominated BOOLEAN DEFAULT FALSE,
  visited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follow_logs (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE CASCADE,
  template_type TEXT CHECK (template_type IN ('thanks', 'invite', 'birthday', 'seasonal')),
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_chats (
  id TEXT PRIMARY KEY,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  messages JSONB DEFAULT '[]'::JSONB,
  feedback TEXT CHECK (feedback IN ('helpful', 'not_helpful') OR feedback IS NULL),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS line_screenshots (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE CASCADE,
  image_data TEXT NOT NULL,
  media_type TEXT NOT NULL,
  extracted JSONB,
  applied_fields TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS douhans (
  id TEXT PRIMARY KEY,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  store_id TEXT REFERENCES nightos_stores(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  note TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS cast_goals (
  cast_id TEXT PRIMARY KEY REFERENCES nightos_casts(id) ON DELETE CASCADE,
  sales_goal BIGINT DEFAULT 1000000,
  douhan_goal INT DEFAULT 3,
  note TEXT,
  set_by TEXT REFERENCES nightos_casts(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cast_messages (
  id TEXT PRIMARY KEY,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS cast_requests (
  id TEXT PRIMARY KEY,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE CASCADE,
  cast_name TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  store_id TEXT REFERENCES nightos_stores(id) ON DELETE CASCADE,
  store_name TEXT,
  type TEXT CHECK (type IN ('drink', 'discount', 'birthday', 'vip')),
  title TEXT NOT NULL,
  description TEXT,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  code TEXT
);
`;
