import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { vowelRows, punctuation, phrases } from "./vietnamese-corpus.mjs";
const cache = path.join(process.env.LOCALAPPDATA, "ms-playwright");
const versions = (await fs.readdir(cache))
  .filter((s) => /^chromium-\d+$/.test(s))
  .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
const browser = await chromium.launch({
  executablePath:
    process.env.WALLCRAFT_BROWSER ??
    path.join(cache, versions[0], "chrome-win64/chrome.exe"),
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:5173");
const groups = [];
const fonts = Object.keys(
  JSON.parse(await fs.readFile("src/lib/art-glyphs.json", "utf8")),
);
for (const font of fonts)
  for (const scale of [1, 2, 3]) {
    for (const [caseName, parity] of [
      ["lower", 0],
      ["upper", 1],
    ])
      for (const half of [0, 1]) {
        const chars = vowelRows
          .filter((_, i) => i % 2 === parity)
          .slice(half * 6, half * 6 + 6)
          .flat();
        groups.push({
          name: `${font}-${scale}-${caseName}-${half + 1}`,
          font,
          scale,
          chars,
        });
      }
    groups.push({
      name: `${font}-${scale}-punctuation`,
      font,
      scale,
      chars: punctuation,
    });
  }
for (const font of fonts)
  groups.push({
    name: `${font}-phrases`,
    font,
    scale: 2,
    chars: phrases,
    fit: true,
  });
const out = ".impeccable/review/vietnamese-full";
await fs.mkdir(out, { recursive: true });
const records = [];
for (const group of groups) {
  const r = await page.evaluate(async (group) => {
    const { generate, DEFAULT_OPTIONS, autoFit } =
      await import("/src/lib/engine.ts");
    const { paint, preload } = await import("/src/lib/render.ts");
    const { halls } = await (await fetch("/game-data.json")).json();
    const hall = halls.find((h) => h.level === 16);
    const render = {
      buildings: [],
      hall,
      isometric: true,
      showGrid: false,
      showCoordinates: false,
      zoom: 1,
    };
    await preload(render);
    const columns = group.fit ? 3 : 6,
      cw = group.fit ? 400 : 200,
      ch = group.fit ? 240 : 170;
    const canvas = document.createElement("canvas");
    canvas.width = columns * cw;
    canvas.height = Math.ceil(group.chars.length / columns) * ch;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#eef2f4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const cases = [];
    for (const [i, text] of group.chars.entries()) {
      const opts = {
        ...DEFAULT_OPTIONS,
        font: group.font,
        text,
        scale: group.scale,
        ornaments: false,
      };
      const fit = group.fit ? autoFit(opts, 325) : opts;
      const g = generate(fit ?? opts, 325);
      cases.push({
        text,
        count: g.cells.length,
        issue: g.issue,
        scale: fit?.scale,
      });
      const tile = document.createElement("canvas");
      paint(tile, { ...render, walls: g.cells }, 920, 560);
      const tx = (i % columns) * cw,
        ty = Math.floor(i / columns) * ch;
      ctx.fillStyle = "#304a39";
      ctx.fillRect(tx + 2, ty + 2, cw - 4, ch - 28);
      if (g.cells.length) {
        const xs = g.cells.map((p) => 460 + (p.x - p.y) * 10),
          ys = g.cells.map((p) => 78.4 + (p.x + p.y) * 5);
        const x = Math.min(...xs) - 17,
          y = Math.min(...ys) - 30,
          w = Math.max(...xs) - x + 17,
          h = Math.max(...ys) - y + 20;
        const s = Math.min((cw - 20) / w, (ch - 46) / h, 1.25);
        ctx.drawImage(
          tile,
          x,
          y,
          w,
          h,
          tx + (cw - w * s) / 2,
          ty + (ch - 28 - h * s) / 2,
          w * s,
          h * s,
        );
      }
      ctx.fillStyle = "#172d40";
      ctx.font = "14px system-ui";
      ctx.fillText(
        `${text.replaceAll("\n", " ↵ ")} · ${g.cells.length}`,
        tx + 8,
        ty + ch - 9,
      );
    }
    return { png: canvas.toDataURL("image/png").split(",")[1], cases };
  }, group);
  await fs.writeFile(`${out}/${group.name}.png`, Buffer.from(r.png, "base64"));
  records.push({ name: group.name, cases: r.cases });
}
await fs.writeFile(
  `${out}/renders.json`,
  JSON.stringify({ records, errors }, null, 2),
);
await fs.writeFile(
  `${out}/index.html`,
  `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Tiếng Việt và dấu câu — Wallcraft 3D</title><style>body{font:16px system-ui;background:#eef2f4;color:#172d40;margin:24px}img{width:100%;max-width:1200px;height:auto}a{color:#145075}section{margin:40px 0}nav{line-height:2}</style><h1>Toàn bộ tổ hợp tiếng Việt và dấu câu · góc làng 3D</h1><p>Mỗi hàng nguyên âm: ngang · huyền · sắc · hỏi · ngã · nặng. Đủ 12 nguyên âm × 6 thanh × hoa/thường × 3 font × 3 cỡ. Mỗi ô phóng theo khung để kiểm tra hình, không so kích thước giữa các ô. Dấu câu có thể có hình giống nhau khi đứng riêng nhưng khác vị trí khi ghép từ.</p><p><a href="scan.json">Kết quả quét tự động</a> · <a href="renders.json">Các bản dựng thực tế</a></p><nav>${groups.map((g) => `<a href="#${g.name}">${g.name}</a>`).join(" · ")}</nav>${groups.map((g) => `<section id="${g.name}"><h2>${g.name}</h2><a href="${g.name}.png"><img loading="lazy" src="${g.name}.png" alt="Bảng ${g.name}"></a></section>`).join("")}</html>`,
);
console.log(
  JSON.stringify({
    sheets: records.length,
    renders: records.reduce((n, r) => n + r.cases.length, 0),
    failures: records.flatMap((r) => r.cases.filter((c) => c.issue)),
    errors,
  }),
);
await browser.close();
if (errors.length || records.some((r) => r.cases.some((c) => c.issue)))
  process.exitCode = 1;
