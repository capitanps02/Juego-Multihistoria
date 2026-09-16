# Workstream · Presentation / Android / PlayCanvas

Branch: `presentation/android-playcanvas`  
PR: #14 `presentation/android-playcanvas` → `main`  
Estado PR: **DRAFT / software verde; T3.4 pendiente de evidencia en teléfono físico**.

## Estado ejecutivo

- T3.1: cerrada.
- T3.2: cerrada.
- T3.3: cerrada técnicamente; paquete Android offline y candidato APK verificable disponibles.
- T3.4: **pendiente de evidencia en teléfono Android físico**. Emulador y CI no la cierran.
- T4.6: flujo Inicio → Carrera → Mundo → Relaciones → Perfil → Tu partida revisado.
- Base integrada y última comprobación de `main`: `46c5f729a8252d5b7ca244ad9e9d9a110098fb09`.
- HEAD de código validado en CI: `b45c1a2c21680b0453f64a9e766fee6509993c0c`.
- Diff contra esa base: **22 archivos**, todos dentro del perímetro presentación/Android/CI/documentación propia; `behind_by: 0`.
- Contrato público de contactos de Relaciones: **resuelto e integrado**.

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
- `OfflineProbe` cubre Android Back y pausa/reanudación sin modificar el save exacto;
- Relaciones utiliza únicamente la proyección pública de NPC conocidos por el protagonista.

No se muestra seed ID, RNG, flags internas, agendas/conocimiento secreto NPC ni firmas de rutas internas.

## Adaptador de sesión de jugador

`web/player-session-api.js` encapsula el acceso del jugador a `GameSession`.

### Carrera nueva

- El placeholder histórico `424242` usado por el primer arranque se sustituye por un `uint32` obtenido con `crypto.getRandomValues`.
- Seeds explícitas distintas se reenvían sin modificación.
- Los tests del motor siguen llamando a `GameSession` directamente y conservan reproducibilidad.

### Saves y Session v3 / T5.1

- El adaptador intenta primero `GameSession.fromSave()` de forma estricta.
- Solo si el motor responde `CONTENT_CHANGED` usa la ruta pública `GameSession.migrateFromSave()`.
- `INVALID_SAVE`, identidades desconocidas y `CONTENT_MIGRATION_UNSUPPORTED` continúan fallando de forma explícita.
- La presentación no implementa migración propia ni reescribe historial, provenance, seeds o RNG.
- `ENGINE_ONLY_HISTORY`, freeze transition y rutas de migración permanecen propiedad del motor/T5.1.

### Contactos conocidos / T5.3

`main` integra el contrato deny-by-default mediante:

- `knownPlayerContacts(state)`;
- `getKnownPlayerContacts(session)`;
- reglas explícitas de introducción basadas en historial resuelto.

La presentación no usa `npcRefs`, relaciones, access, flags, seeds ni conocimiento privado para decidir si alguien aparece en Relaciones.

`PlayerView.contacts` legacy continúa transportando las 20 identidades del catálogo por compatibilidad. La frontera de jugador sustituye únicamente la vista pública `contacts` por `getKnownPlayerContacts(session)` y delega `dispatch`/`exportSnapshot` al `GameSession` real.

Esto se aplica de forma común a:

- web (`web/local.js`);
- PlayCanvas (`scripts/build-playcanvas.mjs` incluye `src/session/player-contacts.ts`);
- Android offline (`scripts/build-android-offline.mjs` importa `dist/session/player-contacts.js`).

El conjunto inicial conservador lo define T5.3, no presentación: Nano, Elena, Julián, Mara y Dani. Las incorporaciones dinámicas se añaden únicamente mediante reglas canónicas explícitas; la primera regla integrada permite que `EVT_18_PRE_001 / CALL_RIVAS` introduzca a Julián Rivas.

**Bloqueo de Relaciones: resuelto.**

