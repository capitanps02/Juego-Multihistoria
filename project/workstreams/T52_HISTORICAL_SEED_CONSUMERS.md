# T5.2/T5.4 — historical seed consumers

## Purpose

Some runtime consequences depend on **persisted evidence that a seed instance existed**, not on that seed still being live.

Those reads must not be placed blindly in `SIMULATION_SEED_CONSUMERS`, because that registry feeds the live producer→consumer temporal graph and therefore inherits seed age/scope expiry semantics.

## Two causal classes

### Live presence

Registry: `scripts/t52-simulation-seed-consumers.mjs`

Use when the behavior only applies while the seed is currently present/live, including `HAS_SEED_*`-style effects.

These rows remain first-class T5.4 temporal consumers and are checked against the seed lifecycle window.

### Historical instance

Registry: `scripts/t52-historical-seed-consumers.mjs`

Use when runtime intentionally inspects persisted `state.seeds` history and the consequence remains meaningful after the live seed was resolved/expired.

A historical row records:

- `file`;
- `seedId`;
- the actual runtime `ageWindow` in which the historical lookup can execute;
- `surface`;
- a concrete `rationale` explaining why terminal/expired history is valid evidence.

Historical rows **do not enter the live deferred-consequence graph**. They therefore cannot create a fake live consumer, remove a scope/expiry obligation, or make an otherwise impossible live chain look feasible.

## Ratchet

`audit-t52-simulation-seed-direct-reads.mjs` scans direct positive identity comparisons such as:

```ts
state.seeds.some(seed => seed.id === "SEED_X")
```

Every observed `file + seedId` must be classified in exactly one registry:

1. `SIMULATION_SEED_CONSUMERS`, or
2. `HISTORICAL_SEED_CONSUMERS`.

The audit fails closed for:

- an unregistered direct identity read;
- the same pair appearing in both registries;
- stale historical registrations with no matching direct read;
- duplicate historical registrations;
- invalid historical age windows or missing surface/rationale.

## Current baseline

At creation of this contract the integrated `main` contains no direct identity reads, so the historical registry is intentionally empty.

## Expected #106 integration

`hasRoleGuaranteeAt23()` in PR #106 deliberately treats the exact `EVT_23_BRIDGE_001` + `stance:"role_guarantees"` seed instance as historical evidence even if the seed later becomes terminal. After this contract is integrated and #106 is re-grounded, that owner should register its direct read in `HISTORICAL_SEED_CONSUMERS`, not in the live-presence registry.

The helper short-circuits before age 23; the final row must still reflect the actual caller surface and remain justified by #106's tests rather than by T5.2 inference alone.

## Non-goals

This contract does not:

- invent canonical meaning for a seed;
- turn a historical lookup into a terminal transition;
- make NPCs know anything;
- rewrite saves/history;
- replay seed outcomes;
- authorize a canonical closure classification by itself.
