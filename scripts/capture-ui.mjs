import { chromium } from "playwright";
import fs from "node:fs/promises";
import syncFs from "node:fs";
import path from "node:path";
const cache = path.join(process.env.LOCALAPPDATA ?? "", "ms-playwright");
const localBrowser = syncFs.existsSync(cache)
  ? syncFs
      .readdirSync(cache)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]))
      .map((d) => path.join(cache, d, "chrome-win64/chrome.exe"))
      .find((p) => syncFs.existsSync(p))
  : undefined;
await fs.mkdir(".impeccable/review", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.WALLCRAFT_BROWSER ?? localBrowser,
});
const errors = [];
const swordOnly = process.argv.includes("--sword-only");
const viewports = [
  ["desktop", 1440, 1100],
  ["mobile", 390, 844],
];
for (const [name, width, height] of swordOnly
  ? viewports.slice(0, 1)
  : viewports) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5173");
  await page.getByRole("heading", { name: "Bản dựng của bạn" }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  if (!swordOnly)
    await page.screenshot({
      path: `.impeccable/review/${name}.png`,
      fullPage: true,
    });
  console.log(
    name,
    await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      canvas: document
        .querySelector(".workbench canvas")
        ?.getBoundingClientRect()
        .toJSON(),
    })),
  );
  await page.getByLabel("Tên, biệt danh hoặc lời nhắn").fill("Quỳnh");
  await page.getByRole("button", { name: "Tự căn vừa Town Hall" }).click();
  await page.screenshot({
    path: ".impeccable/review/" + name + "-input.png",
    fullPage: false,
  });
  if (name === "desktop") {
    const fonts = await page.evaluate(
      async () => (await import("/src/lib/art-fonts.ts")).ART_FONTS,
    );
    for (const font of fonts) {
      await page
        .getByRole("button", { name: "Chữ " + font.name, exact: true })
        .click();
      await page
        .locator(".canvas-area")
        .screenshot({ path: ".impeccable/review/font-" + font.id + ".png" });
    }
    await page.getByLabel("Tên, biệt danh hoặc lời nhắn").fill("W".repeat(120));
    await page.screenshot({
      path: ".impeccable/review/blocked-layout.png",
      fullPage: true,
    });
  }
  await page.close();
}
console.log("Browser errors:", errors);
await browser.close();
