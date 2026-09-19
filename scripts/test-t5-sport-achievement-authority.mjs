import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { narrativeCausalFacts } from '../dist/simulation/club-contract-intent.js';
import { recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import {
  defineSportRecordInPlace,
  getSportAchievementStore,
  inspectSportAchievementStore,
  recordIndividualAwardResultInPlace,
  recordSportRecordEventInPlace,
  recordSportRecordProgressInPlace,
  resolveAchievementHistoryFacts
} from '../dist/simulation/sport-achievement-authority.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

const SOURCE={kind:'simulation_boundary',producerId:'test-achievement-boundary'};
const EVENT_SOURCE={kind:'canonical_event',eventId:'EVT_TEST_RECORD',choiceId:'A',outcomeId:'A__PRIMARY'};

function state(seed=19900){ return createInitialState(seed); }
function appearanceState(seed=19910){
  const s=state(seed);
  s.date='2026-08-05'; s.season='2026-27'; s.runtime.day=35; s.runtime.seasonDay=35;
  return s;
}
function defineHigher(s){
  return defineSportRecordInPlace(s,{
    recordId:'REC_CLUB_APPS',label:'Club appearance record',metricId:'club_appearances',
    scope:'club',scopeRef:'UDV',direction:'higher',unit:'appearances',source:SOURCE
  });
}

test('achievement authority/1 reputation, form, seeds and trophies never fabricate award/record facts',()=>{
  const s=state(19901);
  s.reputation.prestige=100; s.reputation.mediaHeat=100; s.sport.form=100;
  s.professional.trophyCapital=100; s.flags.HAS_SEED_RECORD_CHASE=true;
  const before=structuredClone(s.rngState);
  assert.deepEqual(resolveAchievementHistoryFacts(s),{
    awardResultsKnown:0,protagonistAwardWins:[],latestAwardWin:null,
    recordDefinitionsKnown:0,latestRecordSurpass:null
  });
  assert.equal(s.world.sportAchievements,undefined);
  assert.deepEqual(s.rngState,before);
});

test('achievement authority/2 explicit individual award result is immutable, idempotent and save-stable',()=>{
  const s=state(19902);
  const input={awardResultId:'AWARD:WORLD_PLAYER:2025-26:protagonist',awardId:'WORLD_PLAYER',season:s.season,subjectRef:'protagonist',result:'won',source:SOURCE};
  const first=recordIndividualAwardResultInPlace(s,input);
  assert.ok(first);
  assert.deepEqual(recordIndividualAwardResultInPlace(s,input),first);
  assert.equal(recordIndividualAwardResultInPlace(s,{...input,result:'not_won'}),null);
  const facts=resolveAchievementHistoryFacts(s);
  assert.equal(facts.latestAwardWin?.awardId,'WORLD_PLAYER');
  const restored=loadSave(serializeSave(s));
  assert.deepEqual(restored.world.sportAchievements,s.world.sportAchievements);
  assert.deepEqual(resolveAchievementHistoryFacts(restored),facts);
});

test('achievement authority/3 record definition, progress and holder chain require explicit improving facts',()=>{
  const s=state(19903);
  assert.ok(defineHigher(s));
  const progress=recordSportRecordProgressInPlace(s,{
    progressId:'PROG:REC_CLUB_APPS:protagonist:1',recordId:'REC_CLUB_APPS',subjectRef:'protagonist',
    value:399,fixtureId:null,source:SOURCE
  });
  assert.ok(progress);
  const set=recordSportRecordEventInPlace(s,{
    eventId:'REC_EVT:1',recordId:'REC_CLUB_APPS',kind:'set',previousHolderRef:null,newHolderRef:'protagonist',
    value:400,fixtureId:null,source:EVENT_SOURCE
  });
  assert.ok(set);
  assert.deepEqual(recordSportRecordEventInPlace(s,{
    eventId:'REC_EVT:1',recordId:'REC_CLUB_APPS',kind:'set',previousHolderRef:null,newHolderRef:'protagonist',
    value:400,fixtureId:null,source:EVENT_SOURCE
  }),set);
  assert.equal(recordSportRecordEventInPlace(s,{
    eventId:'REC_EVT:bad',recordId:'REC_CLUB_APPS',kind:'surpassed',previousHolderRef:'protagonist',newHolderRef:'NPC_YOUTH',
    value:399,fixtureId:null,source:SOURCE
  }),null,'non-improving value cannot surpass a higher-is-better record');
  s.runtime.day+=7; s.date='2025-07-08';
  const surpassed=recordSportRecordEventInPlace(s,{
    eventId:'REC_EVT:2',recordId:'REC_CLUB_APPS',kind:'surpassed',previousHolderRef:'protagonist',newHolderRef:'NPC_YOUTH',
    value:401,fixtureId:null,source:SOURCE
  });
  assert.ok(surpassed);
  assert.equal(resolveAchievementHistoryFacts(s).latestRecordSurpass?.newHolderRef,'NPC_YOUTH');
});

test('achievement authority/4 optional fixture provenance must link an actual persisted fixture',()=>{
  const s=appearanceState(19904);
  defineHigher(s);
  const match=recordOfficialMatchInPlace(s,{appeared:true,debutOccurred:false,injuryUnavailable:false});
  assert.ok(match);
  assert.ok(recordSportRecordEventInPlace(s,{
    eventId:'REC_EVT:fixture',recordId:'REC_CLUB_APPS',kind:'set',previousHolderRef:null,newHolderRef:'protagonist',
    value:1,fixtureId:match.id,source:SOURCE
  }));
  assert.equal(recordSportRecordProgressInPlace(s,{
    progressId:'PROG:fake',recordId:'REC_CLUB_APPS',subjectRef:'protagonist',
    value:2,fixtureId:'fixture:fake',source:SOURCE
  }),null);
  assert.doesNotThrow(()=>serializeSave(s));
});

test('achievement authority/5 impossible persisted holder chronology fails save validation',()=>{
  const s=state(19905);
  s.world.sportAchievements={
    version:1,
    awards:[],
    records:[{recordId:'R',label:'R',metricId:'goals',scope:'career',scopeRef:null,direction:'higher',unit:'goals',source:SOURCE}],
    progress:[],
    recordEvents:[
      {eventId:'E1',recordId:'R',kind:'set',date:s.date,runtimeDay:s.runtime.day,previousHolderRef:null,newHolderRef:'A',value:10,fixtureId:null,source:SOURCE},
      {eventId:'E2',recordId:'R',kind:'surpassed',date:s.date,runtimeDay:s.runtime.day,previousHolderRef:'A',newHolderRef:'B',value:9,fixtureId:null,source:SOURCE}
    ]
  };
  assert.ok(inspectSportAchievementStore(s.world.sportAchievements,s));
  assert.throws(()=>serializeSave(s));
});

test('achievement authority/6 legacy missing store remains unknown and is never backfilled',()=>{
  const s=state(19906);
  delete s.world.sportAchievements;
  const restored=loadSave(serializeSave(s));
  assert.equal(restored.world.sportAchievements,undefined);
  assert.equal(resolveAchievementHistoryFacts(restored).awardResultsKnown,0);
});

test('achievement authority/7 readers consume zero RNG and mutate zero state',()=>{
  const s=state(19907);
  recordIndividualAwardResultInPlace(s,{awardResultId:'A1',awardId:'EXACT_AWARD',season:s.season,subjectRef:'protagonist',result:'not_won',source:SOURCE});
  const before=structuredClone(s);
  resolveAchievementHistoryFacts(s);
  narrativeCausalFacts(s).achievements;
  getSportAchievementStore(s);
  assert.deepEqual(s,before);
});
