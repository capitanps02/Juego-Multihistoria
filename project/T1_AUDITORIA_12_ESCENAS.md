# T1 · Auditoría de doce escenas

Muestra intencional de dos escenas principales por cada uno de los seis tramos. Se incluyen relaciones, lesión, entrenador, prensa, agente, partido, mercado, madurez, contrato y retirada. No es una muestra estadística ni acredita fidelidad de las otras 376 escenas.

Resultado: las doce necesitan alguna reparación. Tres conservan las acciones concretas del guion (convocatoria, aductor y penalti), con diferencias de resolución o contexto. Nueve sustituyen o reducen las acciones. Hay tres candidatos con ID diferente; ninguno se autoriza como alias por esta auditoría. Complejidad M: reparación focalizada; L: depende de lógica de mundo, memoria o acciones diferidas. Esta clasificación estima dificultad, no pasadas consumidas.

Inventario completo de principales: **254**, **167** coincidencias literales y **87** sin el mismo ID. Solo doce están revisados semánticamente. La etiqueta `verified` del motor no sustituye esta revisión.

Los localizadores B pertenecen a la extracción conservada de este DOCX, no son números de página. Las fichas distinguen lo que pide el guion, lo que ejecuta la definición actual y la reparación pendiente.

[Guion extraído](</Users/capitanps/Downloads/multihistoria-engine-v0.8/analysis/2026-09-11/guion-extraido.txt>) · [Definiciones actuales completas](</Users/capitanps/Downloads/multihistoria-engine-v0.8/analysis/2026-09-11/t1/engine-pilot.json>) · [Inventario de 254 principales](</Users/capitanps/Downloads/multihistoria-engine-v0.8/analysis/2026-09-11/t1/principal-traceability.json>)

## P01 · 20.5.1. La lista de 26 — EVT_18_PRE_001

Fuente: B307. Motor: `EVT_18_PRE_001`. Correspondencia: literal_id_semantically_reviewed. Complejidad: M. Reparación: T4.

**Decisiones del guion:** A. Llamar a Nano antes de contestar a nadie y contarle exactamente lo que sabes. B. Llamar a Rivas para preguntar qué espera realmente el primer equipo. C. No llamar a nadie; preparar la maleta y comportarte como si fuese una convocatoria más.

**Disparador del guion:** Inicio de partida. Protagonista convocado para pretemporada; Nano no.

**Memoria del guion:** SEED_RIVAS_TRUST; posible primera variación de SEED_NANO_SHADOW.

**Decisiones actuales:** Llamar a Nano y contarle exactamente lo que sabes / Llamar a Rivas para saber qué espera realmente el primer equipo / No llamar a nadie y tratarlo como una convocatoria más

**Hallazgo:** Conserva las tres acciones, personajes y semillas. Los seis resultados usan pesos fijos 55/45, sin modificadores por afinidad o personalidad como pide el canon.

**Reparación definida:** Conservar escena y opciones; añadir influencia contextual acotada, memoria que pueda reaparecer y una prioridad de inicio comprobable.

**Aceptación futura:**

- Inicio nuevo presenta convocatoria una sola vez antes de escenas que la presuponen.
- Cambiar afinidad/reserva modifica los pesos pertinentes, conservando incertidumbre.
- La llamada a Nano y a Rivas dejan recuerdos distintos y recuperables.

Fuente de implementación: [canonical-events.ts](</Users/capitanps/Downloads/multihistoria-engine-v0.8/src/content/events/18_20/canonical-events.ts:9>)

## P02 · 20.7.2. El aductor — EVT_18_MED_001

Fuente: B353. Motor: `EVT_18_MED_001`. Correspondencia: literal_id_semantically_reviewed. Complejidad: L. Reparación: T4.

**Decisiones del guion:** A. Seguir exactamente el plan de Paula y asumir que quizá no estés disponible. B. Pedir una prueba el sábado y decidir entonces. C. Restar importancia a la molestia y entrenar normal. D. Contárselo solo a Montalbán y dejar que él decida.

**Disparador del guion:** WIN_BODY + oportunidad deportiva.

**Memoria del guion:** SEED_PHYSIO_CONFIDENCE; SEED_BODY_PRECEDENT.

**Decisiones actuales:** Seguir exactamente el plan de Paula / Pedir una prueba el sábado y decidir entonces / Quitar importancia y entrenar normal / Contárselo solo a Montalbán y dejar que él decida

