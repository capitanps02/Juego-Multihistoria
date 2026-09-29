# MUIR ID-01 — Authoritative player identity contract

P2 certified predecessor: `c41f58f6839ae14f2857f47026eacdfe4e189a3c`

Status: **IMPLEMENTED_PENDING_CERTIFICATION**

## Canon authority

Historical canon defines protagonist internal identity `PLR_001` and states that the player's name and surname are editable. Family identity never depends on the chosen surname.

ID-01 stores the public full name as one canonical display field:

```ts
playerIdentity: {
  id: "PLR_001";
  displayName: string;
}
```

`PLR_001` remains internal. Presentation receives only:

```ts
PlayerView.player = { displayName: string }
```

## Product name policy

- accepted length: **2–32 Unicode grapheme clusters**;
- letters and Unicode combining marks are accepted;
- ordinary Unicode spaces, apostrophe `'`, typographic apostrophe `’`, hyphen `-` and period `.` are accepted;
- leading/trailing whitespace is removed;
- repeated Unicode space separators are canonicalized to one ASCII space;
- Unicode text is otherwise preserved; no NFC/NFD/NFKC/NFKD normalization is applied;
- digits, control characters, angle brackets and HTML/script syntax are rejected by the allowed-character contract.

ID-01 explicitly adopts the master plan's proposed **2–32 grapheme** policy as the product decision for this implementation. It is therefore visible, versioned and tested rather than silently inferred from a byte/code-point limit.

## Creation and editing

- `createInitialState(seed, playerDisplayName?)` persists canonical identity without consuming RNG.
- `GameSession.create(..., { playerDisplayName })` validates the supplied name.
- production `Tu partida > Otra historia` provides a real text input and passes it as `playerDisplayName`;
- production `Perfil` reads `PlayerView.player.displayName` and edits it through the canonical `identity` command;
- missing historical identity uses the deterministic neutral fallback `Jugador`;
- `SessionCommand { type:"identity", displayName }` edits the identity transactionally;
- identity edits are allowed only while no decision/result/offer is pending and auto-simulation is idle;
- identity commands increment session revision and receive normal replay-safe receipts;
- identity commands consume zero narrative, football, microfeed or QA RNG.

## Legacy compatibility

Schema remains 8.

Raw schema-2..8 saves may omit `playerIdentity`. `validateGameSave` therefore treats absence as historical input compatibility, while validating any persisted identity that is present.

Historical raw `loadSave` preserves the exact frozen object shape and therefore does **not** inject identity into schema-2..8 fixtures.

Before a historical **SessionSnapshot** enters interactive runtime, `GameSession.resume/migrateAndResume` materializes:

```
missing playerIdentity -> { id:"PLR_001", displayName:"Jugador" }
```

This session-boundary upgrade:
- is deterministic;
- consumes zero RNG;
- never overwrites an existing persisted identity;
- preserves all other state exactly;
- keeps the fallback editable through the normal identity command.

Any persisted identity that is present is validated strictly. Interactive `GameSession` guarantees identity before publishing `PlayerView`; raw historical `GameState` loads may remain identity-less to preserve frozen compatibility.

## Public/private boundary

`PlayerView` exposes only `player.displayName`. It does not expose the internal `PLR_001` identifier or any extra private identity state.

Names containing HTML/script syntax are rejected at the session boundary, so player-controlled identity cannot become executable presentation markup.

## Required validation matrix

Accepted:
- `Leo`
- `Alex Monteiro`
- `Alejandro Fernandez-Ruiz`
- `Noa D'Avila`
- `Marta Álvarez`
- 32-grapheme approved boundary case, including combining-mark graphemes

Directed QA also validates:
- creation -> PlayerView;
- canonical whitespace normalization;
- grapheme-count validation (including combining marks);
- save -> load exact preservation;
- SessionSnapshot resume exact preservation;
- migration of schema-8 and session snapshots with no identity;
- apostrophe/hyphen/accent handling;
- invalid HTML/script/control rejection;
- transaction rollback on invalid edit;
- command replay;
- zero RNG consumption.

## Scope

Authorized implementation files are limited to player identity, GameState wiring, initial-state creation, save/runtime validation, GameSession/SessionSnapshot command validation, the minimal shared `web/game-ui.js` creation/edit controls, directed tests and ID-01 certification files.

Forbidden:
- event/catalog changes;
- gameplay/simulation changes;
- RNG implementation changes;
- market/contract/national-team authority changes;
- Player Actions authority changes;
- Home/core-loop redesign, shell/nav changes or any production UI change beyond the two identity input/edit controls.

## P3 handoff

P3 remains blocked until:
1. the exact ID-01 implementation HEAD passes its certification workflow; and
2. a separate MUIR predecessor exception names the exact authorized successor SHA stacked directly on P2 certified authority.

`web/game-ui.js` may expose the certified name field in existing creation/Profile forms only; it must not redesign Home. UI-A2 must consume `PlayerView.player.displayName`; it must not invent, hardcode or privately derive a player name.
