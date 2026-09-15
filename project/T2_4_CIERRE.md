# T2.4 · Ofertas y autoridad del jugador

Estado: completada el 15 de septiembre de 2026. Avance ganado: 2,2 puntos; acumulado 17,55 %.

## Resultado

El motor genera ofertas pendientes para renovaciones, mercado, cesiones y adaptación profesional. Una oferta conserva las condiciones anteriores y propone club, inscripción, propiedad, categoría, salario, duración y cláusula. El estado permanece intacto hasta una respuesta.

- Aceptar aplica todas las condiciones juntas.
- Rechazar conserva contrato, club, RNG y contexto.
- Delegar autoriza solo esa oferta; se acepta únicamente si no baja salario ni categoría y mantiene al menos 12 meses.
- Cada respuesta queda en el historial y en un recibo idempotente. La autoridad no se hereda.

El comando `offer` y la validación de sesión protegen doble pulsación, revisiones antiguas, cambios de condiciones, corrupción y migración de sesiones T2.1–T2.3. `PlayerView` expone únicamente condiciones públicas. Los cambios narrativos de club sincronizan inscripción, propietario, ruta y contexto en una sola resolución.

## Evidencia

- `analysis/2026-09-15/T2.4/regression-final.tap`: 66 pruebas, 66 correctas; motor, migraciones y paquete PlayCanvas.
- `analysis/2026-09-15/T2.4/persistence-final.tap`: 3 pruebas correctas; 100 ciclos de interrupción IndexedDB y recuperación.
- `analysis/2026-09-15/T2.4/offers.tap`: 9 pruebas dirigidas correctas.
- `web/qa-offers.html`: matriz reproducible de 12 casos (aceptar/rechazar/delegar × cuatro puntos de interrupción); completada con reintento, recarga y recibo repetido.
- `web/qa-offers-ui.html`: interfaz aislada que muestra las condiciones y el criterio de delegación antes de responder.

## Archivos principales

`src/simulation/offers.ts`, `src/session/game-session.ts`, `src/session/validate-session.ts`, `src/save/validation.ts`, `src/simulation/world-simulator.ts`, `src/narrative/resolver.ts`, `web/game-ui.js`, `preview/app.js` y el paquete regenerado `playcanvas/multihistoria.js`.

Siguiente pasada: T2.5, hitos de edad y gates fiables.
