# T5 shared contract — locker leadership slots

Issue: #84

## Goal

Provide a read-only, deterministic and explicit source for narrative content that needs `SLOT_CAPTAIN` / `SLOT_STAR` without inferring leadership from visible role strings, protagonist relationships or arbitrary locker metrics.

## Runtime contract

`src/simulation/locker-leadership.ts` exposes:

- `resolveLockerSlot(state, "captain" | "star") -> npcId | null`;
- `lockerSlotRelationship(state, slot, axis) -> number | null`;
- `lockerSlotAffinity(state, slot) -> number | null`.

A slot is valid only when all of the following hold:

1. an explicit assignment exists for the player's current club and narrative phase;
2. that slot itself has a certified NPC id;
3. the NPC still exists in `state.npcs`;
4. the NPC remains `active`;
5. the NPC's current club still equals the player's current club.

Any missing condition returns `null`.

## Certified assignments

Current evidence supports only:

- club `UDV`, phase `23_26`, `captain = NPC_PLR_10`;
- club `UDV`, phase `23_26`, `star = null`.

`NPC_PLR_10` is explicitly defined as the UDV captain in the canonical NPC catalog. No authoritative 23–26 `SLOT_STAR` assignment is currently certified, so the resolver intentionally does not infer one from role text, form, prestige, affinity, respect, leverage or `lockerPower`.

Future clubs/phases must add explicit evidence-backed assignments; unknown combinations fail closed.

## Narrative condition facts

The existing synthetic `facts` namespace now also exposes:

- `facts.lockerCaptainAffinity`;
- `facts.lockerStarAffinity`.

These are derived at read time and never saved. A missing slot produces `null`, which fails numeric `gte/gt/lte/lt` comparisons under the existing condition engine.

This allows canonical OR gates such as:

`captain affinity >= threshold OR star affinity >= threshold OR HAS_SEED_TEAMMATE_COVER`

without dynamic path construction or arbitrary-NPC heuristics.

## Invariants

- zero RNG consumption;
- zero mutation;
- no persisted derived facts;
- save/reload reconstructs the same result from canonical state;
- changing club cannot leak an old club leader;
- an NPC leaving the club or becoming inactive invalidates the slot;
- high affinity with a non-leader never satisfies a leadership slot;
- an independent seed route remains independent of slot availability;
- no `EVENTS` change and therefore no `contentIdentity` change.

## Scope boundary

This contract does **not** implement `EVT_23_LOCK_001`. It only removes its shared infrastructure blocker. The content owner must still choose/document the technical affinity threshold and add the canonical scene through the normal successive contentIdentity lineage.
