import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SIMULATION_SEED_CONSUMERS } from './t52-simulation-seed-consumers.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function walkTsFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTsFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

/**
 * Extract positive direct seed-presence checks that bypass HAS_SEED_* flags.
 *
 * Deliberately narrow: equality against an object `.id` / `?.id` or a variable
 * named `seedId` / ending in `SeedId` is treated as a positive presence read.
 * Inequality is not, because it does not prove dependence on the named seed being present.
 */
export function directSeedIdentityReadsFromSource(source) {
  const ids = new Set();
  const objectId = String.raw`(?:[A-Za-z_$][\w$]*(?:\?\.|\.))+id`;
  const seedIdVariable = String.raw`(?:seed[Ii][Dd]|[A-Za-z_$][\w$]*Seed[Ii][Dd])`;
  const lhs = `(?:${objectId}|${seedIdVariable})`;

  const forward = new RegExp(String.raw`\b${lhs}\s*={2,3}\s*['"](SEED_[A-Z0-9_]+)['"]`, 'g');
  const reverse = new RegExp(String.raw`['"](SEED_[A-Z0-9_]+)['"]\s*={2,3}\s*\b${lhs}`, 'g');

  for (const match of source.matchAll(forward)) ids.add(match[1]);
  for (const match of source.matchAll(reverse)) ids.add(match[1]);
  return [...ids].sort();
}

export function auditDirectSimulationSeedReads(
  registry = SIMULATION_SEED_CONSUMERS,
  simulationDir = path.join(root, 'src/simulation')
) {
  const observedUses = [];
  for (const file of walkTsFiles(simulationDir)) {
    const relative = path.relative(root, file).replaceAll(path.sep, '/');
    const source = fs.readFileSync(file, 'utf8');
    for (const seedId of directSeedIdentityReadsFromSource(source)) {
      observedUses.push({ file: relative, seedId });
    }
  }

  const key = row => `${row.file}:${row.seedId}`;
  const registeredKeys = new Set(registry.map(key));
  const unregisteredUses = observedUses.filter(row => !registeredKeys.has(key(row)));

  return {
    observedUses,
    unregisteredUses,
    pass: unregisteredUses.length === 0
  };
}

function main() {
  const report = auditDirectSimulationSeedReads();
  console.log(JSON.stringify({
    task: 'T5.2 direct simulation seed identity read ratchet',
    observedDirectIdentityReads: report.observedUses.length,
    unregisteredDirectIdentityReads: report.unregisteredUses,
    pass: report.pass
  }, null, 2));
  if (!report.pass) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
