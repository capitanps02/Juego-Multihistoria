# Codex implementation queue — Canon 30–34

Re-grounded sobre `main@6d2239ae1f89be97a7c5cf117d456cff9218aade`.

El Documento Maestro sigue siendo autoridad canónica. Una API compartida que devuelva `null` / `unavailable` no autoriza proxies: la escena debe fallar cerrado.

Mapa scene-by-scene de deuda compartida: `analysis/T5.1/canon-30-34-authority-debt.json`.

## Cerrado en esta rama

### C30-34-CODEX-001 — authority guard

`src/content/events/30_34/index.ts` elimina del catálogo activo cualquier `Effect` narrativo que intente mutar estado propiedad de `CareerOffer/respondToOffer`:

- `club`, `tier`, `world.ownerClub`;
- `professional.ownerClub`, `professional.registrationClub`, `professional.leagueTier`;
- `professional.clubPrestigeTier`, `professional.clubPrestigeScore`, `professional.route`;
- `contract.*`;
- flags `ABROAD_ROUTE`, `LOAN_ACTIVE`, `BIG_CLUB`.

Regression test: todo evento activo `phase === "30_34"` debe quedar sin efectos authority-owned.

### C30-34-CODEX-002 — consumo formal de ofertas y provenance

Tres escenas consumen una `CareerOffer` formal:

1. `EVT_31_HOME_001`: oferta real cuyo destino/owner/registration es `UDV`.
2. `EVT_32_HOME_001`: oferta real cuyo destino/owner/registration es `UDV`.
3. `EVT_32_CON_001`: renovación formal anual (`reason === "Renovación de contrato"`, mismo club/owner/registration, `terms.months === 12`).

Cobertura focal:

- oferta de otro club no activa escenas UDV;
- renovación distinta de 12 meses no activa `EVT_32_CON_001`;
- `counter` y `defer` cierran la oferta sin aplicar `CareerTerms`;
- `accept` aplica exactamente los términos pendientes;
- provenance narrativa conserva `eventId`, `choiceId` y disposition;
- una oferta pendiente sigue siendo autoritativa tras save/restore equivalente.

Esto cierra ownership/provenance, no toda la paridad contractual. `EVT_32_CON_001` afirma una renovación automática ligada a un umbral de minutos, pero `CareerTerms` no persiste ninguna cláusula ni umbral de ese tipo. Mantener `technical_adaptation` hasta que la autoridad formal pueda representarlo.

`EVT_31_MKT_001` permanece fuera de `offerBridge` porque exige comparar dos ofertas simultáneas y el runtime solo persiste una.

### C30-34-CODEX-003 — deuda deportiva caracterizada y dos falsos positivos cerrados

La rama usa exclusivamente `facts.sport` / `facts.match` para hechos deportivos concretos y ya bloquea dos escenas cuya semántica no puede sostenerse con proxies:

- `EVT_31_FINAL_001`: exige `facts.sport.currentCompetition` y `facts.sport.nextFixture` existentes.
- `EVT_33_BODY_001`: exige `facts.sport.nextFixture` y `facts.sport.hoursToNextFixture` existentes.

Ambas reciben `t51_sport_authority_required` y fallan cerrado mientras la autoridad compartida siga devolviendo `null`.

### C30-34-CODEX-004 — pruebas de fail-closed deportivo y authority gaps

`scripts/test-t51-30-34-sport-authority.mjs` demuestra fail-closed deportivo y ausencia de mutación. `scripts/test-t51-30-34-authority-gaps.mjs` fija además que:

- `CareerTerms` no puede representar aún una renovación automática por minutos;
- el mercado autoritativo expone como máximo la única `CareerOffer` pendiente;
- `EVT_31_MKT_001` y `EVT_33_MKT_001` deben permanecer fuera de `offerBridge` mientras esa cardinalidad no cambie.

### C30-34-CODEX-008 — ownership canónico de las cuatro seeds huérfanas

El audit T5.2 de `t51/canon-30-34` identifica exactamente 4 seeds sin productor runtime y sin consumidor. Su ownership canónico ya está resuelto uno-a-uno:

- `SEED_ROLE_COMMUNICATION` → `EVT_30_CCH_001` — “Te enteras por la pizarra”.
- `SEED_FALSE_ULTIMATUM` → `EVT_30_PRS_001` — “El ultimátum que nunca diste”.
- `SEED_NATIONAL_ABSENCE` → `EVT_30_NAT_002` — “La selección gana sin ti”.
- `SEED_SPECIALIST_BIGCLUB` → `EVT_30_JAN_001` — “Enero: especialista de lujo”.

`scripts/test-t51-30-34-seed-handoff.mjs` impide conectar esas seeds a productores legacy/genéricos mientras su escena canónica siga missing. `PASADA_6_30_34` es provenance editorial, no `originEvent` runtime.

