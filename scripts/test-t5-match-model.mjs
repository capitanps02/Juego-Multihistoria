import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import {
  buildMatchPerformanceContext,
  careerSeasonRecords,
  closeLeagueObjectiveInPlace,
  currentCareerMatchResult,
  currentOfficialMatch,
  detailedSeasonPlayerStats,
  getSportMatchModelStore,
  inspectSportMatchModelStore,
  lastPlayerAppearance,
  priorClubPlayerMatchStats,
  recentClubPlayerMatchStats,
  recordOfficialMatchInPlace,
  seasonPlayerStats
} from '../dist/simulation/match-model.js';
import { getCurrentMatchContext, getSportContext } from '../dist/simulation/sport-context.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { respondToOffer } from '../dist/simulation/offers.js';
import { advanceWorldDayInPlace as advanceCoreWorldDayInPlace } from '../dist/simulation/world-simulator-core.js';
import { certifyCoachChangeInPlace } from '../dist/simulation/coach-change-authority.js';
import { assertGameState } from '../dist/save/validation.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { GameSession } from '../dist/session/game-session.js';
import { certifyCoachChangeInPlace } from '../dist/simulation/coach-change-authority.js';

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

test('match model/1 public simulator is deterministic while factual sports feedback persists through the wrapper', () => {
  const a = createInitialState(8811);
  const b = createInitialState(8811);
  for (let day = 0; day < 70; day += 1) {
    advanceWorldDayInPlace(a);
    advanceWorldDayInPlace(b);
  }
  assert.deepEqual(a, b);
  assert.ok(getSportMatchModelStore(a)?.fixtures.length > 0);
  assert.equal(a.date, b.date);
  assert.equal(a.runtime.day, b.runtime.day);
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
  delete row.stats;
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


test('match model/21 player stats are football-owned, bounded by appearance/team goals and consume zero RNG', () => {
  let scoring = null;
  for (let seed = 8870; seed < 9400; seed += 1) {
    const state = matchDayState(seed);
    const beforeRng = structuredClone(state.rngState);
    const row = recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false });
    assert.ok(row?.stats);
    assert.deepEqual(state.rngState, beforeRng);
    const clubGoals = row.homeAway === 'home' ? row.result.homeGoals : row.result.awayGoals;
    assert.ok(row.stats.goals <= clubGoals);
    assert.ok(row.stats.assists <= Math.max(0, clubGoals - row.stats.goals));
    if (row.stats.goals > 0) { scoring = { state, row }; break; }
  }
  assert.ok(scoring, 'directed seed range should contain a factual player goal');
  assert.equal(scoring.state.world.sportMatchModel.milestones.firstGoal, scoring.row.id);
  const context = getCurrentMatchContext(scoring.state);
  assert.equal(context.goals, scoring.row.stats.goals);
  assert.equal(context.assists, scoring.row.stats.assists);
  assert.deepEqual(context.cards, { yellow: scoring.row.stats.yellowCards, red: scoring.row.stats.redCards });
});

test('match model/22 non-appearance has known zero stats and cannot be corrupted into goals/cards', () => {
  const state = matchDayState(8871);
  const row = recordOfficialMatchInPlace(state, { appeared: false, debutOccurred: false, injuryUnavailable: false });
  assert.deepEqual(row.stats, { goals: 0, assists: 0, yellowCards: 0, redCards: 0 });
  for (const key of ['goals', 'assists', 'yellowCards', 'redCards']) {
    const bad = structuredClone(state);
    bad.world.sportMatchModel.fixtures[0].stats[key] = 1;
    assert.throws(() => assertGameState(bad), invalidSave);
  }
});

