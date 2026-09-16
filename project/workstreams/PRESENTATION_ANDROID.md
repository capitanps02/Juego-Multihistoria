# Workstream · Presentation / Android / PlayCanvas

Branch: `presentation/android-playcanvas`  
PR: #14 `presentation/android-playcanvas` → `main`  
Estado PR: **DRAFT / bloqueado por regresión transversal de saves #22**.

## Estado ejecutivo

- T3.1: cerrada en el repositorio.
- T3.2: cerrada en el repositorio.
- T3.3: cerrada técnicamente; paquete Android offline, IndexedDB y ejecución histórica en emulador disponibles.
- T3.4: **pendiente de evidencia en teléfono Android físico**. Emulador y CI no la cierran.
- T4.6: cierre revisado; flujo Inicio → Carrera → Mundo → Relaciones → Perfil → Tu partida operativo.
- Rama re-grounded sobre la base con T5.2 lifecycle integrado. El código de presentación validado más reciente es `4825eb03e12a471fdb5575da3234b69f4ddc779d`.

## Cambios de producto

### Estado oculto

1. **Tu partida** exponía una `semilla` editable. Corregido: la nueva carrera obtiene internamente un `uint32` mediante `crypto.getRandomValues`.
2. **Carrera → Hitos de edad** mostraba `m.signature`, derivada de tags internos como `STATE20_HOME_STARTER`. Corregido: solo se muestran edad, fecha y club.
3. La UI mostraba el término técnico `IndexedDB`. Sustituido por `Guardado local protegido`.
4. No se muestran seed IDs, event IDs, RNG, flags internas, conocimiento secreto NPC ni rutas futuras.

### Contratos públicos pendientes

`PlayerView.contacts` continúa construyéndose desde todo `NPC_CATALOG`. La UI no intentará decidir qué NPC conoce el protagonista leyendo memoria/flags internos. T5.3/coordinación debe:

- filtrar `PlayerView.contacts` en la frontera pública; o
- añadir un contrato equivalente como `knownContacts`.

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

## APK candidato actual

Construido por GitHub Actions sobre código `4825eb03e12a471fdb5575da3234b69f4ddc779d` tras integrar T5.2:

- workflow `Android presentation candidate` run #11: **SUCCESS**;
- versión: `0.8.0`, versionCode `1`;
- archivo: `app-debug.apk`;
- tamaño: **8.539.267 bytes**;
- SHA-256: `43a99d2637eb5ccbe88b375473cc6bed46a54890fb573096dea3b7727181d4cc`;
- el hash fue recalculado sobre el APK descargado y coincide con `T3.3-apk-build.json`.

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

### Resultado sobre T5.2

Sobre `4825eb03e12a471fdb5575da3234b69f4ddc779d`:

- `npm test` + `audit:t52` + `test:t52`: **PASS**;
- determinismo/RNG T5: **PASS**;
- cruces de edad: **PASS**;
- referencias T5: **PASS**;
- carreras largas: **PASS**;
- auditoría lifecycle: **PASS**;
- simulación estratificada: **PASS**;
- tests propios de presentación: **PASS**;
- Android offline: **PASS**;
- APK Android: **PASS**;
- `test:playcanvas`/`test-saves`: **FAIL** únicamente en el hash congelado del fixture schema 8.

Regresión registrada como **issue #22**: `T5.2: v8 save migration baseline changes under PlayCanvas regression`.

Esperado:
`7136e3239ba5a5c71a85239401e790d8deb9292d4d49f7d4e2cd8d4359f9ca51`

Actual:
`973721941c79d61ee4a08045778c604641fc87db7d8423533505f8d13fe3db1b`

Los fixtures v2–v7 pasan. El blob del fixture v8 no cambió respecto a la base anterior. Presentación **no actualizará el baseline a ciegas ni relajará el gate**: T5.2/save owner debe decidir si schema 8 debe conservar normalización estable o requiere migración/versionado explícito.

## Dispositivos / entornos

| Entorno | Estado | Evidencia |
| --- | --- | --- |
| Browser / fuentes | auditado | código + gates |
| PlayCanvas scene 2593315 | bundle regenera; bloqueado solo por #22 | suite PlayCanvas |
| Android 15 emulator `emulator-5556` | evidencia histórica T3.4 técnica | `analysis/2026-09-15/T3.4-android-runtime.json` |
| APK CI | PASS | run #11, SHA arriba |
| Teléfono Android físico | pendiente | sin evidencia válida |

## Límites

- No se modifica canon narrativo.
- Este workstream no edita `project/PLAN_PASADAS.md` ni `analysis/2026-09-11/plan-seguimiento.json`.
- No se corrige lifecycle/save T5.2 desde presentación.
- No se hace merge del PR desde este workstream.

## PR

PR #14 permanece **DRAFT**. No debe marcarse listo ni mergearse mientras #22 mantenga rojo el gate completo. Una vez resuelta la compatibilidad de saves, ejecutar de nuevo el HEAD exacto, verificar `Repository integrity` + `Android presentation candidate` y después pasar a revisión. T3.4 seguirá abierta hasta una prueba física real.
