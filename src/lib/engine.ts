import { ART_FONTS, artGlyphs, normalizeText } from "./art-fonts";
import { curvePath, fillContours, projectArt, strokePaths } from "./vector-art";
import type { Point } from "./art-fonts";
import { thinStrokes } from "./thin-strokes";
import { composeLetter } from "./letter-composer";
import { centerlineCells } from "./centerline";
import { ARTWORK, PATTERNS } from "./patterns";
export { PATTERNS } from "./patterns";
import type {
  Blueprint,
  Building,
  Cell,
  DesignOptions,
  Generation,
  Hall,
  PatternId,
  PlacedBuilding,
} from "../types";

export const GRID = 44;
// Home Village inventory, synchronized with public/game-data.json.
export const WALL_LIMITS = [
  0, 25, 50, 75, 100, 125, 175, 225, 250, 275, 300, 300, 300, 325, 325, 325,
  325, 325,
];
export const DEFAULT_OPTIONS: DesignOptions = {
  mode: "text",
  font: "dancing",
  flourish: "none",
  stroke: "light",
  ornaments: true,
  frame: "diagonal",
  text: "Linh",
  pattern: "trophy",
  scale: 2,
  thickness: 1,
  gap: 1,
  outline: false,
  rotation: 0,
  mirrored: false,
  offsetX: 0,
  offsetY: 0,
};
export const key = (p: Cell) => `${p.x},${p.y}`;
export const unique = (cells: Cell[]) => [
  ...new Map(cells.map((p) => [key(p), p])).values(),
];
export function bounds(cells: Cell[]) {
  if (!cells.length)
    return { minX: 0, minY: 0, maxX: -1, maxY: -1, width: 0, height: 0 };
  const xs = cells.map((p) => p.x),
    ys = cells.map((p) => p.y);
  const minX = Math.min(...xs),
    minY = Math.min(...ys),
    maxX = Math.max(...xs),
    maxY = Math.max(...ys);
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}
export const inside = (p: Cell) =>
  Number.isInteger(p.x) &&
  Number.isInteger(p.y) &&
  p.x >= 0 &&
  p.y >= 0 &&
  p.x < GRID &&
  p.y < GRID;

function textCells(options: DesignOptions) {
  const normalized = normalizeText(options.text).slice(0, 120);
  const data = artGlyphs(options.font);
  const { glyphs, kerning } = data;
  const unsupported = [
    ...new Set([...normalized].filter((c) => c !== "\n" && !glyphs[c])),
  ];
  const height = [9, 14, 18][options.scale - 1];
  const tracking = (options.gap - 1) * 0.6;
  const lines = normalized.split("\n");
  const runs = lines.map((text) => {
    let cursor = 0,
      previous = "";
    const contours: Point[][] = [];
    const strokes: Point[][] = [];
    for (const char of text) {
      const actual = glyphs[char] ? char : "?",
        glyph = glyphs[actual];
      cursor += (kerning[previous + actual] ?? 0) * height;
      if (options.stroke === "light") {
        const art = composeLetter(actual, height, data);
        strokes.push(
          ...art.strokes.map((path) =>
            path.map(([x, y]): Point => [x + cursor, y]),
          ),
        );
        contours.push(
          ...art.contours.map((path) =>
            path.map(([x, y]): Point => [x + cursor, y]),
          ),
        );
        cursor += art.advance + tracking;
        previous = actual;
        continue;
      }
      for (const contour of glyph.contours)
        contours.push(
          contour.map(([x, y]) => [x * height + cursor, y * height]),
        );
      cursor += glyph.advance * height + tracking;
      previous = actual;
    }
    return { contours, strokes, width: cursor };
  });
  let previousBottom = 0;
  const rowOffsets = runs.map((run, row) => {
    const ys = [...run.contours, ...run.strokes].flat().map((p) => p[1]);
    const top = ys.length ? Math.min(...ys) : -height,
      bottom = ys.length ? Math.max(...ys) : 0;
    const offset = row ? previousBottom + Math.max(4, height * 0.3) - top : 0;
    previousBottom = bottom + offset;
    return offset;
  });
  const maxWidth = Math.max(0, ...runs.map((r) => r.width));
  const source = runs.flatMap((run, row) =>
    run.contours.map((c) =>
      c.map(([x, y]): Point => [
        x + (maxWidth - run.width) / 2,
        y + rowOffsets[row],
      ]),
    ),
  );
  const filled = fillContours(
    source.map((c) => c.map((p) => projectArt(p, options))),
  );
  const cells = options.stroke === "light" ? thinStrokes(filled) : filled;
  for (const [row, run] of runs.entries()) {
    cells.push(
      ...centerlineCells(
        run.strokes.map((path) =>
          path.map(([x, y]) =>
            projectArt(
              [x + (maxWidth - run.width) / 2, y + rowOffsets[row]],
              options,
            ),
          ),
        ),
      ),
    );
  }
  // Include centerlines when positioning an explicitly requested underline.
  source.push(
    ...runs.flatMap((run, row) =>
      run.strokes.map((path) =>
        path.map(([x, y]): Point => [
          x + (maxWidth - run.width) / 2,
          y + rowOffsets[row],
        ]),
      ),
    ),
  );
  if (options.flourish !== "none" && source.length) {
    let minX = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const contour of source)
      for (const [x, y] of contour) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    const x = minX + 1,
      end = maxX - 1,
      y = maxY + 3,
      w = end - x;
    const path =
      options.flourish === "blade"
        ? `M ${x} ${y} L ${end} ${y} L ${end - w * 0.13} ${y + 2} L ${x + w * 0.08} ${y + 2} Z`
        : `M ${x} ${y + 1} C ${x + w * 0.2} ${y - 2} ${x + w * 0.7} ${y + 4} ${end} ${y}`;
    cells.push(
      ...strokePaths([curvePath(path).map((p) => projectArt(p, options))]),
    );
  }
  return { cells: unique(cells), normalized, unsupported };
}

