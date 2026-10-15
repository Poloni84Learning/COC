import { GRID, inside } from "./engine";
import type { Cell, Hall, PlacedBuilding } from "../types";

const cache = new Map<string, HTMLImageElement>();
export async function loadImage(src: string) {
  if (cache.has(src)) return cache.get(src)!;
  const img = new Image();
  img.src = import.meta.env.BASE_URL + src;
  await img.decode();
  cache.set(src, img);
  return img;
}
export type RenderOptions = {
  walls: Cell[];
  buildings: PlacedBuilding[];
  hall: Hall;
  isometric: boolean;
  showGrid: boolean;
  showCoordinates: boolean;
  zoom: number;
  selected?: Cell;
  hover?: Cell;
  label?: string;
};
function iso(x: number, y: number, w: number, h: number) {
  const unit = Math.min(w / 92, h / 56);
  return {
    x: w / 2 + (x - y) * unit,
    y: h * 0.14 + (x + y) * unit * 0.5,
    unit,
  };
}
export function cellAt(
  x: number,
  y: number,
  w: number,
  h: number,
  isometric: boolean,
): Cell {
  if (isometric) {
    const { unit } = iso(0, 0, w, h);
    const a = (x - w / 2) / unit,
      b = (y - h * 0.14) / (unit * 0.5);
    return { x: Math.floor((a + b) / 2), y: Math.floor((b - a) / 2) };
  }
  const unit = Math.min((w - 64) / GRID, (h - 64) / GRID),
    ox = (w - GRID * unit) / 2,
    oy = (h - GRID * unit) / 2;
  return { x: Math.floor((x - ox) / unit), y: Math.floor((y - oy) / unit) };
}
export async function preload(o: RenderOptions) {
  await Promise.all(
    [
      ...new Set(
        [o.hall.wallImage, ...o.buildings.map((b) => b.image)].filter(Boolean),
      ),
    ].map((src) => loadImage(src!)),
  );
}
export function paint(
  canvas: HTMLCanvasElement,
  o: RenderOptions,
  width: number,
  height: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#304a39";
  ctx.fillRect(0, 0, width, height);
  const unit = Math.min((width - 64) / GRID, (height - 64) / GRID),
    ox = (width - GRID * unit) / 2,
    oy = (height - GRID * unit) / 2;
  const project = (x: number, y: number) =>
    o.isometric
      ? iso(x, y, width, height)
      : { x: ox + x * unit, y: oy + y * unit, unit };
  const tile = (
    x: number,
    y: number,
    w = 1,
    h = 1,
    fill?: string,
    stroke?: string,
  ) => {
    const p = project(x, y);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    for (const [dx, dy] of [
      [w, 0],
      [w, h],
      [0, h],
    ]) {
      const q = project(x + dx, y + dy);
      ctx.lineTo(q.x, q.y);
    }
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
  };
  for (let y = 0; y < GRID; y++)
    for (let x = 0; x < GRID; x++)
      tile(
        x,
        y,
        1,
        1,
        (x + y) % 2 ? "#4a6a49" : "#4e704d",
        o.showGrid ? "#65805b" : undefined,
      );
  tile(0, 0, GRID, GRID, undefined, "#92a67a");
  // Fail closed. Never show a plausible partial layout by filtering bad cells.
  if (o.walls.some((p) => !inside(p)) || o.walls.length > o.hall.walls) {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Đã dừng: mẫu vượt giới hạn làng", width / 2, height / 2);
    return;
  }
  if (o.showCoordinates && !o.isometric) {
    ctx.font = "9px system-ui";
    ctx.fillStyle = "#c5d6b8";
    ctx.textAlign = "center";
    for (let i = 0; i < GRID; i += 5) {
      ctx.fillText(String(i), ox + (i + 0.5) * unit, oy - 9);
      ctx.fillText(String(i), ox - 14, oy + (i + 0.75) * unit);
    }
  }
  const wallImage = o.hall.wallImage ? cache.get(o.hall.wallImage) : undefined;
  const objects = [
    ...o.walls.map((p) => ({ ...p, type: "wall" as const })),
    ...o.buildings.map((b) => ({ ...b, type: "building" as const })),
  ].sort((a, b) => (o.isometric ? a.x + a.y - b.x - b.y : a.y - b.y));
  for (const object of objects) {
    if (object.type === "wall") {
      const p = project(object.x, object.y);
      if (o.isometric && wallImage) {
        const bw = p.unit * 2.12,
          bh = (bw * wallImage.height) / wallImage.width;
        const anchor = project(object.x + 0.5, object.y + 0.5);
        ctx.drawImage(
          wallImage,
          anchor.x - bw / 2,
          anchor.y - bh + unit * 0.65,
          bw,
          bh,
        );
      } else {
        // Flat 2D: full solid cells, high contrast like the pixel samples.
        tile(object.x, object.y, 1, 1, "#eef3ea");
      }
    } else {
      tile(
        object.x + 0.06,
        object.y + 0.06,
        object.width - 0.12,
        object.height - 0.12,
        object.category === "trap" ? "#4b543b" : "#6f7e52",
      );
      const img = cache.get(object.image);
      if (!img) continue;
      const p = project(
        object.x + object.width / 2,
        object.y + object.height / 2,
      );
      const bw = o.isometric
        ? p.unit * (object.width + object.height) * 1.05
        : unit * object.width * 1.06;
      const bh = Math.min(
        (bw * img.height) / img.width,
        o.isometric ? bw * 1.3 : unit * object.height * 1.2,
      );
      ctx.drawImage(
        img,
        p.x - bw / 2,
        p.y - bh * (o.isometric ? 0.78 : 0.55),
        bw,
        bh,
      );
    }
  }
  if (o.selected && inside(o.selected))
    tile(o.selected.x, o.selected.y, 1, 1, "#ee8a3266", "#ffd5a1");
  if (o.hover && inside(o.hover))
    tile(o.hover.x, o.hover.y, 1, 1, "#d6e6cd44", "#f5f5d8");
  if (o.label) {
    ctx.fillStyle = "#172d40dd";
    ctx.fillRect(0, height - 38, width, 38);
    ctx.fillStyle = "#fff";
    ctx.font = "13px system-ui";
    ctx.textAlign = "left";
    ctx.fillText(o.label, 18, height - 14);
  }
}
export async function exportPng(o: RenderOptions) {
  if (o.walls.some((p) => !inside(p)) || o.walls.length > o.hall.walls)
    throw new Error("Không thể xuất mẫu vượt giới hạn làng.");
  const canvas = document.createElement("canvas");
  await preload(o);
  paint(
    canvas,
    { ...o, showGrid: true, zoom: 1 },
    1800,
    o.isometric ? 1150 : 1800,
  );
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Không thể tạo ảnh PNG.")),
      "image/png",
    ),
  );
}
