# T5.1 — Common implementation rules for principal batches 02C–04D

Generated: 2026-09-16

## Canonical source hierarchy

1. **Documento Maestro / extracted canonical evidence** in `analysis/2026-09-11/t1/principal-traceability.json` is the semantic source for each principal scene.
2. `project/t5_1/T5_1_PRINCIPAL_87_BATCH_MANIFEST.json` assigns the 87 baseline unresolved **canonical** principal IDs to exactly one batch.
3. `project/t5_1/T5_1_PRINCIPAL_LEGACY_EXTRA_87_INVENTORY.json` assigns the 87 baseline runtime-only **legacy/technical** principal IDs to the batch responsible for their semantic disposition.
4. `project/t5_1/T5_1_COMPLETION_GATE.md` defines the acceptance gates.
5. Runtime source authority is `src/`; never hand-edit `dist/`.

For every target canonical ID, read the canonical row in `principal-traceability.json`, including at minimum:
- `Ventana / disparador`;
- `Información que ve el jugador`;
- `Información imperfecta`;
- `Estado oculto relevante` when representable;
- `Opciones jugables`;
- `Resolución interna`;
- `Memoria / semillas`;
- the scene excerpt/title and phase.

Do not implement from the title alone.

For every legacy/technical ID assigned to the same batch, explicitly compare it to the batch's canonical scenes and choose a reviewed disposition. The inventory itself approves no mapping.

## Two-sided batch responsibility

Each principal batch has two simultaneous obligations:

1. **Canonical side** — implement/certify every missing canonical ID assigned by `T5_1_PRINCIPAL_87_BATCH_MANIFEST.json`.
2. **Legacy side** — review/disposition every runtime-only technical ID assigned by `T5_1_PRINCIPAL_LEGACY_EXTRA_87_INVENTORY.json`.

A batch is incomplete if it adds the canonical IDs but leaves its assigned runtime-only IDs active/unreviewed.

Allowed disposition vocabulary follows the auditor specification:
- `same_scene_rewrite_and_id_migration`;
- `retire_technical_keep_history_only`;
- `retain_noncanonical_outside_canonical_set` only with explicit design approval and exclusion from canonical scheduling/counts;
- `no_mapping`;
- `unresolved` (blocks completion).

## Identity rules

- A matching title is only a review candidate, never proof of identity.
- A legacy/runtime ID may be renamed to a canonical ID only after same-scene semantic identity is demonstrated.
- If a legacy scene is merely related, retire/retain it according to an explicit disposition instead of rewriting history as canonical.
- No silent aliases.
- Every target canonical ID must exist exactly once in active principal content when its batch is complete.
- Do not create duplicate canonical IDs while retaining the technical predecessor in the active canonical catalog.
- Every assigned legacy runtime-only ID must end the batch with an explicit reviewed disposition.

Exact-title candidates currently called out by the baseline inventory still require full proof, including:
- `EVT_28_TEAM_001` → candidate `EVT_27_STAR_001`;
- `EVT_28_GALA_001` → candidate `EVT_27_AWARD_001`;
- `EVT_29_MKT_001` → candidate `EVT_28_RICH_001`;
- `EVT_30_IDN_001` → candidate `EVT_30_BRIDGE_001`;
- `EVT_36_RICH_001` → candidate `EVT_38_RICH_001`;
- `EVT_RET_HOME_001` → candidate `EVT_RET_FAM_001`;
- `EVT_RET_LAST_001` → candidate `EVT_RET_LASTMATCH_001`.

## Semantic rules

A target may be treated as canonically reconciled only when all applicable fields are reviewed:
- age/phase/time window;
- family;
- trigger/gates/exclusions;
- visible information;
- uncertain/imperfect information;
- player choice count, labels and distinct intent;
- outcome/resolution semantics, including ambiguity where canonical;
- seed reads;
- seed writes/transitions/origins;
- NPC references;
- downstream continuity;
- hard-deadline/transition responsibility.

Generic body text or generic four-choice templates are insufficient where the canonical row defines a specific dilemma.

Runtime `canonStatus: verified` is evidence to inspect, not proof of fidelity.

