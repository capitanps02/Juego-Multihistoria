# QA T5 — regresión, simulación y auditoría independiente

Rama propietaria: `qa/t5-regression`  
Baseline inicial: `main@c28d1194d7a6cce8aef9759bbb96875a710cb945`  
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

## Save/restore como gate T5 de primera clase

Issue #22 demostró que el baseline congelado del ejemplo schema 8 no correspondía al fixture realmente importado. `loadSave()` para schema 8 valida y devuelve el objeto parseado sin migrarlo; por tanto era un defecto del fixture QA, no del runtime.

Baseline corregido:

```text
v8 antiguo: 7136e3239ba5a5c71a85239401e790d8deb9292d4d49f7d4e2cd8d4359f9ca51
v8 correcto: 973721941c79d61ee4a08045778c604641fc87db7d8423533505f8d13fe3db1b
```

`scripts/test-t5-save-compat.mjs` exige deep-equal del schema 8 original, hash reproducible, round-trip exacto y preservación de `history`, `seeds` y todos los streams RNG. La regresión está incluida en `npm test` y `qa:t5:saves`. No se modificó `src/save/*`.

## Registro de defectos

| ID | Severidad | Owner | Estado actual | Evidencia |
|---|---|---|---|---|
| T5-QA-001 | alta | T5.3 | baseline histórico afectado; PR #9 implementa frontera real, pendiente integración | `test-t5-known-bugs.mjs` |
| T5-QA-002 | deuda | contenido/T5.4 | reclasificado como backlog cuantificado, no bug binario | `qa-t5-content.mjs` + handoff #19 |
| T5-QA-003 | media | QA | mitigado e integrado en #11 | `test-t5-regression.mjs` |
| T5-QA-004 | alta | T5.3 | fix verificado en #9; pendiente integración | `test-t5-integration-probes.mjs` |
| T5-QA-005 | alta | T5.2 | bug presente en `main`; fix verificado en #19; pendiente integración | `test-t5-known-bugs.mjs` + test #19 |
| T5-QA-006 | alta integración | integrador/T5.2/T5.3 | composición candidata presente; riesgo de perder #19 al resolver `resolver.ts` | `test-t5-integration-probes.mjs` |
| T5-QA-007 | media QA | QA | corregido en #17; baseline v8 stale | `test-t5-save-compat.mjs`, issue #22 |
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

La auditoría de #19 reparte 210/210 seeds exactamente una vez según el bloque de catálogo. El segmento histórico `SEED_CATALOG_18_20` ya incluye origins 20–22, por lo que su uso para 18–23 no es una partición por edad numérica accidental.

## T5-QA-004 — procedencia NPC

PR #9 corrigió la frontera en el escritor de bajo nivel: una fuente desconocida, self-source, fuente ignorante o cuyo conocimiento caducó se rechaza antes de mutar. La reproducción se promovió a gate de integración.

Head revalidado más reciente: `39bbbe6cce561668ad4d88f114dd18b1b307ba98`; `Repository integrity` run #354: SUCCESS.

## T5-QA-005 — flag de seed fantasma

PR #8 se integró recorriendo solo IDs presentes en `state.seeds`; QA run #246 reprodujo un `HAS_SEED_X=true` sin instancia viva.

PR #19 corrige el sync usando:

```text
SEED_DEFINITIONS.keys() ∪ state.seeds.ids
```

Head `1de78857331b264e0095e24b082f18e8110765b6`; run #313: SUCCESS. Hasta que #19 llegue a `main`, el bug sigue siendo real en producción integrada.

## T5-QA-006 — integración #19 ↔ #9

El head actual de #9 combina T5.2 + T5.3, pero todavía contiene la versión anterior de `syncSeedPresenceFlagsInPlace()`. Si #19 entra primero, #9 debe re-groundearse preservando el hardening.

El merge final debe conservar simultáneamente:

- lifecycle/scope de seeds;
- flags de presencia;
- adquisición NPC;
- club del aprendizaje durante transferencias;
- determinismo;
- rechazo de fuente NPC ignorante.

