import './test-t5-sport-context.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import {
  penaltySuccessProbability,
  playerPenaltyAttempt,
  resolvePenaltyMomentInPlace
} from '../dist/simulation/football-moments.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { assertGameState } from '../dist/save/validation.js';
import { GameSession } from '../dist/session/game-session.js';

const attempt = (state, id = 'EVT_24_MATCH_001:TAKE:penalty', pressure = 72) => playerPenaltyAttempt(state, id, pressure);
const streams = state => structuredClone(state.rngState);
const invalidSave = error => error?.code === 'INVALID_SAVE';

function persistedState(seed = 8600) {
  const state = createInitialState(seed);
  resolvePenaltyMomentInPlace(state, attempt(state));
  return state;
}

test('football moments/1 protagonist input uses persisted sporting attributes and reads consume 0 RNG', () => {
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
  assert.deepEqual(state.rngState, before);
});

test('football moments/2 resolving consumes exactly one football draw and no narrative/microfeed/qa draw', () => {
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

test('football moments/3 same seed/state/input produces the same sporting fact', () => {
  const a = createInitialState(8503);
  const b = createInitialState(8503);
  const ra = resolvePenaltyMomentInPlace(a, attempt(a));
  const rb = resolvePenaltyMomentInPlace(b, attempt(b));
  assert.equal(ra.outcome, rb.outcome);
  assert.equal(ra.probability, rb.probability);
  assert.equal(ra.draw, rb.draw);
  assert.deepEqual(a.rngState.football, b.rngState.football);
});

test('football moments/4 changing only narrative RNG does not change the sporting result', () => {
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

test('football moments/5 changing football RNG changes the draw without changing the formula', () => {
  const a = createInitialState(8505);
  const b = createInitialState(8505);
  b.rngState.football.state += 123456789;
  const ra = resolvePenaltyMomentInPlace(a, attempt(a));
  const rb = resolvePenaltyMomentInPlace(b, attempt(b));
  assert.notEqual(ra.draw, rb.draw);
  assert.equal(ra.probability, rb.probability);
});

test('football moments/6 save/load before the draw preserves the future result', () => {
  const original = createInitialState(8506);
  const restored = loadSave(serializeSave(original));
  const a = resolvePenaltyMomentInPlace(original, attempt(original));
  const b = resolvePenaltyMomentInPlace(restored, attempt(restored));
  assert.equal(a.outcome, b.outcome);
  assert.equal(a.draw, b.draw);
  assert.equal(a.probability, b.probability);
  assert.deepEqual(original.rngState.football, restored.rngState.football);
});

test('football moments/7 save/load after the draw replays and does not re-roll', () => {
  const state = persistedState(8507);
  const first = state.world.footballMomentResults['EVT_24_MATCH_001:TAKE:penalty'];
  const restored = loadSave(serializeSave(state));
  const drawsBefore = restored.rngState.football.draws;
  const again = resolvePenaltyMomentInPlace(restored, attempt(restored));
  assert.equal(again.replayed, true);
  assert.equal(again.outcome, first.outcome);
  assert.equal(again.probability, first.probability);
  assert.equal(restored.rngState.football.draws, drawsBefore);
});

test('football moments/8 double resolution of one momentId is idempotent', () => {
  const state = createInitialState(8508);
  const input = attempt(state);
  const first = resolvePenaltyMomentInPlace(state, input);
  const afterFirst = streams(state);
  const second = resolvePenaltyMomentInPlace(state, input);
  assert.equal(second.replayed, true);
  assert.equal(second.outcome, first.outcome);
  assert.deepEqual(state.rngState, afterFirst);
});

test('football moments/9 same momentId with incompatible sporting inputs fails without another draw', () => {
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

test('football moments/10 non-player actors require explicit sporting attributes', () => {
  const state = createInitialState(8510);
  const player = attempt(state, 'EVT_24_MATCH_001:PLAYER:penalty');
  const teammate = {
    momentId: 'EVT_24_MATCH_001:NPC_PLR_10:penalty',
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

test('football moments/11 malformed and unknown moment ids fail before RNG is consumed', () => {
  const state = createInitialState(8511);
  const input = attempt(state);
  const before = streams(state);
  assert.throws(() => resolvePenaltyMomentInPlace(state, { ...input, momentId: 'bad id with spaces' }), /football moment id/);
  assert.throws(() => resolvePenaltyMomentInPlace(state, { ...input, momentId: 'EVT_99_MATCH_999:TAKE:penalty' }), /Unknown football moment id/);
  assert.deepEqual(state.rngState, before);
});

test('football moments/12 save boundary accepts valid rows and rejects malformed or semantically inconsistent facts', () => {
  const state = persistedState(8512);
  const raw = JSON.parse(serializeSave(state));
  assert.doesNotThrow(() => loadSave(JSON.stringify(raw)));
  const momentId = Object.keys(raw.world.footballMomentResults)[0];
  const corruptions = [
    row => { row.outcome = 'impossible'; },
    row => { row.probability = 2; },
    row => { row.probability = row.probability >= 0.46 ? row.probability - 0.01 : row.probability + 0.01; },
    row => { row.inputSignature = ''; },
    row => { row.inputSignature = ` ${row.inputSignature}`; },
    row => { row.actorId = 'NPC_PLR_10'; },
    row => { row.version = 99; },
    row => { row.resolvedAt = '2026-02-30'; },
    row => { row.resolvedAt = '2999-01-01'; },
    row => { row.kind = 'free-kick'; },
    row => { row.extra = true; }
  ];
  for (const corrupt of corruptions) {
    const bad = structuredClone(raw);
    corrupt(bad.world.footballMomentResults[momentId]);
    assert.throws(() => loadSave(JSON.stringify(bad)), invalidSave);
    assert.throws(() => assertGameState(bad), invalidSave);
  }
  const badStore = structuredClone(raw);
  badStore.world.footballMomentResults = [];
  assert.throws(() => loadSave(JSON.stringify(badStore)), invalidSave);
  const unknownMoment = structuredClone(raw);
  unknownMoment.world.footballMomentResults['EVT_99_MATCH_999:TAKE:penalty'] = unknownMoment.world.footballMomentResults[momentId];
  delete unknownMoment.world.footballMomentResults[momentId];
  assert.throws(() => loadSave(JSON.stringify(unknownMoment)), invalidSave);
});

test('football moments/13 validation consumes 0 RNG and does not mutate a valid persisted store', () => {
  const state = persistedState(8513);
  const before = structuredClone(state);
  assertGameState(state);
  assert.deepEqual(state, before);
  const restored = loadSave(JSON.stringify(state));
  assert.deepEqual(restored, before);
});

test('football moments/14 session restore rejects a corrupt persisted sporting fact before gameplay', async () => {
  const session = await GameSession.create(8514);
  const snapshot = session.exportSnapshot();
  resolvePenaltyMomentInPlace(snapshot.state, attempt(snapshot.state));
  const momentId = Object.keys(snapshot.state.world.footballMomentResults)[0];
  snapshot.state.world.footballMomentResults[momentId].outcome = 'impossible';
  await assert.rejects(GameSession.resume(snapshot), invalidSave);
});

test('football moments/15 resolver does not double-own aggregate statistics or relationships', () => {
  const state = createInitialState(8515);
  const sportBefore = structuredClone(state.sport);
  const relationsBefore = structuredClone(state.relationships);
  const professionalBefore = structuredClone(state.professional);
  resolvePenaltyMomentInPlace(state, attempt(state));
  assert.deepEqual(state.sport, sportBefore);
  assert.deepEqual(state.relationships, relationsBefore);
  assert.deepEqual(state.professional, professionalBefore);
});

test('football moments/16 different registered moment ids consume independent football draws', () => {
  const state = createInitialState(8516);
  const before = state.rngState.football.draws;
  const first = resolvePenaltyMomentInPlace(state, attempt(state, 'EVT_24_MATCH_001:TAKE:penalty'));
  const second = resolvePenaltyMomentInPlace(state, attempt(state, 'EVT_26_MATCH_001:RECORD:penalty'));
  assert.notEqual(first.draw, second.draw);
  assert.equal(state.rngState.football.draws, before + 2);
  assert.equal(Object.keys(state.world.footballMomentResults).length, 2);
});
