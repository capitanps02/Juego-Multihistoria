# T5.1 — Principal reconciliation planning summary

Generated: 2026-09-16

## Baseline

Canonical principal scenes: **254**  
Literal principal IDs in P1 baseline: **167**  
Baseline missing canonical principal IDs: **87**  
Baseline runtime-only principal IDs: **87**

Source evidence:
- `analysis/2026-09-11/t1/principal-traceability.json`
- `analysis/2026-09-15/T5.1-reconciliation.json`

Machine-readable assignment:
- `project/t5_1/T5_1_PRINCIPAL_87_BATCH_MANIFEST.json`
- `project/t5_1/T5_1_PRINCIPAL_LEGACY_EXTRA_87_INVENTORY.json`

## Complete canonical-side assignment

| Batch | Status | Scope | Missing canonical IDs |
|---|---|---:|---:|
| PR #3 | READY | ages 20–23 | 6 |
| PR #7 | READY | age 26 | 9 |
| PR #5 | BLOCKED-BY-#7 | age 27/28 exact-title candidates | 3 |
| 02C | DRAFT | remaining age 27 | 7 |
| 02D | DRAFT | remaining age 28 | 5 |
| 02E | DRAFT | remaining age 29 | 2 |
| 03A | DRAFT | age 30 | 10 |
| 03B | DRAFT | ages 31–33 | 12 |
| 04A | DRAFT | age 34 | 11 |
| 04B | DRAFT | age 35 | 10 |
| 04C | DRAFT | ages 36–38 | 10 |
| 04D | DRAFT | retirement principal IDs | 2 |
| **Total** |  |  | **87** |

Every missing canonical principal ID and every runtime-only principal ID is assigned to exactly one responsible batch. Assignment is not semantic identity proof.

## Exact-title candidates — 7/7 reviewed

Approved same-scene migrations: **0/7**.

All seven legacy IDs have final planning disposition `retire_technical_keep_history_only`.

Evidence:
- `T5_1_PRINCIPAL_TITLE_CANDIDATES_30_PLUS_REVIEW.md`
- `T5_1_PRINCIPAL_TITLE_CANDIDATES_30_PLUS_DISPOSITIONS.json`
- `T5_1_PRINCIPAL_TITLE_CANDIDATES_PR5_FINAL_DISPOSITIONS.json`

Title/concept/seed lineage may guide implementation but never authorizes rewriting completed history, pending content or canonical `SEEN_*`.

## Reviewed runtime-only principal dispositions

### PR #3 — 6/6

Evidence: `T5_1_PR3_PRINCIPAL_LEGACY_DISPOSITIONS.json`.

All six = `retire_technical_keep_history_only`.

Important finding: `EVT_22_END_001` does not drive the technical 22→23 phase transition; phase is age-derived. Its legacy scheduler priority must not be mistaken for canonical identity with `EVT_23_BRIDGE_001`.

### PR #7 — 4/4

Evidence: `T5_1_PR7_PRINCIPAL_LEGACY_DISPOSITIONS.json`.

All four age-26 extras = `retire_technical_keep_history_only`.

PR #7 also owns the causal correction that future `SEED_PROJECT_FACE` originates from canonical `EVT_26_MKT_001`, not technical `EVT_26_CLB_001`. PR #7 may remove false seed-writer responsibility from later rows, but it must not retire IDs owned by 02C/02D.

### PR #5 — 3/3 title candidates

Evidence: `T5_1_PRINCIPAL_TITLE_CANDIDATES_PR5_FINAL_DISPOSITIONS.json`.

All three = `retire_technical_keep_history_only`; implementation remains blocked by PR #7 seed chronology.

### Batch 02C — 4/4

Evidence:
- `T5_1_02C_PRINCIPAL_LEGACY_REVIEW.md`
- `T5_1_02C_PRINCIPAL_LEGACY_DISPOSITIONS.json`

All four = `retire_technical_keep_history_only`; 0 aliases.

The old age-27 rows are technical precursors/displaced causal writers, not the seven missing canonical age-27 scenes.

### Batch 02D — 7/7

Evidence:
- `T5_1_02D_PRINCIPAL_LEGACY_REVIEW.md`
- `T5_1_02D_PRINCIPAL_LEGACY_DISPOSITIONS.json`

