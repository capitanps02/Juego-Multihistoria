import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { buildCareerSummary } from '../dist/epilogue/career-summary.js';
import { closeCareer } from '../dist/simulation/late-career-engine.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

test('T5.36 career summary is read-only and does not fabricate unavailable match facts', () => {
  const state = createInitialState(536101);
  const before = structuredClone(state);
  const summary = buildCareerSummary(state);
  assert.deepEqual(state, before);
  assert.equal(summary.terminal, false);
  assert.equal(summary.retirementStatus, 'playing');
  assert.equal(summary.lastProfessionalAppearance.observed, false);
  assert.equal(summary.lastProfessionalAppearance.fixture, null);
  assert.equal(summary.lastProfessionalAppearance.minutes, null);
  assert.equal(summary.careerGoals, null);
  assert.equal(summary.majorTrophies, null);
  assert.ok(summary.missingAuthoritativeFacts.includes('fixture identity'));
});

test('T5.36 final save/load preserves the facts needed to rebuild the same terminal summary', () => {
  const state = createInitialState(536102);
  state.age = 39;
  state.phase = '34_plus';
  state.season = '2040-41';
  state.club = 'UDV';
  state.professional.registrationClub = 'UDV';
  state.professional.ownerClub = 'UDV';
  state.professional.nationalCaps = 41;
  state.sport.appearances = 317;
  state.world.maturityLongInjuryCount = 2;
  state.history = Array.from({ length: 8 }, (_, index) => {
    const startYear = 2033 + index;
    return {
      eventId: `TEST_CAREER_${index + 1}`,
      date: `${startYear}-07-01`,
      season: `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`,
      choiceId: 'CONTINUE',
      outcomeId: 'RECORDED',
      club: 'UDV',
      snapshot: {},
      salience: 10,
      visibility: 'private'
    };
  });
  state.retirement.status = 'announced';
  state.retirement.decidedDate = '2041-03-10';
  state.retirement.announcedDate = '2041-03-17';
  state.retirement.decisionAge = 39;
  state.retirement.reason = 'voluntary';
  state.flags.RETIREMENT_ANNOUNCED = true;
  state.flags.RETIREMENT_WAS_ANNOUNCED = true;
  state.flags.LAST_MATCH_PLAYED = true;
  state.world.retirementLastAppearanceDate = '2041-05-22';
  state.date = '2041-06-30';

  closeCareer(state, 'voluntary', 'last_match_played');
  const summary = buildCareerSummary(state);
  const restored = loadSave(serializeSave(state));
  const restoredSummary = buildCareerSummary(restored);

  assert.equal(summary.terminal, true);
  assert.equal(state.epilogue.generated, true);
  assert.ok(state.epilogue.families.length >= 2);
  assert.equal(summary.lastProfessionalAppearance.authority, 'sport.appearances_delta');
  assert.equal(summary.lastProfessionalAppearance.date, '2041-05-22');
  assert.equal(summary.lastProfessionalAppearance.fixture, null);
  assert.equal(summary.careerAppearances, 317);
  assert.equal(summary.nationalCaps, 41);
  assert.equal(summary.majorLongInjuries, 2);
  assert.deepEqual(restoredSummary, summary);
});

test('T5.36 career summary reports no last appearance when retirement closes without one', () => {
  const state = createInitialState(536103);
  state.age = 40;
  state.phase = '34_plus';
  state.retirement.status = 'announced';
  state.retirement.reason = 'no_market';
  state.flags.RETIREMENT_ANNOUNCED = true;
  state.flags.RETIREMENT_WAS_ANNOUNCED = true;
  state.flags.LAST_MATCH_PLAYED = false;
  closeCareer(state, 'no_market', 'no_last_match');
  const summary = buildCareerSummary(state);
  assert.equal(summary.terminal, true);
  assert.equal(summary.lastProfessionalAppearance.observed, false);
  assert.equal(summary.lastProfessionalAppearance.authority, 'none');
  assert.equal(summary.lastProfessionalAppearance.date, null);
});
