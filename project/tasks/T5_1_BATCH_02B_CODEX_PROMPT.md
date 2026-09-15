# Codex execution prompt · T5.1 Batch 02B

Implement Issue #6 on the current branch.

Read `AGENTS.md`, then:

- `project/tasks/T5_1_BATCH_02B_AGE26_SEED_CHRONOLOGY.md`
- `analysis/2026-09-16/t5.1-batch-02b-seed-chronology.json`
- `analysis/2026-09-11/t1/principal-traceability.json`
- `analysis/2026-09-15/T5.1-reconciliation.json`
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

Update seed catalog origins/windows exactly as specified in the decision JSON. Preserve active historical seeds during save migration: changing catalog metadata must not recreate a seed, duplicate effects or consume RNG.

Correct the causal error in these later events:

- `EVT_27_LOCK_001` must no longer originate `SEED_LOCKER_ENDORSEMENT`; canon creates `SEED_MANAGER_POWER` and uses prior locker memory.
- `EVT_27_BODY_001` must no longer originate `SEED_PEAK_LOAD`; canon uses that prior memory and intensifies self-optimization.
- `EVT_27_PRS_001` must no longer originate `SEED_DOCUMENTARY_ACCESS`; canon creates `SEED_FAN_FRACTURE`.
- `EVT_27_NAT_001` must no longer originate `SEED_NATIONAL_ROLE`; canon creates `SEED_NATIONAL_CAPTAINCY`.

If fully rewriting those four later events is safe and localized, reconcile them explicitly in this PR. Otherwise make the minimum safe correction that removes the false seed origin, keep them `technical_adaptation`, add focused tests and document the remaining semantic debt. Do not mark them verified without field-by-field reconciliation.

Review and retire technical-only seed-origin events where appropriate, especially:

- `EVT_26_IDN_001`
- `EVT_27_REC_001`
- `EVT_27_RIV_001`
- `EVT_27_MENT_001`
- `EVT_27_FINAL_001`
- `EVT_28_FINAL_001`

Do not assume aliases. Preserve old IDs in historical save/history data.

## Required causal test

Prove this canonical chain:

`EVT_26_EUR_001 → SEED_BIG_GAME_BENCH → EVT_26_FINAL_001 → SEED_FINAL_BENCH`

Also test each moved seed is available from age 26 and consumers at ages 27+ continue to behave correctly.

## Save and deterministic behavior

- Do not weaken `contentIdentity`.
- Do not translate `SEEN_old` into `SEEN_new` without approved equivalence.
- Existing active seeds survive migration without replay.
- Reads/migration do not consume narrative RNG.

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

Run additional targeted tests for seed chronology, 26→27 continuity and the final-bench chain.

Commit changes to this branch, report files changed, seed-origin moves, retired technical IDs, save strategy, tests and remaining debt. Do not merge the PR.
