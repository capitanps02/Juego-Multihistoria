# Agent 5 final handoff — canon 18–23

## Estado de ownership

A5 deja el inventario canónico **95/95 preparado owner-side** sin activar una generación paralela.

- 45 escenas ya funcionales en la generación activa previa.
- 6 escenas pertenecen a PR #196 / generación J.
- 5 escenas están completas y listas para la **primera generación posterior a J**.
- 39 escenas restantes están completas owner-side y fallan cerrado hasta que aterrice su autoridad externa exacta:
  - 1 principal 18–20 (`EVT_18_END_002`);
  - 19 principales 20–23;
  - 19 condicionales 18–23.

Esto **no** significa 95 escenas integradas en `main`. Significa que A5 ya no tiene deuda de escritura/canon/choices/outcomes: lo pendiente es integración serializada o facts compartidas de otros owners.

## Orden obligatorio

1. Integrar PR #196 / generación J primero.
2. Re-ground de esta rama sobre el `main` real posterior a J.
3. Ejecutar QA exact-head.
4. Activar únicamente:
   - `CEVT_18_PLAYOFF_01`
   - `EVT_20_BRIDGE_001`
   - `EVT_20_CCH_001`
   - `EVT_21_SOC_001`
   - `EVT_21_PRS_002`
5. Calcular el **contentIdentity real** de ese catálogo, congelarlo y crear exactamente un edge adyacente desde la identidad activa. No precomputar K.
6. Mantener las otras 39 escenas fuera de `EVENTS` hasta que cada owner entregue su fact exacta.
7. Integrar después en lotes seriales; nunca abrir sucesores paralelos de la misma generación.

## Semántica corregida: WAIT_THREE_MATCHES

`EVT_20_CCH_001 / WAIT_THREE_MATCHES` ya no “espera” solo en el texto.

La elección queda en history persistido y `facts.coachPromiseWait` cuenta exclusivamente fixtures oficiales posteriores del mismo club desde el match store autoritativo:

- 0, 1 o 2 → `complete=false`
- 3 o más → `complete=true`

No usa role/form/month como proxy, no consume RNG y el progreso sobrevive save/load.

## Semántica corregida: CEVT_19_AGENT_01

La discrepancia exige:

- memoria live de `SEED_AGENT_OMISSION`;
- identidad de representante certificada por A1;
- el segundo conflicto de fuentes/source-quality producido externamente.

Los flags de contacto no fabrican agente activo y la seed no decide qué fuente tenía razón.

## Principios de integración

- authority null/unavailable = escena bloqueada;
- `marketHeat` ≠ CareerOffer;
- `seedsRead` ≠ hecho causal externo;
- no direct signing ni mutación de contrato/club;
- no diagnóstico desde `body.risk`;
- no match/result desde role/form;
- no convocatoria desde national standing/heat;
- no rol/carrera de NPC desde memoria previa;
- no owner change por RNG narrativo;
- provenance NPC solo a participantes explícitos o slots dinámicos certificados.

## Archivos staged

- `src/content/events/18_20/a5-end002-staged.ts`
- `src/content/events/18_20/a5-external-conditionals-staged.ts`
- `src/content/events/20_23/a5-ready-staged.ts`
- `src/content/events/20_23/a5-agent-ready-external.ts`
- `src/content/events/20_23/a5-market-external-staged.ts`
- `src/content/events/20_23/a5-medical-external-staged.ts`
- `src/content/events/20_23/a5-sport-external-staged.ts`
- `src/content/events/20_23/a5-shared-external-principals-staged.ts`
- `src/content/events/20_23/a5-external-conditionals-staged.ts`
- `src/catalog/npc-knowledge-rules-a5-ready.ts`
- `scripts/test-t51-a5-ready.mjs`

## Gate de cierre

No marcar A5 como integrado ni promover PR #234 mientras no estén verdes sobre el **HEAD exacto**:

- T51 A5 final 18-23
- T5 Market Contract Authority
- Repository Integrity

No merge automático.
