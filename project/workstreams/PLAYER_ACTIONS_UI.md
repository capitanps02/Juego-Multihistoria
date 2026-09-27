# PLAYER ACTIONS UI — A4

**Repositorio:** `capitanps02/Juego-Multihistoria`  
**Main inspeccionado al iniciar:** `2cc068cb705214ba827677ab02d8d1668e8677ec`  
**Rama A4:** `a4/player-actions-ui`  
**Base efectiva de implementación:** `a2/player-actions-session@a9ecde18939386ff8b2bafb8b8248f3467dcf700`  
**A2 revalidado posteriormente:** `84dc7c93545ecece2bc91e7e61f28c98f552dc3e`

## 1. Arquitectura UI

A4 no crea una segunda autoridad de juego.

La arquitectura queda en tres capas:

1. `GameSession` sigue siendo la única frontera transaccional.
2. `PlayerView.actions` es el único contrato que la UI consulta para disponibilidad, categorías, acciones, opciones, cooldown y último resultado.
3. La UI mantiene únicamente estado efímero de navegación:
   - `career`;
   - `player_action_menu`;
   - `player_action_category`;
   - `player_action_detail`;
   - `player_action_result`.

Ese estado no se persiste, no entra en localStorage y no replica eligibility.

El flujo de PlayCanvas reutiliza exactamente `web/game-ui.js`; `scripts/build-playcanvas.mjs` empaqueta esa misma UI junto a `GameSession`. No existe una implementación de reglas específica de PlayCanvas.

## 2. Flujo

Flujo implementado:

```text
CAREER
  ↓
Gestionar mi carrera
  ↓
Categorías públicas
  ↓
Lista pública de acciones
  ↓
Detalle/opciones
  ↓
GameSession.dispatch(player_action)
  ↓
PlayerView.actions.lastResult
  ↓
Resultado compacto
  ↓
Otra acción / Volver a carrera
```

Una Player Action confirmada no llama a simulación ni avanza calendario.

La navegación Back propia soporta:

```text
detalle → categoría → menú → carrera
resultado → categoría → menú → carrera
```

`Escape` sigue siendo una ayuda secundaria en la UI web; nunca es la única salida.

## 3. Estados

Las superficies narrativas siguen siendo autoridad de `PlayerView.screen`:

- `career`;
- `decision`;
- `result`;
- `offer`;
- `summary`;
- `epilogue`.

Los tres estados de Player Actions son subviews de presentación, no nuevos estados de sesión.

El acceso sólo aparece cuando se cumplen simultáneamente:

```text
view.screen === "career"
view.simulation.mode === "idle"
view.actions.available === true
```

Por ello no compite con decision, result, offer, summary, epilogue, auto-sim o carrera cerrada.

## 4. Categorías

A4 itera `PlayerView.actions.categories`; no contiene condiciones por edad ni IDs de acciones.

Contrato de categorías actualmente soportado por A1/A2:

- `career`;
- `training`;
- `representative`;
- `relationships`;
- `image`;
- `life`.

La UI contiene copy de presentación preparado también para `health`, pero **no lo inventa en runtime**: sólo se renderizará si una futura API pública lo entrega.

El catálogo A1 actual expone el vertical slice:

- Entrenamiento extra;
- Descansar;
- Hablar con el entrenador.

Las dos primeras son targetless y el flujo A4 puede ejecutarlas. La tercera está afectada por el bloqueo público de targets descrito en §13.

## 5. Optionality

La regla de producto es explícita:

**SIMULAR es el CTA principal.**

`Gestionar mi carrera` es secundario.

No se implementan:

- contador de acciones restantes;
- tareas pendientes;
- barra de progreso;
- badges rojos;
- avisos de penalización;
- bonus visual por gastar acciones;
- apertura automática del menú al pausar.

El copy del menú recuerda que las acciones son opcionales y que el jugador puede volver a simular cuando quiera.

## 6. Auto-simulation

Estados:

### `auto_simulating`

- Player Actions inaccesibles.
- CTA: `Pausar simulación`.

### `paused`

- Player Actions siguen inaccesibles.
- CTA principal: `Reanudar simulación`.
- CTA secundario: `Terminar simulación`, que envía `{ type:"auto", action:"stop" }`.

Sólo después del receipt de `auto:stop` y del nuevo PlayerView en `idle` reaparece `Gestionar mi carrera`.

