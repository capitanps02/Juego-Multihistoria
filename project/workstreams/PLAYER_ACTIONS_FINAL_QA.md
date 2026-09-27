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
- A3 está implementado en PR #803 (HEAD `75be938bbe4a6f7a01ef45a5078a6bfa6d77262d`) con bridge factual, scopes, consumers, documento y 15 tests; sigue sin integrarse con A4/A6 en un único HEAD final.
- A4 está implementado en PR #804 (HEAD `ee07c945e9f6d714fb921f4f98af06f6699d223b`) e incluye preview, `web/game-ui.js`, bundle/manifest PlayCanvas, documento y 15 tests. A4 declara el mismo bloqueo A2 de targets detectado por A6.
- A5 existe en draft PR #802 (HEAD `5aa4c530338f383a62fdaf8bc0df6e4f49ff3be5`) con diseño de 20 acciones, balance y exploit review, pero está explícitamente `BLOCKED / DESIGN READY — 35%`: 0/20 acciones A5 implementadas.
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
| A3 | COMPLETE | PR #803. Bridge read-only, historical/live, club/coach/contract/agent scopes, consumer narrativo y consumer de mercado, documento y 15 tests. Falta certificación integrada final. |
| A4 | PARTIAL | PR #804. Preview + web UI + bundle PlayCanvas + documento + 15 tests. Mantiene bloqueo explícito `BLOCKED_BY_A2_PUBLIC_VIEW` para targets. |
| A5 | PARTIAL | Draft PR #802. 20 acciones diseñadas y balanceadas en documento, pero 0/20 implementadas; bloqueado por extensibilidad A1 y parte del contrato A3. |

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

Resultado medido en CI A6: **PASS**.

- 9 seeds: 1, 2, 7, 42, 77, 125, 777, 2026, 424242.
- 3 ventanas: 28, 84 y 365 días.
- 27 checkpoints de ventana.
- comparación después de cada comando reproducido.
- differences: 0.
- `state.playerActions` no se materializa por reads/zero-action.

El mismo harness cross-version también terminó **PASS** para:
- A3 HEAD `75be938bbe4a6f7a01ef45a5078a6bfa6d77262d`;
- A4 runtime HEAD `ee07c945e9f6d714fb921f4f98af06f6699d223b` (el HEAD posterior A4 sólo añade documentación).

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

Resultado A6 focused antes del acceptance blocker: PASS. En la suite actual, 13/14 probes pasan; el único FAIL es A6-014, creado deliberadamente para PA-A6-001. RNG, determinismo, concurrency, replay, rollback, malformed/legacy save, cooldown y authority fixtures permanecen verdes.

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

A3 PR #803 implementa y documenta:

- `historicalExists` vs `currentlyRelevant`;
- coach scope con club + coach exactos;
- club scope para transfer request;
- contract/renewal resolution a través de autoridad formal posterior;
- agent scope con representación certificada;
- proyección read-only `playerActionFacts(state)`;
- consumer narrativo declarativo;
- consumer sistémico de mercado sin draw adicional;
- privacidad: no NPC/global knowledge propagation.

Su suite declara 15 casos dirigidos, incluidos club/coach scope, renewal, agent, no-extra-RNG, historical/live, save/load y privacy.

A3 ha pasado `npm test` dentro de Repository Integrity hasta el step de project validation y además ha pasado el harness cross-version de A6. El componente A3 queda técnicamente validado de forma aislada; PA-GATE-08 permanece **BLOCKED** únicamente hasta repetir estos checks en el único HEAD integrado con A4/A5/A6.

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

**BLOCKED por A5 runtime.**

A5 PR #802 ya entrega diseño de 20 acciones, matriz de disponibilidad, cooldowns, efectos propuestos, límites de balance y exploit review, pero declara 0/20 acciones implementadas y 0/12 tests A5 ejecutables. El candidato runtime sigue conteniendo solamente 3 fixtures técnicos, por lo que todavía no es válido certificar:

- catálogo muerto por edades;
- contextual actions always-on;
- anti-grind de catálogo real;
- market/coach/relationship exploit del catálogo final;
- 20–50 carreras con políticas de acciones;
- crecimiento de historial/save de la feature completa.

