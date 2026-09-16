# Multihistoria / Carrera de Futbolista — Panel de coordinación

**Última revisión:** 2026-09-16  
**Autoridad:** conversación coordinadora principal / integrador de `main`  
**Repositorio oficial:** `capitanps02/Juego-Multihistoria`  
**Rama de integración:** `main`

> Este documento registra el estado de integración. GitHub, código ejecutable y CI prevalecen sobre resúmenes históricos. Una auditoría, prompt o planning completo no equivale a implementación funcional.

## 1. Estado de `main`

- SHA actual tras integración QA: `3079a311a3899d720024cffe8003a577c4146096`.
- Último PR integrado por el coordinador: **#11 · QA T5 regression gates and stratified simulation harness**.
- PR #11 fue integrado por squash con `expected_head_sha=4233ffee44bcfc46a88394ff8a86b8d276eb9427` después de `Repository integrity: SUCCESS` sobre ese SHA.
- El cambio integrado añade QA/CI; **no modifica runtime de producción ni contenido canónico**.
- `main` sigue sin protección de rama configurada en GitHub; la integración usa revisión explícita + SHA esperado.

## 2. Base funcional y progreso

Confirmado en la base integrada:

- motor v0.8;
- 254 eventos principales + 134 condicionales = **388 eventos**;
- **210 seeds**;
- **20 NPC persistentes**;
- **20 familias de epílogo**;
- save schema **8**;
- RNG separado `narrative`, `football`, `microfeed`, `qa`.

Pasadas:

- T1: completada.
- T2.1–T2.5: completadas.
- T3.1–T3.3: completadas.
- T3.4: técnicamente preparada; **pendiente teléfono Android físico**.
- T4.1–T4.6: completadas.
- T4.7/T4.8: **omitidas por decisión de alcance**, sin peso ganado.
- T5.1: en curso; sin cierre funcional acreditado.
- T5.2/T5.3: ramas funcionales activas, aún no integradas.

Progreso ponderado acreditado: **33,51 %**.  
Pasadas realmente cerradas: **15**.  
No se gana porcentaje por auditorías parciales, prompts, ramas abiertas o CI verde sin criterio completo.

## 3. QA T5 ya integrado

PR #11 incorpora:

- `qa:t5:fast`;
- `qa:t5:content`;
- `qa:t5:simulation`;
- `qa:t5:expensive` fuera del CI normal;
- `qa:t5:known-bugs` deliberadamente rojo y fuera del gate normal;
- workflow de `Repository integrity` con determinismo/RNG, edades, referencias, carreras largas, lifecycle y simulación estratificada.

Defectos base documentados por QA:

- T5-QA-001: conocimiento/memoria NPC inerte en la base histórica;
- T5-QA-002: lifecycle de seeds con cierres insuficientemente demostrados;
- T5-QA-003: cobertura histórica de determinismo demasiado estrecha, mitigada por los nuevos gates.

Los workstreams funcionales deben re-groundearse sobre este `main` y conservar estos gates.

## 4. PR y ramas activas

| PR / rama | Workstream | Estado integrador | Riesgo / acción requerida |
|---|---|---|---|
| #1 `chore/chatgpt-codex-workflow` | coordinación + planning T5.1 | **HOLD** | Rama sigue recibiendo commits. No mergear hasta HEAD estable, diff final revisado y CI del SHA exacto. |
| #3 `task/t5.1-batch-01` | canon 20–23 | DRAFT planning | Base antigua; no funcional. Re-ground después de integrar la base planning/freeze. |
| #5 `task/t5.1-batch-02a` | canon 27–28 | **BLOCKED-BY-#7** | No ejecutar/integrar antes del resultado revisado de #7. |
| #7 `task/t5.1-batch-02b` | edad 26 + seeds | DRAFT planning | Base antigua; requiere re-ground y debe preceder a #5. |
| #8 `t5/seed-lifecycle` | T5.2 seeds | **CHANGES REQUIRED** | CI verde, pero `resolver.ts` introduce replay por `(eventId, choiceId, same date)`. Esa idempotencia amplia puede suprimir repeticiones legítimas y duplica responsabilidad de `GameSession`. Eliminar ese shortcut, re-ground sobre `main`, conservar QA y revalidar. |
| #9 `t5/npc-memory` | T5.3 NPC/conocimiento | **REVIEWED, RE-GROUND REQUIRED** | Arquitectura deny-by-default correcta: reglas explícitas, `know.*` read-only, sin inferir desde `npcRefs`, sin exponer memoria al ViewModel. Debe re-groundearse sobre #11 y preservar scripts/gates QA de `package.json`. Comparte `resolver.ts` con #8. |
| #10 `t51/canon-18-23` | auditoría canon 18–23 | **AUDIT ACCEPTABLE / NON-MERGEABLE** | Solo analysis/workstream/test; tras #11 está 1 commit behind y GitHub reporta no mergeable. Re-ground y rerun CI. No añadir runtime en este PR. |
| #12 `t51/canon-23-30` | auditoría canon 23–30 | **AUDIT ACCEPTABLE / NON-MERGEABLE** | Igual que #10: auditoría pura, pero debe re-groundearse sobre `main` y volver a CI. |
| #13 `t51/canon-30-34` | canon 30–34 | **BLOCKED: CONTENT IDENTITY** | La descripción sigue diciendo auditoría, pero el diff actual ya contiene implementación funcional (`stableCanonicalEvent`) y cambia definiciones activas. No entra antes del freeze pre-T5.1 + política de migración. Separar audit/runtime o actualizar alcance explícitamente. |
| #14 `presentation/android-playcanvas` | web/PlayCanvas/Android | **RE-GROUND REQUIRED** | Alcance de presentación correcto y T3.4 sigue abierto. Modifica `package.json` y workflow, ambos cambiados por #11; re-ground, preservar QA y revalidar. |

