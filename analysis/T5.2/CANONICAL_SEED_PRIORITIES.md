# T5.2 — Prioridades canónicas de wiring y cierre de seeds

Fecha del snapshot: 2026-09-17  
Base exacta: `main@6d2239ae1f89be97a7c5cf117d456cff9218aade`  
Workstream: `t5/seed-lifecycle`  
Alcance: coordinación/handoff; **no** inventa escenas, consumers ni cierres canónicos.

## 1. Regla de prioridad

El orden correcto ya no es “bajar la cifra de seeds abiertas”. La prioridad es:

1. integrar hechos y escenas canónicas de cada owner;
2. volver a medir T5.2 desde el `main` exacto;
3. distinguir live presence de precedente histórico;
4. demostrar la consecuencia real de cada seed;
5. registrar una disposición de cierre solo con evidencia owner-backed.

Las cuatro únicas disposiciones válidas son:

- `canonical_chain`;
- `intentional_persistent`;
- `canonical_expiry`;
- `retired_compatible`.

Una cadena técnicamente factible no autoriza automáticamente `canonical_chain`. Una ventana finita no autoriza automáticamente `canonical_expiry`. Una seed sin consumer no autoriza automáticamente `intentional_persistent`.

## 2. Punto de partida medido

El exact-main runner `35229309280` deja esta topología:

- **210** seeds totales;
- **47** productor + consumer factible;
- **91** producer-only;
- **72** unwired;
- **0** producer→consumer impossible;
- **162** open-ended que todavía necesitan razón canónica;
- **0** cierres canónicos clasificados;
- **210** pendientes de clasificación;
- **22** registros live de consumers de simulación;
- **1** consumer histórico directo registrado;
- **1/1** scope proofs requeridas/integradas;
- `npm run test:t52`: **63/63 PASS**.

Por tanto, la infraestructura T5.2 ya no es el cuello de botella principal. El trabajo restante es sobre todo **evidencia canónica por owner + integración limpia + clasificación explícita**.

## 3. Prioridad A — 18–23: integrar antes de duplicar

Estado integrado de este owner:

- 31 seeds totales;
- 31 con productor runtime;
- 23 con algún consumer;
- 8 sin consumer;
- 7 open-ended sin terminal;
- 24 con ventana de edad finita;
- 1 con terminal explícito.

El PR #155 (`t51/canon-18-23-agent5`) continúa abierto/draft y ya contiene implementación owner-side para los cinco consumers que el handoff Codex de T5.2 marca como ready:

- `CEVT_18_BRUNO_01`;
- `CEVT_18_CCH_01`;
- `CEVT_18_RELEG_01`;
- `CEVT_19_INJ_01`;
- `CEVT_19_RETURN_01`.

Esa implementación usa `facts.*` causales y outcome modifiers; T5.2 **no debe volver a implementarla en otra rama**.

### Acción prioritaria

1. que el owner cierre sus gates de integración/contentIdentity;
2. integrar #155 solo cuando el coordinador lo considere seguro;
3. regenerar T5.2 desde el nuevo `main`;
4. comprobar cuáles de las cinco tareas dejan de ser “Codex-ready” porque ya son runtime integrado;
5. estudiar las 8 seeds todavía sin consumer y las 7 open-ended para obtener una disposición real, no una clasificación por defecto.

## 4. Prioridad B — 23–30: explotar el nuevo contrato histórico

Estado integrado:

- 59 seeds totales;
- 59 con productor runtime;
- 29 con algún consumer;
- 30 sin consumer;
- 35 open-ended;
- 24 con ventana finita.

Este bloque aporta el primer ejemplo explícito de **consumer histórico**:

`SEED_ELITE_ROLE_BARGAIN` → `src/simulation/club-contract-intent.ts` → `hasRoleGuaranteeAt23`.

La lección de diseño es importante: cuando la consecuencia depende de que un hecho haya ocurrido, no hay que mantener artificialmente viva la seed. Se consulta el precedente histórico mediante un contrato explícito y auditable.

### Acción prioritaria

Para las 30 seeds sin consumer y las 35 open-ended, el owner debe decidir caso a caso si:

- existe una consecuencia posterior live;
- existe una consecuencia basada en historial factual;
- la memoria debe persistir intencionalmente;
- existe expiración canónica real;
- el concepto debe retirarse de forma compatible con saves.

No registrar historical consumers por anticipado: solo se añaden cuando existe una lectura runtime real que el ratchet pueda verificar.

## 5. Prioridad C — 30–34: resolver las cuatro huérfanas reales

Estado integrado:

- 52 seeds totales;
- 48 con productor runtime;
- 7 con algún consumer;
- 45 sin consumer;
- 4 sin productor ni consumer;
- 52 open-ended;
- 52 con deuda de origin canónico en este snapshot.

Las cuatro huérfanas siguen siendo:

| Seed | Mapping canónico ya documentado | Acción correcta |
| --- | --- | --- |
| `SEED_ROLE_COMMUNICATION` | `EVT_30_CCH_001` — *Te enteras por la pizarra* | Crear únicamente cuando la escena canónica produzca realmente esa memoria. |
| `SEED_FALSE_ULTIMATUM` | `EVT_30_PRS_001` — *El ultimátum que nunca diste* | La escena define payload/intensidad y futuros efectos; no inferir desde prensa genérica. |
| `SEED_NATIONAL_ABSENCE` | `EVT_30_NAT_002` — *La selección gana sin ti* | No convertir cualquier no-convocatoria técnica en este precedente. |
| `SEED_SPECIALIST_BIGCLUB` | `EVT_30_JAN_001` — *Enero: especialista de lujo* | Ligar al resultado/decisión canónicos, no a un shell de mercado. |

