# T5.1 — completion-gate status

Date: 2026-09-16  
Branch assessed: `chore/chatgpt-codex-workflow`

## Overall status

**NOT_READY**

The audit/planning layer is now substantially stronger, including complete batch assignment for the 87 baseline-unresolved principal IDs and semantic planning review for all 134 canonical conditional callbacks, but the workflow branch runtime has not been reconciled. No implementation PR has been merged into this branch during this audit work.

Important distinction:
- **planning/review evidence** can be complete for a batch;
- a completion gate only PASSes after runtime implementation + executable evidence.

## Gate dashboard

| Gate | Current status | Evidence / blocker |
|---|---|---|
| A — Principal identity completeness | **FAIL / implementation pending** | Baseline remains 167/254 literal principal IDs with 87 canonical principal IDs unresolved in runtime. Planning now assigns all 87 exactly once across PR #3/#7/#5 and 02C–04D; assignment is not implementation. |
| B — Principal semantic verification | **FAIL / implementation pending** | Common implementation rules and DRAFT prompts now exist through 04E, but generic/technical principal mappings and exact-title candidates still require runtime reconciliation. Runtime `canonStatus` alone is not accepted as proof. |
| C — Seed chronology | **PARTIAL PLANNING / NOT PASS** | PR #7 targets age-26 origins; 02C–04C prompts now explicitly protect record, successor, documentary, wealth/business, Bosman/agent, dorsal, travel/load and age-priority chains. Final longitudinal tests have not run on reconciled runtime. |
| D — Save & migration truthfulness | **PARTIAL INFRASTRUCTURE / NOT PASS** | Existing save tests protect history/seeds/RNG generally, and T5.1 migration rules are specified. But content-ID/crosswalk migrations for the 174 baseline drift IDs and pending-scene compatibility are not implemented/proven. |
| E — Retirement state machine | **FAIL / canonical tension open** | Runtime contains automatic no-market decision, timer announcement/closure, direct early close and `CEVT_RET_RECONSIDER` with non-monotonic reversal. Canonical matrix reversal vs monotonic semantic map requires explicit resolution. |
| F — Epilogue truthfulness | **NOT VERIFIED** | Generator correctly requires `closed`, but terminal facts and several ending-family inputs depend on unreconciled 04D/05E behavior. |
| G — Determinism & RNG | **TEST DESIGN READY / FINAL EVIDENCE PENDING** | Existing suites/RNG streams provide infrastructure; principal and conditional batch prompts require save/RNG regression. Do not claim final PASS from stale pre-reconciliation runs. |
| Conditional semantic gate | **PLANNING REVIEW 134/134 / RUNTIME NOT RECONCILED** | Every canonical conditional now has phase-level semantic review evidence. Generic factories, identity drifts and exact-ID collisions still require runtime work. |
| H — Full 388-event identity | **FAIL / baseline drift remains** | P1/workflow runtime baseline has 167 exact principals + 47 exact conditionals = 214 exact canonical IDs, with 87 principal + 87 conditional identity drifts. |

## Principal planning milestone

The 87 baseline-unresolved principal IDs are now assigned exactly once in:
- `T5_1_PRINCIPAL_87_BATCH_MANIFEST.json`;
- `T5_1_PRINCIPAL_PLANNING_SUMMARY.md`.

Coverage:
- PR #3: 6;
- PR #7: 9;
- PR #5: 3;
- 02C: 7;
- 02D: 5;
- 02E: 2;
- 03A: 10;
- 03B: 12;
- 04A: 11;
- 04B: 10;
- 04C: 10;
- 04D: 2;
- total: **87/87**.

DRAFT implementation prompts are prepared for every future principal batch 02C–04E, and `T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md` provides the shared semantic/migration/RNG contract.

This is planning completeness only. Runtime Gate A remains FAIL until the canonical set is actually implemented and audited.

## Active PR base-drift preflight

GitHub refresh on 2026-09-16 shows PR #3, PR #7 and PR #5 are still open, draft and unmerged, with no functional implementation added.

Their task branches were created from workflow commit `534663540c7b64a4e35e6f29b814704af3758435` and are currently **57 commits behind** the assessed workflow branch after audit/planning documentation was added.

Before executing Codex on any active PR:
1. re-ground/rebase or merge the current workflow base into the task branch;
2. ensure the latest T5.1 audit/planning artifacts are present;
3. refresh the task audit baseline;
4. only then execute the branch-specific Codex prompt.

