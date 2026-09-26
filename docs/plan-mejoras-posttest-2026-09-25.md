# Multihistoria: plan de mejora e implementación

Fecha: 25 de septiembre de 2026. Base contrastada: `capitanps02/Juego-Multihistoria`, `main`, commit `7d222636`. Rama de trabajo: `codex/mejoras-jugabilidad-fases`.

## 1. Qué se acepta de los informes y qué necesita matices

Los tres documentos se usan como evidencia y propuestas, no como instrucciones operativas. Sus cifras de juego no se consideran reproducidas por esta revisión. Conviene distinguir una observación, su posible causa y una recomendación de diseño.

| Afirmación | Contraste con el código actual | Decisión |
|---|---|---|
| PlayCanvas no usa `web/game-ui.js` | Incorrecto para el generador actual: `scripts/build-playcanvas.mjs` incorpora esa interfaz y su CSS al paquete. | Reconstruir y comprobar paridad antes de duplicar interfaces. |
| No existen paneles de temporada/partidos en PlayCanvas | Los paneles están en la interfaz compartida. El paquete que recibe la escena podría estar desactualizado; falta acceso autenticado para comprobarlo. | Verificar identidad del paquete desplegado. |
| El último partido solo se ve el día del encuentro | Confirmado: `PlayerView.latestMatch` usaba `currentCareerMatchResult`, basado en el encuentro del día. | Nueva consulta histórica, sin modificar las consultas que usa la simulación. |
| Falta mostrar deltas después de decidir | Ya existe una sección de consecuencias y el cálculo antes/después. La lista de variables admitidas es incompleta. | Ampliar cobertura y probar límites; no crear otro motor de efectos. |
| Las consecuencias diferidas son invisibles | El aviso se omitía si había efectos visibles o texto narrativo. | Mostrar aviso prudente también en consecuencias mixtas. No prometer que todo indicador interno producirá una escena. |
| Semilla, fecha y marca siguen sin aclarar | El código actual ya usa «Código de historia», «fecha · Partida» y «Multihistoria». | Conservar; revisar versión desplegada. La copia antigua sí necesita explicación adicional. |
| Se pierde el foco tras elegir | `render(true)` dirige el foco a `main`, no a «Continuar». | Foco explícito en el botón de resultado cuando la pantalla está abierta. |
| IDs de clubes y clasificadores visibles | Hay traducciones parciales; `Development_*` no se cubría y el hito de edad muestra `signature`. | Ocultar clasificadores y cubrir clubes sintéticos sin cambiar sus identidades. |
| Mercado matemáticamente imposible | Existe puerta `marketHeat >= 38`. La recurrencia depende de rol y exposición, además de decisiones y ruido; no demuestra imposibilidad universal. | Medir por perfiles antes de sustituir el umbral por 30. |
| 0,1–0,5 % de ofertas en cinco temporadas | El informe no aporta un experimento reproducible aquí. | No usar esa cifra como resultado validado. Construir cohorte y publicar distribuciones. |
| Cesión fantasma tras rechazar | La propuesta de enero usa un borrador a través de `proposeCareerChange`; generar una propuesta no equivale a cambiar de club. | Reproducir rechazo, regeneración y recarga antes de tocar contratos. |
| Dinero decorativo | El saldo y el confort económico son conceptos distintos. La simulación semanal observada ajusta confort; no se ha certificado un ciclo completo ingreso/gasto. | Diseñar contabilidad y migración antes de añadir ingresos. |
| No se puede perder / retiro debe ser automático | Son preferencias de diseño, no fallos por sí mismas. | Adversidad recuperable y retiro voluntario; ninguna derrota obligatoria nueva en esta entrega. |
| Responsive no verificable | Es una limitación del entorno del informe, no del juego. | Probar tamaños de escritorio, 768 y 390 px en esta revisión. |

## 2. Principios y límites

