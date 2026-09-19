import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_26_30 } from '../dist/content/events/26_30/index.js';
import { T517_STAGED_IMAGE_PRINCIPAL_EVENTS_27 } from '../dist/content/events/26_30/t517-staged-image-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';

const event = T517_STAGED_IMAGE_PRINCIPAL_EVENTS_27[0];

function state27(seed = 61701) {
  const state = createInitialState(seed);
  state.age = 27;
  state.phase = '26_30';
  state.professional.initializedAt26 = true;
  state.professional.commercialPower = 20;
  state.reputation.mediaHeat = 20;
  state.professional.publicPolarization = 5;
  return state;
}

test('Agent6 IMG27 preserves the canonical choice surface', () => {
  assert.equal(event.id, 'EVT_27_IMG_001');
  assert.equal(event.text.title, 'Tu nombre sin tu club');
  assert.deepEqual(event.choices.map(choice => choice.label), [
    'Construir marca independiente fuerte',
    'Coordinar todo con club',
    'Limitar campañas a ventanas de descanso',
    'Rechazar expansión internacional'
  ]);
});

test('Agent6 IMG27 opens from a live GLOBAL_IMAGE memory', () => {
  const state = state27();
  state.flags.HAS_SEED_GLOBAL_IMAGE = true;
  assert.equal(eventGatesPass(state, event), true);
});

test('Agent6 IMG27 MEDIA_POWER route exactly mirrors State26 classifier thresholds', () => {
  const state = state27(61702);
  state.professional.commercialPower = 60;
  state.reputation.mediaHeat = 50;
  state.professional.publicPolarization = 18;
  assert.equal(eventGatesPass(state, event), true);

  for (const [path, value] of [
    ['commercialPower', 59],
    ['mediaHeat', 49],
    ['publicPolarization', 17]
  ]) {
    const below = structuredClone(state);
    if (path === 'mediaHeat') below.reputation.mediaHeat = value;
    else below.professional[path] = value;
    assert.equal(eventGatesPass(below, event), false, `${path} must fail below classifier threshold`);
  }
});

test('Agent6 IMG27 resolves brand stance without club mutation', () => {
  const state = state27(61710);
  state.flags.HAS_SEED_GLOBAL_IMAGE = true;
  const beforeClub = state.club;
  const beforeOwner = state.professional.ownerClub;
  const beforeRegistration = state.professional.registrationClub;
  const result = resolveChoice(state, event, 'INDEPENDENT_BRAND');
  const memory = result.state.seeds.find(seed => seed.id === 'SEED_PERSONAL_BRAND_INDEPENDENCE');
  assert.equal(memory?.originEvent, 'EVT_27_IMG_001');
  assert.equal(memory?.payload.stance, 'independent');
  assert.equal(result.state.club, beforeClub);
  assert.equal(result.state.professional.ownerClub, beforeOwner);
  assert.equal(result.state.professional.registrationClub, beforeRegistration);
});

test('Agent6 IMG27 gate evaluation is read-only and event remains staged', () => {
  const state = state27(61720);
  state.professional.commercialPower = 60;
  state.reputation.mediaHeat = 50;
  state.professional.publicPolarization = 18;
  const before = structuredClone(state);
  eventGatesPass(state, event);
  assert.deepEqual(state, before);
  assert.equal(EVENTS_26_30.some(candidate => candidate.id === 'EVT_27_IMG_001'), false);
});
