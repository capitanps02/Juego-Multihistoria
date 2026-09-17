# Architecture contract — NPC authority

## Active agent

Fuente nominal: `world.npcAuthority.activeAgentNpcId`.

Valores aceptados actualmente: `NPC_AGT_01`, `NPC_AGT_02`, o ausencia/`null`.

Solo una acción canónica de contratación, cambio o terminación puede escribir esa autoridad. Contactos, `SEED_FIRST_AGENT`, `AGENT_ACTIVE`, relaciones, `professional.agentControl`, `npcRefs` o la última interacción no prueban representación.

## Current-club institutional NPC

`resolveCurrentClubInstitutionalNpc(state)` certifica actualmente:

`UDV + phase 18_20/20_23 + NPC_DIR_02 activo y todavía en UDV -> NPC_DIR_02`

En cualquier otro caso devuelve `null`. `professional.institutionalTrust` puede cambiar sin que exista un NPC nominal.

## Captain / star

La autoridad sigue siendo `resolveLockerSlot(state, "captain" | "star")`; no duplicarla.

20–23 no tiene capitán persistente certificado con la evidencia actual. Un actor narrativo genérico es válido; memoria nominal de capitán no.

## Knowledge target slots

Targets soportados: `captain`, `star`, `activeAgent`, `currentClubInstitutional`.

`captureNpcKnowledgeTargetContext(state)` los captura al entrar en escena. `resolveNpcKnowledgeTargets(rule, context)` combina targets estáticos y dinámicos. Un slot ausente aporta cero NPC: no hay fallback heurístico.

## Epistemología

`world fact != NPC knowledge`.

`npcRefs`, relación, seed, cargo textual o un efecto institucional no conceden conocimiento. `relationshipMemory=true` solo indexa como memoria relacional un hecho ya concedido por una regla válida.

Las reglas live no pueden reinterpretar el backfill histórico congelado por #96.

## LOCK23

La opción que requiere un capitán persistente puede usar:

```ts
{ path: "facts.lockerCaptainAffinity", op: "exists" }
```

para fallar cerrado. A/B/C no deben desaparecer si solo la opción de escalado necesita capitán.

## Invariantes

- resolvers read-only y 0 RNG;
- falta de evidencia => `null`;
- cambio de club invalida el actor institucional anterior;
- cambio/fin de representación solo explícito;
- no retroactividad epistemológica;
- no cambio de contentIdentity sin cambio en `EVENTS`;
- no heurísticas para evitar un `null`.
