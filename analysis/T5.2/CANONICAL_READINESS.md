# T5.2 — Readiness canónica para conectar seeds

Fecha del snapshot: 2026-09-16  
Base observada: `main@e48a6c85d0a9e61d88eca121f683dcd308c188c1`  
Catálogo activo: **D** (`5d3fd71a8df42ed5b93fdde63ed386e9d776693addd62a30293dbecad7aa56d2`)

Este documento complementa los audits T5.2. Su objetivo es impedir una falsa conclusión: una seed sin productor, consumidor o cierre **no debe cablearse automáticamente** si la escena que debería producirla/consumirla todavía no está canónicamente acreditada.

GitHub, el catálogo ejecutable y CI son la fuente de verdad. Los conteos de snapshots antiguos no deben reutilizarse como si describieran el árbol actual después de T5.10/T5.11.

## Regla operativa

Para cualquier seed pendiente:

1. identificar su owner canónico;
2. comprobar la identidad real de productor/consumidor en el catálogo activo;
3. implementar lifecycle **junto con** la reparación canónica de la escena, nunca en un shell técnico solo para reducir deuda;
4. preservar la lineage sucesiva de `contentIdentity`, history, pending legacy, provenance y RNG;
5. no reinterpretar `npcRefs`, `HAS_SEED_*`, relaciones o access como conocimiento NPC;
6. volver a ejecutar los gates T5.2 después de cada micro-generación funcional;
7. tratar scopes de club/temporada/fecha como obligaciones causales adicionales, no como algo demostrado por una coincidencia de edad.

Regla central: **canon first, wiring second**.

## Baseline compartido ya integrado

El `main` observado ya contiene las piezas transversales que los snapshots iniciales de T5.2 trataban como blockers futuros:

- lifecycle de seeds, presencia y expiración por edad/fecha/scope;
- save schema 8 protegido por fixture read-only;
- Session v3 y `decisionProvenance`;
- migración de contenido explícita y fail-closed;
- lineage multigeneración sucesiva;
- choice eligibility por opción;
- `gateAlternatives` OR a nivel de evento;
- polaridad positiva/negativa/neutral de `HAS_SEED_*`;
- guard de `seedOriginMappings`;
- mandatory phase-transition priority;
- `facts.clubWantsRenewal` como causal fact read-only;
- offer/session bridge con provenance histórica;
- compatibilidad `ENGINE_ONLY_HISTORY`;
- freeze/source evidence post-T5.1;
- conocimiento NPC deny-by-default, transmisión explícita, contactos públicos provenance-safe y reconciliación histórica T5.3.

Por tanto, ya no son válidas referencias antiguas a “esperar a que exista migración”, “esperar choice eligibility”, “esperar OR gates” o “componer #9 con #19”: esas responsabilidades ya forman parte del baseline integrado.

## Catálogo y lineage actuales

Lineage acreditada:

`PRE → B1a → C(T5.10) → D(T5.11)`

Identidades persistibles:

- PRE: `2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff`;
- B1a: `1a8a5e2006fe7160f4fbc02060568d3abec99df038fe3a1a7799c8a0e802eac7`;
- C: `fee2ff875bac7979d3907f5ee1004ef736efa9a257237c6dee629dd8687fe136`;
- D: `5d3fd71a8df42ed5b93fdde63ed386e9d776693addd62a30293dbecad7aa56d2`.

Cada batch posterior debe añadir únicamente la edge adyacente desde el catálogo inmediatamente anterior. No crear shortcuts desde PRE/B1a/C a un target posterior.

### T5.10 — generación C

Integrada por PR #75:

- `EVT_23_BRIDGE_001`;
- `EVT_23_AGT_001`;
- `EVT_23_BODY_001`.

### T5.11 — generación D

Integrada por PR #91:

- `EVT_23_MONEY_001`;
- `EVT_23_HOME_001`;
- `EVT_23_EUR_001`.

Son **6 escenas** funcionales acumuladas de las 12 requeridas para el primer lote oficial 23–26. La micro-generación no equivale a una pasada oficial cerrada.

## Estado T5.2/T5.4 del grafo de consecuencias

PR #94 está integrado en `main` y convierte en consumidores temporales de primera clase tanto las escenas como los efectos directos de simulación.

Guardrails actuales:

- condiciones positivas `HAS_SEED_*` en gates AND;
- rutas OR de `gateAlternatives`;
- exclusions, outcomes y modifiers;
- `choice.eligibility`;
- transiciones terminales `resolve`/`expire`;
- **22 pares archivo+seed** de lecturas directas bajo `src/simulation`;
- **15 seeds únicas** con efecto causal directo de simulación;
- dependencias negativas/neutrales separadas de consumidores vivos;
- hard fail por consumer de simulación sin registrar, registro stale/duplicado, ventana inválida o cadena productor→consumidor completamente imposible.

