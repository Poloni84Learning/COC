import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
const cache = path.join(process.env.LOCALAPPDATA, "ms-playwright");
const versions = (await fs.readdir(cache))
  .filter((x) => /^chromium-\d+$/.test(x))
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
const result = await page.evaluate(async () => {
  const { generate, DEFAULT_OPTIONS, PATTERNS, autoFit, inside } =
    await import("/src/lib/engine.ts");
  const fonts = (await import("/src/lib/art-fonts.ts")).ART_FONTS.map(
    (f) => f.id,
  );
  const { paint, preload } = await import("/src/lib/render.ts");
  const data = await (await fetch("/game-data.json")).json();
  const hall = data.halls.find((h) => h.level === 16);
  const base = {
    buildings: [],
    hall,
    isometric: true,
    showGrid: false,
    showCoordinates: false,
    zoom: 1,
  };
  await preload(base);
  const sheets = [],
    records = [];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const groups = [];
  for (const font of fonts) {
    for (const [name, chars] of [
      ["upper", alphabet],
      ["lower", alphabet.toLowerCase()],
      ["vietnamese", "ĂÂĐÊÔƠƯăâđêôơưÁÀẢÃẠẮẰẲẴẶấầẩẫậếềểễệớờởỡợứừửữự"],
    ])
      groups.push({
        name: font + "-" + name,
        items: [...chars].map((text) => ({
          label: text,
          options: { ...DEFAULT_OPTIONS, font, text, ornaments: false },
        })),
      });
  }
  groups.push({
    name: "patterns",
    items: PATTERNS.map((p) => ({
      label: p.name,
      options: autoFit(
        { ...DEFAULT_OPTIONS, mode: "shape", pattern: p.id },
        325,
      ),
    })),
  });
  groups.push({
    name: "words",
    items: [
      "Phúc",
      "Linh",
      "JayPee",
      "Butterfly",
      "Nguyễn",
      "Trường",
      "Quỳnh",
      "Đặng",
    ].flatMap((text) =>
      fonts.map((font) => ({
        label: font + " / " + text,
        options: autoFit({ ...DEFAULT_OPTIONS, text, font }, 325),
      })),
    ),
  });
  for (const group of groups) {
    const atlas = document.createElement("canvas");
    atlas.width = 1500;
    atlas.height = Math.ceil(group.items.length / 5) * 230;
    const ctx = atlas.getContext("2d");
    ctx.fillStyle = "#eef2f4";
    ctx.fillRect(0, 0, atlas.width, atlas.height);
    for (const [i, item] of group.items.entries()) {
      const gen = generate(item.options, 325);
      records.push({
        sheet: group.name,
        label: item.label,
        count: gen.cells.length,
        issue: gen.issue,
        unsupported: gen.unsupported,
        outside: gen.cells.filter((c) => !inside(c)).length,
      });
      const tile = document.createElement("canvas");
      paint(tile, { ...base, walls: gen.cells }, 920, 560);
      const xs = gen.cells.map((c) => 460 + (c.x - c.y) * 10),
        ys = gen.cells.map((c) => 78.4 + (c.x + c.y) * 5);
      const x = Math.min(...xs) - 18,
        y = Math.min(...ys) - 30,
        w = Math.max(...xs) - x + 18,
        h = Math.max(...ys) - y + 20;
      const tx = (i % 5) * 300,
        ty = Math.floor(i / 5) * 230;
      ctx.fillStyle = "#304a39";
      ctx.fillRect(tx + 3, ty + 3, 294, 194);
      if (gen.cells.length) {
        const s = Math.min(274 / w, 174 / h);
        ctx.drawImage(
          tile,
          x,
          y,
          w,
          h,
          tx + 150 - (w * s) / 2,
          ty + 100 - (h * s) / 2,
          w * s,
          h * s,
        );
      }
      ctx.fillStyle = "#172d40";
      ctx.font = "15px sans-serif";
      ctx.fillText(
        item.label + " · " + gen.cells.length + " walls",
        tx + 10,
        ty + 218,
      );
    }
    sheets.push({
      name: group.name,
      png: atlas.toDataURL("image/png").split(",")[1],
    });
  }
  const scan = [];
  for (const font of fonts)
    for (const text of alphabet + alphabet.toLowerCase())
      for (const scale of [1, 2, 3]) {
        const g = generate(
          { ...DEFAULT_OPTIONS, font, text, scale, ornaments: false },
          325,
        );
        scan.push({
          font,
          text,
          scale,
          count: g.cells.length,
          issue: g.issue,
          unsupported: g.unsupported,
        });
      }
  return { sheets, records, scan };
});
const out = ".impeccable/review/alphabet-3d";
await fs.mkdir(out, { recursive: true });
for (const sheet of result.sheets)
  await fs.writeFile(
    `${out}/${sheet.name}.png`,
    Buffer.from(sheet.png, "base64"),
  );
await fs.writeFile(
  `${out}/scan.json`,
  JSON.stringify(
    { records: result.records, scan: result.scan, errors },
    null,
    2,
  ),
);
await fs.writeFile(
  `${out}/index.html`,
  `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Wallcraft — kiểm tra mẫu 3D</title><style>body{font:16px system-ui;margin:24px;color:#172d40;background:#eef2f4}img{display:block;width:100%;height:auto}section{margin:40px 0}a{color:#164f70}</style><h1>Kiểm tra mẫu theo góc làng 3D</h1><p>320 mẫu dựng bằng bộ render thật của ứng dụng. Chữ đơn ở cỡ vừa, tắt họa tiết; mẫu từ và hình tự căn trong 325 tường. Các ô được phóng để nhìn nét, không dùng để so sánh kích thước.</p><p>468 trường hợp Alphabet: 52 ký tự × 3 font × 3 kích thước. Chi tiết máy: <a href="scan.json">scan.json</a>.</p><nav>${result.sheets.map((s) => `<a href="#${s.name}">${s.name}</a>`).join(" · ")}</nav>${result.sheets.map((s) => `<section id="${s.name}"><h2>${s.name}</h2><a href="${s.name}.png"><img src="${s.name}.png" alt="Bảng mẫu ${s.name} theo góc làng 3D" loading="lazy"></a></section>`).join("")}</html>`,
);
console.log(
  JSON.stringify({
    sheets: result.sheets.map((s) => s.name),
    samples: result.records.length,
    alphabetCases: result.scan.length,
    failures: [...result.records, ...result.scan].filter(
      (r) => r.issue || !r.count || r.unsupported.length,
    ),
    errors,
  }),
);
await browser.close();
if (
  errors.length ||
  [...result.records, ...result.scan].some(
    (r) => r.issue || !r.count || r.unsupported.length,
  )
)
  process.exitCode = 1;
