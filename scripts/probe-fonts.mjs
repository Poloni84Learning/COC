import fs from "node:fs";
import opentype from "opentype.js";
import { punctuation } from "./vietnamese-corpus.mjs";
const outlines = JSON.parse(fs.readFileSync("src/lib/art-glyphs.json", "utf8"));
for (const id of Object.keys(outlines)) {
  const b = fs.readFileSync(`public/fonts/art/${id}.ttf`),
    font = opentype.parse(
      b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength),
    );
  console.log(id, {
    missing: punctuation.filter((c) => !font.charToGlyph(c).index),
    pixelUnit: outlines[id].pixelUnit,
  });
}
