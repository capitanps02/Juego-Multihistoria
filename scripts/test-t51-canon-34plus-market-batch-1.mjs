import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { STAGED_MARKET_BATCH_1,isStagedMarketBatch1Eligible } from '../dist/content/events/34_plus/staged-principal-market-batch-1.js';

const expected=['EVT_34_BRIDGE_001','EVT_34_PAY_001','EVT_34_HOME_001','EVT_34_AGT_001','EVT_34_CON_001','EVT_34_MAR_001','EVT_35_MKT_001','EVT_35_CON_001'];
test('market batch 1 exposes eight exact fully-staged principal definitions',()=>{assert.deepEqual(STAGED_MARKET_BATCH_1.map(e=>e.id),expected);for(const e of STAGED_MARKET_BATCH_1){assert.equal(e.canonStatus,'verified');assert.equal(e.choices.length,4);assert.ok(e.tags.includes('awaiting_external_fact'));assert.ok((e.seedsWrite??[]).length>=1);}});
test('market staged definitions fail closed until owner factual adapter is satisfied',()=>{const s=createInitialState(18001);s.age=40;s.phase='34_plus';s.retirement.status='playing';for(const id of expected){assert.equal(isStagedMarketBatch1Eligible(s,id,false),false,id);assert.equal(isStagedMarketBatch1Eligible(s,id,true),true,id);}});
test('every market choice has two weighted outcomes and exact seed creation',()=>{for(const e of STAGED_MARKET_BATCH_1)for(const c of e.choices){assert.equal(c.outcomeIds.length,2);const outs=e.outcomes.filter(o=>c.outcomeIds.includes(o.id));assert.equal(outs.length,2);for(const o of outs){assert.ok((o.seedTransitions??[]).some(t=>t.action==='create'&&(e.seedsWrite??[]).includes(t.seedId)),`${e.id}/${c.id}`);}}});
test('market content never directly mutates contract, club, registration or retirement',()=>{const forbidden=[/^contract\./,/^club$/,/^retirement\.status$/,/^professional\.registrationClub$/,/^professional\.ownerClub$/];for(const e of STAGED_MARKET_BATCH_1)for(const o of e.outcomes)for(const fx of o.effects??[])if('path' in fx)assert.equal(forbidden.some(re=>re.test(fx.path)),false,`${e.id}/${fx.path}`);});
