# PLAYER ACTIONS CORE — A1

**Repositorio:** `capitanps02/Juego-Multihistoria`  
**BASE_SHA:** `68f58f1b116580082d05f352236bae63ddc53234`  
**Rama:** `a1/player-actions-core`  
**Contrato A0 leído desde:** `a0/player-actions-architecture:project/workstreams/PLAYER_ACTIONS_ARCHITECTURE.md`  
**Fecha:** 2026-09-26 CEST

## 1. Alcance

A1 implementa únicamente el núcleo técnico de Player Actions:

- definiciones estáticas;
- estado lazy;
- eligibility read-only;
- cooldowns por calendario;
- validación fail-closed de targets;
- ejecución determinista y atómica a nivel lógico;
- efectos directos allowlisted;
- PlayerActionFacts;
- historial propio;
- validación del store;
- fixtures mínimos y tests.

A1 no integra GameSession, saves, UI, PlayCanvas, seeds ni consumidores narrativos.

## 2. Contrato A0 y contradicciones resueltas

A0 existe y fue leído antes de escribir código. No contiene un encabezado literal `HANDOFF A1`; las secciones normativas 4–17 definen el handoff operativo y ownership.

Contradicciones del prompt A1 resueltas a favor de A0:

1. A0 fija `representative` y no `agent` como categoría.
2. A0 no incluye `health` como categoría V1; recuperación está modelada como una acción local sin crear una autoridad médica paralela.
3. A0 fija `effectKey` registrado por código en vez de listas de `Effect`/paths arbitrarios.
4. A0 selecciona PlayerActionFacts primero; no existe un store paralelo de intents. `PlayerActionIntent` se exporta como alias semántico de `PlayerActionFact`.

## 3. Archivos creados

- `src/player-actions/types.ts`
- `src/player-actions/catalog.ts`
- `src/player-actions/action-state.ts`
- `src/player-actions/eligibility.ts`
- `src/player-actions/effects.ts`
- `src/player-actions/executor.ts`
- `src/player-actions/validation.ts`
- `src/player-actions/index.ts`
- `scripts/test-player-actions-core.mjs`

Archivo modificado únicamente para ejecutar la suite en CI:

- `package.json`

No se modificaron:

- `src/core/types.ts`
- `src/session/game-session.ts`
- `src/session/validate-session.ts`
- `src/save/*`
- `src/narrative/*`
- `preview/*`
- `playcanvas/*`

## 4. Contratos implementados

`types.ts` exporta:

- `PlayerActionCategory`
- `PlayerActionTargetKind`
- `PlayerActionOption`
- `PlayerActionDefinition`
- `PlayerActionAvailability`
- `PlayerActionSource`
- `PlayerActionFact`
- `PlayerActionIntent` (alias fact-first)
- `PlayerActionHistoryEntry`
- `PlayerActionState`
- `PlayerActionRequest`
- `PlayerActionExecutionResult`
- `PlayerActionGameState`

`PlayerActionGameState` es una intersección local:

```ts
GameState & { playerActions?: PlayerActionState }
```

Esto permite a A1 no tocar `src/core/types.ts`, cuyo ownership es A2.

## 5. API pública

Entrada agregada recomendada:

```ts
import {
  listPlayerActions,
  getAvailablePlayerActions,
  playerActionAvailability,
  executePlayerActionInPlace,
  executePlayerAction,
  playerActionPublicResult,
  getPlayerActionFacts,
  assertPlayerActionState
} from "../player-actions/index.js";
```

Funciones principales:

### Lectura

`listPlayerActions(state, catalog?, targetByAction?)`

Devuelve disponibilidad calculada para todo el catálogo. No escribe estado.

`getAvailablePlayerActions(state, catalog?, targetByAction?)`

Filtra sólo acciones disponibles. No escribe estado.

`playerActionAvailability(state, actionId, targetId?, catalog?)`

Consulta una acción concreta; devuelve `null` si el id no existe.

`getPlayerActionFacts(state, { activeOnly?, kind? })`

Devuelve clones detached de facts. `activeOnly` aplica expiración lógica sin limpiar el store.

### Ejecución

`executePlayerActionInPlace(state, request, catalog?)`

Ejecuta sobre un draft clonado y sólo reemplaza el objeto recibido tras completar efectos + store + validación.

`executePlayerAction(state, request, catalog?)`

Variante pura que clona el estado del caller y devuelve `{ state, result }`.

`playerActionPublicResult(result)`

Devuelve un clone mínimo y seguro del resultado.

## 6. Request y result

Request:

```ts
{
  actionId: string;
  optionId: string;
  targetId?: string;
}
```

