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

Shared runtime integrado después de la última generación narrativa:

- liderazgo de club del jugador fail-closed;
- hardening de ofertas stale;
- `pendingCareerOfferKind` determinista;
- auditoría permanente de mutaciones directas de mercado;
- facts detached/read-only de `CareerOffer` elegibles.

Ninguno de esos commits cambia `EVENTS` ni `contentIdentity`.

## Content identity / migraciones

Lineage activa serializada:

`PRE -> B1a -> C -> D -> E -> F -> G -> H`

Identidad activa:

`H = 84871fae2bec92d74d1e607e0a48943e2e530a062d315a829cfe75eda9fe0886`

La generación H fue integrada por el batch canónico 18–23. En `main@fa3c8bae...` H sigue siendo la identidad activa.

Reglas obligatorias:

1. una sola sucesora adyacente por turno de integración;
2. nunca crear shortcuts ni dos sucesoras paralelas desde H;
3. recalcular la fuente real inmediatamente antes de integrar cualquier cambio de `EVENTS`;
4. no reutilizar hashes históricos de PRs viejos como autoridad viva;
5. pending/history/provenance legacy se preservan y las freezes históricas no se reinterpretan;
6. migración explícita: 0 RNG, 0 scheduling, 0 decisiones, 0 firmas y 0 resultados deportivos sintéticos.

## P0 — autoridad deportiva compartida

### PR #156 — `t5/authoritative-match-model`

Objetivo: productor autoritativo de calendario/fixtures/participación y read surface deportiva para desbloquear #124 y consumidores posteriores.

Estado exacto observado:

- base: `main@fa3c8bae524fef62e4eb9802e895df88588998c4`;
- HEAD: `54a84694ffa6dcd42a7d87b985db2db95047b9e4`;
- padre funcional re-ground: `fa3c8bae...`;
- el segundo commit del HEAD solo eleva el timeout de Repository Integrity a 60 minutos;
- write-set efectivo: 12 archivos sport/save/QA/workflow;
- `EVENTS`: sin cambios;
- `contentIdentity`: sin cambios;
- `schemaVersion`: sin cambios;
- orden/recuento global de draws RNG: sin cambios.

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

CI exact-head vigente:

- Repository Integrity run `35258290496` / job `105327322933`;
- `npm test` ya completado con éxito;
- PlayCanvas estaba en curso en la última observación;
- ningún run anterior certifica este HEAD si el HEAD vuelve a moverse.

No integrar con evidencia stale. Mantener #124 abierto hasta que sus consumers estén también activos.

## P1 — próxima generación narrativa combinada

No gastar varias sucesoras para reparaciones ya preparadas. Después de integrar/estabilizar #156, construir una única sucesora desde la identidad realmente activa que combine **8 reparaciones semánticas** y el hook compartido age-18 que necesitan dos de ellas.

### #124 / PR #186 — cuatro consumers de sport facts

PR #186 está apilado sobre la rama de #156.

Estado observado:

- base branch: `t5/authoritative-match-model`;
- base SHA actual: `54a84694ffa6dcd42a7d87b985db2db95047b9e4`;
- HEAD observado: `dd69905d0c865365bb90779044f5989600f045ec`;
- T51 Content Migration run `35258689763`: SUCCESS;
- Repository Integrity run `35258689623`: en curso en la última observación.

Reparaciones:

- `EVT_18_MATCH_001`: requiere contexto de debut canónico persistido;
- `EVT_18_PRS_001`: atención local + debut oficial o primera convocatoria real persistida;
- `EVT_18_SOC_001`: threshold mediático + entrenamiento futuro + ningún fixture dentro de 24 h;
- `EVT_18_END_001`: 1–4 fixtures de liga restantes + objetivo abierto.

El target preparado históricamente por #186:

`99ec70cdb10e20069e5281dac5b56e2146779cc462add1c47fc7d8ea6fa5ef28`

ya **no debe usarse como target final** si se componen las reparaciones adicionales listadas abajo. Pasa a ser evidencia de la variante de cuatro escenas. El target final debe recalcularse desde el catálogo combinado.

### #123 / PR #189 — mercado formal age-18

Staging inactivo y separado del catálogo activo:

- productor `early-career-market` usa exclusivamente `proposeCareerChange()`;
- 0 draws RNG adicionales; derivación estable keyed;
- enero materializa como máximo una oferta real compatible de cesión o traspaso;
- verano materializa renovación o traspaso real compatible;
- `EVT_18_JAN_001` y `EVT_18_SUM_001` consumen `CareerOffer` formal mediante offer bridge;
- narrative outcomes dejan de firmar directamente club/contrato;
- productor + overlay deben activarse atómicamente.

No activar el productor sin el overlay ni viceversa.

### #152 — `EVT_25_CAP_001`

