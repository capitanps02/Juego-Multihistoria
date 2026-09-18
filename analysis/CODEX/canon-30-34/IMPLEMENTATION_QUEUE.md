# Codex implementation queue — Canon 30–34

Baseline vigente: `main@5f4d14bca4d696cfafadb58b64034c7cd40cc147`.

Lineage de integración actual:

- fuente upstream congelada: `84871fae2bec92d74d1e607e0a48943e2e530a062d315a829cfe75eda9fe0886`;
- target 30–34: `9151d6620739f5f63face23f412abdeca9898cac8e510cc44d86c1468da8d0f4`;
- este workstream **no** crea el freeze target ni registra `CONTENT_MIGRATION_ROUTES`.

El Documento Maestro es autoridad. Un dato compartido `null`/`unavailable` implica fail-closed; no autoriza proxies.

## Cerrado en esta rama

### C30-34-CODEX-001 — career authority guard

El catálogo 30–34 no puede mutar desde efectos narrativos el estado propiedad de CareerOffer/contrato/registro de club.

### C30-34-CODEX-002 — ofertas formales y provenance

Bridges reales para:

- `EVT_31_HOME_001`;
- `EVT_32_HOME_001`;
- `EVT_32_CON_001`.

`accept/counter/defer/reject`, provenance y save/restore están cubiertos por tests. `EVT_31_MKT_001` permanece fuera porque el canon exige dos ofertas simultáneas y el runtime persiste una sola.

### C30-34-CODEX-003 / 004 — sport authority: guards parciales tras el match model

El nuevo calendario semanal de `main@5f4d14bc…` ya expone `currentCompetition`, `nextFixture` y `hoursToNextFixture`. Eso invalida la antigua clasificación “protected fail-closed”:

- `EVT_31_FINAL_001`: una fixture ordinaria de liga + `FINAL_CONTEXT` puede satisfacer los gates actuales sin probar que sea una final;
- `EVT_33_BODY_001`: una separación de 144/168 h puede satisfacer gates de mera existencia sin probar dos titularidades dentro de 72 h.

La deuda queda explícita en `canon-30-34-authority-debt.json`; no se añaden gates de contenido antes del freeze/edge actual.

### C30-34-CODEX-008 — cuatro writers huérfanos

- `SEED_ROLE_COMMUNICATION` → `EVT_30_CCH_001`;
- `SEED_FALSE_ULTIMATUM` → `EVT_30_PRS_001`;
- `SEED_NATIONAL_ABSENCE` → `EVT_30_NAT_002`;
- `SEED_SPECIALIST_BIGCLUB` → `EVT_30_JAN_001`.

No se permiten productores legacy/genéricos.

### C30-34-CODEX-010 — handoff frontera 34+/retirada

`canon-30-34-downstream-seed-handoff.json` fija provenance real sin inventar consumidores ni terminalidad. En particular `SEED_AGE34_PRIORITY` conserva tres writers reales y `SEED_HOME_PULL_PUBLIC` dos.

### C30-34-CODEX-011 — `seedsRead` no certifica causalidad

Siete enlaces principal→principal antes sobreclasificados quedaron como `declaredReadLinks`. Un reader declarado sin gate/eligibility/outcome/simulation causal no se cuenta como consecuencia confirmada.

### C30-34-CODEX-012 — siete callbacks `HAS_SEED_*`

Los siete `declaredReadMismatches` owner 30–34 sí son consumidores runtime positivos, pero siguen sin identidad canónica certificada. No se añade `seedsRead` todavía porque esa metadata cambia `contentIdentity`.

El debt condicional quedó re-anclado al baseline `main@5f4d14bc…` y al target `9151d662…`; su guard exige que siga coincidiendo con readiness + migration handoff para impedir que una metadata pendiente quede asociada a un catálogo antiguo.

Guard: `scripts/test-t51-30-34-conditional-seed-reads.mjs`.

### C30-34-CODEX-015 — convergencia raw-source con Career Authority

