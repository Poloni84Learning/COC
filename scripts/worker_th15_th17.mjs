import { processTownHallRange } from './worker_core.mjs';

console.log('[Subagent 5] Starting processing for TH15 to TH17...');
const start = Date.now();
processTownHallRange(15, 17, (th, count) => {
  console.log(`[Subagent 5] Finished TH${th} (Accumulated: ${count} assets)`);
}).then(results => {
  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`[Subagent 5] Completed in ${duration}s. Total assets: ${results.processedCount}, Errors: ${results.errors.length}`);
  if (results.errors.length > 0) console.error(results.errors);
  process.exit(results.errors.length > 0 ? 1 : 0);
}).catch(err => {
  console.error('[Subagent 5] Fatal error:', err);
  process.exit(1);
});
