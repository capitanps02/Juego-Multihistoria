# NPC authority — handoff para Codex

Fecha: 2026-09-17

Base autoritativa de esta recomposición: `main@782b92c9a496293aeb33ad8b39f522a927374d6f`.
Rama de integración: `integration/t5-npc-authority-current`.
Fuente histórica del diseño: PR #140 (`t5/npc-authority`).

## Resuelto en esta rama

- `resolveActiveAgent(state)` falla cerrado: solo acepta una identidad persistida explícita en `world.npcAuthority.activeAgentNpcId` y nunca infiere desde contactos, seeds, trust/affinity, `AGENT_ACTIVE`, `professional.agentControl`, `npcRefs` o recencia.
- `certifyActiveAgentInPlace` y `clearActiveAgentInPlace` son las únicas transiciones nominales preparadas para contratación/cambio/terminación explícitos.
- `resolveCurrentClubInstitutionalNpc(state)` certifica únicamente `UDV + 18_20/20_23 -> NPC_DIR_02` mientras el NPC siga activo y en UDV; cualquier otro club/fase devuelve `null`.
- `NpcKnowledgeTargetSlot` admite `activeAgent` y `currentClubInstitutional` además de `captain` y `star`.
- `captureNpcKnowledgeTargetContext` captura los destinatarios al entrar en escena; cambios posteriores de club/agente no reasignan retrospectivamente el conocimiento.
- 20–23 mantiene capitán genérico/no persistente: no se inventa `NPC_PLR_10`, `NPC_PLR_11` ni otro nombre.

## No resuelto

- La infraestructura de agente activo no prueba que ya exista una contratación canónica. Las escenas dependientes de agente nominal siguen bloqueadas hasta que un owner identifique/implemente una acción real de contratación, cambio o terminación.
- No se certifica capitán persistente 20–23.
- LOCK23/#133 sigue perteneciendo al owner de PR #122: solo se entrega el patch exacto de eligibility, no se cambia `EVENTS` desde esta rama.
- Esta rama no modifica contenido canónico, `EVENTS`, contentIdentity, seed lifecycle, mercado ni deporte.

## APIs

```ts
resolveActiveAgent(state): "NPC_AGT_01" | "NPC_AGT_02" | null
certifyActiveAgentInPlace(state, npcId): void
clearActiveAgentInPlace(state): void
resolveCurrentClubInstitutionalNpc(state): string | null
captureNpcKnowledgeTargetContext(state): NpcKnowledgeTargetContext
resolveNpcKnowledgeTargets(rule, context): string[]
```

## Contenido preparado para Codex

1. `EVT_21_PRS_001` — conocimiento institucional dinámico para comunicaciones reales al club.
2. `EVT_22_CON_001` — reglas de conocimiento institucional choice-by-choice.
3. `EVT_22_CON_002` — mismo criterio, sin convertir estrategia privada en conocimiento nominal.
4. `EVT_23_LOCK_001` / #133 — ocultar únicamente la opción de avisar al capitán cuando `facts.lockerCaptainAffinity` no existe.

## Sigue bloqueado por provenance de agente

- `EVT_20_BRUNO_001`
- `EVT_20_AGT_001`
- `EVT_21_SOC_001`
- `EVT_21_AGT_001`

No declarar estas escenas `ready` solo porque exista la API.

## Ownership

No reimplementar `resolveLockerSlot`, `LOCKER_LEADERSHIP_ASSIGNMENTS`, el backfill histórico NPC de #96, el scheduler de `choice.eligibility`, ni usar `npcRefs`/seeds/relaciones como identidad.
