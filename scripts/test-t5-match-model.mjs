import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import {
  closeLeagueObjectiveInPlace,
  currentOfficialMatch,
  getSportMatchModelStore,
  inspectSportMatchModelStore,
  lastPlayerAppearance,
  recordOfficialMatchInPlace
} from '../dist/simulation/match-model.js';
import { getCurrentMatchContext, getSportContext } from '../dist/simulation/sport-context.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { advanceWorldDayInPlace as advanceCoreWorldDayInPlace } from '../dist/simulation/world-simulator-core.js';
import { assertGameState } from '../dist/save/validation.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { GameSession } from '../dist/session/game-session.js';

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

test('match model/12 impossible squad and appearance facts fail closed without mutation', () => {
  const state = matchDayState(8818);
  recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  const mutations = [
    p => Object.assign(p, { calledUp: false, onBench: true, started: false, appeared: false, minutes: 0 }),
    p => Object.assign(p, { calledUp: true, onBench: true, started: false, appeared: true, minutes: 0 }),
    p => Object.assign(p, { calledUp: true, onBench: false, started: false, appeared: true, minutes: 12 }),
    p => Object.assign(p, { calledUp: true, onBench: false, started: false, appeared: false, minutes: 0 })
  ];
  for (const mutate of mutations) {
    const bad = structuredClone(state);
    mutate(bad.world.sportMatchModel.fixtures[0].player);
    const before = structuredClone(bad);
    assert.throws(() => assertGameState(bad), invalidSave);
    assert.throws(() => loadSave(JSON.stringify(bad)), invalidSave);
    assert.deepEqual(bad, before);
  }
});

test('match model/13 milestones prove the earliest recorded qualifying fixture, including across clubs', () => {
  const state = matchDayState(8850);
  // Build a history through the real producer with repeated qualifiers and absences.
  for (let week = 0; week < 520; week++) {
    state.date = new Date(Date.UTC(2026, 7, 5 + week * 7)).toISOString().slice(0, 10);
    state.runtime.day = 35 + week * 7;
    if (week === 40) state.professional.registrationClub = 'TEST_OTHER_CLUB';
    recordOfficialMatchInPlace(state, { appeared: week % 3 !== 0, debutOccurred: false, injuryUnavailable: week % 3 === 0 });
  }
  const store = state.world.sportMatchModel;
  assert.equal(inspectSportMatchModelStore(store, state.date), null);
  assert.doesNotThrow(() => assertGameState(state));
  assert.deepEqual(loadSave(serializeSave(state)).world.sportMatchModel, store);
  const predicates = {
    firstMatchSquadCall: row => row.player.calledUp,
    firstBench: row => row.player.onBench,
    firstAppearance: row => row.player.appeared,
    firstStart: row => row.player.started,
    firstFullMatch: row => row.player.appeared && row.player.minutes === 90
  };
  for (const [key, predicate] of Object.entries(predicates)) {
    const qualifying = store.fixtures.filter(predicate);
    const wrong = store.fixtures.find(row => !predicate(row));
    assert.ok(qualifying.length >= 2 && wrong, key);
    assert.equal(store.milestones[key], qualifying[0].id);
    for (const reference of [wrong.id, qualifying[1].id, null]) {
      const bad = structuredClone(state);
      bad.world.sportMatchModel.milestones[key] = reference;
      const before = structuredClone(bad);
      assert.equal(inspectSportMatchModelStore(bad.world.sportMatchModel, bad.date)?.path, `world.sportMatchModel.milestones.${key}`);
      assert.throws(() => assertGameState(bad), invalidSave);
      assert.throws(() => loadSave(JSON.stringify(bad)), invalidSave);
      assert.deepEqual(bad, before);
    }
  }
});

test('match model/14 first goal remains unavailable at every save boundary', () => {
  const bad = validStoredState(8851);
  bad.world.sportMatchModel.milestones.firstGoal = bad.world.sportMatchModel.fixtures[0].id;
  assert.equal(inspectSportMatchModelStore(bad.world.sportMatchModel, bad.date)?.path, 'world.sportMatchModel.milestones.firstGoal');
  assert.throws(() => assertGameState(bad), invalidSave);
  assert.throws(() => loadSave(JSON.stringify(bad)), invalidSave);
});

test('match model/15 real bench, substitute and starter facts retain exact save and RNG round-trips', () => {
  const covered = new Set();
  for (let seed = 8800; seed < 9000 && covered.size < 3; seed++) {
    for (const appeared of [false, true]) {
      const state = matchDayState(seed);
      const row = recordOfficialMatchInPlace(state, { appeared, debutOccurred: false, injuryUnavailable: false });
      const kind = row.player.started ? 'starter' : row.player.appeared ? 'substitute' : row.player.onBench ? 'bench' : null;
      if (!kind || covered.has(kind)) continue;
      const before = structuredClone(state);
      const loaded = loadSave(serializeSave(state));
      assert.deepEqual(loaded.world.sportMatchModel, before.world.sportMatchModel);
      assert.deepEqual(loaded.rngState, before.rngState);
      assert.deepEqual(state, before);
      covered.add(kind);
    }
  }
  assert.deepEqual([...covered].sort(), ['bench', 'starter', 'substitute']);
});

