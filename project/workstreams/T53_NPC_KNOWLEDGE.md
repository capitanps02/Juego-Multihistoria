# T5.3 — NPC, relaciones, memoria y conocimiento

Estado: técnicamente preparado para revisión/integración; `Repository integrity` completo en verde sobre el merge candidate actual.

Rama de trabajo: `t5/npc-memory`.

## 1. Fuente de verdad inspeccionada

La auditoría parte del código real del repositorio y de la rama T5.3, contrastada además contra el `main` vigente mediante el merge ref del PR. No se modifica `project/PLAN_PASADAS.md` ni `analysis/2026-09-11/plan-seguimiento.json`.

Archivos principales revisados:

- `src/catalog/npcs.ts`
- `src/core/types.ts`
- `src/core/path.ts`
- `src/content/initial-state.ts`
- `src/narrative/resolver.ts`
- `src/narrative/scheduler.ts`
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
| NPC_PLR_13 | Mamadou Diarra — Compañero | UDV/vestuario | basal por defecto | información social solo si la recibe | puente de vestuario | actualmente sin eventos/seeds referenciados |
| NPC_PLR_14 | Iván «Nano» Serrano — amigo/canterano | UDV/cantera | trust 74, affinity 82, respect 58 | amistad, promesas, ayudas y comparaciones directas | amistad, rivalidad, caída o carrera paralela | cadena piloto T4.1/T5.3 |
| NPC_PLR_15 | Adrián Costa — rival espejo | UDV/cantera | 42/45/54, resentment 8 | comparaciones que presencia/recibe | rival o aliado | no conocer automáticamente conversaciones con Prisma |
| NPC_AGT_01 | Héctor Salvatierra — agente local | externo; acceso a mercado propio | 35/40/42 | autorizaciones, rechazos y negociaciones directas | primer agente plausible | conversación privada no se comparte con vestuario |
| NPC_AGT_02 | Lucía Falcón — Prisma Sports | externo; red de mercado | 30/35/50 | reuniones y datos de su agencia | ruta de poder | no conocer lo hablado con Héctor salvo vía explícita |
| NPC_PRS_01 | Clara Beltrán — periodista | externo; fuentes/prensa | 35/40/42 | hechos públicos, filtraciones o exclusivas | aliada o relación transaccional | distinguir rumor, fuente y certeza |
| NPC_PRS_02 | Raúl Carrión — locutor | externo; información pública | basal por defecto | hechos publicados, no secretos | amplificador reputacional | nunca usar flags secretos como conocimiento directo |
| NPC_FAM_01 | Elena — madre | familiar; acceso personal si se comunica | 82/90/75 | decisiones familiares y conversaciones directas | apoyo/prudencia | no asumir acceso a vestuario o agente |
| NPC_FAM_02 | Julián — padre | familiar | 78/88/70 | decisiones familiares comunicadas | apoyo/presión/conflicto | idem |
| NPC_FAM_03 | Mara — hermana | familiar/redes | 82/92/68 | información familiar y pública en redes | termómetro social | actualmente sin eventos/seeds referenciados |
| NPC_SOC_01 | Dani Lucas — amigo infancia | social/personal | 78/88/60 | vida social comunicada u observada | apoyo/distracción/vínculo origen | cambio de club reduce frecuencia, no borra relación |

> Los campos `privateAgenda` permanecen estado interno del motor y no conocimiento del protagonista.

## 7. Defectos funcionales corregidos y regresiones

### D8 — callback de Nano podía reaccionar por flags sin saber el hecho

`CEVT_19_NANO_01` afirma que Nano descubre que moviste un contacto por él. Antes, `UNSOLICITED_NANO_HELP` y `SEED_NANO_SHADOW` bastaban para que el callback apareciera aunque `NPC_PLR_14` no tuviera conocimiento personal del hecho.

Corrección:

- `EVT_19_TEAM_001/MOVE_CONTACT__SECONDARY` registra que Nano se entera, con fuente `reported` y memoria fuerte;
- el scheduler exige que `NPC_PLR_14` conozca `EVT_19_TEAM_001` para `CEVT_19_NANO_01`;
- si se elimina solo conocimiento y memoria de Nano, conservando flags y seed, el callback ya no se agenda.

### D9 — resultados que verbalizan memoria/descubrimiento sin registro epistemológico

La auditoría T5.3 detecta outcomes cuyo copy contiene términos explícitos como `descubre`, `recuerda`, `sabe` o `detecta`, que además cambian una relación con un NPC, pero carecen de vía de conocimiento.

La primera pasada estricta detectó nueve candidatos. Tras revisión semántica:

- ocho eran conocimiento real del NPC y ahora tienen regla explícita de fuente/memoria;
- uno (`EVT_19_AGENT_001/AUDIT__SECONDARY`) era un falso positivo: «la revisión descubre más lagunas» describe conocimiento nuevo del protagonista, no del agente. La excepción queda declarada con motivo y el auditor falla si deja de corresponder a contenido real.

Una segunda pasada amplió el vocabulario a `memoria` y `olvida` y añadió un lint específico de callbacks condicionales con un único NPC identificable. Detectó dos defectos adicionales, ambos reales:

- `CEVT_18_VELA_01/DISTANCE__SECONDARY`: el propio copy dice que Vela guarda la distancia como memoria de vestuario;
- `EVT_19_JAN_001/FORCE_EXIT__SECONDARY`: la salida forzada deja memoria institucional y penaliza la relación con Ferrer.

Los diez casos outcome-specific reparados registran conocimiento únicamente cuando el texto demuestra que el NPC conoce o conserva el hecho; el resultado alternativo no concede esa memoria. El lint de callbacks no deja gaps pendientes.

### D10 — una transferencia podía etiquetar la memoria con el club de destino

T5.2 aplica correctamente el cambio de club y el scope de seeds antes de que T5.3 registre conocimiento. Sin una separación explícita de contextos, una escena como `EVT_19_JAN_001/FORCE_EXIT__SECONDARY` podía dejar a Ferrer recordando un conflicto ocurrido en UDV con `club: NEW_CLUB`.

Corrección:

- `rememberNpcFactInPlace` acepta un club de aprendizaje explícito;
- el resolver conserva `previousClub` como contexto de la escena y lo pasa al registro de conocimiento;
- una información comunicada posteriormente sigue usando el club actual, porque en ese caso el momento de aprendizaje sí es posterior;
- la regresión exige que, tras la salida a `NEW_CLUB`, la memoria de Ferrer sobre `EVT_19_JAN_001` conserve `club: UDV`.

### D11 — una fuente NPC podía transmitir un hecho que no conocía

La API de información posterior aceptaba `sourceNpcId` como trazabilidad, pero no comprobaba que el supuesto informante conociera el hecho. Eso permitía construir una cadena causal falsa: por ejemplo, Nano conoce `EVT_18_PRE_001`, Rivas no, pero se podía declarar a Rivas como fuente de un reporte a Montalbán.

Corrección:

- `sourceNpcId` deja de ser una etiqueta pasiva: cuando existe, el NPC fuente debe satisfacer `npcKnows(state, sourceNpcId, factId)` en la fecha de transmisión;
- el invariante se aplica en `rememberNpcFactInPlace`, el punto real de escritura, por lo que no puede eludirse llamando directamente a la API de bajo nivel;
- una fuente cuyo conocimiento ya ha caducado tampoco puede seguir transmitiéndolo como conocimiento válido;
- una fuente inexistente o el propio destinatario como fuente se rechazan antes de mutar estado;
- `public` y `witnessed` no admiten `sourceNpcId`;
- la certeza del receptor no puede superar la certeza de la fuente;
- la versión transmitida (`eventId`, `choiceId`, `outcomeId`) es la que conoce la fuente, no la verdad omnisciente de `history`;
- una transmisión legítima Nano → Rivas continúa funcionando y no consume RNG;
- un rumor/claim no verificado no se modela como `knowledge`; si se añade en el futuro deberá ser un estado separado que no satisfaga gates `know.*`.

### D12 — callbacks que nombran un NPC pero no declaran `npcRefs`

La tercera pasada de auditoría busca menciones textuales inequívocas de NPC persistentes dentro de callbacks y las compara con `npcRefs`. Es una advertencia de trazabilidad, no un gate: T5.3 no puede adjuntar de forma segura un requisito epistemológico si el propio contenido no declara qué NPC participa.

Se detectan 15 callbacks:

- `CEVT_18_EARLY_01` → Ferrer;
- `CEVT_18_CCH_01` → Ferrer;
- `CEVT_20_BRUNO_01` → Bruno;
- `CEVT_23_RIVAS_02` → Rivas;
- `CEVT_23_MENA_02` → Mena;
- `CEVT_23_VELA_02` → Vela;
- `CEVT_23_BRUNO_03` → Bruno;
- `CEVT_23_NANO_02` → Nano;
- `CEVT_23_MED_02` → Paula;
- `CEVT_26_RIVAS_01` → Rivas;
- `CEVT_27_NANO_01` → Nano;
- `CEVT_27_RECORD_01` → Adrián;
- `CEVT_29_RECORD_02` → Adrián;
- `CEVT_30_RIVAL_01` → Adrián;
- `CEVT_31_RIVAS_01` → Rivas.

