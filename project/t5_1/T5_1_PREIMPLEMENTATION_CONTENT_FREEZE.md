# T5.1 — Pre-implementation content freeze requirement

Generated: 2026-09-16

## Why this must happen before the first functional T5.1 event change

The assessed workflow branch has accumulated documentation/audit commits but has not changed the runtime event catalog. Therefore its current `EVENTS` serialization still represents the pre-T5.1 runtime content baseline.

`GameSession.contentIdentity` is SHA-256 over UTF-8 bytes of `JSON.stringify(events)`. Once the first functional event definition changes, the identity changes.

To support a truthful final T5.1 session migration, freeze the exact old catalog **before** modifying active event definitions.

This is a prerequisite for the first implementation task (currently PR #3 after re-grounding).

## Required frozen evidence

Before changing `src/content/events/**` on the first functional T5.1 branch:

1. Build the unchanged pre-T5.1 runtime from the re-grounded base.
2. Serialize the exact runtime `EVENTS` array using the same ordering/shape consumed by `contentIdentity`.
3. Compute and record the exact SHA-256 identity used by `GameSession`.
4. Store an immutable compatibility fixture/bundle sufficient to validate:
   - old completed principal decisions;
   - old completed conditional decisions;
   - old pending principal scenes;
   - old pending conditional scenes;
   - exact-ID semantic-collision cases.
5. Record:
   - source Git commit SHA;
   - `ENGINE_BUILD`;
   - session version;
   - GameState schema version;
   - event counts by principal/conditional/phase;
   - content identity hash;
   - fixture/catalog SHA-256.
6. Add tests proving the frozen catalog hashes to the recorded identity.

## Exact reproducible capture procedure

Run this on the re-grounded task branch **before any functional edit**:

```bash
npm run build
mkdir -p qa/fixtures/t5.1
node --input-type=module <<'NODE'
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { EVENTS } from './dist/content/events/index.js';
import { ENGINE_BUILD } from './dist/core/build.js';
import { SESSION_VERSION } from './dist/session/game-session.js';
import { CURRENT_SCHEMA_VERSION } from './dist/save/save.js';

const serialized = JSON.stringify(EVENTS);
const bytes = Buffer.from(serialized, 'utf8');
const contentIdentity = createHash('sha256').update(bytes).digest('hex');
const principal = EVENTS.filter(e => e.family !== 'conditional');
const conditional = EVENTS.filter(e => e.family === 'conditional');
const byPhase = Object.fromEntries(
  [...new Set(EVENTS.map(e => e.phase))].map(phase => [phase, {
    total: EVENTS.filter(e => e.phase === phase).length,
    principal: principal.filter(e => e.phase === phase).length,
    conditional: conditional.filter(e => e.phase === phase).length
  }])
);

const catalogPath = 'qa/fixtures/t5.1/pre-t51-event-catalog.json';
const manifestPath = 'qa/fixtures/t5.1/pre-t51-content-manifest.json';
writeFileSync(catalogPath, serialized);

const manifest = {
  generatedAt: new Date().toISOString(),
  gitCommit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
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
  algorithm: 'sha256(utf8(JSON.stringify(EVENTS)))'
};
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
NODE
```

Expected invariant counts on the unchanged baseline:
- total: **388**;
- principal: **254**;
- conditional: **134**.

Do not accept the freeze if these counts differ without first explaining the branch-state difference.

### Why this command matches `GameSession`

`src/session/game-session.ts` computes content identity as:
- `JSON.stringify(events)`;
- UTF-8 via `TextEncoder`;
- SHA-256.

Node `Buffer.from(serialized, 'utf8')` plus `createHash('sha256')` produces the same byte/hash contract.

Because the stored catalog file is exactly the un-prettified serialized string, `eventCatalogSha256` is expected to equal `contentIdentity`.

## Storage rule

The frozen legacy catalog is compatibility evidence, not active content.

It must never be imported into the active `EventIndex` or scheduler candidate set.

A future migration layer may use it only to:
- validate old journal/history decisions;
- validate an embedded pending legacy `EventDefinition`;
- resolve the already-presented pending legacy scene exactly;
- support reviewed same-scene equivalence decisions.

## Suggested artifact shape

```text
qa/fixtures/t5.1/pre-t51-content-manifest.json
qa/fixtures/t5.1/pre-t51-event-catalog.json
```

Manifest must contain generated values, never hand-filled hashes.

## Required freeze tests

At minimum add/execute assertions that:
- serialized catalog count is 388;
- principal count is 254;
- conditional count is 134;
- computed content identity matches the manifest;
- file SHA-256 matches `eventCatalogSha256`;
- repeat generation is byte/digest deterministic;
- captured Git commit is the exact pre-functional-edit branch head;
- compatibility catalog is not imported by `src/content/events/index.ts`, active `EventIndex`, or scheduler;
- no source/runtime change was made before capture.

## Supported-source policy

Do not create migration routes for every intermediate task-branch content identity.

- Intermediate development branches may explicitly reject old sessions with `CONTENT_CHANGED` while reconciliation is in progress.
- Preserve strict validation throughout development.
- Final/release T5.1 migration should support deliberately selected released source identities, beginning with the frozen pre-T5.1 baseline when product policy requires it.

If additional historical releases need support, freeze/import their exact catalogs separately and register their identities explicitly.

## Queue implication

When `ejecuta Codex` selects the first functional T5.1 task, the execution preflight must perform/verify this freeze **before** Codex edits active event definitions.

This requirement does not authorize Codex execution or merge by itself.
