import assert from 'node:assert/strict';
import test from 'node:test';
import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import { validateEvents } from '../dist/narrative/validate.js';
import { CONTENT_MIGRATION_ROUTES, T51_AGE18_AUTHORITY_CONTENT_IDENTITY, T51_A5_POST_J_CONTENT_IDENTITY, findMigrationRoute } from '../dist/session/content-migration.js';

const IDS = [
  'CEVT_18_PLAYOFF_01',
  'EVT_20_BRIDGE_001',
  'EVT_20_CCH_001',
  'EVT_21_SOC_001',
  'EVT_21_PRS_002'
];

test('A5 post-J activates exactly one definition for each certified scene', () => {
  for (const id of IDS) {
    const rows = EVENTS.filter(event => event.id === id);
    assert.equal(rows.length, 1, id);
    assert.ok(rows[0].tags?.includes('a5_post_j'), id);
  }
});

test('A5 post-J keeps the five-scene batch finite', () => {
  const active = EVENTS.filter(event => event.tags?.includes('a5_post_j')).map(event => event.id).sort();
  assert.deepEqual(active, [...IDS].sort());
});

test('A5 post-J leaves the active catalog structurally valid', () => {
  const errors = validateEvents(EVENTS).filter(issue => issue.level === 'error');
  assert.deepEqual(errors, []);
});

const identity = await contentIdentity(EVENTS);
assert.equal(identity, T51_A5_POST_J_CONTENT_IDENTITY);
assert.equal(identity, '4fcc0855296617a312a41fab9ac3ff8d97ef1901e4ae7a8a5cd0b315dd19dca4');
const route = findMigrationRoute(T51_AGE18_AUTHORITY_CONTENT_IDENTITY, T51_A5_POST_J_CONTENT_IDENTITY, CONTENT_MIGRATION_ROUTES);
assert.ok(route, 'missing adjacent J->K route');
assert.deepEqual(route.schedulerMappings, [
  { kind: 'same_scene', legacyEventId: 'CEVT_18_PLAYOFF_01', canonicalEventId: 'CEVT_18_PLAYOFF_01' },
  { kind: 'distinct_scene', legacyEventId: 'EVT_20_CCH_001', canonicalEventId: 'EVT_20_CCH_001', clearCanonicalSeen: true, clearCanonicalCooldown: true }
]);
console.log(`A5_POST_J_CONTENT_IDENTITY=${identity}`);
