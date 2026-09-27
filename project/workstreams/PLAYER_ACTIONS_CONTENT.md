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

Hallazgo A6/A4 pendiente de A2:

**PA-A6-001 / BLOCKED_BY_A2_PUBLIC_VIEW**

Las acciones target-required no reciben targets públicos ejecutables. Por ello coach/agent/teammate pueden existir en dominio pero quedar deshabilitados en UI.

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
| PA_COACH_TALK | IMPLEMENTED | CORE | career | 18+ | coach actual | target public A2 | 21d | feedback / more minutes / accept role facts | coach |
| PA_ROLE_CHECK | BLOCKED | CONTEXTUAL | career | 18+ | coach actual | A1/A3 role-query contract | 21d | informational role query, no roleScore write | coach |
| PA_POSITION_CHANGE | BLOCKED | CONTEXTUAL | career | 18+ | coach actual | A1 eligibility + A3 intent | 45d | REQUEST_POSITION_CHANGE | coach |
| PA_REQUEST_TRANSFER | IMPLEMENTED | CORE | career | 18+ | empleo actual | contextual eligibility aún genérica | 90d | request_transfer | none |
| PA_WITHDRAW_TRANSFER | BLOCKED | CONTEXTUAL | career | 18+ | request activo | A3 lifecycle | 14d | WITHDRAW_TRANSFER_REQUEST | none |
| PA_TRAIN_EXTRA | IMPLEMENTED | CORE | training | 18+ | carrera activa | falta variantes A1 | 35d | technique +0.5, fatigue +3 | none |
| PA_VIDEO_STUDY | BLOCKED | CONTEXTUAL | training | 18+ | carrera activa | A1 effect registry | 14d | tacticalReading pequeño | none |
| PA_RECOVERY_SESSION | BLOCKED | CORE | health | 18+ | carrera activa | A1 health/effect | 6d | fatigue/fitness/risk pequeño | none |
| PA_REST | IMPLEMENTED COMPAT | CORE | health final / life actual | 18+ | carrera activa | A1 health category | 21d | fatigue -5, fitness +2 | none |
| PA_AGENT_MARKET | IMPLEMENTED | CORE | representative | 18+ | representante certificado | target public A2 | 18d | ask_agent_market | agent |
| PA_REQUEST_RENEWAL | IMPLEMENTED | CORE | representative | 18+ | empleo actual | falta months eligibility | 60d | request_renewal | none |
| PA_DISCUSS_FUTURE | BLOCKED | CONTEXTUAL | representative | 20+ | representante | A3 CAREER_PRIORITY | 21d | preference fact | agent |
| PA_TALK_TEAMMATE | BLOCKED | CONTEXTUAL | relationships | 18+ | teammate válido | A1 effect + A2 target | 10d | affinity/respect pequeño | teammate |
| PA_CLEAR_AIR | BLOCKED | CONTEXTUAL | relationships | 18+ | tensión visible | A1 eligibility/effect | 21d | resentment/trust pequeño | teammate |
| PA_VETERAN_ADVICE | BLOCKED | CONTEXTUAL | relationships | 18–23 | veterano elegible | target predicate + A3 intent | 21d | tacticalReading + relation | teammate |
| PA_MENTOR_YOUNG | BLOCKED | LATE_CAREER | relationships | 30+ | joven elegible | target predicate + A3 intent | 21d | relation/leadership pequeño | teammate |
| PA_INTERVIEW | BLOCKED | CORE | image | 18+ | carrera activa | A1 effect registry | 28d | image/polarization pequeño | none |
| PA_SOCIAL_POST | BLOCKED | OPTIONAL_FLAVOR | image | 18+ | carrera activa | A1 effect registry | 21d | image pequeño | none |
| PA_PERSONAL_TIME | BLOCKED | CONTEXTUAL | life | 18+ | carrera activa | A1 effect registry | 7d | fatigue/motivation pequeño | none |
| PA_DISCONNECT | BLOCKED | LATE_CAREER | life | 28+ | carrera activa | A1 age/effect | 14d | fatigue/motivation pequeño | none |

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
- cooldown: 21d por target;
- opciones:
  - Quiero más minutos;
  - ¿Qué debo mejorar?;
  - Acepto mi rol.
- no cambia roleScore;
- no promete titularidad.

Runtime válido; flujo UI bloqueado hasta resolver targets públicos A2.

### PA_REQUEST_TRANSFER

- cooldown: 90d;
- effectKey: `request_transfer`;
- fact dura hasta 120d según A3;
- no crea oferta;
- no cambia club;
- A3 puede elevar threshold de un productor de mercado existente usando el mismo RNG.

Balance sensible: A6 debe medir si threshold 38→50 convierte la acción en dominante.

### PA_REQUEST_RENEWAL

