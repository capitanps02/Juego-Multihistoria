# Cierre T3.2 · Presentación y continuidad

**Fecha:** 15 de septiembre de 2026  
**Estado:** completada  
**Avance ganado:** +2,75 % (22,5 % acumulado)  
**Siguiente pasada:** T3.3 · empaquetado Android offline

## Entrega

- `web/game-ui.js` mantiene una ruta interna en `history.state`. Las transiciones a la escena, el resultado, las vistas de Carrera y Atrás/Escape se restauran sin abandonar la partida. Una escena pendiente se vuelve a mostrar tras recargar.
- La barra superior ofrece **Pausar/Reanudar** con nombre accesible, estado pulsado y aviso vivo. Las acciones que cambian la sesión quedan deshabilitadas durante la pausa; la navegación y la reanudación siguen disponibles.
- `web/game-ui.css` contiene el texto largo en un panel desplazable, ajusta palabras largas, mantiene el fondo de la escena detrás del texto, usa objetivos táctiles de al menos 44 px y conserva foco visible y `prefers-reduced-motion`.
- `web/qa-continuity.html` y `web/qa-continuity-local.js` forman un escenario determinista de 6.401 caracteres para repetir la comprobación sin alterar el catálogo de producción.
- `scripts/test-t32.mjs` cubre los controles y las reglas de presentación. El paquete PlayCanvas y su manifiesto se regeneraron como T3.2 (`51` módulos, `9.652.798` bytes).

## Comprobación en navegador

Con el servidor local y viewport de **390 × 844** se verificó:

1. El relato ocupa 6.401 caracteres; el panel mide 453 px visibles y 3.743 px desplazables (`overflow: auto`). Tras desplazar, las tres respuestas siguen visibles.
2. Las respuestas miden 62–65 px de alto y 316 px de ancho; el control de pausa mide 72 × 46 px.
3. Pausar muestra «Juego en pausa · pulsa Reanudar para continuar.» y deshabilita las tres respuestas. Reanudar elimina el aviso y vuelve a habilitarlas.
4. Atrás del navegador y Escape devuelven a Inicio sin salir de la página. Una recarga con la escena pendiente la restaura; una elección muestra el resultado.
5. No se registran errores ni avisos de consola.

La evidencia detallada está en [T3.2-browser.json](../analysis/2026-09-15/T3.2-browser.json). La prueba repetible está en [test-t32.mjs](../scripts/test-t32.mjs).

## Validación automatizada

```text
62/62 pruebas combinadas: sesión, guardado, PlayCanvas, T2.5 y T3.2
```

- [Regresión TAP](../analysis/2026-09-15/T3.2-regression.tap)
- [PlayCanvas TAP](../analysis/2026-09-15/T3.2-playcanvas.tap)
- [T3.2 TAP](../analysis/2026-09-15/T3.2-test-t32.tap)
- [Gate final v0.8](../analysis/2026-09-15/T3.2-final-gate.json)

## Defectos pendientes

No quedan defectos reproducibles dentro del criterio de T3.2. La instalación física y la medición en Android pertenecen a T3.3–T3.4.
