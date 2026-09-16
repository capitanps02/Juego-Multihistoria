# QA T5 — regresión, simulación y auditoría independiente

Rama propietaria: `qa/t5-regression`  
Baseline inicial: `main@c28d1194d7a6cce8aef9759bbb96875a710cb945`  
Owner: QA independiente  
Objetivo: aumentar la probabilidad de detectar regresiones importantes antes de `main`, no demostrar que el juego funciona.

## Principios

1. Un test de QA no convierte una distribución observada en regla de diseño.
2. Un bug existente se reproduce y asigna; QA no corrige silenciosamente producción de otro workstream.
3. `npm test` sigue siendo el gate histórico corto; T5 añade gates separados.
4. Las simulaciones caras no forman parte de `npm test` ni del CI normal.
5. Determinismo = misma seed + mismas elecciones + misma configuración => mismo estado relevante.
6. Microfeeds pueden consumir su stream propio, pero no contaminar narrativa fuerte, fútbol, decisiones, retirada ni epílogo.
7. Un gate QA también se audita: una suposición incorrecta del harness se corrige en QA, no se convierte en contrato del motor.

## Matriz de cobertura

| Área | Cobertura T5 | Estado |
|---|---|---|
| Determinismo | matriz multi-seed × estrategia; igualdad de estado + firma | cubierta |
| RNG isolation | microfeeds on/off sobre múltiples seeds/estrategias | cubierta |
| Save/restore | regresión histórica de sesión/saves/persistencia + `contentIdentity` | cubierta histórica |
| Idempotencia | `commandId`/receipts/double-click/rollback/resume | cubierta histórica |
| Scheduler | no repetibles, cierre acotado y simulación estratificada | ampliada |
| Edad | 18→20→23→26→30→34 + adaptadores | cubierta |
| Seeds | refs, generaciones, flags, consumidores, expiración y T5.2 | ampliada; bug abierto |
| NPC | refs + memoria/conocimiento + probes epistemológicos | T5.3 pendiente; bugs abiertos |
| Mercado | coherencia before/terms, owner/registration y cierre terminal | ampliada |
| Retirada | cierre multi-seed/perfil + ausencia de pending terminal | ampliada |
| Epílogo | familias únicas + milestones respaldados por `HistoryEntry` | ampliada |
| Carreras largas | multi-seed + perfiles; expensive separado | infraestructura lista |
| Content identity | freeze reproducible pre-T5.1 | sentinel activo |
| Integración T5.2/T5.3 | lifecycle de seed + conocimiento NPC en una misma resolución | probe preventivo |

## Gates

### Fast regression

```bash
npm run qa:t5:fast
```

Determinismo, aislamiento RNG, edad, referencias y carreras largas.

### Content checks

```bash
npm run qa:t5:content
```

IDs duplicados, referencias inexistentes y métricas de lifecycle. La deuda existente se informa sin convertirla arbitrariamente en regla de diseño.

### Freeze pre-T5.1

```bash
npm run qa:t5:freeze
```

Ejecuta `scripts/freeze-t51-baseline.mjs --check` contra el catálogo congelado. Mientras no exista una migración explícita aprobada, un cambio silencioso al catálogo activo debe romper este gate. El baseline no debe regenerarse simplemente para hacer verde un PR de contenido.

### Integration probes

```bash
npm run qa:t5:integration
```

Pruebas entre workstreams. T5.2 ya está integrado. El probe T5.2+T5.3 se activa automáticamente cuando también exista el módulo de conocimiento NPC.

### Simulation checks

```bash
npm run qa:t5:simulation
```

Una carrera por perfil: `ambitious`, `conservative`, `loyal`, `mercenary`, `risky`, `health-first`, `fame-first`, `stability`, `contradictory`.

### Expensive simulation

```bash
npm run qa:t5:expensive
```

25 carreras por perfil = 225 carreras por ejecución actual. Fuera de CI normal.

### Bugs conocidos

```bash
npm run qa:t5:known-bugs
```

Este comando es **rojo por diseño** mientras los owners no corrijan los defectos. Las reproducciones de producción ya confirmadas se mantienen aquí para no inutilizar permanentemente el gate normal.

## Registro de defectos

