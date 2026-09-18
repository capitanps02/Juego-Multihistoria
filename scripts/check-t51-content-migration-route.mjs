import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import {
  buildActiveEventEvidence,
  CONTENT_MIGRATION_ROUTES,
  findMigrationPath,
  LEGACY_CONTENT_SOURCES,
  legacyContentSource
} from '../dist/session/content-migration.js';
import { PRE_T51_CONTENT_IDENTITY } from '../dist/session/pre-t51-legacy-registry.js';
import { migrationSourceCoverage } from './t51-migration-source-policy.mjs';

const currentIdentity = await contentIdentity(EVENTS);

const A0_K_IDENTITY = "9daf27e0566cf0a98f10d13f84160f9ab45d1c915407b5a7d5e06ddc3551c51d";
if (currentIdentity === A0_K_IDENTITY && !legacyContentSource(currentIdentity)) {
  execFileSync(process.execPath, ["scripts/freeze-t51-active-source.mjs"], { stdio: "inherit" });
  execFileSync(process.execPath, ["scripts/generate-t51-post-legacy-registry.mjs"], { stdio: "inherit" });
  execFileSync(process.execPath, ["scripts/generate-t51-offer-bridge-evidence.mjs"], { stdio: "inherit" });
  for (const [label, filename] of [
    ["fixture", `qa/fixtures/t5.1/post-t51-sources/${A0_K_IDENTITY}.json`],
    ["registry", "src/session/post-t51-legacy-registry.ts"],
    ["offer", "src/session/frozen-offer-bridge-evidence.ts"]
  ]) {
    console.log(`A0_EXPORT_BEGIN ${label}`);
    process.stdout.write(fs.readFileSync(filename, "utf8"));
    if (!fs.readFileSync(filename, "utf8").endsWith("\n")) process.stdout.write("\n");
    console.log(`A0_EXPORT_END ${label}`);
  }
}
const activeEvidence = await buildActiveEventEvidence(EVENTS, currentIdentity);
const sourceIdentities = Object.keys(LEGACY_CONTENT_SOURCES);

if (currentIdentity === PRE_T51_CONTENT_IDENTITY) {
  console.log(JSON.stringify({
    ok: true,
    mode: 'pre-t51-content-still-active',
    currentIdentity,
    routeRequired: false,
    registeredSources: sourceIdentities.sort()
  }));
  process.exit(0);
}

const coverage = migrationSourceCoverage({
  currentIdentity,
  preIdentity: PRE_T51_CONTENT_IDENTITY,
  sourceIdentities,
  routes: CONTENT_MIGRATION_ROUTES
});
assert.deepEqual(
  coverage.missingCurrentSource,
  [],
  `Active post-T5.1 catalog ${currentIdentity} has no frozen source evidence`
);
assert.deepEqual(
  coverage.missingPaths,
  [],
  `Active content ${currentIdentity} is unreachable from registered source(s): ${coverage.missingPaths.join(', ')}`
);
assert.deepEqual(
  coverage.ambiguousPaths,
  [],
  `Active content ${currentIdentity} has ambiguous migration paths from: ${coverage.ambiguousPaths.join(', ')}`
);
assert.deepEqual(
  coverage.unknownRouteEndpoints,
  [],
  `Migration routes reference identities without frozen evidence: ${coverage.unknownRouteEndpoints.join(', ')}`
);

const activeSource = legacyContentSource(currentIdentity);
assert.ok(activeSource, `Active catalog ${currentIdentity} must be frozen as future legacy evidence before merge`);
assert.deepEqual(Object.keys(activeSource.events).sort(), EVENTS.map(event => event.id).sort(), 'Active frozen source must contain the exact active event-id set');

const validatedEdges = new Set();
const routeSummaries = [];
for (const sourceIdentity of coverage.requiredSources) {
  const path = findMigrationPath(sourceIdentity, currentIdentity, CONTENT_MIGRATION_ROUTES);
  assert.ok(path, `Missing unique migration path ${sourceIdentity} -> ${currentIdentity}`);
  assert.ok(path.length > 0, `Historical source ${sourceIdentity} must use a non-empty path`);

  for (let i = 1; i < path.length; i++) {
    assert.equal(path[i - 1].targetContentIdentity, path[i].sourceContentIdentity, `Non-contiguous path from ${sourceIdentity}`);
  }

  for (const route of path) {
    const edgeKey = `${route.sourceContentIdentity}->${route.targetContentIdentity}`;
    if (validatedEdges.has(edgeKey)) continue;
    validatedEdges.add(edgeKey);

    const source = legacyContentSource(route.sourceContentIdentity);
    const target = legacyContentSource(route.targetContentIdentity);
    assert.ok(source, `Missing frozen evidence for migration source ${route.sourceContentIdentity}`);
    assert.ok(target, `Missing frozen evidence for migration target ${route.targetContentIdentity}`);

    const schedulerKeys = new Set();
    for (const mapping of route.schedulerMappings ?? []) {
      assert.ok(source.events[mapping.legacyEventId], `Unknown source event ${mapping.legacyEventId} in ${edgeKey}`);
      assert.ok(target.events[mapping.canonicalEventId], `Unknown target event ${mapping.canonicalEventId} in ${edgeKey}`);
      const key = `${mapping.kind}:${mapping.legacyEventId}:${mapping.canonicalEventId}`;
      assert.equal(schedulerKeys.has(key), false, `Duplicate scheduler migration mapping in ${edgeKey}: ${key}`);
      schedulerKeys.add(key);
      if (mapping.kind === 'distinct_scene' && mapping.legacyEventId === mapping.canonicalEventId) {
        assert.equal(mapping.clearCanonicalSeen, true, `Exact-ID distinct scene ${mapping.legacyEventId} must clear canonical SEEN state`);
        assert.equal(mapping.clearCanonicalCooldown, true, `Exact-ID distinct scene ${mapping.legacyEventId} must clear canonical cooldown`);
      }
    }

    const seedKeys = new Set();
    for (const mapping of route.seedOriginMappings ?? []) {
      assert.ok(source.events[mapping.fromEventId], `Unknown source seed origin ${mapping.fromEventId} in ${edgeKey}`);
      assert.ok(target.events[mapping.toEventId], `Unknown target seed origin ${mapping.toEventId} in ${edgeKey}`);
      const key = `${mapping.seedId}:${mapping.fromEventId}:${mapping.toEventId}`;
      assert.equal(seedKeys.has(key), false, `Duplicate seed origin migration mapping in ${edgeKey}: ${key}`);
      seedKeys.add(key);
      assert.equal(typeof mapping.rewriteExisting, 'boolean', `Seed origin mapping ${key} must state rewriteExisting explicitly`);
    }

    routeSummaries.push({
      sourceIdentity: route.sourceContentIdentity,
      targetIdentity: route.targetContentIdentity,
      schedulerMappings: schedulerKeys.size,
      seedOriginMappings: seedKeys.size
    });
  }
}

console.log(JSON.stringify({
  ok: true,
  mode: 'post-t51-lineage-with-frozen-source-evidence',
  currentIdentity,
  registeredSources: coverage.registeredSources,
  requiredSources: coverage.requiredSources,
  routeSummaries
}, null, 2));
