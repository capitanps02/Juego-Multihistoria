import test from 'node:test';
import assert from 'node:assert/strict';
import { createDiagnostics } from './release-lib.mjs';

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const item of Object.values(value)) deepFreeze(item);
  return value;
}

const buildManifest = deepFreeze({
  gitSha: 'a'.repeat(40), sourceBranch: 'release/beta-readiness', engineBuild: '0.8.0-t2.5',
  contentIdentity: 'b'.repeat(64), saveSchema: 8, sessionSchema: 3, buildVariant: 'release-candidate',
  buildTimestamp: '2026-09-16T20:00:00.000Z', webBundleIdentity: 'c'.repeat(64), manifestIdentity: 'd'.repeat(64),
  android: { applicationId: 'com.multihistoria', versionCode: 1, versionName: '0.8.0' }
});
const snapshot = deepFreeze({
  sessionVersion: 3, build: '0.8.0-t2.5', contentIdentity: 'b'.repeat(64), sessionId: 'must-not-leak', revision: 12,
  pendingDecision: { instanceId: 'pending-secret-ish', event: { id: 'EVT_TEST' } },
  state: {
    schemaVersion: 8, age: 29, date: '2032-03-04', season: '2031-32', phase: '26_30', runtime: { day: 4400 },
    history: [{ eventId: 'EVT_PREV', choiceId: 'C1', outcomeId: 'O1' }],
    retirement: { status: 'playing' }, epilogue: { generated: false },
    rngState: {
      narrative: { seed: 1, state: 2, draws: 3 }, football: { seed: 4, state: 5, draws: 6 },
      microfeed: { seed: 7, state: 8, draws: 9 }, qa: { seed: 10, state: 11, draws: 12 }
    }
  }
});

test('diagnostics is serializable, non-mutating and does not use RNG', () => {
  const before = JSON.stringify(snapshot);
  const originalRandom = Math.random;
  Math.random = () => { throw new Error('diagnostics must not draw RNG'); };
  try {
    const result = createDiagnostics({ buildManifest, snapshot, generatedAt: '2026-09-16T20:01:00.000Z' });
    assert.doesNotThrow(() => JSON.stringify(result));
    assert.equal(JSON.stringify(snapshot), before);
    assert.equal(result.save.pendingEventId, 'EVT_TEST');
    assert.equal(result.save.lastEventId, 'EVT_PREV');
    assert.equal(result.save.rng.narrative.draws, 3);
    assert.equal(result.save.rng.narrative.state, undefined);
    assert.equal(result.privacy.containsSavePayload, false);
  } finally {
    Math.random = originalRandom;
  }
});

test('diagnostics excludes session id, journal text and raw RNG state', () => {
  const result = createDiagnostics({ buildManifest, snapshot, generatedAt: '2026-09-16T20:01:00.000Z' });
  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes('must-not-leak'), false);
  assert.equal(serialized.includes('pending-secret-ish'), false);
  assert.equal(serialized.includes('"seed":'), false);
  assert.equal(serialized.includes('"state":'), false);
  assert.equal(result.build.gitSha, 'a'.repeat(40));
  assert.equal(result.build.applicationId, 'com.multihistoria');
});
