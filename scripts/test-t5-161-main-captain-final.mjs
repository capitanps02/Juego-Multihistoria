import test from 'node:test';
import assert from 'node:assert/strict';

import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS } from '../dist/content/events/index.js';
import { resolveChoice } from '../dist/narrative/resolver.js';
import { narrativeCausalFacts } from '../dist/simulation/club-contract-intent.js';
import {
  listCertifiedPlayerClubLeadership,
  resolveCurrentPlayerClubLeadership
} from '../dist/simulation/player-leadership-authority.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

function state29(seed) {
  const state = createInitialState(seed);
  state.age = 29;
  state.phase = '26_30';
  state.date = '2037-09-15';
  return state;
}

function appointment() {
  const event = EVENTS.find(row => row.id === 'EVT_29_CAP_001');
  assert.ok(event, 'EVT_29_CAP_001 must be active after #161 closure');
  return event;
}

test('#161 activation preserves 388 unique events and retires only engine-only EVT_26_PRS_001', () => {
  assert.equal(EVENTS.length, 388);
  assert.equal(new Set(EVENTS.map(event => event.id)).size, 388);
  assert.equal(EVENTS.some(event => event.id === 'EVT_29_CAP_001'), true);
  assert.equal(EVENTS.some(event => event.id === 'EVT_26_PRS_001'), false);
  assert.equal(appointment().canonStatus, 'verified');
});

test('#161 proxies and non-accepting choices never create main-captain authority', () => {
  const state = state29(161001);
  state.professional.lockerPower = 100;
  state.reputation.prestige = 100;
  state.flags.CAPTAINCY_WINDOW = true;
  assert.equal(resolveCurrentPlayerClubLeadership(state), null);
  assert.equal(narrativeCausalFacts(state).playerClubLeadership.currentRole, null);

  const declined = resolveChoice(state, appointment(), 'DECLINE_MAIN_CAPTAIN').state;
  assert.equal(resolveCurrentPlayerClubLeadership(declined), null);

  const deferred = resolveChoice(state, appointment(), 'DEFER_MAIN_CAPTAIN').state;
  assert.equal(resolveCurrentPlayerClubLeadership(deferred), null);
});

test('#161 explicit acceptance certifies factual current-club main captain with provenance and save/load', () => {
  const state = state29(161002);
  const accepted = resolveChoice(state, appointment(), 'ACCEPT_MAIN_CAPTAIN').state;
  const row = resolveCurrentPlayerClubLeadership(accepted);
  assert.deepEqual(row, {
    clubId: accepted.club,
    role: 'captain',
    certifiedAt: accepted.date,
    sourceEventId: 'EVT_29_CAP_001',
    sourceChoiceId: 'ACCEPT_MAIN_CAPTAIN'
  });
  assert.equal(narrativeCausalFacts(accepted).playerClubLeadership.currentRole, 'captain');

  const restored = loadSave(serializeSave(accepted));
  assert.deepEqual(resolveCurrentPlayerClubLeadership(restored), row);
  assert.equal(narrativeCausalFacts(restored).playerClubLeadership.currentRole, 'captain');
});

test('#161 captain authority fails closed after club switch while factual history remains', () => {
  const accepted = resolveChoice(state29(161003), appointment(), 'ACCEPT_MAIN_CAPTAIN').state;
  const oldClub = accepted.club;
  accepted.club = 'NEW_CLUB';
  accepted.professional.ownerClub = accepted.club;
  accepted.professional.registrationClub = accepted.club;
  accepted.world.ownerClub = accepted.club;

  assert.equal(resolveCurrentPlayerClubLeadership(accepted), null);
  const history = listCertifiedPlayerClubLeadership(accepted);
  assert.equal(history.some(row =>
    row.clubId === oldClub
    && row.role === 'captain'
    && row.sourceEventId === 'EVT_29_CAP_001'
    && row.sourceChoiceId === 'ACCEPT_MAIN_CAPTAIN'
  ), true);
});
