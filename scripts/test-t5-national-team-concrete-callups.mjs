import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { latestConcreteNationalTeamCallup, recordConcreteNationalTeamCallupInPlace, recordNationalTournamentSelectionInPlace, latestNationalTournamentSelection } from '../dist/simulation/national-team-authority.js';

test('concrete callup/1 fails closed without an authoritative open gate', () => {
  const state = createInitialState(9930);
  state.professional.nationalCaps = 80;
  state.professional.nationalStanding = 99;
  state.reputation.prestige = 99;
  assert.equal(recordConcreteNationalTeamCallupInPlace(state), null);
  assert.equal(latestConcreteNationalTeamCallup(state), null);
});

test('concrete callup/2 open gate persists an idempotent factual row', () => {
  const state = createInitialState(9931);
  state.flags.NATIONAL_GATE_OPEN = true;
  const beforeRng = structuredClone(state.rngState);
  const first = recordConcreteNationalTeamCallupInPlace(state);
  const second = recordConcreteNationalTeamCallupInPlace(state);
  assert.ok(first);
  assert.deepEqual(second, first);
  assert.deepEqual(latestConcreteNationalTeamCallup(state), first);
  assert.equal(state.world.nationalTeamCallups.length, 1);
  assert.deepEqual(state.rngState, beforeRng);
});

test('concrete callup/3 international retirement is a hard stop', () => {
  const state = createInitialState(9932);
  state.flags.NATIONAL_GATE_OPEN = true;
  state.flags.NATIONAL_RETIRED = true;
  assert.equal(recordConcreteNationalTeamCallupInPlace(state), null);
});


test('tournament selection/4 cycle flag alone cannot fabricate membership', () => {
  const state = createInitialState(9933);
  state.flags.NATIONAL_TOURNAMENT_CYCLE = true;
  assert.equal(recordNationalTournamentSelectionInPlace(state, 'preselection'), null);
  assert.equal(latestNationalTournamentSelection(state), null);
});

test('tournament selection/5 explicit 30 then 26 preserves selection chronology', () => {
  const state = createInitialState(9934);
  state.flags.NATIONAL_GATE_OPEN = true;
  state.flags.NATIONAL_TOURNAMENT_CYCLE = true;
  recordConcreteNationalTeamCallupInPlace(state);
  assert.equal(recordNationalTournamentSelectionInPlace(state, 'final_squad'), null);
  const pre = recordNationalTournamentSelectionInPlace(state, 'preselection');
  assert.equal(pre?.squadSize, 30);
  state.runtime.day += 1;
  state.date = '2025-07-02';
  const final = recordNationalTournamentSelectionInPlace(state, 'final_squad');
  assert.equal(final?.squadSize, 26);
  assert.equal(latestNationalTournamentSelection(state)?.phase, 'final_squad');
});
