# Multihistoria — T5.1 audit/workflow handoff

## GitHub source of truth

Repository: `capitanps02/Juego-Multihistoria`  
Workflow branch: `chore/chatgpt-codex-workflow`

Operational rule: do not execute Codex and do not merge PRs automatically. Runtime implementation remains PR/batch gated through `project/CODEX_QUEUE.md`.

## Original handoff sources

- `PROMPT_NUEVO_CHAT_GITHUB_T5_1.md`
- `T5_1_AUDITOR_HANDOFF.md`
- `T5_1_AUDITOR_IMPLEMENTATION_SPEC.md`
- `T5_1_COMPLETION_GATE.md`
- `T5_1_CONDITIONAL_RECONCILIATION_PLAN.md`
- `T5_1_CANONICAL_IDENTITY_MANIFEST_388.json`
- `T5_1_CANONICAL_EVENT_VERIFICATION.schema.json`
- `T5_1_MIGRATION_TEST_MATRIX.json`
- `T5_1_IDENTITY_AUDITOR_PROTOTYPE.mjs`
- `T5_1_IDENTITY_AUDIT_P1_REPRO.json`

Large source artifacts from the handoff are preserved byte-for-byte as deterministic gzip files under `source_archives/`:
- `source_archives/T5_1_CANONICAL_IDENTITY_MANIFEST_388.full.json.gz`
- `source_archives/T5_1_LEGACY_ID_CROSSWALK_TEMPLATE.json.gz`
- `source_archives/T5_1_CONDITIONAL_REVIEW_MATRIX.csv.gz`
- `source_archives/T5_1_SEMANTIC_MAP_26_RETIREMENT.md.gz`
- `source_archives/CHECKSUMS.json` records original SHA-256, archive SHA-256, byte counts and Git blob SHA-1 for all four archives.

The four source archives were reproduced locally with deterministic gzip (`compresslevel=9`, `mtime=0`) from the original handoff files and their resulting Git blob SHA-1 values match the blobs stored on this branch. This is preservation evidence only; the normalized operational files elsewhere in `project/t5_1/` remain the working audit inputs.

## Current gate snapshot

- `T5_1_COMPLETION_STATUS_2026-09-16.md`

Overall runtime status remains **NOT_READY**. Planning evidence is much further ahead than implementation; no planning review is treated as a runtime PASS.

## Principal reconciliation planning — both 87-ID sides assigned

Master planning artifacts:
- `T5_1_PRINCIPAL_87_BATCH_MANIFEST.json` — 87 canonical principal IDs missing from baseline runtime, assigned exactly once;
- `T5_1_PRINCIPAL_LEGACY_EXTRA_87_INVENTORY.json` — 87 runtime-only principal IDs, assigned to the batch responsible for semantic disposition;
- `T5_1_PRINCIPAL_PLANNING_SUMMARY.md`;
- `T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md`.

Baseline:
- canonical principal events: 254;
- exact principal IDs in P1: 167;
- canonical principal IDs missing in baseline: 87;
- runtime-only principal IDs: 87.

Canonical-side assignment:
- active PRs #3/#7/#5: 18 IDs;
- future batches 02C–04D: 69 IDs;
- total assigned exactly once: 87/87.

Legacy-side inventory:
- all 87 runtime-only principal IDs are assigned to the corresponding responsible batch;
- none is automatically approved for migration by the inventory;
- 7 exact-title candidates remain semantic-review candidates only.

Prepared DRAFT prompts for the future principal chain:
- `T5_1_02C_CODEX_PROMPT_DRAFT.md`
- `T5_1_02D_CODEX_PROMPT_DRAFT.md`
- `T5_1_02E_CODEX_PROMPT_DRAFT.md`
- `T5_1_03A_CODEX_PROMPT_DRAFT.md`
- `T5_1_03B_CODEX_PROMPT_DRAFT.md`
- `T5_1_04A_CODEX_PROMPT_DRAFT.md`
- `T5_1_04B_CODEX_PROMPT_DRAFT.md`
- `T5_1_04C_CODEX_PROMPT_DRAFT.md`
- `T5_1_04D_CODEX_PROMPT_DRAFT.md`
- `T5_1_04E_CODEX_PROMPT_DRAFT.md`

