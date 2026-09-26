# PLAYER ACTIONS ARCHITECTURE — A0

**Repositorio:** `capitanps02/Juego-Multihistoria`  
**BASE_SHA:** `68f58f1b116580082d05f352236bae63ddc53234`  
**Rama A0:** `a0/player-actions-architecture`  
**Inspección iniciada:** 2026-09-26 20:42 CEST  
**Alcance:** arquitectura y contratos; no catálogo completo, balance ni UI final.

---

## 1. Objetivo

Introducir una arquitectura para **acciones voluntarias del jugador fuera de la simulación** sin convertirlas en eventos narrativos y sin alterar el comportamiento de una carrera que nunca las use.

El jugador podrá, en fases posteriores, iniciar acciones como hablar con el entrenador, preguntar por el rol, pedir más minutos, solicitar una salida, contactar con su representante, pedir una renovación, entrenar, recuperar, hablar con compañeros, gestionar imagen pública o descansar.

El sistema se denomina **Player Actions** y su motor de dominio será **`PlayerActionEngine`**.

Las acciones son siempre optativas. `SIMULAR` sigue siendo un camino completo y válido de juego.

---

## 2. Invariantes

### 2.1 ZERO_ACTION_EQUIVALENCE

**Definición formal**

> Para una partida creada con la misma seed, el mismo catálogo y la misma secuencia de comandos preexistentes, si no se ejecuta ningún comando `player_action`, el runtime con Player Actions debe producir exactamente el mismo comportamiento observable y el mismo estado de juego que el runtime anterior a Player Actions.

Esto incluye, como mínimo:

- mismos estados de `rngState`, especialmente `rngState.narrative`;
- mismo scheduling narrativo;
- mismo `state.history`;
- mismos eventos y decisiones;
- mismo mercado y ofertas;
- mismos contratos y empleo;
- mismas lesiones;
- misma selección nacional;
- mismos partidos;
- misma retirada;
- mismas transiciones de auto-simulation;
- mismo comportamiento de persistencia;
- ausencia total de penalizaciones por no actuar.

**Decisión de compatibilidad:** `state.playerActions` será **opcional y lazy**. No se crea en `createInitialState()`, `GameSession.create()`, carga de save, `getView()` ni en ticks. Sólo se materializa dentro de una ejecución real y confirmada de `player_action`. Por tanto, una carrera sin acciones ni siquiera añade un objeto vacío persistido.

### 2.2 Separación Event / PlayerAction

Un Player Action:

- **NO** es un `EventDefinition`;
- **NO** llama a `resolveChoiceInPlace()`;
- **NO** escribe `state.history`;
- **NO** escribe `decisionProvenance`;
- **NO** toca `familyLastSeen`, cooldowns narrativos, `SEEN_*`, memoria NPC narrativa o transitions de seeds del resolver;
- **NO** consume RNG narrativo.

### 2.3 Autoridad

Una acción expresa intención o realiza un efecto local autorizado. Nunca suplanta la autoridad de mercado, empleo, contrato, selección, capitanía, lesión, partido o retirada.

### 2.4 Determinismo V1

La V1 de Player Actions es determinista. No existe draw aleatorio dentro de `PlayerActionEngine`.

`rngState.narrative` no se lee para decidir resultados ni se modifica. Tampoco se añade `rngState.playerActions` en A0/A1 salvo que una futura versión de save lo requiera expresamente.

### 2.5 Optionality

No existen action points, cuotas diarias obligatorias, bonus por “gastar” acciones ni penalizaciones por ignorarlas.

---

## 3. Arquitectura actual relevante inspeccionada

La inspección se realizó contra `main@68f58f1b116580082d05f352236bae63ddc53234`, no contra documentación histórica.

### 3.1 GameSession

`src/session/game-session.ts` es la frontera interactiva single-writer:

- `SESSION_VERSION = 3`;
- todos los comandos incluyen `commandId` y `expectedRevision`;
- `dispatch()` clona datos del caller y serializa comandos mediante `#queue`;
- `#execute()` comprueba replay por receipt antes del stale revision;
- el snapshot se clona antes de mutar;
- `revision` y receipt se añaden sólo al final;
- `#commit()` debe confirmar persistencia completa antes de publicar `#snapshot = next`;
- un fallo de persistencia deja estado y RNG confirmados intactos.

Comandos actuales:

- `continue`;
- `auto` (`start|step|pause|resume`);
- `choose`;
- `acknowledge`;
- `offer`.

### 3.2 PlayerView

`GameSession.getView()` construye una proyección detached y no expone estado interno. La pantalla es:

`result > decision > offer > summary > epilogue > career`.

El flujo de auto-simulation se expone mediante `PublicAutoSimulationState`; no se exponen baseline privado, source ni payload de interrupciones.

### 3.3 Auto-simulation

`src/session/auto-simulation.ts` define:

- `idle`;
- `auto_simulating`;
- `paused`;
- `waiting_for_decision`;
- `showing_summary`;
- `season_transition`;
- `retirement`.

Actualmente `paused` conserva un baseline activo. En `validate-session.ts`, tanto `auto_simulating` como `paused` deben estar libres de pending surfaces, pero **paused no equivale a idle**.

### 3.4 Resolver narrativo

`src/narrative/resolver.ts`:

- usa `DeterministicRng(next.rngState.narrative)`;
- aplica effects narrativos;
- aplica seed transitions;
- escribe historia/procedencia narrativa;
- reconcilia flags/seeds y otras consecuencias.

Por ello no es una primitive válida para acciones de menú.

### 3.5 Seeds

`SeedInstance` exige actualmente `originEvent: string` y `originSeason`. `src/narrative/seed-memory.ts` usa `originEvent` para recuperar, entre otras cosas, el club de origen desde `state.history`. El lifecycle T5.2 está diseñado alrededor de procedencia de evento.

Forzar una acción de jugador a crear una seed exigiría inventar un evento falso o generalizar el modelo de procedencia y migrar su scope. A0 rechaza ambas opciones para V1.

### 3.6 Mercado / empleo / contrato

`src/simulation/offers.ts` mantiene la autoridad formal de `CareerOffer`, `market.pending/openOffers`, `respondToOffer()` y aplicación de `CareerTerms`.

`src/simulation/club-contract-intent.ts` expone facts causales read-only como `clubWantsRenewal`, pending offer facts, employment status y otras proyecciones autorizadas.

### 3.7 Otras autoridades

Se preservan como fuentes de verdad:

- selección: `national-team-authority.ts`;
- liderazgo/capitanía: `player-leadership-authority.ts` y locker leadership;
- representación: `representation-authority.ts`;
- lesiones: `injury-episode-authority.ts`;
- retirada: `retirement-authority.ts` + runtime de retirada;
- resultados: match model / world simulator;
- empleo y términos: employment/offers.

### 3.8 Saves

- `CURRENT_SCHEMA_VERSION = 8`;
- `GameSession` persiste snapshot completo;
- `web/indexed-save-store.js` implementa escritura atómica con expected previous revision;
- `assertSessionSnapshot()` valida receipts, coherencia de pantallas, auto-simulation, journal y provenance;
- `assertGameState()` valida schema 8 y stores de autoridad.

El validador de GameState no exige un conjunto exacto de keys top-level, lo que permite una extensión opcional validada explícitamente sin migrar todos los saves.

---

## 4. Arquitectura propuesta

Paquete recomendado:

```
src/player-actions/
  types.ts
  catalog.ts
  eligibility.ts
  executor.ts
  effects.ts
  action-state.ts
  public-view.ts
  validation.ts
```

No todos los archivos deben existir en A1. Si un módulo queda trivial, debe fusionarse para evitar sobrearquitectura.

Responsabilidades:

- `types.ts`: contratos de dominio;
- `catalog.ts`: definiciones estáticas;
- `eligibility.ts`: disponibilidad pura/read-only;
- `executor.ts`: `PlayerActionEngine`, ejecución determinista sobre un draft;
- `effects.ts`: allowlist de efectos directos legítimos;
- `action-state.ts`: acceso lazy a estado, cooldowns, facts e historial;
- `public-view.ts`: proyección segura para UI;
- `validation.ts`: validación estricta del store persistido.

**Prohibido:** dependencia desde `src/player-actions/*` hacia `narrative/resolver.ts`.

---

## 5. Contratos

Los nombres siguientes son normativos salvo ajuste menor justificado por A1.

### 5.1 PlayerActionCategory

```ts
type PlayerActionCategory =
  | "career"
  | "training"
  | "representative"
  | "relationships"
  | "image"
  | "life";
```

### 5.2 PlayerActionOption

Definición estática, sin estado mutable:

```ts
interface PlayerActionOption {
  id: string;
  label: string;
  description?: string;
  effectKey: string;
  publicResult: string;
}
```

`effectKey` resuelve a una función registrada por código; no contiene paths arbitrarios ni una lista genérica de effects narrativos.

### 5.3 PlayerActionDefinition

```ts
interface PlayerActionDefinition {
  id: string;
  category: PlayerActionCategory;
  label: string;
  description: string;
  targetKind: "none" | "coach" | "agent" | "teammate";
  cooldown: {
    scope: "action" | "action_target";
    days: number;
  };
  eligibilityKey: string;
  options: readonly PlayerActionOption[];
}
```

Los días concretos son placeholders balanceables. A0 sólo fija el mecanismo.

### 5.4 PlayerActionAvailability

Proyección calculada, no persistida:

```ts
interface PlayerActionAvailability {
  actionId: string;
  available: boolean;
  unavailableReason: string | null;
  cooldownUntil: string | null;
  options: Array<{
    id: string;
    label: string;
    description?: string;
    available: boolean;
    unavailableReason: string | null;
  }>;
}
```

Los reasons son player-facing y no deben exponer facts privados.

### 5.5 PlayerActionSource

Provenance causal propia:

```ts
interface PlayerActionSource {
  kind: "player_action";
  executionId: string;
  actionId: string;
  optionId: string;
}
```

No contiene `originEvent`.

### 5.6 PlayerActionFact

Contrato recomendado adicional:

```ts
interface PlayerActionFact {
  factId: string;
  kind: string;
  createdDate: string;
  expiresAfter?: string;
  source: PlayerActionSource;
  targetId?: string;
  payload: Record<string, DataValue>;
}
```

Debe existir un catálogo/allowlist de `kind`; no aceptar facts arbitrarios desde UI.

### 5.7 PlayerActionHistoryEntry

Persistido, compacto:

```ts
interface PlayerActionHistoryEntry {
  executionId: string;
  sequence: number;
  actionId: string;
  optionId: string;
  date: string;
  runtimeDay: number;
  targetId?: string;
  visibleResult: string;
  cooldownUntil: string | null;
}
```

No guarda snapshots, RNG, weights, condiciones internas ni copias de GameState.

### 5.8 PlayerActionState

Persistido de forma lazy en GameState:

```ts
interface PlayerActionState {
  version: 1;
  sequence: number;
  history: PlayerActionHistoryEntry[];
  cooldowns: Record<string, string>;
  facts: PlayerActionFact[];
}
```

El key de cooldown se deriva canónicamente del definition:

- `action:<actionId>`;
- `action_target:<actionId>:<targetId>`.

### 5.9 PlayerActionExecution

Resultado interno de una ejecución determinista:

```ts
interface PlayerActionExecution {
  historyEntry: PlayerActionHistoryEntry;
  factsWritten: PlayerActionFact[];
  visibleResult: string;
}
```

No hace falta añadirlo al shape genérico de retorno de `GameSession.dispatch()`. La UI puede recibir `actions.lastResult` en el siguiente `PlayerView`.

### 5.10 Qué vive dónde

**Definición estática**

- catálogo;
- labels/descriptions;
- opciones;
- cooldown policy;
- eligibility/effect keys.

**GameState**

- `playerActions?: PlayerActionState`;
- efectos locales autorizados sobre variables preexistentes;
- facts/intenciones causales.

**SessionSnapshot**

No se añade un store paralelo. `SessionSnapshot.state` ya contiene `playerActions?`.

El snapshot sigue poseyendo:

- revision;
- receipts;
- pending screens;
- auto-simulation;
- journal/provenance narrativos.

---

## 6. Flujo de ejecución

Nuevo comando:

```ts
{
  type: "player_action",
  commandId: string,
  expectedRevision: number,
  actionId: string,
  optionId: string,
  targetId?: string
}
```

### Secuencia transaccional

1. `dispatch()` clona el comando y entra en la cola existente.
2. `commandFingerprint()` valida IDs y genera fingerprint canónico.
3. Se comprueba replay por `commandId`.
4. Se exige `expectedRevision === snapshot.revision`.
5. Se clona `SessionSnapshot`.
6. Se ejecuta **guard de superficie interactiva**.
7. `PlayerActionEngine.getAvailability()` resuelve definición, option, target, cooldown y condiciones.
8. Si no está disponible: error `PLAYER_ACTION_UNAVAILABLE`, sin mutación.
9. `PlayerActionEngine.executeInPlace(next.state,...)` aplica sólo:
   - facts/intenciones;
   - history/cooldown de Player Actions;
   - efectos directos allowlisted.
