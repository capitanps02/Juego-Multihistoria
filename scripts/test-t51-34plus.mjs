import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState} from '../dist/content/initial-state.js';
import {EVENTS_34_PLUS} from '../dist/content/events/34_plus/index.js';
import {resolveChoiceInPlace} from '../dist/narrative/resolver.js';
import {
  closeCareer,
  isRetirementTransitionAllowed,
  lateCareerPreseason,
  lateCareerWeek,
  reverseRetirement,
  syncRetirementState
} from '../dist/simulation/late-career-engine.js';
import {
  ENDING_FAMILIES,
  endingFamiliesCompatible,
  endingFamilySupported,
  generateEpilogue,
  selectEndingFamilies
} from '../dist/epilogue/generator.js';
import {loadSave,serializeSave} from '../dist/save/save.js';

function lateState(seed=510034,age=38){
  const state=createInitialState(seed);
  state.age=age;
  state.phase='34_plus';
  state.season='2046-47';
  state.date='2047-07-01';
  state.professional.initializedAt30=true;
  state.sport.roleScore=48;
  state.reputation.marketHeat=42;
  return state;
}
function event(id){
  const found=EVENTS_34_PLUS.find(candidate=>candidate.id===id);
  assert.ok(found,`missing event ${id}`);
  return found;
}

test('T5.1 active terminal identities use canonical IDs and legacy technical IDs are not schedulable',()=>{
  const replacements=[
    ['EVT_38_MKT_001','EVT_38_MARKET_001'],
    ['EVT_RET_HOME_001','EVT_RET_FAM_001'],
    ['EVT_RET_LAST_001','EVT_RET_LASTMATCH_001']
  ];
  for(const [legacyId,canonicalId] of replacements){
    assert.equal(EVENTS_34_PLUS.some(candidate=>candidate.id===legacyId),false,`${legacyId} must be history-only, never active`);
    const canonical=event(canonicalId);
    assert.ok(canonical.tags?.includes(`legacy_history_only:${legacyId}`));
    assert.equal(canonical.tags?.some(tag=>tag.startsWith('canonical_alias:')),false);
  }
});

test('T5.1 retirement machine accepts only canonical transitions and closed is terminal',()=>{
  assert.equal(isRetirementTransitionAllowed('playing','decided'),true);
  assert.equal(isRetirementTransitionAllowed('decided','announced'),true);
  assert.equal(isRetirementTransitionAllowed('decided','playing'),true);
  assert.equal(isRetirementTransitionAllowed('announced','closed'),true);
  assert.equal(isRetirementTransitionAllowed('announced','playing'),false);
  assert.equal(isRetirementTransitionAllowed('playing','closed'),false);
  assert.equal(isRetirementTransitionAllowed('closed','playing'),false);

  const invalid=lateState();
  invalid.retirement.status='closed';
  invalid.retirement.closureType='fabricated';
  syncRetirementState(invalid,'playing');
  assert.equal(invalid.retirement.status,'playing');
  assert.equal(invalid.retirement.closureType,null);
  assert.equal(invalid.flags.RETIREMENT_INVALID_TRANSITION_BLOCKED,true);

  const announcedRollback=lateState();
  announcedRollback.retirement.status='playing';
  syncRetirementState(announcedRollback,'announced');
  assert.equal(announcedRollback.retirement.status,'announced');
  assert.equal(announcedRollback.flags.RETIREMENT_ANNOUNCED,true);
  assert.equal(announcedRollback.flags.RETIREMENT_INVALID_TRANSITION_BLOCKED,true);

  const terminal=lateState();
  terminal.retirement.status='closed';
  terminal.retirement.closedDate=terminal.date;
  terminal.flags.RETIRED=true;
  terminal.retirement.status='playing';
  syncRetirementState(terminal,'closed');
  assert.equal(terminal.retirement.status,'closed');
  reverseRetirement(terminal);
  assert.equal(terminal.retirement.status,'closed');
});

test('T5.1 voluntary retirement records a private decision without skipping announcement',()=>{
  const state=lateState();
  state.professional.retirementDistance=60;
  const family=event('EVT_RET_FAM_001');
  resolveChoiceInPlace(state,family,'RETIRE_NOW',true);
  assert.equal(state.retirement.status,'decided');
  assert.equal(state.retirement.reason,'voluntary');
  assert.equal(state.retirement.decidedDate,state.date);
  assert.equal(state.retirement.announcedDate,null);
});