Se eliminaron 17 escrituras directas a club/contrato de las definiciones raw 30–34 que el guard de autoridad ya descartaba en runtime. La limpieza no eleva deuda compartida ni cambia semántica activa.

Se preservó explícitamente el orden estable de tags del offer bridge. Una comparación determinista del catálogo antes/después terminó con `DIFFERING_EVENTS=0`, por lo que el target permanece exactamente en `9151d662…8d0f4`.

### Autoridad de liderazgo — `EVT_33_CAP_001` / `EVT_30_CAP_001`

`EVT_33_CAP_001` consume la autoridad explícita de liderazgo del jugador en su club actual y falla cerrado ante proxies: influencia, seeds, `captain_group`, `secondary_captain` o autoridad obsoleta de un club anterior no bastan.

`EVT_30_CAP_001` permanece con paridad parcial. `LOCKER_LEADERSHIP_ASSIGNMENTS` no contiene ninguna asignación `30_34`, por lo que los hechos de afinidad de capitán/estrella fallan cerrado. El canon exige un `LOCKER_WEIGHT` alto y no existe un mapeo autoritativo que permita sustituirlo por `professional.lockerPower` o una relación NPC arbitraria.

Guard: `scripts/test-t51-30-34-authority-gaps.mjs`.

### C30-34-CODEX-016 — lineage de paridad y seed canónica ausente

`canon-30-34-parity-evidence.json` ya está reconciliado con el handoff vigente `84871fae… → 9151d662…`.

El Documento Maestro de `EVT_30_CON_001` referencia además `SEED_LAST_PEAK_CONTRACT`, pero ese ID no existe actualmente en `src/catalog/seeds.ts`. No se crea, renombra ni mapea a `SEED_AGE30_CONTRACT`, `SEED_LAST_BIG_MOVE_WINDOW` u otra seed por semejanza semántica.

Los guards exigen simultáneamente:

- que source/target de la evidencia de paridad coincidan con el migration handoff;
- que `SEED_LAST_PEAK_CONTRACT` siga ausente mientras no exista una definición runtime aprobada;
- que esta deuda no permita promover `EVT_30_CON_001` a identidad canónica verificada.

## Implementable / bloqueado para Codex

### C30-34-CODEX-005 — sport authority scene-by-scene

Pendientes que requieren hechos exactos, no proxies:

- `EVT_30_FORM_001`: historial real de seis partidos/cinco goles;
- `EVT_31_RETURN_001`: alta/readiness + convocatoria real;
- `EVT_31_ROLE_001`: tres goles recientes + banquillo real;
- `EVT_32_FAN_001`: aparición/rendimiento real + reacción de grada;
- `EVT_32_NAT_001`: prelista/torneo real.

Ratchet validado en `scripts/test-t51-30-34-authority-gaps.mjs`: los cinco blockers deben permanecer explícitos, los cuatro eventos ya existentes siguen `technical_adaptation`, `EVT_31_ROLE_001` permanece ausente y maximizar forma/roleScore/nationalStanding/roleSecurity o flags no puede materializar hechos de competición, fixture, convocatoria, banquillo, titularidad, aparición, minutos, resultado o goles. La proyección se mantiene read-only.

No añadir gates nuevos a estos eventos antes del freeze/edge del target actual: hacerlo movería `contentIdentity` y pertenece al siguiente batch coordinado.

### C30-34-CODEX-006 — autoridad multi-oferta

`EVT_31_MKT_001` necesita dos ofertas simultáneas; `EVT_33_MKT_001`, cuatro rutas/propuestas. `getEligibleCareerOffers()` ya existe, pero deriva del único `MarketState.pending`, por lo que hoy devuelve como máximo una oferta. El nombre plural no cierra este blocker.

Requiere diseño compartido persistible multi-oferta con identidad/provenance por oferta.

### C30-34-CODEX-007 — renovación automática por minutos

`CareerTerms` aún no representa la cláusula canónica de renovación automática por minutos de `EVT_32_CON_001`.

### C30-34-CODEX-009 — batch de cinco principales missing

Pendientes:

`EVT_30_CCH_001`, `EVT_30_PRS_001`, `EVT_30_NAT_002`, `EVT_30_JAN_001`, `EVT_31_ROLE_001`.

Deben entrar como batch coordinado posterior al freeze/edge actual; su alta produce una nueva identidad.

### C30-34-CODEX-013 — metadata condicional

Precondiciones:

1. integración congela y registra el target actual `9151d662…8d0f4`;
2. existe decisión autoritativa sobre la identidad de los condicionales implicados.

Solo entonces añadir `seedsRead` exacto donde proceda y generar un nuevo freeze/edge explícito.

### C30-34-CODEX-014 — identidades desplazadas

18 parejas siguen `sameSceneMigrationAllowed:false`. No resolver por similitud de nombres ni string matching; requieren revisión/migración explícita.

### C30-34-CODEX-017 — definición canónica de `SEED_LAST_PEAK_CONTRACT`

Bloqueado en T5.2/canon. Antes de materializar esa seed deben quedar definidos al menos:

- identidad exacta del seed ID;
- scope y edad/expiración si procede;
- payload semántico;
- productor(es) canónicos;
- si `EVT_30_CON_001` la crea siempre o solo en outcomes concretos;
- consumidores/terminalidad solo si existe evidencia real.

Hasta entonces, Codex debe preservar la ausencia runtime y no sustituirla por otra seed existente.

## Estado de seeds owner 30–34

- 52 asignadas en el catálogo runtime actual;
- 48 con productor runtime;
- 4 sin productor;
- 13 con algún consumidor estructural;
- 39 sin consumidor;
- 0 terminales explícitos;
- 52 open-ended;
- 7 `declaredReadMismatches` clasificados como consumo runtime real + metadata pendiente;
- `SEED_LAST_PEAK_CONTRACT` es una referencia canónica adicional ausente del catálogo runtime y por tanto no se suma artificialmente a esas 52.

`withAnyConsumer = 13` no equivale a 13 consecuencias canónicas certificadas.

## Integración

Fuente congelada vigente del handoff:

`84871fae2bec92d74d1e607e0a48943e2e530a062d315a829cfe75eda9fe0886`

Target:

`9151d6620739f5f63face23f412abdeca9898cac8e510cc44d86c1468da8d0f4`

Freeze que coordinación/integración deberá crear antes de registrar la ruta:

`qa/fixtures/t5.1/post-t51-sources/9151d6620739f5f63face23f412abdeca9898cac8e510cc44d86c1468da8d0f4.json`

## Validación exacta

La evidencia más reciente de CI se mantiene en el cuerpo del PR #13 para evitar que esta cola quede obsoleta por commits documentales o re-ground de `main`.

Contrato de validación exigido para este workstream:

- `T5.1 canon 30-34` debe terminar **SUCCESS**;
- `T5 Market Contract Authority` debe terminar **SUCCESS**;
- `Repository Integrity` solo puede quedar rojo por el sentinel de `freeze-t51-active-source --check` mientras coordinación/integración no haya creado `qa/fixtures/t5.1/post-t51-sources/9151d6620739f5f63face23f412abdeca9898cac8e510cc44d86c1468da8d0f4.json`;
- cualquier fallo anterior a ese sentinel es regresión real y bloquea el handoff;
- la rama debe permanecer `behind_by=0` respecto de `main` antes de declarar el handoff vigente.

El target activo continúa siendo `9151d662…8d0f4`; este workstream no crea su freeze ni registra la ruta.

## Invariantes

- edad no fuerza retirada;
- retirada internacional != retirada de club;
- no aliases silenciosos ni renombrados destructivos;
- no proxies deportivos ni ofertas inventadas;
- no terminalidad artificial de seeds;
- `seedsRead` no certifica causalidad;
- consumo runtime no certifica identidad canónica;
- una referencia canónica ausente no autoriza crear/mutuar una seed por similitud;
- historia legacy no se reescribe como canon nuevo;
- este workstream no crea el freeze target ni registra la migration route.
