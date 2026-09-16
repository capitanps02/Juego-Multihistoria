# T5.3 follow-up — contactos conocidos por el protagonista

Estado: implementación en PR #45; contrato dirigido validado por `npm test`, con `Repository integrity` completo pendiente en el HEAD documental final.

Rama: `t5/player-contacts`.

Este documento complementa y **supersede únicamente la sección 10 (frontera con presentación)** de `T53_NPC_KNOWLEDGE.md`. El resto del cierre T5.3 original permanece histórico y válido.

## Problema pendiente encontrado tras integrar T5.3

El motor mantiene 20 NPC persistentes, y el `PlayerView.contacts` legado publica sus 20 identidades básicas `{id,name,role}`. Eso protege agendas, conocimiento, memoria y ejes privados, pero no responde a una pregunta distinta: **¿qué NPC conoce realmente el protagonista en este punto de su carrera?**

La presentación/Relations no debe inferir esa respuesta desde:

- `npcRefs`;
- relaciones o sus valores basales;
- `NPCState.access`;
- seeds o flags;
- conocimiento privado NPC→hecho.

Cualquiera de esas inferencias podría presentar al jugador una persona que todavía no ha conocido.

## Contrato añadido

`src/core/player-contacts.ts` introduce un contrato explícito y deny-by-default:

- `INITIAL_PLAYER_CONTACT_IDS` — contactos inequívocos antes de la primera escena;
- `PLAYER_CONTACT_RULES` — introducciones explícitas derivadas de historial resuelto;
- `knownPlayerContactIds(state)` — IDs conocidos por el protagonista;
- `playerKnowsNpc(state, npcId)` — consulta booleana;
- `knownPlayerContacts(state)` — proyección pública `{id,name,role}`.

`src/session/player-contacts.ts` añade `getKnownPlayerContacts(session)`, adaptador para presentación que encapsula el snapshot privado y devuelve exclusivamente la proyección pública.

## Contactos iniciales conservadores

Solo se marcan como conocidos de inicio relaciones inequívocas del propio catálogo:

- `NPC_PLR_14` — Nano, descrito como amigo/canterano;
- `NPC_FAM_01` — Elena, madre;
- `NPC_FAM_02` — Julián, padre;
- `NPC_FAM_03` — Mara, hermana;
- `NPC_SOC_01` — Dani, amigo de infancia.

No se asume que entrenador, directiva, plantilla, prensa o agentes sean contactos personales solo por existir en el mundo o tener relación basal.

## Primera introducción dinámica

La regla piloto es deliberadamente estrecha:

- `EVT_18_PRE_001 / CALL_RIVAS` introduce `NPC_ACA_01` (Julián Rivas), porque la elección dice expresamente «Llamar a Rivas».
- `CALL_NANO` **no** introduce a Rivas por el mero hecho de que Rivas aparezca en `npcRefs`.

Las siguientes introducciones deben añadirse de forma explícita cuando el canon demuestre conversación, reunión, presentación o relación previa; no por heurística.

## Compatibilidad

El follow-up no cambia:

- schema de save;
- `contentIdentity`;
- definiciones de eventos;
- RNG;
- `GameSession`;
- `PlayerView.contacts` legado.

El conjunto conocido se reconstruye desde `history` + reglas explícitas, por lo que sobrevive save/restore sin migración de estado adicional.

Mantener `PlayerView.contacts` temporalmente evita una ruptura de consumidores existentes. La presentación puede migrar a `getKnownPlayerContacts(session)` y, una vez eliminados consumidores legacy, se podrá decidir en un cambio coordinado si `PlayerView.contacts` debe filtrarse directamente.

## QA añadido

`scripts/test-t53-contacts.mjs` cubre:

1. conjunto inicial explícito y conservador;
2. relación, acceso o conocimiento privado no descubren contactos;
3. `CALL_RIVAS` introduce solo a Rivas;
4. `CALL_NANO` no introduce accidentalmente a Rivas;
5. save/restore reconstruye exactamente el contrato;
6. adaptador de sesión no expone agenda, conocimiento, memoria, trust, access ni reliability y no consume RNG;
7. todas las reglas apuntan a eventos, choices/outcomes y NPC reales, y el NPC introducido debe figurar en los `npcRefs` del evento como control de trazabilidad.

La suite está conectada a `npm test` y `npm run test:t53`.

## Deuda que sigue fuera de este follow-up

- Las 15 menciones textuales de NPC sin `npcRefs` siguen siendo deuda de reconciliación canónica T5.1.
- Mamadou y Mara siguen sin escenas/seeds propias; que Mara sea contacto familiar inicial no inventa contenido ni resuelve esa deuda narrativa.
- El catálogo completo de introducciones dinámicas todavía debe crecer con evidencia canónica explícita. Este follow-up crea el contrato seguro y una regla piloto, no infiere retrospectivamente las otras 14 identidades.
- Rumores/claims no verificados siguen fuera de `knowledge` y de este contrato.

No se modifica `project/PLAN_PASADAS.md` ni `analysis/2026-09-11/plan-seguimiento.json`.
