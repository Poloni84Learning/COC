import outlines from "./art-glyphs.json";
import dancing from "./font-library/dancing-thu-vien-tieng-viet.json";
import allura from "./font-library/allura-thu-vien-tieng-viet.json";
import vibes from "./font-library/greatvibes-thu-vien-tieng-viet.json";
import lobster from "./font-library/lobster-thu-vien-tieng-viet.json";
import playfair from "./font-library/playfair-thu-vien-tieng-viet.json";
import coiny from "./font-library/coiny-thu-vien-tieng-viet.json";
import caveat from "./font-library/caveat-thu-vien-tieng-viet.json";
import type { DesignOptions } from "../types";

export type Point = [number, number];
export type ScriptFont = {
  glyphs: Record<string, { advance: number; contours: Point[][] }>;
  kerning: Record<string, number>;
  pixelUnit: number;
};
export type PixelLibrary = {
  meta: { canvas: number[]; baseline_row: number; luu_nguyen_chu?: string[] };
  bases: Record<string, number[][]>;
  overlays: Record<string, number[][]>;
  recipes: Record<string, string[]>;
};
const libraries: Record<DesignOptions["font"], PixelLibrary> = {
  dancing,
  allura,
  vibes,
  lobster,
  playfair,
  coiny,
  caveat,
};
export const ART_FONTS: {
  id: DesignOptions["font"];
  name: string;
  description: string;
}[] = [
  {
    id: "dancing",
    name: "Dancing Script",
    description: "Chữ nối mềm, nét bút nhịp nhàng",
  },
  {
    id: "allura",
    name: "Allura",
    description: "Thư pháp cổ điển, nét mảnh và thoáng",
  },
  {
    id: "vibes",
    name: "Great Vibes",
    description: "Thư pháp bay bướm, đuôi chữ lượn dài",
  },
  {
    id: "lobster",
    name: "Lobster",
    description: "Chữ nối retro, nét đậm và gọn",
  },
  {
    id: "playfair",
    name: "Playfair Display",
    description: "Chữ có chân, nét thanh–đậm tương phản",
  },
  { id: "coiny", name: "Coiny", description: "Chữ tròn, vui nhộn và rõ nét" },
  {
    id: "caveat",
    name: "Caveat",
    description: "Chữ viết tay tự nhiên, dáng nghiêng nhẹ",
  },
];

export function pixelLibrary(font: DesignOptions["font"]) {
  return libraries[font];
}

function recipePixels(char: string, library: PixelLibrary): Point[] | null {
  const parts = library.recipes[char] ?? (library.bases[char] ? [char] : null);
  if (!parts) return null;
  const ink = new Map<string, Point>();
  for (const part of parts) {
    const pixels = library.bases[part] ?? library.overlays[part];
    if (!pixels) throw new Error(`Missing recipe piece: ${part}`);
    for (const [x, y] of pixels) ink.set(`${x},${y}`, [x, y]);
  }
  return [...ink.values()];
}

const repairs = new Map<DesignOptions["font"], Set<string>>();
export function repairedCharacters(font: DesignOptions["font"]): Set<string> {
  const existing = repairs.get(font);
  if (existing) return existing;
  const seen = new Map<string, string>();
  const broken = new Set<string>();
  for (const char of Object.keys(libraries[font].recipes)) {
    const pixels = recipePixels(char, libraries[font])!;
    const signature = pixels
      .map((p) => p.join(","))
      .sort()
      .join(";");
    if (!pixels.length) broken.add(char);
    const prior = seen.get(signature);
    if (prior) {
      broken.add(char);
      broken.add(prior);
    } else seen.set(signature, char);
  }
  repairs.set(font, broken);
  return broken;
}

const markPixels: Record<string, Point[]> = {
  "\u0302": [
    [2, 0],
    [1, 1],
    [3, 1],
    [0, 2],
    [4, 2],
  ],
  "\u0306": [
    [0, 0],
    [4, 0],
    [1, 1],
    [3, 1],
    [2, 2],
  ],
  "\u0301": [
    [2, 0],
    [1, 1],
    [0, 2],
  ],
  "\u0300": [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  "\u0309": [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 2],
  ],
  "\u0303": [
    [1, 0],
    [2, 0],
    [3, 0],
    [3, 1],
    [4, 1],
    [5, 1],
  ],
  "\u0323": [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ],
};

