import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { processAndSaveImage } from './image_utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const CATEGORY_FOLDER_MAP = {
  townHall: 'TownHall',
  defenses: 'Defenses',
  craftedDefenses: 'CraftedDefenses',
  resources: 'Resources',
  army: 'Army',
  heroes: 'Heroes',
  pets: 'Pets',
  heroEquipment: 'HeroEquipment',
  troops: 'Troops',
  spells: 'Spells',
  siegeMachines: 'SiegeMachines',
  traps: 'Traps',
  walls: 'Walls'
};

export async function processTownHallRange(startTH, endTH, onProgress) {
  const manifestPath = path.join(rootDir, 'data/assets_manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error('Manifest not found. Run catalog_builder.mjs first.');
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const results = {
    processedCount: 0,
    errors: [],
    details: []
  };

  for (let th = startTH; th <= endTH; th++) {
    const entry = manifest[th];
    if (!entry) continue;

    const thFolderName = `TH${String(th).padStart(2, '0')}`;
    const thBaseDir = path.join(rootDir, 'assets', thFolderName);

    for (const [catKey, folderName] of Object.entries(CATEGORY_FOLDER_MAP)) {
      const items = entry[catKey];
      if (!items || !Array.isArray(items) || items.length === 0) continue;

      const targetDir = path.join(thBaseDir, folderName);

      for (const item of items) {
        if (!item.sourcePath || !fs.existsSync(item.sourcePath)) {
          // If source image doesn't exist, log warning
          results.errors.push({
            th,
            category: folderName,
            name: item.name,
            error: `Source image missing: ${item.sourcePath}`
          });
          continue;
        }

        const safeName = item.name.replace(/[^a-zA-Z0-9]/g, '_');
        const lvlSuffix = item.level !== undefined ? `_Lvl_${String(item.level).padStart(2, '0')}` : '';
        const outFileName = `${safeName}${lvlSuffix}.png`;
        const destPath = path.join(targetDir, outFileName);

        try {
          const res = await processAndSaveImage(item.sourcePath, destPath, 1080);
          results.processedCount++;
          results.details.push({
            th,
            category: folderName,
            name: item.name,
            level: item.level,
            dimensions: `${res.exported.width}x${res.exported.height}`,
            path: path.relative(rootDir, destPath)
          });
        } catch (err) {
          results.errors.push({
            th,
            category: folderName,
            name: item.name,
            error: err.message
          });
        }
      }
    }

    if (onProgress) {
      onProgress(th, results.processedCount);
    }
  }

  return results;
}
