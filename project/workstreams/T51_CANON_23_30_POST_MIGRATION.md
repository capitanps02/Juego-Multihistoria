# T5.1 — 23–30: readiness de ejecución tras T5.2/T5.3/S1/S2

Fecha: 2026-09-16  
Rama: `t51/canon-23-30-post-migration-readiness`  
Base funcional observada: `main@76699f93e19e1ac9e17b42ccfaea011d92630fb6`

## Propósito

Este workstream convierte la reconciliación ya integrada de 23–30 en una cola de ejecución segura para T5.10–T5.21. Sigue siendo audit/test/docs only. La infraestructura compartida de seed lifecycle, conocimiento NPC, migración de contenido y elegibilidad por opción ya está integrada; los blockers restantes son los contratos específicos de oferta/contrato, OR/fact derivado y resultado futbolístico.

## Estado transversal observado

### T5.2 — integrado

`main` contiene el hardening T5.2. Para nuestro owner:

- 59 seeds;
- 59 con productor runtime;
- 30 sin consumidor detectable;
- 35 open-ended;
- no se autorizan cierres artificiales para reducir deuda.

Una `SeedInstance` histórica conserva su `originEvent` salvo mapping explícito con `rewriteExisting:true`. Para nuestros 11 cambios de cronología de edad 26 esa reescritura histórica **no está autorizada**: el cambio aplica a futuras creaciones canónicas.

### T5.3 — integrado

T5.3 ya está en `main` sobre T5.2:

- `npcRefs` no implica conocimiento;
- una seed o `HAS_SEED_*` tampoco implica conocimiento;
- un callback que dependa de conocimiento personal debe usar adquisición/requisito causal explícito;
- no se añaden refs o conocimiento a shells legacy solo para hacer desaparecer deuda del auditor.

Los 10 callbacks de nuestro rango detectados por el handoff T5.3 siguen siendo deuda de contenido y deben resolverse al implementar su identidad canónica.

### S1 / choice eligibility — integrado

`main@76699f93...` integra elegibilidad opt-in por opción sin cambiar el comportamiento histórico de choices que no la usan. El scheduler elimina decisiones imposibles antes de presentar la escena y no agenda un evento si ninguna opción es válida.

Las 10 reparaciones locales 23–26 no dependen de S1 para existir, pero el contrato queda disponible cuando una elección canónica de nuestros futuros lotes necesite visibilidad condicionada por estado. No debe usarse para simular un OR de trigger del evento si lo que el canon exige es que la escena misma solo exista bajo una de varias causas.

### Session/contentIdentity — mecanismo integrado

`main@a4a4c8df...` integra Session v3/provenance, registry legacy congelado, rutas explícitas y validación de migración.

La implementación integrada mantiene `CONTENT_MIGRATION_ROUTES = []` mientras el catálogo activo siga siendo idéntico al freeze. `scripts/check-t51-content-migration-route.mjs` establece el contrato para el primer cambio real:

1. si cambia `contentIdentity`, debe existir una ruta `PRE_T51_CONTENT_IDENTITY -> targetContentIdentity`;
2. un mapping `distinct_scene` con el mismo string ID debe declarar `clearCanonicalSeen: true`;
3. ese mismo caso debe declarar `clearCanonicalCooldown: true`;
4. los orígenes de seed deben declarar explícitamente `rewriteExisting`;
5. las definiciones legacy sirven para evidence/history/pending, nunca para el scheduler activo.

Por tanto el gate global deja de ser “esperar S2” y pasa a ser **“incluir la ruta correcta en el mismo candidato de contenido”**.

El handoff #27 sigue siendo la autoridad de nuestro rango:

- 40 principales con exact-ID semantic collision;
- 26 principales canónicas sin herencia legacy;
- 26 IDs legacy history-only;
- 25 callbacks exact-ID con colisión semántica;
- 0 mappings same-scene condicionales seguros;
- 11 cambios de origen futuro de seeds de edad 26;
- 0 aliases aprobados.

## Orden T5.10–T5.14 — 23–26

Las 15 escenas pendientes quedan particionadas una sola vez en cinco lotes pequeños.

### T5.10 — identidad profesional, agente y cuerpo

- `EVT_23_BRIDGE_001`
- `EVT_23_AGT_001`
- `EVT_23_BODY_001`

Las tres son colisiones semánticas exact-ID. El candidato funcional debe añadir tres mappings `distinct_scene` con `legacyEventId === canonicalEventId` y limpiar `SEEN` + cooldown canónicos.

### T5.11 — dinero, casa, Europa y presión

