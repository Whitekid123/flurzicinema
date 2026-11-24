import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const directory = "docs/rescue-reference";
await fs.mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const findings = await Promise.all(
  [
    ["flim", "https://flim.ai/"],
    ["van", "https://vanmorrison.com/music"],
    ["trinity", "https://trinity.fantik.studio/"],
    ["avalon", "https://links.avalonplatforms.com/"],
  ].map(async ([name, url]) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      recordVideo: { dir: directory, size: { width: 1440, height: 1000 } },
    });
    const page = await context.newPage();
    const result = { name, url, samples: [] };
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.locator("body").waitFor({ timeout: 8000 });
      await page.waitForTimeout(1200);
      for (const label of ["Reject", "Reject all"]) {
        const button = page
          .getByRole("button", { name: label, exact: true })
          .first();
        if (await button.isVisible().catch(() => false))
          await button.click().catch(() => {});
      }
      const observe = async (label) => {
        result.samples.push({
          label,
          ...(await page.evaluate(() => ({
            scroll: scrollY,
            visible: Array.from(
              document.querySelectorAll(
                "h1,h2,h3,img,button,[class*=pill],[class*=album],[class*=disc]",
              ),
            )
              .filter((el) => {
                const r = el.getBoundingClientRect();
                return (
                  r.width && r.height && r.top < innerHeight && r.bottom > 0
                );
              })
              .slice(0, 30)
              .map((el) => ({
                tag: el.tagName,
                class: typeof el.className === "string" ? el.className : "svg",
                text: (el.textContent || el.getAttribute("alt") || "").slice(
                  0,
                  70,
                ),
                matrix: getComputedStyle(el).transform,
                rect: {
                  x: el.getBoundingClientRect().x,
                  y: el.getBoundingClientRect().y,
                  width: el.getBoundingClientRect().width,
                },
              })),
            videos: Array.from(document.querySelectorAll("video")).map((v) => ({
              time: v.currentTime,
              paused: v.paused,
              ready: v.readyState,
            })),
          }))),
        });
        await page.screenshot({ path: `${directory}/${name}-${label}.png` });
      };
      await observe("opening");
      if (name === "flim") {
        for (const [label, text] of [
          ["influences", "Find your influences"],
          ["collaborate", "Save"],
        ]) {
          const locator = page.getByText(text, { exact: true }).first();
          if (await locator.count()) {
            const y = await locator.evaluate(
              (el) =>
                el.getBoundingClientRect().top + scrollY - innerHeight * 0.7,
            );
            await page.evaluate((y) => scrollTo(0, Math.max(0, y)), y);
            await page.waitForTimeout(500);
            for (let i = 0; i < 10; i++) {
              await page.mouse.wheel(0, 130);
              await page.waitForTimeout(100);
              if ([0, 4, 9].includes(i)) await observe(`${label}-forward-${i}`);
            }
            for (let i = 0; i < 5; i++) {
              await page.mouse.wheel(0, -180);
              await page.waitForTimeout(100);
            }
            await observe(`${label}-reverse`);
          }
        }
      } else if (name === "van") {
        for (let i = 0; i < 8; i++) {
          await page.mouse.wheel(0, 160);
          await page.waitForTimeout(130);
        }
        await observe("timeline-travel");
        const grid = page.getByText("Grid", { exact: true }).first();
        await grid.click();
        await page.waitForTimeout(850);
        await observe("grid");
        const image = page.locator("img").filter({ visible: true }).first();
        if (await image.count()) {
          await image.hover();
          await page.waitForTimeout(700);
          await observe("hover");
        }
        await page.getByText("Timeline", { exact: true }).first().click();
        await page.waitForTimeout(800);
        await observe("timeline-return");
        await page.goto("https://vanmorrison.com/", {
          waitUntil: "domcontentloaded",
          timeout: 25000,
        });
        await page.waitForTimeout(1000);
        await observe("homepage");
      } else {
        await page.waitForTimeout(1800);
        await observe("ambient-later");
        for (let i = 0; i < 8; i++) {
          await page.mouse.wheel(0, 170);
          await page.waitForTimeout(120);
        }
        await observe("scroll");
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(600);
      await observe("mobile");
    } catch (error) {
      result.error = error.message;
    }
    result.video = await page.video()?.path();
    await context.close();
    return result;
  }),
);
await fs.writeFile(
  `${directory}/observations.json`,
  JSON.stringify(findings, null, 2),
);
console.log(
  JSON.stringify(
    findings.map(({ name, error, samples, video }) => ({
      name,
      error,
      sampleCount: samples.length,
      video,
    })),
    null,
    2,
  ),
);
await browser.close();
