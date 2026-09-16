# T5.1 — Mandatory phase-transition scheduling priority

## Objetivo

Cerrar el blocker transversal `DEP_T51_BRIDGE_PRIORITY` sin implementar ni activar contenido canónico de ningún bloque de edad.

El problema: una escena puente de cambio de fase puede ser canónicamente obligatoria y, aun siendo elegible, perderse por ritmo, presupuesto de ventana o sorteo ponderado frente a escenas ordinarias.

## Contrato

El opt-in usa el tag existente:

`mandatory_transition`

No cambia `EventDefinition` ni el save schema. Un content owner puede aplicar el tag con `withMandatoryTransitionPriority(event)`; hacerlo en una escena real sí será un cambio de catálogo/contentIdentity y pertenecerá al batch canónico que la active.

La prioridad solo está activa cuando:

- la edad actual es un límite de fase: 20, 23, 26, 30 o 34;
- `event.ageWindow[0]` coincide exactamente con esa edad;
- `runtime.seasonDay` está entre 0 y 14, inclusive.

Fuera de esa ventana, el evento vuelve al scheduler ordinario.

## Qué bypassa

Durante la ventana prioritaria, la escena marcada bypassa exclusivamente restricciones de pacing/capacidad:

- ritmo mínimo entre narrativas;
- presupuesto de principales de la ventana;
- cap de principales tardíos 34+;
- cap de condicionales, si un owner llegase a marcar explícitamente una escena condicional.

## Qué NO bypassa

Siguen siendo obligatorios:

- edad y fase;
- `SEEN` y cooldown;
- `timeWindow`;
- gates comunes y `gateAlternatives`;
- exclusiones;
- requisitos epistemológicos T5.3;
- al menos una choice elegible.

La prioridad no inventa hechos ni convierte gates falsos en verdaderos.

## Selección y RNG

Si exactamente una transición obligatoria es elegible, se devuelve directamente antes del sorteo ponderado y **no se consume RNG narrativo**.

Si hay más de una transición obligatoria elegible en la misma frontera, el scheduler falla cerrado con `Ambiguous mandatory transition priority`. No se decide por peso, orden del array ni azar.

Eventos no marcados mantienen exactamente la semántica ponderada existente.

## Alcance

Esta pasada no marca ninguna escena activa. En particular, no modifica `EVT_30_BRIDGE_001` ni decide su identidad/migración; únicamente proporciona el contrato compartido que el owner 30–34 puede consumir cuando su batch canónico esté preparado.

## QA dirigido

`scripts/test-t51-transition-priority.mjs` prueba:

1. preempción frente a una escena ordinaria de peso muy superior sin RNG;
2. bypass de ritmo y presupuesto;
3. respeto de gates, cooldown, SEEN y choice eligibility;
4. ventana exacta de frontera/gracia;
5. ambigüedad fail-closed sin RNG;
6. conservación del weighted scheduling y RNG para eventos no marcados.

El test queda conectado a `npm test` y a `test:t51:transition-priority`.
