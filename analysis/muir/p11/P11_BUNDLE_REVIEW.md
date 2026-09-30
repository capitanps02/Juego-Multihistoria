# MUIR P11 — Bundle / source-graph review

STATUS: REVIEWED_JUSTIFIED

P0_PRODUCT_BASELINE_SHA: 36d3d1b0750b0ded877e55953f223e2de1169a46
P10_CERTIFIED_SHA: 512730e8e1830935e841751c72419daf82e84ca9
P11_REVIEW_HEAD: 8b2efeb9fd3eb736d095c11f02924e7519c15835
OWNER: UI-A7
BUDGET_CHANGED: NO

## Metric under review

METRIC: shared UI source graph bytes
BASELINE: 77,015 B
CURRENT_HEAD_TREE: 127,403 B
DELTA: 50,388 B
DELTA_PERCENT: 65.43 %
BUDGET: every increase >10% requires review

Component bytes:
- web/game-ui.js: 70935 B
- web/game-ui.css: 48911 B
- web/cutscene-player.js: 7557 B

## Cause

The source-graph increase is accumulated certified shared-UI scope from P2–P10: responsive shell, Home/core loop, auto-sim presentation, Player Actions presentation, semantic football components, Mundo/Carrera/Relaciones/Perfil/Tu partida, immersive Decision/Result/Offer/Cinematic/Epilogue states, and P10 accessibility/consistency rules.

It is not a second Android UI or a second PlayCanvas UI. P11 retains the shared Web presentation authority and packages/adapts that same code.

## Runtime evidence

This review is valid only while the exact-head performance gates remain green. On candidate 6663c8a0cf47fd53f37ec4cc4dce78ec9bfdcee9, the same-harness P0 comparison measured:

- render p95: 63.0 -> 38.5 ms
- response p95: 202.5 -> 182.3 ms
- long-task p95: 141 -> 127 ms
- DOM max: 154 -> 147
- auto-sim visual rate: 5.15 -> 2.84 Hz
- focus churn: 0 per normal tick
- normal-tick DOM replacements: 0
- generated PlayCanvas bundle: 17,674,202 -> 17,731,199 B (+0.32%)

P11 does not increase any budget to accept the source-byte delta.

## Decision

JUSTIFICATION: the >10% source-graph growth is traceable to authorized predecessor presentation/accessibility capability, remains shared across platforms, and has no corresponding >10% generated-platform bundle regression or measured runtime-budget regression.

STATUS: REVIEWED_JUSTIFIED

If any exact-head render/response/DOM/auto-sim or generated-bundle gate fails, this review does not authorize PASS.
