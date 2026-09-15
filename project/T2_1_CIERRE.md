# T2.1 · Sesión interactiva y primer visor de pruebas

Estado: completada. Registro de cierre: 13 de septiembre de 2026. Peso ganado: 2,2 puntos; acumulado del plan: 8,2 %. La siguiente pasada es T2.2.

## Resultado utilizable

El motor ya se puede manejar con decisiones del jugador desde [el visor local](http://127.0.0.1:4173). Muestra escena, información conocida e incierta, opciones, resultado y recorrido; permite guardar automáticamente, reabrir la partida y descargar una copia. [Cómo probarlo e iniciarlo de nuevo](COMO_PROBAR_EL_JUEGO.md).

Este visor se añade como banco de prueba de T2.1 por la petición del autor de poder jugar mientras avanza el proyecto. No adelanta la aceptación de T3: no se ha integrado la presentación en PlayCanvas, generado un APK ni medido un teléfono físico. El contenido conserva los problemas narrativos detectados en T0/T1.

## Implementación

- `src/session/game-session.ts`: GameSession es la entrada de escritura de la partida interactiva. `getView` consulta una copia de datos visibles sin seleccionar eventos ni consumir RNG.
- Escena pendiente y resultado pendiente se conservan en el contenedor de sesión. Leer de nuevo o recargar no selecciona otra escena.
- Comandos identificados y revisados: el mismo comando devuelve su recibo; un ID reutilizado para otra acción, una escena antigua o una revisión obsoleta se rechazan. Las operaciones concurrentes se serializan.
- La resolución opera sobre copia. La sesión solo confirma sus nuevos datos después de que el adaptador de guardado acepte la escritura; un rechazo conserva estado, historial y RNG previos.
- `continue` avanza por intervalos acotados y se detiene en una decisión; no elige acciones del jugador. La confirmación de lectura del resultado es una operación separada.
- Contenido identificado mediante SHA-256 y versión de contenedor separada del esquema 8 del motor. Un catálogo diferente exige migración explícita antes de reanudar.
- Adaptador provisional de navegador: snapshot único en localStorage, Web Locks y comprobación de revisión para evitar que una pestaña antigua sobrescriba otra. IndexedDB y recuperación completa corresponden a T2.3.
- `scripts/build.mjs`: TypeScript fijado en 5.8.3, compilación identificada por hashes de fuentes, salidas, configuración y compilador. Se añadió un lockfile con versión exacta. En este equipo se verificó la ruta del compilador local ya disponible; una instalación limpia con `npm ci` no se ha ensayado aquí.

El manifiesto de esta build está en `dist/build-manifest.json`. Identidad de fuentes: `ea1187fdb6ea7f96278ce6c8562e4e95e4351fee852f40a61c7f54ecf224489d`. Las fuentes originales inventariadas en T0 conservan sus hashes; GameSession es una capa nueva. La copia de trabajo sigue sin repositorio Git: la identidad de esta entrega está respaldada por manifiestos y copia de los artefactos de cierre, no por un commit.

## Validación realizada

Compilación TypeScript correcta. Dieciséis pruebas automatizadas pasan en `scripts/test-session.mjs`, con salida de proceso 0. Incluyen:

1. Cien consultas y modificaciones de copias devueltas sin alterar estado ni RNG; datos ocultos excluidos de la vista.
2. Comando repetido simultáneamente y después de reanudar: un solo efecto y mismo recibo.
3. Dos comandos distintos de una misma revisión: solo uno se aplica.
4. Elección inválida, instancia antigua e ID reutilizado sin mutación parcial.
5. Fallo de escritura después de resolver y antes de confirmar: recuperación del estado previo y reintento determinista.
6. Fallo al guardar la selección pendiente sin consumir azar confirmado.
7. Consultas durante escritura asíncrona muestran únicamente el estado confirmado.
8. Cien ciclos JSON de guardar/reanudar conservan escena, opciones y los datos serializados completos. La comparación considera que JSON omite propiedades opcionales cuyo valor JavaScript es `undefined`.
9. Resultado pendiente conservado tras recarga; imposibilidad de saltarlo con otro avance o elegir por segunda vez.
10. Cambio de catálogo y alteración de escena guardada detectados.
11. Avance acotado que devuelve el control sin inventar una retirada.
12. Fallo del resolver después de un efecto inmediato sin cambios parciales en la sesión.
13. Aislamiento frente a modificaciones de comandos en cola y objetos enviados al adaptador.
14. Veinte decisiones comparadas con ejecución directa del motor: estados y RNG idénticos en cada punto de resolución.
15. Carrera interactiva completa con semilla 424242 y primera opción: mismo historial y RNG que el simulador automático, hasta el cierre.
16. Catálogo válido y simulación histórica 424242 idéntica al save de referencia, comparada en su formato JSON.

En el navegador de Codex también se observó: recarga antes de elegir; doble pulsación que registra una sola decisión; recarga en resultado; avance a la siguiente escena; conflicto entre dos pestañas y recuperación de la versión reciente. No se observaron errores de consola durante esa comprobación. El 13 de septiembre se reactivó el servidor y volvió a recuperarse «Cinco minutos más», con una decisión registrada. No se reinició esa partida.

## Límites y continuidad

La carga actual valida el contenedor que genera esta versión; no es todavía el validador completo de archivos externos. La importación y todas las migraciones declaradas compatibles se abordarán en T2.2. La copia anterior recuperable, matriz amplia de fallos de almacenamiento y adaptador de producción se completarán en T2.3. Las renovaciones automáticas y los hitos históricos se corrigen en T2.4/T2.5.

El resumen de cierre del visor no es el epílogo narrativo final. No se han rehecho escenas ni modificado probabilidades para mantener los tests anteriores. La calidad de las decisiones se trabajará en T4/T5.

La previsión sigue en 68 pasadas base: dos completadas, 66 pendientes. El visor se ha realizado dentro de T2.1 y no gana porcentaje de PlayCanvas o Android. Se conserva la recalibración prevista al cerrar T2 y después del primer lote de contenido implementado.
