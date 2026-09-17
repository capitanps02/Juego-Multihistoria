# Multihistoria / Carrera de Futbolista — Panel de coordinación

**Última revisión:** 2026-09-17  
**Autoridad:** coordinador/integrador de `main`  
**Repositorio:** `capitanps02/Juego-Multihistoria`  
**Rama principal:** `main`

> GitHub actual, código ejecutable y CI exact-head prevalecen sobre este panel. Un PR verde, una auditoría o una micro-generación no equivalen por sí solos a una pasada oficial cerrada.

## Estado de `main`

Base observada al sincronizar este panel:

`ebef17057156c7721fc4a041552c9cf1b3fdb6ba`

Commit:

`T5.3: freeze historical NPC knowledge backfill semantics`

Estado técnico estable:

- engine base `0.8.0-t2.5`;
- save schema 8;
- Session v3 con provenance por decisión;
- RNG separado: `narrative`, `football`, `microfeed`, `qa`;
- `resume()` normal estricto;
- content migration explícita y fail-closed;
- `main` sin branch protection: usar siempre HEAD exacto + CI exacta + `expected_head_sha` al integrar.

## Progreso oficial acreditado

Autoridad: `project/PLAN_PASADAS.md` + `analysis/2026-09-11/plan-seguimiento.json`.

- progreso acreditado: **33,51 %**;
- pasadas cerradas: **15**;
- pasadas omitidas: **2**;
- baseline total: **68**;
- restantes baseline: **51**;
- etapa actual: **T5**;
- T3.4 continúa abierta hasta evidencia real en teléfono Android físico.

No ganar porcentaje por infraestructura, PRs, auditorías, ramas o batches parciales.

## Content identity y lineage real

Baseline pre-T5.1:

`PRE = 2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff`

Lineage integrada en `main`:

`PRE -> B1a -> C -> D -> E -> F`

Identidades:

- B1a: `1a8a5e2006fe7160f4fbc02060568d3abec99df038fe3a1a7799c8a0e802eac7`
- C: `fee2ff875bac7979d3907f5ee1004ef736efa9a257237c6dee629dd8687fe136`
- D: `5d3fd71a8df42ed5b93fdde63ed386e9d776693addd62a30293dbecad7aa56d2`
- E: `88751a2107c035826162968991e3a1808b2f4573afa3a3a20a3efa376fa8af1f`
- **F, catálogo activo:** `de9ef2f501c015705a28d54afd140259356f15566d424511e6dbf67769c9bd19`

Reglas:

- cada cambio de `EVENTS` crea solo la edge adyacente desde la identidad activa real;
- no shortcuts;
- exactamente un camino acíclico source→target; 0 o >1 => fail closed;
- freezes históricos son inmutables;
- catálogos legacy solo validan/migran, nunca entran en scheduler/EventIndex;
- pending legacy usa su definición/fingerprint exactos;
- migrar consume 0 RNG, agenda 0 escenas y no reescribe history/journal/decision provenance;
- no reutilizar hashes de source/target de PRs antiguas después de que `main` avance.

## T5.3 — NPC / knowledge

Integrado en `main`:

- deny-by-default;
- canales `witnessed`, `informed`, `public`, `reported`;
- `npcRefs`, seeds, access o relación no implican conocimiento;
- reconciliación histórica provenance-safe;
- targets dinámicos solo desde resolvers autoritativos;
- baseline histórica `NPC_KNOWLEDGE_BACKFILL_RULES_V1` congelada e independiente del registry live.

PR #96 ya integrada. Issue #92 / T5-QA-021 cerrado.

## Contenido 23–26 ya integrado

Escenas canónicas distintas activadas/reimplementadas:

- `EVT_23_BRIDGE_001`
- `EVT_23_AGT_001`
- `EVT_23_BODY_001`
- `EVT_23_MONEY_001`
- `EVT_23_HOME_001`
- `EVT_23_EUR_001`
- `EVT_23_PRS_001`

`EVT_23_EUR_001` recibió además una generación posterior de corrección de eligibility que produjo el catálogo activo F.

No confundir estas micro-generaciones con pasadas oficiales T5.10/T5.11. La pasada oficial de 12 escenas no se acredita hasta cumplir su criterio completo.

## Bug activo prioritario — PRS23

Issue #109 / T5-QA-023 sigue abierto.

El `EVT_23_PRS_001` activo puede tratar presencia genérica de `SEED_ELITE_ROLE_BARGAIN` como si existiera una expectativa/promesa concreta de minutos.

Secuencia correcta:

1. integrar el contrato de historical seed reads (#119/#131);
2. re-groundear e integrar #106 como **fact-only** (`facts.roleGuaranteeAt23`, `facts.roleDropSince23`), sin modificar `EVENTS`;
3. crear una PR de contenido separada que corrija el trigger activo de PRS23;
4. esa PR de contenido, si sigue siendo la siguiente, crea la nueva edge adyacente desde F o desde el sucesor real vigente.

#106 no debe tomar ownership de migration/contentIdentity.

## T5.2 / T5.4 — Seeds

Infraestructura importante ya integrada, pero T5.2 no está oficialmente cerrada.

Regla central: **canon first, wiring second**.

No inventar consumers, expiries, cierres o significados para mejorar métricas.

### Cola actual

- PR #119: live seed presence vs historical seed evidence. Draft hasta cerrar #131 y re-groundear.
- #131: historical registry debe rechazar IDs de seed inexistentes en `SEED_CATALOG`.
- PR #102: audit closure-readiness 210/210. Volvió a draft; debe re-groundear sobre `main` actual.
- PR #107: clasificaciones owner-backed; solo después de #102. Registry real debe permanecer vacío salvo evidencia explícita de owner.

## Football moment / MATCH24

Issue #85 define el hook de resultado deportivo con RNG `football`.

PR #93 sigue draft y requiere:

- re-ground limpio;
- cerrar #100;
- validar `world.footballMomentResults` en load/restore;
- store ausente compatible; store presente corrupto => fail closed;
- un momento nuevo consume exactamente un draw `football`;
- resultado persistido e idempotente;
- 0 cambios en `EVENTS`/contentIdentity.

Solo después `EVT_24_MATCH_001` puede consumir el contrato.

## LOCK23

PR #122 sigue draft.

Su plan histórico E→F está obsoleto: F ya es activo.

Issue #133 / T5-QA-027 debe resolverse antes de integración:

- si no existe captain autoritativo, la choice “avisar al capitán” no puede ser seleccionable;
- A/B/C deben seguir disponibles cuando la escena se abre por STAR o `SEED_TEAMMATE_COVER` y no hay captain;
- no hardcodear capitán UDV fuera de su club/fase;
- no inferir desde `npcRefs`, trust, role textual o relación más alta;
- offender genérico sigue genérico si canon no certifica identidad.

Freeze/edge solo cuando LOCK23 sea realmente la siguiente generación de contenido.

## 20–23 — PR #129

Workstream activo:

- rama `t51/canon-20-23`;
- PR #129 draft;
- 51 escenas canónicas: 33 principales + 18 condicionales;
- snapshot funcional: **12/51**;
- T5.5: **9/12**;
- T5.6: **3/12**.

Puede seguir avanzando por escenas no bloqueadas.

Blockers de identidad que deben fallar cerrados, nunca resolverse por heurística:

- #134 active-agent identity;
- #135 current-club institutional NPC recipient;
- #136 captain identity 20–23.

No considerar contacto comercial, trust, `agentControl`, seed o `npcRefs` como representación/agencia activa.

## Workstreams posteriores

- #115 / `t51/canon-26-30`: bridge 26 preparado pero **staged**, no activo.
- #13 / 30–34: útil como reconciliación/readiness, bloqueado por generaciones previas.
- #15 / 34+: aislado; no congelar target provisional.
- `t51/canon-34plus-career`: snapshot histórico, quedó detrás de `main`; re-ground obligatorio antes de reutilizar.
- #118 / retirada+epílogos: no registrar edge terminal hasta que la generación 34+ correcta esté activa.

## Retirada

Máquina objetivo:

`playing -> decided -> announced -> closed`

Solo `decided -> playing` puede reconsiderar antes del anuncio.

Issue #61 / T5-QA-016 sigue abierto hasta que la corrección de retirada llegue a `main` en su turno de lineage.

No auto-retirada por edad, no auto-anuncio por timer, no retirada automática por ausencia de mercado, no último partido/gol/aparición inventados.

## Presentación / Android / release

- PR #14 puede avanzar en paralelo; T3.4 requiere evidencia física real.
- PR #120 prepara release/beta, pero no acredita T7/T8.
- PR #34 prepara observabilidad T6 sin modificar runtime productivo.

## QA independiente

PR #32 permanece adversarial.

Estado de findings prioritarios:

- QA-016 / #61: abierto;
- QA-021 / #92: **cerrado por #96**;
- QA-022 / #100: abierto;
- QA-023 / #109: abierto y afecta contenido activo;
- QA-025 / #131: abierto;
- QA-027 / #133: abierto.

## Cola operativa para Codex

Issue coordinadora: **#138**.

Prioridad:

1. #119 + #131;
2. #106 fact-only;
3. PR dedicada para #109 / PRS23, con siguiente edge adyacente real;
4. #93 + #100 en paralelo;
5. #122 + #133 preparado semánticamente, sin apropiarse de lineage antes de turno;
6. #102 re-ground;
7. #107 después de #102;
8. #129 continúa solo por contenido no bloqueado;
9. después 26–30 → 30–34 → 34+ → retirada/epílogos.

## Contrato de integración

Para cualquier PR candidata:

1. consultar `main` justo antes de trabajar;
2. comprobar ahead/behind;
3. re-groundear preservando únicamente el write-set owned;
4. no regenerar freezes históricos;
5. si cambia `EVENTS`, calcular source real y crear solo una edge adyacente;
6. no debilitar tests;
7. focused tests + full Repository Integrity sobre HEAD exacto;
8. documentar SHA y run IDs;
9. no auto-mergear;
10. merge solo tras revisión de integrador y con `expected_head_sha`.

## Cuello de botella actual

El problema principal ya no es la ausencia de código, sino **serializar cambios integrables desde el catálogo F mientras se cierran bugs causales/epistemológicos ya detectados, sin romper lineage, saves ni ownership**.