/** Recover missing/ambiguous source glyphs with R1–R6, on the same baseline.
 * No word-specific artwork or substitutions are involved. */
function rulePixels(char: string, library: PixelLibrary): Point[] {
  const [base, ...marks] = [...char.normalize("NFD")];
  let ink = library.bases[base].map(([x, y]): Point => [x, y]);
  if (base === "i") ink = withoutIDot(ink, library);
  const minX = Math.min(...ink.map((p) => p[0]));
  const maxX = Math.max(...ink.map((p) => p[0]));
  let top = Math.min(...ink.map((p) => p[1]));
  const bottom = Math.max(...ink.map((p) => p[1]));
  const center = (minX + maxX) / 2;
  for (const mark of [
    "\u0302",
    "\u0306",
    "\u031b",
    ...marks.filter((m) => !["\u0302", "\u0306", "\u031b"].includes(m)),
  ]) {
    if (!marks.includes(mark)) continue;
    if (mark === "\u031b") {
      ink.push(
        [maxX, top],
        [maxX + 1, top],
        [maxX + 2, top - 1],
        [maxX + 2, top - 2],
      );
      top -= 2;
      continue;
    }
    const pixels = markPixels[mark];
    if (!pixels) continue;
    const width = Math.max(...pixels.map((p) => p[0])) + 1;
    const height = Math.max(...pixels.map((p) => p[1])) + 1;
    const x = Math.round(center - (width - 1) / 2);
    const y = mark === "\u0323" ? bottom + 2 : top - height - 1;
    ink.push(...pixels.map(([dx, dy]): Point => [x + dx, y + dy]));
    if (mark !== "\u0323") top = y;
  }
  return ink;
}

function withoutIDot(pixels: number[][], library: PixelLibrary): Point[] {
  const top = Math.min(
    ...["e", "n", "u"].flatMap((c) => library.bases[c].map((p) => p[1])),
  );
  return pixels.filter(([, y]) => y >= top).map(([x, y]) => [x, y]);
}

/** N1–N3 and R9: union recipe pieces in the original, uncropped canvas. */
export function composePixels(
  char: string,
  font: DesignOptions["font"],
): Point[] | null {
  const library = libraries[font];
  const normalized = normalizeText(char);
  const pixels = repairedCharacters(font).has(normalized)
    ? rulePixels(normalized, library)
    : recipePixels(normalized, library);
  if (!pixels) return null;
  // R6 overrides font-native ị, which can retain the dot above i. The supplied
  // dotless-i bases are empty, so use the shared x-height to isolate its stem.
  if (normalized === "ị" || normalized === "ı") {
    return withoutIDot(normalized === "ı" ? library.bases.i : pixels, library);
  }
  return pixels;
}

const cache = new Map<DesignOptions["font"], ScriptFont>();
export function artGlyphs(font: DesignOptions["font"]): ScriptFont {
  const existing = cache.get(font);
  if (existing) return existing;
  const supporting = outlines[font] as unknown as ScriptFont;
  const library = libraries[font];
  const glyphs = { ...supporting.glyphs };
  for (const char of new Set([
    ...Object.keys(library.bases),
    ...Object.keys(library.recipes),
  ])) {
    const pixels = composePixels(char, font)!;
    const advance = glyphs[char]?.advance ?? glyphs.i.advance;
    // One fixed origin and baseline per font. Never align a letter by its crop.
    glyphs[char] = {
      advance,
      contours: pixels.map(([x, y]) => {
        const left = (x - 5) / supporting.pixelUnit;
        const top = (y - library.meta.baseline_row) / supporting.pixelUnit;
        const size = 1 / supporting.pixelUnit;
        return [
          [left, top],
          [left + size, top],
          [left + size, top + size],
          [left, top + size],
        ];
      }),
    };
  }
  const result = { ...supporting, glyphs };
  cache.set(font, result);
  return result;
}

export function normalizeText(text: string) {
  return text.normalize("NFC").replace(/\r\n?/g, "\n");
}
