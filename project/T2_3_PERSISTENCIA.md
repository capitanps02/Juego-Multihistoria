# T2.3 · Persistencia transaccional y recuperación

**T2.3 completada el 15 de septiembre de 2026. Avance ganado: 15,35 %.** IndexedDB instalado y comprobado en local y PlayCanvas. Siguiente pasada: T2.4, ofertas y autoridad del jugador.

## Entrega

`web/indexed-save-store.js` guarda estado, recibos, resultado y copia anterior en un registro IndexedDB. La transacción de escritura compara el registro leído antes de sustituirlo. Una transacción concurrente que haya avanzado la partida impide sobrescribirla. La UI solo publica el resultado cuando llega el evento `complete`. Se solicita durabilidad `strict`.

Las validaciones y el cálculo SHA-256 ocurren antes de abrir la transacción de escritura. En sus callbacks solo se leen y escriben registros, evitando que una espera asíncrona cierre la transacción prematuramente. Los errores y abortos se propagan a GameSession, que conserva el estado confirmado en memoria. Reintentar el mismo comando reconoce su recibo; si la escritura ya terminó y se perdió la confirmación, el mismo contenido se reconoce sin duplicarlo.

La migración inicial copia la partida de localStorage y su respaldo válido sin cambiar ni borrar los bytes originales. Si la partida antigua está corrupta, se conserva para diagnóstico y la interfaz permite restaurar una copia válida. La base tiene versión propia (1), separada del esquema de simulación y del contenedor de sesión.

SHA-256 detecta cambios en los bytes del guardado. La validación T2.2 comprueba además estructura, límites y coherencia. El hash no autentica al autor ni impide modificar deliberadamente una partida y recalcularlo.

La interfaz nueva y el visor clásico usan el mismo adaptador. Exportación e importación siguen usando el JSON de sesión compatible. Una pestaña que conserve código antiguo podría seguir escribiendo localStorage; se detecta esa divergencia al abrir la nueva versión, se avisa y se permite descargar la copia antigua para revisarla/importarla. No se sobrescribe automáticamente el progreso de IndexedDB.

## Verificación

- 57 pruebas de sesión, migración y equivalencia del paquete: superadas.
- Página reproducible de pruebas reales: `web/qa-persistence.html`, con código `web/qa-persistence.js`; usa exclusivamente claves de ensayo y las elimina al acabar.
- Matriz: 100 decisiones con semillas distintas; aborto antes de escribir, después de encolar la escritura y después de recibir su éxito; pérdida de confirmación después del commit. Reabre la conexión, compara el JSON completo y reintenta el comando. El RNG está incluido en la comparación.
- Casos adicionales: sustituciones concurrentes, importación inválida, corrupción del hash, recuperación con el mismo contenido, copia antigua corrupta con respaldo válido, aborto y reintento de migración, divergencia de una pestaña antigua.
- Interfaz aislada: migración del resultado de La lista de 26; confirmación, copia anterior, recarga durante recuperación, reintento y resultado restaurado con una decisión.

## Límites

Los abortos son transacciones reales de navegador; no equivalen a apagar físicamente Android. No se promete conservar datos tras desinstalar, borrar datos del sitio o averiar el dispositivo. El ensayo físico sigue en T3.4/T7. Los errores de cuota no autorizan borrar una partida para obtener espacio. Se debe descargar una exportación para conservar una copia fuera del navegador.

La copia anterior es rotativa: cada cambio confirmado sustituye ese respaldo. La copia antigua de la migración permanece intacta. El adaptador localStorage anterior se conserva solo para reproducir sus pruebas históricas.

Fuentes técnicas: [Transacciones IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction) y [opciones de durabilidad](https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/transaction).

## Resultado de cierre técnico

100/100 ciclos superados: 300 abortos reales de transacción y 100 pérdidas simuladas de confirmación después del commit. Seis comprobaciones adicionales superadas. Informe del navegador: `analysis/2026-09-14/T2.3/indexeddb/browser-report.json`. Las 57 pruebas anteriores también pasan.

Dos pestañas reales sobre la partida aislada: tras confirmar en una, la otra rechazó su escritura atrasada con aviso y conservó una sola decisión. La recuperación con recarga durante el proceso mantuvo el estado confirmado; el reintento terminó y la siguiente recarga recuperó el resultado.

Medición orientativa en este ordenador: escritura de una partida tras 250 comandos (65.837 caracteres JSON; fecha simulada 13 de septiembre de 2029), 57 ms. Una muestra, no un percentil ni una medición Android. Ensayo total: 182.350 ms.

Paquete preparado: SHA-256 `2b25046f75f70d53b2a55264c8a4bba61f0116b9b2d9759b12ca53c432784c24`. Subido y comprobado en Launch el 15 de septiembre.

## Verificación en PlayCanvas

La escena 2593315 muestra «Guardado transaccional · IndexedDB». Recuperó la carrera del autor del 16 de julio de 2026 con cuatro decisiones y el último capítulo «La cena de los mayores». Tras recargar conservó ese estado. La consola no mostró errores ni avisos. No se avanzó ni eligió por el autor. [Jugar](https://launch.playcanvas.com/2593315?debug=true).
