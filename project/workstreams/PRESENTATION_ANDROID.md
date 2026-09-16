# Workstream · Presentation / Android / PlayCanvas

Branch: `presentation/android-playcanvas`  
PR: #14 `presentation/android-playcanvas` → `main`  
Estado PR: **DRAFT / pendiente del contrato público de Relaciones y de la evidencia física T3.4**.

## Estado ejecutivo

- T3.1: cerrada.
- T3.2: cerrada.
- T3.3: cerrada técnicamente; paquete Android offline y candidato APK verificable disponibles.
- T3.4: **pendiente de evidencia en teléfono Android físico**. Emulador y CI no la cierran.
- T4.6: flujo Inicio → Carrera → Mundo → Relaciones → Perfil → Tu partida revisado.
- Base integrada: `main@edfda9e2cd8b70a421491b8be31507745da0f59b` (T5.2 + T5.3).
- HEAD de código validado en CI: `c865c74f1595509e4b24b19b257b1810a47b695f`.
- Diff tras la reconciliación: **21 archivos**, todos dentro del perímetro presentación/Android/CI/documentación propia; `behind_by: 0`.

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

T5.3 ya está **integrado en `main`** mediante `edfda9e2...`.

Su frontera de presentación mantiene deliberadamente `PlayerView.contacts` con las 20 identidades básicas del catálogo y declara fuera de alcance redefinir qué NPC conoce el protagonista. T5.3 sí protege conocimiento, memoria, transmisión causal y relaciones privadas, pero no añade una señal pública de introducción/conocimiento del protagonista.

Por tanto, la UI todavía no dispone de una señal pública fiable para filtrar Relaciones. Presentación no inferirá esa condición desde memoria secreta, flags, seeds, `npcRefs`, conocimiento NPC ni relaciones internas.

Contrato todavía requerido:

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

## Evidencia de APK: artefacto firmado vs payload

Los runs Android #29 y #30 demostraron una propiedad importante del build debug de CI: dos ejecuciones con el mismo payload podían producir SHA exactos distintos porque un runner limpio genera un certificado debug efímero nuevo. La comparación entrada a entrada mostró que la única diferencia era `META-INF/CERT.RSA`; `CERT.SF`, `MANIFEST.MF` y el resto del APK eran idénticos.

No se ha introducido una clave privada fija en el repositorio.

`scripts/build-android-apk.mjs` registra ahora dos huellas:

1. `apk.sha256`: SHA-256 exacto del APK firmado de ese run;
2. `apk.payloadSha256`: huella estable de los contenidos ZIP ordenados excluyendo únicamente contenedores de certificado `META-INF/*.RSA|*.DSA|*.EC`.

`CERT.SF` y `MANIFEST.MF` **sí** forman parte del fingerprint estable. El workflow exige ambas huellas para considerar válido el candidato.

Validación retrospectiva #29/#30 con esta política:

- 196 entradas de payload;
- única exclusión: `META-INF/CERT.RSA`;
- `payloadSha256` idéntico: `48eee5e6c8683091f003063bd761819f04de984176bd36acee235f48fd55cbfb`.

El cambio de payload posterior a T5.2/T5.3 es esperado y queda identificado por una huella nueva.

## APK candidato del HEAD `c865c74f...`

Workflow `Android presentation candidate` run **#34** (`35113965506`): **SUCCESS**.

- versión: `0.8.0`, versionCode `1`;
- tamaño: **8.547.466 bytes**;
- SHA-256 exacto del APK firmado: `75151abe778e10137abd96e14f4b97658955c5f9ff9f263d2bdcfa40c894fbea`;
- `payloadSha256`: `01cf73900bba00f54b9289c4ce84888d1be80cb28d053cf5e2f448fdaaf756c2`;
- entradas incluidas en payload: **200**;
- contenedor de firma excluido: `META-INF/CERT.RSA`;
- SHA exacto y payload recalculados de forma independiente tras descargar el artefacto y coinciden con `analysis/2026-09-15/T3.3-apk-build.json`.

ZIP de artefacto GitHub: `sha256:5ce8cee77d66cebbb8bafaa2f8e1ed25349d5bbfcc0737bbec824cc2e55bc548`.

Este APK es candidato técnico para la prueba física; **no** constituye evidencia de T3.4 completada.

## CI / QA del HEAD `c865c74f...`

### Repository integrity

Run **#516** (`35113965409`): **SUCCESS**.

Pasan:

- estructura del repositorio;
- `npm ci`;
- `npm test`, incluidos T5.2 handoff, T5.3 epistemic/transmission y baseline schema-8 de saves;
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

Run **#34**: **SUCCESS**.

Pasan:

- regresión de presentación;
- paquete Android offline;
- compilación APK con Java 17 / Gradle 8.9 / API 35;
- informe T3.3;
- verificación de SHA exacto y `payloadSha256`;
- publicación de artefactos de diagnóstico y candidato.

## #22 · save baseline v8

**RESUELTO / CERRADO. Ya no bloquea presentación.**

`main` contiene la corrección del baseline v8 y el hardening que hace el gate v8 de solo lectura y bloquea el hash exacto del save comprometido. Presentación no modifica runtime de saves ni relaja tests.

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

### Evidencia física pendiente

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
- no se corrige save/lifecycle/NPC memory desde presentación;
- no se infiere conocimiento del protagonista desde estado privado;
- no se hace merge desde este workstream.

## PR

PR #14 permanece **DRAFT**.

Situación actual:

1. save QA #22 → **resuelto**;
2. integración T5.2/T5.3 en la rama → **resuelta y verde**;
3. Android candidate con fingerprint de payload → **verde**;
4. contrato público de contactos de Relaciones → **pendiente**;
5. T3.4 física → **pendiente y requiere hardware real**.

La deuda de seed fija de primera partida permanece **resuelta y validada**.
