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


### Browser artifact audit — contentIdentity visual false-positive

A superseded browser artifact generated 66 PNGs and initially reported capture success, but manual inspection found that multiple fixtures rendered the product's "Tu partida" load-failure surface rather than their intended screens.

Root cause:
- several deterministic session recipes intentionally use a reduced event catalog (`[]` or `[EVT_18_PRE_001]`);
- the browser harness originally reloaded every exported snapshot through `mountGame` without passing the same event catalog;
- production `GameSession.migrateFromSave` correctly rejected those snapshots because `contentIdentity` differed;
- the harness captured the resulting save-failure screen.

P0 correction:
- `fixtureEventCatalog(id)` now exposes the exact event catalog used to create each fixture;
- browser `mountGame` receives that exact catalog;
- fixture tests re-open every exported snapshot through `GameSession.migrateFromSave` with the same catalog;
- the browser harness fails immediately if the product save-failure copy appears;
- per-fixture visible-surface assertions verify the expected screen before a screenshot can count as evidence.

The superseded 66-image artifact is therefore useful for diagnosing the harness but is **not accepted as the final P0 visual baseline**.

The final visual gate requires a fresh exact-head browser run after this correction.


### Browser harness repair — prologue missing-media trigger

Exact-head browser diagnosis found a deterministic harness defect in the cinematic fallback fixture:

- the PROLOGUE player deliberately uses `preload="none"`;
- the harness opened the prologue dialog but did not press `Reproducir prólogo con sonido`;
- therefore the deliberately missing WebM URL was not guaranteed to be requested;
- the expected missing-media fallback could time out even though production behavior was correct.

P0 correction:
- the browser fixture now presses the real product button `Reproducir prólogo con sonido`;
- only then does it wait for `No se ha podido cargar el prólogo. Puedes continuar con tu historia.`;
- no production cutscene code, gameplay, save, RNG or UI styling is changed.

This explains a three-target failure pattern because `cinematic-fallback` is captured at the three required phone widths.
