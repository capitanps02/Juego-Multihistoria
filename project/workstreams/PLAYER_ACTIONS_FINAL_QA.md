# PLAYER_ACTIONS_FINAL_QA — A6

**Estado:** NOT_CERTIFIED  
**Recomendación:** DO_NOT_MERGE como feature final  
**Repositorio:** `capitanps02/Juego-Multihistoria`  
**BASE_SHA:** `2cc068cb705214ba827677ab02d8d1668e8677ec`  
**Rama A6:** `a6/player-actions-final-qa`  
**PR A6:** #805 (draft; base QA aislada para reducir ruido de CI)  
**Corte de evidencia:** 2026-09-27

## 1. Resumen ejecutivo

A6 confirma que la arquitectura base de Player Actions es segura, determinista y zero-action compatible, pero la feature todavía no es certificable como release final.

### Evidencia fuerte ya obtenida

- **ZERO_ACTION_EQUIVALENCE:** PASS contra el runtime pre-feature, con 9 seeds y ventanas 28/84/365 días; 0 diferencias causales.
- **P0:** 0.
- **P1:** 0.
- Replay, concurrency, rollback, legacy saves, malformed saves y lazy store tienen evidencia positiva.
- A3 conserva autoridad: Player Actions escriben facts/intents; ofertas, contratos, club, selección y retirement siguen en sus productores autorizados.
- El adapter público de targets ya está implementado en **A2 follow-up #806**.
- A4 ya implementa selector público de target, exact `targetId`, history saneado y UI target-aware.
- A4 está **CERTIFIED upstream** en run **36316821115 — SUCCESS**: **46/46 PASS** en A2 session + A4 contract, **11/11 PASS** en PlayCanvas+A19 y bundle target-aware versionado (154 módulos, 17,484,526 bytes, SHA-256 `55649e9af9dd64711400fb0d3adddc51ee66f7d55dc0b1b29348e8a304a62bb6`).
- A5 reporta **94% owner-side** y ya tiene contratos V1 20/20 para plan, copy, balance, eligibility, cooldown groups y routing effect/fact.
- A5 ya incluye una mitigación de anti-grind por frecuencia:
  - training 35 días;
  - rest 21 días;
  - causal actions usan lifecycle + 1 día para impedir intents solapados.
- Existe un candidato A6 integrado temporal para probar A2/A3/A4/A5 juntos sin tocar main.

### Bloqueos reales actuales

1. **PA-GATE-10 CONTENT:** runtime sigue en **6/20 acciones**. Las 14 restantes están diseñadas pero no ejecutables.
2. **A1 contextual eligibility:** `active_career` es demasiado amplio para acciones que requieren empleo de club.
3. **A1 renewal window:** `PA_REQUEST_RENEWAL` debe usar el horizonte canónico de **24 meses**.
4. **A1 catalog contract:** faltan health, age/context, handlers cerrados adicionales y target predicates veteran/young.
5. **A3 minimal extension:** sólo quedan tres nuevos facts persistentes legítimos: `request_position_change`, `withdraw_transfer_request` y `career_priority`.
6. **A5 manifest coherence:** `content-effect-plan.ts` declara veteran/mentor `direct_only`, pero `content-plan.ts` conserva dos `blockedBy` A3 obsoletos; A6-015A lo rechaza hasta que A5 lo alinee.
7. **Anti-grind / browser E2E integrado:** los fixes existen, pero la pasada exacta sobre el candidato integrado sigue pendiente por cola de GitHub Actions.

No se certificará por inferencia ni por “fix implementado”: los fixes pasan a PASS sólo después del retest exacto.

## 2. Inventario A0–A5

