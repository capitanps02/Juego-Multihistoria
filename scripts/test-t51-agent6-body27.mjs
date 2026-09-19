import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T518_STAGED_BODY_PRINCIPAL_EVENTS_27 } from '../dist/content/events/26_30/t518-staged-body-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';

const event = T518_STAGED_BODY_PRINCIPAL_EVENTS_27[0];

function state27(seed = 61801) {
  const state = createInitialState(seed);
  state.age = 27;
  state.phase = '26_30';
  state.professional.initializedAt26 = true;
  state.professional.peakStatus = 20;
  return state;
}

test('Agent6 BODY27 preserves canonical vacation/lab choices', () => {
  assert.equal(event.id, 'EVT_27_BODY_001');
  assert.equal(event.text.title, 'Vacaciones o laboratorio');
  assert.deepEqual(event.choices.map(choice => choice.label), [
    'Hacer el bloque extra',
    'Descansar completamente',
    'Hacer solo técnica de baja carga',
    'Dividir vacaciones: desconexión y mini-bloque final'
  ]);
});

test('Agent6 BODY27 opens from established high PEAK_STATUS threshold', () => {
  const state = state27();
  state.professional.peakStatus = 55;
  assert.equal(eventGatesPass(state, event), true);
  state.professional.peakStatus = 54;
  assert.equal(eventGatesPass(state, event), false);
});

test('Agent6 BODY27 also opens from live SELF_OPTIMIZATION memory', () => {
  const state = state27(61802);
  state.flags.HAS_SEED_SELF_OPTIMIZATION = true;
  assert.equal(eventGatesPass(state, event), true);
});

test('Agent6 BODY27 records load pattern without creating missing SELF_OPTIMIZATION on full rest', () => {
  const state = state27(61810);
  state.professional.peakStatus = 55;
  const result = resolveChoice(state, event, 'FULL_REST');
  const peakLoad = result.state.seeds.find(seed => seed.id === 'SEED_PEAK_LOAD');
  assert.equal(peakLoad?.originEvent, 'EVT_27_BODY_001');
  assert.equal(peakLoad?.payload.stance, 'full_rest');
  assert.equal(result.state.seeds.some(seed => seed.id === 'SEED_SELF_OPTIMIZATION'), false);
});

test('Agent6 BODY27 intensifies an existing SELF_OPTIMIZATION without rewriting its origin', () => {
  const state = state27(61811);
  state.flags.HAS_SEED_SELF_OPTIMIZATION = true;
  state.seeds.push({
    id: 'SEED_SELF_OPTIMIZATION', state: 'active', intensity: 40,
    originEvent: 'EVT_26_BODY_001', originSeason: state.season,
    npcRefs: [], payload: {}, lastTouchedDate: state.date
  });
  const result = resolveChoice(state, event, 'EXTRA_BLOCK');
  const memory = result.state.seeds.find(seed => seed.id === 'SEED_SELF_OPTIMIZATION');
  assert.equal(memory?.originEvent, 'EVT_26_BODY_001');
  assert.ok((memory?.intensity ?? 0) > 40);
});

test('Agent6 BODY27 gate evaluation is read-only', () => {
  const state = state27(61820);
  state.professional.peakStatus = 55;
  const before = structuredClone(state);
  eventGatesPass(state, event);
  assert.deepEqual(state, before);
});
