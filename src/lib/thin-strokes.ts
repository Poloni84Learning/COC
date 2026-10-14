import type { Cell } from "../types";

/** Zhang–Suen thinning retains endpoints and 8-connected paths. It removes
 * interior material instead of outlining both sides of a thick stroke. */
export function thinStrokes(cells: Cell[]): Cell[] {
  const occupied = new Map(cells.map((p) => [`${p.x},${p.y}`, p]));
  const directions = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
  ];
  const pending = new Map(occupied),
    components: Cell[][] = [];
  while (pending.size) {
    const first = pending.values().next().value!;
    const component = [first];
    pending.delete(`${first.x},${first.y}`);
    for (let i = 0; i < component.length; i++)
      for (const [x, y] of directions) {
        const p = component[i],
          key = `${p.x + x},${p.y + y}`,
          next = pending.get(key);
        if (next) {
          component.push(next);
          pending.delete(key);
        }
      }
    components.push(component);
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const phase of [0, 1]) {
      const remove: string[] = [];
      for (const [key, p] of occupied) {
        const n = directions.map(([x, y]) =>
          occupied.has(`${p.x + x},${p.y + y}`) ? 1 : 0,
        );
        const count = n.reduce<number>((a, b) => a + b, 0);
        if (count < 2 || count > 6) continue;
        const transitions = n.reduce<number>(
          (sum, v, i) => sum + (!v && n[(i + 1) % 8] ? 1 : 0),
          0,
        );
        if (transitions !== 1) continue;
        if (
          phase === 0
            ? n[0] * n[2] * n[4] || n[2] * n[4] * n[6]
            : n[0] * n[2] * n[6] || n[0] * n[4] * n[6]
        )
          continue;
        remove.push(key);
      }
      for (const key of remove) occupied.delete(key);
      changed ||= remove.length > 0;
    }
  }
  // Tiny dots/accents can otherwise disappear during a simultaneous pass.
  for (const component of components)
    if (!component.some((p) => occupied.has(`${p.x},${p.y}`))) {
      const cx = component.reduce((s, p) => s + p.x, 0) / component.length,
        cy = component.reduce((s, p) => s + p.y, 0) / component.length;
      const p = component.reduce((a, b) =>
        Math.hypot(a.x - cx, a.y - cy) <= Math.hypot(b.x - cx, b.y - cy)
          ? a
          : b,
      );
      occupied.set(`${p.x},${p.y}`, p);
    }
  return [...occupied.values()];
}
