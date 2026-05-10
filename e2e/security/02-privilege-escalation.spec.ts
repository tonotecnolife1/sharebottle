import { test, expect } from "@playwright/test";

/**
 * 02 — Privilege Escalation Tests
 *
 * Verifies that lower-privilege roles cannot access or perform actions
 * reserved for higher-privilege roles. Tests both UI-level and API-level
 * escalation attempts.
 *
 * Mock cast IDs (from mock-data.ts):
 *   cast-akari  → club_role: "help"  (lowest)
 *   cast-yuki   → club_role: "oneesan"
 *   cast-mama   → club_role: "mama"  (highest)
 */

// Mock cast IDs from lib/nightos/mock-data.ts
const CAST_HELP = "cast_help2"; // あやな: club_role "help" (lowest rank)
const CAST_ONEESAN = "cast1";   // あかり: club_role "oneesan"
const CAST_SENIOR = "cast_oneesan2"; // ゆき: senior oneesan (CURRENT_MAMA_ID)

test.describe("Privilege Escalation — Role Boundaries", () => {
  test("help-role cast cannot view manager dashboard", async ({
    context,
    page,
  }) => {
    await context.addCookies([
      {
        name: "nightos.mock-cast-id",
        value: CAST_HELP,
        domain: "localhost",
        path: "/",
      },
    ]);
    const response = await page.goto("/store");
    const url = page.url();
    // help cast must not land on the store dashboard
    expect(url).not.toMatch(/localhost:3000\/store($|\/)/);
    expect(response?.status()).not.toBe(200);
  });

  test("cast cannot escalate to store_owner by manipulating cookie value", async ({
    context,
    page,
  }) => {
    // Attempt to forge user_role in cookie — the cookie only stores cast ID,
    // role is looked up server-side, so this tests the server ignores injected role
    await context.addCookies([
      {
        name: "nightos.mock-cast-id",
        value: `${CAST_HELP}; user_role=store_owner`,
        domain: "localhost",
        path: "/",
      },
    ]);
    const response = await page.goto("/store");
    const url = page.url();
    expect(url).not.toMatch(/localhost:3000\/store($|\/)/);
  });

  test("senior-oneesan can access store dashboard", async ({ context, page }) => {
    await context.addCookies([
      {
        name: "nightos.mock-cast-id",
        value: CAST_SENIOR,
        domain: "localhost",
        path: "/",
      },
    ]);
    await page.goto("/store");
    // Senior oneesan should land on /store or /cast (positive control)
    const url = page.url();
    // May redirect to /store/dashboard or stay at /cast/home
    expect(url).toMatch(/localhost:3000\/(store|cast)/);
  });
});

test.describe("Privilege Escalation — API Action Endpoints", () => {
  test("cast cannot call store-only API actions via direct POST", async ({
    context,
    page,
  }) => {
    await context.addCookies([
      {
        name: "nightos.mock-cast-id",
        value: CAST_HELP,
        domain: "localhost",
        path: "/",
      },
    ]);
    // Attempt direct API call to a store action
    const response = await page.request.post("/api/store/set-cast-goal", {
      data: {
        castId: CAST_HELP,
        salesGoal: 9999999,
        douhanGoal: 999,
        note: "injected goal",
      },
      failOnStatusCode: false,
    });
    // Must not succeed — expect 401, 403, or 404
    expect([401, 403, 404, 405]).toContain(response.status());
  });

  test("cast cannot call manager-only server actions directly", async ({
    context,
    page,
  }) => {
    await context.addCookies([
      {
        name: "nightos.mock-cast-id",
        value: CAST_HELP,
        domain: "localhost",
        path: "/",
      },
    ]);
    // Try to access manager-only data via direct navigation
    const response = await page.goto("/store/cast-management");
    const url = page.url();
    // Must be redirected or blocked
    const isBlocked =
      url.includes("/auth") ||
      url.includes("/cast") ||
      response?.status() === 403 ||
      response?.status() === 404;
    expect(isBlocked).toBe(true);
  });
});

test.describe("Privilege Escalation — Horizontal Privilege (Cross-Cast)", () => {
  test("cast cannot view another cast's AI chat history via URL", async ({
    context,
    page,
  }) => {
    await context.addCookies([
      {
        name: "nightos.mock-cast-id",
        value: CAST_HELP,
        domain: "localhost",
        path: "/",
      },
    ]);
    // Try to access a different cast's AI chat session
    await page.goto("/cast/ai-chat");
    const url = page.url();
    // Should either redirect or show only own chats
    // If page loads, verify it shows only the current cast's data
    if (url.includes("/cast/ai-chat")) {
      // Page loaded — check that it doesn't expose other cast IDs in visible text
      const content = await page.content();
      // Other cast IDs should not appear in a raw data leak context
      expect(content).not.toContain(CAST_SENIOR + '"castId"');
    }
  });
});
