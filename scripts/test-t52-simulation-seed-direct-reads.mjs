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
    seed.id !== "SEED_NEGATIVE_ONLY";
    const label = "SEED_PLAIN_LITERAL";
    state.flags.HAS_SEED_FLAG_ONLY;
  `;
  assert.deepEqual(directSeedIdentityReadsFromSource(source), [
    'SEED_DIRECT_A',
    'SEED_DIRECT_B',
    'SEED_DIRECT_C',
    'SEED_DIRECT_D'
  ]);
});

test('direct seed identity audit fails closed for an unregistered file+seed pair', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 't52-direct-seed-'));
  try {
    fs.writeFileSync(
      path.join(dir, 'synthetic.ts'),
      `export const x = state.seeds.some(seed => seed.id === "SEED_DIRECT_UNREGISTERED");\n`
    );
    const report = auditDirectSimulationSeedReads([], dir);
    assert.equal(report.pass, false);
    assert.deepEqual(report.unregisteredUses, [{
      file: path.relative(process.cwd(), path.join(dir, 'synthetic.ts')).replaceAll(path.sep, '/'),
      seedId: 'SEED_DIRECT_UNREGISTERED'
    }]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('direct seed identity audit accepts an explicitly registered file+seed pair', () => {
  const dir = fs.mkdtempSync(path.join(process.cwd(), 'tmp-t52-direct-seed-'));
  try {
    const file = path.join(dir, 'synthetic.ts');
    fs.writeFileSync(file, `export const x = state.seeds.some(seed => seed.id === "SEED_DIRECT_REGISTERED");\n`);
    const relative = path.relative(process.cwd(), file).replaceAll(path.sep, '/');
    const report = auditDirectSimulationSeedReads([{
      file: relative,
      seedId: 'SEED_DIRECT_REGISTERED',
      ageWindow: [23, 23],
      surface: 'synthetic',
      rationale: 'Synthetic explicit registration for the audit regression.'
    }], dir);
    assert.equal(report.pass, true, JSON.stringify(report.unregisteredUses));
    assert.deepEqual(report.unregisteredUses, []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('current main simulation sources contain no unregistered direct seed identity reads', () => {
  const report = auditDirectSimulationSeedReads();
  assert.equal(report.pass, true, JSON.stringify(report.unregisteredUses));
});