10. Se valida `PlayerActionState` y `GameState`.
11. Se incrementa revision y se añade receipt.
12. `#commit()` persiste el snapshot completo con la misma expectativa anterior.
13. Sólo tras confirmación se publica `#snapshot = next`.
14. `getView()` devuelve disponibilidad/resultados públicos actualizados.

No se crea `pendingResult` narrativo ni `JournalEntry` narrativo.

### Fingerprint

Forma recomendada:

```ts
["player_action", expectedRevision, actionId, optionId, targetId ?? null]
```

Esto permite replay idempotente y PA-004 sin infraestructura nueva.

---

## 7. Persistencia

### 7.1 Store lazy

`playerActions` se materializa únicamente en el draft de una ejecución válida.

Lecturas usan:

```ts
readPlayerActionState(state) => state.playerActions ?? EMPTY_PROJECTION
```

y nunca asignan a `state`.

Mutación usa:

```ts
ensurePlayerActionStateInPlace(state)
```

exclusivamente dentro de `PlayerActionEngine.executeInPlace()`.

### 7.2 Historial separado

`playerActionHistory` conceptual se implementa como `state.playerActions.history`.

No se mezcla con:

- `state.history`;
- `SessionSnapshot.journal`;
- `decisionProvenance`.

Razón: esos tres están acoplados 1:1 a decisiones narrativas y su validación de contenido.

### 7.3 Facts

Los facts activos se guardan en `state.playerActions.facts`. Un fact puede expirar por fecha, pero no necesita un “tick de limpieza” que mutaría partidas sin acciones. Los lectores consideran expirado un fact cuando `expiresAfter < state.date`. La compactación física, si se desea, sólo debe ocurrir durante otra mutación Player Action o una migración explícita.

Esto evita violar ZERO_ACTION_EQUIVALENCE mediante housekeeping automático.

---

## 8. Integración con GameSession

### 8.1 SessionCommand

Añadir la variante `player_action` al union existente.

### 8.2 Reglas de ejecución

El comando sólo puede ejecutarse cuando simultáneamente:

- `pendingDecision === null`;
- `pendingResult === null`;
- no existe `state.market?.pending`;
- `state.retirement.status !== "closed"`;
- `autoSimulation.mode === "idle"`;
- la superficie pública equivalente es `screen === "career"`.

La autoridad primaria debe comprobar estado interno, no confiar en el valor `screen` enviado por UI.

### 8.3 Receipts

Se reutilizan los mismos `CommandReceipt`. `validate-session.ts` debe:

- admitir `player_action`;
- validar fingerprint de 5 campos;
- vincular cada receipt `player_action` con exactamente un `PlayerActionHistoryEntry`;
- exigir mismo orden/sequence;
- no modificar la igualdad `journal.length === state.history.length`.

### 8.4 Rollback

No hay manejo especial: si commit falla, el draft completo se descarta igual que los demás comandos.

---

## 9. Integración con UI / PlayerView

Extensión recomendada:

```ts
interface PublicPlayerActionsView {
  available: boolean;
  unavailableReason: string | null;
  categories: Array<{
    id: PlayerActionCategory;
    label: string;
    actions: Array<{
      id: string;
      label: string;
      description: string;
      available: boolean;
      unavailableReason: string | null;
      cooldownUntil: string | null;
      options: Array<{
        id: string;
        label: string;
        description?: string;
        available: boolean;
        unavailableReason: string | null;
      }>;
    }>;
  }>;
  lastResult: {
    executionId: string;
    date: string;
    text: string;
  } | null;
}
```

`PlayerView` añade:

```ts
actions: PublicPlayerActionsView;
```

### No exponer

- eligibility keys;
- facts privados;
- payload interno;
- NPC knowledge;
- weights;
- RNG;
- effect keys;
- authority internals;
- seeds;
- `source` interno;
- motivos que revelen información oculta.

Cuando la superficie no sea segura, `actions.available=false`; la UI no decide seguridad.

---

## 10. Estrategia de seeds / facts

### Decisión: C — PlayerActionFacts primero

A0 selecciona **C**.

