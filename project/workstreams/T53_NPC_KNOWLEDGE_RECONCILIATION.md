# T5.3 follow-up — reconciliación histórica de conocimiento NPC

## Problema

T5.3 añadió reglas epistemológicas explícitas y memoria persistente sin cambiar el schema 8 ni `contentIdentity`. Por tanto una partida válida creada antes de esa implementación puede contener un `GameState.history` correcto y, al mismo tiempo, tener `NPCState.knowledge` vacío o semánticamente inválido.

Ese caso no es necesariamente una migración de contenido: el catálogo de eventos puede ser exactamente el mismo. Sin reconciliación, un NPC puede olvidar retroactivamente un hecho que el historial demuestra que presenció o recibió y un gate `know.*` puede divergir entre una partida nueva y una partida antigua equivalente.

## T5-QA-017 — colisión semántica exact-ID

Una coincidencia de `eventId/choiceId/outcomeId` no demuestra que una decisión histórica tenga la semántica del catálogo activo. Session v3 conserva una entrada `decisionProvenance` 1:1 con cada `HistoryEntry`, incluyendo `sourceContentIdentity` y `eventFingerprint`.

La reconciliación usa ahora esa evidencia y falla cerrada:

- si el fingerprint histórico coincide con el fingerprint activo del mismo `eventId`, la fila puede aplicar las reglas T5.3 actuales;
- si los fingerprints difieren, la fila no reconstruye conocimiento salvo que exista una certificación epistemológica explícita y exacta;
- una ruta T5.1 `same_scene`, una migración de scheduler o la coincidencia textual de IDs no crean esa certificación automáticamente.

## Contrato

`reconcileNpcKnowledgeFromHistoryInPlace(state, context)` reconstruye únicamente conocimiento demostrable mediante:

1. una entrada factual de `GameState.history`;
2. la entrada de `decisionProvenance` del mismo índice;
3. fingerprint activo coincidente o certificación legacy explícita;
4. una regla de `NPC_EVENT_KNOWLEDGE_RULES` compatible con `eventId/choiceId/outcomeId`.

`NpcKnowledgeLegacyCertification` identifica exactamente:

- `sourceContentIdentity`;
- `eventFingerprint`;
- `eventId`;
- `choiceId`;
- `outcomeId`.

No existen certificaciones implícitas ni por wildcard.

No se infiere conocimiento desde `npcRefs`, seeds, flags, ejes de relación, `NPCState.access`, presencia textual del nombre de un NPC ni estado global sin regla epistemológica.

## Prioridad de información persistida

Una fila ya persistida que satisface `getNpcKnowledgeRecord(...)` es autoritativa y no se reescribe durante el replay histórico. Esto preserva versiones subjetivas adquiridas después, transmisiones NPC→NPC, certeza distinta, memoria reforzada y procedencia/club del aprendizaje posterior.

Una fila ausente o semánticamente inválida sí puede reconstruirse cuando la historia y su provenance establecen una versión semántica autorizada.

## Tiempo y contexto

El backfill usa `HistoryEntry.date` como `learnedAt` y `HistoryEntry.club` como contexto del aprendizaje. No usa la fecha ni el club actuales de la partida.

`rememberNpcFactInPlace(...)` admite `learnedAt` explícito para esta reconstrucción histórica y rechaza fechas futuras respecto a `state.date`.

Las memorias temporales o prácticas reconstruidas calculan su expiración desde la fecha histórica original. Si ya estarían caducadas en la fecha actual, la reconciliación elimina únicamente esas filas recién reconstruidas. No realiza una poda global de recuerdos expirados preexistentes.

## Integración de Session v3

`GameSession.resume()` ejecuta la reconciliación después de validar el snapshot y actualizarlo a Session v3 cuando sea necesario.

`GameSession.migrateAndResume()` conserva la provenance histórica, aplica la ruta multigeneración T5.1 y después ejecuta la reconciliación contra la evidencia del catálogo activo.

`SessionOptions.knowledgeLegacyCertifications` permite inyectar únicamente certificaciones explícitas revisadas. Por defecto la lista está vacía.

La reconciliación:

- no consume RNG;
- no agenda eventos;
- no resuelve elecciones;
- no reescribe `history` ni `decisionProvenance`;
- no incrementa `revision`;
- no invoca el callback de persistencia por sí misma.

Por tanto un `resume()` puede devolver en memoria un snapshot epistemológicamente reparado sin escribirlo inmediatamente al almacenamiento. El siguiente comando confirmado persistirá el snapshot completo mediante el flujo normal de Session.

## QA dirigido

`scripts/test-t53-reconciliation.mjs` cubre nueve regresiones:

1. reconstrucción de conocimiento faltante con fecha/club históricos;
2. idempotencia;
3. preservación exacta de una versión subjetiva válida;
4. sustitución de una fila semánticamente inválida cuando existe evidencia explícita;
5. no resurrección de memorias temporales históricamente caducadas;
6. `GameSession.resume()` real con receipts, journal y provenance válidos, cero commit durante resume y RNG/history intactos;
7. T5-QA-017: colisión exact-ID con fingerprint legacy distinto y sin certificación => cero backfill;
8. T5-QA-017: certificación legacy exacta => backfill permitido;
9. T5-QA-017: historial mixto legacy/current evaluado fila por fila, con RNG/history intactos.

La suite forma parte de `npm test`, `npm run test:t53`, `npm run qa:t5:saves` y `npm run qa:t5` y se ejecuta junto a los gates actuales de lineage/migration T5.1, T5.2 y contactos T5.3.

## Límites

Este follow-up no inventa conocimiento para escenas sin regla, no modifica canon, no cambia schema, no altera `contentIdentity` y no convierte `npcRefs` en testigos.

Que una escena legacy haya sido certificada `same_scene` para scheduling/continuidad no basta para backfill epistemológico. Si se desea conservar conocimiento histórico de una versión con fingerprint diferente, debe auditarse y añadir una `NpcKnowledgeLegacyCertification` exacta para las decisiones compatibles.

## Estado

T5-QA-017 implementado en `t5/npc-knowledge-reconciliation`. Integrar solo tras Repository Integrity verde sobre el HEAD exacto y revisión del integrador. No auto-mergear.