export function line(a: Cell, b: Cell): Cell[] {
  const cells: Cell[] = [];
  let x = a.x,
    y = a.y;
  const dx = Math.abs(b.x - x),
    sx = x < b.x ? 1 : -1;
  const dy = -Math.abs(b.y - y),
    sy = y < b.y ? 1 : -1;
  let error = dx + dy;
  while (true) {
    cells.push({ x, y });
    if (x === b.x && y === b.y) break;
    const twice = 2 * error;
    if (twice >= dy) {
      error += dy;
      x += sx;
    }
    if (twice <= dx) {
      error += dx;
      y += sy;
    }
  }
  return cells;
}
export function patternCells(
  id: PatternId,
  options: DesignOptions = { ...DEFAULT_OPTIONS, frame: "grid", scale: 2 },
): Cell[] {
  const factor = [0.66, 0.83, 1][options.scale - 1];
  return strokePaths(
    ARTWORK[id].map((path) =>
      curvePath(path).map(([x, y]) =>
        projectArt([x * factor, y * factor], options),
      ),
    ),
  );
}

/** Real village coordinates, with compensation for the camera's 2:1 projection.
 * u becomes screen-horizontal; v becomes screen-vertical. The basis directions
 * rotate -45 degrees and all emitted walls are snapped to integer game cells.
 */
export function framePoint(p: Cell, frame: DesignOptions["frame"]): Cell {
  return frame === "diagonal"
    ? { x: Math.round(p.x / 2 + p.y), y: Math.round(-p.x / 2 + p.y) }
    : { ...p };
}

