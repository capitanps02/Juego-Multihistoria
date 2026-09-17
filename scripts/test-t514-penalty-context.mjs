import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import {
  currentPenaltyHierarchyContext,
  getSportPenaltyContextStore,
  inspectSportPenaltyContextStore,
  recordPenaltyHierarchyContextInPlace
} from '../dist/simulation/penalty-context.js';
import { getCurrentMatchContext } from '../dist/simulation/sport-context.js';
import { assertGameState } from '../dist/save/validation.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

const invalidSave = error => error?.code === 'INVALID_SAVE';

function matchDayState(seed = 9700) {
  const state = createInitialState(seed);
  state.date = '2026-10-07';
  state.runtime.day = 98;
  state.runtime.seasonDay = 98;
  return state;
}

function stateWithMatch(seed, appeared = true) {
  const state = matchDayState(seed);
  const match = recordOfficialMatchInPlace(state, {
    appeared,
    debutOccurred: false,
    injuryUnavailable: false
  });
  assert.ok(match);
  return { state, match };
}

function stateWithPenaltyContext() {
  for (let seed = 9700; seed < 12000; seed += 1) {
    const { state, match } = stateWithMatch(seed, true);
    const context = recordPenaltyHierarchyContextInPlace(state, match);
    if (context) return { state, match, context };
  }
  throw new Error('No deterministic penalty hierarchy context found in directed seed range');
}

test('T5.14 penalty context/1 never fabricates a hierarchy scene without a real player appearance', () => {
  for (let seed = 9700; seed < 9750; seed += 1) {
    const { state, match } = stateWithMatch(seed, false);
    state.sport.roleScore = 100;
    state.sport.form = 100;
    state.reputation.prestige = 100;
    assert.equal(recordPenaltyHierarchyContextInPlace(state, match), null);
    assert.equal(currentPenaltyHierarchyContext(state), null);
  }
});

test('T5.14 penalty context/2 produced setup is persisted, factual and consumes zero RNG', () => {
  const { state, match, context } = stateWithPenaltyContext();
  const beforeRng = structuredClone(state.rngState);
  const replay = recordPenaltyHierarchyContextInPlace(state, match);
  assert.deepEqual(replay, context);
  assert.deepEqual(state.rngState, beforeRng);
  assert.equal(context.fixtureId, match.id);
  assert.equal(context.playerOnField, true);
  assert.equal(context.importance, 'high_profile');
  assert.equal(context.designatedTakerMissedEarlier, true);
  assert.equal(context.designatedTakerId, 'TEAM_DESIGNATED_PENALTY_TAKER');
  assert.ok(context.minute >= 58 && context.minute <= 84);
  assert.ok(context.pressure >= 70 && context.pressure <= 100);
  assert.equal(getSportPenaltyContextStore(state).contexts.length, 1);
});

test('T5.14 penalty context/3 shared match facts expose the canonical setup without resolving the new penalty', () => {
  const { state, match, context } = stateWithPenaltyContext();
  const before = structuredClone(state);
  const facts = getCurrentMatchContext(state);
  assert.equal(facts.status, 'authoritative');
  assert.equal(facts.fixtureId, match.id);
  assert.equal(facts.playerAppeared, true);
  assert.equal(facts.penaltyHierarchyContext, true);
  assert.equal(facts.matchImportance, 'high_profile');
  assert.equal(facts.designatedPenaltyTakerId, context.designatedTakerId);
  assert.equal(facts.designatedTakerMissedEarlier, true);
  assert.equal(facts.penaltyDecisionMinute, context.minute);
  assert.deepEqual(facts.penaltyScoreAtDecision, { home: context.scoreHome, away: context.scoreAway });
  assert.equal(facts.penaltyPressure, context.pressure);
  assert.equal(state.world.footballMomentResults, undefined, 'pre-existing context must not resolve the new penalty');
  assert.deepEqual(state, before, 'read surface must be mutation-free');
});

test('T5.14 penalty context/4 save round-trip preserves exactly the same context and RNG', () => {
  const { state } = stateWithPenaltyContext();
  const beforeStore = structuredClone(state.world.sportPenaltyContexts);
  const beforeRng = structuredClone(state.rngState);
  const beforeFacts = getCurrentMatchContext(state);
  const restored = loadSave(serializeSave(state));
  assert.deepEqual(restored.world.sportPenaltyContexts, beforeStore);
  assert.deepEqual(restored.rngState, beforeRng);
  assert.deepEqual(getCurrentMatchContext(restored), beforeFacts);
});

test('T5.14 penalty context/5 historical saves may omit the optional context store', () => {
  const { state } = stateWithMatch(9791, true);
  delete state.world.sportPenaltyContexts;
  assert.doesNotThrow(() => assertGameState(state));
  const restored = loadSave(serializeSave(state));
  assert.equal(restored.world.sportPenaltyContexts, undefined);
});

test('T5.14 penalty context/6 orphaned, future, duplicate and malformed contexts fail closed', () => {
  const { state } = stateWithPenaltyContext();
  const raw = JSON.parse(serializeSave(state));
  const mutations = [
    value => { value.world.sportPenaltyContexts.contexts[0].fixtureId = 'fixture:unknown'; },
    value => { value.world.sportPenaltyContexts.contexts[0].date = '2099-01-01'; },
    value => { value.world.sportPenaltyContexts.contexts[0].playerOnField = false; },
    value => { value.world.sportPenaltyContexts.contexts[0].designatedTakerMissedEarlier = false; },
    value => { value.world.sportPenaltyContexts.contexts[0].pressure = 101; },
    value => { value.world.sportPenaltyContexts.contexts.push(structuredClone(value.world.sportPenaltyContexts.contexts[0])); },
    value => { value.world.sportPenaltyContexts.contexts[0].extra = true; }
  ];
  for (const mutate of mutations) {
    const bad = structuredClone(raw);
    mutate(bad);
    assert.throws(() => loadSave(JSON.stringify(bad)), invalidSave);
    assert.throws(() => assertGameState(bad), invalidSave);
  }
});

test('T5.14 penalty context/7 validation and reads consume zero RNG and mutate nothing', () => {
  const { state } = stateWithPenaltyContext();
  const before = structuredClone(state);
  assert.equal(inspectSportPenaltyContextStore(state.world.sportPenaltyContexts, state.date, state.world.sportMatchModel), null);
  assertGameState(state);
  currentPenaltyHierarchyContext(state);
  getCurrentMatchContext(state);
  assert.deepEqual(state, before);
});
