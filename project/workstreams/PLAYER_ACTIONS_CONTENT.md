# PLAYER ACTIONS CONTENT — A5

**Estado:** PARTIAL / BLOCKED BY UPSTREAM CONTRACTS  
**Repositorio:** `capitanps02/Juego-Multihistoria`  
**Branch:** `a5/player-actions-content`  
**BASE_SHA:** `75be938bbe4a6f7a01ef45a5078a6bfa6d77262d` (A3 certified HEAD)  
**main observado al iniciar:** `2cc068cb705214ba827677ab02d8d1668e8677ec`  
**Fecha:** 2026-09-27

---

## 1. Objetivo y estado

A5 convierte la arquitectura A0–A4 en un catálogo jugable de Player Actions sin violar autoridad, RNG ni ZERO_ACTION_EQUIVALENCE.

La primera pasada diseñó 20 acciones. Tras la certificación de A3, A5 se restackeó sobre el HEAD A3 y ha implementado el primer slice productivo que el contrato actual permite de forma segura.

### Runtime implementado

1. `PA_TRAIN_EXTRA`
2. `PA_REST`
3. `PA_COACH_TALK`
4. `PA_REQUEST_TRANSFER`
5. `PA_REQUEST_RENEWAL`
6. `PA_AGENT_MARKET`

Las tres últimas consumen exclusivamente effect/fact handlers certificados por A3.

No se añaden handlers ficticios ni paths arbitrarios.

---

## 2. Dependencias inspeccionadas

### A0

Arquitectura confirmada:

- ZERO_ACTION_EQUIVALENCE;
- Player Action != EventDefinition;
- sin RNG narrativo;
- facts causales separados de seeds;
- GameSession como frontera transaccional;
- store lazy;
- cooldowns deterministas.

### A1

El core sigue limitando A5:

- categorías: `career | training | representative | relationships | image | life`;
- falta `health`;
- eligibility sólo soporta `active_career`;
- effect registry cerrado;
- target kind genérico sin predicates de edad/rol;
- sin shared cooldown global+target.

### A2

Contrato transaccional operativo:

- comando `player_action`;
- revision/receipt/replay;
- rollback;
- persistencia lazy;
- `PlayerView.actions`;
- `auto:stop`.

El antiguo blocker público de targets **PA-A6-001 / BLOCKED_BY_A2_PUBLIC_VIEW** tiene implementación en PR #806 y A4 #804:

- targets authority-backed;
- availability/cooldown por target;
- targetId exacto;
- historial público saneado;
- stale target fail-closed;
- UI sin inferir autoridad desde contacts/GameState.

A5 ya no considera A2 un blocker de diseño/contenido. Su integración final sigue perteneciendo a A6.

### A3

HEAD base de A5:

`75be938bbe4a6f7a01ef45a5078a6bfa6d77262d`

Facts/effects certificados:

- `request_more_minutes`;
- `request_coach_feedback`;
- `coach_role_acknowledged`;
- `request_transfer`;
- `request_renewal`;
- `ask_agent_market`.

A3 garantiza que:

- request transfer != CareerOffer;
- request renewal != CareerTerms;
- ask market != offer;
- request more minutes != role/minutes;
- no seeds;
- no nuevo RNG.

### A4

Presupuestos públicos de copy:

- categoría: recomendado <=20 chars;
- acción: <=42 chars;
- descripción: 70–140 chars, evitar >180;
- opción: <=48 chars;
- resultado: <=140 chars;
- 1–4 opciones ideal, máximo 5.

El slice A5 implementado respeta estos límites.

---

## 3. Invariante ZERO_ACTION_EQUIVALENCE

Añadir acciones al catálogo no ejecuta acciones.

A5 no introduce:

- ticks;
- pasivos;
- decay;
- reminders obligatorios;
- action points;
- bonus por gastar acciones;
- housekeeping automático.

La lectura del catálogo y PlayerView debe permanecer pura.

---

## 4. Catálogo V1 diseñado — 20 acciones

Distribución final diseñada:

- Carrera: 5
- Entrenamiento: 2
- Salud: 2
- Representante: 3
- Relaciones: 4
- Imagen: 2
- Vida: 2

Clasificación:

- CORE: 9
- CONTEXTUAL: 8
- LATE_CAREER: 2
- OPTIONAL_FLAVOR: 1

---

## 5. Matriz de disponibilidad