test('T5.1 no-market exhaustion opens a player decision and never auto-retires',()=>{
  let state;
  for(let seed=1;seed<=128;seed++){
    const candidate=lateState(seed,38);
    candidate.contract.monthsRemaining=0;
    candidate.sport.roleScore=5;
    candidate.reputation.marketHeat=0;
    candidate.professional.veteranLeverage=0;
    candidate.professional.legacyCapital=0;
    candidate.professional.availability=10;
    candidate.retirement.noMarketWindows=3;
    lateCareerPreseason(candidate);
    if(candidate.flags.NO_MARKET_END_CONTEXT){state=candidate;break;}
  }
  assert.ok(state,'at least one deterministic seed must enter market silence');
  assert.equal(state.retirement.status,'playing');
  assert.equal(state.retirement.reason,null);
  assert.equal(state.flags.NO_MARKET_DECISION_PENDING,true);

  const market=event('EVT_38_MARKET_001');
  assert.equal(market.text.title,'Nadie llama en julio');
  assert.deepEqual(market.choices.map(choice=>choice.id),['LOWER_PAY','LOWER_LEVEL','WAIT_SEPTEMBER','RETIRE','CALL_HOME']);
  resolveChoiceInPlace(state,market,'RETIRE',true);
  assert.equal(state.retirement.status,'decided');
  assert.equal(state.retirement.reason,'no_market');
  assert.equal(state.flags.NO_MARKET_DECISION_PENDING,false);
});

test('T5.1 terminal decisions remain live after deferral and impossible demand has no immortal offer floor',()=>{
  for(const id of ['EVT_RET_FAM_001','EVT_RET_BODY_001','EVT_RET_HIGH_001','EVT_RET_LOW_001']){
    const definition=event(id);
    assert.equal(definition.repeatable,true,`${id} must be revisitable after a long cooldown`);
    assert.ok(definition.cooldown>=365,`${id} must not spam repeated retirement prompts`);
  }
  const body=event('EVT_RET_BODY_001');
  assert.equal(body.gates.some(gate=>gate.path==='world.maturityLongInjuryCount'),false,'physical redline cannot require a fabricated prior long injury');

  const noDemand=lateState(999,70);
  noDemand.contract.monthsRemaining=0;
  noDemand.sport.roleScore=0;
  noDemand.reputation.marketHeat=0;
  noDemand.professional.veteranLeverage=0;
  noDemand.professional.legacyCapital=0;
  noDemand.professional.availability=0;
  lateCareerPreseason(noDemand);
  assert.equal(noDemand.world.veteranMarketDemand,0);
  assert.equal(noDemand.flags.VETERAN_OFFER_AVAILABLE,false,'zero compatible demand must be allowed to produce zero offer probability');
});

test('T5.1 success, decline and health create contexts but age alone never retires',()=>{
  const success=lateState(12,37);
  success.world.finalOutcome='win'; success.sport.form=75; success.sport.roleScore=65;
  lateCareerWeek(success);
  assert.equal(success.flags.RETIRE_AFTER_WIN_CONTEXT,true);
  assert.equal(success.retirement.status,'playing');

  const decline=lateState(13,37);
  decline.sport.roleScore=28; decline.professional.motivationReserve=25;
  lateCareerWeek(decline);
  assert.equal(decline.flags.RETIRE_AFTER_LOW_CONTEXT,true);
  assert.equal(decline.retirement.status,'playing');

  const health=lateState(14,38);
  health.professional.recoveryDebt=88; health.professional.availability=20;
  lateCareerWeek(health);
  assert.equal(health.flags.NO_MEDICAL_CLEARANCE_CONTEXT,true);
  assert.equal(health.retirement.status,'playing');
  resolveChoiceInPlace(health,event('EVT_RET_BODY_001'),'RETIRE_HEALTH',true);
  assert.equal(health.retirement.status,'decided');
  assert.equal(health.retirement.reason,'health');

  const longCareer=lateState(15,48);
  longCareer.sport.roleScore=85; longCareer.reputation.marketHeat=85;
  longCareer.professional.motivationReserve=90; longCareer.professional.recoveryDebt=10; longCareer.professional.availability=95;
  lateCareerWeek(longCareer);
  assert.equal(longCareer.retirement.status,'playing');
});

