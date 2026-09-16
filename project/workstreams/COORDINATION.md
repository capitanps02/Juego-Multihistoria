# Multihistoria / Carrera de Futbolista — Panel de coordinación

**Última revisión:** 2026-09-16  
**Autoridad:** conversación coordinadora principal / integrador de `main`  
**Repositorio oficial:** `capitanps02/Juego-Multihistoria`  
**Rama de integración:** `main`

> Este documento registra el estado de integración, no sustituye la evidencia de cierre de cada pasada. GitHub y el código ejecutable prevalecen sobre resúmenes históricos. Una auditoría o un prompt preparado no equivalen a implementación.

## 1. Estado de `main` en la revisión

- SHA inspeccionado antes de crear este panel: `c28d1194d7a6cce8aef9759bbb96875a710cb945`.
- Último cambio funcional conocido: motor v0.8 + cierres T1–T4.6 ya presentes; el commit superior añade validación de checkout limpio.
- CI `Repository integrity` para `c28d1194d7a6cce8aef9759bbb96875a710cb945`: **SUCCESS**.
- El workflow ejecuta `npm ci` y `npm test` sobre checkout limpio con Node 20.
- `main` no tiene protección de rama configurada en GitHub en esta revisión. La disciplina de integración depende por tanto del proceso y de revisión por SHA.

## 2. Estado real reconstruido del producto

### Base funcional confirmada

- Motor v0.8.
- 254 eventos principales + 134 condicionales = **388 eventos estructurados**.
- **210 seeds** registradas.
- **20 NPC persistentes**.
- **20 familias de epílogo**.
- Guardados: **schema 8**.
- RNG separado entre `narrative`, `football`, `microfeed` y `qa`.

### Pasadas

- **T1:** completada.
- **T2.1–T2.5:** completadas con evidencia específica de sesión, migraciones, persistencia, autoridad de ofertas e hitos.
- **T3.1–T3.3:** completadas.
- **T3.4:** técnicamente preparada en emulador; **NO cerrada**. Falta evidencia en teléfono Android físico y comprobación visual de importar/exportar.
- **T4.1–T4.6:** completadas con pruebas dirigidas y regresión.
- **T4.7/T4.8:** **omitidas por decisión de alcance**; no se cuentan como completadas ni ganan peso.
- **T5.1:** **en curso**. La implementación canónica completa no está cerrada.

### Progreso ponderado

Reconstrucción a partir de pesos cerrados en `PLAN_PASADAS.md`:

- T1: 6,00 %.
- T2: 11,00 %.
- T3: 8,25 % de 11 %.
- T4: 8,26 % de 11 %.
- T5+: 0 % ganado todavía.
- **Total ganado: 33,51 %.**

Pasadas realmente cerradas: **15**.  
Pasadas omitidas: **2** (`T4.7`, `T4.8`).  
Baseline histórico: 68 pasadas. Permanecen 53 no cerradas en la aritmética original; al excluir las 2 omitidas quedan **51 pasadas baseline ejecutables**. Esto no recalibra todavía el rango 55–87.

## 3. T5.1 — estado de verdad

### En `main`

La auditoría reproducible vigente en `main` conserva esta línea base:

- 254 principales canónicos.
- 254 principales en motor.
- **167** principales con el mismo ID literal.
- **87** IDs principales canónicos sin correspondencia aprobada.
- **134** condicionales registrados como conteo todavía no reconciliado semánticamente en la auditoría actualmente integrada.
- Ningún alias automático aprobado.

### En la rama de planificación todavía no integrada

`chore/chatgpt-codex-workflow` contiene una planificación T5.1 mucho más avanzada, pero **no cambia runtime**. Entre otros artefactos declara:

- asignación de los 87/87 principales canónicos ausentes a lotes responsables;
- asignación de los 87 principales técnicos extra;
- revisión semántica de planificación de 134/134 condicionales;
- diseño de migración de contenido/sesión;
- requisito de congelar el catálogo pre-T5.1 antes del primer cambio funcional;
- bloqueo canónico explícito sobre la reversión de retirada.

Esto se considera **planning/audit evidence**, no avance funcional ni cierre de T5.1.

## 4. Ramas y PR activos

| PR / rama | Workstream | Estado de revisión | Trabajo presente | Bloqueo / acción |
|---|---|---|---|---|
| #1 `chore/chatgpt-codex-workflow` | Coordinación + auditoría/planificación T5.1 | **PENDIENTE, rama activa** | Reglas de agentes, cola Codex, auditorías y diseño de migración; sin cambios de runtime según auditoría de rama | La rama está recibiendo commits concurrentes. Dos intentos de merge protegidos por `expected_head_sha` se abortaron correctamente al cambiar `HEAD`. No integrar hasta estabilizar y volver a revisar SHA + CI. |
| #3 `task/t5.1-batch-01` | Canon 20–23 | **DRAFT / planificación solamente** | Briefing para 6 IDs canónicos ausentes y 6 IDs técnicos extra | Re-ground/rebase sobre la base integrada vigente antes de cualquier implementación. Después ejecutar código/tests y volver a revisión. |
| #7 `task/t5.1-batch-02b` | Canon 26 + seeds/cronología | **DRAFT / planificación solamente** | 9 escenas canónicas de 26 y reparación de cronología de seeds | Re-ground sobre base vigente. Integración funcional recomendada después de #3; debe preceder a #5. |
| #5 `task/t5.1-batch-02a` | Canon 27–28 / candidatos de título | **BLOCKED-BY-#7** | 3 reparaciones semánticas candidatas | No ejecutar ni integrar hasta incorporar el resultado revisado de #7 y refrescar auditoría. |