Shared leadership ya está integrado.

Wiring exacto:

- A -> `captain_group`;
- C -> `secondary_captain`;
- B/D -> sin write de liderazgo formal;
- nunca inferir `captain` principal.

### #133 — `EVT_23_LOCK_001`

Reimplementar desde catálogo actual, no revivir PR #122 ni su lineage histórica.

- choice D «avisar al capitán» solo si el captain slot autoritativo resuelve;
- A/B/C siguen disponibles por STAR/same-origin teammate-cover cuando no hay capitán;
- no fixed UDV leakage ni identidad heurística;
- resolución/read projection 0 RNG.

### Contrato de la sucesora

El batch combinado cambia semántica activa de:

1. `EVT_18_MATCH_001`
2. `EVT_18_PRS_001`
3. `EVT_18_SOC_001`
4. `EVT_18_END_001`
5. `EVT_18_JAN_001`
6. `EVT_18_SUM_001`
7. `EVT_25_CAP_001`
8. `EVT_23_LOCK_001`

Reglas de integración:

- re-ground desde exact `main` después de #156;
- comprobar identidad activa real;
- una única arista adyacente;
- freeze/registry/evidence del target combinado una sola vez;
- no reinterpretar pending/history por igualdad de ID;
- focused tests + Repository Integrity exact-head;
- no auto-merge.

## T5.2 — seeds

### PR #184 — causal seed facts audit

Ready for review; tooling-only.

- 5 archivos;
- 0 gameplay / `EVENTS` / RNG / schema / contentIdentity;
- distingue `live_presence` de `causal_fact`;
- reconoce los cinco consumidores causales ya integrados de la generación H.

### PR #191 / #180 — catálogo/provenance 34+

Ready for review; 6 archivos; 0 `EVENTS`/contentIdentity/RNG/schema.

Contrato:

- 54 identidades canónicas exactas Pasada 7 = 45 ordinarias + 9 terminales;
- 14 bridge-memory compatibility rows;
- 13 proyecciones derivadas clasificadas `retired_compatible` con respaldo owner;
- `SEED_FORM_VS_PLAN` sigue pendiente;
- 210/210 seeds cubiertas estructuralmente;
- cierre canónico: 13 classified / 197 pending.

T5.2 no está oficialmente cerrada: el catálogo estructural completo no autoriza inventar consumers, expiry o terminalidad para las 197 pendientes.

## T5.3 — NPC / conocimiento

La arquitectura principal está integrada en `main`:

- conocimiento deny-by-default;
- canales witnessed/informed/public/reported;
- transmisión causal;
- persistencia/save;
- reconciliación histórica provenance-safe;
- dynamic target slots fail-closed;
- backfill histórico v1 congelado/versionado.

`npcRefs`, seed, relación, trust o shared club no equivalen a conocimiento.

T5.3 está mucho más cerca de cierre formal que de reimplementación; falta acreditar el criterio global contra el contenido final, no reconstruir el subsistema.

