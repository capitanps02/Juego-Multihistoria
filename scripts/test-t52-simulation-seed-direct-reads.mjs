import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  auditDirectSimulationSeedReads,
  directSeedIdentityReadsFromSource
} from './audit-t52-simulation-seed-direct-reads.mjs';

test('direct seed identity scanner detects positive equality forms and ignores inequality/plain literals', () => {
  const source = `
    state.seeds.some(seed => seed.id === "SEED_DIRECT_A");
    state.seeds.some(seed => 'SEED_DIRECT_B' == seed.id);
    current?.id === 'SEED_DIRECT_C';
    selectedSeedId === "SEED_DIRECT_D";
    seedId == "SEED_DIRECT_E";
    "SEED_DIRECT_F" === selectedSeedID;
    seed.id !== "SEED_NEGATIVE_ONLY";
    seedId !== "SEED_NEGATIVE_VARIABLE";
    const label = "SEED_PLAIN_LITERAL";
    state.flags.HAS_SEED_FLAG_ONLY;
  `;
  assert.deepEqual(directSeedIdentityReadsFromSource(source), [
    'SEED_DIRECT_A',
    'SEED_DIRECT_B',
    'SEED_DIRECT_C',
    'SEED_DIRECT_D',
    'SEED_DIRECT_E',
    'SEED_DIRECT_F'
  ]);
});

test('direct seed identity audit fails closed for an unregistered file+seed pair', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 't52-direct-seed-'));
  try {
    fs.writeFileSync(
      path.join(dir, 'synthetic.ts'),
      `export const x = state.seeds.some(seed => seed.id === "SEED_DIRECT_UNREGISTERED");\n`
    );
    const report = auditDirectSimulationSeedReads([], dir, []);
    assert.equal(report.pass, false);
    assert.deepEqual(report.unregisteredUses, [{
      file: path.relative(process.cwd(), path.join(dir, 'synthetic.ts')).replaceAll(path.sep, '/'),
      seedId: 'SEED_DIRECT_UNREGISTERED'
    }]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('direct seed identity audit accepts an explicitly registered live-presence pair', () => {
  const dir = fs.mkdtempSync(path.join(process.cwd(), 'tmp-t52-direct-seed-'));
  try {
    const file = path.join(dir, 'synthetic.ts');
    fs.writeFileSync(file, `export const x = state.seeds.some(seed => seed.id === "SEED_DIRECT_REGISTERED");\n`);
    const relative = path.relative(process.cwd(), file).replaceAll(path.sep, '/');
    const report = auditDirectSimulationSeedReads([{
      file: relative,
      seedId: 'SEED_DIRECT_REGISTERED',
      ageWindow: [23, 23],
      surface: 'synthetic-live',
      rationale: 'Synthetic explicit live-presence registration for the audit regression.'
    }], dir, []);
    assert.equal(report.pass, true, JSON.stringify(report.unregisteredUses));
    assert.equal(report.liveRegisteredDirectUses.length, 1);
    assert.equal(report.historicalRegisteredUses.length, 0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('direct seed identity audit accepts persisted-history evidence without promoting it to live presence', () => {
  const dir = fs.mkdtempSync(path.join(process.cwd(), 'tmp-t52-historical-seed-'));
  try {
    const file = path.join(dir, 'historical.ts');
    fs.writeFileSync(file, `export const x = state.seeds.some(seed => seed.id === "SEED_HISTORY");\n`);
    const relative = path.relative(process.cwd(), file).replaceAll(path.sep, '/');
    const report = auditDirectSimulationSeedReads([], dir, [{
      file: relative,
      seedId: 'SEED_HISTORY',
      ageWindow: [23, null],
      surface: 'historical-provenance',
      rationale: 'Persisted instance existence is historical evidence even after live lifecycle closure.'
    }]);
    assert.equal(report.pass, true, JSON.stringify(report));
    assert.equal(report.liveRegisteredDirectUses.length, 0);
    assert.deepEqual(report.historicalRegisteredUses, [{
      file: relative,
      seedId: 'SEED_HISTORY',
      ageWindow: [23, null],
      surface: 'historical-provenance'
    }]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('direct seed identity audit rejects a pair classified as both live and historical', () => {
  const dir = fs.mkdtempSync(path.join(process.cwd(), 'tmp-t52-ambiguous-seed-'));
  try {
    const file = path.join(dir, 'ambiguous.ts');
    fs.writeFileSync(file, `export const x = state.seeds.some(seed => seed.id === "SEED_AMBIGUOUS");\n`);
    const relative = path.relative(process.cwd(), file).replaceAll(path.sep, '/');
    const row = {
      file: relative,
      seedId: 'SEED_AMBIGUOUS',
      ageWindow: [23, 25],
      surface: 'ambiguous',
      rationale: 'Synthetic ambiguity regression.'
    };
    const report = auditDirectSimulationSeedReads([row], dir, [row]);
    assert.equal(report.pass, false);
    assert.deepEqual(report.ambiguousRegistrations, [`${relative}:SEED_AMBIGUOUS`]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('historical registry fails closed for stale or structurally invalid evidence rows', () => {
  const dir = fs.mkdtempSync(path.join(process.cwd(), 'tmp-t52-invalid-history-'));
  try {
    fs.writeFileSync(path.join(dir, 'empty.ts'), 'export const x = 1;\n');
    const stale = {
      file: path.relative(process.cwd(), path.join(dir, 'empty.ts')).replaceAll(path.sep, '/'),
      seedId: 'SEED_STALE_HISTORY',
      ageWindow: [23, null],
      surface: 'stale',
      rationale: 'No matching direct read exists.'
    };
    const invalid = {
      ...stale,
      seedId: 'SEED_INVALID_HISTORY',
      ageWindow: [30, 23],
      surface: ''
    };
    const report = auditDirectSimulationSeedReads([], dir, [stale, invalid]);
    assert.equal(report.pass, false);
    assert.equal(report.staleHistoricalRegistrations.length, 2);
    assert.equal(report.invalidHistoricalRegistrations.length, 1);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('current main simulation sources contain no unregistered direct seed identity reads', () => {
  const report = auditDirectSimulationSeedReads();
  assert.equal(report.pass, true, JSON.stringify(report));
  assert.deepEqual(report.unregisteredUses, []);
  assert.deepEqual(report.ambiguousRegistrations, []);
});
