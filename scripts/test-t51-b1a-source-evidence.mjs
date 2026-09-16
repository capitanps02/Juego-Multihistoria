import test from 'node:test';
import assert from 'node:assert/strict';
import { GameSession } from '../dist/session/game-session.js';
import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity, eventFingerprintMap, journalSemanticsFingerprint } from '../dist/session/content-identity.js';
import {
  LEGACY_CONTENT_SOURCES,
  T51_B1A_CONTENT_IDENTITY,
  T51_B1A_EVENT_EVIDENCE,
  legacyContentSource
} from '../dist/session/content-migration.js';
import { PRE_T51_EVENT_EVIDENCE } from '../dist/session/pre-t51-legacy-registry.js';

const B1A_IDS = ['EVT_18_MED_001', 'EVT_18_TEAM_001', 'EVT_18_MATCH_002'];

async function journalEvidence(event) {
  const outcomes = new Map(event.outcomes.map(outcome => [outcome.id, outcome]));
  const journalDigests = {};
  for (const choice of event.choices) {
    journalDigests[choice.id] = {};
    for (const outcomeId of choice.outcomeIds) {
      const outcome = outcomes.get(outcomeId);
      assert.ok(outcome, `${event.id}/${choice.id}: missing ${outcomeId}`);
      journalDigests[choice.id][outcomeId] = await journalSemanticsFingerprint(event.text.title, choice.label, outcome.messages);
    }
  }
  return journalDigests;
}

test('B1a source evidence matches active catalog and differs from freeze only in three fingerprints', async () => {
  assert.equal(await contentIdentity(EVENTS), T51_B1A_CONTENT_IDENTITY);
  const source = legacyContentSource(T51_B1A_CONTENT_IDENTITY);
  assert.ok(source, 'B1a must be a registered legacy migration source');
  assert.strictEqual(source, LEGACY_CONTENT_SOURCES[T51_B1A_CONTENT_IDENTITY]);
  assert.equal(Object.keys(source.events).length, EVENTS.length);
  assert.deepEqual(source.sessionVersions, [3]);

  const fingerprints = await eventFingerprintMap(EVENTS);
  for (const event of EVENTS) {
    assert.equal(source.events[event.id]?.fingerprint, fingerprints.get(event.id), `${event.id}: registered B1a fingerprint drifted from active catalog`);
  }

  const changed = Object.keys(T51_B1A_EVENT_EVIDENCE)
    .filter(id => T51_B1A_EVENT_EVIDENCE[id].fingerprint !== PRE_T51_EVENT_EVIDENCE[id].fingerprint)
    .sort();
  assert.deepEqual(changed, [...B1A_IDS].sort());

  for (const id of B1A_IDS) {
    const event = EVENTS.find(candidate => candidate.id === id);
    assert.ok(event);
    assert.deepEqual(await journalEvidence(event), PRE_T51_EVENT_EVIDENCE[id].journalDigests, `${id}: B1a unexpectedly changed journal semantics`);
    assert.deepEqual(T51_B1A_EVENT_EVIDENCE[id].journalDigests, PRE_T51_EVENT_EVIDENCE[id].journalDigests);
  }
});

test('real B1a Session v3 snapshot can migrate to a future identity through registered evidence', async () => {
  const session = await GameSession.create(95101, { sessionId: 'b1a-source-evidence' });
  const source = session.exportSnapshot();
  assert.equal(source.contentIdentity, T51_B1A_CONTENT_IDENTITY);

  const targetEvents = structuredClone(EVENTS);
  const mutated = targetEvents.find(event => !B1A_IDS.includes(event.id));
  assert.ok(mutated);
  mutated.text.body += ' · directed future-catalog migration probe';
  const targetIdentity = await contentIdentity(targetEvents);
  assert.notEqual(targetIdentity, T51_B1A_CONTENT_IDENTITY);

  const beforeState = structuredClone(source.state);
  const beforeRng = structuredClone(source.state.rngState);
  const migrated = await GameSession.migrateAndResume(source, {
    events: targetEvents,
    migrationRoutes: [{
      sourceContentIdentity: T51_B1A_CONTENT_IDENTITY,
      targetContentIdentity: targetIdentity
    }]
  });
  const after = migrated.exportSnapshot();
  assert.equal(after.contentIdentity, targetIdentity);
  assert.deepEqual(after.state, beforeState);
  assert.deepEqual(after.state.rngState, beforeRng);
});
