# T5.1 — Club renewal intent causal fact

## Objetivo

Cerrar `DEP_T51_RENEWAL_INTENT_FACT` sin modificar todavía ninguna escena canónica 30–34.

El caso que exige el contrato es `EVT_30_CON_001`, cuyo trigger canónico es:

`contract <= 18 months OR club wants renewal`

El primer branch ya es expresable con `Condition`. El segundo no tenía una señal causal autoritativa y el owner 30–34 mantenía la escena deliberadamente aproximada.

## Hecho autoritativo

La capa de simulación expone ahora el hecho derivado de solo lectura:

`facts.clubWantsRenewal`

No es un flag escrito por contenido narrativo y no se persiste en el save.

Es verdadero por dos vías:

1. existe una oferta formal de renovación del mismo club ya materializada en `market.pending`;
2. antes de una oferta formal, el jugador está en etapa profesional 20–33, sigue jugando, no existe `CONTRACT_DISPUTE`, quedan entre 1 y 24 meses de contrato y la propensión de renovación del club es >= 0.50.

La propensión utiliza exactamente la política que ya gobierna la generación de renovaciones en `world-simulator.ts`:

`0.20 + institutionalTrust/220 + roleSecurity/280 - max(0, contractPower-65)/230`, limitada a `[0.16, 0.68]`.

Un test anti-drift falla si esa política existente cambia sin revisar también este contrato.

## Por qué 24 meses

El hecho debe poder existir cuando quedan más de 18 meses; de lo contrario no aportaría la segunda rama del canon. A la vez, no debe convertir contratos largos en negociaciones permanentes. El horizonte de 24 meses modela una renovación anticipada plausible sin abrir un nuevo mercado de ofertas ni cambiar términos contractuales.

## Integración con Conditions

`eventGatesPass()` evalúa gates y `gateAlternatives` contra una proyección superficial del `GameState` que añade el namespace sintético `facts`.

El estado persistido no cambia. Todo el resto de rutas sigue viendo el mismo `GameState`.

Un owner puede expresar el trigger canónico como:

- route A: `contract.monthsRemaining <= 18`
- route B: `facts.clubWantsRenewal == true`

usando el contrato OR ya integrado.

## Invariantes

- cero RNG adicional;
- cero mutación del `GameState` al consultar el hecho;
- sin cambio de schema de save;
- sin cambio de `MarketState.version`;
- sin cambio de `contentIdentity`, porque esta pasada no modifica `EVENTS`;
- una oferta de mercado de otro club no cuenta como intención de renovación;
- `CONTRACT_DISPUTE` cierra la vía derivada mientras no exista una oferta formal ya materializada;
- retirado/carrera cerrada no puede adquirir una nueva intención derivada.

## Alcance

Esta pasada **no** modifica `EVT_30_CON_001`, no elimina sus tags de deuda y no lo promueve a `verified_same_identity`.

El owner 30–34 debe consumir `facts.clubWantsRenewal` en su propio batch canónico y registrar la migración/contentIdentity correspondiente cuando cambie el catálogo.

## QA dirigido

`scripts/test-t51-renewal-intent.mjs` verifica:

1. intención temprana real con 24 meses y propensión alta;
2. ausencia de intención con propensión baja;
3. rama contractual `<=18` preservada;
4. oferta formal de renovación como evidencia directa;
5. oferta de mercado no confundida con renovación;
6. disputa, horizonte y lifecycle fallan cerrado;
7. consulta sin RNG ni mutación;
8. ratchet de la fórmula del simulador existente.

El test queda integrado en `npm test` y `test:t51:renewal-intent`.
