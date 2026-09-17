# PROMPT PARA CODEX — CONSUMIDORES DE NPC AUTHORITY

Actúa como desarrollador TypeScript senior e ingeniero narrativo de integración de `capitanps02/Juego-Multihistoria`.

## Antes de tocar contenido

1. Lee el `main` real más reciente; GitHub prevalece sobre este handoff.
2. Confirma que la autoridad NPC de `integration/t5-npc-authority-current` ya está integrada o porta únicamente ese write-set sobre una rama limpia.
3. Lee `README.md`, `ARCHITECTURE_CONTRACT.md`, `UNBLOCKED_CONTENT.md` e `implementation-ready.json` de este directorio.
4. No trabajes directamente sobre `main` y no hagas auto-merge.

## Objetivo

Implementar solo consumidores de autoridad NPC realmente desbloqueados, sin inventar identidad ni reabrir arquitectura compartida.

## Tareas listas

### EVT_21_PRS_001
Para `CLUB_CORRECT`, usar `targetSlots:["currentClubInstitutional"]` solo si la elección/outcome realmente comunica el hecho al club. Un club no certificado produce `null`; los efectos abstractos de `professional.institutionalTrust` pueden seguir funcionando.

### EVT_22_CON_001
Añadir conocimiento institucional choice-by-choice. `OPEN_RENEWAL_NOW` y `NO_RENEWAL_FOR_NOW` pueden informar al club cuando el texto final expresa esa comunicación. `WAIT_SUMMER` no informa por defecto.

### EVT_22_CON_002
Mismo principio: no convertir una estrategia privada como `RUN_DOWN` en conocimiento nominal salvo evidencia textual/canónica de comunicación.

### EVT_23_LOCK_001 / #133
Trabajar en el owner de PR #122. La opción de avisar al capitán debe llevar:

```ts
eligibility: [{ path: "facts.lockerCaptainAffinity", op: "exists" }]
```

Sin captain slot esa opción desaparece; A/B/C siguen disponibles. No hardcodear capitán UDV fuera de su contexto.

## No implementar todavía

`EVT_20_BRUNO_001`, `EVT_20_AGT_001`, `EVT_21_SOC_001`, `EVT_21_AGT_001` siguen bloqueados hasta que una acción canónica real certifique agente activo mediante `certifyActiveAgentInPlace`. Está prohibido inferirlo desde contactos, flags, seeds, relaciones, `agentControl`, `npcRefs` o recencia.

## APIs obligatorias

- `resolveActiveAgent`
- `certifyActiveAgentInPlace`
- `clearActiveAgentInPlace`
- `resolveCurrentClubInstitutionalNpc`
- `captureNpcKnowledgeTargetContext`
- `resolveNpcKnowledgeTargets`

No reimplementes `resolveLockerSlot`, leadership assignments, scheduler de choice eligibility ni el backfill histórico de conocimiento NPC.

## Tests

Para cada consumidor nuevo: club certificado positivo; club no certificado negativo; cambio de club sin leakage; targets capturados al entrar; 0 RNG; resolver read-only; save/resume determinista. Ejecuta focused tests, `npm run build`, `npm test` y Repository Integrity sobre el HEAD exacto.

## Content identity

Si no cambias `EVENTS`, no cambies contentIdentity. Si una tarea modifica `EVENTS`, re-lee el catálogo activo real y crea solamente la siguiente edge adyacente; nunca reutilices hashes históricos de una PR antigua ni regeneres freezes previos.

## Terminado cuando

Los consumidores listos tienen reglas epistemológicas correctas, las escenas de agente siguen bloqueadas hasta provenance real, LOCK23 conserva opciones no dependientes de captain, los gates están verdes en exact-head y el PR queda listo para revisión humana/coordinador sin auto-merge.
