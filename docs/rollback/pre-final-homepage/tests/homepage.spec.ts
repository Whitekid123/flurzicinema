import { test, expect } from "@playwright/test";

test("movie details trap focus, save locally, persist and close with Escape", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const poster = page
    .getByRole("button", { name: "Explore The Quiet Beyond", exact: true })
    .first();
  await poster.click();
  const dialog = page.getByRole("dialog", { name: "The Quiet Beyond" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Fictional catalog · demo")).toBeVisible();
  await dialog
    .getByRole("button", { name: "+ Save to my stories", exact: true })
    .click();
  await expect(
    dialog.getByRole("button", { name: "✓ Saved · Remove from my stories" }),
  ).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    await expect
      .poll(() =>
        page.evaluate(() => !!document.activeElement?.closest("dialog")),
      )
      .toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(poster).toBeFocused();
  await page.reload();
  await poster.click();
  await expect(
    page.getByRole("button", { name: "✓ Saved · Remove from my stories" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "✓ Saved · Remove from my stories" })
    .click();
  await expect(
    page.getByRole("button", { name: "+ Save to my stories", exact: true }),
  ).toBeVisible();
});

test("Vault switches layouts and filters movies and series", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const vault = page.locator("#vault");
  await vault.getByRole("button", { name: "Grid", exact: true }).click();
  await expect(page.locator(".vault-grid .vault-item")).toHaveCount(5);
  await vault.getByRole("button", { name: "Series", exact: true }).click();
  await expect(page.locator(".vault-item")).toHaveCount(1);
  await expect(page.locator(".vault-caption h3")).toHaveText("Velvet Hours");
  await vault.getByRole("button", { name: "Movies", exact: true }).click();
  await expect(page.locator(".vault-item")).toHaveCount(4);
  await vault.getByRole("button", { name: "All stories", exact: true }).click();
  await vault.getByRole("button", { name: "Timeline", exact: true }).click();
  await expect(page.locator(".vault-timeline .vault-item")).toHaveCount(5);
});

test("feature previews respond to keyboard, preferences, room membership and quality", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Take a seat", exact: true }).click();
  await expect(page.getByText("You’re in the demo room")).toBeVisible();
  await page.getByRole("button", { name: "Leave room", exact: true }).click();
  await page.getByRole("tab", { name: "Cinema Rooms" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "StoryMatch" })).toBeFocused();
  await page.getByRole("button", { name: "Intrigue", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Explore your match: Velvet Hours" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "StoryLens" }).click();
  await page.getByRole("button", { name: "The craft", exact: true }).click();
  await expect(
    page.getByText("Warm amber against blue-black shadows", { exact: false }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "DataSense" }).click();
  await page.getByRole("radio", { name: "4K", exact: true }).check();
  await expect(page.getByText("7 GB", { exact: true })).toBeVisible();
});

test("FAQ and future sign-in destination disclose actual capability", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const question = page.getByRole("button", {
    name: "How do memberships work?",
  });
  await question.click();
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText("Memberships are being designed.", { exact: false }),
  ).toBeVisible();
  await question.click();
  await expect(question).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Sign in is coming later" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
});

for (const width of [1920, 1440, 1024, 768, 390, 320])
  test(`responsive ${width}px: images load, no page overflow, navigation works`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await page.evaluate(async () => {
      for (const image of Array.from(document.images)) {
        image.loading = "eager";
      }
      await Promise.all(
        Array.from(document.images).map((image) =>
          image.decode().catch(() => {}),
        ),
      );
      await document.fonts.ready;
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      await page.evaluate(() =>
        Array.from(document.images)
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.src),
      ),
    ).toEqual([]);
    if (width < 901) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: "Features", exact: true })
        .click();
      await expect(
        page.getByRole("dialog", { name: "Navigation" }),
      ).not.toBeVisible();
      await expect(page).toHaveURL(/\/features$/);
    }
    expect(errors).toEqual([]);
  });

test("normal motion: hero pin, archive reflow and page resize remain usable", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.waitForTimeout(1400);
  await page.evaluate(() => scrollTo(0, 450));
  await page.waitForTimeout(1300);
  expect(
    await page
      .locator(".hero-word-beyond")
      .evaluate((el) => getComputedStyle(el).transform),
  ).not.toBe("none");
  expect(
    Number(
      await page
        .locator(".cinema-hero-copy")
        .evaluate((el) => getComputedStyle(el).opacity),
    ),
  ).toBeLessThan(0.05);
  await page.locator("#vault").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Grid", exact: true }).click();
  await page.waitForTimeout(1000);
  await expect(page.locator(".vault-grid")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
