# T2.5 · Hitos de edad y gates fiables

Estado: completada el 15 de septiembre de 2026. Avance ganado: 2,2 puntos; acumulado 19,75 %.

## Resultado

Cada cruce de edad (20, 23, 26, 30 y 34) registra una instantánea histórica inmutable con fecha, temporada, fase, club, categoría, rol, mercado, contrato, ruta, etiquetas y firma. La instantánea se captura antes de que el adaptador del tramo modifique el estado. No se recalcula a partir del estado final.

La sesión y el guardado conservan `ageMilestones`; la vista de Carrera los muestra como hitos. Los guardados anteriores siguen cargando sin inventar datos históricos que no estaban presentes. Si un guardado que declara hitos está corrupto, duplicado, fuera de orden o incompleto, la validación lo rechaza.

Se añadió `scripts/t25-gate.mjs`. Comprueba los cinco cruces en ocho semillas, verifica firmas y comprueba que 90 días posteriores no reescriben los hitos. Un caso negativo elimina un hito y termina con código de salida 2, por lo que un gate fallido no puede presentarse como correcto.

## Evidencia

- `analysis/2026-09-15/T2.5-regression.tap`: 60 pruebas, 60 correctas; sesiones, migraciones, persistencia, ofertas, PlayCanvas e hitos.
- `analysis/2026-09-15/T2.5-gate.json`: 8/8 semillas con edades `[20,23,26,30,34]`, sin errores de build.
- `scripts/test-t25.mjs`: preservación tras JSON y 400 días, rechazo de manipulación y comprobación del código de salida fallido.
- `web/game-ui.js`: panel público de hitos en Carrera.

## Archivos principales

`src/simulation/age-milestones.ts`, `src/simulation/world-simulator.ts`, `src/core/types.ts`, `src/content/initial-state.ts`, `src/save/validation.ts`, `src/session/game-session.ts`, `scripts/t25-gate.mjs` y el paquete regenerado `playcanvas/multihistoria.js`.

Siguiente pasada: T3.2, presentación y continuidad.
