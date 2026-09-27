# PLAYER ACTIONS FINAL QA — A6

**Repositorio:** `capitanps02/Juego-Multihistoria`  
**Main inspeccionado / BASE_SHA:** `2cc068cb705214ba827677ab02d8d1668e8677ec`  
**Candidato backend A2 inspeccionado:** `84dc7c93545ecece2bc91e7e61f28c98f552dc3e`  
**Rama A6:** `a6/player-actions-final-qa`  
**Estado actual:** `NOT_CERTIFIED / BLOCKED_BY_UPSTREAM`  
**Fecha:** 2026-09-27

## 1. Resumen ejecutivo

A6 se ha creado encima del HEAD exacto de A2 para poder validar el backend más avanzado sin fingir que la feature está integrada en `main`.

A fecha de esta inspección:

- A0, A1 y A2 existen como PRs abiertos #799, #800 y #801; ninguno está mergeado en `main`.
- A3 tiene rama, pero no contiene implementación específica ni el documento obligatorio `PLAYER_ACTIONS_NARRATIVE_BRIDGE.md`; su diff efectivo contra `main` coincide con A2.
- A4 contiene una implementación parcial de UI en `preview/app.js` y `preview/style.css`, pero no contiene el documento obligatorio `PLAYER_ACTIONS_UI.md` ni integración Player Actions específica en PlayCanvas.
- A5 tiene rama, pero no contiene catálogo/balance específico ni el documento obligatorio `PLAYER_ACTIONS_CONTENT.md`; su diff efectivo contra `main` coincide con A2.
- El catálogo disponible en el candidato sigue siendo el vertical slice técnico de A1: `PA_TRAIN_EXTRA`, `PA_REST` y `PA_COACH_TALK`.

Por tanto la feature **no puede certificarse ni recomendarse para merge final todavía**.

A6 añade dos gates nuevos:

1. `scripts/test-player-actions-final.mjs`: probes cross-system de pureza, determinismo, RNG, replay, concurrencia, rollback, legacy/malformed saves, cooldown y autoridad.
2. `scripts/test-player-actions-zero-equivalence.mjs`: comparación cross-version real contra el runtime pre-Player-Actions de `main@2cc068c...`, con las mismas seeds y exactamente los mismos comandos.

## 2. Inventario A0–A5

| Agente | Estado | Evidencia / observación |
|---|---|---|
| A0 | COMPLETE | PR #799. Contrato, invariantes, ownership y ZERO_ACTION_EQUIVALENCE definidos. No mergeado. |
| A1 | COMPLETE | PR #800. Core determinista, cooldowns, facts, effect allowlist y 15 tests. Repository Integrity del HEAD A1 terminó SUCCESS. No mergeado. |
| A2 | PARTIAL | PR #801. SessionCommand, persistencia, replay, rollback, view y auto:stop implementados. CI general aún estaba en curso durante la inspección. Tiene un gap de targets públicos descrito en PA-A6-001. |
| A3 | MISSING | Rama existe pero no hay implementación específica ni documento obligatorio. No hay consumers/scope Player Actions verificables. |
| A4 | PARTIAL | Preview implementado parcialmente. No documento obligatorio. No integración PlayCanvas específica. Las acciones con target no son ejecutables desde preview. |
| A5 | MISSING | Rama existe pero no hay catálogo/balance específico ni documento obligatorio. Sólo permanecen los tres fixtures A1. |

## 3. Componentes inspeccionados

- `src/player-actions/types.ts`
- `src/player-actions/catalog.ts`
- `src/player-actions/action-state.ts`
- `src/player-actions/eligibility.ts`
- `src/player-actions/effects.ts`
- `src/player-actions/executor.ts`
- `src/player-actions/validation.ts`
- `src/session/game-session.ts`
- `src/session/validate-session.ts`
- `src/save/validation.ts`
- `scripts/test-player-actions-core.mjs`
- `scripts/test-player-actions-session.mjs`
- `preview/app.js` de A4
- `preview/style.css` de A4
- workflow `Repository integrity`

## 4. Baseline

