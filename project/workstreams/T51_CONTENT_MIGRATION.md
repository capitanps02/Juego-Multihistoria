# T5.1 — migración explícita de sesión y contentIdentity

Rama propietaria: `integration/content-migration-t51`  
Issue: #24  
PR: #25  
Estado: **implementación técnica lista para gate final / integración**.

## Motivo

El catálogo pre-T5.1 está congelado con:

`contentIdentity = 2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff`

`GameSession.resume()` mantiene igualdad exacta entre la identidad persistida y el hash del catálogo activo. Esta protección no se relaja. Cualquier reparación semántica real de una escena cambia el catálogo y debe disponer de una ruta explícita de migración.

Este workstream aporta el contrato runtime que permite integrar posteriormente #13, #15 y los lotes T5.5–T5.35 sin reinterpretar partidas antiguas. **No cambia todavía `EVENTS` activos** y no cierra por sí solo T5.1.

## Implementación integrada en este PR

### Session v3

`SESSION_VERSION = 3` añade procedencia inmutable 1:1 para cada decisión resuelta:

- `sourceContentIdentity`;
- `eventFingerprint = SHA-256(JSON.stringify(eventDefinition))`.

Una `pendingDecision` v3 conserva:

- `instanceId`;
- definición completa que ya vio el jugador;
- la misma procedencia/fingerprint.

Esto permite distinguir dos escenas que reutilizan el mismo string ID pero tienen semántica diferente.

### Resume estricto + migración explícita

- `GameSession.resume()` sigue siendo estricto: identidad distinta ⇒ `CONTENT_CHANGED`.
- `GameSession.migrateAndResume()` / `migrateFromSave()` son la única ruta para cambiar de catálogo.
- identidad fuente desconocida ⇒ `CONTENT_MIGRATION_UNSUPPORTED`.
- migration/resume son read-only: no llaman al commit callback.
- migrar consume cero RNG, no agenda escenas y no resuelve elecciones.

### Registry legacy de validación

El fixture congelado de 388 eventos genera de forma determinista:

`src/session/pre-t51-legacy-registry.ts`

con:

- fingerprint SHA-256 de cada definición exacta;
- hashes de semántica visible de journal por `(choiceId, outcomeId)`.

La versión compacta ocupa **263.033 bytes** frente a 427.721 bytes de la primera registry textual (~38,5 % menos) y sigue validando exactamente los 388 eventos.

La registry:

- valida history/journal/pending legacy;
- NO contiene las definiciones completas legacy;
- NO se concatena con `EVENTS`;
- NO entra en `EventIndex`;
- NO participa en scheduling.

Una pending legacy sigue siendo resoluble porque la definición completa ya está dentro del snapshot; se acepta solamente si su fingerprint coincide con la evidencia congelada.

### Validator compatibility-aware

`assertSessionSnapshot()` ahora:

- conserva invariantes históricos de receipts, revision, offers, journal, pending/result y chronology;
- valida v1/v2 contra la identidad fuente exacta;
- exige `decisionProvenance.length === state.history.length` en v3;
- valida cada historial mixto contra su propia fuente + fingerprint;
- valida el journal mediante hash semántico exacto del texto guardado;
- rechaza pending manipulada comparando la definición embebida con el fingerprint de origen.

### Rutas source → target

`CONTENT_MIGRATION_ROUTES` permanece vacío mientras `EVENTS` actuales sigan reproduciendo el freeze pre-T5.1.

Una futura ruta puede declarar únicamente operaciones revisadas:

- `same_scene` para equivalencias realmente demostradas;
- `distinct_scene` para colisiones/escenas no equivalentes;
- migración de cooldown solo cuando procede;
- migración de origen de seed solo con `rewriteExisting: true` explícito.

En una exact-ID semantic collision, el mapping `distinct_scene` debe liberar tanto:

- `SEEN_<id>` canónico;
- `eventCooldowns[id]` canónico;

para que la decisión histórica legacy no suprima la escena canónica reparada.

### Sentinel para futuros cambios de contenido

`scripts/check-t51-content-migration-route.mjs` se ejecuta en `npm test`, `qa:t5:content`, `qa:t5` y `test:t51:migration`.

Regla:

- mientras `contentIdentity(EVENTS)` == freeze pre-T5.1, no exige ruta;
- en el primer cambio activo de catálogo exige una ruta exacta:
  `pre-T5.1 identity -> nueva active contentIdentity`;
- comprueba IDs legacy/canónicos, duplicados y exact-ID distinct-scene;
- obliga a declarar `rewriteExisting` explícitamente para cualquier seed-origin mapping.

Por tanto un PR futuro que cambie `EVENTS` no puede pasar los gates normales sin registrar compatibilidad.

## Regresiones dirigidas

`scripts/test-t51-content-migration.mjs` cubre 9 casos sobre un catálogo objetivo realmente diferente:

1. v2 actual → v3 con provenance sin alterar GameState/RNG;
2. identity desconocida rechazada y sin commit;
3. exact-ID semantic collision con historial completado;
4. pending exact-ID conserva definición/labels legacy y no suprime la escena canónica reparada;
5. evento técnico retirado permanece como historia válida pero desaparece del scheduler activo;
6. definición pending legacy manipulada se rechaza;
7. historia mixta legacy + current sobre migrate/commit/resume;
8. seeds, NPC, relationships, market, receipts, RNG y pendingResult preservados + segunda migración no-op;
9. receipt legacy mantiene replay idempotente sin duplicar efectos.

