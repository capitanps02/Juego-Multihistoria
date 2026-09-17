import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { getCurrentMatchContext, getSportContext } from '../dist/simulation/sport-context.js';
import {
  lateCareerWeek,
  retirementSportingBoundary,
  shouldCloseAnnouncedCareer
} from '../dist/simulation/late-career-engine.js';

function announcedState(){
  const state=createInitialState(53638);
  state.age=38;
  state.phase='34_plus';
  state.date='2046-04-01';
  state.season='2045-46';
  state.retirement.status='announced';
  state.retirement.decidedDate='2046-01-10';
  state.retirement.announcedDate='2046-02-01';
  state.retirement.decisionAge=38;
  state.retirement.reason='voluntary';
  state.retirement.daysInStatus=28;
  state.flags.RETIREMENT_ANNOUNCED=true;
  state.flags.RETIREMENT_WAS_ANNOUNCED=true;
  state.sport.appearances=100;
  state.world.retirementAppearancesAtAnnouncement=100;
  state.world.retirementObservedAppearances=100;
  state.professional.recoveryDebt=25;
  state.professional.availability=75;
  state.professional.motivationReserve=60;
  state.professional.roleSecurity=45;
  state.professional.legacyCapital=30;
  state.professional.statusInertia=45;
  state.professional.bodyLoad=25;
  state.professional.technique=60;
  state.professional.tacticalReading=60;
  state.professional.composure=60;
  state.professional.gameSpeedPerception=60;
  state.professional.explosiveness=50;
  state.professional.matchEndurance=55;
  state.professional.successionPressure=25;
  state.professional.matchSelectivity=20;
  state.professional.recoveryBetweenMatches=50;
  return state;
}

test('T5.36 sport authority exposes career appearances but not unsupported match facts',()=>{
  const state=announcedState();
  const sport=getSportContext(state);
  assert.equal(sport.availability.careerAppearances,'known');
  assert.equal(sport.careerAppearances,100);
  for(const field of ['currentCompetition','nextFixture','previousFixture','remainingOfficialMatches','currentSquadStatus']){
    assert.equal(sport.availability[field],'unavailable',`${field} must remain unavailable`);
    assert.equal(sport[field],null,`${field} must not be invented`);
  }
  const match=getCurrentMatchContext(state);
  assert.equal(match.status,'no_authoritative_match_model');
  for(const field of ['competition','opponent','result','playerCalledUp','playerOnBench','playerStarted','playerAppeared','minutes','goals','assists']){
    assert.equal(match[field],null,`${field} must remain unknown`);
  }
});

test('T5.36 last-appearance observation never upgrades unavailable details into facts',()=>{
  const state=announcedState();
  state.sport.appearances=101; // aggregate appearance authority changed by football simulation upstream
  lateCareerWeek(state);
  assert.equal(state.flags.LAST_MATCH_PLAYED,true);
  assert.equal(state.world.retirementObservedAppearances,101);
  const sport=getSportContext(state);
  assert.equal(sport.careerAppearances,101);
  const match=getCurrentMatchContext(state);
  assert.equal(match.opponent,null);
  assert.equal(match.minutes,null);
  assert.equal(match.result,null);
  assert.equal(match.goals,null);
});

test('T5.36 no appearance delta cannot synthesize a last match',()=>{
  const state=announcedState();
  lateCareerWeek(state);
  assert.notEqual(state.flags.LAST_MATCH_PLAYED,true);
  assert.equal(getCurrentMatchContext(state).playerAppeared,null);
});

test('T5.36 retirement closure defers to authoritative remaining fixtures and preserves unavailable fallback',()=>{
  const unavailable={remainingOfficialMatches:null,availability:{remainingOfficialMatches:'unavailable'}};
  const remaining={remainingOfficialMatches:3,availability:{remainingOfficialMatches:'known'}};
  const complete={remainingOfficialMatches:0,availability:{remainingOfficialMatches:'known'}};
  const invalid={remainingOfficialMatches:-1,availability:{remainingOfficialMatches:'known'}};

  assert.equal(retirementSportingBoundary(unavailable),'unavailable');
  assert.equal(retirementSportingBoundary(remaining),'matches_remaining');
  assert.equal(retirementSportingBoundary(complete),'season_complete');
  assert.equal(retirementSportingBoundary(invalid),'unavailable');

  assert.equal(shouldCloseAnnouncedCareer(remaining,true),false,'authoritative fixtures must suppress legacy timeout');
  assert.equal(shouldCloseAnnouncedCareer(remaining,false),false);
  assert.equal(shouldCloseAnnouncedCareer(complete,false),true,'authoritative season end may close immediately');
  assert.equal(shouldCloseAnnouncedCareer(unavailable,true),true,'legacy/unavailable path preserves administrative fallback');
  assert.equal(shouldCloseAnnouncedCareer(unavailable,false),false);
  assert.equal(shouldCloseAnnouncedCareer(invalid,true),true,'invalid sporting data fails back to established administrative behavior');
});
