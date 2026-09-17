# PROMPT PARA CODEX — CONSUMIDORES DE NPC AUTHORITY

Actúa como desarrollador TypeScript senior e ingeniero narrativo de integración del repositorio:

`capitanps02/Juego-Multihistoria`

## Estado de partida obligatorio

Antes de modificar nada:

1. inspecciona el `main` real más reciente;
2. inspecciona `t5/npc-authority`;
3. comprueba que contiene como mínimo los commits runtime:
   - `24d1a6b571bea701edda09da2d4df64a7f6fdd33` — resolvers de autoridad;
   - `36e9b526f17cf14cb303d552c2260943deb023f7` — target slots de autoridad;
   - `7e6d51c903b60195994723d47ff9ee157de000f2` — resolución dinámica de knowledge targets;
   - `04a6048d89cdd5c366e7b766435c4910cedb6d4a` — regresiones de contratos compartidos.
4. base histórica de esta pasada: `main@ebef17057156c7721fc4a041552c9cf1b3fdb6ba`.
5. lee completos:
   - `analysis/CODEX/npc-authority/README.md`;
   - `analysis/CODEX/npc-authority/implementation-ready.json`;
   - `analysis/CODEX/npc-authority/ARCHITECTURE_CONTRACT.md`;
   - `analysis/CODEX/npc-authority/UNBLOCKED_CONTENT.md`.

No trabajes directamente sobre `main`.

Rama recomendada para consumidores 20–23 una vez que la autoridad esté integrada o cherry-pickeada de forma segura:

`codex/npc-authority-consumers`

Si el owner de 20–23 sigue activo en `t51/canon-20-23`, crea la rama de Codex desde el HEAD más reciente de ese workstream y porta únicamente los commits de autoridad necesarios. No hagas merge automático.

## Objetivo

Implementar únicamente contenido cuyo blocker de autoridad está realmente resuelto, sin reabrir arquitectura ni inventar identidades.

## Tareas READY exactas

### CODEX-NPC-001 — EVT_21_PRS_001

Para la elección `CLUB_CORRECT`, añadir conocimiento institucional dinámico usando:

```ts
targetSlots: ["currentClubInstitutional"]
```

El NPC nominal solo debe aprender el hecho cuando la elección/outcome realmente comunica al club. En club no certificado el target es `null` y la escena sigue pudiendo aplicar efectos abstractos de `professional.institutionalTrust`.

### CODEX-NPC-002 — EVT_22_CON_001

Añadir reglas de conocimiento institucional elección por elección.

Candidatos semánticamente comunicados al club:

- `OPEN_RENEWAL_NOW`;
- `NO_RENEWAL_FOR_NOW`.

No concedas conocimiento nominal a `WAIT_SUMMER` solo porque existan efectos institucionales. Revisa `SHORT_EXTENSION_CLAUSE`: si la escena solo define preferencia interna, no informar; si el texto final la comunica al club, documenta por qué.

### CODEX-NPC-003 — EVT_22_CON_002

Aplicar el mismo criterio. No conviertas todas las estrategias privadas en conocimiento del club. `RUN_DOWN` no prueba por sí solo comunicación; las elecciones cuyo texto establezca diálogo/aceptación con el club sí pueden usar `currentClubInstitutional`.

### CODEX-NPC-004 — EVT_23_LOCK_001 / issue #133

Esta tarea pertenece al owner de PR #122 (`integration/t511-lock-23-26`). No copies toda esa implementación a la rama 20–23.

Patch exacto sobre la opción equivalente a “avisar al capitán”:

```ts
eligibility: [{ path: "facts.lockerCaptainAffinity", op: "exists" }]
```

Aceptación:

- sin captain slot -> esa opción no aparece;
- A/B/C siguen disponibles;
- con captain slot -> la opción aparece;
- knowledge del capitán solo existe si el target capturado existe;
- ningún capitán UDV se filtra a otro club;
- 0 RNG.

Si trabajas en una sola rama, NO implementes CODEX-NPC-004 allí: deja un commit/patch separado sobre la rama owner de PR #122.

## No implementar todavía

Mantén `blocked`:

- `EVT_20_BRUNO_001`;
- `EVT_20_AGT_001`;
- `EVT_21_SOC_001`;
- `EVT_21_AGT_001`.

Razón: ya existe `resolveActiveAgent` y `targetSlots.activeAgent`, pero aún falta una acción canónica que certifique contratación/cambio de agente. Está prohibido inferir identidad desde:

- `EVT_18_AGT_001`;
- `AGENT_CONTACT_HECTOR`;
- `AGENT_CONTACT_PRISMA`;
- `SEED_FIRST_AGENT`;
- `AGENT_ACTIVE`;
- relaciones;
- `professional.agentControl`;
- `npcRefs`.

## APIs que debes usar

```ts
resolveCurrentClubInstitutionalNpc
captureNpcKnowledgeTargetContext
resolveNpcKnowledgeTargets
```

Cuando el canon futuro establezca representación explícita:

```ts
certifyActiveAgentInPlace
clearActiveAgentInPlace
resolveActiveAgent
```

## APIs que NO debes reimplementar

- `resolveLockerSlot`;
- `LOCKER_LEADERSHIP_ASSIGNMENTS`;
- `facts.lockerCaptainAffinity`;
- `facts.lockerStarAffinity`;
- scheduler de `choice.eligibility`;
- baseline histórico de NPC knowledge;
- freeze/backfill de #92.

## Regla de capitán 20–23

No asignes un nombre.

`EVT_21_CAP_001` puede narrar “el capitán”, pero mientras `resolveLockerSlot(state, "captain") === null` no debe existir memoria nominal de capitán. No conviertas `NPC_PLR_10` ni `NPC_PLR_11` en capitán por catálogo, `npcRefs`, affinity o conveniencia de tests.

## Tests obligatorios

Para cada regla institucional nueva:

1. UDV/20–23 con `NPC_DIR_02` activo -> target correcto;
2. club distinto -> ningún target nominal;
3. `NPC_DIR_02` con trust alto pero club distinto -> sigue sin ser target;
4. cambio de club invalida target anterior;
5. efectos abstractos institucionales siguen funcionando sin NPC;
6. target capturado no cambia retroactivamente tras efectos de la elección;
7. 0 RNG;
8. no mutación de estado por resolver/capturar.

Al terminar:

```text
npm run build
npm test
```

Además ejecuta las suites T5.3, saves/migration y T5.1 compartidas que existan en el HEAD actual.

## Límites

- No cambies `contentIdentity` si no cambias `EVENTS`.
- Si cambias `EVENTS`, sigue el pipeline oficial de identidad/migración; no lo inventes.
- No modifiques seeds históricas/origin.
- No conviertas `npcRefs` en epistemología.
- No modifiques baseline histórico para acomodar reglas live.
- No arregles tests inventando identidad.
- No hagas merge automático.

## Commits

Haz commits pequeños, por ejemplo:

```text
T5.5: wire current-club institutional knowledge
T5.1 LOCK23: hide captain choice without authority
Tests: cover institutional target consumers
```

No mezcles el patch de PR #122 con el workstream 20–23 en un mismo commit.

## Terminado cuando

- las tres escenas institucionales usan targets dinámicos correctos;
- ninguna escena de agente bloqueada ha sido “resuelta” por heurística;
- LOCK23 tiene patch separado en su ownership o handoff exacto;
- 20–23 captain continúa genérico si no aparece nueva evidencia canónica;
- `npm test` y `npm run build` están verdes;
- el resumen final identifica commits, tests, contenido desbloqueado y cualquier blocker real restante.
