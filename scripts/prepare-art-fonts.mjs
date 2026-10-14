import fs from "node:fs/promises";
import opentype from "opentype.js";
import { punctuation } from "./vietnamese-corpus.mjs";
import { inflateRawSync } from "node:zlib";

const sources = [
  ["dancing", "dancingscript", "DancingScript[wght].ttf", 700],
  ["allura", "allura", "Allura-Regular.ttf", null],
  ["vibes", "greatvibes", "GreatVibes-Regular.ttf", null],
  ["lobster", "lobster", "Lobster-Regular.ttf", null],
  ["playfair", "playfairdisplay", "PlayfairDisplay[wght].ttf", 800],
  ["coiny", "coiny", "Coiny-Regular.ttf", null],
  ["caveat", "caveat", "Caveat[wght].ttf", 700],
];
// Import the supplied libraries directly, including whole-letter R9 recipes.
// Read the ZIP directory rather than shelling out to a platform-specific unzip.
const archive = await fs.readFile("docs/all-7-fonts-json.zip");
let end = archive.length - 22;
while (
  end >= Math.max(0, archive.length - 65557) &&
  archive.readUInt32LE(end) !== 0x06054b50
)
  end--;
if (end < 0 || archive.readUInt32LE(end) !== 0x06054b50)
  throw new Error("Invalid font ZIP directory");
let entry = archive.readUInt32LE(end + 16);
await fs.mkdir("src/lib/font-library", { recursive: true });
for (let i = 0; i < archive.readUInt16LE(end + 10); i++) {
  if (archive.readUInt32LE(entry) !== 0x02014b50)
    throw new Error("Invalid font ZIP entry");
  const method = archive.readUInt16LE(entry + 10);
  const length = archive.readUInt32LE(entry + 20);
  const nameLength = archive.readUInt16LE(entry + 28);
  const name = archive.toString("utf8", entry + 46, entry + 46 + nameLength);
  const local = archive.readUInt32LE(entry + 42);
  if (!/^[a-z]+-thu-vien-tieng-viet\.json$/.test(name))
    throw new Error(`Unexpected font ZIP path: ${name}`);
  const start =
    local +
    30 +
    archive.readUInt16LE(local + 26) +
    archive.readUInt16LE(local + 28);
  const compressed = archive.subarray(start, start + length);
  const bytes =
    method === 8
      ? inflateRawSync(compressed)
      : method === 0
        ? compressed
        : null;
  if (!bytes || bytes.length !== archive.readUInt32LE(entry + 24))
    throw new Error(`Invalid font ZIP data: ${name}`);
  const library = JSON.parse(bytes.toString("utf8"));
  if (Object.keys(library.recipes).length !== 134)
    throw new Error(`Incomplete font library: ${name}`);
  await fs.writeFile(`src/lib/font-library/${name}`, bytes);
  entry +=
    46 +
    nameLength +
    archive.readUInt16LE(entry + 30) +
    archive.readUInt16LE(entry + 32);
}
const vietnamese =
  "aàáảãạăằắẳẵặâầấẩẫậeèéẻẽẹêềếểễệiìíỉĩịoòóỏõọôồốổỗộơờớởỡợuùúủũụưừứửữựyỳýỷỹỵđ";
