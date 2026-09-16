import test from 'node:test';
import assert from 'node:assert/strict';
import { migrationSourceCoverage } from './t51-migration-source-policy.mjs';

const PRE = 'pre';
const A = 'catalog-a';
const B = 'catalog-b';
const route = (sourceContentIdentity, targetContentIdentity) => ({ sourceContentIdentity, targetContentIdentity });

test('pre-T5.1 content does not require a post source fixture', () => {
  const report = migrationSourceCoverage({ currentIdentity: PRE, preIdentity: PRE, sourceIdentities: [PRE], routes: [] });
  assert.equal(report.ok, true);
  assert.deepEqual(report.missingCurrentSource, []);
  assert.deepEqual(report.missingRoutes, []);
});

test('first post-T5.1 catalog must register itself and PRE -> A', () => {
  const missingSource = migrationSourceCoverage({
    currentIdentity: A,
    preIdentity: PRE,
    sourceIdentities: [PRE],
    routes: [route(PRE, A)]
  });
  assert.equal(missingSource.ok, false);
  assert.deepEqual(missingSource.missingCurrentSource, [A]);

  const complete = migrationSourceCoverage({
    currentIdentity: A,
    preIdentity: PRE,
    sourceIdentities: [PRE, A],
    routes: [route(PRE, A)]
  });
  assert.equal(complete.ok, true);
});

test('second post-T5.1 catalog requires direct routes from every historical source', () => {
  const missingAtoB = migrationSourceCoverage({
    currentIdentity: B,
    preIdentity: PRE,
    sourceIdentities: [PRE, A, B],
    routes: [route(PRE, B)]
  });
  assert.equal(missingAtoB.ok, false);
  assert.deepEqual(missingAtoB.missingRoutes, [A]);

  const complete = migrationSourceCoverage({
    currentIdentity: B,
    preIdentity: PRE,
    sourceIdentities: [PRE, A, B],
    routes: [route(PRE, B), route(A, B)]
  });
  assert.equal(complete.ok, true);
  assert.deepEqual(complete.requiredSources, [A, PRE]);
});

test('unknown historical source is never silently accepted', () => {
  const report = migrationSourceCoverage({
    currentIdentity: B,
    preIdentity: PRE,
    sourceIdentities: [PRE, A, B, 'unknown-old'],
    routes: [route(PRE, B), route(A, B)]
  });
  assert.equal(report.ok, false);
  assert.deepEqual(report.missingRoutes, ['unknown-old']);
});
