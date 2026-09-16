# QA T5 — regresión, simulación y auditoría independiente

Rama propietaria: `qa/t5-regression`  
Base inicial inspeccionada: `main@c28d1194d7a6cce8aef9759bbb96875a710cb945`  
Owner: QA independiente  
Objetivo: aumentar la probabilidad de detectar regresiones importantes antes de `main`, no demostrar que el juego funciona.

## Principios

1. Un test de QA no convierte una distribución observada en regla de diseño.
2. Los bugs existentes se reproducen y se asignan; no se arregla silenciosamente producción ajena.
3. `npm test` sigue siendo el gate histórico corto. T5 añade gates separados.
4. Las simulaciones caras nunca forman parte de `npm test`.
5. Determinismo significa misma seed + mismas decisiones + misma configuración => mismo estado relevante, no solo un resumen parecido.
6. Microfeeds pueden consumir su stream propio, pero no pueden contaminar narrativa, fútbol, decisiones, retirada ni epílogo.

## Matriz de cobertura

| Área | Cobertura previa observada | Gate T5 | Estado |
|---|---|---|---|
| Determinismo | `final-gate-v08.mjs` usa esencialmente seed 424242; `test-session.mjs` compara sesión/headless | matriz de seeds × estrategias; igualdad de estado completa | cubierta |
| RNG isolation | comparación microfeeds on/off sobre seed 424242 | matriz multi-seed/multi-strategy y proyección de estado fuerte | cubierta |
| Save/restore | `test-saves.mjs`, `test-session.mjs`, `test-persistence.mjs` son fuertes | se mantiene como dependencia de integración; no se duplica | cubierta histórica |
| Idempotencia | commandId, double click, rollback, resume ya probados en `test-session.mjs` | se vigila por regresión de CI | cubierta histórica |
| Scheduler | tests de lotes y selección puntual | no repetibles <= 1, cierre acotado, simulación estratificada | ampliada |
| Edad | clasificadores/adaptadores probados por etapas | recorrido diario 18→20→23→26→30→34 con fase/adaptadores | cubierta |
| Seeds | auditor estático T5.2 existente | refs cerradas, una instancia viva, HAS_* coherente, no doble consumo, métricas de huérfanas/eternas | ampliada |
| NPC | relaciones numéricas aparecen en contenido; save valida `knowledge` | cierre de refs + reproducción de memoria inerte | bug abierto |
| Mercado | tests específicos de ofertas | invariantes before/terms, owner/registration, salario/meses y aceptación | ampliada |
| Retirada | gate v0.8 y motor tardío | cierre multi-seed/perfil; no oferta pendiente terminal | ampliada |
| Epílogo | generación y familias | 2–5 familias únicas; todo milestone debe existir en history | ampliada |
| Carreras largas | QA histórico 1.000 carreras | perfiles estratégicos y comando expensive separado | infraestructura lista |

## Gates

### Fast regression

```bash
npm run qa:t5:fast
```

Incluye propiedades transversales de determinismo, RNG isolation, cruces de edad, cierre de referencias y carreras largas acotadas.

### Content checks

```bash
npm run qa:t5:content
```

Falla por errores estructurales nuevos (IDs duplicados, refs a seed/NPC inexistentes, acciones desconocidas). Además registra deuda sin convertirla todavía en regla de diseño: seeds sin reader, writer o consumidor terminal y orígenes fuera del inventario de eventos.

Para persistir un informe:

```bash
T5_QA_OUTPUT=qa/t5-content.json npm run qa:t5:content
```

### Integration probes

```bash
npm run qa:t5:integration
```

Contiene probes de integración entre workstreams. Los probes dependientes de T5.2/T5.3 se saltan mientras esos módulos no estén presentes en la rama y pasan a ser gates reales automáticamente cuando se integran.

### Simulation checks

```bash
npm run qa:t5:simulation
```

Ejecuta una carrera por perfil estratégico y falla ante carrera bloqueada o estado imposible básico.

Perfiles de cobertura: `ambitious`, `conservative`, `loyal`, `mercenary`, `risky`, `health-first`, `fame-first`, `stability`, `contradictory`.

No representan futbolistas reales ni una distribución esperada de usuarios. Son sondas de cobertura. El selector puntúa `intentTags`/label y usa fallback determinista cuando el contenido no ofrece una señal semántica suficiente.

### Expensive simulation

