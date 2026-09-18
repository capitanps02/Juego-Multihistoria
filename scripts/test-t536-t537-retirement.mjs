import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { serializeSave, loadSave } from '../dist/save/save.js';
import {
  closeCareer,
  lateCareerPreseason,
  lateCareerWeek,
  reverseRetirement,
  syncRetirementState
} from '../dist/simulation/late-career-engine.js';
import {
  buildEpilogueText,
  endingFamiliesCompatible,
  endingFamilySupported,
  generateEpilogue,
  selectEndingFamilies
} from '../dist/epilogue/generator.js';

const event=id=>{
  const found=EVENTS.find(item=>item.id===id);
  assert.ok(found,`missing event ${id}`);
  return found;
};

function addCareerHistory(state,{clubs=['UDV'],seasons=12}={}){
  state.history=[];
  for(let i=0;i<seasons;i++){
    const year=2026+i;
    state.history.push({
      eventId:`QA_CAREER_${i}`,
      date:`${year}-09-01`,
      season:`${year}-${String((year+1)%100).padStart(2,'0')}`,
      choiceId:'PLAY', outcomeId:'PLAY_OUT', club:clubs[i%clubs.length],
      snapshot:{age:18+i}, salience:70, visibility:'private'
    });
  }
}

function lateState(seed=53637){
  const state=createInitialState(seed);
  state.age=38;
  state.phase='34_plus';
  state.date='2046-04-01';
  state.season='2045-46';
  state.runtime.day=7200;
  state.runtime.seasonDay=274;
  state.professional.initializedAt20=true;
  state.professional.initializedAt23=true;
  state.professional.initializedAt26=true;
  state.professional.initializedAt30=true;
  state.professional.roleScoreAt23=45;
  state.professional.roleSecurity=45;
  state.professional.veteranLeverage=45;
  state.professional.legacyCapital=30;
  state.professional.publicMyth=20;
  state.professional.trophyCapital=10;
  state.professional.recoveryDebt=25;
  state.professional.availability=75;
  state.professional.motivationReserve=60;
  state.sport.roleScore=45;
  state.sport.appearances=100;
  state.reputation.marketHeat=35;
  state.contract.monthsRemaining=3;
  addCareerHistory(state);
  return state;
}

function setAnnounced(state){
  state.retirement.status='announced';
  state.retirement.decidedDate='2046-01-10';
  state.retirement.announcedDate='2046-02-01';
  state.retirement.decisionAge=38;
  state.retirement.reason='voluntary';
  state.retirement.daysInStatus=28;
  state.flags.RETIREMENT_ANNOUNCED=true;
  state.flags.RETIREMENT_WAS_ANNOUNCED=true;
  state.world.retirementAppearancesAtAnnouncement=Number(state.sport.appearances);
  state.world.retirementObservedAppearances=Number(state.sport.appearances);
}

function setClosed(state,{closure='no_last_match',reason='voluntary'}={}){
  state.retirement.status='closed';
  state.retirement.decidedDate='2046-01-10';
  state.retirement.announcedDate='2046-02-01';
  state.retirement.closedDate=state.date;
  state.retirement.decisionAge=38;
  state.retirement.reason=reason;
  state.retirement.closureType=closure;
  state.retirement.daysInStatus=0;
  state.flags.RETIRED=true;
  state.flags.RETIREMENT_WAS_ANNOUNCED=true;
}

test('T5.36/1 playing -> decided only through explicit retirement choice',()=>{
  const state=lateState();
  resolveChoiceInPlace(state,event('EVT_RET_HOME_001'),'RETIRE_NOW');
  assert.equal(state.retirement.status,'decided');
  assert.equal(state.retirement.decidedDate,state.date);
  assert.equal(state.retirement.decisionAge,38);
});

test('T5.36/2 decided -> playing requires explicit pre-announcement reconsideration',()=>{
  const state=lateState();
  resolveChoiceInPlace(state,event('EVT_RET_HOME_001'),'RETIRE_NOW');
  assert.equal(reverseRetirement(state),false,'a bare offer/RNG-free decision must not reverse without a narrative window');
  resolveChoiceInPlace(state,event('EVT_RET_ANNOUNCE_001'),'WAIT');
  assert.equal(state.retirement.status,'decided');
  resolveChoiceInPlace(state,event('CEVT_RET_RECONSIDER'),'RETURN');
  assert.equal(state.retirement.status,'playing');
  assert.equal(state.retirement.reversals,1);
  assert.equal(state.flags.RETIREMENT_RECONSIDERED,true);
});

