# Codex execution prompt · T5.1 Batch 02A

Implement the semantic repair described in Issue #4 for the three exact-title candidates on the current branch.

Read `AGENTS.md` first. Then read:

- `project/tasks/T5_1_BATCH_02A_TITLE_CANDIDATES.md`
- `analysis/2026-09-16/t5.1-batch-02a-title-candidates.json`
- `analysis/2026-09-11/t1/principal-traceability.json`
- `analysis/2026-09-15/T5.1-reconciliation.json`
- `src/content/events/26_30/principal-events.ts`
- `src/catalog/seeds.ts`
- `src/content/events/26_30/conditional-events.ts`
- `src/simulation/state30-classifier.ts`
- `src/session/game-session.ts`

## Required changes

Implement explicit canonical definitions for:

- `EVT_27_STAR_001` — Dos estrellas, un foco
- `EVT_27_AWARD_001` — La gala
- `EVT_28_RICH_001` — La oferta financieramente absurda

Do not reuse the generic family choices for these scenes. Use the canonical source fields for body, visible intel, uncertainty, choices, consequences and seed relationships.

Retire from the active principal catalog only after the canonical replacement is integrated:

- `EVT_28_TEAM_001`
- `EVT_28_GALA_001`
- `EVT_29_MKT_001`

These are not approved aliases. Historical saves/history containing the old IDs must remain historically valid and must NOT be rewritten to claim the new canonical event occurred.

Update seed metadata:

- `SEED_SECOND_STAR`: origin `EVT_27_STAR_001`, age window starting at 27; incorporate/read `SEED_PENALTY_HIERARCHY` as required by canon.
- `SEED_GLOBAL_AWARD_BEHAVIOR`: origin `EVT_27_AWARD_001`, age window starting at 27; incorporate/read `SEED_RECORD_CHASE` as required by canon.
- `SEED_WEALTHY_PEAK_EXIT`: origin `EVT_28_RICH_001`, age window starting at 28; preserve downstream behavior in conditional events and `state30-classifier.ts`; incorporate/read `SEED_WEALTHY_EXIT` as required by canon.

Correct any `verified` status that currently treats the technical IDs as canonically reconciled. The final canonical definitions may be `verified` only after an explicit field-by-field comparison against the traceability source.

Do not weaken `contentIdentity` or deterministic RNG behavior.

## Focused tests

Add tests proving at least:

1. New canonical IDs exist exactly once and old technical IDs are no longer in active principals.
2. Canonical choices/intel/memory are present for each scene.
3. Seed origin metadata and age windows moved correctly.
4. `SEED_WEALTHY_PEAK_EXIT` still drives its age-29 conditional and state-30 classification behavior after moving its origin to age 28.
5. Historical `SEEN_*` for technical IDs is not silently converted to the canonical `SEEN_*`.
6. Deterministic replay remains deterministic for affected paths.
7. T5.1 reconciliation marks these three canonical IDs resolved because of real implementation, not title aliasing.

Run at least:

```bash
npm run build
npm run validate
npm run test:session
npm run test:saves
npm run audit:t51
npm run test:t51
```

Run additional targeted tests you add. Do not merge the PR. Report files changed, migration decisions, seed changes, tests and unresolved risks.
