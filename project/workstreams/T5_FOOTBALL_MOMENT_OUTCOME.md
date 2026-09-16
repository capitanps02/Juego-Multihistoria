# T5 shared contract — football moment outcomes

Issue: #85  
Branch: `t5/football-moment-outcome`  
Current base: `main@e48a6c85d0a9e61d88eca121f683dcd308c188c1`

## Purpose

Provide a small deterministic sporting-result hook for narrative match moments such as `EVT_24_MATCH_001` without using narrative RNG or encoding a goal/miss inside the narrative choice itself.

This workstream does **not** implement `EVT_24_MATCH_001` and does not modify `EVENTS` or `contentIdentity`.

## Contract

`resolvePenaltyMomentInPlace(state, input)`:

- validates a stable `momentId` and explicit sporting inputs;
- converts technique/composure/form/pressure into a bounded technical success probability;
- consumes exactly one draw from `state.rngState.football` on first resolution;
- persists the factual result under `state.world.footballMomentResults[momentId]`;
- returns the persisted result without another draw on replay/resume;
- rejects reuse of a resolved `momentId` with different sporting inputs;
- never consumes `narrative`, `microfeed` or `qa` RNG.

`playerPenaltyAttempt()` builds the protagonist input from the actual persisted:

- `professional.technique`;
- `professional.composure`;
- `sport.form`.

The caller supplies situational pressure. A non-player taker must provide explicit attributes from an authoritative sporting source. The hook deliberately does not infer another player's ability from NPC role text, relationship state or narrative status.

## Probability model

The v1 formula is a technical gameplay adapter, not canonical story content:

`0.58 + technique*0.0018 + composure*0.0012 + form*0.0008 - pressure*0.0014`

clamped to `[0.45, 0.90]`.

Future balance changes must preserve already persisted outcomes; replay never recalculates a resolved moment.

## Persistence / save compatibility

No schema field is added. `GameState.world` already accepts JSON-safe `DataValue` records and the save validator recursively validates them. Persisted rows contain only:

- version;
- kind;
- actor id;
- scored/missed fact;
- probability used at resolution;
- resolution date;
- exact input signature.

The random draw itself is returned only by the first call for QA/diagnostics and is not required by narrative logic.

## QA

`scripts/test-t5-football-moments.mjs` verifies:

1. player inputs come from real sporting attributes and reads consume no RNG;
2. exactly one football draw and zero other-stream draws;
3. same seed/state/input reproducibility;
4. narrative RNG independence;
5. football stream controls the draw;
6. save/load before resolution reproduces the same future result;
7. save/load after resolution does not re-roll;
8. same-moment replay is idempotent;
9. changed inputs under the same moment id fail without a draw;
10. non-player attempts require explicit attributes.

The suite is wired into `npm test`, `qa:t5:saves`, `qa:t5` and `test:t5:football-moments`.

## Re-ground history

The workstream was first validated on catalog D (`main@922b9ecc...`). It was then re-grounded again on `main@e48a6c85...`, preserving the subsequently integrated T5.2/T5.4 deferred-simulation seed audit and coordination updates. The hook itself remains content-neutral and does not change the active catalog identity.

## Remaining T5.14 dependency

This contract closes only the sporting draw/persistence layer of #85. `EVT_24_MATCH_001` still needs a canonical source for any non-protagonist taker's attributes/context before it can resolve that player's attempt without inventing facts. Locker hierarchy remains separately owned by #84.

No merge is performed from this workstream without coordinator review.
