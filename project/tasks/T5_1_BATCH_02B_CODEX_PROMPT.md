# Codex execution prompt · T5.1 Batch 02B

Implement Issue #6 on the current branch **only after the ChatGPT execution preflight has re-grounded this branch on the current `chore/chatgpt-codex-workflow` base**.

Read `AGENTS.md`, then:

- `project/tasks/T5_1_BATCH_02B_AGE26_SEED_CHRONOLOGY.md`
- `analysis/2026-09-16/t5.1-batch-02b-seed-chronology.json`
- `analysis/2026-09-11/t1/principal-traceability.json`
- `analysis/2026-09-15/T5.1-reconciliation.json`
- `project/t5_1/T5_1_ACTIVE_PR_EXECUTION_PREFLIGHT.md`
- `project/t5_1/T5_1_PR7_PRINCIPAL_LEGACY_DISPOSITIONS.json`
- `project/t5_1/T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md`
- `project/t5_1/T5_1_SAVE_SESSION_MIGRATION_RUNTIME_AUDIT.md`
- `project/t5_1/T5_1_SESSION_V3_DESIGN_SPEC.md`
- `src/content/events/26_30/principal-events.ts`
- `src/catalog/seeds.ts`
- `src/session/game-session.ts`

## Required implementation

Create explicit canonical definitions for the nine missing age-26 events:

- `EVT_26_BRIDGE_001`
- `EVT_26_MATCH_001`
- `EVT_26_CAP_001`
- `EVT_26_MED_001`
- `EVT_26_DOC_001`
- `EVT_26_RIV_001`
- `EVT_26_TEAM_002`
- `EVT_26_NAT_002`
- `EVT_26_FINAL_001`

Also semantically repair existing `EVT_26_EUR_001` so it is the canonical **La noche en la que no empiezas** and creates `SEED_BIG_GAME_BENCH`.

Do not use generic family choices for these canonical scenes.

## PR #7 legacy scope — exactly four runtime-only IDs

The following four runtime-only age-26 principal IDs are assigned to this batch and already have reviewed disposition `retire_technical_keep_history_only`:

- `EVT_26_IDN_001`
- `EVT_26_CLB_001`
- `EVT_26_PRS_001`
- `EVT_26_JAN_001`

For all four:
- do not rewrite historical event IDs;
- do not translate `SEEN_old` to a canonical `SEEN_*`;
- do not directly substitute a pending technical scene with a canonical scene;
- remove them from active canonical scheduling only after the relevant canonical content/seed responsibility is in place;
- preserve supported legacy pending/history through the T5.1 content-migration architecture, not by leaving technical IDs active.

Specific ownership:
- `EVT_26_IDN_001` -> future `SEED_PEAK_IDENTITY` catalog origin moves to canonical `EVT_26_BRIDGE_001`;
- `EVT_26_CLB_001` -> future `SEED_PROJECT_FACE` catalog origin moves to **existing canonical `EVT_26_MKT_001`**, whose traceability explicitly creates that seed;
- `EVT_26_PRS_001` has no canonical identity replacement and must not be treated as `EVT_26_DOC_001`;
- `EVT_26_JAN_001` has no canonical identity replacement.

## Seed chronology — eleven future catalog-origin repairs

Update future seed catalog origins/windows according to the decision JSON, including the newly confirmed eleventh case:

- `SEED_PEAK_IDENTITY` -> `EVT_26_BRIDGE_001`
- `SEED_PROJECT_FACE` -> `EVT_26_MKT_001`
- `SEED_BIG_GAME_BENCH` -> `EVT_26_EUR_001`
- `SEED_RECORD_CHASE` -> `EVT_26_MATCH_001`
- `SEED_LOCKER_ENDORSEMENT` -> `EVT_26_CAP_001`
- `SEED_PEAK_LOAD` -> `EVT_26_MED_001`
- `SEED_DOCUMENTARY_ACCESS` -> `EVT_26_DOC_001`
- `SEED_PUBLIC_RIVALRY` -> `EVT_26_RIV_001`
- `SEED_MENTOR_ADVICE` -> `EVT_26_TEAM_002`
- `SEED_NATIONAL_ROLE` -> `EVT_26_NAT_002`
- `SEED_FINAL_BENCH` -> `EVT_26_FINAL_001`

