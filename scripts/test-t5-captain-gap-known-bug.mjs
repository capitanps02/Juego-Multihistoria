import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_30_34 } from '../dist/content/events/30_34/index.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import {
  certifyPlayerClubLeadershipInPlace,
  resolveCurrentPlayerClubLeadership
} from '../dist/simulation/player-leadership-authority.js';

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

function productionCaptainWriterCallsites() {
  const root = path.resolve('src');
  const out = [];
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(full);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.ts')) continue;
      const rel = path.relative(process.cwd(), full).replaceAll('\\', '/');
      if (rel === 'src/simulation/player-leadership-authority.ts') continue;
      const source = fs.readFileSync(full, 'utf8');
      if (/certifyPlayerClubLeadershipInPlace\s*\(/.test(source)) out.push(rel);
    }
  }
  visit(root);
  return out.sort();
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

test('T5-QA-030b/#161: final T5 requires at least one production main-captain writer callsite', () => {
  const callsites = productionCaptainWriterCallsites();
  assert.ok(
    callsites.length > 0,
    'no production call-site certifies explicit main-club captain authority; consumer-only gating is not enough'
  );
});

test('T5-QA-030c/#161: captain authority preserves provenance/save-load and never follows a club switch', () => {
  const state = age33September(161005);
  const beforeRng = structuredClone(state.rngState);

  certifyPlayerClubLeadershipInPlace(state, 'captain', 'QA_EXPLICIT_CAPTAIN_APPOINTMENT', 'ACCEPT');
  assert.deepEqual(resolveCurrentPlayerClubLeadership(state), {
    clubId: state.club,
    role: 'captain',
    certifiedAt: state.date,
    sourceEventId: 'QA_EXPLICIT_CAPTAIN_APPOINTMENT',
    sourceChoiceId: 'ACCEPT'
  });

  const restored = loadSave(serializeSave(state));
  assert.deepEqual(resolveCurrentPlayerClubLeadership(restored), resolveCurrentPlayerClubLeadership(state));
  assert.deepEqual(restored.rngState, beforeRng, 'captain authority save/load must consume 0 RNG');

  restored.club = 'NEW_CLUB';
  restored.professional.ownerClub = 'NEW_CLUB';
  restored.professional.registrationClub = 'NEW_CLUB';
  assert.equal(
    resolveCurrentPlayerClubLeadership(restored),
    null,
    'captaincy from the previous club must not follow the protagonist'
  );

  const switched = loadSave(serializeSave(restored));
  assert.equal(resolveCurrentPlayerClubLeadership(switched), null, 'save/load must not retroactively promote captaincy at the new club');
  const historical = switched.world.playerClubLeadershipAuthority?.currentLeadership;
  assert.equal(historical?.clubId, state.club, 'historical provenance must remain bound to the original club');
  assert.equal(historical?.sourceEventId, 'QA_EXPLICIT_CAPTAIN_APPOINTMENT');
  assert.equal(historical?.sourceChoiceId, 'ACCEPT');
  assert.deepEqual(switched.rngState, beforeRng);
});
