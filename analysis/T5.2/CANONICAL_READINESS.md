# T5.2 — Readiness canónica para conectar y cerrar seeds

Fecha del snapshot: 2026-09-17  
Base exacta observada: `main@6d2239ae1f89be97a7c5cf117d456cff9218aade`

Este documento describe el estado integrado de T5.2. La regla principal es deliberadamente estricta:

> **readiness estructural no equivale a cierre canónico.**

Una seed puede tener productor, consumidor o una cadena temporal técnicamente viable y seguir necesitando una decisión explícita del owner sobre su significado y su cierre narrativo.

## 1. Estado exacto de T5.2 en main

El runner exact-main `35229309280` hizo checkout explícito de `6d2239ae...`, ejecutó `npm run test:t52` y terminó con **63/63 tests PASS**.

### Inventario lifecycle

- catálogo: **210/210 seeds únicas**;
- eventos observados: **388** (`254` principales + `134` condicionales);
- seeds con productor runtime: **138**;
- seeds con algún consumer detectado por el inventario lifecycle: **59**;
- seeds con consumer terminal: **1**;
- seeds con ventana de edad finita: **48**;
- seeds club-scoped: **5**;
- transiciones `resolve` observadas: **2**;
- transiciones `expire` explícitas observadas: **0**;
- referencias desconocidas: **0**;
- write mismatches declarados: **0**.

`seedsWithAnyConsumer=59` pertenece al inventario lifecycle amplio. El grafo deferred aplica una definición más estricta de consumer runtime y por eso contabiliza **47** seeds con lado consumidor. No deben mezclarse ambas métricas.

### Grafo deferred / causal

- runtime producer seeds: **138**;
- runtime event consumer seeds: **39**;
- runtime simulation consumer seeds: **15**;
- runtime consumer seeds combinadas: **47**;
- registros de consumer de simulación: **22**;
- cadenas strict-deferred: **35**;
- cadenas runtime imposibles: **0**;
- obligaciones de scope proof: **1**;
- scope proofs integradas: **1/1**;
- usos de seed de simulación sin registrar: **0**;
- `hardPass`: **true**.

### Closure readiness

La tabla estructural cubre exactamente **210/210** seeds:

| Topología | Seeds |
| --- | ---: |
| productor + consumer factible | 47 |
| productor + consumer imposible | 0 |
| solo productor | 91 |
| solo consumer | 0 |
| unwired | 72 |
| evidencia deferred ausente | 0 |

Evidencia adicional:

- verified producer seeds: **48**;
- verified event consumer seeds: **8**;
- verified feasible pair seeds: **3**;
- simulation consumer seeds: **15**;
- explicit terminal seeds: **1**;
- finite age-window seeds: **48**;
- open-ended que todavía necesitan razón canónica: **162**.

El mecanismo de clasificación owner-backed está integrado, pero el registro real continúa vacío:

- `canonicalClosureClassified`: **0**;
- `canonicalClosurePending`: **210**;
- `classificationRegistryValid`: **true**;
- `structuralPass`: **true**;
- `canonicalClosureComplete`: **false**.

No se debe reducir `canonicalClosurePending` por inferencia, por comodidad de QA ni por el simple hecho de existir una cadena runtime.

## 2. Live memory frente a memoria histórica

T5.2 distingue explícitamente dos contratos:

1. **live seed instance**: la instancia sigue disponible según estado, edad, scope y terminalidad;
2. **historical existence**: el hecho ocurrió y puede seguir siendo un precedente factual aunque la seed ya no esté viva.

En este snapshot existen:

- **22** registros live de consumers de simulación, sobre **15** seed IDs;
- **1** registro directo histórico real.

El consumidor histórico es:

- `SEED_ELITE_ROLE_BARGAIN` → `src/simulation/club-contract-intent.ts` → `hasRoleGuaranteeAt23`.

Su contrato es factual: una conversación previa sobre garantía de rol puede seguir siendo un antecedente a los 23 años sin fingir que la seed continúa viva. El ratchet de lecturas directas pasa sin lecturas sin registrar, ambiguas, stale o con IDs desconocidos.

Esto **no** concede conocimiento a ningún NPC. Que un hecho exista históricamente y que un personaje conozca ese hecho son dos preguntas distintas.

## 3. Estado por owner

La partición `seed-handoff` sigue siendo exacta: **210 asignadas, 210 únicas, 0 duplicadas, 0 sin owner**.

| Owner | Total | Producidas | Con consumer | Sin consumer | Open-ended sin terminal | Observación operativa |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `t51/canon-18-23` | 31 | 31 | 23 | 8 | 7 | 24 tienen ventana finita y 1 tiene terminal explícito. El siguiente descenso de deuda debe venir de integración owner-side real, no de un parche T5.2 duplicado. |
| `t51/canon-23-30` | 59 | 59 | 29 | 30 | 35 | 24 tienen ventana finita. Ya existe un precedente histórico explícito (`SEED_ELITE_ROLE_BARGAIN`) que muestra cómo preservar hechos sin exigir presencia live. |
| `t51/canon-30-34` | 52 | 48 | 7 | 45 | 52 | Quedan exactamente 4 seeds sin productor ni consumer. Las 52 conservan deuda de origin/cierre canónico en el snapshot integrado. |
| `t51/canon-34plus` | 68 | 0 | 0 | 68 | 68 | El bloque sigue completamente unwired en `main`; no debe materializarse automáticamente al cumplir 34 años. |