Las acciones V1 **NO escriben seeds**.

Motivos:

1. `SeedInstance.originEvent` es obligatorio.
2. El scope T5.2 utiliza historia/evento de origen.
3. Inventar un `EventDefinition` falsearía provenance.
4. Generalizar ahora la primitive de seeds obligaría a tocar schema, validación, migraciones y lifecycle de T5.2.
5. Los intents de jugador son facts causales distintos de memoria narrativa de evento.

### Bridge narrativo

A3 ampliará `NarrativeCausalFacts` con una proyección read-only, por ejemplo:

```ts
facts.playerActions.transferRequest.active
facts.playerActions.moreMinutesRequest.active
facts.playerActions.renewalRequest.active
facts.playerActions.coachConversation.lastDate
```

Los eventos pueden leer esas facts mediante conditions autorizadas.

### originEvent

`originEvent` conserva su significado actual: **evento narrativo real que originó una SeedInstance**.

Una Player Action nunca escribe un valor ficticio en `originEvent`.

### Futuro

Si un futuro diseño requiere que una acción cree una seed, deberá existir primero un cambio separado de T5.2 hacia provenance discriminada, por ejemplo `origin: {kind:"event"...}|{kind:"player_action"...}`, con migración y scope semantics explícitas. No forma parte de V1.

---

## 11. Autoridad por subsistema

| Área | Player Action puede | Player Action NO puede | Autoridad final |
|---|---|---|---|
| Mercado | escribir `transfer_request`, `market_interest_query` | crear CareerOffer, cambiar club | offers / market producers |
| Contrato | escribir `renewal_request` | cambiar meses, salario, cláusula | offers / employment |
| Rol/minutos | registrar intención y relación contextual | `role=starter`, fabricar apariciones | sport/match/role simulation |
| Selección | ninguna mutación directa | convocar, dar rol internacional | national-team-authority |
| Capitanía | relación/intención conversacional | certificar brazalete | player-leadership-authority |
| Representación | contactar al representante actual | crear/cambiar términos de representación genéricamente | representation-authority |
| Lesión | recuperación sólo sobre variables locales permitidas cuando no contradiga lesión | crear/borrar lesión o clearance factual | injury authority/world |
| Partidos | ninguna | cambiar marcador, minutos, estadísticas | match model |
| Retirada | como máximo facts de intención futura si se diseña | cerrar/reabrir carrera | retirement authority/runtime |
| Seeds | ninguna en V1 | escribir SeedInstance | narrative resolver/T5.2 |
| Relaciones | delta pequeño y clamp | reescribir memoria NPC factual | relationship domain / NPC authority |
| Imagen | delta pequeño y clamp | inventar premios/noticias/resultados | reputation + authorities |
| Entrenamiento | delta pequeño local, fatiga/carga | salto grande de atributos | bounded PlayerAction effect |
| Descanso | reducir fatiga dentro de límite | curar lesión factual instantáneamente | bounded PlayerAction effect |

### Efectos directos V1

Los efectos directos requieren handler dedicado y límites por código.

Allowlist conceptual:

- fatiga;
- fitness/recovery local;
- mejora técnica/táctica pequeña;
- relación pequeña con target permitido;
- reputación/imagen pequeña.

No existe un helper genérico “set path/value” accesible desde catálogo.

---

## 12. Estrategia de cooldown

No existen action points.

Cada definición tiene política:

- scope `action`;
- o `action_target`;
- días de cooldown.

El store guarda la primera fecha en que vuelve a estar disponible:

```
cooldowns[key] = YYYY-MM-DD
```

Elegibilidad:

```
available iff state.date >= cooldownUntil
```

Ejemplos de balance futuro, no normativos:

- entrenamiento extra ~7 días;
- entrenador 14–28;
- representante ~14;
- petición formal de salida 60–120.

El cooldown sólo se escribe al ejecutar una acción.

---

## 13. Seguridad RNG

Normas:

1. `PlayerActionEngine` no importa `DeterministicRng`.
2. No accede a `state.rngState.narrative`.
3. No llama scheduler.
4. No llama resolver.
5. No llama world advance.
6. `getView()` y eligibility son funciones puras/read-only.
7. La creación de PlayerActionState no consume RNG.
8. Un error de action no altera RNG por trabajar sobre draft y no publicar sin commit.

Un futuro RNG propio requerirá `rngState.playerActions` y migración explícita; no se “toma prestado” ningún stream existente.

