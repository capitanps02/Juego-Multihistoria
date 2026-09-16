import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { EVENTS } from '../dist/content/events/index.js';
import { ENGINE_BUILD } from '../dist/core/build.js';
import { SESSION_VERSION } from '../dist/session/game-session.js';
import { CURRENT_SCHEMA_VERSION } from '../dist/save/save.js';

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
  if (existingCatalog !== serialized) throw new Error('Frozen T5.1 event catalog differs from active pre-content catalog');
  if (existingDigest !== existingManifest.eventCatalogSha256) throw new Error('Frozen T5.1 catalog digest does not match manifest');
  if (contentIdentity !== existingManifest.contentIdentity) throw new Error('Active contentIdentity differs from frozen pre-T5.1 baseline');
  if (existingManifest.counts?.total !== 388 || existingManifest.counts?.principal !== 254 || existingManifest.counts?.conditional !== 134) {
    throw new Error('Frozen T5.1 manifest counts are invalid');
  }
  console.log(JSON.stringify({ ok: true, contentIdentity, sourceGitCommit: existingManifest.sourceGitCommit, activeGitCommit: gitCommit }, null, 2));
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(catalogPath, serialized);
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
