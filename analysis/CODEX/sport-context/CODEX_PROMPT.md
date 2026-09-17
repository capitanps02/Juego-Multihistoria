# CODEX_PROMPT — SPORT CONTEXT

Actúa como desarrollador TypeScript del repositorio `capitanps02/Juego-Multihistoria` trabajando sobre la autoridad deportiva preparada por `t5/sport-context` / PR #141 una vez integrada o re-grounded.

## Fuente de verdad

Antes de tocar contenido, inspecciona el `main` real y estos archivos:

- `src/simulation/sport-context.ts`
- `src/simulation/football-moments.ts`
- `src/simulation/club-contract-intent.ts`
- `src/save/validation.ts`
- `analysis/CODEX/sport-context/SPORT_CONTEXT_CONTRACT.md`
- `analysis/CODEX/sport-context/SPORT_FACT_MATRIX.json`
- `analysis/CODEX/sport-context/FOOTBALL_MOMENT_CONTRACT.md`
- `analysis/CODEX/sport-context/implementation-ready.json`
- `analysis/CODEX/sport-context/UNBLOCKED_CONTENT.md`
- `analysis/CODEX/sport-context/PROXY_AUDIT.md`

No asumas que una tarea marcada `blocked` se ha desbloqueado: vuelve a comprobar el productor deportivo real.

## Regla principal

No inventes hechos deportivos.

Si `facts.sport.<fact>` o `facts.match.<fact>` es `null`/`unavailable`, una escena que necesite ese hecho debe fallar cerrado. Está prohibido sustituirlo por:

- edad;
- reputación;
- `roleScore`/form;
- confianza del entrenador;
- `runtime.seasonDay` o mes;
- `FIRST_TEAM_ATTENTION`;
- `PRESEASON_FIRST_TEAM_CALL`;
- `FINAL_CONTEXT`;
- `LAST_MATCH_WINDOW`;
- cualquier RNG narrativo.

## Superficie para contenido

Los event gates y choice eligibility ya pueden consumir `narrativeConditionRoot(state).facts`.

Usa:

- `facts.sport` para temporada, club deportivo y futuros facts de calendario/squad;
- `facts.match` para contexto de un partido concreto;
- no persistas `facts`: son proyecciones read-only.

No acoples cada escena directamente a estructuras internas del simulador si el fact compartido puede vivir en `getSportContext` / `getCurrentMatchContext`.

## Prioridad 1 — productor deportivo autoritativo

Actualmente el repositorio no posee un store autoritativo de fixture/match/squad. Antes de implementar escenas bloqueadas, crea o integra —solo si el owner/integrador lo aprueba— una capa mínima que produzca facts reales:

1. fixture estable: ID, season, competition, participant club, opponent, kickoff, home/away, official/status;
2. match result/history;
3. squad selection: called-up, bench, starter, substitute/did-not-play;
4. per-match appearance/minutes/goals/assists/cards/injury;
5. remaining official/league fixtures;
6. objective status cuando pueda demostrarse.

No inventes un calendario realista arbitrario. Si no existe fuente/canon suficiente para crear fixtures concretos, deja `CODEX-SPORT-MODEL-001` en `needs_owner_decision` y no desbloquees contenido.

El club relevante debe ser `professional.registrationClub`; durante una cesión no deben seguir apareciendo fixtures del parent club como próximos partidos del jugador.

## Prioridad 2 — football moments

Para un penalti discreto ya registrado:

```ts
resolvePenaltyMomentInPlace(state, input)
```

Contrato:

- solo `rngState.football`;
- un único draw al crear el resultado;
- segunda lectura = resultado persistido, 0 draws;
- ID estable registrado, nunca copy narrativo;
- save/load preserva el resultado;
- el resolver no suma goles/minutos/apariciones ni modifica relaciones.

Namespaces v1 registrados:

- `EVT_24_MATCH_001:<context>:penalty`
- `EVT_26_MATCH_001:<context>:penalty`

Si necesitas otro moment ID/type, añádelo explícitamente al contrato y a la validación con tests negativos. No abras el store a claves arbitrarias.

## Orden de contenido después de disponer de facts reales

1. #124 / 18–20:
   - `EVT_18_MATCH_001`
   - `EVT_18_PRS_001`
   - `EVT_18_SOC_001`
   - `EVT_18_END_001`
2. `EVT_24_MATCH_001` (#85/#86): el hook del penalti ya está preparado; falta contexto real de partido.
3. #6 / edad 26:
   - `EVT_26_MATCH_001`
   - `EVT_26_NAT_002`
   - `EVT_26_FINAL_001`
4. contenidos 30–34, 34+ y retirada que necesiten bench/minutes/last match/last goal.

Implementa por microbatches y actualiza `implementation-ready.json` tras cada desbloqueo.

## MATCH24 — separación obligatoria

`EVT_24_MATCH_001` debe separar:

1. **contexto**: partido importante real, protagonista en campo, orden de lanzador y penalti previo fallado;
2. **choice**: decisión jerárquica/social sobre quién lanza;
3. **resultado deportivo**: football moment con atributos + `football` RNG;
4. **consecuencia narrativa**: relación/seed después de conocer choice + sporting fact.

La choice no puede garantizar gol/fallo. El gol no puede borrar automáticamente el conflicto.

## Estadísticas

Una única capa debe ser autoridad de estadísticas de partido. Si el simulador principal ya registró el gol/minutos/aparición, la escena solo los lee. Si el football moment representa una acción que debe incorporarse al match result, coordina esa mutación en la capa de match; no la dupliques en el resolver narrativo.

## Saves

No cambies `schemaVersion` ni registres una migración global salvo necesidad real y coordinación con el integrador.

`world.footballMomentResults` es opcional para saves históricos y se valida cuando existe. Mantén fail-closed:

- unknown moment ID -> rechazo;
- unknown outcome/kind -> rechazo;
- malformed payload -> rechazo;
- unsupported row version -> rechazo;
- duplicate moment con inputs incompatibles -> rechazo del resolver;
- valid row -> read-only validation, 0 RNG.

## Ownership prohibido

No cambies desde esta tarea:

- `CareerOffer`/mercado/contratos (Agent 3);
- autoridad NPC/conocimiento;
- lifecycle de seeds;
- retirada como máquina de estados;
- `contentIdentity` si no cambias `EVENTS`.

Si una escena necesita varias autoridades, implementa solo la parte que tenga dependencias integradas y deja un handoff exacto para la restante.

## QA mínimo por microbatch

Siempre:

- `npm run build`
- `npm test`
- Repository Integrity vigente

Sport context:

- consultas = 0 RNG y 0 mutación;
- next fixture ignora played/cancelled/club anterior;
- loan usa registration club;
- remaining matches correcto y 0 al finalizar temporada;
- squad call != bench != appearance != start;
- called-but-unused preservado;
- save/load conserva/deriva la misma verdad.

Football moments:

- solo football RNG;
- segunda lectura no re-roll;
- save/load pre/post;
- ID desconocido falla;
- outcome inválido falla;
- no doble estadística;
- IDs distintos consumen resoluciones independientes.

## Salida esperada de cada tarea Codex

Reporta:

- base commit / HEAD;
- archivos tocados;
- facts nuevos o consumidos;
- si cambia runtime/schema/EVENTS/RNG/contentIdentity;
- tests exactos y resultado;
- eventos que pasan de `blocked` a `ready`/`implemented`;
- blockers restantes;
- no hagas merge automático.