Pulsar Pausar nunca abre Player Actions.

### `summary`

El resumen conserva prioridad. No se insertan acciones de gestión dentro de la superficie de summary.

## 7. Cooldowns y acciones no disponibles

La UI usa exclusivamente:

- `available`;
- `unavailableReason`;
- `cooldownUntil`;
- disponibilidad pública de options.

Los timestamps ISO no se presentan en bruto cuando pueden traducirse a copy humano:

- `Podrás volver a hacerlo mañana.`
- `Podrás volver a hacerlo la próxima semana.`
- `Disponible en N días.`

Las acciones no disponibles permanecen visibles cuando el contrato público las entrega, con botón disabled y motivo público.

No se leen ni se muestran:

- eligibilityKey;
- effectKey;
- facts;
- seeds;
- weights;
- RNG;
- knowledge interno;
- authority stores.

## 8. Resultado

Después del comando confirmado A4 muestra:

- nombre público de acción;
- `PlayerView.actions.lastResult.text`;
- `Realizar otra acción`;
- `Volver a carrera`.

No se crea un PendingResult narrativo ni se usa el encabezado visual de evento `UN MOMENTO QUE CUENTA`.

A2 no expone `visibleEffects[]` para Player Actions. A4 considera `lastResult.text` el equivalente público disponible y no reconstruye deltas leyendo GameState.

## 9. Errores y concurrencia

La interacción se bloquea mientras un comando está en curso.

Esto evita el doble click en UI; GameSession mantiene además stale/replay como defensa transaccional.

Mensajes A4:

- `STALE_REVISION`: “La situación de tu carrera ha cambiado. La pantalla se ha actualizado; vuelve a intentarlo.”
- `PLAYER_ACTION_*`: se presenta el mensaje público entregado por SessionError.
- no se presentan stack traces.

## 10. Mobile

Diseñado para 360–430 px:

- listas de acciones a una columna;
- botones de al menos ~48–50 px;
- texto con wrap;
- sin hover obligatorio;
- scroll vertical natural;
- acciones de resultado apiladas;
- no se muestran decenas de acciones en una sola superficie: categoría → lista → detalle.

No se define un canvas horizontal fijo.

## 11. Accessibility

Se conserva/añade:

- elementos `button` reales con `type="button"`;
- `aria-busy` en contenedor principal;
- disabled real durante busy/no disponibilidad;
- heading principal `h1`;
- al cambiar de subview el foco pasa al heading principal;
- navegación explícita Volver;
- teclado existente para navegación principal y choices.

## 12. Preview y PlayCanvas

### Preview

Archivos:

- `preview/app.js`;
- `preview/style.css`.

Implementa el flujo completo targetless y el bloqueo correcto de acciones no ejecutables.

### Web / PlayCanvas

Archivos fuente:

- `web/game-ui.js`;
- `web/game-ui.css`.

PlayCanvas no contiene una segunda lógica: `scripts/build-playcanvas.mjs` incorpora esos mismos archivos al bundle.

La certificación se hace con `npm run test:playcanvas`, que reconstruye el paquete antes de ejecutar tests.

## 13. A2 PUBLIC VIEW — RESUELTO EN FOLLOW-UP #806

El bloqueo original `BLOCKED_BY_A2_PUBLIC_VIEW` fue reproducido por A4 y A6: A2 exponía `targetKind` pero no IDs de target autorizados, por lo que `PA_COACH_TALK` no era ejecutable desde UI sin duplicar autoridad.

El follow-up A2 PR **#806** lo resuelve en la capa de sesión pública.

### 13.1 Targets públicos

Cada acción target-required expone ahora:

```ts
targets: Array<{
  id: string;
  label: string;
  role: string;
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
}>
```

A2 no confía en `contacts[]`. Enumera candidatos del estado y sólo proyecta un NPC si la autoridad existente `validatePlayerActionTarget()` certifica el target exacto.

A4:

1. renderiza exclusivamente `action.targets`;
2. permite elegir target cuando hay varios;
3. auto-resuelve presentación cuando sólo existe uno;
4. usa las `options` target-specific;
5. envía exactamente el `targetId` proyectado;
6. nunca calcula quién es entrenador, representante o compañero;
7. deja que dispatch falle cerrado si el target queda stale.

La proyección pública no incluye agenda, knowledge, facts, payloads, effect keys, eligibility keys, RNG ni consumer state.

