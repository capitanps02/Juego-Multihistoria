import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import {
  contractEmploymentStatus,
  currentEmploymentClub,
  proposeCareerChange,
  respondToOffer
} from '../dist/simulation/offers.js';
import {
  getSportMatchModelStore,
  isOfficialMatchDay,
  nextScheduledFixture,
  remainingLeagueFixtures
} from '../dist/simulation/match-model.js';
import { getCurrentMatchContext, getSportContext } from '../dist/simulation/sport-context.js';
import { resolveCurrentClubInstitutionalNpc } from '../dist/simulation/npc-authority.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';

function unattached(seed = 8801) {
  const state = createInitialState(seed);
  state.age = 21;
  state.phase = '20_23';
  state.professional.initializedAt20 = true;
  state.contract.monthsRemaining = 0;
  return state;
}

test('legacy zero-month saves are immediately unattached without provenance rewrite or RNG use', () => {
  const state = unattached();
  const provenance = {
    club: state.club,
    ownerClub: state.professional.ownerClub,
    registrationClub: state.professional.registrationClub
  };
  const rng = structuredClone(state.rngState);

  assert.equal(contractEmploymentStatus(state), 'unattached');
  assert.equal(currentEmploymentClub(state), null);
  assert.deepEqual({
    club: state.club,
    ownerClub: state.professional.ownerClub,
    registrationClub: state.professional.registrationClub
  }, provenance);
  assert.deepEqual(state.rngState, rng);

  const restored = loadSave(serializeSave(state));
  assert.equal(contractEmploymentStatus(restored), 'unattached');
  assert.equal(currentEmploymentClub(restored), null);
  assert.deepEqual({
    club: restored.club,
    ownerClub: restored.professional.ownerClub,
    registrationClub: restored.professional.registrationClub
  }, provenance);
});

test('unattached state has no current club institution, fixture, training or match authority', () => {
  const state = unattached(8802);
  state.date = '2028-08-07';
  state.runtime.day = 7;

  assert.equal(resolveCurrentClubInstitutionalNpc(state), null);
  assert.equal(isOfficialMatchDay(state), false);
  assert.equal(nextScheduledFixture(state), null);
  assert.equal(remainingLeagueFixtures(state), 0);

  const sport = getSportContext(state);
  assert.equal(sport.sportingClub, null);
  assert.equal(sport.ownerClub, null);
  assert.equal(sport.leagueTier, null);
  assert.equal(sport.nextFixture, null);
  assert.equal(sport.isMatchDay, false);
  assert.equal(sport.isTrainingWindow, false);
  assert.equal(sport.remainingLeagueMatches, 0);
  assert.equal(sport.unavailableReason, 'unattached');
  assert.equal(getCurrentMatchContext(state).status, 'no_current_match');
});

test('unattached simulation produces no club appearances, match rows or former-club renewal', () => {
  const state = unattached(8803);
  state.date = '2028-02-01';
  state.runtime.day = 5;
  state.runtime.seasonDay = 190;
  state.sport.roleScore = 90;
  state.sport.form = 90;
  state.reputation.marketHeat = 90;
  const appearances = Number(state.sport.appearances);

  for (let day = 0; day < 60; day += 1) {
    advanceWorldDayInPlace(state);
    assert.equal(state.market?.pending?.reason === 'Renovación de contrato', false);
  }

  assert.equal(Number(state.sport.appearances), appearances);
  assert.equal(getSportMatchModelStore(state), null);
  assert.equal(contractEmploymentStatus(state), 'unattached');
  assert.equal(currentEmploymentClub(state), null);
  assert.equal(state.club, 'UDV', 'former club remains provenance only');
});

test('only accepting a formal CareerOffer restores current employment authority', () => {
  const state = unattached(8804);
  proposeCareerChange(state, 'Contrato como agente libre', draft => {
    draft.club = 'Destino FC';
    draft.professional.ownerClub = 'Destino FC';
    draft.professional.registrationClub = 'Destino FC';
    draft.professional.route = 'domestic';
    draft.contract.monthsRemaining = 24;
    draft.contract.salaryMonthly = 4200;
  });

  assert.ok(state.market.pending);
  assert.equal(currentEmploymentClub(state), null, 'proposal alone does not restore employment');
  const offer = structuredClone(state.market.pending);
  respondToOffer(state, offer.id, 'accept');

  assert.equal(contractEmploymentStatus(state), 'active_contract');
  assert.equal(currentEmploymentClub(state), 'Destino FC');
  assert.equal(state.club, 'Destino FC');
  assert.equal(state.professional.ownerClub, 'Destino FC');
  assert.equal(state.professional.registrationClub, 'Destino FC');
});