All seven = `retire_technical_keep_history_only`; 0 aliases.

Key displaced writers:
- `EVT_28_PRS_001` -> canonical age-27 `SEED_PUBLIC_EXIT_PRESSURE` owner;
- `EVT_28_MONEY_001` -> age-27 `SEED_WEALTH_STRUCTURE` owner;
- `EVT_28_IMG_001` -> age-27 `SEED_PERSONAL_BRAND_INDEPENDENCE` owner;
- `EVT_28_TACT_001` -> age-27 `SEED_POSITIONAL_REINVENTION` owner;
- `EVT_28_FINAL_001` -> age-26 `SEED_FINAL_BENCH` chain restored by PR #7.

### Batch 02E — 8/8

Evidence:
- `T5_1_02E_PRINCIPAL_LEGACY_REVIEW.md`
- `T5_1_02E_PRINCIPAL_LEGACY_DISPOSITIONS.json`

All eight = `retire_technical_keep_history_only`; 0 aliases.

They are displaced writers for canonical memories created at ages 27/28. None is one of the two missing canonical age-29 scenes (`EVT_29_TACT_001`, `EVT_29_NAT_002`). `EVT_29_FIN_001` remains sole owner of `SEED_AGE30_PRIORITY` / `world.age30Priority` hard-deadline responsibility.

## Current legacy-side disposition progress

Runtime-only principal IDs: **87**.

- final planning disposition reviewed: **36/87**;
- reviewed `retire_technical_keep_history_only`: **36**;
- approved direct same-scene migrations: **0**;
- remaining principal legacy IDs requiring semantic disposition: **51**.

Global crosswalk:
- `T5_1_LEGACY_CROSSWALK_PLANNING_STATE_174.json`;
- total legacy final dispositions: **122/174** when the 86 resolved conditional legacy rows are included;
- remaining global blockers: **52** = 51 principal + `CEVT_RET_RECONSIDER`.

## Causal chain ownership

The ordered batches deliberately protect long-range memory:

- PR #7 / 02C / 03B: record chain 26 → 27 → 33;
- 02C / 02D / 03B: successor chain 27 → 28 → 31/32;
- 02C / 03B / 04B: agent parallel negotiation → Bosman → age-35 January;
- PR #7 / 02D: documentary origin → age-28 fallout;
- 02D / 03B: load and succession decisions into maturity;
- 02E / 03A: age-29 priority → age-30 bridge;
- 03A / 04A: dorsal/status → age-34 legacy/dorsal context;
- 03B / 04A: travel/load → age-34 maturity context;
- 03B / 04A: age-33 priority → age-34 bridge;
- 04A–04C: career remains playable until explicit canonical retirement responsibility in 04D.

## Save/content boundary

The pre-T5.1 active catalog is now frozen in `main`, so future content migration has an exact legacy identity. The freeze does not authorize aliasing.

For reviewed retire-history-only rows:
- completed history keeps the legacy ID;
- pending legacy choice contracts are preserved through supported compatibility or resume fails explicitly;
- canonical `SEEN_*` is never synthesized;
- future seed catalog ownership can move to the canonical creator without silently rewriting historical `seed.originEvent`;
- compatibility-only definitions do not schedule.

## Retirement boundary

Principal batches through 04C must not use age, low market, body pressure, peer retirement, farewell marketing, home return, lower leagues, short contracts or rich offers as implicit retirement decisions.

04D owns terminal FSM reconciliation. The unresolved canonical conflict remains `CEVT_38_RETIREMENT_REVERSAL`; Option E in `T5_1_CANON_DECISION_REQUIRED_RETIREMENT_REVERSAL.md` is a planning recommendation, not approved canon.

## Current status

- Canonical missing principal assignment: **87/87 complete**
- Runtime-only principal ownership assignment: **87/87 complete**
- Runtime-only principal final dispositions: **36/87 complete**
- Exact-title candidates: **7/7 complete, 0 aliases**
- Conditional semantic planning review: **134/134 complete**
- Runtime T5.1 completion: **NOT_READY**

Queue authority remains `project/CODEX_QUEUE.md`. Nothing in this planning summary authorizes Codex execution or merge.
