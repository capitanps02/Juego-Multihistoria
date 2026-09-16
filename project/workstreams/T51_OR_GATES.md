# T5.1 · Contrato compartido de gates OR

**Rama:** `integration/t51-or-gates`  
**Propiedad:** coordinación/integración.  
**Objetivo:** resolver `EVENT_GATE_OR_OR_DERIVED_FACT` sin reescribir contenido canónico de los workstreams por edad.

## Problema

El contrato histórico de eventos usa `gates: Condition[]` y `conditionsPass()` aplica `every()`, por lo que solo expresa conjunción. El Documento Maestro contiene escenas con más de una ruta causal válida. Aproximarlas como `A AND B` reduce reachability; eliminar condiciones ensancha la escena de forma no canónica.

Dependencias explícitas ya registradas por otros workstreams:

- `EVT_18_PRS_002`;
- `CEVT_19_SOCIAL_01`;
- `CEVT_21_MEDIA_01`;
- `EVT_23_LOCK_001`.

Este contrato no modifica todavía ninguna de esas escenas: habilita a sus owners para repararlas con una semántica común y auditable.

## Semántica

Un evento puede añadir `gateAny`, una lista de rutas alternativas:

```text
event.gates AND (gateAny[0] OR gateAny[1] OR ...)
```

Cada `gateAny[i]` es a su vez una lista de `Condition` evaluada con AND.

Ejemplo conceptual:

```text
COMMON
AND
(
  PHOTO
  OR
  (HIGH_EXPOSURE AND RECENT_CONFLICT)
)
```

se expresa como:

- `gates = [COMMON]`
- `gateAny = [[PHOTO], [HIGH_EXPOSURE, RECENT_CONFLICT]]`

## Compatibilidad y seguridad

- Un evento sin `gateAny` conserva exactamente la semántica histórica.
- `gateAny: []` falla cerrado.
- Una ruta vacía `[]` no cuenta como alternativa verdadera.
- Evaluar gates no consume RNG ni muta el estado.
- `EventIndex` continúa prefiltrando únicamente por fase/edad; las rutas se evalúan en scheduler.
- T5.3 knowledge requirements siguen siendo un AND adicional después del gate causal.
- S1 choice eligibility sigue aplicándose después del gate causal.
- Exclusions conservan su contrato histórico.

## APIs

`src/narrative/event-gates.ts`:

- `eventGatesPass(state,event)` — evaluación única del contrato;
- `withAlternativeGates(event,gateAny)` — constructor inmutable para módulos de contenido directos;
- `alternativeGateGroups(event)` — lectura tipada de las rutas.

`ambiguousEvent()` acepta también `gateAny`, de modo que el contenido 18–20 no necesita una solución particular.

## Pruebas

`scripts/test-t51-or-gates.mjs` cubre:

1. compatibilidad AND-only;
2. ruta A o ruta B;
3. gate común obligatorio;
4. AND dentro de cada ruta;
5. malformed OR fail-closed;
6. ausencia de mutación/RNG;
7. integración real con scheduler;
8. constructor inmutable;
9. propagación por `ambiguousEvent()`.

## Límites

- no reescribe escenas canónicas;
- no crea derived facts inventados;
- no toca saves, content migration, seed lifecycle ni NPC knowledge;
- una futura escena que adopte `gateAny` modifica su definición de contenido y debe seguir el contrato oficial `T51_CONTENT_MIGRATION` cuando corresponda.

## Criterio de cierre

La pasada S3 queda cerrada cuando:

- build y test dirigido pasan;
- `Repository integrity` completo pasa;
- la rama está re-grounded sobre el `main` vigente;
- el contrato queda integrado en `main` sin modificar escenas de otros owners.
