# T5.2 — Readiness canónica para conectar seeds

Fecha del snapshot: 2026-09-16  
Base observada: `main@4d547ea9c070d9879d812861ed0abb6493ff1d75`

Este documento complementa `seed-lifecycle.json` y `seed-handoff.json`. Su objetivo es impedir una falsa conclusión: una seed sin productor, consumidor o cierre **no debe cablearse automáticamente** si la escena que debería producirla/consumirla todavía no ha sido reconciliada con el Documento Maestro.

Los conteos T5.2 siguen describiendo el runtime actualmente integrado en `main`. Los estados T5.1/T5.3 siguientes describen trabajo abierto en ramas separadas y, por tanto, son una condición de readiness, no una modificación del baseline de `main`.

## Regla operativa

Para cualquier seed pendiente:

1. identificar su owner con `seed-handoff.json`;
2. comprobar si la escena productora/consumidora está `verified_same_identity`, es un `approved_alias` o sigue en reimplementación/ausente;
3. si la identidad no está acreditada, implementar el lifecycle **junto con** la reparación canónica de la escena, nunca sobre una escena genérica/no canónica solo para hacer bajar una métrica;
4. preservar `contentIdentity`, history y pending events según la política de migración que apruebe el integrador;
5. no convertir `npcRefs` ni presencia de una seed en conocimiento de NPC: T5.3 mantiene una frontera epistemológica independiente.

## Estado por owner

| Owner | Deuda T5.2 en `main` | Estado T5.1 observado | Readiness para cableado |
| --- | --- | --- | --- |
| `t51/canon-18-23` | 31 seeds; 10 sin consumidor; 7 open-ended sin terminal; 1 con terminal explícito | PR #10: 63 principales = 18 verificadas, 39 a reimplementar, 6 ausentes. 32 condicionales = 10 a reimplementar, 15 ausentes, 7 revisión manual. | **Bloqueada/mixta.** No añadir consumidores a identidades no acreditadas. Integrar lifecycle durante las reimplementaciones y después de resolver migración/content identity. |
| `t51/canon-23-30` | 59 seeds; las 59 tienen productor; 30 sin consumidor; 35 open-ended sin terminal | PR #12: 91 principales = 25 verificadas, 40 a reimplementar, 22 ausentes, 4 revisión manual. 44 condicionales siguen en revisión manual. | **Parcial pero runtime bloqueado por compatibilidad.** Las escenas verificadas sirven de referencia, pero el propio workstream mantiene las mutaciones funcionales en espera de la estrategia de `contentIdentity`/sesión. |
| `t51/canon-30-34` | 52 seeds; 4 sin productor ni consumidor; 45 sin consumidor; 52 open-ended | PR #13: 50 principales = 45 a reimplementar, 5 ausentes, 0 verificadas; 26 condicionales en revisión manual. | **Bloqueada.** No “resolver” las 4 huérfanas conectándolas a escenas genéricas actuales. Deben nacer en su identidad canónica reparada. |
| `t51/canon-34plus` | 68 seeds; 68 sin productor, 68 sin consumidor, 68 open-ended | PR #15: 50 principales = 4 verificadas, 3 aliases aprobados, 13 a reimplementar, 30 ausentes. Quedan 43 principales no acreditables como implementación canónica completa. El propio PR difiere el shared seed wiring. | **Bloqueada salvo integración coordinada de escenas acreditadas.** T5.29–T5.35 debe crear/reparar el contenido y conectar entonces estas seeds; no usar los genéricos 34+ para satisfacer el auditor. |

## Frontera T5.2 ↔ T5.3

PR #9 implementa conocimiento NPC deny-by-default y ya reconcilia conceptualmente su resolver con la infraestructura T5.2.

Contrato transversal:

- una seed puede representar que un hecho/consecuencia existe en el mundo;
- `npcRefs` puede indicar personajes relacionados con una seed o escena;
- **ninguno de los dos implica que el NPC conozca el hecho**;
- un callback que dependa de conocimiento personal debe usar la vía explícita de T5.3 (`npcKnows`, reglas de adquisición/requisitos o equivalente integrado);
- consumir/resolver una seed no debe informar silenciosamente a NPCs;
- informar a un NPC no debe resolver automáticamente una seed salvo que la escena canónica declare ambas consecuencias.

Cuando #9 y el follow-up T5.2 confluyan en `main`, QA debe conservar simultáneamente:

- lifecycle/scope/idempotencia de seeds;
- adquisición causal de conocimiento NPC;
- limpieza de `HAS_SEED_*` fantasma;
- determinismo y compatibilidad de save/restore.

## Qué puede hacerse ya desde T5.2

- mantener el auditor y el reparto 210/210;
- detectar nuevas seeds sin owner o IDs desconocidos;
- detectar productores/consumidores/cierres cuando los equipos canónicos los incorporen;
- validar scope, expiración, save/restore e idempotencia;
- volver a generar el handoff tras cada integración T5.1;
- impedir que deuda de contenido sea ocultada mediante cierres genéricos inventados.

## Criterio de cierre real de T5.2

La infraestructura base está integrada, pero T5.2 debe permanecer `in_progress` mientras la deuda canónica impida demostrar el ciclo de vida extremo a extremo del catálogo.

Para considerar la pasada cerrada, el `main` integrado deberá permitir clasificar cada seed como una de estas categorías con evidencia:

1. productor + consumidor/cierre canónico implementados;
2. memoria intencionalmente persistente/open-ended con razón canónica explícita;
3. seed que caduca por una política de scope/edad/fecha canónicamente justificada;
4. seed retirada/deprecada mediante una estrategia compatible con saves/history.

No se acepta como cierre: crear `resolve`/`expire` arbitrarios, conectar seeds a escenas `engine_only_noncanonical`, reinterpretar history antigua, ni usar conocimiento NPC implícito para simular consecuencias.

## Referencias de integración observadas

- PR #10 — `t51/canon-18-23` — head observado `94ef8ac8b864248b1346a16a69adbcf1260143a1`.
- PR #12 — `t51/canon-23-30` — head observado `afe00196ee05417101087c79cc99ba71a3f8a463`.
- PR #13 — `t51/canon-30-34` — head observado `008054a4a664d4509be6813c7c93d07e1c7e8c2f`.
- PR #15 — `t51/canon-34plus` — head observado `cf63d74d1b7ea3e219bea46e7d981ecabd8f6931`.
- PR #9 — `t5/npc-memory` — head observado `a3b16688e9f4ed9af732c4df0908b4d9835d5638`.

Este snapshot debe actualizarse cuando cualquiera de esos PR cambie de forma material o se integre en `main`.