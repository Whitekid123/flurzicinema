import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
await fs.mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
for (const width of [1440, 390, 320]) {
  const page = await browser.newPage({
    viewport: { width, height: width < 600 ? 844 : 1000 },
    reducedMotion: "reduce",
  });
  await page.goto("http://127.0.0.1:3000");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `docs/screenshots/home-${width}.png` });
  for (const section of ["explore", "vault", "features", "membership", "faq"]) {
    await page.locator("#" + section).scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `docs/screenshots/${section}-${width}.png` });
  }
  await page.evaluate(() =>
    document.querySelectorAll("img").forEach((image) => {
      image.loading = "eager";
    }),
  );
  await page.waitForTimeout(600);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: `docs/screenshots/full-${width}.png`,
    fullPage: true,
  });
  console.log(`Captured ${width}px homepage and five sections`);
  await page.close();
}
await browser.close();
