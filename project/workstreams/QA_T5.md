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
| T5-QA-001 | alta | jugar ~3000 días con seed fija; hay escenas con `npcRefs`, pero los `NPCState.knowledge`/`memories` de los NPC referenciados quedan idénticos al estado inicial | T5.3 NPC/memoria/conocimiento | abierto en base inspeccionada | `scripts/test-t5-known-bugs.mjs` |
| T5-QA-002 | alta | recorrer `outcome.seedTransitions`; la base inspeccionada no expone consumidores terminales `resolve`/`expire` suficientes para cerrar el grafo de memoria | T5.2 seed lifecycle | abierto en base inspeccionada | `scripts/test-t5-known-bugs.mjs`, `scripts/qa-t5-content.mjs` |
| T5-QA-003 | media | el gate v0.8 validaba determinismo/RNG isolation de forma estrecha alrededor de una seed principal | QA T5 | mitigado en esta rama | `scripts/test-t5-regression.mjs` |

### T5-QA-001 — evidencia y riesgo

`NPCState` ya declara `knowledge`, `memories`, `reliability` y `access`, y el save exige esos campos. Sin embargo, en la base inspeccionada las rutas de producción encontradas leen relaciones o validan NPCs, pero no convierten eventos vividos en conocimiento/memoria persistente del NPC. Resultado: el NPC puede estar referenciado narrativamente sin aprender nada del hecho. Esto impide demostrar no-omnisciencia porque todavía no existe una frontera de conocimiento operativa que auditar.

Criterio de cierre QA: la reproducción debe pasar porque al menos un NPC que participa en un hecho aprende/recuerda solo lo que recibe por una vía válida; después se añadirán pruebas negativas de NPC no informado.

### T5-QA-002 — evidencia y riesgo

El motor soporta estados terminales (`resolved`, `expired`), `consumedBy` y expiración explícita, pero el grafo de contenido debe demostrar consumidores reales. Un lifecycle que solo crea/activa/intensifica deja memoria eterna aunque la infraestructura permita cerrarla.

Criterio de cierre QA: existencia de consumidores terminales reales + simulaciones sin doble consumo + política explícita para recreación de una seed terminal.

## PRs/workstreams inspeccionados

En la inspección inicial:

- `t5/seed-lifecycle` existía pero era idéntica a `main`.
- `t5/npc-memory` existía pero era idéntica a `main`.
- PR #3 (`20–23`), #5 (`26–30` semántica) y #7 (`edad 26 / cronología seeds`) eran borradores de preparación/documentación, sin implementación funcional que ejecutar todavía.

Riesgos a revalidar cuando cambien esos heads:

1. migración de IDs sin reinterpretar historial antiguo;
2. seeds activas que sobreviven save/restore con el mismo significado;
3. consumidores de seeds que no disparan antes de su causa;
4. cambio de canon que no altera determinismo para saves/elecciones equivalentes salvo migración explícita;
5. NPC que no recibe información privada por mera presencia global del flag/seed.

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

## Criterio del primer PR

El PR inicial es revisable cuando:

- los gates están versionados;
- CI ejecuta `npm test` y después `npm run qa:t5`;
- las reproducciones de bugs conocidos están separadas;
- la simulación expensive queda fuera de CI;
- no hay cambios en producción/canon;
- se inspecciona el resultado real de GitHub Actions antes de recomendar integración.
