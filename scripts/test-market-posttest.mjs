import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { materializeAge18MarketOfferInPlace } from '../dist/simulation/early-career-market.js';
import { careerTerms, respondToOffer } from '../dist/simulation/offers.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';

function januaryOffer(){
 for(let seed=1;seed<=80;seed++){
  const s=createInitialState(seed);s.date='2027-01-08';s.runtime.day=191;s.runtime.seasonDay=191;
  const before=structuredClone(careerTerms(s));materializeAge18MarketOfferInPlace(s);
  if(s.market.pending)return {s,before};
 }
 throw Error('No January fixture');
}
test('January proposal and rejection never apply loan terms, including after save and the next day',()=>{
 const {s,before}=januaryOffer();const proposal=s.market.pending;assert.ok(proposal.terms.loan);assert.deepEqual(careerTerms(s),before);assert.notEqual(proposal.terms.club,s.club);
 respondToOffer(s,proposal.id,'reject');assert.deepEqual(careerTerms(s),before);assert.equal(s.flags.LOAN_ACTIVE,false);
 const loaded=loadSave(serializeSave(s));assert.deepEqual(careerTerms(loaded),before);
 advanceWorldDayInPlace(loaded);assert.equal(loaded.club,before.club);assert.equal(loaded.professional.registrationClub,before.registrationClub);assert.equal(loaded.professional.ownerClub,before.ownerClub);assert.equal(loaded.flags.LOAN_ACTIVE,false);assert.equal(loaded.market.pending,null);
});
test('acceptance applies one concrete destination and cannot be replayed',()=>{
 const {s}=januaryOffer();const proposal=s.market.pending;respondToOffer(s,proposal.id,'accept');assert.equal(s.club,proposal.terms.club);assert.equal(s.professional.registrationClub,proposal.terms.club);assert.equal(s.professional.ownerClub,proposal.terms.ownerClub);assert.equal(s.flags.LOAN_ACTIVE,true);
 const snapshot=JSON.stringify(s);assert.throws(()=>respondToOffer(s,proposal.id,'accept'));assert.equal(JSON.stringify(s),snapshot);
});
