import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const findings = [];
for (const [name, url] of [
  ["flim", "https://flim.ai/"],
  ["van", "https://vanmorrison.com/music"],
  ["trinity", "https://trinity.fantik.studio/"],
  ["avalon", "https://links.avalonplatforms.com/"],
]) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
    await page.waitForTimeout(2000);
    const initial = await page.locator("body").innerText({ timeout: 5000 });
    await page.screenshot({ path: `docs/${name}-desktop.png` });
    const samples = [];
    for (const progress of [0.25, 0.5, 0.75]) {
      await page.evaluate(
        (p) =>
          window.scrollTo(
            0,
            (document.documentElement.scrollHeight - innerHeight) * p,
          ),
        progress,
      );
      await page.waitForTimeout(700);
      await page.screenshot({ path: `docs/${name}-scroll-${progress}.png` });
      samples.push(
        await page.evaluate(() => ({
          y: scrollY,
          height: document.documentElement.scrollHeight,
          transformed: Array.from(document.querySelectorAll("h1,h2,img"))
            .filter((el) => getComputedStyle(el).transform !== "none")
            .slice(0, 8)
            .map((el) => ({
              tag: el.tagName,
              text: (el.textContent || el.getAttribute("alt") || "").slice(
                0,
                50,
              ),
              transform: getComputedStyle(el).transform,
            })),
        })),
      );
    }
    const grid = page.getByText("Grid", { exact: true });
    let gridClicked = false;
    if (await grid.count()) {
      await grid
        .first()
        .click({ timeout: 3000 })
        .then(() => {
          gridClicked = true;
        })
        .catch(() => {});
      await page.waitForTimeout(900);
      await page.screenshot({ path: `docs/${name}-grid.png` });
    }
    const firstImage = page.locator("main img").first();
    let hover = false;
    if (await firstImage.count())
      await firstImage
        .hover({ timeout: 2000 })
        .then(() => {
          hover = true;
        })
        .catch(() => {});
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
    await page.screenshot({ path: `docs/${name}-mobile.png` });
    findings.push({
      name,
      url,
      initial: initial.slice(0, 1800),
      samples,
      gridClicked,
      hover,
    });
  } catch (error) {
    findings.push({ name, url, error: error.message });
  }
  await page.close();
}
await fs.writeFile(
  "docs/browser-reference-observations.json",
  JSON.stringify(findings, null, 2),
);
console.log(JSON.stringify(findings, null, 2));
await browser.close();