`EVT_18_PRE_001/CALL_NANO` es el probe conjunto: conocimiento de Nano + `SEED_NANO_SHADOW` viva + `HAS_SEED_NANO_SHADOW=true`.

## T5-QA-008 — knowledge inválido desde save

Nueva frontera encontrada al combinar T5.3 con persistencia. El schema 8 actual solo valida `npcs[i].knowledge` como objeto. En #9, `parseRecord()` comprueba tipos básicos pero no exige enums de `source`/`memory`, rango de `certainty` ni fecha ISO válida antes de que `npcKnows()` pueda devolver `true`.

Reproducción QA inyecta un registro con:

```text
source = telepathy
memory = eternal
certainty = -1
learnedAt = not-a-date
```

El contrato QA acepta dos soluciones válidas:

1. save validation rechaza el estado; o
2. el lector epistemológico ignora el registro y `npcKnows()` devuelve `false`.

Lo único prohibido es que un registro persistido inválido habilite `know.*`. El probe se salta mientras T5.3 no esté en la rama y se activará al integrarse.

## Freeze pre-T5.1 y `contentIdentity`

Baseline congelado: `2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff`.

`GameSession.resume()` ya rechaza contenido distinto con `CONTENT_CHANGED`. `freeze-t51-baseline.mjs --check` protege el paso anterior.

**Importante:** el sentinel está activo en la rama/PR #17, pero todavía no está integrado en el workflow de `main`. Por eso un PR T5.1 de contenido puede mostrar `Repository integrity` verde hoy aunque cambie el catálogo. Ese verde no acredita compatibilidad de `contentIdentity`; #13/#15 siguen necesitando migración explícita de sesiones/pending/history antes de integrar cambios activos.

## Retirada 34+ / PR #15

El head actual mejora técnicamente no-market, probabilidad de ofertas, terminalidad y epílogos. Aun así, la coordinación mantiene sin aprobar la semántica post-anuncio y prohíbe asumir `announced -> playing`; #15 todavía permite esa transición con `RECONSIDERATION_WINDOW`.

QA no decidirá el canon mediante un test. Además #15 modifica contenido activo y sigue sujeto a migración de `contentIdentity`.

## Estado de PRs relevantes

- **#17 QA:** abierta; save-compat, probes T5.2/T5.3 y freeze sentinel; no merge automático.
- **#19 T5.2 hardening:** T5-QA-005 corregido; run #313 verde; pendiente integración.
- **#9 T5.3:** head `39bbbe6…`; T5-QA-004 corregido, reaprendizaje endurecido, 15 callbacks textuales sin `npcRefs` expuestos como deuda; run #354 verde. Mantiene T5-QA-005 antiguo y tiene T5-QA-008 abierto.
- **#13 30–34:** ya contiene múltiples `canonical-reimplementations-*`; tratar como contenido activo, no como auditoría pura. Su CI verde actual no incluye el sentinel de #17.
- **#15 34+:** mejoras técnicas, pero bloqueado por canon post-anuncio y migración.
- **#14 presentación:** issue #22 procede de QA y se corrige en #17; sigue pendiente contrato público de contactos conocidos y evidencia T3.4 en teléfono físico.

## Correcciones al propio harness QA

1. test de edad bloqueado por oferta pendiente;
2. suposición de una sola generación terminal por seed;
3. intento descartado de imponer dedupe narrativo en resolver;
4. acoplamiento literal al formato de milestones;
5. baseline hash schema 8 desfasado (T5-QA-007);
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

- T5.2 core integrado.
- T5-QA-005 sigue en `main`, con fix verificado en #19.
- T5-QA-004 tiene fix verificado y regresión armada.
- T5-QA-006 sigue siendo riesgo de resolución de conflicto #19/#9.
- T5-QA-007 corregido sin runtime change; save compatibility ya forma parte de `npm test` en #17.
- T5-QA-008 abierto sobre persistencia epistemológica de #9.
- Freeze sentinel funciona en #17, aún no en CI de `main`.
- Canon de reconsideración 34+ permanece fuera de la autoridad QA.
- PR #17 permanece abierto y no debe mergearse automáticamente desde este workstream.
