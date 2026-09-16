# DRAFT Codex task — T5.1 Batch 03B · canonical ages 31–33

**Status: DRAFT — do not execute yet.**

## Dependencies

Execute only after Batch 03A is reviewed/integrated and the age-30 bridge/causal anchors are stable.

Read and obey:
- `AGENTS.md`
- `project/CHATGPT_CODEX_WORKFLOW.md`
- `project/t5_1/T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md`
- `project/t5_1/T5_1_PRINCIPAL_87_BATCH_MANIFEST.json`
- canonical rows in `analysis/2026-09-11/t1/principal-traceability.json`

## Goal

Reconcile the twelve baseline-unresolved canonical principal scenes across ages 31–33:

### Age 31
1. `EVT_31_FAM_001` — No quiero otra mudanza
2. `EVT_31_ROLE_001` — Tres goles y al banquillo
3. `EVT_31_SQUAD_001` — Dos fichajes de 22
4. `EVT_31_BIZ_001` — El problema es de tu socio

### Age 32
5. `EVT_32_RICH_001` — La oferta que paga el resto de tu vida
6. `EVT_32_ELITE_001` — Doceavo hombre de un candidato
7. `EVT_32_IMPACT_001` — Peores números, mejor equipo
8. `EVT_32_SUCCESSOR_001` — Tres semanas y aparece otro
9. `EVT_32_LOAD_001` — No viajes
10. `EVT_32_BOSMAN_001` — Enero: puedes firmar gratis

### Age 33
11. `EVT_33_RECORD_001` — El récord está a seis partidos
12. `EVT_33_FIN_001` — Cumples 34

## Required work

For every target:
- use the complete canonical `sourceFields` as the semantic contract;
- implement target ID exactly once;
- preserve canonical trigger, information asymmetry, decision and outcome semantics;
- reconcile seed/NPC responsibilities;
- identify technical predecessor/nearby runtime scene and give it an explicit disposition.

Do not use the existing generic maturity-row body/choice structure as the canonical scene when the source specifies a concrete dilemma.

## Long-range causal obligations

### Succession
The age-31/32 youth/successor scenes must consume prior successor/protected-player history from 27/28 where canonical. They must not create a second unrelated successor memory just because `SEED_SQUAD_YOUTH_WAVE` or `SEED_REPLACEMENT_BREAKOUT` exists.

### Wealth/business
`EVT_31_BIZ_001` must preserve the chain from earlier wealth/business structure and keep responsibility distinct from generic image/media reputation.

### Bosman/agent
`EVT_32_BOSMAN_001` must preserve the parallel-negotiation / agent-control chronology and remain testable into the age-35 January market path.

### Load/body
`EVT_32_LOAD_001` must create/read the canonical travel/load memory needed at age 34 without collapsing it into generic bodyLoad.

### Record/body
`EVT_33_RECORD_001` must consume the actual record chronology established at 26/27/30 and create the canonical record-vs-body tension if required.

### 33→34 hard deadline
`EVT_33_FIN_001` is a transition-critical scene. Preserve its canonical responsibility for the age-34 priority/bridge. It must not auto-retire the player.

## Retirement boundary

Existing runtime includes retirement-adjacent age-33 material. This batch must keep discussion/context separate from terminal state changes.

- Do not perform `playing -> decided`, `announced` or `closed` merely because age 33/34 is reached unless the canonical row explicitly owns a choice that is already assigned to 04D.
- Do not call `closeCareer` from this batch.
- `EVT_33_FIN_001` must bridge to age 34, not close the career.

## Expected runtime area

Primary:
- `src/content/events/30_34/principal-events.ts`

Potentially:
- maturity adapter/classifier
- `src/catalog/seeds.ts`
- offers/Bosman support where required by the canonical scene
- save/migration compatibility
- targeted T5.1 tests/audit artifacts

## Migration rules

- Do not turn related existing rows (`EVT_31_TEAM_001`, `EVT_32_MKT_001`, `EVT_32_CLB_001`, `EVT_32_TACT_001`, `EVT_32_TEAM_001`, `EVT_32_BODY_001`, `EVT_32_BOS_001`, `EVT_33_REC_001`, etc.) into canonical IDs without full same-scene proof.
- Pending choices must remain truthful.
- Preserve legacy history when scenes differ.
- Avoid duplicate semantic scenes after canonical insertion.

## Tests

Add targeted coverage for:
- all 12 target IDs;
- successor chain 27/28 → 31/32 across save/resume;
- wealth/business chain into `EVT_31_BIZ_001`;
- agent/parallel negotiation → Bosman → age-35 January fixture;
- travel/load 32 → age-34 consumer fixture;
- record chronology → `EVT_33_RECORD_001`;
- `EVT_33_FIN_001` → age-34 priority bridge across save/resume;
- no accidental retirement closure before 04D;
- microfeed on/off strong-narrative invariance.

Run the common required commands.

## Non-goals

- Do not implement age-34+ principal scenes.
- Do not implement 30–34 conditionals (05D).
- Do not repair final retirement FSM; 04D owns it.
- Do not merge.

## Deliverable

Canonical ages-31–33 reconciliation, explicit predecessor dispositions, longitudinal causal tests, save truthfulness and current validation evidence for ChatGPT review.
