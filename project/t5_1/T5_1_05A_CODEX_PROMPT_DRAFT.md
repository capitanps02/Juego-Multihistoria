# DRAFT Codex task — T5.1 Batch 05A canonical auditor foundation

**DO NOT EXECUTE while Batch 05A is DRAFT in `project/CODEX_QUEUE.md`.**  
This is a prepared implementation prompt, not authorization to launch Codex or merge anything.

## Objective

Replace the obsolete T5.1 conditional `count_only_not_semantically_reconciled` audit with an enforceable canonical-audit foundation that distinguishes:

1. canonical identity;
2. semantic verification evidence;
3. migration/crosswalk truthfulness;
4. causal/save/terminal verification status.

Do **not** attempt to make all 388 events green in this task. The auditor must truthfully report current failures/incomplete verification.

## Required reading before editing

Read and follow:
- `AGENTS.md`
- `project/CHATGPT_CODEX_WORKFLOW.md`
- `project/CODEX_QUEUE.md`
- `project/t5_1/T5_1_AUDITOR_IMPLEMENTATION_SPEC.md`
- `project/t5_1/T5_1_COMPLETION_GATE.md`
- `project/t5_1/T5_1_COMPLETION_STATUS_2026-09-16.md`
- `project/t5_1/T5_1_CANONICAL_IDENTITY_MANIFEST_388.json`
- `project/t5_1/T5_1_CANONICAL_EVENT_VERIFICATION.schema.json`
- `project/t5_1/T5_1_05A_EXACT_ID_DISPOSITIONS.json`
- `project/t5_1/T5_1_CONDITIONAL_SEMANTIC_REVIEW_SUMMARY.md`
- phase review docs under `project/t5_1/`

Large original audit inputs are preserved in `project/t5_1/source_archives/`. Do not infer semantics merely from file names; use the reviewed artifacts and existing canonical manifests.

## Current debt to replace

`scripts/audit-t51.mjs` currently:
- audits principal IDs against old traceability;
- treats conditionals as count-only;
- says no canonical conditional ID inventory exists.

`scripts/test-t51.mjs` currently asserts that obsolete state.

Those assumptions are now false because the handoff includes 134 unique canonical conditional IDs and all 134 have planning-level semantic review evidence.

Do not preserve the obsolete assertions just to keep the test green.

## Scope allowed

Primary implementation files may include:
- `scripts/audit-t51.mjs` or a clearly named replacement split into audit lanes;
- `scripts/test-t51.mjs` and new narrowly-scoped T5.1 audit tests;
- `package.json` scripts for explicit T5.1 audit lanes;
- generated audit output under `analysis/...` if the repository workflow requires it;
- machine-readable T5.1 audit result files.

Minimal helper code for loading/validating audit artifacts is allowed.

## Out of scope

Do not modify in this task:
- canonical event content in `src/content/events/**`;
- scheduler/resolver gameplay semantics except if absolutely required to expose read-only audit metadata (prefer not to);
- principal/conditional IDs;
- seeds or NPC chronology;
- save migration behavior;
- retirement behavior;
- epilogue behavior;
- any PR merge state.

If the auditor exposes a runtime semantic failure, **report it**; do not repair gameplay content in 05A auditor foundation.

## Required identity behavior

The auditor must load the canonical 388-ID manifest and compare active runtime content by kind.

Report separately:
- canonical principals expected/found/missing/extra/duplicates;
- canonical conditionals expected/found/missing/extra/duplicates;
- total canonical IDs expected/found;
- runtime-only active IDs.

Final target is:
- 254 principal IDs;
- 134 conditional IDs;
- 388 total;
- no duplicates;
- no active extras.

On the current unreconciled runtime, the auditor is expected to **fail truthfully**, not force green.

## Required semantic-evidence behavior

Implement a verification-record layer compatible with `T5_1_CANONICAL_EVENT_VERIFICATION.schema.json` or an explicitly documented equivalent that preserves every required semantic field.

Rules:
- exact event ID can satisfy identity only;
- runtime `canonStatus:"verified"` must never auto-set `canonical_verified_full`;
- title equality cannot auto-certify semantics;
- every required field must be explicit `pass`, `fail`, `not_reviewed` or `not_applicable` as allowed by schema/spec;
- any required `fail`/`not_reviewed` blocks full verification;
- evidence must point to auditable artifacts or executable checks.

Add a regression fixture proving that a runtime exact-ID + `verified` event can still fail semantic certification. Suitable known examples include:
- `CEVT_29_BODY_04`;
- `CEVT_RET_NO_LAST_MATCH`;
- `CEVT_RET_STORYBOOK_LAST_GOAL`.

Do not hard-code them as the only possible failures; use them to test the rule.

## Required conditional behavior

Replace `count_only_not_semantically_reconciled` with real conditional identity/review status.

