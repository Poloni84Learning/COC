import { useEffect, useRef } from "react";
import { autoFit, DEFAULT_OPTIONS, generate } from "../lib/engine";
import { ART_FONTS, normalizeText } from "../lib/art-fonts";
import { loadImage } from "../lib/render";
import type { DesignOptions } from "../types";

/**
 * Font picker preview: mini 3D isometric render using the real H18 wall
 * asset (sprites/wall-19.png, 69x90). H18 is the benchmark — thickest walls.
 * What you see is what the 3D village will actually build.
 */
const H18_WALL = "sprites/wall-19.png";
// Match render.ts isometric: wall width = 2.12*unit (slight overlap, no gaps).
const WALL_W_UNITS = 2.12;

export default function LetterPreview({
  font,
  text,
}: {
  font: DesignOptions["font"];
  text: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const name = ART_FONTS.find((f) => f.id === font)?.name ?? font;
  const specimen =
    [...normalizeText(text).replace(/\s+/g, "").trim()].slice(0, 2).join("") ||
    "Aa";

  useEffect(() => {
    let active = true;
    const options = {
      ...DEFAULT_OPTIONS,
      font,
      frame: "grid" as const,
      text: specimen,
      scale: 2,
      ornaments: false,
    };
    const fitted = autoFit(options, Infinity) ?? {
      ...options,
      text: [...specimen][0],
      scale: 1,
    };
    const cells = generate(fitted).cells;
    if (cells.length === 0) return;

    loadImage(H18_WALL).then((wallImg) => {
      if (!active || !canvas.current) return;
      const cv = canvas.current;
      const ctx = cv.getContext("2d");
      if (!ctx) return;

      // Bounds of cells
      const xs = cells.map((c) => c.x);
      const ys = cells.map((c) => c.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const gw = maxX - minX + 1;
      const gh = maxY - minY + 1;

      // Isometric unit: fit the diamond bounds into canvas
      const W = cv.width;
      const H = cv.height;
      // Diamond extent: width = (gw+gh)*unit, height = (gw+gh)*unit*0.5 + wall height
      const wallRatio = wallImg.height / wallImg.width;
      const wallHUnits = WALL_W_UNITS * wallRatio;
      const unit = Math.min(
        W / ((gw + gh) * 1.05),
        H / ((gw + gh) * 0.5 + wallHUnits + 0.5),
      );
      const cx = W / 2;
      const topY = H - ((gw + gh) * unit * 0.5 + wallHUnits * unit) - 4;
      const baseY = topY + wallHUnits * unit;

      const iso = (x: number, y: number) => ({
        x: cx + (x - y) * unit,
        y: baseY - wallHUnits * unit + (x + y) * unit * 0.5,
      });

      ctx.clearRect(0, 0, W, H);
      // Dark green background like the village
      ctx.fillStyle = "#304a39";
      ctx.fillRect(0, 0, W, H);

      // Draw back-to-front
      const sorted = [...cells].sort((a, b) => a.x + a.y - (b.x + b.y));
      for (const c of sorted) {
        const lx = c.x - minX;
        const ly = c.y - minY;
        const bw = unit * WALL_W_UNITS;
        const bh = bw * wallRatio;
        const a = iso(lx + 0.5, ly + 0.5);
        ctx.drawImage(wallImg, a.x - bw / 2, a.y - bh + unit * 0.6, bw, bh);
      }
    });
    return () => {
      active = false;
    };
  }, [font, specimen]);

  return (
    <canvas
      ref={canvas}
      width={220}
      height={120}
      className="font-preview"
      aria-label={`Mẫu 3D chữ ${name}`}
      role="img"
    />
  );
}
