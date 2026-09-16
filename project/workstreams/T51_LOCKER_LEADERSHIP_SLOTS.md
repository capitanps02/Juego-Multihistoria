# T5.1 — Locker leadership slots

## Objetivo

Cerrar `#84` sin implementar todavía `EVT_23_LOCK_001` ni modificar contenido canónico.

El canon necesita consultar `SLOT_CAPTAIN` / `SLOT_STAR` como identidades deportivas del vestuario. No es válido inferirlas desde texto visible de `NPC.role`, desde la relación más alta del protagonista ni desde `professional.lockerPower`.

## Contrato

`src/simulation/locker-leadership.ts` introduce un registry explícito `LOCKER_SLOT_ASSIGNMENTS` y las APIs:

- `resolveLockerSlot(state, "captain" | "star")`;
- `lockerSlotRelationship(...)`;
- `lockerSlotRelationshipValue(...)`;
- `lockerLeadershipFacts(state)`.

Una asignación solo es válida cuando coinciden:

1. club actual del protagonista;
2. fase narrativa declarada por la asignación;
3. NPC exacto de la autoridad explícita;
4. `npc.club === state.club`;
5. `npc.careerState === "active"`.

Cualquier ausencia o ambigüedad devuelve `null`.

## Autoridad actualmente certificada

La única asignación que la evidencia actual permite declarar sin heurística es:

- UDV / fases `18_20`, `20_23`, `23_26` / `captain` → `NPC_PLR_10` Tomás Vela.

El catálogo canónico describe explícitamente a Vela como capitán de UDV. El resolver no vuelve a parsear ese texto: el dato queda versionado como asignación estructurada.

No existe evidencia estructurada suficiente para decidir qué NPC representa `SLOT_STAR`. Por tanto:

- `resolveLockerSlot(state, "star") === null` actualmente;
- una relación 100 con Bruno, Adrián u otro jugador no inventa el slot;
- un owner canónico futuro deberá añadir una fila explícita con fuente revisada.

## Integración con gates

`eventGatesPass()` amplía el namespace derivado `facts` con:

- `facts.lockerCaptainNpcId`;
- `facts.lockerStarNpcId`;
- `facts.lockerCaptainAffinity`;
- `facts.lockerStarAffinity`;
- `facts.lockerCaptainTrust`;
- `facts.lockerStarTrust`.

Estos facts no se persisten y no consumen RNG.

Así `EVT_23_LOCK_001` puede expresar posteriormente su trigger mediante `gateAlternatives`, por ejemplo:

- ruta captain affinity;
- ruta star affinity;
- ruta `HAS_SEED_TEAMMATE_COVER`.

Este workstream no fija el umbral de afinidad de la escena y no modifica `EVENTS`.

## Invariantes

- 0 RNG en lecturas;
- 0 mutación de `GameState`;
- 0 cambio de save schema;
- 0 cambio de `contentIdentity`;
- cambiar de club no arrastra líderes de UDV;
- un NPC transferido/inactivo deja de resolver;
- una fase fuera del rango autorizado falla cerrado;
- texto de rol y relaciones altas con no-líderes no alteran autoridad.

## QA

`scripts/test-t51-locker-slots.mjs` cubre ocho regresiones:

1. capitán UDV explícito y star ausente;
2. no inferencia por texto/afinidad de no-líder;
3. cambio de club;
4. NPC transferido/inactivo;
5. límite de fase;
6. lectura sin RNG ni mutación;
7. composición captain/star/seed mediante el OR gate existente;
8. save/reload reconstruye los mismos hechos derivados.

La suite forma parte de `npm test`, `test:t51:shared` y `test:t51:locker-slots`.

## Límites

No implementa copy, choices, outcomes ni consecuencias de `EVT_23_LOCK_001`. No define `SLOT_STAR` sin evidencia. No introduce roster dinámico ni reescribe NPC históricos.
