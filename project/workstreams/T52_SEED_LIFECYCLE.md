# T5.2 — Seed lifecycle, memoria persistente y consecuencias diferidas

Rama de trabajo: `t5/seed-lifecycle`

## Objetivo

Convertir el catálogo de seeds en memoria narrativa trazable: creación → persistencia → elegibilidad derivada → reaparición → resolución/caducidad, sin resets implícitos por edad, temporada o cambio de club y sin romper saves v8.

## Hallazgo de partida

El motor ya tenía una representación útil:

- `SeedInstance.state`: `dormant | active | transformed | resolved | expired`;
- `originEvent`, `originSeason`, `npcRefs`, `payload`;
- `expiresAfter`, `consumedBy`, `lastTouchedDate`;
- `GameState.seeds` dentro del save;
- transiciones `create | activate | intensify | transform | resolve | expire`.

Sin embargo, la auditoría histórica de contenido (`analysis/2026-09-11/content-audit.json`) registraba **210 IDs de seed** y **1236 transiciones `create`**, pero **0 `activate`, 0 `intensify`, 0 `transform`, 0 `resolve` y 0 `expire`**. Por tanto, “declarada” no equivalía a “con ciclo de vida completo”.

La implementación previa de T5.2 estaba además inconclusa: existían `scripts/audit-t52.mjs` y `scripts/test-t52.mjs`, pero el informe esperado no estaba versionado/generado por `npm test` y el auditor trataba `seedsRead` como si fuera la única forma de consumo.

## Resultado de auditoría actual

La auditoría reproducible ejecutada sobre el contenido actual después de compilar detecta:

- **210** seeds únicas en catálogo;
- **388** eventos totales: 254 principales + 134 condicionales;
- **138** seeds con al menos un productor runtime (`create`);
- **72** seeds sin productor runtime detectable;
- **57** seeds con algún consumidor detectable entre metadata, gates y usos `HAS_SEED_*` del código;
- **153** seeds sin consumidor detectable;
- **48** seeds con `ageWindow` finito, que ahora poseen un cierre técnico determinista si nunca son consumidas antes;
- **5** seeds explícitamente locales de club;
- **0** seeds locales de temporada actualmente configuradas;
- **1236** transiciones `create`;
- **0** `activate`;
- **0** `intensify`;
- **0** `transform`;
- **2** `resolve`;
- **0** `expire`;
- **0** asignaciones `expiresAfter` en contenido canónico actual;
- **1** seed con consumidor terminal explícito: `SEED_NANO_SHADOW`; sus dos `resolve` corresponden a dos outcomes del mismo callback;
- **0** referencias a IDs de seed desconocidos;
- **0** overrides de scope sobre IDs inexistentes;
- **0** mismatches entre transiciones y `seedsWrite`.

También aparecen numerosos gates reales `HAS_SEED_*` que no están reflejados en `seedsRead`. El auditor los conserva como `declaredReadMismatches`: no impiden que el juego funcione, pero son deuda de metadata y trazabilidad para los workstreams de contenido.

Los `originEventsMissing` incluyen además identificadores de procedencia editorial como `PASADA_6_30_34` y `PASADA_7_34_PLUS`. Se reportan para reconciliación canónica, pero no se interpretan automáticamente como fallo runtime.

Conclusión técnica de T5.2: **el hueco dominante está en la conexión del contenido, no en la capacidad del mecanismo**. El runtime dispone ahora de creación, persistencia, reapertura, cierre, caducidad, scope y restore verificables; la idempotencia de comandos interactivos se conserva en la frontera `GameSession`, y las transiciones terminales son idempotentes por sí mismas. Los equipos de contenido deben decidir qué hilos abiertos deben realmente reaparecer, transformarse o cerrarse.

## Modelo adoptado

No se introduce un nuevo estado persistido `eligible`. La elegibilidad se deriva de los gates/conditions del evento para evitar dos fuentes de verdad.

Estados persistidos:

1. `dormant`: memoria creada, todavía sin activar explícitamente;
2. `active`: hilo activo;
3. `transformed`: hilo mutado pero vivo;
4. `resolved`: consecuencia consumida/cerrada;
5. `expired`: consecuencia cerrada por caducidad o pérdida de alcance.

Reapertura: un `create` posterior a una instancia terminal crea una nueva instancia y conserva la anterior como histórico terminal.

## Reglas de alcance

### Tiempo

El `ageWindow` del catálogo deja de ser solo documentación. Cuando una seed tiene máximo finito y el jugador supera esa edad, el lifecycle la marca `expired`.

Una seed con máximo `null` no caduca solo por edad. Debe cerrarse por una transición explícita o mantenerse como memoria de carrera si eso es lo canónicamente correcto.

`expiresAfter` sigue teniendo prioridad como fecha terminal explícita.

### Temporada

Default: `career`.

Cambiar de temporada **no resetea memoria**. La infraestructura soporta `origin_season` para excepciones explícitas futuras.

### Club

Default: `career`.

Cambiar de club **no borra** promesas, reputación, familia, agente, precedentes físicos, decisiones contractuales u otras consecuencias que sigan teniendo sentido.

Se ha creado `src/catalog/seed-scope.ts` con overrides explícitos para consecuencias inequívocamente locales de vestuario/jerarquía:

- `SEED_TEAMMATE_COVER`;
- `SEED_LOCKER_VOTE`;
- `SEED_PRIVATE_CHAT`;
- `SEED_STAR_COMPETITION`;
- `SEED_PENALTY_HIERARCHY`.

Estas seeds se vinculan al club de origen y caducan al cambiar de club. Los equipos de contenido pueden ampliar la lista sin modificar el motor.