---

## 14. Compatibilidad con auto-simulation

### Estado `paused`

A0 selecciona la opción **B**:

> `paused` NO permite Player Actions.

Motivo: paused conserva un bloque automático abierto y baseline/elapsedDays activos. Permitir acciones dentro del bloque mezclaría causalidad del periodo, summaries y cambios de jugador.

### Contrato futuro de salida

A2 debe añadir, antes de habilitar acciones desde una pausa, una transición explícita tipo:

```ts
{ type: "auto", action: "stop" }
```

o nombre equivalente.

Semántica propuesta:

- sólo válida desde `paused`;
- no avanza calendario;
- no consume RNG;
- no crea summary nueva;
- reemplaza el flow por `idleAutoSimulationState()`;
- usa revision/receipt/commit normal;
- después de confirmarse, Player Actions puede estar disponible.

A0 **no implementa** esta transición.

### Otros modos

Player Action se rechaza en:

- `auto_simulating`;
- `waiting_for_decision`;
- `paused`;
- `showing_summary`;
- `season_transition`;
- `retirement`.

---

## 15. Save compatibility

### SESSION_VERSION

**Se mantiene en 3** en la implementación recomendada.

No se añade campo top-level nuevo a `SessionSnapshot`; `player_action` es una variante adicional de receipt/comando que el nuevo validador entiende.

### CURRENT_SCHEMA_VERSION

**Se mantiene en 8** mientras `playerActions` sea:

- opcional;
- lazy;
- validado cuando existe;
- ausente en saves históricos;
- no necesario para interpretar ningún campo antiguo.

No hace falta reescribir saves v8 existentes.

### Validación

A2 debe:

- añadir `playerActions?: PlayerActionState` a `GameState`;
- invocar `inspect/assertPlayerActionState` cuando el campo exista;
- comprobar fechas no futuras;
- sequence monotónico;
- executionId únicos;
- action/option IDs válidos o preservables según la política de catálogo;
- cooldowns con ISO date válida;
- fact source consistente con history;
- no requerir el campo si no hubo acciones.

### Compatibilidad hacia atrás

Objetivo garantizado: saves actuales abren en el runtime nuevo.

No se garantiza que un runtime antiguo comprenda saves creados después de ejecutar Player Actions.

---

## 16. Matriz de tests

### PA-001 ZERO ACTION EQUIVALENCE

**Gate crítico.**

- baseline: `main@68f58f1b116580082d05f352236bae63ddc53234`;
- mismas seeds y misma secuencia preexistente de comandos;
- runtime nuevo sin `player_action`;
- comparar estado, `rngState`, history, market, retirement, auto-sim y resultados;
- `playerActions` debe permanecer `undefined`/ausente;
- serialized GameState no debe ganar un store vacío.

Recomendación A6: fixture/golden generado desde BASE_SHA o harness de dos worktrees; no un baseline reconstruido manualmente.

### PA-002 DETERMINISM

Mismo save + misma secuencia de `player_action` => snapshot final idéntico.

### PA-003 SAVE/LOAD

Ejecutar acción, persistir, cargar y continuar. Debe coincidir con la misma secuencia sin interrupción de persistencia.

### PA-004 DOUBLE CLICK

Dos comandos distintos con igual revision: sólo uno se confirma. El segundo falla `STALE_REVISION`. Repetir el mismo `commandId` devuelve replay sin segundo efecto.

### PA-005 COOLDOWN

Una acción ejecutada no vuelve a estar disponible antes de su `cooldownUntil`; sí en o después de esa fecha.

### PA-006 AUTO-SIM SAFETY

`player_action` falla sin mutación en auto_simulating, paused, waiting_for_decision, showing_summary, season_transition y retirement.

### PA-007 AUTHORITY

Acciones de mercado/renovación no pueden cambiar:

- club;
- CareerTerms;
- `market.pending/openOffers`;
- employment.

### PA-008 NARRATIVE RNG

Antes/después de acción determinista: `rngState.narrative` deepEqual.

### PA-009 OPTIONALITY

Carrera sin acciones:

- no penalización;
- no cooldown;
- no facts;
- no PlayerAction history;
- no evento forzado;
- no store materializado.

### PA-010 RETIREMENT

Con `retirement.status === "closed"`, toda Player Action falla `CAREER_CLOSED` o código equivalente sin mutación.