**Hallazgo:** Conserva cuatro acciones y consecuencias específicas. El evento solo exige BODY_WINDOW y meses: no comprueba por sí mismo la oportunidad por sanción. No tiene modificadores de riesgo. Pedir prueba se resuelve inmediatamente y no guarda una cita futura.

**Reparación definida:** Modelar oportunidad deportiva y prueba pendiente, separar molestia de lesión efectiva y contextualizar riesgo y confianza médica.

**Aceptación futura:**

- Sin oportunidad verificada no se afirma que Bruno está sancionado.
- La prueba diferida reaparece en la fecha de juego prevista tras guardar/cargar.
- Arriesgar permite recuperación o empeoramiento según contexto; el mensaje coincide con el cuerpo simulado.

Fuente de implementación: [canonical-events.ts](</Users/capitanps/Downloads/multihistoria-engine-v0.8/src/content/events/18_20/canonical-events.ts:125>)

## P03 · 21.7.1. La promesa de agosto — EVT_20_CCH_001

Fuente: B509. Motor: `EVT_20_CCH_001`. Correspondencia: literal_id_semantically_reviewed. Complejidad: L. Reparación: T5.

**Decisiones del guion:** A. Pedir una conversación inmediata. / B. Esperar tres jornadas. / C. Preguntar al director deportivo, no al técnico. / D. Usar a tu agente para sondear salidas sin confrontar.

**Disparador del guion:** Inicio de temporada; competencia nueva.

**Memoria del guion:** SEED_AGENT_POWER; memoria del técnico.

**Decisiones actuales:** Tomar la iniciativa / Esperar y reunir información / Proteger tu posición / Buscar una solución intermedia

**Hallazgo:** El cuerpo identifica promesa y fichaje, pero hay cuatro opciones genéricas, sin gates para esos antecedentes, NPC ni semilla declarada. La opción B no registra esperar tres jornadas.

**Reparación definida:** Recuperar hablar con técnico, esperar tres jornadas, acudir a dirección y sondear con agente. Registrar promesa, competencia y vencimiento de mercado.

**Aceptación futura:**

- Solo aparece con promesa y competidor pertinentes o contexto adaptado explícito.
- Esperar consume tres jornadas y puede cerrar mercado.
- Técnico, dirección y agente recuerdan acciones diferentes sin conocimiento imposible.

Fuente de implementación: [principal-events.ts](</Users/capitanps/Downloads/multihistoria-engine-v0.8/src/content/events/20_23/principal-events.ts:15>)

## P04 · 21.9.2. La cifra publicada — EVT_21_PRS_001

Fuente: B547. Motor: `EVT_21_PRS_001`. Correspondencia: literal_id_semantically_reviewed. Complejidad: M. Reparación: T5.

**Decisiones del guion:** A. Desmentir con cifra exacta. / B. Negar sin dar números. / C. No corregir. / D. Pedir al club que lo corrija y guardar silencio mientras.

**Disparador del guion:** PUBLIC/NATIONAL_HEAT alto.

**Memoria del guion:** SEED_PUBLIC_CONTRACT; posible SEED_FIRST_LEAK reactivado.

**Decisiones actuales:** Tomar la iniciativa / Esperar y reunir información / Proteger tu posición / Buscar una solución intermedia

**Hallazgo:** Mismo ID y etiqueta verified, pero decisiones y mensajes genéricos. El gate es mediaHeat >=20 y meses fijos; solo declara PUBLIC_CONTRACT, sin lectura de FIRST_LEAK ni NPC.

**Reparación definida:** Recuperar las cuatro posturas de desmentido, noticia con cifra distinta al salario real, atribución incierta y reacción de club/vestuario.

**Aceptación futura:**

- Dar cifra exacta y negar sin cifras generan información pública diferente.
- Pedir corrección al club crea respuesta pendiente y no equivale a publicarla personalmente.
- Una filtración previa modifica contexto o recuerdo sin revelar automáticamente al culpable.

Fuente de implementación: [principal-events.ts](</Users/capitanps/Downloads/multihistoria-engine-v0.8/src/content/events/20_23/principal-events.ts:28>)

## P05 · 22.7.4. La videollamada sin tu agente - EVT_23_AGT_001

Fuente: B648. Motor: `EVT_23_AGT_001`. Correspondencia: literal_id_semantically_reviewed. Complejidad: L. Reparación: T5.

