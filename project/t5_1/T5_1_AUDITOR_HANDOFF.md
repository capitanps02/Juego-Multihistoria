# T5.1 auditor handoff — identity, semantics and migration

Generated: 2026-09-16

## What is now closed at planning/audit level

### Canonical identity
- 254 principal canonical IDs.
- 134 conditional canonical IDs.
- 388 total unique canonical IDs.
- Principal baseline drift: 87 canonical IDs missing / 87 legacy runtime extras.
- Conditional baseline drift: 87 canonical IDs missing / 87 legacy runtime extras.
- Total baseline runtime ID drift: 174.

### Important evidence
- P1 v0.14 found 167/254 exact principal IDs and 47/134 exact conditional IDs.
- `30_34` conditionals were 0/26 exact IDs in that baseline.
- Only 7 of the 174 legacy drift IDs have a same-kind unique exact-title canonical candidate, all principals.
- No conditional legacy extra has a same-kind exact-title candidate.
- Therefore no fuzzy/title-based bulk rename is acceptable.

## New machine-readable artifacts

### `T5_1_CANONICAL_IDENTITY_MANIFEST_388.json`
Closed canonical ID set used by identity QA.

### `T5_1_CANONICAL_EVENT_VERIFICATION.schema.json`
Contract for event-level semantic certification.

### `T5_1_LEGACY_ID_CROSSWALK_TEMPLATE.json`
174 legacy runtime IDs, all initially unresolved.
The 7 exact-title principal candidates are evidence only, not approved mappings.

### `T5_1_MIGRATION_TEST_MATRIX.json`
15 targeted migration/save/terminal cases.

### `T5_1_AUDITOR_IMPLEMENTATION_SPEC.md`
Implementation rules for identity, semantic, migration, causal and retirement gates.

## Recommended implementation behavior

Do not replace the existing technical QA. Add canonical QA alongside it.

A safe implementation can proceed as:

1. Generate normalized runtime manifest from `EventDefinition[]`.
2. Compare active IDs against `T5_1_CANONICAL_IDENTITY_MANIFEST_388.json`.
3. Load reviewed crosswalk decisions.
4. Generate one verification record per canonical event.
5. Refuse `canonical_verified_full` when any required field is not reviewed/failing.
6. Run migration tests.
7. Run causal chain tests.
8. Run retirement FSM tests.
9. Only then run final aggregate/stress QA.

## Important design decision

Treat `canonical_verified_full` as an **audit certification layer** first, not necessarily as an immediate replacement for the runtime `canonStatus` type. This minimizes engine churn.

The runtime content can retain its current type while the auditor maintains a stricter verification manifest. Once all 388 records pass, the product type can be simplified in a later scoped change if desired.

## Save truthfulness

Never solve an identity mismatch by rewriting old history into a scene the player did not see.

For `pendingEventId`, semantic identity must be stronger than for history because the player may already be looking at the old choices. If not proven same-scene, resolve through legacy compatibility or fail explicitly; do not silently swap choices.

## Completion

T5.1 is not complete when the ID diff reaches zero.

It is complete only when:
- 388 canonical IDs are active with no extras;
- 174 baseline legacy drift IDs have reviewed dispositions;
- all 388 active events pass semantic certification or explicit approved exception;
- migrations preserve truth;
- causal chains work after save/resume;
- retirement flow remains `playing -> decided -> announced -> closed`;
- epilogue only opens after `closed`;
- RNG separation/determinism remain green.
