import type { Point, ScriptFont } from "./art-fonts";
import { curvePath } from "./vector-art";

export type LetterArt = {
  contours: Point[][];
  strokes: Point[][];
  advance: number;
};
const tonePaths: Record<string, string> = {
  "\u0301": "M -2 3 L 2 0",
  "\u0300": "M -2 0 L 2 3",
  "\u0309": "M -2 1 Q -1 -1 2 0 Q 5 2 0 4 L 0 5",
  "\u0303": "M -4 3 Q -2 -1 0 2 Q 2 5 4 1",
};
const punctuation: Record<string, string[]> = {
  ".": ["M 0 0 L 0 0"],
  ",": ["M 1 -1 Q 2 2 -1 3"],
  ":": ["M 0 -7 L 0 -7", "M 0 0 L 0 0"],
  ";": ["M 0 -7 L 0 -7", "M 1 -1 Q 2 2 -1 3"],
  "!": ["M 0 -14 L 0 -5", "M 0 0 L 0 0"],
  "?": ["M -4 -11 Q -4 -17 1 -15 Q 7 -14 3 -9 L 0 -6", "M 0 0 L 0 0"],
  "…": ["M -5 0 L -5 0", "M 0 0 L 0 0", "M 5 0 L 5 0"],
  "-": ["M -3 -6 L 3 -6"],
  "–": ["M -5 -6 L 5 -6"],
  "—": ["M -8 -6 L 8 -6"],
  "'": ["M 0 -15 L 0 -11"],
  '"': ["M -2 -15 L -2 -11", "M 3 -15 L 3 -11"],
  "‘": ["M 1 -16 Q -2 -14 0 -11"],
  "’": ["M 0 -16 Q 2 -13 -1 -11"],
  "“": ["M -2 -16 Q -5 -14 -3 -11", "M 3 -16 Q 0 -14 2 -11"],
  "”": ["M -3 -16 Q -1 -13 -4 -11", "M 2 -16 Q 4 -13 1 -11"],
  "(": ["M 2 -16 Q -5 -7 2 3"],
  ")": ["M -2 -16 Q 5 -7 -2 3"],
  "[": ["M 4 -16 L -4 -16 L -4 3 L 4 3"],
  "]": ["M -4 -16 L 4 -16 L 4 3 L -4 3"],
  "{": ["M 3 -16 Q -2 -16 0 -9 L -3 -6 L 0 -3 Q -2 3 3 3"],
  "}": ["M -3 -16 Q 2 -16 0 -9 L 3 -6 L 0 -3 Q 2 3 -3 3"],
  "«": ["M 0 -12 L -4 -7 L 0 -2", "M 6 -12 L 2 -7 L 6 -2"],
  "»": ["M -6 -12 L -2 -7 L -6 -2", "M 0 -12 L 4 -7 L 0 -2"],
  "/": ["M -4 1 L 4 -15"],
  "\\": ["M -4 -15 L 4 1"],
  _: ["M -5 2 L 5 2"],
  "|": ["M 0 -16 L 0 3"],
  "+": ["M -5 -6 L 5 -6", "M 0 -11 L 0 -1"],
  "=": ["M -5 -9 L 5 -9", "M -5 -3 L 5 -3"],
  "<": ["M 4 -12 L -4 -6 L 4 0"],
  ">": ["M -4 -12 L 4 -6 L -4 0"],
  "^": ["M -4 -10 L 0 -14 L 4 -10"],
  "`": ["M -2 -16 L 2 -12"],
  "~": ["M -5 -5 Q -2 -11 1 -6 Q 4 -1 7 -7"],
  "%": [
    "M -6 -14 L -2 -14 L -2 -10 L -6 -10 Z",
    "M 2 -4 L 6 -4 L 6 0 L 2 0 Z",
    "M -6 1 L 6 -15",
  ],
  "#": [
    "M -2 -15 L -4 1",
    "M 4 -15 L 2 1",
    "M -7 -10 L 7 -10",
    "M -7 -4 L 7 -4",
  ],
  "*": ["M 0 -15 L 0 -3", "M -5 -12 L 5 -6", "M -5 -6 L 5 -12"],
  $: ["M 5 -13 C -7 -19 -9 -6 0 -7 C 10 -8 7 5 -5 0", "M 0 -18 L 0 4"],
  "@": [
    "M 3 -10 C -2 -13 -5 -5 -1 -3 Q 3 -3 4 -10 L 3 -3 Q 10 0 10 -9 C 10 -21 -12 -18 -11 -5 C -10 4 0 5 6 2",
  ],
};

