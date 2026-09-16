# T5.1 — completion-gate status

Date: 2026-09-16  
Branch assessed: `chore/chatgpt-codex-workflow`

## Overall status

**NOT_READY**

The audit/planning layer is now substantially stronger, including complete assignment of both sides of the 87 principal identity drift, semantic planning review for all 134 canonical conditional callbacks, reviewed planning dispositions for the 87 conditional legacy IDs, and an explicit save/session content-migration design. The workflow branch runtime itself has not been reconciled. No implementation PR has been merged into this branch during this audit work.

Important distinction:
- **planning/review evidence** can be complete for a batch;
- a completion gate only PASSes after runtime implementation + executable evidence.

## Gate dashboard

| Gate | Current status | Evidence / blocker |
|---|---|---|
| A — Principal identity completeness | **FAIL / implementation pending** | Baseline remains 167/254 literal principal IDs with 87 canonical IDs missing and 87 runtime-only principal IDs. Both 87-ID sides are assigned to responsible batches, but assignment is not implementation. |
| B — Principal semantic verification | **FAIL / implementation pending** | Common implementation rules and DRAFT prompts exist through 04E, but generic/technical principal mappings and exact-title candidates still require runtime reconciliation. Runtime `canonStatus` alone is not accepted as proof. |
| C — Seed chronology | **PARTIAL PLANNING / NOT PASS** | PR #7 targets age-26 origins; 02C–04C prompts explicitly protect record, successor, documentary, wealth/business, Bosman/agent, dorsal, travel/load and age-priority chains. Final longitudinal tests have not run on reconciled runtime. |
| D — Save & migration truthfulness | **DESIGN COMPLETE / IMPLEMENTATION NOT PASS** | Runtime audit, Session v3 design, migration contract, migration test addendum and delivery plan are prepared. `contentIdentity` remains intentionally strict. No supported-release content migration has been implemented/proven yet. |
| E — Retirement state machine | **FAIL / canonical tension open** | Runtime contains automatic no-market decision, timer announcement/closure, direct early close and `CEVT_RET_RECONSIDER` with non-monotonic reversal. Canonical matrix reversal vs monotonic semantic map requires explicit resolution. |
| F — Epilogue truthfulness | **NOT VERIFIED** | Generator correctly requires `closed`, but terminal facts and several ending-family inputs depend on unreconciled 04D/05E behavior. |
| G — Determinism & RNG | **TEST DESIGN READY / FINAL EVIDENCE PENDING** | Existing suites/RNG streams provide infrastructure; principal, conditional and migration plans require save/RNG regression. Do not claim final PASS from stale pre-reconciliation runs. |
| Conditional semantic gate | **PLANNING REVIEW 134/134 / RUNTIME NOT RECONCILED** | Every canonical conditional has phase-level semantic review evidence. Generic factories, identity drifts and exact-ID collisions still require runtime work. |
| H — Full 388-event identity | **FAIL / baseline drift remains** | P1/workflow runtime baseline has 167 exact principals + 47 exact conditionals = 214 exact canonical IDs, with 87 principal + 87 conditional identity drifts. |

## Handoff/source preservation milestone

The four large original handoff artifacts are preserved byte-for-byte as deterministic gzip files in `project/t5_1/source_archives/`:
- full canonical 388-event identity manifest;
- conditional review matrix;
- legacy ID crosswalk template;
- 26+/retirement semantic map.

`source_archives/CHECKSUMS.json` records for each file:
- original byte count + SHA-256;
- deterministic gzip byte count + SHA-256;
- Git blob SHA-1.

All four locally reproduced deterministic gzip blobs match the blobs stored in GitHub. This closes the preservation discrepancy between the normalized operational manifest and the full original handoff manifest.

## Principal planning milestone

The 87 baseline-unresolved canonical principal IDs are assigned exactly once in `T5_1_PRINCIPAL_87_BATCH_MANIFEST.json`.

The complementary 87 runtime-only principal IDs are assigned to the same responsible batches in `T5_1_PRINCIPAL_LEGACY_EXTRA_87_INVENTORY.json`.