En el HEAD A2 `84dc7c9...`, el workflow Repository Integrity alcanzó y completó con SUCCESS el step `Run project validation`, que ejecuta `npm test` y por tanto comienza por `npm run build`.

Durante esta primera captura, el step `PlayCanvas integration regression` seguía en ejecución y el resto de gates globales seguían pendientes.

Resultado provisional:

- build: PASS en HEAD A2
- npm test: PASS en HEAD A2
- Repository Integrity completo: PENDING durante la captura
- A6 exact HEAD: pendiente del PR/workflow A6

## 5. ZERO_ACTION_EQUIVALENCE

### Gate añadido

`scripts/test-player-actions-zero-equivalence.mjs`

Baseline fijado:

`main@2cc068cb705214ba827677ab02d8d1668e8677ec`

Candidato:

rama A6, derivada del HEAD A2 `84dc7c93545ecece2bc91e7e61f28c98f552dc3e`.

Seeds mínimas implementadas:

`1, 2, 7, 42, 77, 125, 777, 2026, 424242`

Ventanas:

- 28 días
- 84 días
- 365 días

Metodología:

1. crear una sesión baseline y una candidate con misma seed, `sessionId` y configuración;
2. el baseline decide el siguiente comando canónico;
3. reproducir exactamente el mismo comando en candidate;
4. comparar el snapshot completo después de **cada** comando;
5. ignorar únicamente un `playerActions: undefined` top-level si existiera;
6. exigir que candidate nunca materialice `state.playerActions` cuando no se ejecuta ninguna Player Action.

Resultado: pendiente de CI A6.

## 6. RNG

Evidencia ya existente A2:

- `A2-018 NO RNG` compara todos los streams antes/después de una Player Action.
- `A2-015 NO WORLD ADVANCE` comprueba fecha y runtime day.
- `A2-016` y `A2-017` bloquean contaminación de history/provenance.

A6 añade:

- 1000 lecturas de `getView()`;
- 1000 lecturas de availability/facts;
- ejecución determinista repetida;
- checks exactos de RNG para rest/training.

Resultado final: pendiente de CI A6.

## 7. Session / atomicidad / concurrency

Cubierto por A2 y reforzado por A6:

- commandId/fingerprint;
- expectedRevision;
- replay idempotente;
- command ID reuse;
- double click;
- 20 comandos concurrentes sobre la misma revision;
- persist failure = rollback total;
- legacy resume;
- malformed save matrix.

Resultado final: pendiente de CI A6.

## 8. Authority matrix

Allowlist real observada en A1:

- `train_extra`: sólo fatigue + technique;
- `rest`: sólo fatigue + fitness;
- conversaciones con entrenador: facts/intents, sin mutación deportiva contractual.

A6 añade un snapshot de autoridad para comprobar que los fixtures no modifican directamente:

- club;
- owner/registration club;
- contract;
- market;
- national caps/role;
- appearances/roleScore;
- retirement;
- narrative history.

También se inyecta una definición adversarial con `effectKey=set_contract_salary`; debe fallar `PLAYER_ACTION_EFFECT_FORBIDDEN` y dejar el estado idéntico.

El catálogo A5 completo todavía no existe, por lo que el gate final de autoridad permanece BLOCKED aunque los fixtures pasen.

## 9. Fact scope / historical vs live

**BLOCKED por A3.**

A1 ya persiste facts con `targetId`, fecha, expiry y provenance `player_action`. Sin embargo A3 no ha implementado todavía:

- proyección historical vs active/currentlyRelevant;
- coach scope tras cambio de entrenador;
- club scope tras transferencia;
- contract scope tras renovación/firma;
- agent scope tras cambio de representante;
- consumers narrativos/sistémicos;
- NPC knowledge específico de Player Actions.

No se puede certificar PA-GATE-08 hasta que exista código A3 real.

## 10. Save compatibility

A2 ya prueba:

- exact save/load tras Player Action;
- save legacy sin `playerActions`;
- malformed `cooldown`.

A6 amplía malformed-save con:

- sequence/history imposible;
- history sin actionId válido;
- fact kind desconocido;
- fecha imposible.

