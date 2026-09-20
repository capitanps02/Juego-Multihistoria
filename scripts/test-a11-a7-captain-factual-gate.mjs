import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { narrativeCausalFacts } from '../dist/simulation/club-contract-intent.js';
import { certifyPlayerClubLeadershipInPlace } from '../dist/simulation/player-leadership-authority.js';
import { CANONICAL_REIMPLEMENTATIONS_33A } from '../dist/content/events/30_34/canonical-reimplementations-33a.js';

const event = CANONICAL_REIMPLEMENTATIONS_33A.find(row => row.id === 'EVT_33_CAP_001');
assert.ok(event);

function state33(seed) {
  const state = createInitialState(seed);
  state.age = 33;
  state.phase = '30_34';
  state.date = '2041-09-15';
  state.club = 'CURRENT_CLUB';
  state.professional.ownerClub = state.club;
  state.professional.registrationClub = state.club;
  state.world.ownerClub = state.club;
  return state;
}

test('A7 EVT_33_CAP_001 uses only factual current-club captain authority', () => {
  assert.deepEqual(event.gates, [
    { path: 'facts.playerClubLeadership.currentRole', op: 'eq', value: 'captain' }
  ]);

  const none = state33(733001);
  none.professional.successionPressure = 100;
  none.professional.lockerPower = 100;
  none.reputation.prestige = 100;
  none.flags.CAPTAINCY_WINDOW = true;
  assert.equal(eventGatesPass(none, event), false);
  assert.equal(narrativeCausalFacts(none).playerClubLeadership.currentRole, null);

  const group = state33(733002);
  certifyPlayerClubLeadershipInPlace(group, 'captain_group', 'TEST_GROUP', 'A');
  assert.equal(eventGatesPass(group, event), false);
  assert.equal(narrativeCausalFacts(group).playerClubLeadership.currentRole, 'captain_group');

  const secondary = state33(733003);
  certifyPlayerClubLeadershipInPlace(secondary, 'secondary_captain', 'TEST_SECONDARY', 'C');
  assert.equal(eventGatesPass(secondary, event), false);
  assert.equal(narrativeCausalFacts(secondary).playerClubLeadership.currentRole, 'secondary_captain');

  const captain = state33(733004);
  certifyPlayerClubLeadershipInPlace(captain, 'captain', 'TEST_CAPTAIN', 'ACCEPT');
  assert.equal(eventGatesPass(captain, event), true);
  assert.equal(narrativeCausalFacts(captain).playerClubLeadership.currentRole, 'captain');

  captain.club = 'NEW_CLUB';
  captain.professional.ownerClub = captain.club;
  captain.professional.registrationClub = captain.club;
  captain.world.ownerClub = captain.club;
  assert.equal(eventGatesPass(captain, event), false);
  assert.equal(narrativeCausalFacts(captain).playerClubLeadership.currentRole, null);
});

test('A7 factual captain reads are read-only and consume no RNG', () => {
  const state = state33(733005);
  certifyPlayerClubLeadershipInPlace(state, 'captain', 'TEST_CAPTAIN', 'ACCEPT');
  const before = structuredClone(state);
  narrativeCausalFacts(state);
  eventGatesPass(state, event);
  assert.deepEqual(state, before);
});
