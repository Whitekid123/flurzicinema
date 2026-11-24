import { test, expect, type Page } from "@playwright/test";

async function ready(page: Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() =>
    !!document.querySelector<HTMLElement>(".immersive-cinema")?.dataset.renderer,
  );
}

async function position(page: Page) {
  return page.locator(".cinema-hero").evaluate((hero) => ({
    scroll: scrollY,
    heroTop: hero.getBoundingClientRect().top,
    nextTop: document.querySelector(".exhibition-section")!.getBoundingClientRect().top,
    viewport: innerHeight,
  }));
}

for (const [input, step, count] of [
  ["mouse wheel", 120, 6],
  ["small touchpad-style wheel deltas", 24, 30],
] as const) {
  test(`${input}: a short scroll releases the hero and reverses cleanly`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await ready(page);
    await expect.poll(() => page.locator(".cinema-hero").evaluate(el => el.parentElement!.classList.contains("pin-spacer"))).toBe(true);
    const original = await page.locator(".hero-word-beyond").boundingBox();
    await page.mouse.move(20, 500);
    for (let i = 0; i < count; i++) {
      await page.mouse.wheel(0, step);
      await page.waitForTimeout(25);
    }
    await expect.poll(async () => (await position(page)).scroll).toBeCloseTo(720, 0);
    await expect.poll(async () => (await position(page)).heroTop).toBeLessThan(-60);
    const arrived = await position(page);
    expect(arrived.nextTop).toBeLessThan(arrived.viewport);
    await expect.poll(() => page.locator(".hero-dock-caption").evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.95);
    for (let i = 0; i < count; i++) {
      await page.mouse.wheel(0, -step);
      await page.waitForTimeout(25);
    }
    await expect.poll(async () => (await position(page)).scroll).toBe(0);
    await expect.poll(async () => {
      const reversed = (await page.locator(".hero-word-beyond").boundingBox())!;
      return Math.max(Math.abs(reversed.width - original!.width), Math.abs(reversed.y - original!.y));
    }).toBeLessThan(3);
  });
}

test("a large wheel gesture continues directly into the next section", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await ready(page);
  await page.mouse.move(20, 500);
  await page.mouse.wheel(0, 1800);
  await expect.poll(async () => (await position(page)).scroll).toBeCloseTo(1800, 0);
  expect((await position(page)).heroTop).toBeLessThan(-1000);
  await expect(page.locator(".exhibition-card").first()).toBeVisible();
});

test("desktop resize keeps a short pin and releases it at the mobile breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1440 });
  await ready(page);
  const distance = () => page.locator(".cinema-hero").evaluate(el =>
    el.parentElement!.classList.contains("pin-spacer")
      ? el.parentElement!.offsetHeight - (el as HTMLElement).offsetHeight
      : 0,
  );
  await expect.poll(distance).toBe(650);
  await page.setViewportSize({ width: 1024, height: 800 });
  await expect.poll(distance).toBe(520);
  await page.evaluate(() => scrollTo({ top: 550, behavior: "instant" }));
  await expect.poll(async () => (await position(page)).heroTop).toBeLessThan(-20);
  await page.setViewportSize({ width: 768, height: 1000 });
  await expect.poll(distance).toBe(0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect.poll(distance).toBe(650);
});

for (const width of [390, 768]) {
  test(`touch scrolling progresses naturally at ${width}px without hero pinning`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 1000 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    try {
      await ready(page);
      expect(await page.locator(".cinema-hero").evaluate(el => el.parentElement!.classList.contains("pin-spacer"))).toBe(false);
      const cdp = await context.newCDPSession(page);
      const swipe = async (from: number, to: number) => {
        const x = Math.round(width / 2);
        await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: from }] });
        for (let i = 1; i <= 12; i++) {
          await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: from + (to - from) * i / 12 }] });
          await page.waitForTimeout(25);
        }
        // Hold briefly to measure deliberate travel without a momentum fling.
        await page.waitForTimeout(150);
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      };
      await swipe(700, 100);
      await swipe(700, 100);
      await expect.poll(async () => (await position(page)).scroll).toBeGreaterThan(900);
      expect((await position(page)).nextTop).toBeLessThan((await position(page)).viewport);
      await swipe(100, 750);
      await swipe(100, 750);
      await expect.poll(async () => (await position(page)).scroll).toBe(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    } finally {
      await context.close();
    }
  });
}

test("reduced motion allows immediate native scroll progression", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await ready(page);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await page.mouse.move(20, 500);
  await page.mouse.wheel(0, 720);
  await expect.poll(async () => (await position(page)).scroll).toBeCloseTo(720, 0);
  expect((await position(page)).heroTop).toBeLessThan(-700);
  expect((await position(page)).nextTop).toBeLessThan(1000);
});
