# PLAYER ACTIONS SESSION — A2

**Repositorio:** `capitanps02/Juego-Multihistoria`  
**BASE_SHA inspeccionado:** `2cc068cb705214ba827677ab02d8d1668e8677ec`  
**Rama:** `a2/player-actions-session`  
**Dependencia:** API exacta de A1 / PR #800. Como A1 todavía no estaba en `main`, esta rama incorpora sus archivos literalmente para poder compilar y certificar A2 contra el `main` actual. No existe un engine paralelo.

## 1. SessionCommand

Se añade:

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

El comando entra exclusivamente por `GameSession.dispatch()`, comparte la cola single-writer y usa el mismo commit transaccional que los comandos existentes.

También se amplía `auto.action` con `"stop"`.

## 2. Fingerprint

Forma canónica:

```ts
["player_action", expectedRevision, actionId, optionId, targetId ?? null]
```

Todos los identificadores pasan el mismo límite de longitud que los demás comandos. Reutilizar `commandId` con otro contenido produce `COMMAND_ID_REUSED`.

## 3. Superficie permitida

La autoridad está centralizada en `playerActionSessionBlock(snapshot)`; `canExecutePlayerAction(snapshot)` expone la comprobación booleana.

Una Player Action sólo puede ejecutarse si:

- la carrera no está cerrada;
- no hay `pendingDecision`;
- no hay `pendingResult`;
- no hay oferta formal pendiente;
- `autoSimulation.mode === "idle"`.

No se confía en una pantalla enviada por UI.

## 4. Auto-simulation

Player Actions se rechazan en cualquier modo distinto de `idle`, incluidos:

- `auto_simulating`;
- `paused`;
- `waiting_for_decision`;
- `showing_summary`;
- `season_transition`;
- `retirement`.

A0 pidió una salida explícita de pausa. A2 implementa:

```ts
{ type: "auto", action: "stop", commandId, expectedRevision }
```

Semántica:

- sólo desde `paused`;
- no avanza fecha ni `runtime.day`;
- no consume RNG;
- no deshace días ya simulados;
- no crea un summary nuevo;
- sustituye el flow por `idleAutoSimulationState()`;
- usa revision, receipt y commit normales.

## 5. Ejecución transaccional

La rama `player_action`:

1. valida fingerprint/replay;
2. valida `expectedRevision`;
3. clona el snapshot;
4. valida superficie y carrera;
5. llama exactamente a `executePlayerActionInPlace(next.state, request)`;
6. convierte un fallo A1 en `SessionError` con código público equivalente;
7. incrementa revision una sola vez;
8. añade receipt;
9. ejecuta `assertGameState(next.state)`;
10. persiste;
11. sólo después publica `#snapshot = next`.

No llama a scheduler, resolver ni `advanceWorldDayInPlace`.

## 6. Persistencia

A2 añade a `GameState`:

```ts
playerActions?: PlayerActionState;
```

Sigue siendo optional/lazy. `createInitialState()` no se modifica y una carrera sin acciones no materializa el store.

`src/save/validation.ts` llama a `assertPlayerActionState(state.playerActions, state.date)` sólo cuando el campo existe.

No existe copia del estado en `SessionSnapshot`.

## 7. Compatibilidad legacy

- `SESSION_VERSION` permanece en **3**.
- El schema de GameState permanece en **8**.
- Saves históricos sin `playerActions` siguen siendo válidos.
- `resume` y `migrateAndResume` no regeneran historial, cooldowns ni facts.
- No hay migración narrativa.
- `contentIdentity` sigue calculándose exclusivamente con el catálogo narrativo; Player Actions no entran en ese hash.

## 8. PlayerView

Se añade:

