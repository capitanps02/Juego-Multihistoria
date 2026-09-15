# T4.1 · cadena piloto de memoria y consecuencia diferida

## Entrega

La cadena de Nano ahora tiene las tres fases comprobables:

1. `EVT_18_PRE_001` crea `SEED_NANO_SHADOW` cuando el jugador comparte la convocatoria.
2. `CEVT_19_NANO_01` solo puede reaparecer cuando existe la memoria y el jugador movió un contacto sin pedir permiso.
3. La opción de retirar el contacto resuelve explícitamente la semilla, conserva el recibo y apaga `HAS_SEED_NANO_SHADOW`.

La semilla conserva `originEvent`, `originSeason`, `npcRefs`, `payload` y `lastTouchedDate`. El historial de las tres escenas mantiene `NPC_PLR_14`, de modo que la reacción se atribuye a información que Nano pudo conocer.

## Verificación

`scripts/test-t41.mjs` busca una semilla reproducible, resuelve creación y reaparición, serializa y recarga el estado JSON, comprueba que el scheduler selecciona el callback y ejecuta el cierre. También verifica que un estado sin memoria no puede programar el callback.

Regresión ejecutada el 15 de septiembre: **58/58 pruebas** de sesión, guardados, hitos y T4.1; gate general v0.8 correcto.

## Límite

Esta pasada cierra una cadena piloto. Las demás semillas y callbacks se implementarán en los lotes de T4/T5; la evidencia de valoración humana y el ensayo físico de Android siguen siendo externos.
