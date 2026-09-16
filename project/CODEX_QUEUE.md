# Codex execution queue

This file is maintained by ChatGPT as the ordered handoff queue for implementation tasks.

Codex must not be launched on two tasks that mutate the same subsystem unless their dependency relationship has been resolved first.

## Current executable queue

### 1. READY — PR #3 — T5.1 Batch 01 · ages 20–23

Branch: `task/t5.1-batch-01`

Scope:
- implement 6 missing canonical principal events in `20_23`;
- reconcile 6 technical-only events;
- repair 22→23 transition responsibility;
- save/contentIdentity strategy and targeted tests.

Dependencies: none beyond `AGENTS.md` / workflow branch.

Execution command in chat: **`ejecuta Codex`** defaults to this first READY item unless the user names another PR/task.

After Codex finishes: ChatGPT reviews diff/tests before any merge.

---

### 2. READY — PR #7 — T5.1 Batch 02B · canonical age 26 + seed chronology

Branch: `task/t5.1-batch-02b`

Scope:
- 9 missing age-26 canonical scenes;
- semantic repair of `EVT_26_EUR_001`;
- restore 10 seed origins/age windows;
- repair false seed writers in later events;
- test 26→27 causal continuity.

Dependencies:
- logically independent of PR #3 content;
- should run before PR #5 because both PR #7 and PR #5 are expected to touch `src/content/events/26_30/principal-events.ts` and `src/catalog/seeds.ts`.

Recommended execution: after PR #3 review, or explicitly by name if user wants to prioritize it.

---

### 3. BLOCKED-BY-#7 — PR #5 — T5.1 Batch 02A · exact-title semantic repairs

Branch: `task/t5.1-batch-02a`

Scope:
- canonical `EVT_27_STAR_001` from technical `EVT_28_TEAM_001`;
- canonical `EVT_27_AWARD_001` from technical `EVT_28_GALA_001`;
- canonical `EVT_28_RICH_001` from technical `EVT_29_MKT_001`;
- move corresponding seed origins and preserve downstream behavior.

Why blocked:
- overlaps files with PR #7;
- canon of these scenes depends on causal memories (`SEED_PENALTY_HIERARCHY`, `SEED_RECORD_CHASE`, etc.) whose chronology is repaired by PR #7.

Before launch:
1. integrate/rebase the reviewed PR #7 result into this branch;
2. refresh the T5.1 audit baseline;
3. then launch Codex using the prompt in PR #5.

## Planned T5.1 batches — not executable yet

These entries define the dependency chain only. **Do not launch Codex for a DRAFT item.** Create/re-ground its task branch and PR only when predecessors have been reviewed and integrated into the intended base.

### Audit/planning snapshot

- Baseline unresolved principal IDs are assigned **87/87** to exactly one active/DRAFT batch in `project/t5_1/T5_1_PRINCIPAL_87_BATCH_MANIFEST.json`.
- Active PR principal coverage: 18 IDs. Future principal DRAFT coverage: 69 IDs.
- DRAFT principal prompts are prepared for 02C, 02D, 02E, 03A, 03B, 04A, 04B, 04C, 04D and 04E.
- Common principal implementation contract: `project/t5_1/T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md`.
- Principal planning summary: `project/t5_1/T5_1_PRINCIPAL_PLANNING_SUMMARY.md`.
- Conditional semantic planning review is **134/134** across all phases.
- DRAFT conditional prompts are prepared for 05A–05E.
- Planning completeness is not runtime completion. Current runtime status remains `NOT_READY`; see `project/t5_1/T5_1_COMPLETION_STATUS_2026-09-16.md`.

### 4. DRAFT — Batch 02C · canonical age 27
Scope: 7 remaining baseline-unresolved age-27 canonical principal IDs after PR #5.
DRAFT prompt: `project/t5_1/T5_1_02C_CODEX_PROMPT_DRAFT.md`.
Dependencies: reviewed/integrated PR #7 and PR #5; refresh audit after both are reconciled.

### 5. DRAFT — Batch 02D · canonical age 28
Scope: 5 remaining baseline-unresolved age-28 canonical principal IDs after PR #5 handles `EVT_28_RICH_001`.
DRAFT prompt: `project/t5_1/T5_1_02D_CODEX_PROMPT_DRAFT.md`.
Dependencies: Batch 02C reviewed/integrated.

### 6. DRAFT — Batch 02E · canonical age 29
Scope: 2 remaining baseline-unresolved age-29 principal IDs plus focused 29→30 hard-deadline integrity.
DRAFT prompt: `project/t5_1/T5_1_02E_CODEX_PROMPT_DRAFT.md`.
Dependencies: Batch 02D reviewed/integrated.

