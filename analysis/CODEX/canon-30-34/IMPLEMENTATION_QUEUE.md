# Codex implementation queue — Canon 30–34

Re-grounded sobre `main@6d2239ae1f89be97a7c5cf117d456cff9218aade`.

El Documento Maestro sigue siendo autoridad canónica. Una API compartida que devuelva `null` / `unavailable` no autoriza proxies: la escena debe fallar cerrado.

Mapa scene-by-scene de deuda compartida: `analysis/T5.1/canon-30-34-authority-debt.json`.

## Cerrado en esta rama

### C30-34-CODEX-001 — authority guard

`src/content/events/30_34/index.ts` elimina del catálogo activo cualquier `Effect` narrativo que intente mutar estado propiedad de `CareerOffer/respondToOffer`: club/tier/ownership/registration/league/prestige/route, `contract.*` y flags `ABROAD_ROUTE`, `LOAN_ACTIVE`, `BIG_CLUB`.

### C30-34-CODEX-002 — consumo formal de ofertas y provenance

Tres escenas consumen una `CareerOffer` formal:

1. `EVT_31_HOME_001`: oferta real cuyo destino/owner/registration es `UDV`.
2. `EVT_32_HOME_001`: oferta real cuyo destino/owner/registration es `UDV`.
3. `EVT_32_CON_001`: renovación formal anual (`reason === "Renovación de contrato"`, mismo club/owner/registration, `terms.months === 12`).

Cobertura focal demuestra elegibilidad negativa, `accept/counter/defer`, aplicación exacta de términos, provenance y save/restore. Esto no certifica la cláusula canónica de renovación automática por minutos porque `CareerTerms` aún no puede persistirla.

`EVT_31_MKT_001` permanece fuera de `offerBridge`: exige dos ofertas simultáneas y el runtime solo persiste una.

### C30-34-CODEX-003 — deuda deportiva caracterizada

Dos falsos positivos inequívocos fallan cerrado con facts autoritativos:

- `EVT_31_FINAL_001`: requiere `facts.sport.currentCompetition` y `facts.sport.nextFixture`.
- `EVT_33_BODY_001`: requiere `facts.sport.nextFixture` y `facts.sport.hoursToNextFixture`.

Forma, rol, edad, mes, confianza o flags no sustituyen esos hechos.

### C30-34-CODEX-004 — regresiones de authority gaps

`scripts/test-t51-30-34-sport-authority.mjs` fija fail-closed deportivo. `scripts/test-t51-30-34-authority-gaps.mjs` fija además que `CareerTerms` no representa renovación automática por minutos, `MarketState.pending` es single-offer y `EVT_31_MKT_001` / `EVT_33_MKT_001` no deben recibir `offerBridge` con esa cardinalidad.

### C30-34-CODEX-008 — ownership de cuatro seeds huérfanas

Las 4 seeds owner 30–34 sin productor runtime/consumidor tienen writer canónico uno-a-uno:

- `SEED_ROLE_COMMUNICATION` → `EVT_30_CCH_001`.
- `SEED_FALSE_ULTIMATUM` → `EVT_30_PRS_001`.
- `SEED_NATIONAL_ABSENCE` → `EVT_30_NAT_002`.
- `SEED_SPECIALIST_BIGCLUB` → `EVT_30_JAN_001`.

`scripts/test-t51-30-34-seed-handoff.mjs` impide proxyarlas a eventos legacy/genéricos. `PASADA_6_30_34` es provenance editorial, no `originEvent` runtime.

### C30-34-CODEX-010 — handoff downstream de seeds frontera 30–34 → 34+/retirada

`analysis/T5.1/canon-30-34-downstream-seed-handoff.json` formaliza seis memorias sin inventar consumidor ni terminalidad:

- `SEED_AGE34_PRIORITY` — `EVT_33_CON_001`, `EVT_33_END_001`, `EVT_33_MKT_001`;
- `SEED_RETIREMENT_PUBLIC_TONE` — `EVT_33_PRS_001`;
- `SEED_HOME_PULL_PUBLIC` — `EVT_33_HOME_001`, `EVT_33_PRS_001`;
- `SEED_FINAL_FOUR_WAYS` — `EVT_33_MKT_001`;
- `SEED_VETERAN_LEADERSHIP_FINAL` — `EVT_33_CAP_001`;
- `SEED_72H_LIMIT` — `EVT_33_BODY_001`.

Se conserva provenance múltiple y `SEED_LAST_BIG_MOVE_WINDOW` queda fuera del boundary handoff. `scripts/test-t51-30-34-downstream-seed-handoff.mjs` valida writers runtime, cardinalidad y ausencia de provenance editorial falsa.

### C30-34-CODEX-011 — `seedsRead` no equivale a consumo causal

Se corrigió una sobreclasificación de siete enlaces de principal a principal. Antes aparecían como `confirmedChains`; ahora son `declaredReadLinks` porque solo declaran memoria contextual y no existe dependencia causal runtime:

- `SEED_AGE30_CONTRACT` → `EVT_31_MKT_001`, `EVT_32_CON_001`;
- `SEED_MATCH_SELECTIVITY` → `EVT_33_BODY_001`;
- `SEED_NATIONAL_PHASEDOWN` → `EVT_32_NAT_001`;
- `SEED_CAPTAIN_HANDOVER` → `EVT_33_CAP_001`;
- `SEED_AGENT_LAST_CONTRACT` → `EVT_31_AGT_001`;
- `SEED_SURGERY_31` → `EVT_31_RETURN_001`;
- `SEED_HOME_RETURN_31` → `EVT_32_HOME_001`.

