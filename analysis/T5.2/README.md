# T5.2 — Evidencia de seed lifecycle

Workstream: `t5/seed-lifecycle`  
Integración base: PR #8, fusionado en `main` el 2026-09-16  
Follow-up de handoff/hardening: PR #19  
Fecha: 2026-09-16

Este directorio contiene la evidencia reproducible del ciclo de vida de seeds. El inventario completo se genera con:

```bash
npm run audit:t52
```

El comando escribe dos artefactos en el checkout de ejecución:

- `analysis/T5.2/seed-lifecycle.json`: inventario lifecycle global;
- `analysis/T5.2/seed-handoff.json`: reparto exacto por bloque canónico y backlog de conexión.

Los JSON son deliberadamente generados desde `dist` para que no puedan quedar obsoletos respecto al catálogo compilado; este README conserva el resumen del baseline auditado.

## Baseline auditado

- Seeds de catálogo: **210** únicas.
- Eventos inspeccionados: **388** = 254 principales + 134 condicionales.
- Seeds con productor runtime (`create`): **138**.
- Seeds sin productor runtime detectable: **72**.
- Seeds con algún consumidor detectable: **57**.
- Seeds sin consumidor detectable: **153**.
- Seeds con `ageWindow` finito: **48**.
- Seeds con scope local de club: **5**.
- Seeds con scope local de temporada: **0**.
- Transiciones runtime observadas en contenido:
  - `create`: **1236**;
  - `activate`: **0**;
  - `intensify`: **0**;
  - `transform`: **0**;
  - `resolve`: **2**;
  - `expire`: **0**.
- Asignaciones canónicas `expiresAfter`: **0**.
- Seeds con cierre terminal explícito detectado: **1** (`SEED_NANO_SHADOW`; dos outcomes del mismo callback).
- Referencias a seeds desconocidas: **0**.
- Mismatches `seedsWrite` vs transiciones: **0**.

Estos números describen el contenido actual; no son objetivos de diseño. En especial, una seed sin consumidor no se cierra artificialmente desde T5.2: se reporta al workstream canónico responsable.

## Mapa canónico de handoff

`seed-handoff.json` demuestra una partición exacta: **210 entradas, 210 IDs únicos, 0 duplicados, 0 seeds sin propietario y 0 IDs desconocidos**.

| Propietario canónico | Seeds | Con productor | Sin productor | Con consumidor | Sin consumidor | Cierre terminal explícito | Open-ended sin terminal | Productor + consumidor ausentes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `t51/canon-18-23` | 31 | 31 | 0 | 21 | 10 | 1 | 7 | 0 |
| `t51/canon-23-30` | 59 | 59 | 0 | 29 | 30 | 0 | 35 | 0 |
| `t51/canon-30-34` | 52 | 48 | 4 | 7 | 45 | 0 | 52 | 4 |
| `t51/canon-34plus` | 68 | 0 | 68 | 0 | 68 | 0 | 68 | 68 |

Lectura operativa:

- **18–23**: la producción está completa. La deuda está en consumidores/cierres y en 16 mismatches de metadata `seedsRead`; 24/31 tienen `ageWindow` finito y solo `SEED_NANO_SHADOW` posee cierre terminal explícito.
- **23–30**: las 59 seeds se producen, pero 30 no tienen consumidor detectable y 35 son open-ended; hay 12 mismatches de `seedsRead`. La prioridad es conectar consecuencias y decidir qué hilos son memoria permanente.
- **30–34**: 4/52 seeds no tienen productor ni consumidor; solo 7/52 poseen algún consumidor y las 52 son open-ended. Los 52 `originEventsMissing` corresponden al marcador editorial `PASADA_6_30_34`, por lo que deben reconciliarse con eventos runtime reales en el workstream propietario.
- **34+**: es el gap de contenido dominante: las 68 seeds carecen de productor runtime y consumidor, las 68 son open-ended y sus `originEvents` usan `PASADA_7_34_PLUS`. T5.2 no debe inventar conexiones; el bloque 34+ debe decidir qué seeds representan eventos reales, cuáles se consumen y cuáles son solo memoria/estado terminal.

## Lifecycle implementado

El runtime conserva los estados existentes `dormant | active | transformed | resolved | expired` y deriva la elegibilidad de gates/conditions. No se añade un estado persistido adicional.

Reglas añadidas/comprobadas:

- `create` mantiene una sola instancia viva; una creación posterior a una instancia terminal abre una nueva y conserva la histórica;
- `resolve` y `expire` son terminales e idempotentes sobre la seed;
- `ageWindow` finito caduca la seed al superar su máximo si sigue abierta;
- `expiresAfter`, cuando exista, tiene cierre determinista por fecha;
- cambio de temporada no resetea memoria por defecto;
- cambio de club no resetea memoria por defecto;
- cinco consecuencias inequívocamente locales usan `origin_club` y caducan al abandonar ese club;
- `syncSeedPresenceFlagsInPlace` considera autoritativos todos los IDs conocidos y limpia flags `HAS_SEED_*` fantasma incluso cuando no existe una instancia viva;
- seeds desconocidas presentes en saves se preservan; contenido nuevo que intenta crear un ID inexistente falla explícitamente;
- el lifecycle no consume RNG;
- la idempotencia de doble click/retry pertenece a `GameSession.commandId` y sus receipts persistidos, no a una deduplicación narrativa por evento/choice/fecha.

## Compatibilidad de saves

No se cambia `schemaVersion` (continúa en 8) ni se añaden campos obligatorios a `GameState`/`SeedInstance`. Los metadatos T5.2 son opcionales dentro de `payload`, por lo que no se requiere migración destructiva ni regenerar baselines históricos.

## Tests y QA

`npm run test:t52` cubre creación, persistencia, reapertura, consumo, caducidad, save/restore, consumo tras restore, doble comando mediante `GameSession` (incluido retry tras restore), transición de edad, cambio de club, temporadas largas, seed incompatible, seed inexistente, limpieza de presencia fantasma y partición canónica del handoff.

El follow-up PR #19 ejecutó **15/15 tests T5.2** con éxito sobre el código funcional del handoff (`6f67451`). El workflow `Repository integrity` también pasó build, determinismo/RNG, fronteras de edad, referencias de contenido, carreras largas, auditoría lifecycle y simulación estratificada. La simulación cerró **9/9 carreras**, con 0 carreras bloqueadas y 0 estados imposibles detectados.

`npm test` ejecuta además el gate histórico v0.8 y la auditoría/tests T5.2.

## Integración con otros workstreams

T5.2 no controla conocimiento NPC. El integrador debe preservar conjuntamente lifecycle de seeds, conocimiento NPC y QA T5 cuando confluyan cambios en `package.json` o `src/narrative/resolver.ts`.

La deuda de contenido queda ahora asignada de forma automática por bloque canónico. El ownership sigue la organización del catálogo/Documento Maestro y no solo la edad numérica del evento. El generador falla si una seed queda duplicada, sin propietario o asignada a un ID inexistente.