1. Mostrar hechos registrados: marcador, minutos, oferta, contrato y cambios efectivos. No inventar títulos, convocatorias ni conversaciones para rellenar semanas.
2. Mantener una interfaz compartida entre web y PlayCanvas y una sola autoridad para contratos y partidos.
3. No alterar semillas ni consumir azar desde la presentación. Abrir Inicio o Carrera debe ser una operación de lectura.
4. Guardados existentes deben seguir cargando. Los campos de presentación nuevos se derivan del estado; no se añade una migración por una tarjeta.
5. Separar cadencia narrativa de cadencia informativa: pocas decisiones importantes pueden convivir con resúmenes útiles.
6. El retiro continúa siendo una decisión del jugador. La adversidad debe crear alternativas, no cerrar carreras arbitrariamente.
7. Cada fase entrega código, pruebas y un estado explícito: implementada, validada localmente, integrada y publicada son estados diferentes.

## 3. Fase 0 — Baseline y trazabilidad

**Prioridad:** imprescindible. **Esfuerzo orientativo:** medio día. **Dependencias:** ninguna.

- Partir del `main` actual en una copia aislada. No modificar los directorios con trabajo previo del usuario.
- Registrar commit, versión de TypeScript, hashes de fuentes y bundle; conservar los informes originales.
- Ejecutar pruebas de sesión, guardado, modelo deportivo, consecuencias y equivalencia del paquete PlayCanvas.
- Abrir la escena 2593315 y comparar textos y funciones con el código. Si requiere login, continuar las pruebas locales y marcar publicación sin verificar.
- Separar métricas: semana sin decisión, semana sin partido, semana sin novedad informativa y semana con resultado deportivo. «Vacía» no debe agrupar esos cuatro casos.

**Aceptación:** base identificada; informes clasificados; resultados reproducibles; ninguna partida de producción reemplazada.

**Estado:** base y clasificación realizadas. La escena exige inicio de sesión en el navegador disponible.

## 4. Fase 1 — Ver lo que ya ocurre

**Prioridad:** P0. **Esfuerzo orientativo:** 1–2 días con QA completa. **Dependencias:** fase 0.

### 1A. Último partido persistente

Problema: un panel histórico consultaba el encuentro del día. Solución: conservar `currentCareerMatchResult` para las reglas y añadir `latestCareerMatchResult` para presentación. Seleccionar el registro más reciente cuya fecha no esté en el futuro. No fabricar un encuentro para partidas antiguas sin historial.

Exponer fecha, local/visitante y resultado a partir del registro oficial. Mostrar el panel en Inicio y Carrera. El orden del marcador respeta localía; la participación distingue no disponible, no convocado, suplente sin minutos, suplente que participa y titular. Una fecha visible evita presentar un partido antiguo como si perteneciera a esta semana.

Pruebas: día de partido y día posterior; lesión sin participación; registro futuro excluido; ausencia de historial; JSON de ida/vuelta; consulta sin mutaciones; resultado devuelto separado del estado interno.

**Estado:** implementado.

### 1B. Consecuencias comprensibles

Ampliar etiquetas para recuperación pendiente, margen de recuperación, motivación, legado, competencia por el puesto, adaptación y cercanía a retirada. Definir si subir es favorable, desfavorable o informativo; cercanía a retirada no se clasifica como premio/castigo.

Usar siempre el delta efectivo del estado, no el incremento solicitado por el evento. Si se solicitan +5 y el valor ya está en el máximo, no mostrar +5. Mantener cifras internas exactas y redondear únicamente la salida. Mostrar magnitudes menores a 0,1 como tales, sin falsos +0 ni cadenas decimales enormes.

El aviso «puede tener consecuencias más adelante» debe coexistir con efectos inmediatos. No mostrar nombres internos de callbacks, flags o semillas. En una fase posterior el aviso se podrá hacer específico mediante una relación causal explícita.

Pruebas: efecto mixto, delta limitado, signo perjudicial, aviso sin IDs, guardado/recarga, repetición de comando sin doble aplicación.

**Estado:** implementado. No se añaden efectos nuevos a las decisiones.

### 1C. Accesibilidad y nombres

