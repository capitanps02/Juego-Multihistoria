import test from 'node:test';
import assert from 'node:assert/strict';

import { NPC_EVENT_KNOWLEDGE_RULES } from '../dist/catalog/npc-knowledge-rules.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_20_23 } from '../dist/content/events/20_23/index.js';
import { npcKnows } from '../dist/core/npc-knowledge.js';
import { eligibleChoices } from '../dist/narrative/choice-eligibility.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';

const IDS = ['EVT_20_STATUS_001', 'EVT_20_LOCK_001', 'EVT_20_LOCK_002'];
const GENERIC_LABELS = new Set([
  'Tomar la iniciativa',
  'Esperar y reunir información',
  'Proteger tu posición',
  'Buscar una solución intermedia',
  'Actuar ahora',
  'Esperar',
  'Moverlo por otro canal'
]);

const byId = id => {
  const matches = EVENTS_20_23.filter(event => event.id === id);
  assert.equal(matches.length, 1, `${id} must have exactly one active definition`);
  return matches[0];
};

const transitions = event => event.outcomes.flatMap(outcome => outcome.seedTransitions ?? []);
const effectPaths = event => [
  ...event.choices.flatMap(choice => choice.immediateEffects ?? []),
  ...event.outcomes.flatMap(outcome => outcome.effects ?? [])
].map(effect => effect.kind === 'flag' ? `flags.${effect.flag}` : effect.path);

const stateFor = seed => {
  const state = createInitialState(seed);
  state.age = 20;
  state.phase = '20_23';
  state.date = '2028-09-15';
  return state;
};

test('T5.6-A replaces three age-20 generic shells with explicit canonical scenes', () => {
  for (const id of IDS) {
    const event = byId(id);
    assert.equal(event.canonStatus, 'verified');
    assert.deepEqual(event.ageWindow, [20, 20]);
    assert.ok(event.intel.visible.length >= 2, `${id} needs visible facts`);
    assert.ok(event.intel.uncertain.length >= 2, `${id} needs uncertainty`);
    assert.ok(event.tags?.includes('canonical_t56_a'));
    assert.ok(!event.choices.some(choice => GENERIC_LABELS.has(choice.label)), `${id} still has generic choice text`);
  }
});

test('T5.6-A exposes dilemma-specific choice sets', () => {
  assert.deepEqual(byId('EVT_20_STATUS_001').choices.map(choice => choice.id), [
    'ASK_NUMBER', 'COACH_FIRST', 'KEEP_NUMBER', 'SPEAK_VETERAN'
  ]);
  assert.deepEqual(byId('EVT_20_LOCK_001').choices.map(choice => choice.id), [
    'PLAY_ON', 'MATCH_INTENSITY', 'PUBLIC_BOUNDARY', 'PRIVATE_AFTER'
  ]);
  assert.deepEqual(byId('EVT_20_LOCK_002').choices.map(choice => choice.id), [
    'CONFIRM_STORY', 'REFUSE_NO_EXPOSE', 'SAY_DONT_KNOW', 'ASK_WHAT_HIDES'
  ]);
});

test('T5.6-A status and training reachability use only facts the engine actually owns', () => {
  const status = byId('EVT_20_STATUS_001');
  const statusState = stateFor(560001);
  statusState.sport.roleScore = 34;
  assert.equal(eventGatesPass(statusState, status), false);
  statusState.sport.roleScore = 35;
  assert.equal(eventGatesPass(statusState, status), true);

  const training = byId('EVT_20_LOCK_001');
  const lockerState = stateFor(560002);
  lockerState.professional.lockerPower = 56;
  assert.equal(eventGatesPass(lockerState, training), false);
  lockerState.professional.lockerPower = 55;
  assert.equal(eventGatesPass(lockerState, training), true);

  const cover = byId('EVT_20_LOCK_002');
  const coverState = stateFor(560003);
  assert.equal(eventGatesPass(coverState, cover), true, 'the incident itself establishes the known-false detail; no synthetic external fact is required');
});

test('T5.6-A gates and choice projection consume zero RNG', () => {
  for (const id of IDS) {
    const event = byId(id);
    const state = stateFor(560010 + IDS.indexOf(id));
    state.sport.roleScore = 60;
    state.professional.lockerPower = 40;
    const before = structuredClone(state.rngState);
    eventGatesPass(state, event);
    eligibleChoices(state, event);
    assert.deepEqual(state.rngState, before, `${id} consumed RNG during gating/projection`);
  }
});

test('T5.6-A writes only the intended teammate-cover seed', () => {
  assert.deepEqual(transitions(byId('EVT_20_STATUS_001')), []);
  assert.deepEqual(transitions(byId('EVT_20_LOCK_001')), []);
  const cover = transitions(byId('EVT_20_LOCK_002'));
  assert.ok(cover.length > 0);
  assert.ok(cover.every(t => t.seedId === 'SEED_TEAMMATE_COVER' && t.action === 'create'));
  assert.deepEqual(byId('EVT_20_LOCK_002').seedsWrite, ['SEED_TEAMMATE_COVER']);
});

test('T5.6-A never mutates contract or club authority', () => {
  for (const id of IDS) {
    const paths = effectPaths(byId(id));
    assert.ok(paths.every(path => typeof path !== 'string' || !path.startsWith('contract.')), `${id} writes contract.*`);
    assert.ok(!paths.includes('club'), `${id} writes club directly`);
  }
});

test('T5.6-A incidental teammates do not become omniscient persistent NPCs', () => {
  for (const id of IDS) {
    const rules = NPC_EVENT_KNOWLEDGE_RULES.filter(rule => rule.eventId === id);
    assert.equal(rules.length, 0, `${id} must not grant persistent knowledge without an authoritative named actor`);
  }

  const state = stateFor(560020);
  const result = resolveChoice(state, byId('EVT_20_LOCK_002'), 'CONFIRM_STORY', true);
  for (const npcId of ['NPC_PLR_10', 'NPC_PLR_11', 'NPC_PLR_12', 'NPC_PLR_13', 'NPC_PLR_14', 'NPC_PLR_15']) {
    assert.equal(npcKnows(result.state, npcId, 'EVT_20_LOCK_002'), false, `${npcId} learned Marcos scene without an epistemic channel`);
  }
});

test('T5.6-A resolver produces differentiated state changes while preserving authority', () => {
  const baseStatus = stateFor(560030);
  baseStatus.sport.roleScore = 60;
  const ask = resolveChoice(baseStatus, byId('EVT_20_STATUS_001'), 'ASK_NUMBER', true).state;
  const keep = resolveChoice(baseStatus, byId('EVT_20_STATUS_001'), 'KEEP_NUMBER', true).state;
  assert.notDeepEqual(
    [ask.professional.lockerPower, ask.professional.environmentStability],
    [keep.professional.lockerPower, keep.professional.environmentStability]
  );

  const baseLocker = stateFor(560031);
  baseLocker.professional.lockerPower = 30;
  const publicBoundary = resolveChoice(baseLocker, byId('EVT_20_LOCK_001'), 'PUBLIC_BOUNDARY', true).state;
  const privateAfter = resolveChoice(baseLocker, byId('EVT_20_LOCK_001'), 'PRIVATE_AFTER', true).state;
  assert.notDeepEqual(
    [publicBoundary.professional.lockerPower, publicBoundary.professional.environmentStability],
    [privateAfter.professional.lockerPower, privateAfter.professional.environmentStability]
  );
});