Changing catalog metadata affects **future canonical origin responsibility**. It does not by itself authorize rewriting an active historical seed's `originEvent`.

Existing active historical seeds must survive save/content migration without recreation, duplicated effects or RNG draws.

## Later-event false writers — repair chronology without stealing future batch scope

Correct false seed-writer behavior as narrowly as necessary in:

- `EVT_27_LOCK_001` — stop originating `SEED_LOCKER_ENDORSEMENT`; canonical age-27 scene ultimately owns `SEED_MANAGER_POWER`.
- `EVT_27_BODY_001` — stop originating `SEED_PEAK_LOAD`; it should consume/use prior peak-load context and self-optimization semantics.
- `EVT_27_PRS_001` — stop originating `SEED_DOCUMENTARY_ACCESS`; canonical age-27 scene ultimately owns `SEED_FAN_FRACTURE`.
- `EVT_27_NAT_001` — stop originating `SEED_NATIONAL_ROLE`; canonical age-27 scene ultimately owns `SEED_NATIONAL_CAPTAINCY`.

These age-27 events belong to future Batch 02C for full semantic reconciliation. PR #7 may remove the false writer and add the minimum safe chronology behavior needed by this task, but **must not retire these events, claim their final legacy disposition, or broaden their scene rewrite beyond what is necessary for seed chronology** unless the task is explicitly re-scoped after review.

Likewise, do not retire or disposition these legacy IDs in PR #7:

- `EVT_27_REC_001` — owner 02C
- `EVT_27_RIV_001` — owner 02C
- `EVT_27_MENT_001` — owner 02C
- `EVT_27_FINAL_001` — owner 02C
- `EVT_28_FINAL_001` — owner 02D

They may lose an incorrect seed-origin responsibility in this PR, but their identity/retirement from active content belongs to their owner batch.

## Required causal tests

Prove this canonical chain:

`EVT_26_EUR_001 → SEED_BIG_GAME_BENCH → EVT_26_FINAL_001 → SEED_FINAL_BENCH`

Also prove:
- every moved seed is available from canonical age 26 where required;
- `SEED_PROJECT_FACE` is created by canonical `EVT_26_MKT_001` after repair;
- downstream consumers at 27+ continue to work after origin metadata changes;
- false age-27 writers no longer create memories that canonically predate them;
- removing the four PR #7 legacy IDs from active scheduling does not manufacture canonical history/SEEN state.

## Save/content-identity behavior

- Do not weaken `contentIdentity`.
- Do not translate `SEEN_old` into `SEEN_new` without approved same-scene equivalence; none is approved for the four PR #7 legacy extras.
- Do not rewrite historical `seed.originEvent` solely because future catalog metadata changes.
- Existing active seeds survive migration without replay.
- Reads/migration consume no narrative RNG.
- Do not create a per-branch release migration for this intermediate catalog merely to make old sessions load. Preserve compatibility evidence and the final Session-v3 design for the stable T5.1 catalog.

## Validation

Run at least:

```bash
npm run build
npm run validate
npm run test:session
npm run test:saves
npm run audit:t51
npm run test:t51
```

Run additional targeted tests for:
- all nine missing canonical IDs;
- repaired `EVT_26_EUR_001`;
- all eleven seed-origin responsibilities;
- 26→27 continuity;
- the final-bench chain;
- the four retired PR #7 legacy IDs;
- no scope theft from 02C/02D;
- save/history/active-seed truthfulness.

Commit changes to this branch, report files changed, seed-origin moves, retired technical IDs, later false-writer corrections, save strategy, tests and remaining debt. Do not merge the PR.
