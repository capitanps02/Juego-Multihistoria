# T3.4 · ensayo Android

## Estado

La parte técnica está preparada y pasa en el emulador Android 15 en modo avión. La evidencia externa pendiente es repetir el flujo en un teléfono físico y comprobar los selectores visuales del sistema.

## Evidencia disponible

- [Informe instrumentado](../analysis/2026-09-15/T3.4-android-runtime.json): arranque frío/caliente, origen seguro, puente de archivos, creación y reanudación con IndexedDB.
- [Sonda](../scripts/test-android-t34.mjs): instala los APK, activa modo avión y guarda el informe reproducible.
- [APK de depuración](../android/app/build/outputs/apk/debug/app-debug.apk): SHA-256 `446550a58a82cd4d104634e92aa2fe5f525048589de3bcaf2aa997651bb3f8d5`.

## Comprobación en teléfono físico

1. Activar opciones de desarrollador y depuración USB.
2. Conectar el teléfono y confirmar `adb devices` mostrando un serial de dispositivo.
3. Instalar el APK de depuración y abrir **Multihistoria**.
4. Activar modo avión; iniciar una carrera, pulsar **Simular semana**, elegir una opción y cerrar la aplicación desde recientes.
5. Abrirla de nuevo y comprobar que la escena, el resultado y el contador de decisiones coinciden.
6. En **Tu partida**, pulsar **Descargar copia** y confirmar que `multihistoria-partida.json` aparece en el proveedor de documentos.
7. Elegir **Importar copia de partida**, seleccionar ese JSON y confirmar la sustitución; verificar que la copia anterior queda disponible.
8. Registrar modelo, versión Android, versión WebView, tiempos de arranque y cualquier error visual del selector.

El script automatizado mantiene la restricción de aceptar solo seriales `emulator-*` para no modificar teléfonos por accidente. La prueba física se registra manualmente junto con el informe del dispositivo.
