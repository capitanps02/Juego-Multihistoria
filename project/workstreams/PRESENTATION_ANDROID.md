# Workstream · Presentation / Android / PlayCanvas

Branch: `presentation/android-playcanvas`  
PR: #14 `presentation/android-playcanvas` → `main`  
Estado PR: **DRAFT / bloqueado por save QA #22 y contrato público de Relaciones**.

## Estado ejecutivo

- T3.1: cerrada en el repositorio.
- T3.2: cerrada en el repositorio.
- T3.3: cerrada técnicamente; paquete Android offline, IndexedDB y ejecución histórica en emulador disponibles.
- T3.4: **pendiente de evidencia en teléfono Android físico**. Emulador y CI no la cierran.
- T4.6: cierre revisado; flujo Inicio → Carrera → Mundo → Relaciones → Perfil → Tu partida operativo.
- Rama re-grounded sobre `main@4d547ea9c070d9879d812861ed0abb6493ff1d75`, con `behind_by: 0` en la última comprobación.
- Último HEAD con código de presentación validado en CI: `1c9b14b01dce71a0c84d644d54abdffa974426d2`.

## Cambios de producto

### Estado oculto

1. **Tu partida** exponía una `semilla` editable. Corregido: la nueva carrera obtiene internamente un `uint32` mediante `crypto.getRandomValues`.
2. **Carrera → Hitos de edad** mostraba `m.signature`, derivada de tags internos como `STATE20_HOME_STARTER`. Corregido: solo se muestran edad, fecha y club.
3. La UI mostraba el término técnico `IndexedDB`. Sustituido por `Guardado local protegido`.
4. No se muestran seed IDs, event IDs, RNG, flags internas, conocimiento secreto NPC ni rutas futuras.

### Contratos públicos pendientes

`PlayerView.contacts` continúa construyéndose desde todo `NPC_CATALOG`.

La nueva implementación T5.3 de PR #9 protege correctamente `knowledge`, memorias y agendas internas, pero **no modifica `GameSession.getView()`**. Por tanto la UI todavía carece de una señal pública para saber si el protagonista ya ha sido presentado a un NPC.

Presentación no inferirá ese dato desde memoria secreta, flags, seeds ni `npcRefs`. Se ha dejado review COMMENT en PR #9 solicitando uno de estos contratos:

- `PlayerView.contacts` filtrado por el motor; o
- un campo público equivalente como `knownContacts` / `introducedContacts`.

`PlayerView.ageMilestones` todavía transporta `route`, `tags` y `signature`, aunque la UI ya no los renderiza. Endurecimiento recomendado: proyectar solo los campos visibles en el ViewModel sin modificar el snapshot persistente.

## Mobile / responsive

`web/product-mobile.css` añade:

- `env(safe-area-inset-*)`;
- objetivos táctiles mínimos de 44 px;
- adaptación <= 380 px;
- landscape móvil;
- contención de overscroll;
- `prefers-reduced-motion: reduce`.

`web/index.html` usa `viewport-fit=cover`. Web, PlayCanvas y Android offline consumen la misma capa de presentación.

## Android offline

Se conserva:

- `WebViewAssetLoader` y origen local seguro;
- sin permiso `INTERNET`;
- `usesCleartextTraffic=false`;
- navegación externa bloqueada;
- acceso `file://`/contenido directo deshabilitado;
- assets críticos locales;
- IndexedDB;
- `ACTION_OPEN_DOCUMENT` para importar;
- `ACTION_CREATE_DOCUMENT` para exportar.

Mejoras:

- `AndroidBridge.getRuntimeInfo()` devuelve versión instalada, Android SDK/release y WebView, sin datos narrativos;
- la versión se obtiene del paquete instalado mediante `PackageManager`, evitando dependencia de `BuildConfig`;
- logging de arranque/selectores;
- exportación comunica `saved`, `cancelled` o `error` mediante `mh:android-file-result`;
- `OfflineProbe` cubre diagnóstico, Android Back y pausa/reanudación sin alterar el save exacto cuando se ejecute en emulador.

## APK candidato exacto del HEAD probado

Construido por GitHub Actions sobre `1c9b14b01dce71a0c84d644d54abdffa974426d2`:

- workflow `Android presentation candidate` run #14: **SUCCESS**;
- versión: `0.8.0`, versionCode `1`;
- archivo: `app-debug.apk`;
- tamaño: **8.539.268 bytes**;
- SHA-256: `28aa0354a3355ac1e97861ebfe2a730bf2aaf83d32b9dfb0a9f6791ab0be0cea`;
- el hash fue recalculado sobre el APK descargado y coincide exactamente con `T3.3-apk-build.json`.

