import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { latestConcreteNationalTeamCallup, recordConcreteNationalTeamCallupInPlace } from '../dist/simulation/national-team-authority.js';

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