Resultado final pendiente de CI A6.

## 11. Auto-simulation

A2 ya prueba:

- rechazo durante `auto_simulating`;
- rechazo con decision/result/offer/retirement;
- `auto:stop` desde paused sin avance de día/RNG;
- acción posterior al stop.

Falta todavía stress repetido y el flujo UI final A4/PlayCanvas. Gate final pendiente.

## 12. Content / balance / anti-grind / stress

**BLOCKED por A5.**

No existe todavía catálogo A5 ni balance final. El candidato contiene solamente 3 fixtures técnicos, por lo que no es válido medir:

- catálogo muerto por edades;
- contextual actions always-on;
- anti-grind de catálogo real;
- market/coach/relationship exploit del catálogo final;
- 20–50 carreras con políticas de acciones;
- crecimiento de historial/save de la feature completa.

A6 sí valida duplicados/cooldowns/options sobre el catálogo disponible como smoke test, pero esto no sustituye A5.

## 13. Preview

A4 añade navegación:

career → Gestionar mi carrera → categoría → acción → opción → resultado → carrera.

La copy deja explícito que las acciones son opcionales y mantiene `Simular` como camino principal.

### Finding bloqueante funcional de preview

Ver PA-A6-001: las acciones targetted no reciben un target público ni lo envían al backend, por lo que `PA_COACH_TALK` queda inutilizable.

Por ello PREVIEW no puede pasar todavía.

## 14. PlayCanvas

**BLOCKED.**

El diff A4 específico de Player Actions sólo modifica:

- `preview/app.js`
- `preview/style.css`

No hay integración Player Actions específica de PlayCanvas en la rama A4 inspeccionada. No se certificará PA-GATE-13 con el preview como sustituto.

## 15. Mobile / accessibility

A4 CSS sí contiene protecciones estáticas útiles:

- breakpoints 820 px, 520 px y 430 px;
- botones de al menos 48–50 px;
- `overflow-wrap:anywhere` en cards <=430 px;
- `:focus-visible` visible;
- botones HTML semánticos y disabled real.

Aun así los viewports obligatorios 360x800 / 390x844 / 430x932 requieren el candidato UI integrado y ejecutable. Gate final BLOCKED.

## 16. OPTIONALITY_UX

Evidencia estática positiva en A4:

- copy: “Estas acciones son opcionales. Puedes volver y simular cuando quieras.”
- botón `Simular` permanece principal;
- `Gestionar mi carrera` es secundario;
- no se observan contadores `3/3`, warning de tareas pendientes ni barra obligatoria.

Certificación E2E: pendiente de A4 integrado. Gate final BLOCKED.

## 17. Findings

### PA-A6-001 — targeted Player Actions unreachable from public/preview flow

**Severity:** P2  
**Owner:** RETURN_TO_A2 + RETURN_TO_A4

**Reproduction**

1. Crear carrera activa con entrenador actual `NPC_CCH_01`.
2. Llamar `GameSession.getView()`.
3. Localizar `PA_COACH_TALK`.
4. `publicPlayerActionsView()` llama `listPlayerActions(state, catalog)` sin `targetByAction`.
5. `evaluatePlayerAction()` exige target para `targetKind="coach"`.
6. La acción queda `available=false`.
7. En A4 preview no existe selector de target y el comando enviado no contiene `targetId`.

**Expected**

El frontend debe recibir opciones de target autorizadas o una proyección segura que permita seleccionar el entrenador vigente, y enviar el `targetId` exacto junto con la revision renderizada.

**Actual**

La conversación con entrenador no puede ejecutarse mediante el flujo público/preview.

**Files likely involved**

- `src/session/game-session.ts`
- `src/player-actions/eligibility.ts`
- `preview/app.js`
- contrato A4

**Acceptance test**

- `PA_COACH_TALK` se muestra ejecutable cuando existe un entrenador válido;
- la UI permite seleccionar/resolver el target;
- el comando lleva targetId;
- cambio de target/revision entre render y click falla cerrado;
- no se exponen NPCs no autorizados.

