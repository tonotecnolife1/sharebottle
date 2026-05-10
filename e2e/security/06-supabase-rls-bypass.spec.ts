import { test, expect } from "@playwright/test";

/**
 * 06 — Supabase RLS Bypass Tests  ⚠️ CRITICAL
 *
 * Tests direct Supabase REST API access using the public anon key.
 * This is the most critical security test because:
 *
 *   - Migrations 006-009 DISABLE Row Level Security on ALL tables
 *   - The anon key is PUBLICLY exposed via NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   - Anyone with the anon key can make direct REST calls to Supabase
 *   - There is NO RLS policy between the attacker and the data
 *
 * CURRENT STATUS: ⚠️ VULNERABLE
 * Without RLS enabled, any user who knows the Supabase URL + anon key
 * can read/write ALL data in the database directly, bypassing the app.
 *
 * HOW TO FIX (see recommendations at bottom of this file):
 *   1. Re-enable RLS on all sensitive tables
 *   2. Add policies scoped to auth.uid() = cast.auth_user_id
 *   3. Rotate the anon key if it has been exposed
 *
 * REQUIRES: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * These tests are skipped automatically when Supabase is not configured.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

test.describe("Supabase RLS — Direct API Access (anon key)", () => {
  test.skip(!SUPABASE_CONFIGURED, "Supabase not configured — skipping RLS tests");

  async function supabaseRequest(
    table: string,
    options: { method?: string; body?: object; select?: string } = {},
  ) {
    const { method = "GET", body, select = "*" } = options;
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}&limit=5`;
    const res = await fetch(url, {
      method,
      headers: {
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: method === "POST" ? "return=representation" : "",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json().catch(() => null) };
  }

  test("[CRITICAL] anon key can SELECT nightos_casts without auth", async () => {
    const { status, body } = await supabaseRequest("nightos_casts");
    if (status === 200) {
      // RLS is OFF — this is the vulnerability
      console.error(
        "[CRITICAL VULNERABILITY] nightos_casts is readable by anon key!",
        `Found ${Array.isArray(body) ? body.length : "?"} rows.`,
        "ACTION REQUIRED: Enable RLS and add auth policies.",
      );
      // Fail the test to flag this in CI
      expect(status).toBe(401); // Expected: blocked; Actual: 200 = vulnerable
    } else {
      // 401 or 403 means RLS is working
      expect([401, 403]).toContain(status);
    }
  });

  test("[CRITICAL] anon key can SELECT customers without auth", async () => {
    const { status, body } = await supabaseRequest("customers");
    if (status === 200 && Array.isArray(body) && body.length > 0) {
      console.error(
        "[CRITICAL VULNERABILITY] customers table readable by anon key!",
        `Exposed ${body.length} customer records including PII.`,
      );
    }
    expect(status).toBe(401);
  });

  test("[CRITICAL] anon key can SELECT cast_memos without auth", async () => {
    const { status } = await supabaseRequest("cast_memos");
    if (status === 200) {
      console.error(
        "[CRITICAL VULNERABILITY] cast_memos (includes private customer notes) readable by anon key!",
      );
    }
    expect(status).toBe(401);
  });

  test("[CRITICAL] anon key can SELECT ai_chats without auth", async () => {
    const { status } = await supabaseRequest("ai_chats");
    if (status === 200) {
      console.error(
        "[CRITICAL VULNERABILITY] ai_chats readable by anon key — exposes all AI conversation history!",
      );
    }
    expect(status).toBe(401);
  });

  test("[CRITICAL] anon key can SELECT nightos_stores without auth", async () => {
    const { status } = await supabaseRequest("nightos_stores");
    if (status === 200) {
      console.error(
        "[CRITICAL VULNERABILITY] nightos_stores readable — exposes store info and invite codes!",
      );
    }
    expect(status).toBe(401);
  });

  test("[HIGH] anon key cannot INSERT into nightos_casts", async () => {
    const { status } = await supabaseRequest("nightos_casts", {
      method: "POST",
      body: {
        id: "99999999-0000-0000-0000-000000000000",
        store_id: "store-001",
        name: "攻撃者",
        nomination_count: 0,
        monthly_sales: 0,
        repeat_rate: 0,
        user_role: "store_owner",
      },
    });
    expect([401, 403]).toContain(status);
  });

  test("[HIGH] anon key cannot DELETE from nightos_casts", async () => {
    const url = `${SUPABASE_URL}/rest/v1/nightos_casts?id=eq.cast-akari`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=representation",
      },
    });
    expect([401, 403]).toContain(res.status);
  });

  test("[HIGH] anon key cannot UPDATE user_role to store_owner", async () => {
    const url = `${SUPABASE_URL}/rest/v1/nightos_casts?id=eq.cast-akari`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_role: "store_owner" }),
    });
    expect([401, 403]).toContain(res.status);
  });
});

test.describe("Supabase RLS — Auth-Scoped Access", () => {
  test.skip(!SUPABASE_CONFIGURED, "Supabase not configured — skipping RLS tests");

  test("authenticated user can only SELECT their own cast row", async () => {
    // This test requires a real Supabase JWT — skipped in mock mode
    // It documents the EXPECTED policy behaviour after RLS is re-enabled:
    //   CREATE POLICY cast_own_row ON nightos_casts
    //     FOR SELECT USING (auth.uid() = auth_user_id);
    test.skip(true, "Requires real Supabase JWT — run manually with test credentials");
  });

  test("authenticated cast can only SELECT customers in their store", async () => {
    test.skip(true, "Requires real Supabase JWT — run manually with test credentials");
    // Expected policy after fix:
    //   CREATE POLICY customer_store_isolation ON customers
    //     FOR SELECT USING (
    //       store_id IN (
    //         SELECT store_id FROM nightos_casts WHERE auth_user_id = auth.uid()
    //       )
    //     );
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * REMEDIATION RECOMMENDATIONS
 * ═══════════════════════════════════════════════════════════════════
 *
 * Current state (migrations 006-009):
 *   ALTER TABLE nightos_casts DISABLE ROW LEVEL SECURITY;
 *   GRANT SELECT, INSERT, UPDATE, DELETE ON nightos_casts TO anon;
 *
 * Required fix — create migration 010_enable_rls.sql:
 *
 *   -- Step 1: Re-enable RLS
 *   ALTER TABLE nightos_casts        ENABLE ROW LEVEL SECURITY;
 *   ALTER TABLE customers            ENABLE ROW LEVEL SECURITY;
 *   ALTER TABLE cast_memos           ENABLE ROW LEVEL SECURITY;
 *   ALTER TABLE ai_chats             ENABLE ROW LEVEL SECURITY;
 *   ALTER TABLE nightos_stores       ENABLE ROW LEVEL SECURITY;
 *   ALTER TABLE douhans              ENABLE ROW LEVEL SECURITY;
 *   ALTER TABLE cast_goals           ENABLE ROW LEVEL SECURITY;
 *   ALTER TABLE cast_messages        ENABLE ROW LEVEL SECURITY;
 *   ALTER TABLE follow_logs          ENABLE ROW LEVEL SECURITY;
 *   ALTER TABLE visits               ENABLE ROW LEVEL SECURITY;
 *   ALTER TABLE bottles              ENABLE ROW LEVEL SECURITY;
 *
 *   -- Step 2: Add identity column to nightos_casts (if not exists)
 *   ALTER TABLE nightos_casts ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users;
 *
 *   -- Step 3: Policies
 *   CREATE POLICY "cast: own row" ON nightos_casts
 *     FOR ALL USING (auth.uid() = auth_user_id);
 *
 *   CREATE POLICY "cast: own store customers" ON customers
 *     FOR ALL USING (
 *       store_id IN (SELECT store_id FROM nightos_casts WHERE auth_user_id = auth.uid())
 *     );
 *
 *   -- (etc. for each table)
 *
 *   -- Step 4: Revoke anon write access
 *   REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;
 *
 * ═══════════════════════════════════════════════════════════════════
 */
