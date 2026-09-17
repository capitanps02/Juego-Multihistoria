import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import {
  closeLeagueObjectiveInPlace,
  currentOfficialMatch,
  getSportMatchModelStore,
  inspectSportMatchModelStore,
  recordOfficialMatchInPlace
} from '../dist/simulation/match-model.js';
import { getCurrentMatchContext, getSportContext } from '../dist/simulation/sport-context.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { advanceWorldDayInPlace as advanceCoreWorldDayInPlace } from '../dist/simulation/world-simulator-core.js';
import { assertGameState } from '../dist/save/validation.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

const invalidSave = error => error?.code === 'INVALID_SAVE';

function matchDayState(seed = 8800) {
  const state = createInitialState(seed);
  state.date = '2026-08-05';
  state.runtime.day = 35;
  state.runtime.seasonDay = 35;
  return state;
}

function validStoredState(seed = 8801) {
  const state = matchDayState(seed);
  recordOfficialMatchInPlace(state, {
    appeared: true,
    debutOccurred: true,
    injuryUnavailable: false
  });
  return state;
}

function canonicalDebutState() {
  for (let seed = 8800; seed < 10000; seed += 1) {
    const state = validStoredState(seed);
    if (getCurrentMatchContext(state).debutDecisionContext) return state;
  }
  throw new Error('No deterministic canonical debut context found in directed seed range');
}

test('match model/1 public simulator preserves core simulation and RNG apart from the additive fact store', () => {
  const wrapped = createInitialState(8811);
  const core = createInitialState(8811);
  for (let day = 0; day < 70; day += 1) {
    advanceWorldDayInPlace(wrapped);
    advanceCoreWorldDayInPlace(core);
  }
  const withoutStore = structuredClone(wrapped);
  delete withoutStore.world.sportMatchModel;
  assert.deepEqual(withoutStore, core);
  assert.deepEqual(wrapped.rngState, core.rngState);
  assert.ok(getSportMatchModelStore(wrapped)?.fixtures.length > 0);
});

test('match model/2 one weekly fixture is persisted idempotently without consuming RNG', () => {
  const state = matchDayState(8812);
  const beforeRng = structuredClone(state.rngState);
  const input = { appeared: true, debutOccurred: false, injuryUnavailable: false };
  const first = recordOfficialMatchInPlace(state, input);
  const second = recordOfficialMatchInPlace(state, input);
  assert.ok(first);
  assert.equal(second.id, first.id);
  assert.equal(getSportMatchModelStore(state).fixtures.length, 1);
  assert.deepEqual(state.rngState, beforeRng);
});

test('match model/3 canonical minute-78 1-1 debut context is produced independently and exposed only when facts match', () => {
  const state = canonicalDebutState();
  const store = getSportMatchModelStore(state);
  const match = currentOfficialMatch(state);
  const context = getCurrentMatchContext(state);
  assert.ok(match);
  assert.equal(match.player.debut, true);
  assert.equal(match.player.appeared, true);
  assert.equal(match.player.started, false);
  assert.equal(context.status, 'authoritative');
  assert.equal(context.decisionMinute, 78);
  assert.deepEqual(context.scoreAtDecision, { home: 1, away: 1 });
  assert.equal(context.debutDecisionContext, true);
  assert.equal(store.milestones.firstMatchSquadCall, match.id);
  assert.equal(store.milestones.firstAppearance, match.id);
});

test('match model/4 calendar facts are deterministic read-only projections', () => {
  const state = createInitialState(8814);
  const before = structuredClone(state);
  const a = getSportContext(state);
  const b = getSportContext(state);
  assert.deepEqual(a, b);
  assert.ok(a.nextFixture);
  assert.equal(a.nextFixture.competition, 'league');
  assert.ok(a.hoursToNextFixture >= 0);
  assert.ok(a.nextTrainingDate);
  assert.ok(a.remainingLeagueMatches > 0);
  assert.deepEqual(state, before);
});

test('match model/5 persisted fixture facts survive save/load with RNG unchanged', () => {
  const state = validStoredState(8815);
  const beforeStore = structuredClone(state.world.sportMatchModel);
  const beforeRng = structuredClone(state.rngState);
  const restored = loadSave(serializeSave(state));
  assert.deepEqual(restored.world.sportMatchModel, beforeStore);
  assert.deepEqual(restored.rngState, beforeRng);
  assert.deepEqual(getCurrentMatchContext(restored), getCurrentMatchContext(state));
});

