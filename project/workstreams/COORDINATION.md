# Multihistoria / Carrera de Futbolista — Panel de coordinación

**Última revisión:** 2026-09-16  
**Autoridad:** conversación coordinadora principal / integrador de `main`  
**Repositorio:** `capitanps02/Juego-Multihistoria`  
**Rama de integración:** `main`

> GitHub, código ejecutable y CI prevalecen sobre resúmenes históricos. Un PR verde, una auditoría o una micro-generación de contenido no equivalen por sí solos a una pasada oficial cerrada.

## Estado actual de `main`

SHA al actualizar este panel:

`88ab33ed844a964cd9ab21ad156ed2c2f7cd40ac`

Estado técnico relevante:

- Engine build base: `0.8.0-t2.5`.
- GameState/save schema: 8.
- Session: **v3** con provenance por decisión.
- RNG separado: `narrative`, `football`, `microfeed`, `qa`.
- `main` sigue sin branch protection; usar siempre `expected_head_sha` y CI exacta antes de merge.

## Progreso acreditado

- T1 completa.
- T2.1–T2.5 completas.
- T3.1–T3.3 completas.
- T3.4 abierta: falta evidencia en teléfono Android físico.
- T4.1–T4.6 completas.
- T4.7/T4.8 omitidas por alcance; no ganan peso.
- T5 en curso.

**Progreso ponderado acreditado: 33,51 %.**  
**Pasadas realmente cerradas: 15.**  
**Pasadas omitidas: 2.**

No modificar estos números por infraestructura, auditorías ni batches parciales. La autoridad de cierre sigue siendo `project/PLAN_PASADAS.md` + `analysis/2026-09-11/plan-seguimiento.json`.

## Content identity y migración

Baseline pre-T5.1 congelado:

`2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff`

Lineage sucesivo integrado:

`PRE -> B1a -> C -> D`

Identidades:

- PRE: `2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff`
- B1a: `1a8a5e2006fe7160f4fbc02060568d3abec99df038fe3a1a7799c8a0e802eac7`
- C: `fee2ff875bac7979d3907f5ee1004ef736efa9a257237c6dee629dd8687fe136`
- D, catálogo activo: `5d3fd71a8df42ed5b93fdde63ed386e9d776693addd62a30293dbecad7aa56d2`

Contrato vigente:

- `resume()` normal es estricto.
- La migración de contenido es explícita.
- Cada decisión conserva `sourceContentIdentity` + fingerprint de definición.
- La lineage debe tener exactamente un camino acíclico hasta el target.
- 0 caminos o más de 1 camino => fail closed.
- No crear shortcuts PRE→target si existe una generación intermedia.
- Cada identidad persistible histórica conserva evidencia inmutable.
- Catálogos legacy sirven para validar/migrar; nunca entran en `EventIndex` ni scheduler.
- Pending legacy se resuelve con su definición/fingerprint exactos.
- Migrar no consume RNG, no agenda escenas y no persiste por sí mismo.

## Integraciones T5 recientes

### Contenido 23–26

Micro-generación C integrada por PR #75:

- `EVT_23_BRIDGE_001`
- `EVT_23_AGT_001`
- `EVT_23_BODY_001`

Micro-generación D integrada por PR #91:

- `EVT_23_MONEY_001`
- `EVT_23_HOME_001`
- `EVT_23_EUR_001`

Total actual de escenas canónicas nuevas/reimplementadas de este tramo en estas micro-generaciones: **6**.

### Regla crítica de nomenclatura

Los nombres históricos de workstream `T5.10`, `T5.11`, etc. se han usado también para micro-generaciones de integración. **No confundirlos con las pasadas oficiales del PLAN.**

La pasada oficial `T5.10 — Lote 23–26 1` exige **12 escenas**. Por tanto el trabajo actual equivale a **6/12** del primer lote oficial y no acredita todavía peso ni una pasada cerrada.

### Próximas escenas 23–26 con ficha canónica preparada

Sin blocker arquitectónico conocido:

- `EVT_23_PRS_001`
- `EVT_25_AGT_001`
- `EVT_25_MKT_001`
- `EVT_25_NAT_001`

El offer/session bridge ya está integrado, por lo que también pueden prepararse en su turno canónico:

- `EVT_23_MKT_001`
- `EVT_23_CON_001`
- `EVT_25_CON_001`

Siguen bloqueadas por contratos compartidos específicos:

- `EVT_23_LOCK_001` -> issue #84, slots autoritativos CAPTAIN/STAR.
- `EVT_24_MATCH_001` -> issue #85, micro-resultado deportivo con RNG `football`.

Cada nueva activación que cambie `EVENTS` debe crear únicamente la siguiente edge adyacente desde D o su sucesor real, congelar target y actualizar registries/evidencia antes del merge.

## T5.2 / T5.4 — Seeds y consecuencias diferidas

Infraestructura integrada, pasada todavía no cerrada.

Estado transversal actual:

- lifecycle de seeds con scopes y expiración técnica;
- gate alternatives OR auditados;
- polaridad positiva/negativa/neutral de `HAS_SEED_*`;
- seed-origin migration guard;
- PR #94 integrado: auditoría de **22 pares archivo+seed** de lecturas directas bajo `src/simulation`, cubriendo **15 seeds únicas**.

