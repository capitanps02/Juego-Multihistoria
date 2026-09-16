# T5.2 — Consecuencias diferidas

Fecha: 2026-09-16  
Cadena de trabajo: `t5/deferred-consequences` → `t5/deferred-or-gates` → `t5/deferred-runtime-effects`

## Objetivo

Comprobar estructuralmente que una seed producida por el runtime puede ejercer sus consecuencias antes de caducar, sin inventar semántica canónica.

El audit responde a esta pregunta:

> Si una seed se crea y después afecta una escena, una opción o la propia simulación de carrera, ¿existe al menos una cronología por edad en la que esa consecuencia pueda ocurrir mientras la seed sigue viva?

Esto complementa `seed-lifecycle.json`: el lifecycle inventaría productores/consumidores de forma amplia; este gate demuestra factibilidad temporal necesaria.

## Qué cuenta como consumidor runtime

### Narrativa

- `flags.HAS_SEED_*` en `event.gates` y `event.exclusions`;
- `flags.HAS_SEED_*` en rutas OR de `event.gateAlternatives`;
- `flags.HAS_SEED_*` en outcomes/modifiers;
- `flags.HAS_SEED_*` en `choice.eligibility`;
- transiciones `resolve` y `expire`.

Un `seedsRead` declarado sin una de esas vías sigue siendo metadata y no demuestra una consecuencia runtime.

### Simulación

T5.4 detectó que varias seeds afectan directamente el estado simulado sin pasar por una escena consumidora. Ejemplos actuales:

- `SEED_TACTICAL_SACRIFICE` / `SEED_YOUNG_MENTOR` modifican `roleAdaptability` al adaptar el estado de 26 años;
- `SEED_PEAK_LOAD` y `SEED_SELF_OPTIMIZATION` modifican selectividad, recuperación y físico al entrar en 30;
- `SEED_YOUNG_SUCCESSOR` modifica presión sucesoria semanal desde el tramo peak;
- `SEED_POSITIONAL_REINVENTION` modifica adaptación semanal y pretemporadas maduras;
- `SEED_CHRONIC_BODY` afecta riesgo de lesión madura y clasificaciones 26/30/34;
- precedentes como `PROJECT_FACE`, `SURGERY_TIMING`, `FIRST_PEAK_DIP`, `WEALTHY_PEAK_EXIT` o `EARLY_HOME_RETURN` afectan tags/estado de carrera en hitos posteriores.

Estas lecturas son consecuencias causales reales y ahora entran en el mismo grafo productor→consumidor.

## Registry de consumidores de simulación

`scripts/t52-simulation-seed-consumers.mjs` declara cada par `archivo + seed` que aparece como `HAS_SEED_*` en `src/simulation`, junto a:

- ventana de edad real de la superficie;
- nombre de la superficie;
- justificación de esa ventana.

Estado del árbol al crear el follow-up:

- **22** pares archivo+seed;
- **15** seeds únicas;
- adaptadores de transición exactos: `adaptState26ToPeak` usa `[26,26]` y `adaptState30ToMaturity` usa `[30,30]`;
- clasificadores: `State26` usa `[26,null]`, `State30` usa `[30,null]` y `State34` usa `[34,null]`, porque además del hito anual `career-simulator` los recalcula al construir el estado final de una simulación;
- `State34` no baja a 33 por la retirada anticipada: en ese branch el predicado que consulta `SEED_CHRONIC_BODY` queda dentro del bloque `!EARLY_RETIRED_30_34` y no se evalúa;
- `runMaturityPreseason` usa `[31,33]`, que son las edades en las que `world-simulator` lo invoca realmente;
- efectos semanales conservan sus guards explícitos, por ejemplo edad 19, `>=26` o `>=30`.

El audit escanea todos los `.ts` bajo `src/simulation`. El gate falla si aparece:

1. un uso `HAS_SEED_*` no registrado;
2. un registro que ya no corresponde a ningún uso real;
3. un par archivo+seed duplicado;
4. una ventana inválida.

Por tanto, añadir una nueva consecuencia de seed a la simulación exige declarar explícitamente cuándo puede ocurrir.

## Regla temporal

Para cada pareja productor→consumidor, narrativo o de simulación:

1. el productor debe poder ejecutarse antes o en la edad máxima de la seed;
2. el consumidor debe poder ejecutarse antes o en esa edad máxima;
3. debe existir al menos una edad de consumidor igual o posterior a una edad posible del productor.

Si una seed tiene productor y consumidor runtime pero **ninguna** pareja cumple las condiciones, `hardPass=false`.

Ejemplos:

- productor 18–20, consumidor narrativo 23–26, seed 18–26 → posible;
- productor 18–20, opción dependiente 21–23, seed 18–20 → imposible;
- productor 26, efecto de simulación a 30, seed abierta → consecuencia diferida posible;
- productor 29, efecto de simulación a 30+, seed 29+ → consecuencia diferida posible;
- productor 18–20, efecto de simulación únicamente a 21–23, seed 18–20 → imposible.

## Qué NO infiere

No demuestra:

- continuidad de club para `origin_club`;
- continuidad de temporada para `origin_season`;
- fecha ISO exacta de `expiresAfter`;
- probabilidad de outcomes;
- que una ruta OR sea la única ruta posible;
- equivalencia canónica de escenas;
- autorización para cablear una escena legacy;
- conocimiento NPC.

Esas fronteras siguen siendo obligaciones separadas.

## Salida

`node scripts/audit-t52-deferred.mjs` genera `analysis/T5.2/deferred-consequences.json` con:

- productores runtime;
- consumidores narrativos;
- consumidores directos de simulación;
- readers metadata-only;
- parejas temporalmente factibles y estrictamente diferidas;
- edges inalcanzables;
- obligaciones de club/temporada/fecha;
- estado del registry de simulación;
- cadenas completamente imposibles.

Las métricas distinguen `runtimeEventConsumerSeeds` de `runtimeSimulationConsumerSeeds` y también ofrecen el conjunto combinado `runtimeConsumerSeeds`.

## Criterio duro

El gate falla si:

1. aparece una referencia a una seed desconocida;
2. una seed con productor y consumidor runtime no tiene ninguna pareja temporalmente posible; o
3. el registry de consumidores de simulación deja de coincidir exactamente con `src/simulation`.

Los edges individuales inalcanzables se reportan aunque otra pareja de la misma seed sí sea viable.

## Canon, migración y NPC

Este gate **no autoriza wiring**. Sigue vigente `canon first, wiring second`.

`SeedInstance.originEvent`, history, pending legacy, `contentIdentity`, RNG y conocimiento NPC no son modificados. La presencia de una seed o una consecuencia de simulación tampoco implica que un NPC conozca el hecho: T5.3 conserva esa frontera epistemológica.
