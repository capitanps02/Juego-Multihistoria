import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS } from '../dist/content/events/index.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import { narrativeCausalFacts } from '../dist/simulation/club-contract-intent.js';

const form = EVENTS.find(event => event.id === 'EVT_30_FORM_001');
assert.ok(form);

function sixMatchState(seed) {
  const state = createInitialState(seed);
  state.age = 30;
  state.phase = '30_34';
  state.date = '2026-08-05';
  state.runtime.day = 35;
  state.runtime.seasonDay = 35;
  for (let week = 0; week < 6; week += 1) {
    if (week > 0) {
      state.date = new Date(Date.parse(state.date + 'T00:00:00Z') + 7 * 86400000).toISOString().slice(0, 10);
      state.runtime.day += 7;
      state.runtime.seasonDay += 7;
    }
    assert.ok(recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false }));
  }
  return state;
}

test('A7 FORM30 removes aggregate form proxy and requires factual five goals in six', () => {
  assert.equal(form.gates?.some(gate => gate.path === 'sport.form'), false);
  assert.deepEqual(form.gates, [{ path: 'facts.sport.recentSixMatchStats.goals', op: 'gte', value: 5 }]);

  const empty = createInitialState(730001);
  empty.age = 30;
  empty.phase = '30_34';
  empty.sport.form = 100;
  assert.equal(eventGatesPass(empty, form), false, 'high aggregate form cannot prove five-in-six');

  let qualifying = null;
  for (let seed = 730010; seed < 731000; seed += 1) {
    const candidate = sixMatchState(seed);
    const recent = narrativeCausalFacts(candidate).sport.recentSixMatchStats;
    if (recent && recent.goals >= 5) { qualifying = candidate; break; }
  }
  assert.ok(qualifying, 'directed seed range must contain a factual five-goal/six-match window');
  qualifying.sport.form = 1;
  assert.equal(eventGatesPass(qualifying, form), true, 'factual five-in-six is sufficient even with low aggregate form');
});

test('A7 FORM30 factual read is mutation/RNG free', () => {
  const state = sixMatchState(730777);
  const before = structuredClone(state);
  narrativeCausalFacts(state).sport.recentSixMatchStats;
  eventGatesPass(state, form);
  assert.deepEqual(state, before);
});
