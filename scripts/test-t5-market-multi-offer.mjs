import test from 'node:test';
import assert from 'node:assert/strict';

import { createInitialState } from '../dist/content/initial-state.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import {
  careerTerms,
  getActiveCareerOffers,
  marketState,
  offerLifecycleStatus,
  proposeCareerChange,
  respondToOffer
} from '../dist/simulation/offers.js';

function transfer(state, club, salary) {
  return proposeCareerChange(state, 'Oferta ' + club, draft => {
    draft.club = club;
    draft.contract.salaryMonthly = salary;
    draft.contract.monthsRemaining = 30;
  });
}

test('#157 persists two formal offers and accepts exact ID atomically', () => {
  const state=createInitialState(157001);
  const rng=structuredClone(state.rngState);
  const before=careerTerms(state);
  const a=transfer(state,'Club A',5000);
  const b=transfer(state,'Club B',5400);
  assert.ok(a&&b);
  assert.notEqual(a.id,b.id);
  assert.deepEqual(getActiveCareerOffers(state).map(x=>x.id),[a.id,b.id]);
  assert.equal(state.market.pending.id,a.id,'legacy pending projects first open offer');
  assert.deepEqual(careerTerms(state),before,'proposals never sign themselves');

  const restored=loadSave(serializeSave(state));
  assert.deepEqual(getActiveCareerOffers(restored).map(x=>x.id),[a.id,b.id]);
  assert.equal(restored.market.pending.id,a.id);
  assert.deepEqual(restored.rngState,rng);

  const decision=respondToOffer(restored,b.id,'accept');
  assert.equal(decision.accepted,true);
  assert.equal(restored.club,'Club B');
  assert.equal(restored.contract.salaryMonthly,5400);
  assert.equal(getActiveCareerOffers(restored).length,0);
  assert.equal(restored.market.pending,null);
  assert.equal(offerLifecycleStatus(restored,b.id),'accepted');
  assert.equal(offerLifecycleStatus(restored,a.id),'superseded');
  assert.equal(restored.market.systemClosures.at(-1).offer.id,a.id);
  assert.equal(restored.market.systemClosures.at(-1).reason,'superseded');
  assert.deepEqual(restored.rngState,rng);
  loadSave(serializeSave(restored));
});

test('#157 reject/counter scope is exact and leaves other offers live', () => {
  const state=createInitialState(157002);
  const a=transfer(state,'Club A',5000);
  const b=transfer(state,'Club B',5200);
  assert.ok(a&&b);
  respondToOffer(state,a.id,'reject');
  assert.equal(offerLifecycleStatus(state,a.id),'rejected');
  assert.equal(offerLifecycleStatus(state,b.id),'open');
  assert.deepEqual(getActiveCareerOffers(state).map(x=>x.id),[b.id]);
  assert.equal(state.market.pending.id,b.id);
  assert.equal(state.club,'UDV');

  const source={kind:'narrative_choice',historyIndex:0,eventId:'TEST_MULTI',choiceId:'COUNTER'};
  respondToOffer(state,b.id,'counter',source);
  assert.equal(offerLifecycleStatus(state,b.id),'countered');
  assert.equal(getActiveCareerOffers(state).length,0);
  assert.equal(state.market.pending,null);
  assert.equal(state.club,'UDV');
});

test('#157 duplicate materialization is idempotent and does not allocate a new ID', () => {
  const state=createInitialState(157003);
  const a=transfer(state,'Club A',5000);
  const sequence=state.market.sequence;
  const duplicate=transfer(state,'Club A',5000);
  assert.ok(a);
  assert.equal(duplicate,null);
  assert.equal(state.market.sequence,sequence);
  assert.deepEqual(getActiveCareerOffers(state).map(x=>x.id),[a.id]);
});

test('#157 legacy singular pending stays byte-compatible until a real market mutation', () => {
  const state=createInitialState(157004);
  const offer=transfer(state,'Club A',5000);
  assert.ok(offer);
  delete state.market.openOffers;
  const pending=structuredClone(state.market.pending);
  const rng=structuredClone(state.rngState);
  const before=structuredClone(state.market);

  const market=marketState(state);
  assert.deepEqual(market,before,'mere market access must not rewrite a historical save');
  assert.deepEqual(getActiveCareerOffers(state),[pending],'read surface projects legacy pending as one active offer');
  assert.equal(state.market.openOffers,undefined);
  assert.deepEqual(state.rngState,rng);

  respondToOffer(state,pending.id,'reject');
  assert.deepEqual(state.market.openOffers,[],'first real mutation materializes the v2 collection');
  assert.equal(state.market.pending,null);
  assert.deepEqual(state.rngState,rng);
  loadSave(serializeSave(state));
});
