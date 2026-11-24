import { test, expect } from "@playwright/test";
for (const width of [1024, 768, 390]) {
  test(`normal motion at ${width}px preserves controls, sections and native navigation`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const controls = await page
      .locator(".hero-sequence-controls")
      .boundingBox();
    const entry = await page.locator(".hero-entry").boundingBox();
    const copy = await page.locator(".cinema-hero-copy").boundingBox();
    const overlap = (
      a: NonNullable<typeof controls>,
      b: NonNullable<typeof controls>,
    ) =>
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y;
    expect(overlap(controls!, entry!)).toBe(false);
    expect(overlap(controls!, copy!)).toBe(false);
    await page
      .getByRole("button", { name: "Show Velvet Hours", exact: true })
      .click();
    await page.waitForTimeout(1500);
    await page.locator(".hero-screen").click();
    await expect(
      page.getByRole("dialog", { name: "Velvet Hours" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    if (width < 901) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: "Features", exact: true })
        .click();
    } else
      await page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: "Features", exact: true })
        .click();
    await expect(page).toHaveURL(/\/features$/);
    // The header now opens the full public page; the original homepage demo remains.
    await page.goto("/#features");
    await page.getByRole("tab", { name: "StoryMatch" }).click();
    await page.waitForTimeout(1200);
    await expect(page.getByRole("tab", { name: "StoryMatch" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.getByRole("button", { name: "Escape", exact: true }).click();
    await expect(
      page.getByRole("button", {
        name: "Explore your match: The Last Train North",
      }),
    ).toBeVisible();
    for (const selector of [
      "#explore",
      "#vault",
      "#features",
      "#series",
      "#membership",
      "#faq",
    ])
      await expect(page.locator(selector)).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 390) {
      await expect(page.locator(".immersive-cinema canvas")).toHaveCount(0);
      await expect(page.locator(".pin-spacer")).toHaveCount(0);
    }
  });
}
