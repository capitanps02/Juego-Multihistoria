import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { setPath } from '../dist/core/path.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

const byId = id => {
  const event = EVENTS.find(candidate => candidate.id === id);
  assert.ok(event, `Falta evento ${id}`);
  return event;
};

function positiveState(event, seed = 5151) {
  const state = createInitialState(seed);
  state.age = event.ageWindow[0];
  state.phase = '18_20';
  const month = event.timeWindow?.months?.[0] ?? 8;
  state.date = `${state.age === 18 ? '2026' : '2027'}-${String(month).padStart(2, '0')}-01`;
  state.runtime.day = state.age === 18 ? 30 : 395;
  state.runtime.seasonDay = 30;
  state.runtime.daysSinceNarrative = 999;
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
    if (exclusion.op === 'lt') setPath(state, exclusion.path, Number(exclusion.value) + 10);
    else if (exclusion.op === 'lte') setPath(state, exclusion.path, Number(exclusion.value) + 10);
  }
  return state;
}

function assertRoundTripAndResolution(id) {
  const event = byId(id);
  const state = positiveState(event);
  const scheduled = scheduleEvent(structuredClone(state), [event], { ignoreRhythmGate: true });
  assert.equal(scheduled?.event.id, id, `${id}: no es alcanzable con sus gates satisfechos`);

  const restored = loadSave(serializeSave(state));
  assert.equal(scheduleEvent(structuredClone(restored), [event], { ignoreRhythmGate: true })?.event.id, id, `${id}: pierde elegibilidad tras save/restore`);
  assert.deepEqual(restored.rngState, state.rngState, `${id}: save/restore altera RNG`);

  const firstGate = event.gates?.[0];
  assert.ok(firstGate, `${id}: falta gate`);
  const negative = loadSave(serializeSave(restored));
  if (firstGate.op === 'eq') setPath(negative, firstGate.path, firstGate.value === true ? false : '__not_equal__');
  else if (firstGate.op === 'gte') setPath(negative, firstGate.path, Number(firstGate.value) - 1);
  else if (firstGate.op === 'gt') setPath(negative, firstGate.path, Number(firstGate.value));
  else if (firstGate.op === 'lte') setPath(negative, firstGate.path, Number(firstGate.value) + 1);
  else if (firstGate.op === 'lt') setPath(negative, firstGate.path, Number(firstGate.value));
  assert.equal(scheduleEvent(negative, [event], { ignoreRhythmGate: true }), null, `${id}: aparece sin su causa principal`);

  for (const choice of event.choices) {
    const a = loadSave(serializeSave(restored));
    const b = loadSave(serializeSave(restored));
    const resultA = resolveChoiceInPlace(a, event, choice.id);
    const resultB = resolveChoiceInPlace(b, event, choice.id);
    assert.deepEqual(resultA, resultB, `${id}/${choice.id}: outcome no determinista tras restore`);
    assert.deepEqual(a.rngState, b.rngState, `${id}/${choice.id}: RNG diverge`);
    assert.deepEqual(a.history.at(-1), b.history.at(-1), `${id}/${choice.id}: historia diverge`);
    assert.deepEqual(a.seeds, b.seeds, `${id}/${choice.id}: seeds divergen`);
  }
}

for (const id of [
  'CEVT_18_NODEBUT_01',
  'CEVT_18_VELA_01',
  'CEVT_19_BIG_01',
  'CEVT_19_ABROAD_01'
]) {
  test(`T51 conditional certification: ${id} conserva elegibilidad y resolución tras save/restore`, () => {
    assertRoundTripAndResolution(id);
  });
}

test('T51 conditional certification: Nano conserva la cadena causal real y cierra memoria tras restore', () => {
  const origin = byId('EVT_18_PRE_001');
  const reappearance = byId('EVT_19_TEAM_001');
  const callback = byId('CEVT_19_NANO_01');
  let state;
  for (let seed = 0; seed < 2000 && !state; seed += 1) {
    const candidate = createInitialState(seed);
    resolveChoiceInPlace(candidate, origin, 'CALL_NANO');
    resolveChoiceInPlace(candidate, reappearance, 'MOVE_CONTACT');
    if (candidate.flags.UNSOLICITED_NANO_HELP && candidate.flags.HAS_SEED_NANO_SHADOW) state = candidate;
  }
  assert.ok(state, 'No se encontró una semilla determinista para la cadena causal de Nano');
  Object.assign(state, { age: 19, phase: '18_20', date: '2027-07-01' });
  state.runtime.day = 365;
  state.runtime.seasonDay = 0;
  state.runtime.daysSinceNarrative = 999;

  const beforeSave = structuredClone(state);
  const restored = loadSave(serializeSave(state));
  assert.equal(restored.flags.UNSOLICITED_NANO_HELP, true);
  assert.equal(restored.flags.HAS_SEED_NANO_SHADOW, true);
  assert.equal(restored.seeds.some(seed => seed.id === 'SEED_NANO_SHADOW' && !['resolved', 'expired'].includes(seed.state)), true);
  assert.deepEqual(restored.rngState, beforeSave.rngState, 'Nano: restore altera RNG');
  assert.equal(scheduleEvent(structuredClone(restored), [callback], { ignoreRhythmGate: true })?.event.id, callback.id);

  const a = loadSave(serializeSave(restored));
  const b = loadSave(serializeSave(restored));
  const resultA = resolveChoiceInPlace(a, callback, 'WITHDRAW');
  const resultB = resolveChoiceInPlace(b, callback, 'WITHDRAW');
  assert.deepEqual(resultA, resultB);
  assert.deepEqual(a.rngState, b.rngState);
  assert.deepEqual(a.history.at(-1), b.history.at(-1));
  const closed = a.seeds.find(seed => seed.id === 'SEED_NANO_SHADOW');
  assert.equal(closed?.state, 'resolved');
  assert.equal(closed?.consumedBy, callback.id);
  assert.equal(a.flags.HAS_SEED_NANO_SHADOW, false);
});

test('T51 conditional certification: EARLY e INJ conservan diferencias materiales y no se auto-certifican', () => {
  const early = byId('CEVT_18_EARLY_01');
  const injury = byId('CEVT_19_INJ_01');
  assert.equal(early.gates.some(gate => gate.path === 'flags.EARLY_BREAKOUT'), true);
  assert.equal(injury.gates.some(gate => gate.path === 'flags.LONG_INJURY'), true);
  assert.equal(injury.seedsRead?.includes('SEED_BODY_PRECEDENT'), true);
  assert.equal(injury.seedsRead?.includes('SEED_PHYSIO_CONFIDENCE'), true);
  // El test ejecutable fija que esas memorias existen como metadata; la revisión canónica
  // exige además que historia/tratamiento alteren causalmente la complicación. T5.2 no
  // inventa ese consumidor. EARLY conserva un writer más estrecho que el trigger canónico.
});
