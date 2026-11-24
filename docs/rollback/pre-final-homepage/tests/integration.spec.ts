import { test, expect, type Page } from "@playwright/test";

async function open(page: Page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".immersive-cinema")).toHaveAttribute(
    "data-renderer",
    "webgl",
  );
}
async function sampleScene(page: Page) {
  return page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        requestAnimationFrame(() => {
          const canvas = document.querySelector<HTMLCanvasElement>(
            ".immersive-cinema canvas",
          )!;
          const gl = canvas.getContext("webgl2")!;
          const bytes = new Uint8Array(canvas.width * canvas.height * 4);
          gl.readPixels(
            0,
            0,
            canvas.width,
            canvas.height,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            bytes,
          );
          const sample: number[] = [];
          for (let i = 0; i < bytes.length; i += 512)
            sample.push(bytes[i] + bytes[i + 1] + bytes[i + 2]);
          resolve(sample);
        });
      }),
  );
}

test("WebGL chamber draws changing pixels, responds to scroll, pauses offscreen and releases on context loss", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await open(page);
  await page
    .getByRole("button", { name: "Pause film sequence", exact: true })
    .click();
  const first = await sampleScene(page);
  expect(new Set(first).size).toBeGreaterThan(10);
  await page.waitForTimeout(900);
  expect(await sampleScene(page)).not.toEqual(first);
  await page.evaluate(() => scrollTo({ top: 500, behavior: "instant" }));
  await expect
    .poll(() =>
      page.evaluate(() =>
        Number(
          document
            .querySelector<HTMLElement>(".cinema-hero")!
            .style.getPropertyValue("--scene-progress"),
        ),
      ),
    )
    .toBeGreaterThan(0.7);
  const traveled = await sampleScene(page);
  expect(traveled).not.toEqual(first);
  await page.locator("#vault").scrollIntoViewIfNeeded();
  await expect(page.locator(".immersive-cinema")).toHaveAttribute(
    "data-motion",
    "paused",
  );
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(page.locator(".immersive-cinema")).toHaveAttribute(
    "data-motion",
    "active",
  );
  await page.evaluate(() =>
    document
      .querySelector(".immersive-cinema canvas")!
      .dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
  );
  await expect(page.locator(".immersive-cinema")).toHaveAttribute(
    "data-renderer",
    "fallback",
  );
  await expect(page.locator(".projection-chamber-fallback")).toBeVisible();
  expect(errors).toEqual([]);
});

test("hero film sequence advances, interrupts on focus, accepts manual selection and opens the displayed film", async ({
  page,
}) => {
  await open(page);
  const hero = page.locator(".cinema-hero");
  await expect(
    hero.locator('.hero-sequence-films button[aria-pressed="true"]'),
  ).toHaveAccessibleName("Show The Quiet Beyond");
  await expect(
    hero.locator('.hero-sequence-films button[aria-pressed="true"]'),
  ).toHaveAccessibleName("Show The Last Train North", { timeout: 10000 });
  await hero.locator(".hero-screen").focus();
  await expect(hero).toHaveAttribute("data-sequence", "paused");
  await page.waitForTimeout(5800);
  await expect(
    hero.locator('.hero-sequence-films button[aria-pressed="true"]'),
  ).toHaveAccessibleName("Show The Last Train North");
  await page
    .getByRole("button", { name: "Show Velvet Hours", exact: true })
    .click();
  await page.waitForTimeout(1600);
  await expect(hero.locator(".hero-screen")).toHaveAccessibleName(
    "Explore Velvet Hours",
  );
  await hero.locator(".hero-screen").click();
  await expect(
    page.getByRole("dialog", { name: "Velvet Hours" }),
  ).toBeVisible();
});

test("feature journey travels horizontally and reverses, tabs and all four original demos remain usable", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("tab", { name: "Cinema Rooms" }).click();
  await page.waitForTimeout(1300);
  const original = await page
    .locator(".feature-journey-track")
    .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
  await page.getByRole("button", { name: "Take a seat", exact: true }).click();
  await expect(page.getByText("You’re in the demo room")).toBeVisible();
  await page.getByRole("tab", { name: "StoryMatch" }).click();
  await page.waitForTimeout(1300);
  const middle = await page
    .locator(".feature-journey-track")
    .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
  expect(middle).toBeLessThan(original - 900);
  await page.getByRole("button", { name: "Intrigue", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Explore your match: Velvet Hours" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "StoryLens" }).click();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "The craft", exact: true }).click();
  await expect(
    page.getByText("Warm amber against blue-black shadows", { exact: false }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "DataSense" }).click();
  await page.waitForTimeout(1200);
  await page.getByRole("radio", { name: "4K", exact: true }).check();
  await expect(page.getByText("7 GB", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "StoryMatch" }).click();
  await page.waitForTimeout(1300);
  const reversed = await page
    .locator(".feature-journey-track")
    .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
  expect(Math.abs(reversed - middle)).toBeLessThan(4);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Intrigue", exact: true }),
  ).toBeVisible();
});

test("save-data avoids WebGL while keeping film selection interactive", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "connection", {
      value: { saveData: true },
      configurable: true,
    }),
  );
  await page.goto("/");
  await expect(page.locator(".immersive-cinema")).toHaveAttribute(
    "data-renderer",
    "fallback",
  );
  await expect(page.locator(".immersive-cinema canvas")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Show Velvet Hours", exact: true })
    .click();
  await page.waitForTimeout(1500);
  await page.locator(".hero-screen").click();
  await expect(
    page.getByRole("dialog", { name: "Velvet Hours" }),
  ).toBeVisible();
});

test("masked text and premiere characters enter, reverse, and return to unsplit reduced-motion text", async ({
  page,
}) => {
  await open(page);
  const lines = page.locator("#features [data-split-lines] .motion-line");
  expect(await lines.count()).toBeGreaterThan(1);
  const offsets = () =>
    lines.evaluateAll((elements) =>
      elements.map((el) => new DOMMatrix(getComputedStyle(el).transform).m42),
    );
  expect((await offsets()).some((value) => value > 10)).toBe(true);
  const top = await page
    .locator("#features [data-split-lines]")
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(
    (top) => scrollTo({ top: top - 700, behavior: "instant" }),
    top,
  );
  await page.waitForTimeout(1300);
  expect((await offsets()).every((value) => Math.abs(value) < 1)).toBe(true);
  await page.evaluate(
    (top) => scrollTo({ top: top - 1100, behavior: "instant" }),
    top,
  );
  await page.waitForTimeout(1300);
  expect((await offsets()).some((value) => value > 10)).toBe(true);
  const characters = page.locator("#premiere-title .motion-character");
  expect(await characters.count()).toBeGreaterThan(8);
  expect(
    await characters
      .first()
      .evaluate((el) => Number(getComputedStyle(el).opacity)),
  ).toBe(0);
  await page.locator("#series").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1600);
  expect(
    await characters.evaluateAll((elements) =>
      elements.every((el) => Number(getComputedStyle(el).opacity) > 0.99),
    ),
  ).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".motion-line,.motion-character")).toHaveCount(0);
  await expect(page.locator("#premiere-title")).toHaveText("VelvetHours.");
});
