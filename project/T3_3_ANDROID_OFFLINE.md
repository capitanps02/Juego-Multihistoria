# T3.3 · Android offline: cierre

## Revisión del trabajo anterior

La estructura y los recursos eran aprovechables. Las comprobaciones anteriores no demostraban arranque ni persistencia en Android: verificaban cadenas y hashes, y una prueba solo leía un informe guardado. Importar GameSession con Node verifica el motor, no el WebView ni IndexedDB.

Se corrigieron estos problemas:

- Se sustituyó file:// por WebViewAssetLoader con el origen https://appassets.androidplatform.net/assets/, resuelto desde el APK. Se deshabilitan los archivos locales y las solicitudes sin recurso local reciben 403.
- Se eliminó la obligación de compilar con --offline: la primera compilación descarga dependencias. El juego sigue sin permiso de Internet.
- Se instalaron Java 17, Gradle 8.9 y SDK API 35/Build Tools 34 dentro de .android-tools/. El script los detecta automáticamente.
- Se sustituyó la prueba del informe histórico por 20 comandos reales con recarga JSON, comparando decisiones, resultados y RNG con el motor original.
- localStorage es una fuente de migración, no un fallback cuando falla IndexedDB.

Referencia: [carga de contenido local en Android](https://developer.android.com/develop/ui/views/layout/webapps/load-local-content).

## Verificación

Los recursos incluyen 144 archivos y 10.278.171 bytes, más el manifiesto. Las cuatro pruebas de scripts/test-android-offline.mjs pasan. La nueva prueba valida equivalencia del motor empaquetado y persistencia JSON; no acredita almacenamiento en un dispositivo.

El resultado de compilación está en [T3.3-apk-build.json](../analysis/2026-09-15/T3.3-apk-build.json). Ejecutar `node scripts/build-android-apk.mjs`; `--offline` es opcional tras completar la caché.

Compilación completada: [APK de depuración](../android/app/build/outputs/apk/debug/app-debug.apk), 8.528.829 bytes. Firma v1/v2 verificada y 144 hashes comprobados dentro del APK. SHA-256: af03e31052c2ca3871d021d4fcdba29d19dd0f2fa148aed09988383bce1b3247. El emulador `emulator-5556` ejecutó las fases `create` y `resume` en modo avión.

## Cierre T3.3

La instrumentación `OfflineProbe` instaló el APK principal y el APK de ensayo en el emulador Android 15, activó modo avión, abrió la aplicación, registró una elección y verificó que el resultado y el JSON de IndexedDB se conservaron después de detener y reabrir el proceso. Ambas fases pasaron: `create` y `resume`. La evidencia completa está en [`T3.3-android-runtime.json`](../analysis/2026-09-15/T3.3-android-runtime.json).

El criterio técnico de T3.3 queda completado. Durante T3.4 se añadió el puente Android para importar mediante `ACTION_OPEN_DOCUMENT` y exportar mediante `ACTION_CREATE_DOCUMENT`; la sonda comprueba que el puente está expuesto en el WebView. La medición con un teléfono físico y la interacción visual con el selector del fabricante siguen correspondiendo a T3.4.
