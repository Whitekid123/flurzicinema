import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
const response = await page.goto("http://127.0.0.1:3001");
await page.locator("h1").waitFor();
await page.evaluate(async () => {
  await document.fonts.ready;
  await document.images[0].decode();
});
await page.screenshot({ path: "docs/screenshots/production-home.png" });
await page.getByRole("tab", { name: "StoryMatch" }).click();
await page.getByRole("button", { name: "Intrigue", exact: true }).click();
await page
  .getByRole("button", { name: "Explore your match: Velvet Hours" })
  .click();
await page.getByRole("dialog", { name: "Velvet Hours" }).waitFor();
await page.keyboard.press("Escape");
const result = {
  status: response.status(),
  hydration: "interactive",
  browserErrors: errors,
};
console.log(JSON.stringify(result));
await browser.close();
if (result.status !== 200 || errors.length) process.exitCode = 1;
