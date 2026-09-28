import test from 'node:test';
import assert from 'node:assert/strict';
import { createReleaseDiagnostics } from '../dist/release/diagnostics.js';

function sample() {
  return {
    sessionVersion: 3,
    build: '0.8.0-t2.5',
    contentIdentity: 'content-old',
    sessionId: 'private-session-id',
    revision: 14,
    pendingDecision: { instanceId: 'private-pending-id', event: { id: 'EV_PENDING' } },
    journal: [{ text: 'private narrative text' }],
    state: {
      schemaVersion: 8,
      age: 34,
      date: '2038-04-01',
      season: '2037-38',
      phase: '34_plus',
      runtime: { day: 7200 },
      history: [{ eventId: 'EV_LAST' }],
      retirement: { status: 'announced' },
      epilogue: { generated: false },
      rngState: {
        narrative: { seed: 10, state: 20, draws: 30 },
        football: { seed: 40, state: 50, draws: 60 }
      }
    }
  };
}

const build = {
  gitSha: 'a'.repeat(40),
  sourceBranch: 'release/beta-readiness',
  engineBuild: '0.8.0-t2.5',
  contentIdentity: 'b'.repeat(64),
  saveSchema: 8,
  sessionSchema: 3,
  buildVariant: 'release-candidate',
  buildTimestamp: '2026-09-16T20:00:00.000Z',
  webBundleIdentity: 'c'.repeat(64),
  manifestIdentity: 'd'.repeat(64),
  android: { applicationId: 'com.multihistoria', versionCode: 7, versionName: '0.8.0-rc1' }
};

test('runtime diagnostics is deterministic for a supplied timestamp and does not mutate or draw RNG', () => {
  const snapshot = sample();
  const before = JSON.stringify(snapshot);
  const originalRandom = Math.random;
  Math.random = () => { throw new Error('must not consume RNG'); };
  try {
    const one = createReleaseDiagnostics(build, snapshot, { platform: 'android', sdkInt: 36 }, {}, '2026-09-16T20:01:00.000Z');
    const two = createReleaseDiagnostics(build, snapshot, { platform: 'android', sdkInt: 36 }, {}, '2026-09-16T20:01:00.000Z');
    assert.deepEqual(one, two);
    assert.equal(JSON.stringify(snapshot), before);
  } finally {
    Math.random = originalRandom;
  }
});

test('runtime diagnostics is useful but excludes private save and raw RNG payload', () => {
  const result = createReleaseDiagnostics(build, sample(), { platform: 'android', sdkInt: 36 }, { status: 'migrated' }, '2026-09-16T20:01:00.000Z');
  const serialized = JSON.stringify(result);
  assert.equal(result.build.gitSha, 'a'.repeat(40));
  assert.equal(result.build.versionCode, 7);
  assert.equal(result.save.lastEventId, 'EV_LAST');
  assert.equal(result.save.pendingEventId, 'EV_PENDING');
  assert.equal(result.save.retirementStatus, 'announced');
  assert.equal(result.save.rngPositions.narrative.draws, 30);
  assert.equal(result.save.rngPositions.football.draws, 60);
  assert.equal(serialized.includes('private-session-id'), false);
  assert.equal(serialized.includes('private-pending-id'), false);
  assert.equal(serialized.includes('private narrative text'), false);
  assert.equal(serialized.includes('"seed":10'), false);
  assert.equal(serialized.includes('"state":20'), false);
});
