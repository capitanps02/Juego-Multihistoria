import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { getNpcKnowledgeRecord, npcKnows } from '../dist/core/npc-knowledge.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';

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
  ['EVT_18_MKT_001', 'SOFT_LEVERAGE', 'SOFT_LEVERAGE__SECONDARY', 'NPC_DIR_02', 'witnessed']
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
