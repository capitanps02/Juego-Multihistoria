# Plan de ejecución por pasadas · revisión 17

**T1, T2.1, T2.2, T2.3, T2.4, T2.5, T3.1, T3.2, T3.3, T4.1, T4.2, T4.3, T4.4, T4.5 y T4.6 completadas. T3.4 conserva pendiente la evidencia física. T4.7/T4.8 se omiten por decisión de alcance. T5.1 está en curso: auditoría reproducible preparada, reconciliación semántica pendiente. Avance ganado: 33,51 %.**

Esta revisión sustituye la estimación anterior basada en disponibilidad humana. T1–T9 identifican etapas; T2.1, T2.2, etc. identifican mis pasadas ejecutables. Cada una contiene trabajo, comprobación y registro. Una pasada difícil se divide si lo exige la evidencia; no se cierra por haber consumido una respuesta.

Previsión inicial: **68 pasadas en total**, quince completadas; quedan **53**. Rango de trabajo previsto: **55–87**; reserva adicional de **14** pasadas para correcciones del alcance previsto. La base más reserva es 82; el rango y la reserva describen incertidumbre y no se suman automáticamente entre sí. No hay un máximo garantizado. Demo Android: diez pasadas contando T1, sujeta a acceso al dispositivo y herramientas.

La previsión tiene confianza limitada hasta implementar el primer lote. El dato observado hoy es una pasada de alcance con doce comparaciones, no doce escenas reparadas. La base divide las 388 escenas en cuatro lotes de 18–20 y 31 lotes posteriores, de hasta doce escenas. Añade trabajo separado para sesión, presentación, memoria, personajes, epílogos y verificación. Compartir infraestructura puede reducir lotes; dependencias nuevas o reescrituras pueden aumentarlos.

| Etapa | Pasadas base | Rango | Peso | Acumulado al cerrar | Estado |
|---|---:|---:|---:|---:|---|
| T1 · Alcance y trazabilidad piloto | 1 | 1–1 | 6 % | 6 % | Completada |
| T2 · Sesión y guardado | 5 | 4–6 | 11 % | 17 % | Completada |
| T3 · Demo PlayCanvas en Android | 4 | 3–6 | 11 % | 28 % | En curso: 3 de 4; 8,25 % ganado |
| T4 · Primer tramo y atractivo | 8 | 6–10 | 11 % | 39 % | En curso: 6 de 8; 8,26 % ganado |
| T5 · Carrera completa, memoria y epílogos | 38 | 32–48 | 33 % | 72 % | Pendiente |
| T6 · Alfa y balance | 4 | 3–5 | 11 % | 83 % | Pendiente |
| T7 · Beta Android | 3 | 2–4 | 8 % | 91 % | Pendiente |
| T8 · Publicación | 3 | 2–4 | 7 % | 98 % | Pendiente |
| T9 · Estabilización | 2 | 2–3 | 2 % | 100 % | Pendiente |

## Reglas para cumplir el plan

- El porcentaje se gana al cumplir el criterio de la subpasada. La distribución exacta está en el JSON; trabajar parcialmente no gana su peso completo.
- Mantengo los pesos de hito de T0 para conservar continuidad. Miden entrega del producto; una pasada de contenido y una de integración no tienen el mismo peso.
- Cada cierre informa: cambios, comprobaciones, defectos pendientes, porcentaje y siguiente pasada. Los criterios se fijan antes de implementar.
- Si una pasada requiere un subsistema no previsto, lo registro y divido el trabajo. Dos pasadas consecutivas sin cerrar su entrega o una previsión que crezca más del 20 % obligan a recalibrar con motivo explícito.
- Tras T2, T3 y el primer lote implementado de T4 reviso el número de pasadas restante. Los lotes solo se aceleran manteniendo evidencia de fidelidad y comportamiento.
- La revisión visual del autor se incorpora cuando llegue su interfaz. No se atribuye diversión a pruebas automáticas.
- Instalación física, participantes, cuenta/firma y revisión de tienda se registran como dependencias externas. Una espera no consume una pasada ni gana porcentaje. Los periodos reales exigidos para pruebas o estabilización conservan su duración.
- Antes de cualquier envío público no autorizado se deja la candidata concreta preparada para revisión. El trabajo técnico y los borradores continúan dentro del alcance.
- Este plan organiza la ejecución de la tarea; no crea una automatización ni supone trabajo entre intervenciones.

