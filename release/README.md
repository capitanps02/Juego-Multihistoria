# Multihistoria release / beta readiness

Este directorio define el proceso reproducible para convertir un commit exacto en una candidata Android verificable. No sustituye QA narrativo ni evidencia física T7.

## Identidad de candidata

Toda candidata debe quedar ligada a `gitSha`, `sourceBranch`, `versionName`, `versionCode`, `contentIdentity`, save/session schema, timestamp, variant, `applicationId`, `webBundleIdentity` y `manifestIdentity`.

El timestamp reproducible usa `SOURCE_DATE_EPOCH`. En CI se deriva del commit exacto. El `manifestIdentity` ignora únicamente su propio campo y cubre el resto del manifiesto.

## Gate reproducible

Desde un checkout limpio del commit candidato:

```bash
npm ci
npm run build
export BUILD_GIT_SHA="$(git rev-parse HEAD)"
export BUILD_SOURCE_BRANCH="$(git branch --show-current)"
export SOURCE_DATE_EPOCH="$(git show -s --format=%ct HEAD)"
node scripts/release-build-manifest.mjs --require-git
node --test scripts/test-release-diagnostics.mjs
node scripts/release-upgrade-check.mjs
node scripts/release-verify.mjs
node scripts/build-android-release.mjs
node scripts/release-verify.mjs --android
```

Una candidata para Google Play debe aportar además un `MULTIHISTORIA_VERSION_CODE` comprobado contra Play Console, `MULTIHISTORIA_VERSION_NAME` y los cuatro secretos de firma mediante el secret store del entorno. Entonces se usa `--require-signed` tanto al construir como al verificar.

## Firma

Nunca se guardan keystores ni contraseñas en Git. Variables esperadas:

- `MULTIHISTORIA_KEYSTORE_PATH`
- `MULTIHISTORIA_KEYSTORE_PASSWORD`
- `MULTIHISTORIA_KEY_ALIAS`
- `MULTIHISTORIA_KEY_PASSWORD`

La configuración parcial falla de forma cerrada.

## Release Candidate

`RC1`, `RC2`, etc. son etiquetas humanas de una evidencia, no nombres de archivos ambiguos. Cada RC debe registrar como mínimo:

- SHA exacto y `manifestIdentity`;
- versionCode/versionName;
- APK y AAB con SHA-256;
- estado de firma;
- release-verification.json;
- upgrade-check.json;
- defectos conocidos;
- enlace al resultado de Repository Integrity y release beta readiness;
- estado físico T7 separado del estado automatizado.

Promover el mismo AAB entre tracks conserva el versionCode. Si se reconstruye cualquier binario, se genera una nueva identidad; si sustituye un artefacto ya subido, necesita un versionCode mayor.

## Diagnósticos y bugs

`release-package-diagnostics.mjs` genera información de diagnóstico sin la partida. `release-bug-package.mjs` añade build manifest y plantilla de reproducción. La partida completa solo se adjunta mediante `--include-save --save=...`; queda en `OPTIONAL_USER_SAVE/` y no se mezcla silenciosamente con diagnostics.

## T7 / T8

La matriz de dispositivos, actualización y rendimiento vive en archivos machine-readable de este directorio. Los estados físicos no pasan a PASS mediante CI. Google Play tampoco se considera completado hasta ejecutar las acciones externas y aportar evidencia real.