- `EVT_23_MONEY_001`
- `EVT_23_HOME_001`
- `EVT_23_EUR_001`
- `EVT_23_PRS_001`

Misma política: cuatro mappings exact-ID `distinct_scene`, sin reinterpretar history legacy.

### T5.12 — agente, mercado e internacional a 25

- `EVT_25_AGT_001`
- `EVT_25_MKT_001`
- `EVT_25_NAT_001`

Tres mappings exact-ID `distinct_scene`.

### T5.13 — autoridad de oferta/contrato

- `EVT_23_MKT_001`
- `EVT_23_CON_001`
- `EVT_25_CON_001`

No pueden cerrarse correctamente hasta disponer del puente con `CareerOffer`/sesión. Firmar, renovar o transferir no se simula mediante efectos narrativos directos.

### T5.14 — OR/fact y resultado futbolístico

- `EVT_23_LOCK_001`
- `EVT_24_MATCH_001`

`EVT_23_LOCK_001` necesita OR/fact derivado real. `EVT_24_MATCH_001` necesita resolver el penalti mediante la capa deportiva, no como premio fijo de Choice.

Para todos los lotes: ficha canónica → disposición de identidad → implementación + ruta → test dirigido → continuidad/seeds/NPC → regresión completa.

## Orden T5.15–T5.21 — 26–30

Este bloque no se ejecutará como renames masivos.

### 25 exact-ID reimplementations

History/pending permanece ligada a su fingerprint/procedencia legacy. Cada escena canónica distinta que conserve el mismo string ID necesita mapping `distinct_scene` y aislamiento de `SEEN`/cooldown.

Caso de control obligatorio: `EVT_27_MED_001`. “La cirugía puede esperar” no es la definición legacy “La final y el isquio”.

### 26 escenas canónicas fresh

Son 22 `canonical_missing` más cuatro candidatos no aprobados. Nacen sin history/SEEN/cooldown sintético derivado de legacy.

Los cuatro pares continúan siendo **non-mappings**:

- `EVT_26_BRIDGE_001` ≠ `EVT_26_IDN_001`
- `EVT_27_STAR_001` ≠ `EVT_28_TEAM_001`
- `EVT_27_AWARD_001` ≠ `EVT_28_GALA_001`
- `EVT_28_RICH_001` ≠ `EVT_29_MKT_001`

### 26 IDs legacy history-only

Los 22 engine-only y los cuatro IDs candidatos legacy pueden conservar evidencia histórica/compatibilidad si se retiran del scheduler. Nunca se reescribe history al ID canónico para “limpiar” el save.

## Condicionales 23–30

44/44 están revisados en planning; 0/44 certificados full runtime. La implementación debe ser callback por callback.

Pruebas de control:

- `CEVT_24_TOURN_02`: no conservar `NATIONAL_CALLED=true` cuando el canon trata precisamente de quedar fuera de la lista final.
- `CEVT_29_BODY_04`: no tratar `bodyLoad` alto como equivalente a recuperación positiva tras cirugía/cuerpo crónico.

Con T5.3 integrado, descubrir/saber/recordar exige causalidad epistemológica real.

## Ratchet de `seedsRead`

PR #32 sigue siendo dependencia externa en este snapshot y propone 35 pares heredados como máximo tolerado. En nuestro rango hay 14, todos en 23–25.

Si entra el ratchet:

- eliminar deuda al reescribir un callback está permitido;
- mantener temporalmente una deuda heredada puede seguir tolerado;
- introducir una lectura nueva sin `seedsRead` debe fallar QA.

Nuestro objetivo al tocar esos callbacks es reducir/corregir trazabilidad, no mantener artificialmente el 14.

## Gates del primer cambio activo

1. partir del `main` que ya contiene T5.2 + T5.3 + S1 + S2;
2. cambiar solo las identidades del lote;
3. registrar en el mismo candidato la ruta pre-T5.1 → nueva `contentIdentity`;
4. para cada exact-ID `distinct_scene`, limpiar `SEEN` y cooldown canónicos;
5. conservar history/journal/pending/fingerprint legacy y `SeedInstance.originEvent` histórico;
6. mantener simultáneamente verdes T5.2 y T5.3;
7. `Repository Integrity` verde sobre el HEAD exacto;
8. no modificar `project/PLAN_PASADAS.md` ni `analysis/2026-09-11/plan-seguimiento.json` desde este workstream.

Este PR sigue siendo deliberadamente **audit/test/docs only**. El siguiente candidato funcional seguro es T5.10.
