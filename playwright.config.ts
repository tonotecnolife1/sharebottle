import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for NIGHTOS smoke / E2E tests.
 *
 * **One-time setup:**
 *   npm install -D @playwright/test
 *   npx playwright install chromium
 *
 * **Run locally** (assumes `npm run dev` is up at http://localhost:3000):
 *   npx playwright test
 *
 * **Headed / debug:**
 *   npx playwright test --headed
 *   npx playwright test --ui
 *
 * Tests live in `e2e/` and target the demo / mock-auth flow because
 * it doesn't need a Supabase project — they verify the UI shape and
 * critical client routes without hitting a real DB.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 414, height: 896 } },
    },
    {
      name: "iphone",
      use: { ...devices["iPhone 13"] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