```bash
npm run qa:t5:expensive
```

25 carreras por perfil (225 en total por ejecución actual). Es deliberadamente separado de CI normal y de `npm test`. Se puede variar con `T5_RUNS_PER_PROFILE` y `T5_BASE_SEED` ejecutando directamente `scripts/qa-t5-sim.mjs` tras build.

### Reproducciones de bugs conocidos

```bash
npm run qa:t5:known-bugs
```

Este comando es **rojo por diseño mientras los owners no corrijan los bugs**. No forma parte del gate normal.

## Registro de defectos

| ID | Severidad | Reproducción mínima | Owner probable | Estado | Test |
|---|---|---|---|---|---|
| T5-QA-001 | alta | jugar ~3000 días con seed fija; hay escenas con `npcRefs`, pero los `NPCState.knowledge`/`memories` de los NPC referenciados quedan idénticos al estado inicial | T5.3 NPC/memoria/conocimiento | abierto en base histórica; PR #9 lo aborda parcialmente | `scripts/test-t5-known-bugs.mjs` |
| T5-QA-002 | alta | recorrer `outcome.seedTransitions`; la base inspeccionada no expone consumidores terminales suficientes para cerrar el grafo de memoria | T5.2 seed lifecycle + contenido | deuda de contenido abierta; PR #8 añade mecanismo | `scripts/test-t5-known-bugs.mjs`, `scripts/qa-t5-content.mjs` |
| T5-QA-003 | media | el gate v0.8 validaba determinismo/RNG isolation de forma estrecha alrededor de una seed principal | QA T5 | mitigado e integrado en #11 | `scripts/test-t5-regression.mjs` |
| T5-QA-004 | alta | informar a un NPC usando `sourceNpcId` que no conoce el hecho; la API T5.3 actual concede conocimiento verdadero al receptor | T5.3 NPC/conocimiento | abierto en PR #9 | `scripts/test-t5-known-bugs.mjs` |
| T5-QA-005 | alta | borrar una instancia de seed, dejar `HAS_SEED_X=true`, llamar `syncSeedPresenceFlagsInPlace`; el flag no se limpia porque solo se recorren IDs presentes en `state.seeds` | T5.2 seed lifecycle | abierto en PR #8 | `scripts/test-t5-integration-probes.mjs` |
| T5-QA-006 | alta integración | T5.2 y T5.3 modifican `resolver.ts`; una resolución debe conservar a la vez transición de seed y adquisición explícita de conocimiento | integrador + T5.2/T5.3 | gate preventivo | `scripts/test-t5-integration-probes.mjs` |

### T5-QA-001 — evidencia y riesgo

`NPCState` ya declara `knowledge`, `memories`, `reliability` y `access`, y el save exige esos campos. En la base histórica las rutas de producción no convertían eventos vividos en conocimiento/memoria persistente. PR #9 introduce una arquitectura deny-by-default y reglas explícitas, pero todavía debe cerrar sus gaps epistemológicos y superar su auditoría antes de considerar resuelto este defecto.

### T5-QA-002 — evidencia y riesgo

El motor soportaba estados terminales (`resolved`, `expired`), `consumedBy` y expiración explícita, pero el grafo de contenido carecía de consumidores suficientes. PR #8 añade mecanismo de scope/caducidad y reapertura, pero no convierte automáticamente la deuda canónica en cierres inventados.

### T5-QA-004 — fuente de información imposible

La API T5.3 acepta `sourceNpcId` para una información `reported`, pero el head inspeccionado no verifica que ese NPC fuente conozca el hecho. Si `sourceNpcId` describe una vía causal, una fuente ignorante no debe crear conocimiento verdadero en el receptor. Son soluciones válidas:

- rechazar la transmisión;
- exigir `npcKnows(sourceNpcId, factId)`;
- modelar rumor/claim de forma separada para que no satisfaga automáticamente `npcKnows` ni gates de conocimiento.

No se propone inferir presencia/conocimiento desde `npcRefs`.

### T5-QA-005 — flag de seed fantasma

El `syncSeedPresenceFlagsInPlace` inspeccionado en PR #8 recalcula flags únicamente para IDs encontrados en `state.seeds`. Si un save/estado conserva `HAS_SEED_X=true` pero la instancia correspondiente no está, el flag puede sobrevivir y habilitar gates causales sin memoria real. El probe exige que una sincronización explícita elimine esa divergencia manteniendo compatibilidad con seeds desconocidas de saves.

