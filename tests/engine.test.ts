import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  autoFit,
  bounds,
  decodeBlueprint,
  DEFAULT_OPTIONS,
  encodeBlueprint,
  generate,
  framePoint,
  inside,
  inventory,
  key,
  PATTERNS,
  placeBuildings,
  validateBlueprint,
  validateGameLink,
  WALL_LIMITS,
} from "../src/lib/engine";
import { ART_FONTS, artGlyphs } from "../src/lib/art-fonts";
import { thinStrokes } from "../src/lib/thin-strokes";

test("open lettering preserves identifying marks and reserves the space above text", () => {
  for (const { id: font } of ART_FONTS) {
    const options = { ...DEFAULT_OPTIONS, font, ornaments: false };
    for (const [a, b] of [
      ["D", "Đ"],
      ["d", "đ"],
      ["i", "ı"],
      ["e", "ê"],
      ["a", "ă"],
    ]) {
      if (b === "ı") continue;
      assert.notDeepEqual(
        generate({ ...options, text: a }, 325).cells,
        generate({ ...options, text: b }, 325).cells,
      );
    }
    for (const text of ["i", "j"]) {
      const cells = generate({ ...options, text }, 325).cells;
      const occupied = new Set(cells.map(key));
      let components = 0;
      while (occupied.size) {
        components++;
        const stack = [occupied.values().next().value!];
        while (stack.length) {
          const k = stack.pop()!;
          if (!occupied.delete(k)) continue;
          const [x, y] = k.split(",").map(Number);
          for (let dx = -1; dx <= 1; dx++)
            for (let dy = -1; dy <= 1; dy++)
              if (dx || dy) stack.push(`${x + dx},${y + dy}`);
        }
      }
      assert.equal(components, 2, `${font} ${text}: separate dot and stem`);
    }
    const main = generate({ ...options, text: "Phúc" }, 325),
      decorated = generate({ ...options, text: "Phúc", ornaments: true }, 325);
    const set = new Set(main.cells.map(key));
    const top = Math.min(...main.cells.map((p) => p.x + p.y));
    assert.ok(
      decorated.cells
        .filter((p) => !set.has(key(p)))
        .every((p) => p.x + p.y >= top),
    );
  }
});
import type { Blueprint, GameData } from "../src/types";
const data: GameData = JSON.parse(
  fs.readFileSync("public/game-data.json", "utf8"),
);