### 7. DRAFT — Batch 03A · canonical age 30
Scope: 10 baseline-unresolved age-30 principal IDs, including semantic review of `EVT_30_BRIDGE_001` vs title candidate `EVT_30_IDN_001`.
DRAFT prompt: `project/t5_1/T5_1_03A_CODEX_PROMPT_DRAFT.md`.
Dependencies: Batch 02E reviewed/integrated.

### 8. DRAFT — Batch 03B · canonical ages 31–33
Scope: 12 baseline-unresolved principal IDs; protects successor, wealth/business, Bosman, travel/load, record and 33→34 priority chains.
DRAFT prompt: `project/t5_1/T5_1_03B_CODEX_PROMPT_DRAFT.md`.
Dependencies: Batch 03A reviewed/integrated.

### 9. DRAFT — Batch 04A · canonical age 34
Scope: 11 baseline-unresolved age-34 principal IDs; late-career scenes remain non-terminal unless canonical retirement task owns a transition.
DRAFT prompt: `project/t5_1/T5_1_04A_CODEX_PROMPT_DRAFT.md`.
Dependencies: Batch 03B reviewed/integrated.

### 10. DRAFT — Batch 04B · canonical age 35
Scope: 10 baseline-unresolved age-35 principal IDs; farewell/dual-role/agent/January/sponsor contexts must not imply retirement.
DRAFT prompt: `project/t5_1/T5_1_04B_CODEX_PROMPT_DRAFT.md`.
Dependencies: Batch 04A reviewed/integrated.

### 11. DRAFT — Batch 04C · canonical ages 36–38
Scope: 10 baseline-unresolved principal IDs; preserves agency for lower league, short contract, home, rich offer and no-market paths.
DRAFT prompt: `project/t5_1/T5_1_04C_CODEX_PROMPT_DRAFT.md`.
Special identity review: canonical `EVT_38_RICH_001` vs runtime title candidate `EVT_36_RICH_001`.
Dependencies: Batch 04B reviewed/integrated.

### 12. DRAFT — Batch 04D · retirement state machine
Scope includes the 2 remaining baseline-unresolved retirement principal IDs (`EVT_RET_FAM_001`, `EVT_RET_LASTMATCH_001`) plus terminal FSM repair.
Dependencies: Batch 04C reviewed/integrated.
Audit status: runtime/FSM audit complete in `project/t5_1/T5_1_04D_RETIREMENT_RUNTIME_AUDIT.md`; DRAFT implementation prompt prepared in `project/t5_1/T5_1_04D_CODEX_PROMPT_DRAFT.md`.
Current canonical blocker: `CEVT_38_RETIREMENT_REVERSAL` conflicts with the semantic map’s monotonic `playing -> decided -> announced -> closed` model / `closed -> *` prohibition. Decision is tracked in `project/t5_1/T5_1_CANON_DECISION_REQUIRED_RETIREMENT_REVERSAL.md`.
Do not implement reversal semantics by inference.

### 13. DRAFT — Batch 05A · exact-ID conditional semantic foundation
Scope: semantic certification foundation for exact-ID conditionals, without treating exact ID or runtime `canonStatus` as proof of full fidelity.

Audit work completed on workflow branch:
- exact-ID inventory: 47/134 conditional IDs exact in P1;
- 47-entry machine-readable disposition map;
- field review of all 14 exact-ID callbacks in 18–20;
- upstream flag/causal provenance review for the strongest 18–20 candidates;
- field review of all 20 exact-ID/title callbacks in 23–26;
- confirmed `CEVT_24_TOURN_02` condition mismatch after tracing `NATIONAL_CALLED` provenance;
- targeted semantic/save/RNG test specification;
- confirmed that generic exact-ID shells in 20–23, 23–26 and 26–30 cannot be auto-certified;
- confirmed that some late exact-ID/`verified` retirement callbacks still have semantic mismatches;
- DRAFT auditor implementation prompt prepared in `project/t5_1/T5_1_05A_CODEX_PROMPT_DRAFT.md`.

Audit result: **0 exact-ID callback is automatically `canonical_verified_full`.**

