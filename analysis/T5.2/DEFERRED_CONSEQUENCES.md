# T5.2 — Consecuencias diferidas

Fecha: 2026-09-16  
Rama: `t5/deferred-consequences`

## Objetivo

Añadir una comprobación estructural entre productor y consumidor de una seed sin inventar semántica canónica. El audit responde a una pregunta concreta:

> Si una seed se crea en el runtime y otra escena intenta leerla, resolverla o expirarla, ¿existe al menos una cronología por edad en la que esa consecuencia pueda ocurrir antes de que la seed caduque automáticamente?

Esto complementa `seed-lifecycle.json`: el lifecycle indica que existen productores/consumidores; este gate comprueba que no estén ordenados de forma temporalmente imposible.

## Composición actual

La rama está re-groundeada sobre `main@76699f93e19e1ac9e17b42ccfaea011d92630fb6`. Esa base ya integra:

- lifecycle corregido de T5.2;
- conocimiento NPC causal de T5.3;
- migración explícita de Session/contentIdentity;
- contrato compartido de elegibilidad por opción.

El gate diferido no modifica esos contratos: inspecciona catálogo/eventos compilados y se compone con sus suites en `npm test`.

Además, T5.2 añade una regresión específica de `seedOriginMappings` para fijar que `rewriteExisting:false` preserve las instancias históricas y que `rewriteExisting:true` solo pueda cambiar `originEvent` en coincidencias exactas de `seedId + fromEventId`, sin alterar estado, payload, fechas, `consumedBy`, flags, history, cooldowns ni RNG.

## Qué cuenta como consumidor runtime

El audit usa únicamente evidencia que afecta comportamiento:

- condiciones `flags.HAS_SEED_*` en gates/exclusions/outcomes/modifiers;
- transiciones `resolve`;
- transiciones `expire`.

Un `seedsRead` declarado sin ninguna de esas vías se reporta como metadata, pero **no** se usa para afirmar que la seed tiene una consecuencia runtime.

## Regla temporal

Para cada pareja productor→consumidor:

1. el productor debe poder ejecutarse antes o en la edad máxima de la seed;
2. el consumidor debe poder ejecutarse antes o en esa edad máxima;
3. debe existir al menos una edad de consumidor igual o posterior a una edad posible del productor.

Si una seed tiene productores y consumidores runtime pero **ninguna** pareja cumple esas condiciones, `hardPass=false`.

### Ejemplos

- productor 18–20, consumidor 23–26, seed 18–26 → consecuencia diferida posible;
- productor 18–20, consumidor 21–23, seed 18–20 → imposible: la seed caduca antes;
- productor 23–26, consumidor 18–20, seed abierta → imposible: el consumidor solo existe antes del productor.

## Lo que NO infiere este audit

No intenta demostrar:

- continuidad de club para seeds `origin_club`;
- continuidad de temporada para `origin_season`;
- viabilidad de una fecha ISO concreta de `expiresAfter`;
- probabilidad de outcomes;
- que dos escenas sean canónicamente equivalentes;
- que una escena legacy pueda recibir wiring nuevo;
- conocimiento NPC.

Esos casos quedan como `proofObligations`, no como errores automáticos.

## Salida

`node scripts/audit-t52-deferred.mjs` genera:

`analysis/T5.2/deferred-consequences.json`

Incluye por seed:

- productores runtime;
- consumidores runtime;
- readers solo declarativos;
- parejas temporalmente factibles;
- parejas estrictamente diferidas;
- edges inalcanzables;
- obligaciones de prueba por club/temporada/fecha;
- cadenas completamente imposibles.

## Criterio duro

El gate falla solo si:

1. aparece una referencia a una seed desconocida; o
2. una seed tiene productor y consumidor runtime, pero no existe ninguna pareja temporalmente posible.

Los edges individuales inalcanzables se reportan para auditoría, aunque otra ruta de la misma seed sí sea viable.

## Relación con canon y migración

Este gate **no autoriza wiring**. La regla sigue siendo `canon first, wiring second`.

Con la migración compartida ya integrada, los bloques canónicos pueden empezar a introducir wiring real por lotes. El audit debe ejecutarse después de cada lote: si una escena crea una seed cuya única consecuencia cae fuera de su ventana temporal, el error se detecta antes de integrar esa cadena.

`SeedInstance.originEvent`, history, pending legacy, `contentIdentity`, RNG y conocimiento NPC no son modificados por el audit.
