# T5.2 — Closure readiness de las 210 seeds

Fecha: 2026-09-16

## Objetivo

T5.2 no se considera cerrada porque exista infraestructura de lifecycle. El cierre real exige justificar canónicamente las 210 seeds.

`audit-t52-closure-readiness.mjs` combina tres evidencias ya existentes:

1. `seed-lifecycle.json`: productor, terminales, expiry y scope;
2. `seed-handoff.json`: owner canónico exacto 210/210;
3. `deferred-consequences.json`: consumidores positivos y factibilidad temporal.

Además consulta el `canonStatus` del catálogo ejecutable para distinguir endpoints `verified` de `technical_adaptation`.

## Lo que el audit sí demuestra

Para cada seed informa:

- owner canónico;
- topología runtime:
  - `producer_consumer_feasible`;
  - `producer_consumer_impossible`;
  - `producer_only`;
  - `consumer_only`;
  - `unwired`;
- productores runtime;
- consumidores de evento y simulación;
- existencia de pareja productor→consumidor temporalmente viable;
- productores con `canonStatus: verified`;
- consumidores de evento con `canonStatus: verified`;
- parejas viables cuyos dos endpoints de evento están verificados;
- transición terminal explícita;
- expiry por edad/fecha;
- scope de club/temporada;
- memoria open-ended sin terminal;
- siguiente acción recomendada al owner.

El informe se genera en `analysis/T5.2/closure-readiness.json` durante los gates T5.2.

## Lo que NO demuestra

Una pareja runtime viable, incluso con ambos endpoints `verified`, **no cierra automáticamente una seed**.

El audit mantiene deliberadamente:

`canonicalClosure: requires_owner_classification`

porque el owner debe decidir con evidencia cuál de las cuatro categorías de cierre real aplica:

1. productor + consumidor/cierre canónico implementados;
2. memoria persistente/open-ended intencional y justificada;
3. expiry por edad/fecha/club/temporada canónicamente justificada;
4. retirada/deprecación compatible con saves/history/provenance.

Los efectos de simulación son consecuencias runtime válidas, pero no se convierten por sí solos en una decisión narrativa/canónica final.

## Ratchets estructurales

El gate falla si:

- no aparecen exactamente las seeds del catálogo;
- una seed no tiene owner;
- falta su fila en el audit diferido;
- existe una cadena runtime productor→consumer completamente imposible.

El informe puede estar estructuralmente verde aunque `canonicalClosureComplete=false`. Eso es intencional: diferencia **calidad de evidencia** de **trabajo canónico pendiente**.

## Uso operativo

Después de cada micro-generación de contenido:

1. ejecutar `npm run audit:t52`;
2. consultar `closure-readiness.json`;
3. revisar el owner afectado;
4. observar si una seed pasó de `unwired/producer_only` a una cadena viable;
5. comprobar si los endpoints nuevos son `verified` o solo `technical_adaptation`;
6. no declarar cierre hasta que el owner documente la disposición canónica correspondiente.

## Integración

El audit queda conectado a:

- `npm test`;
- `npm run audit:t52`;
- `npm run test:t52`.

No modifica runtime, save schema, RNG, scheduler, resolver, catálogo, scopes, NPC knowledge ni contentIdentity.