test("Town Hall wall inventory includes no walls at TH1 and fixes the TH18 upgrade-allowance error", () => {
  assert.deepEqual(
    data.halls.map((h) => h.walls),
    [
      0, 25, 50, 75, 100, 125, 175, 225, 250, 275, 300, 300, 300, 325, 325, 325,
      325, 325,
    ],
  );
  assert.equal(autoFit(DEFAULT_OPTIONS, 0), null);
  assert.deepEqual(
    WALL_LIMITS,
    data.halls.map((h) => h.walls),
  );
});
test("all presets fit whenever autoFit returns a result, at every Town Hall", () => {
  let successful = 0;
  for (const hall of data.halls)
    for (const pattern of PATTERNS) {
      const o = autoFit(
        { ...DEFAULT_OPTIONS, mode: "shape", pattern: pattern.id },
        hall.walls,
      );
      if (!o) continue;
      const g = generate(o);
      assert.ok(g.cells.length <= hall.walls);
      assert.ok(g.cells.every(inside));
      assert.equal(new Set(g.cells.map(key)).size, g.cells.length);
      successful++;
    }
  assert.ok(successful > 70);
  for (const pattern of PATTERNS)
    assert.ok(
      autoFit({ ...DEFAULT_OPTIONS, mode: "shape", pattern: pattern.id }, 325),
      pattern.name,
    );
});
test("Vietnamese names normalize deterministically and unsupported symbols are reported", () => {
  const g = generate({ ...DEFAULT_OPTIONS, text: "Đặng Linh", scale: 1 });
  assert.equal(g.normalized, "Đặng Linh");
  assert.deepEqual(g.unsupported, []);
  assert.ok(g.cells.every(inside));
  assert.ok(
    generate({
      ...DEFAULT_OPTIONS,
      text: "L♥VE",
      scale: 1,
    }).unsupported.includes("♥"),
  );
});
test("text counts actual discrete cells and never truncates an overlong design to fit", () => {
  const one = generate({ ...DEFAULT_OPTIONS, text: "A", scale: 1 }),
    two = generate({ ...DEFAULT_OPTIONS, text: "A", scale: 2 });
  assert.ok(one.cells.length > 0);
  assert.ok(two.cells.length > one.cells.length);
  const long = generate({
    ...DEFAULT_OPTIONS,
    text: "W".repeat(120),
    scale: 1,
  });
  assert.equal(long.cells.length, 0);
  assert.ok(long.requiredWalls > 325);
  assert.ok(long.outside > 0);
  assert.match(long.issue!, /Đã dừng dựng/);
  assert.equal(
    autoFit({ ...DEFAULT_OPTIONS, text: "W".repeat(120) }, 325),
    null,
  );
  assert.equal(generate({ ...DEFAULT_OPTIONS, text: "  \n " }).cells.length, 0);
});
test("rotations, reflection, thickening and outline maintain unique discrete cells", () => {
  for (const pattern of PATTERNS)
    for (let rotation = 0; rotation < 4; rotation++) {
      const g = generate({
        ...DEFAULT_OPTIONS,
        mode: "shape",
        pattern: pattern.id,
        scale: 1,
        rotation,
        mirrored: true,
        thickness: 2,
        outline: true,
      });
      assert.equal(new Set(g.cells.map(key)).size, g.cells.length);
      assert.ok(g.cells.every(inside));
      if (g.issue) assert.equal(g.cells.length, 0);
      else assert.ok(bounds(g.cells).width > 0);
    }
});
test("all eligible permanent buildings and traps are placed inside the grid without overlap", () => {
  for (const hall of data.halls) {
    const o = autoFit(DEFAULT_OPTIONS, hall.walls),
      walls = o ? generate(o).cells : [];
    const list = inventory(hall, true),
      result = placeBuildings(walls, list);
    const occupied = new Set(walls.map(key));
    for (const b of result.placed)
      for (let dy = 0; dy < b.height; dy++)
        for (let dx = 0; dx < b.width; dx++) {
          const p = { x: b.x + dx, y: b.y + dy };
          assert.ok(inside(p));
          assert.ok(
            !occupied.has(key(p)),
            `${hall.level}: overlap ${b.instance}`,
          );
          occupied.add(key(p));
        }
    assert.equal(
      result.placed.length + result.unplaced.length,
      list.reduce((n, b) => n + b.count, 0),
    );
    assert.equal(
      result.unplaced.length,
      0,
      `TH${hall.level} cannot place ${result.unplaced.map((b) => b.id)}`,
    );
  }
  const sixteen = data.halls[15],
    seventeen = data.halls[16];
  assert.equal(sixteen.buildings.find((b) => b.id === "cannon")?.count, 3);
  assert.equal(
    seventeen.buildings.find((b) => b.id === "cannon"),
    undefined,
  );
  assert.equal(
    seventeen.buildings.find((b) => b.id === "eagle-artillery"),
    undefined,
  );
});
test("placement explicitly reports failures for a fully occupied grid", () => {
  const walls = Array.from({ length: 44 * 44 }, (_, i) => ({
    x: i % 44,
    y: Math.floor(i / 44),
  }));
  const result = placeBuildings(walls, data.halls[0].buildings);
  assert.equal(result.placed.length, 0);
  assert.ok(result.unplaced.length > 0);
});
test("share links roundtrip exact walls, Unicode input and settings; malformed data is rejected", () => {
  const b: Blueprint = {
    version: 1,
    hall: 16,
    options: { ...DEFAULT_OPTIONS, text: "Linh Đặng" },
    walls: generate(DEFAULT_OPTIONS).cells,
    includeBuildings: true,
    includeBob: false,
    gameLink: "",
  };
  assert.deepEqual(decodeBlueprint(encodeBlueprint(b)), b);
  assert.deepEqual(
    validateBlueprint({
      ...b,
      buildings: Array.from({ length: 150 }, () => ({
        extra: "not part of shared state",
      })),
    }),
    b,
  );
  for (const bad of [
    { ...b, hall: 19 },
    { ...b, walls: [{ x: -1, y: 4 }] },
    { ...b, walls: [{ x: 44, y: 4 }] },
    { ...b, walls: [null] },
    { ...b, hall: 2 },
    { ...b, options: { ...b.options, scale: 100 } },
    { ...b, options: { ...b.options, font: "arial" } },
    { ...b, options: { ...b.options, frame: "fake" } },
    { ...b, options: { ...b.options, outline: "yes" } },
    { ...b, gameLink: "javascript:alert(1)" },
  ])
    assert.throws(() => validateBlueprint(bad));
  assert.throws(() => decodeBlueprint("invalid"));
  assert.throws(() => decodeBlueprint("A".repeat(22001)));
});