Do not interpret current GitHub `mergeable: false` as permission to merge or to rewrite task history automatically. No task branch is re-grounded until needed for execution/review.

## Conditional planning milestone

The prior completion-gate statement that conditional reconciliation was unblocked has now been acted on at audit/planning level.

Reviewed canonical conditionals:
- 18–20: 14/14;
- 20–23: 18/18;
- 23–26: 20/20;
- 26–30: 24/24;
- 30–34: 26/26;
- 34+: 32/32;
- total: **134/134**.

This supersedes the old `count_only_not_semantically_reconciled` assumption in `scripts/audit-t51.mjs` / `scripts/test-t51.mjs`. Those scripts are now known audit debt and must be upgraded during runtime 05A; they must not be kept green by preserving the obsolete count-only model.

## Most important blockers found by semantic review

### Exact-ID collisions / false confidence
- `CEVT_21_MEDIA_01`: exact ID but different runtime title/trigger/scene contract.
- `CEVT_22_FREE_01`: exact ID but missing formal-interest/preagreement/crisis contract.
- 20 exact IDs in 23–26 share generic scene/choices despite matching canonical IDs/titles.
- five exact age-29 callbacks use generic factory semantics despite runtime `verified` metadata.
- `CEVT_RET_NO_LAST_MATCH` and `CEVT_RET_STORYBOOK_LAST_GOAL` are exact/verified but semantically mismatched.

### Principal title candidates still need proof
Title equality is not identity proof. Important unresolved candidates include:
- `EVT_30_BRIDGE_001` vs runtime `EVT_30_IDN_001`;
- `EVT_38_RICH_001` vs runtime `EVT_36_RICH_001`;
- `EVT_RET_FAM_001` vs runtime `EVT_RET_HOME_001`;
- `EVT_RET_LASTMATCH_001` vs runtime `EVT_RET_LAST_001`.

PR #5 separately owns the three 26–30 title candidates already identified there.

### Confirmed condition mismatch
`CEVT_24_TOURN_02` canonically represents being left out of the tournament final list. Runtime requires `NATIONAL_CALLED == true`; simulator provenance confirms that flag represents an actual senior call-up path, so the mismatch is real rather than a naming ambiguity.

### Migration truthfulness
Same string ID is not enough for pending-save compatibility. A pending old generic callback must not reload into a newly canonical scene/choice set just because the ID stayed constant.

### Retirement source tension
The conditional matrix contains `CEVT_38_RETIREMENT_REVERSAL` (return contemplated after retirement), while the semantic map defines a monotonic `playing -> decided -> announced -> closed` model and prohibits `closed -> *`.

Implementation must not silently choose one interpretation. Canonical state responsibility must be resolved explicitly before 04D/05E runtime work.

## What is actually closed now

The following are complete as **audit/planning artifacts**, not runtime gates:
- GitHub read/write handoff verification;
- preservation/indexing of original T5.1 audit sources;
- 388-ID identity manifest and legacy crosswalk scaffolding;
- exact-ID certification rule: identity != semantic verification;
- complete 87/87 principal baseline-drift batch assignment;
- DRAFT principal implementation contracts 02C–04E;
- 134/134 conditional semantic planning review;
- DRAFT conditional implementation contracts 05A–05E;
- 30–34 legacy-shell disposition review;
- 18–20 causal flag provenance review;
- targeted save/RNG test design;
- identification of stale conditional assumptions in current `audit:t51` / `test:t51`;
- retirement runtime/FSM audit;
- epilogue runtime audit;
- documented late-retirement canonical/FSM tension.

## Next executable-development path

Queue authority remains `project/CODEX_QUEUE.md`.

Current top of queue:
1. PR #3 — READY, with current workflow-base re-ground required immediately before execution;
2. PR #7 — READY, same preflight required, recommended after #3 review;
3. PR #5 — BLOCKED-BY-#7.

No DRAFT batch becomes READY simply because its planning review/prompt is complete.

## Final completion condition remains unchanged

T5.1 reaches `T5.1_COMPLETE` only when all **388/388** canonical events pass:
- identity;
- semantic fidelity;
- causal/seed chronology;
- save/migration truthfulness;
- retirement/epilogue invariants;
- determinism/RNG QA;
- final targeted + acceptance evidence.

Current status remains **NOT_READY**.