| Action ID | Estado runtime | Class | Category final | Edad | Contexto requerido | Bloqueado por | Cooldown | Efecto directo / intent | Target |
|---|---|---|---|---|---|---|---:|---|---|
| PA_COACH_TALK | IMPLEMENTED | CORE | career | 18+ | coach + empleo activo | A1 employment eligibility | 31d | feedback / more minutes / accept role facts | coach |
| PA_ROLE_CHECK | BLOCKED | CORE | career | 18+ | coach actual | A1 informational handler + coach eligibility | 21d | informational role query, no roleScore write | coach |
| PA_POSITION_CHANGE | BLOCKED | CONTEXTUAL | career | 18+ | coach actual | A1 eligibility + A3 intent | 45d | REQUEST_POSITION_CHANGE | coach |
| PA_REQUEST_TRANSFER | IMPLEMENTED | CORE | career | 18+ | empleo actual | A1 employment eligibility | 121d | request_transfer | none |
| PA_WITHDRAW_TRANSFER | BLOCKED | CONTEXTUAL | career | 18+ | request activo | A3 lifecycle | 14d | WITHDRAW_TRANSFER_REQUEST | none |
| PA_TRAIN_EXTRA | IMPLEMENTED | CORE | training | 18+ | carrera activa | falta variantes A1 | 35d | technique +0.5, fatigue +3 | none |
| PA_VIDEO_STUDY | BLOCKED | CONTEXTUAL | training | 18+ | carrera activa | A1 effect registry | 14d | tacticalReading pequeño | none |
| PA_RECOVERY_SESSION | BLOCKED | CORE | health | 18+ | riesgo físico elevado | A1 health/risk eligibility/recovery handler | 14d | fatigue/fitness/risk pequeño | none |
| PA_REST | IMPLEMENTED COMPAT | CORE | health final / life actual | 18+ | carrera activa | A1 health category | 21d | fatigue -5, fitness +2 | none |
| PA_AGENT_MARKET | IMPLEMENTED | CORE | representative | 18+ | representante certificado | none | 31d | ask_agent_market | agent |
| PA_REQUEST_RENEWAL | IMPLEMENTED | CORE | representative | 18+ | empleo + ventana renovación | A1 employment/contract eligibility | 91d | request_renewal | none |
| PA_DISCUSS_FUTURE | BLOCKED | CONTEXTUAL | representative | 20+ | representante | A3 CAREER_PRIORITY | 21d | preference fact | agent |
| PA_TALK_TEAMMATE | BLOCKED | CONTEXTUAL | relationships | 18+ | teammate válido | A1 relationship handler + shared cooldown | 10d | affinity/respect pequeño | teammate |
| PA_CLEAR_AIR | BLOCKED | CONTEXTUAL | relationships | 18+ | tensión visible | A1 eligibility/effect | 21d | resentment/trust pequeño | teammate |
| PA_LEADER_ADVICE | BLOCKED | CONTEXTUAL | relationships | 18–23 | líder de vestuario actual | A1 content target-profile + relationship handler | 21d | relation local | teammate |
| PA_MENTOR_TEAMMATE | BLOCKED | LATE_CAREER | relationships | 30+ | compañero actual | A1 age eligibility + relationship handler | 21d | relation local | teammate |
| PA_INTERVIEW | BLOCKED | CORE | image | 18+ | carrera activa | A1 effect registry | 28d | image/polarization pequeño | none |
| PA_SOCIAL_POST | BLOCKED | OPTIONAL_FLAVOR | image | 18+ | carrera activa | A1 informational handler | 21d | sin stat reward | none |
| PA_PERSONAL_TIME | BLOCKED | CONTEXTUAL | life | 18+ | fatiga significativa | A1 life handler + fatigue eligibility | 30d | fatigue/motivation muy pequeño | none |
| PA_DISCONNECT | BLOCKED | LATE_CAREER | life | 28+ | fatiga alta | A1 age/fatigue eligibility + life handler | 45d | fatigue/motivation pequeño | none |

### Decisión de redundancia

`Pedir más minutos` permanece como opción de `PA_COACH_TALK` para no duplicar semántica ni cooldown. El hueco de quinta acción de Carrera se reserva a `PA_ROLE_CHECK`, una consulta informativa que nunca debe escribir `roleScore`.

---

## 6. Acciones implementadas

### PA_TRAIN_EXTRA

