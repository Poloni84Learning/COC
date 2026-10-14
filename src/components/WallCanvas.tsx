import { useEffect, useRef, useState } from "react";
import type { Cell } from "../types";
import { cellAt, paint, preload, type RenderOptions } from "../lib/render";
import { inside, line } from "../lib/engine";

type Props = RenderOptions & {
  tool: "view" | "draw" | "erase";
  onEdit: (cell: Cell, erase: boolean, start: boolean) => boolean;
  onSelect: (cell: Cell) => void;
  onError: (message: string) => void;
};
export default function WallCanvas(props: Props) {
  const canvas = useRef<HTMLCanvasElement>(null),
    host = useRef<HTMLDivElement>(null),
    drawing = useRef(false),
    last = useRef<Cell | undefined>(undefined),
    strokeRecorded = useRef(false);
  const [size, setSize] = useState({ width: 800, height: 640 }),
    [hover, setHover] = useState<Cell>();
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ width: r.width, height: r.height });
    });
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let active = true;
    const options = { ...props, hover };
    if (canvas.current) paint(canvas.current, options, size.width, size.height);
    preload(options)
      .then(() => {
        if (active && canvas.current)
          paint(canvas.current, options, size.width, size.height);
      })
      .catch(() => {
        if (active)
          props.onError(
            "Một số ảnh công trình chưa tải được. Bản vẽ tọa độ vẫn sử dụng được.",
          );
      });
    return () => {
      active = false;
    };
  }, [
    props.walls,
    props.buildings,
    props.hall,
    props.isometric,
    props.showGrid,
    props.showCoordinates,
    props.selected,
    hover,
    size,
  ]);
  const locate = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return cellAt(
      ((e.clientX - r.left) * size.width) / r.width,
      ((e.clientY - r.top) * size.height) / r.height,
      size.width,
      size.height,
      props.isometric,
    );
  };
  const edit = (cell: Cell) => {
    if (!inside(cell)) {
      drawing.current = false;
      last.current = undefined;
      props.onError(
        "Đã dừng nét vẽ tại biên làng 44 × 44. Bắt đầu nét mới bên trong làng.",
      );
      return;
    }
    const points = last.current ? line(last.current, cell) : [cell];
    last.current = cell;
    for (const p of points) {
      const changed = props.onEdit(
        p,
        props.tool === "erase",
        !strokeRecorded.current,
      );
      if (changed) strokeRecorded.current = true;
    }
  };
  return (
    <div className={`canvas-host tool-${props.tool}`} ref={host}>
      <canvas
        ref={canvas}
        aria-label={`Bản vẽ lưới 44 × 44, ${props.walls.length} tường. Dùng các điều khiển tọa độ bên dưới để chỉnh bằng bàn phím.`}
        style={{
          width: `${props.zoom * 100}%`,
          height: `${props.zoom * 100}%`,
          transform: props.zoom > 1 ? "translate(-50%, -50%)" : undefined,
          left: props.zoom > 1 ? "50%" : undefined,
          top: props.zoom > 1 ? "50%" : undefined,
        }}
        onPointerDown={(e) => {
          const cell = locate(e);
          if (props.tool === "view") {
            if (inside(cell)) props.onSelect(cell);
            return;
          }
          drawing.current = true;
          last.current = undefined;
          strokeRecorded.current = false;
          e.currentTarget.setPointerCapture(e.pointerId);
          edit(cell);
        }}
        onPointerMove={(e) => {
          const cell = locate(e);
          setHover(inside(cell) ? cell : undefined);
          if (drawing.current) edit(cell);
        }}
        onPointerUp={(e) => {
          drawing.current = false;
          last.current = undefined;
          if (e.currentTarget.hasPointerCapture(e.pointerId))
            e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => {
          drawing.current = false;
          last.current = undefined;
        }}
        onPointerLeave={() => {
          if (!drawing.current) setHover(undefined);
        }}
      />
      <div className="canvas-corner">
        {props.isometric ? "Góc nhìn làng" : "Bản vẽ từ trên"}
        <span>44 × 44 ô</span>
      </div>
    </div>
  );
}
