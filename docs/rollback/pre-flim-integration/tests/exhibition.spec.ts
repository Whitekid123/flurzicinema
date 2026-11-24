import { test, expect } from "@playwright/test";

async function ready(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(
    () => !!document.querySelector("canvas")?.dataset.motion,
  );
}
async function scroll(page: import("@playwright/test").Page, y: number) {
  await page.evaluate((y) => scrollTo(0, y), y);
  await page.waitForTimeout(1200);
}

test("hero: camera travel, living atmosphere, title docking and exact reverse", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await ready(page);
  const initial = await page.locator(".hero-word-beyond").boundingBox();
  const frame = await page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await page.waitForTimeout(400);
  if(await page.locator('canvas').getAttribute('data-motion')==='active') {
    expect(await page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).not.toBe(frame);
  } else {
    await expect(page.locator('canvas')).toHaveAttribute('data-motion','fallback');
    expect(await page.locator('.projector-light-warm').evaluate(el=>getComputedStyle(el).animationPlayState)).toBe('running');
  }
  const initialCamera = await page
    .locator(".environment-camera")
    .evaluate((el) => getComputedStyle(el).transform);
  await scroll(page, 750);
  const camera = await page
    .locator(".environment-camera")
    .evaluate((el) => getComputedStyle(el).transform);
  expect(camera).not.toBe(initialCamera);
  expect(camera).toContain("matrix3d");
  await scroll(page, 1500);
  const docked = await page.locator(".hero-word-beyond").boundingBox();
  expect(docked!.width).toBeLessThan(150);
  expect(docked!.y).toBeGreaterThan(650);
  expect(
    Number(
      await page
        .locator(".hero-dock-caption")
        .evaluate((el) => getComputedStyle(el).opacity),
    ),
  ).toBeGreaterThan(0.95);
  expect(
    (await page.locator(".hero-word-watching").boundingBox())!.x,
  ).toBeGreaterThan(1440);
  await scroll(page, 0);
  const reversed = await page.locator(".hero-word-beyond").boundingBox();
  expect(Math.abs(reversed!.width - initial!.width)).toBeLessThan(3);
  expect(Math.abs(reversed!.y - initial!.y)).toBeLessThan(3);
});

test('the CSS environment and film controls survive unavailable canvas rendering', async ({page})=>{
  await page.addInitScript(()=>Object.defineProperty(HTMLCanvasElement.prototype,'getContext',{value:()=>null}));
  await page.setViewportSize({width:1440,height:1000});await ready(page);
  await expect(page.locator('canvas')).toHaveAttribute('data-motion','fallback');
  expect(await page.locator('.projector-light-warm').evaluate(el=>getComputedStyle(el).animationPlayState)).toBe('running');
  await page.getByRole('button',{name:'Explore The Quiet Beyond',exact:true}).first().click();
  await expect(page.getByRole('dialog',{name:'The Quiet Beyond'})).toBeVisible();
});

test("poster choreography: independent travel, aligned resolution and reverse", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await ready(page);
  const start = await page
    .locator(".exhibition-section")
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  const sample = () =>
    page
      .locator(".exhibition-card")
      .evaluateAll((elements) =>
        elements.map((el) => ({
          x: el.getBoundingClientRect().x,
          y: el.getBoundingClientRect().y,
          transform: getComputedStyle(el).transform,
        })),
      );
  await scroll(page, start);
  const before = await sample();
  await scroll(page, start + 875);
  const middle = await sample();
  expect(
    middle.every((item, index) => item.transform !== before[index].transform),
  ).toBe(true);
  expect(
    Math.abs(middle[0].x - before[0].x - (middle[1].x - before[1].x)),
  ).toBeGreaterThan(100);
  await scroll(page, start + 1750);
  const after = await sample();
  expect(
    Math.max(...after.map((item) => item.y)) -
      Math.min(...after.map((item) => item.y)),
  ).toBeLessThan(4);
  expect(
    after.every((item, index) => index === 0 || item.x > after[index - 1].x),
  ).toBe(true);
  await scroll(page, start + 875);
  const reverse = await sample();
  expect(
    reverse.every(
      (item, index) =>
        Math.abs(item.x - middle[index].x) < 4 &&
        Math.abs(item.y - middle[index].y) < 4,
    ),
  ).toBe(true);
});

test("Vault: physical fan, rotating registration mark, film selection and Flip modes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await ready(page);
  await page.locator("#vault").scrollIntoViewIfNeeded();
  await expect(page.locator(".selection-copy h3")).toHaveText("Velvet Hours");
  const spreadWidth = () =>
    page
      .locator(".vault-item")
      .evaluateAll(
        (elements) =>
          Math.max(...elements.map((el) => el.getBoundingClientRect().right)) -
          Math.min(...elements.map((el) => el.getBoundingClientRect().left)),
      );
  const gathered = await spreadWidth();
  await page
    .getByRole("button", { name: "Spread collection", exact: true })
    .click();
  await page.waitForTimeout(1400);
  expect(await spreadWidth()).toBeGreaterThan(gathered + 70);
  const rotor = await page
    .locator(".record-rotor")
    .evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(500);
  expect(
    await page
      .locator(".record-rotor")
      .evaluate((el) => getComputedStyle(el).transform),
  ).not.toBe(rotor);
  await page.getByRole("button", { name: "2023", exact: true }).click();
  await expect(page.locator(".selection-copy h3")).toHaveText("Afterlight");
  await page.getByRole("button", { name: "Grid", exact: true }).click();
  await page.waitForTimeout(1400);
  await expect(page.locator(".vault-grid .vault-item")).toHaveCount(5);
  await page
    .getByRole("button", { name: "Select The Quiet Beyond", exact: true })
    .click();
  await expect(page.locator(".selection-copy h3")).toHaveText(
    "The Quiet Beyond",
  );
  await page
    .getByRole("button", { name: "Explore the film +", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "The Quiet Beyond" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .locator("#vault")
    .getByRole("button", { name: "Series", exact: true })
    .click();
  await expect(page.locator(".vault-item")).toHaveCount(1);
  await expect(page.locator(".selection-copy h3")).toHaveText("Velvet Hours");
  await page.getByRole("button", { name: "Timeline", exact: true }).click();
  await page.waitForTimeout(1400);
  await expect(page.locator(".vault-timeline")).toBeVisible();
});

test("reduced motion and breakpoint changes release the scene and atmosphere", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await ready(page);
  await scroll(page, 750);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(400);
  await expect(page.locator("canvas")).toHaveAttribute("data-motion", "still");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  expect(
    await page.locator(".hero-word-beyond").evaluate((el) => {
      const transform = getComputedStyle(el).transform;
      return transform === "none" || new DOMMatrix(transform).isIdentity;
    }),
  ).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForTimeout(300);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
});
