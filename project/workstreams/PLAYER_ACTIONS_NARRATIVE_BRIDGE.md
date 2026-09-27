# PLAYER ACTIONS NARRATIVE BRIDGE — A3

**Repositorio:** `capitanps02/Juego-Multihistoria`  
**Main inspeccionado:** `2cc068cb705214ba827677ab02d8d1668e8677ec`  
**Upstream efectivo:** A2 PR #801, `84dc7c93545ecece2bc91e7e61f28c98f552dc3e`  
**Rama:** `a3/player-actions-narrative-bridge`  
**Dependencias:** A0 #799, A1 #800, A2 #801.

## 1. Facts añadidos

A3 conserva el contrato A1 `PlayerActionIntent = PlayerActionFact`; no existe un segundo store ni un segundo tipo de intención persistida.

Nuevos `PlayerActionFactKind`:

- `request_transfer`
- `request_renewal`
- `ask_agent_market`

El kind existente `request_more_minutes` se mantiene y ahora captura scope exacto.

La proyección read-only vive en:

`src/player-actions/facts.ts -> playerActionFacts(state)`

Shape público para consumidores internos:

- `requestedMoreMinutes`
- `requestedTransfer`
- `requestedRenewal`
- `askedAgentAboutMarket`
- `lastCoachConversation`

Cada request principal separa:

- `historicalExists`
- `currentlyRelevant`
- `count`
- `lastDate`
- `activeDate`

y añade el scope relevante.

## 2. Scopes

| Fact | Scope persistido | Validación live |
|---|---|---|
| `request_more_minutes` | `payload.club` + `payload.coachNpcId` + `targetId` | club empleado actual + `resolveCurrentCoach()` exactos |
| `request_transfer` | `payload.club` | club empleado actual exacto |
| `request_renewal` | `payload.club` + `payload.marketHistoryCount` | mismo club, empleo vigente y sin renovación formal aceptada desde el baseline |
| `ask_agent_market` | `payload.agentNpcId` + `targetId` | `resolveCurrentRepresentation()` exacta |

Si falta scope, la proyección conserva historia pero falla cerrada para `currentlyRelevant`.

No se infiere entrenador desde role score, agente desde flags, oferta desde marketHeat ni contrato desde reputación.

## 3. Lifecycle

### REQUEST MORE MINUTES

- productor: handler `coach_request_more_minutes`;
- duración temporal: 30 días;
- sigue histórico para siempre;
- deja de estar vigente por:
  - expiración;
  - cambio de club;
  - cambio/ausencia de entrenador certificado.

No crea una respuesta del entrenador.

### REQUEST TRANSFER

- productor: handler `request_transfer`;
- duración temporal: 120 días;
- scope: club actual;
- deja de estar vigente por:
  - expiración;
  - abandonar ese club.

No se borra el hecho original y no crea oferta.

### REQUEST RENEWAL

- productor: handler `request_renewal`;
- duración temporal: 90 días;
- captura `marketHistoryCount` al ejecutar;
- deja de estar vigente por:
  - expiración;
  - cambio/fin de empleo de club;
  - aceptación formal posterior de una renovación same-club en la autoridad `market.history`.

El baseline de history evita usar cambios de salario/meses como proxy de firma.

### ASK AGENT MARKET

- productor: handler `ask_agent_market`;
- duración temporal: 30 días;
- scope: representante certificado actual;
- deja de estar vigente por:
  - expiración;
  - cambio/fin de representación.

Consultar mercado no crea una oferta.

## 4. Historical persistence vs live relevance

Los facts persistidos no se borran ni se reescriben.

`playerActionFacts()` deriva vigencia en lectura:

1. fecha de expiración;
2. authority actual;
3. scope persistido;
4. resolución factual cuando existe.

No hay housekeeping en ticks. Leer 100 veces produce el mismo GameState.

## 5. Provenance

Se mantiene A1:

```ts
source: {
  kind: "player_action",
  executionId,
  actionId,
  optionId
}
```

No se inventa `originEvent`.

## 6. Seeds utilizados

**Ninguno.**

A0 fijó fact-first para V1. A3 no crea `SeedInstance`, no generaliza provenance de T5.2 y no toca `seed-memory.ts`.

