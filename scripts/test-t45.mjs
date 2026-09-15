import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { setPath } from '../dist/core/path.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';

const ids = [
  'EVT_18_TEAM_001', 'EVT_18_MATCH_002', 'EVT_18_END_001', 'EVT_18_END_002',
  'EVT_18_SUM_001', 'EVT_19_SUM_001', 'CEVT_19_NANO_01', 'CEVT_19_RETURN_01'
];
const genericLabels = /^(Tomar la iniciativa|Esperar y reunir información|Proteger tu posición|Buscar una solución intermedia)$/;

function satisfyGates(state, event) {
  for (const gate of event.gates ?? []) {
    const value = gate.op === 'eq' ? gate.value
      : gate.op === 'gte' ? gate.value
      : gate.op === 'gt' ? Number(gate.value) + 1
      : gate.op === 'lte' ? gate.value
      : gate.op === 'lt' ? Number(gate.value) - 1
      : gate.value;
    setPath(state, gate.path, value);
  }
  state.age = event.ageWindow[0];
  state.phase = '18_20';
  const preferredMonths = event.timeWindow?.months ?? [8];
  const month = event.id === 'EVT_19_SUM_001' && preferredMonths.includes(7) ? 7 : preferredMonths[0];
  state.date = `${state.age === 18 ? '2026' : '2027'}-${String(month).padStart(2, '0')}-01`;
  state.runtime.day = state.age === 18 ? 30 : 395;
  state.runtime.seasonDay = event.timeWindow?.minSeasonDay ?? 30;
  state.runtime.daysSinceNarrative = 999;
}

function blockGates(state, event) {
  for (const gate of event.gates ?? []) {
    const value = gate.op === 'eq' ? (gate.value === true ? false : gate.value === false ? true : null)
      : gate.op === 'gte' ? Number(gate.value) - 1
      : gate.op === 'gt' ? Number(gate.value)
      : gate.op === 'lte' ? Number(gate.value) + 1
      : gate.op === 'lt' ? Number(gate.value)
      : null;
    setPath(state, gate.path, value);
  }
}

test('T4.5 lote 18–20 4: cierre técnico y retorno con acciones específicas', () => {
  for (const id of ids) {
    const event = EVENTS.find(candidate => candidate.id === id);
    assert.ok(event, `Falta escena ${id}`);
    assert.equal(event.phase, '18_20', id);
    assert.ok(event.text.body.length >= 100, `${id}: cuerpo corto`);
    assert.ok(event.intel.visible.length >= 1 && event.intel.uncertain.length >= 1, `${id}: información incompleta`);
    assert.ok((event.gates?.length ?? 0) > 0 || event.timeWindow || (event.seedsRead?.length ?? 0) > 0, `${id}: falta disparador`);
    assert.ok((event.npcRefs?.length ?? 0) > 0, `${id}: falta NPC contextual`);
    assert.ok(event.choices.length >= 3, `${id}: faltan acciones`);
    assert.equal(new Set(event.choices.map(choice => choice.label)).size, event.choices.length, `${id}: acciones duplicadas`);
    assert.ok(event.choices.every(choice => !genericLabels.test(choice.label)), `${id}: acción genérica`);
    assert.ok(event.outcomes.every(outcome => outcome.messages.length > 0), `${id}: consecuencia sin mensaje`);

    const hidden = createInitialState(424242);
    hidden.age = event.ageWindow[0];
    hidden.phase = '18_20';
    hidden.runtime.daysSinceNarrative = 999;
    if ((event.gates?.length ?? 0) > 0) {
      blockGates(hidden, event);
      assert.equal(scheduleEvent(hidden, [event], { ignoreRhythmGate: true }), null, `${id}: aparece sin contexto`);
    }

    const state = createInitialState(424242);
    satisfyGates(state, event);
    assert.equal(scheduleEvent(state, [event], { ignoreRhythmGate: true })?.event.id, id, `${id}: scheduler no lo selecciona`);
    for (const choice of event.choices) {
      const candidate = structuredClone(state);
      const result = resolveChoiceInPlace(candidate, event, choice.id);
      assert.equal(result.eventId, id);
      assert.equal(candidate.history.at(-1)?.choiceId, choice.id);
      assert.ok(candidate.history.at(-1)?.snapshot.npcRefs.length > 0);
    }
  }
});
