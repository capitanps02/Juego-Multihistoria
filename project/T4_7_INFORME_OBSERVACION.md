# T4.7 · informe de observación y mejora 1

## Estado

Avance técnico implementado. La evidencia de una ronda con participante humano externo sigue pendiente y, por tanto, T4.7 no se declara cerrado.

## Ronda local

La ronda `OBS-LOCAL-01` recorrió una carrera nueva, la primera escena, una elección, el resultado, continuar, pausa/reanudación, `Carrera` y `Tu partida`. El registro trazable está en [`analysis/2026-09-15/T4.7-observacion.json`](../analysis/2026-09-15/T4.7-observacion.json).

Hallazgos:

- **J01 · alta:** después de una elección, el resultado quedaba vacío porque la interfaz intentaba leer la familia de una decisión ya consumida.
- **J02 · media:** el contexto conocido/incierto estaba plegado pese a que el tutorial pedía revisarlo.

## Correcciones

- `PlayerView` devuelve una categoría de presentación del resultado (`match` o `story`), sin exponer identificadores de catálogo.
- El resumen de partido usa esa categoría y ya no depende de `decision` durante la pantalla de resultado.
- El bloque «Lo que sabes · lo que queda por descubrir» se muestra desplegado al entrar en una escena.
- Se añadió `scripts/test-t47.mjs` con prueba de regresión de la transición real y del resumen de partido.

## Verificación

Build TypeScript, T4.6 y T4.7: **4/4 pruebas correctas** en la prueba dirigida final. La ronda local confirmó el resultado, continuar, pausa/reanudación y localización de la copia descargable.

Siguiente acción: repetir el mismo protocolo con al menos una persona externa, medir deseo de continuar de 0 a 5 y confirmar si J01/J02 quedan resueltos.