/** Readable light lettering follows R1–R8 for every vowel and case. The letter
 * body comes from the supplied library; marks retain a minimum game-cell size. */
export function composeLetter(
  char: string,
  height: number,
  data: ScriptFont,
): LetterArt {
  const markScale = Math.min(1.1, Math.max(0.8, height / 17));
  if (punctuation[char]) {
    const points = punctuation[char].map(curvePath);
    const minX = Math.min(...points.flat().map((p) => p[0]));
    const maxX = Math.max(...points.flat().map((p) => p[0]));
    return {
      contours: [],
      strokes: points.map((path) =>
        path.map(([x, y]) => [(x - minX + 2) * markScale, y * markScale]),
      ),
      advance: (maxX - minX + 6) * markScale,
    };
  }
  const [base, ...marks] = [...char.normalize("NFD")];
  const vowel = /^[aeiouyAEIOUY]$/.test(base);
  const dotted = base === "i" || base === "j";
  const glyph =
    data.glyphs[base === "i" ? "ı" : vowel ? base : char] ?? data.glyphs["?"];
  const dotlessTop = Math.min(
    ...data.glyphs["ı"].contours.flat().map((p) => p[1]),
  );
  const body =
    base === "j"
      ? glyph.contours.filter(
          (path) => Math.max(...path.map((p) => p[1])) > dotlessTop,
        )
      : glyph.contours;
  const art: LetterArt = {
    contours: body.map((path) =>
      path.map(([x, y]) => [x * height, y * height]),
    ),
    strokes: [],
    advance: glyph.advance * height,
  };
  const points = art.contours.flat();
  if (!points.length) return art;
  let top = Math.min(...points.map((p) => p[1]));
  const bottom = Math.max(...points.map((p) => p[1]));
  const center = art.advance * 0.52;
  const clearance = 2.5 * markScale;
  const add = (path: string, y: number) =>
    art.strokes.push(
      curvePath(path).map(([x, dy]) => [
        center + x * markScale,
        y + dy * markScale,
      ]),
    );
  if (char === "đ" || char === "Đ") {
    const left = Math.min(...points.map((p) => p[0])) - markScale;
    const right = Math.max(...points.map((p) => p[0])) + markScale;
    const y = top + (bottom - top) * 0.45;
    art.strokes.push([
      [left, y],
      [right, y],
    ]);
  }
  if (dotted && !marks.length) add("M 0 0 L 0 0", top - clearance);
  if (!vowel || !marks.length) return art;
  if (marks.includes("\u0302") || marks.includes("\u0306")) {
    const y = top - clearance - 3 * markScale;
    add(
      marks.includes("\u0302") ? "M -4 3 L 0 0 L 4 3" : "M -4 0 Q -2 6 4 0",
      y,
    );
    top = y;
  }
  if (marks.includes("\u031b")) {
    const upper = points.filter((p) => p[1] < (top + bottom) / 2);
    const anchor = upper.reduce((a, b) => (b[0] > a[0] ? b : a));
    art.strokes.push(
      curvePath("M 0 0 Q 5 0 4 -4").map(([x, y]) => [
        anchor[0] + x * markScale,
        anchor[1] + y * markScale,
      ]),
    );
    top = Math.min(top, anchor[1] - 4 * markScale);
    art.advance = Math.max(art.advance, anchor[0] + 6 * markScale);
  }
  for (const mark of marks) {
    if (tonePaths[mark]) add(tonePaths[mark], top - clearance - 5 * markScale);
    if (mark === "\u0323") add("M 0 0 L 0 0", bottom + clearance);
  }
  const all = [...art.contours, ...art.strokes].flat();
  art.advance = Math.max(
    art.advance,
    Math.max(...all.map((p) => p[0])) + height / 17,
  );
  return art;
}
