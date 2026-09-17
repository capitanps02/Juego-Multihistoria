# Blockers — Canon 23–30

## Lineage / activation

The Agent 6 candidates intentionally remain staged. Activation of exact IDs, active catalog identity, adjacent content generation, migration edges and pending-save semantics belongs to the integration owner. Do not solve this by editing global lineage from this branch.

Affected now: `EVT_23_LOCK_001`, `EVT_23_MKT_001`, `EVT_23_CON_001`, `EVT_25_CON_001`, `EVT_25_MKT_001`, `EVT_26_BRIDGE_001`.

## Shared authority blockers

- Match/final scenes: require persisted authoritative fixture, result, squad and player-participation facts. Never use narrative RNG or reputation as a proxy.
- National scenes: require authoritative call-up/role history. `nationalStanding` is not a call-up.
- Agent scenes: require a certified current active agent identity. A slot existing in schema is not sufficient evidence for every save.
- Injury scene `EVT_26_MED_001`: re-audit current injury/history authority before implementation.
- Team institutional scenes: use current-club actors only and fail closed if no authoritative target exists.

## Resolved by current main

PRS23 role provenance/facts are now active on main. The local staged PRS23 copy, old `club-contract-intent.ts` projection and duplicate focal test were deliberately dropped in the re-ground.

## Hard invariants

No synthetic CareerOffer. No direct `state.club` mutation. No synthetic fixture. No narrative football-result RNG. No captain inference from age/reputation. Never rewrite historical `SeedInstance.originEvent`.
