# Workstream · Presentation / Android / PlayCanvas

Branch: `presentation/android-playcanvas`  
PR: #14 `presentation/android-playcanvas` → `main`  
Estado PR: **DRAFT / software verde; T3.4 pendiente de evidencia en teléfono físico**.

## Estado ejecutivo

- T3.1: cerrada.
- T3.2: cerrada.
- T3.3: cerrada técnicamente; paquete Android offline y candidato APK verificable disponibles.
- T3.4: **pendiente de evidencia en teléfono Android físico**. CI/emulador no la cierran.
- T4.6: flujo Inicio → Carrera → Mundo → Relaciones → Perfil → Tu partida revisado.
- Base integrada y validada: `main@171ecacc0a3619aabffcee30b84c3ba2d2438632`.
- HEAD de código validado: `74c953058eb8672b34651ad6b2156afcec47932b`.
- Reconciliación: `behind_by: 0`; diff contra `main`: **22 archivos**, todos del perímetro presentación/Android/CI/documentación propia.
- No se modifican desde este workstream canon narrativo, `src/session/*`, `project/PLAN_PASADAS.md` ni `analysis/2026-09-11/plan-seguimiento.json`.
- PR #14 permanece `mergeable: true` y DRAFT.

## Frontera de jugador

`web/player-session-api.js` encapsula el acceso player-facing a `GameSession`.

- La seed placeholder histórica `424242` del primer arranque se sustituye por un `uint32` generado mediante `crypto.getRandomValues`.
- Seeds explícitas distintas se reenvían sin cambios; QA/headless conserva determinismo.
- `fromSave()` sigue siendo estricto.
- Solo ante `CONTENT_CHANGED` se delega en la API pública `GameSession.migrateFromSave()`.
- La presentación no reimplementa lineage, provenance, historial, RNG, seeds ni migraciones.
- La base conserva la ruta PRE → B1a → T5.10 y evidencia histórica fail-closed.

## Autoridad de ofertas, provenance y transiciones

La rama consume, sin duplicar lógica de dominio, los contratos actuales de `main`:

- offer/session authority bridge;
- validación de disposición de oferta ligada a provenance histórica exacta (`sourceContentIdentity + eventFingerprint + eventId + choiceId`);
- prioridad de transición obligatoria en fronteras de fase;
- hecho causal de solo lectura `facts.clubWantsRenewal`.

La UI no calcula ni muta términos contractuales. Si `GameSession` materializa una oferta como escena narrativa, la presentación recibe `screen: "decision"` y usa `choose`; si queda como oferta ordinaria, recibe `screen: "offer"` y usa el comando `offer`.

Los nuevos contratos no cambian la identidad activa del contenido por sí mismos y se validan en los gates del repositorio antes de empaquetar Android.

## Relaciones / T5.3

Web, PlayCanvas y Android consumen el contrato público de contactos conocidos por el protagonista.

- No se infiere visibilidad desde conocimiento privado, relaciones, access, flags, seeds o `npcRefs`.
- No se exponen agendas, memoria privada ni conocimiento secreto NPC.
- El bloqueo de visibilidad de Relaciones está resuelto.

## Endurecimiento de presentación

- seed visible/editable eliminada;
- firmas internas de milestones no renderizadas;
- lenguaje de producto para persistencia local;
- safe areas + `viewport-fit=cover`;
- objetivos táctiles de 44 px;
- soporte <=380 px, landscape, overscroll y `prefers-reduced-motion`;
- misma capa móvil en web, PlayCanvas y Android offline;
- feedback de exportación Android (`saved`, `cancelled`, `error`);
- Android Back y pausa/reanudación cubiertos por `OfflineProbe`;
- cambios de vista mueven foco al `<main>`;
- navegación usa `aria-current`;
- errores usan `role="alert"` y estados dinámicos usan semántica live/status;
- navegación y choices soportan recorrido con flechas.

No se muestran IDs de seed, RNG, flags internas, conocimiento NPC secreto ni rutas futuras.

## Android offline

Se mantiene:

- `WebViewAssetLoader` con origen local seguro;
- sin permiso `INTERNET`;
- `usesCleartextTraffic=false`;
- navegación externa bloqueada;
- acceso directo `file://`/contenido deshabilitado;
- assets críticos locales;
- IndexedDB;
- Storage Access Framework para importar/exportar;
- versión instalada obtenida mediante `PackageManager`.

## CI exacto del HEAD validado

Todos los siguientes gates son **SUCCESS** sobre `74c953058eb8672b34651ad6b2156afcec47932b`:

