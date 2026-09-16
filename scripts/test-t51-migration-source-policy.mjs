import test from 'node:test';
import assert from 'node:assert/strict';
import { migrationSourceCoverage } from './t51-migration-source-policy.mjs';

const PRE = 'PRE';
const B = 'B';
const C = 'C';

const edge = (sourceContentIdentity, targetContentIdentity) => ({ sourceContentIdentity, targetContentIdentity });

test('source policy: pre-T5.1 active catalog needs no post source', () => {
  const result = migrationSourceCoverage({ currentIdentity: PRE, preIdentity: PRE, sourceIdentities: [PRE], routes: [] });
  assert.equal(result.ok, true);
  assert.deepEqual(result.requiredSources, []);
});

test('source policy: first post-T5.1 catalog is frozen and reachable from PRE', () => {
  const result = migrationSourceCoverage({
    currentIdentity: B,
    preIdentity: PRE,
    sourceIdentities: [PRE, B],
    routes: [edge(PRE, B)]
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.missingCurrentSource, []);
  assert.deepEqual(result.missingPaths, []);
  assert.deepEqual(result.ambiguousPaths, []);
});

test('source policy: multigeneration lineage PRE -> B -> C needs no PRE -> C shortcut', () => {
  const result = migrationSourceCoverage({
    currentIdentity: C,
    preIdentity: PRE,
    sourceIdentities: [PRE, B, C],
    routes: [edge(PRE, B), edge(B, C)]
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.requiredSources, [B, PRE].sort());
});

test('source policy: active post-T5.1 catalog must be frozen before merge', () => {
  const result = migrationSourceCoverage({
    currentIdentity: C,
    preIdentity: PRE,
    sourceIdentities: [PRE, B],
    routes: [edge(PRE, B), edge(B, C)]
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.missingCurrentSource, [C]);
  assert.deepEqual(result.unknownRouteEndpoints, [C]);
});

test('source policy: every registered historical source needs a path to active content', () => {
  const result = migrationSourceCoverage({
    currentIdentity: C,
    preIdentity: PRE,
    sourceIdentities: [PRE, B, C],
    routes: [edge(PRE, B)]
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.missingPaths.sort(), [B, PRE].sort());
});

test('source policy: redundant PRE -> C shortcut makes PRE migration ambiguous and fails closed', () => {
  const result = migrationSourceCoverage({
    currentIdentity: C,
    preIdentity: PRE,
    sourceIdentities: [PRE, B, C],
    routes: [edge(PRE, B), edge(B, C), edge(PRE, C)]
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.ambiguousPaths, [PRE]);
});

test('source policy: every route endpoint must have frozen evidence', () => {
  const result = migrationSourceCoverage({
    currentIdentity: C,
    preIdentity: PRE,
    sourceIdentities: [PRE, C],
    routes: [edge(PRE, B), edge(B, C)]
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.unknownRouteEndpoints, [B]);
});
