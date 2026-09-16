# T5.3 — NPC, relaciones, memoria y conocimiento

Estado: auditoría inicial + arquitectura mínima en implementación.

Rama de trabajo: `t5/npc-memory`.

## 1. Fuente de verdad inspeccionada

La auditoría parte del código real de `main` en `c28d119` y de la rama T5.3 creada desde ese commit. No se modifica `project/PLAN_PASADAS.md` ni `analysis/2026-09-11/plan-seguimiento.json`.

Archivos principales revisados:

- `src/catalog/npcs.ts`
- `src/core/types.ts`
- `src/core/path.ts`
- `src/content/initial-state.ts`
- `src/narrative/resolver.ts`
- `src/save/validation.ts`
- `src/session/game-session.ts`
- escenas 18–20 usadas como cadena piloto
- `scripts/test-t41.mjs`

## 2. Hallazgos reproducibles previos a T5.3

### D1 — `knowledge` existe pero no tenía ciclo funcional

`NPCState` ya contenía `knowledge` y `memories`, pero el código de producción no escribía conocimiento de NPC. El uso encontrado era esencialmente inicialización y validación del save.

Consecuencia: un NPC podía tener un campo de conocimiento persistente sin que las decisiones del jugador lo poblaran.

### D2 — memoria duplicada sin semántica definida

Existían dos índices distintos:

- `NPCState.memories`;
- `RelationshipState.memories`.

Ninguno tenía productor. T5.3 fija la semántica mínima:

- `NPCState.memories` = hechos que el personaje recuerda;
- `RelationshipState.memories` = subconjunto de esos hechos que son relevantes para su relación con el protagonista.

### D3 — `npcRefs` no equivale a conocimiento

`EventDefinition.npcRefs` expresa personajes relacionados con la escena, no necesariamente testigos ni informados.

Ejemplo canónico de control: `EVT_18_PRE_001` referencia a Nano y Rivas. Si el jugador llama solo a Nano, Rivas no puede adquirir la decisión de forma automática.

Por tanto T5.3 prohíbe inferir conocimiento desde `npcRefs`.

### D4 — el historial del mundo y el conocimiento personal estaban mezclados conceptualmente

`GameState.history` conserva lo que ocurrió. Hasta T5.3 no existía una API que respondiese a la pregunta distinta: «¿este NPC sabe que ocurrió?».

### D5 — no existía gate narrativo por conocimiento

Los gates podían consultar relaciones (`rel.NPC_*.trust`) y estado global, pero no comprobar explícitamente que un NPC conociera un hecho.

### D6 — persistencia de relaciones sí era estructuralmente correcta

Las relaciones viven en `GameState.relationships`; el cambio de `club` no reinicializa esa colección. El defecto no era un reset de club, sino la ausencia de tests que lo fijaran como contrato.

### D7 — privacidad de ViewModel era buena, pero faltaba cubrir conocimiento

`GameSession.getView()` publica los contactos solo como `{id,name,role}` y ya evita agendas privadas. T5.3 añade prueba para garantizar que `knowledge`, `memories`, fiabilidad y estado interno no crucen el ViewModel.

## 3. Arquitectura mínima adoptada

No se crea un simulador cognitivo general.

Se separan tres capas:

1. **Hecho del mundo**: entrada de `history`.
2. **Vía de conocimiento**: regla explícita T5.3 por evento/elección/resultado.
3. **Memoria de NPC**: registro persistente dentro de `NPCState.knowledge`.

Cada registro de conocimiento guarda como mínimo:

- `factId`;
- `eventId`;
- elección y resultado conocidos;
- `learnedAt`;
- fuente (`witnessed`, `informed`, `public`, `reported`);
- certeza 0–100;
- clase de memoria (`strong`, `temporary`, `practical`);
- club/contexto en el momento de aprenderlo;
- caducidad cuando aplica.

Regla de seguridad: **sin regla explícita no se concede conocimiento**.

