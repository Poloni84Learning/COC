import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ART_FONTS,
  artGlyphs,
  composePixels,
  pixelLibrary,
  repairedCharacters,
} from "../src/lib/art-fonts";
import {
  autoFit,
  DEFAULT_OPTIONS,
  generate,
  encodeBlueprint,
  decodeBlueprint,
  validateBlueprint,
} from "../src/lib/engine";
import {
  alphabet,
  vietnamese,
  vowelRows,
} from "../scripts/vietnamese-corpus.mjs";
import type { Blueprint } from "../src/types";

const signature = (pixels: number[][]) =>
  [...new Set(pixels.map((p) => p.join(",")))].sort().join(";");

test("all nine supplied libraries cover every Vietnamese and English letter", () => {
  assert.deepEqual(
    ART_FONTS.map((f) => f.id),
    [
      "dancing",
      "allura",
      "vibes",
      "caveat",
      "alexbrush",
      "pinyon",
      "badscript",
      "qwigley",
      "charmvn",
    ],
  );
  for (const { id: font } of ART_FONTS) {
    const library = pixelLibrary(font);
    assert.equal(Object.keys(library.recipes).length, 134);
    for (const char of new Set([...alphabet, ...vietnamese])) {
      const pixels = composePixels(char, font);
      assert.ok(pixels?.length, `${font}: ${char}`);
      assert.equal(
        signature(composePixels(char.normalize("NFD"), font)!),
        signature(pixels!),
      );
      if (repairedCharacters(font).has(char) || char === "ị") continue;
      const supplied = (library.recipes[char] ?? [char]).flatMap(
        (piece) => library.bases[piece] ?? library.overlays[piece],
      );
      assert.equal(
        signature(pixels!),
        signature(supplied),
        `${font}: preserve supplied artwork for ${char}`,
      );
    }
  }
});

test("R6 removes the top dot from ị while retaining its body and dot below", () => {
  for (const { id: font } of ART_FONTS) {
    const library = pixelLibrary(font);
    const top = Math.min(
      ...["e", "n", "u"].flatMap((c) => library.bases[c].map((p) => p[1])),
    );
    const stem = composePixels("ı", font)!;
    const letter = composePixels("ị", font)!;
    assert.ok(
      letter.every(([, y]) => y >= top),
      font,
    );
    assert.ok(
      letter.some(([, y]) => y > Math.max(...stem.map((p) => p[1]))),
      font,
    );
    const retained = stem.filter((p) =>
      letter.some((q) => p[0] === q[0] && p[1] === q[1]),
    );
    // R9 permits a font to redraw a few stem pixels when an accent is added.
    assert.ok(retained.length >= stem.length * 0.9, font);
  }
});

test("source placeholder and ambiguous recipes are recovered into distinct vowels", () => {
  assert.equal(repairedCharacters("caveat").size, 44);
  assert.equal(repairedCharacters("dancing").size, 2);
  assert.equal(repairedCharacters("alexbrush").size, 6);
  assert.equal(repairedCharacters("allura").size, 0);
  assert.equal(repairedCharacters("vibes").size, 0);
  assert.equal(repairedCharacters("pinyon").size, 0);
  assert.equal(repairedCharacters("badscript").size, 0);
  assert.equal(repairedCharacters("qwigley").size, 0);
  assert.equal(repairedCharacters("charmvn").size, 0);
  for (const { id: font } of ART_FONTS)
    for (const family of vowelRows) {
      const glyphs = family.map((char) =>
        signature(composePixels(char, font)!),
      );
      assert.equal(new Set(glyphs).size, 6, `${font}: ${family.join(" ")}`);
    }
});

test("whole-letter R9 artwork and the fixed font baseline are preserved", () => {
  for (const [font, char] of [
    ["vibes", "Đ"],
    ["charmvn", "Đ"],
  ] as const) {
    const library = pixelLibrary(font);
    assert.ok(library.recipes[char][0].startsWith("nguyen|"));
    assert.equal(
      signature(composePixels(char, font)!),
      signature(library.overlays[library.recipes[char][0]]),
    );
  }
  for (const { id: font } of ART_FONTS) {
    const library = pixelLibrary(font);
    const data = artGlyphs(font);
    for (const char of ["H", "n", "y", "g", "Q"]) {
      const expectedY =
        (Math.min(...library.bases[char].map((p) => p[1])) -
          library.meta.baseline_row) /
        data.pixelUnit;
      assert.equal(
        Math.min(...data.glyphs[char].contours.flat().map((p) => p[1])),
        expectedY,
      );
    }
  }
});

test("unlisted mixed-language strings generate and share in every font and frame", () => {
  for (const { id: font } of ART_FONTS)
    for (const frame of ["grid", "diagonal"] as const)
      for (const text of ["Xứ Z", "ỠqJ", "wẮy", "A!b", "ế\nỵ"]) {
        const options = autoFit(
          { ...DEFAULT_OPTIONS, font, frame, text, ornaments: false },
          325,
        );
        assert.ok(options, `${font}/${frame}: ${text}`);
        const g = generate(options, 325);
        assert.equal(g.issue, null);
        assert.deepEqual(g.unsupported, []);
        const blueprint: Blueprint = {
          version: 1,
          hall: 16,
          options,
          walls: g.cells,
          includeBuildings: false,
          includeBob: false,
          gameLink: "",
        };
        assert.deepEqual(
          decodeBlueprint(encodeBlueprint(blueprint)),
          blueprint,
        );
        assert.deepEqual(
          generate({ ...options, text: text.normalize("NFD") }, 325).cells,
          g.cells,
        );
      }
});

test("retired Charm drafts migrate to Caveat without altering walls or game links", () => {
  const walls = generate(DEFAULT_OPTIONS, 325).cells;
  const old = {
    version: 1,
    hall: 16,
    options: { ...DEFAULT_OPTIONS, font: "charm" },
    walls,
    includeBuildings: false,
    includeBob: false,
    gameLink: "",
  };
  const restored = validateBlueprint(old);
  assert.equal(restored.options.font, "caveat");
  assert.deepEqual(restored.walls, walls);
});
