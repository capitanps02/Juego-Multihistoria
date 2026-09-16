import test from 'node:test';
import assert from 'node:assert/strict';
import { applyMigrationRouteInPlace } from '../dist/session/content-migration.js';

const clone = value => structuredClone(value);

function seed(overrides = {}) {
  return {
    id: 'SEED_NANO_SHADOW',
    state: 'active',
    intensity: 73,
    originEvent: 'EVT_LEGACY_ORIGIN',
    originSeason: '2025-26',
    npcRefs: ['NPC_PLR_12'],
    payload: { marker: 'preserve', nested: { value: 7 } },
    expiresAfter: '2027-06-30',
    lastTouchedDate: '2026-05-10',
    ...overrides
  };
}

function minimalState() {
  return {
    history: [
      { eventId: 'EVT_LEGACY_ORIGIN', choiceId: 'A', outcomeId: 'A_OUT', date: '2026-05-10', season: '2025-26', club: 'UDV' }
    ],
    flags: {
      HAS_SEED_NANO_SHADOW: true,
      UNRELATED_FLAG: true
    },
    eventCooldowns: {
      EVT_LEGACY_ORIGIN: 123
    },
    rngState: {
      narrative: { seed: 11, state: 22, draws: 33 },
      football: { seed: 44, state: 55, draws: 66 },
      market: { seed: 77, state: 88, draws: 99 }
    },
    seeds: [
      seed(),
      seed({ state: 'resolved', intensity: 41, consumedBy: 'EVT_OLD_CONSUMER', lastTouchedDate: '2026-06-01' }),
      seed({ originEvent: 'EVT_OTHER_ORIGIN', payload: { marker: 'other-origin' } }),
      seed({ id: 'SEED_RIVAS_TRUST', originEvent: 'EVT_LEGACY_ORIGIN', payload: { marker: 'other-seed' } })
    ]
  };
}

function route(rewriteExisting) {
  return {
    sourceContentIdentity: 'legacy-content',
    targetContentIdentity: 'canonical-content',
    seedOriginMappings: [{
      seedId: 'SEED_NANO_SHADOW',
      fromEventId: 'EVT_LEGACY_ORIGIN',
      toEventId: 'EVT_CANONICAL_ORIGIN',
      rewriteExisting
    }]
  };
}

test('seed origin migration: rewriteExisting=false preserves the complete state byte-for-byte equivalent', () => {
  const state = minimalState();
  const before = clone(state);

  applyMigrationRouteInPlace(state, route(false));

  assert.deepEqual(state, before);
});

test('seed origin migration: rewriteExisting=true rewrites only exact seed+origin matches and is idempotent', () => {
  const state = minimalState();
  const before = clone(state);

  applyMigrationRouteInPlace(state, route(true));

  const expected = clone(before);
  expected.seeds[0].originEvent = 'EVT_CANONICAL_ORIGIN';
  expected.seeds[1].originEvent = 'EVT_CANONICAL_ORIGIN';

  assert.deepEqual(state, expected);

  // Explicit rewrite changes provenance only. Live/terminal state, payload, dates,
  // consumedBy, intensity, flags, history, cooldowns and RNG must remain factual.
  assert.deepEqual(state.seeds[0], { ...before.seeds[0], originEvent: 'EVT_CANONICAL_ORIGIN' });
  assert.deepEqual(state.seeds[1], { ...before.seeds[1], originEvent: 'EVT_CANONICAL_ORIGIN' });
  assert.deepEqual(state.seeds[2], before.seeds[2]);
  assert.deepEqual(state.seeds[3], before.seeds[3]);
  assert.deepEqual(state.history, before.history);
  assert.deepEqual(state.flags, before.flags);
  assert.deepEqual(state.eventCooldowns, before.eventCooldowns);
  assert.deepEqual(state.rngState, before.rngState);

  const once = clone(state);
  applyMigrationRouteInPlace(state, route(true));
  assert.deepEqual(state, once);
});
