# T5.1 — migración explícita de sesión y contentIdentity

Rama propietaria: `integration/content-migration-t51`
Issue: #24
Estado: diseño/implementación en curso; bloqueador transversal de contenido T5.1.

## Motivo

El catálogo pre-T5.1 está congelado con:

`contentIdentity = 2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff`

`GameSession.resume()` exige igualdad exacta entre la identidad persistida y el hash del catálogo activo. Esta protección es correcta y no debe relajarse. Cualquier reparación semántica real de una escena cambia el catálogo y requiere una migración explícita.

Este workstream desbloquea #13, #15 y los futuros lotes T5.5–T5.35. Las auditorías puras pueden integrarse sin esperar esta migración.

## Principios no negociables

1. Identidades de contenido desconocidas se rechazan.
2. No existe aceptación genérica de saves viejos.
3. `state.history` conserva lo que realmente ocurrió.
4. `journal` conserva el texto que realmente vio el jugador.
5. IDs legacy no se reescriben como canónicos salvo equivalencia same-scene explícitamente aprobada.
6. Una escena técnica retirada puede seguir existiendo como evidencia histórica sin volver al scheduler activo.
7. Una decisión pendiente legacy conserva exactamente la definición mostrada, salvo mapping same-scene probado.
8. Migrar consume cero RNG, agenda cero escenas y resuelve cero elecciones.
9. `receipts`, `revision`, `needsWorldAdvance`, ofertas, retirada y epílogo factual se preservan.
10. Seeds vivas se preservan; `originEvent`/`consumedBy` solo cambian con evidencia de identidad.
11. La migración es determinista e idempotente.
12. La nueva `contentIdentity` solo se escribe en memoria después de validar toda la transformación.

## Diseño recomendado

Mantener separado:

- GameState schema migration;
- SessionSnapshot/content catalog migration.

La solución preferida es una sesión versionada compatible con historial mixto, conceptualmente `sessionVersion = 3`, con procedencia por decisión suficiente para distinguir una escena legacy de una escena canónica que reutiliza el mismo string ID.

Procedencia mínima lógica:

- `sourceContentIdentity`;
- `eventFingerprint` = SHA-256 de la definición exacta serializada.

Puede almacenarse por journal/history o en una estructura 1:1 equivalente. El requisito es poder validar cada decisión contra la definición exacta que la produjo.

## Registry de compatibilidad

Debe existir un registry explícito por `sourceContentIdentity`.

Las definiciones legacy:

- sirven para validar history/journal/pending;
- pueden resolver una escena legacy que ya estaba presentada;
- NUNCA se concatenan con `EVENTS` activos;
- NUNCA entran en `EventIndex` del scheduler.

## Flujo de migración

1. Validar estructura del snapshot.
2. Leer `sessionVersion` y `contentIdentity` fuente.
3. Fast path si ya usa identidad actual.
4. Si es legacy, exigir ruta registrada.
5. Validar el snapshot contra evidencia/catalogo de origen.
6. Añadir procedencia a decisiones históricas.
7. Validar y anotar pending legacy exacto.
8. Aplicar solo equivalencias same-scene aprobadas a metadata de scheduler, si están enumeradas.
9. Preservar legacy history/journal/seeds en todos los demás casos.
10. Actualizar versión/identidad solo al final.
11. Ejecutar validación compatibility-aware.
12. Crear `GameSession` con catálogo activo actual únicamente.
13. Restore/migration sigue siendo read-only hasta el siguiente commit normal salvo una política futura distinta.

## Casos que deben cubrirse

- current identity: resume no-op;
- identity desconocida: rechazo;
- pending legacy técnico: definición exacta preservada;
- pending con mismo ID pero semántica nueva: no sustitución;
- history legacy de evento retirado: sigue válida;
- history exact-ID collision: valida contra procedencia legacy;
- historia mixta legacy + canónica;
- seed origin legacy conservado;
- same-scene aprobado puede trasladar seen/cooldown/origin solo si el mapping lo enumera;
- no-equivalent legacy history NO suprime la escena canónica futura;
- pendingResult preservado;
- receipts/revision preservados;
- ofertas/market preservados;
- conocimiento/relaciones NPC preservados;
- todos los RNG deep-equal antes/después;
- doble migración = no-op;
- tampering de definición/procedencia = rechazo;
- save -> migrate -> serialize/load -> resume.

## Integración con T5.1

Los workstreams canónicos son responsables de proporcionar mappings explícitos:

- `verified_same_identity`;
- `approved_alias`;
- `retire_technical_keep_history_only`;
- exact-ID semantic collision;
- canonical replacement sin equivalencia con legacy.

Este workstream no decide canon por similitud de título/edad/tema.

## Dependencias actuales

- PR #17: QA transversal/save/contentIdentity probes.
- PR #19: T5.2 hardening + seed handoff.
- PR #9: T5.3 knowledge/memory, debe preservar la migración cuando llegue a main.
- #10/#12: auditorías aportan mappings y blockers.
- #13/#15: contenido activo bloqueado hasta cerrar este contrato.

## Criterio de merge

Antes de integrar la migración:

- `npm test` verde;
- `qa:t5:fast` verde;
- `qa:t5:content` verde;
- `qa:t5:integration` verde;
- `qa:t5:saves` verde;
- `qa:t5:simulation` verde;
- tests dirigidos de migración verdes;
- freeze legacy reproducible;
- catálogo legacy ausente del scheduler activo;
- cero RNG consumido por migration;
- unknown identity continúa rechazándose.

## Fuente de diseño previa

Existe trabajo de planificación útil en la rama histórica `chore/chatgpt-codex-workflow`, especialmente:

- `project/t5_1/T5_1_SESSION_CONTENT_MIGRATION_CONTRACT.json`;
- `project/t5_1/T5_1_SAVE_SESSION_MIGRATION_RUNTIME_AUDIT.md`;
- `project/t5_1/T5_1_SESSION_V3_DESIGN_SPEC.md`;
- `project/t5_1/T5_1_MIGRATION_TEST_MATRIX.json`.

Debe reutilizarse críticamente; no se debe mergear PR #1 completo para obtener esos documentos.