Este APK es candidato técnico para T3.4; **no es evidencia de teléfono físico**.

## T3.4 · dispositivo físico

Estado: **PENDIENTE**.

`scripts/test-android-t34.mjs` sigue aceptando solo `emulator-*`; no se relajará esa protección.

La prueba física debe registrar:

- fabricante/modelo;
- Android/SDK y System WebView;
- versión + SHA-256 exactos del APK;
- arranque frío/caliente medido en el teléfono;
- modo avión;
- creación/avance/decisión;
- cierre y reanudación;
- Android Back;
- exportación guardada y cancelada;
- importación válida;
- rechazo de JSON corrupto sin pérdida de partida;
- recuperación de copia anterior;
- notch/safe areas, texto largo, scroll y selectores del sistema;
- incidencias/logs.

No existen métricas de teléfono físico registradas.

## Tests / gates

Añadidos/reforzados:

- `scripts/test-t46.mjs`;
- `scripts/test-presentation-platform.mjs`;
- `scripts/test-android-offline.mjs`;
- `npm run test:presentation`;
- `npm run qa:presentation`;
- CI Android con APK + informe/hash;
- `Repository integrity` conserva gates T5 y añade regresión presentación/PlayCanvas/offline Android.

### Resultado del HEAD `1c9b14b...`

- `Android presentation candidate` run #14: **PASS**.
- `Repository integrity` run #282: **FAIL** únicamente en `qa:presentation -> test:playcanvas -> test-saves` por el baseline v8.
- `npm test` + T5.2: **PASS**.
- determinismo/RNG T5: **PASS**.
- cruces de edad: **PASS**.
- referencias T5: **PASS**.
- carreras largas: **PASS**.
- auditoría lifecycle: **PASS**.
- simulación estratificada: **PASS**.
- tests propios de presentación: **PASS**.
- Android offline: **PASS**.
- build PlayCanvas: **PASS** hasta `test:saves`.

## #22 · diagnóstico de save QA

Issue actual: **`Save QA: imported v8 migration baseline is stale`**.

Esperado histórico:
`7136e3239ba5a5c71a85239401e790d8deb9292d4d49f7d4e2cd8d4359f9ca51`

Actual reproducible:
`973721941c79d61ee4a08045778c604641fc87db7d8423533505f8d13fe3db1b`

La investigación posterior demuestra que el defecto **no lo introdujo T5.2**:

- T5.2 no toca `src/save/*`, el fixture v8 ni `migration-baselines.json`;
- fixture y baseline solo tienen el commit de importación inicial `6c9d7fb...`;
- en ese mismo import, `src/save/save.ts` y `dist/save/save.js` tienen la misma semántica para schema 8: validan y devuelven `parsed` sin migrarlo.

Conclusión: el hash esperado ya estaba desfasado en el repositorio importado. `qa:presentation` lo hizo visible porque incorpora `test:saves` al gate completo.

Presentación **no corregirá el runtime ni relajará el test**. El owner de save/QA debe recalcular el baseline v8 con evidencia reproducible, verificar history/seeds/RNG/round-trip y actualizar únicamente la expectativa si corresponde.

## Dispositivos / entornos

| Entorno | Estado | Evidencia |
| --- | --- | --- |
| Browser / fuentes | auditado | código + gates |
| PlayCanvas scene 2593315 | bundle regenera; gate global bloqueado solo por #22 | suite PlayCanvas |
| Android 15 emulator `emulator-5556` | evidencia histórica T3.4 técnica | `analysis/2026-09-15/T3.4-android-runtime.json` |
| APK CI | PASS | run #14, SHA arriba |
| Teléfono Android físico | pendiente | sin evidencia válida |

## Límites

- No se modifica canon narrativo.
- Este workstream no edita `project/PLAN_PASADAS.md` ni `analysis/2026-09-11/plan-seguimiento.json`.
- No se corrige save QA/lifecycle desde presentación.
- No se integra código no mergeado de T5.3/T5.2 follow-up.
- No se hace merge del PR desde este workstream.

## PR

PR #14 permanece **DRAFT**. No debe marcarse listo ni mergearse mientras #22 mantenga rojo el gate completo y mientras Relaciones carezca de contrato público seguro para contactos introducidos. Una vez resueltos esos dos puntos, ejecutar de nuevo el HEAD de código exacto, verificar `Repository integrity` + `Android presentation candidate` y después pasar a revisión. T3.4 seguirá abierta hasta una prueba física real.