- cooldown: 60d;
- effectKey: `request_renewal`;
- no cambia términos;
- no crea oferta;
- A3 resuelve relevancia tras una renovación formal aceptada.

Pendiente: esconder/bloquear cuando contrato tenga demasiados meses restantes.

### PA_AGENT_MARKET

- targetKind: agent;
- cooldown: 18d por target;
- effectKey: `ask_agent_market`;
- no crea interés ni oferta;
- requiere representante certificado.

Runtime válido; UI bloqueada por target projection.

---

## 7. Cooldowns

Rango diseñado V1: 6–90 días.

Slice actual tras anti-grind A6:

- training: 35d;
- rest: 21d;
- coach: 21d;
- agent market: 18d;
- renewal: 60d;
- transfer: 90d.

No hay cooldown 0.

---

## 8. Diferencias por edad

Diseño final:

### 18–23

Prioridad:

- entrenador;
- minutos;
- entrenamiento;
- veterano;
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

**Runtime actual:** no puede aplicar age windows por acción porque A1 todavía no expone ese contrato. A5-010 permanece TODO, no se falsea con checks ad-hoc fuera del engine.

---

## 9. Targets

Runtime actual:

- coach: PA_COACH_TALK;
- agent: PA_AGENT_MARKET.

Diseño futuro:

- teammate:
  - PA_TALK_TEAMMATE;
  - PA_CLEAR_AIR;
  - PA_VETERAN_ADVICE;
  - PA_MENTOR_YOUNG.

Bloqueos:

1. A2 debe proyectar targets autorizados públicamente.
2. A1 debe soportar predicates seguros para veteran/young.
3. A5 no inferirá NPCs desde contacts o estado privado.

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

### Riesgo T4 — targets

`action_target` permite potencialmente farmear compañeros diferentes.

Requiere:

- shared/group cooldown;
- o gains relacionales mínimos;
- o eligibility contextual.

### Riesgo T5 — image

No implementar hasta tener clamps/cooldowns medidos; evitar `marketHeat`.

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

Casos implementados en la suite (16):

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
4. target predicates veteran/young;
5. idealmente shared/group cooldown;
6. handler de training balanceable a magnitud A5.

No añadir:

- setPath genérico;
- Effect[] narrativos;
- RNG;
- seeds.

---

## 17. REQUEST_TO_A2 / A4

Resolver PA-A6-001:

- PlayerView debe proyectar targets autorizados;
- target debe incluir ID público suficiente para comando;
- UI selecciona target sin inferir secretos;
- stale target/revision falla cerrado;
- no exponer NPCs fuera de scope.

Sin esto:

- PA_COACH_TALK;
- PA_AGENT_MARKET;
- futuras relationships

no son jugables desde UI aunque el dominio sea correcto.

---

## 18. REQUEST_TO_A3

Ya cerrado:

- more minutes;
- feedback;
- accept role;
- transfer;
- renewal;
- market query.

Pendiente sólo si se mantienen en V1:

- position change;
- withdraw transfer;
- career priority;
- veteran advice;
- mentor young.

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

- PA_TRAIN_EXTRA — gain técnico actual alto.
- PA_REST — recuperación semanal potencialmente dominante.
- PA_REQUEST_TRANSFER — consumer de threshold de mercado.
- PA_REQUEST_RENEWAL — falta eligibility por meses.
- PA_COACH_TALK / PA_AGENT_MARKET — target public blocker.

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
Progreso: 68%
BASE_SHA: 75be938bbe4a6f7a01ef45a5078a6bfa6d77262d
HEAD actual: consultar PR #802
CATÁLOGO
- 6 acciones runtime implementadas
- 20 acciones V1 diseñadas
COMPLETADO
- análisis A0-A4/A6
- catálogo completo diseñado y codificado en content-plan.ts
- primer slice A3 cableado
- cooldowns A5 del slice
- authority review
- copy budgets
- suite A5 creada
EN CURSO
- CI del slice
- coordinación A1/A2
RESTANTE
- health
- age/context
- relationships
- image/life effects
- target public flow
- balance simulation
- full 20-action runtime
BALANCE
- estado: PARTIAL
- training/rest: cooldown remediation implementada; handler/context tuning A1 sigue pendiente
TESTS
- 16 checks authored
- 0 TODO en la suite de diseño/contrato
- stress anual de 80 carreras añadido
- runtime health/age siguen bloqueados explícitamente
- PASS del nuevo balance pendiente del workflow exact-head
BLOQUEOS
- BLOCKED_BY_A1_CATALOG_CONTRACT
- BLOCKED_BY_A2_PUBLIC_VIEW
- BLOCKED_BY_A3_INTENT_CONTRACT sólo para acciones V1 opcionales aún no soportadas
Trabajo restante estimado:
- 14 acciones/runtime decisions
- 5 bloques de balance/QA
- ~3–6 horas-agente equivalentes tras desbloqueo A1
```