test('T5.36/3 decided -> announced is an explicit announcement scene',()=>{
  const state=lateState();
  resolveChoiceInPlace(state,event('EVT_RET_HOME_001'),'RETIRE_NOW');
  resolveChoiceInPlace(state,event('EVT_RET_ANNOUNCE_001'),'DIRECT_VIDEO');
  assert.equal(state.retirement.status,'announced');
  assert.equal(state.flags.RETIREMENT_PUBLIC,true);
  assert.equal(state.flags.RETIREMENT_WAS_ANNOUNCED,true);
  assert.equal(state.world.retirementAppearancesAtAnnouncement,state.sport.appearances);
});

test('T5.36/4 announced -> closed is legal and produces a factual epilogue',()=>{
  const state=lateState();
  setAnnounced(state);
  closeCareer(state,'voluntary','no_last_match');
  assert.equal(state.retirement.status,'closed');
  assert.equal(state.epilogue.generated,true);
  assert.ok(state.epilogue.families.length>=2);
});

test('T5.36/5 announced -> playing is blocked',()=>{
  const state=lateState();
  setAnnounced(state);
  state.retirement.status='playing';
  syncRetirementState(state,'announced');
  assert.equal(state.retirement.status,'announced');
  assert.equal(state.flags.RETIREMENT_INVALID_TRANSITION_BLOCKED,true);
});

test('T5.36/6 closed -> playing is terminally blocked',()=>{
  const state=lateState();
  setClosed(state);
  state.retirement.status='playing';
  syncRetirementState(state,'closed');
  assert.equal(state.retirement.status,'closed');
  assert.equal(state.flags.RETIREMENT_INVALID_TRANSITION_BLOCKED,true);
});

test('T5.36/7 age alone never retires the player',()=>{
  const state=lateState();
  state.age=52;
  state.retirement.status='playing';
  lateCareerWeek(state);
  assert.equal(state.retirement.status,'playing');
});

test('T5.36/8 exhausted market opens a decision but does not retire',()=>{
  const state=lateState();
  state.age=50;
  state.contract.monthsRemaining=0;
  state.retirement.noMarketWindows=4;
  state.sport.roleScore=0;
  state.reputation.marketHeat=0;
  state.professional.veteranLeverage=0;
  state.professional.legacyCapital=0;
  state.professional.availability=0;
  lateCareerPreseason(state);
  assert.equal(state.retirement.status,'playing');
  assert.equal(state.flags.NO_MARKET_END_CONTEXT,true);
  assert.equal(state.flags.NO_MARKET_DECISION_PENDING,true);
});

test('T5.36/9 elapsed time cannot fabricate decided -> announced',()=>{
  const state=lateState();
  state.retirement.status='decided';
  state.retirement.decidedDate='2045-01-01';
  state.retirement.decisionAge=37;
  state.retirement.reason='voluntary';
  state.retirement.daysInStatus=500;
  lateCareerWeek(state);
  assert.equal(state.retirement.status,'decided');
  assert.notEqual(state.flags.RETIREMENT_ANNOUNCED,true);
});

test('T5.36/10 last match is observed from a real appearance delta',()=>{
  const state=lateState();
  setAnnounced(state);
  const baseline=Number(state.sport.appearances);
  state.sport.appearances=baseline+1;
  lateCareerWeek(state);
  assert.equal(state.flags.LAST_MATCH_PLAYED,true);
  assert.equal(state.world.retirementObservedAppearances,baseline+1);
  assert.equal(state.world.retirementLastAppearanceDate,state.date);
});

test('T5.36/11 retirement content never fabricates a last goal',()=>{
  const terminalIds=['EVT_RET_LAST_001','CEVT_RET_STORYBOOK_LAST_GOAL'];
  for(const id of terminalIds){
    const definition=event(id);
    const effects=[
      ...definition.choices.flatMap(choice=>choice.immediateEffects??[]),
      ...definition.outcomes.flatMap(outcome=>outcome.effects??[])
    ];
    assert.equal(effects.some(effect=>effect.kind==='flag'&&(effect.flag==='LAST_MATCH_GOAL_FACT'||effect.flag==='STORYBOOK_LAST_GOAL')&&effect.value===true),false,`${id} fabricates a goal`);
  }
});

test('T5.36/12 authoritative season end closes without a ceremonial last match',()=>{
  const state=lateState();
  setAnnounced(state);
  state.date='2046-06-01';
  state.runtime.seasonDay=335;
  state.retirement.daysInStatus=121;
  state.sport.appearances=state.world.retirementObservedAppearances;
  lateCareerWeek(state);
  assert.equal(state.retirement.status,'closed');
  assert.equal(state.retirement.closureType,'no_last_match');
  assert.notEqual(state.flags.LAST_MATCH_PLAYED,true);
});

test('T5.36/13 international retirement is not professional retirement',()=>{
  const state=lateState();
  state.flags.NATIONAL_RETIRED=true;
  state.professional.nationalCaps=61;
  lateCareerWeek(state);
  assert.equal(state.retirement.status,'playing');
  assert.equal(state.flags.NATIONAL_RETIRED,true);
});

