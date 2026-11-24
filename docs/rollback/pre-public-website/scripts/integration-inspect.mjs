import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const reference = process.argv.includes("--reference");
const after = process.argv.includes("--after");
const dir = `docs/flim-${reference ? "reference" : after ? "after" : "before"}`;
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Users/USER/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe",
  headless: true,
});
const observations = [];
try {
  for (const width of reference ? [1440, 390] : [1440, 1024, 768, 390]) {
    const page = await browser.newPage({
      viewport: { width, height: width < 600 ? 844 : 1000 },
      reducedMotion: reference ? "no-preference" : "reduce",
    });
    page.setDefaultTimeout(12000);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(
      reference
        ? "https://flim.ai/"
        : process.env.PREVIEW_URL || "http://127.0.0.1:3000",
      { waitUntil: "domcontentloaded", timeout: 45000 },
    );
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);
    if (reference) {
      for (const label of ["Reject all", "Reject", "Accept all"]) {
        const b = page
          .getByRole("button", { name: label, exact: true })
          .first();
        if (await b.isVisible().catch(() => false)) await b.click();
      }
    }
    const height = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    const positions = reference
      ? Array.from({ length: 12 }, (_, i) =>
          Math.round((i * (height - 1000)) / 11),
        )
      : [0, 750, 1500];
    for (const y of positions) {
      await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: `${dir}/${width}-${y}.png`,
        timeout: 15000,
      });
      observations.push({
        width,
        requested: y,
        errors: [...errors],
        ...(await page.evaluate(() => ({
          y: scrollY,
          overflow: document.documentElement.scrollWidth > innerWidth,
          headings: [...document.querySelectorAll("h1,h2,h3")]
            .filter((e) => {
              const r = e.getBoundingClientRect();
              return r.top < innerHeight && r.bottom > 0;
            })
            .map((e) => e.textContent),
          elements: [
            ...document.querySelectorAll(
              "canvas,.hero-word-beyond,.environment-camera,.exhibition-card,[class*=pill]",
            ),
          ]
            .slice(0, 30)
            .map((e) => ({
              class: e.className,
              transform: getComputedStyle(e).transform,
            })),
        }))),
      });
    }
    const sections = reference
      ? []
      : [
          "#explore",
          ".manifesto-section",
          "#vault",
          "#features",
          "#series",
          "#membership",
        ];
    for (const selector of sections) {
      await page.evaluate((selector) => {
        const e = document.querySelector(selector);
        scrollTo({
          top: e.getBoundingClientRect().top + scrollY - 80,
          behavior: "instant",
        });
      }, selector);
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: `${dir}/${width}-${selector.replace(/[.#]/g, "")}.png`,
      });
    }
    await page.evaluate(() => scrollTo({ top: 750, behavior: "instant" }));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${dir}/${width}-reverse.png` });
    if (reference) {
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(1000);
      const button = page
        .locator("a,button")
        .filter({ hasText: /get started/i })
        .first();
      if (await button.isVisible().catch(() => false)) {
        await button.hover();
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${dir}/${width}-hover.png` });
      }
      const input = page.locator("input").first();
      if (await input.isVisible().catch(() => false)) {
        await input.focus();
        await page.waitForTimeout(800);
        await page.screenshot({ path: `${dir}/${width}-hero-interrupt.png` });
        await input.blur();
        await page.waitForTimeout(1800);
        await page.screenshot({ path: `${dir}/${width}-hero-resume.png` });
      }
    }
    console.log(
      `Captured ${width}px ${reference ? "reference" : after ? "after" : "baseline"}`,
    );
    await page.close();
  }
  if (reference) {
    const page = await browser.newPage();
    try {
      await page.goto("https://trinity.fantik.studio/", {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${dir}/trinity.png` });
      observations.push({
        trinity: await page.evaluate(() => ({
          title: document.title,
          text: document.body?.innerText?.slice(0, 500),
          canvas: document.querySelectorAll("canvas").length,
        })),
      });
    } catch (e) {
      observations.push({ trinityError: e.message });
    }
    await page.close();
  }
} finally {
  await fs.writeFile(
    `${dir}/observations.json`,
    JSON.stringify(observations, null, 2),
  );
  await browser.close();
}