### NPC

T5.2 conserva `npcRefs` y los reporta, pero **no convierte conocimiento o psicología NPC en este subsistema**. El equipo NPC mantiene esa propiedad.

## Compatibilidad de saves

No hay cambio de `schemaVersion`.

No se añade ningún campo obligatorio a `GameState` o `SeedInstance`. Los metadatos nuevos de scope/terminal se guardan opcionalmente dentro de `payload`:

- `__t52OriginClub`;
- `__t52TerminalReason`;
- `__t52TerminalDate`.

Consecuencias:

- saves v8 anteriores siguen pasando el validador;
- una seed desconocida procedente de otra versión se preserva y el sweep no rompe la partida;
- contenido nuevo que intenta `create` de una seed inexistente falla explícitamente;
- para seeds locales antiguas sin metadata se intenta inferir el club de origen desde `history` antes de decidir caducidad.

No se requiere migración destructiva ni regeneración de baselines de saves.

## Idempotencia

La idempotencia de **comandos del usuario** no se implementa deduplicando `eventId + choiceId + date` en el resolver. Ese criterio sería demasiado amplio: un evento repetible puede aparecer legítimamente dos veces el mismo día y debe poder resolverse dos veces si son dos instancias distintas.

La frontera transaccional correcta ya existe en `GameSession`:

- cada comando lleva `commandId` y `expectedRevision`;
- `GameSession` persiste un `CommandReceipt` con fingerprint;
- repetir el mismo `commandId` + fingerprint devuelve `replayed: true` sin mutar estado, RNG, historia ni seeds;
- reutilizar un `commandId` para otra acción falla;
- los receipts sobreviven save/restore, por lo que un retry después de recuperar una escritura tampoco duplica la consecuencia.

T5.2 añade un test dirigido de doble `choose` concurrente y replay tras restore usando esa frontera real. `resolveChoice` / `resolveChoiceInPlace` permanecen como primitivas de simulación y **no deduplican escenas por identidad narrativa**.

A nivel de lifecycle, las transiciones terminales sobre una seed ya terminal son no-op, por lo que un segundo `resolve`/`expire` no puede consumirla otra vez.

## Determinismo

El lifecycle no crea nuevos streams ni hace draws aleatorios.

Caducidad por fecha, edad, temporada o club es determinista a partir de `GameState`.

Los tests verifican que ejecutar el sweep no cambia `rngState`.

## Auditoría reproducible

Comando:

```bash
npm run audit:t52
```

Salida:

`analysis/T5.2/seed-lifecycle.json`

El inventario genera una fila por cada seed e intenta determinar:

- productores de catálogo;
- productores runtime (`create`);
- lectores declarados (`seedsRead`);
- lectores reales en gates/exclusions/outcome modifiers;
- consumidores `HAS_SEED_*` en otros sistemas del código;
- escritores declarados (`seedsWrite`);
- todas las transiciones;
- consumidores terminales;
- `ageWindow`;
- scope de club/temporada;
- `npcRefs`;
- persistencia en save;
- posibilidad de recreación;
- cierre si nunca se consume;
- referencias desconocidas;
- origin events inexistentes;
- mismatch entre gates y `seedsRead`;
- mismatch entre transiciones y `seedsWrite`;
- seeds sin productor runtime;
- seeds sin consumidor;
- seeds open-ended sin transición terminal.

También produce cobertura orientativa para promesas, lesiones, operaciones, conflictos, relaciones, reputación, contratos, dinero, familia, agente, club, selección y decisiones de carrera.

## Qué NO corrige T5.2 automáticamente

No se inventan resoluciones canónicas.

Si una seed se crea pero ninguna escena la consume, `seed-lifecycle.json` la reporta para el workstream de contenido propietario. El mecanismo genérico no debe decidir por su cuenta que una promesa, conflicto, relación o decisión de carrera “se resolvió”.

El dato estructural más importante a vigilar es `summary.seedsWithoutAnyConsumer`.

Para seeds con `ageWindow` finito existe ahora cierre técnico por edad si nunca se consumen. Para seeds open-ended, `summary.openEndedWithoutTerminalTransition` identifica los casos que necesitan decisión canónica: memoria permanente o consumidor/cierre explícito.

## Tests T5.2

`scripts/test-t52.mjs` cubre:

- inventario de 210 seeds;
- creación;
- persistencia entre años/temporadas/clubes cuando el scope lo permite;
- reapertura tras estado terminal;
- consumo/resolución;
- caducidad por fecha;
- caducidad por transición de edad;
- cambio de club para seed global y seed local;
- temporadas largas sin reset;
- save antes del consumo;
- restore;
- consumo tras restore;
- doble comando mediante `GameSession.commandId`, incluido replay tras restore;
- ausencia de draws RNG en el lifecycle;
- seed desconocida presente en un save;
- intento de crear una seed inexistente desde contenido nuevo.

Comando dirigido:

```bash
npm run test:t52
```

`npm test` también ejecuta auditoría + tests T5.2 después del gate v0.8, de modo que el PR no puede declararse listo sin pasar el conjunto general y este workstream.

## Handoff a equipos de contenido

Cada equipo de contenido debe revisar en el informe generado las seeds que le pertenecen y decidir, según canon:

1. si el productor runtime es correcto;
2. si el callback debe declarar `seedsRead`;
3. si debe existir `resolve`, `expire`, `transform` o `intensify`;
4. si la seed es de carrera o local de club/temporada;
5. si un máximo de edad representa realmente la muerte del hilo;
6. si una seed open-ended es memoria permanente o deuda narrativa.

T5.2 no reescribe escenas para ocultar esos huecos; los hace medibles y comprobables.
