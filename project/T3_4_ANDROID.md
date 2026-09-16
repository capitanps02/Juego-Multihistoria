# T3.4 · ensayo Android

## Estado

La parte técnica está preparada y pasa en el emulador Android 15 en modo avión. La evidencia externa pendiente es repetir el flujo en un teléfono físico y comprobar persistencia, navegación, selectores visuales del sistema, safe areas y experiencia real.

**T3.4 no está completada mientras no exista evidencia de hardware físico.** Una compilación de CI o una repetición en emulador no sustituye ese requisito.

## Evidencia disponible

- [Informe instrumentado](../analysis/2026-09-15/T3.4-android-runtime.json): arranque frío/caliente, origen seguro, puente de archivos, creación y reanudación con IndexedDB en emulador.
- [Sonda](../scripts/test-android-t34.mjs): instala los APK, activa modo avión y guarda el informe reproducible. Solo acepta seriales `emulator-*`.
- APK histórico previo a la rama de presentación: SHA-256 `446550a58a82cd4d104634e92aa2fe5f525048589de3bcaf2aa997651bb3f8d5`. **No usar ese hash para acreditar cambios posteriores.**
- `.github/workflows/presentation-android.yml`: construye un APK candidato en CI y lo publica como artefacto de PR, sin operar dispositivos físicos.

## Preparar el APK candidato

Usar el artefacto `multihistoria-android-presentation-candidate` de la ejecución CI asociada al commit/PR que se quiera validar.

Antes de instalarlo, registrar su SHA-256:

```bash
shasum -a 256 app-debug.apk
```

Ese hash debe aparecer después en la evidencia física. No mezclar resultados de APK distintos.

## Capturar datos del teléfono

Con depuración USB autorizada por el propietario del dispositivo:

```bash
adb devices
adb shell getprop ro.product.manufacturer
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release
adb shell getprop ro.build.version.sdk
adb shell dumpsys webviewupdate
adb shell dumpsys package com.multihistoria | grep -E 'versionName|versionCode'
```

No ejecutar `pm clear`, desinstalaciones ni scripts de emulador sobre un teléfono con datos que deban conservarse.

## Comprobación manual en teléfono físico

1. Instalar el APK candidato identificado por SHA-256 y abrir **Multihistoria**.
2. Confirmar en **Tu partida → Información de la aplicación** la versión de app, Android y WebView.
3. Activar modo avión y comprobar que Inicio, Carrera, Mundo, Relaciones, Perfil y Tu partida siguen disponibles.
4. Iniciar/continuar una carrera, pulsar **Simular semana**, llegar a una decisión, elegir y comprobar la consecuencia.
5. Cerrar la aplicación desde recientes, abrirla de nuevo y comprobar que fecha, escena/resultado y contador de decisiones coinciden.
6. Probar el botón físico/gesto **Atrás** desde una pantalla secundaria y desde una escena cinematográfica. Debe volver dentro del juego antes de abandonar la Activity.
7. En **Tu partida**, pulsar **Descargar copia**. Cancelar una vez el selector y comprobar que el juego informa de la cancelación sin perder la partida.
8. Repetir **Descargar copia**, guardar `multihistoria-partida.json` y comprobar que la UI confirma la exportación.
9. Usar **Importar copia de partida**, seleccionar ese JSON y confirmar la sustitución. Comprobar que existe **Copia anterior** recuperable.
10. Intentar importar un JSON corrupto/no compatible. Debe rechazarse sin sustituir la partida válida.
11. Con el juego aún en modo avión, avanzar otra vez y comprobar autosave/reanudación.
12. Revisar visualmente notch/cámara, barra de gestos, botones, textos largos, scroll, diálogo de confirmación y selectores del fabricante.
13. Girar el teléfono si el sistema lo permite: la app está actualmente declarada en portrait; registrar si el comportamiento real es coherente y no produce recreaciones/pérdida de estado.
14. Registrar cualquier error en Logcat alrededor de la prueba:

```bash
adb logcat -d -s Multihistoria:I AndroidRuntime:E
```

## Medición de arranque físico

Sin borrar datos:

```bash
adb shell am force-stop com.multihistoria
adb shell am start -W -n com.multihistoria/.MainActivity
adb shell am start -W -n com.multihistoria/.MainActivity
```

Registrar `TotalTime` como observación del teléfono probado. No comparar esos valores con el emulador como si fueran equivalentes.

## Evidencia mínima para cerrar T3.4

Crear un informe fechado que contenga:

- commit/PR probado;
- SHA-256 del APK;
- fabricante y modelo;
- Android release + SDK;
- WebView;
- arranque frío y caliente;
- modo avión confirmado;
- resultado de creación/decisión/reanudación;
- Android Back;
- export cancelada + export correcta;
- import correcta + JSON corrupto rechazado;
- copia anterior recuperable;
- observaciones de safe areas, textos, scroll y selectores;
- logs relevantes;
- screenshots solo si son de esa misma ejecución/dispositivo.

La sonda automatizada conserva la restricción de aceptar únicamente seriales `emulator-*` para no modificar teléfonos por accidente.
