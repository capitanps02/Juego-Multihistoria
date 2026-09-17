# Codex implementation queue — Canon 30–34

Re-grounded sobre `main@cfb9459934fcd09e52300027f47935f773e60823`.

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

## Implementable ahora por Codex

### C30-34-CODEX-003 — caracterizar deuda deportiva escena a escena

Usar exclusivamente `facts.sport` / `facts.match` para hechos deportivos concretos.

Para cada escena 30–34 con semántica de:

- convocatoria;
- titularidad/suplencia;
- minutos;
- gol/asistencia;
- resultado;
- final/semifinal/competición;
- dos partidos en 72 horas;
- racha de partidos;
- vuelta tras lesión;

registrar el hecho exacto requerido y mantener la escena bloqueada mientras ese hecho sea `null`/`unavailable`.

No inferir desde edad, `roleScore`, forma, reputación, confianza del entrenador, `seasonDay`, mes ni flags narrativos.

### C30-34-CODEX-004 — pruebas de fail-closed deportivo

Añadir regresiones que eleven deliberadamente todos los proxies históricos y demuestren que una escena que exige fixture/match/squad real sigue sin pasar cuando `facts.sport`/`facts.match` no tienen autoridad.

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

`8efa101a7d1742e06272e697025c6fc63eb46c3fc3813bae408feb1da11d9ecb`

El workstream no registra por sí mismo `CONTENT_MIGRATION_ROUTES` ni congela el target global. Eso sigue siendo ownership de coordinación/integración.

## Invariantes

- edad no fuerza retirada;
- retirada internacional != retirada de club;
- Documento Maestro prevalece;
- empleo/contrato solo desde `CareerOffer/respondToOffer`;
- hechos deportivos concretos solo desde autoridad deportiva real;
- sin aliases silenciosos;
- sin renombrados destructivos.
