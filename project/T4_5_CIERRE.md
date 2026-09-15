# T4.5 · lote 18–20 4

## Entrega

Se acreditan las ocho escenas restantes del tramo 18–20: seis cierres principales (`EVT_18_TEAM_001`, `EVT_18_MATCH_002`, `EVT_18_END_001`, `EVT_18_END_002`, `EVT_18_SUM_001` y `EVT_19_SUM_001`) y el retorno condicionado (`CEVT_19_NANO_01` y `CEVT_19_RETURN_01`).

Cada escena conserva contexto visible e incierto, un disparador temporal, de estado o de memoria, NPCs trazables, al menos tres acciones diferenciadas y mensajes de consecuencia. El callback de Nano mantiene además su cierre explícito de la semilla; el retorno exige el gate de fin de cesión.

## Verificación

`scripts/test-t45.mjs` comprueba las ocho definiciones, bloquea sus gates para confirmar que no aparecen sin contexto, satisface el contexto y ejecuta el scheduler y todas las elecciones contra el motor real. También comprueba historial con NPCs, etiquetas no genéricas y mensajes de resultado.

Regresión ejecutada el 15 de septiembre: **62/62 pruebas** de sesión, guardados, hitos, memoria y lotes T4.2–T4.5; gate general v0.8 correcto.

## Límite

Con este lote queda implementado el catálogo técnico 18–20. T4.6 continúa con el ciclo de juego, tutorial y resumen de partido.
