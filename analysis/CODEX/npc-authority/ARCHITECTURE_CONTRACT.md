# Architecture contract — NPC authority

Este documento describe semántica vigente, no evidencia histórica.

## 1. Active agent

API:

```ts
resolveActiveAgent(state)
certifyActiveAgentInPlace(state, npcId)
clearActiveAgentInPlace(state)
```

Fuente persistida: `world.npcAuthority.activeAgentNpcId`.

Valores válidos actualmente: `NPC_AGT_01`, `NPC_AGT_02`, `null/ausente`.

Correcto:

```text
escena canónica firma con Héctor -> certify NPC_AGT_01
escena canónica cambia a Lucía -> certify NPC_AGT_02
rescisión explícita -> clear -> null
save antiguo sin autoridad -> null
```

Incorrecto:

```text
AGENT_CONTACT_HECTOR -> NPC_AGT_01
SEED_FIRST_AGENT -> agente
AGENT_ACTIVE=true -> escoger al agente con más trust
professional.agentControl -> identidad
última interacción -> identidad
npcRefs -> identidad
```

`AGENT_ACTIVE` se mantiene como compatibilidad de estado general; no es fuente nominal de verdad.

## 2. Current-club institutional NPC

API:

```ts
resolveCurrentClubInstitutionalNpc(state)
```

Contrato certificado actual:

```text
UDV + phase 18_20/20_23 + NPC_DIR_02 activo y todavía en UDV -> NPC_DIR_02
cualquier otro caso -> null
```

La tabla es deliberadamente escasa. Un NPC que fue directivo de UDV no se convierte en representante del nuevo club del jugador.

Correcto:

```text
professional.institutionalTrust cambia en club no certificado -> permitido
nominal memory en director concreto -> solo si resolver devuelve NPC
```

Incorrecto:

```text
institutionalTrust alto -> escoger director
role text "Director" -> actor actual de cualquier club
NPC_DIR_02 tuvo escenas de contrato -> director universal
```

## 3. Captain / star

Autoridad existente:

```ts
resolveLockerSlot(state, "captain" | "star")
```

No duplicar esta API.

Contrato importante:

- UDV/23–26 tiene capitán certificado según `LOCKER_LEADERSHIP_ASSIGNMENTS`.
- 20–23 no tiene capitán persistente certificado con la evidencia disponible en esta pasada.
- `NPC_PLR_10` figure como “capitán” en catálogo no autoriza extrapolar esa identidad a toda fase futura.
- `NPC_PLR_11` aparezca en `npcRefs` de `EVT_21_CAP_001` tampoco lo convierte en capitán.

En 20–23 una escena puede narrar “el capitán” como actor genérico. No puede escribir memory nominal de ese actor.

## 4. targetSlots

Targets soportados:

```text
captain
star
activeAgent
currentClubInstitutional
```

`captureNpcKnowledgeTargetContext(state)` los resuelve al entrar en la escena. Después, `resolveNpcKnowledgeTargets(rule, context)` combina targets estáticos y dinámicos.

Capturar al entrar evita que una decisión que cambia club/agente reasigne retroactivamente quién presenció la propia decisión.

Un target ausente aporta cero NPC, no un fallback.

## 5. Knowledge live

`NPC_EVENT_KNOWLEDGE_RULES` define quién aprende qué en resolución live.

Principio:

```text
world fact != NPC knowledge
```

Una escena puede cambiar estado global sin que ningún NPC nominal aprenda nada.

No añadir una regla de conocimiento simplemente porque:

- el NPC está en `npcRefs`;
- una relación cambia;
- un seed lo referencia;
- `institutionalTrust` cambia;
- el texto menciona un rol genérico.

## 6. Historical backfill

La semántica histórica está congelada por el trabajo integrado de #92/PR #96.

Las reglas live nuevas NO deben reinterpretar saves antiguos. El baseline histórico/backfill y sus hashes son evidencia congelada y deben mantenerse separados de las reglas live.

No cambiar el baseline para que un test nuevo pase.

## 7. npcRefs

`npcRefs` significa: NPC relacionados con la escena para indexación/autoría.

NO significa:

```text
testigo
informado
destinatario
agente activo
capitán actual
directivo actual
```

## 8. relationshipMemory

`relationshipMemory=true` significa que un hecho ya concedido por una regla válida también debe indexarse como memoria relevante de la relación.

No es una vía independiente de conocimiento.

Incorrecto:

```text
la relación cambió -> crear relationshipMemory -> por tanto el NPC sabe el hecho
```

Correcto:

```text
regla explícita concede el hecho -> opcionalmente relationshipMemory=true
```

## 9. LOCK23

Para una elección que exige capitán persistente, usar el mismo contrato autoritativo que el resto del motor.

En el contrato actual de eligibility:

```ts
{ path: "facts.lockerCaptainAffinity", op: "exists" }
```

es una guarda fail-closed válida: el fact es `null` si no hay captain slot autoritativo.

No ocultar A/B/C si solo D necesita capitán.

## 10. Invariantes globales

- Resolver autoridad: read-only.
- Resolver autoridad: 0 RNG.
- Ausencia de evidencia: `null`.
- Cambio de club invalida actor institucional del club anterior.
- Cambio/fin de representación solo mediante acción explícita.
- No retroactividad epistemológica por reglas live.
- No modificar `contentIdentity` si `EVENTS` no cambia.
- No usar heurísticas para evitar un `null` incómodo.