El audit combinado falla por:

- consumer de simulación no registrado;
- registro stale o duplicado;
- ventana temporal inválida;
- cadena productor→consumidor imposible.

Regla vigente: **canon first, wiring second**. No inventar consumers o cierres para mejorar métricas.

## T5.3 — NPC, conocimiento y contactos públicos

Integrado:

- conocimiento deny-by-default;
- fuentes explícitas `witnessed`, `informed`, `public`, `reported`;
- memoria strong/temporary/practical;
- `know.*` gates;
- no inferencia desde `npcRefs`, seeds, relaciones o access;
- relaciones persistentes entre cambios de club;
- contactos visibles del protagonista provenance-safe;
- contactos públicos no se deducen de memoria NPC privada.

PR #89 integrado:

- reconciliación de conocimiento histórico en `resume()`/`migrateAndResume()`;
- `HistoryEntry` emparejado 1:1 con `decisionProvenance`;
- exact-ID no autoriza reinterpretación semántica;
- requiere fingerprint activo compatible o certificación legacy explícita;
- versiones subjetivas persistidas válidas siguen siendo autoritativas;
- conserva `learnedAt`/club históricos;
- no resucita recuerdos caducados;
- 0 RNG / 0 scheduling / 0 commit en resume.

T5-QA-017 cerrado en producto.

## Offer / contract authority

Integrado:

- `CareerOffer` + `respondToOffer()` siguen siendo la única autoridad para aplicar `CareerTerms`.
- `offerBridge` conecta decisiones narrativas con offer disposition sin mutar contrato desde effects.
- `counter/defer` no firman contrato.
- `market.history.source` enlaza history/event/choice real.
- QA-018 liga la disposition persistida a la definición histórica exacta mediante source identity + fingerprint.

Las escenas contractuales futuras deben consumir este contrato, no crear una segunda autoridad.

## Otros contratos compartidos ya integrados

- per-choice eligibility.
- event-level `gateAlternatives` OR.
- mandatory phase-transition priority sin RNG adicional.
- fact read-only `facts.clubWantsRenewal`.
- freeze/source evidence post-T5.1.
- lineage multigeneración fail-closed.

## Blockers transversales abiertos

### Issue #84 — locker leadership slots

Necesario para `EVT_23_LOCK_001`.

Requiere resolver de forma explícita y determinista CAPTAIN/STAR por club/fase, sin inferir por texto de `role`, relación más alta ni RNG. Slot ausente debe fallar cerrado.

### Issue #85 — football outcome hook

Necesario para `EVT_24_MATCH_001`.

La elección narrativa decide quién/intención; el gol/fallo debe salir de atributos deportivos + stream `football`, con save/resume e idempotencia y sin mezclar RNG narrativo.

### Issue #61 — retirada

T5-QA-016 sigue abierto. No integrar #15 fuera de su turno final de lineage. No autorizar `announced -> playing` por similitud histórica ni reutilizar una identidad provisional 34+.

## Otros workstreams

### 30–34 — PR #13

Sigue draft. Tiene trabajo útil de contenido/readiness, pero debe integrarse solo cuando llegue su turno después de cerrar las generaciones previas 23–30. Sus identidades/migration handoff históricos no son autoridad para saltar la lineage actual.

### 34+ — PR #15

Sigue aislado. Re-ground final solo al llegar su turno real. La retirada post-anuncio no se decide por implementación histórica; requiere canon explícito y compatibilidad de pending legacy.

### Presentación / Android — PR #14

Software web/PlayCanvas/Android puede seguir en paralelo. T3.4 **no se cierra** hasta disponer de evidencia física real en teléfono Android.

### QA independiente — PR #32

Mantener como adversarial/ratchet. T5-QA-017 y 018 ya están cerrados en producto; T5-QA-016 sigue abierto. Re-ground antes de cualquier integración.

## Reglas de integración

1. Nunca desarrollar cambios funcionales grandes directamente en `main`.
2. Revisar intención y ownership antes de combinar PRs.
3. Re-ground sobre el `main` exacto cuando haya contratos compartidos nuevos.
4. Usar `expected_head_sha` al mergear.
5. No mergear un HEAD distinto del que pasó CI.
6. No debilitar un test para aceptar un PR.
7. No regenerar un freeze histórico para que coincida con contenido nuevo.
8. No usar igualdad de ID/título como prueba de equivalencia canónica.
9. No mezclar catálogos legacy en scheduling.
10. No acreditar porcentaje por auditorías, infraestructura o contenido parcial.

## Orden operativo inmediato

1. Completar las seis escenas restantes necesarias para cerrar el primer lote oficial de 12 escenas 23–26, respetando lineage adyacente desde D.
2. En paralelo, resolver contratos #84 y #85 para desbloquear LOCK/MATCH cuando toque su generación.
3. Mantener T5.2/T5.4 y T5.3 bajo gates permanentes mientras entra nuevo contenido.
4. Después cerrar el resto 23–26 y continuar 26–30 por generaciones sucesivas.
5. No adelantar 30–34/34+ sobre la lineage.

## Siguiente cuello de botella

**Contenido canónico 23–26: pasar de 6/12 a 12/12 en la primera pasada oficial sin romper saves, provenance, seeds ni autoridad contractual.**