## Pasadas y criterios de cierre

### T1 · Alcance y trazabilidad piloto

- **T1 — Definir alcance, auditar piloto y recalibrar plan.** Alcance y contrato escritos, 12 fichas con reparación, 254 IDs inventariados y plan validado.

### T2 · Sesión y guardado

- **T2.1 — Base reproducible y GameSession. COMPLETADA (+2,2 %).** Build identificado; evento pendiente, consultas puras, revisión y comandos protegidos con pruebas.
- **T2.2 — Validación de guardados y migraciones. COMPLETADA (+2,2 %).** Rechazo de corrupción y casos de cada versión declarada compatible.
- **T2.3 — Persistencia transaccional y recuperación. COMPLETADA (+2,2 %).** 100 ciclos pendientes, interrupciones antes/después de commit y reintento sin doble efecto.
- **T2.4 — Ofertas y autoridad del jugador. COMPLETADA (+2,2 %).** Proponer, aceptar, rechazar o delegar sin firmas silenciosas.
- **T2.5 — Hitos de edad y gates fiables. COMPLETADA (+2,2 %).** Instantáneas históricas preservadas, gates con exit code fallido y regresión de integración.

### T3 · Demo PlayCanvas en Android

- **T3.1 — Adaptador web y escena de decisión. COMPLETADA (+2,75 %).** Escena, estado y resultado muestran solo datos conocidos; equivalencia con motor.
- **T3.2 — Presentación y continuidad. COMPLETADA (+2,75 %).** Texto largo, tacto, atrás, pausa y reanudación comprobados en navegador.
- **T3.3 — Empaquetado Android offline. COMPLETADA (+2,75 %).** APK compilado con recursos locales, firma verificada y guardado IndexedDB comprobado en emulador Android 15 en modo avión.
- **T3.4 — Ensayo en Android y decisión de presentación.** APK instalado, misma historia y medición de latencia/inicio en teléfono; resolver fallos del ensayo. Requiere evidencia externa.

### T4 · Primer tramo y atractivo

- **T4.1 — Cadena piloto de memoria y consecuencia diferida.** Creación, reaparición y cierre; NPC recuerda información que pudo conocer.
- **T4.2 — Lote 18–20 1: 12 escenas.** Fuente, acciones, gates y consecuencias específicos; pruebas dirigidas y continuidad.
- **T4.3 — Lote 18–20 2: 12 escenas.** Fuente, acciones, gates y consecuencias específicos; pruebas dirigidas y continuidad.
- **T4.4 — Lote 18–20 3: 12 escenas. COMPLETADA (+1,38 %).** Fuente, acciones, gates y consecuencias específicos; pruebas dirigidas y continuidad.
- **T4.5 — Lote 18–20 4: 8 escenas. COMPLETADA (+1,37 %).** Fuente, acciones, gates y consecuencias específicos; pruebas dirigidas y continuidad.
- **T4.6 — Ciclo de juego y tutorial. COMPLETADA (+1,37 %).** Pantallas esenciales y resumen de partido integrados; sin lectura de códigos internos.
- **T4.7 — Observación humana y mejora 1 (omitida).** Correcciones J01/J02 implementadas; se omite la validación externa por decisión de alcance.
- **T4.8 — Observación humana y mejora 2 (omitida).** No se ejecuta la ronda de participantes ni la recalibración basada en ella por decisión de alcance.

### T5 · Carrera completa, memoria y epílogos

