# T5.2 — Prioridades canónicas de wiring de seeds

Fecha: 2026-09-16  
Workstream: `t5/seed-lifecycle`  
Alcance: handoff técnico; **no** implementa escenas canónicas ni reescribe history.

Este documento convierte la deuda estructural de `seed-handoff.json` en un orden de trabajo accionable para los owners de contenido. La regla sigue siendo **canon first, wiring second**: una seed no se conecta a una escena genérica/legacy para mejorar métricas.

## 1. Cuatro huérfanas 30–34: mapping canónico explícito

El audit T5.2 detecta cuatro seeds 30–34 sin productor runtime ni consumidor. El inventario canónico de `t51/canon-30-34` contiene cuatro escenas `canonical_missing` de edad 30 con correspondencia semántica uno-a-uno:

| Seed huérfana | Escena canónica propietaria | Evidencia semántica | Acción correcta |
| --- | --- | --- | --- |
| `SEED_ROLE_COMMUNICATION` | `EVT_30_CCH_001` — *Te enteras por la pizarra* | Comunicación/ausencia de comunicación del rol por parte del entrenador | Crear la seed únicamente cuando la escena canónica sea implementada y la elección/outcome lo justifique. |
| `SEED_FALSE_ULTIMATUM` | `EVT_30_PRS_001` — *El ultimátum que nunca diste* | Presión pública atribuida al jugador que no corresponde a una exigencia real | La escena canónica debe decidir payload/intensidad y futuros consumers; no fabricar precedente desde prensa legacy. |
| `SEED_NATIONAL_ABSENCE` | `EVT_30_NAT_002` — *La selección gana sin ti* | Ausencia de selección y consecuencia identitaria/de rol internacional | Productor en la escena canónica; no inferir automáticamente de cualquier no-convocatoria técnica. |
| `SEED_SPECIALIST_BIGCLUB` | `EVT_30_JAN_001` — *Enero: especialista de lujo* | Aceptar/negociar un rol especialista en un gran club | Productor ligado a la decisión/outcome canónico, no a un shell de mercado genérico. |

Las cuatro entradas del catálogo siguen usando `PASADA_6_30_34` como procedencia editorial. Ese marcador **no** debe convertirse artificialmente en `originEvent` runtime. Cuando nazca una nueva instancia a través de la escena canónica, `originEvent` será el evento runtime real que la produjo.

### Restricción de migración

Si una versión antigua llegase a contener una instancia histórica de una de estas seeds, su `originEvent` se conserva por defecto. La migración de sesión/contentIdentity no debe reescribir procedencia histórica salvo mapping explícito y semánticamente acreditado con `rewriteExisting:true`.

## 2. 34+: descomposición de las 68 seeds

El catálogo 34+ contiene 68 seeds; en el `main` auditado todas carecen de productor y consumidor runtime. No forman un bloque homogéneo. Se dividen en ocho grupos funcionales:

### A. Memoria/bridge heredada al entrar en 34+ — 14

- `SEED_FORM_VS_PLAN`
- `SEED_PEAK_BODY_MEMORY`
- `SEED_PEAK_ROLE_LEGACY`
- `SEED_CONTRACT_REPUTATION`
- `SEED_PUBLIC_POLARIZATION`
- `SEED_CLUB_POWER_MEMORY`
- `SEED_FINALS_MEMORY`
- `SEED_NATIONAL_LEGACY`
- `SEED_WEALTH_LEGACY`
- `SEED_AGENT_ENDGAME`
- `SEED_FAMILY_RELOCATION`
- `SEED_VETERAN_MARKET_SIGNAL`
- `SEED_MEDICAL_LONG_MEMORY`
- `SEED_HOME_RETURN_SIGNAL`

**Decisión pendiente del owner 34+:** clasificar cada una como (a) memoria derivada de hechos previos ya persistidos, (b) seed creada por un bridge canónico concreto, o (c) concepto redundante que no debe convertirse en una segunda fuente de verdad. No crear 14 seeds automáticamente al cumplir 34 años.

### B. Fase edad 34 — 16

`SEED_34_MARKET_SILENCE`, `SEED_34_ROLE_FLOOR`, `SEED_34_BODY_NEGOTIATION`, `SEED_34_CONTRACT_FLEX`, `SEED_34_LAST_SELECTION`, `SEED_34_MENTORSHIP`, `SEED_34_FAMILY_WEIGHT`, `SEED_34_MEDIA_TONE`, `SEED_34_HOME_PULL`, `SEED_34_MEDICAL_REDLINE`, `SEED_34_FINAL_OUTSIDE`, `SEED_34_COMEBACK`, `SEED_34_NO_CLEARANCE`, `SEED_34_LATE_OFFER`, `SEED_34_LEAGUE_DOWNGRADE`, `SEED_34_STATUS_SACRIFICE`.

Estas son candidatas naturales a resultados/condicionales de la fase 34. Deben vincularse a identidades canónicas concretas después de la migración de sesión y no a eventos técnicos `engine_only_noncanonical`.

### C. Fase edad 35 — 8

`SEED_35_YEAR_OPTION`, `SEED_35_FINAL_ROLE`, `SEED_35_BODY_PLAN`, `SEED_35_MARKET_CALL`, `SEED_35_NATIONAL_GOODBYE`, `SEED_35_FAMILY_DECISION`, `SEED_35_CLUB_FAREWELL`, `SEED_35_HOME_LAST_WINDOW`.

### D. Fase edad 36 — 6

