# Casos de guardado T2.2

`migration-baselines.json` fija las huellas SHA-256 de la salida JSON de las migraciones originales, obtenidas con `analysis/2026-09-11/compiled/save/save.js`. Los tests comparan el cargador nuevo con estas expectativas independientes. No regenerar estas huellas para hacer pasar una regresión sin justificar el cambio de migración.

Los formatos 3–8 usan los archivos suministrados en `examples/save-v03-seed-424242.json` a `save-v08-seed-424242.json`.

No había ejemplo auténtico del formato 2. `save-v02-derived.json` es sintético: parte de v3, establece `schemaVersion: 2` y elimina `careerStateTags`, `world.ownerClub`, `world.nextCyclePriority` y `world.udvSeasonResolved`, campos que repone la migración v2. Verifica esa ruta de código, sin acreditar todas las variantes de una versión 2 histórica.

Ejecutar `npm run test:saves` para compilar y comprobar migraciones y sesión interactiva. Los tests no sobrescriben los ejemplos ni las huellas esperadas.
