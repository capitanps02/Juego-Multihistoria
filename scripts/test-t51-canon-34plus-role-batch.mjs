import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import { STAGED_PRINCIPAL_ROLE_BATCH,isStagedRoleBatchEligible } from '../dist/content/events/34_plus/staged-principal-role-batch.js';

function stateAt(){const s=createInitialState(10434);s.age=34;s.phase='34_plus';s.date='2040-08-07';s.season='2040-2041';s.retirement.status='playing';s.professional.legacyCapital=60;return s;}
function benchFixture(s){while(s.runtime.day%7!==0)s.runtime.day++;recordOfficialMatchInPlace(s,{appeared:false,debutOccurred:false,injuryUnavailable:false});const store=s.world.sportMatchModel;const row=store.fixtures.at(-1);row.player.calledUp=true;row.player.onBench=true;row.player.started=false;row.player.appeared=false;row.player.minutes=0;s.runtime.day+=7;const d=new Date(s.date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+7);s.date=d.toISOString().slice(0,10);}

test('role batch exposes two exact verified principals',()=>{assert.deepEqual(STAGED_PRINCIPAL_ROLE_BATCH.map(e=>e.id),['EVT_34_ROLE_001','EVT_34_FAN_001']);for(const e of STAGED_PRINCIPAL_ROLE_BATCH){assert.equal(e.canonStatus,'verified');assert.equal(e.choices.length,4);assert.ok(e.tags.includes('staged_not_registered'));}});
test('two factual consecutive bench starts plus legacy unlock role scene',()=>{const s=stateAt();assert.equal(isStagedRoleBatchEligible(s,'EVT_34_ROLE_001'),false);benchFixture(s);assert.equal(isStagedRoleBatchEligible(s,'EVT_34_ROLE_001'),false);benchFixture(s);assert.equal(isStagedRoleBatchEligible(s,'EVT_34_ROLE_001'),true);});
test('fan scene needs several factual bench starts and legacy, not media heat',()=>{const s=stateAt();s.reputation.mediaHeat=100;for(let i=0;i<2;i++)benchFixture(s);assert.equal(isStagedRoleBatchEligible(s,'EVT_34_FAN_001'),false);benchFixture(s);assert.equal(isStagedRoleBatchEligible(s,'EVT_34_FAN_001'),true);s.professional.legacyCapital=10;assert.equal(isStagedRoleBatchEligible(s,'EVT_34_FAN_001'),false);});
test('crowd facts are event occurrence, not written as synthetic sport result',()=>{for(const e of STAGED_PRINCIPAL_ROLE_BATCH){for(const o of e.outcomes){assert.equal(o.effects.some(x=>'path' in x && x.path.startsWith('sport.')),false);}}});
