# Codex implementation queue — Canon 30–34

Baseline A7: `main@49f16b21c8f68f1439901437dcf16e1384966de2`.
Branch: `t51/canon-30-34`. PR: #13.

A7 no registra el freeze/edge de contentIdentity. El target final debe tomarse del próximo `T5.1 canon 30-34` completado después de la última wave activa; no congelar el hash documental anterior.

## Cerrado A7

- 50/50 principales tienen contenido owner-side completo: 33 activas + 17 preparadas fail-closed por authority externa.
- 18/18 shifted tienen decisión `distinct_scene`, sin alias ni herencia de seen/cooldown/pending/history.
- 4 shifted están activas bajo ID canónico; 14 tienen EventDefinition canónica completa y quedan fuera de `EVENTS` hasta recibir su gate externo.
- 26/26 conditionals engine-side genéricas: `REMOVE/SUPERSEDE`. Se conservan solo como evidencia legacy; 0 callbacks activos.
- Writers owner-side preparados para las 52 seeds 30–34. Los dos writers todavía no activos son `SEED_FALSE_ULTIMATUM` y `SEED_NATIONAL_ABSENCE`, ligados exclusivamente a sus escenas canónicas preparadas.
- `SEED_LAST_PEAK_CONTRACT`, `SEED_SUCCESSOR_PEAK`, `SEED_SUCCESSION_DECISION` y `SEED_PARALLEL_NEGOTIATION` no existen en catálogo runtime y no se sintetizan.
- CareerOffer, leadership, seed prerequisites y sport facts disponibles se consumen por APIs compartidas; no hay mutaciones locales de club/contrato ni proxies de match/NPC.

## Blockers externos exactos

| Escena | Fact requerido | Owner | API esperada | Test pendiente |
| --- | --- | --- | --- | --- |
| EVT_30_PRS_001 | threshold canónico de PUBLIC_HEAT 30–34 + hecho real de rol discutido | canon/A1 | fact de role discussion + threshold aprobado | escena no activa solo por mediaHeat/rumor |
| EVT_30_NAT_002 | ausencia internacional concreta + buen resultado alternativo + rival joven | A4 | national match/call-up authority concreta | no inferir desde standing/caps/gateOpen |
| EVT_31_ROLE_001 | 3 goles en 2 partidos + decisión real de banquillo | A4 | recent player match stats + lineup decision | tres goles/bench reproducibles tras save/load |
| EVT_30_EUR_001 | semifinal continental real + competencia por puesto | A4 | competition stage/current fixture authority | una fixture de liga no habilita la escena |
| EVT_30_RECORD_001 | siguiente aparición = hito 500 + recomendación real de carga | A4 | career appearance milestone + load plan | 499→500 y descanso autoritativos |
| EVT_30_PAIN_001 | dolor persistente + pruebas no concluyentes/scan limpio | shared medical | medical pain/imaging authority | body.risk solo no habilita |
| EVT_30_NANO_001 | NETWORK_POWER alto además de NANO_SHADOW | A1/canon | network/contact authority + threshold aprobado | HAS_SEED_NANO_SHADOW solo no habilita |
| EVT_31_FAM_001 | FAMILY_ANCHOR medio/alto + oferta exterior elegible | A3/canon | CareerOffer exterior + threshold family anchor | oferta stale/doméstica no habilita |
| EVT_31_TEAM_001 | LEGACY_CAPITAL alto | canon | threshold canónico | legacyCapital arbitrario sin threshold no habilita |
| EVT_31_SQUAD_001 | SUCCESSION_PRESSURE alto | canon/A2 | threshold + identidad SEED_SUCCESSION_DECISION | no materializar seed ausente |
| EVT_31_BIZ_001 | WEALTH_STRUCTURE/PERSONAL_BRAND altos | canon | thresholds canónicos | riqueza genérica no habilita |
| EVT_32_ELITE_001 | oferta de candidato máximo con rol de rotación explícito + TROPHY_HUNGER | A3/canon | offer role/minutes + threshold hunger | bigClub solo no habilita |
| EVT_32_SUCCESSOR_001 | ausencia + sustituto excelente + equipo invicto | A4 | replacement recent performance/results | RECOVERING_INJURY solo no habilita |
| EVT_32_LOAD_001 | calendario denso + viaje/carga real | A4 | congestion/travel-load authority | weekly 144/168 h no simula congestión |
| EVT_32_BOSMAN_001 | Bosman real + precontrato/negociaciones paralelas | A3/A2 | multi-offer/precontract authority + seed identity | singleton pending no habilita paralelo |
| EVT_33_RECORD_001 | récord a 6 apariciones + plan gestionado 4–5 titularidades | A4 | record-distance + role-plan authority | appearances agregado solo no habilita |

## Authority consumida en esta pasada

- `EVT_32_RICH_001`: activada con `facts.pendingCareerOffer.context.kind = late_rich_offer`; salario/ruta sin contexto explícito no habilitan la escena.

## Stable-ID gaps aún externos

- A4: `EVT_30_FORM_001`, `EVT_31_RETURN_001`, `EVT_31_FINAL_001`, `EVT_32_FAN_001`, `EVT_32_NAT_001`, `EVT_33_BODY_001`.
- A3: `EVT_31_MKT_001` (dos ofertas), `EVT_32_CON_001` (renewal-by-minutes), `EVT_33_MKT_001` (cuatro rutas/propuestas).
- Canon: `EVT_30_CAP_001` requiere threshold autoritativo de LOCKER_WEIGHT; no usar lockerPower como sustituto.

## Integración A0 pendiente

Cuando el focused CI del HEAD final termine:

1. tomar el `contentIdentity(EVENTS)` exacto;
2. congelar ese target;
3. registrar un único edge desde la fuente upstream congelada;
4. ejecutar save/load + migration + Repository Integrity;
5. no reescribir historia legacy ni origen histórico de seeds.

Cualquier fallo anterior al sentinel de freeze/route es regresión real A7 y debe corregirse. El PR permanece draft y no se auto-mergea.
