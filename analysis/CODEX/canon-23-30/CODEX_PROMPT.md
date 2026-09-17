# CODEX PROMPT — Canon 23–30

Actúa como implementador TypeScript senior del videojuego **Multihistoria / Carrera de Futbolista**.

Tu objetivo es ejecutar en lotes grandes la cola ya auditada del bloque 23–30 **sin reconstruir desde cero la arquitectura ni la reconciliación**.

## Repositorio y rama

Repositorio:

`capitanps02/Juego-Multihistoria`

Base:

`main` real más reciente al empezar. El snapshot que produjo este handoff fue `adf1bffa7298bff6d7cebab88a3388c559cd3588`, pero debes comprobar si `main` avanzó.

Rama de trabajo:

`t51/canon-23-30`

Nunca trabajes directamente en `main`.
Nunca hagas merge automático.

Antes de escribir:

1. inspecciona `main`, HEAD de `t51/canon-23-30`, ahead/behind y PR asociada;
2. re-groundea la rama si `main` avanzó y conserva únicamente commits aún válidos;
3. lee todos los archivos de `analysis/CODEX/canon-23-30/`;
4. trata `CANON_STATUS.json` como inventario de clasificación y `implementation-ready.json` como cola ejecutable;
5. respeta estrictamente el orden Fase A → B → C → D.

## Ownership

Puedes modificar contenido canónico de:

- `23_26`;
- `26_30`.

No escribas escenas de:

- 18–23;
- 30–34;
- 34+;
- retirement.

Puedes leerlos para continuidad.

## Estado ya preparado

Existen candidatos staged en esta rama:

- `src/content/events/23_26/t514-staged-lock-principal-events.ts` — `EVT_23_LOCK_001`, con la opción de capitán fail-closed cuando no existe slot autoritativo;
- `src/content/events/23_26/t512-staged-market-principal-events.ts` — `EVT_25_MKT_001`, interés directo del entrenador sin fabricar `CareerOffer`;
- `src/content/events/26_30/t515-principal-events.ts` — `EVT_26_BRIDGE_001`, bridge canónico de edad 26.

Y sus tests:

- `scripts/test-t51-agent6-lock23.mjs`;
- `scripts/test-t51-agent6-mkt25.mjs`;
- `scripts/test-t51-agent6-age26-bridge.mjs`.

No dupliques esos candidatos. Mejora únicamente si nueva evidencia de `main` exige cambios.

## Orden de ejecución

### Fase A — cerrar 23–26

Implementa por orden los `CODEX-2330-001` a `CODEX-2330-007` de `implementation-ready.json`.

Prioridad especialmente alta:

- `EVT_25_CON_001`: usar `CareerOffer`, `respondToOffer()` y `offerBridge`; los dos `defer` deben seguir siendo narrativamente distintos sin firmar contrato;
- callbacks condicionales listos: preservar conocimiento causal y seeds.

No intentes cerrar los eventos listados en `BLOCKERS.md` usando proxies.

### Fase B — age 26

Antes de 27–29 implementa:

- `EVT_26_MED_001`;
- `EVT_26_DOC_001`;
- `EVT_26_RIV_001`.

Consume `AGE26_STATUS.json`.

No implementes resultados sintéticos para MATCH/FINAL/EUR ni targets sintéticos para CAP/TEAM/NAT. Puedes preparar definiciones y tests fail-closed, pero no declarar esos eventos completos mientras falte la authority indicada.

### Fase C — 26–30

Después del bridge age-26 y de las tareas directas anteriores, ejecuta los `CODEX-2330-011` a `CODEX-2330-034`.

Reglas:

- reimplementar shells aunque el ID coincida;
- no acreditar igualdad de ID como equivalencia semántica;
- conservar extras legacy para saves hasta que integración autorice retirada;
- todo movimiento formal de club usa `CareerOffer`;
- después de un cambio de club, recalcular targets de vestuario/institución;
- lesiones reaccionan a historia real;
- selección reacciona a hechos de selección;
- NPC knowledge necesita una vía causal.

### Fase D — handoff a 30

Implementa `CODEX-2330-035` y `CODEX-2330-037` y cualquier otra tarea ya resuelta necesaria para producir un estado age-30 coherente.

Lee `HANDOFF_30_34.md`.
No escribas escenas 30–34.

## Autoridades obligatorias

### Mercado/contratos

`CareerOffer` y `respondToOffer()` son la única autoridad para aplicar términos.

`offerBridge.choiceActions` debe mapear cada choice exactamente una vez cuando la escena consume una oferta.

- `accept`: puede aplicar exactamente `offer.terms`;
- `reject`: conserva terms actuales;
- `counter`: conserva terms actuales y cierra la offer con disposition `counter`;
- `defer`: conserva terms actuales y cierra la offer con disposition `defer`.