## 4. Olvido

Clases mínimas:

- `strong`: no caduca por defecto;
- `temporary`: caduca por defecto a 730 días, configurable;
- `practical`: caduca por defecto a 90 días, configurable.

La caducidad afecta a `npcKnows(...)` aunque todavía no se haya podado físicamente el registro. La poda elimina también los índices de memoria correspondientes.

## 5. Relaciones

Se mantienen los cinco ejes ya existentes porque cubren conceptos narrativamente distintos sin añadir variables nuevas:

- `trust` → confianza;
- `affinity` → afecto/cercanía;
- `respect` → respeto profesional/personal;
- `resentment` → conflicto/deuda negativa acumulada;
- `leverage` → poder/deuda/interés instrumental.

No se introduce una barra extra de «lealtad» o «rivalidad»: cuando sea necesario deben derivarse de estos ejes y del historial de hechos recordados.

## 6. Inventario de los 20 NPC

| ID | Identidad / función | Existencia y acceso inicial | Relación inicial relevante | Memoria/conocimiento esperado | Cierres / evolución canónica | Riesgo auditado |
|---|---|---|---|---|---|---|
| NPC_DIR_01 | Marta Valcárcel — Presidenta UDV | UDV; acceso institucional alto | basal 50/50/50, leverage 20 | decisiones de club que presencia o recibe institucionalmente | protectora, rival institucional o salida | no debe conocer conversaciones privadas con agentes |
| NPC_DIR_02 | Óscar Ferrer — Director deportivo | UDV; mercado/contratos | basal por defecto | ofertas, ventas y negociaciones que pasan por su función | puede llegar a club mayor y recordar negociaciones | evitar conocimiento automático de vida privada |
| NPC_CCH_01 | Darío Montalbán — Entrenador | UDV; campo y jerarquía | trust 42, affinity 45, respect 45, leverage 65 | conducta observada, decisiones tácticas comunicadas | consolidar, bloquear o reencontrar | `npcRefs` no prueba que estuviera presente |
| NPC_CCH_02 | Sergio Mena — Segundo entrenador | UDV; campo/datos | 52/52/55, leverage 45 | instrucciones y conducta observada | entrenador principal plausible | separar lo que sabe Mena de lo que sabe Montalbán |
| NPC_ACA_01 | Julián Rivas — Técnico cantera | UDV/cantera | 68/65/76 | conversaciones directas, contexto de cantera | mentor sincero pero sesgado | caso piloto: no conoce la llamada a Nano |
| NPC_MED_01 | Paula Requena — Fisioterapeuta | UDV; acceso médico | basal por defecto | salud conocida por atención directa; confidencial | clave en lesiones/confidencialidad | información médica no debe propagarse por defecto |
| NPC_PLR_10 | Tomás Vela — Capitán | UDV/vestuario | 48/48/50, leverage 45 | códigos de vestuario y hechos observados | mentor, antagonista, técnico o director | recordar rupturas fuertes de código |
| NPC_PLR_11 | Leo Barreiro — Vicecapitán | UDV/vestuario | basal por defecto | conflictos que presencia o le comunican | veterano de referencia | su agenda ya exige memoria de códigos |
| NPC_PLR_12 | Bruno Leal — Titular/rival | UDV/vestuario | 47/52/52 | competencia y acciones compartidas | mentor, bloqueo, venta o rival futuro | no revelar su promesa privada sin fuente |
| NPC_PLR_13 | Mamadou Diarra — Compañero | UDV/vestuario | basal por defecto | información social solo si la recibe | puente de vestuario | especialmente sensible a propagación indebida |
| NPC_PLR_14 | Iván «Nano» Serrano — amigo/canterano | UDV/cantera | trust 74, affinity 82, respect 58 | amistad, promesas, ayudas y comparaciones directas | amistad, rivalidad, caída o carrera paralela | cadena piloto T4.1/T5.3 |
| NPC_PLR_15 | Adrián Costa — rival espejo | UDV/cantera | 42/45/54, resentment 8 | comparaciones que presencia/recibe | rival o aliado | no conocer automáticamente conversaciones con Prisma |
| NPC_AGT_01 | Héctor Salvatierra — agente local | externo; acceso a mercado propio | 35/40/42 | autorizaciones, rechazos y negociaciones directas | primer agente plausible | conversación privada no se comparte con vestuario |
| NPC_AGT_02 | Lucía Falcón — Prisma Sports | externo; red de mercado | 30/35/50 | reuniones y datos de su agencia | ruta de poder | no conocer lo hablado con Héctor salvo vía explícita |
| NPC_PRS_01 | Clara Beltrán — periodista | externo; fuentes/prensa | 35/40/42 | hechos públicos, filtraciones o exclusivas | aliada o relación transaccional | distinguir rumor, fuente y certeza |
| NPC_PRS_02 | Raúl Carrión — locutor | externo; información pública | basal por defecto | hechos publicados, no secretos | amplificador reputacional | nunca usar flags secretos como conocimiento directo |
| NPC_FAM_01 | Elena — madre | familiar; acceso personal si se comunica | 82/90/75 | decisiones familiares y conversaciones directas | apoyo/prudencia | no asumir acceso a vestuario o agente |
| NPC_FAM_02 | Julián — padre | familiar | 78/88/70 | decisiones familiares comunicadas | apoyo/presión/conflicto | idem |
| NPC_FAM_03 | Mara — hermana | familiar/redes | 82/92/68 | información familiar y pública en redes | termómetro social | puede saber fama pública, no secretos contractuales |
| NPC_SOC_01 | Dani Lucas — amigo infancia | social/personal | 78/88/60 | vida social comunicada u observada | apoyo/distracción/vínculo origen | cambio de club reduce frecuencia, no borra relación |

