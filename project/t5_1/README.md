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
- `source_archives/T5_1_LEGACY_ID_CROSSWALK_TEMPLATE.json.gz`
- `source_archives/T5_1_CONDITIONAL_REVIEW_MATRIX.csv.gz`
- `source_archives/T5_1_SEMANTIC_MAP_26_RETIREMENT.md.gz`

## Conditional semantic review — 134/134 planning complete

Master summary:
- `T5_1_CONDITIONAL_SEMANTIC_REVIEW_SUMMARY.md`

### Batch 05A — exact-ID foundation / 18–20 / 23–26
- `T5_1_05A_EXACT_ID_FOUNDATION.md`
- `T5_1_05A_EXACT_ID_DISPOSITIONS.json`
- `T5_1_05A_REVIEW_18_20.md`
- `T5_1_05A_FLAG_PROVENANCE_18_20.md`
- `T5_1_05A_TARGETED_TEST_SPEC.md`
- `T5_1_05A_REVIEW_23_26.md`
- `T5_1_05A_23_26_PROVENANCE_ADDENDUM.md`

Key result:
- 47/134 canonical conditionals have exact IDs in the P1/runtime baseline;
- 0/47 are auto-promoted to `canonical_verified_full` merely from ID/runtime status;
- 18–20 contains individually-authored callbacks with several strong causal candidates but remaining certification gaps;
- 23–26 has 20/20 exact IDs/titles but all 20 still use generic runtime scene/choice semantics;
- `CEVT_24_TOURN_02` has a confirmed condition mismatch around `NATIONAL_CALLED`.

### Batch 05B — 20–23
- `T5_1_05B_SEMANTIC_REVIEW_20_23.md`

Result:
- 18/18 canonical/runtime callbacks reviewed;
- generic callback factory requires semantic rewrite;
- exact-ID semantic collisions identified for `CEVT_21_MEDIA_01` and `CEVT_22_FREE_01`;
- 0 direct pending-scene substitutions approved.

### Batch 05C — 26–30
- `T5_1_05C_SEMANTIC_REVIEW_26_30.md`

Result:
- 24/24 canonical/runtime callbacks reviewed;
- five age-29 exact IDs still require semantic repair/certification despite runtime `verified` metadata.

### Batch 05D — 30–34
- `T5_1_05D_SEMANTIC_REVIEW.md`
- `T5_1_05D_SEMANTIC_REVIEW.json`

Result:
- 26/26 legacy/runtime shells reviewed;
- 0/26 approved as same-scene direct migrations;
- runtime implementation remains blocked by dependency chain.

### Batch 05E — 34+
- `T5_1_05E_SEMANTIC_REVIEW_34_PLUS.md`

Result:
- 32/32 canonical/runtime callbacks reviewed;
- 0/5 exact IDs are auto-certifiable;
- retirement callbacks expose state-machine/closure mismatches;
- open canonical source tension: `CEVT_38_RETIREMENT_REVERSAL` vs monotonic `playing -> decided -> announced -> closed` model and `closed -> *` prohibition.

## Canonical closure targets

- principal canonical IDs: 254
- conditional canonical IDs: 134
- total unique canonical IDs: 388

T5.1 completion requires identity, semantic, migration, causal, save/resume, retirement and deterministic/RNG gates — not only zero ID drift.

## Auditor debt now explicitly known

Current `scripts/audit-t51.mjs` / `scripts/test-t51.mjs` still use the obsolete assumption that conditionals are `count_only_not_semantically_reconciled` because no canonical conditional inventory existed.

That assumption must be replaced during 05A runtime work with the 134-row semantic/identity audit; it must not be preserved merely to keep old tests green.

## Current execution safety

The first executable item remains the first `READY` entry in `project/CODEX_QUEUE.md`. A user command `ejecuta Codex` is required before Codex is launched. DRAFT/BLOCKED items must not be executed.