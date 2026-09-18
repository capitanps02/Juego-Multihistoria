import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { careerTerms, marketState, respondToOffer } from '../dist/simulation/offers.js';
import { retirementPostAnnouncementOfferFact } from '../dist/simulation/retirement-authority.js';
import { syncRetirementState } from '../dist/simulation/late-career-engine.js';
import { serializeSave, loadSave } from '../dist/save/save.js';

const event=id=>{
  const found=EVENTS.find(row=>row.id===id);
  assert.ok(found,`missing event ${id}`);
  return found;
};
function announced(seed=536700){
  const state=createInitialState(seed);
  state.age=38; state.phase='34_plus'; state.date='2046-04-01';
  state.retirement.status='announced';
  state.retirement.decidedDate='2046-01-10';
  state.retirement.announcedDate='2046-02-01';
  state.retirement.decisionAge=38;
  state.retirement.reason='voluntary';
  state.flags.RETIREMENT_WAS_ANNOUNCED=true;
  state.flags.RETIREMENT_ANNOUNCED=true;
  marketState(state);
  return state;
}
function putOffer(state,id,date,salaryDelta=100){
  const market=marketState(state);
  const before=careerTerms(state);
  market.sequence+=1;
  market.pending={
    id,date,reason:'Post-announcement exceptional offer',before,
    terms:{...before,months:Math.max(12,before.months),salary:before.salary+salaryDelta}
  };
}

test('T5.36 Stage A requires a real post-announcement CareerOffer and Stage B is exclusive',()=>{
  const state=announced();
  const stageA=event('CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED');
  const reversal=event('CEVT_38_RETIREMENT_REVERSAL');
  assert.equal(eventGatesPass(state,stageA),false);
  assert.equal(eventGatesPass(state,reversal),false);

  putOffer(state,'offer:1','2046-03-15');
  assert.equal(retirementPostAnnouncementOfferFact(state).stage,'initial');
  assert.equal(eventGatesPass(state,stageA),true);
  assert.equal(eventGatesPass(state,reversal),false);

  resolveChoiceInPlace(state,stageA,'ACKNOWLEDGE');
  respondToOffer(state,'offer:1','defer',{kind:'narrative_choice',historyIndex:state.history.length-1,eventId:stageA.id,choiceId:'ACKNOWLEDGE'});
  putOffer(state,'offer:2','2046-04-01',200);
  assert.equal(retirementPostAnnouncementOfferFact(state).stage,'reversal');
  assert.equal(eventGatesPass(state,stageA),false);
  assert.equal(eventGatesPass(state,reversal),true);
});

test('T5.36 canonical reversal is the only announced->playing path and charges costs once',()=>{
  const state=announced(536701);
  const stageA=event('CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED');
  const reversal=event('CEVT_38_RETIREMENT_REVERSAL');
  putOffer(state,'offer:1','2046-03-15');
  resolveChoiceInPlace(state,stageA,'ACKNOWLEDGE');
  respondToOffer(state,'offer:1','defer',{kind:'narrative_choice',historyIndex:state.history.length-1,eventId:stageA.id,choiceId:'ACKNOWLEDGE'});
  putOffer(state,'offer:2','2046-04-01',300);

  const before={form:Number(state.sport.form),prestige:Number(state.reputation.prestige),control:state.professional.careerControl,reversals:state.retirement.reversals};
  const offered=structuredClone(state.market.pending.terms);
  resolveChoiceInPlace(state,reversal,'ACCEPT');
  assert.equal(state.retirement.status,'playing');
  assert.equal(state.retirement.reversals,before.reversals+1);
  assert.equal(state.sport.form,Math.max(0,before.form-5));
  assert.equal(state.reputation.prestige,Math.max(0,before.prestige-5));
  assert.equal(state.professional.careerControl,Math.max(0,before.control-5));
  assert.equal(state.flags.RETIREMENT_WAS_ANNOUNCED,true);

  respondToOffer(state,'offer:2','accept',{kind:'narrative_choice',historyIndex:state.history.length-1,eventId:reversal.id,choiceId:'ACCEPT'});
  assert.equal(state.contract.salaryMonthly,offered.salary);
  assert.equal(state.market.pending,null);

  const charged={form:state.sport.form,prestige:state.reputation.prestige,control:state.professional.careerControl,reversals:state.retirement.reversals};
  resolveChoiceInPlace(state,reversal,'ACCEPT');
  assert.deepEqual({form:state.sport.form,prestige:state.reputation.prestige,control:state.professional.careerControl,reversals:state.retirement.reversals},charged);
});

test('T5.36 reversal window survives save/load and closed careers cannot reopen',()=>{
  const state=announced(536702);
  const stageA=event('CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED');
  putOffer(state,'offer:1','2046-03-15');
  resolveChoiceInPlace(state,stageA,'ACKNOWLEDGE');
  respondToOffer(state,'offer:1','defer',{kind:'narrative_choice',historyIndex:state.history.length-1,eventId:stageA.id,choiceId:'ACKNOWLEDGE'});
  putOffer(state,'offer:2','2046-04-01',250);

  const restored=loadSave(serializeSave(state));
  assert.equal(retirementPostAnnouncementOfferFact(restored).stage,'reversal');
  assert.equal(restored.market.pending.id,'offer:2');

  restored.retirement.status='closed';
  restored.retirement.closedDate=restored.date;
  restored.flags.RETIRED=true;
  restored.epilogue.generated=true;
  const previous='closed';
  restored.retirement.status='playing';
  syncRetirementState(restored,previous,{eventId:'CEVT_38_RETIREMENT_REVERSAL',choiceId:'ACCEPT'});
  assert.equal(restored.retirement.status,'closed');
});
