# DRAFT Codex task — T5.1 Batch 04C · canonical ages 36–38

**Status: DRAFT — do not execute yet.**

## Dependencies

Execute only after Batch 04B is reviewed/integrated and age-35 market/agent/tactical continuity is stable.

Read and obey:
- `AGENTS.md`
- `project/CHATGPT_CODEX_WORKFLOW.md`
- `project/t5_1/T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md`
- `project/t5_1/T5_1_PRINCIPAL_87_BATCH_MANIFEST.json`
- `project/t5_1/T5_1_04D_RETIREMENT_RUNTIME_AUDIT.md`
- canonical rows in `analysis/2026-09-11/t1/principal-traceability.json`

## Goal

Reconcile the ten baseline-unresolved canonical principal scenes across ages 36–38:

### Age 36
1. `EVT_36_BODY_001` — Ya no puedes jugar domingo-miércoles-domingo
2. `EVT_36_CCH_001` — Un entrenador más joven que tú
3. `EVT_36_RECORD_001` — El partido 700
4. `EVT_36_PEER_001` — El compañero se retira antes que tú
5. `EVT_36_LOWER_001` — Un año en una liga menor

### Age 37
6. `EVT_37_SHORT_001` — Contrato de tres meses
7. `EVT_37_HOME_001` — Valdoria te ofrece diez partidos
8. `EVT_37_PEN_001` — El penalti de despedida

### Age 38
9. `EVT_38_RICH_001` — Una última oferta enorme
10. `EVT_38_MARKET_001` — Nadie llama en julio

## Special identity warning

Baseline runtime contains `EVT_36_RICH_001` with the same title as canonical `EVT_38_RICH_001`.

Do **not** treat this as an approved age move/rename. Prove same-scene semantics from the complete canonical row, including age/window, trigger, decision, outcomes and downstream retirement responsibility. If it is not the same scene, preserve truthful legacy history and implement the age-38 canonical scene separately.

## Required work

For each target:
- implement the exact canonical scene from `sourceFields`;
- preserve concrete trigger, visible/uncertain information, decision and outcome intent;
- preserve seed/NPC responsibility;
- identify and explicitly disposition technical late-career rows that overlap.

## High-risk semantic distinctions

### Body/load
Age-36 body constraints can affect continuation pressure but must not auto-close retirement.

### Younger coach
Authority/role conflict is not equivalent to generic succession pressure.

### Peer retirement
A teammate retiring is context. It must never itself decide the protagonist's retirement.

### Lower league / short contract / home return / rich offer
Each is a playable career path. Accepting one must keep `retirement.status === playing` unless a separate canonical retirement choice later changes state.

### Farewell penalty
A ceremonial/farewell framing is not proof that the career has already been announced or closed. Preserve uncertainty unless canonical terminal state prerequisites are actually satisfied.

### No market
`EVT_38_MARKET_001` must expose canonical player agency. It must not be replaced by the current engine's automatic `no_market -> decided` shortcut.

## Retirement boundary

This is the final non-terminal principal batch before 04D.

Do not:
- auto-decide retirement from no market;
- auto-announce after a timer;
- auto-close after a timer;
- allow peer retirement, lower league, short contract, home route or rich offer to imply retirement;
- generate epilogue.

04D owns retirement-state transitions and 04E owns final epilogue/terminal QA.

## Expected runtime area

Primary:
- `src/content/events/34_plus/principal-events.ts`

Potentially:
- late-career offer/market support required to expose canonical choices
- `src/catalog/seeds.ts`
- save/migration compatibility
- targeted T5.1 tests/audit artifacts

Avoid broad FSM changes here; if a current automatic engine path prevents a canonical scene from being reachable, document the blocker for 04D rather than silently redesigning retirement in this batch.

## Migration rules

- No direct pending migration from `EVT_36_RICH_001` to `EVT_38_RICH_001` without full same-scene proof.
- Preserve old history when age/function differs.
- Generic late-career technical rows are not aliases merely because the title/theme resembles canon.
- Preserve content identity and session integrity.

## Tests

Add targeted coverage for:
- all ten target IDs;
- body/availability pressure without terminal auto-close;
- peer retirement without protagonist retirement;
- lower league, short contract, home offer and rich offer all leave career playable when chosen;
- age-38 no-market scene preserves explicit player agency;
- save/resume around late offers and no-market context;
- no epilogue before `closed`;
- deterministic strong narrative with microfeeds on/off.

Run the common required validation commands.

## Non-goals

- Do not reconcile `EVT_RET_*` principal IDs; 04D owns them.
- Do not implement conditional 05E.
- Do not finalize retirement FSM or epilogue.
- Do not merge.

## Deliverable

Canonical ages-36–38 principal reconciliation with explicit technical dispositions, preserved player agency and current validation evidence for ChatGPT review.