## Causal / seed rules

- Preserve canonical seed chronology: first canonical creator owns the origin.
- A later scene must not falsely create a seed that should already exist.
- Removing a false writer must not erase an already-active compatible seed from historical saves.
- Cross-age memories must survive save/resume.
- Do not change seed meaning simply to reuse an existing runtime field.

Long-range chains relevant to these batches include:
- record: 26 → 27 → 33;
- successor: 27 → 28 → 31/32;
- agent/parallel negotiation: 27 → 32 → 35;
- wealth/business: 27 → 31;
- documentary: 26 → 28;
- big-game bench: 26 → final → veteran rotation;
- dorsal succession: 30 → 34;
- travel/load: 30 → 34;
- age-33 priority → age-34 bridge.

## Save / migration truthfulness

Historical facts are append-only truth.

Read:
- `T5_1_SAVE_SESSION_MIGRATION_RUNTIME_AUDIT.md`;
- `T5_1_SESSION_CONTENT_MIGRATION_CONTRACT.json`;
- `T5_1_SESSION_V3_DESIGN_SPEC.md`;
- `T5_1_CONTENT_MIGRATION_DELIVERY_PLAN.md`.

Rules:
- Do not rewrite an old technical history ID to a canonical ID unless the exact same scene contract is proven.
- Never manufacture `SEEN_<canonicalId>` from thematic similarity.
- Pending interactive decisions are stricter than history: direct canonical substitution is allowed only for a proved same-scene mapping that preserves the already-presented decision contract.
- Otherwise preserve/resolve the pending legacy definition through compatibility logic or fail explicitly; never replace it silently with a different choice set.
- The current session snapshot stores the full pending `EventDefinition`; use that fact rather than rescheduling/reconstructing with RNG.
- Same string ID does not imply content compatibility after body/choice/outcome/seed changes.
- Do not weaken `contentIdentity`.
- Preserve command idempotency, revision checks, receipts and pending-decision integrity.
- Intermediate implementation branches may explicitly reject old session content with `CONTENT_CHANGED`; do not build migrations for every temporary branch identity.
- Final supported-release migration is delivered after the stable canonical catalog is complete, per the delivery plan.

For the first functional T5.1 event-catalog change, freeze the exact pre-T5.1 event catalog/identity first according to `T5_1_PREIMPLEMENTATION_CONTENT_FREEZE.md`.

## RNG / presentation rules

- Narrative, football, microfeed and QA RNG streams remain separate.
- Reads/UI/presentation must consume no RNG.
- Content migration itself consumes no RNG.
- Microfeed enable/disable must not change strong narrative outcomes.
- Presentation remains decoupled from narrative state/RNG.

## Retirement boundary

For 30+ principal work:
- discussion of retirement is not retirement;
- peer retirement, farewell marketing, lower-level offers, veteran roles and family conversations do not auto-decide retirement;
- do not close the career from a principal scene unless the canonical retirement task explicitly owns that transition;
- 04D owns final retirement FSM reconciliation.

## Required validation per implementation batch

Run current results on the task branch, not stale artifacts:

```bash
npm run build
npm run validate
npm run test:session
npm run test:saves
npm run audit:t51
npm run test:t51
```

Add targeted tests for the batch's canonical scenes, assigned legacy dispositions, save/resume boundaries and long-range seed chains.

Do not use `qa:1000` for every batch; reserve the expensive acceptance run for explicit diagnostic/final-gate work.

## Definition of batch done

A principal batch is ready for ChatGPT review only when:
1. every canonical ID assigned to that batch exists exactly once;
2. every legacy runtime-only ID assigned to that batch has an explicit reviewed disposition;
3. canonical semantic evidence has been applied field-by-field;
4. technical predecessors are no longer silently counted as canonical content;
5. save/pending/history compatibility is truthful or explicitly incompatible on that intermediate branch without weakened validation;
6. affected seed chronology is tested;
7. required commands and targeted tests pass from the branch;
8. no unrelated batch/runtime content is changed.

No merge occurs without Pedro's explicit `fusiona` instruction.