test("every decorative glyph survives rasterization; fonts yield different actual walls", () => {
  const fingerprints = new Set<string>();
  for (const { id } of ART_FONTS) {
    for (const scale of [1, 2, 3]) {
      const { glyphs } = artGlyphs(id);
      for (const [char, rows] of Object.entries(glyphs))
        if (char !== " ")
          assert.ok(rows.contours.length > 0, `${id} ${scale} ${char}`);
      for (const frame of ["grid", "diagonal"] as const) {
        const options = {
          ...DEFAULT_OPTIONS,
          font: id,
          frame,
          scale,
          text: "ART",
        };
        const g = generate(options, 325);
        assert.equal(new Set(g.cells.map(key)).size, g.cells.length);
        assert.ok(g.cells.every(inside));
        if (g.issue) assert.equal(g.cells.length, 0);
        else assert.ok(g.cells.length <= 325);
      }
    }
    fingerprints.add(
      JSON.stringify(
        generate({
          ...DEFAULT_OPTIONS,
          font: id,
          frame: "grid",
          scale: 1,
          text: "ART",
        }).cells,
      ),
    );
  }
  assert.equal(fingerprints.size, ART_FONTS.length);
});

test("rotated reference frame becomes horizontal and upright under game projection", () => {
  const project = (p: { x: number; y: number }) => ({
    x: p.x - p.y,
    y: (p.x + p.y) / 2,
  });
  const origin = project(framePoint({ x: 0, y: 0 }, "diagonal"));
  const right = project(framePoint({ x: 12, y: 0 }, "diagonal"));
  const down = project(framePoint({ x: 0, y: 12 }, "diagonal"));
  assert.deepEqual(
    { x: right.x - origin.x, y: right.y - origin.y },
    { x: 12, y: 0 },
  );
  assert.deepEqual(
    { x: down.x - origin.x, y: down.y - origin.y },
    { x: 0, y: 12 },
  );
  for (let x = 0; x < 44; x++)
    assert.ok(Math.abs(project(framePoint({ x, y: 0 }, "diagonal")).y) <= 0.5);
  assert.notDeepEqual(
    generate({ ...DEFAULT_OPTIONS, frame: "grid" }).cells,
    generate({ ...DEFAULT_OPTIONS, frame: "diagonal" }).cells,
  );
});

test("Vietnamese accents, case and thin/thick strokes survive final-grid rasterization", () => {
  for (const { id: font } of ART_FONTS) {
    const options = { ...DEFAULT_OPTIONS, font, scale: 2, text: "Phúc" };
    const accented = generate(options),
      plain = generate({ ...options, text: "Phuc" });
    assert.equal(accented.normalized, "Phúc");
    assert.deepEqual(accented.unsupported, []);
    assert.notDeepEqual(accented.cells, plain.cells);
    assert.deepEqual(
      generate({ ...options, text: "Phu\u0301c" }).cells,
      accented.cells,
    );
    assert.notDeepEqual(
      generate({ ...options, text: "PHÚC" }).cells,
      accented.cells,
    );
    const vietnamese =
      "àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ";
    for (const char of vietnamese + vietnamese.toUpperCase())
      assert.ok(
        artGlyphs(font).glyphs[char].contours.length,
        `${font}: ${char}`,
      );
  }
  const cells = generate({
      ...DEFAULT_OPTIONS,
      text: "Linh",
      scale: 3,
      stroke: "original",
      ornaments: false,
    }).cells,
    occupied = new Set(cells.map(key));
  assert.ok(
    cells.some((p) =>
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].every(([x, y]) => occupied.has(key({ x: p.x + x, y: p.y + y }))),
    ),
    "broad downstrokes remain",
  );
  assert.ok(
    cells.some(
      (p) =>
        [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ].filter(([x, y]) => occupied.has(key({ x: p.x + x, y: p.y + y })))
          .length <= 2,
    ),
    "thin strokes remain",
  );
});

