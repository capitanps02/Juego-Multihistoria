# T5.1 — Linaje multigeneración de `contentIdentity`

## Motivo

Session v3 ya protege historial, `pendingDecision`, journal, RNG y procedencia cuando un catálogo cambia una vez. T5.5–T5.35 van a cambiar el catálogo repetidamente, por lo que una partida puede haberse creado con una identidad intermedia y no solo con `PRE_T51_CONTENT_IDENTITY`.

Ejemplo:

```text
A = pre-T5.1
B = tras T5.5
C = tras T5.10
```

Una partida A debe poder llegar a C mediante `A -> B -> C`, y una partida creada directamente en B debe poder migrar a C. No se exige un grafo completo `A -> C`, `A -> D`, `B -> D`, etc.

## Contrato

`resume()` sigue siendo estricto: solo acepta `snapshot.contentIdentity === activeContentIdentity`.

La migración explícita usa un **único camino acíclico** entre identidad fuente y activa:

- cero caminos -> fail closed;
- más de un camino posible -> fail closed;
- exactamente un camino -> aplicar sus rutas en orden;
- ciclos nunca se recorren dos veces;
- el orden de declaración no elige entre rutas ambiguas.

Cada `ContentMigrationRoute` conserva su semántica actual. El path no inventa equivalencias: únicamente compone mappings ya aprobados.

## Evidencia de catálogos históricos

Cada `contentIdentity` que pueda existir en un save persistido debe disponer de `ContentEvidenceSource` inmutable con:

- identidad exacta;
- build/sesiones compatibles;
- fingerprint de cada definición;
- digests de journal por choice/outcome.

La evidencia histórica es **solo de validación**. Nunca entra en `EventIndex`, scheduler ni weighted selection.

`SessionOptions.contentSources` permite inyectar el registro en QA y deja preparado el runtime para incorporar fuentes generadas por cada batch. El registro por defecto sigue conteniendo el freeze pre-T5.1 hasta que exista la primera identidad intermedia real.

## Pending legacy

Una decisión presentada bajo A conserva:

- definición almacenada de A;
- `sourceContentIdentity=A`;
- fingerprint A;
- choices/labels/outcomes mostrados.

Si se resuelve cuando el catálogo activo es C, tras resolver su definición A se aplican las semánticas de scheduler de todo el path `A -> B -> C`. No se sustituye la escena pendiente por B o C.

## Integración de batches

Los owners de contenido pueden **desarrollar** T5.5 y T5.10 en paralelo, pero su integración es serial:

1. re-ground sobre el `main` vigente;
2. antes de cambiar de nuevo `EVENTS`, registrar evidencia inmutable de la identidad que está vigente y puede existir en saves;
3. implementar el nuevo batch;
4. añadir una ruta desde la identidad inmediatamente anterior a la nueva identidad;
5. no añadir además atajos desde identidades antiguas si ya existe un path, porque crearían ambigüedad;
6. pasar `test:t51:migration`, save QA y Repository Integrity sobre el SHA exacto.

Para el primer batch T5.5: `PRE_T51 -> B`.

Después de integrar T5.5, T5.10 debe re-groundearse y registrar `B` como fuente histórica antes de crear `C`; su nueva ruta será `B -> C`, no un atajo adicional `PRE_T51 -> C`.

## Invariantes

- la migración no consume RNG;
- no agenda eventos;
- no resuelve choices;
- no reescribe history/journal;
- no cambia `SeedInstance.originEvent` salvo mapping explícito;
- no fabrica `SEEN` entre escenas distintas;
- `distinct_scene` exact-ID debe liberar `SEEN`/cooldown cuando esté aprobado;
- una fuente desconocida o sin evidencia se rechaza;
- un path ambiguo se rechaza.

## QA

`scripts/test-t51-content-lineage.mjs` cubre:

- path A -> B -> C;
- ciclos;
- ausencia de path;
- ambigüedad;
- salto A -> C por composición;
- save creado en B -> C;
- falta de evidencia de B;
- pending A que llega a C;
- historial mixto A+B validado en C;
- preservación de RNG/history/journal.

Los gates `freeze-t51-baseline` y `check-t51-content-migration-route` pasan de exigir una arista directa a exigir un path único y verificable.

## Límite de este workstream

No modifica escenas canónicas, seeds narrativas, NPCs, UI, Android ni el Documento Maestro. Solo extiende la infraestructura de compatibilidad necesaria para que los batches T5 puedan integrarse de forma acumulativa sin convertir cada release intermedia en un save huérfano.
