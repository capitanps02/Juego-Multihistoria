# Seed semantics — T5.2

Current implementation instruction for Codex and content owners. Historical snapshots are evidence only; GitHub runtime and this generated matrix are authoritative.

## Live presence vs historical existence

A live seed is a non-terminal instance whose age/date/club/season scope is valid now. Historical existence means an instance occurred at some point, including resolved or expired instances. These are different facts and must use different APIs/registries.

- Live runtime direct reads: `scripts/t52-simulation-seed-consumers.mjs`.
- Historical direct reads: `scripts/t52-historical-seed-consumers.mjs`.
- Generic projection: `projectSeedMemory(state, seedId)`.
- Live exact instance: `liveSeedInstance(state, seedId)`.
- Historical exact instance: `latestHistoricalSeedInstance(state, seedId)`.

Historical registry IDs are validated against the authoritative 210-seed catalog and fail closed.

## Payload semantics

Never infer complete meaning from `seed.id` or `HAS_SEED_*`. A `SeedInstance` contains state, intensity, payload, originEvent, originSeason, optional scope metadata, consumedBy and dates. The payload can encode materially different trajectories under one seed ID.

Incorrect:

```ts
if (state.flags.HAS_SEED_AGENT_OMISSION) agentLied = true;
```

Correct:

```ts
const memory = projectSeedMemory(state, "SEED_AGENT_OMISSION");
// Validate live/historical intent and scope first, then inspect exact payload/provenance.
```

## Scope

Scope is runtime behavior, not metadata decoration. `seedInstanceScopeValid` enforces explicit date, catalog age window, origin-season and origin-club policies without mutating history. Club-scoped memories cannot silently remain live after a club change. Historical provenance can still exist.

## Expiry and terminality

Terminal states are `resolved` and `expired`. A terminal instance remains in saves/history. Do not rewrite `originEvent`, `HistoryEntry`, decision provenance or journal entries to match newer canonical expectations. Reopening creates a new live instance rather than falsifying the old one.

## Producer / consumer vocabulary

- producer: a real seed transition that creates/activates/transforms state;
- consumer: behavior that changes because of the real seed state/payload;
- `seedsRead`: declaration/documentation only; it is not proof of causal use;
- `HAS_SEED_*`: live-presence flag only; it is not full semantic meaning;
- causal projection: read-only derivation from exact instances for gates, eligibility, outcome conditions/modifiers or code-level effects.

## Condition-root parity

Event gates, choice eligibility, outcome conditions and outcome modifiers now resolve against the same read-only `narrativeConditionRoot`. The root is computed after immediate effects, matching prior ordering, consumes zero RNG and is not saved.

## NPC knowledge

A seed existing in the world does not imply an NPC knows it. `npcRefs` also does not grant knowledge. Use T5.3 knowledge authority for what a character can know.

## Canonical closure

Structural lifecycle validity is separate from canonical resolution. Allowed owner-backed classifications remain `canonical_chain`, `intentional_persistent`, `canonical_expiry`, and `retired_compatible`. This generator deliberately leaves all rows `pending_owner_classification` until owner evidence is integrated; it never auto-classifies 210/210.
