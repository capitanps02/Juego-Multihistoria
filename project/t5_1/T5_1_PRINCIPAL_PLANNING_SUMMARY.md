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

## Complete 87-ID canonical-side assignment

Every baseline missing canonical principal ID is assigned to exactly one planned/active batch:

| Batch | Status | Scope | IDs |
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

Active PR coverage: **18**  
Future DRAFT coverage: **69**  
Total: **87**

The complementary 87 runtime-only principal IDs are also assigned to the batch responsible for deciding their semantic disposition. Assignment is not proof of same-scene identity.

## Prepared implementation contracts

Common principal rules:
- `T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md`

DRAFT task prompts:
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

Conditional DRAFT prompts are separately prepared for 05A–05E.

## Exact-title candidate review state — 7/7 complete

Baseline exact-title candidates: **7**.  
Reviewed: **7/7**.  
Approved same-scene ID migrations: **0/7**.

All seven runtime IDs have final planning disposition `retire_technical_keep_history_only`.

This means:
- implement the canonical scene under the canonical ID;
- remove the technical predecessor from active canonical scheduling after replacement;
- keep old completed history under the technical ID;
- never translate `SEEN_old` into `SEEN_canonical` from title/concept similarity;
- pending old content resolves through supported content-version compatibility only;
- seed catalog origin metadata may move to the canonical creator for future content without relabeling the player's old historical origin unless a separate reviewed migration explicitly proves that fact.

Evidence:
- `T5_1_PRINCIPAL_TITLE_CANDIDATES_30_PLUS_REVIEW.md`
- `T5_1_PRINCIPAL_TITLE_CANDIDATES_30_PLUS_DISPOSITIONS.json`
- `T5_1_PRINCIPAL_TITLE_CANDIDATES_PR5_FINAL_DISPOSITIONS.json`

## Active-PR legacy dispositions

### PR #3 — 6/6 complete

`T5_1_PR3_PRINCIPAL_LEGACY_DISPOSITIONS.json`

All six runtime-only IDs are `retire_technical_keep_history_only`.

Important finding: `EVT_22_END_001` is not the functional 22→23 transition gate. `world-simulator.ts` derives phase from age. Its scheduler `budgetExempt` role is legacy narrative-priority plumbing; canonical `EVT_23_BRIDGE_001` is a different scene and should own any required start-of-phase narrative priority.

### PR #7 — 4/4 complete

`T5_1_PR7_PRINCIPAL_LEGACY_DISPOSITIONS.json`

All four runtime-only age-26 IDs are `retire_technical_keep_history_only`:
- `EVT_26_IDN_001`
- `EVT_26_CLB_001`
- `EVT_26_PRS_001`
- `EVT_26_JAN_001`

Additional chronology finding:
- baseline `SEED_PROJECT_FACE` points to technical `EVT_26_CLB_001`;
- canonical traceability for existing `EVT_26_MKT_001` explicitly creates `SEED_PROJECT_FACE`;
- PR #7 future seed catalog responsibility therefore includes this eleventh origin repair.

PR #7 task scope has been tightened so it may remove false seed-writer responsibility from age-27/28 events but cannot retire IDs assigned to 02C/02D.

### PR #5 — 3/3 exact-title legacy candidates complete at planning level

`T5_1_PRINCIPAL_TITLE_CANDIDATES_PR5_FINAL_DISPOSITIONS.json`

All three = `retire_technical_keep_history_only`; PR #5 remains blocked by PR #7 before implementation because seed chronology must settle first.

## Current legacy-side disposition progress

Runtime-only principal IDs: **87**.

- final planning disposition reviewed: **17**;
- reviewed `retire_technical_keep_history_only`: **17**;
- approved direct same-scene migrations: **0**;
- remaining principal legacy IDs requiring semantic disposition: **70**.

See global crosswalk state:
- `T5_1_LEGACY_CROSSWALK_PLANNING_STATE_174.json`.

## Causal chain ownership

The batch sequence deliberately protects long-range state:

- PR #7 / 02C / 03B: record chain 26 → 27 → 33
- 02C / 02D / 03B: successor chain 27 → 28 → 31/32
- 02C / 03B / 04B: agent/parallel negotiation → Bosman → age-35 January
- PR #7 / 02D: documentary origin → age-28 consequence
- 03A / 04A: dorsal/status → age-34 legacy/dorsal scene
- 03B / 04A: travel/load → age-34 load/travel scenes
- 02E / 03A: age-29 priority → age-30 bridge
- 03B / 04A: age-33 priority → age-34 bridge
- 04A–04C: career remains playable until explicit canonical retirement decisions handled in 04D

## Retirement boundary

Principal batches through 04C must not use age, low market, body pressure, peer retirement, farewell marketing, home return, lower leagues, short contracts or rich offers as implicit retirement decisions.

04D owns terminal state-machine reconciliation. Current known blocker:
- canonical conditional `CEVT_38_RETIREMENT_REVERSAL` vs monotonic retirement contract / `closed -> *` prohibition.

`T5_1_CANON_DECISION_REQUIRED_RETIREMENT_REVERSAL.md` documents Option E as the current strongest source-fit planning recommendation while explicitly leaving it **unapproved** pending Pedro's decision.

## Current status

Planning completeness does **not** mean runtime completeness.

- Canonical principal missing-ID assignment: **87/87 complete**
- Runtime-only principal responsibility assignment: **87/87 complete**
- Exact-title principal semantic dispositions: **7/7 complete**
- Runtime-only principal final dispositions overall: **17/87 complete**
- Future principal task prompts: **02C–04E prepared**
- Conditional semantic planning review: **134/134 complete**
- Conditional task prompts: **05A–05E prepared**
- Runtime T5.1 completion: **NOT_READY**

The next executable item remains the first `READY` entry in `project/CODEX_QUEUE.md`; nothing here authorizes automatic Codex execution or merge.
