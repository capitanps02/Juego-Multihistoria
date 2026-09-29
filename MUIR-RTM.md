# MUIR-RTM — MUIR 2.0

Baseline authority: `main@36d3d1b0750b0ded877e55953f223e2de1169a46`  
P0 certified SHA: `c5b6d0d6d18802a62d174bf450c95ebf1d0403c0` · run #73 / `36533739689` · FINAL GATE PASS  
P0 branch: `ui-a0/muir-p0-baseline`  
P1 branch: `ui-a0/muir-p1-design-contract`  
P1 certified SHA: `dcd9087cb68a73ed9a20db85e1ee96b434942826` · run #1 / `36537442358` · DESIGN-CONTRACT GATE PASS  
P2 branch: `ui-a1/muir-p2-shell`  
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
| MUIR-P1-COPY-001 | Narrative/operational/system/feedback/error/help copy roles are defined | UI-A0 | P1.4 | copy contract | copy classification review | copy-contract.md | MUIR-P1 | remove contract | PASS |
| MUIR-P1-ICON-001 | One coherent icon family contract is defined | UI-A0 | P1.4 | icon contract | icon inventory review | icon-contract.md | MUIR-P1 | retain existing SVGs | PASS |
| MUIR-P1-AB-001 | One evidence-based A/B rubric covers all ten required criteria | UI-A0 | P1.4 | A/B rubric | rubric completeness review | ab-rubric.md | MUIR-P1 | remove rubric | PASS |
| MUIR-P1-VDR-001 | VDR template and four required proposed decisions exist | UI-A0 | P1.4 | docs/muir/decisions/* | VDR schema review | VDR files | MUIR-P1 | reject/supersede VDR | PASS |
| MUIR-P1-SCOPE-001 | P1 redesigns no complete production screen and changes no gameplay/data authority | UI-A0 | P1.4 | docs/tokens only; production UI unchanged | diff scope audit | P1 scope evidence | MUIR-P1 | revert out-of-scope change | PASS |


## P2 — Shell móvil, topbar, navegación y safe areas

P2 implementation evidence: run #31 / `36541438067` · head `1a4d18ae9d784c0573ab40e2617764dec5c21ec3` · SUCCESS  
P2 visual artifact: `muir-p2-1a4d18ae9d784c0573ab40e2617764dec5c21ec3`  
P2 final certified SHA: emitted by the exact-head Final executable P2 gate (non-self-referential record)

| REQ_ID | Description | Owner | Pass | Implementation | Test | Evidence | Gate | Rollback | Status |
|---|---|---|---|---|---|---|---|---|---|
| MUIR-P2-BASE-001 | P2 starts exactly from the certified P1 SHA | UI-A1 | P2.1 | branch ancestry | exact SHA/merge-base guard | scripts/test-muir-p2-shell.mjs | MUIR-P2-SHELL | recreate branch from P1 certified SHA | PASS |
| MUIR-P2-SAFE-001 | Global shell consumes top/right/bottom/left safe-area insets without changing gameplay | UI-A1 | P2.1–P2.4 | web/game-ui.css | static guard + simulated insets | safe-area.json + run #31 | MUIR-P2-SHELL | revert safe-area variables/padding | PASS |
| MUIR-P2-NAV-001 | Six real destinations remain directly reachable and the 5-vs-6 decision is evidence-resolved | UI-A1 | P2.1–P2.5 | unchanged web/game-ui.js + nav CSS | shell contract + A/B browser probe | VDR-NAV-001 + nav-ab.json | MUIR-P2-NAV | revert nav styling | PASS |
| MUIR-P2-TOUCH-001 | Shell navigation/topbar controls meet at least 48 px touch height | UI-A1 | P2.1–P2.4 | date/pause 48 px; nav 53 px portrait / 48 px landscape | browser geometry + static cascade guard | safe-area.json + topbar.json | MUIR-P2-SHELL | restore P1 geometry | PASS |
| MUIR-P2-TYPE-001 | Primary mobile navigation labels do not fall below P1 caption floor | UI-A1 | P2.1–P2.4 | nav mobile 10 px | browser typography probe | safe-area.json + browser artifact | MUIR-P2-SHELL | restore P1 typography | PASS |
| MUIR-P2-TOP-001 | Mobile topbar remains readable and non-overlapping at 360/390/412 widths | UI-A1 | P2.2–P2.4 | compact topbar + authoritative 48 px pause cascade | auto-running + auto-paused geometry probe | topbar.json | MUIR-P2-VIEW | revert mobile topbar tuning | PASS |
| MUIR-P2-VIEW-001 | 360x800, 390x844 and 412x915 shell layouts are visually verified with no horizontal overflow | UI-A1 | P2.2–P2.4 | shared UI | deterministic 69-capture matrix | screenshots + browser-baseline.json | MUIR-P2-VIEW | revert offending shell rule | PASS |
| MUIR-P2-AUX-001 | Landscape and tablet shell are checked for severe breakage and safe-area behavior | UI-A1 | P2.2–P2.4 | compact short-landscape shell + shared tablet shell | 844x390 + 768x1024 captures and simulated insets | screenshots + safe-area.json | MUIR-P2-VIEW | revert compact landscape rule | PASS |
| MUIR-P2-A11Y-001 | Focus order, aria-current, keyboard navigation and visible focus remain correct | UI-A1 | P2.3–P2.4 | existing JS semantics + shell CSS | keyboard/focus/ARIA + AXE | a11y.json + axe.json | MUIR-P2-A11Y | revert shell-only styling | PASS |
| MUIR-P2-PARITY-001 | The same shell presentation authority remains shared by Web, PlayCanvas and Android offline | UI-A1 | P2.1–P2.4 | web/game-ui.css single authority | package graph + PlayCanvas + Android offline + Android safe-area smoke | run #31 | MUIR-P2-PARITY | revert P2 shell CSS | PASS |
| MUIR-P2-SCOPE-001 | P2 changes no gameplay, RNG, persistence, public data, DB or Player Actions authority | UI-A1 | P2.1–P2.5 | CSS + tests/workflow/RTM/VDR only | exact diff + changed-file scope guard | run #31 + PR #872 diff | MUIR-P2-SCOPE | revert out-of-scope commit | PASS |

### P2 decision state

- `VDR-NAV-001`: ACCEPTED — preserve all six direct destinations. Five tabs gains only ~11–13 px per visible tab while moving `Tu partida` from 39–41 px from the bottom to 761.5–874.5 px from the bottom; both variants otherwise pass 10 px labels, 53 px portrait targets and zero overflow.
- `VDR-IMMERSIVE-001`: remains PROPOSED and unchanged by P2; no immersive information-architecture change is made.
- Safe-area ownership is centralized at the shared `.mh` shell, including status overlays and compact short-landscape handling.
- `web/game-ui.js` remains unchanged from P1 certified authority.
- Run #31 passed shell contract, deterministic viewport matrix, simulated safe areas, keyboard/ARIA, AXE, compact auto-sim topbar, navigation A/B, shared package graph, PlayCanvas, Android offline clean package, Android safe-area parity and Android offline tests.
