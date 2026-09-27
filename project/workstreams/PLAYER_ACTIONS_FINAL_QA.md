# PLAYER_ACTIONS_FINAL_QA — A6

**Estado:** NOT_CERTIFIED  
**Recomendación:** DO_NOT_MERGE como feature final  
**Repositorio:** `capitanps02/Juego-Multihistoria`  
**BASE_SHA / main inspeccionado:** `2cc068cb705214ba827677ab02d8d1668e8677ec`  
**Rama A6:** `a6/player-actions-final-qa`  
**PR A6:** #805 (draft)  
**Corte de evidencia:** 2026-09-27

## 1. Resumen ejecutivo

Player Actions tiene una base técnica sólida, pero todavía no cumple los criterios de release A6.

Resultados fuertes ya medidos:

- ZERO_ACTION_EQUIVALENCE pasa con **0 diferencias** contra el runtime pre-feature.
- A2 conserva atomicidad, replay, rollback, save legacy y bloqueo de estados.
- A3 conserva autoridad: las acciones escriben facts/intents y los sistemas autorizados consumen esos facts; no crean directamente ofertas, contratos o cambios de club.
- A4 tiene implementación real tanto en preview/web como en bundle PlayCanvas, con su suite UI verde para los flujos targetless.
- El slice A5 probado completa **80 carreras / 0 crashes** y también pasa zero-action.
- No se ha encontrado ningún P0 ni P1.

Bloqueos de release:

1. las acciones con target siguen sin ser ejecutables desde la API pública/UI porque A2 no proyecta targets autorizados;
2. A5 sigue PARTIAL/BLOCKED: runtime actual = **6 acciones**, frente a la matriz V1 de 20;
3. anti-grind falla en training y rest;
4. PlayCanvas no puede certificarse end-to-end para acciones targetted;
5. mobile 360/390/430 sólo tiene cobertura contractual/estática, no viewport E2E;
6. varios probes A6 recién añadidos (collision/future-RNG) permanecían en cola en el último HEAD al congelar esta evidencia.

## 2. Inventario A0–A5

| Agente | Estado A6 | Evidencia |
|---|---|---|
| A0 | COMPLETE | PR #799. Contrato, ownership, invariantes, ZERO_ACTION_EQUIVALENCE y límites de autoridad. No mergeado a main. |
| A1 | COMPLETE | PR #800. Core, eligibility/cooldowns, fact-first model, fail-closed targets, closed effect registry, 15 tests. |
| A2 | PARTIAL | PR #801. SessionCommand, revision/fingerprint, receipts/replay, persistence, legacy saves, PlayerView, auto:stop. Falta contrato público de targets. HEAD actual sólo añade CI sobre el código ya inspeccionado. |
| A3 | COMPLETE para slice actual | PR #803, HEAD `75be938...`. Historical/live, coach/club/contract/agent scopes, narrative consumer, market consumer, no extra RNG, 15-case suite. |
| A4 | PARTIAL | PR #804. Preview + web UI + PlayCanvas + 15 UI tests. Targetless flow verde; explícitamente BLOCKED_BY_A2_PUBLIC_VIEW para targets. |
| A5 | PARTIAL / BLOCKED | PR #802, snapshot `2e61c047...`: 6 acciones runtime de 20 previstas; documento de 20 acciones y content-plan existen; faltan health, age/context, shared cooldown y extensiones de intents. |

## 3. Componentes inspeccionados

A6 verificó código real y no sólo handoffs:

- `src/player-actions/**`
- `src/session/game-session.ts`
- session/save validation
- A3 facts/bridge/market consumer
- A4 preview, `web/game-ui.*`, PlayCanvas bundle/manifest
- A5 catalog/effects/content tests/content-plan
- workflows de A1–A5
- tests de core/session/narrative/UI/content
- saves, auto-simulation y regresiones PlayCanvas relevantes

## 4. Baseline y regresión

Baseline pre-feature:

`main@2cc068cb705214ba827677ab02d8d1668e8677ec`

Evidencia:

- A2: build + `npm test` PASS; core A1 15/15, session A2 23/23 y regresiones de auto/save verdes.
- A4 dedicated workflow: A2+A4 **39/39 PASS**.
- A4 PlayCanvas/A19 regression: **11/11 PASS**.
- A5 snapshot probado: build PASS; content suite **12 PASS / 0 FAIL / 2 TODO**. En el HEAD A5 posterior los dos TODO se transformaron en assertions explícitas de contract gaps; catalog/effects no cambiaron desde el snapshot estresado.