export function generate(
  options: DesignOptions,
  wallBudget = Infinity,
): Generation {
  const raw =
    options.mode === "text"
      ? textCells(options)
      : {
          cells: patternCells(options.pattern, options),
          width: 0,
          height: 0,
          normalized: "",
          unsupported: [],
        };
  let cells = raw.cells;
  if (options.thickness > 1)
    cells = cells.flatMap((p) =>
      Array.from({ length: options.thickness ** 2 }, (_, i) => ({
        x: p.x + (i % options.thickness),
        y: p.y + Math.floor(i / options.thickness),
      })),
    );
  cells = unique(cells);
  if (options.outline) {
    const occupied = new Set(cells.map(key));
    cells = cells.filter((p) =>
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].some(([x, y]) => !occupied.has(key({ x: p.x + x, y: p.y + y }))),
    );
  }
  const b = bounds(cells);
  cells = cells.map((p) => ({ x: p.x - b.minX, y: p.y - b.minY }));
  const x = Math.floor((GRID - b.width) / 2) + options.offsetX;
  const y = Math.floor((GRID - b.height) / 2) + options.offsetY;
  cells = unique(cells.map((p) => ({ x: p.x + x, y: p.y + y })));
  const mainWalls = cells.length;
  let ornamentWalls = 0;
  if (
    options.mode === "text" &&
    options.ornaments &&
    cells.length &&
    cells.every(inside) &&
    cells.length <= wallBudget
  ) {
    const additions = decorate(
      cells,
      Math.min(wallBudget - cells.length, 64),
      options,
    );
    ornamentWalls = additions.length;
    cells = unique([...cells, ...additions]);
  }
  const requiredWalls = cells.length;
  const outside = cells.filter((p) => !inside(p)).length;
  const issue = outside
    ? `Mẫu cần ${b.width} × ${b.height} ô và có ${outside} tường ngoài làng 44 × 44. Đã dừng dựng. Giảm kích thước, xuống dòng hoặc rút ngắn chữ.`
    : requiredWalls > wallBudget
      ? `Mẫu cần ${requiredWalls} tường, vượt ${requiredWalls - wallBudget} viên so với ${wallBudget} tường khả dụng. Đã dừng dựng. Giảm kích thước hoặc tăng Town Hall.`
      : null;
  return {
    ...raw,
    cells: issue ? [] : cells,
    width: bounds(cells).width,
    height: bounds(cells).height,
    requiredWalls,
    outside,
    issue,
    mainWalls,
    ornamentWalls,
  };
}

export function autoFit(
  options: DesignOptions,
  wallBudget: number,
): DesignOptions | null {
  if (!wallBudget) return null;
  for (const scale of options.mode === "text"
    ? [Math.min(options.scale, 2), 1].filter((v, i, a) => a.indexOf(v) === i)
    : [3, 2, 1])
    for (const thickness of [options.thickness, 1].filter(
      (v, i, a) => a.indexOf(v) === i,
    )) {
      const candidate = {
        ...options,
        scale,
        thickness,
        offsetX: 0,
        offsetY: 0,
      };
      const result = generate(candidate, wallBudget);
      if (
        result.cells.length > 0 &&
        result.cells.length <= wallBudget &&
        result.cells.every(inside)
      )
        return candidate;
    }
  return null;
}

function decorate(
  main: Cell[],
  budget: number,
  options: DesignOptions,
): Cell[] {
  if (budget < 8) return [];
  const toArt = (p: Cell): Point =>
    options.frame === "diagonal" ? [p.x - p.y, (p.x + p.y) / 2] : [p.x, p.y];
  const points = main.map(toArt),
    xs = points.map((p) => p[0]),
    ys = points.map((p) => p[1]);
  const left = Math.min(...xs),
    right = Math.max(...xs),
    top = Math.min(...ys),
    bottom = Math.max(...ys),
    cx = (left + right) / 2;
  const groups = [
    // A balanced pair is added atomically, never only one side.
    [
      `M ${left - 5} ${(top + bottom) / 2 - 2} L ${left - 3} ${(top + bottom) / 2} L ${left - 5} ${(top + bottom) / 2 + 2} L ${left - 7} ${(top + bottom) / 2} Z`,
      `M ${right + 5} ${(top + bottom) / 2 - 2} L ${right + 3} ${(top + bottom) / 2} L ${right + 5} ${(top + bottom) / 2 + 2} L ${right + 7} ${(top + bottom) / 2} Z`,
    ],
    [
      `M ${cx - 10} ${bottom + 5} Q ${cx - 5} ${bottom + 8} ${cx} ${bottom + 5} Q ${cx + 5} ${bottom + 8} ${cx + 10} ${bottom + 5}`,
    ],
  ];
  const result: Cell[] = [],
    occupied = new Set(main.map(key));
  for (const paths of groups) {
    const candidate = thinStrokes(
      strokePaths(
        paths.map((path) =>
          curvePath(path).map((p) =>
            projectArt(p, {
              frame: options.frame,
              rotation: 0,
              mirrored: false,
            }),
          ),
        ),
      ),
    );
    if (candidate.length > budget - result.length || !candidate.every(inside))
      continue;
    if (
      candidate.some((p) =>
        [-2, -1, 0, 1, 2].some((x) =>
          [-2, -1, 0, 1, 2].some((y) =>
            occupied.has(key({ x: p.x + x, y: p.y + y })),
          ),
        ),
      )
    )
      continue;
    result.push(...candidate);
    for (const p of candidate) occupied.add(key(p));
  }
  return result;
}

