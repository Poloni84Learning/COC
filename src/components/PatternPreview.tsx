import { bounds, patternCells } from "../lib/engine";
import type { PatternId } from "../types";

export default function PatternPreview({ id }: { id: PatternId }) {
  const cells = patternCells(id),
    b = bounds(cells);
  return (
    <svg
      viewBox={`${b.minX - 2} ${b.minY - 2} ${b.width + 4} ${b.height + 4}`}
      aria-hidden="true"
    >
      {cells.map((p) => (
        <rect
          key={`${p.x},${p.y}`}
          x={p.x}
          y={p.y}
          width=".92"
          height=".92"
          rx=".12"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
