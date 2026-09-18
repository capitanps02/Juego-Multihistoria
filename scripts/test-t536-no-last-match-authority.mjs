import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import { retirementNoLastMatchFact, retirementStorybookLastGoalFact } from '../dist/simulation/retirement-authority.js';
import { lateCareerWeek } from '../dist/simulation/late-career-engine.js';

const noLastEvent = () => {
  const found = EVENTS.find(row => row.id === 'CEVT_RET_NO_LAST_MATCH');
  assert.ok(found);
  return found;
};

function announcedFinalWindow(seed, finalInput) {
  const state = createInitialState(seed);
  state.age = 39;
  state.phase = '34_plus';
  state.season = '2040-41';
  state.professional.registrationClub = 'UDV';
  state.professional.ownerClub = 'UDV';
  state.club = 'UDV';

  state.date = '2041-03-01';
  state.runtime.day = 7000;
  state.runtime.seasonDay = 242;
  const appearance = recordOfficialMatchInPlace(state,{appeared:true,debutOccurred:false,injuryUnavailable:false});
  assert.ok(appearance);

  state.retirement.status = 'announced';
  state.retirement.decidedDate = '2041-03-10';
  state.retirement.announcedDate = '2041-03-15';
  state.retirement.decisionAge = 39;
  state.retirement.reason = 'voluntary';
  state.flags.RETIREMENT_WAS_ANNOUNCED = true;

  state.date = '2041-05-31';
  state.runtime.day = 7091;
  state.runtime.seasonDay = 333;
  const finalFixture = recordOfficialMatchInPlace(state,finalInput);
  assert.ok(finalFixture);

  state.date = '2041-06-01';
  state.runtime.day = 7092;
  state.runtime.seasonDay = 334;
  return { state, appearance, finalFixture };
}

test('T5.36 injury-caused no-last-match is factual only after the terminal sporting boundary', () => {
  const {state,appearance,finalFixture}=announcedFinalWindow(536610,{appeared:false,debutOccurred:false,injuryUnavailable:true});
  const before=structuredClone(state);
  const fact=retirementNoLastMatchFact(state);
  assert.deepEqual(state,before);
  assert.equal(fact.eligible,true);
  assert.equal(fact.cause,'injury');
  assert.equal(fact.missedFixtureId,finalFixture.id);
  assert.equal(fact.missedFixtureDate,'2041-05-31');
  assert.equal(fact.lastAppearanceFixtureId,appearance.id);
  assert.equal(eventGatesPass(state,noLastEvent()),true);
  lateCareerWeek(state);
  assert.equal(state.retirement.status,'announced','canonical factual no-last-match scene must be offered before administrative closure');
});

test('T5.36 generic non-appearance cannot impersonate injury-caused no-last-match', () => {
  const {state}=announcedFinalWindow(536611,{appeared:false,debutOccurred:false,injuryUnavailable:false});
  assert.equal(retirementNoLastMatchFact(state).eligible,false);
  assert.equal(eventGatesPass(state,noLastEvent()),false);
});

test('T5.36 a real post-announcement appearance makes no-last-match ineligible', () => {
  const {state}=announcedFinalWindow(536612,{appeared:true,debutOccurred:false,injuryUnavailable:false});
  assert.equal(retirementNoLastMatchFact(state).eligible,false);
  assert.equal(eventGatesPass(state,noLastEvent()),false);
});

test('T5.36 historical saves without persisted match authority fail no-last-match closed', () => {
  const state=createInitialState(536613);
  state.age=39;
  state.phase='34_plus';
  state.retirement.status='announced';
  state.retirement.announcedDate=state.date;
  delete state.world.sportMatchModel;
  assert.equal(retirementNoLastMatchFact(state).eligible,false);
  assert.equal(eventGatesPass(state,noLastEvent()),false);
});


test('T5.36 storybook last goal requires the final sporting boundary and an exact scoring appearance', () => {
  let finalState=null;
  let finalRow=null;
  for(let seed=536620;seed<536820;seed++){
    const state=createInitialState(seed);
    state.age=39;
    state.phase='34_plus';
    state.season='2040-41';
    state.professional.registrationClub='UDV';
    state.professional.ownerClub='UDV';
    state.club='UDV';
    state.retirement.status='announced';
    state.retirement.decidedDate='2041-03-01';
    state.retirement.announcedDate='2041-03-15';
    state.retirement.decisionAge=39;
    state.retirement.reason='voluntary';
    state.flags.RETIREMENT_WAS_ANNOUNCED=true;

    state.date='2041-05-31';
    state.runtime.day=7091;
    state.runtime.seasonDay=333;
    const row=recordOfficialMatchInPlace(state,{appeared:true,debutOccurred:false,injuryUnavailable:false});
    if(row?.stats?.goals>0){
      state.date='2041-06-01';
      state.runtime.day=7092;
      state.runtime.seasonDay=334;
      finalState=state;
      finalRow=row;
      break;
    }
  }
  assert.ok(finalState&&finalRow,'deterministic fixture search must find a factual scoring appearance');
  const fact=retirementStorybookLastGoalFact(finalState);
  assert.equal(fact.eligible,true);
  assert.equal(fact.fixtureId,finalRow.id);
  assert.equal(fact.goals,finalRow.stats.goals);
  const storybook=EVENTS.find(row=>row.id==='CEVT_RET_STORYBOOK_LAST_GOAL');
  assert.ok(storybook);
  assert.equal(eventGatesPass(finalState,storybook),true);
  lateCareerWeek(finalState);
  assert.equal(finalState.retirement.status,'announced','storybook conditional must resolve before automatic terminal closure');
});

test('T5.36 a scoring appearance is not a storybook terminal fact while official fixtures remain', () => {
  let stateWithGoal=null;
  for(let seed=536821;seed<537021;seed++){
    const state=createInitialState(seed);
    state.age=39;
    state.phase='34_plus';
    state.season='2040-41';
    state.professional.registrationClub='UDV';
    state.professional.ownerClub='UDV';
    state.club='UDV';
    state.retirement.status='announced';
    state.retirement.announcedDate='2041-03-15';
    state.flags.RETIREMENT_WAS_ANNOUNCED=true;
    state.date='2041-05-24';
    state.runtime.day=7084;
    state.runtime.seasonDay=326;
    const row=recordOfficialMatchInPlace(state,{appeared:true,debutOccurred:false,injuryUnavailable:false});
    if(row?.stats?.goals>0){
      state.date='2041-05-25';
      state.runtime.day=7085;
      state.runtime.seasonDay=327;
      stateWithGoal=state;
      break;
    }
  }
  assert.ok(stateWithGoal);
  assert.equal(retirementStorybookLastGoalFact(stateWithGoal).eligible,false);
});