Runtime status remains DRAFT. Dependencies for runtime implementation: current principal PRs (#3, #7, #5) reviewed/integrated so shared seeds and phase boundaries are stable.

### 14. DRAFT — Batch 05B · conditional ages 20–23
Scope: 18 canonical callbacks; 3 exact IDs / 15 identity drifts in P1.
Audit/planning status: **semantic review complete**. All 18 canonical/runtime rows reviewed; exact-ID semantic collisions identified for `CEVT_21_MEDIA_01` and `CEVT_22_FREE_01`; 0 direct pending-scene substitutions approved.
DRAFT prompt: `project/t5_1/T5_1_05B_CODEX_PROMPT_DRAFT.md`.
Dependencies for runtime implementation: Batch 05A runtime foundation plus principal Batch 01.

### 15. DRAFT — Batch 05C · conditional ages 26–30
Scope: 24 canonical callbacks; 5 exact IDs / 19 identity drifts in P1.
Audit/planning status: **semantic review complete**. All 24 canonical/runtime rows reviewed; the five age-29 exact IDs require semantic certification/repair despite runtime `verified` metadata.
DRAFT prompt: `project/t5_1/T5_1_05C_CODEX_PROMPT_DRAFT.md`.
Dependencies for runtime implementation: Batch 05B and principal Batches 02A–02E including seed chronology.

### 16. DRAFT — Batch 05D · conditional ages 30–34
Scope: 26 canonical callbacks; P1 had 0/26 exact IDs. Identity must be established from condition + scene + function/memory, never fuzzy/title matching.
Audit/planning status: **semantic review complete** — 26/26 legacy/runtime shells reviewed and 0/26 approved as direct same-scene migration.
DRAFT prompt: `project/t5_1/T5_1_05D_CODEX_PROMPT_DRAFT.md`.
Dependencies for runtime implementation: Batch 05C and principal Batch 03B.

### 17. DRAFT — Batch 05E · conditional ages 34+
Scope: 32 canonical callbacks; 5 exact IDs / 27 identity drifts in P1, including retirement callbacks.
Audit/planning status: **semantic review complete**. All 32 canonical/runtime rows reviewed; 0/5 exact IDs auto-certifiable.
DRAFT prompt: `project/t5_1/T5_1_05E_CODEX_PROMPT_DRAFT.md`.
Hard blocker: same retirement-reversal canonical decision as 04D. Runtime `CEVT_RET_RECONSIDER` currently performs `announced -> playing` and is not canonically approved.
Dependencies for runtime implementation: Batch 05D and principal Batch 04D.

### 18. DRAFT — Batch 04E · epilogue + terminal QA
Audit status: current epilogue truthfulness audited in `project/t5_1/T5_1_04E_EPILOGUE_RUNTIME_AUDIT.md`; DRAFT final-task prompt prepared in `project/t5_1/T5_1_04E_CODEX_PROMPT_DRAFT.md`.
Dependencies: Batch 05E plus retirement Batch 04D and all prior canonical reconciliation. Epilogue may read terminal facts only after `closed`; final task runs the 388-event identity/semantic/migration/causal/deterministic gates and acceptance evidence.

## Dependency summary

Principal chain after the active PRs:
`#3 -> #7 -> #5 -> 02C -> 02D -> 02E -> 03A -> 03B -> 04A -> 04B -> 04C -> 04D`

Conditional chain:
`05A -> 05B -> 05C -> 05D -> 05E`

Cross-chain gates:
- 05B requires principal Batch 01;
- 05C requires principal 02A–02E;
- 05D runtime implementation requires principal 03B;
- 05E requires principal 04D;
- 04E runs only after 05E and 04D.

This ordering prevents overlapping semantic/runtime work from being executed in parallel and keeps seed/save migration decisions reviewable.

## State vocabulary

- `DRAFT`: specified/planned, but not executable because branch/PR and/or dependencies are not ready.
- `READY`: sufficiently specified and dependencies satisfied.
- `BLOCKED-BY-#N`: do not launch until the named PR is integrated/rebased.
- `RUNNING`: Codex has been invoked and implementation is in progress.
- `REVIEW`: Codex returned changes; ChatGPT must inspect diff/tests.
- `CHANGES_REQUESTED`: review found actionable problems; send corrections to Codex.
- `READY_TO_MERGE`: review passed; still requires Pedro's explicit merge instruction.
- `DONE`: merged/closed according to explicit user instruction.

## Safety rules

- Never auto-merge.
- Never launch a blocked or DRAFT item just because its prompt exists.
- `ejecuta Codex` launches only the first READY item unless Pedro explicitly names another ready task.
- Never run overlapping write sets in parallel.
- Never mark tests passed from an old QA artifact; use results from the task implementation run.
- Preserve branch/PR-specific context in the PR itself so a future chat can reconstruct the handoff from GitHub.
