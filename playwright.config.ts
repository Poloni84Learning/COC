import { defineConfig } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
const cache = path.join(process.env.LOCALAPPDATA ?? "", "ms-playwright");
const localBrowser = fs.existsSync(cache)
  ? fs
      .readdirSync(cache)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]))
      .map((d) => path.join(cache, d, "chrome-win64/chrome.exe"))
      .find((p) => fs.existsSync(p))
  : undefined;
export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  timeout: 30000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: true,
    launchOptions: {
      executablePath: process.env.WALLCRAFT_BROWSER ?? localBrowser,
    },
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
  },
});
