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

## Audit work added on the workflow branch

### Batch 05D — conditional ages 30–34
- `T5_1_05D_SEMANTIC_REVIEW.md`
- `T5_1_05D_SEMANTIC_REVIEW.json`

Result: 26/26 legacy/runtime shells reviewed; 0/26 approved as same-scene direct migrations. Runtime implementation remains blocked by its dependency chain.

### Batch 05A — exact-ID conditional foundation
- `T5_1_05A_EXACT_ID_FOUNDATION.md`
- `T5_1_05A_EXACT_ID_DISPOSITIONS.json`
- `T5_1_05A_REVIEW_18_20.md`
- `T5_1_05A_FLAG_PROVENANCE_18_20.md`
- `T5_1_05A_TARGETED_TEST_SPEC.md`

Result:
- 47 canonical conditional IDs are exact in the P1/runtime baseline;
- 0/47 are auto-promoted to `canonical_verified_full` merely from ID/status;
- 18–20 has 14 individually authored exact-ID callbacks and has received field-level review;
- later exact-ID groups expose generic factory semantics that require rewrite/certification;
- runtime `canonStatus:"verified"` is advisory legacy metadata, not an audit certificate.

## Canonical closure targets

- principal canonical IDs: 254
- conditional canonical IDs: 134
- total unique canonical IDs: 388

T5.1 completion requires identity, semantic, migration, causal, save/resume, retirement and deterministic/RNG gates — not only zero ID drift.

## Current execution safety

The first executable item remains the first `READY` entry in `project/CODEX_QUEUE.md`. A user command `ejecuta Codex` is required before Codex is launched. DRAFT/BLOCKED items must not be executed.