import { autoFit, bounds, DEFAULT_OPTIONS, generate } from "../lib/engine";
import { normalizeText } from "../lib/art-fonts";
import type { DesignOptions } from "../types";

export default function LetterPreview({
  font,
  text,
}: {
  font: DesignOptions["font"];
  text: string;
}) {
  const specimen =
    [...normalizeText(text).replace(/\s+/g, "").trim()].slice(0, 3).join("") ||
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
      viewBox={`${b.minX - 1} ${b.minY - 1} ${b.width + 2} ${b.height + 2}`}
      aria-hidden="true"
    >
      {cells.map((p) => (
        <rect
          key={`${p.x},${p.y}`}
          x={p.x}
          y={p.y}
          width=".94"
          height=".94"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
