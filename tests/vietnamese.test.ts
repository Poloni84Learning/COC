import { test } from "node:test";
import assert from "node:assert/strict";
import {
  vietnamese,
  alphabet,
  punctuation,
  vowelRows,
  phrases,
} from "../scripts/vietnamese-corpus.mjs";
import {
  generate,
  DEFAULT_OPTIONS,
  key,
  inside,
  autoFit,
} from "../src/lib/engine";
import type { Cell } from "../src/types";
import { centerlineCells } from "../src/lib/centerline";
import { ART_FONTS } from "../src/lib/art-fonts";
const fonts = ART_FONTS.map((font) => font.id);
test("single strokes preserve endpoints through all sub-cell phases", () => {
  for (let x = 0; x < 1; x += 0.125)
    for (let y = 0; y < 1; y += 0.125) {
      for (const [dx, dy] of [
        [12, 12],
        [12, -12],
        [0, 12],
        [12, 0],
      ]) {
        const cells = centerlineCells([
          [
            [x, y],
            [x + dx, y + dy],
          ],
        ]);
        const set = new Set(cells.map(key));
        assert.ok(set.has(`${Math.round(x)},${Math.round(y)}`));
        assert.ok(set.has(`${Math.round(x + dx)},${Math.round(y + dy)}`));
        assert.equal(cells.length, 13);
      }
    }
});
test("dash lengths, exclamation stems and plus arms remain visible at every size", () => {
  for (const font of fonts)
    for (const scale of [1, 2, 3]) {
      const options = { ...DEFAULT_OPTIONS, font, scale, ornaments: false };
      const width = (text: string) => {
        const c = generate({ ...options, text }, 325).cells.map(
          (p) => p.x - p.y,
        );
        return Math.max(...c) - Math.min(...c);
      };
      assert.ok(width("-") >= 4);
      assert.ok(width("–") > width("-"));
      assert.ok(width("—") > width("–"));
      assert.ok(generate({ ...options, text: "!" }, 325).cells.length >= 9);
      assert.ok(generate({ ...options, text: "+" }, 325).cells.length >= 10);
    }
});
function signature(cells: Cell[]) {
  const minX = Math.min(...cells.map((p) => p.x)),
    minY = Math.min(...cells.map((p) => p.y));
  return cells
    .map((p) => `${p.x - minX},${p.y - minY}`)
    .sort()
    .join(";");
}
test("complete Vietnamese corpus has 12 vowels × 6 tones × 2 cases plus đ/Đ", () => {
  assert.equal(vowelRows.length, 24);
  assert.ok(
    vowelRows.every((row) => row.length === 6 && new Set(row).size === 6),
  );
  assert.equal(new Set(vietnamese).size, 146);
  assert.equal(new Set(punctuation).size, 41);
});
for (const font of fonts)
  for (const scale of [1, 2, 3]) {
    test(`${font}/${scale}: all 237 characters render and match their decomposed Unicode`, () => {
      for (const text of new Set([
        ...vietnamese,
        ...alphabet,
        ...punctuation,
        ..."0123456789",
      ])) {
        const opts = {
          ...DEFAULT_OPTIONS,
          font,
          scale,
          text,
          ornaments: false,
        };
        const g = generate(opts, 325);
        // Qwigley là font lớn nhất; riêng Ự ở cỡ 3 vượt 1 ô trong khung chéo.
        // autoFit (UI thực tế) tự giảm xuống cỡ 2 vừa khít.
        if (font === "qwigley" && scale === 3 && text === "Ự") {
          assert.ok(g.issue?.includes("ngoài làng"), text);
          const fitted = autoFit(opts, 325);
          assert.ok(fitted && fitted.scale < 3, text);
          assert.equal(generate(fitted, 325).issue, null, text);
          continue;
        } else {
          assert.equal(g.issue, null, `${text}: ${g.issue}`);
        }
        assert.deepEqual(g.unsupported, [], text);
        assert.ok(g.cells.length > 0, text);
        assert.ok(g.cells.every(inside), text);
        assert.equal(new Set(g.cells.map(key)).size, g.cells.length, text);
        assert.deepEqual(
          generate({ ...opts, text: text.normalize("NFD") }, 325).cells,
          g.cells,
          text,
        );
      }
    });
    test(`${font}/${scale}: six tones are distinct for every vowel, including inside words`, () => {
      for (const family of vowelRows) {
        for (const prefix of ["", "b"]) {
          const signatures = new Set<string>();
          for (const text of family) {
            const options = autoFit(
              {
                ...DEFAULT_OPTIONS,
                font,
                scale,
                text: prefix + text,
                ornaments: false,
              },
              325,
            );
            assert.ok(options, `${prefix}${text}`);
            const g = generate(options, 325);
            assert.ok(g.cells.length > 0);
            const s = signature(g.cells);
            assert.ok(
              !signatures.has(s),
              `${family.join(" ")} / ${prefix}${text}`,
            );
            signatures.add(s);
          }
        }
      }
    });
    test(`${font}/${scale}: punctuation in context, stacked accents, and line breaks remain valid`, () => {
      for (const text of [...punctuation.map((p) => `a${p}a`), ...phrases]) {
        const options = autoFit(
          { ...DEFAULT_OPTIONS, font, scale, text, ornaments: false },
          325,
        );
        assert.ok(options, text);
        const g = generate(options, 325);
        assert.equal(g.issue, null, text);
        assert.deepEqual(g.unsupported, [], text);
        assert.deepEqual(
          generate({ ...options, text: text.normalize("NFD") }, 325).cells,
          g.cells,
          text,
        );
      }
      const opts = { ...DEFAULT_OPTIONS, font, scale, ornaments: false };
      assert.notEqual(
        signature(generate({ ...opts, text: "a.a" }, 325).cells),
        signature(generate({ ...opts, text: "a'a" }, 325).cells),
      );
    });
  }
