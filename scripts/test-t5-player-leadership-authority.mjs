import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import {
  assertPlayerClubLeadershipAuthority,
  certifyPlayerClubLeadershipInPlace,
  certifyPlayerLeadershipSuccessorInPlace,
  clearPlayerClubLeadershipInPlace,
  listCertifiedPlayerClubLeadership,
  resolveCertifiedPlayerLeadershipSuccessor,
  resolveCurrentPlayerClubLeadership
} from '../dist/simulation/player-leadership-authority.js';

function rngSnapshot(state) {
  return structuredClone(state.rngState);
}

test('leadership authority fails closed and ignores influence, window, seeds and reputation proxies', () => {
  const state = createInitialState(7201);
  state.professional.lockerPower = 100;
  state.flags.CAPTAINCY_WINDOW = true;
  state.flags.HAS_SEED_CAPTAINCY_STYLE = true;
  state.flags.HAS_SEED_FIRST_CAPTAIN_ROOM = true;
  state.reputation.prestige = 100;
  const before = structuredClone(state);

  assert.equal(resolveCurrentPlayerClubLeadership(state), null);
  assert.deepEqual(listCertifiedPlayerClubLeadership(state), []);
  assert.equal(resolveCertifiedPlayerLeadershipSuccessor(state), null);
  assert.deepEqual(state, before, 'read-only authority checks must not mutate state or consume RNG');
});

test('formal leadership certification distinguishes captain group, secondary captain and captain', () => {
  const state = createInitialState(7202);
  const beforeRng = rngSnapshot(state);

  certifyPlayerClubLeadershipInPlace(state, 'captain_group', 'EVT_25_CAP_001', 'A');
  assert.deepEqual(resolveCurrentPlayerClubLeadership(state), {
    clubId: 'UDV',
    role: 'captain_group',
    certifiedAt: state.date,
    sourceEventId: 'EVT_25_CAP_001',
    sourceChoiceId: 'A'
  });

  certifyPlayerClubLeadershipInPlace(state, 'secondary_captain', 'EVT_25_CAP_001', 'C');
  assert.equal(resolveCurrentPlayerClubLeadership(state)?.role, 'secondary_captain');
  assert.deepEqual(listCertifiedPlayerClubLeadership(state).map(row => row.role), ['captain_group', 'secondary_captain']);

  certifyPlayerClubLeadershipInPlace(state, 'captain', 'TEST_FORMAL_APPOINTMENT', 'ACCEPT');
  assert.equal(resolveCurrentPlayerClubLeadership(state)?.role, 'captain');
  assert.deepEqual(rngSnapshot(state), beforeRng, 'leadership writes must not consume RNG');
});

test('save/load preserves explicit leadership authority without heuristic migration', () => {
  const state = createInitialState(7203);
  certifyPlayerClubLeadershipInPlace(state, 'secondary_captain', 'EVT_25_CAP_001', 'C');
  const restored = loadSave(serializeSave(state));

  assert.deepEqual(resolveCurrentPlayerClubLeadership(restored), resolveCurrentPlayerClubLeadership(state));
  assert.deepEqual(restored.world.playerClubLeadershipAuthority, state.world.playerClubLeadershipAuthority);
});

test('club change invalidates current leadership without erasing historical certification', () => {
  const state = createInitialState(7204);
  certifyPlayerClubLeadershipInPlace(state, 'captain_group', 'EVT_25_CAP_001', 'A');
  const beforeRng = rngSnapshot(state);

  state.club = 'NEW_CLUB';
  assert.equal(resolveCurrentPlayerClubLeadership(state), null);
  assert.deepEqual(listCertifiedPlayerClubLeadership(state).map(row => [row.clubId, row.role]), [['UDV', 'captain_group']]);
  assert.deepEqual(rngSnapshot(state), beforeRng);
});

test('explicit renunciation terminates the current role and preserves history', () => {
  const state = createInitialState(7205);
  certifyPlayerClubLeadershipInPlace(state, 'secondary_captain', 'EVT_25_CAP_001', 'C');
  clearPlayerClubLeadershipInPlace(state, 'renounced');

  assert.equal(resolveCurrentPlayerClubLeadership(state), null);
  assert.deepEqual(listCertifiedPlayerClubLeadership(state).map(row => row.role), ['secondary_captain']);
  const store = state.world.playerClubLeadershipAuthority;
  assert.equal(store.currentLeadership, null);
  assert.equal(store.history[0].endReason, 'renounced');
  assert.equal(store.history[0].endedAt, state.date);
});

test('named successor fails closed until an explicit same-club active NPC is certified', () => {
  const state = createInitialState(7206);
  state.relationships.find(row => row.npcId === 'NPC_PLR_10').trust = 100;
  state.relationships.find(row => row.npcId === 'NPC_PLR_11').affinity = 100;
  assert.equal(resolveCertifiedPlayerLeadershipSuccessor(state), null);

  certifyPlayerLeadershipSuccessorInPlace(state, 'NPC_PLR_10', 'TEST_SUCCESSION', 'NAME_TOMAS');
  assert.equal(resolveCertifiedPlayerLeadershipSuccessor(state), 'NPC_PLR_10');

  state.club = 'NEW_CLUB';
  assert.equal(resolveCertifiedPlayerLeadershipSuccessor(state), null, 'successor identity must not follow the protagonist across clubs');
});

test('off-club or inactive NPC cannot be certified as successor', () => {
  const state = createInitialState(7207);
  const npc = state.npcs.find(row => row.id === 'NPC_PLR_10');
  npc.club = 'OTHER_CLUB';
  assert.throws(
    () => certifyPlayerLeadershipSuccessorInPlace(state, 'NPC_PLR_10', 'TEST_SUCCESSION', 'INVALID'),
    /Cannot certify missing, inactive or off-club leadership successor/
  );
});

test('malformed persisted leadership authority is rejected by the authority boundary', () => {
  const state = createInitialState(7208);
  state.world.playerClubLeadershipAuthority = {
    version: 1,
    currentLeadership: {
      clubId: 'UDV',
      role: 'captain',
      certifiedAt: state.date,
      sourceEventId: 'EVT_BAD',
      sourceChoiceId: 'A',
      inferredFromLockerPower: true
    },
    history: [],
    successor: null
  };

  assert.throws(
    () => assertPlayerClubLeadershipAuthority(state.world.playerClubLeadershipAuthority, state.date),
    /fields do not match schema v1/
  );
  assert.throws(
    () => resolveCurrentPlayerClubLeadership(state),
    /Invalid player club leadership authority/
  );
});
