import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { embedOrigin } from "./png-provenance.mjs";

const root = path.resolve(import.meta.dirname, "..");
const pkg = path.join(root, "node_modules/clash-of-clans-data");
const base = path.join(pkg, "data/home");
const output = path.join(root, "public");
await fs.mkdir(path.join(output, "sprites"), { recursive: true });
const wallLimits = [
  0, 25, 50, 75, 100, 125, 175, 225, 250, 275, 300, 300, 300, 325, 325, 325,
  325, 325,
];
const names = {
  "town-hall": "Nhà chính",
  cannon: "Pháo",
  "archer-tower": "Tháp cung",
  mortar: "Pháo cối",
  "air-defense": "Phòng không",
  "air-sweeper": "Máy thổi khí",
  "wizard-tower": "Tháp phù thủy",
  "hidden-tesla": "Tesla",
  "bomb-tower": "Tháp bom",
  "x-bow": "Nỏ X-Bow",
  "inferno-tower": "Tháp địa ngục",
  "eagle-artillery": "Pháo đại bàng",
  scattershot: "Máy bắn đá",
  "builders-hut": "Nhà thợ xây",
  "spell-tower": "Tháp phép",
  monolith: "Cột nguyên khối",
  "multi-archer-tower": "Tháp đa cung",
  "ricochet-cannon": "Pháo nảy",
  firespitter: "Pháo phun lửa",
  "multi-gear-tower": "Tháp đa chức năng",
  "revenge-tower": "Tháp báo thù",
  "super-wizard-tower": "Tháp siêu phù thủy",
  "crafting-station": "Trạm chế tạo",
  "army-camp": "Trại lính",
  barracks: "Nhà lính",
  "dark-barracks": "Nhà lính đen",
  laboratory: "Phòng thí nghiệm",
  "spell-factory": "Nhà phép",
  "dark-spell-factory": "Nhà phép đen",
  blacksmith: "Lò rèn",
  "hero-hall": "Nhà tướng",
  "hero-banner": "Cờ tướng",
  "pet-house": "Nhà thú",
  workshop: "Xưởng công thành",
  "gold-mine": "Mỏ vàng",
  "elixir-collector": "Máy hút dầu",
  "gold-storage": "Kho vàng",
  "elixir-storage": "Kho dầu",
  "dark-elixir-drill": "Máy hút dầu đen",
  "dark-elixir-storage": "Kho dầu đen",
  "clan-castle": "Lâu đài bang hội",
  "helper-hut": "Nhà trợ lý",
  "bobs-hut": "Nhà B.O.B.",
  bomb: "Bom",
  "spring-trap": "Bẫy bật",
  "air-bomb": "Bom khí",
  "giant-bomb": "Bom khổng lồ",
  "seeking-air-mine": "Mìn tầm nhiệt",
  "skeleton-trap": "Bẫy xương",
  "tornado-trap": "Bẫy lốc",
  "giga-bomb": "Bom Giga",
};
const jobs = new Map();
function sprite(source, key) {
  const target = `sprites/${key}.png`;
  if (!jobs.has(target))
    jobs.set(target, async () => {
      await sharp(path.join(pkg, source))
        .trim()
        .resize(192, 192, { fit: "inside", withoutEnlargement: true })
        .png()
        .toFile(path.join(output, target));
      await embedOrigin(
        path.join(output, target),
        `Existing Clash of Clans asset ${source}, from clash-of-clans-data 0.18.1, https://github.com/chiefpansancolt/clash-of-clans-data. Transparent margins trimmed and resized to at most 192 px using sharp for web delivery.`,
      );
    });
  return target;
}
const entities = [];
for (const category of [
  "town-hall",
  "defenses",
  "army-buildings",
  "resource-buildings",
  "other",
  "traps",
]) {
  for (const file of await fs.readdir(path.join(base, category))) {
    if (!file.endsWith(".json")) continue;
    const entity = JSON.parse(
      await fs.readFile(path.join(base, category, file), "utf8"),
    );
    entities.push({
      ...entity,
      category: category === "traps" ? "trap" : category,
    });
  }
}
const wall = JSON.parse(
  await fs.readFile(path.join(base, "walls/wall.json"), "utf8"),
);
const halls = [];
for (let th = 1; th <= 18; th++) {
  const buildings = [];
  for (const e of entities) {
    const availability = e.availablePerTownHall?.find(
      (a) => a.townHallLevel === th,
    );
    const count =
      e.id === "town-hall"
        ? 1
        : (availability?.countAfterMerges ?? availability?.count ?? 0);
    if (!count) continue;
    const eligible = e.levels?.filter((l) =>
      e.id === "town-hall" ? l.level === th : l.townHallRequired <= th,
    );
    const level = eligible?.sort((a, b) => b.level - a.level)[0];
    // The ruined Clan Castle appears in inventory before it is rebuildable.
    if (e.levels && !level) continue;
    const source = level?.images?.normal ?? e.images?.empty ?? e.images?.normal;
    if (!source) throw new Error(`Missing image: ${e.id} TH${th}`);
    const size = e.size?.split("x").map(Number) ?? [1, 1];
    buildings.push({
      id: e.id,
      name: names[e.id] ?? e.name,
      englishName: e.name,
      count,
      level: level?.level ?? 1,
      width: size[0],
      height: size[1],
      category: e.category,
      image: sprite(source, `${e.id}-${level?.level ?? 1}`),
      optional: e.id === "bobs-hut",
    });
  }
  const wallLevel = wall.levels
    .filter((l) => l.townHallRequired <= th)
    .sort((a, b) => b.level - a.level)[0];
  halls.push({
    level: th,
    walls: wallLimits[th - 1],
    wallLevel: wallLevel?.level ?? 0,
    wallImage: wallLevel
      ? sprite(wallLevel.images.normal, `wall-${wallLevel.level}`)
      : null,
    image: buildings.find((b) => b.id === "town-hall").image,
    buildings,
  });
}
const queue = [...jobs.values()];
for (let i = 0; i < queue.length; i += 12)
  await Promise.all(queue.slice(i, i + 12).map((job) => job()));
await fs.writeFile(
  path.join(output, "game-data.json"),
  JSON.stringify({
    version: 1,
    checkedAt: "2026-10-05",
    gridSize: 44,
    source: "clash-of-clans-data@0.18.1",
    halls,
  }),
);
await fs.writeFile(
  path.join(output, "sprites/PROVENANCE.md"),
  "Existing Clash of Clans assets from clash-of-clans-data 0.18.1. Cropped transparent margins and resized to 192px for web delivery. Source: https://github.com/chiefpansancolt/clash-of-clans-data. No new artwork generated.\n",
);
console.log(
  `Prepared ${halls.length} Town Halls and ${jobs.size} optimized sprites.`,
);