test('match model/23 historical appeared row without stats makes firstGoal and season aggregate fail closed', () => {
  const state = validStoredState(8872);
  const first = state.world.sportMatchModel.fixtures[0];
  delete first.stats;
  state.world.sportMatchModel.milestones.firstGoal = null;

  state.date = '2026-08-12';
  state.runtime.day += 7;
  state.runtime.seasonDay += 7;
  for (let i = 0; i < 40 && state.world.sportMatchModel.milestones.firstGoal === null; i += 1) {
    recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false });
    if (state.world.sportMatchModel.fixtures.at(-1)?.stats?.goals > 0) break;
    state.date = new Date(Date.parse(state.date + 'T00:00:00Z') + 7 * 86400000).toISOString().slice(0, 10);
    state.runtime.day += 7;
    state.runtime.seasonDay += 7;
  }
  assert.equal(state.world.sportMatchModel.milestones.firstGoal, null, 'unknown earlier scoring history must block a claimed career first goal');
  const context = getSportContext(state);
  assert.equal(context.firstGoal, null);
  assert.equal(context.availability.firstGoal, 'unavailable');
  assert.equal(context.currentSeasonPlayerStats, null);
  assert.equal(context.availability.currentSeasonPlayerStats, 'unavailable');
  assert.doesNotThrow(() => assertGameState(state));
});

test('match model/24 complete current-season stats aggregate only persisted match stats and survive save/load', () => {
  const state = matchDayState(8873);
  for (let week = 0; week < 4; week += 1) {
    if (week > 0) {
      state.date = new Date(Date.parse(state.date + 'T00:00:00Z') + 7 * 86400000).toISOString().slice(0, 10);
      state.runtime.day += 7;
      state.runtime.seasonDay += 7;
    }
    recordOfficialMatchInPlace(state, { appeared: week !== 2, debutOccurred: false, injuryUnavailable: false });
  }
  const context = getSportContext(state);
  const rows = state.world.sportMatchModel.fixtures;
  const expected = rows.reduce((acc, row) => {
    if (row.player.appeared) acc.appearances += 1;
    acc.goals += row.stats.goals;
    acc.assists += row.stats.assists;
    acc.yellowCards += row.stats.yellowCards;
    acc.redCards += row.stats.redCards;
    return acc;
  }, { appearances: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 });
  assert.deepEqual(context.currentSeasonPlayerStats, { season: state.season, ...expected });
  assert.equal(context.availability.currentSeasonPlayerStats, 'known');
  const restored = loadSave(serializeSave(state));
  assert.deepEqual(getSportContext(restored).currentSeasonPlayerStats, context.currentSeasonPlayerStats);
});


test('A4 recent-six/1 aggregates exactly six complete current-club fixtures', () => {
  const state = matchDayState(8880);
  for (let week = 0; week < 6; week += 1) {
    if (week > 0) {
      state.date = new Date(Date.parse(state.date + 'T00:00:00Z') + 7 * 86400000).toISOString().slice(0, 10);
      state.runtime.day += 7;
      state.runtime.seasonDay += 7;
    }
    assert.ok(recordOfficialMatchInPlace(state, { appeared: week !== 4, debutOccurred: false, injuryUnavailable: false }));
  }
  const before = structuredClone(state);
  const recent = recentClubPlayerMatchStats(state, 6);
  assert.ok(recent);
  assert.equal(recent.matches, 6);
  const rows = state.world.sportMatchModel.fixtures.slice(-6);
  assert.equal(recent.appearances, rows.filter(row => row.player.appeared).length);
  assert.equal(recent.starts, rows.filter(row => row.player.started).length);
  assert.equal(recent.minutes, rows.reduce((sum, row) => sum + row.player.minutes, 0));
  assert.equal(recent.goals, rows.reduce((sum, row) => sum + row.stats.goals, 0));
  assert.equal(recent.wins + recent.draws + recent.losses, 6);
  assert.deepEqual(getSportContext(state).recentSixMatchStats, recent);
  assert.equal(getSportContext(state).availability.recentSixMatchStats, 'known');
  assert.deepEqual(state, before);
});

test('A4 recent-six/2 fails closed until six complete fixtures exist', () => {
  const state = matchDayState(8881);
  for (let week = 0; week < 5; week += 1) {
    if (week > 0) {
      state.date = new Date(Date.parse(state.date + 'T00:00:00Z') + 7 * 86400000).toISOString().slice(0, 10);
      state.runtime.day += 7;
      state.runtime.seasonDay += 7;
    }
    assert.ok(recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false }));
  }
  assert.equal(recentClubPlayerMatchStats(state, 6), null);
  assert.equal(getSportContext(state).recentSixMatchStats, null);
  assert.equal(getSportContext(state).availability.recentSixMatchStats, 'unavailable');
});