### T5-QA-006 — merge de resolver

PR #8 y #9 comparten `src/narrative/resolver.ts`. El segundo workstream en integrarse debe combinar conscientemente:

- lifecycle/scope/flags de seeds;
- adquisición de conocimiento NPC;
- historial;
- determinismo;
- idempotencia en el límite de sesión/comando.

El probe integrado usa `EVT_18_PRE_001/CALL_NANO`: tras una única resolución deben coexistir el conocimiento de Nano y `SEED_NANO_SHADOW` viva con su presencia sincronizada.

## Correcciones al propio harness QA

QA también debe ser auditado. Durante esta segunda pasada se corrigió una suposición demasiado estricta: el gate antiguo exigía como máximo una instancia `resolved` por ID de seed. T5.2 define legítimamente cierre → reapertura → nueva generación, conservando generaciones terminales históricas. El gate actualizado permite múltiples terminales históricas y detecta en cambio cierres terminales exactamente duplicados, manteniendo `<= 1` instancia viva.

También se descartó antes de consolidarlo un probe que habría impuesto idempotencia heurística dentro de `resolver` por `(eventId, choiceId, fecha)`. Esa frontera ya pertenece a `GameSession`/commandId; QA no debe convertir una implementación disputada en contrato por accidente.

## PRs/workstreams inspeccionados

Estado de la segunda pasada:

- PR #8 `t5/seed-lifecycle`: implementación funcional presente; CI del head inspeccionado verde, pero bloqueado por replay demasiado amplio en resolver y por T5-QA-005.
- PR #9 `t5/npc-memory`: implementación funcional presente; arquitectura deny-by-default; el head inspeccionado falla `Repository integrity` en `npm test` porque su propio `audit:t53 --check` reporta gaps epistemológicos. Además T5-QA-004 queda abierto.
- PR #8 y #9 solapan `resolver.ts` y `package.json`; no admitir cherry-pick que descarte silenciosamente una responsabilidad.
- El `main` actual contiene el freeze pre-T5.1 (`qa/fixtures/t5.1/*` + `scripts/freeze-t51-baseline.mjs`), incorporado a esta rama QA antes de continuar.

## Métricas de simulación registradas

`qa-t5-sim.mjs` registra por carrera:

- cierre/no cierre;
- edad de retirada y tipo de cierre;
- eventos por tramo;
- decisiones/historial;
- seeds abiertas;
- familias de epílogo;
- decisiones de mercado;
- estados imposibles detectados.

Estas métricas son telemetría QA. No son objetivos de balance.

## Evidencia del primer PR

PR `#11` — `QA T5: regression gates and stratified simulation harness` — fue posteriormente integrado por el coordinador en `main` como `3079a311a3899d720024cffe8003a577c4146096`. QA no ejecutó el merge.

Antes de integración, GitHub Actions verificó en checkout limpio:

- `npm test`;
- determinismo + RNG isolation;
- cruces de edad y adaptadores;
- referencias de contenido;
- carreras largas;
- auditoría de lifecycle;
- simulación estratificada de 9 perfiles.

El primer intento del gate T5 detectó un defecto del propio harness: el test de edades llamaba directamente a `advanceWorldDayInPlace()` sin resolver una oferta pendiente, por lo que el reloj quedaba correctamente bloqueado por la autoridad de mercado. Se corrigió **solo QA** haciendo que el fixture rechace la oferta pendiente antes de avanzar. No se tocó producción.

## Política ante nuevos bugs

1. aislar la seed/perfil/estado mínimo;
2. añadir reproducción automatizada;
3. dejar el test rojo en `qa:t5:known-bugs` si el fix pertenece a otro workstream;
4. registrar owner y severidad aquí;
5. añadir el caso al gate normal únicamente cuando el comportamiento esperado sea estable y el owner haya corregido producción.

## Archivos que este workstream no debe tocar

- `project/PLAN_PASADAS.md`
- `analysis/2026-09-11/plan-seguimiento.json`
- contenido canónico de eventos

## Estado de la segunda pasada

La rama QA está sincronizada con `main@9773104440615611f059a4f45c69c25d280a26aa` mediante merge, incluyendo el freeze pre-T5.1. Los nuevos probes no cambian producción ni canon. El siguiente PR QA debe validarse en checkout limpio antes de recomendar integración.
