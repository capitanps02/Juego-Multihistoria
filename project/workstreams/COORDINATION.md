# Multihistoria / Carrera de Futbolista — Panel de coordinación

**Última revisión:** 2026-09-17  
**Autoridad:** coordinador/integrador de `main`  
**Repositorio:** `capitanps02/Juego-Multihistoria`  
**Rama principal:** `main`

> GitHub actual, código ejecutable y CI exact-head prevalecen sobre este panel. Un PR verde, una auditoría, una micro-generación o un handoff Codex-ready no equivalen por sí solos a una pasada oficial cerrada.

## Estado de `main`

Base observada al sincronizar este panel:

`fa3c8bae524fef62e4eb9802e895df88588998c4`

Commit:

`T5 market: exact eligible CareerOffer facts`

Desde la última sincronización se han integrado, sin cambiar `EVENTS` ni `contentIdentity`:

- autoridad fail-closed de liderazgo de club del jugador;
- hardening de ofertas stale;
- `pendingCareerOfferKind` determinista;
- auditoría permanente de mutaciones directas de mercado;
- facts detached de `CareerOffer` elegibles en la read surface narrativa.

## Content identity / migraciones

Lineage activa serializada:

`PRE -> B1a -> C -> D -> E -> F -> G -> H`

Identidad activa:

`H = 84871fae2bec92d74d1e607e0a48943e2e530a062d315a829cfe75eda9fe0886`

La generación H fue integrada por el batch canónico 18–23. Ningún commit posterior observado en `main@fa3c8bae...` cambia `EVENTS` ni la identidad de contenido.

Reglas obligatorias:

1. una sola sucesora adyacente por turno de integración;
2. nunca crear shortcuts ni dos sucesoras paralelas desde H;
3. recalcular la fuente real inmediatamente antes de integrar cualquier PR que cambie `EVENTS`;
4. no reutilizar hashes históricos de PRs viejos como si fueran autoridad viva;
5. pending/history/provenance legacy se preservan; las freezes históricas no se regeneran ni reinterpretan;
6. migración explícita, 0 RNG, 0 scheduling, 0 decisiones, 0 contratos y 0 resultados deportivos sintéticos.

## P0 — autoridad deportiva compartida

### PR #156 — `t5/authoritative-match-model`

Objetivo: productor autoritativo de calendario/fixtures/participación y read surface deportiva para desbloquear #124.

Estado exacto observado:

- base: `main@fa3c8bae524fef62e4eb9802e895df88588998c4`;
- HEAD: `91b3f0a151a7c547ef00cee42e823e9920b244cf`;
- padre directo: `fa3c8bae...`;
- tree: `09d26d4edc6c6607db739adff05fdf519c6a9364`;
- write-set efectivo: 12 archivos de sport/save/QA;
- `EVENTS`: sin cambios;
- `contentIdentity`: sin cambios;
- `schemaVersion`: sin cambios;
- orden/recuento de draws RNG: sin cambios.

Produce/persiste:

- fixture oficial semanal;
- club deportivo autoritativo vía `registrationClub`;
- convocatoria/banquillo/titularidad/aparición/minutos;
- indisponibilidad por lesión;
- primera convocatoria real de partido;
- primera aparición / primera titularidad / partido completo;
- contexto de debut de banquillo;
- siguiente fixture, horas al siguiente fixture y siguiente entrenamiento;
- partidos de liga restantes;
- ciclo de objetivo liguero.

No inventa todavía:

- clasificación liguera;
- resultado final genérico por partido;
- goles/asistencias/tarjetas;
- `firstGoal`.

CI exact-head:

- Repository Integrity run `35245632330`: en curso al redactar este panel.

No integrar con evidencia de runs anteriores. Mantener #124 abierto hasta que sus consumidores también estén activos en `main`.

## P1 — siguiente generación narrativa candidata

### PR #186 — `t51/124-authoritative-18-20-wiring`

Consumidor de #156 para cerrar las cuatro escenas bloqueadas de #124.

Estado exacto apilado:

- base branch: `t5/authoritative-match-model`;
- base SHA: `91b3f0a151a7c547ef00cee42e823e9920b244cf`;
- HEAD: `822bc18c7e89253aa1220ef378ee4f5197854b81`;
- padre directo: #156 HEAD;
- tree: `dfd12194dadb98a4bb4efc3f14a7502fb693e6fd`;
- delta propio: 7 archivos;
- T51 Content Migration run `35245912990`: SUCCESS;
- Repository Integrity run `35245912975`: en curso al redactar este panel.

Reparaciones:

- `EVT_18_MATCH_001`: requiere `facts.match.debutDecisionContext === true`;
- `EVT_18_PRS_001`: atención local + `OFFICIAL_DEBUT` o primera convocatoria oficial persistida;
- `EVT_18_SOC_001`: threshold mediático + entrenamiento futuro + ningún fixture dentro de 24 h;
- `EVT_18_END_001`: 1–4 fixtures de liga restantes + objetivo abierto.

Proxies prohibidos para estas verdades:

- `roleScore`;
- `form`;
- reputación;
- mes;
- `seasonDay` aproximado;
- `FIRST_TEAM_ATTENTION` como sustituto de convocatoria/partido.

Como cambia `EVENTS`, #186 propone una generación sucesora de H. Target preparado:

`99ec70cdb10e20069e5281dac5b56e2146779cc462add1c47fc7d8ea6fa5ef28`

No autorizar H -> `99ec70cd...` hasta que:

