# MUIR-RTM — MUIR 2.0

Baseline authority: `main@36d3d1b0750b0ded877e55953f223e2de1169a46`  
P0 certified SHA: `c5b6d0d6d18802a62d174bf450c95ebf1d0403c0` · run #73 / `36533739689` · FINAL GATE PASS  
P0 branch: `ui-a0/muir-p0-baseline`  
P1 branch: `ui-a0/muir-p1-design-contract`  
Owner: UI-A0  
Created: 2026-09-28 · P1 started: 2026-09-29

## Status vocabulary

`NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `PASS` · `FAIL` · `N/A_JUSTIFIED`

No requirement may be marked PASS without reproducible evidence tied to the baseline SHA.

## Requirements traceability

| REQ_ID | Description | Owner | Pass | Implementation | Test | Evidence | Gate | Rollback | Status |
|---|---|---|---|---|---|---|---|---|---|
| MUIR-P0-BASE-001 | Exact baseline SHA and toolchain are frozen and reproducible | UI-A0 | P0 | analysis/muir/* | clean rerun + metadata check | muir-baseline.json | MUIR-P0 | remove P0-only artifacts | PASS |
| MUIR-P0-CONT-001 | Preserve current visual continuity; P0 makes no product-design changes | UI-A0 | P0 | no product CSS/layout edits | git diff scope audit | P0 final report | MUIR-P0 | revert out-of-scope product changes | PASS |
| MUIR-P0-LOOP-001 | Core career loop remains behaviorally equivalent | UI-A0 | P0 | instrumentation/test only | session + UI regression | test logs | MUIR-P0 | revert P0 code | PASS |
| MUIR-P0-TOUCH-001 | Current touch targets and touch behavior are measured at phone viewports | UI-A0 | P0 | instrumented visual harness | viewport probes | __MUIR_METRICS__ + screenshots | MUIR-P0 | remove harness | PASS |
| MUIR-P0-TYPE-001 | Current typography scale and long-copy behavior are measured | UI-A0 | P0 | instrumented visual harness | typography/overflow probes | __MUIR_METRICS__ + screenshots | MUIR-P0 | remove harness | PASS |
| MUIR-P0-SAFE-001 | Safe-area behavior is measured without altering production layout | UI-A0 | P0 | instrumented visual harness | nav/layout probe | __MUIR_METRICS__ + screenshots | MUIR-P0 | remove harness | PASS |
| MUIR-P0-VIEW-001 | 360x800, 390x844 and 412x915 deterministic baselines are captured | UI-A0 | P0 | ui-fixtures + screenshot runner | screenshot generation | analysis/muir/screenshots | MUIR-P0 | remove harness | PASS |
| MUIR-P0-VIEW-002 | Mobile landscape and tablet/foldable are checked for severe breakage | UI-A0 | P0 | visual harness | responsive probes | evidence report | MUIR-P0 | remove harness | PASS |
| MUIR-ID-01 | Player name exists end-to-end: input -> persistence -> save/load -> PlayerView -> UI, or an explicit blocker is recorded | UI-A0 | P0 | audit only in P0 | identity matrix | analysis/muir/ID-01_PLAYER_IDENTITY.md | before P3 | no silent product implementation | PASS |
| MUIR-P0-GAME-001 | P0 introduces zero gameplay/RNG/probability/market/contract/selection changes | UI-A0 | P0 | scope guard | diff + deterministic tests | test logs + diff | MUIR-P0 | revert violating commit | PASS |
| MUIR-P0-PERSIST-001 | Existing save/load behavior is baselined and unchanged by P0 | UI-A0 | P0 | harness only | save/session regressions | logs | MUIR-P0 | revert P0 code | PASS |
| MUIR-P0-DB-001 | Football Database V2 presentation/persistence remains equivalent | UI-A0 | P0 | audit only | football platform/persistence tests | logs | MUIR-P0 | revert P0 code | PASS |
| MUIR-P0-ACTIONS-001 | Player Actions public contract/UI remains equivalent | UI-A0 | P0 | audit only | player-actions UI/session tests | logs | MUIR-P0 | revert P0 code | PASS |
| MUIR-K-01 | Web UI package graph is complete on Web, PlayCanvas and Android offline | UI-A0 | P0 | Android builder repaired + graph guard | package build/import probe | test-muir-package-graph + Android offline test | MUIR-P0 | revert package repair if invalid | PASS |
| MUIR-K-02 | Cinematic asset resolution works for present/missing/fallback paths on Web, PlayCanvas and Android offline | UI-A0 | P0 | resolver audit + Android graph repair | deterministic asset probes | analysis/muir/K-02_CINEMATIC_RESOLUTION.md | MUIR-P0 | revert invalid packaging change | PASS |
| MUIR-P0-VREG-001 | Deterministic screenshot evidence can detect visual regression without updating goldens to hide failures | UI-A0 | P0 | test-only harness + evidence index | screenshot/hash checks | evidence-index.json + PNG hashes | MUIR-P0 | remove harness | PASS |
| MUIR-P0-A11Y-001 | Existing accessibility behavior is baselined (focus, aria, reduced motion, touch semantics) | UI-A0 | P0 | instrumented harness | focus/touch/DOM probes | __MUIR_METRICS__ + logs | MUIR-P0 | remove harness | PASS |
| MUIR-P0-PERF-001 | Render p50/p95, frequency, DOM nodes, bundle bytes, Long Tasks, auto-sim update rate, focus churn and scroll churn are recorded | UI-A0 | P0 | test-only browser instrumentation | deterministic perf run | __MUIR_METRICS__ + muir-baseline.json | MUIR-P0 | remove instrumentation | PASS |
| MUIR-P0-PARITY-001 | Shared UI remains the authority across Web -> PlayCanvas -> Android offline | UI-A0 | P0 | audit/build harness | platform equivalence | platform report | MUIR-P0 | revert duplicate/adaptor drift | PASS |

## Initial findings

- Shared production UI authority is `web/game-ui.js` + `web/game-ui.css`.
- Web entrypoint mounts the shared UI directly.
- PlayCanvas builds `web/game-ui.js`, `web/cutscene-player.js`, club-name formatting and persistence into one generated bundle.
- Android offline copies the shared ESM UI and adapter modules into `android/app/src/main/assets`.
- **K-01 source defect repaired on the P0 branch:** Android offline now copies `web/cutscene-player.js`; Android/package-graph regression guards were added. Exact-head clean execution is still required before PASS.
- ID-01 audit is complete: current runtime has no authoritative player identity field across state, initial state, save validation, PlayerView or UI. The explicit P3 blocker is recorded in `analysis/muir/ID-01_PLAYER_IDENTITY.md`.


## P1 — Design contract and semantic system

| REQ_ID | Description | Owner | Pass | Implementation | Test | Evidence | Gate | Rollback | Status |
|---|---|---|---|---|---|---|---|---|---|
| MUIR-P1-INV-001 | Current colors, surfaces, blur, shadow, radius, spacing, typography, states and primitives are inventoried and classified | UI-A0 | P1.1 | docs/muir/visual-inventory.md | source inventory review | visual-inventory.md | MUIR-P1 | remove P1 docs | PASS |
| MUIR-P1-CONT-001 | 70–80% visual identity continuity is formalized before normalization | UI-A0 | P1.1 | design continuity guard | protection review | visual-inventory.md | MUIR-P1 | revert contract | PASS |
| MUIR-P1-PROT-001 | Protected/adaptable/replaceable authority is formal and traceable | UI-A0 | P1.1 | docs/muir/surface-protection-contract.md | contract review | surface-protection-contract.md | MUIR-P1 | revert contract | PASS |
| MUIR-P1-TOK-001 | CSS-compatible semantic tokens derive from current production values | UI-A0 | P1.2 | docs/muir/tokens.css + token docs | token/source mapping | design-contract.md | MUIR-P1 | remove token artifact | PASS |
| MUIR-P1-SURF-001 | Background/surface/elevated/overlay/glass semantics are defined without changing screen structure | UI-A0 | P1.2 | semantic surface contract | mapping review | design-contract.md | MUIR-P1 | remove contract | PASS |
| MUIR-P1-NORM-001 | Every proposed normalization records ACTUAL/PROPOSED/COMPONENTS/REASON/RISK/ROLLBACK | UI-A0 | P1.2 | normalization matrix | completeness review | design-contract.md | MUIR-P1 | reject individual normalization | PASS |
| MUIR-P1-COMP-001 | Semantic component contracts use only public runtime data | UI-A0 | P1.3 | component semantic matrix | field/source audit | component-semantic-matrix.md | MUIR-P1 | remove component contract | PASS |
| MUIR-P1-COPY-001 | Narrative/operational/system/feedback/error/help copy roles are defined | UI-A0 | P1.4 | copy contract | copy classification review | copy-contract.md | MUIR-P1 | remove contract | NOT_STARTED |
| MUIR-P1-ICON-001 | One coherent icon family contract is defined | UI-A0 | P1.4 | icon contract | icon inventory review | icon-contract.md | MUIR-P1 | retain existing SVGs | NOT_STARTED |
| MUIR-P1-AB-001 | One evidence-based A/B rubric covers all ten required criteria | UI-A0 | P1.4 | A/B rubric | rubric completeness review | ab-rubric.md | MUIR-P1 | remove rubric | NOT_STARTED |
| MUIR-P1-VDR-001 | VDR template and four required proposed decisions exist | UI-A0 | P1.4 | docs/muir/decisions/* | VDR schema review | VDR files | MUIR-P1 | reject/supersede VDR | NOT_STARTED |
| MUIR-P1-SCOPE-001 | P1 redesigns no complete production screen and changes no gameplay/data authority | UI-A0 | P1.4 | docs/tokens only; production UI unchanged | diff scope audit | P1 scope evidence | MUIR-P1 | revert out-of-scope change | IN_PROGRESS |