export function inventory(hall: Hall, includeBob: boolean): Building[] {
  return hall.buildings.filter((b) => !b.optional || includeBob);
}
export function placeBuildings(
  walls: Cell[],
  buildings: Building[],
): { placed: PlacedBuilding[]; unplaced: (Building & { instance: string })[] } {
  const occupied = new Set(walls.filter(inside).map(key));
  const placed: PlacedBuilding[] = [],
    unplaced: (Building & { instance: string })[] = [];
  const art = bounds(walls);
  const instances = buildings
    .flatMap((b) =>
      Array.from({ length: b.count }, (_, i) => ({
        ...b,
        instance: `${b.id}-${i + 1}`,
      })),
    )
    .sort(
      (a, b) =>
        (a.id === "town-hall" ? -1 : b.id === "town-hall" ? 1 : 0) ||
        b.width * b.height - a.width * a.height,
    );
  for (const item of instances) {
    let found: Cell | undefined;
    const candidates: { x: number; y: number; score: number }[] = [];
    for (let y = 0; y <= GRID - item.height; y++)
      for (let x = 0; x <= GRID - item.width; x++) {
        let free = true;
        for (let dy = 0; dy < item.height && free; dy++)
          for (let dx = 0; dx < item.width; dx++)
            if (occupied.has(`${x + dx},${y + dy}`)) {
              free = false;
              break;
            }
        if (!free) continue;
        const overlapsArt =
          x <= art.maxX + 1 &&
          x + item.width > art.minX - 1 &&
          y <= art.maxY + 1 &&
          y + item.height > art.minY - 1;
        // Preserve a quiet rectangle around the artwork; pack the perimeter first.
        const edge = Math.min(
          x,
          y,
          GRID - x - item.width,
          GRID - y - item.height,
        );
        candidates.push({
          x,
          y,
          score: (overlapsArt ? 10000 : 0) + edge * 100 + y * 0.5 + x * 0.1,
        });
      }
    candidates.sort((a, b) => a.score - b.score);
    found = candidates[0];
    if (!found) {
      unplaced.push(item);
      continue;
    }
    placed.push({ ...item, x: found.x, y: found.y });
    for (let dy = 0; dy < item.height; dy++)
      for (let dx = 0; dx < item.width; dx++)
        occupied.add(`${found.x + dx},${found.y + dy}`);
  }
  return { placed, unplaced };
}

export function validateGameLink(
  input: string,
  hall: number,
): { valid: boolean; url?: string; error?: string } {
  try {
    const url = new URL(input.trim());
    if (
      url.protocol !== "https:" ||
      url.hostname !== "link.clashofclans.com" ||
      url.port ||
      url.username ||
      url.password
    )
      return {
        valid: false,
        error: "Chỉ nhận link HTTPS từ link.clashofclans.com.",
      };
    const id = url.searchParams.get("id");
    const match = id?.match(/^TH(\d+):(HV|WB):[A-Za-z0-9_-]{16,128}$/);
    if (url.searchParams.get("action") !== "OpenLayout" || !match)
      return {
        valid: false,
        error: "Link chưa đúng dạng chia sẻ bố cục làng chính của COC.",
      };
    if (Number(match[1]) !== hall)
      return {
        valid: false,
        error: `Link thuộc TH${match[1]}; mẫu hiện tại là TH${hall}.`,
      };
    url.hash = "";
    return { valid: true, url: url.toString() };
  } catch {
    return {
      valid: false,
      error: "Dán đầy đủ link bố cục được chia sẻ từ game.",
    };
  }
}