Important title-only candidates still require full semantic proof before any rename/migration, including `EVT_30_BRIDGE_001` vs `EVT_30_IDN_001`, `EVT_38_RICH_001` vs `EVT_36_RICH_001`, and the retirement principal candidates.

## Conditional semantic review — 134/134 planning complete

Master state:
- `T5_1_CONDITIONAL_SEMANTIC_REVIEW_SUMMARY.md`
- `T5_1_CONDITIONAL_RECONCILIATION_STATE.json`
- `T5_1_CONDITIONAL_LEGACY_DISPOSITION_OVERLAY_87.json`

Conditional baseline:
- canonical/runtime count: 134/134;
- exact canonical IDs in P1: 47;
- canonical IDs missing: 87;
- runtime-only legacy IDs: 87.

Planning disposition for the 87 runtime-only conditionals:
- 86 = `retire_technical_keep_history_only`;
- 1 = unresolved: `CEVT_RET_RECONSIDER`, blocked by the retirement-reversal source tension;
- 0 approved direct same-scene ID migrations.

The 47 exact IDs are not crosswalk drift, but old saves can still be semantically incompatible after a rewrite. Same string ID never bypasses content-version migration requirements.

### Batch 05A — exact-ID foundation / 18–20 / 23–26
- `T5_1_05A_EXACT_ID_FOUNDATION.md`
- `T5_1_05A_EXACT_ID_DISPOSITIONS.json`
- `T5_1_05A_REVIEW_18_20.md`
- `T5_1_05A_FLAG_PROVENANCE_18_20.md`
- `T5_1_05A_TARGETED_TEST_SPEC.md`
- `T5_1_05A_REVIEW_23_26.md`
- `T5_1_05A_23_26_PROVENANCE_ADDENDUM.md`
- `T5_1_05A_CODEX_PROMPT_DRAFT.md`

Key result:
- 47/134 canonical conditionals have exact IDs in the P1/runtime baseline;
- 0/47 are auto-promoted to `canonical_verified_full` merely from ID/runtime status;
- 18–20 contains individually-authored callbacks with several strong causal candidates but remaining certification gaps;
- 23–26 has 20/20 exact IDs/titles but all 20 still use generic runtime scene/choice semantics;
- `CEVT_24_TOURN_02` has a confirmed condition mismatch around `NATIONAL_CALLED`.

### Batch 05B — 20–23
- `T5_1_05B_SEMANTIC_REVIEW_20_23.md`
- `T5_1_05B_CODEX_PROMPT_DRAFT.md`

Result:
- 18/18 canonical/runtime callbacks reviewed;
- generic callback factory requires semantic rewrite;
- exact-ID semantic collisions identified for `CEVT_21_MEDIA_01` and `CEVT_22_FREE_01`;
- 0 direct pending-scene substitutions approved.

### Batch 05C — 26–30
- `T5_1_05C_SEMANTIC_REVIEW_26_30.md`
- `T5_1_05C_CODEX_PROMPT_DRAFT.md`

Result:
- 24/24 canonical/runtime callbacks reviewed;
- five age-29 exact IDs still require semantic repair/certification despite runtime `verified` metadata.

### Batch 05D — 30–34
- `T5_1_05D_SEMANTIC_REVIEW.md`
- `T5_1_05D_SEMANTIC_REVIEW.json`
- `T5_1_05D_CODEX_PROMPT_DRAFT.md`

Result:
- 26/26 legacy/runtime shells reviewed;
- 0/26 approved as same-scene direct migrations;
- runtime implementation remains blocked by dependency chain.

### Batch 05E — 34+
- `T5_1_05E_SEMANTIC_REVIEW_34_PLUS.md`
- `T5_1_05E_CODEX_PROMPT_DRAFT.md`

