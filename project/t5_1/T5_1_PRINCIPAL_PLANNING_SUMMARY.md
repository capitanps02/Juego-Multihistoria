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

## Canonical-side assignment — 87/87 complete

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

## Runtime-only principal semantic dispositions — 87/87 complete

All **87/87** baseline runtime-only principal IDs now have a final reviewed planning disposition.

Result:
- `retire_technical_keep_history_only`: **87**;
- `same_scene_rewrite_and_id_migration`: **0**;
- approved aliases: **0**;
- unresolved principal legacy IDs: **0**.

This is a planning/migration decision, not runtime completion. It means every canonical replacement must be implemented under its canonical ID and old technical history must remain historical truth.

### Reviewed evidence by batch

- PR #3: `T5_1_PR3_PRINCIPAL_LEGACY_DISPOSITIONS.json` — 6/6.
- PR #7: `T5_1_PR7_PRINCIPAL_LEGACY_DISPOSITIONS.json` — 4/4.
- PR #5 exact-title candidates: `T5_1_PRINCIPAL_TITLE_CANDIDATES_PR5_FINAL_DISPOSITIONS.json` — 3/3.
- 02C: `T5_1_02C_PRINCIPAL_LEGACY_DISPOSITIONS.json` — 4/4.
- 02D: `T5_1_02D_PRINCIPAL_LEGACY_DISPOSITIONS.json` — 7/7.
- 02E: `T5_1_02E_PRINCIPAL_LEGACY_DISPOSITIONS.json` — 8/8.
- 03A: `T5_1_03A_PRINCIPAL_LEGACY_DISPOSITIONS.json` — 5/5.
- 03B: `T5_1_03B_PRINCIPAL_LEGACY_DISPOSITIONS.json` — 17/17.
- 04A: `T5_1_04A_PRINCIPAL_LEGACY_DISPOSITIONS.json` — 11/11.
- 04B: `T5_1_04B_PRINCIPAL_LEGACY_DISPOSITIONS.json` — 10/10.
- 04C: `T5_1_04C_PRINCIPAL_LEGACY_DISPOSITIONS.json` — 10/10 reviewed; `EVT_36_RICH_001` reaffirms an earlier exact-title review, therefore 9 new unique dispositions.
- 04D: `EVT_RET_HOME_001` and `EVT_RET_LAST_001` were already resolved in `T5_1_PRINCIPAL_TITLE_CANDIDATES_30_PLUS_DISPOSITIONS.json`.

### Exact-title candidates — 7/7

Approved same-scene migrations: **0/7**.

The seven title candidates are authoring-lineage evidence only. Shared title, age proximity or seed concept never authorizes rewriting history/pending content.

Important reviewed examples:
- `EVT_30_IDN_001` is not canonical `EVT_30_BRIDGE_001` despite shared title “La palabra veterano”.
- `EVT_36_RICH_001` is not canonical `EVT_38_RICH_001` despite shared title “Una última oferta enorme”.
- `EVT_RET_HOME_001` is not canonical `EVT_RET_FAM_001`: legacy binary KEEP/DECIDE directly entered retirement; canon has four family/priorities intents and does not dictate the ending.
- `EVT_RET_LAST_001` is not canonical `EVT_RET_LASTMATCH_001`: legacy PLAY/NO_MATCH fabricated played/closure facts; canon keeps the football outcome uncertain.

## 30–38 structural finding

The 30–34 and 34+ baseline blocks contain generic row factories that reuse broad bodies/intel/choices across many IDs. Matching family, title fragment or seed responsibility is therefore not evidence of scene identity.

The late-career review also rejects `EVT_38_MKT_001 -> EVT_38_MARKET_001` as a same-scene alias:
- baseline engine: “El teléfono todavía suena”, generic market A/B/C/D;
- canon: “Nadie llama en julio”, free agent 37+ + low market floor, real silence, five concrete choices, `SEED_MARKET_SILENCE_END`.

Future canonical scheduling must use `EVT_38_MARKET_001`; old `EVT_38_MKT_001` history remains old history.

## Unique-count correction

Earlier planning totals double-counted `EVT_30_IDN_001` because it appeared in both the 03A review and the independent 30+ exact-title candidate review.

Current counts are deduplicated by legacy ID. No semantic decision changed; only the progress arithmetic was corrected.

## Global legacy crosswalk status

Baseline legacy extras: **174** = 87 principal + 87 conditional.

Current unique final dispositions:
- principal: **87/87** final;
- conditional: **86/87** final;
- total: **173/174** final;
- approved direct same-scene migrations: **0**;
- sole remaining blocker: `CEVT_RET_RECONSIDER` / canonical retirement-reversal state-model conflict.

Authority:
- `T5_1_LEGACY_CROSSWALK_PLANNING_STATE_174.json`.

## Causal chain ownership

Ordered batches deliberately protect long-range memory:

- PR #7 / 02C / 03B: record chain 26 → 27 → 33;
- 02C / 02D / 03B: successor chain 27 → 28 → 31/32;
- 02C / 03B / 04B: parallel negotiation → Bosman → age-35 January;
- PR #7 / 02D: documentary origin → age-28 fallout;
- 02E / 03A: age-29 priority → age-30 bridge;
- 03A / 04A: dorsal/status → age-34 final-dorsal context;
- 03B / 04A: travel/load → age-34 load/travel callbacks;
- 03B / 04A: age-33 priority → age-34 bridge;
- 04A–04C: late career remains playable until explicit terminal decisions in 04D/05E.

## Save/content boundary

The pre-T5.1 active catalog is frozen in `main`, so legacy compatibility has an exact content identity.

For every reviewed retire-history-only principal row:
- completed history keeps the legacy ID;
- pending legacy choice contracts are preserved through supported compatibility or resume fails explicitly;
- canonical `SEEN_*` is never synthesized;
- future seed ownership may move prospectively to canonical creators without relabeling historical `seed.originEvent`;
- compatibility-only legacy definitions never schedule in the active canonical catalog.

Final T5.1 identity target therefore remains:
- 254 exact canonical principal IDs;
- 134 exact canonical conditional IDs;
- zero duplicate IDs;
- zero active runtime-only IDs.

## Retirement boundary

`playing -> decided -> announced -> closed` remains the current canonical monotonic model and `closed` remains terminal.

One canonical conflict remains: the conditional source requires playable reconsideration after a public announcement while the semantic map forbids silent rollback.

`T5_1_CANON_DECISION_REQUIRED_RETIREMENT_REVERSAL.md` documents Option E as the strongest source-fit planning model:
- keep status `announced`;
- preserve original announcement as immutable history;
- accept only a bounded exceptional extension/offer;
- allow football to continue while `announced`;
- close later through normal terminal logic;
- never transition `closed -> playing` or silently `announced -> playing`.

Option E is still a recommendation, not canonical approval, until Pedro explicitly approves it.

## Current status

- Canonical missing principal assignment: **87/87 complete**
- Runtime-only principal ownership assignment: **87/87 complete**
- Runtime-only principal final dispositions: **87/87 complete**
- Exact-title candidates: **7/7 complete, 0 aliases**
- Conditional semantic planning review: **134/134 complete**
- Legacy crosswalk: **173/174 final**
- Runtime T5.1 implementation: **NOT_READY** — canonical content/migration work remains
- Only unresolved crosswalk decision: **retirement reconsideration state model**

Queue authority remains `project/CODEX_QUEUE.md`. Nothing in this summary authorizes automatic Codex execution or merge.