test('T5.1 reconsideration exists before announcement but an announced retirement cannot reopen',()=>{
  const privateDecision=lateState();
  privateDecision.retirement.status='decided';
  privateDecision.retirement.decidedDate='2047-05-01';
  reverseRetirement(privateDecision);
  assert.equal(privateDecision.retirement.status,'playing');
  assert.equal(privateDecision.retirement.reversals,1);
  assert.equal(privateDecision.flags.RETIREMENT_RECONSIDERED,true);

  const announced=lateState();
  announced.retirement.status='announced';
  announced.retirement.decidedDate='2047-05-01';
  announced.retirement.announcedDate='2047-06-01';
  announced.flags.RETIREMENT_ANNOUNCED=true;
  announced.flags.RECONSIDERATION_WINDOW=true;
  reverseRetirement(announced);
  assert.equal(announced.retirement.status,'announced');
  assert.equal(announced.retirement.reversals,0);

  const reconsider=event('CEVT_RET_RECONSIDER');
  assert.deepEqual(reconsider.choices.map(choice=>choice.id),['CONFIRM','ACKNOWLEDGE_DOUBT']);
  assert.equal(reconsider.choices.some(choice=>(choice.immediateEffects??[]).some(effect=>effect.kind==='set'&&effect.path==='retirement.status'&&effect.value==='playing')),false);
  resolveChoiceInPlace(announced,reconsider,'CONFIRM',true);
  assert.equal(announced.retirement.status,'announced');
  assert.equal(announced.flags.RECONSIDERATION_WINDOW,false);

  const postOffer=event('CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED');
  assert.equal(postOffer.choices.some(choice=>(choice.immediateEffects??[]).some(effect=>effect.kind==='flag'&&effect.flag==='RECONSIDERATION_WINDOW'&&effect.value===true)),false);
  assert.equal(postOffer.choices.some(choice=>(choice.immediateEffects??[]).some(effect=>effect.kind==='set'&&effect.path==='retirement.status'&&effect.value==='playing')),false);

  announced.retirement.status='closed';
  announced.retirement.closedDate=announced.date;
  reverseRetirement(announced);
  assert.equal(announced.retirement.status,'closed');
  assert.equal(announced.retirement.reversals,0);
});

test('T5.1 canonical retirement scenes preserve player authority through announcement and farewell',()=>{
  const announce=event('EVT_RET_ANNOUNCE_001');
  assert.equal(announce.choices.length,5);
  assert.equal(announce.choices.every(choice=>choice.immediateEffects?.some(effect=>effect.kind==='set'&&effect.path==='retirement.status'&&effect.value==='announced')),true);

  const last=event('EVT_RET_LASTMATCH_001');
  assert.equal(last.text.title,'El último partido no está garantizado');
  assert.equal(last.choices.length,4);
  assert.equal(last.choices.some(choice=>(choice.immediateEffects??[]).some(effect=>effect.kind==='set'&&effect.path==='retirement.status'&&effect.value==='closed')),false);
});

test('T5.1 no-last-match and played-last-match closures stay distinct and no goal is fabricated',()=>{
  const noLast=lateState();
  noLast.retirement.status='announced';
  noLast.retirement.decidedDate='2047-05-01';
  noLast.retirement.announcedDate='2047-06-01';
  closeCareer(noLast,'voluntary','no_last_match');
  assert.equal(noLast.retirement.status,'closed');
  assert.equal(noLast.retirement.closureType,'no_last_match');

  const lastWindow=event('CEVT_RET_STORYBOOK_LAST_GOAL');
  assert.equal(lastWindow.text.title,'La última ventana');
  assert.equal(lastWindow.choices.some(choice=>(choice.immediateEffects??[]).some(effect=>effect.kind==='flag'&&effect.flag==='STORYBOOK_LAST_GOAL')),false);
  assert.equal(lastWindow.outcomes.some(outcome=>outcome.effects.some(effect=>effect.kind==='flag'&&effect.flag==='STORYBOOK_LAST_GOAL')),false);
  assert.ok(lastWindow.outcomes.some(outcome=>outcome.effects.some(effect=>effect.kind==='flag'&&effect.flag==='LAST_MATCH_PLAYED')));
  assert.ok(lastWindow.outcomes.some(outcome=>outcome.effects.some(effect=>effect.kind==='set'&&effect.path==='retirement.closureType'&&effect.value==='no_last_match')));
});

test('T5.1 private decisions never auto-announce; administrative closure starts only after factual announcement',()=>{
  const decided=lateState(88,39);
  decided.retirement.status='decided';
  decided.retirement.reason='voluntary';
  decided.retirement.decidedDate='2047-05-01';
  decided.retirement.daysInStatus=420;
  lateCareerWeek(decided);
  assert.equal(decided.retirement.status,'decided');
  assert.equal(decided.flags.ADMIN_ANNOUNCEMENT_FALLBACK,false);
  assert.equal(decided.retirement.announcedDate,null);

  resolveChoiceInPlace(decided,event('EVT_RET_ANNOUNCE_001'),'FAMILY_CLUB_PUBLIC',true);
  assert.equal(decided.retirement.status,'announced');
  assert.equal(decided.flags.RETIREMENT_ANNOUNCED,true);

  decided.retirement.daysInStatus=119;
  decided.contract.monthsRemaining=12;
  lateCareerWeek(decided);
  assert.equal(decided.retirement.status,'closed');
  assert.equal(decided.retirement.closureType,'no_last_match');
});

