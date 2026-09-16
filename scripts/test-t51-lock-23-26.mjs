import test from 'node:test';
import assert from 'node:assert/strict';
import { NPC_EVENT_KNOWLEDGE_RULES } from '../dist/catalog/npc-knowledge-rules.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_23_26 } from '../dist/content/events/23_26/index.js';
import { getNpcKnowledgeRecord, npcKnows } from '../dist/core/npc-knowledge.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';

const ID = 'EVT_23_LOCK_001';

function lockEvent() {
  const rows = EVENTS_23_26.filter(event => event.id === ID);
  assert.equal(rows.length, 1, 'LOCK23 must have exactly one active definition');
  return rows[0];
}

function state23(seed = 51140) {
  const state = createInitialState(seed);
  state.age = 23;
  state.phase = '23_26';
  state.club = 'UDV';
  return state;
}

function relation(state, npcId) {
  const row = state.relationships.find(candidate => candidate.npcId === npcId);
  assert.ok(row, `missing relationship ${npcId}`);
  return row;
}

function effectPaths(event) {
  return event.outcomes.flatMap(outcome => outcome.effects ?? []).map(effect =>
    effect.kind === 'flag' ? `flags.${effect.flag}` : effect.path
  );
}

test('LOCK23 activates the canonical scene identity and four decisions', () => {
  const event = lockEvent();
  assert.equal(event.text.title, 'Las cuatro de la mañana');
  assert.deepEqual(event.choices.map(choice => choice.label), [
    'Cubrirle',
    'Negarte pero no avisar a nadie',
    'Decirle que admita el retraso y ofrecer acompañarlo',
    'Avisar al capitán para que gestione antes de que llegue al técnico'
  ]);
  assert.equal(event.canonStatus, 'verified');
  assert.deepEqual(event.seedsRead, ['SEED_TEAMMATE_COVER']);
  assert.deepEqual(event.seedsWrite ?? [], []);
  assert.deepEqual(event.npcRefs ?? [], [], 'the requester must not be assigned an invented NPC identity');
});

test('LOCK23 uses captain/star affinity OR prior teammate-cover seed with threshold 60', () => {
  const event = lockEvent();
  assert.deepEqual(event.gates ?? [], []);
  assert.deepEqual(event.gateAlternatives, [
    [{ path: 'facts.lockerCaptainAffinity', op: 'gte', value: 60 }],
    [{ path: 'facts.lockerStarAffinity', op: 'gte', value: 60 }],
    [{ path: 'flags.HAS_SEED_TEAMMATE_COVER', op: 'eq', value: true }]
  ]);

  const state = state23();
  relation(state, 'NPC_PLR_10').affinity = 40;
  relation(state, 'NPC_PLR_12').affinity = 99;
  state.flags.HAS_SEED_TEAMMATE_COVER = false;
  assert.equal(eventGatesPass(state, event), false, 'arbitrary teammate affinity cannot satisfy the slot route');

  relation(state, 'NPC_PLR_10').affinity = 60;
  assert.equal(eventGatesPass(state, event), true, 'certified captain at threshold opens the scene');

  state.club = 'ATL';
  assert.equal(eventGatesPass(state, event), false, 'old-club captain must fail closed after a club change');

  state.flags.HAS_SEED_TEAMMATE_COVER = true;
  assert.equal(eventGatesPass(state, event), true, 'historical cover seed remains an independent route');
});

test('LOCK23 does not fabricate a crime, contract, offer or new historical seed', () => {
  const event = lockEvent();
  assert.match(event.intel.visible.join(' '), /no hay un delito ni una situación de seguridad en curso/i);
  assert.ok(effectPaths(event).every(path => !path.startsWith('contract.') && !path.startsWith('market.') && path !== 'club'));
  assert.ok(event.outcomes.every(outcome => (outcome.seedTransitions ?? []).length === 0));
});

test('LOCK23 captain escalation is the only dynamic knowledge rule and is outcome-scoped', () => {
  const rules = NPC_EVENT_KNOWLEDGE_RULES.filter(rule => rule.eventId === ID);
  assert.deepEqual(rules, [{
    eventId: ID,
    choiceIds: ['D'],
    outcomeIds: ['D__PRIMARY', 'D__SECONDARY'],
    npcIds: [],
    targetSlots: ['captain'],
    source: 'informed',
    certainty: 100,
    memory: 'strong',
    relationshipMemory: true
  }]);
});

test('LOCK23 choice D informs only the authoritative captain and records the resolved recipient', () => {
  const state = state23(51141);
  relation(state, 'NPC_PLR_10').affinity = 70;
  assert.equal(npcKnows(state, 'NPC_PLR_10', ID), false);
  assert.equal(npcKnows(state, 'NPC_PLR_12', ID), false);

  resolveChoiceInPlace(state, lockEvent(), 'D');

  assert.equal(npcKnows(state, 'NPC_PLR_10', ID), true);
  assert.equal(npcKnows(state, 'NPC_PLR_12', ID), false);
  const record = getNpcKnowledgeRecord(state, 'NPC_PLR_10', ID);
  assert.ok(record);
  assert.equal(record.source, 'informed');
  assert.equal(record.choiceId, 'D');
  assert.ok(['D__PRIMARY', 'D__SECONDARY'].includes(record.outcomeId));
  assert.deepEqual(state.history.at(-1)?.snapshot.npcRefs, ['NPC_PLR_10']);
});

test('LOCK23 non-escalation choices do not make the captain omniscient', () => {
  const state = state23(51142);
  relation(state, 'NPC_PLR_10').affinity = 70;
  resolveChoiceInPlace(state, lockEvent(), 'B');
  assert.equal(npcKnows(state, 'NPC_PLR_10', ID), false);
  assert.deepEqual(state.history.at(-1)?.snapshot.npcRefs, []);
});
