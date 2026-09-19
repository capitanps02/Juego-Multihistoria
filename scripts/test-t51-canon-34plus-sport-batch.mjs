import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import { STAGED_PRINCIPAL_SPORT_BATCH,isStagedSportBatchEligible } from '../dist/content/events/34_plus/staged-principal-sport-batch.js';

function stateAt(age){const s=createInitialState(9300+age);s.age=age;s.phase='34_plus';s.date='2040-08-07';s.season='2040-2041';s.retirement.status='playing';s.contract.monthsRemaining=12;return s;}
function addFixture(s,{appeared=false,injuryUnavailable=false}={}){while(s.runtime.day%7!==0)s.runtime.day++;recordOfficialMatchInPlace(s,{appeared,debutOccurred:false,injuryUnavailable});s.runtime.day+=7;const d=new Date(s.date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+7);s.date=d.toISOString().slice(0,10);}

test('sport batch exports exact staged IDs and canonical seeds',()=>{assert.deepEqual(STAGED_PRINCIPAL_SPORT_BATCH.map(e=>e.id),['EVT_34_LOAD_001','EVT_34_BODY_001','EVT_35_BENCH_001']);const seeds=['SEED_28_MATCH_PLAN','SEED_POST_MATCH_PAIN','SEED_FIVE_MATCHES_UNUSED'];STAGED_PRINCIPAL_SPORT_BATCH.forEach((e,i)=>{assert.equal(e.canonStatus,'verified');assert.deepEqual(e.seedsWrite,[seeds[i]]);assert.equal(e.choices.length,4);});});
test('load plan needs persisted usage history, never age alone',()=>{const s=stateAt(34);s.flags.BIG_CLUB=true;assert.equal(isStagedSportBatchEligible(s,'EVT_34_LOAD_001'),false);for(let i=0;i<12;i++)addFixture(s,{appeared:true});assert.equal(isStagedSportBatchEligible(s,'EVT_34_LOAD_001'),true);});
test('delayed-pain scene needs a real previous appearance plus body burden',()=>{const s=stateAt(34);s.professional.recoveryDebt=25;assert.equal(isStagedSportBatchEligible(s,'EVT_34_BODY_001'),false);addFixture(s,{appeared:true});assert.equal(isStagedSportBatchEligible(s,'EVT_34_BODY_001'),true);});
test('five-match scene needs five factual non-appearances, no injury and active contract',()=>{const s=stateAt(35);for(let i=0;i<5;i++)addFixture(s,{appeared:false,injuryUnavailable:false});assert.equal(isStagedSportBatchEligible(s,'EVT_35_BENCH_001'),true);s.contract.monthsRemaining=0;assert.equal(isStagedSportBatchEligible(s,'EVT_35_BENCH_001'),false);});
test('injury-unavailable row cannot masquerade as tactical non-participation',()=>{const s=stateAt(35);for(let i=0;i<4;i++)addFixture(s,{appeared:false});addFixture(s,{appeared:false,injuryUnavailable:true});assert.equal(isStagedSportBatchEligible(s,'EVT_35_BENCH_001'),false);});
test('request termination choice never mutates contract directly',()=>{const e=STAGED_PRINCIPAL_SPORT_BATCH.find(e=>e.id==='EVT_35_BENCH_001');const c=e.choices.find(c=>c.id==='REQUEST_TERMINATION');for(const id of c.outcomeIds){const o=e.outcomes.find(o=>o.id===id);assert.equal(o.effects.some(x=>'path' in x && x.path.startsWith('contract.')),false);}});