test('T5.1 closeCareer cannot fabricate normal 34+ decision or announcement',()=>{
  const playing=lateState(89,39);
  closeCareer(playing,'voluntary','no_last_match');
  assert.equal(playing.retirement.status,'playing');
  assert.equal(playing.flags.RETIREMENT_INVALID_TRANSITION_BLOCKED,true);

  const decided=lateState(90,39);
  decided.retirement.status='decided';
  decided.retirement.reason='voluntary';
  decided.retirement.decidedDate=decided.date;
  closeCareer(decided,'voluntary','no_last_match');
  assert.equal(decided.retirement.status,'decided');
  assert.equal(decided.retirement.announcedDate,null);
});

test('T5.1 save/restore preserves an in-progress retirement state',()=>{
  const state=lateState();
  state.retirement.status='decided';
  state.retirement.decidedDate=state.date;
  state.retirement.decisionAge=state.age;
  state.retirement.reason='voluntary';
  state.flags.RETIREMENT_DECISION_CONTEXT=true;
  const restored=loadSave(serializeSave(state));
  assert.equal(restored.retirement.status,'decided');
  assert.equal(restored.retirement.decidedDate,state.date);
  assert.equal(restored.retirement.reason,'voluntary');
  assert.equal(restored.epilogue.generated,false);
});

test('T5.1 epilogue uses factual evidence, actual club history and compatible family combinations',()=>{
  assert.equal(ENDING_FAMILIES.length,20);
  const state=lateState(77,38);
  state.retirement.status='closed';
  state.retirement.decidedDate='2047-05-01';
  state.retirement.announcedDate='2047-06-01';
  state.retirement.closedDate='2047-07-01';
  state.retirement.reason='no_market';
  state.retirement.closureType='no_last_match';
  state.professional.publicMyth=100;
  state.professional.trophyCapital=100;
  state.professional.legacyCapital=100;
  state.professional.nationalPower=100;
  state.professional.nationalCaps=6;
  state.history=[
    {eventId:'EVT_34_MAR_001',date:'2043-03-10',season:'2042-43',choiceId:'A',outcomeId:'A_OUT',club:'Club Norte',snapshot:{age:34},salience:80,visibility:'public'},
    {eventId:'EVT_35_JAN_001',date:'2044-01-20',season:'2043-44',choiceId:'B',outcomeId:'B_OUT',club:'Club Sur',snapshot:{age:35},salience:75,visibility:'public'},
    {eventId:'EVT_38_MKT_001',date:'2047-07-01',season:'2046-47',choiceId:'RETIRE',outcomeId:'RETIRE_OUT',club:'Club Sur',snapshot:{age:38},salience:95,visibility:'public'}
  ];
  assert.equal(endingFamilySupported(state,'END_WORLD_LEGEND'),false,'aggregate prestige alone cannot invent world-legend evidence');
  assert.equal(endingFamilySupported(state,'END_NATIONAL_CAPTAIN'),false,'caps alone cannot invent captaincy');
  assert.equal(endingFamilySupported(state,'END_ONE_CLUB_MYTH'),false,'multiple actual clubs cannot be rewritten as a one-club career');
  const families=selectEndingFamilies(state);
  assert.ok(families.includes('END_MARKET_SILENCE'));
  assert.equal(families.includes('END_WORLD_LEGEND'),false);
  assert.equal(families.includes('END_NATIONAL_CAPTAIN'),false);
  assert.equal(families.includes('END_STORYBOOK_FAREWELL'),false);
  assert.equal(families.includes('END_UNFINISHED_FEELING'),false,'a modest or market-ended career is not automatically framed as failure');
  for(let i=0;i<families.length;i++)for(let j=i+1;j<families.length;j++)assert.equal(endingFamiliesCompatible(families[i],families[j]),true);

  generateEpilogue(state);
  assert.equal(state.epilogue.generated,true);
  const historyMilestones=new Set(state.history.map(h=>`${h.season} · ${h.eventId} · ${h.choiceId}`));
  for(const milestone of state.epilogue.milestones)assert.ok(historyMilestones.has(milestone));
});
