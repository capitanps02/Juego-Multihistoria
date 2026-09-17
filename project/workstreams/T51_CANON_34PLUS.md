# T5.1 — Canon 34+, retirada y epílogos

Rama exclusiva: `t51/canon-34plus`  
Fuente canónica: `analysis/2026-09-11/t1/principal-traceability.json`  
SHA-256 del Documento Maestro auditado: `9dce3a765c3a7a68f23b81c8b3de267df39d589f6d555ef318fb15739c1bde1e`

## Alcance y propiedad

Este workstream reconcilia el bloque canónico 34+, corrige la fase terminal de carrera y endurece la evidencia usada por los epílogos. No es propietario del schema de saves, del freeze global ni del registro central de migraciones/contentIdentity.

La rama se recompone sobre el `main` actual y conserva únicamente contenido, motor terminal, epílogos, pruebas y evidencia de propiedad 34+. La infraestructura compartida de freeze y migración permanece exactamente como la define `main`.

## Reconciliación canónica

De los 50 principales canónicos 34+ auditados:

| Estado | Cantidad |
|---|---:|
| `verified_same_identity` | 4 |
| `canonical_replacement` | 3 |
| `needs_reimplementation` | 13 |
| `canonical_missing` | 30 |
| `engine_only_noncanonical` | 30 |
| `requires_manual_review` | 0 |

Por tanto, **43 principales canónicos todavía no son implementaciones completas acreditables**: 13 requieren reimplementación y 30 faltan. El inventario completo está en `analysis/T5.1/canon-34plus.json`.

### Same-scene acreditados

- `EVT_RET_BODY_001`
- `EVT_RET_HIGH_001`
- `EVT_RET_LOW_001`
- `EVT_RET_ANNOUNCE_001`

### Reemplazos canónicos de ID

- `EVT_38_MKT_001` → `EVT_38_MARKET_001`
- `EVT_RET_HOME_001` → `EVT_RET_FAM_001`
- `EVT_RET_LAST_001` → `EVT_RET_LASTMATCH_001`

Los IDs legacy salen del EventIndex activo pero siguen siendo evidencia histórica/pending de compatibilidad. No se reescribe history/journal, no se hereda `SEEN_` canónico ni cooldown y un pending antiguo no se sustituye por la definición nueva.

### Cambios same-ID con semántica terminal reparada

- `EVT_RET_BODY_001`
- `EVT_RET_HIGH_001`
- `EVT_RET_LOW_001`
- `EVT_RET_ANNOUNCE_001`
- `CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED`
- `CEVT_RET_RECONSIDER`
- `CEVT_RET_STORYBOOK_LAST_GOAL`

`scripts/test-t51-34plus-catalog-drift.mjs` valida únicamente este conjunto propietario frente al freeze original. No pretende bloquear drift de otros batches T5.1 ya integrados en `main`.

## Máquina de retirada

Ruta normal:

`playing → decided → announced → closed`

Contratos:

- `decided → playing` solo puede ocurrir antes del anuncio;
- `announced → playing` está prohibido;
- `closed` es terminal;
- una transición ilegal deja `RETIREMENT_INVALID_TRANSITION_BLOCKED`;
- `reverseRetirement()` solo opera desde `decided` y respeta el máximo de reversals;
- el anuncio normal requiere `EVT_RET_ANNOUNCE_001`; no lo fabrica un temporizador;
- un cierre administrativo posterior al anuncio puede terminar como `no_last_match`, pero nunca inventa decisión o anuncio.

`CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED` puede reconocer una oferta tardía sin reabrir la carrera. `CEVT_RET_RECONSIDER` funciona como limpieza de flags antiguos y mantiene `announced`.

Un pending congelado de la versión antigua de `CEVT_RET_RECONSIDER` **no puede resolverse por igualdad de string ID**, porque la definición legacy permitía `announced → playing`. Debe usarse su definición/fingerprint congelada o rechazarse/diferirse explícitamente la migración.