Success público:

```ts
{
  ok: true;
  actionId: string;
  optionId: string;
  executionId: string;
  visibleResult: string;
  cooldownUntil: string | null;
}
```

Errores posibles:

- `PLAYER_ACTION_UNKNOWN`
- `PLAYER_ACTION_OPTION_UNKNOWN`
- `PLAYER_ACTION_TARGET_REQUIRED`
- `PLAYER_ACTION_TARGET_UNEXPECTED`
- `PLAYER_ACTION_TARGET_INVALID`
- `PLAYER_ACTION_UNAVAILABLE`
- `PLAYER_ACTION_COOLDOWN`
- `PLAYER_ACTION_EFFECT_FORBIDDEN`
- `PLAYER_ACTION_EFFECT_FAILED`
- `PLAYER_ACTION_STATE_INVALID`

Los errores de validación no materializan `playerActions`.

## 7. Allowlist de efectos

No existe acceso desde contenido a `setPath`, `Effect` narrativo ni a paths arbitrarios.

Handlers registrados:

- `train_extra`
  - `body.fatigue` +3 con clamp 0..100
  - `professional.technique` +0.5 con clamp 0..100
- `rest`
  - `body.fatigue` -5 con clamp 0..100
  - `body.fitness` +2 con clamp 0..100
- `coach_request_more_minutes`
  - sin cambio de rol
  - escribe fact `request_more_minutes`
- `coach_request_feedback`
  - escribe fact `request_coach_feedback`
- `coach_acknowledge_role`
  - escribe fact `coach_role_acknowledged`

No hay handlers para:

- club / ownerClub / registrationClub;
- salario, meses, cláusula;
- market.pending/openOffers;
- nationalRole/caps;
- capitanía;
- injury episode / clearance;
- resultados;
- retirada;
- seeds.

Un `effectKey` que no está en el registry falla `PLAYER_ACTION_EFFECT_FORBIDDEN`.

## 8. Intents / facts

A0 selecciona facts como única primitive causal persistida.

Kinds V1 allowlisted:

- `training_extra_completed`
- `rest_completed`
- `request_more_minutes`
- `request_coach_feedback`
- `coach_role_acknowledged`

Cada fact contiene:

- `factId` determinista;
- `kind`;
- `createdDate`;
- `expiresAfter?`;
- `source.kind = "player_action"`;
- `executionId`;
- `actionId`;
- `optionId`;
- `targetId?`;
- `payload`.

No existe `originEvent`.

## 9. Cooldowns

Los cooldowns usan calendario persistido, nunca tiempo real.

Keys:

- `action:<actionId>`
- `action_target:<actionId>:<targetId>`

El valor es la primera fecha disponible de nuevo.

Regla:

```
available iff state.date >= cooldownUntil
```

Se usa UTC únicamente para sumar días a una fecha ISO ya existente. No se llama `Date.now()`.

## 10. Targets

Fail-closed:

- `none`: rechaza `targetId` inesperado;
- `coach`: exige el entrenador factual actual; usa `coach-change-authority` y fallback canónico UDV existente;
- `agent`: exige el representante certificado por `representation-authority`;
- `teammate`: exige NPC jugador activo y perteneciente al club actual.

No se inventan NPCs ni se sustituye silenciosamente un target por otro.

## 11. Historial

Store:

```ts
state.playerActions.history
```

Nunca:

```ts
state.history
```

La entrada contiene sólo:

- executionId;
- sequence;
- actionId;
- optionId;
- date;
- runtimeDay;
- targetId opcional;
- visibleResult;
- cooldownUntil.

No guarda snapshots de GameState.

## 12. Estado lazy

Shape:

```ts
{
  version: 1,
  sequence,
  history,
  cooldowns,
  facts
}
```

`readPlayerActionState()` devuelve una proyección vacía sin asignar nada.

`ensurePlayerActionStateInPlace()` sólo se usa dentro de una ejecución válida sobre draft.

Por tanto importar/listar/evaluar no crea el store.

## 13. Determinismo y RNG

A1 no importa `DeterministicRng`, scheduler, resolver ni world advance.

IDs:

```
PAE-00000001
PAE-00000001:F1
```

se derivan exclusivamente de `playerActions.sequence`.

No se lee ni escribe:

```ts
state.rngState.narrative
```

ni ningún otro stream.

## 14. Atomicidad

`executePlayerActionInPlace` no aplica efectos sobre el objeto confirmado.

Secuencia:

1. resolver definition;
2. resolver option;
3. validar target;
4. validar eligibility/cooldown;
5. validar `effectKey` allowlisted;
6. `structuredClone(state)`;
7. ejecutar handler sobre draft;
8. escribir facts/history/cooldown en draft;
9. validar `PlayerActionState`;
10. sustituir el contenido del objeto original sólo en éxito.

Cualquier fallo anterior al paso 10 deja el caller intacto.

## 15. Fixtures vertical slice

### PA_TRAIN_EXTRA

- categoría: `training`
- target: none
- cooldown técnico: 7 días
- opción: `TECHNIQUE`

### PA_REST

- categoría A0: `life`
- target: none
- cooldown técnico: 1 día
- opción: `RECOVER`

### PA_COACH_TALK

- categoría: `career`
- target: coach
- cooldown técnico: 14 días por action+target
- opciones:
  - `MORE_MINUTES`
  - `WHAT_TO_IMPROVE`
  - `COMFORTABLE_ROLE`

Los números son placeholders de arquitectura; A5 debe balancearlos.

## 16. Validación

`inspectPlayerActionState(value, currentDate?)` y `assertPlayerActionState(...)` comprueban:

- exactitud de campos top-level;
- version 1;
- sequence no negativo;
- `history.length === sequence`;
- sequence monotónico;
- executionIds únicos;
- ISO dates;
- ausencia de historia futura;
- cooldown dates válidas;
- fact kinds allowlisted;
- factIds únicos;
- payload DataValue;
- source consistente con historial;
- target de fact consistente con historial;
- expiración no anterior a creación.

A1 no conecta este validador con save boundaries: corresponde a A2.

## 17. ZERO_ACTION_EQUIVALENCE

Diseño preservado por construcción:

- no campo `playerActions` en initial state;
- no imports con side effects;
- lecturas puras;
- no tick/housekeeping;
- no RNG;
- no resolver;
- no world advance;
- no history narrativa;
- no seeds;
- no flags;
- no action points.

La prueba A1-002/A1-014 cubre ausencia de materialización local. PA-001 full runtime baseline sigue siendo responsabilidad A6/A2 porque requiere GameSession/persistencia.

## 18. Tests

Suite:

`scripts/test-player-actions-core.mjs`

Casos:

- A1-001 READ ONLY ELIGIBILITY
- A1-002 ZERO ACTION
- A1-003 EXECUTION
- A1-004 INVALID ACTION
- A1-005 INVALID OPTION
- A1-006 INVALID TARGET
- A1-007 COOLDOWN
- A1-008 COOLDOWN EXPIRY
- A1-009 NARRATIVE RNG
- A1-010 HISTORY SEPARATION
- A1-011 AUTHORITY GUARD
- A1-012 ATOMIC FAILURE
- A1-013 DETERMINISM
- A1-014 OPTIONALITY
- A0 PA-014 FACT EXPIRY READ

`package.json` añade:

- `test:player-actions-core`
- la suite al principio de `npm test`, de modo que el workflow `Repository integrity` la ejecuta en PR.

**Resultado final:** PASS en el HEAD de código `926bcd01329341ce9928e44930035ec87c094163` mediante `Repository integrity` run #2894.

- La suite A1 contiene 15 tests y `npm test` terminó PASS, por lo que los 15/15 casos A1 quedaron verdes.
- El mismo step ejecutó `npm run build` antes de la suite completa.
- `npm run test:playcanvas` terminó PASS; este script incluye `scripts/test-session.mjs`, `scripts/test-saves.mjs`, el regression conocido de retirement save, PlayCanvas y A19 UI.
- Los steps posteriores `Build T5 QA target`, `T5 authoritative sport model` y `T5 pre-content freeze sentinel` también terminaron PASS.
- Los QA largos restantes de Repository Integrity son gates generales del repositorio y no cambian el alcance A1; no había ningún fallo conocido al cerrar A1.

## 19. Limitaciones

- No hay integración GameSession.
- `GameState` todavía no declara `playerActions?`; A1 usa intersección local.
- No hay save validation integrada.
- No hay PlayerView/actions.
- No hay guard de superficie interactiva; A2 debe imponerlo.
- No hay `auto:stop`.
- No hay consumers narrativos.
- No hay seeds.
- Catálogo/balance son fixtures técnicos.
- No hay mutación relacional en coach talk.
- Facts de entrenamiento/descanso expiran lógicamente el mismo día y sólo sirven como evidencia local del vertical slice.

## 20. HANDOFF A2 — SESSION

### API a llamar

Preferida dentro del draft de SessionSnapshot:

```ts
const result = executePlayerActionInPlace(next.state, {
  actionId: command.actionId,
  optionId: command.optionId,
  targetId: command.targetId
});
```

Antes de llamar, A2 debe comprobar la superficie de sesión según A0.