Catorce están marcados `technical_adaptation`; `CEVT_29_RECORD_02` está `verified`. T5.3 **no modifica esas filas**: añadir `npcRefs` desde este workstream invadiría los bloques canónicos T5.1 y puede alterar `contentIdentity`. El auditor las deja visibles en `textualNpcMentionsMissingRefs` para reconciliación por sus propietarios.

### D13 — reaprender un hecho podía degradar un recuerdo ya fuerte

`rememberNpcFactInPlace` sustituía el registro completo. Por tanto un hecho aprendido con memoria `strong` y certeza alta podía recibir más tarde una versión `practical` de baja certeza y quedar artificialmente debilitado o incluso caducar.

Corrección:

- mientras `npcKnows(...)` siga siendo verdadero para el `factId`, reaprender **la misma versión epistemológica** es refuerzo, no sustitución;
- la certeza solo puede mantenerse o aumentar;
- la clase de memoria solo puede mantenerse o subir (`practical < temporary < strong`);
- una caducidad no puede acortarse y una memoria `strong` no recupera caducidad;
- se conserva la procedencia del primer aprendizaje vigente (`learnedAt`, `source`, `club`);
- si el recuerdo ya caducó, un aprendizaje posterior sí crea un registro fresco con nueva fecha, fuente y contexto.

### D14 — una versión contradictoria podía reforzar una creencia distinta

Un `factId` activo podía recibir una nueva fila con `choiceId/outcomeId` incompatibles y, aun así, usar esa nueva certeza o durabilidad para reforzar el registro anterior. Eso mezclaba dos versiones subjetivas distintas.

Corrección:

- el refuerzo activo exige coincidencia de `eventId`, `choiceId` y `outcomeId`;
- una versión B contradictoria no aumenta certeza, no sube la clase de memoria y no amplía la caducidad de la versión A;
- mientras no exista un modelo explícito de claims/rumores contradictorios, la creencia activa se conserva intacta;
- una regresión separa este caso del refuerzo legítimo de la misma versión.

### D15 — T5-QA-008: `knowledge` persistido semánticamente inválido podía parecer conocimiento

La validación general de save garantiza que `knowledge` sea un objeto serializable, pero eso no implica que cada fila interna cumpla el contrato epistemológico. El probe QA independiente demostró que una fila con, por ejemplo, `source: "telepathy"` podía atravesar el load estructural.

Corrección sin cambiar schema 8 ni migraciones:

- `getNpcKnowledgeRecord(...)` valida la semántica de la fila antes de exponerla;
- `npcKnows(...)` nunca acepta una fila inválida;
- se validan source/memory, certeza 0–100, fechas ISO, `factId` coherente con la clave, expiración y procedencia `sourceNpcId`;
- una fila bruta inválida puede seguir existiendo en un save compatible, pero no concede conocimiento ni satisface gates `know.*`.

## 8. Trazabilidad y cobertura real

`scripts/audit-t53.mjs` deriva la trazabilidad desde los catálogos compilados, no desde esta tabla manual:

- 20 NPC;
- 388 eventos;
- 210 seeds;
- referencias NPC desconocidas: 0;
- reglas de conocimiento inválidas: 0;
- requisitos de conocimiento inválidos: 0;
- gaps epistemológicos de outcomes tras revisión: 0;
- gaps epistemológicos de callbacks con NPC identificable: 0;
- excepciones semánticas revisadas: 1, con control contra excepciones obsoletas;
- callbacks con mención textual de NPC pero sin `npcRefs`: 15, reportados como deuda no bloqueante de reconciliación canónica.

Inconsistencia canónica/contenido preservada como hallazgo, no reparada inventando escenas:

- `NPC_PLR_13` (Mamadou Diarra) no tiene actualmente evento ni seed que lo referencie;
- `NPC_FAM_03` (Mara) no tiene actualmente evento ni seed que la referencie.

Ambos existen y persisten en `GameState`, pero el runtime actual no ofrece material canónico para demostrar memoria o reaparición. T5.3 no los convierte artificialmente en protagonistas recurrentes; su incorporación futura debe venir de reconciliación canónica autorizada.

## 9. Tests y gate de integración

La suite dirigida cubre el contrato pedido y regresiones adicionales:

1. NPC presencia un hecho → puede recordarlo;
2. NPC sin acceso → no sabe ni reacciona;
3. información posterior → aprende desde ese momento y no consume RNG;
4. relación persiste tras cambio de club;
5. recuerdo fuerte sigue disponible años después;
6. save/restore conserva conocimiento y relación;
7. partida nueva no hereda memoria;
8. dos NPC pueden conocer versiones distintas;
9. información práctica caduca y puede podarse;
10. `PlayerView` no filtra estado interno;
11. Nano solo aprende la ayuda no solicitada en el outcome donde realmente se entera;
12. flags + seed no bastan para su callback sin conocimiento personal;
13. una cadena reportada exige que el NPC fuente conozca el hecho;
14. un retry del mismo `commandId` no reaprende, no reescribe `learnedAt` y no altera RNG/estado;
15. la API de escritura directa tampoco admite una fuente NPC ignorante;
16. una fuente cuyo conocimiento ha caducado no puede seguir propagándolo;
17. reaprender la misma versión vigente solo puede reforzar certeza/durabilidad, nunca degradarlas;
18. un hecho ya caducado sí puede reaprenderse con un contexto nuevo;
19. diez descubrimientos/memorias explícitos de contenido crean memoria únicamente en el outcome revelador, nunca en el alternativo;
20. una escena que cambia de club conserva en la memoria del NPC el club donde el hecho fue aprendido;
21. una cadena NPC→NPC no amplifica la certeza de la fuente;
22. una transmisión NPC→NPC conserva la versión subjetiva de la fuente y no consulta `history` para corregirla;
23. una versión contradictoria activa no refuerza la creencia vigente;
24. `knowledge` persistido malformado no satisface `npcKnows`.

`npm test` ejecuta conjuntamente los gates T5.2 ya integrados en `main` y la auditoría y suites T5.3. El workflow `Repository integrity` ejecuta además freeze pre-T5.1, determinismo/RNG, límites de edad, referencias, carreras largas, lifecycle, probes cross-workstream y simulación estratificada.

### Evidencia de CI

Head de código validado antes de esta actualización documental: `bd067e06c825894fbbce387b2701f0e54ed4a988`.

`Repository integrity` run **#475** (`35112323953`): **SUCCESS**.

Pasaron conjuntamente:

- `npm test`, incluidas las suites T5.2, save compatibility y T5.3;
- auditoría T5.3;
- T5-QA-008 de conocimiento persistido malformado;
- freeze pre-T5.1;
- determinismo y aislamiento RNG;
- límites de edad;
- referencias de contenido;
- carreras largas;
- lifecycle audit;
- probes de integración cross-workstream;
- simulación estratificada.

El `main` vigente en esa validación es `cd39dfc387713ee43cd5b80c34a0e32a0cc996c0`, que hace el gate v8 de solo lectura y bloquea la huella exacta del fixture. La rama figura por detrás en historial, pero `compare main...t5/npc-memory` muestra que las únicas diferencias efectivas de árbol son los 11 archivos del workstream T5.3; no falta contenido efectivo de `main`.

PR #19 sigue abierto y no es ya un bloqueo técnico para que #9 valide contra el `main` actual: #9 pasa también los probes cross-workstream sin #19 integrado. Cuando #19 se integre, el integrador deberá preservar simultáneamente el hardening de seeds y estas invariantes epistemológicas; no se debe asumir que una seed viva, `HAS_SEED_*` o `npcRefs` equivalen a conocimiento NPC.

## 10. Frontera con presentación

`PlayerView.contacts` publica actualmente las 20 identidades básicas `{id,name,role}` y un test compartido exige esas 20 entradas. T5.3 garantiza que no se exponen `knowledge`, `memories`, agendas privadas ni ejes internos.

T5.3 no redefine unilateralmente “contacto conocido por el protagonista”: esa política necesita una señal canónica/presentación explícita y no debe inferirse desde `npcRefs`, relación o conocimiento.

## 11. Estado de cierre técnico

T5.3 queda **técnicamente preparado para revisión/integración**, con estas precisiones:

- la arquitectura continúa siendo `deny-by-default`;
- no se infiere conocimiento desde `npcRefs`;
- `NPCState.access` permanece metadata legado y no se usa como probabilidad implícita de conocimiento;
- el contenido sin vía explícita no concede conocimiento;
- un `sourceNpcId` solo puede transmitir un `factId` que conozca y que siga vigente;
- la certeza transmitida nunca supera la de la fuente y se conserva la versión subjetiva del informante;
- el reaprendizaje de la misma versión vigente es monótono: nunca reduce certeza ni durabilidad;
- una versión contradictoria activa no refuerza ni reescribe la versión vigente;
- conocimiento persistido semánticamente inválido no satisface `npcKnows`;
- los 15 callbacks con NPC nombrado pero sin `npcRefs` quedan explícitamente derivados para reconciliación canónica, sin tocar contenido desde T5.3;
- no se ha añadido contenido canónico para Mamadou ni Mara;
- la cobertura futura puede declarar nuevas vías de conocimiento cuando el canon demuestre testigo, comunicación o publicación;
- no se ha modificado `project/PLAN_PASADAS.md` ni `analysis/2026-09-11/plan-seguimiento.json`.

El PR debe ser revisado por el integrador y **no debe auto-mergearse**.