Un futuro bridge a seed requerirá un cambio contractual independiente con consumidor semántico real y migración explícita.

## 7. Narrative consumer

`NarrativeCausalFacts` incorpora:

```
facts.playerActions.*
```

por medio de `narrativeConditionRoot()`.

Ejemplo válido:

```ts
{
  path: "facts.playerActions.requestedMoreMinutes.currentlyRelevant",
  op: "eq",
  value: true
}
```

`eventGatesPass()` y `choiceEligibility()` pueden consumirlo mediante el sistema declarativo existente.

No se crea un scheduler, resolver ni event history paralelo.

## 8. Systemic consumer

Primer consumidor: productor formal de mercado age-18 de verano.

La lógica existente ya hace:

```
producerRoll("age18:summer:kind") % 100 < threshold
```

A3 conserva la misma tirada y aplica:

- sin request vigente: threshold histórico = 38;
- con `request_transfer` vigente: threshold = 50.

Es un +12 pp sobre el **mismo roll determinista**.

La Player Action no llama a `proposeCareerChange()`. Sólo cuando el productor de mercado llega a su ventana canónica, éste decide y, si procede, crea la `CareerOffer`.

## 9. Authority matrix

| Player Action | Produce | NO produce | Authority consumer |
|---|---|---|---|
| Pedir minutos | intent/fact scoped | titularidad, minutos, roleScore | sport / coach / narrative |
| Pedir traspaso | intent/fact scoped | CareerOffer, cambio de club | market producers / offers |
| Pedir renovación | intent/fact scoped | salario, meses, cláusula, contrato | contract / offers / employment |
| Consultar mercado | fact scoped al agente | CareerOffer, market fact ficticio | representation / market |

Otras autoridades no cambian:

- selección: `national-team-authority`;
- capitanía: `player-leadership-authority`;
- lesiones: injury authority;
- empleo/terms: employment/offers;
- retirada: retirement authority/runtime.

## 10. NPC knowledge

A3 **no** escribe conocimiento NPC.

Una conversación con entrenador prueba que el jugador realizó una acción dirigida a ese target, pero no se copia a:

- otros NPC;
- prensa;
- `world`;
- relationships;
- knowledge global.

Si una fase futura necesita memoria NPC explícita, debe usar la autoridad NPC existente con recipients exactos y sin difusión implícita.

## 11. Privacy

- hablar con entrenador queda en PlayerActionFact;
- hablar con agente queda en PlayerActionFact;
- ninguna de las dos acciones crea notoriedad pública;
- no se crea press knowledge;
- no se crea market interest público;
- no se toca `reputation.mediaHeat` para señalar conversación privada.

## 12. RNG guarantees

- `playerActionFacts()`: 0 draws;
- `narrativeConditionRoot()`: 0 draws por Player Actions;
- bridge de mercado: 0 draws nuevos;
- se reutiliza exactamente el `producerRoll` ya existente;
- `rngState.narrative` no se modifica por leer facts.

ZERO_ACTION_EQUIVALENCE:

- si no existen Player Actions, la proyección es neutral;
- el threshold de mercado devuelve exactamente 38;
- no se materializa `state.playerActions`;
- no cambian gates, weights, eventos, seeds, outcomes, NPCs, contratos ni RNG.

## 13. Tests

`scripts/test-player-actions-narrative-bridge.mjs`:

1. A3-001 FACT PROJECTION PURE
2. A3-002 REQUEST MORE MINUTES
3. A3-003 CLUB SCOPE
4. A3-004 COACH SCOPE
5. A3-005 TRANSFER REQUEST
6. A3-006 RENEWAL REQUEST
7. A3-007 AGENT MARKET
8. A3-008 NARRATIVE CONSUMER
9. A3-009 SYSTEM CONSUMER
10. A3-010 NO EXTRA RNG
11. A3-011 ZERO ACTION
12. A3-012 HISTORICAL VS LIVE
13. A3-013 SAVE/LOAD
14. A3-014 PRIVATE KNOWLEDGE
15. A3-015 NO PROXY

Scripts npm:

- `test:player-actions-narrative-bridge`;
- `test:player-actions-a3-regression`;
- A3 está añadido al `npm test` general.

## 14. Risks / límites

