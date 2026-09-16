# DRAFT Codex task — T5.1 Batch 02D · canonical age 28

**Status: DRAFT — do not execute yet.**

## Dependencies

Execute only after Batch 02C is reviewed/integrated and the audit baseline is refreshed.

Read and obey:
- `AGENTS.md`
- `project/CHATGPT_CODEX_WORKFLOW.md`
- `project/t5_1/T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md`
- `project/t5_1/T5_1_PRINCIPAL_87_BATCH_MANIFEST.json`
- canonical rows in `analysis/2026-09-11/t1/principal-traceability.json`

PR #5 is expected to have already reconciled `EVT_28_RICH_001`. Do not redo that scene.

## Goal

Reconcile the five remaining baseline-unresolved canonical principal scenes at age 28:

1. `EVT_28_MEDIA_001` — El documental se estrena cuando ya eres otro
2. `EVT_28_FORM_001` — Tres meses normales
3. `EVT_28_STAR_001` — El chico ya no es promesa
4. `EVT_28_MED_001` — No puedes jugar sesenta partidos
5. `EVT_28_CLUB_001` — El presidente quiere tu apoyo

## Required work

For every target, use the complete canonical `sourceFields`, not the title.

- Implement the canonical ID once.
- Preserve trigger/time window, visible and imperfect information, choice intent and resolution ambiguity.
- Reconcile seed reads/writes and NPC references.
- Identify and dispose any technical scene that currently occupies the same narrative function.
- Ensure the new canonical scene does not collapse into the generic family effects used by the current 26–30 row factory where the canon defines a specific decision.

## Causal obligations

This batch sits in the middle of several long-range chains:
- `EVT_28_MEDIA_001` must consume the documentary history created earlier rather than inventing a fresh documentary premise.
- `EVT_28_STAR_001` must respect the successor/protected-player history established at 27 and remain compatible with succession pressure at 31/32.
- body/load decisions must preserve chronology into maturity and late-career recovery debt.
- `EVT_28_CLUB_001` must distinguish institutional/owner pressure from generic market or media pressure.

Do not move canonical seed origin later just because the current runtime has a convenient existing seed.

## Expected runtime area

Primary:
- `src/content/events/26_30/principal-events.ts`

Potentially:
- `src/catalog/seeds.ts`
- relevant 26–30 simulation flags/adapters
- save/migration compatibility
- targeted T5.1 tests/audit data

Keep changes scoped to age 28 plus the minimum causal support required.

## Migration rules

- Related existing age-28 runtime scenes are not aliases unless same-scene identity is proven.
- Pending decisions must retain the choice set already presented to the player.
- Old history remains old history where identity is not exact.
- Do not weaken content identity checks.

## Tests

Add targeted coverage for:
- all five canonical IDs under their intended gates;
- documentary origin → age-28 callback across save/resume;
- successor chain from age 27 → age 28 → later maturity pressure;
- body/load memory surviving save/resume;
- no duplicate or technical-only replacement for `EVT_28_RICH_001` after PR #5;
- deterministic same-seed behavior with microfeeds on/off for strong narrative outcomes.

Run the common required commands from the implementation branch.

## Non-goals

- Do not implement age-29 missing scenes.
- Do not alter retirement semantics.
- Do not start conditional reconciliation.
- Do not merge.

## Deliverable

Focused age-28 reconciliation with exact canonical evidence, migration dispositions, causal tests and current validation results for ChatGPT review.