### Request de SessionCommand

```ts
{
  type: "player_action";
  commandId: string;
  expectedRevision: number;
  actionId: string;
  optionId: string;
  targetId?: string;
}
```

### Result

`executePlayerActionInPlace` devuelve resultado público mínimo. A2 puede proyectarlo a `PlayerView.actions.lastResult`; no debe convertirlo en `pendingResult` narrativo.

### Estado persistido requerido

Añadir a `GameState`:

```ts
playerActions?: import("../player-actions/types.js").PlayerActionState;
```

Debe seguir opcional/lazy.

### Validación

En save/session boundaries, si existe `state.playerActions`:

```ts
assertPlayerActionState(state.playerActions, state.date);
```

### REQUEST_TO_A2

Archivos:

- `src/core/types.ts`
- `src/session/game-session.ts`
- `src/session/validate-session.ts`
- `src/save/validation.ts` y/o legacy según boundary real

Cambios mínimos:

1. campo opcional `GameState.playerActions?`;
2. variante `SessionCommand.player_action`;
3. fingerprint canónico `["player_action", expectedRevision, actionId, optionId, targetId ?? null]`;
4. guard: sin pending decision/result/offer, retirement no closed, auto mode idle;
5. ejecución sobre snapshot draft;
6. receipt/revision/commit normal;
7. validación del PlayerActionState;
8. PlayerView actions/result público;
9. ninguna modificación a igualdad journal/history narrativa.

## 21. HANDOFF A3 — NARRATIVE BRIDGE

### Estructura exacta

Leer:

```ts
state.playerActions?.facts ?? []
```

Cada fact tiene:

```ts
{
  factId,
  kind,
  createdDate,
  expiresAfter?,
  source: {
    kind: "player_action",
    executionId,
    actionId,
    optionId
  },
  targetId?,
  payload
}
```

### Cómo consultar

Usar:

```ts
getPlayerActionFacts(state, { activeOnly: true, kind: "request_more_minutes" })
```

o una proyección causal equivalente read-only.

### Históricos vs activos

Histórico: todo fact persistido en `facts`.

Activo en fecha D:

```
expiresAfter === undefined || expiresAfter >= D
```

No borrar facts en ticks.

### No asumir

- un request no es una decisión del entrenador;
- `request_more_minutes` no significa starter/minutos;
- hablar con agente no es oferta;
- request de renovación no es renovación;
- target no implica relación positiva;
- fact no es seed.

### Evitar proxies

No usar:

- marketHeat como oferta;
- reputation como interés formal;
- request como CareerOffer;
- coach conversation como roleScore certificado;
- action history como narrative history.

A3 no debe crear `SeedInstance` ni `originEvent = PLAYER_ACTION_*`.

## 22. HANDOFF A5 — CONTENT

Declarar acciones mediante `PlayerActionDefinition`.

Ejemplo:

```ts
{
  id: "PA_EXAMPLE",
  category: "career",
  label: "Acción",
  description: "Descripción pública",
  targetKind: "none",
  cooldown: { scope: "action", days: 7 },
  eligibilityKey: "active_career",
  options: [{
    id: "A",
    label: "Opción",
    effectKey: "registered_handler",
    publicResult: "Resultado visible"
  }]
}
```

Reglas:

- no paths;
- no `Effect[]` narrativos;
- no `setPath`;
- todo `effectKey` debe existir en registry de código;
- nuevos fact kinds deben añadirse al allowlist + validación;
- cooldown sólo entero >= 0;
- targetKind debe reflejar autoridad real;
- no inventar NPCs;
- efectos numéricos pequeños y clamp;
- no tocar club/contrato/mercado/selección/capitanía/lesión factual/partido/retirada/seeds;
- balance final no pertenece a A1.

## 23. Resultado de gates

Evidencia sobre el HEAD de código `926bcd01329341ce9928e44930035ec87c094163`:

- `npm run build`: **PASS**
- `scripts/test-player-actions-core.mjs`: **15/15 PASS** dentro de `npm test`
- `npm test`: **PASS**
- `npm run test:playcanvas`: **PASS**
- `scripts/test-session.mjs`: **PASS** dentro de `test:playcanvas`
- `scripts/test-saves.mjs`: **PASS** dentro de `test:playcanvas`
- T5 authoritative sport model: **PASS**
- T5 pre-content freeze sentinel: **PASS**
- Otros workflows específicos disparados por el PR: **PASS**
- Repository integrity general: continuaba con QA largos posteriores sin ningún fallo conocido al producir este handoff; los gates exigidos por A0/A1 ya habían finalizado en verde.