test('A4 recent-six/3 fails closed when a selected historical row lacks result or stats', () => {
  const state = matchDayState(8882);
  for (let week = 0; week < 6; week += 1) {
    if (week > 0) {
      state.date = new Date(Date.parse(state.date + 'T00:00:00Z') + 7 * 86400000).toISOString().slice(0, 10);
      state.runtime.day += 7;
      state.runtime.seasonDay += 7;
    }
    assert.ok(recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false }));
  }
  delete state.world.sportMatchModel.fixtures[2].stats;
  state.world.sportMatchModel.milestones.firstGoal = null;
  assert.equal(recentClubPlayerMatchStats(state, 6), null);
  assert.equal(getSportContext(state).recentSixMatchStats, null);
});

test('A4 recent-six/4 is current-registration-club scoped and unattached fail-closed', () => {
  const state = matchDayState(8883);
  for (let week = 0; week < 6; week += 1) {
    if (week > 0) {
      state.date = new Date(Date.parse(state.date + 'T00:00:00Z') + 7 * 86400000).toISOString().slice(0, 10);
      state.runtime.day += 7;
      state.runtime.seasonDay += 7;
    }
    assert.ok(recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false }));
  }
  assert.ok(recentClubPlayerMatchStats(state, 6));
  state.professional.registrationClub = 'NEW_CLUB';
  state.club = 'NEW_CLUB';
  assert.equal(recentClubPlayerMatchStats(state, 6), null);
  state.employment = {
    version: 1,
    status: 'unattached',
    since: state.date,
    previous: {
      club: 'NEW_CLUB',
      ownerClub: state.professional.ownerClub,
      registrationClub: 'NEW_CLUB',
      salaryMonthly: state.contract.salaryMonthly,
      endedDate: state.date,
      reason: 'contract_expired'
    }
  };
  assert.equal(getSportContext(state).recentSixMatchStats, null);
  assert.equal(getSportContext(state).availability.recentSixMatchStats, 'unavailable');
});


test('A4 prior-two/1 excludes current-day bench row from the scoring window', () => {
  const state = matchDayState(8890);
  // Two prior factual matches.
  state.date = '2026-08-05'; state.runtime.day = 35; state.runtime.seasonDay = 35;
  const first = recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  assert.ok(first?.stats);
  state.date = '2026-08-12'; state.runtime.day = 42; state.runtime.seasonDay = 42;
  const second = recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  assert.ok(second?.stats);

  // Current match/lineup fact must not be included in priorTwo.
  state.date = '2026-08-19'; state.runtime.day = 49; state.runtime.seasonDay = 49;
  const current = recordOfficialMatchInPlace(state, { appeared: false, debutOccurred: false, injuryUnavailable: false });
  assert.ok(current);
  const before = structuredClone(state);
  const prior = priorClubPlayerMatchStats(state, 2);
  assert.ok(prior);
  assert.deepEqual(prior.fixtureIds, [first.id, second.id]);
  assert.equal(prior.goals, first.stats.goals + second.stats.goals);
  assert.equal(getSportContext(state).priorTwoMatchStats?.goals, prior.goals);
  assert.equal(getCurrentMatchContext(state).fixtureId, current.id);
  assert.equal(getCurrentMatchContext(state).playerOnBench, current.player.onBench);
  assert.deepEqual(state, before);
});

test('A4 prior-two/2 fails closed for incomplete history, transfer and unattached state', () => {
  const state = matchDayState(8891);
  state.date = '2026-08-05'; state.runtime.day = 35; state.runtime.seasonDay = 35;
  assert.ok(recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false }));
  state.date = '2026-08-12'; state.runtime.day = 42; state.runtime.seasonDay = 42;
  assert.equal(priorClubPlayerMatchStats(state, 2), null);

  assert.ok(recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false }));
  state.date = '2026-08-19'; state.runtime.day = 49; state.runtime.seasonDay = 49;
  assert.ok(recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false }));
  assert.ok(priorClubPlayerMatchStats(state, 2));

  state.professional.registrationClub = 'NEW_CLUB'; state.club = 'NEW_CLUB';
  assert.equal(priorClubPlayerMatchStats(state, 2), null);
  state.employment = {
    version: 1, status: 'unattached', since: state.date,
    previous: {
      club: 'NEW_CLUB', ownerClub: state.professional.ownerClub, registrationClub: 'NEW_CLUB',
      salaryMonthly: state.contract.salaryMonthly, endedDate: state.date, reason: 'contract_expired'
    }
  };
  assert.equal(getSportContext(state).priorTwoMatchStats, null);
  assert.equal(getSportContext(state).availability.priorTwoMatchStats, 'unavailable');
});


