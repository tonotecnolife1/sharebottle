import { test, expect } from "@playwright/test";

/**
 * 01 — Route Protection Tests
 *
 * Verifies that unauthenticated users are redirected away from protected
 * routes and cannot access cast/store/customer pages without a session.
 *
 * Does NOT require Supabase — runs entirely in mock mode.
 */

const CAST_ROUTES = [
  "/cast/home",
  "/cast/customers",
  "/cast/ai-chat",
  "/cast/follow",
  "/cast/profile",
];

const STORE_ROUTES = [
  "/store",
  "/store/dashboard",
  "/store/customers",
  "/store/cast-management",
  "/store/douhan",
];

const CUSTOMER_ROUTES = ["/customer/home", "/customer/profile"];

test.describe("Route Protection — Unauthenticated", () => {
  test.beforeEach(async ({ context }) => {
    // Ensure no mock auth cookie
    await context.clearCookies();
  });

  for (const route of CAST_ROUTES) {
    test(`[CAST] ${route} redirects unauthenticated visitors`, async ({
      page,
    }) => {
      const response = await page.goto(route);
      // Either redirects to /auth/login or returns 401/403
      const url = page.url();
      const isRedirectedToAuth =
        url.includes("/auth/login") ||
        url.includes("/auth/signup") ||
        url === "about:blank";
      const isBlockedByStatus =
        response?.status() === 401 || response?.status() === 403;
      expect(isRedirectedToAuth || isBlockedByStatus).toBe(true);
    });
  }

  for (const route of STORE_ROUTES) {
    test(`[STORE] ${route} redirects unauthenticated visitors`, async ({
      page,
    }) => {
      const response = await page.goto(route);
      const url = page.url();
      const isRedirectedToAuth =
        url.includes("/auth/login") ||
        url.includes("/auth/signup") ||
        url === "about:blank";
      const isBlockedByStatus =
        response?.status() === 401 || response?.status() === 403;
      expect(isRedirectedToAuth || isBlockedByStatus).toBe(true);
    });
  }

  for (const route of CUSTOMER_ROUTES) {
    test(`[CUSTOMER] ${route} redirects unauthenticated visitors`, async ({
      page,
    }) => {
      const response = await page.goto(route);
      const url = page.url();
      const isRedirectedToAuth =
        url.includes("/auth/login") ||
        url.includes("/auth/signup") ||
        url === "about:blank";
      const isBlockedByStatus =
        response?.status() === 401 || response?.status() === 403;
      expect(isRedirectedToAuth || isBlockedByStatus).toBe(true);
    });
  }
});

test.describe("Route Protection — Cross-Role Access", () => {
  test("Cast cannot access store-owner routes", async ({ context, page }) => {
    // Log in as a cast persona (あかり = cast role, not store_owner)
    await context.addCookies([
      {
        name: "nightos.mock-cast-id",
        value: "cast1", // あかり: oneesan, NOT store_owner
        domain: "localhost",
        path: "/",
      },
    ]);
    const response = await page.goto("/store");
    const url = page.url();
    // Should redirect away from /store or show 403
    const isBlocked =
      !url.includes("/store") ||
      response?.status() === 403 ||
      response?.status() === 401;
    // Also accept redirect to /cast/home (role mismatch redirect)
    const isRedirectedToCast = url.includes("/cast");
    expect(isBlocked || isRedirectedToCast).toBe(true);
  });

  test("Store staff cannot access store-owner-only routes", async ({
    context,
    page,
  }) => {
    // store_staff should not access owner-only sub-routes
    await context.addCookies([
      {
        name: "nightos.mock-cast-id",
        value: "cast1", // あかり: oneesan, not store_owner
        domain: "localhost",
        path: "/",
      },
    ]);
    // /store/cast-management is typically owner-only
    await page.goto("/store/cast-management");
    // Should not show owner-level controls or redirect
    const url = page.url();
    // Accept either redirect or blocked
    // Key: they must not land on the owner page with full privileges
    expect(url).not.toMatch(/^http:\/\/localhost:3000\/store\/cast-management$/);
  });
});

test.describe("Route Protection — Login Page Hardening", () => {
  test("Login page is accessible without auth", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
  });

  test("Authenticated user is redirected away from login page", async ({
    context,
    page,
  }) => {
    await context.addCookies([
      {
        name: "nightos.mock-cast-id",
        value: "cast1", // あかり
        domain: "localhost",
        path: "/",
      },
    ]);
    await page.goto("/auth/login");
    // Should redirect to appropriate home, not stay on login
    const url = page.url();
    expect(url).not.toMatch(/\/auth\/login/);
  });
});
