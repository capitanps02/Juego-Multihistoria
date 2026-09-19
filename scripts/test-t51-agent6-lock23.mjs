import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { eligibleChoices } from '../dist/narrative/choice-eligibility.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { expireDueSeedsInPlace } from '../dist/narrative/resolver.js';
import { T514_STAGED_LOCK_PRINCIPAL_EVENTS_23 } from '../dist/content/events/23_26/t514-staged-lock-principal-events.js';

const event = T514_STAGED_LOCK_PRINCIPAL_EVENTS_23[0];

function state23(seed = 61401) {
  const state = createInitialState(seed);
  state.age = 23;
  state.phase = '23_26';
  return state;
}

test('Agent6 LOCK23 stages the canonical scene without inventing the participant', () => {
  assert.equal(event.id, 'EVT_23_LOCK_001');
  assert.equal(event.text.title, 'Las cuatro de la mañana');
  assert.deepEqual(event.choices.map(choice => choice.label), [
    'Cubrirle',
    'Negarte pero no avisar a nadie',
    'Decirle que admita el retraso y ofrecer acompañarlo',
    'Avisar al capitán para que gestione antes de que llegue al técnico'
  ]);
  assert.deepEqual(event.npcRefs ?? [], []);
  assert.ok(event.seedsRead?.includes('SEED_TEAMMATE_COVER'));
});

test('Agent6 LOCK23 exposes the three authoritative OR routes', () => {
  assert.deepEqual(event.gateAlternatives, [
    [{ path: 'facts.lockerCaptainAffinity', op: 'gte', value: 60 }],
    [{ path: 'facts.lockerStarAffinity', op: 'gte', value: 60 }],
    [{ path: 'flags.HAS_SEED_TEAMMATE_COVER', op: 'eq', value: true }]
  ]);
});

test('Agent6 LOCK23 captain escalation fails closed without a captain slot', () => {
  const noCaptain = state23(61402);
  noCaptain.club = 'Aurora CF';
  noCaptain.flags.HAS_SEED_TEAMMATE_COVER = true;
  assert.equal(eventGatesPass(noCaptain, event), true, 'seed route must still open the scene');
  assert.deepEqual(eligibleChoices(noCaptain, event).map(choice => choice.id), ['A', 'B', 'C']);

  const withCaptain = state23(61403);
  withCaptain.club = 'UDV';
  withCaptain.flags.HAS_SEED_TEAMMATE_COVER = true;
  assert.deepEqual(eligibleChoices(withCaptain, event).map(choice => choice.id), ['A', 'B', 'C', 'D']);
});

test('Agent6 LOCK23 gate and choice projection are read-only and consume no RNG', () => {
  const state = state23(61404);
  state.club = 'Aurora CF';
  state.flags.HAS_SEED_TEAMMATE_COVER = true;
  const before = structuredClone(state);
  eventGatesPass(state, event);
  eligibleChoices(state, event);
  assert.deepEqual(state, before);
});


test('Agent6 LOCK23 teammate-cover memory expires after transfer', () => {
  const state = state23(61405);
  state.date = '2031-08-15';
  state.club = 'ORIGIN_SCOPE_CLUB';
  state.professional.ownerClub = state.club;
  state.professional.registrationClub = state.club;
  state.world.ownerClub = state.club;
  state.seeds.push({
    id: 'SEED_TEAMMATE_COVER',
    state: 'active',
    intensity: 50,
    originEvent: 'EVT_20_LOCK_002',
    originSeason: state.season,
    npcRefs: [],
    payload: { __t52OriginClub: state.club },
    lastTouchedDate: state.date
  });
  state.flags.HAS_SEED_TEAMMATE_COVER = true;

  assert.equal(eventGatesPass(state, event), true, 'origin-club memory may enable LOCK23 before transfer');

  state.club = 'TRANSFER_DESTINATION';
  expireDueSeedsInPlace(state);

  const seed = state.seeds.find(item => item.id === 'SEED_TEAMMATE_COVER');
  assert.equal(seed?.state, 'expired');
  assert.equal(seed?.payload.__t52TerminalReason, 'club_scope');
  assert.equal(state.flags.HAS_SEED_TEAMMATE_COVER, false);
  assert.equal(eventGatesPass(state, event), false, 'origin-club memory must not leak into a new dressing room');
});
