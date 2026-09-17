import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import {
  endingFamiliesCompatible,
  endingFamilySupported,
  selectEndingFamilies
} from '../dist/epilogue/generator.js';

function closedState(seed=936001){
  const state=createInitialState(seed);
  state.age=38;
  state.phase='34_plus';
  state.date='2046-07-01';
  state.season='2046-47';
  state.professional.initializedAt30=true;
  state.retirement.status='closed';
  state.retirement.decidedDate='2046-05-01';
  state.retirement.announcedDate='2046-06-01';
  state.retirement.closedDate=state.date;
  state.retirement.decisionAge=38;
  state.retirement.reason='voluntary';
  state.retirement.closureType='no_last_match';
  return state;
}

function assertCanonicalCombination(state,families){
  assert.ok(families.length>=2&&families.length<=5,`expected 2–5 ending families, got ${families.length}`);
  assert.equal(new Set(families).size,families.length,'ending families must be unique');
  for(const family of families){
    assert.equal(endingFamilySupported(state,family),true,`${family} must be backed by factual evidence`);
  }
  for(let i=0;i<families.length;i++){
    for(let j=i+1;j<families.length;j++){
      assert.equal(endingFamiliesCompatible(families[i],families[j]),true,`${families[i]} conflicts with ${families[j]}`);
    }
  }
}

test('T5.1 modest factual career still receives the canonical 2–5 compatible ending dimensions',()=>{
  const state=closedState();
  state.sport.roleScore=38;
  state.reputation.marketHeat=28;
  state.professional.trophyCapital=0;
  state.professional.publicMyth=18;
  state.professional.legacyCapital=22;

  const families=selectEndingFamilies(state);
  assertCanonicalCombination(state,families);
  assert.ok(families.includes('END_GREAT_PRO'));
  assert.ok(families.includes('END_UNFINISHED_FEELING'),'objective modest-career evidence must cover the legacy unfinished/modest ending dimension');
});

test('T5.1 epilogue selection fails closed instead of inventing a strong second label',()=>{
  const state=closedState(936002);
  state.retirement.closureType='planned_last_match';
  state.flags.LAST_MATCH_PLAYED=true;
  state.sport.roleScore=70;
  state.reputation.marketHeat=70;
  state.professional.trophyCapital=20;
  state.professional.publicMyth=50;
  state.professional.legacyCapital=50;
  state.professional.clubPrestigeTier=2;
  state.professional.contractPower=45;
  state.professional.careerControl=45;
  state.professional.motivationReserve=70;

  assert.throws(
    ()=>selectEndingFamilies(state),
    /Canonical epilogue requires 2–5 compatible fact-supported families/,
    'an uncovered taxonomy state must be visible to QA rather than padded with an unsupported ending'
  );
});