```ts
actions: {
  available: boolean;
  unavailableReason: string | null;
  categories: Array<{
    id: PlayerActionCategory;
    label: string;
    actions: Array<{
      id: string;
      label: string;
      description: string;
      targetKind: "none" | "coach" | "agent" | "teammate";
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

La proyección se deriva en lectura mediante `listPlayerActions`. No materializa estado.

No expone:

- facts;
- payloads;
- `effectKey`;
- `eligibilityKey`;
- RNG;
- seeds;
- provenance interna;
- conocimiento NPC.

## 9. Resultado público

A2 selecciona la variante derivada recomendada por A0:

- no se crea `pendingPlayerActionResult`;
- no se contamina `pendingResult`;
- `actions.lastResult` se deriva del último `state.playerActions.history`.

Por tanto no hace falta un comando de acknowledge en V1.

## 10. Errores públicos

Errores de sesión:

- `CAREER_CLOSED`;
- `PLAYER_ACTION_STATE`;
- `STALE_REVISION`;
- `COMMAND_ID_REUSED`;
- `INVALID_COMMAND`.

Errores de dominio A1 propagados sin datos privados:

- `PLAYER_ACTION_UNKNOWN`;
- `PLAYER_ACTION_OPTION_UNKNOWN`;
- `PLAYER_ACTION_TARGET_REQUIRED`;
- `PLAYER_ACTION_TARGET_UNEXPECTED`;
- `PLAYER_ACTION_TARGET_INVALID`;
- `PLAYER_ACTION_UNAVAILABLE`;
- `PLAYER_ACTION_COOLDOWN`;
- `PLAYER_ACTION_EFFECT_FORBIDDEN`;
- `PLAYER_ACTION_EFFECT_FAILED`;
- `PLAYER_ACTION_STATE_INVALID`.

## 11. Rollback

El engine A1 muta sólo el draft de GameState. GameSession publica únicamente después de que el adapter de persistencia confirme.

Si `commit` falla:

- revision no cambia;
- Player Action history no cambia;
- cooldowns no cambian;
- facts no cambian;
- efectos locales no cambian;
- RNG no cambia.

## 12. Replay y concurrencia

Replay:

- mismo `commandId` + mismo fingerprint devuelve el receipt confirmado con `replayed: true`;
- no ejecuta el engine otra vez.

Concurrencia:

- dos comandos con la misma `expectedRevision` entran por la cola;
- sólo el primero puede confirmar;
- el segundo falla `STALE_REVISION`.

## 13. Separación narrativa

Una Player Action no escribe:

- `state.history`;
- `journal`;
- `decisionProvenance`;
- `needsWorldAdvance`;
- event cooldowns;
- seeds.

La igualdad narrativa `journal.length === state.history.length` se mantiene sin excepciones.

## 14. Tests A2

`scripts/test-player-actions-session.mjs` contiene 23 casos:

- A2-001 comando;
- A2-002 revision;
- A2-003 receipt;
- A2-004 replay;
- A2-005 command-id reuse;
- A2-006 double click;
- A2-007 persistence;
- A2-008 failed commit;
- A2-009 old save;
- A2-010 auto running;
- A2-011 decision;
- A2-012 result;
- A2-013 offer;
- A2-014 retired;
- A2-015 no world advance;
- A2-016 no narrative history;
- A2-017 no provenance;
- A2-018 no RNG;
- A2-019 getView pure;
- A2-020 zero-action regression;
- A2-021 auto stop;
- A2-022 malformed save;
- A2-023 public-view privacy.

Scripts npm:

- `test:player-actions-core`;
- `test:player-actions-session`;
- `test:session` incluye A2 + sesión + auto-simulation.

## 15. ZERO_ACTION_EQUIVALENCE

Mecanismos usados para preservarla:

- store lazy;
- ninguna inicialización nueva en create/resume/getView;
- ningún tick/housekeeping Player Action;
- no RNG Player Action en sesión;
- ningún cambio a scheduler/resolver/world advance cuando no hay `player_action`;
- catálogo de acciones fuera de `contentIdentity`.

La certificación final depende de las regresiones existentes de sesión/auto/save además de A2.

## 16. HANDOFF A4 — UI

### Qué leer

`GameSession.getView().actions`.

- Si `actions.available === false`, no enviar `player_action`.
- Renderizar `categories[].actions[]`.
- Para acciones con `targetKind !== "none"`, seleccionar un objetivo público válido y enviarlo como `targetId`.
- Mostrar `actions.lastResult.text` tras una ejecución confirmada.
- No hay pantalla narrativa de resultado ni acknowledge para Player Actions.

### Comando

```ts
{
  type: "player_action",
  commandId,
  expectedRevision: view.revision,
  actionId,
  optionId,
  targetId?
}
```

### Flujo auto

- `auto_simulating`: acciones deshabilitadas;
- `paused`: acciones deshabilitadas;
- para abandonar una pausa, enviar `auto:stop`;
- después del receipt de stop, refrescar view y sólo entonces permitir Player Actions.

### Errores a tratar

- stale/replay: `STALE_REVISION`, `COMMAND_ID_REUSED`;
- pantalla: `PLAYER_ACTION_STATE`, `CAREER_CLOSED`;
- dominio: códigos `PLAYER_ACTION_*` listados arriba.

## 17. HANDOFF A6 — QA

### Invariantes críticos

1. ZERO_ACTION_EQUIVALENCE.
2. narrative RNG byte-equivalent tras Player Action.
3. fecha/runtime.day invariantes tras Player Action.
4. journal/history/provenance invariantes.
5. single-writer + stale revision.
6. replay idempotente.
7. failed commit = rollback total.
8. `getView()` puro.
9. store ausente si nunca se ejecuta acción.
10. Player Actions bloqueadas fuera de idle.
11. `auto:stop` no avanza ni revierte calendario.
12. contentIdentity narrativo independiente.

### Suites existentes

- `scripts/test-player-actions-core.mjs`;
- `scripts/test-player-actions-session.mjs`;
- `scripts/test-session.mjs`;
- `scripts/test-saves.mjs`;
- `scripts/test-t55-auto-simulation.mjs`.

### Stress sugerido

- 100+ dispatch concurrentes compartiendo revisión;
- save/load tras cientos de acciones y cooldowns;
- targets que dejan de ser válidos entre render y dispatch;
- fallo de commit en cada tipo de acción;
- ciclos repetidos auto start → pause → stop → action → auto;
- PlayerView serializado buscando claves privadas;
- saves maliciosos con facts/payloads/cooldowns extremos.

