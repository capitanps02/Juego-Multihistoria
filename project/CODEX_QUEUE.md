# Codex execution queue

This file is maintained by ChatGPT as the ordered handoff queue for implementation tasks.

Codex must not be launched on two tasks that mutate the same subsystem unless their dependency relationship has been resolved first.

## Current queue

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

## State vocabulary

- `READY`: sufficiently specified and dependencies satisfied.
- `BLOCKED-BY-#N`: do not launch until the named PR is integrated/rebased.
- `RUNNING`: Codex has been invoked and implementation is in progress.
- `REVIEW`: Codex returned changes; ChatGPT must inspect diff/tests.
- `CHANGES_REQUESTED`: review found actionable problems; send corrections to Codex.
- `READY_TO_MERGE`: review passed; still requires Pedro's explicit merge instruction.
- `DONE`: merged/closed according to explicit user instruction.

## Safety rules

- Never auto-merge.
- Never launch a blocked item just because its prompt exists.
- Never mark tests passed from an old QA artifact; use results from the task implementation run.
- Preserve branch/PR-specific context in the PR itself so a future chat can reconstruct the handoff from GitHub.
