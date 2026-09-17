import test from 'node:test';
import assert from 'node:assert/strict';

import { NPC_EVENT_KNOWLEDGE_RULES } from '../dist/catalog/npc-knowledge-rules.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_20_23 } from '../dist/content/events/20_23/index.js';
import { getNpcKnowledgeRecord, npcKnows } from '../dist/core/npc-knowledge.js';
import { eligibleChoices } from '../dist/narrative/choice-eligibility.js';
import { eventGatesPass, gateAlternatives } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';

const IDS = [
  'EVT_20_LIFE_001',
  'EVT_20_ABR_001',
  'EVT_21_RIV_001',
  'CEVT_21_ABR_01',
  'CEVT_21_MEDIA_01'
];

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

const effectPaths = event => [
  ...event.choices.flatMap(choice => choice.immediateEffects ?? []),
  ...event.outcomes.flatMap(outcome => outcome.effects ?? [])
].map(effect => effect.kind === 'flag' ? `flags.${effect.flag}` : effect.path);

const transitions = event => event.outcomes.flatMap(outcome => outcome.seedTransitions ?? []);

const stateFor = (age, seed = 424242) => {
  const state = createInitialState(seed);
  state.age = age;
  state.phase = '20_23';
  state.date = `${2026 + Math.max(0, age - 18)}-09-15`;
  return state;
};

test('T5.5-A activates exactly one explicit canonical definition per scene', () => {
  for (const id of IDS) {
    const event = byId(id);
    assert.equal(event.canonStatus, 'verified', `${id} must be canon verified`);
    assert.ok(!event.choices.some(choice => GENERIC_LABELS.has(choice.label)), `${id} still exposes a generic shell choice`);
    assert.ok(event.intel.visible.length > 0, `${id} needs visible information`);
    assert.ok(event.intel.uncertain.length > 0, `${id} needs explicit uncertainty`);
  }
});

test('T5.5-A scene-specific choice sets match the canonical dilemmas', () => {
  assert.deepEqual(byId('EVT_20_LIFE_001').choices.map(choice => choice.id), [
    'STAY_HOME', 'RENT_NEAR_CLUB', 'SHARE_TEAMMATE', 'CLUB_TEMPORARY'
  ]);
  assert.deepEqual(byId('EVT_20_ABR_001').choices.map(choice => choice.id), [
    'INTENSIVE_CLASSES', 'BILINGUAL_TEAMMATE', 'BRIDGE_LANGUAGE', 'CLUB_MENTOR'
  ]);
  assert.deepEqual(byId('EVT_21_RIV_001').choices.map(choice => choice.id), [
    'PRAISE_ADRIAN', 'END_COMPARISONS', 'SPORTING_RIVALRY', 'PRIVATE_MESSAGE'
  ]);
  assert.deepEqual(byId('CEVT_21_ABR_01').choices.map(choice => choice.id), [
    'GO_HOME', 'STAY_INTEGRATE', 'CREATE_LOCAL_COMPANY'
  ]);
  assert.deepEqual(byId('CEVT_21_MEDIA_01').choices.map(choice => choice.id), [
    'ASK_CLARA_CONTEXT', 'PUBLIC_CORRECTION', 'CLARA_OFF_RECORD', 'LET_CYCLE_PASS'
  ]);
});

