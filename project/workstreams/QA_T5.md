# QA T5 — regresión, simulación y auditoría independiente

Rama propietaria: `qa/t5-regression`  
Baseline inicial: `main@c28d1194d7a6cce8aef9759bbb96875a710cb945`  
Owner: QA independiente  
Objetivo: aumentar la probabilidad de detectar regresiones importantes antes de `main`, no demostrar que el juego funciona.

## Principios

1. QA intenta falsar invariantes, no validar de forma optimista.
2. Un bug de producción se reproduce y asigna; QA no lo corrige silenciosamente si pertenece a otro workstream.
3. Un defecto inequívoco del harness/fixture QA sí se corrige en esta rama y se documenta.
4. Determinismo = misma seed + mismas decisiones + misma configuración => mismo estado relevante.
5. Microfeeds pueden consumir su stream propio, pero no alterar narrativa fuerte, fútbol, retirada, epílogo ni decisiones.
6. Un gate no convierte una distribución observada en una regla de diseño.
7. Una decisión canónica no resuelta no se convierte en contrato técnico porque un PR tenga CI verde.
8. `project/PLAN_PASADAS.md` y `analysis/2026-09-11/plan-seguimiento.json` no son propiedad de QA.

## Cobertura y gates

| Área | Cobertura QA T5 | Estado |
|---|---|---|
| Determinismo | matriz multi-seed × estrategia; firma + estado | cubierta |
| RNG isolation | microfeeds on/off y streams fuertes | cubierta |
| Save/restore | suites históricas + baseline schema 8 + round-trip exacto | reforzada |
| Idempotencia | `commandId`, receipts, retries, rollback/resume | cubierta histórica |
| Scheduler | no repetibles, cierre acotado, perfiles estratificados | ampliada |
| Edad | 18→20→23→26→30→34 + adaptadores | cubierta |
| Seeds | refs, generaciones, flags, scope, cierres y handoff | ampliada; deuda canónica abierta |
| NPC | conocimiento deny-by-default, procedencia y no omnisciencia | candidato T5.3 verificado; pendiente integración |
| Mercado | coherencia de ofertas y ausencia de pending terminal | ampliada |
| Retirada | cierre/liveness multi-seed; canon post-anuncio no fijado por QA | ampliada |
| Epílogo | familias únicas y evidencia contra `HistoryEntry` | ampliada |
| Content identity | freeze reproducible pre-T5.1 | sentinel activo |
| Integración T5.2/T5.3 | seed lifecycle + conocimiento en una transacción | probe preventivo |
| Simulación cara | 25 carreras × 9 perfiles = 225 | fuera de CI normal |

Comandos principales:

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

`qa:t5:known-bugs` permanece deliberadamente separado del gate normal. Cuando un owner corrige producción, la reproducción se promueve a regresión verde.

## Save/restore como gate T5 de primera clase

Issue #22 reveló que el baseline congelado del ejemplo schema 8 no correspondía al fixture v8 realmente importado. La investigación confirmó que `loadSave()` para schema 8 valida y devuelve el objeto parseado sin migración; por tanto el hash histórico era un defecto del fixture QA, no del runtime.

QA corrigió únicamente `qa/fixtures/migration-baselines.json`:

```text
v8 antiguo: 7136e3239ba5a5c71a85239401e790d8deb9292d4d49f7d4e2cd8d4359f9ca51
v8 correcto: 973721941c79d61ee4a08045778c604641fc87db7d8423533505f8d13fe3db1b
```

`scripts/test-t5-save-compat.mjs` exige ahora para el fixture v8:

- `loadSave(raw)` deep-equal al JSON original;
- hash reproducible;
- round-trip exacto `serializeSave`/`loadSave`;
- `history` intacto;
- `seeds` intactas;
- todos los streams RNG intactos.

La regresión se añadió a `npm test` y a `qa:t5:saves`. No se modificó `src/save/*`.

## Registro de defectos

