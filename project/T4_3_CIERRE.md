# T4.3 · lote 18–20 2

## Entrega

Se acreditan doce callbacks condicionales del tramo 18–20:

`CEVT_18_EARLY_01`, `CEVT_18_NODEBUT_01`, `CEVT_18_BRUNO_01`, `CEVT_18_VELA_01`, `CEVT_18_CCH_01`, `CEVT_18_RELEG_01`, `CEVT_18_PLAYOFF_01`, `CEVT_19_BIG_01`, `CEVT_19_AGENT_01`, `CEVT_19_INJ_01`, `CEVT_19_ABROAD_01` y `CEVT_19_SOCIAL_01`.

Cada callback tiene un disparador de estado concreto, información visible e incierta, tres respuestas diferenciadas y mensajes de consecuencia. Los eventos declaran NPCs o semillas cuando el contexto lo requiere y mantienen la fase 18–20.

## Verificación

`scripts/test-t43.mjs` comprueba que cada callback no puede programarse sin contexto, satisface sus gates sobre un estado controlado, verifica que el scheduler lo selecciona y ejecuta todas sus respuestas contra el motor real. También rechaza las etiquetas genéricas del adaptador inicial.

Regresión ejecutada el 15 de septiembre: **59/59 pruebas** de sesión, guardados, hitos, memoria y lotes T4.2/T4.3; gate general v0.8 correcto.

## Límite

Este cierre cubre doce callbacks del segundo lote. `CEVT_19_NANO_01` pertenece a la cadena de memoria T4.1 y `CEVT_19_RETURN_01` queda para el lote siguiente.