**Decisiones del guion:** A. Aceptar y avisar al agente después. / B. Reenviar el contacto al agente antes de responder. / C. Aceptar con tu agente presente. / D. No responder hasta que haya oferta formal.

**Disparador del guion:** Interés de mercado medio+; contacto informal permitido por reglas internas del universo.

**Memoria del guion:** SEED_DIRECT_RECRUIT (nueva); SEED_AGENT_POWER.

**Decisiones actuales:** Tomar la iniciativa / Esperar y reunir información / Proteger tu posición / Buscar una solución intermedia

**Hallazgo:** Cambia título, usa cuerpo y opciones genéricos, no exige contacto ni interés de mercado. Escribe DIRECT_RECRUIT; no enlaza AGENT_POWER ni identifica interlocutores.

**Reparación definida:** Restituir contacto directo, convocatoria con/sin agente y quién conoce cada conversación. Mantener oportunidad separada de oferta formal.

**Aceptación futura:**

- Aceptar y avisar después difiere de reenviar antes de contestar.
- El agente no recuerda una conversación que aún desconoce.
- No responder mantiene ausencia de compromiso contractual y puede perder oportunidad.

Fuente de implementación: [principal-events.ts](</Users/capitanps/Downloads/multihistoria-engine-v0.8/src/content/events/23_26/principal-events.ts:9>)

## P06 · 22.10.2. El penalti - EVT_24_MATCH_001

Fuente: B714. Motor: `EVT_24_MATCH_001`. Correspondencia: literal_id_semantically_reviewed. Complejidad: L. Reparación: T5.

**Decisiones del guion:** A. Entregarle el balón. / B. Decir que lo tiras tú. / C. Preguntar al capitán/técnico desde el campo. / D. Proponer decidirlo con una regla rápida entre ambos.

**Disparador del guion:** Partido alto + protagonista en campo + confianza suficiente.

**Memoria del guion:** SEED_PENALTY_HIERARCHY (nueva).

**Decisiones actuales:** Entregarle el balón / Decir que lo tiras tú / Preguntar al capitán o técnico desde el campo / Proponer decidirlo con una regla rápida entre ambos

**Hallazgo:** Las cuatro etiquetas sí corresponden al guion, pero el cuerpo es genérico, faltan gates de partido/en campo y los efectos no ejecutan un penalti. Decir que lo tiras tú lleva intentTag patience y mensaje de espera.

**Reparación definida:** Separar decisión de jerarquía, ejecución deportiva con RNG de fútbol e interpretación social con RNG narrativo; corregir intenciones semánticas.

**Aceptación futura:**

- Solo aparece durante un penalti válido estando en campo.
- Puede marcarse o fallarse; un gol no borra el conflicto de jerarquía.
- El resultado del partido y la memoria de PENALTY_HIERARCHY concuerdan tras recargar.

Fuente de implementación: [principal-events.ts](</Users/capitanps/Downloads/multihistoria-engine-v0.8/src/content/events/23_26/principal-events.ts:30>)

## P07 · 23.8.1. Ya no te pagan por potencial - EVT_26_BRIDGE_001

Fuente: B845. Motor: `EVT_26_IDN_001`. Correspondencia: candidate_not_approved. Complejidad: M. Reparación: T5.

**Decisiones del guion:** A. Pedir que definan tu rol, no tu precio. / B. Aceptar el marco y negociar dinero. / C. Preguntar por fichajes previstos en tu posición. / D. No reaccionar y dejar que el mercado hable.

**Disparador del guion:** Inicio de Pasada 5; cualquier estado a 26.

**Memoria del guion:** SEED_PEAK_IDENTITY (nueva); SEED_STAR_COMPETITION.

**Decisiones actuales:** Apostar por el máximo techo / Proteger la posición actual / Ganar control aunque pierdas algo de techo / Mantener varias puertas abiertas

**Hallazgo:** Falta el ID canónico. El candidato comparte edad, tema y PEAK_IDENTITY, pero título, cuerpo y opciones difieren. No es un alias confirmado.

**Reparación definida:** Resolver correspondencia explícita y recuperar reunión sobre rol, dinero, sucesión y mercado. Conservar historia de saves previos.

**Aceptación futura:**

- El cruce a 26 ofrece esta reunión una sola vez sin depender de ganar una lotería ordinaria.
- Pedir rol, negociar dinero y preguntar fichajes cambian información o propuesta distinta.
- Migración o conservación del ID antiguo impide repetición de la misma escena.

