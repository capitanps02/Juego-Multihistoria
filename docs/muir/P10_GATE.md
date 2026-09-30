# MUIR P10 — Gate

P10_GATE: IN_PROGRESS

P9_CERTIFIED_SHA: 21b7eb5fa1df25863a7018cd33eddfbab792c113
P9_EXACT_HEAD_WORKFLOW: 36637412035 = SUCCESS
P10_BRANCH: ui-a0-a8/muir-p10-polish-a11y
P10_PR: #886

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

Allowed product changes currently:
- web/game-ui.css
- web/game-ui.js icon helper semantics only

## Pass state

- Pass 1 — global consistency audit: COMPLETE
- Pass 2 — token/radius/spacing/type/icon/focus/disabled normalization: IMPLEMENTED, fresh full workflow pending
- Pass 3 — AXE / contrast / semantic verification: PENDING
- Pass 4 — keyboard / focus / text scale / TalkBack: PENDING
- Pass 5 — responsive + reduced motion: PENDING
- Pass 6 — visual regression + RTM + final exact-head gate: PENDING

## Current implementation findings closed statically

- visible typography below 10 px: 0
- incompatible icon packs: 0
- emoji functional icon pack: 0
- high-confidence noncanonical radius set: 0
- high-confidence system gap drift set: 0
- global disabled cursor incorrectly implying loading: 0
- anchors/main/timeline missing shared focus-visible rule: 0
- reduced-motion hard override removed: NO

Static closure is not final evidence.

## Required exact-head executable gate

The exact final P10 HEAD must complete `MUIR P10 Polish A11y` with SUCCESS including:

1. P9 exact predecessor and P10 scope guard
2. static polish/icon/focus/disabled gate
3. GameSession / auto-sim / Player Actions / period / offers / cutscene / saves regressions
4. shared package graph
5. PlayCanvas package regression
6. Android offline package/regression
7. deterministic browser capture
8. P2 shell safe-area / keyboard / focus / AXE
9. P3 Home + P4 contextual-help accessibility
10. P5 auto-sim accessibility/reduced-motion
11. P6 Player Actions accessibility/text-scale
12. P7 semantic-component accessibility/text-scale
13. P8 secondary-surface cross-viewport matrices
14. P9 Decision / Result / Offer / Cinematic matrices
15. visual-diff review
16. P10 RTM rows closed truthfully

## TalkBack

TALKBACK: MANUAL_REQUIRED

CI/browser evidence is not equivalent to physical Android TalkBack.
P10 must not mark TalkBack PASS without an executed TalkBack/manual record.
If not executable in P10, ownership may be formally deferred to P12 while P10 reports the deferral explicitly.

## Visual regression

No baseline may be updated solely to make P10 green.
Every P10 visual delta must be classified:
- EXPECTED_P10
- REGRESSION
- PREEXISTING
- NEEDS_REVIEW

## Final rule

P10_GATE becomes PASS only on an exact current branch HEAD whose complete P10 workflow is SUCCESS, with zero unresolved new critical AXE findings and zero unreviewed visual diffs.
