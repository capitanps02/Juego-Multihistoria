import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { offerBridgeSpec } from '../dist/narrative/offer-bridge.js';
import { lateCareerPreseason, lateCareerWeek } from '../dist/simulation/late-career-engine.js';
import { proposeCareerChange, respondToOffer } from '../dist/simulation/offers.js';

function lateState(seed=53691){
  const state=createInitialState(seed);
  state.age=38;
  state.phase='34_plus';
  state.date='2046-04-01';
  state.season='2045-46';
  state.professional.initializedAt20=true;
  state.professional.initializedAt23=true;
  state.professional.initializedAt26=true;
  state.professional.initializedAt30=true;
  state.professional.roleSecurity=45;
  state.professional.veteranLeverage=45;
  state.professional.legacyCapital=30;
  state.professional.recoveryDebt=25;
  state.professional.availability=75;
  state.professional.motivationReserve=60;
  state.sport.roleScore=45;
  state.sport.appearances=100;
  state.reputation.marketHeat=35;
  state.contract.monthsRemaining=3;
  return state;
}

function announced(state){
  state.retirement.status='announced';
  state.retirement.decidedDate='2046-01-10';
  state.retirement.announcedDate='2046-02-01';
  state.retirement.decisionAge=38;
  state.retirement.reason='voluntary';
  state.retirement.daysInStatus=28;
  state.flags.RETIREMENT_ANNOUNCED=true;
  state.flags.RETIREMENT_WAS_ANNOUNCED=true;
  state.world.retirementAppearancesAtAnnouncement=Number(state.sport.appearances);
  state.world.retirementObservedAppearances=Number(state.sport.appearances);
}

test('T5.36 market authority: preseason cannot fabricate a veteran CareerOffer',()=>{
  const state=lateState(536911);
  state.contract.monthsRemaining=1;
  state.reputation.marketHeat=100;
  state.professional.veteranLeverage=100;
  state.professional.legacyCapital=100;
  state.professional.availability=100;
  const footballBefore=structuredClone(state.rngState.football);

  lateCareerPreseason(state);

  assert.equal(state.market.pending,null);
  assert.equal(state.flags.VETERAN_OFFER_AVAILABLE,false);
  assert.equal(state.world.veteranOfferRole,null);
  assert.equal(state.world.veteranOfferMonths,null);
  assert.equal(state.world.veteranOfferSalary,null);
  assert.deepEqual(state.rngState.football,footballBefore,'offer availability must consume no football RNG');
});

test('T5.36 market authority: a real pending CareerOffer is the only veteran-offer fact',()=>{
  const state=lateState(536912);
  state.contract.monthsRemaining=1;
  proposeCareerChange(state,'qa veteran renewal',draft=>{
    draft.contract.monthsRemaining=12;
    draft.contract.salaryMonthly=Number(draft.contract.salaryMonthly)+1000;
  });
  assert.ok(state.market.pending);
  const expected=structuredClone(state.market.pending.terms);

  lateCareerPreseason(state);

  assert.equal(state.flags.VETERAN_OFFER_AVAILABLE,true);
  assert.equal(state.world.veteranOfferRole,null,'CareerOffer has no authoritative promised-role field');
  assert.equal(state.world.veteranOfferMonths,expected.months);
  assert.equal(state.world.veteranOfferSalary,expected.salary);
  assert.equal(state.flags.NO_MARKET_END_CONTEXT,false);
});

test('T5.36 market authority: expired contract with zero formal offers opens reflection but does not retire',()=>{
  const state=lateState(536913);
  state.contract.monthsRemaining=0;
  lateCareerPreseason(state);
  assert.equal(state.market.pending,null);
  assert.equal(state.flags.NO_MARKET_END_CONTEXT,true);
  assert.equal(state.flags.NO_MARKET_DECISION_PENDING,true);
  assert.equal(state.retirement.status,'playing');
});

test('T5.36 market authority: marketHeat cannot fabricate a post-announcement offer',()=>{
  const state=lateState(536914);
  announced(state);
  state.reputation.marketHeat=100;
  lateCareerWeek(state);
  assert.equal(state.market.pending,null);
  assert.equal(state.flags.POST_ANNOUNCE_OFFER,false);
  assert.equal(state.retirement.status,'announced');
});

test('T5.36 market authority: post-announcement offer scene closes only a real CareerOffer through offerBridge',()=>{
  const state=lateState(536915);
  proposeCareerChange(state,'qa late renewal',draft=>{
    draft.contract.monthsRemaining=12;
    draft.contract.salaryMonthly=Number(draft.contract.salaryMonthly)+500;
  });
  assert.ok(state.market.pending);
  announced(state);

  lateCareerWeek(state);
  assert.equal(state.flags.POST_ANNOUNCE_OFFER,true);

  const definition=EVENTS.find(item=>item.id==='CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED');
  assert.ok(definition);
  const bridge=offerBridgeSpec(definition);
  assert.deepEqual(bridge?.choiceActions,{ACKNOWLEDGE:'defer',DECLINE:'reject'});

  const pendingId=state.market.pending.id;
  respondToOffer(state,pendingId,bridge.choiceActions.DECLINE,{
    kind:'narrative_choice',
    historyIndex:state.history.length,
    eventId:definition.id,
    choiceId:'DECLINE'
  });
  assert.equal(state.market.pending,null);
  assert.equal(state.retirement.status,'announced','formal offer response must not reopen announced retirement');
  assert.equal(state.market.history.at(-1)?.source?.disposition,'reject');
});
