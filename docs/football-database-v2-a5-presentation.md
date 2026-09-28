# DB-A5 — Football Database V2 · Presentation / PlayCanvas / Android

## Status

- Main baseline: `b72cb81f993634667ba699086ba8714240d8a27b`
- Branch: `db-a5-football-presentation-platforms`
- PR: #836
- A5 HEAD at this report: `3b9d89b7b4a680a97047a3f48819f9a1378d061d`
- DB-A3 current head: `b39c0ebab0f302d1db5bda515694318c5ce7f1e9`
- DB-A4 current head: `7a2060c3ea099cb1d0d49264fdcb3765e18e72ce`
- G5: **BLOCKED / NOT CERTIFIED**
- Android P0: **resolved in code; certification pending**
- P0 open owned by A5: **0 known**
- P1 open owned by A5: **0 known**

## Progress calculation

Current implementation progress: **71%**.

This is derived from the workstream weights, not estimated by feel:

- Pass 1: 20/20
  - presentation inventory 6/6
  - PlayCanvas map 5/5
  - Android graph audit 6/6
  - legacy surface audit 3/3
- Pass 2: 22/22
  - formatter 7/7
  - catalog presentation 5/5
  - legacy fallback 4/4
  - short-name contexts 3/3
  - tests authored 3/3
- Pass 3: 17/23
  - PlayCanvas build implementation 7/7
  - catalog wiring 5/5
  - freshness metadata/build-time regeneration 2/4
  - regressions authored but exact-HEAD execution pending 3/7
- Pass 4: 12/20
  - recursive import graph 7/7
  - packaging fix 5/5
  - offline execution pending 0/4
  - APK/platform execution pending 0/4
- Pass 5: 0/15
  - blocked on exact-HEAD CI, A4 integration and final platform certification

Completed passes: **2/5**.
Passes in validation: **Pass 3 + Pass 4**.
Estimated remaining certification passes: **2–3**, depending on CI findings and A4 re-ground.

## Closed implementation items

### Unified presentation

`web/club-names.js` now:

- resolves catalog IDs from the authoritative Football Database V2 catalog;
- uses explicit `shortName` for compact contexts;
- presents UDV as a canonical special;
- keeps narrative aliases presentation-only;
- keeps known legacy IDs readable;
- fails visually closed for invalid/unknown internal IDs as `Club desconocido`;
- never writes display names back as identity.

### Browser

`web/game-ui.js` continues to use the shared formatter.
Compact match surfaces use catalog `shortName`.

The browser dependency graph test requires:

- `web/game-ui.js`;
- `web/indexed-save-store.js`;
- `web/club-names.js`;
- `dist/catalog/football/index.js`;

to resolve recursively.

### PlayCanvas

`scripts/build-playcanvas-db-a5.mjs`:

- packages GameSession;
- explicitly packages the football catalog presentation authority;
- inlines the shared browser UI;
- rejects unhandled ESM imports in inlined web modules;
- records the catalog presentation source and input hashes in the manifest.

`package.json` routes `build:playcanvas` through the DB-A5 builder.

### Android offline P0

The historical issue was real:

`web/game-ui.js -> web/club-names.js`

while the old Android copy list omitted `web/club-names.js`.

A5 resolves this structurally with:

- `scripts/local-esm-graph.mjs`;
- `scripts/finalize-android-offline-db-a5.mjs`.

The finalizer:

1. walks the real browser UI relative-import graph;
2. copies all required local modules;
3. walks again from the packaged `web/local.js` entrypoint;
4. fails if any relative dependency is missing;
5. records the packaged import graph in the offline manifest.

The normal `android:offline` command now runs this finalization automatically.

## Regression coverage

Dedicated tests cover:

- catalog name + shortName;
- UDV;
- narrative aliases;
- legacy generated IDs;
- legacy opaque display-compatible IDs;
- invalid V2 IDs;
- malformed/unknown values;
- static imports;
- side-effect imports;
- re-exports;
- dynamic local imports;
- deliberate missing-module failure;
- browser dependency graph;
- PlayCanvas catalog packaging;
- Android recursive graph;
- offline/no-network contract;
- Player Actions UI regression.

## Dependency status

DB-A4 explicitly preserves stable identity and does not remap display names. That contract is compatible with A5.

Final G5 still requires:

1. DB-A4 to be integrated/frozen on the serialized predecessor chain;
2. A5 to be tested on the exact resulting base;
3. PlayCanvas + Android offline exact-HEAD CI green;
4. artifact freshness gate finalized;
5. APK/Gradle execution if infrastructure is available;
6. final cross-platform matrix.

## Current blockers

- GitHub Actions runs for #836 are queued behind a large repository-wide workflow backlog.
- DB-A4 is still draft.
- The serialized G0–G4 dependency train is not frozen.
- Versioned PlayCanvas artifact freshness has not yet been certified as diff-zero.

## Next

1. consume exact-HEAD CI results for #836;
2. fix any A5-owned failures;
3. re-ground on final DB-A4/G4;
4. regenerate/freeze artifacts;
5. execute Android/APK and cross-platform matrix;
6. only then declare `G5 — PRESENTATION / PLAYCANVAS / ANDROID CERTIFIED`.
