# Workstream · Presentation / Android / PlayCanvas

Branch: `presentation/android-playcanvas`  
PR: #14 `presentation/android-playcanvas` → `main`  
Estado PR: **DRAFT / pendiente del contrato público de Relaciones**.

## Estado ejecutivo

- T3.1: cerrada.
- T3.2: cerrada.
- T3.3: cerrada técnicamente; paquete Android offline y APK reproducible disponibles.
- T3.4: **pendiente de evidencia en teléfono Android físico**. Emulador y CI no la cierran.
- T4.6: flujo Inicio → Carrera → Mundo → Relaciones → Perfil → Tu partida revisado.
- Base integrada y merge-base de la rama: `main@cd39dfc387713ee43cd5b80c34a0e32a0cc996c0`.
- HEAD de código validado en CI: `f334a95942826e59ba33fb7a5e214ce0beadaa41`.
- Diff contra `main`: **20 archivos**, todos dentro del perímetro presentación/Android/CI/documentación propia; `behind_by: 0` en la reconciliación.

## Cambios de producto

- eliminada la seed visible/editable de **Tu partida**;
- tanto la primera carrera de una instalación nueva como **Empezar otra carrera** obtienen origen interno aleatorio en la frontera de presentación;
- el motor `GameSession` permanece determinista cuando QA/headless entrega una seed explícita;
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

## Contrato público de Relaciones / T5.3

`PlayerView.contacts` sigue publicando las 20 identidades básicas del catálogo.

PR #9 de T5.3 continúa abierto. Su propia frontera de presentación confirma que T5.3 protege `knowledge`, memoria y relaciones privadas, pero **no redefine unilateralmente qué NPC conoce el protagonista** y mantiene las 20 entradas de `contacts`.

Por tanto, la UI todavía no dispone de una señal pública fiable para filtrar Relaciones. Presentación no inferirá esa condición desde memoria secreta, flags, seeds, `npcRefs` ni relaciones internas.

Contrato esperado:

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

Comando:

```bash
npm run android:physical:evidence -- <SERIAL_FISICO>
```

El recolector:

- rechaza seriales `emulator-*` y señales `ro.kernel.qemu` / `ro.boot.qemu`;
- no instala APK, no ejecuta `pm clear`, no desinstala ni cambia modo avión;
- registra fabricante/modelo, Android/SDK/fingerprint, WebView y versión del paquete instalado;
- calcula SHA-256 del APK local si está disponible;
- mide arranque frío/caliente con `am start -W`;
- escribe `analysis/2026-09-15/T3.4-physical-evidence.json`;
- deja expresamente `t34Closed: false` y los checks manuales a `false`.

El gate `physical T3.4 evidence collection is hardware-only and non-destructive` pasa en CI.

## APK candidato exacto del HEAD `f334a959...`

Workflow `Android presentation candidate` run **#29** (`35112209256`): **SUCCESS**.

- versión: `0.8.0`, versionCode `1`;
- tamaño del APK: **8.540.096 bytes**;
- SHA-256 del APK: `7356eb01f6e702e395f87612ff2e314799634d6703cb9794ccad656b2f68b23f`;
- hash recalculado de forma independiente sobre el APK descargado de CI;
- coincide exactamente con `analysis/2026-09-15/T3.3-apk-build.json`.

El ZIP del artefacto de GitHub tiene digest `sha256:bb194784343cafd947fdb359e8b2e5ff3522f54484309668646f8c1c457b8d79`.

Este APK es candidato técnico para la prueba física; **no** constituye evidencia de T3.4 completada.

## CI / QA del HEAD `f334a959...`

### Repository integrity

Run **#474** (`35112209445`): **SUCCESS**.

Pasan:

- estructura del repositorio;
- `npm ci`;
- `npm test`, incluido baseline/schema-8 de saves;
- build T5;
- freeze sentinel T5.1;
- determinismo y aislamiento RNG;
- límites de edad;
- referencias de contenido;
- carreras largas;
- lifecycle audit;
- probes cross-workstream;
- simulación estratificada;
- `qa:presentation` completo: presentación + PlayCanvas + Android offline.

### Android presentation candidate

Run **#29**: **SUCCESS**.

Pasan:

- regresión de presentación;
- paquete Android offline;
- compilación APK con Java 17 / Gradle 8.9 / API 35;
- informe T3.3;
- verificación de SHA del APK;
- publicación de artefactos de diagnóstico y candidato.

## #22 · save baseline v8

**RESUELTO / CERRADO. Ya no bloquea presentación.**

`main` incorporó la corrección del baseline v8 y posteriormente el hardening `cd39dfc...`, que hace el gate v8 de solo lectura y bloquea el hash exacto del save comprometido. El workstream de presentación no modificó runtime de saves ni relajó tests.

El resultado observable tras el re-ground es `npm test` + `Repository integrity` completamente verde.

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

PR #14 permanece **DRAFT**.

Situación tras `f334a959...`:

1. ~~resolver #22 / save QA~~ → **resuelto y CI verde**;
2. resolver el contrato público de contactos de Relaciones → **pendiente**;
3. Android candidate sobre el código reconciliado → **verde**;
4. T3.4 física → **sigue abierta y requiere hardware real**.

La deuda de seed fija de primera partida permanece **resuelta y validada**.
