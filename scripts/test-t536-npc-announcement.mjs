import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { getNpcKnowledgeRecord, npcKnows } from '../dist/core/npc-knowledge.js';
import { knowledgeRulesFor } from '../dist/catalog/npc-knowledge-rules.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { certifyActiveAgentInPlace } from '../dist/simulation/npc-authority.js';

const byId = id => {
  const event = EVENTS.find(candidate => candidate.id === id);
  assert.ok(event, `Falta evento ${id}`);
  return event;
};

function decidedState(seed){
  const state=createInitialState(seed);
  state.age=38;
  state.phase='34_plus';
  state.date='2046-02-01';
  state.season='2045-46';
  state.retirement.status='decided';
  state.retirement.decidedDate='2046-01-20';
  state.retirement.decisionAge=38;
  state.retirement.reason='voluntary';
  state.flags.RETIREMENT_DECISION_CONTEXT=true;
  certifyActiveAgentInPlace(state,'NPC_AGT_01');
  return state;
}

const PUBLIC_CHOICES=[
  'LOCKER_CLUB_FAMILY_PUBLIC',
  'FAMILY_CLUB_PUBLIC',
  'DIRECT_VIDEO',
  'TRUSTED_JOURNALIST',
  'CLUB_ORGANIZES'
];

test('T5.36 public retirement choices have live authority-backed knowledge rules while WAIT has none',()=>{
  for(const choiceId of PUBLIC_CHOICES){
    const rules=knowledgeRulesFor('EVT_RET_ANNOUNCE_001',choiceId,`${choiceId}_OUT`);
    assert.equal(rules.length,1,`${choiceId} must publish exactly one live knowledge rule`);
    assert.equal(rules[0].source,'public');
    assert.equal(rules[0].certainty,100);
    assert.deepEqual(rules[0].targetSlots,['captain','star','activeAgent','currentClubInstitutional']);
  }
  assert.deepEqual(knowledgeRulesFor('EVT_RET_ANNOUNCE_001','WAIT','WAIT_OUT'),[]);
});

test('T5.36 public announcement teaches only an authority-resolved recipient and consumes no fabricated identity',()=>{
  const state=decidedState(53631);
  resolveChoiceInPlace(state,byId('EVT_RET_ANNOUNCE_001'),'DIRECT_VIDEO');

  assert.equal(state.retirement.status,'announced');
  assert.equal(state.flags.RETIREMENT_PUBLIC,true);
  assert.equal(npcKnows(state,'NPC_AGT_01','EVT_RET_ANNOUNCE_001'),true);
  assert.equal(getNpcKnowledgeRecord(state,'NPC_AGT_01','EVT_RET_ANNOUNCE_001')?.source,'public');
  assert.equal(npcKnows(state,'NPC_AGT_02','EVT_RET_ANNOUNCE_001'),false);
});

test('T5.36 deferred private decision does not leak retirement intent to the active agent',()=>{
  const state=decidedState(53632);
  resolveChoiceInPlace(state,byId('EVT_RET_ANNOUNCE_001'),'WAIT');

  assert.equal(state.retirement.status,'decided');
  assert.notEqual(state.flags.RETIREMENT_PUBLIC,true);
  assert.equal(npcKnows(state,'NPC_AGT_01','EVT_RET_ANNOUNCE_001'),false);
  assert.equal(getNpcKnowledgeRecord(state,'NPC_AGT_01','EVT_RET_ANNOUNCE_001'),undefined);
});
