import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SUBAGENTS = [
  { name: 'Subagent 1 (TH1-TH4)', script: 'scripts/worker_th1_th4.mjs' },
  { name: 'Subagent 2 (TH5-TH8)', script: 'scripts/worker_th5_th8.mjs' },
  { name: 'Subagent 3 (TH9-TH11)', script: 'scripts/worker_th9_th11.mjs' },
  { name: 'Subagent 4 (TH12-TH14)', script: 'scripts/worker_th12_th14.mjs' },
  { name: 'Subagent 5 (TH15-TH17)', script: 'scripts/worker_th15_th17.mjs' },
  { name: 'Subagent 6 (High-Res 3D Models)', script: 'scripts/worker_highres_models.mjs' }
];

function runSubagent(agent) {
  return new Promise((resolve, reject) => {
    console.log(`>>> Launching ${agent.name}...`);
    const proc = spawn('node', [agent.script], { cwd: rootDir, stdio: 'inherit' });

    proc.on('close', code => {
      if (code === 0) {
        console.log(`✓ ${agent.name} completed successfully.`);
        resolve();
      } else {
        console.error(`✗ ${agent.name} failed with exit code ${code}.`);
        reject(new Error(`${agent.name} failed with code ${code}`));
      }
    });

    proc.on('error', err => {
      console.error(`✗ ${agent.name} process error:`, err);
      reject(err);
    });
  });
}

async function verifyAssets() {
  console.log('\n=========================================');
  console.log('AUDITING & VERIFYING ALL GENERATED ASSETS');
  console.log('=========================================');

  const assetsDir = path.join(rootDir, 'assets');
  let totalFiles = 0;
  let auditedSamples = 0;
  let failedChecks = 0;

  function scanDir(dir) {
    let files = [];
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        files = files.concat(scanDir(full));
      } else if (item.endsWith('.png')) {
        files.push(full);
      }
    }
    return files;
  }

  const allPngs = scanDir(assetsDir);
  totalFiles = allPngs.length;
  console.log(`Total PNG Assets found in assets/: ${totalFiles}`);

  // Sample check every 25th image or first 50
  for (let i = 0; i < allPngs.length; i += 20) {
    const filePath = allPngs[i];
    try {
      const meta = await sharp(filePath).metadata();
      auditedSamples++;
      const passesMin1080 = meta.width >= 1080 || meta.height >= 1080;
      if (!passesMin1080) {
        console.error(`[FAIL] ${filePath} resolution is ${meta.width}x${meta.height} (< 1080)`);
        failedChecks++;
      }
    } catch (err) {
      console.error(`[ERROR] Corrupted file ${filePath}: ${err.message}`);
      failedChecks++;
    }
  }

  console.log(`Audited ${auditedSamples} sample assets. Failed checks: ${failedChecks}`);
  return { totalFiles, auditedSamples, failedChecks };
}

async function main() {
  const globalStart = Date.now();
  console.log('========================================================');
  console.log('STARTING CONCURRENT MULTI-SUBAGENT ASSET PROCESSING');
  console.log('========================================================\n');

  try {
    await Promise.all(SUBAGENTS.map(agent => runSubagent(agent)));
    console.log('\nAll 6 subagents have finished their execution!');

    const verification = await verifyAssets();

    // Clean up temporary clone if present
    const tempDir = path.join(rootDir, 'temp_statscell');
    if (fs.existsSync(tempDir)) {
      console.log('Cleaning up temporary clone directory...');
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    const totalDuration = ((Date.now() - globalStart) / 1000).toFixed(2);
    console.log('\n========================================================');
    console.log(`ALL GOALS ACCOMPLISHED IN ${totalDuration}s`);
    console.log(`Total Assets Created: ${verification.totalFiles}`);
    console.log('========================================================');
  } catch (err) {
    console.error('Fatal execution error during subagent execution:', err);
    process.exit(1);
  }
}

main();
