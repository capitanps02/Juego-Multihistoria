# DRAFT Codex task — T5.1 Batch 02E · canonical age 29

**Status: DRAFT — do not execute yet.**

## Dependencies

Execute only after Batch 02D is reviewed/integrated and the audit baseline is refreshed.

Read and obey:
- `AGENTS.md`
- `project/CHATGPT_CODEX_WORKFLOW.md`
- `project/t5_1/T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md`
- `project/t5_1/T5_1_PRINCIPAL_87_BATCH_MANIFEST.json`
- `project/t5_1/T5_1_02E_PRINCIPAL_LEGACY_REVIEW.md`
- `project/t5_1/T5_1_02E_PRINCIPAL_LEGACY_DISPOSITIONS.json`
- canonical rows in `analysis/2026-09-11/t1/principal-traceability.json`

## Goal

Reconcile the two remaining baseline-unresolved canonical principal scenes at age 29:

1. `EVT_29_TACT_001` — Reinventarte de verdad
2. `EVT_29_NAT_002` — ¿Seguir con la selección a cualquier precio?

This batch also owns a focused integrity review of the age-29 → age-30 transition so the already-present canonical hard-deadline scene `EVT_29_FIN_001` keeps its intended responsibility.

## Legacy dispositions are already decided

Do not reopen semantic identity for these eight runtime-only rows. Review is complete: **8/8 `retire_technical_keep_history_only`; 0/8 same-scene migrations.**

- `EVT_29_CCH_001` -> displaced writer of `SEED_MANAGER_POWER`; canonical owner `EVT_27_LOCK_001`.
- `EVT_29_FAN_001` -> displaced writer of `SEED_FAN_FRACTURE`; canonical owner `EVT_27_PRS_001`.
- `EVT_29_MED_001` -> displaced writer of `SEED_SURGERY_TIMING`; canonical owner `EVT_27_MED_001`.
- `EVT_29_NAT_001` -> displaced writer of `SEED_NATIONAL_CAPTAINCY`; canonical owner `EVT_27_NAT_001`; **not** `EVT_29_NAT_002`.
- `EVT_29_EUR_001` -> displaced writer of `SEED_ELITE_SACRIFICE`; canonical owner `EVT_27_EUR_001`; **not** `EVT_29_TACT_001`.
- `EVT_29_REC_001` -> displaced writer of `SEED_RECORD_PUBLIC_TONE`; canonical owner `EVT_27_MATCH_001`.
- `EVT_29_HOME_001` -> displaced writer of `SEED_EARLY_HOME_RETURN`; canonical owner `EVT_28_HOME_001`.
- `EVT_29_FORM_001` -> displaced writer of `SEED_FIRST_PEAK_DIP`; canonical owner `EVT_28_FORM_001`.

For all eight:
- retire from active scheduling only after the correct canonical causal owner exists;
- preserve old completed history under the legacy ID;
- do not generate canonical `SEEN_*`;
- do not directly substitute a pending old scene with another choice set;
- do not rewrite historical `seed.originEvent` automatically;
- compatibility-only legacy definitions never schedule.

## Required work

### `EVT_29_TACT_001`
Implement the actual canonical mature reinvention dilemma from the source row:
- age 29 + `ROLE_ADAPTABILITY` gate;
- explicit comparison/tactical intel and uncertainty;
- four canonical role choices;
- create `SEED_MATURE_REINVENTION`;
- consume/connect `SEED_POSITIONAL_REINVENTION`.

Do not treat existing generic tactical effects or later `ROLE_REINVENTED_30` flags as proof the canonical scene occurred.

### `EVT_29_NAT_002`
Implement the canonical selection-load policy decision:
- medium/high `NT_STANDING` plus age/load pressure;
- four explicit availability policies;
- create `SEED_NATIONAL_AVAILABILITY_30`;
- connect `SEED_INTERNATIONAL_LOAD`.

Keep it semantically distinct from:
- old technical `EVT_29_NAT_001` captaincy;
- generic national-standing drift;
- conditional selection callbacks.

### Transition integrity

Re-audit `EVT_29_FIN_001` and its `SEED_AGE30_PRIORITY` / `world.age30Priority` responsibility after the two new scenes are integrated.

The age-30 bridge must consume the result later. No new age-29 scene may overwrite, duplicate or replace that priority.

## Causal obligations

- Tactical reinvention must remain observable in maturity if later canonical scenes rely on it.
- National-team continuation/availability posture must survive save/resume and remain separate from raw `nationalStanding` and national captaincy.
- Preserve the 29→30 hard-deadline ordering.
- The eight displaced technical writers must disappear from the active canonical catalog only when their canonical seed owners are valid.

## Expected runtime area

Primary:
- `src/content/events/26_30/principal-events.ts`

Potentially:
- `src/catalog/seeds.ts`
- transition/adaptation code for 29→30
- save/session migration compatibility
- targeted tests/audit artifacts

Do not implement age-30 scenes here.

## Save/content migration rules

The pre-T5.1 content catalog is already frozen in `main`; preserve the strict identity boundary.

- No thematic aliasing.
- Pending legacy scenes are not rewritten unless exact same-scene identity is proven; none of the eight above qualifies.
- Preserve historical IDs and decisions.
- Existing active seeds survive migration without replay or RNG consumption.
- Do not weaken `contentIdentity`.

## Tests

Add targeted tests for:
- both target IDs and their canonical gates/choices/intel/memories;
- all eight reviewed legacy IDs absent from active scheduling once causal ownership is transferred;
- legacy history/pending compatibility truthfulness;
- tactical reinvention memory after save/resume into 30+;
- national-team availability posture after save/resume;
- exactly one `EVT_29_FIN_001` hard-deadline resolution where eligible;
- `SEED_AGE30_PRIORITY` / `world.age30Priority` surviving the 30 transition;
- deterministic narrative with microfeeds on/off.

Run the common required validation commands plus targeted migration/transition tests.

## Non-goals

- Do not implement Batch 03A age-30 scenes.
- Do not alter retirement FSM.
- Do not start conditional Batch 05C.
- Do not merge.

## Deliverable

Focused age-29 reconciliation plus verified 29→30 continuity, applying the already-reviewed 8/8 legacy dispositions and returning current migration/test evidence for ChatGPT review.