| ID | Severidad | Owner | Estado actual | Evidencia/regresión |
|---|---|---|---|---|
| T5-QA-001 | alta | T5.3 NPC/memoria | baseline histórico afectado; PR #9 implementa frontera real, pendiente integración | `test-t5-known-bugs.mjs` |
| T5-QA-002 | alta | contenido/T5.4 | deuda canónica abierta; T5.2 aporta mecanismo y PR #19 cuantifica handoff | `qa-t5-content.mjs` + handoff T5.2 |
| T5-QA-003 | media | QA | mitigado e integrado en PR #11 | `test-t5-regression.mjs` |
| T5-QA-004 | alta | T5.3 | **fix verificado en PR #9 head `a3b16688…`; pendiente integración** | promovido a `test-t5-integration-probes.mjs` |
| T5-QA-005 | alta | T5.2 | **bug presente en `main`; fix verificado en PR #19 head `1de78857…`; pendiente integración** | `test-t5-known-bugs.mjs` + test T5.2 de #19 |
| T5-QA-006 | alta integración | integrador/T5.2/T5.3 | composición candidata verificada en #9; existe riesgo de perder fix #19 al resolver `resolver.ts` | `test-t5-integration-probes.mjs` |
| T5-QA-007 | media QA/harness | QA | **corregido en PR #17**; baseline v8 importado estaba desfasado | `test-t5-save-compat.mjs`, issue #22 |

### T5-QA-001 — frontera de memoria NPC

La base histórica tenía `knowledge`/`memories` persistentes pero sin una frontera mundo→conocimiento suficientemente operativa. PR #9 implementa reglas explícitas outcome-specific, `know.*` read-only y persistencia. No se marca cerrado hasta validar el merge real contra el `main` que incluya T5.2/T5.2-hardening.

### T5-QA-002 — deuda canónica de seeds

T5.2 ya aporta lifecycle, scope, expiración y estados terminales. PR #19 añade handoff 210/210 sin inventar consumidores. La deuda observada actual se trata como backlog, no como distribución de diseño.

Última partición reportada por #19:

| Workstream | Seeds | Sin productor | Sin consumidor | Terminal explícito | Open-ended sin terminal |
|---|---:|---:|---:|---:|---:|
| 18–23 | 31 | 0 | 10 | 1 | 7 |
| 23–30 | 59 | 0 | 30 | 0 | 35 |
| 30–34 | 52 | 4 | 45 | 0 | 52 |
| 34+ | 68 | 68 | 68 | 0 | 68 |

### T5-QA-004 — procedencia de conocimiento NPC

El bug original permitía que `sourceNpcId` fuese una etiqueta causal falsa. En el head actual de PR #9, la validación se hace en `rememberNpcFactInPlace()` antes de mutar:

- fuente desconocida: rechazada;
- destinatario como su propia fuente: rechazado;
- fuente que no conoce el `factId`: rechazada;
- conocimiento de fuente caducado: no propagable.

`Repository integrity` run #301 sobre `a3b16688e9f4ed9af732c4df0908b4d9835d5638` terminó SUCCESS. La reproducción ya no pertenece a `known-bugs`: quedó armada como regression probe que se activará al existir T5.3 en `main`.

### T5-QA-005 — flag de seed fantasma

PR #8 se integró con una implementación que recorría únicamente IDs presentes en `state.seeds`; QA run #246 demostró el bug después del merge.

PR #19 corrige el método para usar:

```text
SEED_DEFINITIONS.keys() ∪ state.seeds.ids
```

Esto limpia un `HAS_SEED_X=true` conocido aunque no exista instancia, sin descartar IDs desconocidos persistidos. El head `1de78857331b264e0095e24b082f18e8110765b6` pasó `Repository integrity` run #313. Hasta que #19 llegue a `main`, T5-QA-005 sigue siendo un bug real del runtime integrado.

### T5-QA-006 — conflicto real de integración #19 ↔ #9

PR #9 ya combina lifecycle/scope T5.2 y adquisición T5.3 en `resolver.ts`, incluyendo preservación del club donde se aprendió un hecho durante una transferencia. Sin embargo, su head actual todavía contiene la versión anterior de `syncSeedPresenceFlagsInPlace()`.

Por tanto el orden importa:

1. si #19 entra primero, #9 debe re-groundearse y conservar el hardening de presencia;
2. el merge resultante debe mantener adquisición NPC, expiración/scope de seeds, flags de presencia y determinismo;
3. `EVT_18_PRE_001/CALL_NANO` debe dejar simultáneamente conocimiento de Nano + `SEED_NANO_SHADOW` viva + `HAS_SEED_NANO_SHADOW=true`;
4. la fuente NPC ignorante debe seguir siendo rechazada.