function weeklySportState(seed) {
  const state = createInitialState(seed);
  state.date = '2026-08-04';
  state.runtime.day = 6;
  state.runtime.seasonDay = 6;
  state.sport.roleScore = 100;
  state.sport.form = 70;
  state.body.risk = 0;
  state.body.acuteInjury = false;
  state.flags.RECOVERING_INJURY = false;
  state.flags.LONG_INJURY = false;
  state.world.injuryWeeksRemaining = 0;
  state.sport.appearances = 0;
  state.flags.OFFICIAL_DEBUT = false;
  return state;
}

function findWeeklyAppearanceSeed() {
  for (let seed = 9100; seed < 9400; seed += 1) {
    const state = weeklySportState(seed);
    advanceWorldDayInPlace(state);
    if (state.sport.appearances === 1) return seed;
  }
  throw new Error('No deterministic weekly appearance seed found');
}

test('T5.5 sport regression/1 injured player cannot appear and the official row records unavailability', () => {
  const seed = findWeeklyAppearanceSeed();
  const state = weeklySportState(seed);
  state.world.injuryWeeksRemaining = 3;
  state.body.acuteInjury = true;
  state.flags.RECOVERING_INJURY = true;
  advanceWorldDayInPlace(state);
  assert.equal(state.sport.appearances, 0);
  assert.equal(state.flags.OFFICIAL_DEBUT, false);
  const row = currentOfficialMatch(state);
  assert.ok(row);
  assert.equal(row.player.appeared, false);
  assert.equal(row.player.injuryUnavailable, true);
});

test('T5.5 sport regression/2 clearance restores eligibility on the week the injury reaches zero', () => {
  const seed = findWeeklyAppearanceSeed();
  const state = weeklySportState(seed);
  state.world.injuryWeeksRemaining = 1;
  state.body.acuteInjury = true;
  state.flags.RECOVERING_INJURY = true;
  advanceWorldDayInPlace(state);
  assert.equal(state.world.injuryWeeksRemaining, 0);
  assert.equal(state.body.acuteInjury, false);
  assert.equal(state.flags.RECOVERING_INJURY, false);
  assert.equal(state.sport.appearances, 1);
  assert.equal(currentOfficialMatch(state)?.player.injuryUnavailable, false);
});

test('T5.5 sport regression/3 first real appearance creates exactly one career appearance and one debut', () => {
  const seed = findWeeklyAppearanceSeed();
  const state = weeklySportState(seed);
  advanceWorldDayInPlace(state);
  assert.equal(state.sport.appearances, 1);
  assert.equal(state.flags.OFFICIAL_DEBUT, true);
  const row = currentOfficialMatch(state);
  assert.ok(row);
  assert.equal(row.player.appeared, true);
  assert.equal(row.player.debut, true);
  assert.equal(getSportMatchModelStore(state).fixtures.length, 1);
});

test('T5.5 sport regression/4 no weekly appearance can ever manufacture a debut flag', () => {
  let checkedAbsence = false;
  for (let seed = 9400; seed < 9700; seed += 1) {
    const state = weeklySportState(seed);
    state.sport.roleScore = 25;
    advanceWorldDayInPlace(state);
    if (state.sport.appearances === 0) {
      checkedAbsence = true;
      assert.equal(state.flags.OFFICIAL_DEBUT, false);
    }
  }
  assert.equal(checkedAbsence, true);
});