At minimum the report must know:
- canonical conditionals = 134;
- exact IDs in the P1-style baseline can be less than 134;
- a conditional exact ID is not full fidelity;
- phase review evidence exists for all 134 canonical callbacks.

The auditor must **not** claim 134 runtime semantic PASSes simply because planning review documents exist. Planning review means reviewed evidence exists; runtime field PASS still requires matching implementation/evidence.

## Required crosswalk behavior

Load the reviewed crosswalk source or normalized derivative.

For every baseline legacy drift ID, support the decision vocabulary from the auditor spec:
- `same_scene_rewrite_and_id_migration`;
- `retire_technical_keep_history_only`;
- `retain_noncanonical_outside_canonical_set`;
- `no_mapping`;
- `unresolved`.

Unresolved required mappings must block the relevant migration/completion lane.

Do not create fuzzy/title aliases automatically.

## Required migration truthfulness model

The auditor must represent separately:
- old history truth preserved;
- pending event handled;
- seed origins handled.

A same string ID does not prove pending content compatibility. This is required because several exact IDs currently denote generic/semantically different pending decisions.

This task may report `pendingEventHandled:false/not_reviewed`; it does not need to implement migrations.

## Required retirement checks in auditor foundation

At minimum add static/audit assertions capable of flagging:
- forbidden `closed -> *` transitions;
- direct `playing -> closed` in ordinary canonical flow;
- epilogue-before-closed if statically/executably detectable;
- a callback marked verified when known terminal semantic evidence fails.

Known current issue to expose, not repair in this task:
- `CEVT_RET_RECONSIDER` performs `announced -> playing` while canonical semantic map currently defines a monotonic model. The canonical `CEVT_38_RETIREMENT_REVERSAL` source tension is documented and should appear as unresolved/blocked evidence rather than silently choosing an interpretation.

## Suggested command surface

Prefer clear lanes such as:

```text
npm run audit:t51:identity
npm run audit:t51:semantic
npm run test:t51:migration
npm run test:t51:retirement
npm run test:t51:full
```

You may retain `npm run audit:t51` / `npm run test:t51` as aggregate/backward-compatible entry points if useful, but they must no longer encode the obsolete count-only conditional assumption.

Do not hide which lane failed.

## Required tests

At minimum test:

1. canonical manifest counts are 254 + 134 = 388;
2. duplicate canonical IDs fail identity lane;
3. missing canonical ID fails identity lane;
4. active runtime-only ID fails final identity lane unless explicitly separated/approved;
5. exact ID does not auto-certify semantics;
6. runtime `canonStatus:"verified"` does not auto-certify semantics;
7. title-only similarity never creates an alias;
8. unresolved crosswalk entries block migration/completion lane;
9. verification record with one required `not_reviewed` cannot become `canonical_verified_full`;
10. verification record with one required `fail` cannot become `canonical_verified_full`;
11. conditional audit is no longer count-only;
12. auditor can report current runtime failures without crashing;
13. no audit/read operation consumes runtime RNG;
14. audit output is deterministic for the same built content + audit inputs.

## Preserve existing save/session guarantees

Run existing suites after auditor changes. Do not weaken validation to make audit fixtures convenient.

Required commands for the implementation PR:

```text
npm run build
npm run validate
npm run test:session
npm run test:saves
npm run audit:t51
npm run test:t51
```

Also run every new T5.1 lane introduced by this task.

## Expected result on current runtime

A successful 05A auditor implementation may exit non-zero for full canonical completion because the runtime is intentionally unreconciled.

Therefore distinguish:
- **auditor implementation tests pass** (the tool correctly detects known incomplete state);
- **full T5.1 canonical gate passes** (expected only after later batches).

Do not make CI unusable by treating “known project not complete yet” as a test-framework failure in every command. Provide a dedicated strict/full gate for final completion and deterministic unit tests for auditor correctness.

## Acceptance criteria for this task

05A auditor foundation is reviewable when:
- old count-only conditional assumption is gone;
- 388-ID identity audit is machine enforced;
- semantic verification status is independent of runtime legacy status;
- crosswalk/migration state is represented explicitly;
- known exact-ID semantic failures remain visible;
- output is deterministic and machine-readable;
- existing build/session/save suites remain green;
- no gameplay event content was modified;
- diff is restricted to auditor/test/tooling surface.

## Handoff after Codex returns

ChatGPT must:
1. inspect the complete diff;
2. inspect all test output;
3. verify no runtime event semantics changed;
4. compare audit output against known 05A/05B/05C/05D/05E findings;
5. request changes if the auditor launders exact IDs/statuses into false PASSes;
6. never merge without Pedro’s explicit instruction.

## State

**DRAFT PROMPT — NOT READY TO EXECUTE UNTIL `project/CODEX_QUEUE.md` MARKS BATCH 05A READY**