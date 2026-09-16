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
- Último HEAD de código validado en CI: `c0fc499f6fa2bd4db54420ce0f8ebe10dbd7f566`.

## Cambios de producto

- eliminada la seed visible/editable de **Tu partida**;
- tanto la primera carrera de una instalación nueva como **Empezar otra carrera** obtienen ahora origen interno aleatorio en la frontera de presentación;
- el motor `GameSession` permanece determinista cuando QA/headless le entrega una seed explícita;
- eliminada `ageMilestone.signature` de la representación visual para no mostrar `STATE*` internos;
- `IndexedDB` sustituido por lenguaje de producto (`Guardado local protegido`);
- safe areas, `viewport-fit=cover`, objetivos táctiles de 44 px, <=380 px, landscape, overscroll y `prefers-reduced-motion`;
- misma capa móvil en web, PlayCanvas y Android offline;
- `AndroidBridge.getRuntimeInfo()` expone únicamente versión instalada, Android y WebView;
- exportación Android informa `saved`, `cancelled` o `error` a la UI;
- `OfflineProbe` cubre Android Back y pausa/reanudación sin modificar el save exacto.

No se muestra seed ID, RNG, flags internas, agendas/conocimiento secreto NPC ni firmas de rutas internas.

### Adaptador de sesión de jugador

`web/player-session-api.js` encapsula el acceso del jugador a `GameSession`.

- El placeholder histórico `424242` usado por el primer arranque se sustituye por un `uint32` obtenido con `crypto.getRandomValues`.
- Seeds explícitas distintas se reenvían sin modificación.
- `fromSave` se delega sin reinterpretar el snapshot.
- Web, PlayCanvas y Android empaquetan el mismo adaptador.
- Los tests del motor siguen llamando a `GameSession` directamente y conservan reproducibilidad.

CI confirma el contrato con tests funcionales y de empaquetado.

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

La comparación automática entre el hash local y el `base.apk` instalado se intentó como endurecimiento adicional, pero el control de escritura del conector no aceptó ese cambio y **no forma parte del código actual**.

El gate `physical T3.4 evidence collection is hardware-only and non-destructive` pasa en CI.

## APK candidato exacto del HEAD `c0fc499...`

Workflow `Android presentation candidate` run #27: **PASS**.

- versión: `0.8.0`, versionCode `1`;
- tamaño: **8.540.096 bytes**;
- SHA-256: `a5159defb76620e9833e6858755fdddfe82644dcdda598b64552bad26d2a9784`;
- hash recalculado sobre el APK descargado y coincidente con `T3.3-apk-build.json`.

Este APK es candidato técnico para la prueba física; no es evidencia de T3.4 completada.

## CI / QA del HEAD `c0fc499...`

`Android presentation candidate` run #27: **PASS**.

`Repository integrity` run #351:

- build: PASS;
- `npm test` + T5.2: PASS;
- determinismo/RNG: PASS;
- límites de edad: PASS;
- referencias: PASS;
- carreras largas: PASS;
- lifecycle audit: PASS;
- simulación estratificada: PASS;
- `test:presentation`: **8/8 PASS**;
- adaptación de primera carrera aleatoria: PASS;
- empaquetado común web/PlayCanvas/Android del adaptador: PASS;
- PlayCanvas equivalencia de estado/RNG: PASS;
- PlayCanvas privacidad/offline/self-contained: PASS;
- resultado final: **FAIL únicamente por #22** dentro de `test:saves`.

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
3. obtener `Android presentation candidate` verde sobre el HEAD de código final.

La deuda de seed fija de la primera partida queda **resuelta y validada** en `c0fc499...`.

T3.4 seguirá abierta incluso después del merge técnico hasta existir evidencia real en teléfono Android físico.