test('match model/6 optional store preserves historical save compatibility', () => {
  const state = createInitialState(8816);
  delete state.world.sportMatchModel;
  assert.doesNotThrow(() => assertGameState(state));
  const restored = loadSave(JSON.stringify(state));
  assert.equal(restored.world.sportMatchModel, undefined);
});

test('match model/7 corrupt persisted match facts fail closed at load and runtime boundary', () => {
  const raw = JSON.parse(serializeSave(validStoredState(8817)));
  const fixture = raw.world.sportMatchModel.fixtures[0];
  const mutations = [
    value => { value.world.sportMatchModel.fixtures[0].id = 'fixture:wrong'; },
    value => { value.world.sportMatchModel.fixtures[0].date = '2099-01-01'; },
    value => { value.world.sportMatchModel.fixtures[0].player.started = true; value.world.sportMatchModel.fixtures[0].player.appeared = false; },
    value => { value.world.sportMatchModel.milestones.firstAppearance = 'fixture:unknown'; },
    value => { value.world.sportMatchModel.fixtures[0].extra = true; }
  ];
  assert.ok(fixture);
  for (const mutate of mutations) {
    const bad = structuredClone(raw);
    mutate(bad);
    assert.throws(() => loadSave(JSON.stringify(bad)), invalidSave);
    assert.throws(() => assertGameState(bad), invalidSave);
  }
});

test('match model/8 validator and projections consume zero RNG and mutate nothing', () => {
  const state = validStoredState(8818);
  const before = structuredClone(state);
  assert.equal(inspectSportMatchModelStore(state.world.sportMatchModel, state.date), null);
  assertGameState(state);
  getSportContext(state);
  getCurrentMatchContext(state);
  assert.deepEqual(state, before);
});

test('match model/9 league objective closure is persisted, deterministic and save-valid', () => {
  const state = validStoredState(8819);
  const beforeRng = structuredClone(state.rngState);
  closeLeagueObjectiveInPlace(state, 'safe');
  const store = getSportMatchModelStore(state);
  assert.equal(store.objective.status, 'closed');
  assert.equal(store.objective.resolvedAt, state.date);
  assert.equal(store.objective.outcome, 'safe');
  assert.deepEqual(state.rngState, beforeRng);
  const restored = loadSave(serializeSave(state));
  assert.deepEqual(restored.world.sportMatchModel, state.world.sportMatchModel);
});

test('match model/10 role/form/reputation proxies cannot change a concrete fixture fact', () => {
  const a = matchDayState(8820);
  const b = matchDayState(8820);
  a.sport.roleScore = 1;
  a.sport.form = 1;
  a.reputation.prestige = 1;
  b.sport.roleScore = 99;
  b.sport.form = 99;
  b.reputation.prestige = 99;
  const input = { appeared: false, debutOccurred: false, injuryUnavailable: false };
  const rowA = recordOfficialMatchInPlace(a, input);
  const rowB = recordOfficialMatchInPlace(b, input);
  assert.deepEqual(rowA, rowB);
  assert.deepEqual(a.rngState, b.rngState);
});

test('match model/11 coarse UDV resolution cannot close the authoritative objective while fixtures remain', () => {
  const state = createInitialState(8821);
  state.date = '2027-05-04';
  state.runtime.day = 307;
  state.runtime.seasonDay = 307;

  advanceWorldDayInPlace(state);
  assert.equal(state.date, '2027-05-05');
  assert.equal(state.world.udvSeasonResolved, true, 'legacy coarse resolution should have happened');
  let context = getSportContext(state);
  assert.equal(context.remainingLeagueMatches, 3);
  assert.equal(context.seasonObjectiveStatus, 'open');

  for (let day = 0; day < 21; day += 1) advanceWorldDayInPlace(state);
  assert.equal(state.date, '2027-05-26');
  context = getSportContext(state);
  assert.equal(context.remainingLeagueMatches, 0);
  assert.equal(context.seasonObjectiveStatus, 'closed');
  const store = getSportMatchModelStore(state);
  assert.equal(store.objective.resolvedAt, '2027-05-26');
});