### 13.2 Historial público y “Tu recorrido”

#806 añade:

```ts
actions.history: Array<{
  executionId: string;
  date: string;
  actionId: string;
  actionLabel: string;
  optionLabel: string;
  text: string;
}>
```

A4 mezcla esta proyección con `journal` únicamente a nivel de presentación.

- Preview muestra decisiones narrativas + acciones voluntarias.
- Web/PlayCanvas muestra “Decisiones y acciones”.
- Las entradas narrativas conservan `data-journal-index` para la navegación de memorias.
- No se lee `GameState.playerActions` desde UI.
- No se inventa orden causal oculto entre entradas del mismo día.

### 13.3 Estado de certificación

El contrato está implementado en #806 y consumido por #804.

La aceptación final de A4 exige que el gate conjunto A2+A4 compile y pase los casos target/history antes de marcar COMPLETE.

## 14. Tests

Suite:

`scripts/test-player-actions-ui-contract.mjs`

Casos:

- A4-001 CAREER MENU
- A4-002 SIMULATE PRIMARY
- A4-003 DECISION LOCK
- A4-004 OFFER LOCK
- A4-005 AUTO LOCK
- A4-006 CATEGORY
- A4-007 COOLDOWN
- A4-008 EXECUTE
- A4-009 RESULT
- A4-010 RETURN / no calendar advance
- A4-011 MULTIPLE ACTIONS
- A4-012 DOUBLE CLICK
- A4-013 STALE
- A4-014 MOBILE
- A4-015 ACCESSIBILITY

Extensiones de integración añadidas:

- A4-016 TARGET FLOW
- A4-017 HISTORY
- A4-018 TARGET PRIVACY
- A4-019 TARGET RESET

El antiguo diagnóstico que esperaba que las acciones target-required estuvieran bloqueadas fue eliminado.

`test:player-actions-ui` ejecuta la suite con build previo.

`test:playcanvas` reconstruye PlayCanvas e incluye la suite A4.

## 15. Evidencia

Evidencia verificable en código/tests:

- preview y web consumen categorías dinámicas;
- no existe branch UI por edad;
- `player_action` se envía mediante GameSession;
- targets se consumen sólo desde `PlayerView.actions[].targets`;
- el `targetId` enviado es exactamente el proyectado;
- target cooldown se presenta de forma humanizada;
- fecha no cambia en pruebas de ejecución;
- dos acciones compatibles se pueden ejecutar el mismo día;
- stale revision tiene recovery copy;
- auto pause/stop no abre gestión;
- `actions.history` se integra en “Tu recorrido” sin leer GameState;
- PlayCanvas se genera desde la misma UI web.

No se adjunta screenshot automatizado en esta entrega porque el entorno de certificación no incorpora navegador gráfico del repositorio privado. La suite cubre contrato + runtime y el gate PlayCanvas reconstruye el bundle.

### Evidencia histórica — slice targetless

GitHub Actions `Player Actions A4 UI`, run `36312610515`:

- Parse UI sources: PASS.
- Build PlayCanvas package: PASS.
- A2 + A4 antiguo: 39/39 PASS.
- PlayCanvas + A19 regression: 11/11 PASS.
- Bundle histórico: 154 módulos, 17,478,669 bytes.
- SHA-256 histórico: `50ddba3b95eee93f14f2c21a02d0dda85861ecab1c39558e3be64d04047e30a5`.

Ese run **no certifica** el nuevo target flow; se conserva únicamente como regresión histórica del slice targetless.

### Evidencia final requerida — target-aware

El HEAD final debe certificar:

- A2 session incluyendo A2-024..027;
- A4-001..018;
- A6 independent public-target contract;
- PlayCanvas + A19;
- regeneración/versionado de `playcanvas/multihistoria.js` y `playcanvas/manifest.json`.

Hasta que ese run termine, el estado correcto es `INTEGRATION CANDIDATE`, no COMPLETE.

## 16. HANDOFF A5 — CONTENT

### Presupuestos de copy para móvil

- categoría: recomendado <= 20 caracteres;
- título de acción: recomendado <= 42 caracteres;
- descripción: 70–140 caracteres; evitar superar ~180;
- opción: recomendado <= 48 caracteres;
- resultado público: recomendado <= 140 caracteres;
- opciones razonables por acción: 1–4; máximo recomendado 5.

La UI hace wrap, pero estos presupuestos evitan tarjetas demasiado altas en 360 px.

