# QA T5 — regresión, simulación y auditoría independiente

Rama propietaria: `qa/t5-regression`  
Baseline inicial: `main@c28d1194d7a6cce8aef9759bbb96875a710cb945`  
Main observado en esta pasada: `cee76dc47e22d12a9e06523d8e941f46caba5883`  
Owner: QA independiente  
Objetivo: aumentar la probabilidad de detectar regresiones importantes antes de `main`, no demostrar que el juego funciona.

## Principios

1. QA intenta falsar invariantes, no validar de forma optimista.
2. Un bug de producción se reproduce y asigna; QA no lo corrige silenciosamente si pertenece a otro workstream.
3. Un defecto inequívoco del harness/fixture QA sí se corrige aquí y se documenta.
4. Determinismo = misma seed + mismas decisiones + misma configuración => mismo estado relevante.
5. Microfeeds pueden consumir su stream propio, pero no contaminar narrativa fuerte, fútbol, retirada ni epílogo.
6. Una distribución observada no se convierte en regla de diseño.
7. Una decisión canónica no resuelta no se convierte en contrato técnico porque un PR tenga CI verde.
8. QA no edita directamente `project/PLAN_PASADAS.md`, `analysis/2026-09-11/plan-seguimiento.json` ni contenido canónico.

## Gates

```bash
npm run qa:t5:fast
npm run qa:t5:content
npm run qa:t5:freeze
npm run qa:t5:saves
npm run qa:t5:integration
npm run qa:t5:simulation
npm run qa:t5:expensive
npm run qa:t5:known-bugs
```

Cobertura actual: determinismo multi-seed, RNG isolation, save/restore, command idempotency, scheduler, cruces 18→20→23→26→30→34, lifecycle de seeds, conocimiento NPC, mercado, retirada, epílogos, content identity y carreras largas.

`qa:t5:expensive` = 25 carreras × 9 perfiles = 225 y sigue fuera del CI normal. Todavía no se ha usado como evidencia de esta pasada.

`qa:t5:known-bugs` queda separado del gate normal. Cuando un fix está verificado, su reproducción se promueve a regresión verde.

## Save/restore

Issue #22 demostró que el baseline congelado del ejemplo schema 8 no correspondía al fixture realmente importado. El diagnóstico quedó confirmado y **PR #23 ya fue integrado en `main`** como `cee76dc47e22d12a9e06523d8e941f46caba5883`; issue #22 está cerrado.

Baseline integrado:

```text
v8 antiguo: 7136e3239ba5a5c71a85239401e790d8deb9292d4d49f7d4e2cd8d4359f9ca51
v8 correcto: 973721941c79d61ee4a08045778c604641fc87db7d8423533505f8d13fe3db1b
```

`main` ejecuta ahora `scripts/test-saves.mjs` dentro de `npm test`. QA mantiene además `scripts/test-t5-save-compat.mjs`, que exige deep-equal del schema 8 original, hash reproducible, round-trip exacto y preservación de `history`, `seeds` y todos los streams RNG. No se modificó `src/save/*`.

## Registro de defectos

| ID | Severidad | Owner | Estado actual | Evidencia |
|---|---|---|---|---|
| T5-QA-001 | alta | T5.3 | baseline histórico afectado; PR #9 implementa frontera real, pendiente integración | `test-t5-known-bugs.mjs` |
| T5-QA-002 | deuda | contenido/T5.4 | backlog cuantificado, no bug binario | `qa-t5-content.mjs` + handoff #19 |
| T5-QA-003 | media | QA | mitigado | `test-t5-regression.mjs` |
| T5-QA-004 | alta | T5.3 | fix verificado en #9; pendiente integración | `test-t5-integration-probes.mjs` |
| T5-QA-005 | alta | T5.2 | bug presente en `main`; fix verificado en #19; pendiente integración | `test-t5-known-bugs.mjs` + test #19 |
| T5-QA-006 | alta integración | integrador/T5.2/T5.3 | riesgo de perder hardening al reconciliar #19/#9 | `test-t5-integration-probes.mjs` |
| T5-QA-007 | media QA | QA | **cerrado e integrado en main vía #23** | `test-t5-save-compat.mjs`, issue #22 |
| T5-QA-008 | alta | T5.3 + persistencia | abierto en #9: knowledge persistido malformado puede satisfacer `npcKnows` | probe latente de integración |

