# PROMPT MAESTRO — CONTINUAR MULTIHISTORIA T5.1 DESDE GITHUB

Quiero que continúes mi proyecto **Multihistoria / Juego historia futbolista** trabajando directamente sobre GitHub.

## REPOSITORIO
- GitHub: `capitanps02/Juego-Multihistoria`
- GitHub es la **fuente de verdad operativa**.
- El Documento Maestro de Carrera Futbolista es la **fuente de verdad narrativa/canónica**.
- No trabajes sobre copias locales como fuente principal si GitHub está disponible.
- No modifiques `main` directamente para trabajo significativo.
- Usa ramas de tarea + PR.
- NO hagas merge a `main` salvo que yo diga explícitamente **"fusiona"**.

## PRIMERA TAREA OBLIGATORIA: COMPROBAR GITHUB
Antes de continuar cualquier análisis o desarrollo:
1. Comprueba que puedes leer `capitanps02/Juego-Multihistoria`.
2. Lee `project/CODEX_QUEUE.md`.
3. Lee `AGENTS.md`.
4. Revisa el estado de los PR #1, #3, #5 y #7.
5. Haz una prueba de escritura REAL y segura en la rama `chore/chatgpt-codex-workflow`:
   - preferiblemente subiendo/actualizando uno de los documentos T5.1 adjuntos,
   - y vuelve a leerlo para verificar que la escritura quedó guardada.
6. Si GitHub no permite leer + escribir, DETENTE y dímelo. No sigas generando trabajo fuera de GitHub.

## CONTRATO CHATGPT ↔ CODEX
ChatGPT se encarga de:
- inspección del repositorio;
- arquitectura y análisis de código;
- documentación;
- especificaciones;
- auditorías;
- decisiones semánticas/canónicas;
- cambios pequeños y seguros;
- crear ramas/issues/PRs;
- preparar tareas ejecutables para Codex;
- revisar los cambios que haga Codex.

Codex se usa para:
- implementación amplia multiarchivo;
- refactors;
- regeneración de artefactos;
- ciclos build/test;
- cambios extensos.

Comandos:
- **"continúa"** → ChatGPT sigue haciendo tareas que puede resolver.
- **"prepara para Codex"** → deja una tarea completamente especificada.
- **"ejecuta Codex"** → lanza SOLO el primer item READY de `project/CODEX_QUEUE.md`, salvo que yo indique otro PR.
- **"revisa Codex"** → revisa diff/tests/alcance.
- **"corrige con Codex"** → envía instrucción correctiva.
- **"fusiona"** → solo entonces merge, si previamente está revisado.

Nunca ejecutes Codex automáticamente por un “continúa”.

## ESTADO ACTUAL DE LA COLA ANTES DEL HANDOFF
Reconstrúyelo desde GitHub antes de actuar, pero el último estado conocido era:

1. **READY — PR #3 — T5.1 Batch 01 ages 20–23**
   - branch: `task/t5.1-batch-01`
   - es el primer objetivo cuando yo diga `ejecuta Codex`.

2. **READY — PR #7 — T5.1 Batch 02B age 26 + seed chronology**
   - branch: `task/t5.1-batch-02b`
   - debe ejecutarse después de PR #3.

3. **BLOCKED-BY-#7 — PR #5 — T5.1 Batch 02A exact-title semantic repairs**
   - branch: `task/t5.1-batch-02a`
   - antes de ejecutarlo hay que integrar/rebasar el resultado revisado de #7.

No lances varios lotes solapados en paralelo.

## WORKFLOW YA EXISTENTE
Debe existir en GitHub:
- `AGENTS.md`
- `project/CHATGPT_CODEX_WORKFLOW.md`
- `project/CODEX_QUEUE.md`

PR #1:
- `chore: establish ChatGPT ↔ Codex GitHub workflow`
- branch: `chore/chatgpt-codex-workflow`
- no fusionar hasta que yo diga `fusiona`.

## REGLAS TÉCNICAS NO NEGOCIABLES
1. RNG streams separados: `narrative`, `football`, `microfeed`, `qa`.
2. Las lecturas nunca consumen RNG.
3. Activar/desactivar microfeeds no puede alterar resultados narrativos fuertes.
4. Save integrity:
   - revision checks;
   - idempotent commands;
   - commit-before-publish;
   - cambios de content identity requieren migración o incompatibilidad explícita.
5. No debilitar `contentIdentity`.
6. No reescribir silenciosamente historial antiguo:
   - un viejo `SEEN_old` NO se convierte automáticamente en `SEEN_new` si el jugador nunca vio la escena canónica.
7. No tomar decisiones irreversibles por el jugador sin delegación explícita.
8. `verified` NO significa fidelidad completa.
9. Un evento solo puede considerarse plenamente verificado tras revisar:
   - ID;
   - fase/edad;
   - título;
   - trigger/gates;
   - información visible;
   - información incierta;
   - choices;
   - outcomes/resolución;
   - seeds read/write/origin;
   - NPC refs;
   - transición/hard deadline si aplica;
   - compatibilidad de save.
10. No editar manualmente `dist/` ni bundles generados.
11. `src/` es la autoridad del motor.
12. Presentation layer debe permanecer desacoplada de narrativa/RNG.

Validación base:
- `npm run build`
- `npm run validate`
- según scope:
  - `npm run test:session`
  - `npm run test:saves`
  - `npm run test:offers`
  - `npm run test:persistence`
  - `npm run test:playcanvas`
  - `npm run test:android:offline`
  - `npm run audit:t51`
  - `npm run test:t51`

