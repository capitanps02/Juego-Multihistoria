# VDR-IMMERSIVE-001 — Immersive navigation

Status: PROPOSED
Owner: UI-A6 / P9
Baseline SHA: ecc72b9abebbc64533c86b1f3cf7009a127c0c02

## Question

Should the main bottom navigation remain visible during Decision / Result / Offer / cinematic presentation?

## Baseline

Current implementation: VISIBLE on mobile and desktop; only opacity is reduced while immersive presentation is open.
Back/Escape closes the immersive presentation and leaves the pending runtime state untouched.

## Option A — Visible

Benefits:
- immediate access to the rest of the game
- no user can feel trapped
- preserves current shell behavior

Risks:
- 66 px mobile height is consumed at <=820 px
- accidental navigation competes with irreversible-looking choices
- weaker cinematic hierarchy
- 4 long choices + copy + intel become more cramped at 360×800

## Option B — Hidden while immersive

Benefits:
- maximum narrative focus
- recovers mobile vertical space
- removes accidental taps on unrelated destinations

Risks:
- safe exit must remain obvious
- Back/history/focus return must be proven
- hiding all navigation on desktop may be unnecessarily restrictive

## Candidate for executable comparison

MIXED:
- mobile immersive: hide bottom nav but keep explicit safe “Volver a Inicio”/Back semantics
- desktop immersive: keep navigation available but visually secondary
- Result Continue remains primary and never mapped to Back
- Offer/Decision Back never answers the pending state

No decision is accepted until viewport, keyboard, focus-return and Android-style Back probes pass.
