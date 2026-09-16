# Workstream · Presentation / Android / PlayCanvas

Branch: `presentation/android-playcanvas`

Base auditada inicialmente: `main@c28d1194d7a6cce8aef9759bbb96875a710cb945` (16-09-2026). La rama se sincronizó después con `main@568bde2166d5b50a755d0d4cc2c207fa56fe3d7b`, cuyo único cambio adicional era el panel de coordinación.

## Estado ejecutivo

- T3.1: cerrada en el repositorio.
- T3.2: cerrada en el repositorio.
- T3.3: cerrada técnicamente; paquete Android offline, IndexedDB y ejecución en emulador disponibles.
- T3.4: **pendiente de evidencia en teléfono Android físico**. No se considera cerrada por resultados de emulador o CI.
- T4.6: cierre existente revisado. El flujo Inicio → Carrera → Mundo → Relaciones → Perfil → Tu partida existe y usa `PlayerView` para presentación.

## Auditoría inicial

### Web / UX

La presentación principal vive en `web/game-ui.js` y muta la carrera únicamente mediante comandos de `GameSession`.

Hallazgos:

1. La pantalla **Tu partida** exponía el concepto de `semilla` y permitía introducirla manualmente. Esto filtraba una mecánica interna al jugador. Corregido: una nueva carrera obtiene internamente un `uint32` mediante `crypto.getRandomValues`.
2. El navegador web no declaraba `viewport-fit=cover`; la capa visual no contemplaba safe areas ni reducción de movimiento. Corregido con `web/product-mobile.css`.
3. La UI mostraba el término técnico `IndexedDB`. Sustituido por lenguaje de producto: `Guardado local protegido`.
4. La exportación Android abría el selector sin confirmar después si el sistema guardó, canceló o falló. Corregido mediante evento público de plataforma `mh:android-file-result`.
5. **Carrera → Hitos de edad** mostraba `m.signature`. Esa firma se deriva de tags internos como `STATE20_HOME_STARTER`, por lo que era una fuga real de clasificación interna. Corregido: el hito visible muestra únicamente edad, fecha y club.
6. No se reescribe contenido narrativo ni canon en este workstream.

### Contrato público pendiente para T5 NPC

`PlayerView.contacts` se construye actualmente desde todo `NPC_CATALOG`. La UI de Relaciones consume ese contrato público tal como llega, por lo que el motor puede terminar mostrando personajes todavía no conocidos por el protagonista.

La presentación **no** accederá a memoria, conocimiento o flags internas para resolverlo. Contrato mínimo propuesto al coordinador/T5.3:

- `PlayerView.contacts` debe contener únicamente contactos que el protagonista pueda conocer; o
- añadir un campo público equivalente, por ejemplo `knownContacts`, y deprecar el listado indiscriminado.

El filtrado debe ocurrir en la frontera ViewModel, no en la UI leyendo estado secreto.

### Contrato público de hitos

Aunque la UI ya no renderiza `signature`, el objeto público `ageMilestones` todavía transporta campos internos (`route`, `tags`, `signature`). No es necesario que la presentación los lea. Como endurecimiento futuro de contrato, el coordinador puede proyectar esos hitos a los campos visibles (`age`, `date`, `season`, `club`) dentro de `PlayerView`; esta rama no modifica el estado narrativo persistente para hacerlo.

## Mobile / responsive

`web/product-mobile.css` añade:

- safe areas mediante `env(safe-area-inset-*)`;
- controles de navegación con objetivo mínimo de 44 px en móvil;
- ajuste para anchuras <= 380 px;
- adaptación de landscape móvil;
- contención de overscroll;
- `prefers-reduced-motion: reduce` para desactivar deriva y transiciones no esenciales.

`web/index.html` usa `viewport-fit=cover`. El empaquetador Android ya lo aplicaba y ahora los tres destinos consumen la misma capa de presentación.

## Android offline

Implementación revisada:

- origen local seguro con `WebViewAssetLoader`;
- sin permiso `INTERNET`;
- `usesCleartextTraffic=false`;
- navegación externa bloqueada;
- acceso `file://` y contenido directo deshabilitados;
- assets críticos locales;
- IndexedDB para guardado;
- `ACTION_OPEN_DOCUMENT` para importar;
- `ACTION_CREATE_DOCUMENT` para exportar.

Mejoras de esta rama:

- `AndroidBridge.getRuntimeInfo()` expone solo diagnóstico de plataforma: versión de app, Android SDK/release y versión WebView;
- logging Android para arranque y selectores;
- exportación informa `saved`, `cancelled` o `error` a la UI;
- la pantalla Tu partida muestra versión y modo offline sin exponer internals narrativos;
- `OfflineProbe` cubre además runtime diagnostics, Android Back y pausa/reanudación sin cambio del save exacto cuando se ejecute en el emulador dedicado.

## APK y evidencia

APK previamente documentado en `main`:

- versión: `0.8.0` / versionCode `1`;
- SHA-256 histórico: `446550a58a82cd4d104634e92aa2fe5f525048589de3bcaf2aa997651bb3f8d5`;
- evidencia: emulador Android 15 `emulator-5556`.

Ese APK es **anterior a las correcciones de esta rama** y no debe usarse como evidencia de ellas.

Se añadió `.github/workflows/presentation-android.yml` para construir en CI un APK candidato y publicarlo como artefacto de PR. CI no interactúa con teléfonos físicos.

## T3.4 · dispositivo físico

Estado: PENDIENTE.

La automatización `scripts/test-android-t34.mjs` continúa aceptando solamente seriales `emulator-*`. No se relajará esa protección.

La prueba física debe registrar como mínimo:

- fabricante/modelo;
- versión Android y SDK;
- versión System WebView;
- versión y SHA-256 exactos del APK probado;
- arranque frío/caliente medidos en ese dispositivo;
- modo avión;
- creación/avance/decisión;
- cierre y reanudación;
- Android Back;
- exportación guardada y cancelada;
- importación válida;
- rechazo de JSON corrupto sin pérdida de partida;
- sustitución con copia anterior recuperable;
- revisión visual de notch/safe areas, texto largo, scroll y selectores del sistema.

No hay métricas de teléfono físico registradas todavía.

## Tests / gates

Existentes revisados:

- `scripts/test-t46.mjs`;
- `scripts/test-playcanvas.mjs` y suite PlayCanvas;
- `scripts/test-android-offline.mjs`;
- `scripts/test-android-t34.mjs` (solo emulador);
- gate general v0.8.

Añadidos/reforzados:

- `scripts/test-t46.mjs`: bloquea texto visible `semilla`;
- `scripts/test-presentation-platform.mjs`: viewport, safe areas, landscape, reduced motion, packaging común, diagnóstico Android, feedback de export, códigos de hitos internos y política sin Internet;
- `scripts/test-android-offline.mjs`: comprueba capa móvil empaquetada, versión y bridge actualizado;
- `OfflineProbe`: cuando se ejecute en emulador, comprueba también Android Back y pausa/reanudación;
- `npm run test:presentation`;
- `npm run qa:presentation`;
- CI de integridad ejecuta regresión de presentación/PlayCanvas/offline Android;
- CI Android compila APK candidato sin usar hardware físico.

## Dispositivos / entornos

| Entorno | Estado | Evidencia |
| --- | --- | --- |
| Browser / fuentes | auditado | código y gates de rama |
| PlayCanvas scene 2593315 | integración existente; bundle se regenera en gate | `playcanvas/manifest.json` + tests |
| Android 15 emulator `emulator-5556` | histórico: pasa T3.4 técnica; sonda reforzada pendiente de próxima ejecución | `analysis/2026-09-15/T3.4-android-runtime.json` |
| Teléfono Android físico | pendiente | no existe evidencia válida aún |

## Screenshots

No se añaden screenshots en esta pasada porque no se ha ejecutado una sesión visual nueva en hardware o navegador controlado desde este entorno. No se reutilizarán capturas antiguas como evidencia de las modificaciones actuales.

## Dependencias y límites

- La rama no modifica canon narrativo.
- La rama no modifica `project/PLAN_PASADAS.md`.
- La rama no modifica `analysis/2026-09-11/plan-seguimiento.json`.
- La visibilidad correcta de NPC requiere decisión transversal sobre el contrato público de contactos.
- El endurecimiento final de `PlayerView.ageMilestones` puede hacerse transversalmente sin modificar el snapshot persistente.
- El APK candidato de CI debe verificarse por SHA antes de la prueba física.

## PR

PR #14 `presentation/android-playcanvas` → `main`: **DRAFT mientras se ejecutan los gates**. No hacer merge desde este workstream. Cuando el HEAD exacto tenga CI verde podrá marcarse listo para revisión, manteniendo T3.4 abierta hasta la evidencia física.
