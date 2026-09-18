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

test('last appearance/1 skips later non-appearance and exposes the exact factual row', () => {
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
  assert.equal(context.match?.id, first.id);
  assert.equal(context.match?.date, first.date);
  assert.deepEqual(context.match?.result, first.result);
  assert.equal(context.match?.stats?.goals, first.stats.goals);
  assert.equal(getSportContext(state).lastPlayerAppearanceContext.match?.id, first.id);
});

test('last appearance/2 historical row keeps identity while unsupported rich fields stay unknown', () => {
  const state = matchDayState(9702);
  const row = recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  assert.ok(row);
  delete row.result;
  delete row.stats;
  state.world.sportMatchModel.milestones.firstGoal = null;

  const before = structuredClone(state);
  const context = getLastPlayerAppearanceContext(state);
  assert.equal(context.status, 'authoritative');
  assert.equal(context.match?.id, row.id);
  assert.equal(context.match?.player.minutes, row.player.minutes);
  assert.equal(context.match?.result, undefined);
  assert.equal(context.match?.stats, undefined);
  assert.deepEqual(state, before);
});

test('last appearance/3 initialized store with no appearance is authoritative none, not unavailable', () => {
  const state = matchDayState(9703);
  state.sport.appearances = 99;
  state.sport.roleScore = 99;
  state.sport.form = 99;
  state.flags.OFFICIAL_DEBUT = true;
  const row = recordOfficialMatchInPlace(state, { appeared: false, debutOccurred: false, injuryUnavailable: false });
  assert.ok(row);
  const context = getLastPlayerAppearanceContext(state);
  assert.equal(context.status, 'authoritative');
  assert.equal(context.match, null);
  assert.equal(getSportContext(state).availability.lastPlayerAppearanceContext, 'known');
});

test('last appearance/4 historical save without store is explicitly unavailable', () => {
  const state = createInitialState(9704);
  delete state.world.sportMatchModel;
  const context = getLastPlayerAppearanceContext(state);
  assert.equal(context.status, 'historical_match_store_not_initialized');
  assert.equal(context.match, null);
  assert.equal(getSportContext(state).availability.lastPlayerAppearanceContext, 'unavailable');
});

test('last appearance/5 read is mutation/RNG free and stable across save/load', () => {
  const state = matchDayState(9705);
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
