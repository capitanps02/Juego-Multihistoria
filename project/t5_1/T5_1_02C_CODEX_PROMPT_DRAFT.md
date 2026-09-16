# DRAFT Codex task — T5.1 Batch 02C · canonical age 27

**Status: DRAFT — do not execute yet.**

## Dependencies

Execute only after:
1. PR #7 (age 26 + seed chronology) is reviewed/integrated;
2. PR #5 (age-27/28 exact-title repairs) is rebased on that result, reviewed/integrated;
3. the T5.1 audit baseline is refreshed on the resulting base.

Read and obey:
- `AGENTS.md`
- `project/CHATGPT_CODEX_WORKFLOW.md`
- `project/t5_1/T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md`
- `project/t5_1/T5_1_PRINCIPAL_87_BATCH_MANIFEST.json`
- `project/t5_1/T5_1_COMPLETION_GATE.md`
- canonical rows in `analysis/2026-09-11/t1/principal-traceability.json`

## Goal

Reconcile the seven remaining baseline-unresolved canonical principal scenes at age 27 after PR #5 has already handled `EVT_27_STAR_001` and `EVT_27_AWARD_001`.

Target canonical IDs:

1. `EVT_27_CON_001` — La cláusula que sí puede pagarse
2. `EVT_27_IMG_001` — Tu nombre sin tu club
3. `EVT_27_HOME_001` — ¿Comprar una parte de casa?
4. `EVT_27_EUR_001` — La semifinal que exige desaparecer
5. `EVT_27_MATCH_001` — El récord no se celebra
6. `EVT_27_TEAM_001` — Tu protegido juega por ti
7. `EVT_27_AGT_002` — Tu agente negocia dos futuros

## Required work

For each target:
- read the complete canonical `sourceFields` row;
- identify whether any current age-27 runtime event is the same scene, a related scene, or unrelated;
- implement the canonical ID exactly once;
- preserve canonical trigger/window, information asymmetry, player decision and resolution semantics;
- implement canonical seed/NPC responsibilities;
- give any technical predecessor an explicit migration/disposition decision.

Re-audit the surrounding age-27 runtime set after PR #5 integration so there are no duplicate semantics or displaced seed origins.

## Causal obligations

Pay special attention to chains already established/repaired by age 26:
- record choice / record tone → age 33 record/body conflict;
- young successor / protected player → age 28 and age 31/32 succession pressure;
- documentary access → age 28 documentary callback;
- big-game/final memories must not be overwritten by these scenes;
- agent/parallel negotiation state must remain distinguishable from ordinary market heat.

`EVT_27_AGT_002` must not be reduced to a generic agency/market choice if the canonical source defines simultaneous futures or information asymmetry.

## Expected runtime area

Primary:
- `src/content/events/26_30/principal-events.ts`

Potentially, only when canonical responsibility requires it:
- `src/catalog/seeds.ts`
- simulation adapters/classifiers involved in age-27 gates
- save/migration compatibility code
- targeted T5.1 tests/audit artifacts

Do not touch age-28/29 content beyond minimal shared causal infrastructure required by these age-27 scenes.

## Migration rules

- Do not map pending technical scenes directly to a target unless same-scene identity is proven field-by-field.
- Preserve old history IDs when identity is not proven.
- Do not synthesize canonical `SEEN_*` facts from related age-27 technical scenes.
- If a renamed/replaced seed has compatible meaning, prove that compatibility in tests rather than assuming it.

## Tests

In addition to the common required commands, add targeted coverage for:
- all 7 target IDs schedulable under canonical conditions;
- mutually distinct choice sets/intent;
- save/resume before and after each newly created long-range seed;
- record chain 27→33;
- successor/protected-player chain into 28/31/32;
- agent parallel-futures chain toward Bosman/late-career negotiation where applicable;
- no duplicate canonical age-27 IDs after PR #5 integration.

## Non-goals

- Do not implement age-28 or age-29 missing canonical scenes.
- Do not start conditional Batch 05C.
- Do not merge.

## Deliverable

A focused branch/PR containing age-27 reconciliation plus current test evidence. Return the exact IDs implemented, technical predecessors disposed, seed chronology changes, migration strategy and test results for ChatGPT review.
