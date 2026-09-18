import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { buildCareerSummary, buildLastProfessionalAppearanceFact } from '../dist/epilogue/career-summary.js';
import { recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import { closeCareer } from '../dist/simulation/late-career-engine.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

test('T5.36 career summary is read-only and does not fabricate unavailable match facts', () => {
  const state = createInitialState(536101);
  delete state.world.sportMatchModel;
  const before = structuredClone(state);
  const summary = buildCareerSummary(state);
  assert.deepEqual(state, before);
  assert.equal(summary.terminal, false);
  assert.equal(summary.retirementStatus, 'playing');
  assert.equal(summary.lastProfessionalAppearance.observed, false);
  assert.equal(summary.lastProfessionalAppearance.fixtureId, null);
  assert.equal(summary.lastProfessionalAppearance.minutes, null);
  assert.equal(summary.careerGoals, null);
  assert.equal(summary.majorTrophies, null);
  assert.ok(summary.missingAuthoritativeFacts.includes('fixture identity'));
});

test('T5.36 LastMatchFact uses exact latest factual appearance and ignores newer non-appearance', () => {
  const state = createInitialState(536102);
  state.age = 39;
  state.phase = '34_plus';
  state.season = '2040-41';
  state.club = 'UDV';
  state.professional.registrationClub = 'UDV';
  state.professional.ownerClub = 'UDV';
  state.retirement.status = 'announced';
  state.retirement.announcedDate = '2041-03-17';

  state.date = '2041-05-01';
  state.runtime.day = 7000;
  state.runtime.seasonDay = 300;
  const appeared = recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  assert.ok(appeared);

  state.date = '2041-05-08';
  state.runtime.day = 7007;
  state.runtime.seasonDay = 307;
  const noAppearance = recordOfficialMatchInPlace(state, { appeared: false, debutOccurred: false, injuryUnavailable: false });
  assert.ok(noAppearance);

  state.date = '2041-06-01';
  state.runtime.day = 7031;
  const before = structuredClone(state);
  const fact = buildLastProfessionalAppearanceFact(state);
  assert.deepEqual(state, before);
  assert.equal(fact.authority, 'sport.match_history');
  assert.equal(fact.fixtureId, appeared.id);
  assert.equal(fact.fixture, appeared.id);
  assert.equal(fact.date, '2041-05-01');
  assert.equal(fact.club, 'UDV');
  assert.equal(fact.competition, 'league');
  assert.equal(fact.opponent, appeared.opponent);
  assert.equal(fact.homeAway, appeared.homeAway);
  assert.equal(fact.started, appeared.player.started);
  assert.equal(fact.appeared, true);
  assert.equal(fact.minutes, appeared.player.minutes);
  assert.equal(fact.postAnnouncement, true);
  assert.equal(fact.result, null);
  assert.equal(fact.goals, null);
  assert.equal(fact.assists, null);
  assert.equal(fact.cards, null);
});

test('T5.36 final save/load preserves factual LastMatchFact exactly', () => {
  const state = createInitialState(536103);
  state.age = 39;
  state.phase = '34_plus';
  state.season = '2040-41';
  state.club = 'UDV';
  state.professional.registrationClub = 'UDV';
  state.professional.ownerClub = 'UDV';
  state.professional.nationalCaps = 41;
  state.sport.appearances = 317;
  state.world.maturityLongInjuryCount = 2;
  state.retirement.status = 'announced';
  state.retirement.decidedDate = '2041-03-10';
  state.retirement.announcedDate = '2041-03-17';
  state.retirement.decisionAge = 39;
  state.retirement.reason = 'voluntary';
  state.flags.RETIREMENT_ANNOUNCED = true;
  state.flags.RETIREMENT_WAS_ANNOUNCED = true;

  state.date = '2041-05-01';
  state.runtime.day = 7000;
  state.runtime.seasonDay = 300;
  const appeared = recordOfficialMatchInPlace(state, { appeared: true, debutOccurred: false, injuryUnavailable: false });
  assert.ok(appeared);
  state.date = '2041-06-01';
  state.runtime.day = 7031;
  closeCareer(state, 'voluntary', 'last_match_played');

  const summary = buildCareerSummary(state);
  const restored = loadSave(serializeSave(state));
  const restoredSummary = buildCareerSummary(restored);

  assert.equal(summary.terminal, true);
  assert.equal(summary.lastProfessionalAppearance.authority, 'sport.match_history');
  assert.equal(summary.lastProfessionalAppearance.fixtureId, appeared.id);
  assert.equal(summary.lastProfessionalAppearance.date, '2041-05-01');
  assert.equal(summary.lastProfessionalAppearance.result, null);
  assert.equal(summary.lastProfessionalAppearance.goals, null);
  assert.equal(summary.careerAppearances, 317);
  assert.equal(summary.nationalCaps, 41);
  assert.equal(summary.majorLongInjuries, 2);
  assert.ok(!summary.missingAuthoritativeFacts.includes('fixture identity'));
  assert.ok(summary.missingAuthoritativeFacts.includes('match result'));
  assert.deepEqual(restoredSummary, summary);
});

test('T5.36 career summary reports authoritative no-appearance when match store exists without an appearance', () => {
  const state = createInitialState(536104);
  state.age = 40;
  state.phase = '34_plus';
  state.date = '2041-05-01';
  state.runtime.day = 7000;
  recordOfficialMatchInPlace(state, { appeared: false, debutOccurred: false, injuryUnavailable: true });
  state.retirement.status = 'announced';
  state.retirement.reason = 'no_market';
  state.flags.RETIREMENT_ANNOUNCED = true;
  state.flags.RETIREMENT_WAS_ANNOUNCED = true;
  state.date = '2041-06-01';
  closeCareer(state, 'no_market', 'no_last_match');
  const summary = buildCareerSummary(state);
  assert.equal(summary.terminal, true);
  assert.equal(summary.lastProfessionalAppearance.observed, false);
  assert.equal(summary.lastProfessionalAppearance.authority, 'sport.match_history');
  assert.equal(summary.lastProfessionalAppearance.fixtureId, null);
  assert.equal(summary.lastProfessionalAppearance.date, null);
});
