import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { STAGED_SHARED_BATCH_4,isStagedSharedBatch4Eligible } from '../dist/content/events/34_plus/staged-principal-shared-batch-4.js';

const expected=['EVT_35_RECORD_001','EVT_36_RECORD_001','EVT_37_PEN_001','EVT_34_DORSAL_001','EVT_34_MENTOR_001','EVT_35_DUAL_001','EVT_36_CCH_001','EVT_36_PEER_001'];
test('shared batch 4 fully stages final eight ordinary principals',()=>{assert.deepEqual(STAGED_SHARED_BATCH_4.map(e=>e.id),expected);for(const e of STAGED_SHARED_BATCH_4){assert.equal(e.canonStatus,'verified');assert.equal(e.choices.length,4);assert.ok(e.tags.includes('awaiting_external_fact'));}});
test('shared batch 4 fails closed without owner facts',()=>{const s=createInitialState(21001);s.age=40;s.phase='34_plus';s.retirement.status='playing';for(const id of expected){assert.equal(isStagedSharedBatch4Eligible(s,id,false),false);assert.equal(isStagedSharedBatch4Eligible(s,id,true),true);}});
test('shared batch 4 creates exact canonical seed in every outcome path',()=>{for(const e of STAGED_SHARED_BATCH_4)for(const c of e.choices)for(const o of e.outcomes.filter(x=>c.outcomeIds.includes(x.id)))assert.ok((o.seedTransitions??[]).some(t=>t.action==='create'&&t.seedId===e.seedsWrite?.[0]),e.id);});
test('record and penalty scenes never synthesize sport facts',()=>{for(const id of ['EVT_35_RECORD_001','EVT_36_RECORD_001','EVT_37_PEN_001']){const e=STAGED_SHARED_BATCH_4.find(x=>x.id===id);for(const o of e.outcomes)for(const fx of o.effects??[])if('path'in fx)assert.equal(fx.path.startsWith('sport.'),false,`${id}/${fx.path}`);}});
test('peer retirement cannot mutate protagonist retirement state',()=>{const e=STAGED_SHARED_BATCH_4.find(x=>x.id==='EVT_36_PEER_001');assert.equal(e.outcomes.some(o=>o.effects.some(fx=>'path'in fx&&fx.path==='retirement.status')),false);});
