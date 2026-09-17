# Codex implementation queue — Canon 30–34

Baseline: `main@6d2239ae1f89be97a7c5cf117d456cff9218aade`.

El Documento Maestro es autoridad. `null` / `unavailable` en una API compartida implica fail-closed; no autoriza proxies.

## Cerrado en esta rama

### C30-34-CODEX-001 — career authority guard

El catálogo activo 30–34 elimina efectos narrativos sobre estado propiedad de `CareerOffer/respondToOffer`: club/owner/registration/tier/route/prestige, `contract.*` y flags de transferencia/préstamo/gran club.

### C30-34-CODEX-002 — ofertas formales + provenance

`EVT_31_HOME_001`, `EVT_32_HOME_001` y `EVT_32_CON_001` consumen ofertas formales. Tests cubren elegibilidad negativa, `accept/counter/defer`, términos exactos, provenance y save/restore.

No implica paridad total de `EVT_32_CON_001`: `CareerTerms` todavía no persiste la cláusula canónica de renovación automática por minutos.

### C30-34-CODEX-003 — sport fail-closed

- `EVT_31_FINAL_001` requiere competición + próximo fixture.
- `EVT_33_BODY_001` requiere próximo fixture + horas al fixture.

No se sustituyen por forma, rol, edad, mes, confianza o flags.

### C30-34-CODEX-004 — regresiones de authority gaps

Guards ejecutables fijan sport fail-closed, ausencia de cláusula contractual por minutos y cardinalidad single-offer del mercado.

### C30-34-CODEX-008 — ownership de cuatro seeds huérfanas

- `SEED_ROLE_COMMUNICATION` → `EVT_30_CCH_001`.
- `SEED_FALSE_ULTIMATUM` → `EVT_30_PRS_001`.
- `SEED_NATIONAL_ABSENCE` → `EVT_30_NAT_002`.
- `SEED_SPECIALIST_BIGCLUB` → `EVT_30_JAN_001`.

No se permiten productores legacy/genéricos. `PASADA_6_30_34` es provenance editorial, no runtime.

### C30-34-CODEX-010 — handoff de seeds frontera 34+/retirada

`analysis/T5.1/canon-30-34-downstream-seed-handoff.json` conserva provenance real de:

- `SEED_AGE34_PRIORITY` — `EVT_33_CON_001`, `EVT_33_END_001`, `EVT_33_MKT_001`;
- `SEED_RETIREMENT_PUBLIC_TONE` — `EVT_33_PRS_001`;
- `SEED_HOME_PULL_PUBLIC` — `EVT_33_HOME_001`, `EVT_33_PRS_001`;
- `SEED_FINAL_FOUR_WAYS` — `EVT_33_MKT_001`;
- `SEED_VETERAN_LEADERSHIP_FINAL` — `EVT_33_CAP_001`;
- `SEED_72H_LIMIT` — `EVT_33_BODY_001`.

El handoff no inventa consumidor ni terminalidad.

### C30-34-CODEX-011 — `seedsRead` != causalidad

Siete enlaces principal→principal fueron degradados de `confirmedChains` a `declaredReadLinks` porque solo declaran contexto y no dependen runtime de la seed:

- `SEED_AGE30_CONTRACT` → `EVT_31_MKT_001`, `EVT_32_CON_001`;
- `SEED_MATCH_SELECTIVITY` → `EVT_33_BODY_001`;
- `SEED_NATIONAL_PHASEDOWN` → `EVT_32_NAT_001`;
- `SEED_CAPTAIN_HANDOVER` → `EVT_33_CAP_001`;
- `SEED_AGENT_LAST_CONTRACT` → `EVT_31_AGT_001`;
- `SEED_SURGERY_31` → `EVT_31_RETURN_001`;
- `SEED_HOME_RETURN_31` → `EVT_32_HOME_001`.

Control positivo: `SEED_CHRONIC_BODY → EVT_31_MED_001` sí tiene gate `HAS_SEED_CHRONIC_BODY`.

### C30-34-CODEX-012 — 7 `declaredReadMismatches` condicionales clasificados

`analysis/T5.1/canon-30-34-conditional-seed-read-debt.json` demuestra que los siete mismatches son consumidores **runtime** positivos mediante gates `HAS_SEED_*`:

- `CEVT_31_SURGERY_01` → `SEED_SURGERY_31`;
- `CEVT_31_COACH_01` → `SEED_NEW_COACH_RESET`;
- `CEVT_31_NTLOAD_01` → `SEED_CLUB_NT_LOAD_TENSION`;
- `CEVT_31_FINAL_01` → `SEED_MANAGED_FINAL_ROLE`;
- `CEVT_32_REPLACE_01` → `SEED_REPLACEMENT_BREAKOUT`;
- `CEVT_32_BOSMAN_01` → `SEED_BOSMAN_33`;
- `CEVT_32_FAN_01` → `SEED_FAN_LEGACY_BUFFER`.

