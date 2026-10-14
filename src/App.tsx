import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Eraser,
  ExternalLink,
  FileJson,
  Grid2X2,
  HelpCircle,
  Layers3,
  Link2,
  LoaderCircle,
  Maximize,
  MousePointer2,
  Move,
  Pencil,
  Redo2,
  RotateCw,
  Shield,
  SlidersHorizontal,
  Type,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import WallCanvas from "./components/WallCanvas";
import LetterPreview from "./components/LetterPreview";
import { ART_FONTS } from "./lib/art-fonts";
import {
  autoFit,
  bounds,
  csv,
  decodeBlueprint,
  DEFAULT_OPTIONS,
  encodeBlueprint,
  generate,
  GRID,
  WALL_LIMITS,
  inside,
  key,
  PATTERNS,
  placeBuildings,
  inventory,
  validateBlueprint,
  validateGameLink,
} from "./lib/engine";
import { exportPng } from "./lib/render";
import type { Blueprint, Cell, DesignOptions, GameData } from "./types";

const STORAGE = "wallcraft-draft-v1";
function newBlueprint(): Blueprint {
  return {
    version: 1,
    hall: 16,
    options: DEFAULT_OPTIONS,
    walls: generate(DEFAULT_OPTIONS).cells,
    includeBuildings: false,
    includeBob: false,
    gameLink: "",
  };
}
function hasManualEdits(blueprint: Blueprint) {
  if (!blueprint.walls.length) return false;
  const generated = generate(
    blueprint.options,
    WALL_LIMITS[blueprint.hall - 1],
  ).cells;
  const cells = new Set(generated.map(key));
  return (
    generated.length !== blueprint.walls.length ||
    blueprint.walls.some((p) => !cells.has(key(p)))
  );
}
function initial() {
  const encoded = new URLSearchParams(location.hash.slice(1)).get("layout");
  if (encoded) {
    try {
      return {
        blueprint: decodeBlueprint(encoded),
        message: "Đã mở mẫu được chia sẻ.",
      };
    } catch (e) {
      return {
        blueprint: newBlueprint(),
        message: `Không mở được link mẫu: ${(e as Error).message}`,
      };
    }
  }
  try {
    const stored = localStorage.getItem(STORAGE);
    if (stored)
      return {
        blueprint: validateBlueprint(JSON.parse(stored)),
        message: "Đã khôi phục bản nháp trên thiết bị này.",
      };
  } catch {
    return {
      blueprint: newBlueprint(),
      message: "Bản nháp cũ không hợp lệ. Đã mở mẫu mới.",
    };
  }
  return { blueprint: newBlueprint(), message: "" };
}
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function App() {
  const [start] = useState(initial),
    [draft, setDraft] = useState(start.blueprint),
    [data, setData] = useState<GameData>(),
    [loadError, setLoadError] = useState("");
  const current = useRef(draft),
    past = useRef<Blueprint[]>([]),
    future = useRef<Blueprint[]>([]),
    [, setRevision] = useState(0);
  const [view, setView] = useState<"plan" | "village">("village"),
    [showGrid, setShowGrid] = useState(true),
    [tool, setTool] = useState<"view" | "draw" | "erase">("view");
  const [notice, setNotice] = useState(start.message),
    [help, setHelp] = useState(false),
    [exportOpen, setExportOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [storageStatus, setStorageStatus] = useState("Đang lưu…");
  const [gameLinkInput, setGameLinkInput] = useState(draft.gameLink),
    [linkError, setLinkError] = useState(""),
    [shareUrl, setShareUrl] = useState("");
  const [selected, setSelected] = useState<Cell>({ x: 21, y: 21 }),
    [manual, setManual] = useState(() => hasManualEdits(start.blueprint)),
    [previewExpanded, setPreviewExpanded] = useState(true),
    [adjustmentsOpen, setAdjustmentsOpen] = useState(
      !window.matchMedia("(max-width:800px)").matches,
    );
  const importRef = useRef<HTMLInputElement>(null),
    exportRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "game-data.json")
      .then((r) => {
        if (!r.ok) throw new Error("Không tải được dữ liệu Town Hall.");
        return r.json();
      })
      .then(setData)
      .catch((e) => setLoadError(e.message));
  }, []);
  useEffect(() => {
    const onHash = () => {
      const encoded = new URLSearchParams(location.hash.slice(1)).get("layout");
      if (!encoded) return;
      try {
        commit(decodeBlueprint(encoded), true, false);
        setManual(true);
        setNotice("Đã mở mẫu được chia sẻ.");
      } catch (e) {
        setNotice(`Không mở được link mẫu: ${(e as Error).message}`);
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE,
          JSON.stringify({ ...draft, savedAt: new Date().toISOString() }),
        );
        setStorageStatus("Đã lưu trên thiết bị");
      } catch {
        setStorageStatus("Không thể lưu trên thiết bị");
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [draft]);
  useEffect(() => {
    setShareUrl("");
    setGameLinkInput(draft.gameLink);
    setLinkError("");
  }, [draft]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node))
        setExportOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const hall = data?.halls.find((h) => h.level === draft.hall);
  const placement = useMemo(
    () =>
      hall && draft.includeBuildings && draft.walls.length > 0
        ? placeBuildings(draft.walls, inventory(hall, draft.includeBob))
        : { placed: [], unplaced: [] },
    [hall, draft.walls, draft.includeBuildings, draft.includeBob],
  );
  const budget = hall?.walls ?? WALL_LIMITS[draft.hall - 1];
  const generated = useMemo(
    () => generate(draft.options, budget),
    [draft.options, budget],
  );
  const blocked = !draft.walls.length ? generated.issue : null;
  const b = bounds(draft.walls),
    used = draft.walls.length,
    requested = blocked ? generated.requiredWalls : used,
    remaining = budget - requested,
    outside = draft.walls.filter((p) => !inside(p)).length;
  const valid =
    used > 0 && remaining >= 0 && !outside && !placement.unplaced.length;
  const countBuildings = hall
    ? inventory(hall, draft.includeBob).reduce((sum, b) => sum + b.count, 0)
    : 0;
  const label =
    draft.options.mode === "text"
      ? draft.options.text
      : (PATTERNS.find((p) => p.id === draft.options.pattern)?.name ??
        "Mẫu tường");
  const slug = `wallcraft-th${draft.hall}-${
    draft.options.mode === "text"
      ? generated.normalized
          .replace(/[^A-Z0-9]+/g, "-")
          .toLowerCase()
          .slice(0, 30)
      : draft.options.pattern
  }`;

  function commit(next: Blueprint, record = true, clearLink = true) {
    if (
      next.walls.some((p) => !inside(p)) ||
      next.walls.length > WALL_LIMITS[next.hall - 1]
    ) {
      setNotice("Đã dừng: mẫu vượt lưới 44 × 44 hoặc số tường của Town Hall.");
      return;
    }
    if (record) {
      past.current = [...past.current, current.current].slice(-40);
      future.current = [];
    }
    if (clearLink) next = { ...next, gameLink: "" };
    current.current = next;
    setDraft(next);
    setStorageStatus("Đang lưu…");
    setRevision((n) => n + 1);
  }
  function changeOptions(patch: Partial<DesignOptions>, fit = false) {
    const previous = current.current,
      options = {
        ...previous.options,
        ...patch,
        ...(patch.text !== undefined || patch.font !== undefined
          ? { mode: "text" as const }
          : {}),
      };
    const fitted = fit ? autoFit(options, budget) : null;
    const finalOptions = fitted ?? options;
    commit({
      ...previous,
      options: finalOptions,
      walls: generate(finalOptions, budget).cells,
    });
    setManual(false);
    setTool("view");
  }
  function changeHall(level: number) {
    const nextHall = data!.halls.find((h) => h.level === level)!;
    const old = current.current;
    if (manual && old.walls.length > nextHall.walls) {
      setNotice(
        `TH${level} chỉ có ${nextHall.walls} tường. Hãy giảm mẫu sửa tay trước khi đổi Town Hall.`,
      );
      return;
    }
    const options = manual
      ? old.options
      : (autoFit(old.options, nextHall.walls) ?? {
          ...old.options,
          scale: 1,
          thickness: 1,
        });
    commit({
      ...old,
      hall: level,
      options,
      walls: manual ? old.walls : generate(options, nextHall.walls).cells,
    });
  }
  function undo() {
    if (!past.current.length) return;
    future.current.push(current.current);
    const prev = past.current.pop()!;
    current.current = prev;
    setDraft(prev);
    setManual(hasManualEdits(prev));
    setRevision((n) => n + 1);
  }
  function redo() {
    if (!future.current.length) return;
    past.current.push(current.current);
    const next = future.current.pop()!;
    current.current = next;
    setDraft(next);
    setManual(hasManualEdits(next));
    setRevision((n) => n + 1);
  }
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea,select")) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
      if (e.key === "Escape") {
        setExportOpen(false);
        setHelp(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  function fit() {
    const options = autoFit(current.current.options, budget);
    if (!options) {
      setNotice(
        "Không thể vừa ngân sách. Hãy rút ngắn chữ, xuống dòng hoặc tăng Town Hall.",
      );
      return;
    }
    commit({
      ...current.current,
      options,
      walls: generate(options, budget).cells,
    });
    setManual(false);
    setNotice(
      "Đã căn mẫu vừa làng. Chữ giữ kích thước vừa đọc; tường dư dành cho họa tiết phụ.",
    );
  }
  function edit(cell: Cell, erase: boolean, start: boolean) {
    if (blocked) {
      setNotice(
        "Mẫu đang vượt giới hạn. Giảm kích thước hoặc tự căn vừa trước khi vẽ tiếp.",
      );
      return false;
    }
    if (!inside(cell)) {
      setNotice(
        "Đã dừng nét vẽ tại biên làng. Tọa độ phải là số nguyên từ 0 đến 43.",
      );
      return false;
    }
    const old = current.current,
      exists = old.walls.some((p) => key(p) === key(cell));
    if ((erase && !exists) || (!erase && exists)) return false;
    if (!erase && old.walls.length >= budget) {
      setNotice(
        `Đã dùng hết ${budget} tường của TH${old.hall}. Xóa một ô trước khi thêm.`,
      );
      return false;
    }
    commit(
      {
        ...old,
        walls: erase
          ? old.walls.filter((p) => key(p) !== key(cell))
          : [...old.walls, cell],
      },
      start,
    );
    setManual(true);
    setSelected(cell);
    return true;
  }
  function transformWalls(rotation: boolean) {
    const old = current.current,
      bb = bounds(old.walls);
    const walls = old.walls.map((p) =>
      rotation
        ? { x: GRID - 1 - p.y, y: p.x }
        : { x: bb.minX + bb.maxX - p.x, y: p.y },
    );
    if (!walls.every(inside)) {
      setNotice(
        "Phép biến đổi đưa tường ra ngoài lưới. Dịch mẫu vào giữa trước.",
      );
      return;
    }
    commit({ ...old, walls });
    setManual(true);
  }
  function shift(dx: number, dy: number) {
    const old = current.current,
      walls = old.walls.map((p) => ({ x: p.x + dx, y: p.y + dy }));
    if (!walls.every(inside)) {
      setNotice("Mẫu đã chạm mép lưới.");
      return;
    }
    commit({ ...old, walls });
    setManual(true);
  }
  async function copyShare() {
    if (!valid) return;
    const url = new URL(location.href);
    url.hash = `layout=${encodeBlueprint(current.current)}`;
    setShareUrl(url.toString());
    try {
      await navigator.clipboard.writeText(url.toString());
      setNotice("Đã sao chép link mẫu web. Link này mở Wallcraft.");
    } catch {
      setNotice(
        "Trình duyệt không cho sao chép. Chọn link bên dưới để sao chép thủ công.",
      );
    }
  }
  async function exportFile(type: "png" | "json" | "csv") {
    if (!hall || !valid) return;
    setBusy(true);
    setExportOpen(false);
    try {
      if (type === "png")
        download(
          await exportPng({
            walls: draft.walls,
            buildings: placement.placed,
            hall,
            isometric: view === "village",
            showGrid: true,
            showCoordinates: true,
            zoom: 1,
            label: `${label.replace(/\n/g, " / ")} • TH${draft.hall} • ${used}/${budget} walls • Wallcraft`,
          }),
          `${slug}.png`,
        );
      if (type === "json")
        download(
          new Blob(
            [
              JSON.stringify(
                {
                  ...draft,
                  coordinateSystem: "zero-based top-left, x right, y down",
                  gridSize: GRID,
                  wallLevel: hall.wallLevel,
                  wallLimit: hall.walls,
                  buildings: placement.placed,
                  unplaced: placement.unplaced,
                },
                null,
                2,
              ),
            ],
            { type: "application/json" },
          ),
          `${slug}.json`,
        );
      if (type === "csv")
        download(
          new Blob([csv(draft.walls, placement.placed, hall.wallLevel)], {
            type: "text/csv;charset=utf-8",
          }),
          `${slug}.csv`,
        );
      setNotice(`Đã xuất ${type.toUpperCase()} của mẫu.`);
    } catch (e) {
      setNotice(`Không xuất được: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 200000)
        throw new Error("Tệp quá lớn; chọn JSON Wallcraft dưới 200 KB.");
      const next = validateBlueprint(JSON.parse(await file.text()));
      commit(next, true, false);
      setManual(true);
      setNotice("Đã nhập mẫu JSON.");
    } catch (e) {
      setNotice(`Không nhập được: ${(e as Error).message}`);
    }
    if (importRef.current) importRef.current.value = "";
  }
  function attachLink() {
    const result = validateGameLink(gameLinkInput, draft.hall);
    if (!result.valid) {
      setLinkError(result.error!);
      return;
    }
    commit({ ...draft, gameLink: result.url! }, true, false);
    setNotice("Đã gắn link game. Cần kiểm tra bố cục thật khi mở COC.");
  }

  if (loadError)
    return (
      <main className="loading-state">
        <Shield size={40} />
        <h1>Chưa tải được bàn dựng</h1>
        <p>{loadError}</p>
        <button onClick={() => location.reload()} className="primary-button">
          Thử lại
        </button>
      </main>
    );
  if (!data || !hall)
    return (
      <main className="loading-state">
        <LoaderCircle className="spin" size={32} />
        <p>Đang chuẩn bị tường và công trình…</p>
      </main>
    );
  return (
    <>
      <header className="masthead">
        <a
          className="brand"
          href={import.meta.env.BASE_URL}
          aria-label="Wallcraft — trang chính"
        >
          <span className="brand-mark">
            <Layers3 size={25} />
          </span>
          <span>
            wallcraft<span className="brand-dot">.</span>
          </span>
        </a>
        <span className="brand-description">
          Một ngôi làng. Một dấu ấn riêng.
        </span>
        <div className="header-actions">
          <span className="saved-status">
            <span /> {storageStatus}
          </span>
          <button
            className={`quiet-button ${help ? "active" : ""}`}
            onClick={() => setHelp(!help)}
            aria-expanded={help}
          >
            <HelpCircle size={17} />
            <span>Hướng dẫn</span>
          </button>
        </div>
      </header>
      <main className="app-shell">
        <div className="page-heading">
          <div>
            <h1>
              Biến tường thành <span>chất riêng.</span>
            </h1>
            <p>Dựng chữ tiếng Việt và tiếng Anh, từng viên tường.</p>
          </div>
          <div className="page-heading-actions">
            <button
              className="secondary-button"
              onClick={() => importRef.current?.click()}
            >
              <Upload size={16} />
              Nhập mẫu
            </button>
            <button
              className="secondary-button"
              onClick={copyShare}
              disabled={!valid}
            >
              <Link2 size={16} />
              Chia sẻ mẫu
            </button>
          </div>
        </div>
        <input
          type="file"
          accept="application/json,.json"
          ref={importRef}
          className="sr-only"
          onChange={(e) => importFile(e.target.files?.[0])}
          aria-label="Nhập tệp JSON Wallcraft"
        />
        {help && (
          <section className="help-panel">
            <div>
              <h2>Dựng trong web, hoàn thiện trong làng.</h2>
              <p>
                Chọn Town Hall → nhập chữ và chọn phông → kiểm tra số tường →
                tải bản vẽ và xếp lại trong game. Bản vẽ tọa độ bắt đầu ở ô (0,
                0), góc trên bên trái.
              </p>
              <p>
                Chữ thư pháp giữ nguyên dấu tiếng Việt và chữ hoa/thường. Tên
                ngắn có nhiều chỗ cho nét lượn và dấu. Mẫu nghệ thuật dành cho
                trang trí; hãy dùng bố cục phù hợp khi phòng thủ.
              </p>
            </div>
            <button
              className="icon-button"
              onClick={() => setHelp(false)}
              aria-label="Đóng hướng dẫn"
            >
              <X size={18} />
            </button>
          </section>
        )}
        <section
          className={`mobile-live-preview ${previewExpanded ? "" : "folded"}`}
          aria-label="Xem nhanh mẫu tường"
        >
          <div className="mobile-preview-header">
            <strong>
              Xem nhanh{" "}
              <span>
                {used}/{budget} tường
              </span>
            </strong>
            <div>
              <button
                className="icon-button"
                onClick={() => setView(view === "plan" ? "village" : "plan")}
                aria-label="Đổi góc nhìn xem nhanh"
                title="Đổi góc nhìn"
              >
                {view === "plan" ? (
                  <Layers3 size={17} />
                ) : (
                  <Grid2X2 size={17} />
                )}
              </button>
              <button
                className="icon-button"
                onClick={() => setPreviewExpanded(!previewExpanded)}
                aria-expanded={previewExpanded}
                aria-label={
                  previewExpanded ? "Thu gọn xem nhanh" : "Mở xem nhanh"
                }
              >
                <ChevronDown size={17} />
              </button>
            </div>
          </div>
          {previewExpanded && blocked && (
            <p className="mobile-blocked" role="status">
              Đã dừng dựng · Mẫu vượt giới hạn. Thu nhỏ hoặc tự căn vừa.
            </p>
          )}
          {previewExpanded && !blocked && (
            <WallCanvas
              walls={draft.walls}
              buildings={placement.placed}
              hall={hall}
              isometric={view === "village"}
              showGrid={false}
              showCoordinates={false}
              zoom={1}
              tool="view"
              onEdit={() => false}
              onSelect={setSelected}
              onError={setNotice}
            />
          )}
        </section>
        <div className="editor-layout">
          <aside
            className="construction-panel"
            aria-label="Thiết lập mẫu tường"
          >
            <section className="hall-section">
              <div className="section-heading">
                <h2>Ngôi làng của bạn</h2>
                <Shield size={16} />
              </div>
              <div className="hall-select-row">
                <img
                  src={import.meta.env.BASE_URL + hall.image}
                  alt={`Nhà chính cấp ${draft.hall}`}
                />
                <label>
                  <span>Town Hall</span>
                  <select
                    value={draft.hall}
                    onChange={(e) => changeHall(Number(e.target.value))}
                    aria-label="Cấp Town Hall"
                  >
                    {data.halls.map((h) => (
                      <option key={h.level} value={h.level}>
                        Town Hall {h.level}
                        {h.level === 1 ? " · Không có tường" : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} />
                </label>
              </div>
              <div className="hall-details">
                <span>Tường cấp {hall.wallLevel || "—"}</span>
                <span>{budget} viên khả dụng</span>
              </div>
            </section>
            <section className="design-section">
              <div className="text-entry">
                {draft.options.mode === "shape" && (
                  <p className="small-note">
                    Bản dựng hình cũ được giữ nguyên. Nhập chữ hoặc chọn phông
                    để tạo bản dựng chữ.
                  </p>
                )}
                <label htmlFor="name-text">Tên, biệt danh hoặc lời nhắn</label>
                <textarea
                  id="name-text"
                  maxLength={120}
                  rows={2}
                  value={draft.options.text}
                  onChange={(e) => changeOptions({ text: e.target.value })}
                  placeholder="Nhập chữ tiếng Việt hoặc tiếng Anh"
                  spellCheck={false}
                />
                <div className="input-note">
                  <span>Việt / Anh · Giữ dấu và hoa/thường</span>
                  <span>{draft.options.text.length}/120</span>
                </div>
                {draft.options.mode === "text" &&
                  generated.normalized !== draft.options.text && (
                    <p className="normalization">
                      Chữ trên tường: <strong>{generated.normalized}</strong>
                    </p>
                  )}
                {generated.unsupported.length > 0 && (
                  <p className="inline-error">
                    Ký tự {generated.unsupported.join(", ")} được thay bằng dấu
                    ?. Hỗ trợ chữ Việt, chữ Anh, số và dấu câu.
                  </p>
                )}
                <div
                  className="font-picker"
                  role="group"
                  aria-label="Kiểu chữ nghệ thuật"
                >
                  {ART_FONTS.map((font) => (
                    <button
                      key={font.id}
                      className={`font-choice ${draft.options.font === font.id ? "selected" : ""}`}
                      aria-label={`Chữ ${font.name}`}
                      aria-pressed={draft.options.font === font.id}
                      title={font.description}
                      onClick={() => changeOptions({ font: font.id }, true)}
                    >
                      <LetterPreview font={font.id} text={draft.options.text} />
                      <span>{font.name}</span>
                    </button>
                  ))}
                </div>
                <p className="font-description">
                  {
                    ART_FONTS.find((f) => f.id === draft.options.font)
                      ?.description
                  }
                </p>
                <div className="stroke-controls">
                  <button
                    className="secondary-button"
                    onClick={() =>
                      changeOptions(
                        {
                          stroke: "light",
                          thickness: 1,
                          outline: false,
                          ornaments: true,
                        },
                        true,
                      )
                    }
                  >
                    Làm thanh chữ & thêm họa tiết
                  </button>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={draft.options.ornaments}
                      onChange={(e) =>
                        changeOptions({ ornaments: e.target.checked })
                      }
                    />
                    <span>Dùng tường dư cho họa tiết phụ</span>
                  </label>
                  <p className="small-note">
                    Giữ nét chữ mảnh, thêm họa tiết trọn vẹn khi còn đủ tường và
                    khoảng trống. Không cố dùng hết tường.
                  </p>
                </div>
                <p className="small-note">
                  Áp dụng cho mọi nội dung bạn nhập. Enter để xuống dòng; giảm
                  cỡ chữ khi vượt lưới hoặc số tường.
                </p>
              </div>
              <div className="frame-control">
                <div className="section-heading">
                  <h3>Hướng dựng mẫu</h3>
                  <Move size={15} />
                </div>
                <div
                  className="frame-switch"
                  role="group"
                  aria-label="Hệ trục dựng mẫu"
                >
                  <button
                    className={
                      draft.options.frame === "diagonal" ? "selected" : ""
                    }
                    aria-pressed={draft.options.frame === "diagonal"}
                    onClick={() => changeOptions({ frame: "diagonal" })}
                  >
                    Chéo 45° · Theo game
                  </button>
                  <button
                    className={draft.options.frame === "grid" ? "selected" : ""}
                    aria-pressed={draft.options.frame === "grid"}
                    onClick={() => changeOptions({ frame: "grid" })}
                  >
                    Theo ô vuông
                  </button>
                </div>
                <p className="small-note">
                  {draft.options.frame === "diagonal"
                    ? "Chữ nằm ngang khi nhìn vào làng. Đã bù độ nén phối cảnh."
                    : "Chữ thẳng theo cạnh lưới, đọc từ bản vẽ nhìn trên."}
                </p>
              </div>
              <details
                className="adjustments-disclosure"
                open={adjustmentsOpen}
                onToggle={(e) => setAdjustmentsOpen(e.currentTarget.open)}
              >
                <summary>
                  Tinh chỉnh nét
                  <SlidersHorizontal size={15} />
                </summary>
                <div className="adjustments">
                  <div className="section-heading">
                    <h3>Tinh chỉnh nét</h3>
                    <SlidersHorizontal size={15} />
                  </div>
                  <label className="range-label" htmlFor="scale">
                    Kích thước{" "}
                    <strong>
                      {["", "Gọn", "Vừa", "Lớn"][draft.options.scale]}
                    </strong>
                  </label>
                  <input
                    id="scale"
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    value={draft.options.scale}
                    onChange={(e) =>
                      changeOptions({ scale: Number(e.target.value) })
                    }
                  />
                  <div className="range-captions">
                    <span>Ít tường hơn</span>
                    <span>Nổi bật hơn</span>
                  </div>
                  <div className="option-row">
                    <span>Độ dày nét</span>
                    <div className="mini-switch">
                      <button
                        aria-pressed={draft.options.thickness === 1}
                        className={
                          draft.options.thickness === 1 ? "selected" : ""
                        }
                        onClick={() => changeOptions({ thickness: 1 })}
                      >
                        1 ô
                      </button>
                      <button
                        aria-pressed={draft.options.thickness === 2}
                        className={
                          draft.options.thickness === 2 ? "selected" : ""
                        }
                        onClick={() => changeOptions({ thickness: 2 })}
                      >
                        2 ô
                      </button>
                    </div>
                  </div>
                  {draft.options.mode === "text" && (
                    <>
                      <div className="option-row">
                        <label htmlFor="letter-gap">Khoảng cách chữ</label>
                        <select
                          id="letter-gap"
                          value={draft.options.gap}
                          onChange={(e) =>
                            changeOptions({ gap: Number(e.target.value) })
                          }
                        >
                          <option value="1">Nối tự nhiên</option>
                          <option value="2">Thoáng</option>
                          <option value="3">Rời nét</option>
                        </select>
                      </div>
                      <div className="option-row">
                        <label htmlFor="flourish">Nét dưới chữ</label>
                        <select
                          id="flourish"
                          value={draft.options.flourish}
                          onChange={(e) =>
                            changeOptions(
                              {
                                flourish: e.target
                                  .value as DesignOptions["flourish"],
                              },
                              true,
                            )
                          }
                        >
                          <option value="none">Không thêm</option>
                          <option value="swash">Nét lượn</option>
                          <option value="blade">Dải kiếm</option>
                        </select>
                      </div>
                    </>
                  )}
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={draft.options.outline}
                      onChange={(e) =>
                        changeOptions({ outline: e.target.checked })
                      }
                    />
                    <span>Chỉ giữ đường viền</span>
                  </label>
                  <p className="small-note">
                    Thay thông số sẽ tạo lại mẫu, gồm các ô đã sửa tay.
                  </p>
                </div>
              </details>
            </section>
            <section
              className={`budget-section ${blocked || remaining < 0 || outside ? "over-budget" : ""}`}
              aria-label="Ngân sách tường"
            >
              <div className="budget-heading">
                <span>{blocked ? "Mẫu cần" : "Tường sử dụng"}</span>
                <strong>
                  {requested}
                  <span> / {budget}</span>
                </strong>
              </div>
              <div className="budget-track">
                <div
                  style={{
                    width: `${budget ? Math.min(100, (requested / budget) * 100) : 0}%`,
                  }}
                />
              </div>
              {draft.options.mode === "text" && !manual && !blocked && (
                <p className="wall-allocation" aria-label="Phân bổ tường">
                  Nét chữ {generated.mainWalls} · Họa tiết{" "}
                  {generated.ornamentWalls} · Còn {remaining}
                </p>
              )}
              <div className="budget-status">
                {remaining >= 0 ? (
                  <>
                    <CheckCircle2 size={14} />
                    <span>
                      {blocked
                        ? "Vượt kích thước làng · chưa dựng"
                        : `Còn ${remaining} viên để sáng tạo thêm`}
                    </span>
                  </>
                ) : (
                  <>
                    <HelpCircle size={14} />
                    <span>Vượt {Math.abs(remaining)} viên tường</span>
                  </>
                )}
              </div>
              <button
                className="fit-button"
                onClick={fit}
                disabled={budget === 0 || !requested}
              >
                <Maximize size={16} />
                Tự căn vừa Town Hall
                <ArrowUpRight size={15} />
              </button>
              {outside > 0 && (
                <p className="inline-error">
                  {outside} ô nằm ngoài lưới. Giảm kích thước hoặc rút ngắn chữ.
                </p>
              )}
              {budget === 0 && (
                <p className="inline-error">
                  TH1 chưa có tường. Chọn TH2 trở lên.
                </p>
              )}
              {!used && !blocked && (
                <p className="small-note">Nhập chữ để bắt đầu.</p>
              )}
            </section>
          </aside>
          <section className="workbench" aria-label="Bàn dựng tường">
            <div className="workbench-header">
              <div className="workbench-title">
                <span className="live-dot" />
                <h2>Bản dựng của bạn</h2>
                <span className="draft-label">TH{draft.hall}</span>
              </div>
              <div className="view-switch" role="group" aria-label="Góc nhìn">
                <button
                  className={view === "village" ? "selected" : ""}
                  onClick={() => setView("village")}
                  aria-pressed={view === "village"}
                >
                  <Layers3 size={15} />
                  Làng 3D
                </button>
                <button
                  className={view === "plan" ? "selected" : ""}
                  onClick={() => setView("plan")}
                  aria-pressed={view === "plan"}
                >
                  <Grid2X2 size={15} />
                  Bản vẽ
                </button>
              </div>
            </div>
            <div className="canvas-area">
              <div className="canvas-tools">
                <div className="tool-group">
                  <button
                    className={`icon-button ${tool === "view" ? "selected" : ""}`}
                    title="Xem và chọn ô"
                    aria-label="Xem và chọn ô"
                    aria-pressed={tool === "view"}
                    onClick={() => setTool("view")}
                  >
                    <MousePointer2 size={17} />
                  </button>
                  <button
                    className={`icon-button ${tool === "draw" ? "selected" : ""}`}
                    disabled={!!blocked}
                    title="Vẽ tường"
                    aria-label="Vẽ tường"
                    aria-pressed={tool === "draw"}
                    onClick={() => setTool("draw")}
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    className={`icon-button ${tool === "erase" ? "selected" : ""}`}
                    disabled={!!blocked}
                    title="Xóa tường"
                    aria-label="Xóa tường"
                    aria-pressed={tool === "erase"}
                    onClick={() => setTool("erase")}
                  >
                    <Eraser size={17} />
                  </button>
                </div>
                <div className="tool-group">
                  <button
                    className="icon-button"
                    onClick={undo}
                    disabled={!past.current.length}
                    aria-label="Hoàn tác"
                    title="Hoàn tác (Ctrl+Z)"
                  >
                    <Undo2 size={17} />
                  </button>
                  <button
                    className="icon-button"
                    onClick={redo}
                    disabled={!future.current.length}
                    aria-label="Làm lại"
                    title="Làm lại (Ctrl+Shift+Z)"
                  >
                    <Redo2 size={17} />
                  </button>
                </div>
                <div className="tool-group">
                  <button
                    className="icon-button"
                    onClick={() => transformWalls(true)}
                    disabled={!used}
                    aria-label="Xoay mẫu 90 độ"
                    title="Xoay 90°"
                  >
                    <RotateCw size={17} />
                  </button>
                  <button
                    className="icon-button"
                    onClick={() => transformWalls(false)}
                    disabled={!used}
                    aria-label="Lật mẫu ngang"
                    title="Lật ngang"
                  >
                    <Move size={17} />
                  </button>
                </div>
              </div>
              <WallCanvas
                walls={draft.walls}
                buildings={placement.placed}
                hall={hall}
                isometric={view === "village"}
                showGrid={showGrid}
                showCoordinates={view === "plan"}
                zoom={1}
                selected={tool === "view" ? selected : undefined}
                tool={tool}
                onEdit={edit}
                onSelect={setSelected}
                onError={setNotice}
              />
              {blocked && (
                <div className="canvas-blocked" role="alert">
                  <Shield size={27} />
                  <strong>Đã dừng dựng mẫu</strong>
                  <p>{blocked}</p>
                  <button
                    className="primary-button"
                    onClick={fit}
                    disabled={!budget}
                  >
                    Tự căn lại mẫu
                  </button>
                </div>
              )}
              {!used && !blocked && (
                <div className="canvas-empty">
                  <Type size={28} />
                  <strong>Bắt đầu bằng tên của bạn</strong>
                  <span>Từng chữ sẽ trở thành những viên tường.</span>
                </div>
              )}
            </div>
            <div className="canvas-statusbar">
              <span>
                <span className="wall-swatch" /> {used} tường
                <span className="status-divider" /> {b.width} × {b.height} ô
                {manual && <span className="manual-tag">Đã sửa tay</span>}
              </span>
              <label>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                />
                Hiện lưới
              </label>
            </div>
            <div className="buildings-row">
              <div>
                <Layers3 size={21} />
                <div>
                  <label className="building-toggle">
                    <input
                      type="checkbox"
                      checked={draft.includeBuildings}
                      onChange={(e) =>
                        commit({ ...draft, includeBuildings: e.target.checked })
                      }
                    />
                    <strong>Xếp công trình theo TH{draft.hall}</strong>
                  </label>
                  <p>
                    {draft.includeBuildings
                      ? `${placement.placed.length}/${countBuildings} công trình và bẫy đã xếp · Tự tránh tường`
                      : "Giữ mẫu tường ở giữa, xếp công trình xung quanh."}
                  </p>
                </div>
              </div>
              <span className="building-count">
                {countBuildings} công trình &amp; bẫy
              </span>
            </div>
            {draft.includeBuildings && (
              <div className="building-options">
                {draft.hall >= 10 && (
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={draft.includeBob}
                      onChange={(e) =>
                        commit({ ...draft, includeBob: e.target.checked })
                      }
                    />
                    <span>Thêm nhà B.O.B. (nếu đã mở khóa)</span>
                  </label>
                )}
                <p>
                  Số lượng ở cấu hình nâng tối đa, đã ghép phòng thủ; chưa gồm
                  phòng thủ chế tạo theo mùa và chướng ngại vật.
                </p>
                {placement.unplaced.length > 0 && (
                  <p className="inline-error">
                    Chưa đủ chỗ cho {placement.unplaced.length} công trình:{" "}
                    {[...new Set(placement.unplaced.map((b) => b.name))].join(
                      ", ",
                    )}
                    . Giảm mẫu hoặc tắt công trình để xuất.
                  </p>
                )}
              </div>
            )}
            <p className="mobile-coordinate-note">
              Đặt đúng từng ô bằng mục Chỉnh theo tọa độ bên dưới.
            </p>
            <div className="coordinate-editor">
              <details>
                <summary>
                  Chỉnh theo tọa độ{" "}
                  <span>
                    Ô ({selected.x}, {selected.y})
                  </span>
                </summary>
                <div className="coordinate-controls">
                  <label>
                    Cột X{" "}
                    <input
                      type="number"
                      min="0"
                      max="43"
                      value={selected.x}
                      onChange={(e) =>
                        setSelected((p) => ({
                          ...p,
                          x: Number(e.target.value),
                        }))
                      }
                    />
                  </label>
                  <label>
                    Hàng Y{" "}
                    <input
                      type="number"
                      min="0"
                      max="43"
                      value={selected.y}
                      onChange={(e) =>
                        setSelected((p) => ({
                          ...p,
                          y: Number(e.target.value),
                        }))
                      }
                    />
                  </label>
                  <button
                    className="secondary-button"
                    disabled={!!blocked}
                    onClick={() => edit(selected, false, true)}
                  >
                    <Pencil size={14} />
                    Thêm tường
                  </button>
                  <button
                    className="secondary-button"
                    disabled={!!blocked}
                    onClick={() => edit(selected, true, true)}
                  >
                    <Eraser size={14} />
                    Xóa tường
                  </button>
                  <div className="move-buttons" aria-label="Dịch toàn bộ mẫu">
                    <button
                      className="icon-button"
                      onClick={() => shift(-1, 0)}
                      aria-label="Dịch mẫu sang trái"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => shift(0, -1)}
                      aria-label="Dịch mẫu lên"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => shift(0, 1)}
                      aria-label="Dịch mẫu xuống"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => shift(1, 0)}
                      aria-label="Dịch mẫu sang phải"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </details>
            </div>
            <div className="export-row">
              <div className={valid ? "ready-status" : "not-ready-status"}>
                {valid ? <CheckCircle2 size={17} /> : <HelpCircle size={17} />}
                <span>
                  {blocked
                    ? "Đã dừng · Mẫu vượt giới hạn"
                    : valid
                      ? "Mẫu sẵn sàng để dựng"
                      : !used
                        ? "Chưa có tường trong mẫu"
                        : outside
                          ? "Mẫu vượt kích thước lưới"
                          : remaining < 0
                            ? "Cần giảm số tường"
                            : "Cần thêm chỗ cho công trình"}
                </span>
              </div>
              <div className="export-control" ref={exportRef}>
                <button
                  className="primary-button"
                  onClick={() => setExportOpen(!exportOpen)}
                  disabled={!valid || busy}
                  aria-expanded={exportOpen}
                >
                  {busy ? (
                    <LoaderCircle size={17} className="spin" />
                  ) : (
                    <ArrowDownToLine size={17} />
                  )}
                  Tải bản dựng
                  <ChevronDown size={15} />
                </button>
                {exportOpen && (
                  <div className="export-menu">
                    <button onClick={() => exportFile("png")}>
                      <Grid2X2 size={17} />
                      <div>
                        Ảnh PNG<span>Ảnh rõ nét theo góc nhìn hiện tại</span>
                      </div>
                    </button>
                    <button onClick={() => exportFile("json")}>
                      <FileJson size={17} />
                      <div>
                        Mẫu JSON<span>Lưu toàn bộ, nhập lại để chỉnh tiếp</span>
                      </div>
                    </button>
                    <button onClick={() => exportFile("csv")}>
                      <ArrowDownToLine size={17} />
                      <div>
                        Tọa độ CSV<span>Tường, công trình và kích thước ô</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
        {shareUrl && (
          <section className="share-result">
            <div>
              <Link2 size={19} />
              <strong>Link mở mẫu trong Wallcraft</strong>
            </div>
            <input
              value={shareUrl}
              readOnly
              aria-label="Link chia sẻ mẫu web"
              onFocus={(e) => e.target.select()}
            />
            <button
              className="quiet-button"
              onClick={() => setShareUrl("")}
              aria-label="Ẩn link chia sẻ"
            >
              <X size={17} />
            </button>
          </section>
        )}
        <section className="game-link-section">
          <div className="game-link-intro">
            <div className="game-link-heading">
              <Link2 size={20} />
              <h2>Còn link copy vào game?</h2>
              <span className="in-game-tag">Tạo từ COC</span>
            </div>
            <p>
              Link base thật được tạo khi chia sẻ bố cục trong game. Web cung
              cấp bản vẽ để xếp lại; sau đó bạn có thể gắn link thật vào mẫu
              này.
            </p>
            <a
              href="https://supercell.com/en/games/clashofclans/es/blog/game-updates/training-und-layoutlinks-2/"
              target="_blank"
              rel="noreferrer"
            >
              Cách Supercell chia sẻ bố cục <ExternalLink size={12} />
            </a>
          </div>
          <div className="game-link-input">
            <label htmlFor="game-link">Gắn link base đã tạo trong game</label>
            <div>
              <input
                id="game-link"
                type="url"
                value={gameLinkInput}
                onChange={(e) => {
                  setGameLinkInput(e.target.value);
                  setLinkError("");
                }}
                placeholder="https://link.clashofclans.com/…"
              />
              <button
                className="secondary-button"
                onClick={attachLink}
                disabled={!gameLinkInput.trim()}
              >
                Gắn link
              </button>
            </div>
            {linkError && (
              <p className="inline-error" role="alert">
                {linkError}
              </p>
            )}
            {draft.gameLink ? (
              <>
                <a
                  className="game-open-link"
                  href={draft.gameLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Mở bố cục trong COC <ArrowUpRight size={14} />
                </a>
                <p>
                  Link do người dùng cung cấp; chưa xác minh bố cục hoặc thời
                  hạn. Sửa mẫu sẽ gỡ link.
                </p>
              </>
            ) : (
              <p>Link mẫu web và link base COC là hai loại link riêng.</p>
            )}
          </div>
        </section>
        <footer>
          <span>Wallcraft · Dành cho người thích dựng khác biệt.</span>
          <details className="data-sources">
            <summary>Dữ liệu &amp; nguồn</summary>
            <div>
              <p>
                Đối chiếu 05/10/2026. Số tường theo TH1–TH18: 0, 25, 50, 75,
                100, 125, 175, 225, 250, 275, 300, 300, 300, 325, 325, 325, 325,
                325.
              </p>
              <p>
                <a
                  href="https://github.com/chiefpansancolt/clash-of-clans-data"
                  target="_blank"
                  rel="noreferrer"
                >
                  Dữ liệu &amp; ảnh COC
                </a>{" "}
                ·{" "}
                <a
                  href="https://www.clashtrack.online/guides/town-hall/18"
                  target="_blank"
                  rel="noreferrer"
                >
                  Số tường TH18
                </a>{" "}
                ·{" "}
                <a
                  href="https://supercell.com/en/games/clashofclans/blog/release-notes/the-february-update-has-escaped/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Giới hạn nâng tường
                </a>
              </p>
              <p>
                Gói dữ liệu 0.18.1 được sửa số tường TH18 từ 400 thành 325.
                B.O.B. là công trình tùy chọn. Công trình, bẫy lấy cấp tối đa;
                cấu hình của bạn trong game có thể khác.
              </p>
              <p>
                Đây là công cụ cộng đồng độc lập, không được Supercell tài trợ.
                Clash of Clans và các tài sản liên quan thuộc Supercell.
              </p>
            </div>
          </details>
          <span>Không cần tài khoản.</span>
        </footer>
      </main>
      {notice && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Đóng thông báo">
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
