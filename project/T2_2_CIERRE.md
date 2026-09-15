# T2.2 · Validación de guardados y migraciones

Estado: completada el 13 de septiembre de 2026. Peso ganado: 2,2 puntos. Acumulado: **10,4 %**, tres pasadas completadas de 68; quedan 65. Siguiente: **T2.3, persistencia transaccional y recuperación**.

## Resultado

El cargador comprueba el formato de cada versión antes de migrar. Ya no convierte silenciosamente un dato inválido en un valor por defecto ni acepta partidas sin historial, retirada, epílogo o flujos de azar obligatorios para su versión. Las sesiones del visor T2.1 se abren en T2.2 conservando escena, resultado, recorrido y RNG. Restaurar solo valida y migra en memoria; la siguiente acción confirmada guarda la nueva identificación de build.

El [visor local](http://127.0.0.1:4173) sigue disponible. La comprobación en navegador recuperó «Cinco minutos más», 6 de julio de 2026, una decisión, con las mismas tres opciones. No se eligió ninguna acción ni se reinició la partida del autor.

## Implementación

- `src/save/validation.ts`: tipos, campos obligatorios según versión, fechas reales, orden del historial, rangos de atributos, NPC obligatorios sin duplicados, semillas, retirada, epílogo y flujos RNG. Rechaza números no finitos, valores no serializables, estructuras circulares, propiedades ejecutables y claves reservadas. Los errores identifican el campo afectado.
- Entrada JSON limitada a 8 MiB, profundidad 64, 300.000 nodos, listas de 50.000 elementos y textos de 100.000 caracteres. Estos límites acotan entradas dañadas; no sustituyen la medición de almacenamiento en Android.
- `src/save/save.ts`: validación de entrada antes de migrar y de salida antes de usar o serializar. Se mantiene el resultado de las migraciones existentes para los ejemplos válidos.
- `src/session/validate-session.ts`: correspondencia entre revisión, recibos, secuencia de comandos, elecciones e historial; texto del recorrido y evento pendiente contra el catálogo identificado; resultado pendiente coherente con la última elección.
- `GameSession.fromSave`: entrada JSON validada para el visor. La restauración rechaza catálogos diferentes y builds desconocidas. La validación no escribe almacenamiento. También se valida el estado resultante de un comando antes de pedir su persistencia.
- `src/core/build.ts`: identificación única de build usada por sesión y manifiesto, `0.8.0-t2.2`.

Los valores internos del RNG original pueden superar 32 bits. Se conservan como enteros seguros de JavaScript, sin truncarlos ni reinicializarlos: hacerlo cambiaría las carreras existentes.

## Evidencia y reproducción

Compilación TypeScript 5.8.3 correcta. **54 pruebas pasan, cero fallos y cero omitidas**, con salida de proceso 0. Se ejecutaron conjuntamente `scripts/test-session.mjs` y `scripts/test-saves.mjs`. En un entorno con Node/npm: `npm run test:saves` compila y ejecuta ambas suites.

La evidencia queda en `analysis/2026-09-13/T2.2/`: `tests.tap`, `verification.json` y `build-manifest.json`. Los resultados esperados de migración se fijaron contra la copia compilada original de T0, antes de introducir los nuevos validadores; no se calcularon desde el código bajo prueba.

| Comprobación | Resultado y alcance |
|---|---|
| Formatos 2–8 | Siete casos comparados con su resultado original mediante SHA-256; historial, semillas y RNG existentes preservados |
| Versiones 3–8 | Ejemplos históricos suministrados con el motor |
| Versión 2 | Caso sintético derivado del ejemplo v3; falta un archivo auténtico v2 para ampliar la evidencia histórica |
| Continuidad tras migración | Versiones 2–7: 90 días, guardar/recargar, otros 90 días; resultado idéntico al flujo sin recarga |
| Datos inválidos | Campos ausentes, tipos incorrectos, fechas imposibles, estructura excesiva, inconsistencias de sesión y recibos alterados rechazados |
| Compatibilidad T2.1 | Escena y resultado pendientes preservados, entrada sin mutación y cero escrituras durante la carga |
| Regresión interactiva | 100 recargas, errores de persistencia y reintentos, concurrencia y carrera completa frente al simulador original |
| Navegador | T2.2 visible y misma escena pendiente; partida del autor conservada |

## Límites y siguiente pasada

La validación identifica corrupción estructural y varias contradicciones; no demuestra autenticidad ni reconstruye toda la simulación. Por ejemplo, eliminar una escena pendiente dejando un contenedor coherente con un avance vacío no se distingue solo por el esquema T2.1. No se recalcula el scheduler al cargar, porque eso consumiría azar y podría alterar la partida. La integridad de copias persistidas y recuperación tras interrupciones se abordarán en T2.3.

Los JSON históricos del motor se migran mediante `loadSave`; carecen del contenedor interactivo con escena pendiente y recibos. No se presentan como sesiones intercambiables del visor. Los identificadores históricos se conservan: la reconciliación narrativa pertenece a T5.1.

**Ajuste de secuencia:** el cierre T2.1 mencionaba importación junto con validación. T2.2 entrega el cargador validado; la interfaz para importar una copia y sustituir de forma recuperable la partida activa se integra en T2.3 con el almacenamiento transaccional. Descargar una copia todavía no permite importarla desde el visor. Este ajuste no añade pasadas ni acredita trabajo de T2.3.

No se han modificado escenas, probabilidades ni la lógica de las migraciones históricas. El atractivo narrativo y la integración PlayCanvas/Android conservan sus pasadas previstas. El porcentaje expresa entregables de ingeniería, no una valoración de diversión ni una garantía de que el producto esté listo para publicar.
