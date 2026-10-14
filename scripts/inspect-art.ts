import fs from "node:fs/promises";
import sharp from "sharp";
import {
  generate,
  DEFAULT_OPTIONS,
  autoFit,
  PATTERNS,
  bounds,
} from "../src/lib/engine";
import type { Cell, DesignOptions } from "../src/types";
import { ART_FONTS } from "../src/lib/art-fonts";
import { embedOrigin } from "./png-provenance.mjs";

async function main() {
  const designs: {
    label: string;
    cells: Cell[];
    frame: DesignOptions["frame"];
  }[] = [];
  for (const { id: font } of ART_FONTS) {
    for (const frame of ["grid", "diagonal"] as const) {
      const options = { ...DEFAULT_OPTIONS, font, frame, text: "Linh" };
      const g = generate(autoFit(options, 325) ?? options, 325);
      console.log(font, frame, g.requiredWalls, g.width, g.height, g.issue);
      designs.push({
        label: `${font} / ${frame} / ${g.requiredWalls}`,
        cells: g.cells,
        frame,
      });
    }
  }
  for (const p of PATTERNS) {
    const options = {
      ...DEFAULT_OPTIONS,
      mode: "shape" as const,
      pattern: p.id,
    };
    const fitted = autoFit(options, 325);
    const g = generate(fitted ?? { ...options, scale: 1 }, 325);
    console.log(
      p.name,
      fitted?.scale,
      g.requiredWalls,
      g.width,
      g.height,
      g.issue,
    );
    designs.push({
      label: `${p.name} / ${g.requiredWalls}`,
      cells: g.cells,
      frame: "diagonal",
    });
  }
  for (const [text, font] of [
    ["Phúc", "vibes"],
    ["Đặng", "vibes"],
    ["JayPee", "allura"],
    ["Butterfly", "caveat"],
  ] as const) {
    const options = {
      ...DEFAULT_OPTIONS,
      text,
      font,
      flourish: text === "Butterfly" ? ("blade" as const) : ("none" as const),
    };
    const fitted = autoFit(options, 325),
      g = generate(fitted ?? options, 325);
    console.log(
      text,
      fitted?.scale,
      g.requiredWalls,
      g.width,
      g.height,
      g.issue,
    );
    designs.push({
      label: `${text} / ${g.requiredWalls}`,
      cells: g.cells,
      frame: "diagonal",
    });
  }
  const width = 1200,
    height = Math.ceil(designs.length / 4) * 280;
  const items = designs
    .map((d, i) => {
      const projected = d.cells.map((p) =>
        d.frame === "diagonal" ? { x: p.x - p.y, y: (p.x + p.y) / 2 } : p,
      );
      const b = bounds(projected),
        scale = Math.min(250 / b.width, 205 / b.height);
      const x = (i % 4) * 300,
        y = Math.floor(i / 4) * 280;
      return `<g transform="translate(${x},${y})"><rect x="5" y="5" width="290" height="270" rx="8" fill="#304a39"/><text x="150" y="29" text-anchor="middle" font-family="sans-serif" font-size="13" fill="white">${d.label}</text><g transform="translate(${150 - (b.width * scale) / 2 - b.minX * scale},${53 - b.minY * scale}) scale(${scale})">${projected.map((p) => (d.frame === "diagonal" ? `<path d="M ${p.x} ${p.y - 0.48} l .96 .48 l -.96 .48 l -.96 -.48 Z" fill="#ebd28c"/>` : `<rect x="${p.x}" y="${p.y}" width=".92" height=".92" fill="#ebd28c"/>`)).join("")}</g></g>`;
    })
    .join("");
  await fs.mkdir(".impeccable/review", { recursive: true });
  await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#eef2f5"/>${items}</svg>`,
    ),
  )
    .png()
    .toFile(".impeccable/review/art-contact-sheet.png");
  await embedOrigin(
    ".impeccable/review/art-contact-sheet.png",
    "drawn: actual integer wall coordinates from engine.ts, authored pattern paths and OFL art-font masks; projected in the selected frame",
  );
}
main();
