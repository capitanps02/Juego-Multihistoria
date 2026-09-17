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
- `inspectFootballMomentStore(value)` — read-only persisted-store validation.
- `assertFootballMomentStore(value)` — runtime assertion for resolver reads.

## Stable identity

A moment is keyed by a stable technical identifier, never by narrative copy.

Recommended shape:

`<EVENT_ID>:<choice-or-actor-context>:<moment-kind>`

Example:

`EVT_24_MATCH_001:TAKE:penalty`

IDs accept stable alphanumeric/dot/underscore/colon/hyphen identifiers, are length bounded, and reserved prototype keys are rejected.

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

Historical saves may omit the store. When present, it must be a plain object keyed by stable moment IDs. Each v1 penalty row has exactly:

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

Save/session validation rejects:

- malformed store container;
- unknown or reserved moment ID;
- unsupported row version;
- unknown moment kind;
- unknown outcome;
- non-finite/out-of-range probability;
- invalid resolution date;
- empty/invalid input signature;
- extra/missing row fields.

The resolver separately rejects a duplicate moment ID presented with incompatible sporting inputs.

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