export function encodeBlueprint(data: Blueprint): string {
  const canonical = validateBlueprint(data);
  const minimal = {
    ...canonical,
    walls: canonical.walls.map((p) => p.y * GRID + p.x),
  };
  const bytes = new TextEncoder().encode(JSON.stringify(minimal));
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
export function decodeBlueprint(encoded: string): Blueprint {
  if (encoded.length > 22000) throw new Error("Mẫu chia sẻ quá lớn.");
  const raw = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
  return validateBlueprint(
    JSON.parse(
      new TextDecoder().decode(Uint8Array.from(raw, (c) => c.charCodeAt(0))),
    ),
  );
}
export function validateBlueprint(value: unknown): Blueprint {
  if (!value || typeof value !== "object")
    throw new Error("Tệp không chứa mẫu Wallcraft hợp lệ.");
  const d = value as Record<string, unknown>,
    o = { ...(d.options as Record<string, unknown>) };
  // Migrate old v1 drafts without changing their actual wall coordinates.
  o.font ??= "vibes";
  o.flourish ??= "none";
  o.stroke ??= "light";
  o.ornaments ??= true;
  if (["pirata", "metal", "bungee"].includes(String(o.font))) o.font = "vibes";
  if (o.font === "charm") o.font = "caveat";
  const legacyPatterns: Record<string, PatternId> = {
    "crossed-swords": "sword",
    katana: "sword",
    heart: "butterfly",
    crown: "trophy",
    shield: "skull",
    star: "lotus",
    lightning: "phoenix",
  };
  if (legacyPatterns[String(o.pattern)])
    o.pattern = legacyPatterns[String(o.pattern)];
  o.frame ??= "grid";
  if (
    d.version !== 1 ||
    !Number.isInteger(d.hall) ||
    Number(d.hall) < 1 ||
    Number(d.hall) > 18 ||
    !o ||
    !["text", "shape"].includes(String(o.mode)) ||
    typeof o.text !== "string" ||
    o.text.length > 120 ||
    !PATTERNS.some((p) => p.id === o.pattern) ||
    !ART_FONTS.some((f) => f.id === o.font) ||
    !["none", "swash", "blade"].includes(String(o.flourish)) ||
    !["light", "original"].includes(String(o.stroke)) ||
    typeof o.ornaments !== "boolean" ||
    !["grid", "diagonal"].includes(String(o.frame))
  )
    throw new Error("Phiên bản hoặc thông tin mẫu không hợp lệ.");
  for (const [name, min, max] of [
    ["scale", 1, 3],
    ["thickness", 1, 2],
    ["gap", 1, 3],
    ["rotation", 0, 3],
    ["offsetX", -43, 43],
    ["offsetY", -43, 43],
  ] as const)
    if (
      !Number.isInteger(o[name]) ||
      Number(o[name]) < min ||
      Number(o[name]) > max
    )
      throw new Error("Thông số tạo mẫu không hợp lệ.");
  if (
    typeof o.outline !== "boolean" ||
    typeof o.mirrored !== "boolean" ||
    typeof d.includeBuildings !== "boolean" ||
    typeof d.includeBob !== "boolean" ||
    !Array.isArray(d.walls) ||
    d.walls.length > GRID * GRID ||
    typeof d.gameLink !== "string"
  )
    throw new Error("Dữ liệu mẫu không hợp lệ.");
  const walls = d.walls.map((p) =>
    typeof p === "number" && Number.isInteger(p) && p >= 0 && p < GRID * GRID
      ? { x: p % GRID, y: Math.floor(p / GRID) }
      : (p as Cell),
  );
  if (!walls.every((p) => p && inside(p)))
    throw new Error("Tọa độ nằm ngoài lưới 44 × 44.");
  const canonicalWalls = unique(walls);
  if (canonicalWalls.length > WALL_LIMITS[Number(d.hall) - 1])
    throw new Error(`Số tường vượt giới hạn của TH${d.hall}.`);
  if (d.gameLink && !validateGameLink(d.gameLink, Number(d.hall)).valid)
    throw new Error("Link game trong mẫu không hợp lệ.");
  const options = Object.fromEntries(
    Object.keys(DEFAULT_OPTIONS).map((name) => [name, o[name]]),
  ) as DesignOptions;
  // Derived building exports are deliberately recomputed, never embedded in shared URLs.
  return {
    version: 1,
    hall: Number(d.hall),
    options,
    walls: canonicalWalls,
    includeBuildings: d.includeBuildings,
    includeBob: d.includeBob,
    gameLink: d.gameLink,
  };
}

export function csv(
  walls: Cell[],
  buildings: PlacedBuilding[],
  wallLevel = 0,
): string {
  const rows = [
    ["type", "id", "name", "x", "y", "width", "height", "level"],
    ...walls.map((p, i) => [
      "wall",
      `wall-${i + 1}`,
      "Wall",
      p.x,
      p.y,
      1,
      1,
      wallLevel || "",
    ]),
    ...buildings.map((b) => [
      "building",
      b.instance,
      b.englishName,
      b.x,
      b.y,
      b.width,
      b.height,
      b.level,
    ]),
  ];
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n")
  );
}
