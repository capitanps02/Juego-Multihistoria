import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { GameSession } from '../dist/session/game-session.js';
import { PRE_T41_CONTENT_IDENTITY, PRE_T41_EVENT_EVIDENCE } from '../dist/session/pre-t41-legacy-registry.js';
import { LEGACY_CONTENT_SOURCES, CONTENT_MIGRATION_ROUTES } from '../dist/session/content-migration.js';

const historical = JSON.parse(fs.readFileSync('qa/fixtures/t5.1/pre-t51-event-catalog.json', 'utf8'));
let fixture;
async function mixedProvenanceSave() {
  if (!fixture) {
    const session = await GameSession.create(424242, { events: historical, sessionId: 'pre-t41-history' });
    await session.dispatch({ type: 'continue', commandId: 'c', expectedRevision: 0 });
    const view = session.getView();
    assert.equal(session.exportSnapshot().pendingDecision.event.id, 'EVT_18_PRE_001');
    await session.dispatch({ type: 'choose', commandId: 'choose', expectedRevision: view.revision,
      pendingInstanceId: view.decision.instanceId, choiceId: 'CALL_NANO' });
    await session.dispatch({ type: 'acknowledge', commandId: 'ack', expectedRevision: session.getView().revision });
    const snapshot = session.exportSnapshot();
    // This event is byte-identical across these two historical catalogs.
    // Model a migrated session that correctly retains its older decision source.
    assert.equal(snapshot.decisionProvenance[0].eventFingerprint, PRE_T41_EVENT_EVIDENCE.EVT_18_PRE_001.fingerprint);
    snapshot.decisionProvenance[0].sourceContentIdentity = PRE_T41_CONTENT_IDENTITY;
    fixture = snapshot;
  }
  return structuredClone(fixture);
}

test('pre-T4.1 validation evidence is reproducible and introduces no scheduling or migration alias', () => {
  execFileSync(process.execPath, ['scripts/generate-pre-t41-legacy-registry.mjs', '--check']);
  assert.equal(Object.keys(LEGACY_CONTENT_SOURCES[PRE_T41_CONTENT_IDENTITY].events).length, 388);
  assert.equal(CONTENT_MIGRATION_ROUTES.some(route => route.sourceContentIdentity === PRE_T41_CONTENT_IDENTITY), false);
});

test('already-migrated historical decisions resume without rewriting history, provenance, RNG or input', async () => {
  const input = await mixedProvenanceSave();
  const before = structuredClone(input);
  const restored = await GameSession.migrateAndResume(input);
  const output = restored.exportSnapshot();
  assert.deepEqual(input, before);
  assert.deepEqual(output.state.history, before.state.history);
  assert.deepEqual(output.decisionProvenance, before.decisionProvenance);
  assert.deepEqual(output.state.rngState, before.state.rngState);
  const resumed = await GameSession.fromSave(JSON.stringify(output));
  assert.equal(JSON.stringify(resumed.exportSnapshot()), JSON.stringify(output));
});

test('historical evidence still rejects forged fingerprints, unknown sources and altered journal text', async () => {
  for (const corrupt of [
    value => { value.decisionProvenance[0].eventFingerprint = '0'.repeat(64); },
    value => { value.decisionProvenance[0].sourceContentIdentity = 'f'.repeat(64); },
    value => { value.journal[0].title = 'Forged history'; }
  ]) {
    const input = await mixedProvenanceSave();
    corrupt(input);
    await assert.rejects(GameSession.migrateAndResume(input), error => error.code === 'INVALID_SAVE');
  }
});