test('T5.5 sport regression/5 save-load keeps the debut as one match and does not duplicate it on a non-match day', () => {
  const seed = findWeeklyAppearanceSeed();
  const state = weeklySportState(seed);
  advanceWorldDayInPlace(state);
  const firstId = currentOfficialMatch(state)?.id;
  assert.ok(firstId);
  const restored = loadSave(serializeSave(state));
  assert.equal(restored.sport.appearances, 1);
  assert.equal(getSportMatchModelStore(restored).fixtures.length, 1);
  assert.equal(currentOfficialMatch(restored)?.id, firstId);
  advanceWorldDayInPlace(restored);
  assert.equal(restored.sport.appearances, 1);
  assert.equal(getSportMatchModelStore(restored).fixtures.length, 1);
  assert.equal(getSportMatchModelStore(restored).fixtures[0]?.id, firstId);
  assert.equal(currentOfficialMatch(restored), null);
});




test('T15.1 match week produces one authoritative sports resolution', () => {
  const seed = findWeeklyAppearanceSeed();
  const state = weeklySportState(seed);
  advanceWorldDayInPlace(state);
  const row = currentOfficialMatch(state);
  assert.ok(row);
  assert.ok(row.result);
  assert.ok(row.stats);
  assert.equal(getSportMatchModelStore(state).fixtures.length, 1);
});

test('T15.2 non-match week creates neither fixture nor appearance', () => {
  const state = createInitialState(15002);
  state.date = '2026-08-05';
  state.runtime.day = 35;
  state.runtime.seasonDay = 35;
  state.sport.roleScore = 100;
  const beforeAppearances = state.sport.appearances;
  advanceWorldDayInPlace(state);
  assert.equal(state.date, '2026-08-06');
  assert.equal(state.sport.appearances, beforeAppearances);
  assert.equal(currentOfficialMatch(state), null);
  assert.equal(getSportMatchModelStore(state), null);
});

test('T15.6-T15.8 starter, entering substitute and unused bench aggregate exactly once', () => {
  const covered = new Map();
  for (let seed = 15300; seed < 15800 && covered.size < 3; seed += 1) {
    for (const appeared of [true, false]) {
      const state = matchDayState(seed);
      const context = buildMatchPerformanceContext(state, 50);
      const row = recordOfficialMatchInPlace(state, {
        appeared,
        debutOccurred: false,
        injuryUnavailable: false,
        ...(context ? { performanceContext: context } : {})
      });
      const kind = row.player.started ? 'starter'
        : row.player.appeared ? 'substitute'
        : row.player.onBench ? 'unused_bench'
        : null;
      if (!kind || covered.has(kind)) continue;
      const stats = detailedSeasonPlayerStats(state);
      assert.ok(stats);
      if (kind === 'starter') {
        assert.equal(stats.appearances, 1);
        assert.equal(stats.starts, 1);
      } else if (kind === 'substitute') {
        assert.equal(stats.appearances, 1);
        assert.equal(stats.starts, 0);
      } else {
        assert.equal(stats.appearances, 0);
        assert.equal(stats.starts, 0);
        assert.equal(row.player.minutes, 0);
      }
      covered.set(kind, row.id);
    }
  }
  assert.deepEqual([...covered.keys()].sort(), ['starter', 'substitute', 'unused_bench']);
});

test('T15.5 suspended player does not participate and serves exactly one suspension fixture', () => {
  const seed = findWeeklyAppearanceSeed();
  const state = weeklySportState(seed);
  state.sport.suspensionMatches = 1;
  advanceWorldDayInPlace(state);
  assert.equal(state.sport.appearances, 0);
  assert.equal(state.sport.suspensionMatches, 0);
  const row = currentOfficialMatch(state);
  assert.ok(row);
  assert.equal(row.player.appeared, false);
  assert.equal(row.player.calledUp, false);
  assert.equal(row.player.suspensionUnavailable, true);
});

