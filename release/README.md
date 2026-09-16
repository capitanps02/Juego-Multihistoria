# Multihistoria release / beta readiness

Este directorio define el proceso reproducible para convertir un commit exacto en una candidata Android verificable. No sustituye QA narrativo ni evidencia física T7.

## Identidad de candidata

Toda candidata debe quedar ligada a `gitSha`, `sourceBranch`, `versionName`, `versionCode`, `contentIdentity`, save/session schema, timestamp, variant, `applicationId`, `webBundleIdentity` y `manifestIdentity`.

El timestamp reproducible usa `SOURCE_DATE_EPOCH`. En CI se deriva del commit exacto. El `manifestIdentity` ignora únicamente su propio campo y cubre el resto del manifiesto.

## Gate reproducible

Desde un checkout limpio del commit candidato, el gate único es:

```bash
node scripts/release-candidate-check.mjs --android
```

El comando ejecuta el QA permanente del repositorio, genera Build Identity, prueba ambos diagnósticos sin mutación/RNG, ejecuta el gate de compatibilidad de saves/migraciones, construye APK+AAB y verifica metadatos, hashes y empaquetado. Sus pasos pueden ejecutarse también por separado para diagnóstico de fallos.

Una candidata para Google Play debe aportar además un `MULTIHISTORIA_VERSION_CODE` comprobado contra Play Console, `MULTIHISTORIA_VERSION_NAME` y los cuatro secretos de firma mediante el secret store del entorno. Entonces se usa:

```bash
node scripts/release-candidate-check.mjs --android --require-signed
```

## Firma

Nunca se guardan keystores ni contraseñas en Git. Variables esperadas:

- `MULTIHISTORIA_KEYSTORE_PATH`
- `MULTIHISTORIA_KEYSTORE_PASSWORD`
- `MULTIHISTORIA_KEY_ALIAS`
- `MULTIHISTORIA_KEY_PASSWORD`

La configuración parcial falla de forma cerrada.

## Release Candidate

`RC1`, `RC2`, etc. son registros de evidencia, no nombres de archivos ambiguos. Después de un gate Android verde se genera el registro formal con:

```bash
node scripts/release-create-rc.mjs --id=RC1
```

Para una candidata firmada destinada a Play:

```bash
node scripts/release-create-rc.mjs --id=RC1 --require-signed
```

El generador se niega a registrar la RC si falta el manifest exacto, el gate Android, el gate de migraciones, APK/AAB o sus SHA-256. El esquema está en `release/rc-record.schema.json`. Cada RC registra SHA exacto, `manifestIdentity`, contentIdentity, versionCode/versionName, APK/AAB con SHA-256, firma, defectos conocidos y estados T7/T8 separados.

Promover el mismo AAB entre tracks conserva el versionCode. Si se reconstruye cualquier binario, se genera una nueva identidad; si sustituye un artefacto ya subido, necesita un versionCode mayor.

## Reproducibilidad

`release/reproducibility.json` distingue reproducibilidad funcional de identidad byte-a-byte. `SOURCE_DATE_EPOCH` normaliza la identidad lógica, pero no se afirma que dos APK/AAB tengan el mismo SHA hasta ejecutar el experimento de dos builds limpios; ZIP/signing/tooling pueden introducir bytes variables.

## Diagnósticos y bugs

`src/release/diagnostics.ts` proporciona la API pura de producto; `release-package-diagnostics.mjs` genera información de diagnóstico sin la partida. `release-bug-package.mjs` añade build manifest y plantilla de reproducción. La partida completa solo se adjunta mediante `--include-save --save=...`; queda en `OPTIONAL_USER_SAVE/` y no se mezcla silenciosamente con diagnostics.

La integración visible para testers (botón/exportación) pertenece a presentación y está descrita en `release/agent9-handoff.json`.

## T7 / T8

La matriz de dispositivos, actualización y rendimiento vive en archivos machine-readable de este directorio. Los estados físicos no pasan a PASS mediante CI. Google Play tampoco se considera completado hasta ejecutar las acciones externas y aportar evidencia real.
