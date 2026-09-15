# Multihistoria · paquete Android offline (T3.3–T3.4)

Este módulo usa WebViewAssetLoader para servir archivos del APK bajo `https://appassets.androidplatform.net/assets/`. Esa dirección se resuelve dentro del WebView, sin servidor ni red. Se bloquean las solicitudes no resueltas por el cargador y no se declara permiso de Internet. Los imports son relativos y las imágenes usan `data:`.

## Generar el paquete local

Desde la raíz del proyecto:

```bash
npm run android:offline
npm run test:android:offline
```

El manifiesto verificable queda en `app/src/main/assets/offline-manifest.json`. La capa IndexedDB de la interfaz web se verificó en Android 15; localStorage se usa para migración antigua, no como alternativa cuando falla IndexedDB.

## Compilar el APK

Con Java 17+, Android SDK (API 35) y Gradle/Android Studio instalados:

```bash
npm run android:apk
```

El APK de depuración se genera en `app/build/outputs/apk/debug/app-debug.apk`. El comando escribe `analysis/2026-09-15/T3.3-apk-build.json`; si falta Java, Gradle o el SDK, termina con código 2 y conserva el diagnóstico para reintentarlo después.

En este Mac se instalaron Java 17, Gradle 8.9 y SDK API 35 dentro de `.android-tools/`. El script los detecta sin modificar la configuración del sistema. Como npm no está en PATH, puede ejecutarse con el Node disponible:

```sh
/Users/capitanps/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/build-android-apk.mjs
```

La primera compilación descarga dependencias. Añadir `--offline` únicamente cuando estén en caché; el funcionamiento offline del juego no exige compilar sin red.

## Ensayo real de persistencia

`app/src/androidTest/java/com/multihistoria/OfflineProbe.java` se compila en un APK de ensayo separado con `assembleDebugAndroidTest`. El runner pulsa Simular semana y una elección en el DOM real, lee IndexedDB y conserva el JSON esperado. La segunda fase verifica que el mismo JSON y resultado se recuperan después de detener el proceso.

Con un emulador dedicado recién creado y ambos APK compilados:

```sh
node scripts/test-android-device.mjs emulator-5556
```

El script instala ambos APK, activa modo avión, ejecuta la primera fase, detiene el proceso y ejecuta la recuperación. Solo acepta seriales de emulador. No borra datos existentes; la fase de creación requiere una partida nueva. Escribe `analysis/2026-09-15/T3.3-android-runtime.json` y falla si alguna fase no pasa. La prueba no mide rendimiento ni sustituye el ensayo en teléfono de T3.4.

## Medición T3.4 y archivos Android

La actividad expone `AndroidBridge.saveTextFile` para exportar JSON mediante `ACTION_CREATE_DOCUMENT` y conecta el selector web con `ACTION_OPEN_DOCUMENT`. El navegador conserva el fallback Blob cuando el puente no está disponible.

Con el APK recompilado y un emulador dedicado arrancado:

```sh
node scripts/test-android-t34.mjs emulator-5556
```

La sonda activa modo avión, registra el arranque frío/caliente con `am start -W`, comprueba el puente nativo y repite creación/reanudación de una partida en IndexedDB. El informe queda en `analysis/2026-09-15/T3.4-android-runtime.json`. El resultado actual pasa en Android 15; la validación en un teléfono físico y la interacción visual con los selectores del fabricante siguen pendientes.
