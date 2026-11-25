import { expect, test } from "@playwright/test";

// Smoke checks for the streaming-app scaffolds. These verify routes exist
// and stay distinguishable from the public catalog — final UI assertions
// belong to Codex's implementation phase.
test("public home still renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1, h2").first()).toBeVisible();
});

test("auth scaffolds render without credentials", async ({ page }) => {
  for (const path of ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"]) {
    await page.goto(path);
    await expect(page.locator("h2").first()).toBeVisible();
  }
});

test("protected routes redirect to login when unauthenticated", async ({ page }) => {
  await page.goto("/browse");
  await expect(page).toHaveURL(/\/login/);
});

test("public and browse catalogs are distinct routes", async ({ page }) => {
  await page.goto("/movies");
  await expect(page).not.toHaveURL(/\/browse/);
  await page.goto("/browse/movies");
  await expect(page).toHaveURL(/\/login/);
});
