import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generated = path.join(root, 'release', 'generated');
const testFiles = [
  'scripts/test-session.mjs',
  'scripts/test-saves.mjs',
  'scripts/test-t5-save-compat.mjs',
  'scripts/test-t51-content-migration.mjs',
  'scripts/test-t51-content-lineage.mjs',
  'scripts/test-t51-offer-bridge.mjs',
  'scripts/test-t51-offer-bridge-provenance.mjs',
  'scripts/test-t51-t511b-eur.mjs',
  'scripts/test-t52-seed-origin-migration.mjs',
  'scripts/test-t53-reconciliation.mjs'
];
const missing = testFiles.filter(file => !fs.existsSync(path.join(root, file)));
const report = {
  schemaVersion: 1,
  status: 'FAIL',
  scope: 'AUTOMATED_SAVE_AND_MIGRATION_PREREQUISITES_ONLY',
  physicalUpgradeEvidence: 'AWAITING_PHYSICAL_EVIDENCE',
  tests: testFiles,
  missing,
  exitCode: null
};
fs.mkdirSync(generated, { recursive: true });
if (!missing.length) {
  const result = spawnSync(process.execPath, ['--test', ...testFiles], { cwd: root, stdio: 'inherit' });
  report.exitCode = result.status;
  report.status = !result.error && result.status === 0 ? 'PASS_AUTOMATED' : 'FAIL';
  if (result.error) report.error = result.error.message;
}
fs.writeFileSync(path.join(generated, 'upgrade-check.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
if (report.status !== 'PASS_AUTOMATED') process.exitCode = 1;
