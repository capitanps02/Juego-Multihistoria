# Codex implementation queue — Canon 30–34

Re-grounded sobre `main@176317c5708995bb72fa40af9dd45dffc9838093`.

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

### C30-34-CODEX-004 — pruebas de fail-closed deportivo

`scripts/test-t51-30-34-sport-authority.mjs` demuestra:

- la superficie deportiva compartida expone hechos concretos ausentes como `null`;
- `EVT_31_FINAL_001` no pasa aunque se eleven `FINAL_CONTEXT`, forma, rol, seguridad y estatus;
- `EVT_33_BODY_001` no pasa aunque se eleven recuperación y proxies deportivos históricos;
- evaluar estos gates no muta estado.

El workflow focal ejecuta ya esta suite. Último run documental validado `35228776102`: **SUCCESS**.

## Implementable ahora por Codex

### C30-34-CODEX-005 — continuar caracterización deportiva solo con semántica demostrable

Revisar las escenas restantes una a una. Para cualquier escena que requiera de forma inequívoca convocatoria, titularidad, minutos, acción de partido, resultado, competición, secuencia temporal de fixtures o regreso efectivo tras lesión, registrar el hecho exacto requerido y mantener la escena bloqueada mientras sea `null`/`unavailable`.

No inferir desde edad, `roleScore`, forma, reputación, confianza del entrenador, `seasonDay`, mes ni flags narrativos.

Deuda ya caracterizada que **no** debe resolverse con proxies:

- `EVT_32_FAN_001`: necesita aparición/rendimiento del partido y reacción de grada; `sport.form` no es un rating de ese partido.
- `EVT_31_RETURN_001`: `RECOVERING_INJURY` no demuestra alta médica, readiness de entrenamiento ni contexto inmediato de convocatoria.
- `EVT_32_NAT_001`: `nationalStanding` no demuestra estar en una prelista 30→26 para un torneo.
- `EVT_30_FORM_001`: no fabricar historial longitudinal de partidos desde una forma agregada.

### C30-34-CODEX-006 — autoridad multi-oferta

`MarketState.pending` es cero-o-una `CareerOffer`. Dos escenas canónicas requieren pluralidad real:

- `EVT_31_MKT_001`: compara dos propuestas simultáneas.
- `EVT_33_MKT_001`: afirma cuatro rutas/propuestas concretas simultáneas.

No usar `marketHeat` para fabricar esas ofertas. La solución pertenece al mercado compartido: colección persistible de ofertas activas con identidad/provenance y decisiones independientes.

### C30-34-CODEX-007 — cláusula formal de renovación por minutos

`EVT_32_CON_001` ya consume una renovación formal de 12 meses, pero `CareerTerms` solo modela club/tier/meses/salario/cláusula de rescisión/ownership/prestige/route/loan/bigClub. No existe cláusula `renewalByMinutes` ni threshold persistible.

Codex no debe certificar paridad de este evento hasta que una API compartida modele la cláusula sin romper saves. La rama 30–34 no debe extender por su cuenta el schema contractual global.

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

### Market / contract authority

- `MarketState.pending` representa una sola oferta: bloquea `EVT_31_MKT_001` y `EVT_33_MKT_001`.
- `CareerTerms` no representa renovación automática por minutos: bloquea paridad completa de `EVT_32_CON_001`.

### 18 identidades desplazadas

Requieren decisión explícita de identidad + migración. Sin aliases por parecido, sin renombrados destructivos y sin reescritura silenciosa de historia.

### 5 principales missing

- `EVT_30_CCH_001`
- `EVT_30_PRS_001`
- `EVT_30_NAT_002`
- `EVT_30_JAN_001`
- `EVT_31_ROLE_001`

Su alta cambia content identity y debe entrar en batch coordinado con freeze + ruta de migración.

### Condicionales

Los 26 condicionales del motor siguen sin inventario condicional canónico autoritativo. No certificar identidad por título o similitud semántica.

### Bridge 30→34

La prioridad compartida existe, pero `EVT_30_BRIDGE_001` sigue desplazado frente a `EVT_30_IDN_001`. No convertir el legacy en obligatorio hasta resolver identidad y migración.

### Seeds

No consumir/resolver una seed para cerrar auditoría. Hace falta lector o transición terminal demostrable por canon/downstream owner.

## Migración

Target observado actual del catálogo PR-merge:

`14164e54ec4250e50b915c29c959b35a56ff7ccd249a99c4ad026925af2d8c07`

Fixture requerido antes de registrar la ruta:

`qa/fixtures/t5.1/post-t51-sources/14164e54ec4250e50b915c29c959b35a56ff7ccd249a99c4ad026925af2d8c07.json`

El workstream no registra por sí mismo `CONTENT_MIGRATION_ROUTES` ni congela el target global. Eso sigue siendo ownership de coordinación/integración.

La suite `Repository integrity` se mantiene roja por el sentinel `freeze-t51-active-source --check` mientras ese fixture no exista. No silenciarlo desde esta rama.

## Invariantes

- edad no fuerza retirada;
- retirada internacional != retirada de club;
- Documento Maestro prevalece;
- empleo/contrato solo desde `CareerOffer/respondToOffer`;
- hechos deportivos concretos solo desde autoridad deportiva real;
- multi-oferta solo desde autoridad de mercado real;
- cláusulas contractuales solo si el modelo formal puede persistirlas;
- sin aliases silenciosos;
- sin renombrados destructivos.
