# T5.2/T5.4 — historical seed consumers

## Purpose

Some runtime consequences depend on persisted evidence that a seed instance existed, not on that seed still being live. Those reads must not be placed blindly in `SIMULATION_SEED_CONSUMERS`, because that registry feeds the live producer→consumer temporal graph and inherits live age/scope semantics.

## Two causal classes

### Live presence

Registry: `scripts/t52-simulation-seed-consumers.mjs`.

Use only when behavior depends on a currently-live seed. These rows remain first-class T5.4 temporal consumers and are checked against producer windows and live scope.

### Historical instance

Registry: `scripts/t52-historical-seed-consumers.mjs`.

Use only when runtime intentionally inspects persisted `state.seeds` evidence and the fact remains meaningful after the instance was resolved or expired. A historical row records `file`, real runtime `ageWindow`, `seedId`, `surface` and a concrete rationale.

Historical rows do not enter the live deferred-consequence graph. They cannot create a fake live consumer, remove a scope/expiry obligation, or make an impossible live chain look feasible.

## Fail-closed ratchet

`audit-t52-simulation-seed-direct-reads.mjs` scans direct positive identity comparisons such as:

```ts
state.seeds.some(seed => seed.id === "SEED_X")
```

Every observed `file + seedId` must be classified in exactly one registry. The audit fails closed for:

- unregistered direct identity reads;
- live + historical double classification;
- stale historical registrations;
- duplicate historical registrations;
- invalid age windows or missing metadata;
- any historical `seedId` absent from the authoritative `SEED_CATALOG`.

Synthetic tests inject their known-ID set explicitly. Production audit uses the built catalog. This keeps tests hermetic while preventing a typo or retired literal from becoming legitimate merely because the same typo was copied into the registry.

## Current implementation instruction

The historical registry is intentionally empty until a real runtime reader requires historical existence rather than live presence. Do not add rows to make an audit green. Each future row must be justified by the consuming implementation and its tests.

## Historical evidence versus current instruction

Older T5.2 snapshots may mention prospective historical consumers. Treat those references as historical evidence only. The current registry and current runtime source are authoritative for implementation.

## Non-goals

This contract does not invent canonical seed meaning, create terminal transitions, grant NPC knowledge, rewrite saves/history, replay outcomes, or authorize canonical closure classification by itself.
