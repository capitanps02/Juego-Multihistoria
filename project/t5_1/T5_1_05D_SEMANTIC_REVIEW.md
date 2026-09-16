# T5.1 Batch 05D — semantic review of conditional events ages 30–34

Generated: 2026-09-16  
Baseline reviewed: `chore/chatgpt-codex-workflow`

## Scope and evidence

This review resolves the 26 legacy/runtime conditional shells in `src/content/events/30_34/conditional-events.ts` against the 26 canonical 30–34 rows in `T5_1_CONDITIONAL_REVIEW_MATRIX.csv`.

Rules applied:
- identity proof requires condition + actual scene + function/memory, not title similarity;
- the runtime baseline uses one generic body and the same three generic choices for all 26 callbacks;
- therefore a thematic/design lineage candidate is **not** automatically a same-scene migration;
- `pendingEventId` may only change when the player would still be facing the same scene/decision;
- old `history.eventId` remains historical truth.

## Executive result

- Canonical callbacks reviewed: **26/26**.
- Legacy/runtime callbacks reviewed: **26/26**.
- Safe `same_scene_rewrite_and_id_migration` mappings: **0/26**.
- Legacy callbacks safe to rewrite in old history as canonical: **0/26**.
- Runtime shells with a plausible design-lineage canonical target: **19/26**.
- Runtime shells with ambiguous/no unique canonical target: **7/26**.
- Implementation conclusion: build the 26 canonical callbacks as semantically new canonical scenes; retire the technical 30–34 shells from the active canonical catalog only after save compatibility is explicit.
- Migration conclusion: preserve legacy history; for a save with a pending technical 30–34 callback, use legacy compatibility or explicit incompatibility rather than silently substituting canonical choices.

The decisive blocker for same-scene migration is not just ID drift. Every runtime row is generated through the same generic callback factory: generic body, generic uncertainty, and choices `Intervenir ahora / Aceptar el cambio de contexto / Ganar tiempo`. That does not preserve the canonical scene-specific decision.

## Row-by-row disposition

| Legacy/runtime ID | Canonical lineage candidate | Classification | Semantic decision |
|---|---|---|---|
| `CEVT_30_BODY_01` | — | `no_unique_target` | `PEAK_LOAD`/“deuda del pico” no prueba `BODY_RISK` alto + lesión plausible ni decisión de retirada por `CHRONIC_BODY`. |
| `CEVT_30_PROJECT_01` | `CEVT_30_OWNER_CHANGE` | `design_lineage_only` | `PROJECT_FACE` coincide con una precondición, pero falta el cambio de propietario y la escena estratégica; el callback genérico no es la misma escena. |
| `CEVT_30_HOME_01` | `CEVT_30_VALDORIA_CRISIS` | `design_lineage_only` | `HOME_INSTITUTION` coincide, pero “Valdoria pregunta sin oferta” no prueba crisis UDV ni el dilema apoyo/inversión/regreso. |
| `CEVT_30_NAT_01` | — | `ambiguous` | “La selección gana sin ti” + caps>=5 no distingue despedida, recall o récord nacional. |
| `CEVT_30_AGENT_01` | — | `no_unique_target` | Conflicto/comisión del agente no satisface `BRUNO_FAVOR + Bruno retirado` ni otra condición canónica 30–34. |
| `CEVT_30_RIVAL_01` | `CEVT_30_ADRIAN_AWARD` | `design_lineage_only` | Adrián apunta al espejo canónico, pero el runtime usa `PUBLIC_RIVALRY`, no `ADRIAN_MIRROR`, y no existe premio/título en la escena genérica. |
| `CEVT_30_FAN_01` | `CEVT_30_PUBLIC_BOOS_RETURN` | `design_lineage_only` | Tema de afición compatible, pero `publicMyth>=45` y nostalgia no equivalen a `FAN_FRACTURE + buen tramo` ni a reconciliación. |
| `CEVT_31_SURGERY_01` | `CEVT_30_MAJOR_INJURY` | `design_lineage_only` | `SURGERY_31` presupone una operación; el canon exige la lesión grave y la decisión cirugía/rehab/objetivo de regreso. Es aftermath, no misma escena. |
| `CEVT_31_SUCCESSOR_01` | `CEVT_30_SUCCESSOR_SOLD` | `design_lineage_only` | `YOUNG_SUCCESSOR` coincide con el sujeto, pero no hay oferta externa/venta; “ya no necesita permiso” describe presión de sucesión, no reversión por mercado. |
| `CEVT_31_COACH_01` | `CEVT_30_DISCARDED_REBIRTH` | `design_lineage_only` | Nuevo técnico/reset puede preceder descarte, pero faltan “prescindible”, mercado compatible y entrenador rival que propone mejor encaje. |
| `CEVT_31_NTLOAD_01` | `CEVT_30_RECORD_NATIONAL` | `design_lineage_only` | Una ventana internacional puede afectar caps, pero no hay proximidad a récord ni decisión récord vs recuperación vs transición. |
| `CEVT_31_FINAL_01` | `CEVT_30_SUPERSUB_HERO` | `design_lineage_only` | `MANAGED_FINAL_ROLE` y “ganar sin ser imprescindible” son rol gestionado; el canon exige entrar repetidamente desde banquillo y decidir partidos grandes. |
| `CEVT_31_BUSINESS_01` | — | `no_unique_target` | `WEALTH_STRUCTURE` + crisis reputacional no corresponde de forma única a sponsor exit ni a otro callback canónico del bloque. |
| `CEVT_31_RIVAS_01` | `CEVT_30_RIVAS_EXEC` | `design_lineage_only` | `RIVAS_TRUST` y “Rivas vuelve con poder real” identifican la línea de Rivas, pero no implementan la recomendación regreso/fichaje/salida ni su conflicto de incentivos. |
| `CEVT_32_RICH_01` | — | `no_unique_target` | Oferta mejorada de liga rica no tiene callback canónico 30–34 equivalente en la matriz. |
| `CEVT_32_REPLACE_01` | `CEVT_30_SUCCESSOR_SOLD` | `related_but_opposite` | Un sustituto en racha es presión competitiva; el canon trata la venta del sucesor y la recuperación de necesidad del veterano. |
| `CEVT_32_HOME_01` | `CEVT_30_HOME_EUROPE` | `design_lineage_only` | UDV/home route coincide temáticamente, pero brazalete/salario no equivale a regresar/seguir y alcanzar competición continental. |
| `CEVT_32_BOSMAN_01` | `CEVT_30_FREE_AGENT_SUMMER` | `design_lineage_only` | Bosman/precontrato filtrado comparte ciclo contractual, pero el canon exige llegar a julio sin club y valorar ofertas tardías. |
| `CEVT_32_NT_01` | — | `ambiguous` | Nombre al final de la lista no prueba farewell, recall ni cercanía a récord; faltan condiciones discriminantes. |
| `CEVT_32_FAN_01` | `CEVT_30_PUBLIC_BOOS_RETURN` | `design_lineage_only` | Silbidos al sustituto no equivalen a una afición antes fracturada que vuelve a corear al jugador tras un buen tramo. |
| `CEVT_33_RECOVERY_01` | `CEVT_30_EARLY_RETIRE_BODY` | `design_lineage_only` | `recoveryDebt` y dos partidos/72h señalan carga; el canon exige `CHRONIC_BODY` extremo, opciones reducidas y decisión voluntaria real sobre seguir. |
| `CEVT_33_RECORD_01` | `CEVT_30_RECORD_NATIONAL` | `ambiguous_lineage` | `RECORD_CHASE` prueba un récord genérico, no que sea de selección; descansar el día del récord no basta para identidad nacional. |
| `CEVT_33_RET_01` | `CEVT_30_EARLY_RETIRE_MOTIVATION` | `related_not_same` | Un titular que anuncia retirada por ti es presión mediática; el canon exige meses sano pero desconectado y decisión parar/año sabático/bajar nivel. |
| `CEVT_33_HOME_01` | `CEVT_30_HOME_EUROPE` | `design_lineage_only` | Una pancarta que pide volver establece `homePull`, no que se regrese/siga ni que UDV alcance Europa. |
| `CEVT_33_CONTRACT_01` | `CEVT_30_NOT_REGISTERED` | `design_lineage_only` | `CONTRACT_TRAP_30` conecta con contrato-trampa, pero salario que bloquea salida no equivale a quedar fuera de una lista de competición. |
| `CEVT_33_MARKET_01` | — | `no_unique_target` | Oferta que desaparece por otro fichaje no equivale a medical fail, discarded rebirth ni free-agent summer. |