A6 sí valida duplicados/cooldowns/options sobre el catálogo disponible como smoke test, pero esto no sustituye A5.

### Stress backend sobre fixtures actuales

A6 ejecutó 80 carreras de 365 días: 20 seeds × políticas none / training-heavy / rest-heavy / mixed.

Resultado de estabilidad:
- 80/80 carreras completadas;
- 0 crashes;
- no invalid states observados por el harness.

Resultados medios:
- none: 0 acciones, technique 62, fatigue 19.845, fitness 81.395, save 55,428 B.
- training-heavy: 52 acciones, technique 88, fatigue 35.21, fitness 77.815, save 89,808 B.
- rest-heavy: 365 acciones, technique 62, fatigue 0.175, fitness 99.95, save 314,722 B.
- mixed: 418 acciones, technique 88.5, fatigue 1.28, fitness 99.95, save 345,352 B; max 347,493 B.

Conclusión:
- estabilidad del backend fixture: PASS;
- balance/anti-grind del runtime actual: **FAIL**;
- training-heavy produce +26 puntos de technique en una temporada;
- rest-heavy mantiene prácticamente fitness 100 y fatigue 0;
- mixed combina ambos extremos;
- el crecimiento de save es material porque cada acción añade history/fact; con cooldowns A5 6–90d debería reducirse, pero debe re-medirse.

Estos resultados son sobre fixtures A1 y no sobre el diseño A5 definitivo. Precisamente demuestran que los fixtures no son contenido de release.

## 13. Preview

A4 añade navegación:

career → Gestionar mi carrera → categoría → acción → opción → resultado → carrera.

La copy deja explícito que las acciones son opcionales y mantiene `Simular` como camino principal.

### Finding bloqueante funcional de preview

Ver PA-A6-001: las acciones targetted no reciben un target público ni lo envían al backend, por lo que `PA_COACH_TALK` queda inutilizable.

Por ello PREVIEW no puede pasar todavía.

## 14. PlayCanvas

**BLOCKED, pero implementación A4 sí existe.**

El HEAD actual de A4 #804 modifica específicamente:

- `web/game-ui.js`
- `web/game-ui.css`
- `playcanvas/multihistoria.js`
- `playcanvas/manifest.json`
- `preview/app.js`
- `preview/style.css`
- workflow `player-actions-ui.yml`
- suite `test-player-actions-ui-contract.mjs`

El workflow específico A4 terminó **SUCCESS**:
- suite session + UI contract: 39 PASS / 0 FAIL;
- build PlayCanvas package: PASS;
- PlayCanvas regression + A19 UI: 11 PASS / 0 FAIL;
- A4-014 mobile contract: PASS;
- A4-015 accessibility contract: PASS.

A6 no marcará PA-GATE-13/14 como PASS final hasta corregir el target contract y repetir E2E sobre el HEAD integrado, pero la implementación aislada de A4 está verde.

Importante: `test-player-actions-ui-contract.mjs` mezcla runtime assertions con inspección estática de fuentes. En concreto:
- A4-014 MOBILE comprueba media queries/grid/overflow por regex; **no** renderiza 360x800, 390x844 ni 430x932.
- A4-015 ACCESSIBILITY comprueba presencia de button/aria-busy/focus/back paths; **no** ejecuta navegación por teclado real.
- `test-playcanvas.mjs` valida el paquete PlayCanvas y equivalencia de estado/RNG, pero no simula clicks Player Actions category → action → option → result dentro de un viewport PlayCanvas.

Por ello esos checks son evidencia positiva, no sustituyen los gates E2E A6.

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

### PA-A6-002 — A5 final catalog is design-only, not runtime

**Severity:** P2  
**Owner:** RETURN_TO_A1 + RETURN_TO_A3 + RETURN_TO_A5

A5 #802 diseña 20 acciones, pero declara explícitamente 0/20 implementadas. El core actual no soporta todavía de forma segura `health`, registries extensibles de effects/eligibility/facts, target predicates veteran/young ni shared cooldown anti-target-farming. No se puede certificar CONTENT hasta resolver esos contratos e implementar el catálogo.