## Mercado terminal y liveness

El agotamiento del mercado abre una decisión del jugador (`NO_MARKET_END_CONTEXT` + `NO_MARKET_DECISION_PENDING`) y no retira automáticamente. `EVT_38_MARKET_001` permite bajar salario/nivel, esperar, retirarse o llamar a un club; solo `RETIRE` mueve `playing → decided`.

Se eliminó el suelo artificial de probabilidad de oferta veterana: demanda compatible cero puede producir cero ofertas. No existe un hard cap de edad; cuerpo, rol, mercado y motivación gobiernan la continuidad.

Las decisiones terminales pueden reaparecer con cooldown largo para evitar deadlocks cuando el jugador aplaza o reconsidera antes de anunciar.

## Último partido

`EVT_RET_LASTMATCH_001` expresa intención y límites, pero no fabrica una aparición ni cierra la carrera por sí solo. La adaptación de `CEVT_RET_STORYBOOK_LAST_GOAL` no inventa un gol de despedida: puede acabar con aparición factual o con `no_last_match`.

## Epílogos

Se mantienen 20 familias con evidencia factual y conflictos duros. Entre los guardrails:

- `END_WORLD_LEGEND` requiere éxito deportivo directo además de capital de mito/títulos/legado;
- `END_NATIONAL_CAPTAIN` exige evidencia explícita de capitanía;
- `END_TOO_LONG` no se activa solo por edad;
- `END_UNFINISHED_FEELING` requiere evidencia explícita de final bajo;
- `END_STORYBOOK_FAREWELL` exige un cierre factual compatible;
- `END_GREAT_PRO` es fallback neutral.

El contrato serializado de `epilogue.milestones` permanece exactamente:

`season · eventId · choiceId`

T5.37 sigue siendo responsable de la prosa final rica; no se declara completado aquí.

## Migración y lineage

Artefacto: `analysis/T5.1/canon-34plus-migration-handoff.json`.

El `sourceFreeze` original se conserva como **baseline de evidencia semántica**, no como autorización de una ruta runtime directa hacia 34+.

La arquitectura central de `main` usa lineage multigeneracional. Por ello este workstream **no modifica `src/session/content-migration.ts`**, no registra un shortcut `pre-T5.1 → 34+` y tampoco debe crear una rama lateral del grafo antes de que llegue el turno canónico de 34+.

La coordinación de #59 fija el orden de generaciones como:

`PRE → B1a → C(T5.10) → D(T5.11) → E(T5.12) → F(T5.13) → G(T5.14) → T5.15…T5.21 (26–30) → 30–34 → 34+`

Por tanto, las identidades observadas durante composiciones intermedias de esta rama son **solo evidencia provisional de integración**, no edges registrables ahora. Antes deben integrarse T5.11+ y los demás lotes anteriores a 34+ que alteren `EVENTS`.

Cuando llegue el turno de 34+:

1. re-groundear esta rama sobre el último catálogo anterior ya integrado;
2. source = identidad persistida de ese catálogo inmediatamente anterior;
3. target = identidad exacta resultante después de aplicar el delta 34+ sobre ese source;
4. recalcular ambos hashes en ese momento; no reutilizar identidades provisionales por inercia;
5. #59 registra entonces una única edge sucesiva, sin saltar generaciones ni crear caminos competidores;
6. un path ausente o ambiguo falla cerrado.

Reglas de evidencia aportadas por 34+ que sí son estables entre re-grounds:

- history/journal no se reescriben;
- RNG no cambia por migración;
- seeds existentes conservan `originEvent` histórico;
- los tres reemplazos de ID no heredan `SEEN_`/cooldown;
- pending legacy usa la definición/fingerprint exacta que vio el jugador;
- un epílogo ya generado no se regenera;
- la migración no decide, anuncia, reabre ni cierra una carrera.

## Tests propietarios y evidencia provisional

