# Registro de ingestión · PlayCanvas · 2026-09-17

## Fuente procesada

- Instrucción de integración aportada por el autor el 17 de septiembre de 2026.
- Estado real de `origin/main` en `99b1cd56f199bda657fb9fb1c757b003265892b6`.
- Paquete PlayCanvas previamente instalado: asset `306862614`, escena `2593315`.

## Reconciliación

| Requisito | Estado | Evidencia / acción |
|---|---|---|
| Reflejar los avances del motor en PlayCanvas | `PARTIAL` → implementado | El bundle ahora incluye el catálogo y contratos actuales de `main`, incluidos T5.1–T5.3 ya integrados. |
| Conservar partidas PlayCanvas ya iniciadas | `MISSING` → implementado | Se registró la identidad histórica `6a48b61…` y su ruta adyacente hacia el lineage T5.1. La carga normal sigue siendo estricta; solo `CONTENT_CHANGED` activa migración explícita. |
| No exponer conocimiento privado de NPC | `PARTIAL` → implementado | La presentación usa el adaptador de contactos conocidos del jugador. |
| Mantener presentación móvil | `PARTIAL` → implementado | Se integraron los estilos de área segura, pantalla estrecha, orientación y reducción de movimiento. |

## Evidencia

- `scripts/test-playcanvas-legacy.mjs` crea una partida con el catálogo publicado histórico, migra en el bundle PlayCanvas y comprueba historia, pendiente, recibos, revisión y RNG; también rechaza identidad desconocida o definición manipulada.
- `scripts/test-player-session-api.mjs` demuestra que la UI migra únicamente tras `CONTENT_CHANGED` y no relaja otros fallos de validación.
- `npm test` y `npm run test:playcanvas` pasan sobre este cambio.
- Launch de la escena `2593315` abrió después de la actualización la partida existente de 1 nov 2026 con 6 decisiones y sin errores de consola.

## Pendientes

- Las escenas T5 posteriores que aún siguen en PRs draft no se han integrado: no están autorizadas por el lineage actual ni por `main`.
- T3.4 continúa pendiente de prueba en Android físico, tal como establece el plan canónico.
