import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { careerTerms } from '../dist/simulation/offers.js';
import { STAGED_MARKET_BATCH_2,isStagedMarketBatch2Eligible } from '../dist/content/events/34_plus/staged-principal-market-batch-2.js';

const expected=['EVT_35_FAREWELL_001','EVT_35_AGT_001','EVT_35_JAN_001','EVT_35_HOME_001','EVT_36_CON_001','EVT_36_LOWER_001','EVT_37_SHORT_001','EVT_37_HOME_001','EVT_38_RICH_001','EVT_38_MARKET_001'];
const offerBound=['EVT_35_AGT_001','EVT_35_JAN_001','EVT_36_LOWER_001','EVT_37_SHORT_001','EVT_37_HOME_001'];
function stateAt(){const s=createInitialState(19001);s.age=40;s.phase='34_plus';s.retirement.status='playing';return s;}
function addOffer(s,kind='transfer'){
 const before=careerTerms(s);
 const terms=kind==='renewal'
   ? {...before,months:Math.max(24,before.months),salary:before.salary+1}
   : {...before,club:'A8_TARGET',ownerClub:'A8_TARGET',registrationClub:'A8_TARGET',months:12,salary:before.salary+1,route:'domestic'};
 s.market={version:1,sequence:1,pending:{id:`offer:a8:${kind}`,date:s.date,reason:'A8 factual offer',before,terms},history:[]};
}
function addRichOffer(s){
 addOffer(s,'transfer');
 s.market.pending.terms.salary=999999;
 s.market.pending.context={kind:'late_rich_offer',housing:'family housing included',calendar:'condensed domestic calendar',commercialRole:'international ambassador role'};
}
test('market batch 2 exposes ten exact fully-staged principals',()=>{assert.deepEqual(STAGED_MARKET_BATCH_2.map(e=>e.id),expected);for(const e of STAGED_MARKET_BATCH_2){assert.equal(e.canonStatus,'verified');assert.ok(e.choices.length>=4);assert.ok(e.tags.includes('awaiting_external_fact'));}});
test('market batch 2 fails closed without exact external facts',()=>{const s=stateAt();for(const id of expected)assert.equal(isStagedMarketBatch2Eligible(s,id,false),false,id);});
test('offer-bound scenes additionally consume formal eligible CareerOffer authority',()=>{for(const id of offerBound){const s=stateAt();assert.equal(isStagedMarketBatch2Eligible(s,id,true),false,id);addOffer(s,'transfer');assert.equal(isStagedMarketBatch2Eligible(s,id,true),true,id);}});
test('late-rich scene requires explicit formal rich-offer context and never salary/reputation proxies',()=>{const s=stateAt();addOffer(s,'transfer');s.market.pending.terms.salary=999999;s.reputation.marketHeat=100;assert.equal(isStagedMarketBatch2Eligible(s,'EVT_38_RICH_001',true),false);addRichOffer(s);assert.equal(isStagedMarketBatch2Eligible(s,'EVT_38_RICH_001',true),true);});
test('renewal-bound farewell and age-36 deal require eligible same-club renewal',()=>{for(const id of ['EVT_35_FAREWELL_001','EVT_36_CON_001']){const s=stateAt();addOffer(s,'transfer');assert.equal(isStagedMarketBatch2Eligible(s,id,true),false,id);addOffer(s,'renewal');assert.equal(isStagedMarketBatch2Eligible(s,id,true),true,id);}});
test('market silence rejects a contradictory pending eligible offer',()=>{const s=stateAt();assert.equal(isStagedMarketBatch2Eligible(s,'EVT_38_MARKET_001',true),true);addOffer(s,'transfer');assert.equal(isStagedMarketBatch2Eligible(s,'EVT_38_MARKET_001',true),false);});
test('home-success scene remains tied to its external result/contract-end adapter, not a fabricated offer',()=>{const s=stateAt();assert.equal(isStagedMarketBatch2Eligible(s,'EVT_35_HOME_001',true),true);});
test('market batch 2 seeds are created only by their exact producer event',()=>{for(const e of STAGED_MARKET_BATCH_2)for(const c of e.choices){const outs=e.outcomes.filter(o=>c.outcomeIds.includes(o.id));assert.equal(outs.length,2);for(const o of outs)for(const seedId of e.seedsWrite??[])assert.ok((o.seedTransitions??[]).some(t=>t.action==='create'&&t.seedId===seedId),`${e.id}/${c.id}/${seedId}`);}});
test('market batch 2 never directly mutates external authorities',()=>{const bad=[/^contract\./,/^club$/,/^tier$/,/^retirement\.status$/,/^professional\.registrationClub$/,/^professional\.ownerClub$/,/^professional\.leagueTier$/];for(const e of STAGED_MARKET_BATCH_2)for(const o of e.outcomes)for(const fx of o.effects??[])if('path'in fx)assert.equal(bad.some(re=>re.test(fx.path)),false,`${e.id}/${fx.path}`);});
test('retirement-looking choices remain non-terminal in A8',()=>{for(const id of ['EVT_36_LOWER_001','EVT_38_RICH_001','EVT_38_MARKET_001']){const e=STAGED_MARKET_BATCH_2.find(x=>x.id===id);assert.equal(e.outcomes.some(o=>o.effects.some(fx=>'path'in fx&&fx.path==='retirement.status')),false);}});
