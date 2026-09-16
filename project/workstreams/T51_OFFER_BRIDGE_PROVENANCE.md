# T5-QA-018 — Provenance-bound offer bridge validation

## Problema

El bridge narrativo integrado en #68 persistía suficiente causalidad para saber qué escena y qué choice consumieron una oferta, pero la validación de saves solo comprobaba:

- `historyIndex/eventId/choiceId`;
- `source.disposition` dentro del enum;
- `normalizeDisposition(source.disposition) === market.history.action`;
- journal/historial coherentes.

Eso permitía una falsificación semántica como `COUNTER -> defer`: ambas disposiciones normalizan a `reject`, por lo que un save manipulado podía seguir siendo internamente consistente aunque contradijera el `offerBridge.choiceActions` que el jugador resolvió.

## Contrato

Una decisión de oferta narrativa solo es válida si la disposición persistida coincide exactamente con la semántica contractual de la definición que originó esa decisión.

La clave de validación es:

`sourceContentIdentity + eventFingerprint + eventId + choiceId`

Nunca se valida una decisión histórica consultando ciegamente el evento activo con el mismo string ID.

## Evidencia histórica

`scripts/generate-t51-offer-bridge-evidence.mjs` genera `src/session/frozen-offer-bridge-evidence.ts` a partir de:

- `qa/fixtures/t5.1/pre-t51-event-catalog.json`;
- todas las generaciones de `qa/fixtures/t5.1/post-t51-sources/*.json`.

Por cada catálogo conserva únicamente, y solo para escenas con bridge:

- `eventFingerprint` exacto;
- `choiceActions` exacto.

La evidencia es validation-only. No entra en `EventIndex`, no agenda escenas y no reconstruye catálogos legacy en runtime.

Las generaciones actualmente congeladas no contienen bridges narrativos, por lo que sus mapas son explícitamente vacíos. Esto es importante: una partida histórica de esas generaciones no puede fabricar retrospectivamente una procedencia `narrative_choice`.

Cada futura fixture congelada queda cubierta automáticamente por el generador y su `--check`.

## Evidencia activa

Para el catálogo activo, `buildActiveOfferBridgeEvidence()` deriva la misma estructura desde las definiciones exactas ya validadas y usa el fingerprint de `buildActiveEventEvidence()`.

## Validación

`assertSessionSnapshot()` conserva todas las comprobaciones anteriores y añade una independiente:

1. resuelve la evidencia del evento mediante la provenance de la fila;
2. resuelve la evidencia contractual del mismo `sourceContentIdentity`;
3. exige el mismo `eventFingerprint`;
4. obtiene `choiceActions[choiceId]`;
5. exige igualdad exacta con `market.history[].source.disposition`.

La normalización disposición→acción sigue siendo un segundo invariante, no un sustituto.

Si falta evidencia contractual para una `narrative_choice`, se falla cerrado.

## Migraciones exact-ID

Si una escena mantiene `eventId` pero cambia el mapping del bridge entre generaciones, una decisión ya resuelta sigue usando la definición/fingerprint del catálogo fuente. La definición activa no puede reinterpretar esa decisión.

## Invariantes

- 0 RNG;
- 0 scheduling;
- 0 mutación durante validación;
- 0 cambio de save schema;
- 0 cambio de `contentIdentity(EVENTS)`;
- ofertas ordinarias sin `source` siguen usando el contrato anterior;
- las fixtures legacy permanecen fuera del scheduler.

## QA

`scripts/test-t51-offer-bridge-provenance.mjs` cubre:

1. `ACCEPT -> accept` válido;
2. tamper `ACCEPT -> delegate` rechazado;
3. tamper `COUNTER -> defer` rechazado aunque ambos normalicen a `reject`;
4. migración exact-ID usa mapping histórico y no el activo;
5. fuente histórica sin bridge evidence falla cerrado;
6. fingerprint contractual histórico incorrecto falla cerrado;
7. ofertas ordinarias permanecen intactas.

El generador `--check` y estas regresiones están integrados en `npm test`, `qa:t5:saves`, `qa:t5`, `test:t51:migration`, `test:offers` y `test:t51:offer-bridge`.
