import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { DeterministicRng } from '../dist/core/rng.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import {
  NARRATIVE_FOOTBALL_MOMENTS_KEY,
  getNarrativeFootballMoment,
  narrativeFootballMomentProbability,
  resolveNarrativeFootballMomentInPlace
} from '../dist/simulation/narrative-football-moment.js';

const attempt = (overrides = {}) => ({
  momentId: 'EVT_24_MATCH_001:PENALTY:1',
  kind: 'penalty',
  actorId: 'PLAYER',
  technique: 72,
  composure: 68,
  form: 61,
  pressure: 82,
  ...overrides
});

function nextRollFromState(stateValue) {
  const stream = { seed: 1, state: stateValue, draws: 0 };
  return new DeterministicRng(stream).next();
}

function findStreamState(predicate) {
  for (let candidate = 1; candidate < 100000; candidate++) {
    if (predicate(nextRollFromState(candidate))) return candidate;
  }
  throw new Error('No deterministic football stream state found for predicate');
}

test('T5 shared football/1 probability is pure, bounded and uses sporting inputs', () => {
  const state = createInitialState(8501);
  const before = structuredClone(state.rngState);
  const base = narrativeFootballMomentProbability(attempt());
  const calm = narrativeFootballMomentProbability(attempt({ pressure: 10 }));
  const composed = narrativeFootballMomentProbability(attempt({ composure: 95 }));
  const weak = narrativeFootballMomentProbability(attempt({ technique: -100, composure: -100, form: -100, pressure: 200 }));
  const elite = narrativeFootballMomentProbability(attempt({ technique: 200, composure: 200, form: 200, pressure: -100 }));

  assert.ok(base > 0.5 && base < 0.92);
  assert.ok(calm > base);
  assert.ok(composed > base);
  assert.equal(weak, 0.5);
  assert.equal(elite, 0.92);
  assert.deepEqual(state.rngState, before, 'probability preview must consume zero RNG');
});

test('T5 shared football/2 same football state and sporting context is deterministic; narrative RNG is irrelevant', () => {
  const base = createInitialState(8502);
  const a = structuredClone(base);
  const b = structuredClone(base);
  b.rngState.narrative.state ^= 0x13579bdf;
  b.rngState.narrative.draws += 37;

  const factA = resolveNarrativeFootballMomentInPlace(a, attempt());
  const factB = resolveNarrativeFootballMomentInPlace(b, attempt());

  assert.deepEqual(factB, factA);
  assert.equal(a.rngState.football.draws, base.rngState.football.draws + 1);
  assert.equal(b.rngState.football.draws, base.rngState.football.draws + 1);
});

test('T5 shared football/3 changing only football RNG can change the sporting outcome', () => {
  const probability = narrativeFootballMomentProbability(attempt());
  const scoringState = findStreamState(roll => roll < Math.min(0.15, probability - 0.05));
  const missingState = findStreamState(roll => roll > Math.max(0.95, probability + 0.05));
  const scored = createInitialState(8503);
  const missed = structuredClone(scored);
  scored.rngState.football.state = scoringState;
  scored.rngState.football.draws = 0;
  missed.rngState.football.state = missingState;
  missed.rngState.football.draws = 0;

  const scoredFact = resolveNarrativeFootballMomentInPlace(scored, attempt());
  const missedFact = resolveNarrativeFootballMomentInPlace(missed, attempt());

  assert.equal(scoredFact.outcome, 'scored');
  assert.equal(missedFact.outcome, 'missed');
  assert.notEqual(scoredFact.roll, missedFact.roll);
});

test('T5 shared football/4 resolution mutates only football RNG plus the factual moment registry', () => {
  const state = createInitialState(8504);
  const relationshipsBefore = structuredClone(state.relationships);
  const seedsBefore = structuredClone(state.seeds);
  const narrativeBefore = structuredClone(state.rngState.narrative);
  const microfeedBefore = structuredClone(state.rngState.microfeed);
  const qaBefore = structuredClone(state.rngState.qa);
  const footballDraws = state.rngState.football.draws;

  const fact = resolveNarrativeFootballMomentInPlace(state, attempt());

  assert.deepEqual(state.relationships, relationshipsBefore);
  assert.deepEqual(state.seeds, seedsBefore);
  assert.deepEqual(state.rngState.narrative, narrativeBefore);
  assert.deepEqual(state.rngState.microfeed, microfeedBefore);
  assert.deepEqual(state.rngState.qa, qaBefore);
  assert.equal(state.rngState.football.draws, footballDraws + 1);
  assert.deepEqual(getNarrativeFootballMoment(state, fact.momentId), fact);
  assert.ok(state.world[NARRATIVE_FOOTBALL_MOMENTS_KEY]);
});

test('T5 shared football/5 read/preview before resolution does not alter the future draw', () => {
  const observed = createInitialState(8505);
  const control = structuredClone(observed);
  const before = structuredClone(observed.rngState);

  assert.equal(getNarrativeFootballMoment(observed, attempt().momentId), null);
  narrativeFootballMomentProbability(attempt());
  assert.deepEqual(observed.rngState, before);

  const observedFact = resolveNarrativeFootballMomentInPlace(observed, attempt());
  const controlFact = resolveNarrativeFootballMomentInPlace(control, attempt());
  assert.deepEqual(observedFact, controlFact);
});

test('T5 shared football/6 save/resume before draw preserves the future result exactly', () => {
  const state = createInitialState(8506);
  const restored = loadSave(serializeSave(state));

  const direct = resolveNarrativeFootballMomentInPlace(state, attempt());
  const afterReload = resolveNarrativeFootballMomentInPlace(restored, attempt());
  assert.deepEqual(afterReload, direct);
});

test('T5 shared football/7 resolved moments are idempotent across replay and save/reload', () => {
  const state = createInitialState(8507);
  const first = resolveNarrativeFootballMomentInPlace(state, attempt());
  const drawsAfterFirst = state.rngState.football.draws;
  const second = resolveNarrativeFootballMomentInPlace(state, attempt());
  assert.deepEqual(second, first);
  assert.equal(state.rngState.football.draws, drawsAfterFirst, 'same moment replay must not re-roll');

  const restored = loadSave(serializeSave(state));
  const restoredDraws = restored.rngState.football.draws;
  const third = resolveNarrativeFootballMomentInPlace(restored, attempt());
  assert.deepEqual(third, first);
  assert.equal(restored.rngState.football.draws, restoredDraws, 'post-save replay must not re-roll');

  assert.throws(
    () => resolveNarrativeFootballMomentInPlace(restored, attempt({ actorId: 'NPC_PLR_10' })),
    /already resolved with different context/
  );
  assert.equal(restored.rngState.football.draws, restoredDraws, 'semantic collision must fail before RNG');
});

test('T5 shared football/8 malformed persisted registry fails closed before consuming football RNG', () => {
  const state = createInitialState(8508);
  state.world[NARRATIVE_FOOTBALL_MOMENTS_KEY] = 'corrupt';
  const before = structuredClone(state.rngState.football);
  assert.throws(() => resolveNarrativeFootballMomentInPlace(state, attempt()), /Invalid narrative football moment registry/);
  assert.deepEqual(state.rngState.football, before);
});
