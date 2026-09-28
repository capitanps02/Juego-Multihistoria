# MUIR P0 — Test execution record

Baseline authority: `main@36d3d1b0750b0ded877e55953f223e2de1169a46`

P0 branch: `ui-a0/muir-p0-baseline`

PR: #869

## Run history

### Run 36483097597 — first executable certification

Head under test: `fc1886190576779a8b998ea774c2e7dee801223f`

| Step | Result | Classification |
|---|---|---|
| npm ci | PASS | valid |
| npm run build | PASS | valid |
| MUIR fixture contracts | FAIL | P0 harness defect |
| downstream steps | SKIPPED | workflow was fail-fast |

Failure:
`session-recipes.mjs` resolved production imports to `analysis/dist/**` instead of repository-root `dist/**`.

Correction:
imports changed from `../../dist/**` to `../../../dist/**`.

This failure did not alter or implicate product gameplay.

### Run 36483205844 — non-fail-fast functional matrix

Head under test: `aa93c4a8706e7a4cf3b5db795d8970c7502271db`

Confirmed at last observation:
- npm ci → PASS
- build → PASS
- MUIR fixture contracts → PASS
- MUIR package graph → PASS
- session → PASS
- saves → still executing at observation time

The workflow was changed to `if: always()` for independent evidence collection.

### Run 36483919070 — browser-enabled certification

Head lineage includes browser baseline tooling and Playwright-in-CI installation.

Purpose:
- retain the full functional matrix;
- generate deterministic screenshots;
- record browser metrics;
- hash screenshot evidence;
- keep browser dependency test-only and outside release dependencies.

Status: execution in progress at time of this record.

## Evidence policy

No pending or skipped command is counted as PASS.
No screenshot is counted until a PNG exists in the workflow artifact with its SHA-256.
No browser metric is counted until `browser-baseline.json` records it.
No P0 gate is declared from source inspection alone when the RTM requires executed evidence.


## Superseded browser artifact integrity finding

Artifact `10998674539` from the superseded P0 run on head `9678ad2bf9d19c74cb649a89b9438fcdafed0b51` is **INVALID AS A VISUAL BASELINE**.

Post-run inspection found that 27 of its 66 PNGs were not the requested product surfaces. Nine fixture ids produced an identical save-load failure screen at each of the three phone viewports:

- home-pending-decision;
- home-offer;
- result;
- auto-running;
- auto-paused;
- auto-interruption;
- injury-public;
- contract-offer;
- epilogue-retirement.

Root cause:

The test recipes intentionally use different event catalogs (full catalog, empty catalog, or the isolated `EVT_18_PRE_001` catalog). The browser harness persisted the snapshot correctly but mounted production UI without passing the matching fixture event catalog. Production `GameSession.migrateFromSave()` therefore correctly rejected mismatched `contentIdentity` and rendered the save-load failure screen.

P0 harness repair:

- `fixtureEventCatalog(id)` now exposes the exact catalog that created each fixture;
- browser `mountGame()` receives that exact catalog;
- all 21 fixtures have a reopen contract through `GameSession.migrateFromSave(...,{events:fixtureEventCatalog(id)})`;
- the browser harness hard-fails if the product save-load failure text appears;
- every browser fixture asserts its expected visible production surface before the PNG is accepted.

Therefore no screenshot or metric from artifact `10998674539` is eligible for the final P0 gate. Only evidence produced by the repaired exact-head harness may certify P0.