> Los campos `privateAgenda` permanecen estado interno del motor y no conocimiento del protagonista.

## 7. Reglas piloto que T5.3 sí declara explícitamente

Se limita el primer lote para poder auditarlo:

- `EVT_18_PRE_001 / CALL_NANO` → Nano es informado; Rivas no.
- `EVT_18_PRE_001 / CALL_RIVAS` → Rivas es informado; Nano no recibe por defecto el contenido de la llamada.
- `EVT_18_PRE_002` → Vela, Bruno y Paula pueden ser testigos del manejo de carga.
- `EVT_18_PRE_003` → Mena y Bruno conocen la resolución por presencia; Montalbán no se infiere solo porque aparezca en `npcRefs`.
- `EVT_18_AGT_001` → solo el agente o agentes con los que realmente se habla conocen esa conversación.

La extensión al resto de las 388 escenas debe hacerse como reconciliación de contenido, no mediante una regla global de omnisciencia.

## 8. Contrato de tests T5.3

1. NPC con vía de acceso → recuerda.
2. NPC sin acceso → no sabe/no puede gatear reacción.
3. NPC informado después → aprende desde ese momento.
4. Cambio de club → relación no se reinicia.
5. Memoria fuerte → sigue disponible años después.
6. Save/restore → conserva conocimiento.
7. Nueva partida → memoria vacía.
8. Dos NPC → pueden tener certeza/fuente diferente sobre el mismo hecho.
9. Información práctica → caduca.
10. PlayerView → no filtra conocimiento interno.

## 9. Criterio de cierre de esta rama

Para considerar T5.3 preparado hacen falta conjuntamente:

- inventario de 20 NPC trazable;
- API `npcKnows` y adquisición explícita de hechos;
- una ruta declarativa para testigos/informados;
- memoria fuerte y caducable;
- persistencia por save;
- relaciones persistentes tras cambio de club;
- gates de conocimiento posibles sin acceder a estado secreto desde UI;
- tests T5.3 en CI;
- PR abierto contra `main`, sin merge automático.
