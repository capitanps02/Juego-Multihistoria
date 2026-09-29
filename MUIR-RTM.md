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

`NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `READY_FOR_GATE` · `PASS` · `FAIL` · `N/A_JUSTIFIED`

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


## P3 — Home vertical y core loop

Authorized predecessor: `315a46d87ffc15f688910f4dbc91651d935c9e7f` · ID-01 exact-head certification run `36551396008` SUCCESS · predecessor exception recorded in #873  
P3 branch: `ui-a2/muir-p3-home`  
P3 PR: #875

| REQ_ID | Description | Owner | Pass | Implementation | Test | Evidence | Gate | Rollback | Status |
|---|---|---|---|---|---|---|---|---|---|
| MUIR-P3-BASE-001 | P3 starts from the exact authorized P2+ID-01 predecessor | UI-A2 | P3.1 | branch ancestry | merge-base + exact-head guards | test-muir-p3-home + final gate | MUIR-P3 | recreate branch from authorized predecessor | PASS |
| MUIR-P3-ID-001 | Home identifies the protagonist from public PlayerView identity plus age, position and club | UI-A2 | P3.1–P3.3 | web/game-ui.js Home hero | real identity edit + long-name browser probe | home-core-loop.json | MUIR-P3-ID | revert Home hero only | PASS |
| MUIR-P3-LOOP-001 | Home makes the current primary career action immediately legible without changing command semantics | UI-A2 | P3.1–P3.3 | Home next/core-loop block | mainAction/run equivalence + browser CTA geometry | static gate + home-core-loop.json | MUIR-P3-LOOP | restore predecessor Home composition | PASS |
| MUIR-P3-PEND-001 | Decision, offer and result pending states receive priority and are never hidden by normal Home content | UI-A2 | P3.2–P3.3 | urgent Home ordering | deterministic decision/offer/result fixtures | home-core-loop.json | MUIR-P3-LOOP | restore predecessor ordering | PASS |
| MUIR-P3-SUM-001 | Summary is presented as a continuation state, not a fabricated pending event | UI-A2 | P3.3 | existing public simulation summary + Home CTA | deterministic period-summary fixture | home-core-loop.json | MUIR-P3-LOOP | restore predecessor summary composition | PASS |
| MUIR-P3-DATA-001 | Home uses only public runtime data and introduces no GRL, stars, future match or other invented authority | UI-A2 | P3.1–P3.6 | PlayerView-derived UI only | static scope/data guard | test-muir-p3-home + final gate | MUIR-P3-SCOPE | revert violating Home field | PASS |
| MUIR-P3-TOUCH-001 | Home primary and optional secondary core-loop actions meet 48 px touch height | UI-A2 | P3.3–P3.4 | P3 Home CSS | 360/390/412 browser geometry | home-core-loop.json + home-a11y.json | MUIR-P3-A11Y | revert P3 action sizing | PASS |
| MUIR-P3-VIEW-001 | 360x800, 390x844 and 412x915 Home states have no horizontal overflow and keep the primary action usable | UI-A2 | P3.3–P3.5 | shared Home CSS | deterministic viewport matrix + Home probe | screenshots + browser-baseline + Home evidence | MUIR-P3-VIEW | revert offending P3 layout rule | PASS |
| MUIR-P3-AUX-001 | Landscape and tablet remain free of severe P3 regressions | UI-A2 | P3.5 | shared responsive CSS | 844x390 + 768x1024 deterministic captures | screenshot artifact | MUIR-P3-VIEW | revert P3 responsive rule | PASS |
| MUIR-P3-A11Y-001 | Home actions remain keyboard-focusable, AXE has no serious/critical findings, and 130% text causes no horizontal overflow | UI-A2 | P3.4–P3.5 | native controls + wrapping CSS | P3 Home a11y/text probe + P2 shell regression | home-a11y.json + P2 evidence | MUIR-P3-A11Y | revert P3 typography/layout rule | PASS |
| MUIR-P3-ACTIONS-001 | Player Actions remains optional and secondary on Home | UI-A2 | P3.2–P3.4 | existing optional entry retained | static guard + browser probe | test-muir-p3-home + Home evidence | MUIR-P3-LOOP | restore predecessor optional entry | PASS |
| MUIR-P3-PARITY-001 | Shared Home presentation remains authoritative across Web, PlayCanvas and Android offline | UI-A2 | P3.5–P3.6 | web/game-ui.js + web/game-ui.css | package graph + PlayCanvas + Android offline | exact-head workflow | MUIR-P3-PARITY | revert P3 shared UI changes | PASS |
| MUIR-P3-SCOPE-001 | P3 changes no engine/gameplay/RNG/persistence/DB/narrative/market authority | UI-A2 | P3.1–P3.6 | UI + tests/docs/workflow only | exact diff scope guard | final executable P3 gate | MUIR-P3-SCOPE | revert out-of-scope commit | PASS |

P3 rows are `PASS`; the formal gate remains subject to executable exact-head verification of this exact RTM/P3_GATE commit.


## P4 — Microcopy, onboarding y ayuda contextual

P4 authorized predecessor: `3bb551e0701626d909cd42ffaa35b74e41d159b5` · P3 exact-head run `36556917840` SUCCESS  
P4 branch: `ui-a2/muir-p4-microcopy`  
P4 inventory: 283 user-facing/semantic literal occurrences · 263 frozen KEEP · 20 controlled ACORTA/MUEVE/ELIMINA  
P4 measured operational reduction: 561 → 366 chars (**34.8%**) · 91 → 61 words (**33.0%**)  
Protected narrative reduction: **0**

| REQ_ID | Description | Owner | Pass | Implementation | Test | Evidence | Gate | Rollback | Status |
|---|---|---|---|---|---|---|---|---|---|
| MUIR-P4-COPY-001 | Microcopy inventory covers authorized P4 surfaces before replacement | UI-A2 | P4.1 | analysis/muir/p4/microcopy-inventory.{md,json} | reproducible source scan + classification | inventory JSON/MD | MUIR-P4 | revert P4 copy commits | PASS |
| MUIR-P4-COPY-002 | Copy is classified as narrative/operational/instruction/redundant/feedback/error/help | UI-A2 | P4.1 | inventory classification | count/action audit | inventory JSON | MUIR-P4 | restore predecessor copy | PASS |
| MUIR-P4-COPY-003 | Operational copy reduction is selective and measured, excluding protected narrative | UI-A2 | P4.2 | web/game-ui.js | exact before/after metrics + semantic guard | reduction-metrics.json | MUIR-P4 | revert individual copy | PASS |
| MUIR-P4-HELP-001 | Permanent “Cómo se juega” footprint is reduced while help remains accessible | UI-A2 | P4.2–P4.3 | native details/summary in shared Home UI | browser help/AXE/text-scale probe | p4-a11y-help.json + viewport artifact | MUIR-P4 | restore full help panel | PASS |
| MUIR-P4-TONE-001 | Tone is direct, youthful and non-infantile without changing canonical gameplay terminology | UI-A2 | P4.2–P4.3 | controlled copy edits only | candidate register + browser regression | inventory + screenshots | MUIR-P4 | revert tone edit | PASS |
| MUIR-P4-SEM-001 | Decision/result semantics remain unchanged | UI-A2 | P4.3 | protected functions byte-identical to P3 | scripts/test-muir-p4-copy.mjs + P3 regressions | exact-head workflow | MUIR-P4 | revert violating edit | PASS |
| MUIR-P4-CONTRACT-001 | Contract/offer/delegation semantics remain unchanged | UI-A2 | P4.3 | renderOffer + destructive blocks protected | exact semantic guard | exact-head workflow | MUIR-P4 | revert violating edit | PASS |
| MUIR-P4-A11Y-001 | Accessible names/help/focus remain usable at required text scales | UI-A2 | P4.3 | native details/summary + existing accessible stat help | AXE + keyboard + 100/130/180% text | p4-a11y-help.json | MUIR-P4 | restore predecessor presentation | PASS |

### P4 candidate gate state

- P3 exact predecessor retained; branch is based directly on certified P3 SHA.
- Gameplay/runtime/RNG/persistence/DB changes: **0**.
- Decision, offer and destructive save/import blocks are guarded against semantic drift.
- Player Actions remains explicitly optional.
- “Cómo se juega” is optional contextual help using a native disclosure; no first-run persistence or tutorial game feature was added.
- Deterministic 69-capture matrix: PASS on candidate QA.
- 360×800 / 390×844 / 412×915 + AXE + 100/130/180% text: PASS on candidate QA.
- P3 Home and P2 shell regressions: PASS on candidate QA.
- Exact-head platform + final static certification is authoritative for the final P4 gate.


## P5 — Auto-simulación y Period Summary

P5 authorized predecessor: `45371a41908e2ecdac71cfc5f2bf855f086f7866` · P4 exact-head run `36565579642` SUCCESS  
P5 branch: `ui-a3/muir-p5-autosim`  
P5 PR: #877  
Runtime/GameSession/RNG/persistence authority changes: **NONE**
P5 candidate certification: `c104d292b0f168ff913d746e9635e52dc6799757` · exact-head run `36571220138` SUCCESS  
Candidate artifact: `muir-p5-c104d292b0f168ff913d746e9635e52dc6799757` · `sha256:c09cf8c57a82c35920c187cd2a9a51df4ba691de3a9e8fab750e88c8c8f96621`  
Measured 390×844 normal-tick presentation: **2.844141069397054 Hz**, **0** full-shell rebuilds, **0** focus churn, scroll **320→320**; predecessor dedicated probe: **7.642338555598098 Hz**, **4** full rebuilds in 2 ticks, scroll **320→0**.  
Command/snapshot/RNG-result/save-load equivalence: **PASS**. 360×800 / 390×844 / 412×915 / 844×390 state matrix + AXE: **PASS**. PlayCanvas + Android offline packaging/regression: **PASS**. Physical Android lifecycle smoke remains **DEFERRED to P11/P12**.  
Final exact-head workflow on the RTM/gate-closing commit is authoritative for the final certified P5 SHA.

| REQ_ID | Description | Owner | Pass | Implementation | Test | Evidence | Gate | Rollback | Status |
|---|---|---|---|---|---|---|---|---|---|
| MUIR-P5-STATE-001 | Dedicated running/paused auto-simulation presentation uses only public simulation state | UI-A3 | P5.2 | web/game-ui.js + CSS | state/a11y browser probe | p5-states-a11y.json | MUIR-P5 | revert P5 state panel | PASS |
| MUIR-P5-PROG-001 | Progress is derived only as elapsedDays / (maxWeeks × 7), clamped and presentation-only | UI-A3 | P5.2 | autoSimulationProgress | static guard + browser state probe | P5 baseline + p5-states-a11y.json | MUIR-P5 | remove progress surface | PASS |
| MUIR-P5-CONTROL-001 | Pause/resume/stop map to existing SessionCommand semantics; stop remains paused-only | UI-A3 | P5.2 | existing command path + Home controls | T14 runtime + static guard | exact-head CI | MUIR-P5 | restore P4 controls | PASS |
| MUIR-P5-RENDER-001 | Normal auto ticks do not rebuild the full shell | UI-A3 | P5.3 | quiet auto-step + partial presentation patch | cadence/focus/scroll probe | p5-autosim-probe.json | MUIR-P5 | revert quiet path | PASS |
| MUIR-P5-RENDER-002 | Measured normal visual refresh is <= 4 Hz while logical cadence remains unchanged | UI-A3 | P5.3 | 280 ms minimum presentation cadence | measured telemetry assertion | p5-autosim-probe.json | MUIR-P5 | revert scheduler | PASS |
| MUIR-P5-FOCUS-001 | Focus does not churn during normal logical ticks | UI-A3 | P5.3 | partial DOM updates only | focused pause-control telemetry | p5-autosim-probe.json | MUIR-P5 | revert partial patch | PASS |
| MUIR-P5-SCROLL-001 | Main scroll position does not reset during normal logical ticks | UI-A3 | P5.3 | shell/main retained | direct scrollTop telemetry | p5-autosim-probe.json | MUIR-P5 | revert partial patch | PASS |
| MUIR-P5-INT-001 | Public interruption and decision/offer priority remain unchanged and force immediate presentation | UI-A3 | P5.3–P5.4 | critical transitions escape quiet path | T14 + state probe | exact-head CI | MUIR-P5 | revert P5 presentation path | PASS |
| MUIR-P5-SUM-001 | Period Summary presents only public period data and public interruption reason | UI-A3 | P5.4 | existing summary refined/retained | period report + state probe | p5-states-a11y.json | MUIR-P5 | restore P4 summary | PASS |
| MUIR-P5-SUM-002 | Continue simulation and Home flow retain existing command/navigation semantics | UI-A3 | P5.4 | existing mainAction/Home | browser state + command equivalence | p5-equivalence.json | MUIR-P5 | restore P4 flow | PASS |
| MUIR-P5-EQ-001 | UI issues the same logical auto SessionCommand sequence as direct GameSession control | UI-A3 | P5.5 | test-only command log | browser equivalence probe | p5-equivalence.json | MUIR-P5 | revert P5 run path | PASS |
| MUIR-P5-EQ-002 | Same start snapshot yields the same final comparable snapshot and result state | UI-A3 | P5.5 | no runtime changes | browser/direct snapshot comparison | p5-equivalence.json | MUIR-P5 | revert P5 run path | PASS |
| MUIR-P5-RNG-001 | P5 introduces no RNG consumption or simulation-result drift | UI-A3 | P5.5 | UI-only changes | direct comparable state/RNG equivalence + runtime tests | p5-equivalence.json | MUIR-P5 | revert P5 | PASS |
| MUIR-P5-SAVE-001 | Save/load retains the exact post-auto state and public simulation projection | UI-A3 | P5.5 | persistence authority unchanged | equivalence + T14 save/load | p5-equivalence.json | MUIR-P5 | revert P5 | PASS |
| MUIR-P5-BG-001 | Browser lifecycle smoke does not duplicate running timers or resume paused simulation | UI-A3 | P5.4–P5.5 | existing timer lifecycle | Chromium freeze/active smoke | p5-background-resume.json | MUIR-P5 | revert scheduler | PASS |
| MUIR-P5-VIEW-001 | Running/paused/summary/interruption pass 360×800, 390×844, 412×915 and landscape without horizontal overflow | UI-A3 | P5.5 | shared responsive UI | state/a11y + deterministic capture matrix | screenshots + p5-states-a11y.json | MUIR-P5 | revert offending CSS | PASS |
| MUIR-P5-A11Y-001 | Controls/progress/live status remain keyboard-usable, visible-focus compatible and free of serious/critical AXE regressions | UI-A3 | P5.5 | native controls/progress/live region | AXE + geometry + regression probes | p5-states-a11y.json | MUIR-P5 | revert P5 a11y change | PASS |
| MUIR-P5-PARITY-001 | Shared UI packages for PlayCanvas and Android offline still build/test from the same web authority | UI-A3 | P5.5 | web/game-ui shared authority | package graph + PlayCanvas + Android offline | exact-head CI | MUIR-P5 | revert P5 shared UI | PASS |
| MUIR-P5-SCOPE-001 | P5 changes no src runtime/gameplay/RNG/DB/market/contracts/Player Actions authority | UI-A3 | P5.1–P5.5 | UI/tests/docs/workflow only | exact diff/static guard | scripts/test-muir-p5-autosim.mjs | MUIR-P5 | revert out-of-scope change | PASS |


## P6 — Player Actions: integración visual y opcionalidad

P6 authorized predecessor: `603797a9b9bae15bfb7382603111673573f873cc` · P5 exact-head workflow `36572560420` SUCCESS  
P6 branch: `ui-a4/muir-p6-player-actions`  
Runtime/GameSession/RNG/persistence/catalog/balance changes: **NONE**  
Canonical public categories preserved: **7** · canonical actions preserved: **20** · target kinds: `none`, `coach`, `agent`, `teammate`.  
P6 exact-head workflow and `scripts/test-muir-p6-final-gate.mjs` are authoritative for final certification.

| REQ_ID | Description | Owner | Pass | Implementation | Test | Evidence | Gate | Rollback | Status |
|---|---|---|---|---|---|---|---|---|---|
| P6-CAT-001 | Preserve the seven public Player Actions categories exactly as projected by PlayerView | UI-A4 | P6.1–P6.5 | existing PublicPlayerActionsView only | baseline + static contract + deterministic menu fixture | baseline-audit.json + screenshots | MUIR-P6 | revert P6 UI commits | PASS |
| P6-CAT-002 | Category presentation uses the P1 SVG icon family and moderate accents without emoji/resource semantics | UI-A4 | P6.2 | web/game-ui.js + CSS | static guard + visual matrix | browser-baseline + screenshots | MUIR-P6 | restore predecessor category cards | PASS |
| P6-ACT-001 | ActionCard remains one-column/mobile-scannable and contains public data only | UI-A4 | P6.3 | shared web Player Actions renderer | static + browser + viewport matrix | screenshots + p6 browser evidence | MUIR-P6 | restore predecessor ActionCard | PASS |
| P6-AVAIL-001 | Available/unavailable state is textual and never color-only; runtime availability is unchanged | UI-A4 | P6.3–P6.5 | presentation status labels only | P5↔P6 equivalence + browser states | equivalence-report.json + browser evidence | MUIR-P6 | remove status decoration | PASS |
| P6-COOL-001 | Exact public cooldown expiry is shown without approximation or duplicated ISO reason; cooldown authority is unchanged | UI-A4 | P6.3–P6.5 | cooldownText presentation only | equivalence + cooldown fixture | equivalence-report.json + screenshots | MUIR-P6 | restore exact raw reason only | PASS |
| P6-REASON-001 | Public unavailableReason is preserved when it carries non-duplicate meaning | UI-A4 | P6.3 | public reason rendering | browser/state/static guard | screenshots + browser evidence | MUIR-P6 | restore predecessor reason presentation | PASS |
| P6-TGT-001 | none/coach/agent/teammate flows use only canonical public targets and selected semantics | UI-A4 | P6.4–P6.5 | target renderer + test fixtures | target fixtures + AXE + equivalence | p6 browser evidence + screenshots | MUIR-P6 | revert target presentation | PASS |
| P6-OPT-001 | Options preserve public wording/order/disabled state and canonical action payload | UI-A4 | P6.4–P6.5 | existing option loop/command path | static command guard + equivalence | equivalence-report.json | MUIR-P6 | restore predecessor option presentation | PASS |
| P6-RES-001 | Result screen renders exact public lastResult with no invented success/reward copy | UI-A4 | P6.4–P6.5 | result h1 + public lastResult | result fixture + static guard | screenshot + browser evidence | MUIR-P6 | restore predecessor result surface | PASS |
| P6-NAV-001 | Back/another-action/Home flows have no dead ends and Player Actions navigation targets are >=48px | UI-A4 | P6.4–P6.5 | presentation navigation only | geometry + focus + browser flow | p6 browser evidence | MUIR-P6 | revert navigation CSS | PASS |
| P6-OPTNL-001 | SIMULAR stays primary; Player Actions stays explicitly optional and secondary | UI-A4 | P6.1–P6.5 | no core-loop authority changes | P3 regression + static guard | Home P3 evidence + P6 evidence | MUIR-P6 | revert P6 UI | PASS |
| P6-ZERO-001 | Never opening Player Actions yields the exact same P5 snapshot sequence | UI-A4 | P6.5 | no runtime changes | exact P5 worktree comparison | equivalence-report.json | MUIR-P6 | revert P6 | PASS |
| P6-CMD-001 | Same action/target/options emits the same SessionCommand and final snapshot as P5 | UI-A4 | P6.5 | existing run('player_action') | exact P5 worktree comparison + double-submit probe | equivalence-report.json + p6 browser evidence | MUIR-P6 | revert P6 | PASS |
| P6-A11Y-001 | Player Actions supports focus return, selected semantics, >=48px controls, AXE and 100/130/180% text | UI-A4 | P6.3–P6.5 | native controls + P6 responsive CSS | dedicated Chromium/AXE/text probe | p6-browser-player-actions.json | MUIR-P6 | revert offending P6 style | PASS |
| P6-RESP-001 | 360x800, 390x844, 412x915 and landscape remain usable without horizontal overflow | UI-A4 | P6.2–P6.5 | shared responsive CSS | 90-capture matrix + dedicated P6 probe | browser-baseline.json + screenshots | MUIR-P6 | revert offending P6 layout rule | PASS |

### P6 candidate gate state

- P3 certified SHA: `3bb551e0701626d909cd42ffaa35b74e41d159b5`.
- P4 certified SHA: `45371a41908e2ecdac71cfc5f2bf855f086f7866`.
- P5 certified SHA: `603797a9b9bae15bfb7382603111673573f873cc`.
- P6 branch was created directly from the exact P5 certified SHA.
- Gameplay/balance/catalog/availability/cooldown/facts/intents/save-schema changes: **0**.
- Invented counters/resources/consequences: **0**.
- Candidate code SHA `435caa6546b303e5977547f09663260cf9ca823c` completed workflow `36589963173` with SUCCESS, including the executable final gate. The RTM-closing commit must itself repeat that exact-head workflow successfully; until then the branch-level certification is still pending.


## P7 — Componentes semánticos Football Database V2

P7 authorized predecessor: `e2b54ec654a32b8665925bec7811363003e482ed` · P6 exact-head run `36591367106` SUCCESS  
P7 branch: `ui-a5/muir-p7-semantic-db`  
Football Database V2: `world-v2-a2-2026-09-28` · canonical release train PR #865  
P7 scope: presentation-only; no `src/**`, DB, market, offer authority, gameplay, RNG or save-schema change.

| REQ_ID | Description | Owner | Pass | Implementation | Test | Evidence | Gate | Rollback | Status |
|---|---|---|---|---|---|---|---|---|---|
| P7-NEWS-001 | NewsCard renders only public `news[].date/text` and has truthful empty/long states | UI-A5 | P7.2–P7.5 | web/game-ui.js + CSS | static semantic gate + browser variants | p7-browser-semantic-components.json + screenshots | MUIR-P7 | revert NewsCard extraction | PASS |
| P7-MATCH-001 | LatestMatchCard uses only public latest-match facts and omits unavailable optionals | UI-A5 | P7.2–P7.5 | web/game-ui.js | full/partial/empty browser variants | p7 browser evidence | MUIR-P7 | revert LatestMatchCard extraction | PASS |
| P7-SEASON-001 | CareerSeasonCard presents only authorized public season statistics | UI-A5 | P7.3–P7.5 | web/game-ui.js | long/partial/multi-season fixtures + static contract | semantic fixtures + browser evidence | MUIR-P7 | revert CareerSeasonCard extraction | PASS |
| P7-CONTRACT-001 | ContractSummary presents public club/salary/months without free-agent or role inference | UI-A5 | P7.3–P7.5 | web/game-ui.js | complete/zero-month variants | browser semantic evidence | MUIR-P7 | revert ContractSummary extraction | PASS |
| P7-OFFER-001 | OfferCard preserves PublicOffer before/terms semantics and canonical actions | UI-A5 | P7.4–P7.5 | web/game-ui.js | loan/non-loan + command static guard | semantic/browser evidence | MUIR-P7 | restore predecessor offer renderer | PASS |
| P7-PERSON-001 | PersonCard uses public name/role and presentation portrait/initials only | UI-A5 | P7.4–P7.5 | web/game-ui.js | long/no-image/known-image variants | browser semantic evidence | MUIR-P7 | restore predecessor contact renderer | PASS |
| P7-ID-001 | No club/person/match/offer internal ID is visible to the player | UI-A5 | P7.1–P7.5 | existing club formatter + semantic renderers | static ID guard + browser text scan | semantic/browser evidence | MUIR-P7 | revert offending renderer | PASS |
| P7-OPT-001 | Missing optional public fields never render technical null/undefined/N/A/dash placeholders | UI-A5 | P7.1–P7.5 | optional row omission | partial fixtures + browser scan | semantic/browser evidence | MUIR-P7 | restore safe omission | PASS |
| P7-LONG-001 | Long club/person/news values wrap without losing decision-relevant information | UI-A5 | P7.1–P7.5 | semantic responsive CSS | 360/390/412/tablet + 130/180% text | P7 screenshots/browser evidence | MUIR-P7 | revert P7 wrapping CSS | PASS |
| P7-DBAUTH-001 | Football Database V2 is read-only from P7 and existing formatters are reused unchanged | UI-A5 | P7.1–P7.5 | no src/catalog or formatter changes | exact P6→P7 diff + baseline gate | p7-baseline.json | MUIR-P7 | revert out-of-scope diff | PASS |
| P7-OFFAUTH-001 | PublicOffer authority and offer command semantics are unchanged | UI-A5 | P7.1–P7.5 | presentation renderer only | public whitelist + canonical command guards | semantic gate | MUIR-P7 | revert OfferCard change | PASS |
| P7-RESP-001 | Semantic components work at 360×800, 390×844, 412×915 and tablet without horizontal overflow | UI-A5 | P7.5 | shared CSS | dedicated Playwright matrix | screenshots + p7 browser evidence | MUIR-P7 | revert offending style | PASS |
| P7-A11Y-001 | Components have readable semantic grouping, no serious/critical AXE finding and survive text scaling | UI-A5 | P7.5 | native article/time/text controls | AXE + 100/130/180% text probe | p7 browser evidence | MUIR-P7 | revert offending semantic/style change | PASS |
| P7-MKTAUTH-001 | Market state/results/gameplay remain unchanged because P7 modifies no runtime authority | UI-A5 | P7.1–P7.5 | no src changes | exact diff + football/match regressions | baseline + workflow | MUIR-P7 | revert out-of-scope diff | PASS |

P7 candidate SHA `fc65d9b5c6da31b687ad855a3e3b56623af4a64b` completed exact-head workflow `36599864443` with **SUCCESS**, including semantic browser matrix, P6 regression, PlayCanvas, Android offline and executable final gate. Artifact: `muir-p7-fc65d9b5c6da31b687ad855a3e3b56623af4a64b` · `sha256:822e2c583c7aca99003f8169d6caa6a9af3bf02ca856c1f57f07742a1b99cf68`. The RTM-closing commit must itself repeat the exact-head workflow successfully; that closing run is authoritative for final P7 certification.


## P8 — Mundo y Carrera / secundarias

P8 authorized predecessor: `3f93206903441029d692eaa76def890ddc7a0cc0` · P7 exact-head workflow `36601414020` SUCCESS  
P8 branch: `ui-a5/muir-p8-world-career`  
P8 PR: #882  
Scope: presentation-only for Mundo, Carrera, Relaciones, Perfil and Tu partida. No PlayerView/Football DB/GameSession/RNG/save-schema/gameplay changes.

| REQ_ID | Description | Owner | Pass | Implementation | Test | Evidence | Gate | Rollback | Status |
|---|---|---|---|---|---|---|---|---|---|
| P8-WORLD-001 | Mundo renders the real public news feed only | UI-A5 | P8.2 | P8 factual news feed + P7 NewsCard | world static + browser matrix | p8-world.json · workflow 36606402032 | MUIR-P8 | revert P8 world presentation | PASS |
| P8-WORLD-002 | Mundo has a truthful empty-news state | UI-A5 | P8.2 | P8 semantic empty state | world-empty fixture | p8-world.json · workflow 36606402032 | MUIR-P8 | restore P7 empty state | PASS |
| P8-CAREER-001 | CareerSeasonCard presents long career seasons | UI-A5 | P8.3 | P7 CareerSeasonCard + P8 hierarchy | 20-season browser fixture | p8-career.json · workflow 36608026921 | MUIR-P8 | revert P8 career layout | PASS |
| P8-CAREER-002 | LatestMatchCard remains factual and identifiable | UI-A5 | P8.3 | P7 LatestMatchCard promoted before seasons | latest-match fixture | p8-career.json · workflow 36608026921 | MUIR-P8 | revert P8 career layout | PASS |
| P8-CAREER-003 | Public milestones remain visible without artificial progression | UI-A5 | P8.3 | presentation-only MilestoneCard | milestone fixtures | p8-career.json · workflow 36608026921 | MUIR-P8 | revert P8 milestone presentation | PASS |
| P8-CAREER-004 | Public offer history uses OfferCard | UI-A5 | P8.3 | P7 OfferCard in factual offer section | offer-history fixture | p8-career.json · workflow 36608026921 | MUIR-P8 | restore P7 order | PASS |
| P8-CAREER-005 | Public decisions/actions remain a factual timeline | UI-A5 | P8.3 | semantic section + 0 nested-panel wrapper | 60-entry timeline fixture | p8-career.json · workflow 36608026921 | MUIR-P8 | restore P7 timeline | PASS |
| P8-REL-001 | Relationships show public contact name/role plus presentation portrait/initials only | UI-A5 | P8.4 | P7 PersonCard + P8 responsive public-contact layout | empty/one/long/many fixtures | p8-relations-profile.json · workflow 36610621251 | MUIR-P8 | revert P8 relations layout | PASS |
| P8-PROFILE-001 | Profile renders only public PlayerView identity, contract and condition fields | UI-A5 | P8.4 | public identity + sibling stats/contract stack | profile/long-club/zero-contract fixtures | p8-relations-profile.json · workflow 36610621251 | MUIR-P8 | revert P8 profile layout | PASS |
| P8-SAVE-001 | Local/current save UI remains available | UI-A5 | P8.5 | grouped local current-save presentation | save static + browser + persistence stress | p8-save.json · workflow 36612633876 | MUIR-P8 | revert P8 save presentation | PASS |
| P8-SAVE-002 | Existing import/export remains available and semantically unchanged | UI-A5 | P8.5 | existing download/import with confirmation | browser interaction + save regressions | p8-save.json · workflow 36612633876 | MUIR-P8 | revert P8 save presentation | PASS |
| P8-SAVE-003 | Existing previous/legacy recovery remains available and semantically unchanged | UI-A5 | P8.5 | conditional previous + legacy support cards | browser interaction + persistence stress | p8-save.json · workflow 36612633876 | MUIR-P8 | revert P8 save presentation | PASS |
| P8-LONG-001 | Long lists/names remain usable without horizontal overflow | UI-A5 | P8.6 | untruncated long-state renderers + responsive guards | long/responsive + browser matrices | P8.5 workflow 36612633876 · hardening 36614679011 | MUIR-P8 | revert offending styles | PASS |
| P8-EMPTY-001 | All five surfaces use truthful empty states where the public contract permits emptiness | UI-A5 | P8.2–P8.6 | factual empty/early states only | world/career/relations/save fixtures | P8.2–P8.5 evidence · hardening 36614679011 | MUIR-P8 | restore factual empty copy | PASS |
| P8-RESP-001 | Required phone/tablet/landscape viewports remain usable | UI-A5 | P8.1–P8.7 | P8 responsive surface rules | 360/390/412/tablet/landscape Chromium matrices | workflows 36604587742 / 36606402032 / 36608026921 / 36610621251 / 36612633876 | MUIR-P8 | revert offending layout | PASS |
| P8-A11Y-001 | Secondary surfaces remain keyboard/focus/AXE/text-scale accessible | UI-A5 | P8.1–P8.7 | semantic sections + focusable main + responsive text | AXE/keyboard/100-130-180% matrices | certified P8 browser evidence through workflow 36612633876 | MUIR-P8 | revert offending semantic/style change | PASS |
| P8-AUTH-001 | DB, PlayerView, save schema and gameplay authority remain unchanged | UI-A5 | P8.1–P8.7 | exact-predecessor scope guard | diff + equivalence + public regressions | P8.5 certified SHA + P8.6 product-equivalence diff | MUIR-P8 | revert out-of-scope change | PASS |

### P8 certified state through Pass 6

- Exact P7 predecessor remains `3f93206903441029d692eaa76def890ddc7a0cc0`.
- Pass 1 baseline: PASS · workflow `36604587742`.
- Pass 2 Mundo: PASS · workflow `36606402032`.
- Pass 3 Carrera: PASS · workflow `36608026921`.
- Pass 4 Relaciones/Perfil: PASS · workflow `36610621251`.
- Pass 5 Tu partida: PASS · workflow `36612633876`.
- Pass 6 hardening: PASS by product equivalence from P8.5 plus cross-surface hardening contract PASS in workflow `36614679011`.
- Public Relationships/Profile contracts remain unchanged.
- Save schema, IndexedSaveStore, Football DB, PlayerView and GameSession authority remain unchanged.
- Pass 7 final exact-head gate is READY_FOR_GATE; no P9 work is authorized.
