import test from 'node:test';
import assert from 'node:assert/strict';

import { NPC_EVENT_KNOWLEDGE_RULES } from '../dist/catalog/npc-knowledge-rules.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_20_23 } from '../dist/content/events/20_23/index.js';
import { getNpcKnowledgeRecord, npcKnows } from '../dist/core/npc-knowledge.js';
import { eligibleChoices } from '../dist/narrative/choice-eligibility.js';
import { eventGatesPass, gateAlternatives } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';
import { resolveLockerSlot } from '../dist/simulation/locker-leadership.js';

const IDS = ['EVT_21_CAP_001', 'EVT_21_PRS_001', 'EVT_22_CON_001', 'EVT_22_CON_002'];
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

const stateFor = (age, seed = 525500) => {
  const state = createInitialState(seed);
  state.age = age;
  state.phase = '20_23';
  state.date = `${2026 + Math.max(0, age - 18)}-09-15`;
  return state;
};

test('T5.5-B replaces four generic shells with explicit canonical scenes', () => {
  for (const id of IDS) {
    const event = byId(id);
    assert.equal(event.canonStatus, 'verified');
    assert.ok(event.intel.visible.length >= 2, `${id} needs visible facts`);
    assert.ok(event.intel.uncertain.length >= 2, `${id} needs uncertainty`);
    assert.ok(event.tags?.includes('canonical_t55_b'));
    assert.ok(!event.choices.some(choice => GENERIC_LABELS.has(choice.label)), `${id} still has generic choices`);
  }
});

test('T5.5-B exposes the canonical dilemma-specific choice sets', () => {
  assert.deepEqual(byId('EVT_21_CAP_001').choices.map(choice => choice.id), [
    'PARTICIPATE_VOTE', 'LISTEN_NO_NAME', 'DISSENT_MINORITY', 'DECLINE_FOR_NOW'
  ]);
  assert.deepEqual(byId('EVT_21_PRS_001').choices.map(choice => choice.id), [
    'CORRECT_WITH_NUMBER', 'DENY_NO_NUMBER', 'LET_STAND', 'CLUB_CORRECT'
  ]);
  assert.deepEqual(byId('EVT_22_CON_001').choices.map(choice => choice.id), [
    'OPEN_RENEWAL_NOW', 'WAIT_SUMMER', 'SHORT_EXTENSION_CLAUSE', 'NO_RENEWAL_FOR_NOW'
  ]);
  assert.deepEqual(byId('EVT_22_CON_002').choices.map(choice => choice.id), [
    'RUN_DOWN', 'ACCEPT_SALE_PATH', 'RENEW_STRONG_UPGRADE', 'SIGNAL_PREAGREEMENT'
  ]);
});

test('T5.5-B uses authoritative locker, media and contract gates', () => {
  const captain = byId('EVT_21_CAP_001');
  const captainState = stateFor(21);
  captainState.professional.lockerPower = 27;
  assert.equal(eventGatesPass(captainState, captain), false);
  captainState.professional.lockerPower = 28;
  assert.equal(eventGatesPass(captainState, captain), true);

  const press = byId('EVT_21_PRS_001');
  assert.equal(gateAlternatives(press)?.length, 2);
  const pressState = stateFor(21);
  pressState.reputation.mediaHeat = 19;
  pressState.professional.nationalHeat = 23;
  assert.equal(eventGatesPass(pressState, press), false);
  pressState.reputation.mediaHeat = 20;
  assert.equal(eventGatesPass(pressState, press), true, 'media heat route must open independently');
  pressState.reputation.mediaHeat = 0;
  pressState.professional.nationalHeat = 24;
  assert.equal(eventGatesPass(pressState, press), true, 'national heat route must open independently');

  const early = byId('EVT_22_CON_001');
  const earlyState = stateFor(22);
  earlyState.contract.monthsRemaining = 11;
  assert.equal(eventGatesPass(earlyState, early), false);
  earlyState.contract.monthsRemaining = 12;
  assert.equal(eventGatesPass(earlyState, early), true);
  earlyState.contract.monthsRemaining = 24;
  assert.equal(eventGatesPass(earlyState, early), true);
  earlyState.contract.monthsRemaining = 25;
  assert.equal(eventGatesPass(earlyState, early), false);

  const runDown = byId('EVT_22_CON_002');
  const runDownState = stateFor(22);
  runDownState.contract.monthsRemaining = 13;
  assert.equal(eventGatesPass(runDownState, runDown), false);
  runDownState.contract.monthsRemaining = 12;
  assert.equal(eventGatesPass(runDownState, runDown), true);
  runDownState.contract.monthsRemaining = 1;
  assert.equal(eventGatesPass(runDownState, runDown), true);
  runDownState.contract.monthsRemaining = 0;
  assert.equal(eventGatesPass(runDownState, runDown), false);
});

test('T5.5-B gates and choice projection consume zero RNG', () => {
  for (const id of IDS) {
    const event = byId(id);
    const state = stateFor(id.startsWith('EVT_22') ? 22 : 21, 525501);
    state.professional.lockerPower = 60;
    state.reputation.mediaHeat = 60;
    state.contract.monthsRemaining = id === 'EVT_22_CON_002' ? 8 : 18;
    const before = structuredClone(state.rngState);
    eventGatesPass(state, event);
    eligibleChoices(state, event);
    assert.deepEqual(state.rngState, before, `${id} gate/projection consumed RNG`);
  }
});

