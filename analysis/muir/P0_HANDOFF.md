# MUIR 2.0 — P0 blockers and P1 handoff

Baseline authority: `main@36d3d1b0750b0ded877e55953f223e2de1169a46`

P0 branch: `ui-a0/muir-p0-baseline`

Owner: UI-A0

## Gate rule

This document does **not** authorize P1 by itself.

P1 may start only after the exact current P0 branch HEAD has a complete executable certification with all mandatory P0 evidence and UI-A0 emits the formal P0 FINAL REPORT with `P0_GATE: PASS`.

If the branch HEAD changes after certification, the changed HEAD must be re-evaluated before the PASS remains valid.

## P0 blockers

### Execution gate

Current blocking condition before formal P0 PASS:

- exact-head MUIR certification must complete;
- deterministic fixture contracts must PASS;
- browser baseline must capture all mandatory targets without errors;
- screenshot SHA-256 evidence must exist;
- primary 360×800, 390×844 and 412×915 baselines must exist;
- landscape and tablet checks must execute;
- session/save/persistence regressions must PASS;
- Player Actions UI/session regressions must PASS;
- auto-simulation and epilogue regressions must PASS;
- PlayCanvas must PASS;
- Android offline clean packaging and regression must PASS;
- Football Database platform parity must PASS;
- bundle metrics and evidence index must be generated.

Pending execution is never treated as PASS.

### K-01 — Android package graph

Baseline finding:

`web/game-ui.js` imports `web/cutscene-player.js`, but the baseline Android offline builder did not copy that direct runtime dependency.

P0 repair:

- Android builder copies the already-required module;
- Android regression asserts the module and import;
- MUIR package-graph guard protects the dependency.

This is a packaging repair only. It does not create a separate Android UI and changes no gameplay authority.

Final state remains execution-gated until exact-head clean Android packaging passes.

### K-02 — cinematic resolution

Web and PlayCanvas resolution contracts are defined.

The deterministic browser missing-media fixture uses the real public `PROLOGUE` cutscene from a brand-new `GameSession` and overrides only the media URL with a missing test URL. It must exercise the production prologue fallback rather than fabricate PlayerView state.

Android cinematic certification depends on the repaired K-01 package graph and exact-head Android execution.

### ID-01 — player identity

Current production authority has no editable player-name field across:

`GameState -> initial state -> save validation -> PlayerView -> production UI`.

This is **not** silently implemented in P0.

P0 records the absence as an explicit blocker for the later player-identity presentation work.

See `analysis/muir/ID-01_PLAYER_IDENTITY.md`.

## Non-blocking baseline findings

These are measurements or future-pass inputs, not reasons to redesign during P0:

- current mobile density;
- current hero height;
- current first-CTA position;
- current nav typography;
- touch-target measurements;
- long-copy behavior;
- safe-area behavior;
- current performance figures;
- visual hierarchy findings.

P0 records them. P1+ may act on them only within their authorized scope.

## P1 handoff contract

P1 receives the following authority order:

1. real runtime;
2. `PlayerView` / `GameSession` public contracts;
3. MUIR plan;
4. functional annex;
5. mockups.

Mockups do not create features.

### Protected continuity

P1 must preserve the declared visual identity unless its own scope explicitly authorizes adaptation:

- dark visual depth;
- broad rounded geometry;
- blue primary interactive emphasis;
- restrained prestige gold;
- cinematic/narrative character;
- shared UI authority across Web, PlayCanvas and Android.

See `analysis/muir/P0_SURFACE_MAP.md`.

### Real-data constraint

P1 must use only data/actions proven by production contracts and the screen authority map.

It must not invent:

- GRL;
- Tiro/Pase/Regate;
- standings or league tables;
- a dedicated transfer-market surface in Mundo;
- probable lineups;
- tactics editor;
- cloud saves;
- predictive probabilities/effects;
- private auto-sim phases;
- private relationship metrics;
- private Player Action facts/intents/effect keys;
- editable player identity until a real authoritative contract exists.

See `analysis/muir/P0_SCREEN_DATA_ACTION_MAP.md`.

### Platform constraint

There is one shared product UI.

P1 must not create an independent Android visual implementation.

Web, PlayCanvas and Android must continue to derive from the shared UI/runtime graph documented by P0.

### Regression evidence handed to P1

When P0 reaches PASS, P1 inherits:

- frozen baseline SHA;
- 21 deterministic fixture definitions;
- browser runner;
- primary mobile viewports;
- responsive landscape/tablet checks;
- screenshot naming and SHA-256 contract;
- baseline performance metrics;
- package graph guard;
- Android offline regression;
- cinematic fallback contract;
- functional regression commands;
- RTM traceability.

P1 must not update baseline screenshots merely to hide a regression. Any intentional visual delta must be attributable to an authorized P1 requirement.

## Handoff state

Current state: **NOT YET AUTHORIZED FOR P1**

Required transition:

`P0 IN_PROGRESS/READY_FOR_GATE -> exact-head executable evidence -> P0 FINAL REPORT -> P0_GATE: PASS -> P1 authorized`.
