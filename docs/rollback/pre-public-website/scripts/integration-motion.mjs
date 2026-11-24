import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const dir = "docs/flim-motion";
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Users/USER/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const samples = [],
  errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
const origin = process.env.PREVIEW_URL || "http://127.0.0.1:3000";
try {
  await page.goto(origin);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(
    () =>
      document.querySelector(".immersive-cinema")?.dataset.renderer === "webgl",
  );
  const cdp = await page.context().newCDPSession(page);
  const shot = async (name) => {
    const { data } = await cdp.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    await fs.writeFile(`${dir}/${name}.png`, Buffer.from(data, "base64"));
    samples.push({
      name,
      ...(await page.evaluate(() => ({
        scroll: scrollY,
        width: innerWidth,
        renderer: document.querySelector(".immersive-cinema")?.dataset.renderer,
        motion: document.querySelector(".immersive-cinema")?.dataset.motion,
        overflow: document.documentElement.scrollWidth > innerWidth,
        geometry: [
          ...document.querySelectorAll(
            ".hero-word-beyond,.environment-camera,.exhibition-card,.feature-journey-track,.vault-item,.motion-line,#premiere-title .motion-character",
          ),
        ].map((el) => ({
          class: el.className,
          x: el.getBoundingClientRect().x,
          y: el.getBoundingClientRect().y,
          width: el.getBoundingClientRect().width,
          transform: getComputedStyle(el).transform,
        })),
      }))),
    });
  };
  const travel = async (y) => {
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
    await page.waitForTimeout(1400);
  };
  const align = async (selector) => {
    await page.evaluate((selector) => {
      const e = document.querySelector(selector);
      scrollTo({
        top: e.getBoundingClientRect().top + scrollY - 100,
        behavior: "instant",
      });
    }, selector);
    await page.waitForTimeout(1400);
  };
  await shot("hero-opening");
  await page.waitForTimeout(1500);
  await shot("environment-later");
  await page.waitForTimeout(5000);
  await shot("hero-next-image-group");
  await page
    .getByRole("button", { name: "Pause film sequence", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Show The Quiet Beyond", exact: true })
    .click();
  await page.waitForTimeout(1500);
  const heroDistance = await page.locator(".cinema-hero").evaluate((el) =>
    el.parentElement.offsetHeight - el.offsetHeight,
  );
  for (const [name, y] of [
    ["hero-quarter", heroDistance * 0.25],
    ["hero-camera", heroDistance * 0.5],
    ["hero-near-dock", heroDistance * 0.75],
    ["hero-docked", heroDistance],
    ["hero-camera-reverse", heroDistance * 0.5],
    ["hero-opening-reverse", 0],
  ]) {
    await travel(y);
    await shot(name);
  }
  const posterStart = await page.evaluate(
    () =>
      document.querySelector(".exhibition-section").getBoundingClientRect()
        .top + scrollY,
  );
  for (const [name, p] of [
    ["posters-scattered", 0],
    ["posters-travel", 0.5],
    ["posters-resolved", 1],
    ["posters-reverse", 0.5],
  ]) {
    await travel(posterStart + 1750 * p);
    await shot(name);
  }
  await align("#vault");
  await shot("vault-intro");
  await align(".vault-layout");
  await shot("vault-fan");
  await page
    .getByRole("button", { name: "Spread collection", exact: true })
    .click();
  await page.waitForTimeout(1400);
  await shot("vault-spread");
  await page.getByRole("button", { name: "Next film", exact: true }).click();
  await page.waitForTimeout(1400);
  await shot("vault-selected");
  await page.getByRole("button", { name: "Grid", exact: true }).click();
  await page.waitForTimeout(1600);
  await align(".vault-grid");
  await shot("vault-grid");
  const journey = await page.evaluate(() => {
    const e = document.querySelector(".feature-journey-stage");
    return {
      start: e.getBoundingClientRect().top + scrollY - 90,
      distance: e.clientWidth * 2.4,
    };
  });
  for (const [name, p] of [
    ["feature-rooms", 0],
    ["feature-transition", 1 / 6],
    ["feature-match", 1 / 3],
    ["feature-lens", 2 / 3],
    ["feature-data", 1],
    ["feature-match-reverse", 1 / 3],
  ]) {
    await travel(journey.start + journey.distance * p);
    await shot(name);
  }
  for (const [name, selector] of [
    ["manifesto", ".manifesto-section"],
    ["premiere", "#series"],
    ["membership", "#membership"],
    ["faq", "#faq"],
    ["final", ".final-cta"],
  ]) {
    await align(selector);
    await shot(name);
  }
  const featureHeading = await page
    .locator("#features [data-split-lines]")
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await travel(featureHeading - 1100);
  await page.evaluate(
    (top) => scrollTo({ top: top - 700, behavior: "instant" }),
    featureHeading,
  );
  await page.waitForTimeout(150);
  await shot("feature-text-enter");
  await page.waitForTimeout(1200);
  await shot("feature-text-resolved");
  const premiereTitle = await page
    .locator("#premiere-title")
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await travel(premiereTitle - 1100);
  await page.evaluate(
    (top) => scrollTo({ top: top - 700, behavior: "instant" }),
    premiereTitle,
  );
  await page.waitForTimeout(150);
  await shot("premiere-text-enter");
  await page.waitForTimeout(1400);
  await shot("premiere-text-resolved");
  for (const width of [1024, 768, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto(origin);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    await shot(`normal-${width}-opening`);
    for (const [name, selector] of [
      ["posters", "#explore"],
      ["vault", "#vault"],
      ["features", "#features"],
    ]) {
      await align(selector);
      await shot(`normal-${width}-${name}`);
    }
  }
  await fs.writeFile(
    `${dir}/verified-motion.json`,
    JSON.stringify({ browser: browser.version(), errors, samples }, null, 2),
  );
  console.log(
    JSON.stringify({
      frames: samples.length,
      errors,
      overflows: samples.filter((x) => x.overflow).map((x) => x.name),
    }),
  );
} finally {
  await browser.close();
}
