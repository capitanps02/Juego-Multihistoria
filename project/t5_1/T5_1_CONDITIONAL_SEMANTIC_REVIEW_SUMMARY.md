# T5.1 — consolidated conditional semantic review

Generated: 2026-09-16  
Repository: `capitanps02/Juego-Multihistoria`  
Audit branch: `chore/chatgpt-codex-workflow`

## Executive status

All **134/134 canonical conditional events** now have phase-level semantic review evidence on the workflow branch.

This means the planning/audit layer has moved beyond the old `count_only_not_semantically_reconciled` state. It does **not** mean the runtime is canonical or that 134 events are certified.

| Phase | Canonical conditionals | Exact IDs in P1/runtime | Review artifact | Planning review |
|---|---:|---:|---|---|
| 18–20 | 14 | 14 | `T5_1_05A_REVIEW_18_20.md` + flag provenance | complete |
| 20–23 | 18 | 3 | `T5_1_05B_SEMANTIC_REVIEW_20_23.md` | complete |
| 23–26 | 20 | 20 | `T5_1_05A_REVIEW_23_26.md` + provenance addendum | complete |
| 26–30 | 24 | 5 | `T5_1_05C_SEMANTIC_REVIEW_26_30.md` | complete |
| 30–34 | 26 | 0 | `T5_1_05D_SEMANTIC_REVIEW.md` | complete |
| 34+ | 32 | 5 | `T5_1_05E_SEMANTIC_REVIEW_34_PLUS.md` | complete |
| **Total** | **134** | **47** | — | **134/134 reviewed** |

Identity baseline remains:
- exact conditional IDs: **47**;
- conditional identity drifts: **87**.

## What the 134-event review establishes

### 1. Exact ID is not semantic proof
The strongest counterexamples are:
- five age-29 callbacks whose runtime rows say `verified` but still use a generic factory;
- `CEVT_RET_NO_LAST_MATCH`, whose runtime condition differs from the canonical condition;
- `CEVT_RET_STORYBOOK_LAST_GOAL`, where runtime lets a player choice directly manufacture the storybook sporting result;
- `CEVT_21_MEDIA_01` and `CEVT_22_FREE_01`, where the exact canonical string ID currently denotes a materially different trigger/scene contract.

Therefore `canonical_verified_full` must be an independent audit certification layer.

### 2. Generic factories are the main semantic debt
Runtime phases 20–23, 23–26, 26–30 and 30–34 use generic callback factories for most/all rows. IDs, titles and gates often carry useful lineage, but body/intel/choices/function remain generic.

34+ repeats the pattern for most late-career conditionals.

### 3. Memory metadata is not causal implementation
`seedsRead`/`seedsWrite` metadata identifies intended dependencies but does not by itself change eligibility, outcomes or behavior. Canonical functions that say a memory changes a future scene require real gates/modifiers/transitions/effects or proven external-state logic.

### 4. External facts must exist independently
A seed must not invent the world event that a callback is supposed to contextualize.

Examples requiring real external facts include:
- Rivas/Vela/Mena role changes;
- Bruno/Nano career developments;
- Adrián presence/performance;
- third-party injury;
- owner/coach change;
- UDV cup/promotional/relegation results;
- family-business profit/loss;
- medical examination failure;
- final-match availability.

### 5. Pending-save identity is stronger than event ID
When an old generic callback and a future canonical scene share the same ID, a pending save still cannot silently swap the old choices for new ones.

Highest-risk examples:
- `CEVT_21_MEDIA_01`;
- `CEVT_22_FREE_01`;
- all five exact age-29 rewrites;
- the 20 exact-ID 23–26 callbacks;
- retirement callbacks that can change terminal state.

Content identity/version or legacy compatibility is required.

## Phase-specific headline findings

### 18–20
Individually authored and closest to canon.