| Agente | Estado A6 | Evidencia |
|---|---|---|
| A0 | COMPLETE | PR #799. Contrato, invariantes, ownership, zero-action y límites de autoridad. |
| A1 | COMPLETE como core / PARTIAL para catálogo V1 | PR #800. Core seguro y cerrado. Faltan contratos para health, context eligibility, más handlers y predicates necesarios por A5. |
| A2 | COMPLETE para sesión base | PR #801, HEAD `522b79d...`. SessionCommand, revision/fingerprint, receipts, persistence, replay, rollback, save compatibility y auto:stop. |
| A2 public adapter | IMPLEMENTED / pending final integration retest | PR #806, HEAD `4eafe285...`. Targets autoritativos + history pública saneada + stale/invalid fail-closed. |
| A3 | COMPLETE para slice actual | PR #803, HEAD `75be938...`. Scopes, bridge, consumers y 0 extra RNG. |
| A4 | COMPLETE / CERTIFIED | PR #804, HEAD `1296cbb...`. Run 36316821115 SUCCESS; 46/46 A2+A4, 11/11 PlayCanvas+A19, bundle target-aware versionado. Sin blocker A4 restante. |
| A5 | PARTIAL / BLOCKED — 94% owner-side | PR #802, HEAD `1a7f388...`. 20/20 plan + public spec + balance + eligibility + cooldown groups + effect/fact routing; runtime aún 6/20 por blockers A1/A3. |
| A6 | IN PROGRESS | PR #805. Gates cross-version, stress, public target, anti-grind, mobile E2E y candidatos integrados. |

## 3. ZERO_ACTION_EQUIVALENCE

Harness:

`scripts/test-player-actions-zero-equivalence.mjs`

Baseline:

`main@2cc068cb705214ba827677ab02d8d1668e8677ec`

Seeds:

`1, 2, 7, 42, 77, 125, 777, 2026, 424242`

Ventanas:

- 28 días
- 84 días
- 365 días

Se reproduce el mismo comando canónico en baseline y candidate y se compara snapshot completo después de cada comando.

Se comprueba explícitamente:

- state;
- rngState;
- history;
- seeds;
- market;
- sport;
- professional;
- retirement;
- age milestones;
- pending state;
- no materialización de `playerActions` si nunca se usa.

Resultados medidos en runtime A2/A3/A4/A5 del slice actual:

**0 diferencias causales.**

**PA-GATE-03 ZERO_ACTION_EQUIVALENCE = PASS.**

Los cambios A5 posteriores son cooldown/content-spec/balance configuration y no participan en zero-action, pero el candidato final volverá a ejecutar el gate.

## 4. RNG / pureza

Evidencia disponible:

- `getView()` ×1000 no muta snapshot;
- availability/facts reads no mutan;
- Player Actions deterministas no consumen RNG inmediatamente;
- A3 bridge/projection no añade draws;
- request transfer reutiliza el productor/roll autorizado;
- zero-action compara el RNG completo;
- PlayCanvas regression histórica conserva estado/RNG.

A6 incluye además `A6-019 NARRATIVE RNG FUTURE` para demostrar que REST no desplaza el stream narrativo después de neutralizar únicamente su diferencia física legítima.

**Estado final del gate:** BLOCKED hasta ejecutar A6-019 sobre el candidato integrado final.

## 5. Session / atomicidad / persistence

Cubierto por A2/A6:

- canonical fingerprint con `targetId`;
- expectedRevision;
- replay idempotente;
- commandId reuse con payload distinto;
- 20 same-revision clicks → un único commit;
- failed commit → rollback total;
- save/load continuo equivalente;
- legacy save sin `playerActions`;
- malformed store fail-closed;
- Player Action no avanza mundo;
- auto:stop sin avance temporal/RNG;
- decision/result/offer/closed career bloquean acciones.

A6 también contiene probes específicos:

- A6-016 decision collision;
- A6-017 offer collision;
- A6-018 retirement collision.

**Estado final del gate:** BLOCKED hasta última ejecución integrada exacta.

## 6. Public targets / UI contract

El finding original de A6 sobre targets **ya tiene implementación upstream**.

### A2 #806

Proyecta únicamente targets que pasan `validatePlayerActionTarget()` y expone:

- id;
- nombre público;
- rol público;
- availability;
- unavailableReason;
- cooldown;
- options públicas.

No expone:

- knowledge;
- agenda;
- facts;
- payload;
- effectKey;
- eligibilityKey;
- RNG;
- consumer state.

También proyecta `actions.history` saneado.

### A4 #804

Implementa:

career → category → action → authoritative target → option → result → career.

Envía el `targetId` exacto proyectado por A2.

Evidencia final target-aware, run **36316821115 — SUCCESS**:

- A2 session + A4 contract: **46/46 PASS**;
- PlayCanvas + A19: **11/11 PASS**;
- A2-024..027 public targets/history/privacy: PASS;
- A4-016 target flow: PASS;
- A4-017 history: PASS;
- A4-018 target privacy: PASS;
- A4-019 target reset: PASS;
- bundle versionado: 154 módulos · 17,484,526 bytes · SHA-256 `55649e9af9dd64711400fb0d3adddc51ee66f7d55dc0b1b29348e8a304a62bb6`.

La revisión exacta actual incluye además:

- target cooldown copy;
- target reset en navegación;
- busy guard que no revive botones deshabilitados;
- responsive target selector.

A6 conserva:

`scripts/test-player-actions-public-target-contract.mjs`

y el acceptance `A6-014`.

**Finding PA-A6-001:** CLOSED / CERTIFIED UPSTREAM.  
A6 conserva A6-014 como regresión independiente en el candidato integrado, pero A2/A4 ya no tienen blocker abierto.

## 7. Authority / scopes

### Authority

No se han observado escrituras directas no autorizadas a:

- club / owner / registration;
- contract terms;
- market.pending;
- national team;
- appearances / match results;
- captaincy;
- retirement;
- narrative history;
- seeds.

El malicious-effect test de A6 inyecta `set_contract_salary` y debe ser rechazado sin mutación.

### A3 scopes

Implementado:

- historical vs currentlyRelevant;
- coach + club scope;
- club scope para transfer request;
- renewal resolution por autoridad contractual posterior;
- agent/representation scope;
- privacy;
- no fake EventDefinition;
- no seeds.

Request transfer:

- no crea CareerOffer;
- no cambia club;
- no consume RNG adicional;
- aplica un threshold fijo al productor autorizado mientras el fact está live;
- repetir request no apila fuerza causal.

## 8. Nuevo P2 — eligibility de empleo activo

A5 ha demostrado un mismatch real:

`active_career` sólo comprueba que la carrera no esté cerrada.

Eso no basta para:

- PA_COACH_TALK;
- PA_REQUEST_TRANSFER;
- PA_REQUEST_RENEWAL.

En estado `employment.status = unattached`, una acción de club no debe anunciarse como disponible y fallar después dentro del effect.

La autoridad canónica ya existe:

`hasActiveClubEmployment(state)`

de `src/simulation/employment.ts`.

A6 añadió:

`A6-020 ACTIVE EMPLOYMENT`

Acceptance:

- transfer unavailable;
- renewal unavailable;
- coach talk fail-closed;
- raw dispatch no llega al effect;
- error esperado = `PLAYER_ACTION_UNAVAILABLE`;
- estado idéntico.

**Owner:** RETURN_TO_A1.  
**Severity:** P2.

## 9. Nuevo P2 — renewal window

El runtime ya tiene una definición canónica:

`CLUB_RENEWAL_INTENT_MAX_MONTHS = 24`

en `src/simulation/club-contract-intent.ts`.

A6 añadió:

`A6-021 RENEWAL WINDOW`

Acceptance:

- 25 meses → request renewal unavailable;
- 24 meses → puede entrar en eligibility si existe empleo activo.

No se crea un segundo threshold en Player Actions.

**Owner:** RETURN_TO_A1 / A5 configuration.  
**Severity:** P2.

## 10. Content catalog

### Runtime

Actualmente: **6 acciones**.

1. PA_TRAIN_EXTRA
2. PA_REST
3. PA_COACH_TALK
4. PA_REQUEST_TRANSFER
5. PA_REQUEST_RENEWAL
6. PA_AGENT_MARKET

