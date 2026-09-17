import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';

const ORPHAN_CANONICAL_WRITERS = Object.freeze({
  SEED_ROLE_COMMUNICATION: 'EVT_30_CCH_001',
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

test('the four 30-34 orphan seeds stay unwired until their canonical missing scenes exist', () => {
  for (const [seedId, canonicalEventId] of Object.entries(ORPHAN_CANONICAL_WRITERS)) {
    assert.deepEqual(
      seedWriters(seedId),
      [],
      `${seedId} must not be attached to a generic/legacy producer before ${canonicalEventId} is implemented`
    );
    assert.equal(
      EVENTS.some(event => event.id === canonicalEventId),
      false,
      `${canonicalEventId} is still a coordinated canonical-missing addition; update this guard only with its migration batch`
    );
  }
});

test('orphan seed ownership is one-to-one and does not silently alias missing scenes', () => {
  const canonicalIds = Object.values(ORPHAN_CANONICAL_WRITERS);
  assert.equal(new Set(canonicalIds).size, canonicalIds.length);
  assert.equal(Object.keys(ORPHAN_CANONICAL_WRITERS).length, 4);
});
