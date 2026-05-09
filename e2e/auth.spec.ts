import { test, expect } from "@playwright/test";

/**
 * Auth smoke tests — verifies the login / signup / legal pages render
 * and the demo flow (mock mode) lets a visitor reach a logged-in screen.
 *
 * Assumes the dev server is running with `NIGHTOS_DISABLE_MOCK_AUTH`
 * UNSET (default), so the "デモを試す" button is visible.
 */

test.describe("/auth/login", () => {
  test("renders heading + main CTAs", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(
      page.getByRole("heading", { name: "ログイン" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "新規登録" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "デモを試す" }),
    ).toBeVisible();
  });

  test("links to legal pages", async ({ page }) => {
    await page.goto("/auth/login");
    for (const label of ["利用規約", "プライバシー", "特商法表記"]) {
      await expect(page.getByRole("link", { name: label })).toBeVisible();
    }
  });

  test("forgot-password link reaches the reset flow", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("button", { name: "既にアカウントをお持ちの方" }).click();
    await page.getByRole("link", { name: "パスワードを忘れた" }).click();
    await expect(page).toHaveURL(/\/auth\/reset-password/);
    await expect(
      page.getByRole("heading", { name: "パスワード再設定" }),
    ).toBeVisible();
  });
});

test.describe("/auth/signup", () => {
  test("renders form with name / email / password fields", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(
      page.getByRole("heading", { name: "新規登録" }),
    ).toBeVisible();
    await expect(page.getByPlaceholder(/源氏名/)).toBeVisible();
    await expect(page.getByPlaceholder("email@example.com")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "登録する" }),
    ).toBeVisible();
  });

  test("client-side validation blocks submit on empty form", async ({
    page,
  }) => {
    await page.goto("/auth/signup");
    await page.getByRole("button", { name: "登録する" }).click();
    // Browser-native validation — the form does not submit, URL stays.
    await expect(page).toHaveURL(/\/auth\/signup/);
  });
});

test.describe("Demo (mock-auth) flow", () => {
  test("Customer demo lands on the customer home", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("button", { name: "デモを試す" }).click();
    await page.getByRole("button", { name: /来店客/ }).click();
    await page.waitForURL(/\/customer\/home/, { timeout: 15_000 });
    // Customer home greeting includes "おかえりなさい"
    await expect(page.getByText("おかえりなさい")).toBeVisible();
  });

  test("Cast persona picker reveals 5 personas", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("button", { name: "デモを試す" }).click();
    await page.getByRole("button", { name: /^キャスト$/ }).click();
    for (const name of ["あかり", "ゆき", "あやな", "もえ", "れな"]) {
      await expect(page.getByText(name)).toBeVisible();
    }
  });
});

test.describe("Legal pages", () => {
  const pages: Array<[string, string]> = [
    ["/legal/privacy", "プライバシーポリシー"],
    ["/legal/terms", "利用規約"],
    ["/legal/tokutei", "特定商取引法に基づく表記"],
  ];
  for (const [path, heading] of pages) {
    test(`${path} renders heading`, async ({ page }) => {
      await page.goto(path);
      await expect(
        page.getByRole("heading", { name: heading }),
      ).toBeVisible();
    });
  }
});
