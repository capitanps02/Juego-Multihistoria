import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import { STAGED_SHARED_BATCH_3,isStagedSharedBatch3Eligible } from '../dist/content/events/34_plus/staged-principal-shared-batch-3.js';

const expected=['EVT_34_NT_001','EVT_34_MATCH_001','EVT_34_NT_002','EVT_34_TRAVEL_001','EVT_35_TACT_001','EVT_35_NT_001','EVT_35_FINAL_001','EVT_36_BODY_001'];
const ntIds=['EVT_34_NT_001','EVT_34_NT_002','EVT_35_NT_001'];
const sportIds=expected.filter(id=>!ntIds.includes(id));
function stateAt(){const s=createInitialState(20001);s.age=40;s.phase='34_plus';s.retirement.status='playing';return s;}
function addOfficialRow(s){while(s.runtime.day%7!==0)s.runtime.day++;recordOfficialMatchInPlace(s,{appeared:true,debutOccurred:false,injuryUnavailable:false});}

test('shared batch 3 fully stages eight exact principals',()=>{assert.deepEqual(STAGED_SHARED_BATCH_3.map(e=>e.id),expected);for(const e of STAGED_SHARED_BATCH_3){assert.equal(e.canonStatus,'verified');assert.equal(e.choices.length,4);assert.ok(e.tags.includes('awaiting_external_fact'));}});
test('shared batch 3 fails closed without owner facts',()=>{const s=stateAt();for(const id of expected)assert.equal(isStagedSharedBatch3Eligible(s,id,false),false);});
test('national principals also require authoritative historical senior-selection evidence',()=>{const s=stateAt();for(const id of ntIds)assert.equal(isStagedSharedBatch3Eligible(s,id,true),false,id);s.flags.NATIONAL_CALLED=true;s.professional.nationalCaps=1;for(const id of ntIds)assert.equal(isStagedSharedBatch3Eligible(s,id,true),true,id);});
test('sport principals also require persisted official sport history',()=>{const s=stateAt();for(const id of sportIds)assert.equal(isStagedSharedBatch3Eligible(s,id,true),false,id);addOfficialRow(s);for(const id of sportIds)assert.equal(isStagedSharedBatch3Eligible(s,id,true),true,id);});
test('shared batch 3 creates exact canonical seed in each outcome path',()=>{for(const e of STAGED_SHARED_BATCH_3)for(const c of e.choices)for(const o of e.outcomes.filter(x=>c.outcomeIds.includes(x.id)))assert.ok((o.seedTransitions??[]).some(t=>t.action==='create'&&t.seedId===e.seedsWrite?.[0]),e.id);});
test('international retirement choices cannot close club career',()=>{for(const id of ['EVT_34_NT_001','EVT_34_NT_002']){const e=STAGED_SHARED_BATCH_3.find(x=>x.id===id);assert.equal(e.outcomes.some(o=>o.effects.some(fx=>'path'in fx&&fx.path==='retirement.status')),false);}});
test('sport choices do not manufacture sport facts',()=>{for(const e of STAGED_SHARED_BATCH_3)for(const o of e.outcomes)for(const fx of o.effects??[])if('path'in fx)assert.equal(fx.path.startsWith('sport.'),false,`${e.id}/${fx.path}`);});