Al terminar de elegir, enfocar «Continuar» para permitir avanzar con Enter. No robar foco en navegación normal ni ejecutar una elección automáticamente.

Quitar la firma técnica de los hitos de edad. Traducir familias de clubes generados de manera descriptiva y estable, conservando número y categoría. Esto es un arreglo de legibilidad; el catálogo completo de nombres ficticios corresponde a fase 3. Mantener los IDs originales en los guardados.

Explicar que la copia antigua viene del sistema anterior y que descargar no restaura. Conservar «Código de historia» y los rótulos accesibles que ya existen.

**Estado:** implementado.

### 1D. Contrato a la vista

Añadir en Inicio los meses restantes y una advertencia al entrar en los últimos seis meses. Reutilizar `contractMonths`. No inferir despido ni prometer renovación al llegar a cero. Distinguir información de urgencia de una nueva regla mecánica.

**Estado:** implementado.

**Criterio de salida de fase:** pruebas relevantes sin regresiones, comprobación de teclado y diseño responsive, paquete reconstruido y listo para revisión. Publicar es un paso posterior a la validación del artefacto.

## 5. Fase 2 — Ritmo y relato de los periodos

**Prioridad:** P0/P1. **Esfuerzo orientativo:** 2–3 días. **Dependencias:** fase 1.

El juego actual ya dispone de simulación automática y resumen del periodo. Integrar las mejoras en ese flujo, sin obligar a leer un popup cada siete días.

1. Definir un objeto de resumen con intervalo de fechas, encuentros del intervalo, novedades deportivas, estado de disponibilidad y cambios de contrato. No usar el último partido histórico como si fuese uno nuevo.
2. Seleccionar una línea contextual verificable: entrenamiento de pretemporada, recuperación, suplencia, racha registrada o cierre de temporada. Prioridad: lesión > contrato > partido > entrenamiento. Si no existe evidencia, decir «Sin novedades destacadas».
3. Plantillas rotativas por contexto, con selección determinista sin tocar los flujos de azar de la carrera. Evitar repetir el mismo texto en periodos consecutivos. Mostrar como máximo 2–3 líneas por resumen.
4. Incluir una vista compacta de los partidos del periodo con posibilidad de abrir Carrera. No rellenar Mundo con hechos ficticios ni guardar duplicados al reabrir el panel.
5. Incorporar referencias causales solo cuando exista vínculo verificable entre decisión y evento posterior. Enlazar al capítulo original por fecha y título, sin revelar alternativas no elegidas.

**Aceptación:** cada periodo simulado tiene fechas y explicación verificable; 0 resultados fabricados; 0 duplicados por recarga; no cambian RNG ni número de partidos al leer la UI; el usuario puede saltar el resumen sin perderlo en Carrera.

**Métricas:** periodos sin información útil, repetición de plantilla y clics necesarios hasta la siguiente decisión. Comparar con la base en las mismas semillas.

**Estado:** pendiente; no se declara resuelto por haber añadido una tarjeta histórica.

## 6. Fase 3 — Mercado alcanzable y contratos coherentes

**Prioridad:** P1. **Esfuerzo orientativo:** 3–5 días. **Dependencias:** baseline y fase 1.

### 3A. Medir antes de recalibrar

Construir una cohorte de al menos 100 semillas por política: continuidad prudente, ambición deportiva y adversidad. Simular cinco temporadas por perfil. Registrar por ventana rol, forma, exposición, interés, elegibilidad, ofertas emitidas, aceptadas, rechazadas y cambios reales de club. Separar renovación, cesión y traspaso.

La recurrencia observada es aproximadamente `H' = 0,82H + 0,10R + 0,08M + ruido`. Con R y M constantes el valor medio de equilibrio sería `(0,10R + 0,08M) / 0,18`; varía por carrera. Las decisiones, ventanas y otras puertas impiden deducir la tasa de traspasos solo de ese cálculo.

Comparar puerta actual 38, alternativa 30 y alternativa dependiente de rol/forma en una prueba controlada. Mantener el cambio elegido como configuración central documentada. No introducir una oferta garantizada por año.