No se ha observado regresión existente atribuible a Player Actions en los suites completados.

## 5. ZERO_ACTION_EQUIVALENCE — gate crítico

A6 creó:

`scripts/test-player-actions-zero-equivalence.mjs`

Seeds:

`1, 2, 7, 42, 77, 125, 777, 2026, 424242`

Ventanas:

- 28 días
- 84 días
- 365 días

Metodología:

1. compilar baseline pre-feature y candidato;
2. misma seed, sessionId y configuración;
3. dejar que el baseline determine el siguiente comando canónico;
4. reproducir el comando idéntico en candidate;
5. comparar snapshots completos tras **cada comando**;
6. incluir rngState, history, market, sport, professional, retirement, age milestones, pending state y seeds;
7. tolerar únicamente un campo `playerActions: undefined` vacío;
8. exigir que cero acciones no materialice el store Player Actions.

Resultados medidos:

- A2/A6 source: PASS
- A3 `75be938...`: PASS
- A4 runtime source `ee07c945...`: PASS; el HEAD A4 posterior sólo cambia documentación
- A5 runtime snapshot `bf13494...`: PASS; el HEAD A5 `2e61c047...` mantiene catalog/effects del snapshot probado

Por candidato: 9 seeds × 3 ventanas = 27 checkpoints.  
Diferencias causales: **0**.

**PA-GATE-03 = PASS** para todo el runtime implementado hasta este corte.

## 6. Pureza y RNG

Cubierto y verde:

- `getView()` repetido 1000 veces no muta snapshot ni materializa store.
- list/evaluate/facts repetidos no mutan estado.
- acciones deterministas preservan los streams RNG inmediatamente.
- A3 projection/bridge usa cero draws extra.
- zero-action compara snapshot/RNG completos.
- A4 PlayCanvas regression conserva estado y RNG a través de 20 decisiones interactivas.

A6 añadió además `A6-019 NARRATIVE RNG FUTURE`: neutraliza únicamente el efecto físico legítimo de REST y compara el stream narrativo posterior. Ese probe estaba aún en cola en el último HEAD al cerrar el informe, por lo que el gate final completo queda conservadoramente BLOCKED pese a la evidencia inmediata positiva.

## 7. Session / replay / concurrency / rollback

Evidencia verde ya ejecutada:

- fingerprint incluye `targetId`;
- expectedRevision;
- replay exacto sin duplicar efectos/history/intents/cooldowns;
- reuse de commandId con payload distinto falla;
- 20 comandos simultáneos con misma revision: 1 commit y 19 STALE_REVISION;
- persist failure: rollback total;
- Player Action no avanza día/mundo;
- decision/result/offer/retirement bloquean acciones;
- pause/stop recupera idle sin avance oculto.

A6 añadió probes específicos de decision collision, offer collision y retirement collision contra una acción renderizada con revision antigua. Permanecían en cola al congelar evidencia; por eso el gate final de atomicidad cross-system no se sobre-certifica.

## 8. Save compatibility

PASS sobre el slice implementado:

- action → save → load → continue conserva estado;
- legacy save sin `playerActions` carga, mantiene el campo ausente en lecturas y permite materializarlo sólo al ejecutar la primera acción;
- malformed store falla cerrado;
- casos A6 incluyen cooldown inválido, fecha imposible, sequence/history incoherente, actionId vacío y fact kind desconocido;
- persistence failure no publica revision ni efectos parciales.

No se incrementó artificialmente SESSION_VERSION/schema sólo por el campo opcional.

## 9. Authority matrix

Comprobaciones ejecutadas sobre acciones implementadas:

No pueden escribir directamente:

- club;
- ownerClub / registrationClub;
- contract terms;
- market pending;
- national caps/role;
- appearances/role;
- retirement;
- narrative history;
- seeds.

A6 inyecta una definición maliciosa con `effectKey=set_contract_salary`; el registry la rechaza con `PLAYER_ACTION_EFFECT_FORBIDDEN` y estado idéntico.

Casos A3/A5:

- REQUEST_TRANSFER: crea fact/intención, no oferta ni cambio de club.
- REQUEST_RENEWAL: crea fact, no extiende contrato ni cambia salario.
- MORE_MINUTES: no crea apariciones, titularidad ni resultados.
- ASK_AGENT_MARKET: no crea CareerOffer ni interés ficticio.

El productor de mercado sigue siendo la autoridad que crea la oferta.

## 10. Fact scopes / historical vs live / privacidad

