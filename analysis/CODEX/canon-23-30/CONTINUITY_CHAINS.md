# Continuity chains — 23–30

Estas cadenas describen causalidad que debe conservarse; no autorizan aliases de identidad ni rewrites de saves.

## 23–26

### Rol prometido → presión pública

`EVT_23_BRIDGE_001`
→ promesa/expectativa de rol real persistida
→ `facts.roleGuaranteeAt23`
→ evolución de rol real
→ `facts.roleDropSince23`
→ `EVT_23_PRS_001`

La seed `SEED_ELITE_ROLE_BARGAIN` puede ser memoria de apoyo, nunca provenance suficiente por sí sola. Debe distinguirse promesa contractual/deportiva, rol real posterior y cambio legítimo de contexto.

### Mercado/contrato formal

`CareerOffer pending`
→ `EVT_23_MKT_001` o `EVT_23_CON_001`
→ `offerBridge.choiceActions`
→ `respondToOffer()`
→ accept aplica exactamente `offer.terms`; reject/counter/defer conservan CareerTerms previos
→ historia contractual verificable
→ `EVT_25_CON_001`
→ nuevo estado contractual o negociación aplazada
→ age-26 bridge

Ninguna escena escribe `club`, `contract.*`, `professional.ownerClub`, `registrationClub` o `market.pending` para simular la operación.

### Vestuario

`EVT_20_LOCK_002`
→ `SEED_TEAMMATE_COVER` scoped al club de origen
→ `EVT_23_LOCK_001`
→ A/B/C disponibles según trigger
→ opción D solo si `facts.lockerCaptainAffinity exists`
→ conocimiento del capitán únicamente si el slot se resuelve al entrar en escena

`captain involved` no equivale a `captain caused incident`; el participante no se inventa.

### Penalti 24

fixture/appearance/football moment real
→ `EVT_24_MATCH_001`
→ decisión de jerarquía/social
→ gol/fallo determinado por sport authority
→ `SEED_PENALTY_HIERARCHY`

El lanzador designado no se convierte automáticamente en NPC persistente y preguntar al capitán/técnico no autoriza a inventar un receptor.

### Agente/mercado 25

interés directo previo
→ `SEED_DIRECT_RECRUIT`
→ `EVT_25_MKT_001` (llamada de entrenador; interés ≠ oferta)
→ información/intención
→ solo el sistema de mercado puede materializar después una `CareerOffer`

En paralelo:

`SEED_AGENT_OMISSION` + evidencia concreta
→ `EVT_25_AGT_001`
→ decisión sobre el agente activo real
→ memoria de prueba/omisión

### Selección 25

call-ups reales + standing/rol real
→ `EVT_25_NAT_001`
→ aceptación/adaptación/explotación comercial del estatus
→ continuidad de selección hacia 26

Reputation/nationalHeat son apoyo, no convocatoria.

## Age 26

### Boundary de pico

estado contractual + rol + club + agente + seeds abiertas + selección + lesiones + relaciones
→ `EVT_26_BRIDGE_001`
→ `SEED_PEAK_IDENTITY`
→ identidad/estrategia de pico para 26–30

Carreras nuevas: origen canónico nuevo. Saves antiguos: conservar origen histórico previo; no reescribir `SeedInstance.originEvent`.

### Gran noche / final

`EVT_26_EUR_001`
→ `SEED_BIG_GAME_BENCH`
→ `EVT_26_FINAL_001`
→ `SEED_FINAL_BENCH`

Ambas escenas consumen hechos reales de competición, convocatoria, start/bench y resultado.

### Récord

`EVT_26_MATCH_001`
→ `SEED_RECORD_CHASE`
→ `EVT_27_MATCH_001`
→ `SEED_RECORD_PUBLIC_TONE`

Partidos y contribución del jugador vienen del sport context.

### Liderazgo

locker/captaincy history
→ `EVT_26_CAP_001`
→ `SEED_LOCKER_ENDORSEMENT`
→ `EVT_27_LOCK_001`
→ `SEED_MANAGER_POWER`
→ `EVT_28_CLUB_001`

Capitán, líder, veterano e influencia son conceptos distintos.

### Cuerpo

injury/missed-time/return history
→ `EVT_26_MED_001`
→ `SEED_PEAK_LOAD`
→ body/medical decisions 27–29

No crear diagnóstico desde copy narrativa.

### Documental

`EVT_26_DOC_001`
→ `SEED_DOCUMENTARY_ACCESS`
→ información efectivamente publicada/conocida
→ `EVT_28_MEDIA_001`
→ `SEED_DOCUMENTARY_FALLOUT`

Material privado o no publicado no hace omniscientes a los NPC.

### Rivalidad

conflicto/historial/statement/relationship previo
→ `EVT_26_RIV_001`
→ `SEED_PUBLIC_RIVALRY`
→ callbacks posteriores

Un simple enfrentamiento no basta para crear rivalidad.

### Mentor/sucesión

current-club teammate/mentor context
→ `EVT_26_TEAM_002`
→ `SEED_MENTOR_ADVICE`
→ young-successor context
→ `EVT_27_TEAM_001`
→ `SEED_SUCCESSOR_PEAK`
→ `EVT_28_STAR_001`
→ `SEED_SUCCESSION_DECISION`

Targets institucionales deben recalcularse tras cada cambio de club.

### Selección

selection history real
→ `EVT_26_NAT_002`
→ `SEED_NATIONAL_ROLE`
→ continuidad 27/28/29: regularidad, suplencia, exclusión, regreso o torneo según hechos.

## 27–30

### Agente y Bosman futuro

`SEED_AGENT_CONFLICT_PEAK`
→ `EVT_27_AGT_002`
→ `SEED_PARALLEL_NEGOTIATION`
→ estado preservado para el consumidor posterior `EVT_32_BOSMAN_001`

No asumir que el mismo agente sigue activo sin autoridad de identidad.

### Reinvención táctica

`EVT_27_TACT_001`
→ `SEED_POSITIONAL_REINVENTION`
→ decisiones/rendimiento posteriores
→ `EVT_29_TACT_001`
→ estado táctico limpio al entrar en 30

### Dinero

`EVT_27_MONEY_001`
→ `SEED_WEALTH_STRUCTURE`
→ decisiones de casa/familia/negocio posteriores
→ situación financiera/legacy al entrar en 30

### Mercado de mitad de carrera

interest
→ formal `CareerOffer` si la simulación lo materializa
→ negociación narrativa sobre esa offer
→ `respondToOffer()`
→ transición de club solo si la oferta queda aceptada
→ recalcular locker targets, institutional targets y knowledge context del nuevo club

La implementación legacy que hace `set club = UDV` en `EVT_29_HOME_001` no puede acreditarse como canon y debe reemplazarse por autoridad de oferta.

## Handoff a 30–34

A los 30 deben sobrevivir, cuando proceda:

- club/owner/registration y contrato autoritativos;
- `SEED_PEAK_IDENTITY`;
- `SEED_FINAL_BENCH` / memoria de grandes partidos;
- record/public tone;
- locker/manager-power history;
- injury/load history;
- documentary/media fallout;
- rivalry history;
- mentor/successor decisions;
- national-team status/history;
- `SEED_POSITIONAL_REINVENTION`;
- `SEED_WEALTH_STRUCTURE`;
- agent relation/conflict;
- home/family/public legacy;
- `SEED_AGE30_PRIORITY` cuando el canon lo produzca.

No se escriben aquí escenas 30–34.