### Diseño V1

A5 ya tiene **20/20** en:

- `content-plan.ts`;
- `content-spec.ts`;
- `content-balance.ts`;
- `content-eligibility.ts`;
- `content-cooldown-groups.ts`;
- `content-effect-plan.ts` (31/31 opciones V1).

A5 valida:

- distribución de classes;
- distribución de categories;
- IDs/options;
- copy budgets;
- no leakage de nombres internos;
- direct-effect ceilings;
- authority/intents con zero direct effect.

Las 14 acciones bloqueadas son por contrato runtime, no por falta de diseño/copy.

### Blockers A1

- categoría health;
- ejecutar el manifest cerrado de age/context eligibility;
- registrar los effect keys cerrados de `content-effect-plan.ts`;
- ejecutar veteran/young teammate predicates;
- implementar group cooldowns;
- categoría `health`;
- aplicar los handlers balanceados definidos por A5.

### Blockers A3 restantes

Sólo tres facts nuevos:

- `request_position_change`;
- `withdraw_transfer_request`;
- `career_priority`.

Veteran advice y mentor young quedan `direct_only` locales según el effect plan actual y **no deben** crear facts A3.

**PA-GATE-10 CONTENT = FAIL** mientras el runtime siga 6/20.

## 11. Balance / anti-grind

### Evidencia del slice anterior

A6 midió el slice con training 10d y rest 7d:

- 80 carreras;
- 0 crashes;
- mixed: technique ~80.5 vs baseline 62;
- rest-heavy: fitness ~99.91 / fatigue ~0.275.

Eso era FAIL claro.

### Remediación A5 actual

A5 no ha invadido A1 effects. Ha reducido frecuencia:

- training: **35d**;
- rest: **21d**;
- coach: 31d;
- transfer: 121d;
- renewal: 91d;
- agent market: 31d.

Los cooldowns causales están alineados a lifecycle + 1, evitando reejecución mientras el fact anterior sigue currentlyRelevant.

Budget A5 oficial:

- training Δ technique <= 6;
- rest fitness <= 94;
- rest fatigue >= 7;
- mixed fitness <= 95;
- mixed fatigue >= 5.

A6 ha alineado:

`scripts/test-player-actions-balance-release.mjs`

a exactamente esos límites.

Además, el diseño V1 distingue los dos caminos de salud:

- `PA_REST`: cooldown 21d, puerta por fatiga (`fatigue_min >= 24`), delta objetivo -2 fatiga / +0.25 fitness, sin tocar riesgo;
- `PA_RECOVERY_SESSION`: cooldown 14d, puerta por riesgo (`risk_min >= 28`), delta objetivo -2 fatiga / +0.25 fitness / -1 riesgo.

**Finding training/rest:** FIX_IMPLEMENTED / PENDING_RETEST.  
**PA-GATE-11:** BLOCKED hasta ejecutar el stress anual exacto; ya no se mantiene como FAIL histórico si el nuevo candidate cumple.

## 12. Market exploit

A6 mantiene un probe de 1000 seeds.

Debe demostrar:

- request no crea `market.pending`;
- no consume RNG;
- productor autorizado puede responder después;
- rate requested <65%;
- uplift bounded;
- repeated request no acumula threshold;
- no synthetic offer.

A5 incorpora el mismo criterio como gate propio.

## 13. Save size / performance

Hallazgo histórico:

- crecimiento de history/facts aproximadamente lineal;
- viejo slice A5: ~148 KB para 90 acciones/año;
- viejo A2 worst-case: ~347 KB para 418 acciones/año.

Los cooldowns nuevos reducen fuertemente la frecuencia máxima, por lo que estas cifras son upper bounds históricos, no la proyección final.

**PA-A6 save growth:** P3, monitorizar en stress de carrera completa final.  
No optimizar prematuramente mientras no exista problema real de carrera completa.

A6 dispone de `scripts/bench-player-actions.mjs` para:

- getView;
- availability;
- execution;
- serialization.

## 14. Preview / PlayCanvas

