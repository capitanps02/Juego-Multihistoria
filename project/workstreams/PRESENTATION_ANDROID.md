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
- Base funcional integrada y validada: `main@de2af6b698d22343a1b7dadf63fb857ddeef5aec` (T5.10 primer lote canónico 23–26).
- `main@30ae3f27ddcb846f59f049e3a4536276f3e9a97e` añade únicamente historia de coordinación y conserva exactamente el mismo árbol `f531c1845ad49120e1864737229bf68a3d1fa09e`.
- HEAD de código validado: `16489907e068aaa0817548c8420a59e01dc12967`.
- HEAD sincronizado tras absorber el commit de coordinación sin cambios de árbol: `ae770f037a915f170ac58f5f04c1eae4d7428b07`.
- Reconciliación: `behind_by: 0`; diff contra main: **22 archivos**, todos del perímetro presentación/Android/CI/documentación propia.
- No se modifican desde este workstream `src/session/*`, canon narrativo, `project/PLAN_PASADAS.md` ni `analysis/2026-09-11/plan-seguimiento.json`.
- Contrato público de contactos de Relaciones: **resuelto e integrado**.

## Frontera de jugador

`web/player-session-api.js` encapsula el acceso player-facing a `GameSession`.

- La seed placeholder histórica `424242` del primer arranque se sustituye por un `uint32` generado mediante `crypto.getRandomValues`.
- Seeds explícitas distintas se reenvían sin cambios; QA/headless conserva determinismo.
- `fromSave()` sigue siendo estricto.
- Solo ante `CONTENT_CHANGED` se delega en la API pública `GameSession.migrateFromSave()`.
- La presentación no reimplementa lineage, provenance, historial, RNG, seeds ni migraciones.
- La base actual incorpora migración de contenido multigeneración fail-closed, preservación de fuentes post-B1a y la ruta PRE → B1a → T5.10.

## Oferta / contrato / autoridad de sesión

La base actual integra el puente narrativo T5.1 oferta/contrato/sesión.

- La UI no calcula ni muta términos de contrato.
- Si `GameSession` convierte una oferta pendiente en escena narrativa, presentación recibe `screen: "decision"` y responde mediante el comando `choose`.
- Si no existe bridge narrativo aplicable, recibe `screen: "offer"` y responde mediante el comando `offer`.
- No se duplica `respondToOffer`, elegibilidad, bridge metadata ni autoridad contractual en web/PlayCanvas/Android.
- El workflow dedicado `T5.1 offer session bridge` y las regresiones existentes pasan sobre la rama de presentación.

## Relaciones / T5.3

Web, PlayCanvas y Android consumen `getKnownPlayerContacts(session)` en la frontera de jugador.

- No se infiere visibilidad desde conocimiento privado, relaciones, access, flags, seeds o `npcRefs`.
- `PlayerView.contacts` legacy puede seguir transportando el catálogo completo por compatibilidad, pero la vista player-facing lo sustituye por la proyección pública de contactos conocidos.
- No se exponen agendas, memoria privada ni conocimiento secreto NPC.

**Bloqueo de Relaciones: resuelto.**

## Endurecimiento de presentación

- seed visible/editable eliminada;
- firmas internas de milestones no renderizadas;
- lenguaje de producto para persistencia local;
- safe areas + `viewport-fit=cover`;
- objetivos táctiles de 44 px;
- soporte <=380 px, landscape, overscroll y `prefers-reduced-motion`;
- misma capa móvil en web, PlayCanvas y Android offline;
- feedback de exportación Android (`saved`, `cancelled`, `error`);
- Android Back y pausa/reanudación cubiertos por `OfflineProbe`.

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

## CI exacto del árbol validado T5.10

### Repository integrity

Run **#816** (`35128214447`): **SUCCESS** sobre `16489907...`.

Incluye:

- `npm test` con T5.1 lineage multigeneración, registro post-B1a/source-policy, offer/session bridge y primer lote T5.10 23–26;
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

Run **#158** (`35128214461`): **SUCCESS**.

### T5.1 offer/session bridge

Run **#23** (`35128214465`): **SUCCESS**.

### Android presentation candidate

Run **#63** (`35128214450`): **SUCCESS** sobre el mismo árbol de código.

Pasan regresión de presentación, paquete Android offline, compilación Java 17 / Gradle 8.9 / API 35, informe T3.3, verificación de huellas y publicación de artefactos.

## APK candidato #63

Versión `0.8.0`, versionCode `1`.

- tamaño: **8.964.787 bytes**;
- SHA-256 exacto del APK firmado: `12ecccc0897f27f9eb93c75adf59f71700dcc100b1c86a3d3483c5fa16303500`;
- `payloadSha256`: `2611690e439968b8761833f5eb6dfd1357c31d870d8d1f1ba4ec6933039cd6eb`;
- entradas incluidas en payload: **222**;
- contenedor de firma excluido: `META-INF/CERT.RSA`;
- digest del ZIP de artefacto GitHub: `sha256:02823196f9992b7b19c8ce26c5bebb5fc1ae9fc736092589ba9d88ca55f125b1`.

El SHA exacto, tamaño, número de entradas y `payloadSha256` fueron recalculados independientemente tras descargar el artefacto y coinciden con `analysis/2026-09-15/T3.3-apk-build.json`.

La huella estable incluye `CERT.SF` y `MANIFEST.MF`; solo se excluyen contenedores de certificado `META-INF/*.RSA|*.DSA|*.EC`. No se compromete una clave privada fija.

Este APK es candidato técnico para la prueba física; **no** acredita T3.4.

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
- T5.10 primer lote canónico 23–26 + migración: **integrado y verde**.
- T5.2 lifecycle/deferred/OR auditing: **integrado y verde**.
- T5.3 contactos públicos conocidos: **integrado y verde**.
- Web / PlayCanvas / Android software gates: **verdes**.
- APK candidato + fingerprint de payload: **verde**.
- **T3.4 física: pendiente; requiere hardware real**.

PR #14 permanece **DRAFT** y este workstream no realiza el merge.