test('match model/16 session restore rejects fabricated authority before committing', async () => {
  const session = await GameSession.create(8852);
  const snapshot = session.exportSnapshot();
  snapshot.state = validStoredState(8852);
  const valid = await GameSession.resume(structuredClone(snapshot));
  assert.deepEqual(valid.exportSnapshot().state.rngState, snapshot.state.rngState);
  for (const mutate of [
    store => { store.milestones.firstGoal = store.fixtures[0].id; },
    store => { store.milestones.firstAppearance = null; },
    store => { store.fixtures[0].player.minutes = 0; }
  ]) {
    const bad = structuredClone(snapshot);
    mutate(bad.state.world.sportMatchModel);
    const before = structuredClone(bad);
    let writes = 0;
    await assert.rejects(GameSession.resume(bad, { commit: async () => { writes++; } }), invalidSave);
    assert.equal(writes, 0);
    assert.deepEqual(bad, before);
  }
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


test('match model/17 new official rows persist deterministic football-owned result without RNG draws or proxy influence', () => {
  const a = matchDayState(8860);
  const b = matchDayState(8860);
  a.sport.form = 1;
  a.sport.roleScore = 1;
  a.reputation.prestige = 1;
  b.sport.form = 99;
  b.sport.roleScore = 99;
  b.reputation.prestige = 99;

  const beforeA = structuredClone(a.rngState);
  const beforeB = structuredClone(b.rngState);
  const rowA = recordOfficialMatchInPlace(a, { appeared: false, debutOccurred: false, injuryUnavailable: false });
  const rowB = recordOfficialMatchInPlace(b, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  assert.ok(rowA?.result);
  assert.ok(rowB?.result);
  assert.deepEqual(rowA.result, rowB.result, 'player/proxy state must not alter team result for same seed+fixture');
  assert.deepEqual(a.rngState, beforeA);
  assert.deepEqual(b.rngState, beforeB);

  const clubGoals = rowA.homeAway === 'home' ? rowA.result.homeGoals : rowA.result.awayGoals;
  const opponentGoals = rowA.homeAway === 'home' ? rowA.result.awayGoals : rowA.result.homeGoals;
  assert.equal(rowA.result.outcome, clubGoals > opponentGoals ? 'win' : clubGoals < opponentGoals ? 'loss' : 'draw');
  assert.ok(rowA.result.halfTimeHomeGoals <= rowA.result.homeGoals);
  assert.ok(rowA.result.halfTimeAwayGoals <= rowA.result.awayGoals);
  assert.deepEqual(getCurrentMatchContext(a).result, rowA.result);
});

test('match model/18 historical v1 rows without result remain valid and read as unknown rather than backfilled', () => {
  const state = validStoredState(8861);
  const row = state.world.sportMatchModel.fixtures[0];
  delete row.result;
  const before = structuredClone(state);
  assert.equal(inspectSportMatchModelStore(state.world.sportMatchModel, state.date, state), null);
  assert.doesNotThrow(() => assertGameState(state));
  assert.equal(getCurrentMatchContext(state).result, null);
  const restored = loadSave(serializeSave(state));
  assert.equal(restored.world.sportMatchModel.fixtures[0].result, undefined);
  assert.deepEqual(restored, before);
});

test('match model/19 forged persisted result fails closed at common save/runtime boundary', () => {
  const state = validStoredState(8862);
  const original = structuredClone(state.world.sportMatchModel.fixtures[0].result);
  assert.ok(original);
  const corruptions = [
    result => { result.homeGoals = Math.min(9, result.homeGoals + 1); },
    result => { result.halfTimeHomeGoals = result.homeGoals + 1; },
    result => { result.outcome = result.outcome === 'win' ? 'loss' : 'win'; }
  ];
  for (const mutate of corruptions) {
    const bad = structuredClone(state);
    mutate(bad.world.sportMatchModel.fixtures[0].result);
    assert.throws(() => assertGameState(bad), invalidSave);
    assert.throws(() => loadSave(JSON.stringify(bad)), invalidSave);
  }
});

test('match model/20 lastPlayerAppearance skips later non-appearance fixtures and survives save/load', () => {
  const state = matchDayState(8863);
  const first = recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  assert.ok(first);

  state.date = '2026-08-12';
  state.runtime.day += 7;
  state.runtime.seasonDay += 7;
  const second = recordOfficialMatchInPlace(state, { appeared: false, debutOccurred: false, injuryUnavailable: false });
  assert.ok(second);
  assert.equal(second.player.appeared, false);

  const last = lastPlayerAppearance(state);
  assert.equal(last?.id, first.id);
  assert.deepEqual(last?.result, first.result);

  const restored = loadSave(serializeSave(state));
  assert.equal(lastPlayerAppearance(restored)?.id, first.id);
  assert.deepEqual(lastPlayerAppearance(restored)?.result, first.result);
});
