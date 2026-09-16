# DRAFT Codex task — T5.1 Batch 02D · canonical age 28

**Status: DRAFT — do not execute yet.**

## Dependencies

Execute only after Batch 02C is reviewed/integrated and the audit baseline is refreshed.

Read and obey:
- `AGENTS.md`
- `project/CHATGPT_CODEX_WORKFLOW.md`
- `project/t5_1/T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md`
- `project/t5_1/T5_1_PRINCIPAL_87_BATCH_MANIFEST.json`
- `project/t5_1/T5_1_02D_PRINCIPAL_LEGACY_REVIEW.md`
- `project/t5_1/T5_1_02D_PRINCIPAL_LEGACY_DISPOSITIONS.json`
- canonical rows in `analysis/2026-09-11/t1/principal-traceability.json`

PR #5 is expected to have already reconciled `EVT_28_RICH_001`. Do not redo that scene.

## Goal

Reconcile the five remaining baseline-unresolved canonical principal scenes at age 28:

1. `EVT_28_MEDIA_001` — El documental se estrena cuando ya eres otro
2. `EVT_28_FORM_001` — Tres meses normales
3. `EVT_28_STAR_001` — El chico ya no es promesa
4. `EVT_28_MED_001` — No puedes jugar sesenta partidos
5. `EVT_28_CLUB_001` — El presidente quiere tu apoyo

## Legacy dispositions are already decided

Do **not** reopen identity review for these seven runtime-only rows. Semantic review is complete and all seven have final planning disposition `retire_technical_keep_history_only`; approved same-scene migrations: **0/7**.

- `EVT_28_PRS_001` — displaced writer of `SEED_PUBLIC_EXIT_PRESSURE`; future canonical owner is `EVT_27_AGT_001`.
- `EVT_28_MONEY_001` — displaced writer of `SEED_WEALTH_STRUCTURE`; future canonical owner is `EVT_27_MONEY_001`.
- `EVT_28_IMG_001` — displaced writer of `SEED_PERSONAL_BRAND_INDEPENDENCE`; future canonical owner is `EVT_27_IMG_001`.
- `EVT_28_TACT_001` — displaced writer of `SEED_POSITIONAL_REINVENTION`; future canonical owner is `EVT_27_TACT_001`. It is not canonical `EVT_28_STAR_001`.
- `EVT_28_FINAL_001` — obsolete late writer of `SEED_FINAL_BENCH`; PR #7 restores that origin to canonical `EVT_26_FINAL_001`.
- `EVT_28_BODY_001` — broad body/load theme only; not canonical `EVT_28_MED_001`.
- `EVT_28_JAN_001` — generic January market callback with no canonical 02D identity counterpart.

Implementation rule for all seven:
- remove from active canonical scheduling only when their causal responsibilities have a valid canonical owner;
- preserve completed legacy history under the legacy ID;
- do not synthesize canonical `SEEN_*`;
- do not directly substitute a pending legacy event with a new canonical choice set;
- compatibility-only definitions must never schedule as active content;
- future seed catalog origin metadata may move to the canonical creator, but historical `seed.originEvent` is not silently rewritten.

## Required work

For every canonical target, use the complete canonical `sourceFields`, not the title.

- Implement the canonical ID once.
- Preserve trigger/time window, visible and imperfect information, choice intent and resolution ambiguity.
- Reconcile seed reads/writes and NPC references.
- Apply the already-reviewed legacy dispositions above; do not invent 1:1 aliases.
- Ensure the new canonical scene does not collapse into the generic family effects used by the current 26–30 row factory where the canon defines a specific decision.

## Causal obligations

This batch sits in the middle of several long-range chains:
- `EVT_28_MEDIA_001` must consume `SEED_DOCUMENTARY_ACCESS` created earlier and create `SEED_DOCUMENTARY_FALLOUT`; it must not invent a fresh documentary premise.
- `EVT_28_FORM_001` creates `SEED_FIRST_PEAK_DIP` while avoiding false causality: a later recovery/decline must not be predetermined by the selected response.
- `EVT_28_STAR_001` consumes successor/protected-player history and positional-reinvention context, and creates `SEED_SUCCESSION_DECISION`; it must remain compatible with succession pressure at 31/32.
- `EVT_28_MED_001` creates `SEED_LOAD_CHOICE_29` and must use prior `SEED_INTERNATIONAL_LOAD`/load chronology.
- `EVT_28_CLUB_001` creates `SEED_PUBLIC_MANAGER_BACKING` and must distinguish institutional/owner pressure from generic market/media pressure, using manager-power context.
- PR #5's `EVT_28_RICH_001` remains a separate canonical scene.

Do not move canonical seed origin later just because the current runtime has a convenient technical writer.

## Expected runtime area

Primary:
- `src/content/events/26_30/principal-events.ts`

Potentially:
- `src/catalog/seeds.ts`
- relevant 26–30 simulation flags/adapters
- save/session migration compatibility
- targeted T5.1 tests/audit data

Keep changes scoped to age 28 plus the minimum causal support required.

## Save/content migration rules

The pre-T5.1 catalog is already frozen in `main`; a catalog change therefore has an explicit legacy source identity. Do not weaken `contentIdentity`.

- Pending decisions must retain the choice set already presented to the player or fail resume explicitly under the supported migration contract.
- Old history remains old history where identity is not exact.
- Existing active seeds survive migration without replaying effects or consuming RNG.
- Same title/theme/seed lineage is not same-scene proof.

## Tests

Add targeted coverage for:
- all five canonical IDs under their intended gates;
- all seven legacy IDs absent from active canonical scheduling after their responsibilities are transferred;
- legacy history preserved without canonical `SEEN_*` synthesis;
- pending legacy compatibility/failure behavior according to the session migration contract;
- documentary origin → age-28 callback across save/resume;
- successor chain from age 27 → age 28 → later maturity pressure;
- body/load memory surviving save/resume;
- no duplicate or technical-only replacement for `EVT_28_RICH_001` after PR #5;
- deterministic same-seed behavior with microfeeds on/off for strong narrative outcomes.

Run the common required commands from the implementation branch plus targeted migration/causal tests.

## Non-goals

- Do not implement age-29 missing scenes.
- Do not alter retirement semantics.
- Do not start conditional reconciliation.
- Do not merge.

## Deliverable

Focused age-28 reconciliation with exact canonical evidence, the already-reviewed 7/7 legacy dispositions, causal/migration tests and current validation results for ChatGPT review.
