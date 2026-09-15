# T2.3 · Persistencia y recuperación

Estado: en curso. Avance ganado del proyecto: 13,15 %. No se acredita todavía esta pasada.

## Mejora del adaptador existente

`web/save-store.js` concentra la validación, comparación de la copia leída, bloqueo Web Locks y escritura. Antes de sustituir el estado activo conserva el anterior validado. Estado, recibo del comando y resultado siguen contenidos en un único JSON. Si la copia activa está corrupta, una recuperación explícita puede sustituirla sin destruir la copia anterior válida. Nunca se retrocede automáticamente a una decisión anterior.

La creación de una carrera nueva ya comprueba y sustituye el estado dentro del mismo bloqueo. Antes había dos secciones separadas y otra pestaña podía intercalarse. Importación y creación reutilizan el mismo adaptador. Un reintento de una escritura ya confirmada reconoce el mismo JSON; GameSession reconoce el mismo identificador de comando y evita resolverlo dos veces.

La clave y formato de las partidas anteriores se conservan. No hay migración ni borrado de datos del autor. La copia anterior ahora corresponde al último cambio guardado y se va renovando; para conservar una carrera indefinidamente debe descargarse una exportación.

## Evidencia y límites

La prueba aislada del navegador recuperó el resultado de La lista de 26 tras confirmar su lectura, restaurar la copia anterior y recargar. Las 57 pruebas anteriores y las tres nuevas pasan: **60/60**, cero fallos. Evidencias en `analysis/2026-09-14/T2.3/`. La matriz nueva superó 100 decisiones con cuatro puntos de interrupción por decisión: antes y después de escribir copia anterior, y antes y después de escribir activa. Comprueba estado serializado completo, RNG y reintento sin duplicación. También prueba reemplazos concurrentes, JSON inválido, fallo de escritura y recuperación desde activa corrupta.

Una primera ejecución detectó una diferencia entre una propiedad opcional con valor undefined y su ausencia tras serializar a JSON; se ajustó la comparación al formato persistido. No se eliminan campos serializados de la comprobación.

Las interrupciones se inyectan en el adaptador; no equivalen a apagar físicamente el teléfono ni prueban la sincronización del almacenamiento a disco. La integridad es validación estructural y de coherencia de T2.2, no autenticidad criptográfica. El almacenamiento del navegador puede fallar por cuota; no se borra la partida para liberar espacio. [Contrato de Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html).

## Pendiente para cerrar

El contrato T1 exige IndexedDB para la persistencia web. Este endurecimiento de localStorage no satisface esa condición ni se presenta como transacción de varias claves. Faltan el adaptador IndexedDB, migración conservando la partida existente y pruebas reales de abortar/reabrir transacciones. También debe medirse el coste en una carrera larga antes de aprobar el guardado para Android.