Review status:
- 14/14 exact-ID callbacks field-reviewed;
- six strong causal candidates received upstream flag provenance review;
- one confirmed condition mismatch: `CEVT_19_SOCIAL_01`;
- multiple function gaps where a seed is only read as metadata;
- `CEVT_19_INJ_01` has high-risk + RNG causal proof but not yet full history/treatment proof.

### 20–23
All 18 runtime callbacks use a generic factory.

Important exact-ID collisions:
- `CEVT_21_MEDIA_01` — exact ID but different title/trigger/scene contract;
- `CEVT_22_FREE_01` — exact ID but missing formal-interest/preagreement/crisis semantics;
- `CEVT_21_ABR_01` — exact identity/title and closer gate, still generic decision content.

No old pending generic callback is approved for direct substitution.

### 23–26
Identity surface looks deceptively strong: 20/20 IDs and titles match.

Nevertheless:
- 20/20 scene/choice/function rewrites are required;
- many gates omit the external fact that creates the scene;
- `CEVT_24_TOURN_02` has a confirmed condition mismatch: runtime requires `NATIONAL_CALLED=true` while the canonical scene is omission from the tournament final list;
- this phase is a primary proof that content identity must be stronger than event ID.

### 26–30
All 24 callbacks use a generic factory.

Five exact age-29 IDs are not audit-certified despite runtime `verified` metadata. Notable mismatch:
- `CEVT_29_BODY_04` uses high body load, while canon requires unexpectedly positive recovery after surgery/chronic-body context.

### 30–34
P1 had 0/26 exact IDs.

Review conclusion:
- 26/26 technical shells reviewed;
- 0/26 approved as same-scene migrations;
- lineage can guide authorship but may not rewrite old history/pending content.

### 34+
Late career and retirement add state-machine risk on top of scene fidelity.

High-priority findings:
- `CEVT_RET_STORYBOOK_LAST_GOAL` currently lets choice directly force a storybook result;
- `CEVT_RET_NO_LAST_MATCH` uses a generic announced-time threshold rather than the canonical causal closure condition;
- runtime `CEVT_RET_RECONSIDER` performs `announced -> playing`;
- source tension remains between canonical `CEVT_38_RETIREMENT_REVERSAL` and the semantic map’s monotonic `playing -> decided -> announced -> closed` model with `closed -> *` prohibited.

That source tension must be explicitly resolved before late-retirement runtime implementation.

## Current auditor debt

The existing `scripts/audit-t51.mjs` and `scripts/test-t51.mjs` are now stale with respect to conditionals. They still encode:

`count_only_not_semantically_reconciled`

and state that no canonical conditional ID inventory exists.

Future T5.1 auditor implementation must instead consume:
- the 388-ID canonical identity manifest;
- the 134-row conditional inventory/review evidence;
- legacy crosswalk decisions;
- per-event semantic verification records;
- migration/save and retirement gates.

Do not change the old test to green by weakening assertions. Replace its obsolete conditional assumption with the stricter canonical audit.

## Runtime certification status

**Planning semantic review: 134/134.**  
**Runtime `canonical_verified_full`: not established by this review.**

No runtime event should be promoted merely because its row was reviewed. Promotion requires executable evidence for identity, condition, scene, choices, outcomes, function, causal memory, migration/save and relevant state-machine invariants.

## Required implementation sequence remains

1. Principal dependency chain and active PRs.
2. 05A runtime auditor/foundation.
3. 05B 20–23 runtime reconciliation.
4. 05C 26–30 runtime reconciliation.
5. 05D 30–34 runtime reconciliation.
6. Principal retirement FSM / 04D.
7. 05E 34+ runtime reconciliation.
8. 04E epilogue + terminal/final 388-event QA.

No semantic-planning completion changes a DRAFT runtime batch into READY automatically.

## Status

**CONDITIONAL_PLANNING_REVIEW_134_OF_134_COMPLETE / RUNTIME_RECONCILIATION_PENDING**