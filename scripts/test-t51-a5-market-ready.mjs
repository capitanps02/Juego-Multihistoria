import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { offerBridgeSpec, offerDispositionForChoice } from '../dist/narrative/offer-bridge.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { proposeCareerChange, respondToOffer } from '../dist/simulation/offers.js';
import { A5_MARKET_READY_EVENTS } from '../dist/content/events/20_23/a5-market-external-staged.js';

function offerState(seed=5300){
  const s=createInitialState(seed);
  s.age=20;
  s.phase='20_23';
  const offer=proposeCareerChange(s,'TEST_A5_TRANSFER',draft=>{
    draft.club='NEXT_FC';
    draft.professional.ownerClub='NEXT_FC';
    draft.professional.registrationClub='NEXT_FC';
    draft.professional.leagueTier=1;
    draft.tier=1;
    draft.contract.monthsRemaining=36;
    draft.contract.salaryMonthly=Math.max(1,draft.contract.salaryMonthly+1000);
  });
  assert.ok(offer);
  return s;
}

test('A5 market batch/1 only EVT_20_MKT_001 is promoted by this handoff',()=>{
  assert.deepEqual(A5_MARKET_READY_EVENTS.map(e=>e.id),['EVT_20_MKT_001']);
});

test('A5 market batch/2 real pending CareerOffer is mandatory',()=>{
  const event=A5_MARKET_READY_EVENTS[0];
  const noOffer=createInitialState(5301);
  noOffer.age=20;
  noOffer.phase='20_23';
  assert.equal(eventGatesPass(noOffer,event),false);
  const withOffer=offerState(5302);
  assert.equal(eventGatesPass(withOffer,event),true);
});

test('A5 market batch/3 offer bridge maps every choice to explicit lifecycle disposition',()=>{
  const event=A5_MARKET_READY_EVENTS[0];
  const spec=offerBridgeSpec(event);
  assert.ok(spec);
  assert.deepEqual(spec.choiceActions,{
    ACCEPT_JUMP:'accept',
    LOAN_PLAN:'counter',
    REJECT_RENEW:'reject',
    LEVERAGE:'defer'
  });
  assert.equal(offerDispositionForChoice(event,'ACCEPT_JUMP'),'accept');
  assert.equal(offerDispositionForChoice(event,'LOAN_PLAN'),'counter');
  assert.equal(offerDispositionForChoice(event,'REJECT_RENEW'),'reject');
  assert.equal(offerDispositionForChoice(event,'LEVERAGE'),'defer');
});

test('A5 market batch/4 accept applies only through formal offer response',()=>{
  const event=A5_MARKET_READY_EVENTS[0];
  const s=offerState(5303);
  const offer=structuredClone(s.market.pending);
  const beforeClub=s.club;
  const result=resolveChoiceInPlace(s,event,'ACCEPT_JUMP',true);
  assert.equal(s.club,beforeClub,'narrative effects must not sign the offer directly');
  const historyIndex=s.history.length-1;
  const decision=respondToOffer(s,offer.id,'accept',{
    kind:'narrative_choice',
    historyIndex,
    eventId:event.id,
    choiceId:'ACCEPT_JUMP'
  });
  assert.equal(decision.accepted,true);
  assert.equal(s.club,'NEXT_FC');
  assert.equal(s.market.pending,null);
  assert.equal(s.market.history.at(-1)?.source?.eventId,event.id);
  assert.equal(result.eventId,event.id);
});

test('A5 market batch/5 counter/defer/reject never mutate current employment',()=>{
  const event=A5_MARKET_READY_EVENTS[0];
  for(const [seed,choice,disposition] of [
    [5304,'LOAN_PLAN','counter'],
    [5305,'REJECT_RENEW','reject'],
    [5306,'LEVERAGE','defer']
  ]){
    const s=offerState(seed);
    const offer=structuredClone(s.market.pending);
    const before={club:s.club,contract:structuredClone(s.contract)};
    resolveChoiceInPlace(s,event,choice,true);
    const historyIndex=s.history.length-1;
    respondToOffer(s,offer.id,disposition,{
      kind:'narrative_choice',
      historyIndex,
      eventId:event.id,
      choiceId:choice
    });
    assert.equal(s.club,before.club);
    assert.deepEqual(s.contract,before.contract);
    assert.equal(s.market.pending,null);
  }
});
