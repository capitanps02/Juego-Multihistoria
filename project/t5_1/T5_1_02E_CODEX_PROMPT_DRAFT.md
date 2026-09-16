# DRAFT Codex task — T5.1 Batch 02E · canonical age 29

**Status: DRAFT — do not execute yet.**

## Dependencies

Execute only after Batch 02D is reviewed/integrated and the audit baseline is refreshed.

Read and obey:
- `AGENTS.md`
- `project/CHATGPT_CODEX_WORKFLOW.md`
- `project/t5_1/T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md`
- `project/t5_1/T5_1_PRINCIPAL_87_BATCH_MANIFEST.json`
- canonical rows in `analysis/2026-09-11/t1/principal-traceability.json`

## Goal

Reconcile the two remaining baseline-unresolved canonical principal scenes at age 29:

1. `EVT_29_TACT_001` — Reinventarte de verdad
2. `EVT_29_NAT_002` — ¿Seguir con la selección a cualquier precio?

This batch also owns a focused integrity review of the age-29 → age-30 transition so the already-present canonical hard-deadline scene `EVT_29_FIN_001` keeps its intended responsibility.

## Required work

### `EVT_29_TACT_001`
Implement the actual canonical reinvention dilemma from the source row. Do not treat any existing tactical-effect helper or later `ROLE_REINVENTED_30` flag as proof that the scene already exists.

### `EVT_29_NAT_002`
Implement the canonical selection-cost decision from the source row. Keep it semantically distinct from:
- `EVT_29_NAT_001` (national captaincy);
- generic national-standing drift;
- conditional selection callbacks.

### Transition integrity

Re-audit `EVT_29_FIN_001` and its `SEED_AGE30_PRIORITY` / `world.age30Priority` responsibility after the two new scenes are integrated.

The age-30 bridge must read the result later; no new age-29 scene may silently overwrite that priority.

## Causal obligations

- Tactical reinvention must remain observable in the maturity phase if canonical later scenes rely on it.
- National-team continuation/withdrawal posture must survive save/resume and remain separate from raw `nationalStanding`.
- Preserve the 29→30 hard-deadline ordering and do not let normal scheduling skip or duplicate the transition responsibility.

## Expected runtime area

Primary:
- `src/content/events/26_30/principal-events.ts`

Potentially:
- `src/catalog/seeds.ts`
- transition/adaptation code for 29→30
- save/migration compatibility
- targeted tests/audit artifacts

Do not implement age-30 scenes here.

## Migration rules

- No thematic aliasing from existing tactical/selection rows.
- Pending legacy scenes are not rewritten unless exact same-scene identity is proven.
- Preserve historical IDs where the old scene was different.
- Preserve current `contentIdentity` safeguards.

## Tests

Add targeted tests for:
- both target IDs and their canonical gates/choices;
- tactical reinvention memory after save/resume into 30+;
- national-team posture after save/resume;
- exactly one `EVT_29_FIN_001` hard-deadline resolution where eligible;
- `SEED_AGE30_PRIORITY` / `world.age30Priority` surviving the 30 transition;
- deterministic narrative with microfeeds on/off.

Run the common required validation commands from the task branch.

## Non-goals

- Do not implement Batch 03A age-30 scenes.
- Do not alter retirement FSM.
- Do not start conditional Batch 05C.
- Do not merge.

## Deliverable

Focused age-29 reconciliation plus verified 29→30 transition continuity, with migration dispositions and current test evidence for ChatGPT review.