La suite está integrada en:

- `npm test`;
- `qa:t5:saves`;
- `qa:t5`;
- `test:t51:migration`;
- workflow `T51 content migration`.

## Handoff 23–30 ya integrado en main

`analysis/T5.1/canon-23-30-migration-handoff.json` es entrada autoritativa para los futuros owners 23–30.

Consta expresamente:

- **0 same-scene mappings aprobados**;
- **0 aliases aprobados**;
- 40 principales con exact-ID semantic collision;
- 25 condicionales con exact-ID semantic collision;
- 26 principales canónicos sin herencia legacy;
- 26 principales legacy para history-only;
- 11 movimientos de origen de seed en edad 26, todos con `historicalOriginRewriteAuthorized = false`;
- cuatro non-mappings explícitos que nunca deben convertirse por similitud temática.

Los owners deben transformar ese handoff en una ruta concreta solamente cuando sus nuevas definiciones activas estén ya presentes y su nueva `contentIdentity` pueda calcularse.

## Reglas para el primer PR que cambie EVENTS

1. Implementar primero las definiciones canónicas activas del lote.
2. Calcular la nueva `contentIdentity` a través del runtime, no copiarla a mano.
3. Añadir a `CONTENT_MIGRATION_ROUTES` exactamente la ruta:
   `2e07efd2... -> <nueva identidad>`.
4. Para exact-ID collisions usar `distinct_scene` y limpiar SEEN/cooldown canónicos.
5. No crear same-scene mapping si el workstream canónico no lo aprobó explícitamente.
6. IDs canonical-missing empiezan sin history/SEEN/cooldown heredados.
7. IDs technical/engine-only pueden permanecer en provenance/history pero no en el scheduler futuro.
8. Los 11 age-26 seed origin moves aplican solo a nuevas creaciones canónicas; **no reescribir `originEvent` histórico**.
9. Ejecutar `npm test`, `qa:t5:content`, `qa:t5:saves`, `qa:t5:integration` y `qa:t5:simulation`.
10. No cambiar el porcentaje de roadmap por registrar una ruta.

## Principios no negociables

1. Identidades desconocidas se rechazan.
2. No existe aceptación genérica de saves viejos.
3. `state.history` conserva lo que realmente ocurrió.
4. `journal` conserva el texto que realmente vio el jugador.
5. IDs legacy no se reescriben como canónicos sin equivalencia same-scene aprobada.
6. Una escena técnica retirada puede seguir como evidencia histórica sin volver al scheduler.
7. Una pending legacy conserva exactamente la definición mostrada.
8. Migrar consume cero RNG, agenda cero escenas y resuelve cero elecciones.
9. `receipts`, `revision`, `needsWorldAdvance`, market, retirada y epílogo factual se preservan.
10. Seeds vivas se preservan; `originEvent`/`consumedBy` solo cambian con autorización explícita.
11. La migración es determinista e idempotente.
12. La nueva `contentIdentity` solo se publica después de validar toda la transformación.

## Gate de integración de #25

Antes del merge del framework:

- `npm test` verde;
- `qa:t5:fast` verde;
- `qa:t5:content` verde;
- `qa:t5:integration` verde;
- `qa:t5:saves` verde;
- `qa:t5:simulation` verde;
- `test:t51:migration` verde;
- freeze y registry reproducibles;
- catálogo legacy ausente del scheduler activo;
- cero RNG consumido por migration;
- unknown identity continúa rechazándose.

Después de integrar #25:

- issue #24 puede cerrarse como **framework de migración completado**;
- T5.1 permanece `in_progress` hasta reconciliar/implementar el contenido canónico;
- #13/#15 solo quedan desbloqueados **condicionalmente**: deberán registrar y probar su ruta concreta antes del merge.

## Dependencias / coordinación

- PR #17: QA transversal/save/contentIdentity integrado.
- PR #27: migration handoff 23–30 integrado.
- T5.2: hardening corregido integrado mediante #36 en `main@73f59ffc5d404b976a210825f9e9aaf141b5b037`; Session v3 debe componerse con ese lifecycle sin reescribir seeds históricas.
- PR #9: T5.3 knowledge/memory debe re-groundearse sobre T5.2 + Session v3 y preservar ambos contratos.
- #13/#15: cambios activos de catálogo bloqueados hasta que este framework esté integrado y cada uno aporte su ruta concreta.

## Artefactos

- `qa/fixtures/t5.1/pre-t51-event-catalog.json`;
- `qa/fixtures/t5.1/pre-t51-content-manifest.json`;
- `src/session/pre-t51-legacy-registry.ts`;
- `src/session/content-identity.ts`;
- `src/session/content-migration.ts`;
- `src/session/game-session.ts`;
- `src/session/validate-session.ts`;
- `scripts/generate-t51-legacy-registry.mjs`;
- `scripts/check-t51-content-migration-route.mjs`;
- `scripts/test-t51-content-migration.mjs`;
- `project/t5_1/T5_1_SESSION_CONTENT_MIGRATION_CONTRACT.json`;
- `project/t5_1/T5_1_MIGRATION_TEST_MATRIX.json`.
