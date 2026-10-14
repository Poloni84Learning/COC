import type { Point } from "./art-fonts";
import type { Cell } from "../types";

// Sample a centerline, not the area it covers. Thinning a supercover can erase
// a diagonal stroke entirely at half-cell phases (e.g. a dash or ! stem).
export function centerlineCells(paths: Point[][]): Cell[] {
  const cells = new Map<string, Cell>();
  function simplify(points: Point[]): Point[] {
    if (points.length < 3) return points;
    const [ax, ay] = points[0],
      [bx, by] = points.at(-1)!;
    const dx = bx - ax,
      dy = by - ay,
      l = dx * dx + dy * dy;
    let distance = 0,
      index = 0;
    for (let i = 1; i < points.length - 1; i++) {
      const [x, y] = points[i],
        t = l
          ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l))
          : 0;
      const d = Math.hypot(x - ax - t * dx, y - ay - t * dy);
      if (d > distance) {
        distance = d;
        index = i;
      }
    }
    return distance > 0.32
      ? [
          ...simplify(points.slice(0, index + 1)).slice(0, -1),
          ...simplify(points.slice(index)),
        ]
      : [points[0], points.at(-1)!];
  }
  for (const path of paths) {
    const points = simplify(path);
    for (let i = 1; i < points.length; i++) {
      let x = Math.round(points[i - 1][0]),
        y = Math.round(points[i - 1][1]);
      const bx = Math.round(points[i][0]),
        by = Math.round(points[i][1]),
        dx = Math.abs(bx - x),
        dy = -Math.abs(by - y),
        sx = x < bx ? 1 : -1,
        sy = y < by ? 1 : -1;
      let error = dx + dy;
      while (true) {
        cells.set(`${x},${y}`, { x, y });
        if (x === bx && y === by) break;
        const twice = error * 2;
        if (twice >= dy) {
          error += dy;
          x += sx;
        }
        if (twice <= dx) {
          error += dx;
          y += sy;
        }
      }
    }
  }
  return [...cells.values()];
}
