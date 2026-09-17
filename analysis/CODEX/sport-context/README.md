# Sport Context — Codex handoff

Base de integración actual: `main@291c73eb8c8d74f843060bcb61687a592880e2ea`.
Rama: `integration/t5-sport-context-current`.
Fuente histórica del diseño: PR #141 (`t5/sport-context`).

## Purpose

This directory is the implementation handoff for sporting facts consumed by narrative content. The rule is strict: a narrative scene may consume a football fact only when it comes from an authoritative sporting source or from a read-only projection of one. Unknown is preferable to a proxy.

## What is available on this branch

- `getSportContext(state)` — read-only projection. It exposes the current season, the sporting/registration club, owner club, league tier, career appearance count and the legacy coarse debut flag. Fixture/match/squad facts are deliberately `null` because current `main` has no authoritative producer for them.
- `getCurrentMatchContext(state)` — fail-closed current-match projection. Until a real match store exists its status is `no_authoritative_match_model` and all match facts are `null`.
- `resolvePenaltyMomentInPlace(state, input)` — deterministic/idempotent penalty micro-result using only `rngState.football`.
- `inspectFootballMomentStore(...)` — read-only validator used at the common GameState save/session boundary.
- Persisted `world.footballMomentResults` are optional for historical saves, validated when present, and never re-rolled on replay.

## What is NOT available yet

Current `main` does not have an authoritative fixture/calendar/competition/match/squad/starting-XI/per-match-statistics model. Do not synthesize:

- a next fixture from month or `runtime.seasonDay`;
- a call-up from coach trust or role score;
- a start from reputation;
- a score/result from form;
- remaining matches from the calendar month;
- a season objective terminal state from `udvSeasonResolved` alone.

These facts must remain unavailable until a real producer exists.

## Files

- `SPORT_CONTEXT_CONTRACT.md` — contract for fixtures, matches, selection and objectives.
- `SPORT_FACT_MATRIX.json` — machine-readable authority/readiness matrix.
- `FOOTBALL_MOMENT_CONTRACT.md` — RNG, persistence and statistics boundary for discrete football moments.
- `implementation-ready.json` — Codex task queue with blockers and allowed ownership.
- `UNBLOCKED_CONTENT.md` — content search/classification and readiness by age block.
- `CODEX_PROMPT.md` — exact implementation guidance for Codex.
- `PROXY_AUDIT.md` — explicit proxy-debt inventory found during this pass.

## Integration rule

Do not modify `EVENTS` from this infrastructure branch. Content owners should consume these APIs after integration. No content identity generation is required by this branch because it changes no event definitions.