- categoría actual: training;
- cooldown: 35d;
- effectKey: `train_extra`;
- directo:
  - technique +0.5;
  - fatigue +3;
- fact: `training_extra_completed`;
- sin RNG.

Nota de balance: A6 demostró que el cooldown anterior de 10d con +0.5 era demasiado alto. A5 lo limita ahora a 35d; aun así recomienda reducir el handler a +0.10…+0.20 cuando A1 transfiera/extienda el registry y permita eligibility contextual.

### PA_REST

- categoría actual compatible: life;
- categoría final deseada: health;
- cooldown A5: 21d;
- effectKey: `rest`;
- fatigue -5;
- fitness +2;
- no cura lesiones.

El gain +2 fitness semanal requiere stress A6; puede ser demasiado fuerte.

### PA_COACH_TALK

- targetKind: coach;
- cooldown: 31d por target;
- opciones:
  - Quiero más minutos;
  - ¿Qué debo mejorar?;
  - Acepto mi rol.
- no cambia roleScore;
- no promete titularidad.

Runtime válido; target público resuelto upstream por #806/#804, pendiente sólo de integración final A6.

### PA_REQUEST_TRANSFER

- cooldown: 121d;
- effectKey: `request_transfer`;
- fact dura hasta 120d según A3;
- no crea oferta;
- no cambia club;
- A3 puede elevar threshold de un productor de mercado existente usando el mismo RNG.

Balance sensible: A6 debe medir si threshold 38→50 convierte la acción en dominante.

### PA_REQUEST_RENEWAL

- cooldown: 91d;
- effectKey: `request_renewal`;
- no cambia términos;
- no crea oferta;
- A3 resuelve relevancia tras una renovación formal aceptada.

Contrato final A5: disponible sólo con empleo activo y contrato entre 1 y 24 meses; falta soporte A1.

### PA_AGENT_MARKET

- targetKind: agent;
- cooldown: 31d por target;
- effectKey: `ask_agent_market`;
- no crea interés ni oferta;
- requiere representante certificado.

Runtime válido; target público resuelto upstream por #806/#804.

---

## 7. Cooldowns

Rango individual diseñado V1: 10–121 días.

Slice actual tras anti-grind A6:

- training: 35d;
- rest: 21d;
- coach: 31d;
- agent market: 31d;
- renewal: 91d;
- transfer: 121d.

No hay cooldown 0.

---

## 8. Diferencias por edad

Diseño final:

### 18–23

Prioridad:

- entrenador;
- minutos;
- entrenamiento;
- consejo de líder de vestuario;
- agente;
- adaptación.

### 23–30

Prioridad:

- mercado;
- renovación;
- future priorities;
- imagen;
- relaciones;
- recuperación.

### 30–34

Prioridad:

- recuperación;
- adaptación de rol;
- mentoría;
- renovación;
- gestión de minutos.

### 34+

Prioridad:

- recuperación;
- aceptar rol;
- mentoría;
- último tramo contractual;
- futuro;
- desconexión.

**Runtime actual:** no puede aplicar age windows por acción porque A1 todavía no expone ese contrato. A5 ya valida la matriz de edades como configuración; la enforcement runtime sigue bloqueada en A1.

---

## 9. Targets

Runtime actual:

- coach: PA_COACH_TALK;
- agent: PA_AGENT_MARKET.

A2/#806 + A4/#804 ya resuelven proyección pública authority-backed y exact targetId.

Diseño V1 teammate:

- PA_TALK_TEAMMATE → current teammate;
- PA_CLEAR_AIR → current teammate + visible tension;
- PA_LEADER_ADVICE → current teammate + profile público locker_leader;
- PA_MENTOR_TEAMMATE → current teammate, jugador de 30+.

A5 no infiere edades de NPC inexistentes ni usa agenda/knowledge privada.

Profile público A5:

- locker_leader:
  - NPC_PLR_10;
  - NPC_PLR_11.

La pertenencia al profile nunca basta por sí sola: A1 debe seguir verificando que el NPC esté activo y sea compañero actual.

---

## 10. Availability/execution mismatch pendiente de A1

El slice actual todavía tiene un gap de contexto reproducible:

- `PA_COACH_TALK`;
- `PA_REQUEST_TRANSFER`;
- `PA_REQUEST_RENEWAL`.

Todos usan hoy `eligibilityKey = active_career`, que sólo comprueba que la carrera no esté cerrada. En un estado `employment.status = unattached` pueden aparecer disponibles.