`PASADA_6_30_34` es provenance editorial del catálogo, **no** un `originEvent` runtime válido. Cuando una escena canónica produzca una nueva instancia, el origen debe ser el evento runtime real. History antigua se conserva salvo una migración explícita y acreditada.

### Acción prioritaria

1. implementar/integrar las cuatro escenas propietarias;
2. regenerar `seed-lifecycle`, `seed-handoff`, deferred y closure readiness;
3. exigir que `withoutRuntimeProducer` de este owner baje de 4 a 0 por productores reales;
4. no clasificar las otras 48 seeds solo porque ya tengan productor;
5. trabajar después las 45 sin consumer y los 52 open-ended por evidencia.

## 6. Prioridad D — 34+: no crear 68 seeds por edad

Estado integrado de `t51/canon-34plus`:

- 68 seeds totales;
- 0 con productor runtime;
- 0 con consumer runtime;
- 68 sin productor;
- 68 sin consumer;
- 68 open-ended.

Este bloque es actualmente la mayor bolsa `unwired` de T5.2. Eso **no** significa que la solución sea crear las 68 al entrar en 34+.

La agrupación funcional existente sigue siendo útil para planificar, pero **no es una clasificación de cierre**:

- 14 bridge/memoria heredada;
- 16 de fase 34;
- 8 de fase 35;
- 6 de fase 36;
- 4 de fase 37;
- 4 de fase 38;
- 14 relacionadas con decisión/estado/cierre de retirada;
- 2 de epílogo.

Partición: **14 + 16 + 8 + 6 + 4 + 4 + 14 + 2 = 68**.

### Bridge/memoria heredada — 14

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

Para cada una, el owner debe escoger con evidencia entre:

- derivar el dato de hechos previos ya persistidos;
- crear una seed mediante un bridge canónico concreto;
- mantener una memoria intencionalmente persistente;
- retirar el concepto si duplica otra fuente autoritativa.

No introducir una segunda fuente de verdad solo porque el catálogo contiene un ID.

### Seeds 34–38, retirada y epílogo

Las seeds de fases 34–38 deben nacer de decisiones/outcomes reales de sus escenas. Las de retirada no pueden duplicar `retirement.status`, fechas o `closureType` como otra máquina de estados. Las de epílogo no autorizan recalcular history ya factual con reglas nuevas.

Especialmente tras un estado terminal de retirada, ninguna seed puede reabrir por inferencia un estado `announced` o `closed`.

## 7. Prioridad E — convertir evidencia estructural en cierre owner-backed

La topología actual contiene 47 cadenas factibles, pero el registry canónico sigue 0/210. El siguiente avance real de T5.2 consiste en convertir evidencia ya integrada en decisiones explícitas del owner.

Para cada seed candidata:

1. localizar owner y producer real;
2. localizar consumer/cierre real o justificar por qué no debe existir;
3. comprobar si la lectura requiere live presence o historia factual;
4. comprobar edad/scope/fecha;
5. preservar payload semantics;
6. asignar exactamente una de las cuatro disposiciones permitidas;
7. aportar evidencia suficiente para que el validator pueda aceptarla fail-closed.

No clasificar por lotes basándose solo en prefijos, edad o ausencia de consumer.

## 8. Restricciones transversales

Todo wiring/cierre nuevo debe conservar simultáneamente:

- `SeedInstance.originEvent` histórico;
- contentIdentity/fingerprint de contenido ya visto;
- pending events/choices;
- history factual;
- determinismo y streams RNG;
- save/restore;
- idempotencia;
- separación entre live seed y existencia histórica;
- aislamiento epistemológico T5.3;
- autoridad real de contratos/mercado;
- autoridad real de partido/calendario;
- invariantes de retirada y epílogo.

### Prohibiciones

- no crear `resolve`/`expire` arbitrarios para bajar deuda;
- no registrar historical consumers que no tengan lectura runtime real;
- no reescribir `originEvent` antiguo para que parezca canónico;
- no convertir una seed en conocimiento NPC implícito;
- no inventar contratos, ofertas, partidos, goles o retirada desde una seed;
- no usar una seed como workaround de un bug del owner de mercado/contratos;
- no declarar un bloque cerrado solo porque CI esté verde.

## 9. Gate de integración recomendado

Tras cada batch funcional de un owner:

1. `npm run test:t52`;
2. regenerar lifecycle/handoff/deferred/closure readiness;
3. ejecutar ratchet de direct seed identity reads;
4. comprobar registry de live/historical consumers;
5. comprobar scope proofs;
6. revisar contentIdentity y save migration si EVENTS cambiaron;
7. ejecutar gates T5.3 si hay NPC/knowledge involucrados;
8. ejecutar autoridad de contratos/mercado o fútbol si corresponde;
9. ejecutar Repository Integrity/full integration;
10. regenerar `analysis/CODEX/seeds` desde el `main` exacto.

PR #159 es precisamente el handoff de provenance exact-main actual. Si `main` avanza antes de su integración, debe regenerarse otra vez; nunca editar manualmente `baseCommit` para aparentar frescura.

## 10. Criterio de éxito

T5.2 estará realmente cerrado cuando **210/210** seeds tengan una disposición explícita, verificable y owner-backed dentro de una de las cuatro clases permitidas.

La meta no es “cero seeds abiertas” ni “cero IDs sin consumer”. Una seed persistente puede ser correcta; una expiración puede ser correcta; una retirada compatible puede ser correcta. Lo que no puede quedar es memoria causal sin semántica, sin owner o con una consecuencia inventada para satisfacer una métrica.
