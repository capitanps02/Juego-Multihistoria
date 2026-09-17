# Registro de ingestión · PlayCanvas · 2026-09-17

## Fuente procesada

- Instrucción de integración aportada por el autor el 17 de septiembre de 2026.
- Estado real de `origin/main` re-integrado hasta `d9cd3cf` (17 de septiembre de 2026).
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
| Migración del guardado publicado a PlayCanvas | 100 % | Asset `306862614` con `99ec…`; Launch recupera 9 dic 2026 / 6 decisiones sin avisos ni errores. |
| T3 Android | 75 % (3/4 hitos) | Falta exclusivamente la evidencia en teléfono Android físico de T3.4. |
| T5 oficial acreditado | 0 % de su bloque | Ninguna pasada T5 completa; no se asigna peso parcial. |
| Primer lote canónico 23–26 | 7/12 escenas (58,3 %) | Tres T5.10, tres T5.11 y `EVT_23_PRS_001` activos en el catálogo real. |
| Contenido funcional 20–23 | 12/51 escenas (23,5 %) | T5.5 aporta 9/12 y T5.6 aporta 3/12; ambos siguen siendo lotes incompletos. |
| Correcciones funcionales 18–20 | 11 escenas | Siete correcciones previas más cuatro escenas #124 con contexto deportivo autoritativo; `84871…` → `99ec…`. |

- 17 de septiembre de 2026: integrado el contrato T5 de resultado deportivo determinista (`29fc684`): utiliza solo RNG `football`, persiste e idempotentemente reutiliza el hecho resuelto y no altera `contentIdentity`. Sigue pendiente el contenido canónico de `EVT_24_MATCH_001`, que será su primer consumidor.
- 17 de septiembre de 2026: integrado el lote canónico 20–23 (`T5.5-A`, `T5.5-B`, `T5.6-A`): doce escenas dejan de usar shells genéricos. La migración se completa con las tres aristas adyacentes `de9… → 6a9… → 6e55… → ce2…`, con evidencia congelada para cada generación; no hay atajos ni reinterpretación de decisiones pendientes.
- El bundle `99a6cc4c…` se cargó en el asset PlayCanvas `306862614`. Un Launch nuevo confirmó la recuperación de la partida existente y devolvió cero errores y cero avisos de consola.

- 17 de septiembre de 2026: re-ground de los avances ya integrados en GitHub sobre `origin/main` `d9cd3cf`. Se congeló la identidad combinada H `691401e78db356a03bf7bf13c7d2a2931d66431cc3108f22a8664f37d3afbdb8`, que incorpora la corrección causal PRS G `303527ef…` y las doce escenas canónicas 20–23. El lineage queda sin bifurcaciones: `de9… → 303… → H` y `6a9… → 6e55… → ce2… → H`; así las partidas ya publicadas en PlayCanvas conservan una única ruta de migración.
- Validación del re-ground: 148/148 pruebas de contenido, lineage, guardados, autoridad nacional y momentos de fútbol; 11/11 pruebas del bundle PlayCanvas. El bundle generado tiene SHA-256 `59fa325f7f7ac4feb3d8ae340212764cb1c6e71173f9078cdeb274bf8c99697c`.
- Progreso operativo T5 actualizado: se mantiene el crédito oficial en 0 % hasta cerrar una pasada completa, y se contabilizan por separado los lotes verificados: 20–23 `12/51` (23,5 %) y 23–26 `7/12` (58,3 %), incluida la corrección PRS G ya integrada.
- 17 de septiembre de 2026: se publicó H en el asset PlayCanvas `306862614`. El Launch `re-ground=1` de la escena `2593315` recuperó la partida existente el 1 nov 2026 con 6 decisiones, sin errores ni avisos de consola; no se simuló ninguna semana.
- 17 de septiembre de 2026: candidato 18–20 de GitHub re-grounded desde la generación H publicada a `84871fae…`. La arista H → `84871…` enumera siete escenas como `same_scene`, preserva completion/history/pending/RNG y no reescribe orígenes de seed. Las correcciones son dos gates (Clara/heat y lesión aguda) y cinco consumidores causales de memoria de seed. Validación: 146/146 pruebas dirigidas y 11/11 del bundle PlayCanvas.
- 17 de septiembre de 2026: `84871…` publicado en PlayCanvas asset `306862614`. Launch `seed-repairs=1` recuperó el guardado existente en 1 nov 2026, 6 decisiones, sin errores ni avisos; no se ejecutó ninguna simulación.
- 17 de septiembre de 2026: integrado el gate de readiness T5.2. La auditoría cubre 210/210 seeds, sin cadena runtime imposible y con 57/57 pruebas T5.2 correctas. El crédito oficial T5 se mantiene en 0 %: `canonicalClosureComplete` exige una clasificación canónica explícita por seed y el registro está correctamente vacío (0/210), por lo que no se inventaron cierres.
- Próximo cierre oficial verificable: T5.5 requiere tres escenas (`EVT_20_BRUNO_001`, `EVT_20_AGT_001`, `EVT_21_SOC_001`) que siguen bloqueadas por autoridad/provenance real; no existe todavía una implementación candidata en GitHub.
- 17 de septiembre de 2026: integrado el wiring deportivo #124 sobre `main` actual. Cuatro escenas 18–20 ahora consumen hechos persistidos de partido, calendario y objetivo, sin proxies. Generación `99ec70cd…`, ruta adyacente desde `84871…`, 132/132 pruebas dirigidas y bundle PlayCanvas publicado.
- 17 de septiembre de 2026: `99ec70cd…` publicado en PlayCanvas asset `306862614`. Launch `sport-context=1` recuperó el guardado existente en 9 dic 2026, 6 decisiones, sin errores ni avisos; no se ejecutó ninguna simulación.
- 17 de septiembre de 2026: integrado T5 #123 con oferta formal determinista para las ventanas de enero y verano a los 18 años. La generación `df1b8939…` añade el productor y activa los puentes canónicos de `EVT_18_JAN_001` y `EVT_18_SUM_001`; ruta adyacente `99ec…` → `df1b…`, catálogo congelado, 30 controles de migración/linaje y 11/11 pruebas PlayCanvas. Pendiente de publicación.