- **T5.1 — Reconciliación completa e identidad del contenido (en curso).** Auditoría reproducible creada; identifica 87 IDs principales sin correspondencia aprobada y mantiene 134 condicionales como conteo no reconciliado hasta disponer de inventario canónico. No se crean equivalencias silenciosas.
- **T5.2 — Ciclo de vida de semillas.** Transiciones y consumidores/cierres con pruebas de repetición y caducidad.
- **T5.3 — Personajes y conocimiento.** Agenda, acceso, recuerdos y relaciones coherentes con acontecimientos.
- **T5.4 — Consecuencias diferidas entre tramos.** Promesas, cirugía, contratos y decisiones que sobreviven cambios de edad/club.
- **T5.5 — Lote 20–23 1: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.6 — Lote 20–23 2: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.7 — Lote 20–23 3: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.8 — Lote 20–23 4: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.9 — Lote 20–23 5: 3 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.10 — Lote 23–26 1: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.11 — Lote 23–26 2: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.12 — Lote 23–26 3: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.13 — Lote 23–26 4: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.14 — Lote 23–26 5: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.15 — Lote 26–30 1: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.16 — Lote 26–30 2: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.17 — Lote 26–30 3: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.18 — Lote 26–30 4: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.19 — Lote 26–30 5: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.20 — Lote 26–30 6: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.21 — Lote 26–30 7: 3 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.22 — Lote 30–34 1: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.23 — Lote 30–34 2: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.24 — Lote 30–34 3: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.25 — Lote 30–34 4: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.26 — Lote 30–34 5: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.27 — Lote 30–34 6: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.28 — Lote 30–34 7: 4 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.29 — Lote 34+ 1: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.30 — Lote 34+ 2: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.31 — Lote 34+ 3: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.32 — Lote 34+ 4: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.33 — Lote 34+ 5: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.34 — Lote 34+ 6: 12 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.35 — Lote 34+ 7: 10 escenas.** Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena.
- **T5.36 — Retirada y compatibilidad de familias.** Estados de cierre y combinaciones de finales sin contradicción.
- **T5.37 — Epílogos con hechos de la carrera.** Hitos relevantes redactados y trazables, con variantes de recuerdos y relaciones.
- **T5.38 — Auditoría cruzada de contenido completo.** 388 escenas revisadas, 210 semillas con destino y 20 NPC trazables; integración entre tramos.

### T6 · Alfa y balance

- **T6.1 — Perfiles semánticos y cobertura.** 15 perfiles seleccionan intención real; casos raros con estados dirigidos.
- **T6.2 — Simulación estratificada y diagnóstico.** Lote inicial para medir coste y hasta 10000 carreras en candidata; cobertura y distribución explícitas.
- **T6.3 — Corrección de balance y carreras largas.** Eliminar bloqueos, vacíos de oportunidades y estados imposibles reproducibles.
- **T6.4 — Validación narrativa de la alfa.** 20 epílogos auditados y contraste de rutas, densidad y efectos diferidos.

### T7 · Beta Android

- **T7.1 — Matriz de dispositivos e interrupción.** Tres teléfonos de distinta capacidad; actualización, modo avión y guardado. Requiere evidencia externa.
- **T7.2 — Rendimiento, accesibilidad y correcciones.** Límites medidos, texto ampliado, navegación y problemas detectados corregidos. Requiere evidencia externa.
- **T7.3 — Cierre de beta.** Cinco carreras humanas completas; cero incidencias críticas o altas abiertas. Requiere evidencia externa.

### T8 · Publicación

- **T8.1 — Candidata y ficha de tienda.** AAB firmado, capturas reales, clasificación y declaraciones coherentes.
- **T8.2 — Pruebas y preparación de envío.** Evidencia de pruebas exigibles, cuenta y firma listas; paquete concreto revisable. Requiere evidencia externa.
- **T8.3 — Revisión y disponibilidad.** Resolver observaciones y verificar disponibilidad real para público acordado. Requiere evidencia externa.

### T9 · Estabilización

- **T9.1 — Diagnóstico de producción.** Revisar evidencia real del periodo de observación de 14 días y resolver incidencias. Requiere evidencia externa.
- **T9.2 — Cierre y mantenimiento.** Actualización con saves preservados, cero fallos graves y guía de producción/recuperación. Requiere evidencia externa.

## Cierre T1

Completados: alcance Android y flujo funcional; contrato de sesión/persistencia; doce escenas contrastadas con el canon y reparación definida; inventario de los 254 IDs principales; línea base por pasadas y criterios. Los tres posibles alias del piloto siguen pendientes de decisión técnica con migración. No se considera terminada ninguna reparación de contenido por haber documentado el defecto.