test('T5.36/14 save/restore is inert in playing, decided, announced and closed',()=>{
  for(const status of ['playing','decided','announced','closed']){
    const state=lateState(1400+status.length);
    if(status==='decided'){
      state.retirement.status='decided'; state.retirement.decidedDate='2046-01-10'; state.retirement.decisionAge=38; state.retirement.reason='voluntary';
    } else if(status==='announced')setAnnounced(state);
    else if(status==='closed')setClosed(state);
    const rng=structuredClone(state.rngState);
    const retirement=structuredClone(state.retirement);
    const history=structuredClone(state.history);
    const loaded=loadSave(serializeSave(state));
    assert.deepEqual(loaded.rngState,rng,`${status}: load consumed RNG`);
    assert.deepEqual(loaded.retirement,retirement,`${status}: load changed retirement`);
    assert.deepEqual(loaded.history,history,`${status}: load rewrote history`);
  }
});

test('T5.36/15 schema-7 legacy migration cannot announce or close retirement',()=>{
  const current=lateState(1515);
  const legacy=structuredClone(current);
  legacy.schemaVersion=7;
  delete legacy.retirement;
  delete legacy.epilogue;
  const rng=structuredClone(legacy.rngState);
  const loaded=loadSave(JSON.stringify(legacy));
  assert.equal(loaded.retirement.status,'playing');
  assert.equal(loaded.epilogue.generated,false);
  assert.deepEqual(loaded.rngState,rng);
});

test('T5.37/16 epilogue families require facts, not legacy labels',()=>{
  const oneClub=lateState();
  setClosed(oneClub);
  oneClub.professional.legacyCapital=70;
  oneClub.professional.publicMyth=55;
  addCareerHistory(oneClub,{clubs:['UDV'],seasons:15});
  assert.equal(endingFamilySupported(oneClub,'END_ONE_CLUB_MYTH'),true);
  assert.equal(endingFamilySupported(oneClub,'END_JOURNEYMAN_VETERAN'),false);

  const journey=lateState();
  setClosed(journey);
  addCareerHistory(journey,{clubs:['UDV','Club_B','Club_C'],seasons:15});
  journey.professional.ownerClub='Club_C'; journey.professional.registrationClub='Club_C'; journey.club='Club_C';
  assert.equal(endingFamilySupported(journey,'END_JOURNEYMAN_VETERAN'),true);
  assert.equal(endingFamilySupported(journey,'END_ONE_CLUB_MYTH'),false);

  const legacyGoal=lateState();
  setClosed(legacyGoal,{closure:'storybook'});
  legacyGoal.flags.STORYBOOK_LAST_GOAL=true;
  legacyGoal.flags.LAST_MATCH_PLAYED=true;
  assert.equal(endingFamilySupported(legacyGoal,'END_STORYBOOK_FAREWELL'),false,'legacy synthetic flag must not prove a last goal');
});

test('T5.37/17 hard conflicts prevent contradictory families',()=>{
  assert.equal(endingFamiliesCompatible('END_ONE_CLUB_MYTH','END_JOURNEYMAN_VETERAN'),false);
  assert.equal(endingFamiliesCompatible('END_EARLY_VOLUNTARY','END_TOO_LONG'),false);
  assert.equal(endingFamiliesCompatible('END_STORYBOOK_FAREWELL','END_UNFINISHED_FEELING'),false);
  assert.equal(endingFamiliesCompatible('END_GREAT_PRO','END_CONTRACT_KING'),true);
});

test('T5.37/18 every valid sparse closure gets a factual non-empty fallback',()=>{
  const state=lateState();
  setClosed(state,{closure:'no_last_match',reason:'voluntary'});
  state.epilogue={generated:false,families:[],milestones:[],summaryKey:null};
  const families=selectEndingFamilies(state);
  assert.ok(families.length>=2&&families.length<=5);
  generateEpilogue(state);
  assert.equal(state.epilogue.generated,true);
  assert.ok(Array.isArray(state.epilogue.finalText));
  assert.ok(state.epilogue.finalText.length>=2);
  assert.deepEqual(state.epilogue.finalText,buildEpilogueText(state));
  assert.ok(state.epilogue.finalText.every(line=>!line.includes('gol')),'fallback invented a goal');
});

test('T5.36 seed history is not mass-closed when career closes',()=>{
  const state=lateState();
  state.seeds=[{id:'QA_OPEN_SEED',state:'active',intensity:50,originEvent:'QA',originSeason:state.season,npcRefs:[],payload:{},lastTouchedDate:state.date}];
  setAnnounced(state);
  const before=structuredClone(state.seeds);
  closeCareer(state,'voluntary','no_last_match');
  assert.deepEqual(state.seeds,before);
});
