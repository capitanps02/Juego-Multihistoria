# T5.1 — Content migration delivery plan

Generated: 2026-09-16

## Objective

Deliver save/session compatibility without creating migrations between every temporary T5.1 implementation branch.

## Principle

`contentIdentity` is a release/content boundary, not a nuisance to bypass.

T5.1 will change the active event catalog repeatedly while batches are under development. Those intermediate identities are implementation artifacts and do not all need to become supported migration sources.

The final compatibility target is the stable, fully reconciled canonical catalog.

## Phase 0 — freeze the supported source baseline

Owner: first functional T5.1 implementation task, before its first event-catalog edit.

Required artifact:
- exact pre-T5.1 runtime event catalog;
- its real `contentIdentity`;
- source commit/build/session/schema metadata;
- deterministic compatibility fixture hash.

Contract:
- `T5_1_PREIMPLEMENTATION_CONTENT_FREEZE.md`

No runtime semantics are changed by the freeze.

## Phase 1 — batch development

Owners: PR #3/#7/#5 and 02C–04D/05B–05E as relevant.

Rules:
- preserve strict `CONTENT_CHANGED` rejection when an old session identity does not match the branch catalog;
- do not add wildcard compatibility;
- do not generate migrations from each intermediate branch identity;
- every event migration decision must still be recorded in the crosswalk/semantic evidence;
- pending/history/seed truthfulness obligations remain part of each batch review even if full session compatibility is deferred.

A batch can be semantically reviewable while old release sessions remain explicitly incompatible with that intermediate branch.

## Phase 2 — compatibility-aware audit/runtime primitives

Natural owner: 05A or a tightly scoped prerequisite incorporated with 05A after principal foundation is stable.

Possible scope:
- event-definition fingerprint helper;
- migration/crosswalk schema validation;
- audit output for pending/history compatibility status;
- validation-only legacy catalog interface;
- tests proving compatibility definitions cannot enter `EventIndex`/scheduler.

Do not register a final target identity before the canonical catalog is stable.

If implementing runtime primitives at this stage would force repeated session-format churn, keep them as tested utilities/specification and defer envelope conversion to finalization.

## Phase 3 — final session content migration

Owner: 04E final T5.1 integration/terminal QA, after:
- all principal reconciliation is integrated;
- all 134 conditionals are reconciled;
- retirement FSM is resolved and integrated;
- final active catalog identity is stable.

Required work:
1. compute final canonical `contentIdentity`;
2. register explicit route(s) from deliberately supported frozen release identity/identities;
3. migrate SessionSnapshot to the compatibility-aware session version;
4. preserve old completed history/journal using per-decision provenance;
5. preserve/resolve already-presented legacy pending scenes exactly;
6. keep legacy definitions out of active scheduling;
7. implement approved same-scene seen/origin equivalences only from reviewed crosswalk decisions;
8. run the original migration matrix plus session migration addendum;
9. prove migration is deterministic, idempotent and zero-RNG;
10. prove unknown identities still fail explicitly.

Primary contracts:
- `T5_1_SAVE_SESSION_MIGRATION_RUNTIME_AUDIT.md`
- `T5_1_SESSION_CONTENT_MIGRATION_CONTRACT.json`
- `T5_1_MIGRATION_TEST_MATRIX.json`
- `T5_1_SESSION_MIGRATION_TEST_ADDENDUM.json`

## Session versioning

Recommended final direction: introduce a new SessionSnapshot version when compatibility metadata is implemented.

Do not silently redefine v2 semantics. Current v2 validation means:
- one active catalog identity;
- completed journal is validated against current catalog;
- pending event must exactly equal current catalog definition.

A compatibility-aware model is materially different and should be explicit.

GameState schema should be bumped only if the chosen per-decision provenance must live inside GameState. If compatibility provenance is session-envelope metadata, avoid an unnecessary GameState version change.

## Release support policy

Migration support should be explicit and finite.

For each supported source release record:
- content identity;
- engine build;
- session version;
- GameState schema;
- frozen legacy catalog reference/hash;
- migration route version;
- test fixture(s).

Unknown identities: reject.

Do not infer a source version merely from event IDs or build labels.

## Completion condition

T5.1 cannot claim final save/session compatibility until:
- final active catalog identity is stable;
- supported source identities are explicitly registered;
- mixed legacy+canonical session history validates;
- pending legacy scenes retain the exact decision already shown;
- legacy technical definitions never schedule again;
- receipts/revisions/idempotency remain intact;
- all RNG streams are unchanged by migration;
- retirement/epilogue facts remain truthful;
- migration suite is green on the final integration branch.
