# T4.4 · lote 18–20 3

## Entrega

Se acreditan doce escenas principales de adaptación técnica del tramo 18–20:

`EVT_18_PRE_001`, `EVT_18_PRE_002`, `EVT_18_PRE_003`, `EVT_18_AGT_001`, `EVT_18_MATCH_001`, `EVT_18_PRS_001`, `EVT_18_SOC_001`, `EVT_18_TACT_001`, `EVT_18_CAP_001`, `EVT_18_MED_001`, `EVT_18_PRS_002` y `EVT_18_JAN_001`.

Cada escena conserva el cuerpo contextual del canon, información visible e incierta, un disparador verificable (gate, ventana temporal o semilla), referencias de NPC y al menos tres acciones diferenciadas. Las elecciones producen mensajes de consecuencia y dejan un registro con el contexto de la escena.

## Verificación

`scripts/test-t44.mjs` comprueba la presencia de las doce escenas, sus gates y ventanas, ejecuta el scheduler con contexto satisfecho, confirma que no aparecen cuando sus gates están bloqueados y resuelve todas las elecciones contra el motor real. También rechaza etiquetas genéricas y consecuencias sin mensaje.

Regresión ejecutada el 15 de septiembre: **61/61 pruebas** de sesión, guardados, hitos, memoria y lotes T4.2–T4.4; gate general v0.8 correcto.

## Límite

Este cierre cubre doce escenas del tercer lote técnico. Las seis escenas principales restantes de 18–20 y el callback de retorno quedan para T4.5.