A3 implementa:

- `historicalExists`;
- `currentlyRelevant`;
- club scope;
- coach scope exacto;
- contract/renewal resolution;
- agent/representation scope;
- read-only `playerActionFacts(state)`;
- no propagación automática a prensa, compañeros u otros entrenadores;
- no seeds ni fake EventDefinition/originEvent.

El consumer de transfer request no crea una oferta. Mientras la petición está live, eleva un umbral del productor autorizado en **+12**; el valor no se acumula con solicitudes repetidas porque el bridge consulta relevancia booleana y aplica un bonus constante.

## 11. Auto-sim y colisiones

Backend/A4 ya cubren:

- idle: acciones targetless permitidas;
- auto_simulating: rechazadas;
- paused: bloqueadas hasta stop según contrato;
- waiting decision/result/offer: rechazadas;
- retirement closed: rechazada;
- auto:stop no avanza tiempo/RNG;
- UI busy guard evita double-click.

Los tests específicos stale-after-decision/offer/retirement están añadidos a A6 y pendientes de ejecución exacta del último HEAD.

## 12. Content catalog

A5 snapshot de release no está completo.

Runtime actual:

1. PA_TRAIN_EXTRA
2. PA_REST
3. PA_COACH_TALK
4. PA_REQUEST_TRANSFER
5. PA_REQUEST_RENEWAL
6. PA_AGENT_MARKET

Matriz objetivo documentada: 20 acciones.

Gaps explícitos:

- health category no soportada por A1;
- age/context eligibility insuficiente;
- veteran/young teammate predicates;
- shared/group cooldown;
- intents opcionales de position change, withdraw transfer, career priority, veteran advice y mentor young.

A6 añadió `A6-015 CONTENT RELEASE READINESS` para que no sea posible aprobar accidentalmente un catálogo fixture/partial como release final.

## 13. Stress / balance / anti-grind

### A2/core fixture stress

20 seeds × 4 políticas × 365 días = **80 carreras, 0 crashes**.

Políticas: none, training-heavy, rest-heavy, mixed.

Con cooldown REST=1 día del slice A2:

- rest-heavy: 365 acciones/año;
- fitness medio 99.95;
- fatigue medio 0.175;
- save medio ~314.7 KB;
- mixed: 418 acciones/año;
- technique 88.5;
- fitness 99.95;
- save medio ~345.4 KB, max ~347.5 KB.

Esto confirmó el exploit y motivó la comprobación del A5 rebalanceado.

### A5 implemented slice stress

Mismo protocolo, 20 seeds × 4 políticas × 365 días = **80 carreras, 0 crashes**.

Baseline:
- technique 62
- fatigue 19.845
- fitness 81.395
- save ~55.4 KB

Training-heavy con stepping semanal:
- 26 acciones;
- technique 75.

Mixed con polling diario, que permite el máximo real del cooldown de training de 10 días:
- 90 acciones totales;
- technique **80.5**;
- fatigue 3.095;
- fitness **99.845**;
- save medio ~147.0 KB.

Rest-heavy con cooldown 7 días:
- 53 acciones;
- fatigue **0.275**;
- fitness **99.91**;
- save medio ~125.2 KB.

Conclusión:

- Training sigue permitiendo aproximadamente **+18.5 técnica en una temporada** vía menú opcional.
- Rest sigue manteniendo recuperación prácticamente perfecta durante un año.

**PA-GATE-11 = FAIL.**

### Market / coach exploit

- Transfer request no acumula bonus; bridge actual usa un único +12 mientras el fact está vigente.
- La acción no fabrica ofertas; la oferta sigue saliendo del productor autorizado y del roll determinista existente.
- More-minutes no modifica directamente titularidad/apariciones/resultados.

No se ha detectado el patrón de “cada click garantiza oferta/titularidad”; el problema de balance demostrado está en training/rest.

## 14. Save size

A5 mixed 1-year:

- max history entries: 90;
- max facts: 90;
- max save: ~148 KB.

A2 worst-case pre-rebalance:

- 418 history/facts;
- ~347 KB.

El crecimiento es aproximadamente lineal con acciones/facts. No se considera corrupción ni P0/P1. Se registra como P3/riesgo residual para carreras largas y futura compactación si el catálogo final aumenta mucho la frecuencia.

## 15. Performance

No se observan crashes ni bloqueo del loop.

Medición orientativa en CI con `events: []`:

