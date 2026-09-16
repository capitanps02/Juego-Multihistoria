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

All seven runtime IDs have final planning disposition:
`retire_technical_keep_history_only`.

This means:
- implement the canonical scene under the canonical ID;
- remove the technical predecessor from active canonical scheduling after replacement;
- keep old completed history under the technical ID;
- never translate `SEEN_old` into `SEEN_canonical` from title/concept similarity;
- pending old content resolves through supported content-version compatibility only;
- seed catalog origin metadata may move to the canonical creator for future content without relabeling the player's old historical origin unless a separate reviewed migration explicitly proves that fact.

### 30+/retirement candidates

Evidence:
- `T5_1_PRINCIPAL_TITLE_CANDIDATES_30_PLUS_REVIEW.md`
- `T5_1_PRINCIPAL_TITLE_CANDIDATES_30_PLUS_DISPOSITIONS.json`

Pairs:
- `EVT_30_BRIDGE_001` vs legacy `EVT_30_IDN_001` — strong title/seed lineage, but generic runtime scene/choices differ from the canonical age-30 bridge;
- `EVT_38_RICH_001` vs legacy `EVT_36_RICH_001` — title only; age, trigger, information and huge-offer/retirement choices differ;
- `EVT_RET_FAM_001` vs legacy `EVT_RET_HOME_001` — runtime converts a four-way family/priorities conversation into a binary retirement decision;
- `EVT_RET_LASTMATCH_001` vs legacy `EVT_RET_LAST_001` — runtime directly manufactures played/no-match closure from a binary choice instead of preserving canonical fact-driven uncertainty.

### PR #5 / 26–30 candidates

Evidence:
- `T5_1_PRINCIPAL_TITLE_CANDIDATES_PR5_FINAL_DISPOSITIONS.json`
- PR #5 task evidence under `task/t5.1-batch-02a`.

Pairs:
- `EVT_27_STAR_001` vs legacy `EVT_28_TEAM_001` — same title/`SEED_SECOND_STAR`, but technical scene is age 28 and uses generic team-family decisions instead of the canonical age-27 second-star hierarchy dilemma;
- `EVT_27_AWARD_001` vs legacy `EVT_28_GALA_001` — same title/award seed, but technical scene is age 28 and generic despite `verified:true`; canon is the age-27 award-interview/vote scene;
- `EVT_28_RICH_001` vs legacy `EVT_29_MKT_001` — close precursor, but age, gate, visible uncertainty and C/D decision intents differ from canon.

PR #5 still remains blocked by PR #7 because future seed origin metadata/chronology must be reconciled against the reviewed age-26 seed repair before implementation.

## Current legacy-side disposition progress

Runtime-only principal IDs: **87**.

- final planning disposition reviewed: **7**;
- all 7 reviewed: `retire_technical_keep_history_only`;
- approved direct same-scene migrations: **0**;
- remaining principal legacy IDs requiring semantic disposition in their responsible batch: **80**.

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
- Runtime-only principal final dispositions overall: **7/87 complete**
- Future principal task prompts: **02C–04E prepared**
- Conditional semantic planning review: **134/134 complete**
- Conditional task prompts: **05A–05E prepared**
- Runtime T5.1 completion: **NOT_READY**

The next executable item remains the first `READY` entry in `project/CODEX_QUEUE.md`; nothing here authorizes automatic Codex execution or merge.