### PA-A6-002 — A3 narrative bridge absent

**Severity:** P2  
**Owner:** RETURN_TO_A3

Requiere implementación real del documento/bridge/scopes/consumers y sus tests antes de PA-GATE-08.

### PA-A6-003 — A5 final content/balance absent

**Severity:** P2  
**Owner:** RETURN_TO_A5

Requiere catálogo real, balance, age/context eligibility y tests antes de PA-GATE-10/11/stress.

### PA-A6-004 — Player Actions PlayCanvas UI absent

**Severity:** P2  
**Owner:** RETURN_TO_A4

Preview no sustituye el gate obligatorio PlayCanvas.

## 18. Gates actuales

| Gate | Estado |
|---|---|
| PA-GATE-01 BUILD | BLOCKED — PASS preliminar A2; falta exact A6 HEAD |
| PA-GATE-02 EXISTING REGRESSION | BLOCKED — Repository Integrity A2 aún no había terminado en captura |
| PA-GATE-03 ZERO_ACTION_EQUIVALENCE | BLOCKED — gate cross-version creado, pendiente CI |
| PA-GATE-04 RNG | BLOCKED — tests dirigidos existen, pendiente A6 exact HEAD |
| PA-GATE-05 SESSION_ATOMICITY | BLOCKED — cobertura fuerte, pendiente A6 exact HEAD |
| PA-GATE-06 SAVE_COMPATIBILITY | BLOCKED — cobertura ampliada, pendiente A6 exact HEAD |
| PA-GATE-07 AUTHORITY | BLOCKED — fixtures cubiertos; falta catálogo A5 |
| PA-GATE-08 FACT_SCOPE | BLOCKED — A3 missing |
| PA-GATE-09 AUTO_SIM | BLOCKED — backend cubierto; falta integración/UI stress |
| PA-GATE-10 CONTENT | BLOCKED — A5 missing |
| PA-GATE-11 ANTI_GRIND | BLOCKED — A5 missing |
| PA-GATE-12 PREVIEW | FAIL — PA-A6-001 |
| PA-GATE-13 PLAYCANVAS | BLOCKED — implementación A4 ausente |
| PA-GATE-14 MOBILE | BLOCKED — necesita UI integrada/E2E |
| PA-GATE-15 OPTIONALITY_UX | BLOCKED — evidencia estática positiva, E2E pendiente |

## 19. Fixes A6

A6 no ha modificado arquitectura productiva.

Cambios A6:

- añade gate cross-version de ZERO_ACTION_EQUIVALENCE;
- añade suite final cross-system;
- añade script npm `test:player-actions-final`;
- añade workflow A6 específico.

El bug PA-A6-001 se entrega a A2/A4 porque resolver targets públicos es parte del contrato de sesión/UI, no glue menor de QA.

## 20. Riesgos residuales

1. Target selection/staleness no resuelto.
2. A3 inexistente: scopes y consumers sin validar.
3. A5 inexistente: balance y exploits no medibles.
4. PlayCanvas no implementado.
5. A0–A2 todavía no integrados en main.
6. Stress de carreras largas con políticas Player Actions no es representativo hasta disponer de A5.
7. El crecimiento real del save/history no es medible con catálogo fixture.

## 21. Recomendación técnica actual

**DO_NOT_MERGE como feature final.**

Sí es razonable usar A2/A6 como base técnica de validación, pero no certificar Player Actions hasta cerrar A3, A4, A5, corregir PA-A6-001 y re-ejecutar todos los gates sobre un único HEAD integrado.

## 22. Trabajo restante A6

Cuando los upstreams estén disponibles:

1. ejecutar y cerrar A6 focused + cross-version zero-action;
2. integrar/revalidar A3 scope matrix;
3. auditar catálogo A5 y anti-grind;
4. ejecutar 20–50 carreras largas con políticas;
5. medir save size/performance;
6. preview E2E;
7. PlayCanvas E2E;
8. 360/390/430 mobile;
9. optionality/accessibility final;
10. retest completo y actualizar este documento a CERTIFIED o NOT_CERTIFIED.
