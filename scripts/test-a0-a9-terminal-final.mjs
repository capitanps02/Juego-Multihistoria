import test from 'node:test';
import assert from 'node:assert/strict';

import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS } from '../dist/content/events/index.js';
import {
  EVENTS_34_PLUS,
  A9_TERMINAL_PRINCIPALS,
  A9_TERMINAL_CONDITIONALS
} from '../dist/content/events/34_plus/index.js';
import { validateBuild } from '../dist/validation/build-validation.js';
import { narrativeConditionRoot } from '../dist/simulation/club-contract-intent.js';
import {
  proposePostAnnouncementCareerChange,
  respondToOffer
} from '../dist/simulation/offers.js';
import {
  canonicalRetirementReversalTransitionAuthorized
} from '../dist/simulation/retirement-authority.js';
import { syncRetirementState } from '../dist/simulation/late-career-engine.js';

const PRINCIPALS=[
  'EVT_37_ANNOUNCE_001',
  'EVT_RET_FAM_001',
  'EVT_RET_BODY_001',
  'EVT_RET_HIGH_001',
  'EVT_RET_LOW_001',
  'EVT_RET_ANNOUNCE_001',
  'EVT_RET_LASTMATCH_001'
];

const CONDITIONALS=[
  'CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED',
  'CEVT_38_RETIREMENT_REVERSAL',
  'CEVT_RET_NO_LAST_MATCH',
  'CEVT_RET_STORYBOOK_LAST_GOAL'
];

function terminalState(seed=99001){
  const s=createInitialState(seed);
  s.age=38;
  s.phase='34_plus';
  s.retirement.status='announced';
  s.retirement.decidedDate=s.date;
  s.retirement.announcedDate=s.date;
  s.flags.RETIREMENT_ANNOUNCED=true;
  s.flags.RETIREMENT_WAS_ANNOUNCED=true;
  return s;
}

function postAnnouncementOffer(state,club='A9 FC'){
  return proposePostAnnouncementCareerChange(
    state,
    'A9 factual post-announcement offer',
    draft=>{
      draft.club=club;
      draft.professional.ownerClub=club;
      draft.professional.registrationClub=club;
      draft.world.ownerClub=club;
      draft.contract.monthsRemaining=12;
      draft.contract.salaryMonthly=Math.max(1000,draft.contract.salaryMonthly+100);
    }
  );
}

test('A9 final keeps the frozen T5 budget at 388 unique events',()=>{
  assert.equal(EVENTS.length,388);
  assert.equal(new Set(EVENTS.map(e=>e.id)).size,388);
  assert.equal(EVENTS_34_PLUS.length,82);
  assert.equal(EVENTS_34_PLUS.filter(e=>e.family!=='conditional').length,50);
  assert.equal(EVENTS_34_PLUS.filter(e=>e.family==='conditional').length,32);
  assert.deepEqual(validateBuild(EVENTS).filter(issue=>issue.level==='error'),[]);
});

test('A9 active terminal identities are exactly seven canonical principals and four canonical conditionals',()=>{
  assert.deepEqual(A9_TERMINAL_PRINCIPALS.map(e=>e.id).sort(),PRINCIPALS.sort());
  assert.deepEqual(A9_TERMINAL_CONDITIONALS.map(e=>e.id).sort(),CONDITIONALS.sort());
  assert.equal(EVENTS_34_PLUS.some(e=>e.id==='EVT_RET_HOME_001'),false);
  assert.equal(EVENTS_34_PLUS.some(e=>e.id==='EVT_RET_LAST_001'),false);
  assert.equal(EVENTS_34_PLUS.some(e=>e.id==='CEVT_RET_RECONSIDER'),false);
  assert.equal(EVENTS_34_PLUS.some(e=>e.id==='CEVT_38_RETIREMENT_REVERSAL'),true);
});

test('EVT_37_ANNOUNCE_001 is the canonical four-choice timing scene, not the generic shell',()=>{
  const e=A9_TERMINAL_PRINCIPALS.find(x=>x.id==='EVT_37_ANNOUNCE_001');
  assert.ok(e);
  assert.equal(e.canonStatus,'verified');
  assert.deepEqual(e.choices.map(c=>c.label),[
    'Anunciar ya',
    'Esperar al final',
    'Autorizar homenaje sin confirmar retirada',
    'Decirlo solo al vestuario'
  ]);
  assert.ok(e.seedsWrite?.includes('SEED_FAREWELL_ANNOUNCEMENT_TIMING'));
});

test('all four canonical terminal conditionals are factual/verified',()=>{
  for(const id of CONDITIONALS){
    const e=A9_TERMINAL_CONDITIONALS.find(x=>x.id===id);
    assert.ok(e,id);
    assert.equal(e.canonStatus,'verified',id);
  }
});

test('A9 terminal facts are projected and fail closed without factual evidence',()=>{
  const s=terminalState(99002);
  const facts=narrativeConditionRoot(s).facts;
  assert.equal(facts.retirementPostAnnouncementOffer.eligible,false);
  assert.equal(facts.retirementStorybookLastGoal.eligible,false);
  assert.equal(facts.retirementNoLastMatch.eligible,false);
});

test('post-announcement offer authority distinguishes initial from factual reversal stage',()=>{
  const s=terminalState(99003);
  const first=postAnnouncementOffer(s,'A9 INITIAL FC');
  assert.ok(first);
  assert.equal(narrativeConditionRoot(s).facts.retirementPostAnnouncementOffer.stage,'initial');
  respondToOffer(s,first.id,'defer',{
    kind:'narrative_choice',
    historyIndex:0,
    eventId:'CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED',
    choiceId:'ACKNOWLEDGE'
  });
  const second=postAnnouncementOffer(s,'A9 REVERSAL FC');
  assert.ok(second);
  assert.equal(narrativeConditionRoot(s).facts.retirementPostAnnouncementOffer.stage,'reversal');
  assert.equal(canonicalRetirementReversalTransitionAuthorized(s,'CEVT_38_RETIREMENT_REVERSAL','ACCEPT'),true);
});

test('announced -> playing is rejected for any noncanonical source and allowed only for exact reversal',()=>{
  const blocked=terminalState(99004);
  postAnnouncementOffer(blocked,'BLOCKED FC');
  blocked.retirement.status='playing';
  syncRetirementState(blocked,'announced',{eventId:'FAKE_EVENT',choiceId:'RETURN'});
  assert.equal(blocked.retirement.status,'announced');

  const allowed=terminalState(99005);
  const first=postAnnouncementOffer(allowed,'FIRST FC');
  assert.ok(first);
  respondToOffer(allowed,first.id,'defer',{
    kind:'narrative_choice',
    historyIndex:0,
    eventId:'CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED',
    choiceId:'ACKNOWLEDGE'
  });
  assert.ok(postAnnouncementOffer(allowed,'SECOND FC'));
  allowed.retirement.status='playing';
  syncRetirementState(allowed,'announced',{eventId:'CEVT_38_RETIREMENT_REVERSAL',choiceId:'ACCEPT'});
  assert.equal(allowed.retirement.status,'playing');
  assert.equal(allowed.retirement.reversals,1);
  assert.equal(allowed.flags.RETIREMENT_RECONSIDERED,true);
});
