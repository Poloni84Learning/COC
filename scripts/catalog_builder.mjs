import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const baseDataDir = path.join(rootDir, 'node_modules/clash-of-clans-data/data/home');
const baseImagesDir = path.join(rootDir, 'node_modules/clash-of-clans-data');

// Hero unlock mapping by Town Hall
const HERO_TH_UNLOCK = {
  'barbarian-king': 7,
  'archer-queen': 9,
  'grand-warden': 11,
  'royal-champion': 13,
  'minion-prince': 17
};

// Pet unlock mapping by Town Hall
const PET_TH_UNLOCK = {
  'l.a.s.s.i': 14,
  'electro-owl': 14,
  'mighty-yak': 14,
  'unicorn': 14,
  'frosty': 15,
  'diggy': 15,
  'poison-lizard': 15,
  'phoenix': 15,
  'spirit-fox': 16,
  'angry-jelly': 16,
  'sneezy': 17
};

// Blacksmith level to TH mapping for Hero Equipment
const BLACKSMITH_TH_MAP = {
  1: 8,
  2: 9,
  3: 10,
  4: 11,
  5: 12,
  6: 13,
  7: 14,
  8: 15,
  9: 16,
  10: 17
};

export function buildCatalog() {
  const catalog = {};
  for (let th = 1; th <= 17; th++) {
    catalog[th] = {
      townHallLevel: th,
      townHall: [],
      defenses: [],
      craftedDefenses: [],
      resources: [],
      army: [],
      heroes: [],
      heroEquipment: [],
      pets: [],
      troops: [],
      spells: [],
      siegeMachines: [],
      traps: [],
      walls: []
    };
  }

  // Helper to read and map category entities
  function processCategory(catName, targetListKey) {
    const dir = path.join(baseDataDir, catName);
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (!data.levels || !Array.isArray(data.levels)) continue;

      for (const lvl of data.levels) {
        let th = lvl.townHallRequired;
        if (catName === 'town-hall') {
          th = lvl.level;
        }

        if (th && th >= 1 && th <= 17) {
          // Extract image paths
          let imgPath = null;
          if (lvl.images) {
            imgPath = lvl.images.normal || lvl.images.icon || Object.values(lvl.images)[0];
          }

          if (imgPath) {
            catalog[th][targetListKey].push({
              id: data.id || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              name: data.name,
              level: lvl.level,
              sourcePath: path.join(baseImagesDir, imgPath),
              relativeSource: imgPath
            });
          }
        }
      }
    }
  }

  // 1. Town Hall
  processCategory('town-hall', 'townHall');

  // 2. Defenses & Crafted Defenses
  processCategory('defenses', 'defenses');
  processCategory('crafted-defenses', 'craftedDefenses');

  // 3. Resources
  processCategory('resource-buildings', 'resources');

  // 4. Army Buildings
  processCategory('army-buildings', 'army');

  // 5. Traps
  processCategory('traps', 'traps');

  // 6. Troops
  processCategory('troops', 'troops');

  // 7. Spells
  processCategory('spells', 'spells');

  // 8. Siege Machines
  processCategory('siege-machines', 'siegeMachines');

  // 9. Walls
  processCategory('walls', 'walls');

  // 10. Heroes
  const heroesDir = path.join(baseDataDir, 'heroes');
  if (fs.existsSync(heroesDir)) {
    const hFiles = fs.readdirSync(heroesDir).filter(f => f.endsWith('.json'));
    for (const f of hFiles) {
      const hData = JSON.parse(fs.readFileSync(path.join(heroesDir, f), 'utf8'));
      const slug = f.replace('.json', '');
      const unlockTH = HERO_TH_UNLOCK[slug];
      if (unlockTH && unlockTH <= 17) {
        let img = null;
        if (hData.images) {
          img = hData.images.icon || hData.images.normal || Object.values(hData.images)[0];
        }
        catalog[unlockTH].heroes.push({
          id: slug,
          name: hData.name,
          sourcePath: img ? path.join(baseImagesDir, img) : null,
          relativeSource: img
        });
      }
    }
  }

  // 11. Pets
  const petsDir = path.join(baseDataDir, 'pets');
  if (fs.existsSync(petsDir)) {
    const pFiles = fs.readdirSync(petsDir).filter(f => f.endsWith('.json'));
    for (const f of pFiles) {
      const pData = JSON.parse(fs.readFileSync(path.join(petsDir, f), 'utf8'));
      const slug = f.replace('.json', '');
      const unlockTH = PET_TH_UNLOCK[slug];
      if (unlockTH && unlockTH <= 17) {
        let img = null;
        if (pData.images) {
          img = pData.images.icon || pData.images.normal || Object.values(pData.images)[0];
        }
        catalog[unlockTH].pets.push({
          id: slug,
          name: pData.name,
          sourcePath: img ? path.join(baseImagesDir, img) : null,
          relativeSource: img
        });
      }
    }
  }

  // 12. Hero Equipment
  const eqDir = path.join(baseDataDir, 'hero-equipment');
  if (fs.existsSync(eqDir)) {
    const eqFiles = fs.readdirSync(eqDir).filter(f => f.endsWith('.json'));
    for (const f of eqFiles) {
      const eqData = JSON.parse(fs.readFileSync(path.join(eqDir, f), 'utf8'));
      if (eqData.levels && eqData.levels[0]) {
        const bsLvl = eqData.levels[0].blacksmithLevelRequired || 1;
        const thReq = BLACKSMITH_TH_MAP[bsLvl] || 8;
        if (thReq <= 17) {
          let img = null;
          if (eqData.images) {
            img = eqData.images.icon || eqData.images.normal || Object.values(eqData.images)[0];
          }
          catalog[thReq].heroEquipment.push({
            id: f.replace('.json', ''),
            name: eqData.name,
            hero: eqData.hero,
            sourcePath: img ? path.join(baseImagesDir, img) : null,
            relativeSource: img
          });
        }
      }
    }
  }

  return catalog;
}