| ID | Severidad | Reproducción mínima | Owner probable | Estado | Test |
|---|---|---|---|---|---|
| T5-QA-001 | alta | NPC referenciados en hechos jugados sin evolución de `knowledge/memories` en baseline histórico | T5.3 NPC/memoria | abierto hasta integrar/validar T5.3 | `test-t5-known-bugs.mjs` |
| T5-QA-002 | alta | catálogo con muy pocos cierres terminales frente a seeds creadas/consumidas | contenido/T5.4 sobre mecanismo T5.2 | deuda de contenido abierta | `test-t5-known-bugs.mjs`, `qa-t5-content.mjs` |
| T5-QA-003 | media | determinismo histórico concentrado en una seed | QA T5 | mitigado e integrado en PR #11 | `test-t5-regression.mjs` |
| T5-QA-004 | alta | `sourceNpcId` puede transmitir un hecho aunque la fuente no lo conozca | T5.3 NPC/conocimiento | abierto en PR #9 inspeccionado | `test-t5-known-bugs.mjs` |
| T5-QA-005 | alta | `HAS_SEED_X=true` sin instancia viva sobrevive a `syncSeedPresenceFlagsInPlace()` | T5.2 follow-up | **confirmado en main** tras integrar #8 | `test-t5-known-bugs.mjs` |
| T5-QA-006 | alta integración | una resolución con T5.2+T5.3 debe conservar seed y conocimiento a la vez | integrador + T5.3 | gate preventivo | `test-t5-integration-probes.mjs` |

### T5-QA-001 — frontera de memoria NPC

El baseline pre-T5.3 tenía estructuras `knowledge` y `memories`, pero no una frontera operativa suficiente mundo→conocimiento. PR #9 introduce arquitectura deny-by-default y reglas outcome-specific. El defecto no se considera cerrado hasta integrar T5.3 y ejecutar QA sobre el merge real con T5.2.

### T5-QA-002 — deuda de cierre de seeds

T5.2 ya está integrado y aporta mecanismo de scope, expiración, generaciones y estados terminales. Eso no inventa cierres narrativos: siguen existiendo muchas seeds sin consumidor detectable. QA registra la deuda y evita convertir una distribución actual en requisito de balance.

### T5-QA-004 — fuente NPC imposible

En el head inspeccionado de PR #9, `informNpcOfEventInPlace()` acepta `sourceNpcId` pero no comprueba que la fuente conozca el hecho. Reproducción: tras `EVT_18_PRE_001/CALL_NANO`, usar un NPC ignorante como fuente para informar a otro NPC. Son soluciones válidas:

- rechazar la transmisión;
- exigir conocimiento de la fuente;
- modelar rumor/claim separado de conocimiento verdadero, sin satisfacer automáticamente `npcKnows`.

No se infiere conocimiento desde `npcRefs`.

### T5-QA-005 — flag de seed fantasma, confirmado post-merge

T5.2 se integró externamente en `main` mediante PR #8 (`14e55bb0e7f2c7582889c7b4ebbbccfd0b792345`). El runtime integrado mantiene:

```text
syncSeedPresenceFlagsInPlace -> recorre solo IDs presentes en state.seeds
```

Reproducción mínima:

1. crear estado;
2. eliminar cualquier instancia `SEED_NANO_SHADOW`;
3. dejar `HAS_SEED_NANO_SHADOW=true`;
4. ejecutar `syncSeedPresenceFlagsInPlace()`;
5. el flag permanece `true`.

Evidencia: QA run #246 sobre la rama sincronizada con T5.2 pasó `npm test`, freeze, determinismo/RNG, edades, referencias, carreras largas y lifecycle, y falló **exactamente** en `T5 cross-workstream integration probes` por esta reproducción.

Como producción ya estaba en `main`, QA no aplicó un hotfix ajeno. La reproducción se movió a `qa:t5:known-bugs`; se dejó comentario post-merge en PR #8 y el owner T5.2 necesita follow-up.

### T5-QA-006 — coexistencia de T5.2 y T5.3

PR #8 y #9 modifican `src/narrative/resolver.ts`. Cuando T5.3 se integre, `EVT_18_PRE_001/CALL_NANO` debe conservar simultáneamente:

- conocimiento explícito de Nano (`NPC_PLR_14`);
- `SEED_NANO_SHADOW` viva;
- `HAS_SEED_NANO_SHADOW=true`.

El probe no impone idempotencia heurística por `(eventId, choiceId, fecha)`: esa frontera pertenece a `GameSession.commandId` + receipts.

## Correcciones al propio harness QA

### Generaciones terminales de seed

El primer gate asumía como máximo un `resolved` por ID. T5.2 permite correctamente cierre → reapertura → nueva generación, conservando terminales históricos. QA ahora exige `<=1` instancia viva y detecta cierres terminales exactamente duplicados, no múltiples generaciones legítimas.

### Mercado pendiente en test de edad

Un fixture de cruces de edad se quedó congelado porque `advanceWorldDayInPlace()` bloquea correctamente cuando existe una oferta pendiente. QA se corrigió para rechazar la oferta antes de avanzar. Producción no cambió.

### Idempotencia en resolver

