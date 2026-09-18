import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { careerSportMilestones, recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import { getSportContext } from '../dist/simulation/sport-context.js';

function matchState(seed = 9910) {
  const state = createInitialState(seed);
  state.date = '2026-08-05';
  state.runtime.day = 35;
  state.runtime.seasonDay = 35;
  return state;
}

test('career milestones/1 fail closed when aggregate career appearances exceed persisted ledger', () => {
  const state = matchState();
  recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  state.sport.appearances = 500;
  const facts = careerSportMilestones(state);
  assert.equal(facts.historyComplete, false);
  assert.equal(facts.appearances, null);
  assert.equal(facts.appearance500, null);
  assert.equal(getSportContext(state).careerMilestones, null);
});

test('career milestones/2 complete ledger exposes factual totals and threshold', () => {
  const state = matchState(9911);
  recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  state.sport.appearances = 1;
  const facts = careerSportMilestones(state);
  assert.equal(facts.historyComplete, true);
  assert.equal(facts.appearances, 1);
  assert.equal(facts.appearance500, false);
  assert.equal(typeof facts.goals, 'number');
  assert.equal(typeof facts.assists, 'number');
  assert.deepEqual(getSportContext(state).careerMilestones, facts);
});

test('career milestones/3 read consumes zero RNG and ignores reputation/form proxies', () => {
  const a = matchState(9912);
  const b = matchState(9912);
  recordOfficialMatchInPlace(a, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  recordOfficialMatchInPlace(b, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  a.sport.appearances = b.sport.appearances = 1;
  a.sport.form = 1; a.reputation.prestige = 1;
  b.sport.form = 99; b.reputation.prestige = 99;
  const before = structuredClone(a.rngState);
  assert.deepEqual(careerSportMilestones(a), careerSportMilestones(b));
  assert.deepEqual(a.rngState, before);
});
