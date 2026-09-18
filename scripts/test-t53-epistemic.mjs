import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { getNpcKnowledgeRecord, npcKnows } from '../dist/core/npc-knowledge.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { serializeSave } from '../dist/save/save.js';

const byId = id => {
  const event = EVENTS.find(candidate => candidate.id === id);
  assert.ok(event, `Falta evento ${id}`);
  return event;
};

function stateForOutcome(eventId, choiceId, outcomeId) {
  const event = byId(eventId);
  for (let seed = 0; seed < 2000; seed++) {
    const state = createInitialState(seed);
    resolveChoiceInPlace(state, event, choiceId);
    if (state.history.at(-1)?.outcomeId === outcomeId) return state;
  }
  assert.fail(`No se encontró ${eventId}/${choiceId}/${outcomeId}`);
}

const cases = [
  ['EVT_18_CAP_001', 'PUBLIC_SUPPORT', 'PUBLIC_SUPPORT__PRIMARY', 'NPC_PLR_10', 'witnessed'],
  ['EVT_18_MED_001', 'TELL_COACH', 'TELL_COACH__SECONDARY', 'NPC_MED_01', 'reported'],
  ['EVT_18_PRS_002', 'DENY', 'DENY__SECONDARY', 'NPC_PRS_01', 'witnessed'],
  ['EVT_18_TEAM_001', 'HELP_REASONABLE', 'HELP_REASONABLE__PRIMARY', 'NPC_PLR_12', 'witnessed'],
  ['EVT_18_TEAM_001', 'AGREE_BUT_SELF', 'AGREE_BUT_SELF__SECONDARY', 'NPC_PLR_12', 'witnessed'],
  ['EVT_18_TEAM_001', 'TELL_MENA', 'TELL_MENA__SECONDARY', 'NPC_PLR_12', 'reported'],
  ['EVT_18_END_002', 'DEFEND', 'DEFEND__PRIMARY', 'NPC_CCH_01', 'public'],
  ['EVT_18_MKT_001', 'SOFT_LEVERAGE', 'SOFT_LEVERAGE__SECONDARY', 'NPC_DIR_02', 'witnessed'],
  ['CEVT_18_VELA_01', 'DISTANCE', 'DISTANCE__SECONDARY', 'NPC_PLR_10', 'witnessed'],
  ['EVT_19_JAN_001', 'FORCE_EXIT', 'FORCE_EXIT__SECONDARY', 'NPC_DIR_02', 'witnessed']
];

test('T5.3 explicit discoveries create NPC knowledge only on the revealing outcome', () => {
  for (const [eventId, choiceId, revealingOutcome, npcId, source] of cases) {
    const event = byId(eventId);
    const choice = event.choices.find(candidate => candidate.id === choiceId);
    assert.ok(choice, `Falta elección ${eventId}/${choiceId}`);
    const otherOutcome = choice.outcomeIds.find(id => id !== revealingOutcome);
    assert.ok(otherOutcome, `Falta resultado alternativo ${eventId}/${choiceId}`);

    const revealed = stateForOutcome(eventId, choiceId, revealingOutcome);
    assert.equal(npcKnows(revealed, npcId, eventId), true, `${npcId} no aprendió ${eventId}`);
    assert.equal(getNpcKnowledgeRecord(revealed, npcId, eventId)?.source, source);
    assert.equal(
      revealed.relationships.find(row => row.npcId === npcId)?.memories.includes(eventId),
      true,
      `${eventId} no quedó indexado como memoria relacional de ${npcId}`
    );

    const notRevealed = stateForOutcome(eventId, choiceId, otherOutcome);
    assert.equal(
      npcKnows(notRevealed, npcId, eventId),
      false,
      `${npcId} adquirió ${eventId} en el resultado que no revela el hecho`
    );
  }
});

test('T5.3 una memoria de transferencia conserva el club donde se aprendió el hecho', () => {
  const state = stateForOutcome('EVT_19_JAN_001', 'FORCE_EXIT', 'FORCE_EXIT__SECONDARY');
  assert.equal(state.club, 'NEW_CLUB');
  const record = getNpcKnowledgeRecord(state, 'NPC_DIR_02', 'EVT_19_JAN_001');
  assert.ok(record);
  assert.equal(record.club, 'UDV');
});

test('T5.3 malformed knowledge is reader-safe and fails closed at the save boundary', () => {
  const malformedCases = [
    { source: 'telepathy' },
    { memory: 'eternal' },
    { certainty: -1 },
    { certainty: 101 },
    { learnedAt: 'not-a-date' },
    { expiresAfter: 'not-a-date' },
    { factId: 'OTHER_FACT' },
    { source: 'public', sourceNpcId: 'NPC_PLR_14' },
    { sourceNpcId: 'NPC_DOES_NOT_EXIST' },
    { sourceNpcId: 'NPC_CCH_01' }
  ];

  for (const [index, override] of malformedCases.entries()) {
    const state = createInitialState(300 + index);
    const coach = state.npcs.find(npc => npc.id === 'NPC_CCH_01');
    assert.ok(coach);
    coach.knowledge.T53_MALFORMED = {
      factId: 'T53_MALFORMED',
      eventId: 'EVT_18_PRE_001',
      choiceId: 'CALL_NANO',
      outcomeId: 'CALL_NANO__PRIMARY',
      learnedAt: '2026-07-01',
      source: 'reported',
      certainty: 60,
      memory: 'temporary',
      club: 'UDV',
      expiresAfter: '2027-07-01',
      ...override
    };

    assert.equal(
      npcKnows(state, 'NPC_CCH_01', 'T53_MALFORMED'),
      false,
      `payload malformado #${index} fue aceptado como conocimiento por el reader`
    );
    assert.equal(getNpcKnowledgeRecord(state, 'NPC_CCH_01', 'T53_MALFORMED'), undefined);
    assert.throws(
      () => serializeSave(state),
      error => error?.code === 'INVALID_SAVE',
      `payload malformado #${index} atravesó el boundary de persistencia`
    );
  }
});
