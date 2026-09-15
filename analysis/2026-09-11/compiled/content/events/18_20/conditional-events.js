import { ambiguousEvent as E, flag, n, seedCreate, set } from "./helpers.js";
/**
 * Baraja condicional 18–20. Los disparadores/títulos/función proceden del canon.
 * Las opciones son adaptaciones técnicas cuando la tabla canónica describe la escena
 * pero no enumera botones jugables completos.
 */
export const CONDITIONAL_EVENTS_18_20 = [
    E({
        id: "CEVT_18_EARLY_01", ageWindow: [18, 18], family: "conditional", title: "Demasiado pronto",
        body: "Una cuenta nacional recorta una de tus primeras acciones y, de repente, el club recibe llamadas por un jugador que apenas ha empezado.",
        visible: ["Tu acción está circulando fuera del entorno local."], uncertain: ["No sabes cuánto interés es real ni cuánto desaparecerá en días."],
        gates: [{ path: "flags.EARLY_BREAKOUT", op: "eq", value: true }], exclusions: [{ path: "reputation.mediaHeat", op: "lt", value: 12 }],
        tags: ["early", "media", "market"], weight: 5, cooldown: 99999,
        choices: [
            { id: "FEED", label: "Alimentar la ola con alguna aparición", intentTags: ["exposure"], primaryMessage: "La exposición convierte parte del ruido en interés concreto.", secondaryMessage: "La ola crece más rápido que tus minutos y eleva expectativas antes de tiempo.", primaryEffects: [n("reputation.marketHeat", 10), n("reputation.mediaHeat", 7)], secondaryEffects: [n("reputation.mediaHeat", 13), n("narrativePressure.market", 8)] },
            { id: "SHIELD", label: "Blindarte y centrarte en entrenar", intentTags: ["focus"], primaryMessage: "El ruido pierde fuerza sin perjudicar el interés serio.", secondaryMessage: "También desaparecen llamadas que solo existían mientras estabas de moda.", primaryEffects: [n("reputation.mediaHeat", -5)], secondaryEffects: [n("reputation.marketHeat", -4), n("reputation.mediaHeat", -4)] },
            { id: "CLUB", label: "Dejar que el club gestione cualquier contacto", intentTags: ["delegate"], primaryMessage: "El club filtra el ruido y te transmite una oportunidad plausible.", secondaryMessage: "Cedes parte del relato y Ferrer utiliza la atención para reforzar su propia posición.", primaryEffects: [n("reputation.marketHeat", 5)], secondaryEffects: [n("control.career", -4)] }
        ]
    }),
    E({
        id: "CEVT_18_NODEBUT_01", ageWindow: [18, 18], family: "conditional", title: "Enero sin estreno",
        body: "Llega enero sin debut oficial. Rivas te pregunta si entrenar arriba sigue teniendo sentido si no compites de verdad.",
        visible: ["No has debutado y tu rol sigue siendo muy bajo."], uncertain: ["No sabes si una oportunidad puede abrirse justo después del mercado."],
        gates: [{ path: "flags.JAN_NO_DEBUT", op: "eq", value: true }], timeWindow: { months: [1] }, npcRefs: ["NPC_ACA_01", "NPC_CCH_01"], seedsRead: ["SEED_RIVAS_TRUST"], tags: ["no_debut", "route", "modest_route"], weight: 8,
        choices: [
            { id: "LOWER_LOAN", label: "Buscar una cesión donde competir ya", intentTags: ["minutes", "loan"], primaryMessage: "Encuentras un contexto con minutos reales y conservas margen de desarrollo.", secondaryMessage: "Bajas de foco y tardas en adaptarte, aunque al menos vuelves a competir.", primaryEffects: [set("club", "DEVELOPMENT_CLUB"), set("tier", 4), flag("LOAN_ACTIVE", true), n("sport.roleScore", 18)], secondaryEffects: [set("club", "DEVELOPMENT_CLUB"), set("tier", 4), flag("LOAN_ACTIVE", true), n("sport.roleScore", 7), n("reputation.prestige", -3)] },
            { id: "ROLE_TALK", label: "Pedir una conversación clara con Montalbán", intentTags: ["clarity"], primaryMessage: "La conversación concreta qué necesitas para acercarte al equipo.", secondaryMessage: "La respuesta confirma que no hay hueco inmediato y aumenta tu frustración.", primaryEffects: [n("rel.NPC_CCH_01.trust", 4), n("sport.roleScore", 5)], secondaryEffects: [n("rel.NPC_CCH_01.trust", -4)] },
            { id: "PATIENT", label: "Mantener la apuesta hasta final de temporada", intentTags: ["patience"], primaryMessage: "Una baja posterior abre la ventana que enero no ofrecía.", secondaryMessage: "La temporada sigue avanzando sin que la paciencia se convierta en minutos.", primaryEffects: [n("sport.roleScore", 8)], secondaryEffects: [n("control.career", -5)] }
        ]
    }),
    E({
        id: "CEVT_18_BRUNO_01", ageWindow: [18, 19], family: "conditional", title: "La taquilla vacía",
        body: "Bruno se marcha. Su taquilla vacía parece liberar tu sitio, pero el club ya estudia fichar otro extremo.",
        visible: ["Bruno ha sido vendido o cedido."], uncertain: ["No sabes si heredarás minutos o si llegará un sustituto."],
        gates: [{ path: "flags.BRUNO_EXIT", op: "eq", value: true }], npcRefs: ["NPC_PLR_12", "NPC_DIR_02"], seedsRead: ["SEED_BRUNO_FAVOR"], tags: ["bruno", "role", "market"], weight: 6,
        choices: [
            { id: "ASK_ROLE", label: "Preguntar si la salida cambia tu rol", intentTags: ["clarity"], primaryMessage: "El club admite que tendrás una primera oportunidad.", secondaryMessage: "Ferrer evita comprometerse porque ya negocia con otro jugador.", primaryEffects: [n("sport.roleScore", 10)], secondaryEffects: [n("rel.NPC_DIR_02.trust", -2)] },
            { id: "EARN", label: "No pedir nada y competir por el hueco", intentTags: ["competition"], primaryMessage: "El hueco llega al campo y aprovechas parte de él.", secondaryMessage: "Llega un sustituto antes de que la jerarquía cambie de verdad.", primaryEffects: [n("sport.roleScore", 12)], secondaryEffects: [n("sport.roleScore", -3)] },
            { id: "MARKET", label: "Usar el cambio para explorar también tu mercado", intentTags: ["market"], primaryMessage: "La incertidumbre del club te da una pequeña palanca externa.", secondaryMessage: "El mercado interpreta que sigues sin un rol consolidado.", primaryEffects: [n("reputation.marketHeat", 7), n("control.career", 5)], secondaryEffects: [n("reputation.marketHeat", -2)] }
        ]
    }),
    E({
        id: "CEVT_18_VELA_01", ageWindow: [18, 19], family: "conditional", title: "Entrenar aparte",
        body: "El conflicto entre Vela y la dirección escala. El capitán entrena parcialmente aparte y el vestuario observa quién se acerca.",
        visible: ["Vela ha sido apartado parcialmente."], uncertain: ["No conoces todos los motivos ni cuánto durará."],
        gates: [{ path: "flags.VELA_SEPARATED", op: "eq", value: true }], npcRefs: ["NPC_PLR_10", "NPC_PLR_11", "NPC_DIR_02"], seedsRead: ["SEED_VELA_STANCE"], seedsWrite: ["SEED_VELA_STANCE"], tags: ["vela", "locker", "conflict"], weight: 5,
        choices: [
            { id: "PRIVATE", label: "Hablar con Vela en privado sin hacer bandera", intentTags: ["private", "loyalty"], primaryMessage: "Vela aprecia el gesto sin exigirte que tomes partido.", secondaryMessage: "La cercanía llega a dirección y te sitúa en un conflicto que no controlas.", primaryEffects: [n("rel.NPC_PLR_10.trust", 8)], secondaryEffects: [n("rel.NPC_DIR_02.trust", -5)], primarySeedTransitions: [seedCreate("SEED_VELA_STANCE", 62, { separated: "private" })] },
            { id: "DISTANCE", label: "Mantenerte al margen", intentTags: ["distance"], primaryMessage: "El conflicto no te arrastra y nadie exige una postura pública.", secondaryMessage: "Vela guarda la distancia como una pequeña memoria de vestuario.", primaryEffects: [], secondaryEffects: [n("rel.NPC_PLR_10.affinity", -6)], secondarySeedTransitions: [seedCreate("SEED_VELA_STANCE", 58, { separated: "distance" })] },
            { id: "GROUP", label: "Preguntar a Leo cómo está leyendo el grupo la situación", intentTags: ["information"], primaryMessage: "Leo te da contexto suficiente para no actuar a ciegas.", secondaryMessage: "La consulta se interpreta como búsqueda de bando y añade ruido.", primaryEffects: [n("rel.NPC_PLR_11.trust", 6)], secondaryEffects: [n("rel.NPC_PLR_11.trust", -3)] }
        ]
    }),
    E({
        id: "CEVT_18_CCH_01", ageWindow: [18, 19], family: "conditional", title: "Lunes sin entrenador",
        body: "Los malos resultados terminan con Montalbán fuera. Mena puede asumir provisionalmente o puede llegar un técnico externo.",
        visible: ["Montalbán ya no dirige al equipo."], uncertain: ["No sabes si Mena tendrá poder real ni qué idea traerá un sustituto."],
        gates: [{ path: "flags.COACH_FIRED", op: "eq", value: true }], npcRefs: ["NPC_CCH_01", "NPC_CCH_02"], seedsRead: ["SEED_COACH_PUBLIC", "SEED_MENA_EARLY_READ"], tags: ["coach", "change", "role"], weight: 7,
        choices: [
            { id: "MENA", label: "Acercarte a Mena para entender el plan provisional", intentTags: ["information"], primaryMessage: "Mena te explica qué puede cambiar y te da una oportunidad concreta.", secondaryMessage: "La interinidad dura poco y el nuevo técnico reinicia la jerarquía.", primaryEffects: [n("rel.NPC_CCH_02.trust", 6), n("sport.roleScore", 6)], secondaryEffects: [n("sport.roleScore", -2)] },
            { id: "DIRECTOR", label: "Pedir al club claridad sobre el cambio", intentTags: ["institution"], primaryMessage: "Ferrer comparte el calendario real de la búsqueda.", secondaryMessage: "La dirección evita respuestas y tu rol queda más incierto.", primaryEffects: [n("control.career", 4)], secondaryEffects: [n("rel.NPC_DIR_02.trust", -3)] },
            { id: "WAIT", label: "Entrenar y esperar al nuevo técnico", intentTags: ["patience"], primaryMessage: "Llegas al cambio sin haberte atado a ningún bando.", secondaryMessage: "Otros jugadores aprovechan antes la ventana de comunicación.", primaryEffects: [n("reputation.prestige", 1)], secondaryEffects: [n("sport.roleScore", -4)] }
        ]
    }),
    E({
        id: "CEVT_18_RELEG_01", ageWindow: [18, 19], family: "conditional", title: "El día después",
        body: "UDV desciende. El presupuesto cambia, algunos veteranos salen y quedarse puede darte un rol enorme o atraparte un año abajo.",
        visible: ["El descenso es oficial y el club necesita ajustar plantilla."], uncertain: ["No sabes qué jugadores aceptarán salir ni cuál será el proyecto real."],
        gates: [{ path: "flags.UDV_RELEGATED", op: "eq", value: true }], timeWindow: { months: [5, 6, 7] }, npcRefs: ["NPC_DIR_01", "NPC_DIR_02"], seedsRead: ["SEED_EXIT_STYLE_UDV"], tags: ["relegation", "route", "modest_route"], weight: 8,
        choices: [
            { id: "STAY_ROLE", label: "Quedarte si te ofrecen un rol central", intentTags: ["home", "minutes"], primaryMessage: "El descenso abre espacio y te conviertes en una pieza importante.", secondaryMessage: "El rol es mayor, pero el equipo tarda en estabilizarse y pierdes exposición.", primaryEffects: [set("tier", 4), n("sport.roleScore", 18)], secondaryEffects: [set("tier", 4), n("sport.roleScore", 10), n("reputation.prestige", -7)] },
            { id: "EXIT", label: "Buscar salida aprovechando la necesidad de vender", intentTags: ["exit", "market"], primaryMessage: "La necesidad económica facilita una salida limpia a un contexto superior.", secondaryMessage: "El club pide más de lo esperado y el mercado se enfría.", primaryEffects: [set("club", "NEW_CLUB"), set("world.ownerClub", "NEW_CLUB"), set("tier", 3), n("reputation.marketHeat", 7)], secondaryEffects: [n("reputation.marketHeat", -5)] },
            { id: "WAIT", label: "Esperar a ver qué plantilla queda", intentTags: ["wait"], primaryMessage: "Esperar te permite comprobar que el proyecto conserva más nivel del previsto.", secondaryMessage: "Los destinos que tenían hueco cierran antes y reduces tus alternativas.", primaryEffects: [n("control.career", 3)], secondaryEffects: [n("control.career", -5)] }
        ]
    }),
    E({
        id: "CEVT_18_PLAYOFF_01", ageWindow: [18, 19], family: "conditional", title: "Nadie lo esperaba",
        body: "UDV se mete contra pronóstico en un playoff. El éxito colectivo cambia de golpe el valor de quedarse, vender y asumir riesgos.",
        visible: ["El playoff es real y el calendario está definido."], uncertain: ["No sabes si el rendimiento alterará la política de ventas del verano."],
        gates: [{ path: "flags.UDV_PLAYOFF", op: "eq", value: true }], timeWindow: { months: [5, 6] }, tags: ["playoff", "club", "market"], weight: 7,
        choices: [
            { id: "COMMIT", label: "Cerrar cualquier conversación y centrarte en el playoff", intentTags: ["team"], primaryMessage: "El compromiso coincide con una fase final que mejora tu posición interna.", secondaryMessage: "El playoff termina pronto y algunas ventanas externas ya han avanzado.", primaryEffects: [n("sport.roleScore", 10), n("reputation.prestige", 5)], secondaryEffects: [n("reputation.marketHeat", -3)] },
            { id: "QUIET_MARKET", label: "Permitir que tu agente escuche sin interferir", intentTags: ["parallel"], primaryMessage: "Mantienes el foco y llegas al verano con información útil.", secondaryMessage: "Un contacto se conoce y genera preguntas en el peor momento.", primaryEffects: [n("control.career", 5)], secondaryEffects: [n("reputation.mediaHeat", 5)] },
            { id: "DELAY", label: "No decidir nada hasta saber cómo termina", intentTags: ["wait"], primaryMessage: "El resultado del equipo aclara después cuál es tu mejor palanca.", secondaryMessage: "La incertidumbre conserva libertad, pero no conserva todas las ofertas.", primaryEffects: [n("control.career", 2)], secondaryEffects: [n("reputation.marketHeat", -4)] }
        ]
    }),
    E({
        id: "CEVT_19_BIG_01", ageWindow: [19, 19], family: "conditional", title: "El escudo en el móvil",
        body: "Un club grande pregunta por ti. La propuesta habla del futuro y de desarrollo, pero no incluye promesa de primer equipo.",
        visible: ["El interés procede de un club de nivel superior."], uncertain: ["No sabes dónde jugarías realmente la próxima temporada."],
        gates: [{ path: "flags.BIG_CLUB_INTEREST", op: "eq", value: true }, { path: "reputation.marketHeat", op: "gte", value: 42 }], tags: ["elite", "bigearly", "market"], weight: 7,
        choices: [
            { id: "ACCEPT_MODEL", label: "Aceptar el proyecto aunque el primer destino no esté cerrado", intentTags: ["ambition", "bigearly"], primaryMessage: "El club encuentra una cesión coherente y el salto amplía tu techo.", secondaryMessage: "Entras en una estructura potente pero tu camino hacia minutos se vuelve difuso.", primaryEffects: [set("club", "BIG_CLUB"), set("world.ownerClub", "BIG_CLUB"), set("tier", 1), flag("BIG_CLUB", true), flag("LOAN_ACTIVE", true), n("reputation.prestige", 15)], secondaryEffects: [set("club", "BIG_CLUB"), set("world.ownerClub", "BIG_CLUB"), set("tier", 1), set("role", "reserve"), flag("BIG_CLUB", true), n("sport.roleScore", -8), n("reputation.prestige", 12)] },
            { id: "LOAN_PLAN", label: "Exigir un plan de cesión antes de firmar", intentTags: ["clarity", "loan"], primaryMessage: "Aparece un destino claro y decides con mucha más información.", secondaryMessage: "El club no acepta condicionar la operación y mira a otro jugador.", primaryEffects: [n("control.career", 10), flag("BIG_CLUB", true)], secondaryEffects: [n("reputation.marketHeat", -5)] },
            { id: "DECLINE", label: "Rechazar mientras no exista una ruta de minutos", intentTags: ["minutes", "control"], primaryMessage: "Mantienes control y otro proyecto te ofrece una función más concreta.", secondaryMessage: "La gran oportunidad desaparece y no surge una equivalente de inmediato.", primaryEffects: [n("control.career", 10), n("sport.roleScore", 4)], secondaryEffects: [n("reputation.prestige", -2)] }
        ]
    }),
    E({
        id: "CEVT_19_AGENT_01", ageWindow: [19, 19], family: "conditional", title: "Dos versiones del mismo martes",
        body: "Tu agente y otra fuente describen de forma incompatible qué ocurrió con un club interesado. Ninguna versión tiene por qué ser una mentira consciente.",
        visible: ["Las versiones no encajan."], uncertain: ["No sabes si hubo cambio de condiciones, mala comunicación o una omisión interesada."],
        gates: [{ path: "flags.HAS_SEED_AGENT_OMISSION", op: "eq", value: true }, { path: "flags.AGENT_SECOND_DISCREPANCY", op: "eq", value: true }], npcRefs: ["NPC_AGT_01", "NPC_AGT_02", "NPC_PRS_01"], seedsRead: ["SEED_AGENT_OMISSION"], seedsWrite: ["SEED_AGENT_OMISSION"], tags: ["agent", "information", "trust"], weight: 7,
        choices: [
            { id: "AGENT", label: "Aceptar la explicación del agente y seguir", intentTags: ["trust"], primaryMessage: "La explicación resulta compatible con lo que ocurrió y el vínculo se estabiliza.", secondaryMessage: "Más tarde aparece un dato que confirma que faltaba una parte importante.", primaryEffects: [n("control.agentDependency", 4)], secondaryEffects: [n("control.career", -5)], secondarySeedTransitions: [seedCreate("SEED_AGENT_OMISSION", 82, { conditional: "trusted_wrong" })] },
            { id: "SOURCE", label: "Dar más credibilidad a la otra fuente", intentTags: ["skeptic"], primaryMessage: "La duda te permite recuperar información y renegociar límites.", secondaryMessage: "La fuente también había simplificado una negociación que cambió varias veces.", primaryEffects: [n("control.career", 6)], secondaryEffects: [n("rel.NPC_PRS_01.trust", -3)] },
            { id: "EVIDENCE", label: "Pedir cronología y mensajes antes de decidir", intentTags: ["evidence"], primaryMessage: "Los registros aclaran qué sabía cada parte y cuándo.", secondaryMessage: "No obtienes certeza completa, pero dejas claro que el flujo de información será auditado.", primaryEffects: [n("control.career", 8)], secondaryEffects: [n("control.career", 5)] }
        ]
    }),
    E({
        id: "CEVT_19_INJ_01", ageWindow: [19, 19], family: "conditional", title: "El mes que se convierte en cuatro",
        body: "Una lesión que parecía menor evoluciona peor de lo previsto. El historial hacía posible la complicación, pero nadie podía garantizarla.",
        visible: ["La recuperación se ha alargado."], uncertain: ["No sabes cuándo recuperarás el nivel ni cómo reaccionará el mercado."],
        gates: [{ path: "flags.LONG_INJURY", op: "eq", value: true }], npcRefs: ["NPC_MED_01"], seedsRead: ["SEED_BODY_PRECEDENT", "SEED_PHYSIO_CONFIDENCE"], seedsWrite: ["SEED_BODY_PRECEDENT"], tags: ["injury", "rebuild", "body"], weight: 8,
        choices: [
            { id: "CONSERVATIVE", label: "Aceptar una rehabilitación conservadora", intentTags: ["recovery"], primaryMessage: "La progresión lenta reduce riesgo y recuperas estabilidad física.", secondaryMessage: "La recuperación es correcta, pero pierdes una parte importante de la temporada.", primaryEffects: [n("body.risk", -18), n("body.fitness", 8)], secondaryEffects: [n("body.risk", -10), n("sport.roleScore", -7)] },
            { id: "SECOND_OPINION", label: "Buscar una segunda opinión especializada", intentTags: ["information"], primaryMessage: "La revisión modifica el plan y evita seguir una carga que no te convenía.", secondaryMessage: "El diagnóstico esencial coincide y solo has ganado información, no tiempo.", primaryEffects: [n("body.risk", -12), n("control.career", 4)], secondaryEffects: [n("body.risk", -6)] },
            { id: "PUSH_TESTS", label: "Intentar acelerar solo si superas pruebas objetivas", intentTags: ["conditional_risk"], primaryMessage: "Los tests progresan bien y adelantas parte de la vuelta sin recaer.", secondaryMessage: "Los tests muestran que todavía no estás listo y el calendario no se puede forzar.", primaryEffects: [n("body.fitness", 12), n("sport.roleScore", 5)], secondaryEffects: [n("body.risk", -4)] }
        ]
    }),
    E({
        id: "CEVT_19_ABROAD_01", ageWindow: [19, 19], family: "conditional", title: "Tres días fuera",
        body: "Un club de desarrollo extranjero propone una visita de tres días o una negociación acelerada. El rol parece interesante; idioma y distancia son incógnitas reales.",
        visible: ["Conoces club, país y marco deportivo general."], uncertain: ["No sabes cómo encajarás ni si la oportunidad sobrevivirá una negociación lenta."],
        gates: [{ path: "flags.FOREIGN_DEV_INTEREST", op: "eq", value: true }], tags: ["abroad", "market", "journey"], weight: 6,
        choices: [
            { id: "VISIT", label: "Viajar y evaluar el entorno antes de decidir", intentTags: ["information", "abroad"], primaryMessage: "La visita te da información que no aparecía en el dossier y el proyecto encaja.", secondaryMessage: "Descubres fricciones reales y vuelves sin cerrar, pero con más criterio.", primaryEffects: [set("club", "FOREIGN_DEV_CLUB"), set("world.ownerClub", "FOREIGN_DEV_CLUB"), set("tier", 3), flag("ABROAD_ROUTE", true), n("control.career", 5)], secondaryEffects: [n("control.career", 7)] },
            { id: "WRITTEN_ROLE", label: "Pedir primero una definición escrita del rol", intentTags: ["clarity"], primaryMessage: "El club concreta el plan y la propuesta gana credibilidad.", secondaryMessage: "La exigencia enfría una operación que todavía era exploratoria.", primaryEffects: [n("control.career", 7), n("reputation.marketHeat", 3)], secondaryEffects: [n("reputation.marketHeat", -4)] },
            { id: "DECLINE", label: "Descartar la vía extranjera por ahora", intentTags: ["stability"], primaryMessage: "La decisión conserva estabilidad y el mercado doméstico sigue vivo.", secondaryMessage: "La ventana extranjera se cierra y tardará en reaparecer otra similar.", primaryEffects: [n("sport.roleScore", 3)], secondaryEffects: [n("reputation.marketHeat", -3)] }
        ]
    }),
    E({
        id: "CEVT_19_SOCIAL_01", ageWindow: [19, 19], family: "conditional", title: "La captura",
        body: "Una foto o mensaje antiguo reaparece justo cuando tienes más exposición. La imagen no ha cambiado; el contexto sí.",
        visible: ["El contenido es auténtico y antiguo."], uncertain: ["No sabes quién lo ha recuperado ni cuánto recorrido tendrá."],
        gates: [{ path: "flags.NIGHT_PHOTO", op: "eq", value: true }, { path: "reputation.mediaHeat", op: "gte", value: 15 }], npcRefs: ["NPC_PRS_01", "NPC_SOC_01"], seedsRead: ["SEED_DANI_NORMALITY", "SEED_CLARA_CHANNEL"], tags: ["social", "media", "context"], weight: 5,
        choices: [
            { id: "CONTEXT", label: "Dar contexto tú mismo", intentTags: ["public"], primaryMessage: "La explicación limita el recorrido y evita versiones peores.", secondaryMessage: "Responder amplifica una historia que todavía era pequeña.", primaryEffects: [n("reputation.mediaHeat", -4)], secondaryEffects: [n("reputation.mediaHeat", 8)] },
            { id: "IGNORE", label: "No reaccionar", intentTags: ["silence"], primaryMessage: "El tema se consume sin convertirse en noticia mayor.", secondaryMessage: "El vacío deja espacio para una interpretación más agresiva.", primaryEffects: [n("reputation.mediaHeat", -3)], secondaryEffects: [n("reputation.mediaHeat", 7)] },
            { id: "CHANNEL", label: "Pedir a Clara o al club que contraste antes de publicar", intentTags: ["channel"], primaryMessage: "El canal aporta contexto sin ponerte en primer plano.", secondaryMessage: "El intento de ordenar la historia se convierte en parte de la propia noticia.", primaryEffects: [n("rel.NPC_PRS_01.trust", 5)], secondaryEffects: [n("reputation.mediaHeat", 5)] }
        ]
    }),
    E({
        id: "CEVT_19_NANO_01", ageWindow: [19, 19], family: "conditional", title: "No me llames para arreglarme la vida",
        body: "Nano descubre que moviste un contacto por él sin pedir permiso. La oportunidad puede ser buena y, aun así, el gesto puede dolerle.",
        visible: ["Nano sabe que el contacto salió de ti."], uncertain: ["No sabes si su enfado pesa más que el valor profesional de la oportunidad."],
        gates: [{ path: "flags.UNSOLICITED_NANO_HELP", op: "eq", value: true }, { path: "flags.HAS_SEED_NANO_SHADOW", op: "eq", value: true }], npcRefs: ["NPC_PLR_14"], seedsRead: ["SEED_NANO_SHADOW"], seedsWrite: ["SEED_NANO_SHADOW"], tags: ["nano", "friendship", "help"], weight: 7,
        choices: [
            { id: "APOLOGIZE", label: "Explicar por qué lo hiciste y pedir disculpas por no preguntar", intentTags: ["repair"], primaryMessage: "Nano separa el enfado del contacto y acepta que la relación necesita nuevos límites.", secondaryMessage: "La disculpa llega, pero para él confirma que asumiste que sabías qué necesitaba.", primaryEffects: [n("rel.NPC_PLR_14.trust", 8), n("rel.NPC_PLR_14.resentment", -8)], secondaryEffects: [n("rel.NPC_PLR_14.resentment", 4)], primarySeedTransitions: [seedCreate("SEED_NANO_SHADOW", 70, { help: "repaired" })] },
            { id: "DEFEND", label: "Defender que era una oportunidad y no una humillación", intentTags: ["defend"], primaryMessage: "El contacto acaba funcionando y Nano reconoce que la ayuda tenía valor.", secondaryMessage: "Que funcione profesionalmente no arregla la sensación de haber perdido autonomía.", primaryEffects: [flag("NANO_OPPORTUNITY", true), n("rel.NPC_PLR_14.affinity", 3)], secondaryEffects: [flag("NANO_OPPORTUNITY", true), n("rel.NPC_PLR_14.resentment", 10)] },
            { id: "WITHDRAW", label: "Retirar el contacto si todavía es posible y dejar que decida él", intentTags: ["autonomy"], primaryMessage: "Recuperar su control rebaja el conflicto.", secondaryMessage: "Nano aprecia el límite, pero la oportunidad desaparece con él.", primaryEffects: [n("rel.NPC_PLR_14.trust", 6), flag("UNSOLICITED_NANO_HELP", false)], secondaryEffects: [n("rel.NPC_PLR_14.trust", 3), flag("NANO_OPPORTUNITY", false)] }
        ]
    }),
    E({
        id: "CEVT_19_RETURN_01", ageWindow: [19, 19], family: "conditional", title: "Vuelves y nada está igual",
        body: "Termina una cesión y regresas a UDV. Tú has cambiado y la plantilla también; volver no restaura automáticamente la jerarquía anterior.",
        visible: ["Tu préstamo ha terminado y sigues vinculado al club propietario."], uncertain: ["No sabes cómo te compara ahora el cuerpo técnico con quienes ocuparon tu sitio."],
        gates: [{ path: "flags.LOAN_RETURN", op: "eq", value: true }], npcRefs: ["NPC_DIR_02", "NPC_CCH_01", "NPC_CCH_02"], seedsRead: ["SEED_EXIT_STYLE_UDV"], tags: ["return", "loan", "role"], weight: 8,
        choices: [
            { id: "ROLE_MEETING", label: "Pedir una reunión de rol antes de empezar pretemporada", intentTags: ["clarity"], primaryMessage: "La reunión reconoce tu progreso y abre una función distinta.", secondaryMessage: "El club te sigue viendo como activo de rotación y la claridad no mejora el diagnóstico.", primaryEffects: [set("club", "UDV"), flag("LOAN_ACTIVE", false), n("sport.roleScore", 10)], secondaryEffects: [set("club", "UDV"), flag("LOAN_ACTIVE", false), n("sport.roleScore", -2)] },
            { id: "EARN", label: "Volver sin exigir nada y ganarte el sitio", intentTags: ["competition"], primaryMessage: "Tu evolución se nota en el campo y la jerarquía empieza a moverse.", secondaryMessage: "La ausencia creó una estructura nueva y no basta con haber jugado fuera.", primaryEffects: [set("club", "UDV"), flag("LOAN_ACTIVE", false), n("sport.roleScore", 13)], secondaryEffects: [set("club", "UDV"), flag("LOAN_ACTIVE", false), n("sport.roleScore", -4)] },
            { id: "NEW_LOAN", label: "Pedir otra salida si no existe un hueco claro", intentTags: ["loan", "minutes"], primaryMessage: "El club acepta que seguir compitiendo fuera es coherente.", secondaryMessage: "La cadena de préstamos mantiene minutos pero difumina tu lugar institucional.", primaryEffects: [set("club", "DEVELOPMENT_CLUB_2"), flag("LOAN_ACTIVE", true), n("sport.roleScore", 8)], secondaryEffects: [set("club", "DEVELOPMENT_CLUB_2"), flag("LOAN_ACTIVE", true), n("control.career", -4)] }
        ]
    })
];
