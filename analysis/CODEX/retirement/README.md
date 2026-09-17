# Retirement / epilogues — Codex handoff

Owner branch: `t5/retirement-epilogues`  
PR: #118  
Re-grounded on: `main@ebef17057156c7721fc4a041552c9cf1b3fdb6ba`

## Boundary

This workstream owns the terminal process only. Ordinary active 34+ veteran career belongs to `t51/canon-34plus-career` and must land/freeze first.

Current runtime state machine is:

`playing -> decided -> announced -> closed`

with only explicit pre-announcement `decided -> playing` reconsideration.

## What is implemented

- age/no-market/injury are context, not automatic retirement;
- explicit decision and explicit public announcement are separated;
- announced state remains playable;
- closed state is terminal and idempotent;
- post-announcement offers do not silently reopen retirement;
- no terminal event creates an appearance, goal or victory;
- last-appearance evidence is currently derived only from a factual increase in `sport.appearances` after announcement;
- epilogue families are deterministic and evidence-gated;
- final save/load retains closed state and epilogue;
- `buildCareerSummary()` exposes read-only terminal facts and leaves unsupported sporting facts as `null`.

## Hard blockers

1. **34+ canonical generation**: branch `t51/canon-34plus-career` is still only the partial T5.29 entry delivery. Do not freeze/register the terminal contentIdentity yet.
2. **Fixture/match authority**: PR #141 documents that current `main` has no authoritative fixture/calendar/competition/squad/minutes/result model. A complete `LastMatchFact` therefore cannot be built yet.
3. **Terminal seeds**: T5.2 has catalogued the terminal seed groups, but the 34+ owner still has to establish producers/consumers and closure semantics.
4. **30–34 early retirement bridge**: `EVT_33_RET_001` still compresses legacy semantics and requires owner/coordinator review before final lineage.

## Codex order

Use `implementation-ready.json` and execute only tasks with `status=ready`. Do not implement blocker-owned authority locally. Do not freeze contentIdentity, register a shortcut migration, or merge this PR automatically.
