import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import {
  currentEmploymentClub,
  employmentStatus,
  hasActiveClubEmployment
} from '../dist/simulation/employment.js';
import { proposeCareerChange, respondToOffer } from '../dist/simulation/offers.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

function expiryState(seed=512000) {
  const state=createInitialState(seed);
  state.date='2027-01-31';
  state.contract.monthsRemaining=1;
  state.contract.salaryMonthly=4200;
  state.sport.appearances=17;
  state.reputation.marketHeat=0;
  state.flags.CONTRACT_DISPUTE=true;
  return state;
}

test('T5-QA-028 loyal/512000 natural 1→0 expiry becomes unattached exactly once',()=>{
  const state=expiryState();
  const rng=structuredClone(state.rngState);
  const history=structuredClone(state.history);
  const appearances=Number(state.sport.appearances);
  const former={club:state.club,owner:state.professional.ownerClub,registration:state.professional.registrationClub,salary:state.contract.salaryMonthly};
  advanceWorldDayInPlace(state);
  assert.equal(state.date,'2027-02-01');
  assert.equal(state.contract.monthsRemaining,0);
  assert.equal(employmentStatus(state),'unattached');
  assert.equal(hasActiveClubEmployment(state),false);
  assert.equal(currentEmploymentClub(state),null);
  assert.equal(state.contract.salaryMonthly,0);
  assert.equal(state.professional.route,'free_agent');
  assert.equal(state.flags.LOAN_ACTIVE,false);
  assert.deepEqual(state.employment.previous,{club:former.club,ownerClub:former.owner,registrationClub:former.registration,salaryMonthly:former.salary,endedDate:'2027-02-01',reason:'contract_expired'});
  assert.deepEqual(state.history,history);
  assert.equal(Number(state.sport.appearances),appearances);
  assert.deepEqual(state.rngState,rng,'expiry authority itself consumes no RNG');
});

test('unattached player cannot keep generating old-club official appearances/matches',()=>{
  const state=expiryState(512000);
  advanceWorldDayInPlace(state);
  const appearances=Number(state.sport.appearances);
  const before=JSON.stringify(state.world.sportMatchModel??null);
  for(let i=0;i<21;i++) advanceWorldDayInPlace(state);
  assert.equal(employmentStatus(state),'unattached');
  assert.equal(Number(state.sport.appearances),appearances);
  assert.equal(JSON.stringify(state.world.sportMatchModel??null),before);
});

test('unattached state survives save/load and can re-enter employment only by accepting a formal offer',()=>{
  let state=expiryState(512000);
  advanceWorldDayInPlace(state);
  const saved=serializeSave(state);
  state=loadSave(saved);
  assert.equal(employmentStatus(state),'unattached');
  const rng=structuredClone(state.rngState);
  proposeCareerChange(state,'Oferta profesional tras quedar libre',draft=>{
    draft.club='Reentry FC';
    draft.professional.ownerClub='Reentry FC';
    draft.professional.registrationClub='Reentry FC';
    draft.professional.leagueTier=2;
    draft.professional.route='domestic';
    draft.tier=2;
    draft.contract.monthsRemaining=12;
    draft.contract.salaryMonthly=6500;
  });
  assert.ok(state.market.pending);
  assert.equal(employmentStatus(state),'unattached','proposal alone cannot re-employ');
  const offer=structuredClone(state.market.pending);
  respondToOffer(state,offer.id,'accept');
  assert.equal(employmentStatus(state),'contracted');
  assert.equal(state.club,offer.terms.club);
  assert.equal(state.professional.registrationClub,offer.terms.registrationClub);
  assert.ok(Number(state.contract.monthsRemaining)>0);
  assert.deepEqual(state.rngState,rng);
  const restored=loadSave(serializeSave(state));
  assert.equal(employmentStatus(restored),'contracted');
  assert.equal(restored.club,'Reentry FC');
});

test('legacy zero-month save without employment remains ambiguous/fail-closed',()=>{
  const state=createInitialState(13004);
  delete state.employment;
  state.contract.monthsRemaining=0;
  state.contract.salaryMonthly=4200;
  state.professional.route='home';
  assert.equal(employmentStatus(state),'expired_pending_resolution');
  assert.equal(currentEmploymentClub(state),null);
  const restored=loadSave(serializeSave(state));
  assert.equal(employmentStatus(restored),'expired_pending_resolution');
});

test('same seed and same expiry boundary are deterministic',()=>{
  const run=()=>{const s=expiryState(512000);advanceWorldDayInPlace(s);for(let i=0;i<10;i++)advanceWorldDayInPlace(s);return s;};
  assert.deepEqual(run(),run());
});
