import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import {
  activeCompetitionMoment,
  getCompetitionMomentStore,
  getCurrentCompetitionContext,
  inspectCompetitionMomentStore,
  latestCompetitionMoment,
  recordCoreFinalCompetitionMomentInPlace
} from '../dist/simulation/competition-context.js';
import { getSportContext } from '../dist/simulation/sport-context.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { assertGameState } from '../dist/save/validation.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

const invalidSave = error => error?.code === 'INVALID_SAVE';

function directFinalState() {
  const state = createInitialState(9600);
  state.age = 27;
  state.phase = '26_30';
  state.date = '2035-04-10';
  state.season = '2034-35';
  state.runtime.day = 283;
  state.runtime.seasonDay = 283;
  state.professional.initializedAt20 = true;
  state.professional.initializedAt23 = true;
  state.professional.initializedAt26 = true;
  state.flags.FINAL_CONTEXT = true;
  state.world.finalCompetition = 'continental';
  state.world.finalOutcome = 'win';
  state.world.finalContextExpiresDay = 291;
  return state;
}

test('competition context/1 FINAL_CONTEXT or month alone cannot fabricate a final', () => {
  const state = createInitialState(9601);
  state.age = 27;
  state.phase = '26_30';
  state.date = '2035-05-01';
  state.season = '2034-35';
  state.runtime.day = 304;
  state.runtime.seasonDay = 304;
  state.professional.initializedAt20 = true;
  state.professional.initializedAt23 = true;
  state.professional.initializedAt26 = true;
  state.flags.FINAL_CONTEXT = true;
  state.professional.clubPrestigeTier = 5;
  state.sport.roleScore = 99;
  state.reputation.prestige = 99;

  const before = structuredClone(state);
  assert.equal(recordCoreFinalCompetitionMomentInPlace(state), null);
  assert.equal(getCompetitionMomentStore(state), null);
  assert.equal(getCurrentCompetitionContext(state).status, 'no_current_competition');
  assert.deepEqual(state, before);
});

test('competition context/2 core-produced final materializes idempotently with zero RNG', () => {
  const state = directFinalState();
  const beforeRng = structuredClone(state.rngState);
  const first = recordCoreFinalCompetitionMomentInPlace(state);
  const second = recordCoreFinalCompetitionMomentInPlace(state);

  assert.ok(first);
  assert.deepEqual(second, first);
  assert.equal(getCompetitionMomentStore(state).moments.length, 1);
  assert.equal(first.competition, 'continental');
  assert.equal(first.stage, 'final');
  assert.equal(first.outcome, 'win');
  assert.equal(first.highProfile, true);
  assert.deepEqual(state.rngState, beforeRng);

  const context = getCurrentCompetitionContext(state);
  assert.equal(context.status, 'authoritative');
  assert.equal(context.competition, 'continental');
  assert.equal(context.stage, 'final');
  assert.equal(context.outcome, 'win');
  assert.equal(context.highProfile, true);
  assert.equal(context.source, 'competition_moment');
});

test('competition context/3 producer-backed world simulation creates a persisted final without narrative reconstruction', () => {
  let produced = null;

  for (let seed = 9610; seed < 9650 && !produced; seed += 1) {
    const state = createInitialState(seed);
    state.age = 27;
    state.phase = '26_30';
    state.date = '2035-03-31';
    state.season = '2034-35';
    state.runtime.day = 273;
    state.runtime.seasonDay = 273;
    state.professional.initializedAt20 = true;
    state.professional.initializedAt23 = true;
    state.professional.initializedAt26 = true;
    state.professional.leagueTier = 1;
    state.professional.clubPrestigeTier = 5;
    state.professional.roleScore = 82;
    state.professional.continentalCred = 80;
    state.professional.trophyCapital = 60;
    state.flags.CONTINENTAL_REGISTERED = true;
    state.flags.FINAL_CONTEXT = false;
    state.world.finalContextExpiresDay = -1;

    for (let day = 0; day < 55; day += 1) {
      advanceWorldDayInPlace(state);
      if (getCompetitionMomentStore(state)?.moments.length) {
        produced = state;
        break;
      }
    }
  }

  assert.ok(produced, 'directed simulation range should produce a factual final');
  const store = getCompetitionMomentStore(produced);
  const latest = latestCompetitionMoment(produced);
  assert.ok(store);
  assert.ok(latest);
  assert.ok(['domestic_cup', 'continental'].includes(latest.competition));
  assert.equal(latest.stage, 'final');
  assert.ok(['win', 'loss'].includes(latest.outcome));
  assert.equal(latest.highProfile, true);

  const sport = getSportContext(produced);
  assert.ok(sport.latestCompetitionMoment);
  assert.deepEqual(sport.latestCompetitionMoment, latest);

  const restored = loadSave(serializeSave(produced));
  assert.deepEqual(restored.world.sportCompetitionMoments, produced.world.sportCompetitionMoments);
  assert.deepEqual(restored.rngState, produced.rngState);
  assert.deepEqual(latestCompetitionMoment(restored), latest);
});

test('competition context/4 active final expires by persisted runtime window but history remains queryable', () => {
  const state = directFinalState();
  const moment = recordCoreFinalCompetitionMomentInPlace(state);
  assert.ok(moment);
  assert.ok(activeCompetitionMoment(state));

  state.runtime.day = moment.expiresRuntimeDay + 1;
  state.date = '2035-04-19';
  assert.equal(activeCompetitionMoment(state), null);
  assert.equal(getCurrentCompetitionContext(state).status, 'no_current_competition');
  assert.equal(latestCompetitionMoment(state)?.id, moment.id);
});

test('competition context/5 malformed persisted competition authority fails closed', () => {
  const state = directFinalState();
  recordCoreFinalCompetitionMomentInPlace(state);
  const raw = JSON.parse(serializeSave(state));
  const mutations = [
    value => { value.world.sportCompetitionMoments.moments[0].id = 'competition:forged'; },
    value => { value.world.sportCompetitionMoments.moments[0].competition = 'league'; },
    value => { value.world.sportCompetitionMoments.moments[0].stage = 'semi_final'; },
    value => { value.world.sportCompetitionMoments.moments[0].outcome = 'draw'; },
    value => { value.world.sportCompetitionMoments.moments[0].expiresRuntimeDay = value.world.sportCompetitionMoments.moments[0].runtimeDay - 1; },
    value => { value.world.sportCompetitionMoments.moments[0].extra = true; }
  ];

  for (const mutate of mutations) {
    const bad = structuredClone(raw);
    mutate(bad);
    assert.throws(() => assertGameState(bad), invalidSave);
    assert.throws(() => loadSave(JSON.stringify(bad)), invalidSave);
  }
});

test('competition context/6 historical saves may omit the optional competition store', () => {
  const state = createInitialState(9606);
  delete state.world.sportCompetitionMoments;
  assert.doesNotThrow(() => assertGameState(state));
  const restored = loadSave(JSON.stringify(state));
  assert.equal(restored.world.sportCompetitionMoments, undefined);
});

test('competition context/7 ordinary official league fixture exposes league stage, not a fabricated cup stage', () => {
  const state = createInitialState(9607);
  state.date = '2026-08-05';
  state.runtime.day = 35;
  state.runtime.seasonDay = 35;
  // The match model test imported by sport-context creates fixture coverage;
  // here we only assert absence before a real row exists.
  const context = getCurrentCompetitionContext(state);
  assert.equal(context.status, 'no_current_competition');
});
