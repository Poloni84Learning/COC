import fs from "node:fs/promises";
const response = await fetch(
  "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap",
  { headers: { "User-Agent": "Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36" } },
);
if (!response.ok) throw new Error(`Font stylesheet: ${response.status}`);
let css = await response.text();
const urls = [
  ...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1])),
];
await fs.mkdir("public/fonts", { recursive: true });
for (let i = 0; i < urls.length; i++) {
  const url = urls[i],
    r = await fetch(url);
  if (!r.ok) throw new Error(`Font download: ${r.status}`);
  const name = `be-vietnam-pro-${i + 1}.${url.endsWith(".woff2") ? "woff2" : "ttf"}`;
  await fs.writeFile(
    `public/fonts/${name}`,
    Buffer.from(await r.arrayBuffer()),
  );
  css = css.split(url).join(`./${name}`);
}
await fs.writeFile("public/fonts/fonts.css", css);
await fs.writeFile(
  "public/fonts/PROVENANCE.md",
  "Be Vietnam Pro from Google Fonts, SIL Open Font License. Source: https://github.com/bettergui/BeVietnamPro and https://fonts.google.com/specimen/Be+Vietnam+Pro. Downloaded 2026-10-05.\n",
);
console.log(`Self-hosted ${urls.length} font files.`);
