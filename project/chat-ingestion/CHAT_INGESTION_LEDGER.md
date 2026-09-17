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

## Seguimiento posterior

- 17 de septiembre de 2026: se integró T5.3 (`408f38f`), que congela el baseline histórico de conocimiento de NPC para que las reglas vivas posteriores no reescriban replays anteriores. No altera la identidad del catálogo ni las rutas de migración de partida.
- El bundle actualizado se publicó de nuevo en el asset `306862614`. Un Launch nuevo de la escena `2593315` recuperó la partida existente en 1 nov 2026 con 6 decisiones y sin errores ni avisos de consola.
- La batería focal de T5.3, adaptador de jugador y PlayCanvas terminó con 66 pruebas correctas.

## Indicadores de seguimiento

Actualizados el 17 de septiembre de 2026. Estos indicadores separan el crédito oficial de los hitos técnicos para no presentar infraestructura o lotes incompletos como pasadas cerradas.

| Indicador | Valor | Base verificable |
|---|---:|---|
| Progreso global acreditado | 33,51 % | `project/PLAN_PASADAS.md`; T5 aún no cierra ninguna pasada oficial. |
| Migración del guardado publicado a PlayCanvas | 100 % | Asset `306862614` actualizado y Launch de la escena `2593315` recupera 1 nov 2026 / 6 decisiones. |
| T3 Android | 75 % (3/4 hitos) | Falta exclusivamente la evidencia en teléfono Android físico de T3.4. |
| T5 oficial acreditado | 0 % de su bloque | Ninguna pasada T5 completa; no se asigna peso parcial. |
| Primer lote canónico 23–26 | 7/12 escenas (58,3 %) | Tres T5.10, tres T5.11 y `EVT_23_PRS_001` activos en el catálogo real. |
| Contenido funcional 20–23 | 12/51 escenas (23,5 %) | T5.5 aporta 9/12 y T5.6 aporta 3/12; ambos siguen siendo lotes incompletos. |

- 17 de septiembre de 2026: integrado el contrato T5 de resultado deportivo determinista (`29fc684`): utiliza solo RNG `football`, persiste e idempotentemente reutiliza el hecho resuelto y no altera `contentIdentity`. Sigue pendiente el contenido canónico de `EVT_24_MATCH_001`, que será su primer consumidor.
- 17 de septiembre de 2026: integrado el lote canónico 20–23 (`T5.5-A`, `T5.5-B`, `T5.6-A`): doce escenas dejan de usar shells genéricos. La migración se completa con las tres aristas adyacentes `de9… → 6a9… → 6e55… → ce2…`, con evidencia congelada para cada generación; no hay atajos ni reinterpretación de decisiones pendientes.