Canonical missing-ID coverage:
- PR #3: 6;
- PR #7: 9;
- PR #5: 3;
- 02C: 7;
- 02D: 5;
- 02E: 2;
- 03A: 10;
- 03B: 12;
- 04A: 11;
- 04B: 10;
- 04C: 10;
- 04D: 2;
- total: **87/87**.

Legacy-side rules:
- all 87 runtime-only principal IDs have a responsible batch;
- none is automatically approved for same-scene migration by inventory membership;
- exact-title candidates remain review candidates only;
- every batch must close both the canonical-missing side and the technical-extra side.

DRAFT implementation prompts are prepared for every future principal batch 02C–04E, and `T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md` provides the shared semantic/migration/RNG contract.

This is planning completeness only. Runtime Gate A remains FAIL until the canonical set is actually implemented and audited.

## Active PR base-drift preflight

GitHub refresh on 2026-09-16 shows PR #3, PR #7 and PR #5 are still open, draft and unmerged, with no functional implementation added.

Their task branches were created from workflow commit `534663540c7b64a4e35e6f29b814704af3758435`. At the latest refresh they are each **76 commits behind** the workflow branch and diverged only by their task-specific documentation/decision commits.

Before executing Codex on any active PR:
1. re-read `project/CODEX_QUEUE.md`;
2. verify PR state and branch diff;
3. freeze the exact pre-T5.1 active event catalog/content identity before the first functional catalog edit;
4. re-ground the selected task branch on the current workflow base without dropping its task artifacts;
5. refresh the task audit baseline;
6. only then execute the branch-specific Codex prompt.

Do not interpret GitHub `mergeable: false` as permission to merge or to rewrite task history automatically. No task branch is re-grounded until needed for execution/review.

## Conditional planning milestone

Reviewed canonical conditionals:
- 18–20: 14/14;
- 20–23: 18/18;
- 23–26: 20/20;
- 26–30: 24/24;
- 30–34: 26/26;
- 34+: 32/32;
- total: **134/134**.

Crosswalk planning state for the 87 runtime-only conditional IDs:
- **86/87** = `retire_technical_keep_history_only`;
- **1/87** = `unresolved` (`CEVT_RET_RECONSIDER`, blocked by the retirement-reversal source tension);
- **0/87** approved for direct same-scene ID migration.

The 47 exact canonical conditional IDs are not identity drift, but they still require semantic certification/content-version handling when their scene contract changes. Same string ID does not make an old pending scene compatible.

This supersedes the old `count_only_not_semantically_reconciled` assumption in `scripts/audit-t51.mjs` / `scripts/test-t51.mjs`. Those scripts are known audit debt and must be upgraded during 05A rather than kept green by preserving the obsolete model.

## Save/session content migration milestone

The runtime audit confirmed:
- `contentIdentity` is SHA-256 over serialized active event definitions;
- changed content intentionally triggers `CONTENT_CHANGED`;
- pending decisions store the full event definition;
- current SessionSnapshot validation requires pending definition equality with the current catalog;
- current journal validation also resolves historical choice/outcome text through the current catalog.

T5.1 therefore requires explicit **session content migration**, not relaxed validation.

Prepared artifacts:
- `T5_1_SAVE_SESSION_MIGRATION_RUNTIME_AUDIT.md`;
- `T5_1_SESSION_CONTENT_MIGRATION_CONTRACT.json`;
- `T5_1_SESSION_V3_DESIGN_SPEC.md`;
- `T5_1_SESSION_MIGRATION_TEST_ADDENDUM.json`;
- `T5_1_CONTENT_MIGRATION_DELIVERY_PLAN.md`;
- `T5_1_PREIMPLEMENTATION_CONTENT_FREEZE.md`;
- source `T5_1_MIGRATION_TEST_MATRIX.json`.

Design invariants:
- do not weaken `contentIdentity`;
- freeze supported pre-T5.1 catalog identity before first functional edit;
- do not register every intermediate task-branch content identity as a supported release;
- validation-only legacy catalogs must never feed the scheduler;
- a legacy pending decision resolves exactly the definition already shown to the player, without rescheduling or RNG consumption;
- completed legacy history stays historical truth rather than being relabeled canonical;
- unknown content identities fail transparently;
- final supported-release migration is registered only after the canonical 388-event catalog is stable.