A4 ya implementa el flujo target-aware en:

- preview;
- web UI;
- fuente compartida para PlayCanvas.

El build PlayCanvas genera artefactos versionados:

- `playcanvas/multihistoria.js`;
- `playcanvas/manifest.json`.

A4 ya cerró su certificación exacta en run **36316821115 — SUCCESS** y versionó el paquete final. A4 declara cero engineering blockers restantes.

A6 añade además un freshness gate integrado:

`npm run build:playcanvas` seguido de diff cero del artefacto versionado.

**PA-GATE-12 PREVIEW:** BLOCKED sólo por el E2E integrado A6; el componente A4 está PASS/CERTIFIED.  
**PA-GATE-13 PLAYCANVAS:** BLOCKED sólo por el rebuild/freshness integrado A6; el componente A4 está PASS/CERTIFIED.

## 15. Mobile / accessibility / optionality

A6 creó un E2E real Chromium:

`scripts/test-player-actions-mobile-e2e.mjs`

Viewports:

- 360×800;
- 390×844;
- 430×932.

Flujo:

career → Gestionar mi carrera → Carrera → Hablar con entrenador → target → Quiero más minutos → resultado → Volver a carrera.

Comprueba:

- no horizontal overflow;
- target selector;
- botones;
- regreso;
- SIMULAR accesible;
- optionality copy;
- semántica básica de botones.

**PA-GATE-14 MOBILE:** BLOCKED hasta ejecutar el navegador real sobre candidato integrado.

Optionality ya tiene evidencia positiva:

- SIMULAR primario;
- Gestionar mi carrera secundario;
- copy explícita de opcionalidad;
- sin quotas/3 de 3/task warnings.

**PA-GATE-15 OPTIONALITY_UX = PASS.**

## 16. Integrated QA candidates

A6 ya no depende únicamente de ramas aisladas.

Existen candidatos temporales:

- `a6/player-actions-integrated-candidate`;
- `a6/player-actions-integrated-qa`.

Se usan sólo para QA, no para saltarse ownership ni mergear producto.

El candidato integrado actual combina:

- A2 session;
- A2 public target adapter;
- A3 bridge;
- A4 target UI + bundle final certificado;
- A5 six-action production slice;
- latest persistence regression;
- A5 plan/spec/balance/eligibility/cooldown/effect-routing manifests y tests.

No convierte las 14 acciones bloqueadas en runtime ficticio.

## 17. Estado de GitHub Actions

La infraestructura está saturada por muchas ejecuciones superseded generadas durante los commits rápidos de A5/A6.

Los latest exact-head runs permanecen mayoritariamente `queued`.

A6 no interpreta:

- `queued` como PASS;
- fixes en source como PASS;
- runs de HEAD antiguos como certificación del HEAD actual.

Se conserva únicamente evidencia ya completada y reproducible.

## 18. Findings actuales

### PA-A6-001 — public target contract

**Severity:** P2 histórico  
**Estado:** CLOSED / CERTIFIED  
**Owner:** A2 #806 + A4 #804  
**Evidence:** A4 run 36316821115 SUCCESS.

### PA-A6-002 — runtime catalog 6/20

**Severity:** P2 OPEN  
**Owner:** A1 + A3 + A5

Diseño/copy/balance = 20/20.  
Runtime = 6/20.

### PA-A6-003 — training grind

**Severity:** P2 histórico  
**Estado:** FIX_IMPLEMENTED / PENDING_RETEST  
**Owner:** A5

10d → 35d.

### PA-A6-004 — rest exploit

**Severity:** P2 histórico  
**Estado:** FIX_IMPLEMENTED / PENDING_RETEST  
**Owner:** A5

7d → 21d.

### PA-A6-005 — save growth

**Severity:** P3 OPEN/MONITOR  
**Owner:** future A2/A5 optimization only if final stress warrants it.

### PA-A6-006 — active-employment eligibility leak

**Severity:** P2 OPEN  
**Owner:** RETURN_TO_A1  
**Acceptance:** A6-020.