test('T15.12-T15.14 season aggregates are exact sums of persisted starts, minutes, goals and assists', () => {
  const state = matchDayState(15012);
  for (let i = 0; i < 4; i += 1) {
    recordOfficialMatchInPlace(state, {
      appeared: i !== 2,
      debutOccurred: i === 0,
      injuryUnavailable: false,
      suspensionUnavailable: false
    });
    if (i < 3) {
      const d = new Date(state.date + 'T00:00:00Z');
      d.setUTCDate(d.getUTCDate() + 7);
      state.date = d.toISOString().slice(0, 10);
      state.runtime.day += 7;
      state.runtime.seasonDay += 7;
    }
  }
  const rows = getSportMatchModelStore(state).fixtures;
  const legacyStats = seasonPlayerStats(state);
  const stats = detailedSeasonPlayerStats(state);
  assert.ok(legacyStats && stats);
  assert.equal(stats.appearances, rows.filter(row => row.player.appeared).length);
  assert.equal(stats.starts, rows.filter(row => row.player.started).length);
  assert.equal(stats.minutes, rows.reduce((sum, row) => sum + row.player.minutes, 0));
  assert.equal(stats.goals, rows.reduce((sum, row) => sum + (row.stats?.goals ?? 0), 0));
  assert.equal(stats.assists, rows.reduce((sum, row) => sum + (row.stats?.assists ?? 0), 0));
  assert.ok(stats.averageRating === null || (stats.averageRating >= 3.5 && stats.averageRating <= 10));
});

test('T15 career history preserves prior club rows instead of rewriting them after a transfer', () => {
  const state = matchDayState(15017);
  recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: true, injuryUnavailable: false });
  const oldId = currentOfficialMatch(state).id;
  const d = new Date(state.date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 7);
  state.date = d.toISOString().slice(0, 10);
  state.runtime.day += 7;
  state.runtime.seasonDay += 7;
  state.professional.registrationClub = 'NEW_CLUB';
  state.club = 'NEW_CLUB';
  recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  const records = careerSeasonRecords(state);
  assert.equal(records.length, 2);
  assert.equal(records[0].club, 'UDV');
  assert.equal(records[1].club, 'NEW_CLUB');
  assert.equal(getSportMatchModelStore(state).fixtures[0].id, oldId);
  assert.equal(getSportMatchModelStore(state).fixtures[0].club, 'UDV');
});

test('T15 CareerMatchResult exposes structured weekly sports output and factual milestones', () => {
  const state = matchDayState(15018);
  const row = recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: true, injuryUnavailable: false });
  const result = currentCareerMatchResult(state);
  assert.ok(row && result);
  assert.equal(result.matchId, row.id);
  assert.equal(result.selected, row.player.calledUp);
  assert.equal(result.started, row.player.started);
  assert.equal(result.minutes, row.player.minutes);
  assert.equal(result.goals, row.stats.goals);
  assert.equal(result.assists, row.stats.assists);
  assert.equal(result.statDeltas.appearances, 1);
  assert.ok(result.milestones.includes('debut'));
  assert.ok(result.rating >= 3.5 && result.rating <= 10);
});

test('T15.18 same seed + same fixture + same observed appearance gives identical rating and survives later form changes', () => {
  const a = matchDayState(15019);
  const b = matchDayState(15019);
  const input = { appeared: true, debutOccurred: false, injuryUnavailable: false, suspensionUnavailable: false };
  const rowA = recordOfficialMatchInPlace(a, input);
  const rowB = recordOfficialMatchInPlace(b, input);
  assert.deepEqual(rowA, rowB);
  a.sport.form = 1;
  a.sport.roleScore = 99;
  const restored = loadSave(serializeSave(a));
  assert.deepEqual(getSportMatchModelStore(restored).fixtures[0], rowA);
});

test('T15 discipline: a fifth yellow creates a one-match suspension for the next official fixture', () => {
  let found = false;
  for (let seed = 15100; seed < 16100 && !found; seed += 1) {
    const state = weeklySportState(seed);
    state.sport.yellowCardAccumulation = 4;
    advanceWorldDayInPlace(state);
    const row = currentOfficialMatch(state);
    if (row?.player.appeared && row.stats?.yellowCards === 1) {
      found = true;
      assert.equal(state.sport.yellowCardAccumulation, 0);
      assert.ok(state.sport.suspensionMatches >= 1);
    }
  }
  assert.equal(found, true);
});


