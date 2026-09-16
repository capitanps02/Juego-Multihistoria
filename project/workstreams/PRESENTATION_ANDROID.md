# Workstream · Presentation / Android / PlayCanvas

Branch: `presentation/android-playcanvas`  
PR: #14 `presentation/android-playcanvas` → `main`  
Estado PR: **DRAFT / bloqueado por save QA #22 y contrato público de Relaciones**.

## Estado ejecutivo

- T3.1: cerrada.
- T3.2: cerrada.
- T3.3: cerrada técnicamente; paquete Android offline y APK reproducible disponibles.
- T3.4: **pendiente de evidencia en teléfono Android físico**. Emulador y CI no la cierran.
- T4.6: flujo Inicio → Carrera → Mundo → Relaciones → Perfil → Tu partida revisado.
- Base integrada: `main@4d547ea9c070d9879d812861ed0abb6493ff1d75`.
- Último HEAD de código validado en CI: `9973c5a0df2d91246e06c324b353e3e6cbcc4e4c`.

## Cambios de producto

- eliminada la seed visible/editable de **Tu partida**; `Empezar otra carrera` usa `crypto.getRandomValues`;
- eliminada `ageMilestone.signature` de la representación visual para no mostrar `STATE*` internos;
- `IndexedDB` sustituido por lenguaje de producto (`Guardado local protegido`);
- safe areas, `viewport-fit=cover`, objetivos táctiles de 44 px, <=380 px, landscape, overscroll y `prefers-reduced-motion`;
- misma capa móvil en web, PlayCanvas y Android offline;
- `AndroidBridge.getRuntimeInfo()` expone únicamente versión instalada, Android y WebView;
- exportación Android informa `saved`, `cancelled` o `error` a la UI;
- `OfflineProbe` cubre Android Back y pausa/reanudación sin modificar el save exacto.

No se muestra seed ID, RNG, flags internas, agendas/conocimiento secreto NPC ni firmas de rutas internas.

### Deuda propia detectada

La primera ejecución sin save todavía crea `GameSession.create(424242, ...)`, mientras `Empezar otra carrera` ya usa una seed interna aleatoria. No se expone al usuario, pero hace que todas las instalaciones nuevas arranquen con la misma trayectoria determinista. Debe sustituirse por `newCareerSeed()` antes de considerar cerrada la pulida de producto. No se ha aplicado una reescritura insegura del archivo desde el conector.

## Contrato público de Relaciones / T5.3

`PlayerView.contacts` sigue construyéndose desde todo `NPC_CATALOG`.

PR #9 de T5.3 protege correctamente `NPCState.knowledge`, memorias y agendas, pero no modifica `GameSession.getView()`. La UI, por tanto, no tiene una señal pública fiable para saber qué NPC ha conocido el protagonista.

Presentación no inferirá esa condición desde memoria secreta, flags, seeds ni `npcRefs`. Se dejó review COMMENT en PR #9 solicitando:

- `contacts` filtrado por el motor; o
- un campo público equivalente como `knownContacts` / `introducedContacts`.

`PlayerView.ageMilestones` también sigue transportando `route`, `tags` y `signature`; la UI no los lee. Endurecimiento futuro recomendado: proyectar solo campos visibles en el ViewModel.

## Android offline

Se conserva:

- `WebViewAssetLoader` y origen local seguro;
- sin permiso `INTERNET`;
- `usesCleartextTraffic=false`;
- navegación externa bloqueada;
- acceso directo `file://`/contenido deshabilitado;
- assets críticos locales;
- IndexedDB;
- Storage Access Framework para importar/exportar.

La versión instalada se obtiene con `PackageManager`; no depende de `BuildConfig`.

## T3.4 · recolector físico no destructivo

Se añadió `scripts/collect-android-physical-evidence.mjs` y el comando:

```bash
npm run android:physical:evidence -- <SERIAL_FISICO>
```

El recolector:

- rechaza seriales `emulator-*`;
- comprueba además `ro.kernel.qemu` / `ro.boot.qemu`;
- no instala APK, no ejecuta `pm clear`, no desinstala ni cambia modo avión;
- registra fabricante/modelo, Android/SDK/fingerprint, WebView y versión del paquete instalado;
- calcula SHA-256 del APK local si está disponible;
- mide arranque frío/caliente con `am start -W`;
- escribe `analysis/2026-09-15/T3.4-physical-evidence.json`;
- deja expresamente `t34Closed: false` y todos los checks manuales a `false`.

