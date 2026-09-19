import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { narrativeCausalFacts } from '../dist/simulation/club-contract-intent.js';
import {
  getInjuryEpisodeStore,
  inspectInjuryEpisodeStore,
  linkFirstPostReturnAppearanceInPlace,
  recordInjuryClearanceInPlace,
  recordInjuryEpisodeStartInPlace,
  resolveInjuryEpisodeFacts
} from '../dist/simulation/injury-episode-authority.js';
import { recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

function findRealInjury() {
  for (let seed = 20000; seed < 20040; seed += 1) {
    const state = createInitialState(seed);
    state.body.risk = 100;
    for (let day = 0; day < 120; day += 1) {
      advanceWorldDayInPlace(state);
      const store = getInjuryEpisodeStore(state);
      if (store?.episodes.length) return state;
    }
  }
  throw new Error('No factual injury transition found in directed deterministic range');
}

function officialMatchState(seed = 20100) {
  const state = createInitialState(seed);
  state.date = '2026-08-05';
  state.season = '2026-27';
  state.runtime.day = 35;
  state.runtime.seasonDay = 35;
  return state;
}

test('injury authority/1 real world injury transition writes exactly one factual episode', () => {
  const state = findRealInjury();
  const store = getInjuryEpisodeStore(state);
  assert.ok(store);
  assert.equal(store.episodes.length, 1);
  const episode = store.episodes[0];
  assert.equal(episode.source, 'world_injury_transition');
  assert.equal(episode.startDate, state.date);
  assert.ok(episode.plannedRecoveryWeeks > 0);
  assert.equal(episode.severity, state.flags.LONG_INJURY === true ? 'long' : 'standard');
  assert.equal(episode.clearanceDate, null);
});

test('injury authority/2 aggregate counters and risk alone never materialize an episode', () => {
  const state = createInitialState(20041);
  state.body.risk = 100;
  state.body.fatigue = 100;
  state.world.maturityInjuryCount = 9;
  state.world.maturityLongInjuryCount = 4;
  const before = structuredClone(state.rngState);
  assert.deepEqual(resolveInjuryEpisodeFacts(state), {
    episodeCount: 0,
    latestEpisodeId: null,
    latestSeverity: null,
    latestStartDate: null,
    latestClearanceDate: null,
    latestReturnFixtureId: null,
    latestReturnDate: null,
    latestReturnMinutes: null,
    latestLongEpisodeId: null,
    latestLongCleared: false,
    latestLongReturnFixtureId: null
  });
  assert.deepEqual(state.rngState, before);
  assert.equal(state.world.injuryEpisodes, undefined);
});

test('injury authority/3 recovery closes the same real episode deterministically', () => {
  const state = findRealInjury();
  const episodeId = getInjuryEpisodeStore(state).episodes[0].episodeId;
  for (let day = 0; day < 180; day += 1) {
    advanceWorldDayInPlace(state);
    const episode = getInjuryEpisodeStore(state)?.episodes.find(row => row.episodeId === episodeId);
    if (episode?.clearanceDate) {
      assert.ok(episode.clearanceRuntimeDay >= episode.startRuntimeDay);
      assert.equal(getInjuryEpisodeStore(state).episodes.filter(row => row.episodeId === episodeId).length, 1);
      return;
    }
  }
  assert.fail('The factual injury episode did not clear inside its planned recovery horizon');
});

test('injury authority/4 active episode survives save/load without synthetic backfill', () => {
  const state = findRealInjury();
  const before = structuredClone(state.world.injuryEpisodes);
  const restored = loadSave(serializeSave(state));
  assert.deepEqual(restored.world.injuryEpisodes, before);
  assert.deepEqual(resolveInjuryEpisodeFacts(restored), resolveInjuryEpisodeFacts(state));

  const legacy = createInitialState(20042);
  delete legacy.world.injuryEpisodes;
  const legacyRestored = loadSave(serializeSave(legacy));
  assert.equal(legacyRestored.world.injuryEpisodes, undefined);
  assert.equal(resolveInjuryEpisodeFacts(legacyRestored).episodeCount, 0);
});

test('injury authority/5 first post-clearance appearance links exact official fixture once', () => {
  const state = officialMatchState(20043);
  const started = recordInjuryEpisodeStartInPlace(state, 12, 'long');
  assert.ok(started);
  state.runtime.day += 14;
  state.date = '2026-08-19';
  const cleared = recordInjuryClearanceInPlace(state);
  assert.equal(cleared?.episodeId, started.episodeId);

  state.runtime.day = 56;
  state.runtime.seasonDay = 56;
  state.date = '2026-08-26';
  const match = recordOfficialMatchInPlace(state, {
    appeared: true,
    debutOccurred: false,
    injuryUnavailable: false
  });
  assert.ok(match);
  const linked = linkFirstPostReturnAppearanceInPlace(state, match);
  assert.equal(linked?.firstReturnFixtureId, match.id);
  assert.equal(linked?.firstReturnMinutes, match.player.minutes);
  assert.deepEqual(linkFirstPostReturnAppearanceInPlace(state, match), null, 'first return link is single-shot');
  assert.equal(narrativeCausalFacts(state).injuryEpisodes.latestLongReturnFixtureId, match.id);
  assert.doesNotThrow(() => serializeSave(state));
});

test('injury authority/6 club change preserves episode origin while return can occur for new club', () => {
  const state = officialMatchState(20044);
  const episode = recordInjuryEpisodeStartInPlace(state, 4, 'standard');
  assert.ok(episode);
  state.runtime.day += 7;
  state.date = '2026-08-12';
  recordInjuryClearanceInPlace(state);
  state.club = 'TRANSFER_FC';
  state.professional.ownerClub = 'TRANSFER_FC';
  state.professional.registrationClub = 'TRANSFER_FC';

  state.runtime.day = 49;
  state.runtime.seasonDay = 49;
  state.date = '2026-08-19';
  const match = recordOfficialMatchInPlace(state, {
    appeared: true,
    debutOccurred: false,
    injuryUnavailable: false
  });
  assert.ok(match);
  linkFirstPostReturnAppearanceInPlace(state, match);
  const stored = getInjuryEpisodeStore(state).episodes[0];
  assert.equal(stored.registrationClub, 'UDV');
  assert.equal(stored.firstReturnFixtureId, match.id);
  assert.equal(match.club, 'TRANSFER_FC');
});

test('injury authority/7 malformed chronology or fake return fixture fails save validation', () => {
  const state = officialMatchState(20045);
  state.world.injuryEpisodes = {
    version: 1,
    episodes: [{
      episodeId: 'BROKEN',
      startDate: '2026-08-05',
      startRuntimeDay: 35,
      season: state.season,
      registrationClub: 'UDV',
      severity: 'long',
      plannedRecoveryWeeks: 12,
      clearanceDate: '2026-08-12',
      clearanceRuntimeDay: 42,
      firstReturnFixtureId: 'fixture:fake',
      firstReturnDate: '2026-08-19',
      firstReturnMinutes: 45,
      source: 'world_injury_transition'
    }]
  };
  assert.ok(inspectInjuryEpisodeStore(state.world.injuryEpisodes, state));
  assert.throws(() => serializeSave(state));
});

test('injury authority/8 factual readers consume zero RNG and mutate zero state', () => {
  const state = officialMatchState(20046);
  recordInjuryEpisodeStartInPlace(state, 5, 'standard');
  const before = structuredClone(state);
  resolveInjuryEpisodeFacts(state);
  narrativeCausalFacts(state).injuryEpisodes;
  assert.deepEqual(state, before);
});
