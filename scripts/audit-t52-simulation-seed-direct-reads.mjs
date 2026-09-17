import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED_CATALOG } from '../dist/catalog/seeds.js';
import { SIMULATION_SEED_CONSUMERS } from './t52-simulation-seed-consumers.mjs';
import { HISTORICAL_SEED_CONSUMERS } from './t52-historical-seed-consumers.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_KNOWN_SEED_IDS = new Set(SEED_CATALOG.map(seed => seed.id));

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
 * Extract positive direct seed-identity checks that bypass HAS_SEED_* flags.
 *
 * Deliberately narrow: equality against an object `.id` / `?.id` or a variable
 * named `seedId` / ending in `SeedId` is treated as a dependency on the named seed.
 * The registry decides whether that dependency means live presence or persisted history.
 * Inequality is not treated as a positive dependency.
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

function validHistoricalRegistration(row) {
  return (
    typeof row?.file === 'string' && row.file.length > 0 &&
    typeof row?.seedId === 'string' && /^SEED_[A-Z0-9_]+$/.test(row.seedId) &&
    Array.isArray(row?.ageWindow) && row.ageWindow.length === 2 &&
    typeof row.ageWindow[0] === 'number' &&
    (row.ageWindow[1] === null || typeof row.ageWindow[1] === 'number') &&
    (row.ageWindow[1] === null || row.ageWindow[0] <= row.ageWindow[1]) &&
    typeof row?.surface === 'string' && row.surface.length > 0 &&
    typeof row?.rationale === 'string' && row.rationale.length > 0
  );
}

export function auditDirectSimulationSeedReads(
  liveRegistry = SIMULATION_SEED_CONSUMERS,
  simulationDir = path.join(root, 'src/simulation'),
  historicalRegistry = HISTORICAL_SEED_CONSUMERS,
  knownSeedIds = DEFAULT_KNOWN_SEED_IDS
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
  const observedKeys = new Set(observedUses.map(key));
  const liveKeys = new Set(liveRegistry.map(key));
  const historicalKeys = new Set(historicalRegistry.map(key));
  const registeredKeys = new Set([...liveKeys, ...historicalKeys]);
  const knownSeedIdSet = knownSeedIds instanceof Set ? knownSeedIds : new Set(knownSeedIds ?? []);

  const ambiguousRegistrations = [...liveKeys]
    .filter(value => historicalKeys.has(value))
    .sort();
  const staleHistoricalRegistrations = historicalRegistry
    .filter(row => !observedKeys.has(key(row)))
    .map(row => ({ file: row.file, seedId: row.seedId, surface: row.surface }));
  const invalidHistoricalRegistrations = historicalRegistry
    .filter(row => !validHistoricalRegistration(row))
    .map(row => ({
      file: row?.file ?? null,
      seedId: row?.seedId ?? null,
      ageWindow: row?.ageWindow ?? null,
      surface: row?.surface ?? null
    }));
  const unknownHistoricalSeedIds = historicalRegistry
    .filter(row => (
      typeof row?.seedId === 'string' &&
      /^SEED_[A-Z0-9_]+$/.test(row.seedId) &&
      !knownSeedIdSet.has(row.seedId)
    ))
    .map(row => ({
      file: row.file,
      seedId: row.seedId,
      surface: row.surface
    }));
  const duplicateHistoricalRegistrations = [...historicalRegistry.reduce((counts, row) => {
    const value = key(row);
    counts.set(value, (counts.get(value) ?? 0) + 1);
    return counts;
  }, new Map()).entries()]
    .filter(([, count]) => count > 1)
    .map(([value, count]) => ({ key: value, count }));
  const unregisteredUses = observedUses.filter(row => !registeredKeys.has(key(row)));

  const pass = (
    unregisteredUses.length === 0 &&
    ambiguousRegistrations.length === 0 &&
    staleHistoricalRegistrations.length === 0 &&
    invalidHistoricalRegistrations.length === 0 &&
    unknownHistoricalSeedIds.length === 0 &&
    duplicateHistoricalRegistrations.length === 0
  );

  return {
    observedUses,
    liveRegisteredDirectUses: observedUses.filter(row => liveKeys.has(key(row))),
    historicalRegisteredUses: historicalRegistry.map(row => ({
      file: row.file,
      seedId: row.seedId,
      ageWindow: row.ageWindow,
      surface: row.surface
    })),
    unregisteredUses,
    ambiguousRegistrations,
    staleHistoricalRegistrations,
    invalidHistoricalRegistrations,
    unknownHistoricalSeedIds,
    duplicateHistoricalRegistrations,
    pass
  };
}

function main() {
  const report = auditDirectSimulationSeedReads();
  console.log(JSON.stringify({
    task: 'T5.2 direct simulation seed identity read ratchet',
    observedDirectIdentityReads: report.observedUses.length,
    liveRegisteredDirectIdentityReads: report.liveRegisteredDirectUses.length,
    historicalRegisteredIdentityReads: report.historicalRegisteredUses.length,
    unregisteredDirectIdentityReads: report.unregisteredUses,
    ambiguousRegistrations: report.ambiguousRegistrations,
    staleHistoricalRegistrations: report.staleHistoricalRegistrations,
    invalidHistoricalRegistrations: report.invalidHistoricalRegistrations,
    unknownHistoricalSeedIds: report.unknownHistoricalSeedIds,
    duplicateHistoricalRegistrations: report.duplicateHistoricalRegistrations,
    pass: report.pass
  }, null, 2));
  if (!report.pass) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