Sin embargo sus handlers causales requieren `currentEmploymentClub()`. Sin empleo activo, el effect falla cerrado y el executor devuelve `PLAYER_ACTION_EFFECT_FAILED` sin publicar mutación.

Esto conserva atomicidad, pero es UX incorrecta: una acción anunciada como disponible no debe fallar al pulsarla por un contexto que el engine ya podía conocer.

Owner: A1.

Contrato requerido:
- active-club-employment eligibility;
- renewal-window eligibility;
- coach target no debe usar un registrationClub histórico como autoridad viva estando unattached;
- stale employment entre render y dispatch debe seguir fallando cerrado.

A5-025 obliga a que esta deuda permanezca explícita en el plan hasta que A1 la cierre.

---

## 10. Balance / anti-grind

### Principio

Ninguna política óptima debe ser repetir siempre la misma acción.

### Riesgo T1 — training

Handler actual A1:

- +0.5 technique;
- +3 fatigue;
- cooldown A5 **35d**.

A6 demostró que el cooldown anterior de 10d permitía ~+18.5 technique/año. A5 lo endurece a 35d:

- máximo de 11 ejecuciones/año;
- máximo bruto +5.5 technique/año antes de clamps/world state.

**Conclusión:** el extremo demostrado por A6 queda acotado en configuración A5, pero el diseño preferido sigue siendo un handler más pequeño (+0.10…+0.20) y eligibility contextual desde A1.

REQUEST_TO_A1:
reducir handler de producción o permitir handler A5 con +0.10…+0.20 y tradeoff de risk/fatigue.

### Riesgo T2 — rest

A6 midió el cooldown anterior de 7d en 20 seeds:

- 53 acciones/año;
- fitness medio 99.91;
- fatigue media 0.275.

A5 cambia el cooldown a **21d**, con máximo teórico de 18 usos/año. El nuevo stress gate exige:

- rest average fitness <= 94;
- rest average fatigue >= 7;
- mixed average fitness <= 95;
- mixed average fatigue >= 5.

Stress requerido:

- REST cada cooldown;
- TRAIN/REST alternado;
- comparar lesión, fitness y rendimiento con zero-action.

### Riesgo T3 — transfer

La acción no crea oferta, pero A3 modifica un threshold de mercado existente de 38 a 50 durante relevancia del request.

Medir:

- número de ventanas con oferta;
- calidad media de ofertas;
- diferencias respecto a zero-action;
- si pedir salida se vuelve estrategia universal.

### Balance de REQUEST_TRANSFER

A5 añade un gate poblacional de 1000 seeds sobre la ventana de verano:

1. mismo estado factual y mismo seed;
2. rama neutral sin Player Action;
3. rama con PA_REQUEST_TRANSFER;
4. antes del productor autorizado, la acción debe dejar `market.pending = null`;
5. después actúa `materializeAge18MarketOfferInPlace`.

Criterios:
- la petición debe aumentar la tasa de transfer;
- la tasa con petición debe permanecer <65%;
- uplift mínimo 7 puntos porcentuales;
- uplift máximo 17 puntos porcentuales.

Esto captura el bonus A3 de +12 puntos sin aceptar que la acción garantice una oferta.

### Riesgo T4 — targets

`action_target` permite potencialmente farmear compañeros diferentes.

Requiere:

- shared/group cooldown;
- o gains relacionales mínimos;
- o eligibility contextual.

### Riesgo T5 — image

No implementar hasta tener clamps/cooldowns medidos; evitar `marketHeat`.

### Riesgo T6 — intent overlap

A3 define lifecycles causales:

- more minutes: 30d;
- transfer request: 120d;
- renewal request: 90d;
- agent market query: 30d.

A3 usa expiración inclusiva (`expiresAfter >= date`) y el cooldown deja de bloquear cuando `date >= cooldownUntil`. Por eso A5 usa **lifecycle + 1 día**:

- PA_COACH_TALK: 31d para un fact máximo de 30d;
- PA_REQUEST_TRANSFER: 121d para un fact de 120d;
- PA_REQUEST_RENEWAL: 91d para un fact de 90d;
- PA_AGENT_MARKET: 31d para un fact de 30d.

Así nunca existe un día en el que la intención anterior siga `currentlyRelevant` y la misma acción ya pueda volver a ejecutarse.

---

## 11. Authority