Fuente de implementación: [principal-events.ts](</Users/capitanps/Downloads/multihistoria-engine-v0.8/src/content/events/26_30/principal-events.ts:7>)

## P08 · 23.8.2. Campeón aquí, protagonista allí - EVT_26_MKT_001

Fuente: B848. Motor: `EVT_26_MKT_001`. Correspondencia: literal_id_semantically_reviewed. Complejidad: L. Reparación: T5.

**Decisiones del guion:** A. Ir donde serás el centro. / B. Quedarte donde competirás por todos los títulos. / C. Pedir una salida solo si el destino ficha dos refuerzos concretos. / D. Esperar al final de pretemporada.

**Disparador del guion:** ROLE medio/bajo en gran club o MARKET_HEAT suficiente para proyecto central.

**Memoria del guion:** SEED_SHADOW_ESCAPE (nueva); SEED_PROJECT_FACE (nueva); SEED_ELITE_ROLE_BARGAIN.

**Decisiones actuales:** Apostar por el máximo techo / Proteger la posición actual / Ganar control aunque pierdas algo de techo / Mantener varias puertas abiertas

**Hallazgo:** Igual ID, pero título del motor Quieren construir alrededor de ti coincide temáticamente con otra escena del guion. Opciones genéricas, gate de mercado >=42 y efectos de atributos sin traspaso concreto. Falta PROJECT_FACE entre semillas escritas.

**Reparación definida:** Reconciliar con EVT_27_MKT_001 antes de asignar identidad; crear oferta comparativa, condiciones de refuerzos y espera real.

**Aceptación futura:**

- Mostrar destino, rol, salario y ambición conocidos sin garantizar títulos.
- Aceptar mueve club/inscripción/contrato de forma coherente; quedarse no lo hace.
- Exigir refuerzos crea condición comprobable; esperar puede caducar la oferta.

Fuente de implementación: [principal-events.ts](</Users/capitanps/Downloads/multihistoria-engine-v0.8/src/content/events/26_30/principal-events.ts:8>)

## P09 · 24.8.1. La palabra veterano - EVT_30_BRIDGE_001

Fuente: B1048. Motor: `EVT_30_IDN_001`. Correspondencia: candidate_not_approved. Complejidad: M. Reparación: T5.

**Decisiones del guion:** A. Aceptar la gestión si se revisa cada mes. / B. Rechazar cualquier etiqueta y competir como uno más. / C. Pedir qué partidos concretos considera prioritarios. / D. No discutir el término y observar la pretemporada.

**Disparador del guion:** Inicio de Pasada 6; cualquier estado a 30.

**Memoria del guion:** SEED_VETERAN_LABEL (nueva); SEED_AGE30_PRIORITY.

**Decisiones actuales:** Proteger el nivel competitivo / Proteger cuerpo y estabilidad / Adaptar rol y condiciones / Esperar más información

**Hallazgo:** Falta ID canónico; candidato con mismo título y VETERAN_LABEL. Sus opciones genéricas no conservan revisión mensual ni partidos prioritarios; no declara AGE30_PRIORITY.

**Reparación definida:** Fijar correspondencia sin reinterpretar historia; representar plan de uso, objeción a etiqueta, petición concreta y observación.

**Aceptación futura:**

- Al cumplir 30 no se salta el puente por la cuota de eventos ordinarios.
- La revisión mensual se recuerda; el plan puede proteger o reducir rol.
- Los datos del hito a 30 no se reescriben al retirarse.

Fuente de implementación: [principal-events.ts](</Users/capitanps/Downloads/multihistoria-engine-v0.8/src/content/events/30_34/principal-events.ts:5>)

## P10 · 24.11.1. Volver sin ritmo - EVT_31_RETURN_001

Fuente: B1129. Motor: `EVT_31_RETURN_001`. Correspondencia: literal_id_semantically_reviewed. Complejidad: L. Reparación: T5.

**Decisiones del guion:** A. Pedir entrar ya aunque sea pocos minutos. / B. Jugar primero con filial/amistoso si existe. / C. Esperar dos semanas completas. / D. Dejar al staff decidir sin presión.

**Disparador del guion:** Retorno de lesión.

**Memoria del guion:** SEED_COMEBACK_PACING (nueva); SEED_SURGERY_31.

**Decisiones actuales:** Proteger el nivel competitivo / Proteger cuerpo y estabilidad / Adaptar rol y condiciones / Esperar más información

