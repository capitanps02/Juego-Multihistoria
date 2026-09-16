import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import {
  CONTENT_MIGRATION_ROUTES,
  findMigrationRoute
} from '../dist/session/content-migration.js';
import {
  PRE_T51_CONTENT_IDENTITY,
  PRE_T51_EVENT_EVIDENCE
} from '../dist/session/pre-t51-legacy-registry.js';

const currentIdentity = await contentIdentity(EVENTS);
const activeIds = new Set(EVENTS.map(event => event.id));

if (currentIdentity === PRE_T51_CONTENT_IDENTITY) {
  console.log(JSON.stringify({
    ok: true,
    mode: 'pre-t51-content-still-active',
    currentIdentity,
    routeRequired: false
  }));
  process.exit(0);
}

const route = findMigrationRoute(PRE_T51_CONTENT_IDENTITY, currentIdentity, CONTENT_MIGRATION_ROUTES);
assert.ok(route, `Active content identity ${currentIdentity} changed without a registered pre-T5.1 migration route`);

const schedulerKeys = new Set();
for (const mapping of route.schedulerMappings ?? []) {
  assert.ok(PRE_T51_EVENT_EVIDENCE[mapping.legacyEventId], `Unknown legacy event in migration route: ${mapping.legacyEventId}`);
  assert.ok(activeIds.has(mapping.canonicalEventId), `Unknown active canonical event in migration route: ${mapping.canonicalEventId}`);
  const key = `${mapping.kind}:${mapping.legacyEventId}:${mapping.canonicalEventId}`;
  assert.equal(schedulerKeys.has(key), false, `Duplicate scheduler migration mapping: ${key}`);
  schedulerKeys.add(key);
  if (mapping.kind === 'distinct_scene' && mapping.legacyEventId === mapping.canonicalEventId) {
    assert.equal(mapping.clearCanonicalSeen, true, `Exact-ID distinct scene ${mapping.legacyEventId} must clear canonical SEEN state`);
    assert.equal(mapping.clearCanonicalCooldown, true, `Exact-ID distinct scene ${mapping.legacyEventId} must clear canonical cooldown`);
  }
}

const seedKeys = new Set();
for (const mapping of route.seedOriginMappings ?? []) {
  assert.ok(PRE_T51_EVENT_EVIDENCE[mapping.fromEventId], `Unknown legacy seed origin: ${mapping.fromEventId}`);
  assert.ok(activeIds.has(mapping.toEventId), `Unknown canonical seed origin: ${mapping.toEventId}`);
  const key = `${mapping.seedId}:${mapping.fromEventId}:${mapping.toEventId}`;
  assert.equal(seedKeys.has(key), false, `Duplicate seed origin migration mapping: ${key}`);
  seedKeys.add(key);
  assert.equal(typeof mapping.rewriteExisting, 'boolean', `Seed origin mapping ${key} must state rewriteExisting explicitly`);
}

console.log(JSON.stringify({
  ok: true,
  mode: 'post-t51-content-route-registered',
  sourceIdentity: PRE_T51_CONTENT_IDENTITY,
  currentIdentity,
  schedulerMappings: schedulerKeys.size,
  seedOriginMappings: seedKeys.size
}));