El intento de añadir comparación automática entre el hash local y el `base.apk` instalado no fue aceptado por el control de escritura del conector y **no forma parte del código actual**. Por tanto esa igualdad debe verificarse externamente durante la prueba física si se requiere.

El test estático `physical T3.4 evidence collection is hardware-only and non-destructive` pasa en CI.

## APK candidato exacto del HEAD `9973c5a...`

Workflow `Android presentation candidate` run #19: **PASS**.

- versión: `0.8.0`, versionCode `1`;
- tamaño: **8.539.269 bytes**;
- SHA-256: `c5a00e14419b44c25d301a27fa8a367baaca991e1baa9346f88aad4e0557a7d7`;
- hash recalculado sobre el APK descargado y coincidente con `T3.3-apk-build.json`.

Este APK es candidato técnico para la prueba física; no es evidencia de T3.4 completada.

## CI / QA del HEAD `9973c5a...`

`Android presentation candidate` run #19: **PASS**.

`Repository integrity` run #309:

- build: PASS;
- `npm test` + T5.2: PASS;
- determinismo/RNG: PASS;
- límites de edad: PASS;
- referencias: PASS;
- carreras largas: PASS;
- lifecycle audit: PASS;
- simulación estratificada: PASS;
- `test:presentation`: **6/6 PASS**, incluido el recolector físico;
- build PlayCanvas + tests de estado/RNG/privacidad/offline package: PASS hasta `test:saves`;
- resultado final: **FAIL únicamente por #22**.

## #22 · baseline v8 histórico desfasado

Issue: **`Save QA: imported v8 migration baseline is stale`**.

Esperado histórico:
`7136e3239ba5a5c71a85239401e790d8deb9292d4d49f7d4e2cd8d4359f9ca51`

Actual reproducible:
`973721941c79d61ee4a08045778c604641fc87db7d8423533505f8d13fe3db1b`

La investigación descarta que T5.2 lo introdujera:

- T5.2 no modifica `src/save/*`, el fixture v8 ni `migration-baselines.json`;
- fixture y baseline solo tienen el commit de importación inicial `6c9d7fb...`;
- en ese import, `src/save/save.ts` y `dist/save/save.js` ya devuelven un save schema 8 validado sin migrarlo.

Conclusión: el hash esperado ya estaba desfasado respecto al fixture importado. `qa:presentation` hizo visible la deuda al incorporar `test:saves` al gate global.

Este workstream no modificará el runtime ni relajará el test. Save/QA debe recalcular el baseline v8 con evidencia reproducible y verificar history/seeds/RNG/round-trip.

## Evidencia física pendiente

Para cerrar T3.4 aún hay que registrar en un teléfono real:

- modelo/fabricante, Android/SDK y WebView;
- commit y SHA del APK probado;
- arranque frío/caliente;
- modo avión;
- creación, avance y decisión;
- cierre/reanudación;
- Android Back;
- exportación guardada y cancelada;
- import válida y JSON corrupto rechazado sin pérdida;
- recuperación de copia previa;
- notch/safe areas, textos largos, scroll y selectores del fabricante;
- logs y screenshots de esa misma ejecución cuando proceda.

## Límites

- no se modifica canon narrativo;
- no se editan `project/PLAN_PASADAS.md` ni `analysis/2026-09-11/plan-seguimiento.json`;
- no se corrige save/lifecycle desde presentación;
- no se incorpora código de PR T5.3 no mergeado;
- no se hace merge desde este workstream.

## PR

PR #14 permanece **DRAFT**. Para marcarlo listo se requiere:

1. resolver #22 y obtener `Repository integrity` verde;
2. resolver el contrato público de contactos en Relaciones;
3. corregir la seed fija de la primera partida;
4. obtener `Android presentation candidate` verde sobre el HEAD de código final.

T3.4 seguirá abierta incluso después del merge técnico hasta existir evidencia real en teléfono Android físico.
