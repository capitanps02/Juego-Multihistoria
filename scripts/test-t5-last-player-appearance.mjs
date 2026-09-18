import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import { getLastPlayerAppearanceContext, getSportContext } from '../dist/simulation/sport-context.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

function matchDayState(seed = 9700) {
  const state = createInitialState(seed);
  state.date = '2026-08-05';
  state.runtime.day = 35;
  state.runtime.seasonDay = 35;
  return state;
}

test('last appearance/1 skips later non-appearance and exposes the factual rich row', () => {
  const state = matchDayState(9701);
  const first = recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  assert.ok(first);

  state.date = '2026-08-12';
  state.runtime.day += 7;
  state.runtime.seasonDay += 7;
  const second = recordOfficialMatchInPlace(state, { appeared: false, debutOccurred: false, injuryUnavailable: false });
  assert.ok(second);
  assert.equal(second.player.appeared, false);

  const context = getLastPlayerAppearanceContext(state);
  assert.equal(context.status, 'authoritative');
  assert.equal(context.fixtureId, first.id);
  assert.equal(context.date, first.date);
  assert.equal(context.competition, first.competition);
  assert.equal(context.opponent, first.opponent);
  assert.equal(context.homeAway, first.homeAway);
  assert.equal(context.started, first.player.started);
  assert.equal(context.onBench, first.player.onBench);
  assert.equal(context.minutes, first.player.minutes);
  assert.deepEqual(context.result, first.result);
  assert.equal(context.goals, first.stats.goals);
  assert.equal(context.assists, first.stats.assists);
  assert.deepEqual(context.cards, { yellow: first.stats.yellowCards, red: first.stats.redCards });
  assert.equal(getSportContext(state).lastPlayerAppearanceContext.fixtureId, first.id);
});

test('last appearance/2 historical row with unknown result/stats preserves known identity and fails closed on missing details', () => {
  const state = matchDayState(9702);
  const row = recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  assert.ok(row);
  delete row.result;
  delete row.stats;
  state.world.sportMatchModel.milestones.firstGoal = null;

  const before = structuredClone(state);
  const context = getLastPlayerAppearanceContext(state);
  assert.equal(context.status, 'authoritative');
  assert.equal(context.fixtureId, row.id);
  assert.equal(context.minutes, row.player.minutes);
  assert.equal(context.result, null);
  assert.equal(context.goals, null);
  assert.equal(context.assists, null);
  assert.equal(context.cards, null);
  assert.deepEqual(state, before);
});

test('last appearance/3 no factual appearance stays unavailable despite aggregate appearances/proxies', () => {
  const state = matchDayState(9703);
  state.sport.appearances = 99;
  state.sport.roleScore = 99;
  state.sport.form = 99;
  state.flags.OFFICIAL_DEBUT = true;
  const row = recordOfficialMatchInPlace(state, { appeared: false, debutOccurred: false, injuryUnavailable: false });
  assert.ok(row);
  const context = getLastPlayerAppearanceContext(state);
  assert.equal(context.status, 'unavailable');
  assert.equal(context.fixtureId, null);
});

test('last appearance/4 read is mutation/RNG free and stable across save/load', () => {
  const state = matchDayState(9704);
  recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  const before = structuredClone(state);
  const a = getLastPlayerAppearanceContext(state);
  const b = getLastPlayerAppearanceContext(state);
  assert.deepEqual(a, b);
  assert.deepEqual(state, before);

  const restored = loadSave(serializeSave(state));
  assert.deepEqual(getLastPlayerAppearanceContext(restored), a);
  assert.deepEqual(restored.rngState, state.rngState);
});