- A5 none: ~0.11 s por carrera de 365 días;
- A5 mixed: ~1.43 s por carrera de 365 días;
- A2 worst mixed de 418 acciones: ~8.61 s por carrera.

A6 añadió `scripts/bench-player-actions.mjs` para separar `getView`, availability, execution y serialization; ese workflow estaba en cola al congelar evidencia. No se usa una métrica pendiente para declarar PASS.

## 16. Preview / PlayCanvas / Mobile / Optionality

A4 existe realmente en ambas superficies:

- preview;
- `web/game-ui.js/css`;
- PlayCanvas bundle/manifest.

Suite A4:

- A2+A4: 39/39 PASS
- PlayCanvas/A19: 11/11 PASS
- SIMULAR permanece CTA principal;
- Player Actions se presenta como opcional;
- double click y stale recovery cubiertos;
- mobile one-column contract y accessibility basics cubiertos.

### P2 público de targets

`publicPlayerActionsView()` evalúa acciones targetted sin proyectar un target autorizado. A1 exige target para coach/agent/teammate. Resultado: `PA_COACH_TALK` llega como unavailable y A4 no puede enviar `targetId` sin inventar autoridad.

A6 dejó el acceptance `A6-014 TARGETED PUBLIC FLOW` deliberadamente rojo hasta que A2 exponga targets saneados.

Por tanto:

- preview targetless: funcional;
- preview completo: FAIL;
- PlayCanvas targetless: suite PASS;
- PlayCanvas feature completa: BLOCKED;
- mobile CSS/contract: PASS parcial;
- viewport E2E 360x800 / 390x844 / 430x932: BLOCKED.

## 17. Findings

### PA-A6-001 — Public target flow inexistente

**Severity:** P2  
**Owner:** RETURN_TO_A2 + RETURN_TO_A4

**Reproduction:** abrir carrera, localizar PA_COACH_TALK en PlayerView. Se proyecta sin target autorizado y queda unavailable. A4 no dispone de selector/resolución pública segura.

**Expected:** targets saneados y authority-backed en PlayerView; UI envía targetId exacto con la revision renderizada; target/revision stale falla cerrado.

**Actual:** coach/agent/teammate actions no son ejecutables por el flujo público.

**Files likely involved:** `src/session/game-session.ts`, PlayerView contract, `web/game-ui.js`, `preview/app.js`.

**Acceptance test:** A6-014 verde + stale-target test + cero private-field leakage.

### PA-A6-002 — Catálogo release incompleto

**Severity:** P2  
**Owner:** RETURN_TO_A1 + RETURN_TO_A3 + RETURN_TO_A5

**Reproduction:** inspeccionar `PLAYER_ACTION_CATALOG`: 6 acciones runtime frente a matriz final de 20; faltan health/age/context/shared cooldown y varias families.

**Expected:** catálogo V1 aprobado completamente expresable por contratos seguros.

**Actual:** A5 = PARTIAL/BLOCKED.

**Files likely involved:** `src/player-actions/types.ts`, eligibility/effects/facts registries, catalog/content-plan, A3 intents.

**Acceptance test:** A6-015 verde + A5 suite sin contract gaps + 20-action automated audit.

### PA-A6-003 — Training grind

**Severity:** P2  
**Owner:** RETURN_TO_A5

**Reproduction:** 20 seeds, 365 días, mixed daily polling sobre A5 slice. Technique media 62 → 80.5.

**Expected:** menú opcional no debe producir progresión dominante por spam de cooldown.

**Actual:** ~+18.5 técnica/año por Player Actions.

**Files likely involved:** training effect magnitude + cooldown/eligibility A5.

**Acceptance test:** repetir misma política 20+ seeds y demostrar ceiling razonable documentado respecto a none.

### PA-A6-004 — Rest/recovery exploit

**Severity:** P2  
**Owner:** RETURN_TO_A5

**Reproduction:** rest-heavy A5, 53 acciones/año. Fitness 99.91; fatigue 0.275.

**Expected:** recuperación útil pero no fitness ~100/fatigue ~0 permanente; nunca debe borrar lesión canónica.

**Actual:** estado físico prácticamente perfecto durante una temporada.

**Files likely involved:** rest effect magnitude, cooldown/context eligibility.

**Acceptance test:** stress anual 20+ seeds con delta explícito versus none; injury/recovery authority intacta.

### PA-A6-005 — Crecimiento lineal de save

**Severity:** P3  
**Owner:** A2/A5 future optimization

**Reproduction:** 90 acciones A5 → ~148 KB; 418 acciones A2 worst-case → ~347 KB.

