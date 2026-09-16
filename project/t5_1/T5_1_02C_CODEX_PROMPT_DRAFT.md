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
- `project/t5_1/T5_1_PRINCIPAL_LEGACY_EXTRA_87_INVENTORY.json`
- `project/t5_1/T5_1_02C_PRINCIPAL_LEGACY_REVIEW.md`
- `project/t5_1/T5_1_02C_PRINCIPAL_LEGACY_DISPOSITIONS.json`
- `project/t5_1/T5_1_COMPLETION_GATE.md`
- canonical rows in `analysis/2026-09-11/t1/principal-traceability.json`

## Goal

Reconcile the seven remaining baseline-unresolved canonical principal scenes at age 27 after PR #5 has handled `EVT_27_STAR_001` and `EVT_27_AWARD_001`.

Target canonical IDs:

1. `EVT_27_CON_001` — La cláusula que sí puede pagarse
2. `EVT_27_IMG_001` — Tu nombre sin tu club
3. `EVT_27_HOME_001` — ¿Comprar una parte de casa?
4. `EVT_27_EUR_001` — La semifinal que exige desaparecer
5. `EVT_27_MATCH_001` — El récord no se celebra
6. `EVT_27_TEAM_001` — Tu protegido juega por ti
7. `EVT_27_AGT_002` — Tu agente negocia dos futuros

## Reviewed legacy dispositions — binding for 02C

The four runtime-only principal IDs assigned to this batch have already been reviewed field-by-field against canonical chronology. All four are:

`retire_technical_keep_history_only`

- `EVT_27_REC_001` — El récord empieza a estar cerca
- `EVT_27_RIV_001` — Otra vez comparados
- `EVT_27_MENT_001` — ¿Qué le dirías al de 19?
- `EVT_27_FINAL_001` — La final empieza en el banquillo

For all four:
- same-scene migration is not approved;
- do not rewrite old history IDs;
- do not directly rewrite pending IDs;
- do not manufacture canonical `SEEN_*`;
- remove from active principal scheduling only after repaired age-26 seed chronology and required canonical age-27 replacements are present;
- compatibility-only definitions must remain outside active `EVENTS`/`EventIndex`.

### `EVT_27_REC_001`
Technical precursor only. `SEED_RECORD_CHASE` canonically originates in age-26 `EVT_26_MATCH_001`; age-27 `EVT_27_MATCH_001` is the distinct public-tone consequence after a record in a negative team result and writes `SEED_RECORD_PUBLIC_TONE`.

### `EVT_27_RIV_001`
Technical Adrián/public-rivalry callback. PR #7 moves `SEED_PUBLIC_RIVALRY` origin to age-26 `EVT_26_RIV_001`. None of the seven 02C canonical targets is the same scene.

### `EVT_27_MENT_001`
Technical advice-to-youngster precursor. PR #7 moves `SEED_MENTOR_ADVICE` origin to age-26 `EVT_26_TEAM_002`; age-27 canonical `EVT_27_TEAM_001` is the separate consequence where the protected youngster performs well in the protagonist's absence.

### `EVT_27_FINAL_001`
Despite runtime `verified:true`, this generic final-bench scene is not canonical. PR #7 moves `SEED_BIG_GAME_BENCH` origin to `EVT_26_EUR_001` and canonical final consequence to `EVT_26_FINAL_001`. Age-27 canonical `EVT_27_EUR_001` is instead the semifinal tactical-sacrifice scene creating `SEED_ELITE_SACRIFICE`.

Do not reopen these dispositions from title/theme/seed similarity unless new source evidence genuinely contradicts the reviewed canonical traceability.

## Required work

For each target:
- read the complete canonical `sourceFields` row;
- implement the canonical ID exactly once;
- preserve canonical trigger/window, information asymmetry, player decision and resolution semantics;
- implement canonical seed/NPC responsibilities;
- keep the seven canonical scenes distinct from PR #5's `EVT_27_STAR_001` and `EVT_27_AWARD_001`.

Re-audit the surrounding age-27 runtime set after PR #7 and PR #5 integration so there are no duplicate semantics or displaced seed origins.

## Causal obligations

Pay special attention to chains already established/repaired by age 26:
- `SEED_RECORD_CHASE` from 26 → `EVT_27_MATCH_001` → `SEED_RECORD_PUBLIC_TONE` → age-33 record/body conflict;
- `SEED_YOUNG_SUCCESSOR` / mentor context → `EVT_27_TEAM_001` → `SEED_SUCCESSOR_PEAK` → age 28 and age 31/32 succession pressure;
- documentary access from 26 must remain available for age-28 callback and must not be overwritten here;
- big-game/final memories from age 26 must remain distinct from age-27 tactical sacrifice;
- `EVT_27_AGT_002` creates `SEED_PARALLEL_NEGOTIATION` and reads/relates to `SEED_AGENT_CONFLICT_PEAK`; do not reduce it to generic market heat.

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

- Completed legacy history for the four reviewed IDs stays under the legacy ID.
- Pending legacy definitions are not substituted with canonical 26/27 scenes; use supported content compatibility or fail explicitly.
- Do not synthesize canonical `SEEN_*` facts.
- PR #7 future seed-catalog origin moves do not authorize rewriting historical `seed.originEvent`.
- If a seed state remains semantically valid, preserve it without replay or RNG consumption.

## Tests

In addition to the common required commands, add targeted coverage for:
- all 7 target IDs schedulable under canonical conditions;
- mutually distinct choice sets/intent;
- all four 02C legacy IDs absent from active principal scheduling after replacement;
- legacy completed/pending decisions remain historical truth;
- save/resume before and after each newly created long-range seed;
- record chain 26→27→33;
- successor/protected-player chain into 28/31/32;
- agent parallel-futures chain toward Bosman/late-career negotiation where applicable;
- no duplicate canonical age-27 IDs after PR #5 integration;
- no reintroduction of seed writers corrected by PR #7;
- deterministic strong narrative with microfeeds on/off.

## Non-goals

- Do not implement age-28 or age-29 missing canonical scenes.
- Do not start conditional Batch 05C.
- Do not merge.

## Deliverable

A focused branch/PR containing age-27 reconciliation plus current test evidence. Return exact IDs implemented, confirmation that all four reviewed legacy IDs followed `retire_technical_keep_history_only`, seed chronology changes, migration strategy and test results for ChatGPT review.
