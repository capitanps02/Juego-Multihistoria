import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import {
  hasNationalTeamHistory,
  resolveNationalTeamAuthority
} from '../dist/simulation/national-team-authority.js';

function rngSnapshot(state) {
  return structuredClone(state.rngState);
}

function matureNationalState(seed = 7300) {
  const state = createInitialState(seed);
  state.age = 30;
  state.phase = '30_34';
  state.date = '2038-03-01';
  state.season = '2037-38';
  state.contract.monthsRemaining = 60;
  state.sport.roleScore = 82;
  state.sport.form = 72;
  state.professional.initializedAt20 = true;
  state.professional.initializedAt23 = true;
  state.professional.initializedAt26 = true;
  state.professional.initializedAt30 = true;
  state.professional.leagueTier = 1;
  state.professional.nationalHeat = 82;
  state.professional.nationalStanding = 78;
  state.professional.nationalCaps = 24;
  state.professional.nationalRole = 'regular';
  state.flags.NATIONAL_CALLED = true;
  state.flags.NATIONAL_REGULAR = true;
  return state;
}

test('national-team authority does not turn standing into a concrete call-up or tournament squad', () => {
  const state = createInitialState(7301);
  state.professional.nationalStanding = 95;
  state.professional.nationalRole = 'regular';
  state.flags.NATIONAL_GATE_OPEN = true;
  state.flags.NATIONAL_TOURNAMENT_CYCLE = true;

  const before = structuredClone(state);
  const authority = resolveNationalTeamAuthority(state);

  assert.equal(authority.everCalled, false);
  assert.equal(authority.simulationPoolActive, false);
  assert.equal(authority.gateOpen, true, 'aggregate gate can be exposed without fabricating a concrete call-up');
  assert.equal(authority.tournamentCycleWindow, true, 'cycle window is distinct from squad membership');
  assert.equal(authority.concreteCallupKnown, false);
  assert.equal(authority.tournamentSquadKnown, false);
  assert.equal(hasNationalTeamHistory(state), false);
  assert.deepEqual(state, before, 'authority projection must be read-only and 0 RNG');
});

test('caps are valid historical selection evidence without becoming a current call-up', () => {
  const state = createInitialState(7302);
  state.professional.nationalCaps = 3;
  state.professional.nationalStanding = 41;
  state.professional.nationalRole = 'fringe';

  const authority = resolveNationalTeamAuthority(state);
  assert.equal(authority.everCalled, true, 'a senior cap necessarily proves historical selection');
  assert.equal(authority.simulationPoolActive, false, 'caps alone do not recreate the live simulator pool flag');
  assert.equal(authority.concreteCallupKnown, false);
  assert.equal(hasNationalTeamHistory(state), true);
});

test('international retirement overrides live pool, gate and tournament-window signals', () => {
  const state = matureNationalState(7303);
  state.flags.NATIONAL_GATE_OPEN = true;
  state.flags.NATIONAL_TOURNAMENT_CYCLE = true;
  state.flags.NATIONAL_RETIRED = true;
  const beforeRng = rngSnapshot(state);

  const authority = resolveNationalTeamAuthority(state);
  assert.equal(authority.retired, true);
  assert.equal(authority.everCalled, true);
  assert.equal(authority.simulationPoolActive, false);
  assert.equal(authority.gateOpen, false);
  assert.equal(authority.tournamentCycleWindow, false);
  assert.equal(authority.caps, 24, 'retirement keeps historical caps');
  assert.equal(authority.role, 'regular', 'retirement does not rewrite historical aggregate role');
  assert.deepEqual(rngSnapshot(state), beforeRng, 'projection consumes no RNG');
});

test('international retirement stops future national caps and cycle availability while club career keeps advancing', () => {
  const state = matureNationalState(7304);
  state.flags.NATIONAL_RETIRED = true;
  state.flags.NATIONAL_GATE_OPEN = true;
  state.flags.NATIONAL_TOURNAMENT_CYCLE = true;
  const capsBefore = state.professional.nationalCaps;
  const standingBefore = state.professional.nationalStanding;
  const clubBefore = state.club;
  const dayBefore = state.runtime.day;

  for (let day = 0; day < 35; day += 1) advanceWorldDayInPlace(state);

  assert.equal(state.professional.nationalCaps, capsBefore, 'retired player must not receive simulated caps');
  assert.equal(state.professional.nationalStanding, standingBefore, 'retired player must not receive camp standing updates');
  assert.equal(state.flags.NATIONAL_GATE_OPEN, false);
  assert.equal(state.flags.NATIONAL_TOURNAMENT_CYCLE, false);
  assert.equal(state.club, clubBefore, 'international retirement must not retire or detach the club career');
  assert.ok(state.runtime.day > dayBefore, 'world/club career continues to advance');
  assert.equal(state.retirement.status, 'playing');
});

test('national-team authority survives save/load using existing state without a new schema', () => {
  const state = matureNationalState(7305);
  state.flags.NATIONAL_RETIRED = true;
  const before = resolveNationalTeamAuthority(state);
  const restored = loadSave(serializeSave(state));

  assert.deepEqual(resolveNationalTeamAuthority(restored), before);
  assert.equal(restored.flags.NATIONAL_RETIRED, true);
  assert.equal(restored.professional.nationalCaps, 24);
});