### C30-34-CODEX-010 — handoff downstream de seeds frontera 30–34 → 34+/retirada

`analysis/T5.1/canon-30-34-downstream-seed-handoff.json` formaliza seis memorias de frontera sin inventar consumidores ni terminalidad:

- `SEED_AGE34_PRIORITY` — writers runtime actuales: `EVT_33_CON_001`, `EVT_33_END_001`, `EVT_33_MKT_001`;
- `SEED_RETIREMENT_PUBLIC_TONE` — `EVT_33_PRS_001`;
- `SEED_HOME_PULL_PUBLIC` — `EVT_33_HOME_001`, `EVT_33_PRS_001`;
- `SEED_FINAL_FOUR_WAYS` — `EVT_33_MKT_001`;
- `SEED_VETERAN_LEADERSHIP_FINAL` — `EVT_33_CAP_001`;
- `SEED_72H_LIMIT` — `EVT_33_BODY_001`.

La provenance múltiple se conserva: no se colapsan orígenes distintos a una historia falsa. `SEED_LAST_BIG_MOVE_WINDOW` permanece fuera del boundary handoff porque su semántica de edad 30 no prueba por sí sola ownership 34+/retirada.

`scripts/test-t51-30-34-downstream-seed-handoff.mjs` valida cardinalidad, writers runtime y que `PASADA_6_30_34` nunca se convierta en productor runtime. El handoff es no prescriptivo: un consumidor downstream real puede añadirse cuando exista evidencia canónica.

### C30-34-CODEX-011 — `seedsRead` no equivale a consumo causal

Se corrigió una sobreclasificación previa en `analysis/T5.1/canon-30-34-seed-lifecycle.json`: siete enlaces antes llamados `confirmedChains` solo eran declaraciones `seedsRead` sin dependencia causal runtime.

Quedan como `declaredReadLinks`:

- `SEED_AGE30_CONTRACT` → `EVT_31_MKT_001`, `EVT_32_CON_001`;
- `SEED_MATCH_SELECTIVITY` → `EVT_33_BODY_001`;
- `SEED_NATIONAL_PHASEDOWN` → `EVT_32_NAT_001`;
- `SEED_CAPTAIN_HANDOVER` → `EVT_33_CAP_001`;
- `SEED_AGENT_LAST_CONTRACT` → `EVT_31_AGT_001`;
- `SEED_SURGERY_31` → `EVT_31_RETURN_001`;
- `SEED_HOME_RETURN_31` → `EVT_32_HOME_001`.

En ese subconjunto `causalChainsConfirmed = []`. La promoción exige una superficie causal concreta: gate/gateAlternative, choice eligibility, outcome condition/modifier, simulation edge registrada o transición terminal. Nombrar la seed en `seedsRead` no basta.

`scripts/test-t51-30-34-seed-consumption.mjs` fija esta distinción y usa `SEED_CHRONIC_BODY → EVT_31_MED_001` como control positivo real, porque allí sí existe gate `HAS_SEED_CHRONIC_BODY`.

## Implementable ahora por Codex

### C30-34-CODEX-005 — continuar caracterización deportiva solo con semántica demostrable

Revisar las escenas restantes una a una. Para cualquier escena que requiera inequívocamente convocatoria, titularidad, minutos, acción de partido, resultado, competición, secuencia temporal de fixtures o regreso efectivo tras lesión, registrar el hecho exacto requerido y mantener la escena bloqueada mientras sea `null`/`unavailable`.

No inferir desde edad, `roleScore`, forma, reputación, confianza del entrenador, `seasonDay`, mes ni flags narrativos.

Deuda ya caracterizada que no debe resolverse con proxies:

- `EVT_32_FAN_001`: necesita aparición/rendimiento del partido y reacción de grada; `sport.form` no es rating de ese partido.
- `EVT_31_RETURN_001`: `RECOVERING_INJURY` no demuestra alta médica, readiness de entrenamiento ni contexto inmediato de convocatoria.
- `EVT_32_NAT_001`: `nationalStanding` no demuestra una prelista 30→26.
- `EVT_30_FORM_001`: no fabricar seis partidos/cinco goles desde forma agregada.
- `EVT_31_ROLE_001`: `facts.roleDropSince23` / `facts.roleGuaranteeAt23` no prueban tres goles recientes ni una decisión real de banquillo.

### C30-34-CODEX-006 — autoridad multi-oferta

`MarketState.pending` es cero-o-una `CareerOffer`. Dos escenas requieren pluralidad real:

- `EVT_31_MKT_001`: dos propuestas simultáneas.
- `EVT_33_MKT_001`: cuatro rutas/propuestas simultáneas.

No usar `marketHeat` para fabricarlas. La solución pertenece al mercado compartido: colección persistible de ofertas activas con identidad/provenance y decisiones independientes.

### C30-34-CODEX-007 — cláusula formal de renovación por minutos