### PA-A6-003 — current fixture balance is exploitable

**Severity:** P2  
**Owner:** RETURN_TO_A5

**Evidence**
- 20-seed × 365-day training-heavy: 52 actions/year, average technique 62 → 88.
- rest-heavy: 365 actions/year, average fitness 99.95, fatigue 0.175.
- mixed: 418 actions/year, average technique 88.5, fitness 99.95, fatigue 1.28.

**Expected**
Optional actions may help slightly but no spam policy should dominate progression or make recovery effectively perfect.

**Actual**
Current A1 fixtures create extreme stat acceleration/recovery.

**Acceptance**
Repeat the same policy stress on final A5 content and show materially bounded deltas with no strategy that becomes mandatory/obviously dominant.

## 18. Gates actuales

| Gate | Estado |
|---|---|
| PA-GATE-01 BUILD | BLOCKED — PASS preliminar A2; falta exact A6 HEAD |
| PA-GATE-02 EXISTING REGRESSION | BLOCKED — Repository Integrity A2 aún no había terminado en captura |
| PA-GATE-03 ZERO_ACTION_EQUIVALENCE | PASS — A2/A6 + A3 + A4, 9 seeds × 28/84/365 días, 0 diferencias |
| PA-GATE-04 RNG | PASS — deterministic actions/read projections preserve RNG; A3 consumer adds 0 draws |
| PA-GATE-05 SESSION_ATOMICITY | PASS — replay/concurrency/rollback probes green; target flow is a separate P2 |
| PA-GATE-06 SAVE_COMPATIBILITY | PASS — legacy + malformed matrix + rollback/save-load probes green |
| PA-GATE-07 AUTHORITY | BLOCKED — fixtures cubiertos; falta catálogo A5 |
| PA-GATE-08 FACT_SCOPE | BLOCKED — A3 #803 implementado; falta certificar e integrar en HEAD final |
| PA-GATE-09 AUTO_SIM | BLOCKED — backend cubierto; falta integración/UI stress |
| PA-GATE-10 CONTENT | FAIL — runtime actual sólo tiene 3 fixtures; A5 0/20 implementadas |
| PA-GATE-11 ANTI_GRIND | FAIL — training +26 technique/año; rest mantiene fitness ~99.95/fatigue ~0.18 |
| PA-GATE-12 PREVIEW | FAIL — PA-A6-001 |
| PA-GATE-13 PLAYCANVAS | BLOCKED — A4 #804 existe; falta target fix + certificación integrada |
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

1. Target selection/staleness no resuelto en contrato público A2/A4.
2. A3 existe y cubre scopes/consumers, pero aún no está integrado con A4/A6 en un único candidato.
3. A5 sigue en diseño: el catálogo real no es medible aún; los fixtures actuales sí han demostrado exploits graves de grind/recovery.
4. A4 PlayCanvas existe, pero no puede certificar acciones targetted hasta corregir A2.
5. A0–A4 todavía no están integrados en main y A3/A4 son ramas paralelas sobre A2.
6. Stress de carreras largas con políticas Player Actions no es representativo hasta disponer de A5.
7. El crecimiento real del save/history no es medible con catálogo fixture.

## 21. Recomendación técnica actual

**DO_NOT_MERGE como feature final.**

Sí es razonable usar A2/A3/A4/A6 como base técnica, pero no certificar Player Actions hasta corregir PA-A6-001, desbloquear e implementar A5, integrar A3+A4+A5 en un único HEAD y re-ejecutar todos los gates.

## 22. Trabajo restante A6

Cuando los upstreams estén disponibles:

1. ejecutar y cerrar A6 focused + cross-version zero-action;
2. certificar A3 #803 y revalidar scope matrix en el candidato integrado;
3. corregir contrato de targets A2/A4;
4. desbloquear/implementar catálogo A5 y auditar anti-grind;
5. ejecutar 20–50 carreras largas con políticas;
6. medir save size/performance;
7. preview E2E;
8. PlayCanvas E2E;
9. 360/390/430 mobile + optionality/accessibility;
10. retest completo y actualizar este documento a CERTIFIED o NOT_CERTIFIED.