test('T15 long-run seeds 1/42/777/424242 produce a real 18-to-19 football season with persisted variety', () => {
  for (const seed of [1, 42, 777, 424242]) {
    const state = createInitialState(seed);
    let rejectedBlockingOffers = 0;
    for (let day = 0; day < 365; day += 1) {
      const blocking = state.market?.pending;
      if (blocking && !blocking.validThrough) {
        // Long-run A15 certification isolates sports progression from user-held market
        // decisions without changing market semantics or auto-accepting a career move.
        respondToOffer(state, blocking.id, 'reject');
        rejectedBlockingOffers += 1;
      }
      advanceWorldDayInPlace(state);
    }
    const store = getSportMatchModelStore(state);
    assert.ok(store);
    const seasonRows = store.fixtures.filter(row => row.season === '2026-27');
    const appeared = seasonRows.filter(row => row.player.appeared);
    const starts = appeared.filter(row => row.player.started);
    const minutes = appeared.reduce((sum, row) => sum + row.player.minutes, 0);
    const goals = appeared.reduce((sum, row) => sum + (row.stats?.goals ?? 0), 0);
    const assists = appeared.reduce((sum, row) => sum + (row.stats?.assists ?? 0), 0);
    console.log(`A15_SEED seed=${seed} fixtures=${seasonRows.length} appearances=${appeared.length} starts=${starts.length} minutes=${minutes} goals=${goals} assists=${assists} role=${state.sport.roleScore} form=${state.sport.form} rejectedBlockingOffers=${rejectedBlockingOffers}`);
    assert.ok(seasonRows.length >= 35, `seed ${seed} should have a real league calendar`);
    assert.ok(appeared.length >= 2, `seed ${seed} should not produce an absurdly empty normal season`);
    assert.ok(minutes > 0, `seed ${seed} appearances must carry minutes`);
    assert.equal(new Set(seasonRows.map(row => row.id)).size, seasonRows.length);
  }
});


test('T15.15 weekly role progression persists exactly across save/load', () => {
  const state = weeklySportState(1515);
  state.sport.roleScore = 50;
  state.sport.form = 72;
  const beforeRole = state.sport.roleScore;
  advanceWorldDayInPlace(state);
  assert.notEqual(state.sport.roleScore, beforeRole);
  const restored = loadSave(serializeSave(state));
  assert.equal(restored.sport.roleScore, state.sport.roleScore);
  assert.equal(restored.sport.form, state.sport.form);
});

test('T15.16 season transition preserves the prior-season persisted match ledger', () => {
  const state = createInitialState(1516);
  state.date = '2027-05-05';
  state.runtime.day = 308;
  state.runtime.seasonDay = 308;
  state.season = '2026-27';
  const row = recordOfficialMatchInPlace(state, {
    appeared: true,
    debutOccurred: true,
    injuryUnavailable: false,
    suspensionUnavailable: false
  });
  assert.ok(row);
  const priorId = row.id;
  state.date = '2027-06-30';
  state.runtime.day = 364;
  state.runtime.seasonDay = 364;
  advanceWorldDayInPlace(state);
  assert.equal(state.date, '2027-07-01');
  assert.equal(state.season, '2027-28');
  const store = getSportMatchModelStore(state);
  assert.equal(store.fixtures[0].id, priorId);
  assert.equal(store.fixtures[0].season, '2026-27');
  const records = careerSeasonRecords(state);
  assert.ok(records.some(record => record.season === '2026-27' && record.club === 'UDV'));
});


test('T15/A17 certified coach change with unknown replacement neutralizes historical coach trust', () => {
  const highOldTrust = weeklySportState(1517);
  const lowOldTrust = weeklySportState(1517);
  for (const state of [highOldTrust, lowOldTrust]) {
    state.sport.roleScore = 30;
    state.sport.form = 50;
  }
  const highRelationship = highOldTrust.relationships.find(row => row.npcId === 'NPC_CCH_01');
  const lowRelationship = lowOldTrust.relationships.find(row => row.npcId === 'NPC_CCH_01');
  assert.ok(highRelationship && lowRelationship);
  highRelationship.trust = 100;
  lowRelationship.trust = 0;
  certifyCoachChangeInPlace(highOldTrust, 'external_change');
  certifyCoachChangeInPlace(lowOldTrust, 'external_change');

  advanceWorldDayInPlace(highOldTrust);
  advanceWorldDayInPlace(lowOldTrust);

  assert.equal(highOldTrust.sport.roleScore, lowOldTrust.sport.roleScore);
  assert.equal(highOldTrust.sport.form, lowOldTrust.sport.form);
});


