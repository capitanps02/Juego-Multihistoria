import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { STAGED_PRINCIPAL_WAVE_A, eligibleStagedPrincipalWaveA, isStagedWaveAEligible } from '../dist/content/events/34_plus/staged-principal-wave-a.js';

const expected={
 EVT_35_FAM_001:{choices:['STABLE_CITY','ONE_LAST_YEAR','TEMPORARY_SPLIT','FOOTBALL_ONLY'],seed:'SEED_FINAL_RELOCATION_TRADEOFF',payload:'stance'},
 EVT_35_BODY_001:{choices:['SIX_WEEKS','THREE_WEEKS','PERSONAL_PLAN','NORMAL_REASSESS'],seed:'SEED_SLOW_PRESEASON_35',payload:'preseasonPlan'},
 EVT_35_IMG_001:{choices:['FAREWELL_FRAME','LONGEVITY_FRAME','REJECT','ONE_YEAR'],seed:'SEED_RETIREMENT_MARKETING',payload:'campaignFrame'},
 EVT_36_MED_001:{choices:['REDUCE_EXPOSURE','CONTINUE_CLEARED','MORE_OPINIONS','TENTATIVE_DATE'],seed:'SEED_POST_CAREER_BODY_RISK',payload:'riskStance'}
};
const mkSeed=(id,originEvent)=>({id,state:'dormant',intensity:60,originEvent,originSeason:'2039-2040',npcRefs:[],payload:{},lastTouchedDate:'2040-08-01'});
function stateAt(age){const s=createInitialState(8400+age);s.age=age;s.phase='34_plus';s.date='2040-08-01';s.season='2040-2041';s.retirement.status='playing';return s;}

test('Wave A contains four exact staged canonical principals',()=>{
 assert.equal(STAGED_PRINCIPAL_WAVE_A.length,4);
 assert.deepEqual(STAGED_PRINCIPAL_WAVE_A.map(e=>e.id),Object.keys(expected));
 for(const event of STAGED_PRINCIPAL_WAVE_A){const spec=expected[event.id];assert.equal(event.canonStatus,'verified');assert.ok(event.tags.includes('staged_not_registered'));assert.deepEqual(event.choices.map(c=>c.id),spec.choices);assert.deepEqual(event.seedsWrite,[spec.seed]);}
});

test('every choice owns two real outcomes with canonical seed payload provenance',()=>{
 for(const event of STAGED_PRINCIPAL_WAVE_A){const spec=expected[event.id];for(const choice of event.choices){const outcomes=event.outcomes.filter(o=>choice.outcomeIds.includes(o.id));assert.equal(outcomes.length,2);for(const outcome of outcomes){const create=(outcome.seedTransitions??[]).find(t=>t.action==='create');assert.ok(create);assert.equal(create.seedId,spec.seed);assert.equal(typeof create.payload?.[spec.payload],'string');}}}
});

test('Wave A cannot mutate club, contract, terminal retirement status or sport facts',()=>{
 const forbidden=[/^club(?:\.|$)/,/^contract(?:\.|$)/,/^retirement\.status$/,/^sport\./,/^professional\.registrationClub$/,/^professional\.ownerClub$/];
 for(const event of STAGED_PRINCIPAL_WAVE_A){for(const choice of event.choices){for(const effect of choice.immediateEffects??[]){if('path' in effect)assert.equal(forbidden.some(re=>re.test(effect.path)),false);}}for(const outcome of event.outcomes){for(const effect of outcome.effects??[]){if('path' in effect)assert.equal(forbidden.some(re=>re.test(effect.path)),false,`${event.id}/${outcome.id}/${effect.path}`);}}}
});

test('family scene fails closed without relocation and family memories',()=>{
 const s=stateAt(35);assert.equal(isStagedWaveAEligible(s,'EVT_35_FAM_001'),false);s.seeds.push(mkSeed('SEED_RELOCATION_LIMIT','EVT_30_LIFE_001'));assert.equal(isStagedWaveAEligible(s,'EVT_35_FAM_001'),false);s.seeds.push(mkSeed('SEED_FAMILY_ANCHOR','EVT_30_FAM_001'));assert.equal(isStagedWaveAEligible(s,'EVT_35_FAM_001'),true);
});
test('body scene requires persisted body burden independent from age',()=>{const s=stateAt(35);s.professional.recoveryDebt=0;s.professional.bodyLoad=0;s.professional.recoveryBetweenMatches=100;s.professional.availability=100;s.world.maturityLongInjuryCount=0;s.world.maturityInjuryCount=0;assert.equal(isStagedWaveAEligible(s,'EVT_35_BODY_001'),false);s.professional.recoveryDebt=24;assert.equal(isStagedWaveAEligible(s,'EVT_35_BODY_001'),true);});
test('image scene requires qualifying public/commercial context without retirement announcement',()=>{const s=stateAt(35);s.professional.commercialPower=0;s.professional.publicMyth=0;s.reputation.mediaHeat=0;assert.equal(isStagedWaveAEligible(s,'EVT_35_IMG_001'),false);s.professional.commercialPower=55;assert.equal(isStagedWaveAEligible(s,'EVT_35_IMG_001'),true);assert.equal(s.retirement.status,'playing');});
test('medical future scene requires medical memory or accumulated body history, not age alone',()=>{const s=stateAt(36);s.professional.recoveryDebt=0;s.professional.bodyLoad=0;s.professional.recoveryBetweenMatches=100;s.professional.availability=100;s.world.maturityLongInjuryCount=0;s.world.maturityInjuryCount=0;assert.equal(isStagedWaveAEligible(s,'EVT_36_MED_001'),false);s.seeds.push(mkSeed('SEED_MEDICAL_AUTHORITY','EVT_30_MED_001'));assert.equal(isStagedWaveAEligible(s,'EVT_36_MED_001'),true);});
test('non-playing retirement state suppresses every staged Wave A scene',()=>{const s=stateAt(36);s.professional.commercialPower=60;s.professional.recoveryDebt=30;s.seeds.push(mkSeed('SEED_RELOCATION_LIMIT','EVT_30_LIFE_001'),mkSeed('SEED_FAMILY_ANCHOR','EVT_30_FAM_001'),mkSeed('SEED_MEDICAL_AUTHORITY','EVT_30_MED_001'));assert.equal(eligibleStagedPrincipalWaveA(s).length,4);s.retirement.status='announced';assert.equal(eligibleStagedPrincipalWaveA(s).length,0);});
