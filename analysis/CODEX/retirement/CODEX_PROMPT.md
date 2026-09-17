# Codex prompt — retirement / last match / epilogues

Work on repository `capitanps02/Juego-Multihistoria`.

Base: inspect the real latest `main` first.  
Recommended branch: `t5/retirement-epilogues` (continue PR #118; do not work directly on main).  
Never auto-merge.

## Mission

Advance only the terminal retirement/epilogue layer. Ordinary active 34+ veteran career is owned by `t51/canon-34plus-career` and must remain active until an explicit terminal process begins.

Current terminal machine:

`playing -> decided -> announced -> closed`

Only explicit pre-announcement reconsideration may do `decided -> playing`. `announced -> playing` and `closed -> playing` are forbidden in normal gameplay.

## Mandatory invariants

- age does not retire the player;
- contract expiry does not retire the player;
- zero offers do not retire the player;
- injury does not retire the player;
- retirement requires explicit terminal intent;
- announcement is distinct from career closure;
- announced player can still train/play/be injured/bench/not play;
- no retirement event creates a fixture, appearance, minutes, goal, assist, result or victory;
- closing career consumes 0 RNG;
- epilogue selection/render is deterministic for the same save;
- `closeCareer` remains idempotent;
- closed saves remain terminal after load;
- active legacy saves must not be retired on migration;
- pending legacy decisions use frozen definition/fingerprint semantics;
- do not rewrite history or seed origin;
- do not freeze global contentIdentity or register a shortcut migration.

## Sporting authority boundary

PR #141 / issue #124 currently establishes that main has no authoritative fixture/calendar/competition/squad/minutes/result model. `sport.appearances` is only an aggregate authority. Until that changes:

- you may use the observed post-announcement appearance delta as a limited factual last-appearance signal;
- you must leave fixture/opponent/competition/minutes/starter/result/goals/assists unknown unless an authoritative sport fact exists;
- never project those fields from role/form/age/date.

When sport authority lands, consume it; do not reimplement the sport simulator here.

## Contract authority boundary

Consume the authoritative contract/CareerOffer layer. Do not create synthetic contracts or offers. Zero offers may open a retirement decision but cannot close the career.

## Seeds

Read `TERMINAL_SEEDS.md`. Do not mass-close seeds. Do not turn retirement-named seeds into a second retirement state machine. Wire only evidence-backed producers/consumers owned by the appropriate content workstream.

## Saves and migration

Read `SAVE_COMPATIBILITY.md`. Preserve active/decided/announced/closed states. Do not reinterpret same-ID changed events without provenance. The final terminal contentIdentity edge is blocked until complete active 34+ is frozen.

## Ready tasks

Read `implementation-ready.json` and execute only items with `status=ready`. Blocked tasks must remain prepared, not guessed around.

Suggested lot order:

A. contemplation
B. continue/announce
C. final-phase narrative
D. closeCareer integration/idempotence
E. CareerSummary / epilogue facts
F. deterministic epilogue prose
G. save compatibility tests

## Tests

At minimum run/build the dedicated retirement suite:

`node --test scripts/test-t536-t537-retirement.mjs scripts/test-t536-career-summary.mjs scripts/test-t537-family-minimums.mjs scripts/test-t536-status-writer-inventory.mjs scripts/test-t537-epilogue-profiles.mjs`

Also run the repository save/determinism/integrity gates available on the current head. Do not weaken a failing lineage/freeze sentinel; report it as the expected blocker if it is the only failure.

Before handing off, report exact HEAD, ahead/behind, changed EVENTS, schema/RNG/contentIdentity/migration changes, exact tests, blockers and remaining Codex-ready task count.
