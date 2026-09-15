# Codex execution prompt · T5.1 Batch 01

Implement Issue #2 on the current branch.

Read `AGENTS.md` first and follow it strictly. Then read:

- `project/tasks/T5_1_BATCH_01_20_23.md`
- `analysis/2026-09-16/t5.1-batch-01-decisions.json`
- `analysis/2026-09-11/t1/principal-traceability.json`
- `analysis/2026-09-11/canonical-id-audit.json`
- `analysis/2026-09-15/T5.1-reconciliation.json`
- `src/content/events/18_20/canonical-events.ts`
- `src/content/events/20_23/principal-events.ts`
- `src/content/events/23_26/principal-events.ts`
- `src/catalog/seeds.ts`
- `src/narrative/scheduler.ts`
- `src/session/game-session.ts`

## Required implementation

1. Add explicit canonical implementations for:
   - `EVT_20_BRIDGE_001`
   - `EVT_20_MATCH_003`
   - `EVT_20_JAN_001`
   - `EVT_21_MKT_001`
   - `EVT_21_SOC_001`
   - `EVT_21_PRS_002`

2. Use the canonical traceability fields as the source of truth for trigger, visible information, uncertainty, choices, consequences, NPCs and seed memory. Do not use the generic four-choice template for these six events.

3. Reconcile the six technical-only principal IDs documented in the batch brief. Do not invent 1:1 aliases. Preserve old save history semantically: an old `SEEN_*` flag must not become a new canonical `SEEN_*` flag unless explicit equivalence is proven.

4. Handle dependencies explicitly:
   - update `SEED_AGENT_POWER` origin metadata if `EVT_21_AGT_002` is retired;
   - update `SEED_FOREIGN_ADAPT` origin metadata if `EVT_21_ABR_001` is retired;
   - if `EVT_22_END_001` is retired, remove its scheduler hardcoded exemption only after moving/confirming the transition guarantee on the correct canonical mechanism, and add a directed 22→23 transition test.

5. Preserve determinism and RNG-stream separation. Reads must not mutate state or consume RNG.

6. Do not weaken `contentIdentity`. Implement or document the correct save migration path required by the content change.

7. Update the T5.1 reconciliation audit so the six canonical IDs cease to be unresolved only because they are actually implemented and semantically reviewed.

8. Add focused tests for:
   - presence/uniqueness of all six canonical IDs;
   - canonical choices/intel/seeds;
   - no stale scheduler reference to a retired transition event;
   - 22→23 transition behavior;
   - save migration/content identity behavior;
   - deterministic replay for the affected path.

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

Run any additional targeted tests you add.

Do not run `qa:1000` unless needed to diagnose a regression or required by a changed acceptance condition.

## Deliverable

Commit the implementation to this branch. In the PR summary report:

- files changed;
- exact treatment of each of the 6 canonical IDs;
- exact treatment of each of the 6 technical-only IDs;
- save/migration decision;
- scheduler/22→23 decision;
- tests run and their results;
- unresolved risks or follow-up tasks.

Do not merge the PR.
