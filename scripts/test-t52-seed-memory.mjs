import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { resolveChoice } from '../dist/narrative/resolver.js';
import {
  getBrunoFavorState,
  projectSeedMemory,
  seedInstanceScopeValid
} from '../dist/narrative/seed-memory.js';
import { narrativeConditionRoot } from '../dist/simulation/club-contract-intent.js';

function addSeed(state, overrides = {}) {
  const seed = {
    id: 'SEED_BRUNO_FAVOR',
    state: 'active',
    intensity: 46,
    originEvent: 'EVT_18_TEAM_001',
    originSeason: state.season,
    npcRefs: ['NPC_PLR_12'],
    payload: { stance: 'helped' },
    lastTouchedDate: state.date,
    ...overrides
  };
  state.seeds.push(seed);
  return seed;
}

function parityEvent(modifierOnly = false) {
  return {
    id: modifierOnly ? 'T52_ROOT_MODIFIER' : 'T52_ROOT_OUTCOME',
    ageWindow: [18, 18],
    phase: '18_20',
    family: 'conditional',
    gates: [],
    cooldown: 0,
    repeatable: false,
    weight: 1,
    text: { title: 'Parity', body: 'Synthetic T5.2 condition-root fixture.' },
    intel: { visible: [], uncertain: [] },
    choices: [{ id: 'GO', label: 'Go', intentTags: [], outcomeIds: ['A', 'B'] }],
    outcomes: modifierOnly ? [
      {
        id: 'A', baseWeight: 1,
        modifiers: [{
          id: 'SEED_FACT',
          conditions: [{ path: 'facts.brunoFavorStance', op: 'eq', value: 'helped' }],
          multiply: 5,
          reason: 'Synthetic causal seed fact modifier.'
        }],
        effects: [], messages: ['a']
      },
      { id: 'B', baseWeight: 1, effects: [], messages: ['b'] }
    ] : [
      {
        id: 'A',
        conditions: [{ path: 'facts.brunoFavorStance', op: 'eq', value: 'helped' }],
        baseWeight: 1, effects: [], messages: ['a']
      },
      {
        id: 'B',
        conditions: [{ path: 'facts.brunoFavorStance', op: 'eq', value: 'betrayed' }],
        baseWeight: 1, effects: [], messages: ['b']
      }
    ]
  };
}

test('seed memory distinguishes live meaning from historical existence', () => {
  const state = createInitialState(52001);
  const seed = addSeed(state);

  const live = getBrunoFavorState(state);
  assert.equal(live.source, 'live');
  assert.equal(live.historicalExists, true);
  assert.equal(live.live, true);
  assert.equal(live.scopeValid, true);
  assert.equal(live.stance, 'helped');
  assert.equal(live.originEvent, 'EVT_18_TEAM_001');
  assert.equal(live.intensity, 46);

  seed.state = 'resolved';
  seed.consumedBy = 'CEVT_SYNTHETIC';
  const historical = getBrunoFavorState(state);
  assert.equal(historical.source, 'historical');
  assert.equal(historical.historicalExists, true);
  assert.equal(historical.live, false);
  assert.equal(historical.stance, null, 'historical payload must not be promoted to a live causal fact');
  assert.equal(historical.payload.stance, 'helped', 'historical provenance remains inspectable explicitly');
});

test('scope projection fails closed for a live club-scoped seed after club change', () => {
  const state = createInitialState(52002);
  const seed = addSeed(state, {
    id: 'SEED_PRIVATE_CHAT',
    originEvent: 'EVT_24_LOCK_001',
    payload: { __t52OriginClub: state.club, mode: 'private' }
  });
  assert.equal(seedInstanceScopeValid(state, seed), true);
  state.club = 'OTHER_CLUB';
  assert.equal(seedInstanceScopeValid(state, seed), false);
  const projected = projectSeedMemory(state, 'SEED_PRIVATE_CHAT');
  assert.equal(projected.historicalExists, true);
  assert.equal(projected.live, false);
  assert.equal(projected.scopeValid, false);
});

test('finite age window makes stale non-terminal seed unavailable without rewriting history', () => {
  const state = createInitialState(52003);
  const seed = addSeed(state);
  state.age = 33;
  const projected = getBrunoFavorState(state);
  assert.equal(projected.historicalExists, true);
  assert.equal(projected.live, false);
  assert.equal(projected.scopeValid, false);
  assert.equal(projected.stance, null);
  assert.equal(seed.state, 'active', 'read-only projection must not mutate persisted lifecycle history');
});

test('causal projections consume zero RNG and do not mutate saves', () => {
  const state = createInitialState(52004);
  addSeed(state);
  const before = structuredClone(state);
  const root = narrativeConditionRoot(state);
  assert.equal(root.facts.brunoFavorStance, 'helped');
  assert.deepEqual(state, before);
  assert.deepEqual(state.rngState, before.rngState);
});

test('outcome conditions resolve against the same causal root as gates and eligibility', () => {
  const state = createInitialState(52005);
  addSeed(state);
  const beforeDraws = state.rngState.narrative.draws;
  const result = resolveChoice(state, parityEvent(false), 'GO', true);
  assert.equal(result.outcomeId, 'A');
  assert.equal(result.state.rngState.narrative.draws, beforeDraws + 1);
  assert.deepEqual(result.debug.outcomeWeights.map(row => row.id), ['A']);
});

test('outcome modifiers can read causal seed facts without additional RNG', () => {
  const state = createInitialState(52006);
  addSeed(state);
  const beforeDraws = state.rngState.narrative.draws;
  const result = resolveChoice(state, parityEvent(true), 'GO', true);
  const weights = Object.fromEntries(result.debug.outcomeWeights.map(row => [row.id, row.weight]));
  assert.equal(weights.A, 5);
  assert.equal(weights.B, 1);
  assert.equal(result.state.rngState.narrative.draws, beforeDraws + 1);
});