## T5-QA-002 — deuda canónica de seeds

Con T5.2 ya existen cierres reales, así que el antiguo test “debe existir al menos un terminal” dejó de ser un buen bug test y fue retirado de `known-bugs`. La deuda se mide por bloque sin imponer una distribución de diseño.

Handoff #19:

| Workstream | Seeds | Sin productor | Sin consumidor | Terminal explícito | Open-ended sin terminal |
|---|---:|---:|---:|---:|---:|
| 18–23 | 31 | 0 | 10 | 1 | 7 |
| 23–30 | 59 | 0 | 30 | 0 | 35 |
| 30–34 | 52 | 4 | 45 | 0 | 52 |
| 34+ | 68 | 68 | 68 | 0 | 68 |

La auditoría de #19 reparte 210/210 seeds exactamente una vez según el bloque de catálogo. No se inventan consumidores para reducir deuda.

## T5-QA-004 — procedencia NPC

PR #9 corrigió la frontera en el escritor de bajo nivel: una fuente desconocida, self-source, fuente ignorante o cuyo conocimiento caducó se rechaza antes de mutar. La reproducción se promovió a gate de integración.

Head más reciente inspeccionado: `956943485cb2355308297809db831a884a4aeb5b`; `Repository integrity` run #373: SUCCESS.

## T5-QA-005 — flag de seed fantasma

El `main` actual todavía recorre solo IDs presentes en `state.seeds`; QA reprodujo `HAS_SEED_X=true` sin instancia viva.

PR #19 corrige el sync usando:

```text
SEED_DEFINITIONS.keys() ∪ state.seeds.ids
```

Head `1de78857331b264e0095e24b082f18e8110765b6`; run #313: SUCCESS. Tras el merge de #23, GitHub reporta #19 como no mergeable contra el nuevo `main`; debe re-groundearse antes de integrar y volver a ejecutar QA.

## T5-QA-006 — integración #19 ↔ #9

El head inspeccionado de #9 combina T5.2 + T5.3, pero conserva la versión anterior de `syncSeedPresenceFlagsInPlace()`. Tras moverse `main`, tanto #19 como #9 necesitan reconciliación antes de integración.

El merge final debe conservar simultáneamente:

- lifecycle/scope de seeds;
- flags de presencia;
- adquisición NPC;
- club del aprendizaje durante transferencias;
- determinismo;
- rechazo de fuente NPC ignorante.

`EVT_18_PRE_001/CALL_NANO` es el probe conjunto: conocimiento de Nano + `SEED_NANO_SHADOW` viva + `HAS_SEED_NANO_SHADOW=true`.

## T5-QA-008 — knowledge inválido desde save

El schema 8 integrado valida `npcs[i].knowledge` como objeto. En el head inspeccionado de #9, `parseRecord()` comprueba tipos básicos pero no exige enums de `source`/`memory`, rango de `certainty` ni fecha ISO válida antes de que `npcKnows()` pueda devolver `true`.

Reproducción QA inyecta:

```text
source = telepathy
memory = eternal
certainty = -1
learnedAt = not-a-date
```

Contrato aceptado por QA:

1. save validation rechaza el estado; o
2. el lector epistemológico ignora el registro y `npcKnows()` devuelve `false`.

Lo único prohibido es que metadata persistida inválida habilite `know.*`.

## Smoke gate de reimplementaciones T5.1 30–34

`scripts/test-t5-integration-probes.mjs` contiene ahora un probe latente para eventos con:

```text
phase = 30_34
tag = t51_canonical_reimplementation
```

Cuando esas escenas existan en `main`, QA ejecutará **cada elección** sobre un estado sintético compatible y exigirá:

- que la resolución no lance;
- que devuelva `ResolutionResult` coherente;
- que seeds/effects no apunten a rutas inválidas;
- que `assertGameState()` acepte el estado posterior.

Este test **no valida el canon narrativo** ni decide si trigger/opciones/copy son correctos. Solo garantiza que una reimplementación declarada como activa no rompa el contrato técnico al jugarla.

## Freeze pre-T5.1 y `contentIdentity`

Baseline congelado: `2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff`.

`GameSession.resume()` rechaza contenido distinto con `CONTENT_CHANGED`. `freeze-t51-baseline.mjs --check` protege el paso anterior.

**Importante:** el sentinel está activo en la rama/PR #17, pero todavía no está integrado en el workflow de `main`. Por eso un PR T5.1 de contenido puede mostrar `Repository integrity` verde aunque cambie el catálogo. Ese verde no acredita compatibilidad de `contentIdentity`.

## Retirada 34+ / PR #15

#15 mejora técnicamente no-market, probabilidad de ofertas, terminalidad y epílogos. Aun así, QA no convierte una decisión canónica no resuelta en contrato técnico: la semántica post-anuncio sigue requiriendo decisión de coordinación antes de aceptar `announced -> playing` como comportamiento canónico.

Además #15 modifica contenido activo y sigue sujeto a estrategia explícita de `contentIdentity`/sesiones antes de integración.

## Estado de PRs relevantes

- **#17 QA:** abierta; probes T5.2/T5.3, save-compat adicional, freeze sentinel y smoke T5.1; no merge automático.
- **#23 save baseline:** **mergeado en main**; issue #22 cerrado.
- **#19 T5.2 hardening:** T5-QA-005 corregido en su head; necesita re-ground contra `main@cee76dc…` antes de integrar.
- **#9 T5.3:** head inspeccionado `95694348…`; T5-QA-004 corregido, T5-QA-008 abierto y resolver aún no contiene el hardening #19; necesita re-ground.
- **#13 30–34:** contiene `canonical-reimplementations-*`; tratar como contenido activo. El smoke QA se activará cuando llegue a `main`.
- **#15 34+:** mejoras técnicas, pero mantiene bloqueos de canon/content identity.
- **#14 presentación:** #22 ya no es bloqueo del `main`; debe re-groundearse y volver a validar. T3.4 físico sigue fuera de QA T5.

## Correcciones al propio harness QA

1. test de edad bloqueado por oferta pendiente;
2. suposición de una sola generación terminal por seed;
3. intento descartado de imponer dedupe narrativo en resolver;
4. acoplamiento literal al formato de milestones;
5. baseline hash schema 8 desfasado (T5-QA-007), ya corregido en `main`;
6. T5-QA-002 reclasificado de test binario a deuda medible tras evolucionar T5.2.

## Política

1. aislar reproducción mínima;
2. fijar owner y severidad;
3. mantener bug de producción fuera del gate normal hasta que exista fix;
4. verificar el fix en el SHA exacto del owner;
5. promover la reproducción a gate verde;
6. volver a probar el merge real cuando dos PR comparten archivos;
7. no reinterpretar canon ni history para hacer verde un gate.

## Estado operativo

- `main` = `cee76dc47e22d12a9e06523d8e941f46caba5883`; #23 integrado.
- T5-QA-007 cerrado en `main`.
- T5-QA-005 sigue en `main`, con fix verificado pero no integrado en #19.
- T5-QA-004 tiene fix verificado y regresión armada.
- T5-QA-006 exige re-ground real #19/#9 antes de integración.
- T5-QA-008 sigue abierto sobre persistencia epistemológica de #9.
- Smoke T5.1 30–34 preparado y latente hasta que esas reimplementaciones lleguen a `main`.
- Freeze sentinel funciona en #17, aún no en CI de `main`.
- `qa:t5:expensive` todavía no se ha usado como evidencia.
- PR #17 permanece abierto y no debe mergearse automáticamente desde este workstream.
