import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_26_30 } from '../dist/content/events/26_30/index.js';
import { T516_STAGED_DOC_PRINCIPAL_EVENTS_26 } from '../dist/content/events/26_30/t516-staged-doc-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';

const event = T516_STAGED_DOC_PRINCIPAL_EVENTS_26[0];

function state26(seed = 61601) {
  const state = createInitialState(seed);
  state.age = 26;
  state.phase = '26_30';
  state.professional.initializedAt26 = true;
  state.professional.publicMyth = 35;
  return state;
}

test('Agent6 DOC26 matches the canonical documentary decision surface', () => {
  assert.equal(event.id, 'EVT_26_DOC_001');
  assert.equal(event.text.title, 'Dentro de tu temporada');
  assert.deepEqual(event.choices.map(choice => choice.label), [
    'Dar acceso amplio',
    'Aceptar con zonas privadas excluidas',
    'Aceptar solo si tú tienes veto limitado',
    'Rechazar'
  ]);
  assert.equal(eventGatesPass(state26(), event), true);
  const lowProfile = state26(61602);
  lowProfile.professional.publicMyth = 34;
  assert.equal(eventGatesPass(lowProfile, event), false);
});

test('Agent6 DOC26 records negotiated access without pretending footage was published', () => {
  for (const choiceId of ['BROAD_ACCESS', 'PRIVATE_ZONES', 'LIMITED_VETO', 'REJECT']) {
    const state = state26(61610 + choiceId.length);
    const beforeKnowledge = structuredClone(state.npcs.map(npc => npc.knowledge));
    const result = resolveChoice(state, event, choiceId);
    const memory = result.state.seeds.find(seed => seed.id === 'SEED_DOCUMENTARY_ACCESS');
    assert.equal(memory?.originEvent, 'EVT_26_DOC_001');
    assert.equal(memory?.payload.published, false);
    assert.deepEqual(result.state.npcs.map(npc => npc.knowledge), beforeKnowledge, 'proposal must not publish private facts');
  }
});

test('Agent6 DOC26 proposal gate is read-only and consumes no RNG', () => {
  const state = state26(61630);
  const before = structuredClone(state);
  eventGatesPass(state, event);
  assert.deepEqual(state, before);
});

test('Agent6 DOC26 stays staged until content lineage and seed origin are integrated', () => {
  assert.equal(EVENTS_26_30.some(candidate => candidate.id === 'EVT_26_DOC_001'), false);
});
