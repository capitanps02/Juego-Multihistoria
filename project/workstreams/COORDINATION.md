# Multihistoria / Carrera de Futbolista — Panel de coordinación

**Última revisión:** 2026-09-16  
**Autoridad:** conversación coordinadora principal / integrador de `main`  
**Repositorio:** `capitanps02/Juego-Multihistoria`  
**Rama de integración:** `main`

> GitHub, el código ejecutable y CI prevalecen sobre resúmenes históricos. Planning, auditoría o un PR verde no equivalen por sí solos a una pasada cerrada.

## Estado de `main`

- SHA funcional inspeccionado tras el último merge: `9773104440615611f059a4f45c69c25d280a26aa`.
- CI `Repository integrity` sobre ese SHA: **SUCCESS**.
- Integrado en este ciclo:
  - PR #11, QA T5 independiente (`3079a311…`), sin cambios de runtime/canon.
  - PR #16, freeze exacto del catálogo pre-T5.1 (`977310444…`), sin cambios de contenido activo.
- `main` continúa sin protección de rama configurada; los merges del coordinador se realizan con revisión y `expected_head_sha`.

## Base funcional y progreso

- 388 eventos = 254 principales + 134 condicionales.
- 210 seeds.
- 20 NPC persistentes.
- 20 familias de epílogo.
- save schema 8.
- RNG separado: `narrative`, `football`, `microfeed`, `qa`.

Estado de pasadas:

- T1 completa.
- T2.1–T2.5 completas.
- T3.1–T3.3 completas.
- T3.4 abierta: falta teléfono Android físico.
- T4.1–T4.6 completas.
- T4.7/T4.8 omitidas por alcance; no ganan peso.
- T5.1 en curso.
- T5.2/T5.3 con ramas funcionales activas, aún no integradas.

**Progreso ponderado acreditado: 33,51 %.**  
**Pasadas realmente cerradas: 15.**

QA, freeze, auditorías parciales y PR abiertos no suman peso por sí solos.

## Freeze pre-T5.1 — CERRADO

PR #16 fijó de forma reproducible el catálogo exacto antes del primer merge de contenido T5.1.

Manifest integrado:

- `ENGINE_BUILD`: `0.8.0-t2.5`.
- session version: `2`.
- GameState/save schema: `8`.
- total: 388.
- principales: 254.
- condicionales: 134.
- bytes de `JSON.stringify(EVENTS)`: `1.484.137`.
- algoritmo: `SHA-256(utf8(JSON.stringify(EVENTS)))`.
- **contentIdentity pre-T5.1:** `2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff`.

Artefactos:

- `qa/fixtures/t5.1/pre-t51-event-catalog.json`.
- `qa/fixtures/t5.1/pre-t51-content-manifest.json`.
- `scripts/freeze-t51-baseline.mjs`.

El fixture es evidencia/compatibilidad y no forma parte del `EventIndex` o scheduler activo.

**Implicación:** ya no está permitido introducir una modificación de catálogo sin reconocer explícitamente que cambia respecto a esta identidad. El freeze cierra la captura de baseline; **no resuelve por sí solo la migración de sesiones/saves**.

## QA T5 integrado

PR #11 añade gates independientes para:

- determinismo y aislamiento RNG;
- fronteras de edad;
- referencias de contenido;
- carreras largas;
- lifecycle de contenido;
- simulación estratificada.

Comandos de referencia:

```text
npm test
npm run qa:t5:fast
npm run qa:t5:content
npm run qa:t5:simulation
```

`qa:t5:known-bugs` queda deliberadamente fuera del gate normal mientras documente deuda conocida; al corregir un defecto, su reproducción debe transformarse en regresión verde.

## PR activos y decisión de integración