Active-agent representation sigue siendo un gap canónico (#134): no inferir Héctor/Lucía sin acción explícita de contratación/cambio/terminación.

## Shared runtime posterior a #156

### #130 — empleo / contrato vencido

Defecto confirmado: contrato a 0 meses puede seguir años con club, salario y apariciones normales.

Contrato de implementación ya fijado para después de #156:

- autoridad laboral explícita con semántica `contracted`, `unattached`, `expired_pending_resolution`;
- nueva expiración real `contracted -> unattached` una vez, determinista, 0 RNG;
- unattached: sin salario de club, sin apariciones/minutos/fixture de club, sin renovación ordinaria ni current-club identity heredada;
- reenganche solo por `CareerOffer` aceptada con `respondToOffer()`;
- saves antiguos ambiguos a 0 meses no reciben backfill heurístico;
- 0 `EVENTS`/contentIdentity en este shared PR.

### #174 — selección nacional concreta

Implementar después de #156 reutilizando `national-team-authority.ts`, no creando una autoridad paralela.

Store opcional/versionado de publicaciones concretas:

- lista ordinaria: publication ID/date/status `called_up | omitted`;
- torneo: preselección y lista final separadas, con tamaños/fechas/status factual;
- preselección no implica final;
- retirada internacional bloquea futuros ciclos pero conserva historial;
- old saves sin store => concrete selection unknown;
- read/validation 0 RNG y fail-closed;
- shared PR sin `EVENTS`/contentIdentity.

Consumers posteriores:

- `EVT_21_NAT_001` requiere omisión publicada real;
- `EVT_32_NAT_001` requiere preselección/final real;
- escenas 34+ consumen la misma autoridad.

## Estado por tramos canónicos

### 18–23

Generación H integrada.

Snapshot de Agent 5 tras H:

- 45/95 escenas funcionales;
- +5 Codex-ready;
- 50/95 preparadas en ese snapshot.

La próxima generación combinada resuelve seis reparaciones 18–20 adicionales (#124 + #123), pero queda deuda principal/condicional posterior. No equiparar “card preparada” con escena integrada.

### 23–26

Ya integrados/reconciliados funcionalmente, entre otros:

- T5.10: `EVT_23_BRIDGE_001`, `EVT_23_AGT_001`, `EVT_23_BODY_001`;
- MONEY/HOME/EUR;
- PRS y su causalidad/provenance.

La próxima generación combinada añade LOCK23 y `EVT_25_CAP_001`.

Quedan consumers de mercado/contrato, match y selección nacional que dependen de autoridades compartidas exactas.

### 26–30

Readiness/canon preparado, runtime todavía temprano.

Inventario de owner histórico:

- 25 principales `needs_reimplementation`;
- 22 principales `canonical_missing`;
- 4 pares candidatos sin alias aprobado;
- 24 condicionales revisados semánticamente, ninguno certificado por exact-ID de forma automática.

Cualquier generación futura parte de la identidad viva que exista después de los batches anteriores.

### 30–34

Owner PR #13 contiene trabajo semántico significativo pero no es una generación autorizada todavía.

Inventario vigente de la rama:

- 50 principales;
- 27 stable-ID reimplementations;
- 18 shifted identities con migración explícita pendiente;
- 5 principales canónicos missing;
- 26 condicionales pendientes de identidad/autoridad;
- blockers compartidos: multi-offer, renewal-by-minutes, sport facts y selección concreta.

No congelar el target provisional de esa rama hasta que sea realmente su turno serializado.

### 34+

Agent 8 tiene:

- 43/43 principales ordinarios preparados en cards;
- 32/32 condicionales reconciliados/ruteados;
- 0 principales/condicionales ordinarios nuevos activados en `EVENTS` desde esa rama.

Wave 0 obligatoria:

- #59 predecesor/lineage real;
- #180 catálogo/provenance 34+;
- #192 identidad canónica de conditionals;
- #195 autoridades factuales condicionales;
- shared sport/national/market/free-agency/NPC facts cuando aplique.

No congelar una identidad provisional 34+.

## Retirada / epílogos

PR #118 conserva implementación sustancial:

- state machine `playing -> decided -> announced -> closed`;
- única reconsideración normal `decided -> playing`;
- anuncio público integrado con T5.3;
- cierre sin synthetic sport;
- CareerSummary factual;
- 20 familias de epílogo evidence-gated e idempotentes;
- save/legacy compatibility.

Bloqueos terminales principales:

- fixture/season-end facts de #156;
- richer `LastMatchFact` aún requiere result/goals/assists y query de última aparición real;
- predecessor ordinario 34+ completo/frozen antes de terminal contentIdentity.

Prohibido: age auto-retirement, announced->playing, synthetic last appearance/goal, no-market auto-retirement.

## Previsión operativa de cierre T5

El tracker oficial conserva 38 nombres T5.1–T5.38 sin re-acreditación formal. Eso **no** significa 38 pasadas nuevas de trabajo.

Previsión operativa actual:

**25–33 pasadas efectivas restantes; centro aproximado: 29.**

Desglose:

- shared runtime / T5.2–T5.4: 5–7;
- 18–23: 4–5;
- 23–26: 2–3;
- 26–30: 4–5;
- 30–34: 3–4;
- 34+: 5–6;
- retirada + epílogos: 1–2;
- auditoría cruzada T5.38: 1.

Estas pasadas no son todas seriales: tooling/shared runtime pueden avanzar en paralelo. Solo `EVENTS`/contentIdentity se serializa.

Recalibrar después de:

1. #156 integrado;
2. generación combinada de 8 reparaciones integrada;
3. #130 + #174 integrados;
4. primera generación autoritativa 26–30;
5. primera generación autoritativa 34+.

Si dos pasadas consecutivas no cierran un deliverable o la previsión crece >20 %, recalibrar con evidencia.

## QA / integración

Antes de integrar cualquier PR:

1. leer `main` actual;
2. comprobar HEAD/base/ahead/behind;
3. inspeccionar write-set efectivo;
4. preservar invariants compartidos ya integrados;
5. re-ground si `main` cambió;
6. focused tests;
7. Repository Integrity completo sobre HEAD exacto;
8. si `EVENTS` cambia, verificar source identity real y una sola edge adyacente;
9. registrar SHA y workflow IDs;
10. no debilitar tests para conseguir verde;
11. no auto-mergear.

## Fuente operativa viva

Issue de coordinación:

`#138 — Coordination v2`

Usar #138 para la cola operativa y este documento como snapshot versionado. Si difieren, GitHub actual y la actualización más reciente prevalecen.