const characters = [
  ...new Set(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&+-_.!?,:;'() " +
      vietnamese +
      vietnamese.toUpperCase() +
      punctuation.join(""),
  ),
];
const directory = "public/fonts/art";
await fs.mkdir(directory, { recursive: true });
const output = {};
function simplify(points, tolerance = 0.004) {
  if (points.length <= 2) return points;
  const a = points[0],
    b = points.at(-1),
    dx = b[0] - a[0],
    dy = b[1] - a[1],
    length = dx * dx + dy * dy;
  let maximum = 0,
    index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i],
      t = length
        ? Math.max(
            0,
            Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length),
          )
        : 0;
    const distance = Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
    if (distance > maximum) {
      maximum = distance;
      index = i;
    }
  }
  return maximum > tolerance
    ? [
        ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
        ...simplify(points.slice(index), tolerance),
      ]
    : [a, b];
}
for (const [id, folder, file, weight] of sources) {
  const libraryTag = id === "vibes" ? "greatvibes" : id;
  const library = JSON.parse(
    await fs.readFile(
      `src/lib/font-library/${libraryTag}-thu-vien-tieng-viet.json`,
      "utf8",
    ),
  );
  for (const [remote, local] of [
    [file, `${id}.ttf`],
    ["OFL.txt", `${id}-OFL.txt`],
  ]) {
    const target = `${directory}/${local}`;
    try {
      await fs.access(target);
    } catch {
      const r = await fetch(
        `https://raw.githubusercontent.com/google/fonts/main/ofl/${folder}/${encodeURIComponent(remote)}`,
      );
      if (!r.ok) throw new Error(`${file}: ${r.status}`);
      await fs.writeFile(target, Buffer.from(await r.arrayBuffer()));
    }
  }
  const bytes = await fs.readFile(`${directory}/${id}.ttf`);
  const font = opentype.parse(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  );
  if (weight !== null) font.variation.set({ wght: weight });
  const cap = font.charToGlyph("H").getBoundingBox(),
    unit = cap.y2 - cap.y1;
  const glyphs = {},
    kerning = {},
    resolvedGlyphs = {};
  for (const char of characters) {
    let glyph = font.charToGlyph(char);
    // Some handwriting fonts compose Vietnamese via shaping instead of mapping
    // every precomposed code point. Their supplied recipes contain the artwork;
    // the unaccented glyph supplies only the advance in that case.
    if (!glyph.index) glyph = font.charToGlyph(char.normalize("NFD")[0]);
    if (!glyph.index) throw new Error(`${id} lacks ${char}`);
    resolvedGlyphs[char] = glyph;
    const path = glyph.getPath(0, 0, font.unitsPerEm),
      contours = [];
    let points = [],
      previous = [0, 0],
      first = [0, 0];
    const add = (x, y) => {
      const p = [
        Math.round((x / unit) * 10000) / 10000,
        Math.round((y / unit) * 10000) / 10000,
      ];
      if (
        !points.length ||
        p[0] !== points.at(-1)[0] ||
        p[1] !== points.at(-1)[1]
      )
        points.push(p);
    };
    for (const c of path.commands) {
      if (c.type === "M") {
        if (points.length > 2) contours.push(points);
        points = [];
        add(c.x, c.y);
        first = [c.x, c.y];
      } else if (c.type === "L") add(c.x, c.y);
      else if (c.type === "Q" || c.type === "C") {
        const [x0, y0] = previous;
        const distance =
          Math.hypot(c.x1 - x0, c.y1 - y0) +
          Math.hypot(c.x - c.x1, c.y - c.y1) +
          (c.type === "C" ? Math.hypot(c.x2 - c.x1, c.y2 - c.y1) : 0);
        const n = Math.max(3, Math.ceil(distance / 25));
        for (let i = 1; i <= n; i++) {
          const t = i / n,
            s = 1 - t;
          if (c.type === "Q")
            add(
              s * s * x0 + 2 * s * t * c.x1 + t * t * c.x,
              s * s * y0 + 2 * s * t * c.y1 + t * t * c.y,
            );
          else
            add(
              s * s * s * x0 +
                3 * s * s * t * c.x1 +
                3 * s * t * t * c.x2 +
                t * t * t * c.x,
              s * s * s * y0 +
                3 * s * s * t * c.y1 +
                3 * s * t * t * c.y2 +
                t * t * t * c.y,
            );
        }
      } else if (c.type === "Z") {
        add(...first);
        if (points.length > 2) contours.push(points);
        points = [];
      }
      if (c.x !== undefined) previous = [c.x, c.y];
    }
    if (points.length > 2) contours.push(points);
    glyphs[char] = {
      advance: Math.round((glyph.advanceWidth / unit) * 10000) / 10000,
      contours:
        library.bases[char] || library.recipes[char]
          ? []
          : contours.map((c) =>
              simplify(c).map((p) => p.map((v) => Math.round(v * 1000) / 1000)),
            ),
    };
  }
  for (const a of characters)
    for (const b of characters) {
      const k = font.getKerningValue(resolvedGlyphs[a], resolvedGlyphs[b]);
      if (k) kerning[a + b] = Math.round((k / unit) * 10000) / 10000;
    }
  output[id] = {
    glyphs,
    kerning,
    pixelUnit:
      library.meta.baseline_row - Math.min(...library.bases.H.map((p) => p[1])),
  };
}
await fs.writeFile("src/lib/art-glyphs.json", JSON.stringify(output));
await fs.writeFile(
  `${directory}/SOURCES.md`,
  "# Vietnamese and English lettering\n\nPixel letters and recipes: docs/all-7-fonts-json.zip, composed according to docs/quy-tac-ghep.md. These are the authoritative letter shapes.\n\nSIL Open Font License; each supporting font license is included beside its font.\n\n" +
    sources
      .map(
        ([id, folder, file]) =>
          `- ${id}: https://github.com/google/fonts/tree/main/ofl/${folder} (${file})`,
      )
      .join("\n") +
    "\n\nSupporting outlines provide numbers and punctuation; font advances and kerning place the pixel letters on their shared baseline. Variable fonts use the weights specified in the supplied library. Rebuild from the ZIP: npm run fonts:prepare. No font download is needed at runtime.\n",
);
console.log(
  `Prepared ${sources.length} Vietnamese script fonts, ${characters.length} characters each.`,
);