El baseline de catálogo D validado por Repository Integrity no contiene cadenas runtime completamente imposibles.

### Scope pendiente de integración

El audit actual identifica exactamente una obligación positiva de continuidad de scope:

- `SEED_PRIVATE_CHAT` — `origin_club`;
- productor: `EVT_24_LOCK_001`;
- consumidor: `CEVT_24_CHAT_01`.

PR #99 está **Ready for review**, no integrado. Su CI #917 es verde y añade un ratchet 1:1 entre `scopeProofRequired` y pruebas registradas. Demuestra con contenido real que el callback es alcanzable mientras la seed sigue en el club de origen y deja de serlo después de una transferencia, cuando el sweep la expira con razón `club_scope`.

Hasta que #99 se integre, esa obligación está demostrada en el candidato pero todavía no forma parte del gate permanente de `main`.

## Readiness por owner canónico

| Owner | Estado canónico verificable | Readiness T5.2 |
| --- | --- | --- |
| `t51/canon-18-23` | PR #10 sigue audit-only. Snapshot actual del owner: 63 principales = 21 `verified_same_identity`, 36 `needs_reimplementation`, 6 `canonical_missing`; 32 condicionales = 5 verificadas, 12 a reimplementar, 15 ausentes. Los blockers arquitectónicos compartidos conocidos están resueltos. | **Apto para batches funcionales, no para wiring masivo.** Cada seed debe conectarse dentro de la escena reparada/creada de su batch y atravesar lineage/QA. |
| `t51/canon-23-30` | T5.10 y T5.11 ya modificaron runtime. El cierre documental #77 describe el estado después de C; D añade tres escenas más, pero la reconciliación global 23–30 todavía no se ha regenerado como snapshot post-D. | **En ejecución.** Usar catálogo D y audits actuales, no los viejos conteos de #12/#77 como métricas runtime. No inventar consumidores para las seeds aún abiertas. |
| `t51/canon-30-34` | PR #13 mantiene 27 identidades con semántica de decisión implementada pero todavía bajo gap de parity; 18 identidades desplazadas requieren tratamiento de migración y 5 siguen ausentes. Sus hashes/handoff históricos no autorizan saltar la lineage actual. | **Preparada parcialmente, fuera de turno de integración.** Transition priority y renewal intent ya no son blockers arquitectónicos; siguen pendientes contenido/parity, orden de lineage, condicionales y topología seed canónica. |
| `t51/canon-34plus` | PR #15 mantiene 4 `verified_same_identity`, 3 replacements canónicos y 43/50 principales sin implementación acreditable completa. La retirada tiene trabajo funcional probado, pero debe re-groundearse solo cuando llegue su generación real. | **Bloqueada por orden canónico/lineage y contenido restante.** No adelantar wiring de las 68 seeds históricamente asignadas al bloque solo para reducir deuda. |

## 18–23: qué cambió respecto al snapshot antiguo

El documento anterior hablaba de blockers de Session migration, choice eligibility y OR gates. Ya están integrados.

El owner #10 puede pasar de planning a batches funcionales, pero sus números actuales siguen describiendo **reconciliación**, no una autorización para cablear todas las seeds del tramo. B1a ya integró tres reparaciones de información visible; quedan escenas a reimplementar, escenas ausentes y legacy a retirar de forma compatible.

## 23–30: estado después de T5.10/T5.11

El dato histórico “#12 es audit-only, runtime todavía bloqueado” ya no representa el árbol actual.

Ahora existen seis reparaciones funcionales integradas en C/D. La consecuencia para T5.2 es:

- el grafo debe auditar el contenido activo D después de cada batch;
- los producers/consumers que aparezcan en escenas C/D son evidencia real solo si su transición/guard existe en runtime;
- un `seedsRead` declarado sin efecto causal sigue sin contar como consumidor vivo;
- las 44 condicionales del planning histórico no deben tratarse como 44 callbacks certificados por el mero paso del tiempo;
- exact-ID con semántica distinta sigue necesitando provenance/migration y no puede reinterpretar history antigua.

Blockers compartidos próximos del tramo:

- `EVT_23_LOCK_001`: resolución autoritativa CAPTAIN/STAR (PR #97 en curso);
- `EVT_24_MATCH_001`: micro-resultado deportivo determinista en stream `football` (PR #93 en curso).

Esos PRs entregan infraestructura; no autorizan por sí mismos la escena canónica ni su wiring de seeds.

## 30–34: handoff T5.2 vigente

Las cuatro seeds históricamente identificadas como huérfanas siguen requiriendo sus identidades canónicas correctas antes de considerarse resueltas:

- `SEED_ROLE_COMMUNICATION` → `EVT_30_CCH_001`;
- `SEED_FALSE_ULTIMATUM` → `EVT_30_PRS_001`;
- `SEED_NATIONAL_ABSENCE` → `EVT_30_NAT_002`;
- `SEED_SPECIALIST_BIGCLUB` → `EVT_30_JAN_001`.

PR #13 ya demuestra siete cadenas reales dentro de su candidato:

- `SEED_AGE30_CONTRACT`;
- `SEED_MATCH_SELECTIVITY`;
- `SEED_NATIONAL_PHASEDOWN`;
- `SEED_CAPTAIN_HANDOVER`;
- `SEED_AGENT_LAST_CONTRACT`;
- `SEED_SURGERY_31`;
- `SEED_HOME_RETURN_31`.

Esas cadenas son readiness del owner, no evidencia integrada en `main` mientras #13 siga fuera de turno y sin lineage actualizada.

## 34+, retirada y epílogo

No usar la cantidad histórica de seeds 34+ como instrucción para crearlas al llegar a cierta edad.

Primero debe existir el hecho canónico que origina la memoria. En especial:

- decidir retirarse no equivale a carrera cerrada;
- anunciar no equivale a haber jugado un último partido;
- pedir un último partido no equivale a `RET_LAST_MATCH` hasta existir evidencia factual;
- una oferta posterior a una decisión de retirada no puede fabricar por sí sola una reapertura incompatible con el estado histórico.

La integración 34+ deberá respetar la lineage inmediatamente anterior que exista en ese momento; ningún hash provisional antiguo es una ruta autorizada.

## Frontera T5.2 ↔ T5.3

T5.3 ya está integrado en el baseline y no debe tratarse como un PR futuro que compita por `resolver.ts`.

Contrato vigente:

- una seed puede representar memoria/causalidad del mundo;
- `npcRefs` identifica relación contextual, no conocimiento;
- `HAS_SEED_*` no implica conocimiento;
- relación o access tampoco implican conocimiento;
- aprendizaje NPC exige fuente causal explícita;
- consumir/resolver una seed no informa automáticamente a un NPC;
- informar a un NPC no resuelve automáticamente una seed;
- reconciliación histórica se apoya en provenance/fingerprint, no en igualdad de string ID.

PR #96 propone congelar la semántica histórica de backfill T5.3 v1. Está listo para revisión pero **no está integrado** en este snapshot; T5.2 no debe asumirlo todavía como baseline.

## Qué puede hacerse ya desde T5.2

- mantener el reparto/ownership del catálogo;
- auditar producers, consumers y terminales del árbol ejecutable después de cada generación;
- mantener polaridad y cobertura de simulation consumers;
- comprobar scopes, expiry, save/restore e idempotencia;
- exigir pruebas registradas para scopes locales cuando #99 se integre;
- revisar seed provenance dentro de cada nueva edge de migración;
- entregar gaps concretos a los owners canónicos;
- impedir que una métrica mejore mediante cierres técnicos inventados.

## Criterio de cierre real de T5.2

La infraestructura es madura, pero T5.2 permanece `in_progress` mientras no sea posible clasificar las 210 seeds con evidencia end-to-end.

Cada seed debe quedar en exactamente una categoría justificable:

1. productor + consumidor/cierre canónico implementados;
2. memoria intencionalmente persistente/open-ended con razón canónica explícita;
3. expiración por edad/fecha/club/temporada canónicamente justificada y probada;
4. retirada/deprecación compatible con save/history/provenance.

No se acepta como cierre:

- `resolve`/`expire` arbitrarios;
- enganchar una seed a una escena `engine_only_noncanonical`;
- reescribir history antigua para fabricar una causalidad nueva;
- usar metadata `seedsRead` como si fuese un consumer runtime;
- convertir una dependencia negativa `HAS_SEED_X == false` en consumo vivo;
- inferir conocimiento NPC desde una seed;
- saltarse la lineage sucesiva para integrar un batch.

## Referencias de este snapshot

- `main`: `e48a6c85d0a9e61d88eca121f683dcd308c188c1`;
- catálogo activo: D;
- #75 T5.10: merged;
- #91 T5.11: merged;
- #94 T5.2 simulation seed audit: merged;
- #89 T5.3 reconciliation: merged;
- #99 T5.2 scope proofs: Ready for review, no merge;
- #10 18–23: abierto/audit-only;
- #13 30–34: abierto/draft;
- #15 34+: abierto/aislado;
- #93 football moment hook: abierto;
- #97 locker leadership slots: abierto;
- #96 T5.3 historical backfill freeze: abierto.

Actualizar este snapshot cuando cambie materialmente el catálogo activo, se integre #99 o se incorporen nuevas obligaciones de scope/consumer.