`PlayerView.ageMilestones` todavía transporta campos internos que la UI no lee. Endurecimiento futuro recomendado: proyectar exclusivamente los campos visibles en el ViewModel.

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

`scripts/build-android-apk.mjs` registra dos huellas:

1. `apk.sha256`: SHA-256 exacto del APK firmado de ese run;
2. `apk.payloadSha256`: huella estable de los contenidos ZIP ordenados excluyendo únicamente contenedores de certificado `META-INF/*.RSA|*.DSA|*.EC`.

`CERT.SF` y `MANIFEST.MF` sí forman parte del fingerprint estable. No se introduce una clave privada fija en el repositorio.

## APK candidato del HEAD `b45c1a2c...`

Workflow `Android presentation candidate` run **#52** (`35124098471`): **SUCCESS**.

- versión: `0.8.0`, versionCode `1`;
- tamaño: **8.691.886 bytes**;
- SHA-256 exacto del APK firmado: `83650120af602cebc8c562acb9b67912885f7c44ffec5c1fabcdc03d17e62807`;
- `payloadSha256`: `8ec600cef9f0b54e4bf8b8c51973fca945cb24bb1c6be44994d07e231b55103e`;
- entradas incluidas en payload: **214**;
- contenedor de firma excluido: `META-INF/CERT.RSA`;
- SHA exacto, payload SHA, tamaño y número de entradas fueron recalculados de forma independiente tras descargar el artefacto y coinciden con `analysis/2026-09-15/T3.3-apk-build.json`.

Digest del ZIP de artefacto GitHub: `sha256:eb2f54fc84f3454812084890463ec43d83e51688dd709b79217408553f8ed57f`.

Este APK es candidato técnico para la prueba física; **no** constituye evidencia de T3.4 completada.

## CI / QA del HEAD `b45c1a2c...`

### Repository integrity

Run **#700** (`35124098501`): **SUCCESS**.

Pasan:

- estructura del repositorio y `npm ci`;
- `npm test`, incluyendo T5.1 Session v3/content migration/freeze transition, T5.2 deferred consequences + consumidores OR, T5.3 knowledge/transmission/contact contract y save schema 8;
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

### T5.1 choice eligibility

Run **#112** (`35124098488`): **SUCCESS**.

### Android presentation candidate

Run **#52**: **SUCCESS**.

Pasan:

- regresión de presentación, incluido el adaptador de contactos conocidos;
- paquete Android offline con la API pública de contactos;
- compilación APK con Java 17 / Gradle 8.9 / API 35;
- informe T3.3;
- verificación de SHA exacto y `payloadSha256`;
- publicación de artefactos de diagnóstico y candidato.

## #22 · save baseline v8

**RESUELTO / CERRADO. Ya no bloquea presentación.**

La corrección del baseline y el hardening del gate permanecen en `main`. Presentación no modifica runtime de saves ni relaja tests.

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

- no se modifica canon narrativo desde presentación;
- no se editan `project/PLAN_PASADAS.md` ni `analysis/2026-09-11/plan-seguimiento.json`;
- no se reimplementan save/lifecycle/NPC memory/content migration desde presentación;
- no se infiere conocimiento del protagonista desde estado privado;
- no se hace merge desde este workstream.

## PR

PR #14 permanece **DRAFT**.

Situación actual:

1. save QA #22 → **resuelto**;
2. T5.1 Session v3 / content migration → **integrado y verde**;
3. T5.2 lifecycle/deferred/OR audit → **integrado y verde**;
4. T5.3 conocimiento NPC + contrato público de contactos → **integrado y verde**;
5. presentación web/PlayCanvas/Android → **verde**;
6. Android candidate + fingerprint de payload → **verde**;
7. T3.4 física → **pendiente y requiere hardware real**.

La deuda de seed fija de primera partida permanece resuelta y validada. El único cierre de plataforma que no puede acreditarse desde CI es T3.4 en hardware físico.
