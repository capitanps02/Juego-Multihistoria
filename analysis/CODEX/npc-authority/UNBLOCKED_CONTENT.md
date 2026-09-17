# Contenido desbloqueado por NPC authority

Base revisada: `main@ebef17057156c7721fc4a041552c9cf1b3fdb6ba`.
Consumer principal inspeccionado: PR #129 (`t51/canon-20-23`).
LOCK23 inspeccionado: PR #122 (`integration/t511-lock-23-26`).

| Evento | Antes | Ahora | Qué puede hacer Codex |
|---|---|---|---|
| `EVT_21_PRS_001` | `CLUB_CORRECT` podía cambiar estado institucional, pero no existía destinatario nominal seguro del club actual. | `currentClubInstitutional` resuelve a `NPC_DIR_02` únicamente en UDV/18–23 mientras siga activo y en UDV; fuera de ese contrato devuelve `null`. | Añadir regla de conocimiento dinámica para `CLUB_CORRECT` y sus outcomes pertinentes sin hardcodear un director en otros clubes. |
| `EVT_22_CON_001` | El snapshot de PR #129 marcaba `club knowledge` como blocker por falta de actor institucional actual. | Existe resolver y target dinámico institucional. | Añadir conocimiento solo a elecciones que realmente comuniquen postura al club, especialmente `OPEN_RENEWAL_NOW` y `NO_RENEWAL_FOR_NOW`; no transformar efectos abstractos de trust en conocimiento nominal. |
| `EVT_22_CON_002` | Mismo blocker de conocimiento institucional. | Mismo contrato dinámico disponible. | Modelar conocimiento del club elección por elección, dejando `null` en clubes no certificados. |
| `EVT_23_LOCK_001` | La opción “avisar al capitán” podía aparecer aunque `resolveLockerSlot(..., "captain")` devolviera `null`. | El contrato compartido de `choice.eligibility` y `facts.lockerCaptainAffinity` permite ocultarla de forma fail-closed. | En PR #122 añadir `eligibility: [{ path: "facts.lockerCaptainAffinity", op: "exists" }]` a la opción de avisar al capitán; conservar las demás opciones. |
| `EVT_21_CAP_001` | Se podía sentir presión por convertir `npcRefs`/catálogo en capitán nominal 20–23. | Se fija la decisión segura: capitán genérico/no persistente; no hay target nominal en 20–23. | Mantener la escena funcional sin crear memoria nominal de capitán. No asignar `NPC_PLR_10` ni `NPC_PLR_11` sin nueva evidencia. |
| `EVT_20_BRUNO_001` | Bloqueado por identidad/provenance del agente activo. | Existe resolver `resolveActiveAgent` y target `activeAgent`, pero todavía no existe una acción canónica que certifique quién fue contratado. | Sigue `blocked`; no implementar conocimiento nominal hasta integrar una contratación/cambio explícito. |
| `EVT_20_AGT_001` | Bloqueado por identidad/provenance del agente activo. | Infraestructura lista, provenance canónica ausente. | Sigue `blocked`. |
| `EVT_21_SOC_001` | PR #129 lo reclasificó como bloqueado por epistemología completa del agente. | Infraestructura lista, provenance canónica ausente. | Sigue `blocked`. |
| `EVT_21_AGT_001` | Snapshot funcional lo incluye en el mismo blocker. | Infraestructura lista, provenance canónica ausente. | Sigue `blocked`. |

## Recuento

- Escenas con implementación/patch inmediatamente ejecutable por Codex gracias a contratos ya disponibles: **4** (`EVT_21_PRS_001`, `EVT_22_CON_001`, `EVT_22_CON_002`, `EVT_23_LOCK_001`).
- Escena ya funcional cuya política de capitán queda explícitamente cerrada en modo genérico: **1** (`EVT_21_CAP_001`).
- Escenas de agente que siguen bloqueadas a nivel de contenido por falta de contratación nominal canónica: **4**.

No se cuenta como “desbloqueada” una escena solo porque exista una API si todavía falta la evidencia canónica que alimenta esa API.