En la revisión actual no existen ramas separadas activas para Canon 30–34, Canon 34+/retirada/epílogo, NPC/conocimiento, QA independiente o PlayCanvas/Android/presentación. Sus tareas pueden planificarse, pero no deben figurar como implementadas.

## 5. Conflictos y propiedad

### Conflicto confirmado #7 ↔ #5

Ambos workstreams están previstos sobre catálogo `26_30` y metadata/cronología de seeds. **No deben integrarse en paralelo.** Orden: #7 → refrescar/rebasar #5 → #5.

### #3 frente a #7

El contenido principal está en tramos distintos y la investigación/revisión semántica puede avanzar en paralelo. La integración funcional se mantiene serializada mientras ambos puedan tocar contratos compartidos de identidad de contenido, saves, migración o catálogo global. Orden conservador actual: #3 → #7.

### Seeds / NPC / QA

- Auditoría y diseño pueden avanzar en paralelo con contenido si no escriben el mismo contrato.
- Cambios a `src/catalog/seeds.ts`, scheduler, save/session, conocimiento de NPC o tipos compartidos requieren coordinación central antes de integrar.
- QA puede añadir pruebas independientes en paralelo, pero no debe relajar gates para hacer pasar una implementación.

### Presentación / Android

Puede avanzar en UI/packaging sin modificar estado oculto ni lógica del motor. Bundles generados deben regenerarse desde fuente; no se aceptan hand-edits. T3.4 continúa dependiendo de evidencia física externa.

## 6. Orden de integración recomendado

1. Estabilizar y revisar la cabeza final de PR #1; integrar solo si el diff sigue siendo planificación/auditoría y el CI del SHA exacto pasa.
2. Congelar de forma reproducible el catálogo/content identity pre-T5.1 **antes del primer cambio funcional**.
3. Re-ground PR #3 sobre la base vigente; implementar; ejecutar pruebas dirigidas + `npm test`; revisar; integrar.
4. Re-ground PR #7 sobre la nueva base; implementar seeds/edad 26; pruebas causales + saves/RNG + `npm test`; revisar; integrar.
5. Re-ground PR #5 sobre el resultado de #7; implementar solo equivalencias semánticamente demostradas; pruebas de migración + `npm test`; revisar; integrar.
6. Continuar los lotes 02C+ únicamente después de refrescar la auditoría, manteniendo propiedad por tramo y contratos compartidos bajo el coordinador.

## 7. Tests globales / gates

Gate mínimo de integración:

```text
npm test
```

Además, ejecutar las suites del subsistema tocado. Como referencia disponible en `package.json`:

- `test:session`
- `test:saves`
- `test:persistence`
- `test:offers`
- `test:playcanvas`
- `test:android:offline`
- `test:android:t34`
- `test:t25`, `test:t32`, `test:t41`…`test:t47`
- `audit:t51`, `test:t51`

Para T5.1 no se aceptará un `test:t51` verde basado en supuestos obsoletos si la reconciliación nueva demuestra que el auditor debe evolucionar. La solución es actualizar el auditor con evidencia, no conservar una falsa compatibilidad.

## 8. Inconsistencias documentales detectadas

1. `project/PLAN_PASADAS.md` ya dice T4.7/T4.8 omitidas y T5.1 en curso, pero su tabla todavía representa T4 como 6/8 y T5 como pendiente. El porcentaje 33,51 % sigue siendo matemáticamente correcto porque las omitidas no ganan peso.
2. `analysis/2026-09-11/plan-seguimiento.json` está más atrasado: mantiene `nextPass = T4.7`, T4.7/T4.8 como `not_started` y T5/T5.1 como `not_started`.
3. La auditoría T5.1 integrada en `main` todavía dice que los 134 condicionales son `count_only_not_semantically_reconciled`; la rama de planificación tiene revisión 134/134, pero esa evidencia aún no está integrada y tampoco equivale a runtime reconciliado.
4. Los cierres históricos T2/T3 contienen porcentajes acumulados válidos en su fecha; no deben leerse como el porcentaje global vigente.

**Política:** hasta sincronizar los dos artefactos de seguimiento, este panel + evidencia de código/CI define la interpretación actual. La próxima revisión de tracking debe conservar 33,51 %, marcar T5.1 `in_progress`, T4.7/T4.8 `omitted`, T3.4 `in_progress/external evidence pending` y eliminar `T4.7` como siguiente pasada.

## 9. Bloqueos actuales

- **T3.4:** teléfono físico Android.
- **PR #1:** rama en escritura concurrente; no existe SHA estable revisado para integrar.
- **T5.1 funcional:** ramas de tareas obsoletas respecto a su base de planificación; requieren re-ground antes de ejecutar.
- **Retirada 34+:** conflicto canónico sobre reconsideración tras anuncio. No implementar por inferencia.
- **Migración de contenido:** hay que congelar el catálogo pre-T5.1 antes de modificar definiciones activas.

## 10. Siguiente cuello de botella

**Conseguir una base T5.1 estable e integrada, congelar el content identity pre-T5.1 y re-groundear el primer lote funcional (#3).**

Hasta entonces, preparar más prompts o auditorías puede mejorar planificación, pero no aumenta el porcentaje ponderado ni cierra T5.1.