1. #156 esté realmente integrado en `main`;
2. se vuelva a comprobar que H sigue siendo la identidad activa;
3. no exista otra generación narrativa integrada o preparada como sucesora paralela;
4. #186 se retarget/re-groundee al `main` exacto;
5. focused migration/content tests + Repository Integrity estén verdes en el HEAD exacto final.

Cerrar #124 solo después de integrar y probar los cuatro consumers.

## Shared runtime ya integrado tras H

### Liderazgo de club del jugador

Autoridad fail-closed integrada en `main`.

Consecuencia:

- #148 cerrado;
- #152 / `EVT_25_CAP_001` queda content-ready para su turno serializado de generación;
- A -> `captain_group`;
- C -> `secondary_captain`;
- B/D -> sin write de autoridad formal.

No crear una generación paralela para #152 mientras #186 sea la siguiente candidata activa.

### Mercado / CareerOffer

Integrado:

- stale offers fallan cerrado;
- tipo de oferta pendiente determinista;
- exact eligible `CareerOffer` facts detached/read-only;
- direct-market-mutation audit;
- `CareerOffer + respondToOffer()` sigue siendo la única autoridad formal.

No equivale todavía a:

- materialización age-18 requerida por #123;
- selección de múltiples ofertas #157;
- lifecycle de expiración #165;
- generación veteran 34+ #176;
- free-agency real #130.

## T5.2 — seeds

No confundir seeds declaradas con consecuencias causales cerradas.

Obligatorio por seed:

- producer;
- consumer vivo o histórico correctamente tipado;
- origen/provenance;
- scope;
- terminalidad;
- persistencia/save;
- timing;
- cierre/expiry solo si está certificado por owner/canon.

Los historical consumers no entran en el live deferred graph.

Wave 0 34+ sigue dependiendo de #180. No activar 34+ runtime hasta que catálogo/provenance y predecesor real estén cerrados.

## NPC / conocimiento

Regla permanente: world occurrence != NPC knowledge.

Canales válidos:

- witnessed;
- informed;
- public;
- reported.

`npcRefs`, relación, confianza, shared club o seed no autorizan conocimiento por sí solos.

Identidades dinámicas se resuelven por autoridad explícita. Si no existe autoridad:

- devolver `null`;
- usar actor genérico solo si el canon lo permite;
- nunca inferir por first compatible / trust / role heurístico.

Active-agent representation sigue bloqueada por #134 salvo acción canónica explícita de contratación/cambio/terminación.

## 18–23

Generación H ya integrada.

No hay actualmente otro PR abierto que contenga el batch preparado:

- `EVT_20_BRIDGE_001`;
- `EVT_20_CCH_001`;
- `EVT_21_SOC_001`;
- `EVT_21_PRS_002`;
- `CEVT_18_PLAYOFF_01`.

Si se reconstruye antes de integrar #186, coordinación debe decidir si se combina con la misma sucesora o si queda después. Nunca crear dos sucesoras paralelas desde H.

## 23–30 / 30–34 / 34+

Todos los PRs históricos de estas franjas son fuentes de semántica/handoff, no autoridad automática de lineage.

Antes de promover runtime:

1. re-ground al `main` real;
2. usar la identidad activa real como source;
3. descartar wiring de freeze/migration provisional viejo;
4. preservar solo el contenido/canon certificado;
5. crear una única sucesora adyacente;
6. exact-head CI.

### 34+

Issue #168 mantiene el handoff canónico ordinario.

Wave 0 obligatoria:

- #59 predecesor/lineage real;
- #180 seeds/provenance 34+;
- memorias predecessor con live/historical semantics correctas;
- pending/history/fingerprints migration-safe.

No congelar una identidad provisional 34+.

## Retirada / epílogos

PR #118 sigue siendo owner del terminal state machine y epílogos.

Estado objetivo:

`playing -> decided -> announced -> closed`

Única reconsideración permitida:

`decided -> playing`

Prohibido:

- `announced -> playing`;
- auto-retirada por edad;
- auto-anuncio por timer;
- retirada automática por falta de mercado;
- contratos artificiales;
- última aparición/gol sintéticos.

El último partido y los epílogos deben derivar de historial real.

## Blockers compartidos explícitos

Mantener fail-closed ownership para:

- #123 — alternativas formales de mercado age-18;
- #130 — expiry contractual / free-agency real;
- #133 — LOCK23 captain semantics donde siga aplicando;
- #134 — active-agent representation;
- #157 — multi-offer selection;
- #165 — offer expiry lifecycle;
- #169 — coach chronology;
- #172 — pain/imaging medical authority;
- #174 — concrete national call-up/preselection/final squad;
- #176 — veteran 34+ offers/terms;
- #177 — late-career successor/coach/peer identities;
- #180 — 34+ seed catalog/provenance.

## QA / integración

Antes de integrar cualquier PR:

1. leer `main` actual;
2. comprobar HEAD/base/ahead/behind;
3. inspeccionar write-set efectivo;
4. preservar invariants compartidos ya integrados;
5. re-ground si `main` cambió;
6. focused tests;
7. Repository Integrity completo sobre el HEAD exacto;
8. si `EVENTS` cambia, verificar source identity real y una sola edge adyacente;
9. registrar SHA y workflow IDs;
10. no debilitar tests para conseguir verde;
11. no auto-mergear.

## Fuente operativa viva

Issue de coordinación:

`#138 — Coordination v2`

Usar #138 para la cola operativa de Codex y este documento como snapshot versionado. Si ambos difieren, GitHub actual y la actualización más reciente prevalecen.