La deuda es metadata: esos eventos no declaran todavía `seedsRead`. No se llaman consumidores **canónicos** verificados porque los 26 condicionales siguen sin identidad canónica autoritativa y estos siete continúan `technical_adaptation`.

No se elimina el gate para silenciar el audit. Tampoco se añade `seedsRead` antes del freeze actual: `contentIdentity` hashea `JSON.stringify(EVENTS)`, por lo que esa metadata produciría otra identidad de catálogo.

Guard: `scripts/test-t51-30-34-conditional-seed-reads.mjs`.

## Implementable / bloqueado para Codex

### C30-34-CODEX-005 — seguir caracterización deportiva exacta

Pendientes claros:

- `EVT_32_FAN_001`: aparición/rendimiento real + reacción de grada;
- `EVT_31_RETURN_001`: alta médica + readiness + contexto de convocatoria;
- `EVT_32_NAT_001`: prelista/torneo real;
- `EVT_30_FORM_001`: historial longitudinal seis partidos/cinco goles;
- `EVT_31_ROLE_001`: tres goles recientes + banquillo real.

No usar proxies.

### C30-34-CODEX-006 — autoridad multi-oferta

`MarketState.pending` es single-offer. `EVT_31_MKT_001` necesita dos ofertas simultáneas; `EVT_33_MKT_001`, cuatro. Requiere autoridad compartida persistible multi-oferta.

### C30-34-CODEX-007 — renovación automática por minutos

`CareerTerms` necesita representar la cláusula sin romper saves antes de certificar `EVT_32_CON_001`.

### C30-34-CODEX-009 — batch de cinco principales missing

No añadir individualmente antes del freeze/edge actual:

- `EVT_30_CCH_001`;
- `EVT_30_PRS_001`;
- `EVT_30_NAT_002`;
- `EVT_30_JAN_001`;
- `EVT_31_ROLE_001`.

Orden: freeze/edge actual → batch exacto → freeze/edge nuevo → comprobar `withoutRuntimeProducer: 4 → 0` → mantener `EVT_31_ROLE_001` fail-closed mientras falte sport authority.

### C30-34-CODEX-013 — reconciliar metadata condicional después de identidad/freeze

Precondiciones:

1. integración congela y registra el target actual `14164e54…8c07`;
2. existe decisión autoritativa sobre identidad de los condicionales implicados.

Entonces, para cada callback que siga aprobado, añadir exactamente su `seedsRead`, recalcular/freeze la nueva identidad y registrar su edge. No agrupar esta mutación con un alias o renombrado condicional no aprobado.

## Blockers duros

- sport authority concreta sigue incompleta;
- mercado sigue single-offer;
- contrato no representa renovación por minutos;
- 18 identidades desplazadas requieren migración explícita;
- 5 principales missing requieren batch coordinado;
- 26 condicionales carecen de inventario canónico autoritativo;
- bridge `EVT_30_BRIDGE_001` sigue desplazado frente a `EVT_30_IDN_001`.

## Seeds — lectura correcta de métricas

Owner 30–34:

- 52 seeds;
- 48 con productor runtime;
- 4 sin productor;
- 13 con algún consumidor estructural;
- 39 sin consumidor;
- 0 terminales explícitos;
- 52 open-ended;
- 7 `declaredReadMismatches` ya clasificados como gates runtime reales + metadata faltante.

`withAnyConsumer = 13` no equivale a 13 consecuencias canónicas certificadas.

## Migración

Source congelada del handoff:

`5d3fd71a8df42ed5b93fdde63ed386e9d776693addd62a30293dbecad7aa56d2`

Target actual:

`14164e54ec4250e50b915c29c959b35a56ff7ccd249a99c4ad026925af2d8c07`

Freeze requerido:

`qa/fixtures/t5.1/post-t51-sources/14164e54ec4250e50b915c29c959b35a56ff7ccd249a99c4ad026925af2d8c07.json`

Este workstream no crea el fixture ni registra `CONTENT_MIGRATION_ROUTES`.

## Validación

Última validación cerrada antes de C012:

- focused `35236203406` — **SUCCESS**, 9 guards;
- repository integrity `35236203349` — fallo únicamente en `freeze-t51-active-source --check`; el resto previo al sentinel pasa.

El workflow actual ejecuta 10 guards e incluye `scripts/test-t51-30-34-conditional-seed-reads.mjs`. Sustituir los IDs anteriores por el run final del HEAD cuando termine.

## Invariantes

- edad no fuerza retirada;
- retirada internacional != retirada de club;
- Documento Maestro prevalece;
- no aliases silenciosos;
- no renombrados destructivos;
- no proxies deportivos;
- no ofertas inventadas;
- no terminalidad artificial de seeds;
- `seedsRead` no certifica causalidad;
- consumo runtime no certifica identidad canónica.