## 5. Conflictos y orden de propiedad

### T5.2 (#8) ↔ T5.3 (#9)

Ambos modifican `src/narrative/resolver.ts` y `package.json`.

- No hacer cherry-picks ciegos.
- #9 puede integrarse antes de #8 si #8 mantiene el defecto de replay detectado.
- El segundo en entrar debe combinar conscientemente knowledge acquisition + seed lifecycle sin perder ninguno.
- Cualquier cambio de scheduler de #9 debe conservar determinismo y no consumir RNG en lecturas de conocimiento.

### Canon 26–30

Orden funcional conservador:

`#7 -> re-ground #5 -> #5`.

Auditoría #12 puede integrarse en cuanto esté re-grounded porque no cambia runtime.

### Canon 30–34

#13 no puede usar la etiqueta “auditoría” para introducir implementación funcional. Antes del primer cambio de catálogo activo se exige freeze del `contentIdentity`/catálogo pre-T5.1.

### Presentación

#14 puede avanzar en paralelo si se mantiene fuera de canon y estado oculto. El hallazgo `PlayerView.contacts = NPC_CATALOG completo` queda como dependencia T5.3: UI no debe inferir “conocido” leyendo memoria/flags internos.

## 6. Freeze pre-T5.1 — bloqueo transversal

**Pendiente y obligatorio antes del primer merge que modifique definiciones activas de eventos.**

Debe fijar como mínimo:

- SHA exacto de la base pre-cambio;
- `ENGINE_BUILD`;
- session version;
- save schema;
- 388 eventos / 254 principales / 134 condicionales;
- `SHA-256(utf8(JSON.stringify(EVENTS)))`;
- fixture/catalogo compatible o referencia inmutable suficiente para regenerarlo exactamente;
- prueba de que el fixture de compatibilidad no entra en `EventIndex`/scheduler activo.

La base candidata actual para el freeze es `main@3079a311a3899d720024cffe8003a577c4146096`, porque #11 no alteró contenido.

No integrar #13 ni futuros lotes funcionales T5.1 antes de cerrar este punto.

## 7. Tests / gates de integración

Mínimo:

```text
npm test
```

Y, desde PR #11, para cambios T5 relevantes:

```text
npm run qa:t5:fast
npm run qa:t5:content
npm run qa:t5:simulation
```

Más suites del subsistema tocado (`test:saves`, `test:session`, `test:persistence`, `test:playcanvas`, `test:android:offline`, `test:t52`, `test:t53`, etc.).

`qa:t5:known-bugs` permanece fuera del gate normal mientras documente deuda de producción conocida; cuando el owner corrige el defecto, la reproducción correspondiente debe convertirse en regresión verde.

## 8. Tracking/documentación desincronizada

Sigue pendiente sincronizar autoritativamente:

- `project/PLAN_PASADAS.md`;
- `analysis/2026-09-11/plan-seguimiento.json`.

Estado que deben reflejar sin cambiar el porcentaje:

- 33,51 %;
- T3.4 `in_progress`, evidencia física pendiente;
- T4.7/T4.8 `omitted`;
- T5.1 `in_progress`;
- PR #11/QA integrado **no suma porcentaje por sí mismo**;
- `nextPass` no puede seguir siendo T4.7.

## 9. Bloqueos actuales

1. T3.4: teléfono Android físico.
2. Freeze pre-T5.1 / migración de `contentIdentity`.
3. PR #8: idempotencia incorrectamente ubicada en resolver.
4. PR #9/#10/#12/#14: re-ground tras QA integrado.
5. PR #13: runtime antes de freeze y descripción desactualizada respecto al diff.
6. Retirada 34+: conflicto canónico sobre reconsideración tras anuncio sigue sin aprobación explícita.
7. PR #1 sigue en escritura concurrente.

## 10. Siguiente prioridad

1. cerrar el freeze pre-T5.1 sobre el `main` sin cambios de contenido;
2. re-ground/integrar auditorías puras #10 y #12;
3. re-ground #9 y revisar combinación con QA;
4. corregir #8 y luego integrar lifecycle sin replay global;
5. solo después desbloquear implementación canónica funcional (#13/#3/#7/#5 según dependencias).
