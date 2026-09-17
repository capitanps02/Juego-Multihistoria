# Codex implementation queue — Canon 30–34

Baseline vigente: `main@c41e7de20daf3bd672ae54646428e921761008c8`.

Lineage de integración actual:

- fuente upstream congelada: `84871fae2bec92d74d1e607e0a48943e2e530a062d315a829cfe75eda9fe0886`;
- target 30–34: `3ecee9e2329be03cb566c459fc1aecd0c32d759354aadf40061494873e392ba5`;
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

### C30-34-CODEX-003 / 004 — sport authority fail-closed

Certificado para:

- `EVT_31_FINAL_001`: competición + próximo fixture;
- `EVT_33_BODY_001`: próximo fixture + horas al fixture.

Los tests demuestran que forma, rol, edad, mes o flags no desbloquean esos eventos cuando la autoridad deportiva concreta falta.

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

Guard: `scripts/test-t51-30-34-conditional-seed-reads.mjs`.

## Implementable / bloqueado para Codex

### C30-34-CODEX-005 — sport authority scene-by-scene

Pendientes que requieren hechos exactos, no proxies:

- `EVT_30_FORM_001`: historial real de seis partidos/cinco goles;
- `EVT_31_RETURN_001`: alta/readiness + convocatoria real;
- `EVT_31_ROLE_001`: tres goles recientes + banquillo real;
- `EVT_32_FAN_001`: aparición/rendimiento real + reacción de grada;
- `EVT_32_NAT_001`: prelista/torneo real.

### C30-34-CODEX-006 — autoridad multi-oferta

`EVT_31_MKT_001` necesita dos ofertas simultáneas; `EVT_33_MKT_001`, cuatro rutas/propuestas. Requiere diseño compartido persistible multi-oferta.

### C30-34-CODEX-007 — renovación automática por minutos

`CareerTerms` aún no representa la cláusula canónica de renovación automática por minutos de `EVT_32_CON_001`.

### C30-34-CODEX-009 — batch de cinco principales missing

Pendientes:

`EVT_30_CCH_001`, `EVT_30_PRS_001`, `EVT_30_NAT_002`, `EVT_30_JAN_001`, `EVT_31_ROLE_001`.

Deben entrar como batch coordinado posterior al freeze/edge actual; su alta produce una nueva identidad.

### C30-34-CODEX-013 — metadata condicional

Precondiciones:

1. integración congela y registra el target actual `3ecee9e2…92ba5`;
2. existe decisión autoritativa sobre la identidad de los condicionales implicados.

Solo entonces añadir `seedsRead` exacto donde proceda y generar un nuevo freeze/edge explícito.

### C30-34-CODEX-014 — identidades desplazadas

18 parejas siguen `sameSceneMigrationAllowed:false`. No resolver por similitud de nombres ni string matching; requieren revisión/migración explícita.

## Estado de seeds owner 30–34

- 52 asignadas;
- 48 con productor runtime;
- 4 sin productor;
- 13 con algún consumidor estructural;
- 39 sin consumidor;
- 0 terminales explícitos;
- 52 open-ended;
- 7 `declaredReadMismatches` clasificados como consumo runtime real + metadata pendiente.

`withAnyConsumer = 13` no equivale a 13 consecuencias canónicas certificadas.

## Integración

Fuente congelada vigente del handoff:

`84871fae2bec92d74d1e607e0a48943e2e530a062d315a829cfe75eda9fe0886`

Target:

`3ecee9e2329be03cb566c459fc1aecd0c32d759354aadf40061494873e392ba5`

Freeze que coordinación/integración deberá crear antes de registrar la ruta:

`qa/fixtures/t5.1/post-t51-sources/3ecee9e2329be03cb566c459fc1aecd0c32d759354aadf40061494873e392ba5.json`

## Validación

- focused re-grounded `35242943034` — **SUCCESS**, 10/10 guards;
- repository integrity del mismo HEAD: `35242943066` en ejecución al redactar esta actualización.

La pasada anterior `35242289109` quedó 54/55 únicamente porque conservaba el target anterior; ese mismatch fue corregido a `3ecee9e2…92ba5`.

## Invariantes

- edad no fuerza retirada;
- retirada internacional != retirada de club;
- no aliases silenciosos ni renombrados destructivos;
- no proxies deportivos ni ofertas inventadas;
- no terminalidad artificial de seeds;
- `seedsRead` no certifica causalidad;
- consumo runtime no certifica identidad canónica;
- historia legacy no se reescribe como canon nuevo.
