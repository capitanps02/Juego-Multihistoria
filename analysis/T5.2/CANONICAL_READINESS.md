# T5.2 — Readiness canónica para conectar seeds

Fecha del snapshot: 2026-09-16  
Base observada: `main@802dfd13a9d1b73b5131a0fb1ff3c740137aad54`

Este documento complementa `seed-lifecycle.json` y `seed-handoff.json`. Su objetivo es impedir una falsa conclusión: una seed sin productor, consumidor o cierre **no debe cablearse automáticamente** si la escena que debería producirla/consumirla todavía no ha sido reconciliada con el Documento Maestro.

Los conteos lifecycle siguen describiendo el runtime integrado. Los cambios recientes de `main` (#12, #23 y #17) son auditoría/QA y no reescriben el contenido runtime de seeds; por eso **no deben hacer bajar artificialmente** los contadores de productor/consumidor/cierre.

## Regla operativa

Para cualquier seed pendiente:

1. identificar su owner con `seed-handoff.json`;
2. comprobar si la escena productora/consumidora está `verified_same_identity`, es un `approved_alias` o sigue en reimplementación/ausente;
3. si la identidad no está acreditada, implementar el lifecycle **junto con** la reparación canónica de la escena, nunca sobre una escena genérica/no canónica solo para hacer bajar una métrica;
4. preservar `contentIdentity`, history y pending events según la política de migración que apruebe el integrador;
5. no convertir `npcRefs`, `HAS_SEED_*` ni la presencia de una seed en conocimiento de NPC: T5.3 mantiene una frontera epistemológica independiente;
6. después de cada integración funcional T5.1/T5.3, volver a ejecutar `npm run audit:t52` antes de aceptar una reducción de deuda.

## Cambios integrados desde el snapshot anterior

### PR #12 — T5.1 23–30

#12 ya está integrado en `main`, pero es **audit-only**. Refina la readiness sin alterar las métricas runtime T5.2:

- 91/91 principales 23–30 clasificados;
- 23–26: 25 `verified_same_identity` y 15 `needs_reimplementation`;
- 26–30: 25 `needs_reimplementation`, 22 `canonical_missing` y 4 candidatos sin alias aprobado;
- las **44/44 condicionales** ya tienen planning semántico revisado;
- **0/44 condicionales** están `canonical_verified_full` en runtime;
- 23–26: 20/20 condicionales comparten ID/título, pero las 20 requieren rewrite semántico específico;
- 26–30: 24/24 callbacks revisados; 5 ID exactos, 9 lineage plausibles, 3 parciales/ambiguos, 7 sin counterpart creíble; ninguna migración directa same-scene queda aprobada;
- de las 15 principales 23–26 a reimplementar, **10/15** son candidatas scene-level una vez resuelta la compatibilidad de sesiones y **5/15** dependen además de contratos compartidos (`EVT_23_MKT_001`, `EVT_23_CON_001`, `EVT_23_LOCK_001`, `EVT_24_MATCH_001`, `EVT_25_CON_001`).

Conclusión T5.2: el dato antiguo “44 condicionales en revisión manual” queda sustituido por “44/44 revisadas en planning, 0/44 acreditadas como implementación runtime completa”.

### PR #23 — save baseline

#23 ya está integrado. `npm test` ejecuta ahora `test-saves` de forma normal y protege explícitamente:

- schema 8;
- history;
- seeds;
- streams RNG preexistentes;
- round-trip `serializeSave -> loadSave`.

Esto refuerza T5.2: cualquier wiring o migración futura de seeds deberá conservar esos invariantes.

### PR #17 — QA transversal T5

#17 ya está integrado en `main`. Añade al baseline coordinado:

- freeze sentinel de T5.1;
- `qa:t5:saves`;
- probes de integración T5.2/T5.3;
- regresiones de content identity/save compatibility;
- reproducción de conocimiento T5.3 malformado.

T5-QA-005 (flag `HAS_SEED_*` fantasma) sigue siendo precisamente el hardening funcional de #19. T5-QA-006 exige que la composición final T5.2+T5.3 conserve simultáneamente seed viva, flag de presencia y adquisición causal de conocimiento. T5-QA-008 pertenece a T5.3 y no debe resolverse desde el lifecycle de seeds.

## Estado por owner

| Owner | Deuda T5.2 runtime | Estado canónico actual | Readiness para wiring |
| --- | --- | --- | --- |
| `t51/canon-18-23` | 31 seeds; 10 sin consumidor; 7 open-ended; 1 terminal explícito | #10 abierto: 18 principales verificadas, 39 a reimplementar, 6 ausentes. Condicionales: 10 a reimplementar, 15 ausentes, 7 revisión. Repair plan: 36 reparaciones scene-level tras migración y 3 bloqueadas por contratos compartidos. | **Mixta/bloqueada por contratos y migración.** Mantener métricas como backlog; cablear solo dentro de identidades canónicas reparadas/certificadas. |
| `t51/canon-23-30` | 59 seeds; 59 con productor; 30 sin consumidor; 35 open-ended | #12 integrado audit-only. 44/44 condicionales revisadas en planning, 0/44 certificadas full runtime. 23–26 tiene 10/15 reparaciones scene-level tras migración y 5/15 con dependencia transversal adicional. | **Readiness mejor caracterizada, runtime todavía bloqueado.** El próximo descenso de deuda debe venir de implementación funcional posterior, no del merge de #12. |
| `t51/canon-30-34` | 52 seeds; 4 sin productor/consumidor; 45 sin consumidor; 52 open-ended | #13 abierto/draft: 45 principales a reimplementar, 5 ausentes, 0 verificadas; 26 condicionales pendientes de cierre canónico. QA advierte además que CI verde de una rama con catálogo modificado no acredita por sí solo migración de `contentIdentity`. | **Bloqueada.** Las cuatro huérfanas deben nacer en sus escenas canónicas correctas; no conectarlas a shells actuales. |
| `t51/canon-34plus` | 68 seeds; 68 sin productor, 68 sin consumidor, 68 open-ended | #15 abierto: 4 verificadas + 3 aliases aprobados, pero 43/50 principales siguen sin implementación canónica completa; shared seed wiring diferido. Hay mejoras reales de retirada/mercado, pero `contentIdentity` sigue siendo blocker de integración. | **Bloqueada salvo wiring coordinado de identidades acreditadas.** T5.29–T5.35 debe crear/reparar escenas y conectar entonces memoria/consecuencias. |

Las cuatro seeds huérfanas 30–34 permanecen:

- `SEED_ROLE_COMMUNICATION`;
- `SEED_FALSE_ULTIMATUM`;
- `SEED_NATIONAL_ABSENCE`;
- `SEED_SPECIALIST_BIGCLUB`.

## Frontera T5.2 ↔ T5.3

PR #9 implementa conocimiento NPC deny-by-default y cadenas causales explícitas. La versión observada añade además validación de `sourceNpcId`, caducidad de la fuente y reaprendizaje monotónico.

Contrato transversal:

- una seed puede representar que un hecho/consecuencia existe en el mundo;
- `npcRefs` puede indicar personajes relacionados con una seed o escena;
- **ninguno de los dos implica que el NPC conozca el hecho**;
- un callback que dependa de conocimiento personal debe usar la vía explícita de T5.3;
- consumir/resolver una seed no debe informar silenciosamente a NPCs;
- informar a un NPC no debe resolver automáticamente una seed salvo que la escena canónica declare ambas consecuencias.

Riesgo de integración conocido: #9 comparte `src/narrative/resolver.ts` con T5.2 y su head observado fue construido antes del hardening final de presencia de #19. Si #19 entra primero, #9 debe re-groundearse conservando la limpieza de flags fantasma y superar T5-QA-006. Si #9 entra primero, #19 debe re-groundearse preservando adquisición/club de aprendizaje. **Nunca elegir una versión del resolver descartando la otra responsabilidad.**

La deuda T5-QA-008 sobre `knowledge` persistido malformado es propiedad T5.3/save validation. T5.2 solo exige que ninguna solución rompa seeds, history, RNG ni restore.

## Qué puede hacerse ya desde T5.2

- mantener el auditor y el reparto 210/210;
- detectar nuevas seeds sin owner o IDs desconocidos;
- detectar productores/consumidores/cierres cuando los equipos canónicos los incorporen;
- validar scope, expiración, save/restore e idempotencia;
- aprovechar `test-saves`, `qa:t5:saves`, `qa:t5:freeze` y `qa:t5:integration` ya integrados;
- volver a generar el handoff tras cada integración funcional T5.1;
- impedir que deuda de contenido sea ocultada mediante cierres genéricos inventados.

## Criterio de cierre real de T5.2

La infraestructura base está integrada, pero T5.2 debe permanecer `in_progress` mientras la deuda canónica impida demostrar el ciclo de vida extremo a extremo del catálogo.

Para considerar la pasada cerrada, el `main` integrado deberá permitir clasificar cada seed como una de estas categorías con evidencia:

1. productor + consumidor/cierre canónico implementados;
2. memoria intencionalmente persistente/open-ended con razón canónica explícita;
3. seed que caduca por una política de scope/edad/fecha canónicamente justificada;
4. seed retirada/deprecada mediante una estrategia compatible con saves/history.

No se acepta como cierre: crear `resolve`/`expire` arbitrarios, conectar seeds a escenas `engine_only_noncanonical`, reinterpretar history antigua, ni usar conocimiento NPC implícito para simular consecuencias.

## Referencias observadas en este snapshot

- `main`: `802dfd13a9d1b73b5131a0fb1ff3c740137aad54`.
- #10 `t51/canon-18-23`: abierto; audit/repair plan, runtime aún no autorizado.
- #12 `t51/canon-23-30`: **merged**; audit-only, 44/44 condicionales planificadas y 0/44 full runtime.
- #13 `t51/canon-30-34`: abierto/draft.
- #15 `t51/canon-34plus`: abierto; shared seed wiring diferido.
- #9 `t5/npc-memory`: abierto; requiere composición consciente con #19.
- #17 QA T5: **merged**.
- #23 save baseline: **merged**.

Este snapshot debe actualizarse cuando cualquiera de los workstreams funcionales se integre o cambie materialmente.