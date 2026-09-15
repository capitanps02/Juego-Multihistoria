# Multihistoria Engine v0.8

## Probar la sesión interactiva T2.1

Ya existe un visor provisional: `npm run play` y abrir [http://127.0.0.1:4173](http://127.0.0.1:4173).
En este Mac también puede iniciarse desde `Probar juego.command` en Finder.
Las instrucciones de guardado y el recorrido hacia PlayCanvas/Android están en [Cómo probar el juego](project/COMO_PROBAR_EL_JUEGO.md).
Ejecutar las nuevas comprobaciones con `npm run test:session`. Esta capa añade interacción al motor; las afirmaciones y cifras históricas de v0.8 que siguen se contrastan en la [auditoría](analysis/2026-09-11/INFORME_Y_PLAN_ANDROID.md).

Motor narrativo/simulador TypeScript para **Carrera de Futbolista**, capaz de simular una carrera persistente desde los 18 años hasta una retirada **sin edad fija** y generar un epílogo a partir de toda la memoria de la partida.

## v0.8 — 34+ → retirada → epílogo
- Catálogo global estructurado: **254 principales + 134 condicionales = 388 eventos**.
- Registro global: **210/210 seeds únicas** y 20 NPC persistentes.
- Tramo 34+: **50 principales + 32 condicionales + 64 microfeeds**.
- **20 familias de epílogo**, combinadas en 2–5 etiquetas compatibles por carrera.
- Epílogo persistente con 12–20 hitos reconstruidos desde el historial.
- Máquina de retirada: `playing → decided → announced → closed`.
- Reconsideración de retirada excepcional y costosa antes del cierre terminal.
- Cierre por falta de mercado posible; el motor no inventa contrato para sostener artificialmente una carrera.
- Sin edad máxima narrativa: edad, cuerpo, rol, mercado y motivación cambian probabilidades, pero **ninguna edad retira automáticamente al jugador**.
- Fallbacks administrativos eliminan deadlocks sin elegir decisiones deportivas por el jugador.
- `EventIndex` 34+ dinámico: carreras extraordinariamente largas siguen recibiendo escenas.
- Scheduler 34+ optimizado con conteos de historial precalculados una sola vez por tick.
- Schema de guardado **8**, con migración automática desde schemas anteriores.

## QA definitivo v0.8
Batería final de **1.000 carreras completas 18 → retirada → epílogo**, ejecutada sobre el código final:

- 1.000/1.000 carreras cerradas.
- **0 deadlocks** de retirada.
- 1.000/1.000 firmas narrativas únicas.
- 50/50 principales 34+ alcanzables.
- 32/32 condicionales 34+ alcanzables.
- 64/64 microfeeds 34+ alcanzables.
- 20/20 familias de epílogo alcanzables.
- Media 34+: **19,683 principales + 10,772 condicionales + 41,418 microfeeds** por carrera.
- 89 reversiones de retirada en 1.000 carreras.
- Reproducibilidad exacta: **PASS**.
- Independencia RNG de microfeeds: **PASS**.
- Migración save v7→v8: **PASS**.
- Build: **0 errores / 0 warnings**.

### Edad de retirada observada
No es un límite configurado, sino el resultado de las 1.000 simulaciones:

- 6 retiradas anticipadas a los 33.
- El resto se distribuyó entre 34 y 52 años.
- La edad más frecuente en esta muestra fue 42 (354/1.000).

### Motivos de retirada observados
- Falta de mercado: 435.
- Voluntaria: 259.
- Retirarse después de ganar: 145.
- Retirarse después de caer: 118.
- Salud: 37.
- Retirada anticipada 30–34: 6.

### Tipo de cierre observado
- Sin último partido: 763.
- Último partido planificado: 140.
- Despedida `storybook`: 91.
- Retirada anticipada previa: 6.

Estos porcentajes son **balance de la build actual**, no reglas duras del diseño.

## Arquitectura RNG
Streams independientes:
- `narrative`: historias y decisiones fuertes.
- `football`: mundo deportivo, lesiones, mercado y evolución.
- `microfeed`: noticias/señales ambientales.
- `qa`: estrategia automática de elección en tests headless.

Activar/desactivar microfeeds no modifica la narrativa fuerte ni el epílogo para una misma seed.

## Multimedia
El motor devuelve IDs de presentación desacoplados del archivo físico. Imágenes, vídeo, audio, animaciones o escenas PlayCanvas pueden sustituirse sin modificar scheduler, consecuencias, seeds o saves.

## Fidelidad canónica
Las escenas recuperadas literalmente del Documento Maestro se etiquetan `verified`. Las implementaciones funcionales cuyo copy literal aún no se ha reconciliado permanecen `technical_adaptation`; nunca se presentan como canon verificado.

## Guardados
`CURRENT_SCHEMA_VERSION = 8`.

Ejemplo reproducible:

`examples/save-v08-seed-424242.json`

## QA generado
- `qa/acceptance-v08.json` — aceptación agregada de 1.000 carreras.
- `qa/final-gate-v08.json` — build, reproducibilidad, microfeeds y migración.
- `qa/shards-v08-final/` — 10 shards definitivos de 100 carreras.

## Comandos
```bash
npm run build
npm run validate
npm run qa:gate
npm run qa:aggregate
npm run qa:1000
```

`npm run qa:1000` rehace la batería definitiva en cinco tandas de dos workers para evitar saturar el entorno.

## Estado del proyecto
El **motor narrativo base de vida completa está cerrado**: 18 → carrera profesional → pico → madurez → retirada → epílogo. La siguiente fase ya no necesita añadir edades; debe centrarse en la capa jugable/presentación y en aumentar la fidelidad literal del contenido donde todavía figura `technical_adaptation`.

El paquete fuente Android offline de T3.3 está en [`android`](android). `npm run android:offline` genera sus recursos locales y `npm run test:android:offline` verifica rutas, hashes, red y guardado; la compilación del APK requiere Java, Android SDK y Gradle.
