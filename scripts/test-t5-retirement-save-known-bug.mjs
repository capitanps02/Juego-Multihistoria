import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

const invalidSave = error => error?.code === 'INVALID_SAVE';

function assertRejected(state, label) {
  const before = structuredClone(state);
  assert.throws(() => serializeSave(state), invalidSave, label);
  assert.throws(() => loadSave(JSON.stringify(state)), invalidSave, label);
  assert.deepEqual(state, before, 'retirement validation must be read-only');
}

test('T5-QA-016d: persisted retirement state machine rejects impossible status/date combinations', () => {
  const playingWithAnnouncement = createInitialState(51601);
  playingWithAnnouncement.retirement.status = 'playing';
  playingWithAnnouncement.retirement.decidedDate = '2026-06-01';
  playingWithAnnouncement.retirement.announcedDate = '2026-06-15';
  playingWithAnnouncement.retirement.decisionAge = 18;
  playingWithAnnouncement.retirement.reason = 'voluntary';
  assertRejected(playingWithAnnouncement, 'playing cannot retain decided/announced authority');

  const announcedWithoutDecision = createInitialState(51602);
  announcedWithoutDecision.retirement.status = 'announced';
  announcedWithoutDecision.retirement.announcedDate = '2026-06-15';
  announcedWithoutDecision.retirement.reason = 'voluntary';
  assertRejected(announcedWithoutDecision, 'announced requires a prior persisted decision');

  const reversedChronology = createInitialState(51603);
  reversedChronology.retirement.status = 'announced';
  reversedChronology.retirement.decidedDate = '2026-06-20';
  reversedChronology.retirement.announcedDate = '2026-06-10';
  reversedChronology.retirement.decisionAge = 18;
  reversedChronology.retirement.reason = 'voluntary';
  assertRejected(reversedChronology, 'announcement cannot precede decision');
});

test('T5-QA-016e: ordinary playing retirement state still round-trips with 0 RNG drift', () => {
  const state = createInitialState(51604);
  const beforeRng = structuredClone(state.rngState);
  const restored = loadSave(serializeSave(state));
  assert.deepEqual(restored.retirement, state.retirement);
  assert.deepEqual(restored.rngState, beforeRng);
});
