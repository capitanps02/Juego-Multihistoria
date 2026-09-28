# MUIR-RTM — MUIR 2.0

Baseline authority: `main@36d3d1b0750b0ded877e55953f223e2de1169a46`  
P0 branch: `ui-a0/muir-p0-baseline`  
Owner: UI-A0  
Created: 2026-09-28

## Status vocabulary

`NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `PASS` · `FAIL` · `N/A_JUSTIFIED`

No requirement may be marked PASS without reproducible evidence tied to the baseline SHA.

## Requirements traceability

| REQ_ID | Description | Owner | Pass | Implementation | Test | Evidence | Gate | Rollback | Status |
|---|---|---|---|---|---|---|---|---|---|
| MUIR-P0-BASE-001 | Exact baseline SHA and toolchain are frozen and reproducible | UI-A0 | P0 | analysis/muir/* | clean rerun + metadata check | muir-baseline.json | MUIR-P0 | remove P0-only artifacts | IN_PROGRESS |
| MUIR-P0-CONT-001 | Preserve current visual continuity; P0 makes no product-design changes | UI-A0 | P0 | no product CSS/layout edits | git diff scope audit | P0 final report | MUIR-P0 | revert out-of-scope product changes | IN_PROGRESS |
| MUIR-P0-LOOP-001 | Core career loop remains behaviorally equivalent | UI-A0 | P0 | instrumentation/test only | session + UI regression | test logs | MUIR-P0 | revert P0 code | NOT_STARTED |
| MUIR-P0-TOUCH-001 | Current touch targets and touch behavior are measured at phone viewports | UI-A0 | P0 | instrumented visual harness | viewport probes | __MUIR_METRICS__ + screenshots | MUIR-P0 | remove harness | IN_PROGRESS |
| MUIR-P0-TYPE-001 | Current typography scale and long-copy behavior are measured | UI-A0 | P0 | instrumented visual harness | typography/overflow probes | __MUIR_METRICS__ + screenshots | MUIR-P0 | remove harness | IN_PROGRESS |
| MUIR-P0-SAFE-001 | Safe-area behavior is measured without altering production layout | UI-A0 | P0 | instrumented visual harness | nav/layout probe | __MUIR_METRICS__ + screenshots | MUIR-P0 | remove harness | IN_PROGRESS |
| MUIR-P0-VIEW-001 | 360x800, 390x844 and 412x915 deterministic baselines are captured | UI-A0 | P0 | ui-fixtures + screenshot runner | screenshot generation | analysis/muir/screenshots | MUIR-P0 | remove harness | NOT_STARTED |
| MUIR-P0-VIEW-002 | Mobile landscape and tablet/foldable are checked for severe breakage | UI-A0 | P0 | visual harness | responsive probes | evidence report | MUIR-P0 | remove harness | NOT_STARTED |
| MUIR-ID-01 | Player name exists end-to-end: input -> persistence -> save/load -> PlayerView -> UI, or an explicit blocker is recorded | UI-A0 | P0 | audit only in P0 | identity matrix | analysis/muir/ID-01_PLAYER_IDENTITY.md | before P3 | no silent product implementation | PASS |
| MUIR-P0-GAME-001 | P0 introduces zero gameplay/RNG/probability/market/contract/selection changes | UI-A0 | P0 | scope guard | diff + deterministic tests | test logs + diff | MUIR-P0 | revert violating commit | IN_PROGRESS |
| MUIR-P0-PERSIST-001 | Existing save/load behavior is baselined and unchanged by P0 | UI-A0 | P0 | harness only | save/session regressions | logs | MUIR-P0 | revert P0 code | NOT_STARTED |
| MUIR-P0-DB-001 | Football Database V2 presentation/persistence remains equivalent | UI-A0 | P0 | audit only | football platform/persistence tests | logs | MUIR-P0 | revert P0 code | NOT_STARTED |
| MUIR-P0-ACTIONS-001 | Player Actions public contract/UI remains equivalent | UI-A0 | P0 | audit only | player-actions UI/session tests | logs | MUIR-P0 | revert P0 code | NOT_STARTED |
| MUIR-K-01 | Web UI package graph is complete on Web, PlayCanvas and Android offline | UI-A0 | P0 | Android builder repaired + graph guard | package build/import probe | test-muir-package-graph + Android offline test | MUIR-P0 | revert package repair if invalid | IN_PROGRESS |
| MUIR-K-02 | Cinematic asset resolution works for present/missing/fallback paths on Web, PlayCanvas and Android offline | UI-A0 | P0 | resolver audit + Android graph repair | deterministic asset probes | analysis/muir/K-02_CINEMATIC_RESOLUTION.md | MUIR-P0 | revert invalid packaging change | IN_PROGRESS |
| MUIR-P0-VREG-001 | Deterministic screenshot evidence can detect visual regression without updating goldens to hide failures | UI-A0 | P0 | test-only harness + evidence index | screenshot/hash checks | evidence-index.json + PNG hashes | MUIR-P0 | remove harness | IN_PROGRESS |
| MUIR-P0-A11Y-001 | Existing accessibility behavior is baselined (focus, aria, reduced motion, touch semantics) | UI-A0 | P0 | instrumented harness | focus/touch/DOM probes | __MUIR_METRICS__ + logs | MUIR-P0 | remove harness | IN_PROGRESS |
| MUIR-P0-PERF-001 | Render p50/p95, frequency, DOM nodes, bundle bytes, Long Tasks, auto-sim update rate, focus churn and scroll churn are recorded | UI-A0 | P0 | test-only browser instrumentation | deterministic perf run | __MUIR_METRICS__ + muir-baseline.json | MUIR-P0 | remove instrumentation | IN_PROGRESS |
| MUIR-P0-PARITY-001 | Shared UI remains the authority across Web -> PlayCanvas -> Android offline | UI-A0 | P0 | audit/build harness | platform equivalence | platform report | MUIR-P0 | revert duplicate/adaptor drift | IN_PROGRESS |

## Initial findings

- Shared production UI authority is `web/game-ui.js` + `web/game-ui.css`.
- Web entrypoint mounts the shared UI directly.
- PlayCanvas builds `web/game-ui.js`, `web/cutscene-player.js`, club-name formatting and persistence into one generated bundle.
- Android offline copies the shared ESM UI and adapter modules into `android/app/src/main/assets`.
- **K-01 source defect repaired on the P0 branch:** Android offline now copies `web/cutscene-player.js`; Android/package-graph regression guards were added. Exact-head clean execution is still required before PASS.
- ID-01 audit is complete: current runtime has no authoritative player identity field across state, initial state, save validation, PlayerView or UI. The explicit P3 blocker is recorded in `analysis/muir/ID-01_PLAYER_IDENTITY.md`.
