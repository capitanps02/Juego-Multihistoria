import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { narrativeConditionRoot } from '../dist/simulation/club-contract-intent.js';
import { recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import {
  currentPenaltyDecisionSetup,
  getPenaltySetupStore,
  inspectPenaltySetupStore,
  recordPenaltyDecisionSetupInPlace
} from '../dist/simulation/match-penalty-context.js';
import { getCurrentMatchContext } from '../dist/simulation/sport-context.js';
import { assertGameState } from '../dist/save/validation.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

const invalidSave = error => error?.code === 'INVALID_SAVE';

function matchDayState(seed = 9100) {
  const state = createInitialState(seed);
  state.date = '2026-08-05';
  state.runtime.day = 35;
  state.runtime.seasonDay = 35;
  return state;
}

function appearedMatchState(seed) {
  const state = matchDayState(seed);
  const match = recordOfficialMatchInPlace(state, {
    appeared: true,
    debutOccurred: false,
    injuryUnavailable: false
  });
  assert.ok(match);
  return { state, match };
}

function stateWithPenaltySetup() {
  for (let seed = 9100; seed < 12000; seed += 1) {
    const { state, match } = appearedMatchState(seed);
    const setup = recordPenaltyDecisionSetupInPlace(state, match);
    if (setup) return { state, match, setup };
  }
  throw new Error('No deterministic penalty setup found in directed seed range');
}

test('penalty setup/1 materialization is deterministic, idempotent and consumes zero RNG draws', () => {
  const { state, match, setup } = stateWithPenaltySetup();
  const beforeRng = structuredClone(state.rngState);
  const repeated = recordPenaltyDecisionSetupInPlace(state, match);
  assert.deepEqual(repeated, setup);
  assert.equal(getPenaltySetupStore(state).contexts.length, 1);
  assert.deepEqual(state.rngState, beforeRng);
});

test('penalty setup/2 narrative RNG changes cannot alter a persisted sporting fixture setup', () => {
  const { state, match } = stateWithPenaltySetup();
  delete state.world.sportPenaltySetups;
  const baseline = structuredClone(state);
  baseline.rngState.narrative.seed += 991;
  baseline.rngState.narrative.state += 177;
  baseline.rngState.narrative.draws += 23;

  const a = recordPenaltyDecisionSetupInPlace(state, match);
  const sameMatch = baseline.world.sportMatchModel.fixtures.find(row => row.id === match.id);
  const b = recordPenaltyDecisionSetupInPlace(baseline, sameMatch);
  assert.ok(a);
  assert.deepEqual(b, a);
});

test('penalty setup/3 player must actually appear; role/form/reputation cannot fabricate the context', () => {
  const state = matchDayState(9103);
  state.sport.roleScore = 100;
  state.sport.form = 100;
  state.reputation.prestige = 100;
  const match = recordOfficialMatchInPlace(state, {
    appeared: false,
    debutOccurred: false,
    injuryUnavailable: false
  });
  assert.ok(match);
  assert.equal(match.player.appeared, false);
  assert.equal(recordPenaltyDecisionSetupInPlace(state, match), null);
  assert.equal(currentPenaltyDecisionSetup(state), null);
  assert.equal(getCurrentMatchContext(state).penaltyDecisionContext, false);
});

test('penalty setup/4 current match facts expose prior miss + decision score without resolving goal/miss', () => {
  const { state, match, setup } = stateWithPenaltySetup();
  const context = getCurrentMatchContext(state);
  const root = narrativeConditionRoot(state);
  assert.equal(context.status, 'authoritative');
  assert.equal(context.fixtureId, match.id);
  assert.equal(context.playerAppeared, true);
  assert.equal(context.highProfileMatch, true);
  assert.equal(context.penaltyDecisionContext, true);
  assert.equal(context.designatedPenaltyTakerRef, setup.designatedTakerRef);
  assert.equal(context.designatedTakerMissedEarlier, true);
  assert.equal(context.priorPenaltyMinute, setup.priorMissMinute);
  assert.equal(context.penaltyDecisionMinute, setup.decisionMinute);
  assert.deepEqual(context.penaltyScoreAtDecision, { home: setup.scoreHome, away: setup.scoreAway });
  assert.equal(root.facts.match.penaltyDecisionContext, true);
  assert.equal(root.facts.match.designatedPenaltyTakerRef, setup.designatedTakerRef);
  assert.equal(Object.prototype.hasOwnProperty.call(setup, 'outcome'), false);
});

test('penalty setup/5 save/load preserves setup and validation consumes no RNG', () => {
  const { state } = stateWithPenaltySetup();
  const before = structuredClone(state);
  assert.equal(inspectPenaltySetupStore(state.world.sportPenaltySetups, state), null);
  assertGameState(state);
  assert.deepEqual(state, before);
  const restored = loadSave(serializeSave(state));
  assert.deepEqual(restored.world.sportPenaltySetups, state.world.sportPenaltySetups);
  assert.deepEqual(restored.rngState, state.rngState);
  assert.deepEqual(getCurrentMatchContext(restored), getCurrentMatchContext(state));
});

test('penalty setup/6 corrupt or cross-fixture setup fails closed at save/runtime boundary', () => {
  const { state } = stateWithPenaltySetup();
  const raw = JSON.parse(serializeSave(state));
  const mutations = [
    value => { value.world.sportPenaltySetups.contexts[0].fixtureId = 'fixture:foreign'; },
    value => { value.world.sportPenaltySetups.contexts[0].designatedTakerRef = 'NPC_CAPTAIN'; },
    value => { value.world.sportPenaltySetups.contexts[0].decisionMinute = value.world.sportPenaltySetups.contexts[0].priorMissMinute; },
    value => { value.world.sportPenaltySetups.contexts[0].scoreHome = 99; },
    value => { value.world.sportPenaltySetups.contexts[0].highProfile = false; },
    value => { value.world.sportPenaltySetups.contexts[0].extra = true; }
  ];
  for (const mutate of mutations) {
    const bad = structuredClone(raw);
    mutate(bad);
    assert.throws(() => assertGameState(bad), invalidSave);
    assert.throws(() => loadSave(JSON.stringify(bad)), invalidSave);
  }
});

test('penalty setup/7 historical saves may omit the optional setup store', () => {
  const state = matchDayState(9107);
  delete state.world.sportPenaltySetups;
  assert.doesNotThrow(() => assertGameState(state));
  const restored = loadSave(JSON.stringify(state));
  assert.equal(restored.world.sportPenaltySetups, undefined);
});