Result:
- 32/32 canonical/runtime callbacks reviewed;
- 0/5 exact IDs are auto-certifiable;
- retirement callbacks expose state-machine/closure mismatches;
- open canonical source tension: `CEVT_38_RETIREMENT_REVERSAL` vs monotonic `playing -> decided -> announced -> closed` model and `closed -> *` prohibition.

## Save/session content migration — runtime audit + design complete

The current strict behavior is intentional:
- session `contentIdentity` is SHA-256 over serialized active events;
- changed catalog content produces `CONTENT_CHANGED`;
- pending decisions store the full `EventDefinition`;
- pending validation requires exact definition equality in the current single-catalog model;
- completed session journal validation currently depends on current event title/choice/outcome text.

Therefore T5.1 semantic rewrites require an explicit content migration rather than weakening validation.

Artifacts:
- `T5_1_SAVE_SESSION_MIGRATION_RUNTIME_AUDIT.md`
- `T5_1_SESSION_CONTENT_MIGRATION_CONTRACT.json`
- `T5_1_SESSION_V3_DESIGN_SPEC.md`
- `T5_1_SESSION_MIGRATION_TEST_ADDENDUM.json`
- `T5_1_CONTENT_MIGRATION_DELIVERY_PLAN.md`
- `T5_1_PREIMPLEMENTATION_CONTENT_FREEZE.md`
- existing source matrix `T5_1_MIGRATION_TEST_MATRIX.json`.

Key design:
- freeze exact pre-T5.1 event catalog/content identity before first functional event edit;
- do not migrate every intermediate task-branch identity;
- final supported-release migration is registered after the canonical catalog is stable;
- use validation-only legacy catalogs, never active scheduling;
- preserve legacy pending scenes exactly and resolve the already-presented definition without rescheduling/RNG;
- use per-decision source identity/event fingerprint for mixed legacy + canonical session history;
- preserve old history/seed origin labels unless same-scene equivalence is explicitly proven;
- unknown source identities remain rejected.

The active-PR execution preflight is in `T5_1_ACTIVE_PR_EXECUTION_PREFLIGHT.md` and now requires the baseline freeze before the first functional catalog edit.

## Terminal / epilogue work prepared

### Batch 04D — retirement FSM
- `T5_1_04D_RETIREMENT_RUNTIME_AUDIT.md`
- `T5_1_CANON_DECISION_REQUIRED_RETIREMENT_REVERSAL.md`
- `T5_1_04D_CODEX_PROMPT_DRAFT.md`

Current audit finds automatic no-market decision, timer-based announcement, administrative no-last-match close, direct early-retirement close, non-monotonic reversal, compressed terminal choices and non-fact-driven last-match behavior. 04D remains DRAFT and depends on principal 04C plus the canonical reversal decision.

### Batch 04E — epilogue + final QA + final content migration
- `T5_1_04E_EPILOGUE_RUNTIME_AUDIT.md`
- `T5_1_04E_CODEX_PROMPT_DRAFT.md`

The current generator correctly guards epilogue generation behind `closed`, but final truthfulness depends on canonical terminal facts from 04D/05E. The 04E prompt now also owns final supported-release session content migration after the 388-event active catalog is stable.

04E is the final T5.1 task and remains blocked until all prior reconciliation is integrated.

## Canonical closure targets

- principal canonical IDs: 254
- conditional canonical IDs: 134
- total unique canonical IDs: 388

T5.1 completion requires identity, semantic, migration, causal, save/resume, retirement and deterministic/RNG gates — not only zero ID drift.

## Auditor debt now explicitly known

Current `scripts/audit-t51.mjs` / `scripts/test-t51.mjs` still use the obsolete assumption that conditionals are `count_only_not_semantically_reconciled` because no canonical conditional inventory existed.

That assumption must be replaced during 05A runtime work with the 134-row semantic/identity audit; it must not be preserved merely to keep old tests green.

## Current execution safety

The first executable item remains the first `READY` entry in `project/CODEX_QUEUE.md` — currently PR #3 unless GitHub changes after this snapshot. A user command `ejecuta Codex` is required before Codex is launched. DRAFT/BLOCKED items must not be executed.