## Crosswalk / migration decisions

For **all 26 legacy IDs**, the reviewed migration disposition is:

- `decision`: `retire_technical_keep_history_only`
- `same_scene_migration_allowed`: `false`
- `history_event_id_rewrite_allowed`: `false`
- `pending_event_id_direct_rewrite_allowed`: `false`
- `canonical_replacement_required`: `true`

Where the table names a canonical lineage candidate, that field is implementation evidence only: it tells the future Batch 05D author which canonical concept the old shell appears to have been gesturing toward. It is **not** approval to mutate a historical or pending legacy event into that canonical ID.

## Canonical gaps that must be implemented explicitly

Because the legacy shell set is not a faithful one-to-one representation, Batch 05D must create/reconcile all 26 canonical IDs from the canonical rows, including callbacks with no trustworthy runtime equivalent. In particular, do not assume existing generic shells cover:
- `CEVT_30_LATE_BALLON`
- `CEVT_30_RELEGATION_ICON`
- `CEVT_30_NT_FAREWELL`
- `CEVT_30_NT_RECALL`
- `CEVT_30_MEDICAL_FAIL`
- `CEVT_30_BRUNO_AGENT`
- `CEVT_30_MENA_RIVAL`
- `CEVT_30_SPONSOR_EXIT`
- `CEVT_30_TEAMMATE_SCANDAL`
- `CEVT_30_EARLY_RETIRE_BODY`
- `CEVT_30_EARLY_RETIRE_MOTIVATION`
- `CEVT_30_CHILDHOOD_COACH_LOSS`
- `CEVT_30_TACTICAL_SECOND_PEAK`
- `CEVT_30_HOME_EUROPE`

Several other canonical concepts have a recognizable legacy thematic shell, but their gates/scene/choices still require full rewrite.

## Batch 05D implementation contract

When implementation becomes unblocked:
1. use the 26 canonical IDs literally;
2. implement each canonical condition, scene-specific visible/uncertain information, choices, outcomes, function, seed reads/writes, NPC refs and transitions;
3. remove/retire the 26 technical IDs from the active canonical catalog without rewriting old history;
4. add a save strategy for pending technical callbacks before changing `contentIdentity`;
5. test eligibility/resolution before and after save/resume;
6. verify reads/UI do not consume RNG and microfeed toggles do not perturb strong narrative outcomes;
7. run `npm run build`, `npm run validate`, `npm run test:session`, `npm run test:saves`, `npm run audit:t51`, and `npm run test:t51`.

## Status

**SEMANTIC_REVIEW_COMPLETE / RUNTIME_IMPLEMENTATION_BLOCKED**

The semantic review itself is complete. Runtime Batch 05D remains DRAFT until the dependency chain recorded in `project/CODEX_QUEUE.md` is satisfied.
