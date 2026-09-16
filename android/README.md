# Multihistoria · paquete Android offline (T3.3–T3.4)

Este módulo usa WebViewAssetLoader para servir archivos del APK bajo `https://appassets.androidplatform.net/assets/`. Esa dirección se resuelve dentro del WebView, sin servidor ni red. Se bloquean las solicitudes no resueltas por el cargador y no se declara permiso de Internet. Los imports son relativos y las imágenes usan `data:`.

## Generar el paquete local

Desde la raíz del proyecto:

```bash
npm run android:offline
npm run test:android:offline
```

El manifiesto verificable queda en `app/src/main/assets/offline-manifest.json`. Incluye versión de aplicación y hashes de los recursos empaquetados. La capa IndexedDB de la interfaz web se verificó en Android 15; localStorage se usa para migración antigua, no como alternativa cuando falla IndexedDB.

## Compilar el APK

Con Java 17+, Android SDK (API 35) y Gradle/Android Studio instalados:

```bash
npm run android:apk
```

El APK de depuración se genera en `app/build/outputs/apk/debug/app-debug.apk`. El comando escribe `analysis/2026-09-15/T3.3-apk-build.json`; si falta Java, Gradle o el SDK, termina con código 2 y conserva el diagnóstico para reintentarlo después.

En el Mac usado para el cierre histórico T3.3 se instalaron Java 17, Gradle 8.9 y SDK API 35 dentro de `.android-tools/`. El script los detecta sin modificar la configuración del sistema. La primera compilación puede descargar dependencias. Añadir `--offline` únicamente cuando estén en caché; que el juego funcione sin red no implica que una compilación nueva pueda resolver dependencias sin caché.

## APK candidato en CI

`.github/workflows/presentation-android.yml` prepara un APK de depuración reproducible para cada PR que cambie la capa web/Android/engine relevante. El workflow:

1. instala Node 20, Java 17, Gradle 8.9 y API 35;
2. ejecuta la regresión de presentación;
3. reconstruye y verifica el paquete offline;
4. compila el APK;
5. valida que el informe contenga un SHA-256;
6. publica `multihistoria-android-presentation-candidate` como artefacto temporal.

Ese artefacto facilita T3.4, pero no constituye por sí solo una prueba en teléfono físico.

## Ensayo real de persistencia en emulador

`app/src/androidTest/java/com/multihistoria/OfflineProbe.java` se compila en un APK de ensayo separado con `assembleDebugAndroidTest`. El runner pulsa Simular semana y una elección en el DOM real, lee IndexedDB y conserva el JSON esperado. También comprueba el diagnóstico del bridge, Android Back y que pausa/reanudación no modifiquen el save. La segunda fase verifica que el mismo JSON y resultado se recuperan después de detener el proceso.

Con un emulador dedicado recién creado y ambos APK compilados:

```sh
node scripts/test-android-device.mjs emulator-5556
```

El script instala ambos APK, activa modo avión, ejecuta la primera fase, detiene el proceso y ejecuta la recuperación. Solo acepta seriales de emulador. No borra datos existentes; la fase de creación requiere una partida nueva. Escribe `analysis/2026-09-15/T3.3-android-runtime.json` y falla si alguna fase no pasa. La prueba no sustituye el ensayo en teléfono de T3.4.

## Medición T3.4 y archivos Android

La actividad expone dos funciones públicas de plataforma:

- `AndroidBridge.saveTextFile`: exporta JSON mediante `ACTION_CREATE_DOCUMENT`;
- `AndroidBridge.getRuntimeInfo`: devuelve versión de app, Android y WebView para diagnóstico visible, sin exponer estado narrativo.

La importación utiliza `ACTION_OPEN_DOCUMENT`. El navegador conserva el fallback Blob cuando el bridge no está disponible. Al terminar una exportación, la Activity comunica a la UI `saved`, `cancelled` o `error`, evitando que una cancelación del selector parezca un guardado correcto.

Con el APK recompilado y un emulador dedicado arrancado:

```sh
node scripts/test-android-t34.mjs emulator-5556
```

La sonda activa modo avión, registra el arranque frío/caliente con `am start -W`, comprueba el puente nativo y repite creación/reanudación de una partida en IndexedDB. El informe queda en `analysis/2026-09-15/T3.4-android-runtime.json`.

El script mantiene intencionadamente la restricción `emulator-*`: no instalará ni borrará datos de un teléfono físico. La validación física se realiza manualmente siguiendo `project/T3_4_ANDROID.md` y debe registrar dispositivo, Android/WebView, SHA del APK, import/export, Android Back, reanudación y observaciones visuales.
