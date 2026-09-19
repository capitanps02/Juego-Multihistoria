import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { careerTerms } from '../dist/simulation/offers.js';
import { certifyActiveAgentInPlace } from '../dist/simulation/npc-authority.js';
import { STAGED_MARKET_BATCH_1,isStagedMarketBatch1Eligible } from '../dist/content/events/34_plus/staged-principal-market-batch-1.js';

const expected=['EVT_34_BRIDGE_001','EVT_34_PAY_001','EVT_34_HOME_001','EVT_34_AGT_001','EVT_34_CON_001','EVT_34_MAR_001','EVT_35_MKT_001','EVT_35_CON_001'];
function stateAt(age=40){const s=createInitialState(18001+age);s.age=age;s.phase='34_plus';s.retirement.status='playing';return s;}
function addRenewal(s,months=12){const before=careerTerms(s);const terms={...before,months,salary:before.salary+1};s.market={version:1,sequence:1,pending:{id:'offer:a8',date:s.date,reason:'Renovación de contrato',before,terms},history:[]};}

test('market batch 1 exposes eight exact fully-staged principal definitions',()=>{assert.deepEqual(STAGED_MARKET_BATCH_1.map(e=>e.id),expected);for(const e of STAGED_MARKET_BATCH_1){assert.equal(e.canonStatus,'verified');assert.equal(e.choices.length,4);assert.ok(e.tags.includes('awaiting_external_fact'));assert.ok((e.seedsWrite??[]).length>=1);}});
test('every market scene fails closed until owner factual adapter is satisfied',()=>{const s=stateAt();for(const id of expected)assert.equal(isStagedMarketBatch1Eligible(s,id,false),false,id);});
test('offer-bound renewal scenes consume eligible CareerOffer authority',()=>{const s=stateAt();for(const id of ['EVT_34_BRIDGE_001','EVT_34_PAY_001','EVT_34_CON_001','EVT_35_CON_001'])assert.equal(isStagedMarketBatch1Eligible(s,id,true),false,id);addRenewal(s,24);for(const id of ['EVT_34_BRIDGE_001','EVT_34_PAY_001','EVT_34_CON_001','EVT_35_CON_001'])assert.equal(isStagedMarketBatch1Eligible(s,id,true),true,id);});
test('agent gamble consumes certified active-agent plus formal-offer authority',()=>{const s=stateAt();addRenewal(s,12);assert.equal(isStagedMarketBatch1Eligible(s,'EVT_34_AGT_001',true),false);certifyActiveAgentInPlace(s,'NPC_AGT_01');assert.equal(isStagedMarketBatch1Eligible(s,'EVT_34_AGT_001',true),true);});
test('facts whose final authority is still external remain gated only by that adapter',()=>{const s=stateAt();for(const id of ['EVT_34_HOME_001','EVT_34_MAR_001','EVT_35_MKT_001'])assert.equal(isStagedMarketBatch1Eligible(s,id,true),true,id);});
test('every market choice has two weighted outcomes and exact seed creation',()=>{for(const e of STAGED_MARKET_BATCH_1)for(const c of e.choices){assert.equal(c.outcomeIds.length,2);const outs=e.outcomes.filter(o=>c.outcomeIds.includes(o.id));assert.equal(outs.length,2);for(const o of outs){assert.ok((o.seedTransitions??[]).some(t=>t.action==='create'&&(e.seedsWrite??[]).includes(t.seedId)),`${e.id}/${c.id}`);}}});
test('market content never directly mutates contract, club, registration or retirement',()=>{const forbidden=[/^contract\./,/^club$/,/^retirement\.status$/,/^professional\.registrationClub$/,/^professional\.ownerClub$/];for(const e of STAGED_MARKET_BATCH_1)for(const o of e.outcomes)for(const fx of o.effects??[])if('path' in fx)assert.equal(forbidden.some(re=>re.test(fx.path)),false,`${e.id}/${fx.path}`);});
