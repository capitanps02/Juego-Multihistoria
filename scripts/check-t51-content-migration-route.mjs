import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import {
  buildActiveEventEvidence,
  CONTENT_MIGRATION_ROUTES,
  findMigrationPath,
  legacyContentSource
} from '../dist/session/content-migration.js';
import { PRE_T51_CONTENT_IDENTITY } from '../dist/session/pre-t51-legacy-registry.js';

const currentIdentity = await contentIdentity(EVENTS);
const activeEvidence = await buildActiveEventEvidence(EVENTS, currentIdentity);

if (currentIdentity === PRE_T51_CONTENT_IDENTITY) {
  console.log(JSON.stringify({
    ok: true,
    mode: 'pre-t51-content-still-active',
    currentIdentity,
    routeRequired: false
  }));
  process.exit(0);
}

const path = findMigrationPath(PRE_T51_CONTENT_IDENTITY, currentIdentity, CONTENT_MIGRATION_ROUTES);
assert.ok(path, `Active content identity ${currentIdentity} changed without one unique registered pre-T5.1 migration path`);
assert.ok(path.length > 0, 'Changed content must have a non-empty migration path');

const schedulerKeys = new Set();
const seedKeys = new Set();
for (const route of path) {
  const source = legacyContentSource(route.sourceContentIdentity);
  assert.ok(source, `Missing compatibility evidence for migration source ${route.sourceContentIdentity}`);
  const targetEvents = route.targetContentIdentity === currentIdentity
    ? activeEvidence
    : legacyContentSource(route.targetContentIdentity)?.events;
  assert.ok(targetEvents, `Missing compatibility evidence for intermediate migration target ${route.targetContentIdentity}`);

  for (const mapping of route.schedulerMappings ?? []) {
    assert.ok(source.events[mapping.legacyEventId], `Unknown source event ${mapping.legacyEventId} in route ${route.sourceContentIdentity}->${route.targetContentIdentity}`);
    assert.ok(targetEvents[mapping.canonicalEventId], `Unknown target event ${mapping.canonicalEventId} in route ${route.sourceContentIdentity}->${route.targetContentIdentity}`);
    const key = `${route.sourceContentIdentity}:${route.targetContentIdentity}:${mapping.kind}:${mapping.legacyEventId}:${mapping.canonicalEventId}`;
    assert.equal(schedulerKeys.has(key), false, `Duplicate scheduler migration mapping: ${key}`);
    schedulerKeys.add(key);
    if (mapping.kind === 'distinct_scene' && mapping.legacyEventId === mapping.canonicalEventId) {
      assert.equal(mapping.clearCanonicalSeen, true, `Exact-ID distinct scene ${mapping.legacyEventId} must clear canonical SEEN state`);
      assert.equal(mapping.clearCanonicalCooldown, true, `Exact-ID distinct scene ${mapping.legacyEventId} must clear canonical cooldown`);
    }
  }

  for (const mapping of route.seedOriginMappings ?? []) {
    assert.ok(source.events[mapping.fromEventId], `Unknown source seed origin ${mapping.fromEventId} in route ${route.sourceContentIdentity}->${route.targetContentIdentity}`);
    assert.ok(targetEvents[mapping.toEventId], `Unknown target seed origin ${mapping.toEventId} in route ${route.sourceContentIdentity}->${route.targetContentIdentity}`);
    const key = `${route.sourceContentIdentity}:${route.targetContentIdentity}:${mapping.seedId}:${mapping.fromEventId}:${mapping.toEventId}`;
    assert.equal(seedKeys.has(key), false, `Duplicate seed origin migration mapping: ${key}`);
    seedKeys.add(key);
    assert.equal(typeof mapping.rewriteExisting, 'boolean', `Seed origin mapping ${key} must state rewriteExisting explicitly`);
  }
}

for (let i = 1; i < path.length; i++) {
  assert.equal(path[i - 1].targetContentIdentity, path[i].sourceContentIdentity, 'Migration path is not contiguous');
}
assert.equal(path[0].sourceContentIdentity, PRE_T51_CONTENT_IDENTITY);
assert.equal(path.at(-1).targetContentIdentity, currentIdentity);

console.log(JSON.stringify({
  ok: true,
  mode: 'post-t51-content-path-registered',
  sourceIdentity: PRE_T51_CONTENT_IDENTITY,
  currentIdentity,
  pathLength: path.length,
  schedulerMappings: schedulerKeys.size,
  seedOriginMappings: seedKeys.size
}));
