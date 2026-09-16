import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { EVENTS } from '../dist/content/events/index.js';
import { ENGINE_BUILD } from '../dist/core/build.js';
import { SESSION_VERSION } from '../dist/session/game-session.js';
import { CURRENT_SCHEMA_VERSION } from '../dist/save/save.js';
import { CONTENT_MIGRATION_ROUTES, findMigrationRoute } from '../dist/session/content-migration.js';
import { PRE_T51_CONTENT_IDENTITY } from '../dist/session/pre-t51-legacy-registry.js';
import { evaluateT51FreezeTransition } from './t51-freeze-policy.mjs';

const outDir = 'qa/fixtures/t5.1';
const catalogPath = `${outDir}/pre-t51-event-catalog.json`;
const manifestPath = `${outDir}/pre-t51-content-manifest.json`;
const check = process.argv.includes('--check');

const serialized = JSON.stringify(EVENTS);
const bytes = Buffer.from(serialized, 'utf8');
const contentIdentity = createHash('sha256').update(bytes).digest('hex');
const principal = EVENTS.filter(event => event.family !== 'conditional');
const conditional = EVENTS.filter(event => event.family === 'conditional');
const phases = [...new Set(EVENTS.map(event => event.phase))];
const byPhase = Object.fromEntries(phases.map(phase => [phase, {
  total: EVENTS.filter(event => event.phase === phase).length,
  principal: principal.filter(event => event.phase === phase).length,
  conditional: conditional.filter(event => event.phase === phase).length
}]));

if (EVENTS.length !== 388 || principal.length !== 254 || conditional.length !== 134) {
  throw new Error(`Unexpected baseline counts: total=${EVENTS.length}, principal=${principal.length}, conditional=${conditional.length}`);
}

const gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
const manifest = {
  generatedAt: new Date().toISOString(),
  sourceGitCommit: gitCommit,
  engineBuild: ENGINE_BUILD,
  sessionVersion: SESSION_VERSION,
  gameStateSchemaVersion: CURRENT_SCHEMA_VERSION,
  contentIdentity,
  eventCatalogSha256: contentIdentity,
  eventCatalogBytes: bytes.byteLength,
  counts: {
    total: EVENTS.length,
    principal: principal.length,
    conditional: conditional.length,
    byPhase
  },
  algorithm: 'sha256(utf8(JSON.stringify(EVENTS)))',
  activeSchedulerFixture: false
};

if (check) {
  const existingCatalog = readFileSync(catalogPath, 'utf8');
  const existingManifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const existingDigest = createHash('sha256').update(Buffer.from(existingCatalog, 'utf8')).digest('hex');

  if (existingDigest !== existingManifest.eventCatalogSha256) throw new Error('Frozen T5.1 catalog digest does not match manifest');
  if (existingManifest.contentIdentity !== existingDigest) throw new Error('Frozen T5.1 manifest identity does not match frozen catalog bytes');
  if (existingManifest.counts?.total !== 388 || existingManifest.counts?.principal !== 254 || existingManifest.counts?.conditional !== 134) {
    throw new Error('Frozen T5.1 manifest counts are invalid');
  }

  const transition = evaluateT51FreezeTransition({
    frozenContentIdentity: existingManifest.contentIdentity,
    activeContentIdentity: contentIdentity,
    preT51ContentIdentity: PRE_T51_CONTENT_IDENTITY,
    findRoute: (from, to) => findMigrationRoute(from, to, CONTENT_MIGRATION_ROUTES)
  });

  console.log(JSON.stringify({
    ok: true,
    mode: transition.mode,
    frozenContentIdentity: existingManifest.contentIdentity,
    activeContentIdentity: contentIdentity,
    migrationRouteRegistered: transition.migrationRouteRegistered,
    sourceGitCommit: existingManifest.sourceGitCommit,
    activeGitCommit: gitCommit
  }, null, 2));
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(catalogPath, serialized);
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