`EVT_32_CON_001` consume una renovación formal de 12 meses, pero `CareerTerms` no representa `renewalByMinutes`, threshold ni renovación automática. No certificar paridad hasta que la API compartida modele la cláusula sin romper saves.

### C30-34-CODEX-009 — batch coordinado de principales missing

No implementar individualmente desde esta rama los cinco IDs missing porque su alta cambia `contentIdentity` y debe entrar junto con freeze + ruta de migración:

- `EVT_30_CCH_001` → `SEED_ROLE_COMMUNICATION`.
- `EVT_30_PRS_001` → `SEED_FALSE_ULTIMATUM`.
- `EVT_30_NAT_002` → `SEED_NATIONAL_ABSENCE`.
- `EVT_30_JAN_001` → `SEED_SPECIALIST_BIGCLUB`.
- `EVT_31_ROLE_001` → además bloqueado por autoridad de goles + banquillo.

Orden seguro:

1. congelar/certificar la identidad actual y registrar su edge;
2. añadir las cinco escenas con semántica canónica exacta;
3. congelar la nueva identidad y registrar su migración;
4. verificar `withoutRuntimeProducer: 4 → 0` sin aliases ni historia sintetizada;
5. mantener `EVT_31_ROLE_001` fail-closed hasta disponer de autoridad deportiva suficiente.

## Blockers duros actuales

### Sporting authority

`main` expone `getSportContext()` / `getCurrentMatchContext()`, pero mantiene `null` para competición, fixtures, horas al próximo partido, match-day/training window, partidos restantes, objetivo/posición, squad status, convocatoria, banquillo, titularidad, minutos, goles, asistencias y resultado. La read surface existe; el store autoritativo todavía no.

### Role expectation facts

`main@6d2239a` añade `facts.roleDropSince23` y `facts.roleGuaranteeAt23`. No desbloquean por sí solos escenas que afirman producción o decisiones deportivas concretas.

### Market / contract authority

- `MarketState.pending` representa una sola oferta: bloquea `EVT_31_MKT_001` y `EVT_33_MKT_001`.
- `CareerTerms` no representa renovación automática por minutos: bloquea paridad completa de `EVT_32_CON_001`.

### 18 identidades desplazadas

Requieren decisión explícita de identidad + migración. Sin aliases por parecido, renombrados destructivos ni reescritura silenciosa de historia.

### 5 principales missing

Cuatro tienen ownership directo de las cuatro seeds sin productor. `EVT_31_ROLE_001` tiene blocker deportivo. Su alta sigue siendo batch coordinado de integración.

### Condicionales

Los 26 condicionales del motor siguen sin inventario condicional canónico autoritativo. No certificar identidad por título o similitud semántica.

### Bridge 30→34

La prioridad compartida existe, pero `EVT_30_BRIDGE_001` sigue desplazado frente a `EVT_30_IDN_001`. No convertir el legacy en obligatorio hasta resolver identidad y migración.

### Seeds

El audit owner 30–34 muestra 52 seeds, 48 con productor runtime, 4 sin productor, 13 con algún consumidor estructural y 0 terminales explícitos. Las cuatro sin productor ya son deuda de implementación coordinada. El valor `withAnyConsumer` no debe interpretarse como 13 consecuencias canónicas certificadas: `seedsRead` y otras superficies estructurales necesitan clasificación causal explícita.

## Migración

Target observado actual del catálogo PR-merge:

`14164e54ec4250e50b915c29c959b35a56ff7ccd249a99c4ad026925af2d8c07`

Fixture requerido antes de registrar la ruta:

`qa/fixtures/t5.1/post-t51-sources/14164e54ec4250e50b915c29c959b35a56ff7ccd249a99c4ad026925af2d8c07.json`

El workstream no registra por sí mismo `CONTENT_MIGRATION_ROUTES` ni congela el target global. Eso sigue siendo ownership de coordinación/integración.

Última validación global completa antes de C011: run `35235694077`. Pasan build/final gate, T5.2, sport context/football moments, saves, T5.3, registries y offer-bridge evidence; falla solo `freeze-t51-active-source --check` porque `14164e54…8c07` no está congelado. No silenciar ese sentinel desde esta rama.

## Invariantes

- edad no fuerza retirada;
- retirada internacional != retirada de club;
- Documento Maestro prevalece;
- empleo/contrato solo desde `CareerOffer/respondToOffer`;
- hechos deportivos concretos solo desde autoridad deportiva real;
- multi-oferta solo desde autoridad de mercado real;
- cláusulas contractuales solo si el modelo formal puede persistirlas;
- una seed missing solo nace desde su escritor canónico real;
- `seedsRead` no certifica consumo causal;
- `PASADA_6_30_34` no se convierte en provenance runtime;
- sin aliases silenciosos;
- sin renombrados destructivos.
