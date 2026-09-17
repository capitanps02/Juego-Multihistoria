# FOOTBALL_MOMENT_CONTRACT

## Definition

A football moment is a discrete sporting action inside a narrative or simulated match whose sporting outcome is not a narrative choice.

Examples: a penalty attempt, a one-on-one, a direct free kick or an aerial duel. This branch implements only the smallest required v1 domain: **penalty outcome**.

It is not a match simulator. If the match model already owns a result, score or player statistic, use that fact rather than simulating it again here.

## API

Implemented entry points:

- `penaltySuccessProbability(input)` — pure probability projection; no RNG.
- `playerPenaltyAttempt(state, momentId, pressure)` — builds protagonist input from persisted sporting attributes.
- `resolvePenaltyMomentInPlace(state, input)` — first resolution or idempotent replay.
- `inspectFootballMomentStore(value, maxResolvedAt?)` — read-only persisted-store validation; the save boundary passes the current game date as the maximum allowed resolution date.
- `assertFootballMomentStore(value)` — runtime assertion for resolver reads.

## Stable identity

A moment is keyed by a stable technical identifier, never by narrative copy.

Shape:

`<REGISTERED_EVENT_ID>:<stable-context>:penalty`

Examples:

- `EVT_24_MATCH_001:TAKE:penalty`
- `EVT_26_MATCH_001:RECORD:penalty`

The v1 registry accepts only the explicitly registered event namespaces:

- `EVT_24_MATCH_001`;
- `EVT_26_MATCH_001`.

The context component is a bounded technical identifier, not user-visible copy. Unknown event namespaces, malformed IDs and prototype-reserved actor IDs fail closed.

Registering a new football-moment event is a deliberate code change with tests; arbitrary save keys are not accepted.

Reusing the same `momentId` with different sporting inputs is an error. This prevents an already-resolved sporting fact from being silently rewritten.

## RNG authority

Only `state.rngState.football` is authorized.

First resolution:

1. validate moment identity and sporting inputs;
2. validate any existing store;
3. compute probability without RNG;
4. consume exactly one football RNG draw;
5. persist the factual result;
6. return it.

Replay:

1. validate moment identity and inputs;
2. read the persisted row;
3. verify the same input signature;
4. return the stored result;
5. consume zero RNG.

`narrative`, `microfeed` and `qa` RNG streams are untouched.

## Penalty v1 domain

Input:

- actor ID;
- technique 0–100;
- composure 0–100;
- current form 0–100;
- situational pressure 0–100.

Outcome:

- `scored`;
- `missed`.

The v1 probability formula is technical infrastructure, bounded to `[0.45, 0.90]`:

`0.58 + technique*0.0018 + composure*0.0012 + form*0.0008 - pressure*0.0014`

Do not reinterpret this as a canonical story rule. If future moment kinds require `saved`, `blocked`, `foul`, etc., add a versioned domain with its own validator rather than overloading a universal boolean.

## Persistence

Store: `state.world.footballMomentResults`.

Historical saves may omit the store. When present, it must be a plain object keyed by registered stable moment IDs. Each v1 penalty row has exactly:

```ts
{
  version: 1,
  kind: "penalty",
  actorId: string,
  outcome: "scored" | "missed",
  probability: number,
  resolvedAt: "YYYY-MM-DD",
  inputSignature: string
}
```

`inputSignature` is a canonical JSON encoding of the factual sporting inputs:

```ts
[actorId, technique, composure, form, pressure]
```

It is validated semantically, not only as a non-empty string.

## Save/session validation

The common `GameState` boundary rejects:

- malformed store container;
- unknown or malformed moment ID;
- unsupported row version;
- unknown moment kind;
- unknown outcome;
- actor IDs that are malformed/reserved;
- malformed or non-canonical input signatures;
- actor mismatch between row and signature;
- non-finite or out-of-domain sporting inputs inside the signature;
- probability outside `[0.45, 0.90]`;
- probability that does not exactly correspond to the persisted sporting inputs/formula;
- invalid resolution date;
- resolution date later than the current `GameState.date`;
- extra/missing row fields.

The resolver separately rejects a duplicate moment ID presented with incompatible sporting inputs.

This does not claim cryptographic tamper-proofing. It guarantees that a loaded row is structurally and internally consistent with the declared v1 sporting contract and chronology, rather than silently accepting an impossible payload.

## Save behavior

Pre-resolution save/load: same factual state and football RNG state produce the same future result.

Post-resolution save/load: the persisted result is returned and football RNG does not advance again.

Validation is read-only and consumes zero RNG.

## Statistics boundary

The football-moment layer must not increment:

- goals;
- assists;
- appearances;
- minutes;
- cards;
- injury counters;
- relationships.

Those belong to their authoritative match/statistics/social layers. A scene may interpret the factual sporting result narratively, but may not count the same goal twice.

## EVT_24_MATCH_001 integration

The future content implementation should separate three phases:

1. **Eligibility/context:** authoritative match context proves high-profile match, protagonist on field, designated taker context and prior missed penalty.
2. **Narrative choice:** the player chooses who should take the next penalty / hierarchy handling.
3. **Sporting resolution:** whichever actor actually takes it is resolved through the football moment hook with factual attributes; the result is then read by downstream narrative consequences.

The choice must not encode `goal`/`miss`. A goal must not automatically erase social conflict and a miss must not deterministically define relationship fallout.
