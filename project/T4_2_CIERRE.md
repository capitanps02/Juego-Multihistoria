# T4.2 · lote 18–20 1

## Entrega

Se acredita el primer lote de doce escenas verificadas:

`EVT_18_LOCK_001`, `EVT_18_OPP_001`, `EVT_18_MKT_001`, `EVT_19_MKT_001`, `EVT_19_RIV_001`, `EVT_19_CCH_001`, `EVT_19_MEDIA_001`, `EVT_19_BODY_001`, `EVT_19_AGENT_001`, `EVT_19_JAN_001`, `EVT_19_TEAM_001` y `EVT_19_FIN_001`.

Cada escena conserva un cuerpo contextual, información visible e incierta, una ventana o gate/memoria contextual, y decisiones con etiquetas y consecuencias propias. Las escenas relacionales declaran sus NPCs; el puente de cierre de los 20 años queda identificado como escena de transición.

## Verificación

`scripts/test-t42.mjs` comprueba las doce definiciones y ejecuta cada elección contra el estado real. Verifica que no quedan las cuatro etiquetas genéricas del adaptador inicial, que cada resultado tiene mensaje y que el historial registra la escena y elección correctas.

Regresión ejecutada el 15 de septiembre: **59/59 pruebas** de sesión, guardados, hitos, memoria y lote T4.2; gate general v0.8 correcto.

## Límite

Este cierre acredita el primer lote de 12 escenas del tramo 18–20. Los lotes T4.3–T4.5 y la observación humana siguen pendientes.