`causalChainsConfirmed = []` para ese subconjunto. Promoción exige gate/gateAlternative, choice eligibility, outcome condition/modifier, simulation edge registrada o terminal real. `SEED_CHRONIC_BODY → EVT_31_MED_001` sirve como control positivo porque sí existe `HAS_SEED_CHRONIC_BODY`.

Guard: `scripts/test-t51-30-34-seed-consumption.mjs`.

## Implementable ahora por Codex

### C30-34-CODEX-005 — continuar caracterización deportiva solo con semántica demostrable

No inferir hechos concretos desde edad, `roleScore`, forma, reputación, confianza, `seasonDay`, mes o flags. Casos pendientes claros:

- `EVT_32_FAN_001`: aparición/rendimiento real del partido + reacción de grada.
- `EVT_31_RETURN_001`: alta médica + readiness + contexto de convocatoria.
- `EVT_32_NAT_001`: prelista/torneo real.
- `EVT_30_FORM_001`: historial longitudinal de seis partidos/cinco goles.
- `EVT_31_ROLE_001`: tres goles recientes + banquillo real.

### C30-34-CODEX-006 — autoridad multi-oferta

`MarketState.pending` es cero-o-una `CareerOffer`. `EVT_31_MKT_001` necesita dos propuestas simultáneas y `EVT_33_MKT_001` cuatro. No fabricar pluralidad desde `marketHeat`.

### C30-34-CODEX-007 — cláusula formal de renovación por minutos

`EVT_32_CON_001` consume renovación formal de 12 meses, pero `CareerTerms` no representa `renewalByMinutes`, threshold ni renovación automática. La extensión pertenece a autoridad contractual global y debe preservar saves.

### C30-34-CODEX-009 — batch coordinado de principales missing

No añadir individualmente los cinco IDs missing desde esta rama porque cambian `contentIdentity`:

- `EVT_30_CCH_001` → `SEED_ROLE_COMMUNICATION`.
- `EVT_30_PRS_001` → `SEED_FALSE_ULTIMATUM`.
- `EVT_30_NAT_002` → `SEED_NATIONAL_ABSENCE`.
- `EVT_30_JAN_001` → `SEED_SPECIALIST_BIGCLUB`.
- `EVT_31_ROLE_001` → además bloqueado por autoridad goles + banquillo.

Orden seguro: freeze/edge actual → batch de cinco → freeze/edge nuevo → comprobar `withoutRuntimeProducer: 4 → 0` → mantener `EVT_31_ROLE_001` fail-closed hasta tener sport authority.

### C30-34-CODEX-012 — clasificar los 7 `declaredReadMismatches` owner 30–34

El audit compartido sigue reportando exactamente 7 mismatches de lectura para seeds cuyo owner es `t51/canon-30-34`. Deben revisarse uno a uno y clasificarse como:

- callback/condicional con consumo causal canónico demostrable, en cuyo caso implementar la superficie causal exacta; o
- metadata `seedsRead` no causal/stale, en cuyo caso no certificarlo como consecuencia y preparar la corrección sin inventar gates.

No resolver por similitud de título o seed ID. El inventario condicional canónico autoritativo sigue ausente, así que la rama no puede declarar esas identidades `verified`.

## Blockers duros

### Sporting authority

`main` expone read surface deportiva pero mantiene `null` para competición, fixtures, horas al próximo partido, match-day/training window, partidos restantes, objetivo/posición, squad status, convocatoria, banquillo, titularidad, minutos, goles, asistencias y resultado.

### Role expectation facts

`main@6d2239a` expone `facts.roleDropSince23` y `facts.roleGuaranteeAt23`; no prueban producción reciente ni una decisión actual de banquillo.

### Market / contract authority

- single pending offer bloquea paridad de `EVT_31_MKT_001` / `EVT_33_MKT_001`;
- ausencia de cláusula por minutos bloquea paridad completa de `EVT_32_CON_001`.

### Identidad / contenido

- 18 identidades desplazadas requieren migración explícita;
- 5 principales missing requieren batch coordinado;
- 26 condicionales carecen de inventario canónico autoritativo;
- `EVT_30_BRIDGE_001` sigue desplazado frente a `EVT_30_IDN_001`, por lo que no se fuerza prioridad sobre el legacy.

### Seeds

Audit owner 30–34: 52 seeds, 48 con productor runtime, 4 sin productor, 13 con algún consumidor estructural, 0 terminales explícitos, 52 open-ended y 7 `declaredReadMismatches`. `withAnyConsumer` no significa consecuencia canónica certificada.

## Migración y validación

Target actual:

`14164e54ec4250e50b915c29c959b35a56ff7ccd249a99c4ad026925af2d8c07`

Fixture requerido antes de registrar ruta:

`qa/fixtures/t5.1/post-t51-sources/14164e54ec4250e50b915c29c959b35a56ff7ccd249a99c4ad026925af2d8c07.json`

Este workstream no crea el fixture global ni registra `CONTENT_MIGRATION_ROUTES`.

Focused HEAD: run `35236203406` — **SUCCESS**, incluidos los 9 guards 30–34.

Repository integrity HEAD: run `35236203349` — falla **solo** en `freeze-t51-active-source --check` por ausencia del fixture `14164e54…8c07`; antes pasan build/final gate, T5.2 lifecycle/deferred/closure-readiness, sport/football moments, saves, T5.3, registries y offer-bridge evidence.

## Invariantes

- edad no fuerza retirada;
- retirada internacional != retirada de club;
- Documento Maestro prevalece;
- empleo/contrato solo desde autoridad compartida;
- hechos deportivos concretos solo desde autoridad real;
- multi-oferta solo desde autoridad real;
- una seed missing solo nace desde su writer canónico;
- `seedsRead` no certifica consumo causal;
- `PASADA_6_30_34` no se convierte en provenance runtime;
- sin aliases ni renombrados destructivos.
