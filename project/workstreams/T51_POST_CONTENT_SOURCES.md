# T5.1 — Evidencia de fuentes post-content

Fecha: 2026-09-16

## Objetivo

Preservar cada catálogo post-T5.1 que haya podido crear una partida antes de activar el siguiente lote canónico.

Este contrato complementa el lineage multigeneración integrado en `main`: **no crea rutas directas redundantes**. La migración sigue un único camino acíclico `A -> B -> C`; este workstream garantiza que A, B y C tengan evidencia verificable cuando corresponda.

## Regla de integración

Antes de que una identidad post-T5.1 quede activa en `main`:

1. su `EVENTS` exacto se congela en `qa/fixtures/t5.1/post-t51-sources/<contentIdentity>.json`;
2. `src/session/post-t51-legacy-registry.ts` se regenera desde esos fixtures;
3. la identidad activa aparece en `LEGACY_CONTENT_SOURCES` como fuente de validación, nunca en el scheduler;
4. cada identidad histórica registrada distinta de la activa debe tener **exactamente un camino acíclico** hasta la activa;
5. todos los endpoints de cada edge del lineage deben disponer de evidencia congelada.

No se exige `PRE -> C` cuando ya existe `PRE -> B -> C`. Añadir ambos caminos haría la migración ambigua y debe fallar cerrado.

## Primera fuente post-T5.1

El primer catálogo real post-T5.1 es B1a:

`1a8a5e2006fe7160f4fbc02060568d3abec99df038fe3a1a7799c8a0e802eac7`

Fue activado por PR #58. Su fixture se captura ahora, antes de permitir que un segundo batch cambie `contentIdentity`.

## Runtime

`src/session/post-t51-legacy-registry.ts` contiene fingerprints y digests de journal generados a partir de los fixtures. `LEGACY_CONTENT_SOURCES` combina:

- el catálogo pre-T5.1 ya congelado;
- todas las fuentes post-T5.1 generadas.

Estas fuentes sirven exclusivamente para validar history, journal, provenance y pending decisions de saves antiguos. No se insertan en `EventIndex`, no se agendan y no consumen RNG.

## Gates

- `freeze-t51-active-source.mjs --check` exige que el catálogo post-T5.1 activo esté congelado exactamente;
- `generate-t51-post-legacy-registry.mjs --check` exige que la registry sea reproducible;
- `check-t51-content-migration-route.mjs` valida evidencia y cada edge del lineage contra su source/target reales;
- `test-t51-migration-source-policy.mjs` prueba PRE, PRE->B, PRE->B->C, source activa ausente, path ausente, path ambiguo y endpoint sin evidencia.

Los gates se conectan a `npm test`, `test:t51:migration`, `qa:t5:content`, `qa:t5:freeze` y `qa:t5`.

## Límites

Este cambio no modifica:

- `EVENTS` ni contenido narrativo;
- scheduler/resolver;
- schema de save;
- RNG;
- seeds/NPC;
- trackers autoritativos;
- la semántica de los mappings de cada batch canónico.

La regla operativa para los siguientes lotes es: **freeze current source -> añadir un único edge current->next -> validar lineage -> integrar serialmente**.