test('T5.5-B seeds encode the canonical precedent without inventing consumers', () => {
  const captain = transitions(byId('EVT_21_CAP_001'));
  assert.ok(captain.length > 0 && captain.every(t => t.seedId === 'SEED_FIRST_CAPTAIN_ROOM' && t.action === 'create'));

  const press = transitions(byId('EVT_21_PRS_001'));
  assert.ok(press.length > 0 && press.every(t => t.seedId === 'SEED_PUBLIC_CONTRACT' && t.action === 'create'));

  for (const id of ['EVT_22_CON_001', 'EVT_22_CON_002']) {
    const contract = transitions(byId(id));
    assert.ok(contract.length > 0 && contract.every(t => t.seedId === 'SEED_FIRST_FREE_AGENCY' && t.action === 'create'));
    assert.ok(byId(id).seedsRead?.includes('SEED_CONTRACT_HARDLINE'));
    assert.ok(!contract.some(t => t.seedId === 'SEED_CONTRACT_HARDLINE'), `${id} must not fabricate a new hardline origin`);
  }
});

test('T5.5-B contract scenes never mutate contract authority or club directly', () => {
  for (const id of IDS) {
    const paths = effectPaths(byId(id));
    assert.ok(paths.every(path => typeof path !== 'string' || !path.startsWith('contract.')), `${id} writes contract.* directly`);
    assert.ok(!paths.includes('club'), `${id} writes club directly`);
  }

  for (const [id, choiceId, months] of [
    ['EVT_22_CON_001', 'OPEN_RENEWAL_NOW', 18],
    ['EVT_22_CON_001', 'NO_RENEWAL_FOR_NOW', 18],
    ['EVT_22_CON_002', 'RUN_DOWN', 8],
    ['EVT_22_CON_002', 'RENEW_STRONG_UPGRADE', 8]
  ]) {
    const state = stateFor(22, 525510 + months);
    state.contract.monthsRemaining = months;
    const beforeContract = structuredClone(state.contract);
    const result = resolveChoice(state, byId(id), choiceId, true);
    assert.deepEqual(result.state.contract, beforeContract, `${id}/${choiceId} bypassed CareerOffer authority`);
  }
});

test('T5.5-B resolves captain knowledge through the authoritative live slot', () => {
  const state = stateFor(21, 525520);
  state.professional.lockerPower = 60;
  const captainId = resolveLockerSlot(state, 'captain');
  assert.ok(captainId, 'test route needs a certified current-club captain');
  const result = resolveChoice(state, byId('EVT_21_CAP_001'), 'DISSENT_MINORITY', true);
  assert.equal(npcKnows(result.state, captainId, 'EVT_21_CAP_001'), true);
  assert.equal(getNpcKnowledgeRecord(result.state, captainId, 'EVT_21_CAP_001')?.source, 'witnessed');
  assert.equal(npcKnows(result.state, 'NPC_PLR_11', 'EVT_21_CAP_001'), captainId === 'NPC_PLR_11');
});

test('T5.5-B press knowledge follows public/informed channels and silence informs nobody', () => {
  const rules = (eventId, choiceId) => NPC_EVENT_KNOWLEDGE_RULES.filter(rule =>
    rule.eventId === eventId && (!rule.choiceIds || rule.choiceIds.includes(choiceId))
  );
  assert.equal(rules('EVT_21_PRS_001', 'CORRECT_WITH_NUMBER')[0]?.source, 'public');
  assert.equal(rules('EVT_21_PRS_001', 'DENY_NO_NUMBER')[0]?.source, 'public');
  assert.equal(rules('EVT_21_PRS_001', 'LET_STAND').length, 0);

  let state = stateFor(21, 525530);
  state.reputation.mediaHeat = 50;
  let result = resolveChoice(state, byId('EVT_21_PRS_001'), 'CORRECT_WITH_NUMBER', true);
  assert.equal(npcKnows(result.state, 'NPC_PRS_01', 'EVT_21_PRS_001'), true);
  assert.equal(getNpcKnowledgeRecord(result.state, 'NPC_PRS_01', 'EVT_21_PRS_001')?.source, 'public');

  state = stateFor(21, 525531);
  state.reputation.mediaHeat = 50;
  result = resolveChoice(state, byId('EVT_21_PRS_001'), 'LET_STAND', true);
  assert.equal(npcKnows(result.state, 'NPC_PRS_01', 'EVT_21_PRS_001'), false, 'silence must not magically reveal player intent');
});

test('T5.5-B does not pretend a UDV director knows contract strategy after a club change', () => {
  for (const eventId of ['EVT_22_CON_001', 'EVT_22_CON_002']) {
    const rules = NPC_EVENT_KNOWLEDGE_RULES.filter(rule => rule.eventId === eventId);
    assert.equal(rules.length, 0, `${eventId} needs a dynamic current-club institutional target before persisting director knowledge`);
  }
  const clubCorrectionRules = NPC_EVENT_KNOWLEDGE_RULES.filter(rule =>
    rule.eventId === 'EVT_21_PRS_001' && rule.choiceIds?.includes('CLUB_CORRECT')
  );
  assert.equal(clubCorrectionRules.length, 0, 'club correction cannot target fixed UDV director on non-UDV careers');
});

test('T5.5-B stays inside functional 20-23 ownership', () => {
  assert.deepEqual(byId('EVT_21_CAP_001').ageWindow, [21, 21]);
  assert.deepEqual(byId('EVT_21_PRS_001').ageWindow, [21, 21]);
  assert.deepEqual(byId('EVT_22_CON_001').ageWindow, [22, 22]);
  assert.deepEqual(byId('EVT_22_CON_002').ageWindow, [22, 22]);
});
