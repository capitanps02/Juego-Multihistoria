import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { setPath } from '../dist/core/path.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';

const ids = [
  'CEVT_18_EARLY_01', 'CEVT_18_NODEBUT_01', 'CEVT_18_BRUNO_01',
  'CEVT_18_VELA_01', 'CEVT_18_CCH_01', 'CEVT_18_RELEG_01',
  'CEVT_18_PLAYOFF_01', 'CEVT_19_BIG_01', 'CEVT_19_AGENT_01',
  'CEVT_19_INJ_01', 'CEVT_19_ABROAD_01', 'CEVT_19_SOCIAL_01'
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
  for (const exclusion of event.exclusions ?? []) {
    if (exclusion.path === 'reputation.mediaHeat') setPath(state, exclusion.path, 50);
  }
  const age = event.ageWindow[0];
  state.age = age;
  state.phase = '18_20';
  const month = event.timeWindow?.months?.[0] ?? 8;
  state.date = `${age === 18 ? '2026' : '2027'}-${String(month).padStart(2, '0')}-01`;
  state.runtime.day = age === 18 ? 30 : 395;
  state.runtime.seasonDay = 30;
  state.runtime.daysSinceNarrative = 999;
}

test('T4.3 lote 18–20 2: doce callbacks con gates y consecuencias específicas', () => {
  for (const id of ids) {
    const event = EVENTS.find(candidate => candidate.id === id);
    assert.ok(event, `Falta callback ${id}`);
    assert.equal(event.phase, '18_20', id);
    assert.equal(event.family, 'conditional', id);
    assert.ok(event.text.body.length >= 100, `${id}: cuerpo corto`);
    assert.ok((event.gates?.length ?? 0) > 0, `${id}: falta gate`);
    assert.ok(event.choices.length >= 3, `${id}: faltan respuestas`);
    assert.ok(event.choices.every(choice => !genericLabels.test(choice.label)), `${id}: respuesta genérica`);
    assert.ok(event.outcomes.every(outcome => outcome.messages.length > 0), `${id}: falta consecuencia`);

    const hidden = createInitialState(424242);
    hidden.age = event.ageWindow[0];
    hidden.phase = '18_20';
    hidden.runtime.daysSinceNarrative = 999;
    assert.equal(scheduleEvent(hidden, [event], {ignoreRhythmGate: true}), null, `${id}: aparece sin contexto`);

    const state = createInitialState(424242);
    satisfyGates(state, event);
    assert.equal(scheduleEvent(state, [event], {ignoreRhythmGate: true})?.event.id, id, `${id}: gate no selecciona el callback`);
    for (const choice of event.choices) {
      const candidate = structuredClone(state);
      const result = resolveChoiceInPlace(candidate, event, choice.id);
      assert.equal(result.eventId, id);
      assert.equal(candidate.history.at(-1)?.choiceId, choice.id);
      assert.ok(candidate.history.at(-1)?.snapshot.tags.length > 0);
    }
  }
});
