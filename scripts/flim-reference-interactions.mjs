import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const dir = "docs/flim-reference";
const browser = await chromium.launch({
  executablePath:
    "C:/Users/USER/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(12000);
const observations = [];
try {
  await page.goto("https://flim.ai/", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(1600);
  const reject = page.getByText("Reject", { exact: true }).first();
  if (await reject.isVisible().catch(() => false)) await reject.click();
  const record = async (name) => {
    observations.push({
      name,
      ...(await page.evaluate(() => ({
        y: scrollY,
        inputs: [...document.querySelectorAll("input,[contenteditable]")].map(
          (e) => ({
            tag: e.tagName,
            type: e.getAttribute("type"),
            placeholder: e.getAttribute("placeholder"),
            text: e.textContent,
            visible: e.getBoundingClientRect().height > 0,
          }),
        ),
        buttons: [...document.querySelectorAll("button,a")]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return r.top >= 0 && r.top < innerHeight;
          })
          .slice(0, 15)
          .map((e) => ({
            text: e.textContent,
            transform: getComputedStyle(e).transform,
          })),
        images: [...document.querySelectorAll("img")]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return r.top < innerHeight && r.bottom > 0 && r.width > 30;
          })
          .slice(0, 15)
          .map((e) => ({
            x: e.getBoundingClientRect().x,
            y: e.getBoundingClientRect().y,
            transform: getComputedStyle(e).transform,
          })),
      }))),
    });
    await page.screenshot({ path: `${dir}/interaction-${name}.png` });
  };
  await record("hero-first");
  await page.waitForTimeout(3000);
  await record("hero-later");
  const sign = page
    .getByText(/sign.up/i)
    .filter({ visible: true })
    .first();
  if (await sign.count()) {
    await sign.hover();
    await page.waitForTimeout(150);
    await record("button-hover");
    await page.mouse.move(700, 700);
    await page.waitForTimeout(400);
    await record("button-reverse");
  }
  const fields = page
    .locator("input,[contenteditable=true]")
    .filter({ visible: true });
  if (await fields.count()) {
    await fields.first().focus();
    await page.waitForTimeout(800);
    await record("hero-focus-interrupt");
    await fields.first().blur();
    await page.waitForTimeout(2000);
    await record("hero-blur-resume");
  }
  const story = page
    .getByText("Shape Ideas Together", { exact: false })
    .first();
  if (await story.count()) {
    await story.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await record("composition-before");
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 160);
      await page.waitForTimeout(180);
    }
    await record("composition-after");
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, -160);
      await page.waitForTimeout(180);
    }
    await record("composition-reverse");
  }
} finally {
  await fs.writeFile(
    `${dir}/interaction-observations.json`,
    JSON.stringify(observations, null, 2),
  );
  await browser.close();
}
