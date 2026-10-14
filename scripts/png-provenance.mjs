// PNG textual origin metadata; keeps provenance when web sprites are regenerated.
import fs from "node:fs/promises";
const table = Array.from({ length: 256 }, (_, i) => {
  let n = i;
  for (let j = 0; j < 8; j++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(bytes) {
  let n = 0xffffffff;
  for (const byte of bytes) n = table[(n ^ byte) & 255] ^ (n >>> 8);
  return (n ^ 0xffffffff) >>> 0;
}
export async function embedOrigin(file, origin) {
  const input = await fs.readFile(file),
    payload = Buffer.from(`impeccable:prompt\0${origin}`, "utf8"),
    body = Buffer.concat([Buffer.from("tEXt"), payload]);
  const chunk = Buffer.alloc(payload.length + 12);
  chunk.writeUInt32BE(payload.length);
  body.copy(chunk, 4);
  chunk.writeUInt32BE(crc32(body), chunk.length - 4);
  let cursor = 8;
  while (cursor < input.length) {
    if (input.toString("ascii", cursor + 4, cursor + 8) === "IEND") break;
    cursor += input.readUInt32BE(cursor) + 12;
  }
  if (cursor >= input.length) throw new Error(`Malformed PNG: ${file}`);
  await fs.writeFile(
    file,
    Buffer.concat([input.subarray(0, cursor), chunk, input.subarray(cursor)]),
  );
}