A5 no debe escribir:

- club;
- ownerClub;
- registrationClub;
- CareerTerms;
- market.pending/openOffers;
- selección;
- capitanía;
- lesión factual;
- retirada terminal;
- match result;
- seeds;
- state.history.

Las acciones A3 cableadas producen facts/intents, no resultados mundiales.

---

## 12. Copy

Slice implementado cumple A4:

- labels <=42;
- descriptions <=180;
- option labels <=48;
- publicResult <=140;
- <=5 opciones.

No expone:

- roleScore;
- marketHeat;
- coachTrust;
- thresholds;
- RNG;
- fact payloads;
- effect keys.

---

## 13. Tests

Archivo:

`scripts/test-player-actions-content.mjs`

Casos implementados en la suite (63):

1. A5-001 UNIQUE IDS
2. A5-002 VALID CATEGORIES
3. A5-003 OPTIONS
4. A5-004 VALID EFFECT PATHS / registry
5. A5-005 VALID INTENTS / A3 handlers
6. A5-006 COOLDOWN
7. A5-007 TARGET CONTRACT
8. A5-008 NO FORBIDDEN AUTHORITY
9. A5-009 NO NARRATIVE RNG
10. A5-010 AGE VALIDITY — valida la matriz tipada de diseño
11. A5-011 ZERO ACTION
12. A5-012 PLAYER VIEW
13. A5-013 COPY BUDGETS
14. A5-014 PLAN/RUNTIME CONTRACT GAPS — valida que health y blockers estén explícitos
15. A5-015 TRAINING FREQUENCY CEILING — <=11 usos/año
16. A5-016 REST FREQUENCY CEILING — <=18 usos/año
17. A5-017 INTENT COOLDOWN > INCLUSIVE FACT LIFECYCLE
18. A5-018 IMPLEMENTED PLAN/RUNTIME SYNC
19. A5-019 CONTENT PLAN DISTRIBUTION — 9/8/2/1 y categorías 5/2/2/3/4/2/2
20. A5-020 NO DUPLICATE RUNTIME SEMANTICS
21. A5-021 PUBLIC COPY DOES NOT LEAK INTERNALS
22. A5-022 TRANSFER REQUEST MARKET UPLIFT IS BOUNDED, NOT GUARANTEED — 1000 seeds
23. A5-023 MORE MINUTES REQUEST NEVER GRANTS SPORT OUTCOME DIRECTLY
24. A5-024 AGENT MARKET QUERY NEVER SYNTHESIZES OFFER
25. A5-025 INCLUSIVE FACT EXPIRY NEVER OVERLAPS RE-EXECUTION
26. A5-026 IMPLEMENTED CONTEXT GAPS ARE EXPLICIT
27. A5-027 CAUSAL FACT EXPIRES BEFORE ACTION REOPENS

npm:

`test:player-actions-content`

La suite se añade también a `npm test`.

`src/player-actions/content-plan.ts` codifica las 20 acciones finales, age ranges, clasificación, target, cooldown y blocker. La suite valida ese plan sin afirmar que el engine ya ejecute health/age gates.

Stress de balance:

`scripts/stress-player-actions-content.mjs`

- 20 seeds × 4 políticas × 365 días = 80 carreras;
- none / training-heavy / rest-heavy / mixed;
- Δ technique <= 6;
- rest fitness <= 94;
- rest fatigue >= 7;
- mixed fitness <= 95;
- mixed fatigue >= 5.

Workflow dedicado:

`.github/workflows/player-actions-content.yml`

No se marca PASS hasta obtener CI sobre este HEAD.

---

## 14. Exploits pendientes

A6 debe atacar:

- training every cooldown;
- rest every cooldown;
- train/rest alternating;
- request transfer every cooldown;
- transfer + market window;
- target farming por compañero;
- target stale después de render;
- agent switch después de render;
- coach switch después de render;
- repeated same-revision dispatch;
- save/load con cientos de actions;
- no-action baseline.

---

## 15. Pendientes V2

Fuera de V1:

- viviendas;
- coches;
- inversiones;
- pareja/hijos/divorcio;
- casino;
- negocios;
- agentes múltiples complejos;
- sponsors extensos;
- social-network minigame;
- retirada formal.

---

## 16. REQUEST_TO_A1

Para cerrar A5:

1. añadir `health`;
2. contract de age/context eligibility;
3. content effect registry extensible o ownership limitado;
4. optional closed teammate target-profile support para `locker_leader`;
5. shared/group cooldown;
6. handler de training/recovery balanceable a magnitud A5.

No añadir:

- setPath genérico;
- Effect[] narrativos;
- RNG;
- seeds.

---

## 17. A2 / A4 — resuelto upstream

PA-A6-001 tiene implementación en #806 + #804:

- PlayerView proyecta targets authority-backed;
- targetId público exacto;
- disponibilidad/cooldown por target;
- stale target/revision fail-closed;
- historial público saneado;
- UI no infiere autoridad desde GameState/contacts.

A5 no mantiene ningún blocker A2. Resta únicamente integración/certificación A6.

---

## 18. REQUEST_TO_A3

Ya cerrado:

- more minutes;
- feedback;
- accept role;
- transfer;
- renewal;
- market query.

Pendiente en V1:

- position change;
- withdraw transfer;
- career priority.

Leader advice y mentor teammate ya no requieren A3: quedan como efectos locales direct_only sin facts persistentes.

A3 documenta que withdraw-transfer no existe en V1 actual y request_transfer expira/cierra por cambio de club o 120d.

---

## 19. Handoff A6

### Acciones runtime actuales

- PA_TRAIN_EXTRA
- PA_REST
- PA_COACH_TALK
- PA_REQUEST_TRANSFER
- PA_REQUEST_RENEWAL
- PA_AGENT_MARKET

### Sensibles a balance

- PA_TRAIN_EXTRA — runtime legacy +0.5 sigue alto; final target A5 = +0.15 con contexto.
- PA_REST — frecuencia ya reducida a 21d; final target A5 = -2 fatigue/+0.25 fitness y fatigue>=24.
- PA_REQUEST_TRANSFER — consumer de threshold de mercado.
- PA_REQUEST_RENEWAL — contrato final A5 definido en 1–24 meses; implementación pendiente A1.
- PA_COACH_TALK / PA_AGENT_MARKET — target público resuelto; resta eligibility/core final e integración A6.

### Tests prioritarios

1. zero-action cross-version;
2. train spam;
3. rest spam;
4. train/rest alternating;
5. transfer market rate;
6. no synthetic offers/contracts;
7. stale targets;
8. save growth;
9. long-career determinism.

---

## 20. Estado

```text
[A5 STATUS]
Progreso: 99% owner-side
BASE_SHA: 75be938bbe4a6f7a01ef45a5078a6bfa6d77262d
HEAD actual: consultar PR #802
CATÁLOGO
- 6 acciones runtime implementadas
- 20 acciones V1 diseñadas
COMPLETADO
- análisis A0-A4/A6
- catálogo completo diseñado y codificado en content-plan.ts
- copy/opciones 20/20 codificadas en content-spec.ts
- balance objetivo 20/20 codificado en content-balance.ts
- eligibility objetivo 20/20 codificado en content-eligibility.ts
- shared cooldown families 20/20 codificadas en content-cooldown-groups.ts
- routing effect/fact 31/31 opciones codificado en content-effect-plan.ts
- target profile público locker_leader codificado en content-target-profiles.ts
- primer slice A3 cableado
- cooldowns A5 del slice
- authority review
- copy budgets
- distribución de contenido
- duplicate runtime semantics guard
- public-copy internal leak guard
- suite A5 creada
EN CURSO
- CI del slice
- coordinación A1/A3 + integración A6
RESTANTE
- upstream A1 runtime contract
- tres facts A3
- integración final de las 14 acciones bloqueadas
- exact-head balance/integration retest
BALANCE
- estado: PARTIAL
- training/rest: cooldown remediation implementada; handler/context tuning A1 sigue pendiente
- causal intent overlap eliminado por configuración
- 1000 seeds de mercado para REQUEST_TRANSFER
- autoridad de coach/agent validada en catálogo A5
TESTS
- 63 checks authored
- 0 TODO en la suite de diseño/contrato
- stress anual de 80 carreras añadido
- runtime health/age siguen bloqueados explícitamente
- PASS del nuevo balance pendiente del workflow exact-head
BLOQUEOS
- BLOCKED_BY_A1_CATALOG_CONTRACT
- BLOCKED_BY_A3_INTENT_CONTRACT sólo para acciones V1 opcionales aún no soportadas
Trabajo restante estimado:
- 14 acciones/runtime decisions
- 1 bloque de integración/retest A5 tras upstream
- ~2–3 horas-agente equivalentes de wiring/retest tras desbloqueo A1/A3
```


