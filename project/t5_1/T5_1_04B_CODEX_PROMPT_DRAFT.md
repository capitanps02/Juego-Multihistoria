# DRAFT Codex task — T5.1 Batch 04B · canonical age 35

**Status: DRAFT — do not execute yet.**

## Dependencies

Execute only after Batch 04A is reviewed/integrated and age-34 causal memories are stable.

Read and obey:
- `AGENTS.md`
- `project/CHATGPT_CODEX_WORKFLOW.md`
- `project/t5_1/T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md`
- `project/t5_1/T5_1_PRINCIPAL_87_BATCH_MANIFEST.json`
- `project/t5_1/T5_1_04D_RETIREMENT_RUNTIME_AUDIT.md`
- canonical rows in `analysis/2026-09-11/t1/principal-traceability.json`

## Goal

Reconcile the ten baseline-unresolved canonical principal scenes at age 35:

1. `EVT_35_CON_001` — Contrato por objetivos físicos
2. `EVT_35_FAREWELL_001` — El club ofrece homenaje... si te vas
3. `EVT_35_DUAL_001` — Te ofrecen ser jugador y enlace
4. `EVT_35_AGT_001` — Sin agente por primera vez
5. `EVT_35_TACT_001` — El nuevo rol funciona demasiado bien
6. `EVT_35_BENCH_001` — Un mes sin jugar y sigues entrenando
7. `EVT_35_RECORD_001` — El canterano rompe tu récord
8. `EVT_35_NT_001` — Te llaman por una emergencia internacional
9. `EVT_35_JAN_001` — Una oferta en enero
10. `EVT_35_IMG_001` — Te ofrecen un último gran patrocinio

## Required work

Replace generic late-career approximations with the actual canonical dilemmas from the source rows.

For each target:
- implement ID exactly once;
- preserve canonical trigger/window and information asymmetry;
- preserve concrete choice intent and resolution semantics;
- reconcile seeds, relationships and NPC references;
- identify and disposition any existing technical scene that overlaps semantically.

## High-risk semantic distinctions

### Farewell offer
`EVT_35_FAREWELL_001` is an offer/context, not a retirement decision. Accepting or rejecting a tribute/farewell proposal must not itself set retirement terminal state unless the canonical source explicitly says so.

### Dual player/link role
`EVT_35_DUAL_001` must leave the career playable if the player chooses a continuing football role. Do not convert post-career preparation into retirement.

### Agent independence
`EVT_35_AGT_001` must preserve earlier agent/self-representation chronology and remain distinct from generic `agentControl` numeric drift.

### Tactical second peak
`EVT_35_TACT_001` should consume prior reinvention where canonical and may support a second-peak/late specialist arc without implying a final season.

### January offer
`EVT_35_JAN_001` must preserve Bosman/parallel-negotiation chronology where applicable and coexist correctly with the late-career market system.

### National emergency
Emergency recall is not equivalent to ordinary `nationalStanding` or permanent return to the national team.

## Retirement boundary

None of these scenes may automatically decide, announce or close retirement merely because the player is 35.

Specifically:
- farewell marketing ≠ retirement decision;
- reduced bench role ≠ retirement decision;
- agent departure ≠ retirement decision;
- sponsorship ≠ retirement decision;
- veteran contract/January move ≠ retirement decision.

Terminal FSM remains owned by 04D.

## Expected runtime area

Primary:
- `src/content/events/34_plus/principal-events.ts`

Potentially:
- late-career offer/contract support
- agent/self-representation state
- national-team state
- `src/catalog/seeds.ts`
- save/migration compatibility
- targeted T5.1 tests/audit artifacts

Do not broadly refactor late-career engine behavior here.

## Migration rules

- Do not rename generic age-35 rows into canonical IDs from title/theme alone.
- Pending legacy choices must remain resolvable truthfully.
- Historical technical scenes stay technical where identity differs.
- Do not weaken content identity or session validation.

## Tests

Add targeted coverage for:
- all ten target IDs;
- agent chronology into self-representation;
- Bosman/parallel negotiation → `EVT_35_JAN_001` across save/resume;
- tactical reinvention → second-peak scene;
- record succession history → `EVT_35_RECORD_001`;
- farewell/dual-role/sponsor choices do not terminally retire the player;
- emergency national recall semantics;
- microfeed on/off strong narrative invariance.

Run the common required validation commands.

## Non-goals

- Do not implement age 36–38 missing scenes.
- Do not implement 34+ conditional Batch 05E.
- Do not repair the final retirement FSM or epilogue.
- Do not merge.

## Deliverable

Canonical age-35 principal reconciliation with explicit technical dispositions, late-career continuity and current validation evidence for ChatGPT review.