[Alcance y contrato](</Users/capitanps/Downloads/multihistoria-engine-v0.8/project/T1_ALCANCE_Y_CONTRATO.md>) · [Doce fichas de auditoría](</Users/capitanps/Downloads/multihistoria-engine-v0.8/project/T1_AUDITORIA_12_ESCENAS.md>) · [Seguimiento estructurado](</Users/capitanps/Downloads/multihistoria-engine-v0.8/analysis/2026-09-11/plan-seguimiento.json>)

## Cierre T2.1

Sesión interactiva, evento y resultado pendientes, consultas puras, comandos protegidos y build identificada. Dieciséis pruebas automatizadas pasan; visor local comprobado en navegador. El avance es 8,2 %. El visor adicional no acredita la integración PlayCanvas ni Android de T3.

[Cierre y evidencia](T2_1_CIERRE.md) · [Dónde y cómo probar](COMO_PROBAR_EL_JUEGO.md).

## Cierre T2.2

Guardados validados antes de migrar, compatibilidad de los formatos 2–8 comprobada con siete casos y sesiones T2.1 conservadas. Cincuenta y cuatro pruebas pasan. El caso v2 es sintético; v3–v8 proceden de ejemplos históricos. Avance: 10,4 %. La importación desde la interfaz se completa con recuperación transaccional en T2.3.

[Cierre y evidencia](T2_2_CIERRE.md) · [Dónde y cómo probar](COMO_PROBAR_EL_JUEGO.md).

## Cambio de orden · 13–14 de septiembre

El autor aporta el handoff de interfaz y pide integrar el juego en la escena PlayCanvas 2593315. Se adelanta T3.1 sobre T2.1/T2.2. La UI y el paquete pasan 57 pruebas. El 14 de septiembre se verifican Upload, Script en Root y Launch con elección, recarga e historial conservados. T3.1 queda completada y el avance sube a 13,15 %. La importación con copia anterior es provisional y no cierra T2.3. Se mantiene la previsión base y se vuelve a T2.3 tras esta integración.

[Estado de integración](T3_1_INTEGRACION_PLAYCANVAS.md).

## T2.3 en curso · 14 de septiembre

Endurecido el adaptador actual: copia anterior en cada cambio, recuperación explícita, creación e importación protegidas por el mismo bloqueo y reintento de escritura ya confirmada. Actualización subida a PlayCanvas; recupera la partida online del autor (16 de julio, cuatro decisiones) sin modificarla. Falta IndexedDB conforme al contrato T1; no se gana porcentaje por esta entrega parcial. [Trabajo y evidencia](T2_3_PERSISTENCIA.md).

### T2.3 · 15 de septiembre

IndexedDB implementado y comprobado: 100 ciclos, 300 abortos reales, 100 confirmaciones perdidas simuladas, seis casos adicionales y prueba de dos pestañas. La partida local del autor se migró conservando fecha, escena y decisión. Falta exclusivamente actualizar/verificar esta entrega en PlayCanvas, pendiente de conexión de Chrome. Se mantiene el 13,15 % hasta cerrar esa entrega.

### Cierre T2.3 · 15 de septiembre

Conexión recuperada, paquete subido y guardado IndexedDB verificado en Launch; la recarga conserva 16 de julio y cuatro decisiones. Se resuelve el bloqueo de las notas anteriores. Avance: 15,35 %, cinco pasadas completadas, 63 pendientes. Siguiente: T2.4. [Cierre y evidencia](T2_3_PERSISTENCIA.md).

### Cierre T2.4 · 15 de septiembre

Las renovaciones, movimientos de mercado, continuidad de cesiones y la adaptación al entrar en la etapa profesional generan ahora una oferta pendiente. La oferta contiene condiciones comparables (club, inscripción/propiedad, categoría, salario, duración y cláusula), pero no modifica el estado hasta una respuesta explícita. Aceptar aplica las condiciones juntas; rechazar conserva el contrato; delegar autoriza únicamente esa oferta y solo acepta si no baja salario ni categoría y mantiene al menos 12 meses. La autoridad no se hereda a la siguiente oferta.

Se añadió el comando de sesión `offer`, historial auditable y validación de condiciones/autorización. Las vistas solo reciben condiciones públicas, nunca los cálculos internos de prestigio, ruta o probabilidad. Los fichajes narrativos también actualizan club, inscripción, propiedad y contexto de forma coherente.