test('T5.5-A reachability uses authoritative gates and explicit OR semantics', () => {
  const abroad = byId('EVT_20_ABR_001');
  const abroadState = stateFor(20);
  abroadState.flags.ABROAD_ROUTE = false;
  assert.equal(eventGatesPass(abroadState, abroad), false);
  abroadState.flags.ABROAD_ROUTE = true;
  assert.equal(eventGatesPass(abroadState, abroad), true);

  const adrian = byId('EVT_21_RIV_001');
  const adrianState = stateFor(21);
  adrianState.flags.HAS_SEED_RIVAS_TRUST = true;
  adrianState.professional.nationalHeat = 60;
  assert.equal(eventGatesPass(adrianState, adrian), false, 'Rivas trust must never open the canonical Adrián scene');
  adrianState.flags.HAS_SEED_ADRIAN_MIRROR = true;
  assert.equal(eventGatesPass(adrianState, adrian), true);

  const christmas = byId('CEVT_21_ABR_01');
  const christmasState = stateFor(21);
  christmasState.flags.ABROAD_ROUTE = true;
  christmasState.professional.foreignAdaptation = 59;
  assert.equal(eventGatesPass(christmasState, christmas), true);
  christmasState.professional.foreignAdaptation = 60;
  assert.equal(eventGatesPass(christmasState, christmas), false);

  const media = byId('CEVT_21_MEDIA_01');
  const alternatives = gateAlternatives(media);
  assert.equal(alternatives?.length, 3, 'Clara / media heat / national heat must remain three OR routes');
  const mediaState = stateFor(21);
  mediaState.flags.HAS_SEED_CLARA_CHANNEL = false;
  mediaState.reputation.mediaHeat = 0;
  mediaState.professional.nationalHeat = 0;
  assert.equal(eventGatesPass(mediaState, media), false);
  mediaState.flags.HAS_SEED_CLARA_CHANNEL = true;
  assert.equal(eventGatesPass(mediaState, media), true, 'Clara route must open independently');
  mediaState.flags.HAS_SEED_CLARA_CHANNEL = false;
  mediaState.reputation.mediaHeat = 42;
  assert.equal(eventGatesPass(mediaState, media), true, 'public heat route must open independently');
  mediaState.reputation.mediaHeat = 0;
  mediaState.professional.nationalHeat = 40;
  assert.equal(eventGatesPass(mediaState, media), true, 'national heat route must open independently');
});

test('T5.5-A Clara-only choices fail closed without the Clara channel', () => {
  const event = byId('CEVT_21_MEDIA_01');
  const state = stateFor(21);
  state.reputation.mediaHeat = 50;
  state.flags.HAS_SEED_CLARA_CHANNEL = false;
  assert.deepEqual(eligibleChoices(state, event).map(choice => choice.id), ['PUBLIC_CORRECTION', 'LET_CYCLE_PASS']);
  state.flags.HAS_SEED_CLARA_CHANNEL = true;
  assert.deepEqual(eligibleChoices(state, event).map(choice => choice.id), [
    'ASK_CLARA_CONTEXT', 'PUBLIC_CORRECTION', 'CLARA_OFF_RECORD', 'LET_CYCLE_PASS'
  ]);
});

test('T5.5-A gates and choice projection consume no RNG', () => {
  const state = stateFor(21);
  state.flags.HAS_SEED_CLARA_CHANNEL = true;
  const event = byId('CEVT_21_MEDIA_01');
  const before = structuredClone(state.rngState);
  assert.equal(eventGatesPass(state, event), true);
  eligibleChoices(state, event);
  assert.deepEqual(state.rngState, before);
});

test('T5.5-A seed transitions use only the intended lifecycle identities', () => {
  const life = transitions(byId('EVT_20_LIFE_001'));
  assert.ok(life.length > 0 && life.every(t => t.seedId === 'SEED_FIRST_BIG_MONEY' && t.action === 'create'));

  const abroad = transitions(byId('EVT_20_ABR_001'));
  assert.ok(abroad.length > 0 && abroad.every(t => t.seedId === 'SEED_FOREIGN_ADAPT' && t.action === 'create'));

  const adrian = transitions(byId('EVT_21_RIV_001'));
  assert.ok(adrian.length > 0 && adrian.every(t => t.seedId === 'SEED_ADRIAN_MIRROR' && t.action === 'intensify'));
  assert.ok(!JSON.stringify(byId('EVT_21_RIV_001')).includes('SEED_RIVAS_TRUST'));

  const christmas = transitions(byId('CEVT_21_ABR_01'));
  assert.ok(christmas.length > 0 && christmas.every(t => t.seedId === 'SEED_FOREIGN_ADAPT' && t.action === 'intensify'));

  const media = transitions(byId('CEVT_21_MEDIA_01'));
  assert.ok(media.length > 0 && media.every(t => t.seedId === 'SEED_CLARA_CHANNEL' && t.action === 'intensify'));
});

