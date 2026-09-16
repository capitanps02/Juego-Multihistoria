import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import {
  penaltySuccessProbability,
  playerPenaltyAttempt,
  resolvePenaltyMomentInPlace
} from '../dist/simulation/football-moments.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

const attempt = (state, id = 'penalty:test:1', pressure = 72) => playerPenaltyAttempt(state, id, pressure);

function streams(state) {
  return structuredClone(state.rngState);
}

test('football moments/1 el helper del protagonista usa atributos deportivos reales y leer no consume RNG', () => {
  const state = createInitialState(8501);
  const before = streams(state);
  const input = attempt(state);
  assert.equal(input.actorId, 'PLAYER');
  assert.equal(input.technique, state.professional.technique);
  assert.equal(input.composure, state.professional.composure);
  assert.equal(input.form, state.sport.form);
  assert.equal(input.pressure, 72);
  const probability = penaltySuccessProbability(input);
  assert.ok(probability >= 0.45 && probability <= 0.9);
  assert.deepEqual(state.rngState, before, 'construir/leer el intento no consume ningún stream RNG');
});

test('football moments/2 resolver consume exactamente un draw football y ningún otro stream', () => {
  const state = createInitialState(8502);
  const before = streams(state);
  const result = resolvePenaltyMomentInPlace(state, attempt(state));
  assert.equal(result.replayed, false);
  assert.ok(['scored', 'missed'].includes(result.outcome));
  assert.equal(state.rngState.football.draws, before.football.draws + 1);
  assert.deepEqual(state.rngState.narrative, before.narrative);
  assert.deepEqual(state.rngState.microfeed, before.microfeed);
  assert.deepEqual(state.rngState.qa, before.qa);
});

test('football moments/3 misma seed/estado/input produce exactamente el mismo hecho deportivo', () => {
  const a = createInitialState(8503);
  const b = createInitialState(8503);
  const ra = resolvePenaltyMomentInPlace(a, attempt(a));
  const rb = resolvePenaltyMomentInPlace(b, attempt(b));
  assert.equal(ra.outcome, rb.outcome);
  assert.equal(ra.probability, rb.probability);
  assert.equal(ra.draw, rb.draw);
  assert.deepEqual(a.rngState.football, b.rngState.football);
});

test('football moments/4 cambiar solo narrative RNG no cambia el penalti', () => {
  const a = createInitialState(8504);
  const b = createInitialState(8504);
  b.rngState.narrative.state += 987654;
  b.rngState.narrative.draws += 11;
  const ra = resolvePenaltyMomentInPlace(a, attempt(a));
  const rb = resolvePenaltyMomentInPlace(b, attempt(b));
  assert.equal(ra.outcome, rb.outcome);
  assert.equal(ra.draw, rb.draw);
  assert.equal(ra.probability, rb.probability);
});

test('football moments/5 cambiar el estado football cambia el draw sin alterar la fórmula', () => {
  const a = createInitialState(8505);
  const b = createInitialState(8505);
  b.rngState.football.state += 123456789;
  const ra = resolvePenaltyMomentInPlace(a, attempt(a));
  const rb = resolvePenaltyMomentInPlace(b, attempt(b));
  assert.notEqual(ra.draw, rb.draw);
  assert.equal(ra.probability, rb.probability);
});

test('football moments/6 save/load antes del draw conserva exactamente el resultado futuro', () => {
  const original = createInitialState(8506);
  const restored = loadSave(serializeSave(original));
  const a = resolvePenaltyMomentInPlace(original, attempt(original));
  const b = resolvePenaltyMomentInPlace(restored, attempt(restored));
  assert.equal(a.outcome, b.outcome);
  assert.equal(a.draw, b.draw);
  assert.equal(a.probability, b.probability);
  assert.deepEqual(original.rngState.football, restored.rngState.football);
});

test('football moments/7 save/load después del draw devuelve el hecho persistido y no re-sortea', () => {
  const state = createInitialState(8507);
  const first = resolvePenaltyMomentInPlace(state, attempt(state));
  const restored = loadSave(serializeSave(state));
  const drawsBefore = restored.rngState.football.draws;
  const again = resolvePenaltyMomentInPlace(restored, attempt(restored));
  assert.equal(again.replayed, true);
  assert.equal(again.outcome, first.outcome);
  assert.equal(again.probability, first.probability);
  assert.equal(again.resolvedAt, first.resolvedAt);
  assert.equal(again.draw, undefined);
  assert.equal(restored.rngState.football.draws, drawsBefore);
});

test('football moments/8 doble resolución del mismo momentId es idempotente', () => {
  const state = createInitialState(8508);
  const input = attempt(state);
  const first = resolvePenaltyMomentInPlace(state, input);
  const afterFirst = streams(state);
  const second = resolvePenaltyMomentInPlace(state, input);
  assert.equal(second.replayed, true);
  assert.equal(second.outcome, first.outcome);
  assert.deepEqual(state.rngState, afterFirst);
});

test('football moments/9 reutilizar momentId con inputs deportivos diferentes falla sin consumir otro draw', () => {
  const state = createInitialState(8509);
  const input = attempt(state);
  resolvePenaltyMomentInPlace(state, input);
  const drawsBefore = state.rngState.football.draws;
  assert.throws(
    () => resolvePenaltyMomentInPlace(state, { ...input, pressure: input.pressure - 1 }),
    /already resolved with different sporting inputs/
  );
  assert.equal(state.rngState.football.draws, drawsBefore);
});

test('football moments/10 un lanzador no protagonista requiere atributos explícitos y no hereda los del jugador', () => {
  const state = createInitialState(8510);
  const player = attempt(state, 'penalty:player');
  const teammate = {
    momentId: 'penalty:teammate',
    actorId: 'NPC_PLR_10',
    technique: 75,
    composure: 81,
    form: 64,
    pressure: 72
  };
  assert.notEqual(penaltySuccessProbability(player), penaltySuccessProbability(teammate));
  const beforeNarrative = structuredClone(state.rngState.narrative);
  const result = resolvePenaltyMomentInPlace(state, teammate);
  assert.equal(result.actorId, 'NPC_PLR_10');
  assert.deepEqual(state.rngState.narrative, beforeNarrative);
});
