import assert from 'node:assert/strict';
import test from 'node:test';
import { SEED_CATALOG } from '../dist/catalog/seeds.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_26_30 } from '../dist/content/events/26_30/index.js';
import { T522_STAGED_NATIONAL_AVAILABILITY_EVENTS_29 } from '../dist/content/events/26_30/t522-staged-national-availability-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveNationalTeamAuthority } from '../dist/simulation/national-team-authority.js';

const event = T522_STAGED_NATIONAL_AVAILABILITY_EVENTS_29[0];

function state29(seed = 62201) {
  const state = createInitialState(seed);
  state.age = 29;
  state.phase = '26_30';
  state.professional.nationalCaps = 6;
  state.professional.nationalStanding = 52;
  state.professional.nationalRole = 'rotation';
  state.flags.NATIONAL_CALLED = true;
  state.seeds.push({
    id: 'SEED_INTERNATIONAL_LOAD', state: 'dormant', intensity: 60,
    originEvent: 'EVT_26_NAT_001', originSeason: '2033-34', npcRefs: [],
    payload: { historicalLoad: true }, lastTouchedDate: '2034-11-10'
  });
  state.flags.HAS_SEED_INTERNATIONAL_LOAD = true;
  return state;
}

test('Agent6 NAT29 exposes the four canonical availability policies', () => {
  assert.equal(event.id, 'EVT_29_NAT_002');
  assert.equal(event.text.title, '¿Seguir con la selección a cualquier precio?');
  assert.deepEqual(event.choices.map(choice => choice.label), [
    'Seguir disponible siempre',
    'Pedir gestión de amistosos y concentraciones',
    'Comunicar que priorizarás torneos y partidos oficiales',
    'No fijar una política general y decidir ventana a ventana'
  ]);
});

test('Agent6 NAT29 requires real aggregate national history plus prior load memory', () => {
  const valid = state29();
  const authority = resolveNationalTeamAuthority(valid);
  assert.equal(authority.everCalled, true);
  assert.equal(authority.caps, 6);
  assert.equal(authority.role, 'rotation');
  assert.equal(eventGatesPass(valid, event), true);

  const tooFewCaps = state29(62202);
  tooFewCaps.professional.nationalCaps = 5;
  assert.equal(eventGatesPass(tooFewCaps, event), false);

  const lowStanding = state29(62203);
  lowStanding.professional.nationalStanding = 51;
  assert.equal(eventGatesPass(lowStanding, event), false);

  const noLoadHistory = state29(62204);
  noLoadHistory.flags.HAS_SEED_INTERNATIONAL_LOAD = false;
  noLoadHistory.seeds = [];
  assert.equal(eventGatesPass(noLoadHistory, event), false);

  const retired = state29(62205);
  retired.flags.NATIONAL_RETIRED = true;
  assert.equal(eventGatesPass(retired, event), false);
});

test('Agent6 NAT29 only records policy intent and never mutates selection status directly', () => {
  for (const choice of event.choices) {
    assert.equal(choice.immediateEffects?.some(effect => effect.kind === 'flag' && effect.flag === 'NATIONAL_RETIRED'), false);
    for (const outcomeId of choice.outcomeIds) {
      const outcome = event.outcomes.find(candidate => candidate.id === outcomeId);
      assert.ok(outcome);
      assert.deepEqual(outcome.effects, []);
      assert.ok(outcome.seedTransitions?.every(transition => transition.seedId === 'SEED_NATIONAL_AVAILABILITY_30'));
    }
  }
});

test('Agent6 NAT29 remains staged until the canonical availability seed is registered', () => {
  assert.equal(EVENTS_26_30.some(candidate => candidate.id === 'EVT_29_NAT_002'), false);
  assert.equal(SEED_CATALOG.some(seed => seed.id === 'SEED_NATIONAL_AVAILABILITY_30'), false);
  assert.ok(event.tags?.includes('blocked_seed_catalog'));
});
