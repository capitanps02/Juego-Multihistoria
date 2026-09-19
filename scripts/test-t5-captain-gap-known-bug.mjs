import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_30_34 } from '../dist/content/events/30_34/index.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { certifyPlayerClubLeadershipInPlace } from '../dist/simulation/player-leadership-authority.js';

function age33September(seed) {
  const state = createInitialState(seed);
  state.age = 33;
  state.phase = '30_34';
  state.date = '2041-09-15';
  return state;
}

function capEvent() {
  const event = EVENTS_30_34.find(row => row.id === 'EVT_33_CAP_001');
  assert.ok(event, 'EVT_33_CAP_001 must exist in the active 30-34 deck');
  return event;
}

function scheduled(state) {
  return scheduleEvent(state, [capEvent()], { ignoreRhythmGate: true });
}

test('T5-QA-030/#161: EVT_33_CAP_001 fails closed without real main-club captain authority', () => {
  const cases = [];

  const none = age33September(161001);
  cases.push(['no leadership authority', none]);

  const proxies = age33September(161002);
  proxies.professional.lockerPower = 100;
  proxies.reputation.prestige = 100;
  proxies.flags.CAPTAINCY_WINDOW = true;
  proxies.flags.HAS_SEED_CAPTAINCY_STYLE = true;
  proxies.flags.HAS_SEED_FIRST_CAPTAIN_ROOM = true;
  cases.push(['proxy-only authority', proxies]);

  const group = age33September(161003);
  certifyPlayerClubLeadershipInPlace(group, 'captain_group', 'EVT_25_CAP_001', 'A');
  cases.push(['captain_group only', group]);

  const secondary = age33September(161004);
  certifyPlayerClubLeadershipInPlace(secondary, 'secondary_captain', 'EVT_25_CAP_001', 'C');
  cases.push(['secondary_captain only', secondary]);

  for (const [label, state] of cases) {
    const before = structuredClone(state);
    assert.equal(
      scheduled(state),
      null,
      `${label} must not satisfy canonical main-captain premise`
    );
    assert.deepEqual(state, before, `${label} check must not mutate state`);
  }
});