---

## Eligibility final V1

A5 codifica `src/player-actions/content-eligibility.ts` como contrato declarativo cerrado.

No contiene:
- callbacks;
- paths arbitrarios;
- código ejecutable suministrado por contenido.

Predicates previstos:
- active_career;
- active_club_employment;
- age_range;
- current_coach;
- current_representation;
- contract_months;
- live_transfer_request;
- fatigue_min / fatigue_max;
- risk_min / risk_max;
- current_teammate;
- teammate_profile locker_leader;
- visible_teammate_tension.

Casos importantes:
- PA_REQUEST_RENEWAL: empleo activo + contrato 1…24 meses;
- PA_REQUEST_TRANSFER: no puede existir ya una request live;
- PA_WITHDRAW_TRANSFER: requiere request live;
- PA_TRAIN_EXTRA: fatigue <=55 y risk <=40;
- PA_REST: fatigue >=24;
- PA_RECOVERY_SESSION: risk >=28;
- PA_LEADER_ADVICE: jugador 18–23 + current teammate + locker_leader;
- PA_MENTOR_TEAMMATE: jugador 30+ + cualquier current teammate.

## Shared cooldown final V1

`src/player-actions/content-cooldown-groups.ts` define familias de 7 días para impedir cycling:

- coach_conversation;
- agent_conversation;
- teammate_interaction;
- extra_development;
- physical_recovery;
- public_image;
- personal_wellbeing.

Transfer request/withdraw comparte `club_intent` a 14 días.

Los cooldowns familiares complementan, no sustituyen, el cooldown individual/action_target.


## Effect/fact routing final V1

`src/player-actions/content-effect-plan.ts` cubre las 31 opciones públicas V1.

Modos:
- fact_only;
- direct_only;
- direct_and_fact;
- informational.

Regla de autoridad:
- fact_only => cero direct deltas;
- direct_only => ningún fact persistente;
- direct_and_fact => deltas locales permitidos + fact acotado;
- informational => sin direct deltas ni fact causal.

Nuevos facts A3 realmente necesarios:
- request_position_change;
- withdraw_transfer_request;
- career_priority.

Se elimina la dependencia A3 para:
- leader advice;
- mentor teammate.

Ambas quedan como acciones direct_only con target teammate validado y efectos locales pequeños.


## Anti-checklist final V1

Objetivo: el jugador debe poder pulsar SIMULAR sin sentir que está dejando buffs gratuitos sobre la mesa.

Medidas A5:
- social post: informational/flavor, cero stat reward;
- leader advice / mentor teammate: sólo relación local, sin skill/locker global;
- personal time: cooldown 30d + fatigue>=20 + deltas <=0.5 fatigue / 0.25 motivation;
- disconnect: cooldown 45d + age>=28 + fatigue>=30 + deltas <=1 fatigue / 0.5 motivation;
- interview:
  - humble: institutionalTrust +0.25 / commercialPower -0.25;
  - ambitious: commercialPower +0.5 / publicPolarization +0.5;
  - team-first: institutionalTrust +0.5 / commercialPower -0.25;
- recovery y rest tienen nichos separados:
  - rest por fatiga;
  - recovery por riesgo.

A5-058 calcula techo anual bruto ignorando incluso eligibility/shared cooldown:
- skill metrics <=5 puntos/año;
- cualquier métrica professional positiva <=8 puntos/año.

A5-059 obliga a que Relationships no escriba progreso profesional global.


## Target profile safety

El modelo NPC actual no contiene `age`, `ageBand` ni `careerStage` para jugadores NPC.

Por tanto A5 prohíbe inferir:
- "young";
- "veteran";

desde:
- nombres;
- agenda privada;
- conocimiento privado;
- texto de cantera estático que envejece mal en carreras largas.

Solución V1:

`src/player-actions/content-target-profiles.ts`

Profile público cerrado:

`locker_leader = [NPC_PLR_10, NPC_PLR_11]`

Motivo factual/público:
- capitán;
- vicecapitán.

`PA_LEADER_ADVICE` exige además current teammate.
`PA_MENTOR_TEAMMATE` no usa profile: a partir de 30 años del protagonista puede orientar a cualquier compañero actual.

A5-061…063 impiden reintroducir age inference inexistente.