Nunca simules una operación escribiendo desde narrativa:

- `club`;
- `contract.*`;
- `professional.ownerClub`;
- `professional.registrationClub`;
- `market.pending`.

Corrige cualquier semántica legacy de 23–30 que haga eso. En especial, `EVT_29_HOME_001` no puede conservar un `set club = UDV` como canon.

### NPC/locker

Consume locker leadership/dynamic targets del runtime.

- capitán ≠ líder ≠ veterano ≠ jugador influyente;
- un target institucional pertenece al club actual;
- no hardcodees un capitán UDV para otro club;
- missing slot = fail closed;
- un NPC solo sabe algo si la knowledge authority puede explicar cómo lo supo.

Para agente activo, si no existe todavía una API autoritativa de identidad, no lo infieras con `agentControl`, trust, última conversación o seed. Deja la escena bloqueada o adaptable a no-agent según `BLOCKERS.md`.

### Seeds

Consume la semántica T5.2 actual:

- live presence y historical consumer son conceptos distintos;
- `seedsRead` no consume una seed;
- terminalidad/scopes deben respetarse;
- para carreras nuevas puede existir un nuevo origen canónico;
- saves antiguos conservan `SeedInstance.originEvent` histórico.

No reescribas origin events históricos.

### Fútbol/selección

Partidos, penaltis, goles, errores, titularidad, resultado, competición y contribución deben venir de sport context / football moments.

No uses narrative RNG para determinar fútbol.

Convocatoria y rol de selección deben proceder de hechos de selección. `reputation`, `nationalHeat` o edad no son convocatoria.

## Proxies

Permitidos como factores de apoyo, nunca como authority principal:

- `reputation`;
- `marketHeat`;
- `lockerPower`;
- `agentControl`;
- edad.

Si `coachTrust` representa a un actor concreto, exige provenance/identidad institucional real.

## Content identity / lineage — PROHIBICIONES

Puedes preparar candidates, tests, fingerprints candidatos y migration notes.

No cierres por tu cuenta:

- source generation;
- target generation;
- hash global;
- migration edge;
- shortcut;
- freeze;
- frozen offer evidence;
- reescritura de origins históricos.

Salvo autorización explícita del integrador, no edites para cerrar una generación:

- `src/session/content-migration.ts`;
- `src/session/frozen-offer-bridge-evidence.ts` o equivalentes frozen;
- `src/session/post-t51-legacy-registry.ts` / registries equivalentes;
- `qa/fixtures/t5.1/post-t51-sources/*`;
- archivos que registren hashes globales/generaciones.

Si activar una definición en `EVENTS_23_26` o `EVENTS_26_30` cambia `contentIdentity`, deja el evento exported/staged y entrega al integrador:

- source generation vigente;
- event set candidato;
- fingerprint candidato;
- semántica de migración necesaria;
- pending decisions afectados;
- tests.

No inventes el hash final.

## QA obligatorio por evento

Para cada escena implementada demuestra:

1. trigger positivo;
2. trigger negativo;
3. choices exactas;
4. eligibility;
5. effects;
6. seed transitions;
7. NPC knowledge;
8. offers/contract invariants;
9. sport facts cuando proceda;
10. determinismo.

Para cadenas prueba al menos:

- 23→24;
- 24→25;
- 25→26;
- 26→27;
- 29→30.

Save/load mínimo:

- antes de gran decisión;
- pending decision;
- después de outcome;
- después de club transition;
- después de seed creation;
- cambio de edad;
- resume tras load.

## Comandos de gate

Ejecuta al menos:

```bash
npm run build
node --test scripts/test-t51-agent6-lock23.mjs scripts/test-t51-agent6-mkt25.mjs scripts/test-t51-agent6-age26-bridge.mjs
npm test
npm run test:t51:migration
npm run test:saves
npm run test:t53
```

Añade y ejecuta tests focales para cada nuevo lote.

No declares Repository Integrity verde si solo pasan tests focales.

## Commits

Haz commits pequeños y semánticos. Ejemplos:

- `T5.1 23-26: implement remaining canonical-ready scenes`
- `T5.1 age26: stage medical media rivalry batch`
- `T5.1 26-30: implement canonical missing peak scenes`
- `T5.1 26-30: reconcile shifted identities`
- `Tests: cover 23-30 continuity and save chains`

## Entrega de cada lote

Reporta:

- base y HEAD;
- ahead/behind;
- eventos implementados;
- eventos staged;
- blockers que permanecen;
- `EVENTS changed: yes/no`;
- schema/RNG/contentIdentity changes;
- migration required;
- tests exactos y resultados;
- Repository Integrity;
- siguiente lote exacto.

Nunca auto-mergees a `main`.
