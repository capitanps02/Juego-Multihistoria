# NPC authority — handoff para Codex

Fecha: 2026-09-17

Base de `main` inspeccionada: `ebef17057156c7721fc4a041552c9cf1b3fdb6ba`.
Rama de autoridad: `t5/npc-authority`.
Runtime probado por esta pasada hasta: `04a6048d89cdd5c366e7b766435c4910cedb6d4a`.

## Resuelto

- #92 ya estaba resuelto en `main`: el freeze de semántica histórica de conocimiento NPC está integrado.
- Se añade `resolveActiveAgent(state)` con semántica fail-closed. Solo lee identidad persistida explícita; no infiere desde contactos, seeds, relaciones, `AGENT_ACTIVE`, `professional.agentControl`, `npcRefs` ni recencia.
- Se añaden `certifyActiveAgentInPlace` y `clearActiveAgentInPlace` como transiciones explícitas de contratación/cambio y rescisión. La identidad se persiste en `world.npcAuthority.activeAgentNpcId` sin bump de schema; un save antiguo sin ese dato resuelve a `null`.
- Se añade `resolveCurrentClubInstitutionalNpc(state)`. La certificación vigente es `UDV + 18_20/20_23 -> NPC_DIR_02`, siempre que el NPC siga activo y en UDV. Cualquier otro club/fase no certificada devuelve `null`.
- `NpcKnowledgeTargetSlot` admite `activeAgent` y `currentClubInstitutional`, además de `captain` y `star`.
- `captureNpcKnowledgeTargetContext` captura agente/institución al entrar en escena para que una elección posterior no cambie retroactivamente el destinatario.
- El capitán 20–23 NO se inventa. La evidencia revisada no certifica una identidad persistente para ese tramo, así que `captain` continúa resolviendo a `null` y las escenas pueden usar actor genérico sin memoria nominal.

## No resuelto / límites

- No se ha reescrito contenido canónico de otros owners para insertar contrataciones de agente. Por tanto, las escenas cuyo canon exige un agente nominal siguen necesitando una decisión canónica explícita que llame/escriba la autoridad. La existencia histórica de `AGENT_ACTIVE` no basta.
- No se certifica capitán persistente 20–23. `EVT_21_CAP_001` puede seguir siendo una escena con “el capitán” genérico, pero no debe otorgar conocimiento nominal a `NPC_PLR_10`, `NPC_PLR_11` ni otro NPC.
- No se modifica PR #122 desde esta rama. El fix de #133 queda listo para Codex mediante `choice.eligibility` con `facts.lockerCaptainAffinity exists`.
- No se modifica PR #129 directamente. Las tareas machine-readable indican qué conocimiento institucional puede conectarse ya y qué sigue bloqueado por identidad de agente.

## APIs disponibles

```ts
resolveActiveAgent(state): "NPC_AGT_01" | "NPC_AGT_02" | null
certifyActiveAgentInPlace(state, npcId): void
clearActiveAgentInPlace(state): void
resolveCurrentClubInstitutionalNpc(state): string | null
captureNpcKnowledgeTargetContext(state): NpcKnowledgeTargetContext
resolveNpcKnowledgeTargets(rule, context): string[]
```

## Blockers eliminados

- destinatario institucional certificado para UDV en 20–23;
- soporte de target dinámico para institución actual;
- soporte de target dinámico para agente activo cuando exista identidad certificada;
- contrato explícito de ausencia de capitán persistente 20–23;
- ruta exacta para ocultar la opción de LOCK23 cuando no exista capitán.

## Contenido inmediatamente preparado

1. `EVT_21_PRS_001` — `CLUB_CORRECT`: puede escribir conocimiento al target `currentClubInstitutional`; fuera de UDV no se inventa un directivo.
2. `EVT_22_CON_001` — elecciones que comunican una postura contractual al club pueden usar `currentClubInstitutional`.
3. `EVT_22_CON_002` — elecciones que comunican una postura contractual al club pueden usar `currentClubInstitutional`.
4. `EVT_23_LOCK_001` / #133 — la opción “avisar al capitán” puede ocultarse con `eligibility: [{ path: "facts.lockerCaptainAffinity", op: "exists" }]`; las otras opciones permanecen disponibles.

## Contenido todavía bloqueado por identidad de agente

Según el snapshot funcional de PR #129:

- `EVT_20_BRUNO_001`;
- `EVT_20_AGT_001`;
- `EVT_21_SOC_001`;
- `EVT_21_AGT_001`.

La infraestructura ya existe, pero no debe declararse `ready` hasta que una acción canónica establezca qué agente representa realmente al jugador.

## Ownership

No reimplementar:

- `resolveLockerSlot`;
- `LOCKER_LEADERSHIP_ASSIGNMENTS`;
- conocimiento live/backfill ya congelado por #92;
- `facts.lockerCaptainAffinity` / `facts.lockerStarAffinity`;
- scheduler de `choice.eligibility`.

No usar `npcRefs`, seeds, trust/affinity, texto de rol o flags de contacto como identidad.