### PA-011 NARRATIVE SEPARATION

Una acción no cambia `state.history`, `journal`, `decisionProvenance`, `familyLastSeen`, `eventCooldowns` ni seeds.

### PA-012 PLAYER VIEW PRIVACY

Serializar `view.actions` y verificar ausencia de:

- `facts`;
- `effectKey`;
- `eligibilityKey`;
- `rngState`;
- seed IDs;
- NPC knowledge;
- authority stores.

### PA-013 ATOMIC ROLLBACK

Forzar fallo de commit tras ejecutar una action en draft. El snapshot confirmado debe quedar deepEqual al anterior.

### PA-014 FACT EXPIRY READ

Fact expirado deja de proyectarse sin necesidad de mutar el save al pasar el tiempo.

### Regression gates existentes

Como mínimo después de implementación:

- `npm run build`;
- `npm run test:session`;
- `npm run test:saves`;
- `npm run test:playcanvas` si A4 toca UI/bundle;
- gates T5.2 de seeds cuando A3 cambie causal facts;
- QA de auto-simulation T5.5.

---

## 17. Ownership de archivos para agentes posteriores

Regla general: agentes no deben editar simultáneamente archivos compartidos. Los archivos “read” sirven para contrato/contexto; no se modifican salvo transferencia explícita de ownership.

### A1 — Player Action Core

**Puede modificar**

- `src/player-actions/types.ts`
- `src/player-actions/catalog.ts` sólo con catálogo mínimo de fixture, no balance final
- `src/player-actions/eligibility.ts`
- `src/player-actions/executor.ts`
- `src/player-actions/effects.ts`
- `src/player-actions/action-state.ts`
- `src/player-actions/public-view.ts`
- `src/player-actions/validation.ts`
- tests unitarios nuevos de PlayerActionEngine que no requieran GameSession

**Puede leer**

- `src/core/types.ts`
- `src/session/game-session.ts`
- autoridades de simulation
- `src/narrative/seed-memory.ts`

**NO debe modificar**

- `src/session/game-session.ts`
- `src/session/validate-session.ts`
- `src/save/*`
- `src/narrative/resolver.ts`
- `preview/app.js`

### A2 — GameSession / persistencia

**Puede modificar**

- `src/session/game-session.ts`
- `src/session/validate-session.ts`
- `src/core/types.ts` sólo para añadir el campo opcional/import type acordado
- `src/save/validation.ts` / `validation-legacy.ts` sólo donde haga falta registrar validación del optional store
- tests de session/save
- en fase separada, contrato `auto:stop`

**Puede leer**

- todo `src/player-actions/*`
- IndexedDB store
- auto-simulation

**NO debe modificar**

- executor/effects de A1
- resolver/seed-memory
- `preview/app.js`
- catálogo de balance A5

### A3 — Narrative bridge / facts

**Puede modificar**

- `src/simulation/club-contract-intent.ts` o módulo causal-facts sucesor
- nuevo `src/player-actions/narrative-facts.ts` si evita ensuciar contrato existente
- `src/core/conditions.ts` sólo si es necesario para paths nuevos
- tests de causal facts / gates
- contenido narrativo mínimo de prueba sólo con ownership explícito

**Puede leer**

- PlayerActionState/facts
- `src/narrative/seed-memory.ts`
- T5.2 docs
- authorities

**NO debe modificar**

- `src/narrative/resolver.ts`
- estructura `SeedInstance`
- GameSession
- persistencia
- UI

### A4 — UI

**Puede modificar**

- `preview/app.js`
- `preview/index.html`
- `preview/style.css`
- PlayCanvas/web presentation equivalents
- tests UI

**Puede leer**

- `PlayerView.actions`
- public action types

**NO debe modificar**

- executor/eligibility
- GameState
- GameSession command semantics
- authorities
- narrative resolver

### A5 — Catálogo y balance

**Puede modificar**

- `src/player-actions/catalog.ts`
- módulos de data del catálogo si A1 los separa
- tests de catálogo/balance

**Puede leer**

- eligibility/effects contracts
- game state/public facts

**NO debe modificar**

- executor engine
- GameSession
- persistence
- narrative resolver
- UI

### A6 — QA

**Puede modificar**

- `scripts/test-player-actions*.mjs`
- fixtures QA
- workflows/gates Player Actions
- docs de evidencia QA

**Puede leer**

- todos los módulos

