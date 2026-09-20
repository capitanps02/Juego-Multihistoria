import test from 'node:test';
import assert from 'node:assert/strict';

import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS } from '../dist/content/events/index.js';
import { knowledgeRulesFor } from '../dist/catalog/npc-knowledge-rules.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import {
  proposePostAnnouncementCareerChange,
  respondToOffer
} from '../dist/simulation/offers.js';
import {
  reverseRetirement,
  syncRetirementState
} from '../dist/simulation/late-career-engine.js';
import { generateEpilogue } from '../dist/epilogue/generator.js';

const byId = id => {
  const event = EVENTS.find(row => row.id === id);
  assert.ok(event, 'missing event '+id);
  return event;
};

function announced(seed=990001){
  const state=createInitialState(seed);
  state.age=38;
  state.phase='34_plus';
  state.retirement.status='announced';
  state.retirement.decidedDate=state.date;
  state.retirement.announcedDate=state.date;
  state.retirement.daysInStatus=7;
  state.flags.RETIREMENT_ANNOUNCED=true;
  state.flags.RETIREMENT_WAS_ANNOUNCED=true;
  state.flags.RETIREMENT_DECISION_CONTEXT=false;
  return state;
}

test('A9 final/1 preserves 388 and activates canonical terminal identities',()=>{
  assert.equal(EVENTS.length,388);
  assert.equal(new Set(EVENTS.map(e=>e.id)).size,388);
  for(const id of [
    'EVT_RET_FAM_001','EVT_RET_BODY_001','EVT_RET_HIGH_001','EVT_RET_LOW_001',
    'EVT_RET_ANNOUNCE_001','EVT_RET_LASTMATCH_001',
    'CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED','CEVT_38_RETIREMENT_REVERSAL',
    'CEVT_RET_NO_LAST_MATCH','CEVT_RET_STORYBOOK_LAST_GOAL'
  ]) byId(id);
  for(const id of ['EVT_RET_HOME_001','EVT_RET_LAST_001','CEVT_RET_RECONSIDER']){
    assert.equal(EVENTS.some(e=>e.id===id),false,'legacy terminal row must not remain active: '+id);
  }
});

test('A9 final/2 private reconsideration is explicit and public retirement cannot silently reopen',()=>{
  const privateState=createInitialState(990002);
  privateState.age=38; privateState.phase='34_plus';
  privateState.retirement.status='decided';
  privateState.retirement.decidedDate=privateState.date;
  privateState.flags.RECONSIDERATION_WINDOW=true;
  privateState.flags.RETIREMENT_ANNOUNCEMENT_DEFERRED=true;
  assert.equal(reverseRetirement(privateState),true);
  assert.equal(privateState.retirement.status,'playing');
  assert.equal(privateState.retirement.reversals,1);

  const publicState=announced(990003);
  assert.equal(reverseRetirement(publicState),false);
  assert.equal(publicState.retirement.status,'announced');

  const closed=createInitialState(990004);
  closed.retirement.status='closed';
  closed.retirement.closedDate=closed.date;
  closed.flags.RETIRED=true;
  closed.retirement.status='playing';
  syncRetirementState(closed,'closed',{eventId:'CEVT_38_RETIREMENT_REVERSAL',choiceId:'ACCEPT'});
  assert.equal(closed.retirement.status,'closed');
});

test('A9 final/3 public reversal requires two-stage factual CareerOffer flow',()=>{
  const state=announced(990005);
  const stageA=byId('CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED');
  const reversal=byId('CEVT_38_RETIREMENT_REVERSAL');

  const offerA=proposePostAnnouncementCareerChange(state,'Oferta post-anuncio A',draft=>{
    draft.contract.salaryMonthly += 111;
    draft.contract.monthsRemaining = Math.max(12,draft.contract.monthsRemaining);
  });
  assert.ok(offerA);
  assert.equal(eventGatesPass(state,stageA),true);
  assert.equal(eventGatesPass(state,reversal),false);

  resolveChoiceInPlace(state,stageA,'ACKNOWLEDGE',true);
  const h1=state.history.length-1;
  respondToOffer(state,offerA.id,'defer',{
    kind:'narrative_choice',historyIndex:h1,eventId:stageA.id,choiceId:'ACKNOWLEDGE'
  });
  assert.equal(state.retirement.status,'announced');

  const offerB=proposePostAnnouncementCareerChange(state,'Oferta post-anuncio B',draft=>{
    draft.contract.salaryMonthly += 222;
    draft.contract.monthsRemaining = Math.max(18,draft.contract.monthsRemaining);
  });
  assert.ok(offerB);
  assert.equal(eventGatesPass(state,reversal),true);

  const beforePrestige=state.reputation.prestige;
  resolveChoiceInPlace(state,reversal,'ACCEPT',true);
  assert.equal(state.retirement.status,'playing');
  assert.equal(state.retirement.reversals,1);
  assert.ok(state.reputation.prestige<=beforePrestige);

  const h2=state.history.length-1;
  const decision=respondToOffer(state,offerB.id,'accept',{
    kind:'narrative_choice',historyIndex:h2,eventId:reversal.id,choiceId:'ACCEPT'
  });
  assert.equal(decision.accepted,true);
});

test('A9 final/4 retirement announcement has explicit authority-resolved NPC recipients',()=>{
  const event=byId('EVT_RET_ANNOUNCE_001');
  const publicChoices=['LOCKER_CLUB_FAMILY_PUBLIC','FAMILY_CLUB_PUBLIC','DIRECT_VIDEO','TRUSTED_JOURNALIST','CLUB_ORGANIZES'];
  for(const choice of publicChoices){
    const rules=knowledgeRulesFor(event.id,choice,choice+'_OUT');
    assert.ok(rules.some(rule=>rule.targetSlots?.length),'missing public knowledge rule for '+choice);
  }
  assert.equal(knowledgeRulesFor(event.id,'WAIT','WAIT_OUT').length,0);
});

test('A9 final/5 evidence-based epilogue is deterministic and consumes no RNG',()=>{
  const state=createInitialState(990006);
  state.age=39; state.phase='34_plus';
  state.retirement.status='closed';
  state.retirement.closedDate=state.date;
  state.retirement.reason='voluntary';
  state.epilogue.generated=false;
  const before=structuredClone(state.rngState);
  generateEpilogue(state);
  assert.equal(state.epilogue.generated,true);
  assert.deepEqual(state.rngState,before);
  assert.ok(Array.isArray(state.epilogue.families));
  assert.ok(Array.isArray(state.epilogue.milestones));
});
