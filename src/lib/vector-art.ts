import type { Cell, DesignOptions } from "../types";
import type { Point } from "./art-fonts";

export function projectArt(
  [x, y]: Point,
  options: Pick<DesignOptions, "frame" | "rotation" | "mirrored">,
): Point {
  if (options.mirrored) x = -x;
  for (let r = 0; r < options.rotation; r++) [x, y] = [-y, x];
  return options.frame === "diagonal" ? [x / 2 + y, -x / 2 + y] : [x, y];
}

/** Nonzero-winding scan conversion in the final game frame. Four samples per
 * axis preserve hairlines without making every contour uniformly thick. */
export function fillContours(contours: Point[][]): Cell[] {
  const edges: { a: Point; b: Point }[] = [];
  let minY = Infinity,
    maxY = -Infinity;
  for (const contour of contours)
    for (let i = 0; i < contour.length; i++) {
      const a = contour[i],
        b = contour[(i + 1) % contour.length];
      if (a[1] === b[1]) continue;
      edges.push({ a, b });
      minY = Math.min(minY, a[1], b[1]);
      maxY = Math.max(maxY, a[1], b[1]);
    }
  const coverage = new Map<string, number>(),
    samples = 4;
  const scanRows = new Map<number, typeof edges>();
  for (const edge of edges) {
    const start = Math.ceil(Math.min(edge.a[1], edge.b[1]) * samples - 0.5),
      end = Math.ceil(Math.max(edge.a[1], edge.b[1]) * samples - 0.5);
    for (let row = start; row < end; row++) {
      const list = scanRows.get(row) ?? [];
      list.push(edge);
      scanRows.set(row, list);
    }
  }
  for (
    let row = Math.floor(minY * samples);
    row < Math.ceil(maxY * samples);
    row++
  ) {
    const y = (row + 0.5) / samples;
    const crossings = (scanRows.get(row) ?? [])
      .map(({ a, b }) => ({
        x: a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]),
        w: b[1] > a[1] ? 1 : -1,
      }))
      .sort((a, b) => a.x - b.x);
    let winding = 0,
      start = 0;
    for (const crossing of crossings) {
      const prior = winding;
      winding += crossing.w;
      if (prior === 0 && winding !== 0) start = crossing.x;
      if (prior !== 0 && winding === 0)
        for (
          let col = Math.ceil(start * samples - 0.5);
          col < crossing.x * samples - 0.5;
          col++
        ) {
          const key = `${Math.floor(col / samples)},${Math.floor(row / samples)}`;
          coverage.set(key, (coverage.get(key) ?? 0) + 1);
        }
    }
  }
  return [...coverage]
    .filter(([, n]) => n >= 2)
    .map(([key]) => {
      const [x, y] = key.split(",").map(Number);
      return { x, y };
    });
}

/** Absolute SVG-path subset for wall centerlines. Curves remain continuous
 * until sampled directly in the final game coordinate system. */
export function curvePath(path: string): Point[] {
  const tokens = path.match(/[MLQCZ]|-?\d*\.?\d+/g) ?? [];
  let i = 0,
    previous: Point = [0, 0],
    first: Point = [0, 0];
  const points: Point[] = [];
  const point = (): Point => [Number(tokens[i++]), Number(tokens[i++])];
  while (i < tokens.length) {
    const c = tokens[i++];
    if (c === "M" || c === "L") {
      previous = point();
      if (c === "M") first = previous;
      points.push(previous);
    } else if (c === "Z") {
      points.push(first);
      previous = first;
    } else if (c === "Q" || c === "C") {
      const a = previous,
        b = point(),
        d = point(),
        e = c === "C" ? point() : d;
      const n = Math.ceil(
        (Math.hypot(a[0] - b[0], a[1] - b[1]) +
          Math.hypot(b[0] - d[0], b[1] - d[1]) +
          Math.hypot(d[0] - e[0], d[1] - e[1])) *
          2,
      );
      for (let j = 1; j <= n; j++) {
        const t = j / n,
          s = 1 - t;
        points.push(
          c === "Q"
            ? [
                s * s * a[0] + 2 * s * t * b[0] + t * t * d[0],
                s * s * a[1] + 2 * s * t * b[1] + t * t * d[1],
              ]
            : [
                s * s * s * a[0] +
                  3 * s * s * t * b[0] +
                  3 * s * t * t * d[0] +
                  t * t * t * e[0],
                s * s * s * a[1] +
                  3 * s * s * t * b[1] +
                  3 * s * t * t * d[1] +
                  t * t * t * e[1],
              ],
        );
      }
      previous = e;
    } else throw new Error(`Unsupported artwork path command: ${c}`);
  }
  return points;
}

export function strokePaths(paths: Point[][]): Cell[] {
  const occupied = new Map<string, Cell>();
  for (const path of paths)
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1],
        b = path[i],
        n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 4));
      for (let j = 0; j <= n; j++) {
        const t = j / n,
          p = {
            x: Math.round(a[0] + (b[0] - a[0]) * t),
            y: Math.round(a[1] + (b[1] - a[1]) * t),
          };
        occupied.set(`${p.x},${p.y}`, p);
      }
    }
  return [...occupied.values()];
}
