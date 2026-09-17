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

**Importante:** esto cierra ownership/provenance, no toda la paridad contractual. `EVT_32_CON_001` afirma una renovación automática ligada a un umbral de minutos, pero `CareerTerms` no persiste ninguna cláusula ni umbral de ese tipo. Mantener `technical_adaptation` hasta que la autoridad formal pueda representarlo.

`EVT_31_MKT_001` permanece fuera de `offerBridge` porque exige comparar dos ofertas simultáneas y el runtime solo persiste una.

### C30-34-CODEX-003 — deuda deportiva caracterizada y dos falsos positivos cerrados

La rama usa exclusivamente `facts.sport` / `facts.match` para hechos deportivos concretos y ya bloquea dos escenas cuya semántica no puede sostenerse con proxies:

- `EVT_31_FINAL_001`: exige `facts.sport.currentCompetition` y `facts.sport.nextFixture` existentes.
- `EVT_33_BODY_001`: exige `facts.sport.nextFixture` y `facts.sport.hoursToNextFixture` existentes.

Ambas reciben la etiqueta `t51_sport_authority_required` y fallan cerrado mientras la autoridad compartida siga devolviendo `null`.

No se han añadido gates genéricos a escenas ambiguas: cada dependencia deportiva debe poder defenderse por semántica exacta del evento.

### C30-34-CODEX-004 — pruebas de fail-closed deportivo y de authority gaps

`scripts/test-t51-30-34-sport-authority.mjs` demuestra:

- la superficie deportiva compartida expone hechos concretos ausentes como `null`;
- `EVT_31_FINAL_001` no pasa aunque se eleven `FINAL_CONTEXT`, forma, rol, seguridad y estatus;
- `EVT_33_BODY_001` no pasa aunque se eleven recuperación y proxies deportivos históricos;
- evaluar estos gates no muta estado.

`scripts/test-t51-30-34-authority-gaps.mjs` fija además que:

- `CareerTerms` no puede representar aún una renovación automática por minutos;
- el mercado autoritativo expone como máximo la única `CareerOffer` pendiente;
- `EVT_31_MKT_001` y `EVT_33_MKT_001` deben permanecer fuera de `offerBridge` mientras esa cardinalidad no cambie.

### C30-34-CODEX-008 — ownership canónico de las cuatro seeds huérfanas

El audit T5.2 de `t51/canon-30-34` identifica exactamente **4** seeds sin productor runtime y sin consumidor. Su ownership canónico ya está resuelto uno-a-uno:

- `SEED_ROLE_COMMUNICATION` → `EVT_30_CCH_001` — “Te enteras por la pizarra”.
- `SEED_FALSE_ULTIMATUM` → `EVT_30_PRS_001` — “El ultimátum que nunca diste”.
- `SEED_NATIONAL_ABSENCE` → `EVT_30_NAT_002` — “La selección gana sin ti”.
- `SEED_SPECIALIST_BIGCLUB` → `EVT_30_JAN_001` — “Enero: especialista de lujo”.

`scripts/test-t51-30-34-seed-handoff.mjs` impide que cualquiera de esas seeds reciba un productor legacy/genérico mientras su escena canónica siga missing. También fija cardinalidad uno-a-uno.

La regla de migración queda explícita: `PASADA_6_30_34` es provenance editorial de catálogo, no `originEvent` runtime. Las instancias nuevas deben usar el evento canónico real que las produjo; el historial existente no se reescribe salvo mapping `rewriteExisting` independiente y aprobado.

Último focused run con este guard: `35230375462` — **SUCCESS**.

## Implementable ahora por Codex

### C30-34-CODEX-005 — continuar caracterización deportiva solo con semántica demostrable

Revisar las escenas restantes una a una. Para cualquier escena que requiera de forma inequívoca convocatoria, titularidad, minutos, acción de partido, resultado, competición, secuencia temporal de fixtures o regreso efectivo tras lesión, registrar el hecho exacto requerido y mantener la escena bloqueada mientras sea `null`/`unavailable`.

No inferir desde edad, `roleScore`, forma, reputación, confianza del entrenador, `seasonDay`, mes ni flags narrativos.

Deuda ya caracterizada que **no** debe resolverse con proxies:

- `EVT_32_FAN_001`: necesita aparición/rendimiento del partido y reacción de grada; `sport.form` no es un rating de ese partido.
- `EVT_31_RETURN_001`: `RECOVERING_INJURY` no demuestra alta médica, readiness de entrenamiento ni contexto inmediato de convocatoria.
- `EVT_32_NAT_001`: `nationalStanding` no demuestra estar en una prelista 30→26 para un torneo.
- `EVT_30_FORM_001`: no fabricar historial longitudinal de partidos desde una forma agregada.
- `EVT_31_ROLE_001` (canonical missing, “Tres goles y al banquillo”): los nuevos `facts.roleDropSince23` y `facts.roleGuaranteeAt23` **no** prueban tres goles recientes ni una decisión real de banquillo. Sigue bloqueado por match history + squad authority y debe permanecer en el batch coordinado de missing IDs.

### C30-34-CODEX-006 — autoridad multi-oferta

`MarketState.pending` es cero-o-una `CareerOffer`. Dos escenas canónicas requieren pluralidad real:

- `EVT_31_MKT_001`: compara dos propuestas simultáneas.
- `EVT_33_MKT_001`: afirma cuatro rutas/propuestas concretas simultáneas.

No usar `marketHeat` para fabricar esas ofertas. La solución pertenece al mercado compartido: colección persistible de ofertas activas con identidad/provenance y decisiones independientes.