**Hallazgo:** Título coincide pero cuerpo y opciones son genéricos. RECOVERING_INJURY no prueba por sí mismo alta médica y preparación. Fija meses y crea COMEBACK_PACING sin lectura de SURGERY_31.

**Reparación definida:** Distinguir alta, ritmo, recaída, vuelta progresiva y decisión del staff. Activar por retorno real y ofrecer filial/amistoso solo si existe.

**Aceptación futura:**

- No se presenta como alta con lesión incompatible con jugar.
- Esperar dos semanas de juego cambia calendario y conserva la decisión pendiente.
- Preparación y carga afectan la vuelta; cirugía previa tiene consecuencia reconocible.

Fuente de implementación: [principal-events.ts](</Users/capitanps/Downloads/multihistoria-engine-v0.8/src/content/events/30_34/principal-events.ts:25>)

## P11 · 25.6.8. La cláusula de salida digna - EVT_34_CON_001

Fuente: B1267. Motor: `EVT_34_CON_001`. Correspondencia: literal_id_semantically_reviewed. Complejidad: L. Reparación: T5.

**Decisiones del guion:** A. Aceptarla. / B. Pedir que sea bilateral. / C. Cambiar a un año sin cláusula. / D. Rechazar y buscar seguridad total.

**Disparador del guion:** Oferta multianual 34+.

**Memoria del guion:** SEED_DIGNIFIED_EXIT_CLAUSE (nueva); SEED_AGE30_CONTRACT.

**Decisiones actuales:** Proteger el rol / Aceptar una adaptación / Priorizar el cuerpo / Explorar el mercado

**Hallazgo:** Mismo ID, título Un año o dos, cuerpo genérico y cuatro prioridades. Solo exige seguir jugando. No hay oferta multianual, cláusula, NPC ni semillas y cada elección tiene un resultado determinista genérico.

**Reparación definida:** Implementar oferta y cláusula de salida, contraoferta bilateral, alternativa anual y rechazo. Diferenciar firmar condiciones de su desenlace futuro.

**Aceptación futura:**

- Solo aparece con oferta multianual que contiene cláusula identificable.
- Bilateral y unilateral conceden derechos distintos; rechazar no firma nada.
- Una caída posterior de rol ejecuta o no la cláusula según términos, dejando memoria y epílogo.

Fuente de implementación: [principal-events.ts](</Users/capitanps/Downloads/multihistoria-engine-v0.8/src/content/events/34_plus/principal-events.ts:21>)

## P12 · 25.12.6. El último partido no está garantizado - EVT_RET_LASTMATCH_001

Fuente: B1405. Motor: `EVT_RET_LAST_001`. Correspondencia: candidate_not_approved. Complejidad: L. Reparación: T5.

**Decisiones del guion:** A. Pedir jugar si estás médicamente apto. / B. Aceptar decisión técnica. / C. Pedir unos minutos solo si el marcador lo permite. / D. No arriesgar lesión por ceremonia.

**Disparador del guion:** Retirada anunciada + final de temporada.

**Memoria del guion:** SEED_LAST_MATCH_SHAPE (nueva); SEED_FAREWELL_CONTROL_FINAL.

**Decisiones actuales:** Jugar si el cuerpo y el entrenador lo permiten / Aceptar que quizá no haya despedida

**Hallazgo:** Falta ID canónico; candidato de mismo título reduce cuatro opciones a dos. PLAY activa LAST_MATCH_PLAYED y cierra carrera directamente sin comprobar disponibilidad o decisión del entrenador en la resolución.

**Reparación definida:** Restituir petición condicionada, aceptación técnica, minutos según marcador y renuncia por lesión; separar solicitud, autorización, partido y cierre.

**Aceptación futura:**

- Pedir jugar estando no apto no garantiza participación ni gol.
- Probar despedida completa, pocos minutos y ninguna participación con sus condiciones.
- Cada cierre permite epílogo coherente, sin perder resultado tras interrupción.

Fuente de implementación: [principal-events.ts](</Users/capitanps/Downloads/multihistoria-engine-v0.8/src/content/events/34_plus/principal-events.ts:103>)

## Decisión para los lotes

No convertir 388 títulos en 388 escenas terminadas. Cada lote deberá dejar decisiones, condiciones, consecuencias y memoria comprobadas. Si requiere un subsistema nuevo, se separa la pasada de infraestructura y se reduce el lote; no se genera una plantilla genérica para mantener la cifra. T1 solo auditó: el ritmo de implementación se medirá con el primer lote de T4.
