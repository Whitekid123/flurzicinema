
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  timeout: 45000,

  use: {
    reducedMotion: "no-preference",
    baseURL:
      process.env.PLAYWRIGHT_BASE_URL ||
      "http://127.0.0.1:3000",

    launchOptions: {
      executablePath:
        process.env.CHROME_PATH ||
        "C:/Users/USER/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe",
    },

    trace: "retain-on-failure",
  },

  reporter: [["list"]],
});
