import fs from "node:fs";
import { ART_FONTS } from "../src/lib/art-fonts";
import {
  generate,
  DEFAULT_OPTIONS,
  inside,
  key,
  autoFit,
} from "../src/lib/engine";
// @ts-ignore executable shared corpus, not included in application build
import {
  vietnamese,
  alphabet,
  punctuation,
  vowelRows,
  phrases,
} from "./vietnamese-corpus.mjs";
const rows: any[] = [],
  collisions: any[] = [],
  phrasesScanned: any[] = [];
const canonical = (cells: any[]) => {
  const x = Math.min(...cells.map((p) => p.x)),
    y = Math.min(...cells.map((p) => p.y));
  return cells
    .map((p) => `${p.x - x},${p.y - y}`)
    .sort()
    .join(";");
};
for (const { id: font } of ART_FONTS)
  for (const scale of [1, 2, 3]) {
    for (const text of [
      ...new Set([...vietnamese, ...alphabet, ...punctuation, ..."0123456789"]),
    ] as string[]) {
      const options = {
        ...DEFAULT_OPTIONS,
        font,
        scale,
        text,
        ornaments: false,
      };
      const g = generate(options, 325),
        nfd = generate({ ...options, text: text.normalize("NFD") }, 325);
      rows.push({
        font,
        scale,
        text,
        count: g.cells.length,
        issue: g.issue,
        unsupported: g.unsupported,
        inside: g.cells.every(inside),
        unique: new Set(g.cells.map(key)).size === g.cells.length,
        nfd: JSON.stringify(g.cells) === JSON.stringify(nfd.cells),
      });
    }
    for (const family of vowelRows) {
      const seen = new Map();
      for (const text of family) {
        const g = generate(
            { ...DEFAULT_OPTIONS, font, scale, text, ornaments: false },
            325,
          ),
          signature = canonical(g.cells);
        if (seen.has(signature))
          collisions.push({ font, scale, a: seen.get(signature), b: text });
        seen.set(signature, text);
      }
    }
    for (const text of phrases) {
      const options = autoFit({ ...DEFAULT_OPTIONS, font, scale, text }, 325);
      const g = options && generate(options, 325);
      phrasesScanned.push({
        font,
        scale,
        text,
        fittedScale: options?.scale,
        count: g?.cells.length,
        issue: g?.issue ?? (!options ? "cannot fit" : null),
        unsupported: g?.unsupported,
      });
    }
  }
const failures = rows.filter(
  (r) =>
    !r.count ||
    r.issue ||
    r.unsupported.length ||
    !r.inside ||
    !r.unique ||
    !r.nfd,
);
const out = process.argv[2] ?? ".impeccable/review/vietnamese-full";
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(
  `${out}/scan.json`,
  JSON.stringify(
    { rows, collisions, phrases: phrasesScanned, failures },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    {
      cases: rows.length,
      failures: failures.length,
      collisions,
      phraseFailures: phrasesScanned.filter((r) => r.issue),
    },
    null,
    2,
  ),
);
if (failures.length || collisions.length || phrasesScanned.some((r) => r.issue))
  process.exitCode = 1;
