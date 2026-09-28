import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {EVENTS} from '../dist/content/events/index.js';
import {createInitialState} from '../dist/content/initial-state.js';
import {EVENT_CUTSCENES,eventCutscene} from '../dist/content/event-cutscenes.js';
import {certifyPlayerClubLeadershipInPlace} from '../dist/simulation/player-leadership-authority.js';
import {GameSession} from '../dist/session/game-session.js';

test('29 unique clips bind only to existing exact events and valid WebM files',()=>{
 assert.equal(EVENT_CUTSCENES.length,29);
 assert.equal(new Set(EVENT_CUTSCENES.map(c=>c.eventId)).size,28);
 assert.equal(new Set(EVENT_CUTSCENES.map(c=>c.file)).size,29);
 for(const c of EVENT_CUTSCENES){assert.ok(c.eventId==='EPILOGUE'||EVENTS.some(e=>e.id===c.eventId));const bytes=fs.readFileSync('web/assets/cutscenes/'+c.file);assert.equal(bytes.subarray(0,4).toString('hex'),'1a45dfa3');}
});
test('eight establishing clips appear only in their pending decision without mutating state or RNG',()=>{
 const state=createInitialState(42); const before=structuredClone(state);
 for(const c of EVENT_CUTSCENES.filter(c=>['EVT_18_AGT_001','EVT_18_MED_001','EVT_20_ABR_001','EVT_21_MONEY_001','EVT_21_CCH_002','EVT_22_DDL_001','EVT_24_MKT_001'].includes(c.eventId))){assert.equal(eventCutscene(state,'decision',c.eventId)?.file,c.file);assert.equal(eventCutscene(state,'other',c.eventId),null);}
 assert.equal(eventCutscene(state,'decision','EVT_UNKNOWN'),null);assert.deepEqual(state,before);
});
test('moving in is shown after renting, never for staying home or before choosing',()=>{
 const s=createInitialState(42);
 assert.equal(eventCutscene(s,'decision','EVT_20_LIFE_001'),null);
 for(const choiceId of ['STAY_HOME','RENT_NEAR_CLUB','SHARE_TEAMMATE','CLUB_TEMPORARY']){s.history=[{eventId:'EVT_20_LIFE_001',choiceId}];assert.equal(Boolean(eventCutscene(s,'result')),choiceId==='RENT_NEAR_CLUB');}
 assert.equal(eventCutscene(s,'other'),null);
});
test('armband cannot invent captaincy from a generic choice or a previous club',()=>{
 const s=createInitialState(42);s.history=[{eventId:'EVT_25_CAP_001',choiceId:'A'}];
 assert.equal(eventCutscene(s,'result'),null);assert.equal(eventCutscene(s,'decision','EVT_25_CAP_001'),null);
 certifyPlayerClubLeadershipInPlace(s,'captain','EVT_25_CAP_001','A');
 assert.ok(eventCutscene(s,'result'));s.club='OtherClub';assert.equal(eventCutscene(s,'result'),null);
});
test('cutscene presentation keeps save identity and restores the same view',async()=>{
 const s=await GameSession.create(424242);const before=s.exportSnapshot();
 for(let i=0;i<20;i++)s.getView();assert.deepEqual(s.exportSnapshot(),before);
 const restored=await GameSession.fromSave(JSON.stringify(before));assert.deepEqual(restored.getView(),s.getView());
});

test('public statements, retirement, shirt and return home require the matching resolved choice',()=>{
 const s=createInitialState(42);
 for(const [eventId,yes,no] of [['EVT_18_PRS_001','PRUDENT_QUOTE','NO_REPLY'],['EVT_34_DORSAL_001','A','B'],['EVT_34_HOME_001','A','D'],['EVT_37_ANNOUNCE_001','ANNOUNCE_NOW','WAIT_END']]){
  s.club='UDV';s.retirement.status='announced';
  assert.equal(eventCutscene(s,'decision',eventId),null);
  s.history=[{eventId,choiceId:no}];assert.equal(eventCutscene(s,'result'),null);
  s.history=[{eventId,choiceId:yes}];assert.ok(eventCutscene(s,'result'),eventId);
 }
 s.club='AnotherClub';s.history=[{eventId:'EVT_34_HOME_001',choiceId:'A'}];assert.equal(eventCutscene(s,'result'),null);
});
test('generic clips use explicit historical moments, not random family fallbacks',()=>{
 const s=createInitialState(42);
 assert.match(eventCutscene(s,'decision','EVT_24_EUR_001').file,/generic_europe/);
 assert.match(eventCutscene(s,'decision','CEVT_35_NT_TOURNAMENT_INJURY').file,/generic_selection/);
 s.history=[{eventId:'EVT_18_MATCH_001',choiceId:'SAFE'}];assert.equal(eventCutscene(s,'result'),null);
 s.history[0].choiceId='TAKE_ON';assert.match(eventCutscene(s,'result').file,/generic_match/);
 assert.match(eventCutscene(s,'decision','EVT_18_MATCH_001').file,/debut/);
 assert.equal(eventCutscene(s,'decision','EVT_26_EUR_001'),null);
});
test('epilogue, 500 appearances and formal signing never arise from a title alone',()=>{
 const s=createInitialState(42);
 assert.equal(eventCutscene(s,'epilogue'),null);s.retirement.status='closed';assert.match(eventCutscene(s,'epilogue').file,/epilogue/);
 s.sport.appearances=499;assert.equal(eventCutscene(s,'decision','EVT_31_REC_001'),null);s.sport.appearances=500;assert.ok(eventCutscene(s,'decision','EVT_31_REC_001'));
 s.history=[{eventId:'EVT_34_CON_001',choiceId:'A'}];assert.equal(eventCutscene(s,'result'),null);
 for(const id of ['EVT_26_CLB_001','EVT_28_GALA_001','EVT_RET_LASTMATCH_001'])assert.equal(eventCutscene(s,'decision',id),null);
});

test('prologue is offered only before a new story and never replaces a pending chapter',async()=>{
 const s=await GameSession.create(424242);assert.equal(s.getView().cutscene?.eventId,'PROLOGUE');
 const before=s.exportSnapshot();s.getView();assert.deepEqual(s.exportSnapshot(),before);
 await s.dispatch({type:'continue',commandId:'prologue-continue',expectedRevision:s.getView().revision});
 assert.notEqual(s.getView().cutscene?.eventId,'PROLOGUE');
 const restored=await GameSession.fromSave(JSON.stringify(s.exportSnapshot()));assert.notEqual(restored.getView().cutscene?.eventId,'PROLOGUE');
});
