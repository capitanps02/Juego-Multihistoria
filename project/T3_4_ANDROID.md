# T3.4 · ensayo Android

## Estado

La parte técnica está preparada y pasa en emulador/CI. La evidencia externa pendiente es repetir el flujo en un teléfono físico y comprobar persistencia, navegación, selectores visuales del sistema, safe areas y experiencia real.

**T3.4 no está completada mientras no exista evidencia de hardware físico.** Una compilación de CI o una repetición en emulador no sustituye ese requisito.

## Evidencia disponible

- [Informe instrumentado](../analysis/2026-09-15/T3.4-android-runtime.json): arranque frío/caliente, origen seguro, puente de archivos, creación y reanudación con IndexedDB en emulador.
- [Sonda de emulador](../scripts/test-android-t34.mjs): instala los APK, activa modo avión y guarda el informe reproducible. Solo acepta seriales `emulator-*`.
- [Recolector físico](../scripts/collect-android-physical-evidence.mjs): recoge metadatos, identidad del APK y tiempos en hardware real sin instalar, borrar datos ni marcar T3.4 como cerrada.
- `.github/workflows/presentation-android.yml`: construye un APK candidato en CI y lo publica como artefacto de PR, sin operar dispositivos físicos.

## Candidato técnico actual

Código validado: `b45c1a2c21680b0453f64a9e766fee6509993c0c`.

Workflow `Android presentation candidate` #52:

- versión `0.8.0`, versionCode `1`;
- tamaño: **8.691.886 bytes**;
- SHA-256 exacto: `83650120af602cebc8c562acb9b67912885f7c44ffec5c1fabcdc03d17e62807`;
- payload SHA-256: `8ec600cef9f0b54e4bf8b8c51973fca945cb24bb1c6be44994d07e231b55103e`;
- 214 entradas de payload;
- única exclusión del fingerprint estable: `META-INF/CERT.RSA`.

Los cambios posteriores que solo afectan al recolector/documentación no modifican por sí mismos el payload de la aplicación. Para una prueba física definitiva debe conservarse el SHA exacto del APK concreto que se instale.

## Preparar el APK candidato

Usar el artefacto `multihistoria-android-presentation-candidate` de la ejecución CI asociada al commit/PR que se quiera validar.

Antes de instalarlo, registrar su SHA-256:

```bash
shasum -a 256 app-debug.apk
```

Ese hash debe aparecer después en la evidencia física. No mezclar resultados de APK distintos.

## Capturar evidencia automática del teléfono

Con el APK ya instalado y depuración USB autorizada por el propietario:

```bash
adb devices
npm run android:physical:evidence -- <SERIAL_FISICO> /ruta/al/app-debug.apk
```

El segundo argumento es opcional. Si se omite, el recolector intenta usar `android/app/build/outputs/apk/debug/app-debug.apk`.

El recolector:

- rechaza seriales `emulator-*` y también dispositivos cuyo `ro.kernel.qemu`/`ro.boot.qemu` indiquen emulación;
- no ejecuta `adb install`, `pm clear`, desinstalación ni cambio de modo avión;
- obtiene fabricante, modelo, device, Android release/SDK y fingerprint;
- registra System WebView;
- registra `versionName`/`versionCode` y ruta del paquete instalado;
- calcula SHA-256 del APK local candidato si está disponible;
- intenta calcular de forma no destructiva el SHA-256 del `base.apk` instalado usando `sha256sum`/`toybox sha256sum` a través de ADB;
- registra `identityCheckAvailable` y `matchesLocalCandidate` cuando ambas huellas están disponibles;
- mide arranque frío/caliente con `am start -W` sin borrar datos;
- escribe `analysis/2026-09-15/T3.4-physical-evidence.json`;
- deja expresamente `t34Closed: false` y los checks manuales a `false`.

Si el firmware no permite calcular el hash del paquete instalado, `identityCheckAvailable` queda a `false`; eso no se convierte en un falso positivo. El fichero generado sigue siendo **evidencia parcial**, no un cierre automático.

Para inspección manual equivalente:

```bash
adb shell getprop ro.product.manufacturer
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release
adb shell getprop ro.build.version.sdk
adb shell dumpsys webviewupdate
adb shell dumpsys package com.multihistoria | grep -E 'versionName|versionCode'
adb shell pm path com.multihistoria
```

No ejecutar `pm clear`, desinstalaciones ni scripts de emulador sobre un teléfono con datos que deban conservarse.

## Comprobación manual en teléfono físico

1. Instalar el APK candidato identificado por SHA-256 y abrir **Multihistoria**.
2. Ejecutar el recolector físico pasando ese mismo APK y conservar `T3.4-physical-evidence.json`.
3. Si `identityCheckAvailable=true`, exigir `matchesLocalCandidate=true`. Si no está disponible, conservar la razón/limitación y verificar al menos versión, package y SHA local.
4. Confirmar en **Tu partida → Información de la aplicación** la versión de app, Android y WebView.
5. Activar modo avión y comprobar que Inicio, Carrera, Mundo, Relaciones, Perfil y Tu partida siguen disponibles.
6. Iniciar/continuar una carrera, pulsar **Simular semana**, llegar a una decisión, elegir y comprobar la consecuencia.
7. En **Relaciones**, confirmar que solo aparecen contactos que el protagonista conoce según su historia; no deben aparecer automáticamente las 20 identidades del catálogo.
8. Cerrar la aplicación desde recientes, abrirla de nuevo y comprobar que fecha, escena/resultado, contador de decisiones y contactos conocidos coinciden.
9. Probar el botón físico/gesto **Atrás** desde una pantalla secundaria y desde una escena cinematográfica. Debe volver dentro del juego antes de abandonar la Activity.
10. En **Tu partida**, pulsar **Descargar copia**. Cancelar una vez el selector y comprobar que el juego informa de la cancelación sin perder la partida.
11. Repetir **Descargar copia**, guardar `multihistoria-partida.json` y comprobar que la UI confirma la exportación.
12. Usar **Importar copia de partida**, seleccionar ese JSON y confirmar la sustitución. Comprobar que existe **Copia anterior** recuperable.
13. Intentar importar un JSON corrupto/no compatible. Debe rechazarse sin sustituir la partida válida.
14. Con el juego aún en modo avión, avanzar otra vez y comprobar autosave/reanudación.
15. Revisar visualmente notch/cámara, barra de gestos, botones, textos largos, scroll, diálogo de confirmación y selectores del fabricante.
16. Girar el teléfono si el sistema lo permite: la app está actualmente declarada en portrait; registrar si el comportamiento real es coherente y no produce recreaciones/pérdida de estado.
17. Registrar cualquier error en Logcat alrededor de la prueba:

```bash
adb logcat -d -s Multihistoria:I AndroidRuntime:E
```

## Medición de arranque físico

El recolector ya captura esta métrica. Para repetirla manualmente sin borrar datos:

```bash
adb shell am force-stop com.multihistoria
adb shell am start -W -n com.multihistoria/.MainActivity
adb shell am start -W -n com.multihistoria/.MainActivity
```

Registrar `TotalTime` como observación del teléfono probado. No comparar esos valores con el emulador como si fueran equivalentes.

## Evidencia mínima para cerrar T3.4

Crear un informe fechado que contenga:

- commit/PR probado;
- SHA-256 local del APK instalado;
- SHA-256 del APK instalado y coincidencia con el candidato cuando el dispositivo permita obtenerlo;
- fabricante y modelo;
- Android release + SDK;
- WebView;
- arranque frío y caliente;
- modo avión confirmado;
- resultado de creación/decisión/reanudación;
- Relaciones sin contactos omniscientes;
- Android Back;
- export cancelada + export correcta;
- import correcta + JSON corrupto rechazado;
- copia anterior recuperable;
- observaciones de safe areas, textos, scroll y selectores;
- logs relevantes;
- screenshots solo si son de esa misma ejecución/dispositivo.

La sonda automatizada de emulador conserva la restricción `emulator-*`; el recolector físico hace lo contrario y se mantiene no destructivo. Ninguno de los dos marca T3.4 como completada por sí mismo.
