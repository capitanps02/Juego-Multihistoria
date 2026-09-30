# MUIR P10 — Gate

P10_GATE: PASS

P9_CERTIFIED_SHA: 21b7eb5fa1df25863a7018cd33eddfbab792c113
P9_EXACT_HEAD_WORKFLOW: 36637412035 = SUCCESS
P10_BRANCH: ui-a0-a8/muir-p10-polish-a11y
P10_PR: #886

P10_PRESEAL_SHA: 69cf1466727cb943c10fb13073aeb3fdddc96541
P10_PRESEAL_WORKFLOW: 36696953502 = SUCCESS
P10_PRESEAL_ARTIFACT: 11089587883
P10_PRESEAL_ARTIFACT_SHA256: 295150480ccdb0239f57f626fe5c87278736aec326f20ff7fa4a78ace11dddba
P10_VISUAL_REVIEW_SHA256: 85a12f0384b61478e184bc8e3022e92cc19bef0e9ebc2c7845a8de0db35afafa

## Scope guard

P10 is presentation consistency/accessibility only.

Forbidden product authority changes:
- src/**
- GameSession
- PlayerView
- Football DB
- Player Actions rules/content
- RNG
- persistence/save schema
- narrative semantics
- PublicOffer authority

Allowed product changes:
- web/game-ui.css
- web/game-ui.js icon helper semantics only

The final certification/harness commits do not add product-authority changes.

## Pass state

- Pass 1 — global consistency audit: PASS
- Pass 2 — token/radius/spacing/type/icon/focus/disabled normalization: PASS
- Pass 3 — AXE / contrast / semantic verification: PASS
- Pass 4 — keyboard / focus / text scale: PASS
- Pass 4 — physical Android TalkBack: DEFERRED_TO_P12
- Pass 5 — responsive + reduced motion: PASS
- Pass 6 — visual regression + RTM + final exact-head gate: PASS, conditional on exact-head workflow SUCCESS

## Certified findings

- visible typography below 10 px: 0
- incompatible icon packs: 0
- emoji functional icon pack: 0
- high-confidence noncanonical radius set: 0
- high-confidence system gap drift set: 0
- global disabled cursor incorrectly implying loading: 0
- shared focus-visible contract: PASS
- AXE serious/critical introduced by P10: 0
- reduced-motion functional regression: 0
- gameplay / RNG / persistence / DB authority changes: 0

## Text scale / responsive

Critical text-scale coverage:
- 100%: PASS
- 130%: PASS
- 180% extreme: PASS

Required viewports:
- 360×800: PASS
- 390×844: PASS
- 412×915: PASS
- landscape: PASS
- tablet: PASS

## Visual regression

The deterministic P9→P10 set is bound to:
`85a12f0384b61478e184bc8e3022e92cc19bef0e9ebc2c7845a8de0db35afafa`

Classification:
- EXPECTED_P10: 90
- REGRESSION: 0
- PREEXISTING: 0
- NEEDS_REVIEW: 0
- bulkReviewValid: true

Native video pixels are masked only in the visual-regression runner while preserving the media box/layout; real cinematic media behavior remains covered by the dedicated P9 cinematic probes.

## TalkBack

TALKBACK: DEFERRED_TO_P12
OWNER: P12

CI/browser evidence is not equivalent to physical Android TalkBack.
P10 does not claim TalkBack PASS.
The physical/manual TalkBack check is formally carried to P12.

## Exact-head certification rule

This document is **PASS only if** the complete `MUIR P10 Polish A11y` workflow succeeds on the exact commit containing this file, including:

1. exact P9 predecessor / scope / static polish;
2. gameplay and functional regressions;
3. package graph / PlayCanvas / Android offline;
4. exact P9 visual baseline + current deterministic capture;
5. keyboard / focus / AXE / safe-area;
6. Home/P4 / auto-sim / reduced-motion;
7. P6 / P7 / P8 / P9 browser matrices;
8. visual review gate;
9. `scripts/test-muir-p10-final-gate.mjs`.

If the branch HEAD changes after certification, P10 returns to READY_FOR_GATE until the full workflow succeeds again.

P11 remains unauthorized and has not been started.
