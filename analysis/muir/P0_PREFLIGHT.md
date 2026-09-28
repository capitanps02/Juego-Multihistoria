# UI-A0 — P0 Pass 1 Preflight and Cartography

## Frozen baseline

- Repository: `capitanps02/Juego-Multihistoria`
- Baseline: `36d3d1b0750b0ded877e55953f223e2de1169a46`
- Baseline commit: `A10: fix schema-7 legacy retirement fixtures`
- Baseline commit time: 2026-09-28T17:19:23Z
- Branch: `ui-a0/muir-p0-baseline`
- Default branch: `main`
- P0 product-design changes: none
- P0 gameplay changes: none

## Relevant integrated ancestry verified

The following commits are ancestors of the frozen main baseline:

- Player Actions V1 merge: `761d14021e00f10b4f7cbf82ffeedd58533c0a4c`
- T5.5 A14 auto-simulation merge: `5a22d344958fa1e19af00f01384056a894196312`
- Event-specific cinematic integration: `a8e4e209bbd3a69505031abe8bb8a6fee8b0fe0b`
- Football Database V2 release candidate: `afedede5ebb97ad031db0e144baf5a1e7d67be64`
- Current hotfix / exact baseline: `36d3d1b0750b0ded877e55953f223e2de1169a46`

Football Database V2 reconciliation PR #862 and release PR #865 are merged. PR #868 is the exact current baseline merge.

## Architecture found

```text
GameSession / PlayerView public contracts
            |
            v
web/game-ui.js + web/game-ui.css
            |
      +-----+--------------------+
      |                          |
      v                          v
Web direct mount            build-playcanvas.mjs
web/local.js                generated single bundle
      |                          |
      v                          v
 Browser                   PlayCanvas
      |
      +--------------------------+
                                 |
                                 v
                    build-android-offline.mjs
                    shared ESM UI copied into APK
                                 |
                                 v
                    WebViewAssetLoader / MainActivity
                                 |
                                 v
                         Android offline
```

### Shared sources

- `web/game-ui.js`
- `web/game-ui.css`
- `web/cutscene-player.js`
- `web/club-names.js`
- `web/club-catalog-names.js`
- `web/indexed-save-store.js`
- `src/session/game-session.ts`
- transitive runtime modules collected from GameSession

### Adapters / packaging

- Web: `web/local.js`
- Web QA: `web/qa-local.js`, `web/qa-cutscene-flow.js`, `web/qa-continuity-local.js`
- PlayCanvas: `scripts/build-playcanvas.mjs` -> `playcanvas/multihistoria.js`
- Android: `scripts/build-android-offline.mjs` -> `android/app/src/main/assets/**`
- Android wrapper: `android/app/src/main/java/com/multihistoria/MainActivity.java`

No independent Android UI should be introduced.

## Public contracts inspected

`PlayerView` currently exposes:

- screen / offer / offerHistory
- ageMilestones
- careerSeasons / careerMilestones / latestMatch
- retirementStatus
- date / age / club / appearances / salaryMonthly
- decisionsMade / season / position
- fitness / fatigue / form / contractMonths
- news / contacts
- decision / cutscene / result / resultCategory / journal
- public auto-simulation state
- public Player Actions view

It does not currently expose a player-name field in the inspected interface.

`PublicAutoSimulationState` exposes only public mode, maxWeeks, elapsedDays, summary and interruption. Private baseline and producer provenance stay hidden.

`PublicPlayerActionsView` exposes availability, categories/actions/options/targets, public history and last result.

## Existing tests / harness found

Package scripts already include:

- `test:playcanvas`
- `test:session`
- `test:saves`
- `test:persistence`
- `test:android:offline`
- `test:player-actions-ui`
- `test:player-actions-session`
- `test:t55:a14`
- `test:t55:a19`
- `test:football-platforms`

Relevant directed files include:

- `scripts/test-playcanvas.mjs`
- `scripts/test-android-offline.mjs`
- `scripts/test-player-actions-ui-contract.mjs`
- `scripts/test-t55-auto-simulation.mjs`
- `scripts/test-t55-a19-ui.mjs`
- `scripts/test-saves.mjs`
- `scripts/test-persistence.mjs`

Existing QA browser entrypoints are useful foundations but do not constitute the MUIR deterministic fixture/screenshot harness.

## Initial risks

### P0 — K-01 package graph blocker

`web/game-ui.js` imports:

- `./cutscene-player.js`
- `./club-names.js`
- `./indexed-save-store.js`

PlayCanvas explicitly inlines all three.

Android offline currently copies club-name and persistence modules but not `web/cutscene-player.js`. Its package test does not assert that module. Source-level evidence therefore indicates an incomplete Android UI graph after a clean offline build.

This is not fixed in Pass 1. P0 must reproduce it minimally and decide whether a P0-only packaging correction is required for a reproducible baseline.

### P0/P3 — ID-01

Current `PlayerView` has no player-name property and repository search found no canonical player-name field by common identifiers. Full end-to-end audit is still required before final blocker classification.

### P0 — deterministic visual evidence gap

Current tests validate contracts and source patterns, but there is no MUIR fixture matrix covering all required UI states at 360x800, 390x844 and 412x915 with stable hashes.

### P0 — exact-head execution gap

No workflow runs are attached directly to the exact current baseline commit through the connector result. P0 must execute or obtain exact-head reproducible test evidence rather than inheriting green status from older commits.

### Platform / responsive

The Android manifest currently locks the native Activity to portrait. This is a baseline fact to record when evaluating the requested landscape check; P0 must not silently alter it.

## Pass 1 exact action list

1. Freeze exact `main` SHA.
2. Create isolated P0 branch.
3. Inspect package scripts and UI/platform build paths.
4. Map shared UI vs adapters.
5. Inspect public presentation contracts.
6. Inventory existing UI/session/save/platform tests.
7. Verify ancestry of Player Actions, auto-sim, cinematics and DB V2.
8. Identify first package-graph and identity risks.
9. Create initial RTM with no unsupported PASS states.
10. Prepare deterministic harness design and evidence directory contract for Pass 2.

## Pass 1 exit condition

Pass 1 is complete only when the frozen SHA, branch, architecture, public contracts, existing test inventory and initial risk register are all versioned and reproducible from repository content.
