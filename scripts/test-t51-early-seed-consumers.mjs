import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_18_20 } from '../dist/content/events/index.js';
import { resolveChoice } from '../dist/narrative/resolver.js';

const byId = id => {
  const event = EVENTS_18_20.find(row => row.id === id);
  assert.ok(event, `missing ${id}`);
  return event;
};

function addSeed(state, id, originEvent, payload, seedState = 'active') {
  state.seeds.push({
    id,
    state: seedState,
    intensity: 55,
    originEvent,
    originSeason: state.season,
    npcRefs: [],
    payload: { __t52OriginClub: state.club, ...payload },
    lastTouchedDate: state.date
  });
}

function weightsFor(eventId, choiceId, seeds, seed = 77001) {
  const state = createInitialState(seed);
  state.age = eventId.startsWith('CEVT_19') ? 19 : 18;
  for (const row of seeds) addSeed(state, ...row);
  const before = structuredClone(state);
  const result = resolveChoice(state, byId(eventId), choiceId, true);
  assert.equal(result.state.rngState.narrative.draws, before.rngState.narrative.draws + 1, `${eventId} must keep one narrative draw`);
  return Object.fromEntries(result.debug.outcomeWeights.map(row => [row.id, row.weight]));
}

test('Bruno favor payload changes the later callback and terminal memory does not act live', () => {
  const helped = weightsFor('CEVT_18_BRUNO_01', 'ASK_ROLE', [['SEED_BRUNO_FAVOR', 'EVT_18_TEAM_001', { stance: 'helped' }]], 77101);
  const betrayed = weightsFor('CEVT_18_BRUNO_01', 'ASK_ROLE', [['SEED_BRUNO_FAVOR', 'EVT_18_TEAM_001', { stance: 'betrayed' }]], 77101);
  const terminal = weightsFor('CEVT_18_BRUNO_01', 'ASK_ROLE', [['SEED_BRUNO_FAVOR', 'EVT_18_TEAM_001', { stance: 'helped' }, 'resolved']], 77101);
  assert.ok(helped.ASK_ROLE__PRIMARY > terminal.ASK_ROLE__PRIMARY);
  assert.ok(betrayed.ASK_ROLE__SECONDARY > terminal.ASK_ROLE__SECONDARY);
});

test('Mena early read changes Mena-facing reception after coach change', () => {
  const adaptive = weightsFor('CEVT_18_CCH_01', 'MENA', [['SEED_MENA_EARLY_READ', 'EVT_18_PRE_003', { read: 'adaptive' }]], 77201);
  const disobedient = weightsFor('CEVT_18_CCH_01', 'MENA', [['SEED_MENA_EARLY_READ', 'EVT_18_PRE_003', { read: 'disobedient' }]], 77201);
  assert.ok(adaptive.MENA__PRIMARY > disobedient.MENA__PRIMARY);
  assert.ok(disobedient.MENA__SECONDARY > adaptive.MENA__SECONDARY);
});

test('exit-style memory changes relegation route interpretation without mutating contract authority', () => {
  const stay = weightsFor('CEVT_18_RELEG_01', 'STAY_ROLE', [['SEED_EXIT_STYLE_UDV', 'EVT_18_JAN_001', { january: 'stay' }]], 77301);
  const contested = weightsFor('CEVT_18_RELEG_01', 'EXIT', [['SEED_EXIT_STYLE_UDV', 'EVT_18_JAN_001', { january: 'transfer_contested' }]], 77301);
  assert.ok(stay.STAY_ROLE__PRIMARY > 55);
  assert.ok(contested.EXIT__SECONDARY > 45);
});

test('body and physio memory alter injury outcome weights without forcing certainty', () => {
  const managed = weightsFor('CEVT_19_INJ_01', 'CONSERVATIVE', [
    ['SEED_BODY_PRECEDENT', 'EVT_18_PRE_002', { pattern: 'managed' }],
    ['SEED_PHYSIO_CONFIDENCE', 'EVT_18_MED_001', { pattern: 'followed' }]
  ], 77401);
  const overload = weightsFor('CEVT_19_INJ_01', 'CONSERVATIVE', [
    ['SEED_BODY_PRECEDENT', 'EVT_18_PRE_002', { pattern: 'overload' }]
  ], 77401);
  assert.ok(managed.CONSERVATIVE__PRIMARY > 55);
  assert.ok(overload.CONSERVATIVE__SECONDARY > 45);
  assert.ok(managed.CONSERVATIVE__SECONDARY > 0 && overload.CONSERVATIVE__PRIMARY > 0, 'memory must modify probability, not force certainty');
});

test('loan-return hierarchy reads prior exit style instead of applying one identical return', () => {
  const cleanLoan = weightsFor('CEVT_19_RETURN_01', 'ROLE_MEETING', [['SEED_EXIT_STYLE_UDV', 'EVT_18_JAN_001', { january: 'loan' }]], 77501);
  const contested = weightsFor('CEVT_19_RETURN_01', 'ROLE_MEETING', [['SEED_EXIT_STYLE_UDV', 'EVT_18_JAN_001', { january: 'transfer_contested' }]], 77501);
  assert.ok(cleanLoan.ROLE_MEETING__PRIMARY > contested.ROLE_MEETING__PRIMARY);
  assert.ok(contested.ROLE_MEETING__SECONDARY > cleanLoan.ROLE_MEETING__SECONDARY);
});

test('same causal state and RNG seed produces identical debug weights and outcome', () => {
  const a = weightsFor('CEVT_18_BRUNO_01', 'ASK_ROLE', [['SEED_BRUNO_FAVOR', 'EVT_18_TEAM_001', { stance: 'helped' }]], 77601);
  const b = weightsFor('CEVT_18_BRUNO_01', 'ASK_ROLE', [['SEED_BRUNO_FAVOR', 'EVT_18_TEAM_001', { stance: 'helped' }]], 77601);
  assert.deepEqual(a, b);
});
