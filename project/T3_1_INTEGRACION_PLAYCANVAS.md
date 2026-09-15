# T3.1 · Interfaz del handoff e integración PlayCanvas

Preparación iniciada el 13 y retomada el 14 de septiembre de 2026 por petición expresa del autor. Destino: proyecto Historia Jugador, escena **2593315**. El autor adelanta esta integración respecto a T2.3–T2.5. No se dan esas pasadas por completadas.

Estado actual: **T3.1 completada el 14 de septiembre de 2026**. El recurso `multihistoria.js` está subido y el script **multihistoria** está conectado a Root en la escena 2593315. Launch abre el juego con la interfaz del handoff.

[Jugar en PlayCanvas](https://launch.playcanvas.com/2593315?debug=true). Comprobado con la sesión autenticada del autor en Chrome; no se acredita acceso anónimo ni un build público independiente.

Avance ganado: **13,15 %**, cuatro de 68 pasadas base completadas. T3.1 aporta 2,75 puntos. La siguiente pasada es T2.3; Android sigue pendiente.

## Implementación disponible

- Interfaz en `web/game-ui.js` y `web/game-ui.css`, conectada a GameSession y separada de la simulación. Cinco secciones principales: Inicio, Carrera, Mundo, Relaciones y Perfil; sección adicional para partidas.
- Colores, radios, navegación discreta, tipografía de sistema, acento azul y tratamiento cinematográfico derivados del ZIP del autor. El documento adjunto se usa como referencia de diseño; sus prompts internos no se ejecutan como instrucciones adicionales.
- Inicio usa la edad, club, posición, forma, estado físico, fatiga, partidos y recorrido reales. No inventa rivales, goles, medias, mensajes ni contratos para reproducir las cifras del prototipo.
- Simular semana avanza como máximo siete días y se detiene ante una escena. El jugador decide; la UI no escoge por él. El resultado exige continuar y se restaura tras recargar.
- Carrera presenta decisiones y consecuencias ya vistas. Mundo muestra las noticias realmente emitidas por el motor. Relaciones presenta nombres y roles del catálogo; no atribuye relaciones cualitativas ni inventa conversaciones. Perfil muestra datos propios del jugador.
- PlayerView se amplía con campos explícitos de presentación. No se entregan agendas privadas de NPC, confianza interna, probabilidades, efectos futuros, flags ni RNG a los componentes de pantalla.
- Tres imágenes limpias generadas a partir de las referencias: retrato, vestuario y estadio. Los originales tenían cifras, fechas y botones incrustados. Los archivos limpios se conservan en `web/assets/`, sin reemplazar el handoff. Los retratos secundarios proceden del paquete original y siguen siendo ilustrativos.
- La escena usa actualmente vestuario para familias deportivas y estadio como fondo general. Las escenas específicas de lesión, prensa, familia y traspaso, vídeos y personajes a distintas edades requieren pasadas visuales posteriores. No se presentan como cinemáticas finales entregadas.
- Diseño adaptable, foco visible, botones de al menos 44 px en acciones principales, flechas en navegación/opciones, Escape para volver y respeto de movimiento reducido.

## Empaquetado

`scripts/build-playcanvas.mjs` utiliza TypeScript 5.8.3 para reunir los 49 módulos requeridos por GameSession, la interfaz, CSS y recursos en `playcanvas/multihistoria.js`. Es un script clásico registrado como **multihistoria** con `pc.createScript`; `initialize` monta la interfaz dentro de Shadow DOM y `destroy` la retira. No usa `eval`, no depende del servidor local y no necesita fuentes remotas.

El manifiesto `playcanvas/manifest.json` identifica el destino, módulos, tamaño y SHA-256 del paquete. La versión de simulación y esquema de sesión siguen siendo compatibles con T2.2; el manifiesto identifica las nuevas fuentes y la entrega visual T3.1. Los PNG incrustados hacen que este primer paquete ronde 9,6 MB; la separación y compresión de recursos, arranque y memoria en Android deben medirse en T3.2/T3.4.

Reproducción: `npm run build:playcanvas`. Comprobación conjunta: `npm run test:playcanvas`. El lanzador `Probar juego.command` también regenera el paquete y abre el mismo servidor local.

La técnica usa los [scripts del editor de PlayCanvas](https://developer.playcanvas.com/user-manual/editor/scripting/managing-scripts/) y su [componente Script](https://developer.playcanvas.com/user-manual/editor/scenes/components/script/). No se ha publicado un build público ni generado Android en esta preparación.

## Partidas

El visor local mantiene la clave de T2.1/T2.2 y el mismo bloqueo entre pestañas. PlayCanvas utiliza una clave propia de la escena: `historia-jugador.playcanvas.2593315.session.v1`. No se trasladan partidas entre orígenes sin una exportación/importación explícita.

La sección Tu partida permite descargar, importar una sesión validada, revisar fecha/decisiones antes de confirmar y conservar una copia anterior recuperable. Un error al validar no sustituye la partida activa. La copia de respaldo y la escritura actual son dos operaciones localStorage bajo Web Locks; **no es aún el adaptador transaccional de producción ni acredita T2.3**. Faltan su matriz de interrupciones, integridad y recuperación duradera.

## Comprobaciones

**57 pruebas automatizadas pasan**, sin omitidas. Las 54 de sesión/migraciones se mantienen. Las tres nuevas comprueban equivalencia de estados y RNG del paquete frente al motor durante veinte elecciones, límites de información visible e independencia de localhost/recursos externos. Evidencia: `analysis/2026-09-13/T3.1/tests.tap`.

En una partida de navegador separada se verificó: iniciar, simular hasta «La lista de 26», doble pulsación con una sola decisión, recargar el resultado, rechazar JSON inválido sin sustituir la partida, importar sesión válida y recuperar la anterior hasta el mismo resultado. La consola de esa prueba no mostró errores ni avisos.

El visor normal recuperó la partida del autor: «Cinco minutos más», 6 de julio de 2026 y una decisión. No se eligieron opciones ni se importaron copias sobre esa partida. Se revisaron visualmente portada y escena a 639 × 691 px en el navegador integrado. El intento de cambiar a 1440 × 900 no alteró las dimensiones efectivas, por lo que no se acredita esa prueba. La matriz móvil, escritorio y teléfono físico sigue pendiente.

## Cierre en PlayCanvas

Se comprobó una partida nueva online: Simular semana → La lista de 26 → llamar a Nano. Tras recargar, permanecieron el mismo resultado («Nano agradece que se lo cuentes directamente») y una sola decisión. Carrera mostró la elección y su consecuencia; Inicio recuperó el resumen. La consola consultada no mostró errores ni avisos.

La portada y el resultado se revisaron visualmente en escritorio (captura de 1208 × 597). El juego queda abierto en Inicio, con ese resultado de prueba pendiente de continuar. La partida local del autor no se modificó. Evidencia estructurada: `analysis/2026-09-14/T3.1/verification.json`.

Se cierra únicamente T3.1. Continúan pendientes guardado transaccional T2.3, continuidad y matriz de presentación T3.2, APK T3.3 y prueba física T3.4. El peso de las imágenes requiere optimización y medición posterior.
