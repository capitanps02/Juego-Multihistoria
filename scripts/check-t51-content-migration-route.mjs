import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import {
  CONTENT_MIGRATION_ROUTES,
  LEGACY_CONTENT_SOURCES,
  findMigrationRoute,
  legacyContentSource
} from '../dist/session/content-migration.js';
import { PRE_T51_CONTENT_IDENTITY } from '../dist/session/pre-t51-legacy-registry.js';
import { migrationSourceCoverage } from './t51-migration-source-policy.mjs';

const currentIdentity = await contentIdentity(EVENTS);
const activeIds = new Set(EVENTS.map(event => event.id));

if (currentIdentity === PRE_T51_CONTENT_IDENTITY) {
  console.log(JSON.stringify({
    ok: true,
    mode: 'pre-t51-content-still-active',
    currentIdentity,
    routeRequired: false,
    registeredSources: Object.keys(LEGACY_CONTENT_SOURCES).sort()
  }));
  process.exit(0);
}

const coverage = migrationSourceCoverage({
  currentIdentity,
  preIdentity: PRE_T51_CONTENT_IDENTITY,
  sourceIdentities: Object.keys(LEGACY_CONTENT_SOURCES),
  routes: CONTENT_MIGRATION_ROUTES
});
assert.equal(
  coverage.missingCurrentSource.length,
  0,
  `Active post-T5.1 catalog ${currentIdentity} has no frozen source evidence`
);
assert.deepEqual(
  coverage.missingRoutes,
  [],
  `Active content ${currentIdentity} is missing direct migration routes from registered source(s): ${coverage.missingRoutes.join(', ')}`
);

const routeSummaries = [];
for (const sourceIdentity of coverage.requiredSources) {
  const source = legacyContentSource(sourceIdentity);
  assert.ok(source, `Missing evidence for registered source ${sourceIdentity}`);
  const route = findMigrationRoute(sourceIdentity, currentIdentity, CONTENT_MIGRATION_ROUTES);
  assert.ok(route, `Missing migration route ${sourceIdentity} -> ${currentIdentity}`);

  const schedulerKeys = new Set();
  for (const mapping of route.schedulerMappings ?? []) {
    assert.ok(source.events[mapping.legacyEventId], `Unknown legacy event ${mapping.legacyEventId} in source ${sourceIdentity}`);
    assert.ok(activeIds.has(mapping.canonicalEventId), `Unknown active canonical event in migration route: ${mapping.canonicalEventId}`);
    const key = `${mapping.kind}:${mapping.legacyEventId}:${mapping.canonicalEventId}`;
    assert.equal(schedulerKeys.has(key), false, `Duplicate scheduler migration mapping in ${sourceIdentity}: ${key}`);
    schedulerKeys.add(key);
    if (mapping.kind === 'distinct_scene' && mapping.legacyEventId === mapping.canonicalEventId) {
      assert.equal(mapping.clearCanonicalSeen, true, `Exact-ID distinct scene ${mapping.legacyEventId} must clear canonical SEEN state`);
      assert.equal(mapping.clearCanonicalCooldown, true, `Exact-ID distinct scene ${mapping.legacyEventId} must clear canonical cooldown`);
    }
  }

  const seedKeys = new Set();
  for (const mapping of route.seedOriginMappings ?? []) {
    assert.ok(source.events[mapping.fromEventId], `Unknown legacy seed origin ${mapping.fromEventId} in source ${sourceIdentity}`);
    assert.ok(activeIds.has(mapping.toEventId), `Unknown canonical seed origin: ${mapping.toEventId}`);
    const key = `${mapping.seedId}:${mapping.fromEventId}:${mapping.toEventId}`;
    assert.equal(seedKeys.has(key), false, `Duplicate seed origin migration mapping in ${sourceIdentity}: ${key}`);
    seedKeys.add(key);
    assert.equal(typeof mapping.rewriteExisting, 'boolean', `Seed origin mapping ${key} must state rewriteExisting explicitly`);
  }

  routeSummaries.push({
    sourceIdentity,
    targetIdentity: currentIdentity,
    schedulerMappings: schedulerKeys.size,
    seedOriginMappings: seedKeys.size
  });
}

const activeSource = legacyContentSource(currentIdentity);
assert.ok(activeSource, `Active catalog ${currentIdentity} must be frozen as future legacy evidence before merge`);

console.log(JSON.stringify({
  ok: true,
  mode: 'post-t51-content-routes-and-source-evidence-registered',
  currentIdentity,
  registeredSources: coverage.registeredSources,
  routeSummaries
}, null, 2));