### C30-34-CODEX-007 — cláusula formal de renovación por minutos

`EVT_32_CON_001` ya consume una renovación formal de 12 meses, pero `CareerTerms` solo modela club/tier/meses/salario/cláusula de rescisión/ownership/prestige/route/loan/bigClub. No existe cláusula `renewalByMinutes` ni threshold persistible.

Codex no debe certificar paridad de este evento hasta que una API compartida modele la cláusula sin romper saves. La rama 30–34 no debe extender por su cuenta el schema contractual global.

### C30-34-CODEX-009 — batch coordinado de principales missing

No implementar individualmente desde esta rama los cinco IDs missing porque su alta cambia `contentIdentity` y debe entrar junto con freeze + ruta de migración:

- `EVT_30_CCH_001` → productor de `SEED_ROLE_COMMUNICATION`.
- `EVT_30_PRS_001` → productor de `SEED_FALSE_ULTIMATUM`.
- `EVT_30_NAT_002` → productor de `SEED_NATIONAL_ABSENCE`.
- `EVT_30_JAN_001` → productor de `SEED_SPECIALIST_BIGCLUB`.
- `EVT_31_ROLE_001` → sin seed orphan asociada; además bloqueado por autoridad deportiva de goles + banquillo.

Orden seguro para integración/Codex:

1. congelar/certificar la identidad actual y registrar su edge de migración;
2. añadir el batch de cinco escenas con semántica canónica exacta;
3. congelar la nueva identidad resultante y registrar su migración correspondiente;
4. verificar que las cuatro seeds pasan de `withoutRuntimeProducer=4` a `0` sin aliases, sin historia sintetizada y sin reescribir `originEvent` histórico;
5. mantener `EVT_31_ROLE_001` fail-closed hasta que exista autoridad deportiva suficiente.

## Blockers duros actuales

### Sporting authority

`main` expone `getSportContext()` y `getCurrentMatchContext()`, pero todavía declara explícitamente:

- `currentCompetition = null`;
- fixture anterior/siguiente = `null`;
- horas al próximo partido = `null`;
- match day / training window = `null`;
- partidos oficiales/liga restantes = `null`;
- objetivo/posición = `null`;
- squad status = `null`;
- convocatoria, banquillo, titularidad, minutos, goles, asistencias, resultado = `null`.

Por tanto esta rama no debe fabricar hechos de partido. La read surface existe; el store autoritativo todavía no.

### Role expectation facts recién integrados

`main@6d2239a` añade `facts.roleDropSince23` y `facts.roleGuaranteeAt23`. Se han revisado contra el bloque 30–34 y no desbloquean por sí solos escenas que afirman producción o decisiones deportivas concretas. En particular no sustituyen los hechos que necesita `EVT_31_ROLE_001`.

### Market / contract authority

- `MarketState.pending` representa una sola oferta: bloquea `EVT_31_MKT_001` y `EVT_33_MKT_001`.
- `CareerTerms` no representa renovación automática por minutos: bloquea paridad completa de `EVT_32_CON_001`.

### 18 identidades desplazadas

Requieren decisión explícita de identidad + migración. Sin aliases por parecido, sin renombrados destructivos y sin reescritura silenciosa de historia.

### 5 principales missing

Los cinco están clasificados. Cuatro tienen además ownership directo de las cuatro seeds sin productor; el quinto (`EVT_31_ROLE_001`) tiene blocker de autoridad deportiva. Su alta sigue siendo un batch coordinado de integración.

### Condicionales

Los 26 condicionales del motor siguen sin inventario condicional canónico autoritativo. No certificar identidad por título o similitud semántica.

### Bridge 30→34

La prioridad compartida existe, pero `EVT_30_BRIDGE_001` sigue desplazado frente a `EVT_30_IDN_001`. No convertir el legacy en obligatorio hasta resolver identidad y migración.

### Seeds

El audit owner 30–34 sigue mostrando 52 seeds, 48 con productor runtime y 4 sin productor. Esas cuatro ya no son deuda de investigación: son deuda de **implementación coordinada** ligada a cuatro principales missing concretos. Las otras seeds abiertas no deben recibir terminalidad artificial; necesitan consumidor o disposición canónica demostrable.

## Migración

Target observado actual del catálogo PR-merge:

`14164e54ec4250e50b915c29c959b35a56ff7ccd249a99c4ad026925af2d8c07`

Fixture requerido antes de registrar la ruta:

`qa/fixtures/t5.1/post-t51-sources/14164e54ec4250e50b915c29c959b35a56ff7ccd249a99c4ad026925af2d8c07.json`

El workstream no registra por sí mismo `CONTENT_MIGRATION_ROUTES` ni congela el target global. Eso sigue siendo ownership de coordinación/integración.

Última validación global: run `35230375308`. Pasan build/final gate, T5.2, sport context/football moments, saves, T5.3, registries y offer-bridge evidence; falla **solo** `freeze-t51-active-source --check` porque el target `14164e54…8c07` no está congelado. No silenciar ese sentinel desde esta rama.

## Invariantes

- edad no fuerza retirada;
- retirada internacional != retirada de club;
- Documento Maestro prevalece;
- empleo/contrato solo desde `CareerOffer/respondToOffer`;
- hechos deportivos concretos solo desde autoridad deportiva real;
- multi-oferta solo desde autoridad de mercado real;
- cláusulas contractuales solo si el modelo formal puede persistirlas;
- una seed missing solo nace desde su escritor canónico real;
- `PASADA_6_30_34` no se convierte en provenance runtime;
- sin aliases silenciosos;
- sin renombrados destructivos.
