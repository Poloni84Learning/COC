import { autoFit, bounds, DEFAULT_OPTIONS, generate } from "../lib/engine";
import { normalizeText } from "../lib/art-fonts";
import type { DesignOptions } from "../types";

/** Font picker preview: crisp square cells (pixel grid) showing how the
 * typeface maps to wall blocks. High contrast, no anti-aliasing blur. */
export default function LetterPreview({
  font,
  text,
}: {
  font: DesignOptions["font"];
  text: string;
}) {
  const specimen =
    [...normalizeText(text).replace(/\s+/g, "").trim()].slice(0, 6).join("") ||
    "Aa";
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
  const b = bounds(cells);
  return (
    <svg
      viewBox={`${b.minX} ${b.minY} ${b.width} ${b.height}`}
      shapeRendering="crispEdges"
      className="font-preview"
      aria-hidden="true"
    >
      {cells.map((p) => (
        <rect
          key={`${p.x},${p.y}`}
          x={p.x}
          y={p.y}
          width="1"
          height="1"
          fill="#1c2b33"
        />
      ))}
    </svg>
  );
}
