import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
await fs.mkdir("docs/rescue-before", { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("http://127.0.0.1:3000");
await page.waitForTimeout(1600);
const result = [];
for (const y of [0, 450, 850]) {
  await page.evaluate((y) => scrollTo(0, y), y);
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `docs/rescue-before/hero-${y}.png` });
  result.push(
    await page
      .locator(".hero-title")
      .evaluate((el) => ({
        y: scrollY,
        transform: getComputedStyle(el).transform,
      })),
  );
}
for (const selector of ["#explore", ".why-stage", "#vault", "#features"]) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.screenshot({
    path: `docs/rescue-before/${selector.replace(/[.#]/g, "")}.png`,
  });
}
await page.locator("#vault").scrollIntoViewIfNeeded();
await page.getByRole("button", { name: "Grid", exact: true }).click();
await page.waitForTimeout(900);
await page.screenshot({ path: "docs/rescue-before/vault-grid.png" });
for (const width of [768, 390]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `docs/rescue-before/home-${width}.png` });
}
await fs.writeFile(
  "docs/rescue-before/motion.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result));
await browser.close();
