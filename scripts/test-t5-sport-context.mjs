import './test-t5-career-sport-milestones.mjs';
import './test-t5-match-model.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { narrativeConditionRoot } from '../dist/simulation/club-contract-intent.js';
import { getCurrentMatchContext, getSportContext } from '../dist/simulation/sport-context.js';

function rng(state) { return structuredClone(state.rngState); }

test('sport context/1 projection is read-only, exposes schedule and consumes zero RNG', () => {
  const state = createInitialState(8701);
  const before = structuredClone(state);
  const beforeRng = rng(state);
  const context = getSportContext(state);
  const match = getCurrentMatchContext(state);
  assert.equal(context.currentSeason, state.season);
  assert.equal(context.sportingClub, state.professional.registrationClub);
  assert.equal(context.currentCompetition, 'league');
  assert.ok(context.nextFixture);
  assert.equal(context.nextFixture.club, state.professional.registrationClub);
  assert.equal(context.availability.nextFixture, 'known');
  assert.equal(match.status, 'no_current_match');
  assert.deepEqual(state, before);
  assert.deepEqual(state.rngState, beforeRng);
});

test('sport context/2 aggregate proxies cannot fabricate persisted match or squad facts', () => {
  const state = createInitialState(8702);
  state.sport.roleScore = 99;
  state.sport.form = 99;
  state.reputation.prestige = 99;
  state.runtime.seasonDay = 300;
  state.flags.FIRST_TEAM_ATTENTION = true;
  state.flags.OFFICIAL_DEBUT = true;
  const context = getSportContext(state);
  const match = getCurrentMatchContext(state);
  assert.ok(context.nextFixture, 'calendar is produced independently of aggregate role/form proxies');
  assert.ok(context.remainingLeagueMatches > 0);
  assert.equal(context.currentSquadStatus, null);
  assert.equal(context.firstMatchSquadCall, null);
  assert.equal(context.firstStart, null);
  assert.equal(context.firstGoal, null);
  assert.equal(context.availability.firstMatchSquadCall, 'unavailable');
  assert.equal(match.status, 'no_current_match');
  assert.equal(match.playerAppeared, null);
});

test('sport context/3 registration club is the sporting club and fixture authority for transfers and loans', () => {
  const state = createInitialState(8703);
  state.club = 'Loan FC';
  state.professional.ownerClub = 'Parent FC';
  state.professional.registrationClub = 'Loan FC';
  state.professional.route = 'loan';
  const context = getSportContext(state);
  assert.equal(context.sportingClub, 'Loan FC');
  assert.equal(context.ownerClub, 'Parent FC');
  assert.equal(context.nextFixture.club, 'Loan FC');
});

test('sport context/4 legacy debut flag alone never fabricates a current match or match milestone', () => {
  const state = createInitialState(8704);
  state.flags.OFFICIAL_DEBUT = true;
  state.sport.appearances = 1;
  const context = getSportContext(state);
  const match = getCurrentMatchContext(state);
  assert.equal(context.officialDebutRecorded, true);
  assert.equal(context.careerAppearances, 1);
  assert.equal(context.firstAppearance, null);
  assert.equal(match.status, 'no_current_match');
  assert.equal(match.playerAppeared, null);
  assert.equal(match.result, null);
});

test('sport context/5 narrative condition root exposes calendar/match facts without persistence or RNG', () => {
  const state = createInitialState(8705);
  const before = structuredClone(state);
  const root = narrativeConditionRoot(state);
  assert.equal(root.facts.sport.sportingClub, state.professional.registrationClub);
  assert.ok(root.facts.sport.nextFixture);
  assert.equal(root.facts.match.status, 'no_current_match');
  assert.equal(root.facts.match.playerStarted, null);
  assert.equal(Object.prototype.hasOwnProperty.call(state, 'facts'), false);
  assert.deepEqual(state, before);
});
