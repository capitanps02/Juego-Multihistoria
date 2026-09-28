# MUIR ID-01 — Player identity audit

Baseline: `36d3d1b0750b0ded877e55953f223e2de1169a46`

Status: **BLOCKED_FOR_P3**

## Authority result

Historical canon states that the player name and surname are editable, but the current runtime does not implement that identity contract.

Verified on the P0 baseline:

- `GameState` has no player name / surname / display-name field.
- `createInitialState()` creates no player identity field.
- save schema/validation exposes no player identity field.
- `PlayerView` exposes no player identity field.
- production UI therefore has no authoritative player-name value to render.
- repository searches for `playerName`, `firstName`, `surname` returned no runtime implementation.

This is not a visual-only defect. MUIR must not add a hard-coded owner/developer name or a mock-only name.

## Required chain and current result

| Stage | Required | Baseline |
|---|---|---|
| creation/edit | editable identity | ABSENT |
| persistence | save identity | ABSENT |
| save/load | exact round-trip | ABSENT |
| PlayerView | public display identity | ABSENT |
| UI | escaped player-controlled name | ABSENT |
| Unicode | accents/apostrophes/hyphens | NOT_TESTABLE |
| boundary length | explicit product policy | NOT_DEFINED |

## Synthetic matrix reserved for implementation validation

- Leo
- Alex Monteiro
- Alejandro Fernandez-Ruiz
- Noa D'Avila
- Marta Álvarez
- 32-grapheme boundary case

The 32-grapheme case is a test probe only. It is **not** a silently imposed product limit.

## Gate consequence

P0 may finish with this documented blocker because its mission is to establish baseline truth. P3 must not claim player-identity presentation complete until a non-visual owner introduces the authoritative state/persistence/public-view contract and its migration policy.