Se descartó un probe que habría convertido la deduplicación narrativa por fecha/evento/choice en contrato. La idempotencia de comandos sigue en `GameSession`; QA no debe fijar accidentalmente una implementación rechazada por arquitectura.

### Formato de milestones de epílogo

PR #15 enriqueció milestones de:

```text
season · eventId · choiceId
```

a:

```text
season · club · eventId · choiceId/outcomeId
```

El gate `T5 long careers` anterior comparaba texto literal y produjo un falso rojo en el run #194 de PR #15. QA ahora valida evidencia semántica contra `HistoryEntry` y acepta ambos formatos durante la transición. Este ajuste **no** resuelve los bloqueos canónicos/funcionales de #15 (reconsideración, transiciones automáticas, aliases y migración).

## Freeze y `contentIdentity`

El freeze pre-T5.1 está integrado en `main` mediante:

- `qa/fixtures/t5.1/pre-t51-content-manifest.json`;
- `qa/fixtures/t5.1/pre-t51-event-catalog.json`;
- `scripts/freeze-t51-baseline.mjs`.

`GameSession.resume()` ya rechaza un `contentIdentity` distinto con `CONTENT_CHANGED`; `test-session.mjs` cubre esa frontera. Por eso QA no duplica esa prueba. El nuevo sentinel protege el paso anterior: ningún workstream de contenido puede cambiar silenciosamente el catálogo congelado antes de aportar la estrategia explícita de migración/pending/history correspondiente.

## PRs/workstreams inspeccionados

### PR #8 — T5.2 seed lifecycle

Integrado por el coordinador en `main` como `14e55bb0e7f2c7582889c7b4ebbbccfd0b792345`. QA no ejecutó el merge. Su suite propia pasó, pero el probe independiente posterior descubrió T5-QA-005 en el runtime ya integrado.

### PR #9 — T5.3 NPC knowledge

Head inspeccionado: `7c8c81e015191c9fa441cf49942a9a458b2440bd`. Añade arquitectura deny-by-default, memoria persistente y gates de conocimiento. T5-QA-004 sigue reproducible en la API inspeccionada porque `sourceNpcId` no prueba que la fuente conozca el hecho. Debe re-groundearse contra T5.2 antes de integración; no se da por verde el head actual sin evidencia de workflow del SHA exacto.

### PR #15 — 34+/retirada/epílogos

Tiene trabajo útil y un nuevo formato de milestones que obligó a corregir el harness QA. Continúa bloqueado por cuestiones distintas del formato: canon de reconsideración, transición automática `decided→announced`, posibles anuncios/cierres fabricados y política de aliases/content identity. QA dejó comentario aclarando que el rojo de `T5 long careers` del run #194 era un acoplamiento del harness, no evidencia suficiente contra los milestones enriquecidos.

## Métricas de simulación

`qa-t5-sim.mjs` registra por carrera:

- cierre/no cierre;
- edad/tipo de retirada;
- eventos por tramo;
- decisiones/historial;
- seeds abiertas;
- familias de epílogo;
- decisiones de mercado;
- estados imposibles.

Son telemetría QA, no objetivos de balance.

## Evidencia histórica de QA

PR #11 (`QA T5: regression gates and stratified simulation harness`) fue integrado posteriormente por el coordinador como `3079a311a3899d720024cffe8003a577c4146096`. QA no hizo el merge.

La segunda pasada vive en PR #17 (`QA T5: cross-workstream probes for seeds and NPC knowledge`). Su objetivo es añadir probes adversariales de integración, freeze sentinel y correcciones del propio harness sin tocar runtime/canon.

## Política ante nuevos bugs

1. aislar seed/perfil/estado mínimo;
2. añadir reproducción automatizada;
3. si el fix pertenece a otro workstream, mover la reproducción a `qa:t5:known-bugs` y mantener el gate normal utilizable;
4. registrar owner, severidad y evidencia;
5. promover la reproducción al gate normal cuando producción ya tenga el comportamiento esperado estable.

## Archivos que QA no modifica

- `project/PLAN_PASADAS.md`
- `analysis/2026-09-11/plan-seguimiento.json`
- contenido canónico de eventos

Cambios upstream en esos archivos pueden entrar únicamente al sincronizar con `main`; QA no los edita ni los usa como sustituto de evidencia ejecutable.

## Estado actual

- T5.2 está integrado en `main`.
- T5-QA-005 está confirmado post-merge y aislado como bug conocido.
- T5-QA-004 permanece abierto sobre el head inspeccionado de T5.3.
- T5-QA-006 queda preparado para el merge T5.2+T5.3.
- Freeze sentinel activo.
- Harness de epílogo compatible semánticamente con milestones históricos y enriquecidos.
- PR #17 sigue abierto; no mergear desde este workstream.
