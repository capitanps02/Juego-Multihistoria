import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { migrationSourceCoverage } from './t51-migration-source-policy.mjs';
import { sourceRecordFromFixture, renderRegistry } from './generate-t51-post-legacy-registry.mjs';

const PRE = 'pre';
const A = 'catalog-a';
const B = 'catalog-b';
const route = (sourceContentIdentity, targetContentIdentity) => ({ sourceContentIdentity, targetContentIdentity });
const sha256 = value => createHash('sha256').update(value).digest('hex');

function fixtureEvent(id = 'EVT_SOURCE_001') {
  return {
    id,
    ageWindow: [18, 18],
    phase: '18_20',
    family: 'career',
    gates: [],
    choices: [{ id: 'A', label: 'Elegir', intentTags: [], outcomeIds: ['A_OUT'] }],
    outcomes: [{ id: 'A_OUT', baseWeight: 1, effects: [], messages: ['ok'] }],
    text: { title: 'Source fixture', body: 'Fixture' },
    intel: { visible: [], uncertain: [] }
  };
}

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

test('post-content source fixture produces deterministic fingerprint and journal evidence', () => {
  const events = [fixtureEvent()];
  const identity = sha256(JSON.stringify(events));
  const record = sourceRecordFromFixture({
    contentIdentity: identity,
    engineBuild: 'test-build',
    sessionVersions: [3],
    events
  }, `${identity}.json`);

  assert.equal(record.contentIdentity, identity);
  assert.equal(record.events.EVT_SOURCE_001.fingerprint, sha256(JSON.stringify(events[0])));
  assert.equal(
    record.events.EVT_SOURCE_001.journalDigests.A.A_OUT,
    sha256(JSON.stringify(['Source fixture', 'Elegir', ['ok']]))
  );
  assert.equal(renderRegistry({ [identity]: record }), renderRegistry({ [identity]: record }));
});

test('post-content source fixture rejects declared identity drift', () => {
  const events = [fixtureEvent('EVT_SOURCE_TAMPER')];
  assert.throws(() => sourceRecordFromFixture({
    contentIdentity: 'not-the-real-identity',
    engineBuild: 'test-build',
    sessionVersions: [3],
    events
  }, 'tampered.json'), /identity mismatch/);
});
