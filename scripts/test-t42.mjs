import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';

const ids = [
  'EVT_18_LOCK_001', 'EVT_18_OPP_001', 'EVT_18_MKT_001',
  'EVT_19_MKT_001', 'EVT_19_RIV_001', 'EVT_19_CCH_001',
  'EVT_19_MEDIA_001', 'EVT_19_BODY_001', 'EVT_19_AGENT_001',
  'EVT_19_JAN_001', 'EVT_19_TEAM_001', 'EVT_19_FIN_001'
];
const genericLabels = /^(Tomar la iniciativa|Esperar y reunir información|Proteger tu posición|Buscar una solución intermedia)$/;

test('T4.2 lote 18–20 1: doce escenas específicas con decisiones y consecuencias ejecutables', () => {
  const selected = ids.map(id => EVENTS.find(event => event.id === id));
  assert.ok(selected.every(Boolean), 'Falta una escena del lote');
  for (const event of selected) {
    assert.equal(event.canonStatus, 'verified', event.id);
    assert.equal(event.phase, '18_20', event.id);
    assert.ok(event.text.body.length >= 100, `${event.id}: cuerpo demasiado corto`);
    assert.ok(event.intel.visible.length >= 1 && event.intel.uncertain.length >= 1, `${event.id}: falta información imperfecta`);
    assert.ok((event.gates?.length ?? 0) > 0 || event.timeWindow || (event.seedsRead?.length ?? 0) > 0, `${event.id}: falta gate, ventana o memoria contextual`);
    assert.ok((event.npcRefs?.length ?? 0) > 0 || event.tags?.includes('bridge'), `${event.id}: falta NPC contextual`);
    assert.ok((event.tags?.length ?? 0) >= 2, `${event.id}: faltan etiquetas de contexto`);
    assert.ok(event.choices.length >= 3, `${event.id}: faltan acciones`);
    assert.equal(new Set(event.choices.map(choice => choice.label)).size, event.choices.length, `${event.id}: acciones duplicadas`);
    assert.ok(event.choices.every(choice => !genericLabels.test(choice.label)), `${event.id}: acción genérica`);
    assert.ok(event.outcomes.every(outcome => outcome.messages.length > 0), `${event.id}: consecuencia sin mensaje`);
    for (const choice of event.choices) {
      const state = createInitialState(424242);
      const before = JSON.stringify(state);
      const result = resolveChoiceInPlace(state, event, choice.id);
      assert.equal(result.eventId, event.id);
      assert.equal(state.history.at(-1)?.eventId, event.id);
      assert.equal(state.history.at(-1)?.choiceId, choice.id);
      assert.notEqual(JSON.stringify(state), before, `${event.id}/${choice.id}: no deja consecuencia`);
    }
  }
});
