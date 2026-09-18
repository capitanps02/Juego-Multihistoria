import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import { assertGameState } from '../dist/save/validation.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

const invalidSave = error => error?.code === 'INVALID_SAVE';

function matchDayState(seed = 9912) {
  const state = createInitialState(seed);
  state.date = '2026-08-05';
  state.runtime.day = 35;
  state.runtime.seasonDay = 35;
  return state;
}

function rawWithFixture(seed = 9912, appeared = true) {
  const state = matchDayState(seed);
  recordOfficialMatchInPlace(state, {
    appeared,
    debutOccurred: false,
    injuryUnavailable: false
  });
  return JSON.parse(serializeSave(state));
}

function expectRejected(raw) {
  assert.throws(() => loadSave(JSON.stringify(raw)), invalidSave);
  assert.throws(() => assertGameState(raw), invalidSave);
}

function clearMilestones(store) {
  for (const key of Object.keys(store.milestones)) store.milestones[key] = null;
}

test('T5-QA-029a: persisted bench authority requires a call-up', () => {
  const raw = rawWithFixture(9912, false);
  const store = raw.world.sportMatchModel;
  const row = store.fixtures[0];
  clearMilestones(store);
  row.player = {
    calledUp: false,
    onBench: true,
    started: false,
    appeared: false,
    minutes: 0,
    debut: false,
    injuryUnavailable: false
  };
  row.decisionContext = null;
  expectRejected(raw);
});

test('T5-QA-029b: persisted appearance requires positive minutes', () => {
  const raw = rawWithFixture(9913, true);
  const store = raw.world.sportMatchModel;
  const row = store.fixtures[0];
  clearMilestones(store);
  row.player = {
    calledUp: true,
    onBench: true,
    started: false,
    appeared: true,
    minutes: 0,
    debut: false,
    injuryUnavailable: false
  };
  row.decisionContext = null;
  store.milestones.firstMatchSquadCall = row.id;
  store.milestones.firstBench = row.id;
  store.milestones.firstAppearance = row.id;
  expectRejected(raw);
});

test('T5-QA-029c: firstGoal cannot be persisted before a goal producer exists', () => {
  const raw = rawWithFixture(9914, true);
  const store = raw.world.sportMatchModel;
  store.milestones.firstGoal = store.fixtures[0].id;
  expectRejected(raw);
});

test('T5-QA-029d: milestone pointer must prove its predicate', () => {
  const raw = rawWithFixture(9915, false);
  const store = raw.world.sportMatchModel;
  const row = store.fixtures[0];
  clearMilestones(store);
  row.player = {
    calledUp: false,
    onBench: false,
    started: false,
    appeared: false,
    minutes: 0,
    debut: false,
    injuryUnavailable: false
  };
  row.decisionContext = null;
  store.milestones.firstAppearance = row.id;
  expectRejected(raw);
});

test('T5-QA-029e: first milestone pointer cannot skip an earlier qualifying fixture', () => {
  const state = matchDayState(9916);
  recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  state.date = '2026-08-12';
  state.runtime.day = 42;
  state.runtime.seasonDay = 42;
  recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  const raw = JSON.parse(serializeSave(state));
  const store = raw.world.sportMatchModel;
  assert.equal(store.fixtures.length, 2, 'reproduction requires two persisted fixtures');
  store.milestones.firstAppearance = store.fixtures[1].id;
  expectRejected(raw);
});
