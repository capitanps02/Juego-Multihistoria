# DRAFT Codex task — T5.1 Batch 03A · canonical age 30

**Status: DRAFT — do not execute yet.**

## Dependencies

Execute only after Batch 02E is reviewed/integrated and the age-29 → age-30 transition has been re-audited.

Read and obey:
- `AGENTS.md`
- `project/CHATGPT_CODEX_WORKFLOW.md`
- `project/t5_1/T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md`
- `project/t5_1/T5_1_PRINCIPAL_87_BATCH_MANIFEST.json`
- canonical rows in `analysis/2026-09-11/t1/principal-traceability.json`

## Goal

Reconcile the ten baseline-unresolved canonical principal scenes at age 30:

1. `EVT_30_BRIDGE_001` — La palabra veterano
2. `EVT_30_STATUS_001` — El dorsal
3. `EVT_30_EUR_001` — Semifinal, minuto cero
4. `EVT_30_CCH_001` — Te enteras por la pizarra
5. `EVT_30_RECORD_001` — Partido 500
6. `EVT_30_PAIN_001` — Duele, pero la imagen está limpia
7. `EVT_30_NANO_001` — Nano necesita una llamada
8. `EVT_30_PRS_001` — El ultimátum que nunca diste
9. `EVT_30_NAT_002` — La selección gana sin ti
10. `EVT_30_JAN_001` — Enero: especialista de lujo

## Special identity warning

Baseline runtime contains `EVT_30_IDN_001` with the same title as canonical `EVT_30_BRIDGE_001`.

Do **not** rename it solely from title equality. Compare the full canonical row against the runtime scene: trigger, visible/uncertain information, choices, resolution, seed responsibility and transition role. Only use a same-scene migration if all relevant semantics are proven compatible.

## Required work

For every target:
- read complete canonical `sourceFields`;
- implement the canonical scene, not a generic maturity template;
- preserve exact age/time/gate responsibility;
- implement visible vs uncertain information;
- preserve distinct choice intent and ambiguous outcomes;
- reconcile seeds and NPC references;
- disposition any technical predecessor explicitly.

### Bridge responsibility

`EVT_30_BRIDGE_001` must consume the actual age-29 priority/history where the canonical source requires it. It must not generate a fresh substitute for `SEED_AGE30_PRIORITY`/`world.age30Priority`.

### Long-range causal anchors

This batch establishes memories used later:
- dorsal/status → age-34 final dorsal/legacy context;
- big-game/European role → later veteran rotation/late-career role;
- record milestone → age-33 record/body tension;
- pain/body context → late-career recovery/body decisions;
- Nano relationship callback must preserve prior relationship history, not generic affinity only;
- national-team absence must remain distinguishable from voluntary NT withdrawal.

## Retirement boundary

Age 30 may create retirement distance/context, but this batch must not decide, announce or close retirement unless the canonical principal row explicitly owns a non-terminal context flag. Final FSM responsibility belongs to 04D.

Do not retain or introduce automatic early closure from an age-30 narrative decision.

## Expected runtime area

Primary:
- `src/content/events/30_34/principal-events.ts`

Potentially:
- 29→30 adapter/classifier
- `src/catalog/seeds.ts`
- relationship/NPC memory support
- save/migration compatibility
- targeted T5.1 tests/audit artifacts

## Migration rules

- `EVT_30_IDN_001` history/pending data is not automatically `EVT_30_BRIDGE_001`.
- Preserve historical technical IDs when same-scene proof fails.
- Pending scene choice sets cannot be silently replaced.
- Do not manufacture later canonical memories from approximate predecessor events.

## Tests

Add targeted tests for:
- all ten target IDs;
- 29 priority → canonical 30 bridge across save/resume;
- dorsal/status memory → age 34 consumer fixture;
- record 30 → record/body age 33 fixture;
- body/pain continuity into maturity;
- national-team absence semantics;
- no retirement status transition caused by non-terminal age-30 contexts;
- deterministic strong narrative with microfeeds on/off.

Run the common required commands.

## Non-goals

- Do not implement ages 31–33 missing scenes.
- Do not rewrite retirement FSM or epilogue.
- Do not implement 30–34 conditionals (05D).
- Do not merge.

## Deliverable

Focused age-30 canonical reconciliation with explicit alias/migration decisions, causal tests and current validation evidence for ChatGPT review.
