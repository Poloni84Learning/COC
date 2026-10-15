import { curvePath } from "./vector-art";
import type { Point } from "./art-fonts";

// Centerlines with deliberate counters: a wall sprite must fit between strokes.
const paths: Record<string, string[]> = {
  a: ["M 8 -8 C 2 -11 -1 -2 2 0 C 5 1 8 -4 8 -8", "M 8 -8 L 7 -1 Q 8 2 11 -2"],
  e: ["M 0 -4 C 10 -4 9 -11 5 -9 C 0 -8 -1 -2 3 0 Q 6 1 10 -2"],
  m: [
    "M 0 0 L 2 -9",
    "M 1 -4 C 5 -13 8 -10 6 -4 L 5 0",
    "M 6 -4 C 10 -13 13 -10 11 -3 Q 10 2 14 -2",
  ],
  n: ["M 0 0 L 2 -9", "M 1 -4 C 6 -13 10 -10 8 -3 Q 7 2 11 -2"],
  r: ["M 0 0 L 2 -9", "M 1 -5 Q 6 -12 8 -8 L 10 -8"],
  i: ["M 3 -9 L 1 -2 Q 1 2 5 -1", "M 4 -14 L 4.5 -14"],
  j: ["M 5 -9 L 2 4 Q 0 9 -3 5", "M 6 -14 L 6.5 -14"],
  o: ["M 8 -9 C 2 -12 -1 -3 2 0 C 8 3 12 -7 8 -9 Z"],
  u: ["M 2 -9 L 0 -3 Q -1 3 4 0 Q 7 -2 9 -9", "M 9 -9 L 7 -2 Q 7 2 11 -1"],
  y: [
    "M 2 -9 L 0 -3 Q -1 3 4 0 Q 7 -2 9 -9",
    "M 9 -9 L 5 5 C 2 12 -5 7 0 4 L 7 1",
  ],
  Đ: ["M 2 0 L 6 -17", "M 2 -17 C 23 -22 24 2 2 0", "M 0 -9 L 11 -9"],
  đ: [
    "M 9 -8 C 1 -12 -1 -1 3 0 Q 7 1 9 -8 L 12 -17",
    "M 7 -12 L 16 -12",
    "M 9 -7 L 8 -1 Q 9 2 12 -2",
  ],
};
export function openLetter(
  char: string,
  font: string,
): { paths: Point[][]; advance: number } | null {
  const base = char;
  if (!paths[base]) return null;
  const body = paths[base].map(curvePath);
  const slant = font === "charm" || font === "charmvn" ? 0 : font === "allura" ? 0.08 : 0.14;
  return {
    paths: body.map((p) => p.map(([x, y]) => [(x - y * slant) / 17, y / 17])),
    advance:
      (base === "m"
        ? 15
        : base === "Đ"
          ? 23
          : base === "i"
            ? 7
            : base === "j"
              ? 8
              : 12) / 17,
  };
}
