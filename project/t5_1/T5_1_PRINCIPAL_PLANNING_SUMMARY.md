# T5.1 — Principal reconciliation planning summary

Generated: 2026-09-16

## Baseline

Canonical principal scenes: **254**  
Literal principal IDs in P1 baseline: **167**  
Baseline unresolved principal IDs: **87**

Source evidence:
- `analysis/2026-09-11/t1/principal-traceability.json`
- `analysis/2026-09-15/T5.1-reconciliation.json`

Machine-readable assignment:
- `project/t5_1/T5_1_PRINCIPAL_87_BATCH_MANIFEST.json`

## Complete 87-ID assignment

Every baseline unresolved principal ID is assigned to exactly one planned/active batch:

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

## Important identity candidates

Title equality remains non-authoritative. Baseline title candidates that require semantic proof include:
- `EVT_27_STAR_001` ← runtime `EVT_28_TEAM_001` (PR #5)
- `EVT_27_AWARD_001` ← runtime `EVT_28_GALA_001` (PR #5)
- `EVT_28_RICH_001` ← runtime `EVT_29_MKT_001` (PR #5)
- `EVT_30_BRIDGE_001` ← runtime `EVT_30_IDN_001` (03A)
- `EVT_38_RICH_001` ← runtime `EVT_36_RICH_001` (04C)
- `EVT_RET_FAM_001` ← runtime `EVT_RET_HOME_001` (04D)
- `EVT_RET_LASTMATCH_001` ← runtime `EVT_RET_LAST_001` (04D)

None may be migrated from title equality alone.

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

See `T5_1_CANON_DECISION_REQUIRED_RETIREMENT_REVERSAL.md`.

## Current status

Planning completeness does **not** mean runtime completeness.

- Principal unresolved assignment: **87/87 complete**
- Future principal task prompts: **02C–04E prepared**
- Conditional semantic planning review: **134/134 complete**
- Conditional task prompts: **05A–05E prepared**
- Runtime T5.1 completion: **NOT_READY**

The next executable item remains the first `READY` entry in `project/CODEX_QUEUE.md`; nothing here authorizes automatic Codex execution or merge.
