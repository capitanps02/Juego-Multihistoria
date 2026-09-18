import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';

const PENDING_CANONICAL_WRITERS = Object.freeze({
  SEED_FALSE_ULTIMATUM: 'EVT_30_PRS_001',
  SEED_NATIONAL_ABSENCE: 'EVT_30_NAT_002',
  SEED_SPECIALIST_BIGCLUB: 'EVT_30_JAN_001'
});

const producingActions = new Set(['create', 'activate', 'intensify', 'transform']);

function seedWriters(seedId) {
  return EVENTS.filter(event =>
    (event.outcomes ?? []).some(outcome =>
      (outcome.seedTransitions ?? []).some(transition =>
        transition.seedId === seedId && producingActions.has(transition.action)
      )
    )
  ).map(event => event.id);
}

test('SEED_ROLE_COMMUNICATION now has exactly its canonical EVT_30_CCH_001 writer', () => {
  assert.deepEqual(seedWriters('SEED_ROLE_COMMUNICATION'), ['EVT_30_CCH_001']);
  assert.equal(EVENTS.some(event => event.id === 'EVT_30_CCH_001'), true);
});

test('the remaining three orphan seeds stay unwired until their canonical scenes exist', () => {
  for (const [seedId, canonicalEventId] of Object.entries(PENDING_CANONICAL_WRITERS)) {
    assert.deepEqual(
      seedWriters(seedId),
      [],
      `${seedId} must not be attached to a generic/legacy producer before ${canonicalEventId} is implemented`
    );
    assert.equal(
      EVENTS.some(event => event.id === canonicalEventId),
      false,
      `${canonicalEventId} remains a coordinated canonical addition`
    );
  }
});

test('pending orphan seed ownership remains one-to-one', () => {
  const canonicalIds = Object.values(PENDING_CANONICAL_WRITERS);
  assert.equal(new Set(canonicalIds).size, canonicalIds.length);
  assert.equal(Object.keys(PENDING_CANONICAL_WRITERS).length, 3);
});
