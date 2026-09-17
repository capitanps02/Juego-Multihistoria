# Blockers — Canon 23–30

Snapshot base: `main@adf1bffa7298bff6d7cebab88a3388c559cd3588`.

Un blocker no autoriza a sustituir la autoridad ausente por `reputation`, `marketHeat`, `lockerPower`, `agentControl`, edad o una seed genérica.

| Event / chain | Block | Missing authority / contract | Owner | Issue/PR | Exact API/fact needed | ¿Puede Codex preparar algo ahora? |
|---|---|---|---|---|---|---|
| `EVT_23_PRS_001` | 23–26 | provenance de promesa de rol y caída posterior | role expectation/shared | #109 / PR #106 | `facts.roleGuaranteeAt23`, `facts.roleDropSince23` o API equivalente derivada de historia real | Sí: copy/choices/tests candidate; no activar usando solo `HAS_SEED_ELITE_ROLE_BARGAIN` |
| `EVT_23_MKT_001` | 23–26 | demostrar que `market.pending` es una oferta formal y un salto plausible, no simple interés | market/contracts | #83 | comparación autoritativa `pending.before` vs `pending.terms` / fact equivalente de upgrade plausible | Sí: definición + `offerBridge`; dejar el gate de plausibilidad pendiente si no hay fact compartido |
| `EVT_23_CON_001` | 23–26 | ruta de fuerte revalorización además de renovación formal | market/contracts | #83 | formal same-club renewal + fact de revalorización contractual/mercado autorizado | Parcial: puede implementarse la ruta `<=24 months`; no declarar canon completo sin la segunda ruta |
| `EVT_23_LOCK_001` | 23–26 | integración de generación adyacente | coordinator/integration | #133 / PR #122 | candidate ya corregido; knowledge rule dinámica + content lineage al activar | No necesita más semántica: integrar candidate `t514-staged-lock-principal-events.ts` cuando corresponda |
| `EVT_24_MATCH_001` | 23–26 | segundo penalti y gol/fallo como hecho deportivo real | sport context | #86 / #85 | football moment / match fact para penalti, resultado y contribución; sin RNG narrativo | Sí: choices de jerarquía y seed social; outcome de gol/fallo debe esperar al hook deportivo |
| `EVT_25_AGT_001` | 23–26 | identidad del agente activo | NPC/agent authority | #81 | `getActiveAgentId(state): string | null` o equivalente, con ruta no-agent | Sí: escena adaptable; no fijar `NPC_AGT_01/02` por trust/control/última conversación |
| `EVT_25_NAT_001` | 23–26 | repetición real de convocatorias y rol de selección | sport/selection | #81 | historial de call-ups/minutes/selection role, no solo `nationalHeat`/reputation | Sí: copy/choices; trigger final debe esperar authority |
| `EVT_26_BRIDGE_001` | age 26 | activación + nuevo origen canónico de `SEED_PEAK_IDENTITY` | integration + seed lifecycle | #6 / PR #115 | siguiente generation edge; catálogo para carreras nuevas; preservar `SeedInstance.originEvent` histórico | Candidate completo y tests ya están en esta rama; no añadir a `EVENTS_26_30` aquí |
| `EVT_26_EUR_001` -> `EVT_26_FINAL_001` | age 26 | partido europeo/final, titularidad/banquillo y resultado reales | sport context | #6 | fixture/competition/appearance/start/result + football moments | Sí: estructura narrativa/seed chain; no inventar partido ni banquillo |
| `EVT_26_MATCH_001` -> `EVT_27_MATCH_001` | 26–27 | partido, penalti/récord y contribución reales | sport context | #6 / #4 | fixture, opponent, competition, appearance, start, result, playerContribution | Sí: seed chain/tests; no outcomes deportivos sintéticos |
| `EVT_26_CAP_001` | age 26 | capitán/liderazgo actual | locker/NPC | #6 | `resolveLockerSlot(state,"captain")` / locker authority actual | Sí: rama fail-closed; no inferir capitán por edad/reputación/lockerPower |
| `EVT_26_TEAM_002` | age 26 | compañero/mentor actual del club | locker/NPC | #6 | slot/target del club actual + knowledge route | Sí: plantilla candidate sin hardcodear NPC viejo |
| `EVT_26_NAT_001`, `EVT_26_NAT_002` | age 26 | convocatoria/rol/torneo reales | sport/selection | #6 | selection context / call-up history | Sí: decisiones y continuidad; no gates finales por reputation sola |
| `EVT_27_AGT_001`, `EVT_27_AGT_002` | 26–30 | agente activo + negociación paralela causal | NPC/agent + market | #4 | active agent identity; `CareerOffer` para cualquier oferta formal | Sí: contenido candidate; no asumir identidad de agente |
| `EVT_27_LOCK_001`, `EVT_27_TEAM_001`, `EVT_28_CLUB_001`, `EVT_28_STAR_001` | 26–30 | jerarquía/targets de vestuario actuales | locker/NPC | #4 | current-club slots + knowledge routes | Sí: candidates fail-closed; nunca arrastrar captain/director/team de un club anterior |
| `EVT_27_NAT_001`, `EVT_28_NAT_001`, `EVT_29_NAT_002`, `CEVT_29_NAT_02` | 26–30 | continuidad selección: convocatoria, suplencia, exclusión, regreso, torneo | sport/selection | #4 | selection history/context | Sí: escenas candidate; trigger final bloqueado |
| `EVT_29_HOME_001` legacy | 26–30 | runtime histórico cambia `club`/owner/registration directamente | market/contracts | #4 | cualquier retorno formal debe materializarse como `CareerOffer` y cerrarse por `respondToOffer()` | Sí: reemplazar la semántica legacy; nunca conservar el `set club=UDV` como canon |

## Proxy audit

| Signal | Classification | Regla |
|---|---|---|
| `reputation.*` | supporting factor | Puede modular presión/visibilidad; no acredita oferta, selección, capitán ni conocimiento. |
| `age` | valid temporal gate | Sirve para fase/ventana; no identifica NPC, rol o partido. |
| `marketHeat` | supporting factor | Puede medir temperatura de mercado; no sustituye `CareerOffer`. |
| `coachTrust` | proxy debt cuando se usa como actor concreto | Si la escena depende de un técnico concreto, necesita identidad/estado institucional verificable. |
| `lockerPower` | supporting factor | Influencia ≠ capitanía; no resuelve target. |
| `agentControl` | supporting factor | Control delegado ≠ identidad de agente activo. |

## Lineage blockers

Los candidatos de esta rama deliberadamente no registran:

- target hash global;
- source→target migration edge;
- shortcut desde generaciones antiguas;
- generation freeze;
- frozen offer-bridge evidence;
- seed-origin rewrite histórico.

Para cada lote que llegue a activación, el integrador debe congelar la fuente realmente vigente en ese momento y crear solo la siguiente edge adyacente.
