import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import {
  certifyCoachChangeInPlace,
  resolveLatestCoachChange,
  resolveRecentCurrentClubCoachChange
} from '../dist/simulation/coach-change-authority.js';

function rngSnapshot(state) {
  return structuredClone(state.rngState);
}

test('legacy COACH_FIRED flag alone does not fabricate coach-change chronology', () => {
  const state = createInitialState(7401);
  state.flags.COACH_FIRED = true;
  const before = structuredClone(state);

  assert.equal(resolveLatestCoachChange(state), null);
  assert.equal(resolveRecentCurrentClubCoachChange(state, 120), null);
  assert.deepEqual(state, before, 'read-only resolver must not backfill legacy saves or consume RNG');
});

test('explicit coach change certifies exact current club/date/day/season without inventing identities', () => {
  const state = createInitialState(7402);
  state.date = '2039-08-12';
  state.season = '2039-40';
  state.runtime.day = 777;
  state.club = 'CLUB_TUR';
  state.professional.registrationClub = 'CLUB_TUR';

  const record = certifyCoachChangeInPlace(state, 'canonical_change');
  assert.deepEqual(record, {
    ordinal: 1,
    clubId: 'CLUB_TUR',
    date: '2039-08-12',
    day: 777,
    season: '2039-40',
    kind: 'canonical_change',
    previousCoachNpcId: null,
    newCoachNpcId: null
  });
  assert.deepEqual(resolveLatestCoachChange(state), record);
  assert.deepEqual(resolveRecentCurrentClubCoachChange(state, 30), record);
});

test('current-club resolver is recency and club scoped while historical chronology survives', () => {
  const state = createInitialState(7403);
  state.runtime.day = 300;
  const record = certifyCoachChangeInPlace(state, 'external_change');

  state.runtime.day = 331;
  assert.equal(resolveRecentCurrentClubCoachChange(state, 30), null, '31-day-old change is outside a 30-day window');
  assert.deepEqual(resolveLatestCoachChange(state), record);

  state.runtime.day = 305;
  state.club = 'CLUB_ALB';
  state.professional.registrationClub = 'CLUB_ALB';
  assert.equal(resolveRecentCurrentClubCoachChange(state, 90), null, 'old-club change must not become current after transfer');
  assert.deepEqual(resolveLatestCoachChange(state), record, 'historical chronology remains queryable');
});

test('coach-change authority survives save/load without heuristic migration', () => {
  const state = createInitialState(7404);
  state.runtime.day = 444;
  state.date = '2033-10-04';
  state.season = '2033-34';
  certifyCoachChangeInPlace(state, 'security_firing');

  const restored = loadSave(serializeSave(state));
  assert.deepEqual(resolveLatestCoachChange(restored), resolveLatestCoachChange(state));
  assert.deepEqual(resolveRecentCurrentClubCoachChange(restored, 90), resolveRecentCurrentClubCoachChange(state, 90));
});

test('coach-change resolvers are read-only and 0 RNG', () => {
  const state = createInitialState(7405);
  certifyCoachChangeInPlace(state, 'canonical_change');
  const beforeState = structuredClone(state);
  const beforeRng = rngSnapshot(state);

  resolveLatestCoachChange(state);
  resolveRecentCurrentClubCoachChange(state, 45);

  assert.deepEqual(rngSnapshot(state), beforeRng);
  assert.deepEqual(state, beforeState);
});

test('the existing simulator firing transition records chronology when it actually occurs', () => {
  const state = createInitialState(7406);
  state.world.coachSecurity = 0;
  state.flags.COACH_FIRED = false;

  let record = null;
  for (let day = 0; day < 500 && !record; day += 1) {
    advanceWorldDayInPlace(state);
    record = resolveLatestCoachChange(state);
  }

  assert.equal(state.flags.COACH_FIRED, true, 'fixture must reach the existing firing transition');
  assert.ok(record, 'real firing transition must produce chronology');
  assert.equal(record.kind, 'security_firing');
  assert.equal(record.clubId, state.club);
  assert.equal(record.date, state.date);
  assert.equal(record.day, state.runtime.day);
  assert.equal(record.previousCoachNpcId, null, 'shared authority must not infer a named previous coach');
  assert.equal(record.newCoachNpcId, null, 'shared authority must keep replacement generic without canon');
});