### Categorías soportadas hoy

- career
- training
- representative
- relationships
- image
- life

`health` requiere primero extensión contractual A1/A2; A4 no debe hardcodearlo como categoría real.

### Cooldowns

A5 debe entregar `cooldownUntil`/unavailable reason a través del contrato existente. A4 lo presenta humanizado y no debe conocer la regla de cooldown.

### Campos públicos utilizados

A nivel global:

- `view.screen`
- `view.revision`
- `view.date`
- `view.simulation.mode`
- `view.actions.available`
- `view.actions.unavailableReason`
- `view.actions.categories`
- `view.actions.lastResult`

Por acción:

- id
- label
- description
- targetKind
- available
- unavailableReason
- cooldownUntil
- options[].id
- options[].label
- options[].description
- options[].available
- options[].unavailableReason

A5 no debe pedir a UI que interprete eligibility, facts o effects.

## 17. HANDOFF A6 — QA

### Flujos implementados

1. career → manage → category → action → result → career.
2. result → another action.
3. simulate → pause → resume.
4. simulate → pause → stop → actions.
5. category/action unavailable → disabled + public reason.
6. stale revision → safe rerender/retry copy.

### Estados bloqueados

- decision
- result narrativo
- offer
- auto_simulating
- paused
- summary
- epilogue/carrera cerrada

### Casos móviles

Probar al menos:

- 360×800
- 390×844
- 430×932

Especialmente:

- labels largos;
- 4–5 opciones;
- unavailable reason largo;
- resultado público largo;
- teclado/foco tras navegación.

### Errores

Stress:

- PLAYER_ACTION_UNAVAILABLE
- PLAYER_ACTION_COOLDOWN
- PLAYER_ACTION_TARGET_INVALID
- PLAYER_ACTION_STATE
- STALE_REVISION
- COMMAND_ID_REUSED
- fallo de persistencia

### Puntos frágiles

1. future catalog con muchas categorías/targets;
2. copy excesivamente largo;
3. interacción stop → action inmediatamente tras receipt;
4. target que deja de ser válido entre render y dispatch;
5. múltiples targets con cooldowns diferentes;
6. orden de presentación de varias acciones/decisiones en la misma fecha;
7. regresión de bundle PlayCanvas desactualizado respecto a las fuentes target-aware.

### Stress manual requerido

- doble tap rápido en móvil;
- pause/resume/stop repetido;
- rotación portrait/landscape;
- scroll con 20+ acciones distribuidas por categorías;
- VoiceOver/NVDA foco tras subview;
- carrera con decisión/oferta apareciendo mientras cambia revision;
- PlayCanvas Launch real tras regenerar/subir el asset.

## 18. Estado A4

Estado de implementación: **COMPLETE**.

HEAD funcional certificado antes del cierre documental:

`1296cbbd6d95ae4fbf477dbb5b8b1d026b316777`

Certificación final read-only:

- workflow: Player Actions A4 UI
- run: `36316821115`
- conclusión: **SUCCESS**
- Parse UI sources: PASS
- Build PlayCanvas package: PASS
- A2 session + A4 UI contract: PASS
- PlayCanvas + A19 regression: PASS

Bundle final versionado:

- commit de bundle: `05f7ea368a82df8fac38a3423c139c2a0a428758`
- módulos: **154**
- bytes: **17,484,526**
- SHA-256: `55649e9af9dd64711400fb0d3adddc51ee66f7d55dc0b1b29348e8a304a62bb6`

Suite Player Actions:

- A2-001..027
- A4-001..019
- total conjunto: **46/46 PASS**

PlayCanvas/A19:

- **11/11 PASS**

Completado:

- acciones targetless;
- selector público de coach/agent/teammate;
- envío de `targetId` exacto;
- cooldown/unavailable por target;
- historial público combinado en “Tu recorrido”;
- optionality;
- auto-sim / pause / stop;
- preview;
- shared web UI;
- bundle PlayCanvas final versionado;
- protección busy/double click/stale revision;
- limpieza de target seleccionado en todos los caminos back/navigation;
- mobile/accessibility contract;
- workflow final read-only.

A4 no tiene bloqueos internos abiertos.

El estado COMPLETE de A4 **no implica** que el sistema Player Actions completo esté listo para release. A5/A1 y A6 conservan sus gates propios de catálogo, balance e integración global.
