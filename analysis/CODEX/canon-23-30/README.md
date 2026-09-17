# Agente 6 — Canon 23–30 / cola Codex

Snapshot de trabajo:

- repo: `capitanps02/Juego-Multihistoria`
- base inspeccionada y re-groundeada: `main@adf1bffa7298bff6d7cebab88a3388c559cd3588`
- rama: `t51/canon-23-30`
- ownership: `23_26` y `26_30`
- 30–34: solo handoff; no contenido nuevo
- lineage/contentIdentity: propiedad del integrador, no de este workstream

## Qué se implementó en esta pasada

Se han preparado como candidatos compilables, deliberadamente fuera de los catálogos `EVENTS` activos:

1. `EVT_23_LOCK_001` — corrección canónica de LOCK23. La opción de escalar al capitán usa `choice.eligibility` y falla cerrada si no existe un capitán autoritativo del club actual. No se inventa participante.
2. `EVT_25_MKT_001` — “El entrenador te llama directamente”. Mantiene interés concreto separado de una `CareerOffer`; ninguna opción crea oferta, firma contrato o cambia de club.
3. `EVT_26_BRIDGE_001` — “Ya no te pagan por potencial”. Bridge canónico de edad 26 con `SEED_PEAK_IDENTITY`, sin reinterpretar la historia previa ni mutar club/contrato/ofertas.

Tests dirigidos añadidos:

- `scripts/test-t51-agent6-lock23.mjs`
- `scripts/test-t51-agent6-mkt25.mjs`
- `scripts/test-t51-agent6-age26-bridge.mjs`

No se han añadido a `EVENTS` porque su activación cambia `contentIdentity` y necesita la siguiente generación adyacente, freeze y migración gestionados por integración.

## Estado cuantitativo

### 23–26

- principales canónicos: 40
- condicionales canónicos: 20
- principales `verified_equivalent`: 28
- principales nuevos staged en esta rama: 2
- principales `codex_ready`: 4
- principales bloqueados por authority/lineage: 8
- condicionales plenamente certificados runtime: 0/20
- condicionales clasificados `codex_ready` en esta cola: 3

La cobertura principal certificada activa sigue siendo 28/40 = 70%. Contando los dos candidatos staged ya implementados como candidatos de integración, 30/40 = 75% de las principales disponen de implementación semántica válida o equivalencia certificada, pero los dos staged todavía no son runtime activo.

### 26–30

- principales canónicos: 51
- condicionales canónicos: 24
- principales runtime actuales: 51
- IDs canónicos divergentes respecto al runtime histórico: 26
- extras técnicos/legacy históricos: 26
- principal staged en esta rama: `EVT_26_BRIDGE_001`
- principales clasificados `codex_ready`: 30
- principales bloqueados por shared authority/lineage: 21
- condicionales `codex_ready`: 23
- condicionales bloqueados: 1

El inventario de identidad está completamente clasificado, pero eso no equivale a runtime reconciliado. La divergencia canónica 26↔26 sigue necesitando implementación e integración por lotes.

## Fuentes de verdad usadas

- `analysis/T5.1/canon-23-30.json`
- `analysis/T5.1/canon-23-30-conditionals.json`
- Documento Maestro / fichas canónicas archivadas en el repositorio
- issues `#4`, `#6`, `#81`, `#83`, `#86`, `#109`, `#133`
- PRs `#106`, `#115`, `#122`
- autoridades runtime actuales de `CareerOffer`, `offerBridge`, locker leadership, choice eligibility, seed lifecycle e historical consumers

## Principios de implementación

- `CareerOffer` + `respondToOffer()` son la única autoridad para aplicar términos o cambiar de club.
- `marketHeat`, `reputation`, `agentControl`, `lockerPower` y edad pueden ser factores de apoyo; nunca sustituyen una oferta, un agente activo, un capitán o un hecho deportivo.
- partidos, goles, penaltis, resultados y finales deben venir de sport context / football moments.
- convocatorias y jerarquía internacional deben venir de hechos de selección, no solo de reputación.
- un NPC solo recuerda lo que puede conocer causalmente.
- cambiar de club invalida actores institucionales del club anterior como targets actuales.
- las seeds históricas conservan `originEvent`; el nuevo canon puede corregir el origen para carreras nuevas sin reescribir saves antiguos.

## QA recomendado antes de integrar cualquier lote

```bash
npm run build
node --test scripts/test-t51-agent6-lock23.mjs scripts/test-t51-agent6-mkt25.mjs scripts/test-t51-agent6-age26-bridge.mjs
npm test
npm run test:t51:migration
npm run test:saves
npm run test:t53
```

Además, cualquier lote que toque partidos debe ejecutar la suite de sport context/football moments del workstream correspondiente y cualquier lote de mercado debe ejecutar offer bridge + provenance.

## Archivos que Codex no debe cerrar por su cuenta

Salvo orden explícita del integrador, Codex no debe registrar ni editar para cerrar una generación:

- `src/session/content-migration.ts`
- registries/frozen evidence de contentIdentity
- `qa/fixtures/t5.1/post-t51-sources/*`
- hashes de generación
- shortcuts de migración
- rewrites históricos de `SeedInstance.originEvent`

Codex puede producir definiciones candidatas, tests, notas de migración y fingerprints candidatos; el integrador hace el freeze y la edge de migración final.

## Orden obligatorio

1. cerrar lo ejecutable de 23–26;
2. integrar correctamente LOCK23/MKT25 y el bridge 26 cuando lineage lo permita;
3. completar age-26 antes de expandir 27–29;
4. reconciliar 26–30 por identidad exacta y semántica;
5. entregar a 30–34 el estado persistente, nunca escenas nuevas de ese bloque.