### PA-A6-007 — renewal window eligibility

**Severity:** P2 OPEN  
**Owner:** RETURN_TO_A1  
**Canonical horizon:** 24 months.  
**Acceptance:** A6-021.

### PA-A6-008 — manifest coherence veteran/mentor

**Severity:** P2 OPEN  
**Owner:** RETURN_TO_A5

`content-effect-plan.ts` + A5-052 declaran `PA_VETERAN_ADVICE` y `PA_MENTOR_YOUNG` como `direct_only` sin A3 fact, pero `content-plan.ts` conserva blockers `A3 advice intent` / `A3 mentorship intent`.

**Acceptance:** A6-015A PASS; los dos `blockedBy` deben alinearse con el routing final.

## 19. Gates actuales

| Gate | Estado |
|---|---|
| PA-GATE-01 BUILD | PASS — previously measured source stacks; final integrated build still reruns |
| PA-GATE-02 EXISTING REGRESSION | PASS for measured source stacks; final integrated rerun required before CERTIFIED |
| PA-GATE-03 ZERO_ACTION_EQUIVALENCE | PASS |
| PA-GATE-04 RNG | BLOCKED — A6-019 final integrated run pending |
| PA-GATE-05 SESSION_ATOMICITY | BLOCKED — A6-016..018 final integrated run pending |
| PA-GATE-06 SAVE_COMPATIBILITY | PASS |
| PA-GATE-07 AUTHORITY | PASS on implemented slice |
| PA-GATE-08 FACT_SCOPE | PASS on implemented A3 slice |
| PA-GATE-09 AUTO_SIM | PASS on implemented slice |
| PA-GATE-10 CONTENT | FAIL — runtime 6/20 |
| PA-GATE-11 ANTI_GRIND | BLOCKED — fix implemented, exact annual stress pending |
| PA-GATE-12 PREVIEW | BLOCKED integrated — A4 component CERTIFIED; browser E2E A6 pending |
| PA-GATE-13 PLAYCANVAS | BLOCKED integrated — A4 component CERTIFIED; integrated rebuild/freshness pending |
| PA-GATE-14 MOBILE | BLOCKED — Chromium 360/390/430 job pending |
| PA-GATE-15 OPTIONALITY_UX | PASS |

## 20. A6 artifacts

- `scripts/test-player-actions-final.mjs`
- `scripts/test-player-actions-zero-equivalence.mjs`
- `scripts/test-player-actions-public-target-contract.mjs`
- `scripts/stress-player-actions-backend.mjs`
- `scripts/stress-player-actions-market.mjs`
- `scripts/test-player-actions-balance-release.mjs`
- `scripts/test-player-actions-mobile-e2e.mjs`
- `scripts/bench-player-actions.mjs`
- dedicated A6 workflows
- integrated QA branches
- handoffs en #800/#802/#803/#804

## 21. Recomendación técnica

**DO_NOT_MERGE como feature final.**

La razón ya no es fragilidad de la base técnica. Las principales invariantes están bien.

El release está bloqueado principalmente por:

1. completar el runtime catalog;
2. cerrar eligibility A1;
3. ejecutar los retests exactos del candidato integrado;
4. certificar PlayCanvas/mobile exact-head.

## 22. Criterio para la siguiente actualización A6

Cerrar en este orden:

1. A5 corregir los dos `blockedBy` veteran/mentor obsoletos;
2. A1 active-employment + renewal-window + ejecución de manifests cerrados;
3. A3 implementar únicamente los 3 facts nuevos del V1;
4. A5 materializar las 14 acciones bloqueadas;
5. A6-015 content PASS;
6. annual anti-grind PASS;
7. A6-016..021 PASS;
8. PlayCanvas freshness/E2E;
9. mobile Chromium;
10. zero-action final integrated rerun;
11. report final CERTIFIED o NOT_CERTIFIED.

Estimación A6 residual después de que A1/A3 desbloqueen runtime: **~4–7 horas-agente equivalentes**.