Verificación: 66 pruebas de sesión, guardados, paquete PlayCanvas y ofertas pasan; la matriz IndexedDB de T2.3 sigue pasando (100 ciclos; 205 s); nueve pruebas dirigidas cubren migración v1, aceptación/rechazo/delegación, doble pulsación, fallo de escritura, transferencias, corrupción y propuestas del mundo. La página `web/qa-offers.html` pasa las 12 combinaciones (tres respuestas × cuatro puntos de interrupción), con reintento, recarga y recibo idempotente. La interfaz aislada muestra las condiciones y el criterio de delegación antes de responder.

Avance: 17,55 %. Siguiente: T2.5.

### Cierre T2.5 · 15 de septiembre

Los cruces 20/23/26/30/34 registran instantáneas históricas inmutables antes de cada adaptación de tramo. La interfaz las muestra en Carrera y los guardados las conservan. El gate reproducible comprueba ocho semillas, exige los cinco hitos y devuelve código 2 cuando falta uno. Regresión: 60/60 pruebas correctas; gate positivo 8/8; caso negativo correcto. Avance: 19,75 %. Siguiente: T3.2, presentación y continuidad. [Cierre y evidencia](T2_5_CIERRE.md).

### Cierre T3.2 · 15 de septiembre

La interfaz web conserva la escena pendiente y el resultado al recargar, añade rutas internas a la historia del navegador y hace que Atrás/Escape cierre la escena o vuelva a una vista anterior sin abandonar la partida. La barra superior incorpora pausa y reanudación accesibles: mientras está pausada las acciones que mutan la sesión quedan bloqueadas y el estado se anuncia con `role=status`.

El panel cinematográfico contiene texto largo con desplazamiento propio y ajuste de palabras; las respuestas permanecen accesibles después de recorrer el relato. Los botones de elección miden al menos 62 px en el viewport móvil de 390 × 844, el control de pausa 46 px, se usa `touch-action: manipulation`, hay foco visible y se conserva la regla `prefers-reduced-motion`. Se añadió una página aislada determinista para repetir la comprobación sin modificar el catálogo de producción.

Verificación: suite combinada de sesión, guardado, PlayCanvas, T2.5 y T3.2 (62/62), con la línea base v08 actualizada al hash normalizado de su fixture con hitos de edad. En navegador local se comprobó texto de 6.401 caracteres, desplazamiento 3.743 px frente a 453 px visibles, pausa/reanudación, Atrás, Escape, recarga con escena pendiente, resultado y cero errores de consola. Evidencia: [prueba de navegador](../analysis/2026-09-15/T3.2-browser.json), [regresión TAP](../analysis/2026-09-15/T3.2-regression.tap), [cierre técnico](T3_2_CIERRE.md).

### Cierre T3.3 · 15 de septiembre

El paquete Android offline está preparado como una aplicación WebView con 144 archivos locales y 10.278.171 bytes. El motor compilado, la interfaz y la persistencia IndexedDB se copian bajo `android/app/src/main/assets/`; las imágenes se embeben como `data:`. El manifiesto calcula SHA-256 de cada recurso y la actividad no declara Internet ni permite navegación externa. Las cuatro pruebas de auditoría pasan.

Revisión posterior: instalados Java 17, Gradle 8.9 y SDK API 35 en el proyecto. APK compilado (8.528.829 bytes), firma v1/v2 verificada y 144 hashes comprobados dentro del APK. En un emulador Android 15, con modo avión activo, la interfaz registró una elección, guardó en IndexedDB y recuperó exactamente el resultado tras detener y reabrir el proceso. Avance: 25,25 %. Evidencia: [cierre T3.3](T3_3_ANDROID_OFFLINE.md), [paquete](../analysis/2026-09-15/T3.3-offline-package.json), [prueba Android](../analysis/2026-09-15/T3.3-android-runtime.json).

### T3.4 · preparación técnica · 15 de septiembre

El APK recompilado incorpora selector nativo de importación (`ACTION_OPEN_DOCUMENT`) y exportación JSON (`ACTION_CREATE_DOCUMENT`) mediante `AndroidBridge`. La prueba instrumentada verifica el puente JavaScript, origen seguro, IndexedDB y recuperación exacta tras detener el proceso en modo avión. En el emulador Android 15, `am start -W` registró 3.350 ms en frío y 0 ms al entregar el arranque a la instancia caliente; la sonda DOM registró 7.317 ms (create) y 6.894 ms (resume). Evidencia: [medición T3.4](../analysis/2026-09-15/T3.4-android-runtime.json), [sonda](../scripts/test-android-t34.mjs).

