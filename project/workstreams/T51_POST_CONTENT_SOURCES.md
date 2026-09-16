# T5.1 — evidencia de fuentes post-T5.1

Estado: contrato transversal para T5-QA-015 / issue #56.

## Problema

Session v3 valida una migración usando dos piezas independientes:

1. una ruta explícita `sourceContentIdentity -> targetContentIdentity`;
2. evidencia inmutable del catálogo de origen para validar history, journal, provenance y pending legacy.

El freeze pre-T5.1 cubre la primera transición. Sin una política adicional, un segundo batch de contenido podría registrar `A -> B` después de haber perdido la evidencia exacta de A, dejando partidas creadas bajo A sin una fuente verificable.

## Política adoptada

Cada catálogo post-T5.1 que vaya a quedar activo debe entrar en el repositorio con:

- un fixture exacto `qa/fixtures/t5.1/post-t51-sources/<contentIdentity>.json` que contiene el catálogo `EVENTS`, build y versiones de sesión;
- el registry generado `src/session/post-t51-legacy-registry.ts` actualizado;
- una ruta directa desde **cada fuente histórica registrada** al nuevo target activo.

No se usa reconstrucción semántica, fuzzy matching ni Git history como fuente runtime.

### Primer batch

Si `A` es el primer catálogo post-T5.1:

- congelar A;
- registrar A como `legacyContentSource` futura;
- registrar `PRE_T51_CONTENT_IDENTITY -> A`.

### Segundo batch

Si B sustituye a A:

- congelar B;
- conservar PRE y A;
- registrar `PRE -> B`;
- registrar `A -> B`.

La exigencia de rutas directas es deliberada. Una pending decision puede conservar provenance de una fuente anterior incluso tras una migración intermedia; una ruta directa mantiene `applyPostLegacyResolutionRouteInPlace()` explícita y evita composición implícita de mappings.

## Herramientas

### Congelar el catálogo activo

Después de `npm run build` y antes de mergear un batch que cambia `EVENTS`:

`node scripts/freeze-t51-active-source.mjs`

El comando crea una única vez el fixture del target. Rechaza sobrescribir un fixture ya existente.

### Regenerar registry

`node scripts/generate-t51-post-legacy-registry.mjs`

El generador valida:

- nombre de archivo = `<contentIdentity>.json`;
- hash SHA-256 de `JSON.stringify(events)` = identidad declarada;
- IDs de evento no duplicados;
- outcomes referenciados por choices existentes;
- fingerprints y journal digests deterministas.

### Gates CI

Los gates ejecutan:

- `generate-t51-post-legacy-registry.mjs --check`;
- `freeze-t51-active-source.mjs --check`;
- `check-t51-content-migration-route.mjs`;
- `test-t51-migration-source-policy.mjs`.

Mientras siga activo el catálogo pre-T5.1, el freeze post-T5.1 se omite y el registry puede permanecer vacío.

## Invariantes

- una identidad activa post-T5.1 sin fixture falla CI;
- un fixture cuyo contenido no corresponde a su identidad falla CI;
- un registry generado desactualizado falla CI;
- una fuente histórica registrada sin ruta directa al target activo falla CI;
- mappings se validan contra la evidencia de su source real, no contra PRE de forma hardcodeada;
- exact-ID `distinct_scene` continúa exigiendo limpiar `SEEN` y cooldown canónicos;
- seeds, history, journal, provenance y pending no se reescriben por este contrato;
- normal `resume()` sigue siendo estricto y `migrateAndResume()` sigue rechazando sources desconocidos.

## Alcance

Este contrato no cambia el catálogo activo, no añade rutas de contenido por sí mismo y no autoriza ningún batch canónico. Solo hace imposible integrar de forma accidental una secuencia de migraciones sin preservar la evidencia necesaria para los saves intermedios.
