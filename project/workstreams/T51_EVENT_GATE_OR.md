# T5.1 — Contrato transversal de gates OR

## Objetivo

Añadir una forma explícita y backward-compatible de representar escenas cuya reachability canónica tiene varias rutas causales alternativas.

El problema detectado en la reconciliación 18–23 es que `EventDefinition.gates` es una lista plana y `conditionsPass()` evalúa esa lista con AND. Eso no puede expresar de forma fiel casos como:

- ruta A **o** ruta B;
- ruta A **o** (ruta B1 **y** ruta B2).

Los casos canónicos que motivan este contrato son `EVT_18_PRS_002`, `CEVT_19_SOCIAL_01` y `CEVT_21_MEDIA_01`. Este cambio no modifica todavía esas escenas.

## Semántica

`event.gates` conserva exactamente su significado histórico: todas las condiciones son requisitos comunes y se evalúan con AND.

Una escena puede optar de forma explícita por una extensión `gateAlternatives`:

```text
common gates AND (alternative route 1 OR alternative route 2 OR ...)
```

Cada ruta dentro de `gateAlternatives` es internamente AND.

Ejemplo:

```text
COMMON AND ((A AND B) OR C)
```

se representa con:

- `gates = [COMMON]`;
- `gateAlternatives = [[A, B], [C]]`.

## Seguridad

- una escena histórica sin `gateAlternatives` se comporta exactamente como antes;
- no cambia `Condition`, sus comparadores ni `conditionsPass()`;
- no se añade RNG;
- no se muta la definición del evento al evaluar reachability;
- `gateAlternatives: []` falla cerrado para evitar convertir por accidente una escena en incondicional;
- este contrato por sí solo no autoriza ninguna reimplementación canónica ni ningún alias.

## Integración posterior

Los workstreams de contenido deberán usar este contrato solo después de comprobar la ruta causal concreta contra el Documento Maestro. Si una alternativa depende de una seed, la escena deberá declarar también la lectura de esa seed y mantener la trazabilidad T5.2. Si depende de conocimiento de NPC, la ruta no puede inferir ese conocimiento desde `npcRefs` o desde la mera existencia de una seed: se mantiene el contrato T5.3 deny-by-default.

## Criterio de aceptación

Antes de integrar:

- tests dirigidos de compatibilidad legacy y OR;
- una ruta alternativa incompleta no debe pasar;
- los gates comunes siguen siendo obligatorios;
- un conjunto vacío de alternativas falla cerrado;
- Repository Integrity completo verde sobre el HEAD exacto.