Las cuatro huérfanas 30–34 siguen siendo:

- `SEED_ROLE_COMMUNICATION`;
- `SEED_FALSE_ULTIMATUM`;
- `SEED_NATIONAL_ABSENCE`;
- `SEED_SPECIALIST_BIGCLUB`.

## 4. Infraestructura ya integrada

T5.2 ya dispone en `main` de las piezas necesarias para dejar de tratar el problema como una auditoría manual:

- readiness estructural 210/210 y detección de cadenas imposibles;
- clasificación de cierre explícita, owner-backed y fail-closed;
- causal seed memory con separación live/historical;
- condition root compartida por gates, eligibility, outcome conditions y modifiers;
- registro de consumers de simulación;
- ratchet de lecturas directas de identidad;
- registro separado para consumers históricos;
- scope proofs integradas;
- pruebas de save/restore, idempotencia, migración de origen y preservación de RNG;
- generador de handoff Codex basado en el `main` exacto.

Las únicas disposiciones de cierre admitidas son:

- `canonical_chain`;
- `intentional_persistent`;
- `canonical_expiry`;
- `retired_compatible`.

No crear categorías nuevas para ocultar deuda.

## 5. Estado del handoff Codex

PR #159 (`t5/seed-provenance-refresh`) contiene una regeneración exact-main desde `6d2239ae...` y no modifica gameplay ni canon.

Su matriz regenerada informa:

- total seeds: **210**;
- live consumer registrations: **22**;
- historical consumer registrations: **1**;
- Codex-ready events: **5**;
- blocked declared-read-only consumers: **37**.

El PR está preparado para revisión, pero **no forma parte de main hasta que se integre**. Cada avance material de `main` obliga a volver a regenerar provenance antes de integrar esa evidencia.

Las cinco tareas Codex-ready pertenecen a 18–23. La rama owner-side del PR #155 ya contiene implementación para los cinco consumers en `src/content/events/18_20/t51-seed-consumer-repairs.ts`, pero #155 continúa **abierto, draft y no merged**. T5.2 no debe duplicar ese código. Cuando el owner lo integre, se vuelve a generar la matriz y se reevalúan las cinco filas contra runtime integrado.

## 6. Frontera T5.2 ↔ T5.3

Contrato permanente:

- una seed puede probar que algo ocurrió en el mundo;
- una instancia histórica puede conservar ese precedente después de su terminalidad;
- `npcRefs`, `HAS_SEED_*`, una seed live o una seed histórica **no prueban conocimiento NPC**;
- adquisición, transmisión, olvido y alcance del conocimiento pertenecen a T5.3;
- resolver una seed no informa silenciosamente a personajes;
- informar a un personaje no resuelve una seed salvo que una escena canónica declare ambas consecuencias.

Por tanto, ningún owner debe convertir el nuevo soporte histórico en un atajo de omnisciencia.

## 7. Qué puede hacerse ya

T5.2 puede avanzar sin inventar canon mediante este ciclo:

1. integrar una implementación funcional de un owner;
2. regenerar lifecycle, handoff, deferred y closure readiness desde el nuevo `main`;
3. confirmar productores/consumers/cierres reales;
4. registrar solo las lecturas live o históricas que existan de verdad;
5. pedir al owner una disposición de cierre con evidencia;
6. añadirla al registry únicamente cuando encaje en una de las cuatro clases permitidas;
7. ejecutar `npm run test:t52` y los gates de integración completos;
8. regenerar el handoff Codex exact-main.

No es válido crear `resolve`, `expire`, consumers o flags ficticios solo para mejorar contadores.

## 8. Criterio de cierre real de T5.2

T5.2 se puede cerrar cuando las **210/210** seeds tengan una disposición owner-backed demostrable:

1. `canonical_chain`: productor y consecuencia/cierre canónicos implementados;
2. `intentional_persistent`: memoria que debe permanecer abierta por diseño, con razón canónica explícita;
3. `canonical_expiry`: caducidad demostrada por edad, fecha o scope real;
4. `retired_compatible`: retirada/deprecación que conserva saves, history y provenance.

El objetivo **no** es llegar a cero seeds abiertas. El objetivo es que ninguna seed carezca de una explicación causal y canónica verificable.

### Snapshot reproducible

Fuente de las métricas: exact-main runner `35229309280`, job `105228906193`, checkout `6d2239ae1f89be97a7c5cf117d456cff9218aade`, `npm run test:t52` = **63/63 PASS**.