test('T15 A16 handoff persists performance context, season age/role and structured sports deltas', () => {
  const seed = findWeeklyAppearanceSeed();
  const state = weeklySportState(seed);
  const before = {
    form: state.sport.form,
    fatigue: state.body.fatigue,
    fitness: state.body.fitness,
    role: state.sport.roleScore
  };
  advanceWorldDayInPlace(state);
  const row = currentOfficialMatch(state);
  const result = currentCareerMatchResult(state);
  assert.ok(row?.performanceContext);
  assert.ok(row?.effects);
  assert.ok(result);
  assert.deepEqual(result.sportDeltas, row.effects);
  assert.equal(result.sportDeltas.formDelta, Math.round((state.sport.form - before.form) * 1000) / 1000);
  assert.equal(result.sportDeltas.fatigueDelta, Math.round((state.body.fatigue - before.fatigue) * 1000) / 1000);
  assert.equal(result.sportDeltas.fitnessDelta, Math.round((state.body.fitness - before.fitness) * 1000) / 1000);
  assert.equal(result.sportDeltas.roleScoreDelta, Math.round((state.sport.roleScore - before.role) * 1000) / 1000);

  const record = careerSeasonRecords(state)[0];
  assert.equal(record.age, 18);
  assert.equal(record.role, 'academy_callup');
  assert.equal(typeof record.roleScore, 'number');

  const restored = loadSave(serializeSave(state));
  assert.deepEqual(currentOfficialMatch(restored), row);
  assert.deepEqual(currentCareerMatchResult(restored), result);
});

test('T15 performance uses persisted form/fitness/fatigue/role context while team result stays fixture-owned', () => {
  const low = matchDayState(15210);
  const high = matchDayState(15210);
  Object.assign(low.sport, { roleScore: 12, form: 25, positionIdentity: 'winger' });
  Object.assign(low.body, { fitness: 48, fatigue: 78 });
  Object.assign(high.sport, { roleScore: 88, form: 86, positionIdentity: 'winger' });
  Object.assign(high.body, { fitness: 94, fatigue: 12 });

  const lowContext = buildMatchPerformanceContext(low, 20);
  const highContext = buildMatchPerformanceContext(high, 82);
  assert.ok(lowContext && highContext);
  const rowLow = recordOfficialMatchInPlace(low, {
    appeared: true, debutOccurred: false, injuryUnavailable: false, performanceContext: lowContext
  });
  const rowHigh = recordOfficialMatchInPlace(high, {
    appeared: true, debutOccurred: false, injuryUnavailable: false, performanceContext: highContext
  });
  assert.deepEqual(rowLow.result, rowHigh.result);
  assert.notEqual(rowLow.stats.rating, rowHigh.stats.rating);
  assert.ok(rowLow.player.minutes >= 1 && rowLow.player.minutes <= 90);
  assert.ok(rowHigh.player.minutes >= 1 && rowHigh.player.minutes <= 90);
});

test('T15 corrupted persisted performance context fails closed at save boundary', () => {
  const seed = findWeeklyAppearanceSeed();
  const state = weeklySportState(seed);
  advanceWorldDayInPlace(state);
  const raw = JSON.parse(serializeSave(state));
  raw.world.sportMatchModel.fixtures[0].performanceContext.form = 999;
  assert.throws(() => loadSave(JSON.stringify(raw)), invalidSave);
});


test('T15/A17 closed retirement blocks sports mutation and match production', () => {
  const state = weeklySportState(15999);
  state.retirement.status = 'closed';
  state.retirement.closedDate = state.date;
  const before = {
    appearances: state.sport.appearances,
    form: state.sport.form,
    roleScore: state.sport.roleScore,
    fatigue: state.body.fatigue,
    fitness: state.body.fitness,
    rng: structuredClone(state.rngState.football)
  };
  advanceWorldDayInPlace(state);
  assert.equal(state.sport.appearances, before.appearances);
  assert.equal(state.sport.form, before.form);
  assert.equal(state.sport.roleScore, before.roleScore);
  assert.equal(state.body.fatigue, before.fatigue);
  assert.equal(state.body.fitness, before.fitness);
  assert.deepEqual(state.rngState.football, before.rng);
  assert.equal(currentOfficialMatch(state), null);
});