`SEED_36_CONTRACT_MINUTES`, `SEED_36_MEDICAL_CLEARANCE`, `SEED_36_COMEBACK_FINAL`, `SEED_36_MENTOR_ROLE`, `SEED_36_RICH_LEAGUE_LAST`, `SEED_36_NO_MARKET`.

### E. Fase edad 37 — 4

`SEED_37_ANNOUNCEMENT_CONTROL`, `SEED_37_LAST_PRESEASON`, `SEED_37_LAST_DERBY`, `SEED_37_PRIVATE_RETIREMENT`.

### F. Fase edad 38 — 4

`SEED_38_POST_ANNOUNCE_OFFER`, `SEED_38_RECONSIDERATION`, `SEED_38_LAST_CONTRACT`, `SEED_38_MARKET_SILENCE`.

Estas cuatro requieren especial cuidado con el guard canónico de retirada: ninguna seed puede reabrir por inferencia un estado `announced` o `closed`.

### G. Decisión/estado/cierre de retirada — 14

`SEED_RET_HOME_CONVERSATION`, `SEED_RET_BODY_DECISION`, `SEED_RET_HIGH`, `SEED_RET_LOW`, `SEED_RET_ANNOUNCEMENT`, `SEED_RET_LAST_MATCH`, `SEED_RET_NO_LAST_MATCH`, `SEED_RET_STORYBOOK`, `SEED_RET_RECONSIDERED`, `SEED_RET_MARKET_END`, `SEED_RET_HEALTH_END`, `SEED_RET_FAMILY_END`, `SEED_RET_PUBLIC_TONE`, `SEED_RET_PRIVATE_TONE`.

Estas seeds no deben duplicar el `retirement.status`, fechas o `closureType` como una segunda máquina de estados. Solo deben persistir información narrativa adicional cuando exista una consecuencia futura que no pueda derivarse de los hechos de retirada ya almacenados.

### H. Epílogo — 2

- `SEED_EPILOGUE_LEGACY`
- `SEED_EPILOGUE_UNFINISHED`

Un epílogo ya generado es factual y se preserva verbatim durante migración. Estas seeds no autorizan regenerar `families`, `milestones` o `summaryKey` con reglas nuevas.

Partición: **14 + 16 + 8 + 6 + 4 + 4 + 14 + 2 = 68**.

## 3. Contrato T5.2 con SESSION_CONTENT_MIGRATION (#24 / #25)

El wiring canónico futuro debe respetar simultáneamente:

1. **History factual:** nunca reescribir una `SeedInstance.originEvent` histórica solo porque el evento canónico futuro use otro ID o la misma string ID con semántica distinta.
2. **Exact-ID collision:** provenance/fingerprint debe separar definición legacy y definición canónica; `SEEN_*` y `eventCooldowns` legacy tampoco pueden suprimir la escena nueva no equivalente.
3. **Nueva instancia, nuevo origen:** si una seed terminal se vuelve a crear legítimamente en una escena canónica posterior, T5.2 abre una nueva instancia y conserva la terminal histórica.
4. **Sin replay de seeds:** migrar una sesión no vuelve a ejecutar productores/consumidores ni sintetiza `HAS_SEED_*`.
5. **Sin RNG:** migración y lifecycle administrativo no consumen draws.
6. **Pending legacy:** si una decisión antigua estaba pendiente, se resuelve con la definición/fingerprint que el jugador vio; no con la escena reparada que reutiliza el mismo ID.
7. **Legacy compatibility only:** definiciones antiguas usadas para validar history/journal/pending no vuelven a entrar en `EventIndex`/scheduler.
8. **NPC separado:** seed viva, `HAS_SEED_*` o `npcRefs` no implica conocimiento NPC.

### Estado de integración observado

- Issue #24 sigue siendo la autoridad del contrato.
- PR #25 ya contiene implementación Session v3/provenance y pruebas dirigidas; el fallo técnico previo del registry generado fue corregido en un head posterior.
- Los workflows del head observado `709b522827a560099a7c8290387be4c5aa010af6` figuran `action_required`, por lo que T5.2 **no lo considera todavía integrado ni habilita wiring canónico dependiente**.
- PR #30 mantiene un contrato alternativo/documental sin runtime y no debe tratarse como segunda autoridad mientras #24/#25 no se resuelva explícitamente.

## 4. Orden de ejecución recomendado tras desbloqueo

1. Integrar y validar la migración de sesión/contentIdentity.
2. Implementar las cuatro escenas canónicas 30–34 anteriores con sus productores reales.
3. Reejecutar `npm run audit:t52` y comprobar que `withoutRuntimeProducer` de 30–34 baja de 4 a 0 sin introducir referencias desconocidas ni reescrituras históricas.
4. Clasificar las 14 bridge-memory 34+ antes de crear ninguna automáticamente.
5. Cablear por lotes 34 → 35 → 36 → 37 → 38 → retirada → epílogo, ejecutando audit entre lotes.
6. Para cada seed open-ended, documentar explícitamente si es memoria permanente o definir consumidor/`resolve`/`expire` canónico.
7. Revalidar conjuntamente saves, determinismo, T5.3 knowledge isolation, long careers, retirement invariants y epílogos.

## Criterio de éxito

La métrica objetivo no es “cero seeds abiertas”. El objetivo es que cada seed tenga una clasificación canónica demostrable: productor correcto, consumidor/cierre correcto cuando proceda, memoria persistente intencional o deprecación segura; sin falsificar pasado ni duplicar fuentes de verdad.