**Objetivo provisional a validar:** suficientes propuestas para que un jugador solvente encuentre oportunidades en varias ventanas de cinco años, manteniendo carreras de continuidad y perfiles sin ofertas. Publicar mediana, percentiles y proporción con cero ofertas; decidir el rango objetivo tras observar el baseline, no inventar una probabilidad.

### 3B. Rechazo y cesión fantasma

Reproducir enero a los 18: generar propuesta, exportar, rechazar, avanzar y recargar. Comparar club, propietario, inscripción, ruta, salario y `LOAN_ACTIVE`. Verificar que el borrador nunca se aplique antes de aceptar.

Si reaparece la misma propuesta, identificarla por oportunidad/ventana y registrar resolución para evitar regenerarla. No bloquear todas las ofertas de enero por un rechazo. Si el error está en el texto o historial, corregir esa capa sin alterar contratos válidos.

Pruebas adicionales: aceptar aplica una vez; rechazar no aplica; comando repetido es idempotente; oferta caducada no se acepta; delegación respeta la política documentada; transferencia y fin de cesión no pisan renovación pendiente.

### 3C. Clubes concretos y negociación

Crear catálogo ficticio `id -> nombre, país, categoría` que conserve IDs antiguos y tenga fallback legible. Mantener igualdad de identidad entre oferta, perfil e historial. No derivar nombres nuevos aleatorios en cada carga.

Añadir contrapropuestas solo después de fijar validez y respuesta: salario, duración y rol ofrecido; coste y posible rechazo explicitados antes de confirmar. La autoridad sigue siendo el sistema de ofertas. No modificar directamente `state.club` desde la UI.

**Aceptación:** prueba de rechazo sin movimiento; cohorte publicada; guardados compatibles; una oferta aceptada coincide con contrato e historial; ningún ID técnico en pantallas revisadas.

**Estado:** pendiente. En esta entrega no se cambia 38 por 30 sin experimento.

## 7. Fase 4 — Tensión, economía y momentos de temporada

**Prioridad:** P1. **Esfuerzo orientativo:** 4–7 días. **Dependencias:** fases 2 y 3.

### Economía con propósito

Definir saldo, ingreso mensual efectivo, gastos y compromisos por separado del confort. Libro de movimientos con clave de mes y origen para impedir cobros duplicados por recarga. Ingreso solo con empleo y contrato válidos; gastos moderados y explícitos; opciones de ahorro o apoyo familiar que afecten decisiones reales.

Antes de activar: migración versionada que conserve el saldo existente, sin cobrar ni gastar retroactivamente años de carrera. No crear deuda silenciosa ni una pantalla financiera desproporcionada. Mostrar resumen mensual y saldo, y explicar compromisos antes de aceptarlos.

Pruebas: cambio de mes, cambio de club a mitad de mes según regla publicada, desempleo, retirada, saldo insuficiente, repetición de comando y carga antigua. Criterio: cada euro nuevo tiene origen y nunca se cobra dos veces.

### Adversidad recuperable

Aprovechar lesión, sanción, pérdida de rol y fin de contrato existentes. Para cada situación definir disparador, aviso, alternativas, duración y condiciones de salida. Ejemplo: suplencia permite entrenar, hablar con el entrenador o buscar cesión; ninguna opción garantiza recuperar el puesto.

Mostrar contadores solo cuando la autoridad conoce el plazo. Una lesión no debe mostrar semanas exactas inventadas. No añadir despido o descenso mecánico hasta contar con transición, guardado y recuperación coherentes.

### Momentos importantes

Garantizar oportunidades narrativas elegibles, no títulos ni convocatorias inmerecidas. Candidatos: revisión de objetivos al inicio, evaluación a mitad y balance final. Debut, convocatoria y título se celebran únicamente si existen hechos oficiales.

Deduplicar por temporada y tipo; priorizar frente a relleno, pero respetar decisiones pendientes y pausas por lesión/contrato. Si no hay hito deportivo, el balance puede tratar continuidad o adversidad.