QA dejó este riesgo señalado en ambos PR; no hará un cherry-pick ciego ni mergeará producción.

## Retirada 34+ y PR #15

El head actualizado de #15 corrige varios defectos técnicos: no-market abre una decisión del jugador, desaparece el suelo artificial de 5 % de oferta, `closed` sigue terminal y la suite de 34+ es más fuerte.

Pero QA no convierte CI verde en decisión canónica. La autoridad de coordinación actual mantiene **sin aprobar** la semántica post-anuncio y prohíbe asumir `announced -> playing`. El runtime de #15 aún permite esa transición con `RECONSIDERATION_WINDOW`; por tanto sigue siendo bloqueo canónico, no bug que QA deba “resolver” imponiendo una opción.

Además, #15 cambia contenido activo y sigue sujeto a la migración explícita de `contentIdentity`/pending/history antes de merge.

## Freeze pre-T5.1 y sesiones

El catálogo pre-T5.1 está congelado con `contentIdentity = 2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff`.

`GameSession.resume()` ya rechaza contenido distinto con `CONTENT_CHANGED`. QA mantiene el sentinel `freeze-t51-baseline.mjs --check`: mientras no exista migración aprobada, un PR de contenido no puede actualizar simplemente el fixture para volver verde el gate.

## PRs/workstreams relevantes a esta revisión

- **#17 QA:** segunda pasada independiente; abierta, sin merge automático.
- **#19 T5.2 hardening:** T5-QA-005 corregido y CI #313 verde; pendiente integración.
- **#9 T5.3:** T5-QA-004 corregido, composición T5.2/T5.3 presente y CI #301 verde; debe preservar #19 al re-ground.
- **#15 34+:** mejoras técnicas verificadas; continúa bloqueado por canon de reconsideración y migración de contenido.
- **#14 presentación:** issue #22 era un defecto QA histórico; la corrección vive en #17. Sigue pendiente el contrato público para distinguir contactos conocidos sin exponer memoria secreta y la evidencia T3.4 en teléfono físico.

## Correcciones al propio harness QA

QA ha corregido hasta ahora:

1. fixture de edades que no resolvía oferta pendiente;
2. suposición incorrecta de una sola generación terminal por seed;
3. intento descartado de imponer dedupe narrativo en resolver;
4. acoplamiento textual excesivo al formato de milestones de epílogo;
5. baseline hash schema 8 desfasado (T5-QA-007).

Estas correcciones no alteran gameplay ni canon.

## Simulación

`qa-t5-sim.mjs` registra cierre, edad/tipo de retirada, eventos por tramo, decisiones, seeds abiertas, familias de epílogo, mercado y estados imposibles. Los perfiles son sondas de cobertura, no personas reales ni objetivos de balance.

`qa:t5:expensive` ejecuta 225 carreras por configuración actual y permanece fuera de CI normal. **Todavía no se ha usado como evidencia de esta pasada.**

## Política ante nuevos bugs

1. aislar seed/perfil/estado mínimo;
2. crear reproducción automatizada;
3. si el fix pertenece a otro workstream, mantenerlo en `known-bugs` hasta que exista fix;
4. verificar el fix en el SHA exacto del owner;
5. promover la reproducción a gate normal antes o al integrar el fix;
6. comprobar nuevamente el merge real, sobre todo cuando dos PR tocan el mismo archivo.

## Archivos fuera de propiedad QA

QA no edita directamente:

- `project/PLAN_PASADAS.md`;
- `analysis/2026-09-11/plan-seguimiento.json`;
- contenido canónico de eventos.

Cambios upstream pueden aparecer en la rama únicamente por sincronización con `main`.

## Estado operativo

- T5.2 core está integrado.
- T5-QA-005 sigue en `main`, con fix verificado en #19.
- T5-QA-004 tiene fix verificado en #9 y ya está armado como regresión de integración.
- T5-QA-006 es ahora principalmente un riesgo de resolución de conflicto entre #19 y #9.
- T5-QA-007 está corregido sin tocar runtime; `npm test` incluye ya el gate de saves.
- Freeze/contentIdentity permanece protegido.
- El canon de reconsideración 34+ no lo decidirá QA.
- PR #17 permanece abierto y no debe mergearse automáticamente desde este workstream.