| PR / rama | Workstream | Estado integrador | Acción requerida |
|---|---|---|---|
| #1 `chore/chatgpt-codex-workflow` | planning/auditoría T5.1 | **HOLD** | Rama sigue cambiando. Esperar HEAD estable; revisar diff y CI exactos. |
| #3 `task/t5.1-batch-01` | canon 20–23 | DRAFT planning | Re-ground sobre base integrada antes de implementación funcional. |
| #5 `task/t5.1-batch-02a` | canon 27–28 | **BLOCKED-BY-#7** | No ejecutar/integrar antes del resultado revisado de #7. |
| #7 `task/t5.1-batch-02b` | edad 26 + cronología seeds | DRAFT planning | Re-ground; debe preceder a #5. |
| #8 `t5/seed-lifecycle` | T5.2 seeds | **CHANGES REQUIRED** | Eliminar replay global por `(eventId, choiceId, date)` del resolver: duplica idempotencia de `GameSession` y puede bloquear una repetición legítima. Después re-ground y revalidar. |
| #9 `t5/npc-memory` | T5.3 NPC/conocimiento | **ARQUITECTURA ACEPTABLE / RE-GROUND PENDIENTE** | Deny-by-default, reglas explícitas y `know.*` read-only son correctos. Debe basarse en main actual y conservar QA. Comparte `resolver.ts` con #8. |
| #10 `t51/canon-18-23` | auditoría canon 18–23 | **AUDITORÍA ÚTIL / RAMA EN MOVIMIENTO** | Mantener audit-only; integrar cuando HEAD sea estable, mergeable y CI exacto verde. |
| #12 `t51/canon-23-30` | auditoría canon 23–30 | **AUDITORÍA ÚTIL / RAMA EN MOVIMIENTO** | Igual: no runtime, integrar solo tras estabilizar HEAD y CI. |
| #13 `t51/canon-30-34` | canon 30–34 | **BLOCKED: MIGRACIÓN** | El diff ya implementa eventos funcionales aunque la descripción hable de auditoría. Freeze ya existe, pero falta política/migración de sesiones compatible antes del merge de contenido. |
| #14 `presentation/android-playcanvas` | web/PlayCanvas/Android | **REVISIÓN EN CURSO** | Preserve QA T5 y estado oculto. T3.4 seguirá abierta. La rama está actualizándose contra main. |
| #15 `t51/canon-34plus` | canon 34+/retirada/epílogo | **BLOCKED: CANON + MIGRACIÓN** | Mejora autoridad en no-market, pero implementa `announced -> playing` sin decisión canónica aprobada e introduce aliases/runtime. Debe corregirse/esperar decisión y re-ground tras freeze. |

## Conflictos de integración

### #8 ↔ #9

Ambos modifican `src/narrative/resolver.ts` y `package.json`.

- No cherry-pick ciego.
- #9 puede entrar primero si #8 mantiene el replay incorrecto.
- El segundo debe combinar conscientemente lifecycle de seeds + adquisición de conocimiento.
- Lecturas de conocimiento no deben consumir RNG.

### #7 ↔ #5

Orden obligatorio actual:

`#7 -> refrescar/re-ground #5 -> #5`.

### #13 / #15 y contentIdentity

El baseline ya está congelado. Cualquier cambio en definiciones activas debe ahora aportar:

1. nueva identidad explícita;
2. estrategia de sesión/save para la identidad `2e07efd2…`;
3. validación de pending scenes/historial sin reinterpretar hechos antiguos;
4. tests de save/resume y determinismo.

No se aceptará debilitar `contentIdentity` para hacer pasar saves.

### Retirada 34+

Sigue abierto el conflicto canónico de reconsideración post-anuncio. La planificación propone como mejor ajuste mantener `announced` durante una extensión acotada, pero esa propuesta **no es aprobación canónica**. No aceptar `announced -> playing` ni `closed -> playing` por inferencia.

## Presentación / Android

Puede avanzar independientemente si:

- UI solo lee contrato público (`PlayerView`);
- no muestra seeds, flags, probabilidades, agendas ni memoria interna;
- PlayCanvas/Android se regeneran desde fuente;
- IndexedDB y offline siguen preservados;
- T3.4 no se cierra sin teléfono físico.

Hallazgo transversal vigente: `PlayerView.contacts` representa actualmente todo el catálogo de NPC; la UI no debe inferir “conocido” accediendo a conocimiento interno. T5.3 debe definir un contrato público si se quiere filtrar contactos conocidos.

## Tracking autoritativo pendiente de sincronizar

`project/PLAN_PASADAS.md` y `analysis/2026-09-11/plan-seguimiento.json` aún deben converger a:

- 33,51 %;
- T3.4 `in_progress` con evidencia externa pendiente;
- T4.7/T4.8 `omitted`;
- T5.1 `in_progress`;
- `nextPass` distinto de T4.7;
- QA/freeze integrados sin sumar porcentaje.

Hasta completar esa edición estructurada, este panel + código/CI gobierna la interpretación vigente.

## Orden recomendado inmediato

1. Integrar auditorías puras #10/#12 cuando sus HEAD dejen de moverse y sean mergeables.
2. Re-ground #9 sobre `main`; ejecutar `npm test`, `test:t53`, QA T5; revisar e integrar si permanece limpio.
3. Corregir #8, re-ground sobre el resultado de #9 si #9 entra primero, ejecutar T5.2 + T5.3 + QA y revisar.
4. Integrar #14 cuando sus workflows de presentación/Android estén verdes y no haya pérdida de gates QA.
5. Implementar la migración de sesiones/content identity antes de aceptar #13/#15 u otros cambios de catálogo.
6. Resolver explícitamente el canon de reconsideración de retirada antes de cerrar 34+.

## Siguiente cuello de botella

**Migración de sesiones/content identity desde el baseline congelado, mientras se integran en paralelo auditorías puras y subsistemas T5.2/T5.3 que no requieren cambiar IDs/eventos activos.**