`scripts/test-t51-34plus.mjs` cubre máquina de retirada, autoridad del jugador, no-market, ofertas cero, reconsideración pre-anuncio, bloqueo post-anuncio, autoridad del anuncio, último partido sin hechos fabricados, fallbacks administrativos, save/restore y epílogos factuales.

`scripts/test-t51-34plus-catalog-drift.mjs` comprueba los 3 reemplazos de ID y los 7 cambios same-ID de propiedad 34+, sin asumir que el resto del catálogo T5.1 permanece congelado.

`scripts/test-t51-34plus-epilogue.mjs` fija como regresión permanente la corrección de selección factual de epílogos. La pasada de diagnóstico que originó este guard cubrió 90 carreras; los archivos temporales de diagnóstico no forman parte del diff final.

`npm run test:t51:34plus` compone los **tres** tests después del build. La validación focal histórica anterior a la incorporación del tercer guard fue run `35133825939`, job `104921087526`, **15/15 PASS**.

Validación extendida provisional: run `35134327798`, job `104922776421`:

- prioridad obligatoria: **6/6 PASS**;
- probes de integración: **3 PASS / 1 skip esperado / 0 fail**;
- simulación estratificada: **9/9 carreras cerradas**;
- `blockedCareers=[]`;
- `impossibleStates=[]`;
- edades de retirada observadas entre 34 y 54;
- se ejercitaron cierres `no_last_match` y `planned_last_match`.

Estas pruebas acreditan el candidato funcional, pero **no sustituyen la revalidación exact-head** que deberá ejecutarse cuando 34+ se re-groundee sobre su predecesor canónico definitivo.

El outlier `loyal/512000` quedó localizado en #70 como renovaciones repetidas pre-34. `main@99b1cd56…` ya incorpora la corrección upstream que cierra la snapshot exacta de renovación tras un rechazo directo; este workstream la hereda y no duplica ese parche.

### Estado CI exact-head actual

Sobre el candidato recompuesto en `main@99b1cd56…`, Repository Integrity run `35207158962`, job `105155631747`, confirma antes del guard de lineage:

- build: **0 errores / 0 warnings**;
- final gate: `passed=true`, reproducible=true, microfeedIndependent=true, migrationV7toV8=true;
- saves: **38/38 PASS**;
- T5.3: **53/53 PASS**;
- registry pre-T5.1: PASS;
- registry post-T5.1: PASS;
- offer-bridge evidence: PASS;
- workflows independientes de offer-session bridge y choice eligibility: PASS.

El run falla cerrado exactamente en `freeze-t51-active-source.mjs --check`, porque la identidad activa compuesta `739b4646ef12de456b8990ddc8306bc71f5d21afe01d19252c33ba4cfc3cdb0d` todavía no está congelada. **No debe congelarse ahora**: #59 exige esperar a todas las generaciones predecesoras hasta 30–34, volver a re-groundear 34+ y recalcular la identidad final.

Como `npm test` se detiene en ese guard, los tres tests propietarios situados al final del comando no llegan a ejecutarse en este run exact-head. Deben revalidarse en el head final lineage-ready.

Los gates centrales de migración/freeze siguen perteneciendo a `main`/#59.

## Handoff

- **Integrador T5.1 / issue #59**: conservar la policy semántica/collision de 34+, pero **no registrar todavía una edge hacia este candidato**. Esperar a que se integren T5.11+ y todos los lotes pre-34+, re-groundear 34+ y recalcular source/target final.
- **T5.29–T5.35**: implementar los 13 `needs_reimplementation` y 30 `canonical_missing` con revisión de identidad/migración por batch.
- **T5.36**: consumir esta máquina de retirada auditada.
- **T5.37**: construir narrativa final rica sobre evidencia factual de epílogo.
- **Seeds/NPC**: wiring completo permanece en sus workstreams coordinados.

Este workstream **no mergeará su propio PR**.
