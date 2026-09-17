# T5.3 follow-up — reconciliación histórica de conocimiento NPC

## Problema

T5.3 añadió reglas epistemológicas explícitas y memoria persistente sin cambiar el schema 8 ni `contentIdentity`. Por tanto una partida válida creada antes de esa implementación puede contener un `GameState.history` correcto y, al mismo tiempo, tener `NPCState.knowledge` vacío o semánticamente inválido.

Ese caso no es necesariamente una migración de contenido: el catálogo de eventos puede ser exactamente el mismo. Sin reconciliación, un NPC puede olvidar retroactivamente un hecho que el historial demuestra que presenció o recibió y un gate `know.*` puede divergir entre una partida nueva y una partida antigua equivalente.

## T5-QA-017 — colisión semántica exact-ID

Una coincidencia de `eventId/choiceId/outcomeId` no demuestra que una decisión histórica tenga la semántica del catálogo activo. Session v3 conserva una entrada `decisionProvenance` 1:1 con cada `HistoryEntry`, incluyendo `sourceContentIdentity` y `eventFingerprint`.

La reconciliación usa ahora esa evidencia y falla cerrada:

- si el fingerprint histórico coincide con el fingerprint activo del mismo `eventId`, la fila puede ser candidata a replay epistemológico;
- si los fingerprints difieren, la fila no reconstruye conocimiento salvo certificación epistemológica explícita y exacta;
- una ruta T5.1 `same_scene`, una migración de scheduler o la coincidencia textual de IDs no crean esa certificación automáticamente.

## T5-QA-021 — deriva de reglas live

`NPC_EVENT_KNOWLEDGE_RULES` no forma parte de `EventDefinition`, `eventFingerprint` ni `contentIdentity`. Por tanto proteger únicamente el fingerprint del evento no basta: una regla epistemológica live podría cambiar en una release posterior mientras el evento conserva exactamente el mismo fingerprint.

Si el replay histórico leyera siempre el registry live, una partida antigua sin `knowledge` derivado podría reinterpretarse retroactivamente según esa nueva regla.

Corrección:

- la resolución **live** continúa usando `NPC_EVENT_KNOWLEDGE_RULES`;
- la reconciliación histórica usa exclusivamente `NPC_KNOWLEDGE_BACKFILL_RULES_V1` de `src/catalog/npc-knowledge-backfill-v1.ts`;
- esa baseline contiene las 18 reglas aprobadas cuando se introdujo el backfill histórico;
- la baseline v1 tiene un SHA-256 semántico fijado por QA;
- array, reglas y arrays internos de la baseline quedan congelados también en runtime mediante `Object.freeze`, no solo tipados como `readonly`;
- una evolución normal del registry live no cambia el replay de saves antiguos;
- si en el futuro se quiere ampliar deliberadamente la semántica de backfill, no debe editarse v1 en sitio: se añadirá una nueva versión/provenance explícita.

Esto evita meter reglas NPC en `contentIdentity`, lo que provocaría migraciones globales aunque no cambie ninguna escena.

## Contrato

`reconcileNpcKnowledgeFromHistoryInPlace(state, context)` reconstruye únicamente conocimiento demostrable mediante:

1. una entrada factual de `GameState.history`;
2. la entrada de `decisionProvenance` del mismo índice;
3. fingerprint activo coincidente o certificación legacy explícita;
4. una regla compatible de la baseline histórica versionada, actualmente `NPC_KNOWLEDGE_BACKFILL_RULES_V1`.

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

Una fila ausente o semánticamente inválida sí puede reconstruirse cuando la historia, su provenance y la baseline de backfill establecen una versión semántica autorizada.

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

`scripts/test-t53-reconciliation.mjs` mantiene las nueve regresiones de reconciliación/provenance de T5-QA-017.

`scripts/test-t53-backfill-baseline.mjs` añade los gates T5-QA-021:

1. la baseline v1 contiene exactamente 18 reglas, conserva el SHA-256 fijado y está congelada en runtime en todos sus niveles mutables;
2. una regla sintética añadida temporalmente solo al registry live sí afecta una resolución live nueva;
3. esa misma regla live-only no aparece al reconciliar history antigua, demostrando que el replay consulta la baseline congelada y no el registry actual.

La suite nueva se importa desde `scripts/test-t53-reconciliation.mjs`. Por tanto queda cubierta por `npm test`, `npm run test:t53`, `npm run qa:t5:saves` y `npm run qa:t5` sin modificar `package.json`, y se ejecuta junto a los gates actuales de lineage/migration T5.1, T5.2, contactos T5.3, targets dinámicos y reconciliación histórica.

## Límites

Este follow-up no inventa conocimiento para escenas sin regla, no modifica canon, no cambia schema, no altera `contentIdentity` y no convierte `npcRefs` en testigos.

Que una escena legacy haya sido certificada `same_scene` para scheduling/continuidad no basta para backfill epistemológico. Si se desea conservar conocimiento histórico de una versión con fingerprint diferente, debe auditarse y añadir una `NpcKnowledgeLegacyCertification` exacta para las decisiones compatibles.

Que una nueva regla live —incluido un futuro `targetSlots` dinámico— sea correcta para partidas nuevas tampoco la incorpora automáticamente al replay de partidas históricas. Esa ampliación requiere una decisión explícita de versionado de backfill y, para destinatarios dinámicos, evidencia histórica suficiente para resolver el receptor real.

## Estado

T5-QA-017 y la infraestructura de targets dinámicos (#108) están integrados en `main`. T5-QA-021 se implementa en `t5/npc-knowledge-backfill-v1` y debe integrarse solo tras Repository Integrity verde sobre el HEAD exacto. No auto-mergear.