## Most important blockers found by semantic review

### Exact-ID collisions / false confidence
- `CEVT_21_MEDIA_01`: exact ID but different runtime title/trigger/scene contract.
- `CEVT_22_FREE_01`: exact ID but missing formal-interest/preagreement/crisis contract.
- 20 exact IDs in 23–26 share generic scene/choices despite matching canonical IDs/titles.
- five exact age-29 callbacks use generic factory semantics despite runtime `verified` metadata.
- `CEVT_RET_NO_LAST_MATCH` and `CEVT_RET_STORYBOOK_LAST_GOAL` are exact/verified but semantically mismatched.

### Principal title candidates still need proof
Title equality is not identity proof. Important unresolved candidates include:
- `EVT_30_BRIDGE_001` vs runtime `EVT_30_IDN_001`;
- `EVT_38_RICH_001` vs runtime `EVT_36_RICH_001`;
- `EVT_RET_FAM_001` vs runtime `EVT_RET_HOME_001`;
- `EVT_RET_LASTMATCH_001` vs runtime `EVT_RET_LAST_001`.

PR #5 separately owns the three 26–30 title candidates already identified there.

### Confirmed condition mismatch
`CEVT_24_TOURN_02` canonically represents being left out of the tournament final list. Runtime requires `NATIONAL_CALLED == true`; simulator provenance confirms that flag represents an actual senior call-up path, so the mismatch is real rather than a naming ambiguity.

### Migration truthfulness
Same string ID is not enough for pending-save compatibility. A pending old generic callback must not reload into a newly canonical scene/choice set just because the ID stayed constant.

### Retirement source tension
The conditional matrix contains `CEVT_38_RETIREMENT_REVERSAL` (return contemplated after retirement), while the semantic map defines a monotonic `playing -> decided -> announced -> closed` model and prohibits `closed -> *`.

Implementation must not silently choose one interpretation. Canonical state responsibility must be resolved explicitly before 04D/05E runtime work.

## What is actually closed now

The following are complete as **audit/planning artifacts**, not runtime gates:
- GitHub read/write handoff verification;
- byte-exact preservation and checksum verification of the four large original handoff sources;
- normalized 388-ID operational identity manifest plus preserved full original manifest;
- exact-ID certification rule: identity != semantic verification;
- complete 87/87 canonical principal batch assignment;
- complete 87/87 runtime-only principal responsibility assignment;
- DRAFT principal implementation contracts 02C–04E;
- 134/134 conditional semantic planning review;
- 86/87 conditional legacy dispositions closed at planning level, 1 explicit unresolved blocker;
- DRAFT conditional implementation contracts 05A–05E;
- 18–20 causal flag provenance review;
- targeted save/RNG test design;
- save/session migration runtime audit + Session v3/content-migration design;
- preimplementation catalog-freeze requirement;
- identification of stale conditional assumptions in current `audit:t51` / `test:t51`;
- retirement runtime/FSM audit;
- epilogue runtime audit;
- documented late-retirement canonical/FSM tension.

## Next executable-development path

Queue authority remains `project/CODEX_QUEUE.md`.

Current top of queue:
1. PR #3 — READY, with baseline freeze + current workflow-base re-ground required immediately before execution;
2. PR #7 — READY, same preflight required, recommended after #3 review;
3. PR #5 — BLOCKED-BY-#7.

No DRAFT batch becomes READY simply because its planning review/prompt is complete.

The current queue order is deliberately conservative. Some later audit-only work (notably 05A) has looser logical dependencies than its numeric placement, but the sequence is not changed here because no implementation has started and minimizing parallel write surfaces is safer.

## Final completion condition remains unchanged

T5.1 reaches `T5.1_COMPLETE` only when all **388/388** canonical events pass:
- identity;
- semantic fidelity;
- causal/seed chronology;
- save/migration truthfulness;
- retirement/epilogue invariants;
- determinism/RNG QA;
- final targeted + acceptance evidence.

Current status remains **NOT_READY**.