### Repository Integrity

Run **#858** (`35136695403`).

Incluye:

- `npm test` con T5.1 lineage/source-policy, T5.10 23–26 y migraciones;
- offer/session bridge + provenance histórica exacta;
- prioridad de transición y hecho causal de renovación;
- T5.2 lifecycle/deferred;
- T5.3 epistemic/transmission/contact contract;
- freeze/source sentinels;
- determinismo y aislamiento RNG;
- límites de edad y referencias de contenido;
- carreras largas;
- lifecycle audit y probes cross-workstream;
- simulación estratificada;
- `qa:presentation` completo.

### T5.1 choice eligibility

Run **#188** (`35136695425`): **SUCCESS**.

### T5.1 offer/session bridge

Run **#53** (`35136695362`): **SUCCESS**.

### Android presentation candidate

Run **#66** (`35136695337`): **SUCCESS**.

Pasan regresión de presentación, paquete Android offline, compilación Java 17 / Gradle 8.9 / API 35, informe T3.3, verificación de huellas y publicación de artefactos.

## APK candidato #66

Versión `0.8.0`, versionCode `1`.

- tamaño: **8.971.848 bytes**;
- SHA-256 exacto del APK firmado: `cd573ebf2c674e0cbe9e19f1629dcb43999a7521bf95377defe15f8b4ebd614a`;
- `payloadSha256`: `11e3002ffba2dda9ddeff4c0a717a1205fb0fc2058132b6dc5754c241199bc80`;
- entradas incluidas en payload: **228**;
- contenedor de firma excluido: `META-INF/CERT.RSA`;
- digest del ZIP de artefacto GitHub: `sha256:0d01d3ca7894a881a29ba652d9e9a8fcf0add7c8cf8ae85c33a5c93850d7222e`.

El SHA exacto, tamaño, número de entradas y `payloadSha256` fueron recalculados independientemente tras descargar el artefacto y coinciden con `analysis/2026-09-15/T3.3-apk-build.json`.

La huella estable incluye `CERT.SF` y `MANIFEST.MF`; solo excluye contenedores de certificado `META-INF/*.RSA|*.DSA|*.EC`. No se compromete una clave privada fija.

El candidato #65 queda supersedido porque los cambios de runtime QA-018/transition/renewal modifican el payload empaquetado. #66 es el candidato técnico actual para la prueba física; **no** acredita T3.4.

## T3.4 · evidencia física no destructiva

Comando:

```bash
npm run android:physical:evidence -- <SERIAL_FISICO> [RUTA_APK_CANDIDATO]
```

El recolector:

- rechaza `emulator-*` y señales QEMU;
- no instala APK, no ejecuta `pm clear`, no desinstala ni cambia modo avión;
- registra fabricante/modelo, Android/SDK/fingerprint, WebView y paquete instalado;
- calcula SHA-256 del APK candidato local;
- intenta calcular de forma no destructiva el SHA-256 del `base.apk` instalado y registrar si coincide con el candidato cuando Android permite leerlo;
- mide arranque frío/caliente con `am start -W`;
- escribe `analysis/2026-09-15/T3.4-physical-evidence.json`;
- mantiene `t34Closed: false` y checks manuales a `false` hasta completar la prueba real.

Para cerrar T3.4 faltan en hardware real: modo avión/offline, creación y avance, decisión, oferta/bridge cuando aparezca, cierre/reanudación, Android Back, export guardada/cancelada, import válida, rechazo de JSON corrupto sin pérdida, recuperación de copia, safe areas/textos largos/scroll/selectores, runtime metadata y evidencias de esa misma ejecución.

## Límites y estado de PR

- Save QA #22: **resuelto**.
- T5.1 Session/content migration + lineage/source evidence: **integrado y verde**.
- T5.1 offer/session authority bridge: **integrado y verde**.
- T5 QA-018 provenance-bound offer disposition: **integrado y verde**.
- Mandatory transition priority: **integrado y verde**.
- Club renewal intent causal fact: **integrado y verde**.
- T5.10 primer lote canónico 23–26 + migración: **integrado y verde**.
- T5.2 lifecycle/deferred/OR auditing: **integrado y verde**.
- T5.3 contactos públicos conocidos: **integrado y verde**.
- Web / PlayCanvas / Android software gates: **verdes**.
- APK candidato + fingerprint de payload: **verde**.
- **T3.4 física: pendiente; requiere hardware real**.

PR #14 permanece **DRAFT** y este workstream no realiza el merge.
