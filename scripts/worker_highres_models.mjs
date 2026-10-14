import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { processAndSaveImage } from './image_utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const statscellDir = path.join(rootDir, 'temp_statscell');

const HERO_NAMES = ['Barbarian_King', 'Archer_Queen', 'Grand_Warden', 'Royal_Champion', 'Battle_Machine'];
const SIEGE_NAMES = ['Wall_Wrecker', 'Battle_Blimp', 'Stone_Slammer', 'Siege_Barracks', 'Log_Launcher', 'Flame_Flinger', 'Battle_Drill'];

export async function processHighResModels() {
  console.log('[Subagent 6] Starting processing for High-Res 3D Models & Weapon Stars...');
  const start = Date.now();
  let count = 0;

  const baseOut = path.join(rootDir, 'assets/HighRes_Official_Renders_1080p+');

  // 1. Process 3D Troop Models
  const modelsDir = path.join(statscellDir, 'troops/models');
  if (fs.existsSync(modelsDir)) {
    const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.png'));
    for (const file of files) {
      const name = file.replace('.png', '');
      let category = 'Troops';
      if (HERO_NAMES.includes(name)) {
        category = 'Heroes';
      } else if (SIEGE_NAMES.includes(name)) {
        category = 'SiegeMachines';
      } else if (name.startsWith('Super_') || name.startsWith('Sneaky_') || name.startsWith('Rocket_') || name.startsWith('Inferno_Dragon') || name.startsWith('Ice_Hound')) {
        category = 'SuperTroops';
      }

      const inPath = path.join(modelsDir, file);
      const outPath = path.join(baseOut, category, `${name}_3D_Render.png`);
      await processAndSaveImage(inPath, outPath, 1080);
      count++;
    }
  }

  // 2. Process Town Hall Weapon Stars
  const thDir = path.join(statscellDir, 'townhalls');
  if (fs.existsSync(thDir)) {
    const files = fs.readdirSync(thDir).filter(f => f.endsWith('.png'));
    for (const file of files) {
      const name = file.replace('.png', '');
      // E.g. 12.1.png -> Town_Hall_12_Star_1.png
      let outName = `Town_Hall_${name}.png`;
      if (name.includes('.')) {
        const parts = name.split('.');
        outName = `Town_Hall_${parts[0]}_Star_${parts[1]}.png`;
      }

      const inPath = path.join(thDir, file);
      const outPath = path.join(baseOut, 'TownHalls_WeaponStars', outName);
      await processAndSaveImage(inPath, outPath, 1080);
      count++;
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`[Subagent 6] Completed in ${duration}s. Processed ${count} high-resolution models & renders.`);
  return count;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  processHighResModels()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[Subagent 6] Fatal error:', err);
      process.exit(1);
    });
}