**NO debe modificar**

- runtime productivo para hacer pasar tests
- catálogo productivo
- autoridades

### Archivo compartido de mayor riesgo

`src/core/types.ts` y `src/session/game-session.ts` quedan temporalmente bajo A2 durante integración. A1 debe exportar sus tipos desde `src/player-actions/types.ts` para minimizar cambios allí.

---

## 18. Plan de integración

Orden recomendado:

1. **A1 Core**
   - tipos;
   - store lazy;
   - eligibility;
   - executor determinista;
   - catálogo fixture mínimo;
   - validación propia.

2. **A2 GameSession/persistencia**
   - comando `player_action`;
   - fingerprint;
   - guard de seguridad;
   - receipt validation;
   - PlayerView.actions;
   - save validation;
   - tests PA-003/004/006/010/013.
   - `auto:stop` en commit/PR separado si se habilita salida de paused.

3. **A3 causal facts**
   - proyección read-only de PlayerActionFacts;
   - condiciones narrativas;
   - ningún seed write.

4. **A5 catálogo/balance**
   - acciones iniciales y cooldowns reales;
   - límites de efectos.

5. **A4 UI**
   - menú opcional;
   - no badges coercitivos de “acciones restantes”;
   - feedback de cooldown y visibleResult.

6. **A6 QA**
   - PA-001 baseline;
   - matriz completa;
   - regresiones T5.2/T5.5;
   - prueba de save/load y double-click.

Cada paso debe partir de main actualizado o de una cadena explícita de ramas; evitar branches paralelas que escriban GameSession.

---

## 19. Riesgos

### R1 — Eager initialization rompe ZERO_ACTION_EQUIVALENCE

**Mitigación:** store lazy y readers puros.

### R2 — Reutilizar resolver narrativo

Consumiría RNG y mezclaría provenance/historia.  
**Mitigación:** dependencia prohibida y PA-011.

### R3 — Seeds con originEvent falso

Rompería causalidad/scope T5.2.  
**Mitigación:** PlayerActionFacts.

### R4 — Bypass de autoridad

Un effect genérico podría mutar `contract`, club, market o selection.  
**Mitigación:** handlers allowlisted, sin “set arbitrary path”, PA-007.

### R5 — paused tratado como career libre

`getView()` puede mostrar career cuando no hay otra surface aunque flow esté paused.  
**Mitigación:** guard interno exige `autoSimulation.mode === "idle"`; UI no decide.

### R6 — Receipt validation desincronizada

Añadir command type sin actualizar `validate-session.ts` invalida saves nuevos.  
**Mitigación:** A2 ownership exclusivo + PA-003.

### R7 — Catálogo expone información oculta

Unavailable reasons demasiado específicos pueden revelar facts.  
**Mitigación:** public-view mapper con reasons públicos y PA-012.

### R8 — Limpieza automática de facts altera carreras

Un tick que borre facts mutaría state aunque el jugador no ejecute una acción ese día.  
**Mitigación:** expiración lógica en reads; compactación sólo en mutación Player Action.

### R9 — Direct effects demasiado potentes

Podrían transformar Player Actions en ruta óptima obligatoria.  
**Mitigación:** límites pequeños, cooldown natural, balance A5, no stacking ilimitado.

### R10 — Múltiples agentes tocando core

**Mitigación:** ownership anterior y secuencia A1→A2→A3.

---

## 20. Criterios de aceptación A0

A0 se considera cerrado cuando:

- [x] arquitectura inspeccionada contra main real;
- [x] BASE_SHA registrado;
- [x] ZERO_ACTION_EQUIVALENCE definido;
- [x] Event vs PlayerAction separado;
- [x] autoridad preservada;
- [x] RNG protegido;
- [x] contrato GameSession definido;
- [x] persistencia lazy definida;
- [x] cooldown definido;
- [x] estrategia PlayerActionFacts seleccionada;
- [x] `originEvent` preservado como provenance de evento;
- [x] PlayerView definido;
- [x] paused resuelto por contrato: no acciones hasta salida explícita;
- [x] save compatibility definida;
- [x] matriz PA-001…PA-014 definida;
- [x] ownership A1–A6 definido;
- [x] riesgos identificados;
- [x] plan de integración definido;
- [ ] verificación final de diff/CI de esta rama.

A0 no implementa catálogo completo, UI, balance, bridge narrativo ni motor completo.