test('T5.5-A does not mutate contract authority through narrative effects', () => {
  for (const id of IDS) {
    const event = byId(id);
    const paths = effectPaths(event);
    assert.ok(paths.every(path => typeof path !== 'string' || !path.startsWith('contract.')), `${id} writes contract.* directly`);
    assert.ok(!paths.includes('club'), `${id} changes club directly`);
  }
});

test('T5.5-A fixed NPC participants learn only through explicit epistemic channels', () => {
  const ruleFor = (eventId, choiceId) => NPC_EVENT_KNOWLEDGE_RULES.find(rule =>
    rule.eventId === eventId && (!rule.choiceIds || rule.choiceIds.includes(choiceId))
  );
  assert.equal(ruleFor('EVT_20_LIFE_001', 'STAY_HOME')?.source, 'informed');
  assert.deepEqual(ruleFor('EVT_20_LIFE_001', 'STAY_HOME')?.npcIds, ['NPC_FAM_01', 'NPC_FAM_02']);
  assert.equal(ruleFor('EVT_21_RIV_001', 'PRAISE_ADRIAN')?.source, 'public');
  assert.equal(ruleFor('EVT_21_RIV_001', 'PRIVATE_MESSAGE')?.source, 'informed');
  assert.equal(ruleFor('CEVT_21_MEDIA_01', 'CLARA_OFF_RECORD')?.source, 'informed');
  assert.equal(ruleFor('CEVT_21_MEDIA_01', 'PUBLIC_CORRECTION')?.source, 'public');
  assert.equal(ruleFor('CEVT_21_MEDIA_01', 'LET_CYCLE_PASS'), undefined, 'silence must not magically inform Clara');
});

test('T5.5-A resolver persists family, Adrián and Clara knowledge without omniscience', () => {
  let state = stateFor(20, 9001);
  let result = resolveChoice(state, byId('EVT_20_LIFE_001'), 'STAY_HOME', true);
  assert.equal(npcKnows(result.state, 'NPC_FAM_01', 'EVT_20_LIFE_001'), true);
  assert.equal(npcKnows(result.state, 'NPC_FAM_02', 'EVT_20_LIFE_001'), true);
  assert.equal(npcKnows(result.state, 'NPC_PLR_12', 'EVT_20_LIFE_001'), false);
  assert.equal(getNpcKnowledgeRecord(result.state, 'NPC_FAM_01', 'EVT_20_LIFE_001')?.source, 'informed');

  state = stateFor(21, 9002);
  state.flags.HAS_SEED_ADRIAN_MIRROR = true;
  state.professional.nationalHeat = 50;
  result = resolveChoice(state, byId('EVT_21_RIV_001'), 'PRIVATE_MESSAGE', true);
  assert.equal(npcKnows(result.state, 'NPC_PLR_15', 'EVT_21_RIV_001'), true);
  assert.equal(getNpcKnowledgeRecord(result.state, 'NPC_PLR_15', 'EVT_21_RIV_001')?.source, 'informed');
  assert.equal(npcKnows(result.state, 'NPC_PRS_01', 'EVT_21_RIV_001'), false);

  state = stateFor(21, 9003);
  state.reputation.mediaHeat = 50;
  result = resolveChoice(state, byId('CEVT_21_MEDIA_01'), 'PUBLIC_CORRECTION', true);
  assert.equal(npcKnows(result.state, 'NPC_PRS_01', 'CEVT_21_MEDIA_01'), true);
  assert.equal(getNpcKnowledgeRecord(result.state, 'NPC_PRS_01', 'CEVT_21_MEDIA_01')?.source, 'public');
  assert.equal(npcKnows(result.state, 'NPC_PLR_15', 'CEVT_21_MEDIA_01'), false);
});

test('T5.5-A age ownership stays inside 20-23', () => {
  assert.deepEqual(byId('EVT_20_LIFE_001').ageWindow, [20, 20]);
  assert.deepEqual(byId('EVT_20_ABR_001').ageWindow, [20, 20]);
  assert.deepEqual(byId('EVT_21_RIV_001').ageWindow, [21, 21]);
  assert.deepEqual(byId('CEVT_21_ABR_01').ageWindow, [21, 22]);
  assert.deepEqual(byId('CEVT_21_MEDIA_01').ageWindow, [21, 22]);
});