export function generateMarkdownCatalog(catalog) {
  let md = `# Danh sách Asset Clash of Clans Theo Từng Cấp Độ Nhà Chính (TH1 - TH17)\n`;
  md += `*(Comprehensive Clash of Clans Asset Catalog by Town Hall Level)*\n\n`;
  md += `> Toàn bộ asset được trích xuất nguyên bản từ cơ sở dữ liệu game Supercell, đảm bảo **100% không dính watermark**, hình ảnh trong suốt PNG, và được nâng cấp lên **chất lượng tối thiểu 1080p**.\n\n`;
  md += `| Cấp Nhà Chính (Town Hall) | Tổng số Asset | Điểm nhấn Nổi bật (Highlights) |\n`;
  md += `| :--- | :--- | :--- |\n`;

  for (let th = 1; th <= 17; th++) {
    const entry = catalog[th];
    let total = 0;
    for (const k of Object.keys(entry)) {
      if (Array.isArray(entry[k])) total += entry[k].length;
    }

    const highlights = [];
    if (entry.townHall.length > 0) highlights.push(`Nhà chính TH${th}`);
    if (entry.heroes.length > 0) highlights.push(`Tướng: ${entry.heroes.map(h => h.name).join(', ')}`);
    if (entry.pets.length > 0) highlights.push(`Thú: ${entry.pets.map(p => p.name).join(', ')}`);
    if (entry.craftedDefenses.length > 0) highlights.push(`Phòng thủ ghép: ${entry.craftedDefenses.map(d => d.name).join(', ')}`);
    if (entry.siegeMachines.length > 0) highlights.push(`Máy công thành (${entry.siegeMachines.length})`);

    md += `| **TH ${th}** | **${total} assets** | ${highlights.slice(0, 3).join(' • ') || 'Mở rộng nâng cấp công trình & lính'} |\n`;
  }

  md += `\n---\n\n`;

  for (let th = 1; th <= 17; th++) {
    const entry = catalog[th];
    md += `## Town Hall ${th} (Nhà Chính Cấp ${th})\n\n`;

    const sections = [
      { key: 'townHall', title: '🏛️ Nhà chính (Town Hall)' },
      { key: 'defenses', title: '🛡️ Công trình phòng thủ (Defenses)' },
      { key: 'craftedDefenses', title: '⚔️ Phòng thủ ghép (Crafted Defenses)' },
      { key: 'resources', title: '💰 Tài nguyên (Resource Buildings)' },
      { key: 'army', title: '⛺ Quân đội (Army Buildings)' },
      { key: 'heroes', title: '👑 Tướng (Heroes)' },
      { key: 'pets', title: '🐾 Thú cưng (Pets)' },
      { key: 'heroEquipment', title: '🔮 Trang bị tướng (Hero Equipment)' },
      { key: 'troops', title: '🗡️ Lính (Troops)' },
      { key: 'spells', title: '🧪 Phép thuật (Spells)' },
      { key: 'siegeMachines', title: '🪵 Máy công thành (Siege Machines)' },
      { key: 'traps', title: '💣 Bẫy (Traps)' },
      { key: 'walls', title: '🧱 Tường thành (Walls)' }
    ];

    for (const sec of sections) {
      const items = entry[sec.key];
      if (items && items.length > 0) {
        md += `### ${sec.title} (${items.length})\n`;
        md += `| Tên Asset | Cấp độ (Level) | File Xuất (Output) |\n`;
        md += `| :--- | :--- | :--- |\n`;
        for (const item of items) {
          const lvlStr = item.level !== undefined ? `Level ${item.level}` : 'Mở khóa (Unlock)';
          const safeName = item.name.replace(/[^a-zA-Z0-9]/g, '_');
          const fileName = `${safeName}_${item.level !== undefined ? 'Lvl_' + String(item.level).padStart(2, '0') : 'Base'}.png`;
          md += `| ${item.name} | ${lvlStr} | \`${fileName}\` |\n`;
        }
        md += `\n`;
      }
    }

    md += `---\n\n`;
  }

  return md;
}

// If run directly:
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const catalog = buildCatalog();
  const manifestPath = path.join(rootDir, 'data/assets_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`Saved manifest to ${manifestPath}`);

  const md = generateMarkdownCatalog(catalog);
  const mdPath = path.join(rootDir, 'COC_ASSETS_BY_TOWN_HALL.md');
  fs.writeFileSync(mdPath, md, 'utf8');
  console.log(`Saved markdown catalog to ${mdPath}`);
}
