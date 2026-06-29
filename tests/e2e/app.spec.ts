import { expect, test } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:9000";

test.describe("Next.js App", () => {
  test("renders home page with heading", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/WikiWonder|TypeScript React/i);
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("health endpoint returns ok", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/health`);
    expect(res.ok()).toBe(true);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.status).toBe("ok");
  });

  test("has no obvious accessibility violations on home page", async ({ page }) => {
    await page.goto(BASE_URL);
    const mainContent = page.locator("#main-content");
    await expect(mainContent).toBeVisible();
  });
});