El criterio técnico queda preparado, pero T3.4 conserva estado abierto porque requiere evidencia externa en un teléfono físico y comprobar visualmente los selectores del fabricante. La checklist queda en [ensayo Android](T3_4_ANDROID.md). Avance: 25,25 %. Siguiente: completar ensayo físico T3.4.

### Cierre T4.1 · 15 de septiembre

La cadena piloto de Nano ya crea memoria en la primera pretemporada, reaparece solo cuando el jugador ha intervenido sin permiso y se cierra con una respuesta explícita. La prueba recarga el estado JSON entre fases, conserva el NPC que pudo conocer la información y rechaza el callback cuando no existe memoria. Regresión: 58/58 y gate v0.8 correctos. Evidencia: [cierre T4.1](T4_1_CIERRE.md), [prueba dirigida](../scripts/test-t41.mjs).

Avance: 26,63 %. Siguiente: T4.2, lote 18–20 1.

### Cierre T4.2 · 15 de septiembre

El primer lote de 12 escenas 18–20 queda acreditado con decisiones y consecuencias específicas, contexto visible e incierto, ventanas/gates o memoria contextual y NPCs declarados cuando corresponde. La prueba dirigida ejecuta todas las elecciones y comprueba historial y mensajes. Regresión: 59/59 y gate v0.8 correctos. Evidencia: [cierre T4.2](T4_2_CIERRE.md), [prueba dirigida](../scripts/test-t42.mjs).

Avance: 28,01 %. Siguiente: T4.3, lote 18–20 2.

### Cierre T4.3 · 15 de septiembre

Los doce callbacks del segundo lote 18–20 quedan sujetos a sus gates de estado, memoria o mercado; sin contexto no se programan. Con contexto, el scheduler los selecciona y todas sus respuestas dejan consecuencias e historial específicos. Regresión: 59/59 y gate v0.8 correctos. Evidencia: [cierre T4.3](T4_3_CIERRE.md), [prueba dirigida](../scripts/test-t43.mjs).

Avance: 29,39 %. Siguiente: T4.4, lote 18–20 3.

### Cierre T4.4 · 15 de septiembre

El tercer lote técnico del tramo 18–20 queda acreditado con doce escenas principales. La prueba confirma cuerpos contextuales, información visible e incierta, disparadores verificables, NPCs, acciones específicas y consecuencias con mensaje; también verifica que los gates bloqueados ocultan cada escena y que el scheduler la selecciona con el contexto correcto.

Regresión: 61/61 pruebas y gate v0.8 correctos. Evidencia: [cierre T4.4](T4_4_CIERRE.md), [prueba dirigida](../scripts/test-t44.mjs).

Avance: 30,77 %. Siguiente: T4.5, lote 18–20 4.

### Cierre T4.5 · 15 de septiembre

El cuarto lote completa las ocho escenas restantes del tramo 18–20: seis cierres principales y los callbacks de memoria/retorno. La prueba bloquea los gates sin contexto, selecciona cada escena con estado satisfecho y ejecuta todas las acciones con historial, NPCs y consecuencias verificables.

Regresión: 62/62 pruebas y gate v0.8 correctos. Evidencia: [cierre T4.5](T4_5_CIERRE.md), [prueba dirigida](../scripts/test-t45.mjs).

Avance: 32,14 %. Siguiente: T4.6, ciclo de juego y tutorial.

### Cierre T4.6 · 15 de septiembre

El ciclo visible queda conectado entre las seis vistas principales. Inicio incorpora un tutorial breve y los resultados deportivos muestran fecha, partidos disputados, forma y estado físico; la interfaz no lee ni presenta códigos internos.

Regresión: 63/63 pruebas y gate v0.8 correctos. Evidencia: [cierre T4.6](T4_6_CIERRE.md), [prueba dirigida](../scripts/test-t46.mjs).

Avance: 33,51 %. Siguiente: T4.7, observación humana y mejora 1.