test("exact grid edge and budget are allowed, a one-cell excess blocks the whole generation", () => {
  for (const frame of ["grid", "diagonal"] as const) {
    const o = {
      ...DEFAULT_OPTIONS,
      frame,
      text: "A",
      scale: 1,
      ornaments: false,
    };
    const first = generate(o),
      bb = bounds(first.cells);
    const edge = { ...o, offsetX: 43 - bb.maxX };
    assert.equal(bounds(generate(edge).cells).maxX, 43);
    const pastEdge = generate({ ...edge, offsetX: edge.offsetX + 1 });
    assert.equal(pastEdge.cells.length, 0);
    assert.ok(pastEdge.outside > 0);
    const n = first.requiredWalls;
    assert.equal(generate(o, n).cells.length, n);
    assert.equal(generate(o, n - 1).cells.length, 0);
    assert.match(generate(o, n - 1).issue!, /vượt 1 viên/);
  }
});

test("light lettering removes fill and surplus decorations respect budget without changing the main text", () => {
  const options = {
    ...DEFAULT_OPTIONS,
    text: "Linh",
    scale: 2,
    ornaments: false,
  };
  const light = generate(options, 325);
  // Compare unchanged outlines; authored open counters can deliberately be larger.
  const original = generate({ ...options, text: "B", stroke: "original" }, 325);
  assert.ok(
    generate({ ...options, text: "B" }, 325).mainWalls <
      original.mainWalls * 0.8,
  );
  const decorated = generate({ ...options, ornaments: true }, 325);
  assert.equal(decorated.mainWalls, light.mainWalls);
  const all = new Set(decorated.cells.map(key));
  assert.ok(light.cells.every((p) => all.has(key(p))));
  assert.ok(decorated.ornamentWalls > 0);
  assert.equal(
    decorated.cells.length,
    decorated.mainWalls + decorated.ornamentWalls,
  );
  assert.ok(decorated.cells.length < 325);
  for (const budget of [
    light.mainWalls,
    light.mainWalls + 7,
    light.mainWalls + 20,
    325,
  ]) {
    const g = generate({ ...options, ornaments: true }, budget);
    assert.ok(g.cells.length <= budget);
    assert.ok(g.cells.every(inside));
    assert.equal(g.mainWalls, light.mainWalls);
  }
  assert.equal(
    generate({ ...options, ornaments: true }, light.mainWalls).ornamentWalls,
    0,
  );
  assert.equal(autoFit({ ...options, scale: 2 }, 325)?.scale, 2);
});

test("thinning preserves isolated dots and a connected path through broad strokes", () => {
  const dot = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ];
  assert.ok(thinStrokes(dot).length >= 1);
  const line = Array.from({ length: 36 }, (_, i) => ({
    x: i % 3,
    y: Math.floor(i / 3),
  }));
  const thin = thinStrokes(line),
    seen = new Set<string>(),
    queue = [thin[0]];
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    seen.add(key(p));
    for (const q of thin)
      if (
        !seen.has(key(q)) &&
        Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y)) <= 1
      ) {
        seen.add(key(q));
        queue.push(q);
      }
  }
  assert.equal(seen.size, thin.length);
  assert.ok(thin.length < line.length / 2);
});

test("old v1 drafts retain coordinates, new font and reference frame survive sharing", () => {
  const b: Blueprint = {
    version: 1,
    hall: 16,
    options: { ...DEFAULT_OPTIONS, font: "allura", frame: "diagonal" },
    walls: generate({ ...DEFAULT_OPTIONS, font: "allura" }).cells,
    includeBuildings: false,
    includeBob: false,
    gameLink: "",
  };
  assert.deepEqual(decodeBlueprint(encodeBlueprint(b)), b);
  const old = {
    ...b,
    options: { ...b.options, font: undefined, frame: undefined },
  };
  const migrated = validateBlueprint(old);
  assert.deepEqual(migrated.walls, b.walls);
  assert.equal(migrated.options.frame, "grid");
  assert.equal(migrated.options.font, "vibes");
});
test("game links require genuine Supercell domain, OpenLayout shape and matching Town Hall", () => {
  const link =
    "https://link.clashofclans.com/en?action=OpenLayout&id=TH16%3AHV%3AAAAAAAAAAAMFcYu_brVfYoJRUceHWlPi";
  assert.ok(validateGameLink(link, 16).valid);
  assert.ok(!validateGameLink(link, 15).valid);
  assert.ok(
    !validateGameLink(
      link.replace(
        "link.clashofclans.com",
        "link.clashofclans.com.evil.example",
      ),
      16,
    ).valid,
  );
  assert.ok(!validateGameLink("javascript:alert(1)", 16).valid);
  assert.ok(
    !validateGameLink(
      "https://link.clashofclans.com/en?action=OpenLayout&id=COORDINATES",
      16,
    ).valid,
  );
});
