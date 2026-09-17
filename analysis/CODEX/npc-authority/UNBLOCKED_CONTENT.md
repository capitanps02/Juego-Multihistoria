# Contenido desbloqueado por NPC authority

Base de esta recomposición: `main@782b92c9a496293aeb33ad8b39f522a927374d6f`.

| Evento | Estado | Acción Codex |
|---|---|---|
| `EVT_21_PRS_001` | ready después de integrar esta autoridad | `CLUB_CORRECT` puede usar `targetSlots:["currentClubInstitutional"]`; fuera de club certificado no crear conocimiento nominal. |
| `EVT_22_CON_001` | ready | Añadir conocimiento solo a elecciones que realmente comuniquen postura al club; no convertir efectos abstractos de trust en epistemología. |
| `EVT_22_CON_002` | ready | Mismo criterio choice-by-choice; estrategia privada no equivale a comunicación. |
| `EVT_23_LOCK_001` | ready como patch separado en owner #122 | La opción de avisar al capitán usa `eligibility: [{ path:"facts.lockerCaptainAffinity", op:"exists" }]`; A/B/C permanecen. |
| `EVT_21_CAP_001` | política resuelta | Mantener capitán genérico/no persistente en 20–23; no asignar nombre sin nueva evidencia. |
| `EVT_20_BRUNO_001` | blocked | Esperar acción canónica que certifique agente activo. |
| `EVT_20_AGT_001` | blocked | Esperar acción canónica que certifique agente activo. |
| `EVT_21_SOC_001` | blocked | Esperar acción canónica que certifique agente activo. |
| `EVT_21_AGT_001` | blocked | Esperar acción canónica que certifique agente activo. |

Recuento: 4 patches ejecutables tras integración, 1 política resuelta sin nombre persistente y 4 escenas de agente todavía bloqueadas por provenance canónica real.
