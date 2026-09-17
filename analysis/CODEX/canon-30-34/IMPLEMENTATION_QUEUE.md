# Codex implementation queue — Canon 30–34

Re-grounded sobre `main@176317c5708995bb72fa40af9dd45dffc9838093`.

El Documento Maestro sigue siendo autoridad canónica. Una API compartida que devuelva `null` / `unavailable` no autoriza proxies: la escena debe fallar cerrado.

## Cerrado en esta rama

### C30-34-CODEX-001 — authority guard

`src/content/events/30_34/index.ts` elimina del catálogo activo cualquier `Effect` narrativo que intente mutar estado propiedad de `CareerOffer/respondToOffer`:

- `club`, `tier`, `world.ownerClub`;
- `professional.ownerClub`, `professional.registrationClub`, `professional.leagueTier`;
- `professional.clubPrestigeTier`, `professional.clubPrestigeScore`, `professional.route`;
- `contract.*`;
- flags `ABROAD_ROUTE`, `LOAN_ACTIVE`, `BIG_CLUB`.

Regression test: todo evento activo `phase === "30_34"` debe quedar sin efectos authority-owned.

### C30-34-CODEX-002 — offer bridges y provenance

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
- una oferta pendiente sigue siendo autoritativa tras save/restore equivalente;
- `EVT_31_MKT_001` permanece fuera de `offerBridge` porque exige comparar dos ofertas simultáneas y el runtime solo persiste una.

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

El workflow focal ejecuta ya esta suite. Run `35225530285`: **SUCCESS**.

## Implementable ahora por Codex

### C30-34-CODEX-005 — continuar caracterización deportiva solo con semántica demostrable

Revisar las escenas restantes una a una. Para cualquier escena que requiera de forma inequívoca:

- convocatoria;
- titularidad/suplencia;
- minutos;
- gol/asistencia;
- resultado;
- semifinal/final/competición;
- secuencia temporal concreta de partidos;
- regreso efectivo tras lesión;

registrar el hecho exacto requerido y mantener la escena bloqueada mientras ese hecho sea `null`/`unavailable`.

No inferir desde edad, `roleScore`, forma, reputación, confianza del entrenador, `seasonDay`, mes ni flags narrativos.

Especialmente, no convertir `EVT_30_FORM_001` en una lectura ficticia de “últimos seis partidos” hasta que exista historial deportivo autoritativo suficiente. `EVT_32_FAN_001` tampoco debe reinterpretarse como rendimiento de partido sin una fuente exacta que modele esa semántica.

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

### EVT_31_MKT_001 — dos ofertas simultáneas

El canon compara dos propuestas a la vez. `MarketState.pending` representa una sola `CareerOffer`. No convertir esta escena en bridge hasta que mercado modele comparación múltiple con identidad/provenance persistible.

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

La suite `Repository integrity` run `35225530340` pasa build/final gate, T5.2, sport context/football moments, saves, T5.3 y registros T5.1 previos, y se detiene exactamente en `freeze-t51-active-source --check` porque ese fixture aún no existe. Este fallo es el sentinel esperado y no debe silenciarse desde esta rama.

## Invariantes

- edad no fuerza retirada;
- retirada internacional != retirada de club;
- Documento Maestro prevalece;
- empleo/contrato solo desde `CareerOffer/respondToOffer`;
- hechos deportivos concretos solo desde autoridad deportiva real;
- sin aliases silenciosos;
- sin renombrados destructivos.