**Expected:** crecimiento controlado en carrera larga.

**Actual:** history y facts crecen linealmente.

**Acceptance:** medir carrera completa con catálogo final antes de decidir compactación. No optimizar prematuramente.

## 18. Gates finales en este corte

| Gate | Estado | Evidencia |
|---|---|---|
| PA-GATE-01 BUILD | PASS | A2/A4/A5 builds verdes en runs ejecutados. |
| PA-GATE-02 EXISTING REGRESSION | PASS | npm test/regresiones relevantes verdes en A2/A4; no regresión conocida introducida. |
| PA-GATE-03 ZERO_ACTION_EQUIVALENCE | PASS | A2/A3/A4/A5 runtime; 9 seeds × 3 ventanas; 0 diferencias. |
| PA-GATE-04 RNG | BLOCKED | immediate/no-extra RNG PASS; A6-019 future-stream exact probe aún en cola. |
| PA-GATE-05 SESSION_ATOMICITY | BLOCKED | replay/concurrency/rollback PASS; A6-016..018 collision probes exactos aún en cola. |
| PA-GATE-06 SAVE_COMPATIBILITY | PASS | save/load, legacy, malformed y rollback cubiertos. |
| PA-GATE-07 AUTHORITY | PASS | slice implementado + malicious-effect guard + A3/A5 authority tests. |
| PA-GATE-08 FACT_SCOPE | PASS | A3 historical/live y club/coach/contract/agent scope implementados/testeados. |
| PA-GATE-09 AUTO_SIM | PASS | A2/A4 lock/stop/resume behavior cubierto. |
| PA-GATE-10 CONTENT | FAIL | 6/20 runtime; contracts incompletos. |
| PA-GATE-11 ANTI_GRIND | FAIL | training +18.5 technique/año; rest ~99.9 fitness/~0 fatigue. |
| PA-GATE-12 PREVIEW | FAIL | targetted flow no ejecutable. |
| PA-GATE-13 PLAYCANVAS | BLOCKED | targetless suite verde; targetted flow depende de PA-A6-001. |
| PA-GATE-14 MOBILE | BLOCKED | responsive contract verde; viewports E2E no certificados. |
| PA-GATE-15 OPTIONALITY_UX | PASS | A4-001/A4-002 y copy: SIMULAR suficiente, sin tasks/quota obligatoria. |

Resumen gates:

- PASS: 9
- FAIL: 3
- BLOCKED: 3

## 19. Fixes A6

A6 no ha hecho refactor productivo.

Añadido:

- `scripts/test-player-actions-final.mjs`;
- `scripts/test-player-actions-zero-equivalence.mjs`;
- `scripts/stress-player-actions-backend.mjs`;
- `scripts/bench-player-actions.mjs`;
- workflows A6 y snapshot QA A5;
- gates explícitos para target public flow y content readiness;
- tests de collision y narrative future RNG;
- este informe;
- handoffs precisos en PR #801 y PR #802.

## 20. Riesgos residuales

1. No existe aún un único HEAD integrado A0–A5 listo para release.
2. A2 public target contract sigue bloqueando coach/agent/teammate UI.
3. A5 sigue al 52% y su catálogo final no existe.
4. Training/rest requieren rebalance.
5. Viewport visual mobile real pendiente.
6. Save growth debe repetirse en carrera larga con catálogo final.
7. Market transfer bonus actual es bounded (+12, no stack), pero debe revalidarse con el catálogo final y carreras completas.

## 21. Recomendación técnica

**DO_NOT_MERGE como feature final.**

Sí puede continuarse usando A1/A2/A3/A4 como base y el slice A5 como laboratorio, porque zero-action, authority, save compatibility y los flujos targetless son sólidos.

No debe declararse Player Actions CERTIFIED hasta que:

- PA-A6-001 se cierre;
- A5 llegue al catálogo release y cierre sus contract gaps;
- training/rest superen anti-grind;
- A6-016..019 ejecuten verdes en el HEAD integrado;
- PlayCanvas targetted E2E pase;
- 360/390/430 viewport E2E pase;
- se repitan zero-action/stress sobre el único HEAD final.

## 22. Trabajo restante A6

- 3 gates FAIL por corregir;
- 3 gates BLOCKED por desbloquear/ejecutar;
- 4 P2 por cerrar;
- 1 P3 por monitorizar;
- retest final sobre un único candidato integrado.

Estimación residual una vez resueltos los upstream contracts: **~5–8 horas-agente equivalentes**.
