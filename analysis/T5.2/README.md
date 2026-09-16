# T5.2 — Evidencia de seed lifecycle

Workstream: `t5/seed-lifecycle`  
PR: #8  
Fecha: 2026-09-16

Este directorio contiene la evidencia reproducible del ciclo de vida de seeds. El inventario completo se genera con:

```bash
npm run audit:t52
```

El comando escribe `analysis/T5.2/seed-lifecycle.json` en el checkout de ejecución. El JSON completo es deliberadamente generado desde `dist` para que no pueda quedar obsoleto respecto al catálogo compilado; este README conserva el resumen del baseline auditado del PR.

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

## Lifecycle implementado

El runtime conserva los estados existentes `dormant | active | transformed | resolved | expired` y deriva la elegibilidad de gates/conditions. No se añade un estado persistido adicional.

Reglas añadidas/comprobadas:

- `create` mantiene una sola instancia viva; una creación posterior a una instancia terminal abre una nueva y conserva la histórica;
- `resolve` y `expire` son terminales e idempotentes;
- `ageWindow` finito caduca la seed al superar su máximo si sigue abierta;
- `expiresAfter`, cuando exista, tiene cierre determinista por fecha;
- cambio de temporada no resetea memoria por defecto;
- cambio de club no resetea memoria por defecto;
- cinco consecuencias inequívocamente locales usan `origin_club` y caducan al abandonar ese club;
- seeds desconocidas presentes en saves se preservan; contenido nuevo que intenta crear un ID inexistente falla explícitamente;
- el lifecycle no consume RNG;
- replay de `eventId + choiceId + date` evita doble efecto, doble RNG, doble historia y doble transición de seed.

## Compatibilidad de saves

No se cambia `schemaVersion` (continúa en 8) ni se añaden campos obligatorios a `GameState`/`SeedInstance`. Los metadatos T5.2 son opcionales dentro de `payload`, por lo que no se requiere migración destructiva ni regenerar baselines históricos.

## Tests

`npm run test:t52` cubre creación, persistencia, reapertura, consumo, caducidad, save/restore, consumo tras restore, doble comando, transición de edad, cambio de club, temporadas largas, seed incompatible y seed inexistente.

`npm test` ejecuta además el gate histórico v0.8 y la auditoría/tests T5.2.

## Integración con otros workstreams

T5.2 no controla conocimiento NPC. PR #9 (`t5/npc-memory`) también modifica `package.json` y `src/narrative/resolver.ts`; el integrador debe combinar ambas responsabilidades y ejecutar conjuntamente T5.2 + T5.3 + QA T5 después de resolver el solapamiento. No debe elegirse una versión del resolver descartando silenciosamente la otra.

El `main` vigente también contiene QA T5, que reproduce como deuda el lifecycle incompleto del contenido. T5.2 proporciona mecanismo y auditoría; los equipos de contenido siguen siendo responsables de añadir consumidores/cierres canónicos concretos sin inventarlos desde infraestructura.
