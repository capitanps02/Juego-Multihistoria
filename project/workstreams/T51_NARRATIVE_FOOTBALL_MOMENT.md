# T5 shared contract — narrative football moment

Issue: #85

## Goal

Allow a narrative decision to select **who / what intention** participates in a sporting moment while keeping the sporting result outside narrative RNG and outside fixed `OutcomeDefinition` rewards.

The initial supported moment is a penalty, required by `EVT_24_MATCH_001`.

## API

`src/simulation/narrative-football-moment.ts` exposes:

- `narrativeFootballMomentProbability(input)` — pure probability preview, zero RNG;
- `resolveNarrativeFootballMomentInPlace(state, input)` — resolves exactly once using only `rngState.football`;
- `getNarrativeFootballMoment(state, momentId)` — read-only retrieval of an already resolved fact.

Input is explicit sporting context:

- stable `momentId`;
- `kind` (`penalty` currently);
- `actorId`;
- technique;
- composure;
- form;
- pressure.

The narrative layer remains responsible for choosing the actor and for subsequent social interpretation.

## Penalty probability

Technical model:

`0.72 + technique + composure + form - pressure adjustments`

with each input bounded to `[0,100]` and final probability bounded to `[0.50,0.92]`.

This is a technical gameplay model, not a canonical claim that a particular choice guarantees a goal. It deliberately uses existing football-facing attributes rather than narrative state such as trust, resentment or media heat.

## RNG separation

Resolution constructs `DeterministicRng(state.rngState.football)` and consumes exactly one draw on first resolution.

It does not consume:

- `narrative`;
- `microfeed`;
- `qa`.

Read/preview consumes zero draws.

## Idempotence and persistence

Resolved facts are stored under:

`state.world.narrativeFootballMoments[momentId]`

Each fact stores:

- moment id;
- kind;
- actor id;
- `scored` / `missed`;
- probability;
- roll;
- exact context key.

A repeated call with the same id and context returns the stored fact without another draw. Reusing the same id with different sporting semantics throws before RNG consumption.

The registry lives inside the existing schema-8 `world` record, so no schema migration is required. Save/reload before the draw reproduces the same future result; save/reload after the draw cannot re-roll it.

Malformed persisted registry data fails closed before consuming football RNG.

## Separation from narrative consequences

The hook does **not** mutate:

- relationships;
- NPC knowledge;
- seeds;
- contracts;
- club;
- narrative history;
- narrative RNG.

Therefore a goal does not imply reconciliation and a miss does not imply resentment. The owner of `EVT_24_MATCH_001` must interpret the sporting fact separately from the player's social/jerarchical choice.

## Scope boundary

This contract does not add or change `EVT_24_MATCH_001`, so it does not change `EVENTS` or `contentIdentity`. It only removes the shared football-resolution blocker for the later canonical content batch.