No usar `qa:1000` salvo necesidad explícita.

# T5.1 — OBJETIVO REAL
T5.1 NO es un simple renombrado de IDs.

La auditoría P1 encontró:
- 388 eventos estructurados:
  - 254 principales
  - 134 condicionales
- solo 214/388 IDs runtime coinciden exactamente con IDs canónicos;
- deriva total: **174 IDs**:
  - **87 principales**
  - **87 condicionales**
- `verified` tampoco certifica semántica completa;
- había fuerte reutilización de cuerpos y choice sets genéricos.

Por tanto T5.1 tiene dos carriles:
1. **Identity reconciliation**
2. **Semantic / causal verification**

La T5.1 solo está terminada cuando:
- los 388 IDs runtime están reconciliados;
- no hay extras ni duplicados;
- el crosswalk legacy→canon está resuelto;
- la semántica canónica está verificada;
- las seeds tienen cronología correcta;
- la migración de saves es verdadera;
- los flujos de retirada/epílogo son correctos;
- los tests longitudinales y terminales pasan.

## PRINCIPALES — MAPA YA PREPARADO
Los documentos adjuntos incluyen el mapa semántico desde 26 años hasta retirada.

Orden propuesto después de los PR existentes:
- 02C — edad 27
- 02D — edad 28
- 02E — edad 29
- 03A — edad 30
- 03B — edades 31–33
- 04A — edad 34
- 04B — edad 35
- 04C — edades 36–38
- 04D — máquina de retirada
- 04E — epílogo + QA terminal

## RETIRADA — CONTRATO DE ESTADOS
Debe preservarse explícitamente:

`playing → decided → announced → closed`

Reglas:
- ninguna escena previa debe saltar directamente al epílogo;
- `closed` es el estado que permite mostrar el epílogo;
- decidir retirarse no equivale a anunciarlo;
- anunciarlo no equivale a haber cerrado deportivamente;
- el último partido NO está garantizado;
- no-market no debe eliminar la agencia del jugador;
- los cierres por mercado, cuerpo, voluntad, éxito o caída deben conservar diferencias narrativas.

## CONDICIONALES — NUEVO HALLAZGO CRÍTICO
Se extrajo el inventario canónico completo de los **134 condicionales** desde el Documento Maestro.

Resultado P1 por fases:
- 18–20: 14/14 IDs exactos
- 20–23: 3/18
- 23–26: 20/20
- 26–30: 5/24
- 30–34: 0/26
- 34+: 5/32

Total:
- 47/134 IDs condicionales exactos
- 87/134 condicionales con deriva de identidad

MUY IMPORTANTE:
- incluso los 47 exactos necesitan revisión semántica;
- los 14 exactos de 18–20 y los 20 exactos de 23–26 seguían apareciendo como `technical_adaptation` en la auditoría P1;
- NO usar fuzzy matching;
- para 30+ el Documento Maestro no siempre usa título como campo principal, así que identidad debe probarse por condición + escena + función/memoria, no por similitud de nombre.

Lotes condicionales preparados:
- 05A — exact-ID semantic foundation
- 05B — condicionales 20–23
- 05C — condicionales 26–30
- 05D — condicionales 30–34
- 05E — condicionales 34+

El bloque más urgente a diseccionar semánticamente es **05D: 30–34 condicionales**, porque P1 tenía 0/26 IDs exactos.

## AUDITOR / MANIFEST
Adjunto:
- manifest canónico 388/388;
- crosswalk template de los 174 IDs legacy;
- schema de verificación `canonical_verified_full`;
- matriz de migración;
- prototipo de auditor de identidad;
- reproducción P1;
- matriz de revisión de los 134 condicionales.

El prototipo ya reproduce correctamente:
- 388 canonical / 388 runtime
- 214 exact IDs
- 174 divergencias
- 87 principales + 87 condicionales

No conviertas candidatos en mappings aprobados sin revisión semántica.

## REGLA CRÍTICA DE MIGRACIÓN
Para `pendingEventId`:
- si el legacy ID está probado como la MISMA escena, puede migrarse al canonical ID;
- si no hay equivalencia semántica probada, NO cambies silenciosamente la decisión pendiente por otra escena;
- resuelve mediante compatibilidad legacy o incompatibilidad explícita.

Para history:
- la historia antigua es verdad histórica;
- no afirmar que el jugador vio una escena canónica que nunca vio.

# QUÉ QUIERO QUE HAGAS AL EMPEZAR
1. Verifica GitHub lectura + escritura.
2. Lee `AGENTS.md`, `project/CODEX_QUEUE.md`, `project/CHATGPT_CODEX_WORKFLOW.md`.
3. Revisa PR #1/#3/#5/#7.
4. Sube a `chore/chatgpt-codex-workflow` los artefactos adjuntos que aún no estén en GitHub.
5. Actualiza `project/CODEX_QUEUE.md` con los lotes 02C→05E, respetando dependencias.
6. No ejecutes Codex.
7. Después continúa como ChatGPT resolviendo semánticamente **los 26 condicionales 30–34** y deja el resultado versionado en GitHub.
8. Mantén al usuario informado brevemente mientras trabajas.
9. No hagas merge.

Cuando yo diga **"ejecuta Codex"**, vuelve a leer la cola y ejecuta SOLO el primer item READY.
