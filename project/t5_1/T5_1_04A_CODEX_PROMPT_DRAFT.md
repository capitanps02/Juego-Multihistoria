# DRAFT Codex task — T5.1 Batch 04A · canonical age 34

**Status: DRAFT — do not execute yet.**

## Dependencies

Execute only after Batch 03B is reviewed/integrated and the age-33 → age-34 bridge is stable.

Read and obey:
- `AGENTS.md`
- `project/CHATGPT_CODEX_WORKFLOW.md`
- `project/t5_1/T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md`
- `project/t5_1/T5_1_PRINCIPAL_87_BATCH_MANIFEST.json`
- `project/t5_1/T5_1_04D_RETIREMENT_RUNTIME_AUDIT.md`
- canonical rows in `analysis/2026-09-11/t1/principal-traceability.json`

## Goal

Reconcile the eleven baseline-unresolved canonical principal scenes at age 34:

1. `EVT_34_BRIDGE_001` — La reunión sin horizonte
2. `EVT_34_PAY_001` — La cifra que ya no te pagan
3. `EVT_34_NT_001` — Última ventana de selección
4. `EVT_34_AGT_001` — El agente dice que esperes
5. `EVT_34_LOAD_001` — El plan de 28 partidos
6. `EVT_34_DORSAL_001` — Tu dorsal en la tienda
7. `EVT_34_MENTOR_001` — El joven te pide tus vídeos
8. `EVT_34_MATCH_001` — Un gol que rompe el plan
9. `EVT_34_NT_002` — Te dejan fuera de una convocatoria
10. `EVT_34_FAN_001` — La grada pide que empieces
11. `EVT_34_TRAVEL_001` — El viaje que no haces

## Required work

For each target, implement from the complete canonical `sourceFields` rather than the generic late-career template currently used in `34_plus/principal-events.ts`.

- preserve canonical age/time/gates;
- implement concrete visible and uncertain information;
- preserve distinct player choices and outcome ambiguity;
- preserve seed/NPC responsibilities and later consumers;
- explicitly disposition technical predecessor scenes if their function overlaps.

## Bridge / priority responsibility

`EVT_34_BRIDGE_001` must consume the canonical age-33 priority/history. Do not regenerate or overwrite `SEED_AGE34_PRIORITY` merely to make the scene schedulable.

## Long-range causal obligations

- `EVT_34_DORSAL_001` must reflect actual dorsal/succession history from age 30 where applicable.
- `EVT_34_LOAD_001` / `EVT_34_TRAVEL_001` must consume the earlier travel/load chronology rather than generic fatigue alone where canonical.
- mentor/successor scenes must respect prior 27→28→31/32 succession state.
- selection scenes must distinguish voluntary withdrawal, fading standing and being left out.
- `EVT_34_MATCH_001` may create a late hero context but must not auto-retire the player.

## Retirement boundary

Age 34 begins late-career narrative but does not imply retirement.

These scenes may alter retirement distance/context only where canonically justified. They must not:
- jump `playing -> closed`;
- auto-decide retirement from low market/body/family pressure;
- announce retirement;
- expose epilogue;
- force a final match.

04D remains the owner of terminal state-machine repair.

## Expected runtime area

Primary:
- `src/content/events/34_plus/principal-events.ts`

Potentially:
- age-34 adapter/classifier
- `src/catalog/seeds.ts`
- late-career flags only where needed to expose canonical non-terminal contexts
- save/migration compatibility
- targeted tests/audit artifacts

Do not repair the automatic retirement engine in this batch beyond preventing a newly implemented scene from relying on a prohibited shortcut.

## Migration rules

- Generic age-34 technical rows are not same-scene mappings merely because family/month/theme overlaps.
- Keep old history truthful.
- Do not replace pending generic late-career choices with canonical choices unless exact semantic identity is proven.
- Preserve `contentIdentity` and session integrity.

## Tests

Add targeted coverage for:
- all 11 target IDs under canonical conditions;
- age-33 priority → `EVT_34_BRIDGE_001` across save/resume;
- dorsal 30 → dorsal 34;
- travel/load 32 → 34;
- successor/mentor continuity;
- selection inclusion/exclusion distinctions;
- late hero context without automatic retirement;
- no epilogue before `closed`;
- microfeed on/off strong narrative invariance.

Run the common required validation commands.

## Non-goals

- Do not implement age 35+ missing scenes.
- Do not implement conditional 05E.
- Do not finalize retirement FSM or epilogue.
- Do not merge.

## Deliverable

Canonical age-34 principal reconciliation with explicit technical dispositions, late-career causal continuity and current test evidence for ChatGPT review.