1. A5 todavía debe añadir al catálogo de producción las acciones de traspaso, renovación y consulta de mercado. A3 sólo aporta handlers/contratos causales, conforme al ownership.
2. El primer consumer sistémico está deliberadamente limitado a la ventana age-18 summer. No se generaliza a todos los productores hasta auditarlos uno a uno.
3. No existe una respuesta formal genérica del entrenador; por ello `request_more_minutes` expira por scope/tiempo, no por una respuesta inventada.
4. No existe withdraw-transfer V1; el request se cierra por cambio de club o 120 días.
5. Los facts A1 históricos creados antes de capturar scope conservan valor histórico pero fallan cerrados como live.

## 15. HANDOFF A5 — CONTENT

A5 puede cablear estas acciones sin tocar autoridades:

### PA_REQUEST_MORE_MINUTES

- effect existente: `coach_request_more_minutes`;
- targetKind: `coach`;
- produce: `request_more_minutes`;
- payload: `{request:"more_minutes", club, coachNpcId}`;
- duración: 30 días;
- scope: club + entrenador + target exacto.

### PA_REQUEST_TRANSFER

- effectKey: `request_transfer`;
- targetKind: `none`;
- produce: `request_transfer`;
- payload: `{request:"transfer", club}`;
- duración: 120 días;
- scope: club actual.

### PA_REQUEST_RENEWAL

- effectKey: `request_renewal`;
- targetKind: `none`;
- produce: `request_renewal`;
- payload: `{request:"renewal", club, marketHistoryCount}`;
- duración: 90 días;
- scope: club/empleo actual.

### PA_ASK_AGENT_MARKET

- effectKey: `ask_agent_market`;
- targetKind: `agent`;
- produce: `ask_agent_market`;
- payload: `{request:"market_status", agentNpcId}`;
- duración: 30 días;
- scope: representación actual exacta.

### Acciones que deberían evitar intents

No crear causal intent para acciones cuyo significado termina en el propio efecto local y no necesita respuesta futura, por ejemplo:

- REST ordinario;
- entrenamiento local ya consumado;
- cambios puramente cosméticos;
- navegación/consulta UI sin actor del mundo;
- acciones sin consumidor semántico identificado.

No crear facts decorativos “por si acaso”.

## 16. HANDOFF A6 — QA

### Invariantes

- ZERO_ACTION_EQUIVALENCE.
- Facts read-only.
- Histórico != live.
- Missing scope => fail closed.
- 0 Player Action RNG draws.
- request != world response.
- private != public.
- no seed bridge V1.
- no authority duplication.

### Scopes a atacar

- cambio de club el mismo día;
- entrenador despedido sin replacement;
- entrenador replacement certificado;
- contrato expira con request de renovación vivo;
- renovación aceptada después del request;
- representación cambia después de ask-market;
- fact legacy sin payload de scope;
- fact con target que ya no existe.

### Consumers

- `eventGatesPass` / `choiceEligibility` deben leer `facts.playerActions`;
- age-18 summer market debe conservar threshold 38 sin intent;
- con intent vigente usa threshold 50 sobre el mismo producerRoll;
- intent directo nunca crea `CareerOffer`.

### Authority boundaries

Verificar que ninguna ejecución directa cambia:

- club;
- CareerTerms;
- pending/open offers;
- selección;
- capitanía;
- lesión;
- retirada;
- seeds;
- state.history;
- NPC knowledge.

### Escenarios adversariales

- marketHeat=100 sin CareerOffer;
- AGENT_ACTIVE flag sin representación certificada;
- COACH_FIRED sin replacement;
- request_transfer de club viejo después de fichaje;
- request_more_minutes con target de entrenador anterior;
- replay/save-load;
- 100+ lecturas de projection/root;
- same state + same facts => mismo output.

## 17. Estimación actualizada

Tras reutilizar A1/A2 y las autoridades existentes:

- inspección: completada;
- fact projection/scope: completados;
- consumers: completados;
- tests/regresión: pendiente de certificación CI;
- documentación: completada.

Trabajo restante de ingeniería tras este documento: certificación, correcciones si aparecen y cierre de PR.

La certificación debe ejecutarse sobre el HEAD final de A3; el PR puede retargetarse temporalmente a `main` sólo para activar los workflows cuya política de GitHub limita `pull_request.branches` a `main`.
