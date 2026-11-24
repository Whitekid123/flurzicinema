import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const dir = "docs/rescue-final";
const previewURL = process.env.PREVIEW_URL || "http://127.0.0.1:3000";
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
await page.goto(previewURL);
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(
  () => document.querySelector("canvas")?.dataset.motion,
);
const samples = [];
async function shot(name) {
  await page.screenshot({ path: `${dir}/${name}.png` });
  samples.push({
    name,
    ...(await page.evaluate(() => ({
      scroll: scrollY,
      overflow: document.documentElement.scrollWidth > innerWidth,
      canvasFrame: document.querySelector("canvas")?.dataset.frame,
      geometry: Array.from(
        document.querySelectorAll(
          ".hero-word-beyond,.hero-word-watching,.environment-camera,.hero-screen,.exhibition-card,.vault-item,.record-rotor",
        ),
      ).map((el) => ({
        class: el.className,
        transform: getComputedStyle(el).transform,
        x: el.getBoundingClientRect().x,
        y: el.getBoundingClientRect().y,
        width: el.getBoundingClientRect().width,
      })),
    }))),
  });
}
async function travel(y) {
  await page.evaluate((y) => scrollTo(0, y), y);
  await page.waitForTimeout(1100);
}
async function align(selector, offset = 90) {
  await page
    .locator(selector)
    .evaluate(
      (el, offset) =>
        scrollTo(0, el.getBoundingClientRect().top + scrollY - offset),
      offset,
    );
  await page.waitForTimeout(600);
}
for (const [name, y] of [
  ["hero-open", 0],
  ["hero-camera", 750],
  ["hero-docked", 1500],
  ["hero-reverse", 0],
]) {
  await travel(y);
  await shot(name);
}
const start = await page
  .locator(".exhibition-section")
  .evaluate((el) => el.getBoundingClientRect().top + scrollY);
for (const [name, fraction] of [
  ["posters-scattered", 0],
  ["posters-travel", 0.5],
  ["posters-resolved", 1],
  ["posters-reverse", 0.5],
]) {
  await travel(start + 1750 * fraction);
  await shot(name);
}
await align("#vault");
await shot("vault-intro");
await align(".vault-layout", 170);
await shot("vault-gathered");
await page
  .getByRole("button", { name: "Spread collection", exact: true })
  .click();
await page.waitForTimeout(1400);
await shot("vault-spread");
await page.getByRole("button", { name: "Next film", exact: true }).click();
await page.waitForTimeout(1400);
await shot("vault-selection");
await page.getByRole("button", { name: "Grid", exact: true }).click();
await page.waitForTimeout(1400);
await align(".vault-grid", 180);
await shot("vault-grid");
for (const selector of [
  ".manifesto-section",
  "#features",
  "#series",
  "#membership",
  "#faq",
  ".final-cta",
]) {
  await align(selector);
  await shot(selector.replace(/[.#]/g, ""));
}
await page.close();
for (const width of [1920, 1024, 768, 390, 320]) {
  const small = await browser.newPage({
    viewport: { width, height: width > 600 ? 1000 : 844 },
    reducedMotion: "reduce",
  });
  await small.goto(previewURL);
  await small.evaluate(() => document.fonts.ready);
  await small.waitForFunction(
    () => document.querySelector("canvas")?.dataset.motion === "still",
  );
  await small.screenshot({ path: `${dir}/home-${width}.png` });
  for (const selector of [
    "#explore",
    "#vault",
    "#features",
    "#series",
    "#membership",
  ]) {
    await small
      .locator(selector)
      .evaluate((el) =>
        scrollTo(0, el.getBoundingClientRect().top + scrollY - 80),
      );
    await small.waitForTimeout(500);
    await small.screenshot({
      path: `${dir}/${selector.slice(1)}-${width}.png`,
    });
  }
  console.log(
    JSON.stringify({
      width,
      overflow: await small.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    }),
  );
  await small.close();
}
await fs.writeFile(
  `${dir}/verified-motion.json`,
  JSON.stringify({ errors, samples }, null, 2),
);
await browser.close();
console.log(JSON.stringify({ errors, frames: samples.length }));
