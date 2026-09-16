# Codex execution prompt · T5.1 Batch 01

Implement Issue #2 on the current branch **only after the ChatGPT execution preflight has re-grounded this branch on the current `chore/chatgpt-codex-workflow` base**.

Read `AGENTS.md` first and follow it strictly. Then read:

- `project/tasks/T5_1_BATCH_01_20_23.md`
- `analysis/2026-09-16/t5.1-batch-01-decisions.json`
- `analysis/2026-09-11/t1/principal-traceability.json`
- `analysis/2026-09-11/canonical-id-audit.json`
- `analysis/2026-09-15/T5.1-reconciliation.json`
- `project/t5_1/T5_1_ACTIVE_PR_EXECUTION_PREFLIGHT.md`
- `project/t5_1/T5_1_PREIMPLEMENTATION_CONTENT_FREEZE.md`
- `project/t5_1/T5_1_PR3_PRINCIPAL_LEGACY_DISPOSITIONS.json`
- `project/t5_1/T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md`
- `project/t5_1/T5_1_SAVE_SESSION_MIGRATION_RUNTIME_AUDIT.md`
- `project/t5_1/T5_1_SESSION_V3_DESIGN_SPEC.md`
- `src/content/events/18_20/canonical-events.ts`
- `src/content/events/20_23/principal-events.ts`
- `src/content/events/23_26/principal-events.ts`
- `src/catalog/seeds.ts`
- `src/narrative/scheduler.ts`
- `src/simulation/world-simulator.ts`
- `src/session/game-session.ts`

## Mandatory step zero — freeze pre-T5.1 content before any functional event edit

This is the **first functional T5.1 catalog batch**. Before editing any active event definition:

1. run the exact capture procedure in `T5_1_PREIMPLEMENTATION_CONTENT_FREEZE.md`;
2. generate the frozen pre-T5.1 event catalog and manifest from the unchanged built runtime;
3. verify counts are exactly 388 total / 254 principal / 134 conditional;
4. record exact Git commit, `ENGINE_BUILD`, `SESSION_VERSION`, GameState schema, `contentIdentity`, catalog byte count and SHA-256;
5. add/execute the freeze-integrity test;
6. confirm the frozen compatibility catalog is not imported into active `EVENTS`, `EventIndex` or scheduler.

If the branch already contains a valid frozen baseline produced from the exact same pre-functional-edit content, verify it instead of silently replacing it.

Do **not** modify active event content before this freeze is captured.

## Required implementation

1. Add explicit canonical implementations for:
   - `EVT_20_BRIDGE_001`
   - `EVT_20_MATCH_003`
   - `EVT_20_JAN_001`
   - `EVT_21_MKT_001`
   - `EVT_21_SOC_001`
   - `EVT_21_PRS_002`

2. Use the canonical traceability fields as the source of truth for trigger, visible information, uncertainty, choices, consequences, NPCs and seed memory. Do not use the generic four-choice template for these six events.

3. Apply the already-reviewed disposition for all six technical-only principal IDs:
   - `EVT_20_MATCH_001`
   - `EVT_21_AGT_002`
   - `EVT_21_ABR_001`
   - `EVT_21_CCH_001`
   - `EVT_22_LIFE_001`
   - `EVT_22_END_001`

   Their disposition is `retire_technical_keep_history_only`.

   Therefore:
   - no same-scene ID migration is approved;
   - old history IDs remain unchanged;
   - pending technical scenes are not directly substituted with a canonical scene;
   - no `SEEN_old -> SEEN_canonical` conversion;
   - legacy compatibility definitions, when eventually used for supported migration, must never re-enter active scheduling.

4. Handle dependencies explicitly:
   - `SEED_AGENT_POWER` currently has `EVT_20_AGT_001` and technical `EVT_21_AGT_002` as catalog origins. Remove/replace the technical future-catalog origin only according to canonical seed responsibility; do not rewrite historical `seed.originEvent` merely because metadata changes.
   - `SEED_FOREIGN_ADAPT` currently has `EVT_20_ABR_001` and technical `EVT_21_ABR_001` as catalog origins. Apply the same historical-truth rule.
   - `EVT_22_END_001` is **not** the mechanism that changes phase. `world-simulator.ts` derives phase from age using `phaseForAge(next.age)`. Remove the technical scheduler `budgetExempt` reference when the legacy event leaves active content and give the distinct canonical `EVT_23_BRIDGE_001` whatever explicit start-of-phase narrative priority is actually required. Test both phase transition and bridge reachability.

5. Preserve determinism and RNG-stream separation. Reads must not mutate state or consume RNG.

6. Do not weaken `contentIdentity`.

   Intermediate T5.1 development branches are allowed to reject old unsupported session content with `CONTENT_CHANGED`. **Do not invent a per-batch release migration just to make this PR load old sessions.**

   This PR must:
   - preserve the frozen pre-T5.1 compatibility evidence;
   - preserve old history/pending truth in migration design/tests;
   - avoid mechanisms that would make final Session-v3 migration impossible;
   - leave final supported-release content-migration registration to the final T5.1 migration task after the 388-event catalog is stable, unless a narrowly scoped prerequisite is explicitly required and reviewed.

7. Update the T5.1 reconciliation audit so the six canonical IDs cease to be unresolved only because they are actually implemented and semantically reviewed.

8. Add focused tests for:
   - pre-T5.1 freeze identity/counts/determinism;
   - presence/uniqueness of all six canonical IDs;
   - canonical choices/intel/seeds;
   - all six technical IDs absent from active principal scheduling after replacement;
   - no stale scheduler reference to `EVT_22_END_001`;
   - age-driven 22→23 transition still occurs;
   - canonical `EVT_23_BRIDGE_001` remains reachable with intended narrative priority;
   - technical history is not translated into canonical history/SEEN state;
   - no weakening of `CONTENT_CHANGED` on unsupported intermediate identities;
   - deterministic replay for the affected paths.

## Required validation

Run at least:

```bash
npm run build
npm run validate
npm run test:session
npm run test:saves
npm run audit:t51
npm run test:t51
```

Run every targeted test introduced by this task.

Do not run `qa:1000` unless needed to diagnose a regression or required by a changed acceptance condition.

## Deliverable

Commit the implementation to this branch. In the PR summary report:

- frozen pre-T5.1 content identity + fixture paths;
- files changed;
- exact treatment of each of the 6 canonical IDs;
- confirmation that each of the 6 technical IDs followed `retire_technical_keep_history_only`;
- seed catalog metadata changes vs historical-origin policy;
- scheduler/22→23 decision;
- interim `contentIdentity`/migration behavior;
- tests run and their results;
- unresolved risks or follow-up tasks.

Do not merge the PR.
