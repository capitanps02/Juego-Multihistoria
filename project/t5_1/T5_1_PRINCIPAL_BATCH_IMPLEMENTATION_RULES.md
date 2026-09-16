# T5.1 — Common implementation rules for principal batches 02C–04D

Generated: 2026-09-16

## Canonical source hierarchy

1. **Documento Maestro / extracted canonical evidence** in `analysis/2026-09-11/t1/principal-traceability.json` is the semantic source for each principal scene.
2. `project/t5_1/T5_1_PRINCIPAL_87_BATCH_MANIFEST.json` assigns the 87 baseline unresolved principal IDs to exactly one batch.
3. `project/t5_1/T5_1_COMPLETION_GATE.md` defines the acceptance gates.
4. Runtime source authority is `src/`; never hand-edit `dist/`.

For every target ID, read the canonical row in `principal-traceability.json`, including at minimum:
- `Ventana / disparador`;
- `Información que ve el jugador`;
- `Información imperfecta`;
- `Estado oculto relevante` when representable;
- `Opciones jugables`;
- `Resolución interna`;
- `Memoria / semillas`;
- the scene excerpt/title and phase.

Do not implement from the title alone.

## Identity rules

- A matching title is only a review candidate, never proof of identity.
- A legacy/runtime ID may be renamed to a canonical ID only after same-scene semantic identity is demonstrated.
- If a legacy scene is merely related, retire/retain it according to an explicit disposition instead of rewriting history as canonical.
- No silent aliases.
- Every target canonical ID must exist exactly once in active principal content when its batch is complete.
- Do not create duplicate canonical IDs while retaining the technical predecessor in the active canonical catalog.

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

- Do not rewrite an old technical history ID to a canonical ID unless the exact same scene contract is proven.
- Never manufacture `SEEN_<canonicalId>` from thematic similarity.
- `pendingEventId` requires stricter treatment than history: direct ID rewrite is allowed only for a proved same-scene mapping.
- Otherwise preserve/resolve the pending legacy decision through compatibility logic or fail explicitly; never replace it silently with a different choice set.
- Do not weaken `contentIdentity`.
- Preserve command idempotency, revision checks, receipts and pending-decision integrity.

## RNG / presentation rules

- Narrative, football, microfeed and QA RNG streams remain separate.
- Reads/UI/presentation must consume no RNG.
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

Add targeted tests for the batch's canonical scenes, save/resume boundaries and long-range seed chains.

Do not use `qa:1000` for every batch; reserve the expensive acceptance run for explicit diagnostic/final-gate work.

## Definition of batch done

A principal batch is ready for ChatGPT review only when:
1. every ID assigned to that batch exists exactly once;
2. canonical semantic evidence has been applied field-by-field;
3. technical predecessors have explicit dispositions;
4. save/pending/history compatibility is truthful;
5. affected seed chronology is tested;
6. required commands and targeted tests pass from the branch;
7. no unrelated batch/runtime content is changed.

No merge occurs without Pedro's explicit `fusiona` instruction.