**Aceptación:** todas las trayectorias tienen balance; ningún logro sin evidencia; adversidad con salida jugable; retiro voluntario preservado.

**Estado:** pendiente.

## 8. Fase 5 — Profundidad narrativa y partidos especiales

**Prioridad:** P2. **Esfuerzo orientativo:** 5–8 días. **Dependencias:** fases 2–4.

- Narrar 3–5 líneas para encuentros relevantes a partir del marcador, localía, participación y estadísticas. No atribuir al jugador goles o acciones no registrados.
- Para decisiones dentro del partido, diseñar primero una transacción pausada con minuto, marcador parcial y opciones legales. Resolver una vez y continuar el mismo encuentro; nunca generar un segundo partido al elegir.
- Separar la recomendación del entrenador de una garantía de resultado. Probar cambio imposible, jugador lesionado, partido acabado, cierre durante decisión y recarga a mitad.
- Auditar cierres de Paula, Nano y Clara según encuentros y relación conocida. Un personaje nunca conocido no necesita una despedida íntima inventada. Preparar cierre activo, distanciamiento y cierre implícito según historial.
- Vincular memoria narrativa a hechos de decisiones previas. Evitar mensajes vagos repetidos como sustituto de causalidad.

**Aceptación:** cero dobles resultados, cierres consistentes con conocimiento del protagonista, partidos especiales compatibles con el ledger y cada arco elegible con resolución verificable.

**Estado:** pendiente.

## 9. Fase 6 — Validación y publicación

**Prioridad:** transversal y cierre de cada entrega. **Esfuerzo:** 1–2 días por entrega importante; pruebas con jugadores aparte.

1. Automatización: compilar, pruebas dirigidas, sesión/guardados, paquete PlayCanvas y regresión de contratos cuando se toquen reglas.
2. Reproducción: semillas 424242, 99, 555 y 7777; decisiones anotadas. Experimento A/B con la misma semilla y políticas explícitas; contar ofertas y efectos reales, no solo clics.
3. Carrera completa: jugar/simular hasta retiro, guardar antes y después de anuncio y cierre; comparar epílogo con historial. Un test que busca textos en archivos no valida esta ruta.
4. UI: escritorio, 768 px y 390 px. Inicio, decisión, resultado, oferta, Carrera y Guardados. Teclado, foco, contraste, textos largos, zoom y ausencia de desbordamiento horizontal. Complementar emulación con móvil real.
5. Publicación: integrar rama revisada, reconstruir desde el commit integrado, registrar hash, actualizar asset y verificar escena 2593315. Conservar paquete anterior para rollback. No reemplazar partidas del usuario para probar.
6. Smoke de producción: título y fecha, creación de carrera de QA separada, una decisión con retorno de foco, último partido después de avanzar, importación de copia de prueba y consola sin errores.
7. Jugadores: 5–8 personas, sesión de 20–30 minutos; preguntar qué cambió después de decidir y por qué hubo/no hubo partido. Medir comprensión y frustración además de densidad de eventos.

**Criterio de publicación:** paquete identificado, pruebas pertinentes aprobadas, acceso autenticado y smoke posterior. Un build local no equivale a estar publicado.

## 10. Orden de ejecución y control

Orden: 0 → 1 → 2 → 3 → 4 → 5, con 6 en cada entrega. Revisar el equilibrio al terminar 2 y 3 antes de ampliar sistemas.

La primera entrega implementa 1A–1D y prepara el paquete. Las fases restantes son trabajo pendiente explícito; no se ha programado ejecución automática en segundo plano. Los detalles de pruebas, artefactos y publicación se registran en `estado-implementacion.md`.


## Avance del 26 de septiembre

Implementados los resúmenes deportivos y el contexto factual de fase 2; calibración inicial 38→30, nombres ficticios y regresiones de rechazo de fase 3. Ver `validacion-posttest-2026-09-26.md` para resultados y límites. Los estados «pendiente» anteriores describen el plan inicial; esta actualización distingue lo entregado de la economía y profundidad narrativa aún pendientes.
