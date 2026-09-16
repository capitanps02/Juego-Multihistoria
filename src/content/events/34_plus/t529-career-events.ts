import type { Condition, Effect, EventDefinition, EventFamily } from "../../../core/types.js";
import type { OfferDisposition } from "../../../simulation/offers.js";
import { ambiguousEvent, flag, n, seedCreate, set } from "../18_20/helpers.js";

type ChoiceSpec = {
  label: string;
  intentTags: string[];
  stance: string;
  primaryMessage: string;
  secondaryMessage: string;
  primaryEffects?: Effect[];
  secondaryEffects?: Effect[];
};

type SceneSpec = {
  id: string;
  family: EventFamily;
  title: string;
  body: string;
  visible: string[];
  uncertain: string[];
  choices: [ChoiceSpec, ChoiceSpec, ChoiceSpec, ChoiceSpec];
  months: number[];
  gates?: Condition[];
  gateAlternatives?: Condition[][];
  seedsRead: string[];
  seedWrite: string;
  npcRefs?: string[];
  offerActions?: Record<string, OfferDisposition>;
};

const playingGate: Condition = { path: "retirement.status", op: "eq", value: "playing" };

function veteranScene(spec: SceneSpec): EventDefinition {
  const event = ambiguousEvent({
    id: spec.id,
    ageWindow: [34, 34],
    phase: "34_plus",
    family: spec.family,
    title: spec.title,
    body: spec.body,
    visible: spec.visible,
    uncertain: spec.uncertain,
    choices: spec.choices.map((choice, index) => ({
      id: String.fromCharCode(65 + index),
      label: choice.label,
      intentTags: choice.intentTags,
      primaryMessage: choice.primaryMessage,
      secondaryMessage: choice.secondaryMessage,
      primaryEffects: choice.primaryEffects ?? [],
      secondaryEffects: choice.secondaryEffects ?? [],
      primarySeedTransitions: [seedCreate(spec.seedWrite, 62, { stance: choice.stance })],
      secondarySeedTransitions: [seedCreate(spec.seedWrite, 52, { stance: choice.stance })]
    })),
    gates: [playingGate, ...(spec.gates ?? [])],
    gateAlternatives: spec.gateAlternatives,
    timeWindow: { months: spec.months },
    weight: 24,
    cooldown: 99999,
    seedsRead: spec.seedsRead,
    seedsWrite: [spec.seedWrite],
    npcRefs: spec.npcRefs,
    tags: ["veteran_career", "age34", "t5_29", "no_auto_retirement"],
    canonStatus: "verified"
  });

  if (!spec.offerActions) return event;
  return Object.assign(event, { offerBridge: { choiceActions: spec.offerActions } });
}

const BRIDGE = veteranScene({
  id: "EVT_34_BRIDGE_001",
  family: "contract",
  title: "La reunión sin horizonte",
  body: "Tu club evita hablar de «último contrato»: propone un año y revisar en marzo. Tú quieres saber si de verdad cuentan contigo.",
  visible: ["Ves el rol previsto, el salario y el calendario de conversaciones."],
  uncertain: ["El club puede estar siendo prudente, preparando la sucesión o esperando comprobar cómo responde tu cuerpo."],
  months: [6, 7, 8],
  gates: [{ path: "market.pending.reason", op: "eq", value: "Veteran renewal: one-year review" }],
  seedsRead: ["SEED_AGE34_PRIORITY"],
  seedWrite: "SEED_AGE34_REALITY",
  offerActions: { A: "accept", B: "counter", C: "defer", D: "reject" },
  choices: [
    { label: "Firmar un año sin más", intentTags: ["security", "continuity"], stance: "one_year_accept", primaryMessage: "Aceptas el año y conservas continuidad, sin comprar una promesa de jerarquía futura.", secondaryMessage: "La continuidad llega con menos claridad de la esperada sobre marzo y sobre tu rol real.", primaryEffects: [n("professional.environmentStability", 4)], secondaryEffects: [n("professional.environmentStability", 2), n("professional.roleSecurity", -2)] },
    { label: "Exigir definición de rol", intentTags: ["role_clarity", "contract_power"], stance: "role_definition", primaryMessage: "Obligas al club a concretar qué espera de ti antes de firmar.", secondaryMessage: "Obtienes más información, pero la dirección endurece parte de la negociación.", primaryEffects: [n("professional.careerControl", 4), n("professional.roleSecurity", 2)], secondaryEffects: [n("professional.careerControl", 2), n("professional.institutionalTrust", -2)] },
    { label: "Esperar hasta agosto", intentTags: ["optionality", "market"], stance: "wait_august", primaryMessage: "Mantienes abiertas las opciones y el mercado gana temperatura.", secondaryMessage: "La espera conserva libertad, pero parte del mercado se enfría antes de que decidas.", primaryEffects: [n("professional.careerControl", 3), n("reputation.marketHeat", 2)], secondaryEffects: [n("professional.careerControl", 2), n("reputation.marketHeat", -3)] },
    { label: "Pedir salida si no hay compromiso", intentTags: ["exit", "role_clarity"], stance: "exit_without_commitment", primaryMessage: "Dejas claro que sin compromiso deportivo prefieres explorar una salida.", secondaryMessage: "El mensaje abre mercado, pero reduce el margen para recomponer la relación interna.", primaryEffects: [n("reputation.marketHeat", 3), n("professional.careerControl", 3)], secondaryEffects: [n("professional.institutionalTrust", -4), n("professional.environmentStability", -2)] }
  ]
});

const PAY = veteranScene({
  id: "EVT_34_PAY_001",
  family: "contract",
  title: "La cifra que ya no te pagan",
  body: "La renovación baja tu salario un 35 % aunque sigues siendo importante. El club argumenta edad y estructura salarial, no rendimiento.",
  visible: ["Conoces la oferta, comparables parciales y tu rendimiento reciente."],
  uncertain: ["No sabes si otro club pagará más ni si la rebaja responde a una política interna."],
  months: [6, 7, 8],
  gates: [{ path: "market.pending.reason", op: "eq", value: "Veteran renewal: pay cut" }],
  seedsRead: ["SEED_PUBLIC_CONTRACT"],
  seedWrite: "SEED_VETERAN_PAYCUT",
  offerActions: { A: "accept", B: "counter", C: "reject", D: "defer" },
  choices: [
    { label: "Aceptar", intentTags: ["security", "continuity"], stance: "accept_paycut", primaryMessage: "Aceptas cobrar menos a cambio de continuidad y de mantener opciones deportivas abiertas.", secondaryMessage: "La rebaja se convierte en referencia para futuras negociaciones antes de que se aclare tu rol.", primaryEffects: [n("professional.environmentStability", 4)], secondaryEffects: [n("professional.contractPower", -3)] },
    { label: "Pedir primas por minutos y títulos", intentTags: ["incentives", "contract_power"], stance: "bonus_structure", primaryMessage: "Intentas alinear la rebaja fija con primas ligadas a participación y éxito colectivo.", secondaryMessage: "El club acepta discutir variables, pero algunas quedan lejos de tu control real.", primaryEffects: [n("professional.contractPower", 4)], secondaryEffects: [n("professional.contractPower", 2), n("professional.careerControl", -1)] },
    { label: "Rechazar por estatus", intentTags: ["status", "market"], stance: "reject_status", primaryMessage: "Rechazas la cifra y obligas a comprobar si tu estatus todavía tiene mercado fuera.", secondaryMessage: "Defiendes la referencia salarial, pero el club interpreta que la distancia puede ser definitiva.", primaryEffects: [n("reputation.marketHeat", 2), n("professional.contractPower", 2)], secondaryEffects: [n("professional.institutionalTrust", -3), n("professional.environmentStability", -2)] },
    { label: "Filtrar que escuchas mercado", intentTags: ["leverage", "public_pressure"], stance: "market_leak", primaryMessage: "La filtración aumenta presión negociadora sin firmar nada por ti.", secondaryMessage: "La filtración convence a parte de la dirección de que ya estás buscando la salida.", primaryEffects: [n("reputation.marketHeat", 4), n("reputation.mediaHeat", 2)], secondaryEffects: [n("reputation.mediaHeat", 4), n("professional.institutionalTrust", -4)] }
  ]
});

const NT_FIRST = veteranScene({
  id: "EVT_34_NT_001",
  family: "selection",
  title: "Última ventana de selección",
  body: "El seleccionador te incluye en una prelista y avisa de que ya no garantizará convocatoria.",
  visible: ["Ves competidores, calendario y el mensaje del seleccionador."],
  uncertain: ["No sabes si aceptar un rol secundario dará un último torneo o meses de viajes sin jugar."],
  months: [9, 10, 3, 4],
  gates: [{ path: "professional.nationalStanding", op: "gte", value: 20 }],
  seedsRead: ["SEED_NATIONAL_PHASEDOWN"],
  seedWrite: "SEED_FINAL_NT_POSTURE",
  choices: [
    { label: "Seguir disponible para cualquier rol", intentTags: ["selection", "flexibility"], stance: "available_any_role", primaryMessage: "Mantienes abierta la selección y aceptas competir por minutos sin garantías.", secondaryMessage: "La disponibilidad continúa, pero la carga internacional crece sin asegurar participación.", primaryEffects: [n("professional.nationalStanding", 2), n("professional.bodyLoad", 2)], secondaryEffects: [n("professional.bodyLoad", 4), n("professional.recoveryDebt", 2)] },
    { label: "Pedir claridad", intentTags: ["selection", "role_clarity"], stance: "ask_clarity", primaryMessage: "Obtienes una lectura más concreta del ciclo internacional, aunque no una promesa.", secondaryMessage: "La conversación aclara poco y deja claro que la jerarquía ya no depende de tu historia.", primaryEffects: [n("professional.careerControl", 2)], secondaryEffects: [n("professional.statusInertia", -2)] },
    { label: "Retirarte internacionalmente ahora", intentTags: ["selection_exit", "body"], stance: "international_retirement", primaryMessage: "Cierras solo tu etapa internacional y liberas carga; tu carrera de club continúa plenamente activa.", secondaryMessage: "Recuperas control del calendario, aunque renuncias a una puerta que todavía no estaba cerrada.", primaryEffects: [set("professional.nationalRole", "none"), flag("NATIONAL_RETIRED", true), n("professional.bodyLoad", -5)], secondaryEffects: [set("professional.nationalRole", "none"), flag("NATIONAL_RETIRED", true), n("professional.legacyAnxiety", 2)] },
    { label: "Estar disponible solo para ventanas competitivas", intentTags: ["selection", "load_management"], stance: "competitive_windows_only", primaryMessage: "Reduces viajes amistosos y reservas disponibilidad para ventanas competitivas.", secondaryMessage: "La postura protege carga, pero el seleccionador puede preferir continuidad total de otros jugadores.", primaryEffects: [n("professional.bodyLoad", -3), n("professional.matchSelectivity", 3)], secondaryEffects: [n("professional.nationalStanding", -2), n("professional.matchSelectivity", 2)] }
  ]
});

const HOME = veteranScene({
  id: "EVT_34_HOME_001",
  family: "market",
  title: "Valdoria no puede igualarlo",
  body: "UDV te quiere, pero su mejor oferta es muy inferior a dos propuestas exteriores. A cambio tendrías un rol central y un proyecto deportivo real.",
  visible: ["Conoces salario, rol, duración, plantilla y objetivos de UDV."],
  uncertain: ["No sabes cuánto pesará volver hasta vivirlo ni si el equipo será competitivo."],
  months: [6, 7, 8],
  gates: [{ path: "market.pending.reason", op: "eq", value: "Veteran return: UDV" }],
  seedsRead: ["SEED_HOME_INSTITUTION"],
  seedWrite: "SEED_FINAL_HOME_WINDOW",
  npcRefs: ["NPC_DIR_02"],
  offerActions: { A: "accept", B: "defer", C: "counter", D: "defer" },
  choices: [
    { label: "Volver", intentTags: ["home", "role"], stance: "return_home", primaryMessage: "Aceptas la oferta formal de UDV y eliges centralidad deportiva por encima de la mejor cifra exterior.", secondaryMessage: "El regreso se firma, pero el simbolismo amplifica desde el primer día cada resultado.", primaryEffects: [n("professional.homePull", -6), n("professional.legacyCapital", 3)], secondaryEffects: [n("professional.legacyAnxiety", 4)] },
    { label: "Usar la oferta para mejorar otras", intentTags: ["leverage", "market"], stance: "use_as_leverage", primaryMessage: "No firmas UDV todavía y usas la existencia de la propuesta como referencia de mercado.", secondaryMessage: "La maniobra gana atención, pero arriesga la ventana sentimental si UDV no espera.", primaryEffects: [n("professional.contractPower", 3), n("reputation.marketHeat", 2)], secondaryEffects: [n("professional.homePull", 3), n("professional.institutionalTrust", -2)] },
    { label: "Pedir a UDV más poder deportivo", intentTags: ["home", "club_power"], stance: "ask_sporting_power", primaryMessage: "Contraofertas buscando influencia deportiva que compense parte de la diferencia económica.", secondaryMessage: "UDV escucha la petición, pero no puede convertir simbolismo en poder ilimitado.", primaryEffects: [n("professional.institutionalPower", 4), n("professional.contractPower", 2)], secondaryEffects: [n("professional.institutionalTrust", -1)] },
    { label: "Posponer un año", intentTags: ["home", "optionality"], stance: "postpone_home", primaryMessage: "Mantienes el vínculo sin consumir ahora la última ventana de regreso.", secondaryMessage: "Posponer conserva nivel potencial, pero no existe garantía de que la misma oferta vuelva.", primaryEffects: [n("professional.careerControl", 3), n("professional.homePull", 2)], secondaryEffects: [n("professional.homePull", 5), n("professional.legacyAnxiety", 2)] }
  ]
});

const AGENT = veteranScene({
  id: "EVT_34_AGT_001",
  family: "agent",
  title: "El agente dice que esperes",
  body: "Tu agente afirma que en dos semanas caerá una oferta mejor. Hoy tienes una propuesta sólida con fecha de caducidad.",
  visible: ["Ves la oferta existente y conoces la confianza histórica que has depositado en tu agente."],
  uncertain: ["No sabes si la oferta futura existe, es un sondeo o una apuesta del agente por una comisión mayor."],
  months: [6, 7, 8, 1],
  gates: [{ path: "market.pending.reason", op: "eq", value: "Veteran market: agent deadline" }],
  seedsRead: ["SEED_AGENT_OMISSION"],
  seedWrite: "SEED_LAST_AGENT_GAMBLE",
  offerActions: { A: "defer", B: "accept", C: "defer", D: "defer" },
  choices: [
    { label: "Esperar", intentTags: ["agent_trust", "risk"], stance: "wait_for_better", primaryMessage: "Apuestas por la información de tu agente y dejas caducar la propuesta segura.", secondaryMessage: "La espera conserva la posibilidad ideal, pero te deja con menos protección si la segunda oferta no existe.", primaryEffects: [n("professional.agentControl", -2), n("professional.careerControl", 1)], secondaryEffects: [n("reputation.marketHeat", -3), n("professional.environmentStability", -2)] },
    { label: "Firmar la segura", intentTags: ["security", "market"], stance: "take_safe_offer", primaryMessage: "Aceptas la CareerOffer que realmente está sobre la mesa y eliminas el riesgo de quedarte sin ambas.", secondaryMessage: "La firma da seguridad, aunque quizá cierre una opción deportiva que habría sido mejor.", primaryEffects: [n("professional.environmentStability", 4)], secondaryEffects: [n("professional.legacyAnxiety", 2)] },
    { label: "Hablar directamente con el club futuro", intentTags: ["direct_contact", "information"], stance: "direct_future_club", primaryMessage: "Buscas confirmar si el interés futuro es real antes de dejar caer la oferta actual.", secondaryMessage: "El contacto no consigue prueba formal y tensiona la relación con tu agente.", primaryEffects: [n("professional.careerControl", 4), n("professional.agentControl", 2)], secondaryEffects: [n("professional.agentControl", 4), n("professional.environmentStability", -2)] },
    { label: "Pedir prueba concreta al agente", intentTags: ["agent_accountability", "information"], stance: "demand_proof", primaryMessage: "Exiges evidencia concreta antes de sacrificar una oferta que sí existe.", secondaryMessage: "La exigencia protege tu decisión, pero puede romper confidencialidad o confianza con la agencia.", primaryEffects: [n("professional.careerControl", 3), n("professional.agentControl", 3)], secondaryEffects: [n("professional.environmentStability", -2)] }
  ]
});

const LOAD = veteranScene({
  id: "EVT_34_LOAD_001",
  family: "medical",
  title: "El plan de 28 partidos",
  body: "El staff propone limitar tu carga a 28–32 titularidades y reservarte en semanas seleccionadas.",
  visible: ["Ves el plan de carga, el calendario y los datos del año anterior."],
  uncertain: ["No sabes si limitar partidos alargará tu carrera o te hará perder ritmo y sitio."],
  months: [7, 8, 9],
  gates: [{ path: "professional.matchSelectivity", op: "gte", value: 20 }],
  seedsRead: ["SEED_MATCH_SELECTIVITY"],
  seedWrite: "SEED_28_MATCH_PLAN",
  choices: [
    { label: "Aceptar", intentTags: ["load_management", "availability"], stance: "accept_28_plan", primaryMessage: "Aceptas una temporada gestionada y reduces exposición a picos de carga.", secondaryMessage: "El cuerpo agradece margen, pero la jerarquía puede adaptarse a tu ausencia en semanas concretas.", primaryEffects: [n("professional.matchSelectivity", 6), n("professional.recoveryDebt", -4)], secondaryEffects: [n("professional.roleSecurity", -2), n("professional.recoveryDebt", -2)] },
    { label: "Negociar 35 si el cuerpo responde", intentTags: ["conditional_load", "performance"], stance: "conditional_35", primaryMessage: "Conviertes el límite en un plan revisable según recuperación y rendimiento.", secondaryMessage: "La flexibilidad funciona, aunque deja más zonas grises sobre quién decide cuándo el cuerpo «responde».", primaryEffects: [n("professional.careerControl", 3), n("professional.matchSelectivity", 3)], secondaryEffects: [n("professional.recoveryDebt", 1)] },
    { label: "Rechazar un tope previo", intentTags: ["competition", "role"], stance: "no_pre_cap", primaryMessage: "Te mantienes disponible para competir cada semana y obligas al staff a decidir partido a partido.", secondaryMessage: "Defiendes ritmo y jerarquía, pero acumulas más deuda de recuperación de la prevista.", primaryEffects: [n("professional.roleSecurity", 3), n("professional.bodyLoad", 2)], secondaryEffects: [n("professional.recoveryDebt", 5), n("body.risk", 2)] },
    { label: "Aceptar solo limitar viajes y partidos menores", intentTags: ["selectivity", "big_games"], stance: "travel_minor_only", primaryMessage: "Proteges carga en viajes y partidos menores sin renunciar a las citas de máxima exposición.", secondaryMessage: "La selección de esfuerzos conserva picos competitivos, pero puede trasladar demasiada carga a las semanas grandes.", primaryEffects: [n("professional.matchSelectivity", 4), n("professional.recoveryDebt", -2)], secondaryEffects: [n("professional.recoveryDebt", 2)] }
  ]
});

const DORSAL = veteranScene({
  id: "EVT_34_DORSAL_001",
  family: "team",
  title: "Tu dorsal en la tienda",
  body: "El club pregunta si aceptarías ceder tu dorsal histórico a un fichaje joven por razones comerciales y de sucesión.",
  visible: ["Conoces la petición, al jugador y la campaña prevista."],
  uncertain: ["No sabes si es un gesto aislado o señal de que el club quiere pasar página."],
  months: [7, 8, 9],
  gates: [{ path: "professional.successionPressure", op: "gte", value: 35 }, { path: "professional.legacyCapital", op: "gte", value: 35 }],
  seedsRead: ["SEED_DORSAL_SUCCESSION"],
  seedWrite: "SEED_FINAL_DORSAL",
  choices: [
    { label: "Cederlo públicamente", intentTags: ["legacy", "succession"], stance: "cede_publicly", primaryMessage: "Conviertes el dorsal en un gesto explícito de continuidad generacional.", secondaryMessage: "El gesto refuerza legado, pero también acelera la lectura pública de sucesión.", primaryEffects: [n("professional.legacyCapital", 4), n("professional.successionPressure", 2)], secondaryEffects: [n("professional.legacyAnxiety", 3)] },
    { label: "Mantenerlo mientras sigas", intentTags: ["status", "continuity"], stance: "keep_while_playing", primaryMessage: "Mantienes el dorsal como parte normal de tu identidad mientras sigas compitiendo.", secondaryMessage: "La negativa es legítima, aunque alimenta una lectura externa de resistencia al relevo.", primaryEffects: [n("professional.statusInertia", 2)], secondaryEffects: [n("professional.successionPressure", 3), n("reputation.mediaHeat", 1)] },
    { label: "Hablar primero con el joven", intentTags: ["relationship", "succession"], stance: "talk_successor_first", primaryMessage: "Trasladas el gesto al terreno personal antes de convertirlo en campaña pública.", secondaryMessage: "La conversación evita parte del ruido, pero no elimina la decisión institucional posterior.", primaryEffects: [n("professional.lockerWeight", 3), n("professional.legacyCapital", 2)], secondaryEffects: [n("professional.environmentStability", 1)] },
    { label: "Proponer el cambio la próxima temporada", intentTags: ["transition", "timing"], stance: "next_season", primaryMessage: "Aceptas la sucesión simbólica, pero eliges un calendario que no anticipe tu salida deportiva.", secondaryMessage: "El aplazamiento compra tiempo y mantiene abierta la misma tensión para el verano siguiente.", primaryEffects: [n("professional.careerControl", 2)], secondaryEffects: [n("professional.successionPressure", 2)] }
  ]
});

const CONTRACT = veteranScene({
  id: "EVT_34_CON_001",
  family: "contract",
  title: "La cláusula de salida digna",
  body: "Un club te ofrece dos años si aceptas una cláusula que permite terminar el segundo verano con indemnización baja si tu rol cae.",
  visible: ["Conoces duración, salario y cláusula."],
  uncertain: ["No sabes si la cláusula protege al club o también evita que quedes atrapado."],
  months: [6, 7, 8],
  gates: [{ path: "market.pending.reason", op: "eq", value: "Veteran renewal: exit clause" }],
  seedsRead: ["SEED_AGE30_CONTRACT"],
  seedWrite: "SEED_DIGNIFIED_EXIT_CLAUSE",
  offerActions: { A: "accept", B: "counter", C: "counter", D: "reject" },
  choices: [
    { label: "Aceptarla", intentTags: ["contract", "flexibility"], stance: "accept_exit_clause", primaryMessage: "Aceptas la flexibilidad contractual y asumes que seguridad y control ya no son lo mismo.", secondaryMessage: "La cláusula puede proteger una salida futura, pero también reduce tu blindaje si el rol cae antes de lo previsto.", primaryEffects: [n("professional.careerControl", 2)], secondaryEffects: [n("professional.contractPower", -2)] },
    { label: "Pedir que sea bilateral", intentTags: ["contract_power", "symmetry"], stance: "bilateral_clause", primaryMessage: "Contraofertas para que la puerta de salida pueda activarla también el jugador.", secondaryMessage: "La simetría mejora tu control, pero el club reduce parte de la seguridad económica ofrecida.", primaryEffects: [n("professional.contractPower", 4)], secondaryEffects: [n("professional.environmentStability", -1)] },
    { label: "Cambiar a un año sin cláusula", intentTags: ["short_contract", "control"], stance: "one_year_no_clause", primaryMessage: "Contraofertas duración corta a cambio de no quedar sujeto a una salida unilateral posterior.", secondaryMessage: "Ganas control inmediato, pero renuncias a parte de la seguridad de dos temporadas.", primaryEffects: [n("professional.careerControl", 4)], secondaryEffects: [n("professional.environmentStability", -2)] },
    { label: "Rechazar y buscar seguridad total", intentTags: ["security", "market"], stance: "reject_for_security", primaryMessage: "Rechazas una estructura flexible y compruebas si el mercado todavía paga seguridad completa.", secondaryMessage: "Defiendes seguridad, pero reduces el número de destinos compatibles con tu exigencia.", primaryEffects: [n("professional.contractPower", 2)], secondaryEffects: [n("reputation.marketHeat", -2)] }
  ]
});

const ROLE = veteranScene({
  id: "EVT_34_ROLE_001",
  family: "coach",
  title: "Dos suplencias y una ovación",
  body: "Empiezas dos partidos seguidos en el banquillo, pero la afición te ovaciona al calentar.",
  visible: ["Ves los onces, la explicación del técnico y la reacción del estadio."],
  uncertain: ["No sabes si el entrenador te reserva o te está sacando del núcleo competitivo."],
  months: [9, 10, 11, 2, 3],
  gates: [{ path: "sport.roleScore", op: "lte", value: 55 }, { path: "professional.legacyCapital", op: "gte", value: 35 }],
  seedsRead: ["SEED_ROLE_COMMUNICATION"],
  seedWrite: "SEED_FINAL_ROLE_ACCEPTANCE",
  choices: [
    { label: "Pedir reunión ya", intentTags: ["role_clarity", "coach"], stance: "meeting_now", primaryMessage: "Fuerzas una conversación inmediata sobre la jerarquía real.", secondaryMessage: "La reunión da información, pero el técnico interpreta la urgencia como presión sobre dos decisiones puntuales.", primaryEffects: [n("professional.careerControl", 3), n("professional.roleSecurity", 1)], secondaryEffects: [n("professional.institutionalTrust", -2)] },
    { label: "Esperar cinco partidos", intentTags: ["patience", "evidence"], stance: "wait_five", primaryMessage: "Esperas una muestra mayor antes de decidir si existe un patrón.", secondaryMessage: "La paciencia evita sobrerreaccionar, pero también permite que la nueva jerarquía se consolide.", primaryEffects: [n("professional.environmentStability", 2)], secondaryEffects: [n("professional.roleSecurity", -2)] },
    { label: "Aceptar y centrarse en impacto", intentTags: ["role_acceptance", "adaptation"], stance: "impact_role", primaryMessage: "Aceptas medir valor por impacto y disponibilidad, no solo por titularidades.", secondaryMessage: "El rol puede prolongar utilidad, aunque el club empiece a planificarte como especialista estable.", primaryEffects: [n("professional.roleAcceptance", 5), n("professional.legacyCapital", 2)], secondaryEffects: [n("professional.statusInertia", -2)] },
    { label: "Dejar caer en prensa que necesitas jugar", intentTags: ["public_pressure", "role"], stance: "press_for_minutes", primaryMessage: "La presión pública reabre el debate sobre minutos.", secondaryMessage: "La afición amplifica tu postura y el técnico lo percibe como una disputa externa de jerarquía.", primaryEffects: [n("reputation.mediaHeat", 3), n("professional.roleSecurity", 1)], secondaryEffects: [n("professional.institutionalTrust", -4), n("reputation.mediaHeat", 4)] }
  ]
});

const MENTOR = veteranScene({
  id: "EVT_34_MENTOR_001",
  family: "team",
  title: "El joven te pide tus vídeos",
  body: "Tu principal competidor te pide revisar juntos movimientos y vídeos.",
  visible: ["La petición es privada y conoces vuestra relación previa."],
  uncertain: ["No sabes si te admira, busca ventaja o si el club le ha sugerido acercarse."],
  months: [9, 10, 11, 1, 2],
  gates: [{ path: "professional.successionPressure", op: "gte", value: 30 }],
  seedsRead: ["SEED_FORMAL_MENTOR"],
  seedWrite: "SEED_SUCCESSOR_ALLIANCE",
  choices: [
    { label: "Ayudar sin reservas", intentTags: ["mentor", "legacy"], stance: "help_fully", primaryMessage: "Compartes conocimiento competitivo y creas una alianza que puede sobrevivir a la lucha por minutos.", secondaryMessage: "El joven mejora y la alianza crece, aunque también aumenta la competencia directa.", primaryEffects: [n("professional.lockerWeight", 4), n("professional.legacyCapital", 3), n("professional.successionPressure", 2)], secondaryEffects: [n("professional.successionPressure", 4)] },
    { label: "Ayudar solo en aspectos no competitivos", intentTags: ["mentor", "boundaries"], stance: "help_noncompetitive", primaryMessage: "Ofreces apoyo de carrera y vestuario sin entrenar juntos los detalles que compiten por el puesto.", secondaryMessage: "Mantienes límites claros, aunque la relación nunca llega a convertirse en una alianza completa.", primaryEffects: [n("professional.lockerWeight", 2), n("professional.careerControl", 1)], secondaryEffects: [n("professional.environmentStability", 1)] },
    { label: "Negarte con respeto", intentTags: ["competition", "boundaries"], stance: "respectful_refusal", primaryMessage: "Mantienes la competencia separada de la mentoría sin convertirlo en conflicto personal.", secondaryMessage: "Proteges tus herramientas competitivas, pero pierdes una vía de liderazgo que el club podía valorar.", primaryEffects: [n("professional.careerControl", 2)], secondaryEffects: [n("professional.lockerWeight", -2)] },
    { label: "Convertirlo en trabajo conjunto con el staff", intentTags: ["mentor", "staff"], stance: "staff_joint_work", primaryMessage: "Transformas la petición privada en una tarea transparente con el cuerpo técnico.", secondaryMessage: "La formalización protege límites, aunque el club pasa a apropiarse de parte de la relación.", primaryEffects: [n("professional.institutionalPower", 2), n("professional.lockerWeight", 3)], secondaryEffects: [n("professional.careerControl", -1)] }
  ]
});

const BODY = veteranScene({
  id: "EVT_34_BODY_001",
  family: "medical",
  title: "Dolor que tarda dos días",
  body: "Ya no duele durante el partido: duele 36 horas después. Las pruebas no muestran lesión.",
  visible: ["Conoces tus sensaciones y las pruebas médicas disponibles."],
  uncertain: ["No sabes si es envejecimiento normal, carga puntual o el inicio de un patrón crónico."],
  months: [9, 10, 11, 1, 2, 3],
  gateAlternatives: [
    [{ path: "professional.recoveryDebt", op: "gte", value: 35 }],
    [{ path: "flags.LATE_BODY_REDLINE", op: "eq", value: true }]
  ],
  seedsRead: ["SEED_PAIN_WITHOUT_SCAN"],
  seedWrite: "SEED_POST_MATCH_PAIN",
  npcRefs: ["NPC_MED_01"],
  choices: [
    { label: "Gestionar sin parar", intentTags: ["load_management", "continuity"], stance: "manage_without_stop", primaryMessage: "Mantienes continuidad y reduces carga alrededor de los partidos sin declarar una lesión inexistente.", secondaryMessage: "La gestión permite jugar, pero la molestia reaparece y acumula deuda de recuperación.", primaryEffects: [n("professional.matchSelectivity", 3), n("professional.recoveryDebt", -2)], secondaryEffects: [n("professional.recoveryDebt", 3), n("body.risk", 1)] },
    { label: "Bajar carga un mes", intentTags: ["recovery", "prevention"], stance: "month_load_reduction", primaryMessage: "Recortas carga de forma temporal y evalúas si el patrón responde.", secondaryMessage: "El cuerpo mejora solo parcialmente y el rol pierde algo de continuidad.", primaryEffects: [n("professional.bodyLoad", -6), n("professional.recoveryDebt", -5)], secondaryEffects: [n("professional.roleSecurity", -2), n("professional.recoveryDebt", -2)] },
    { label: "Parar hasta desaparecer", intentTags: ["health", "availability"], stance: "stop_until_clear", primaryMessage: "Priorizas resolver la molestia antes de volver a exponerte.", secondaryMessage: "La pausa protege el cuerpo, pero no garantiza que la sensación no reaparezca al recuperar carga.", primaryEffects: [n("professional.availability", -5), n("professional.recoveryDebt", -7), n("body.risk", -3)], secondaryEffects: [n("professional.roleSecurity", -3)] },
    { label: "Cambiar preparación y rol", intentTags: ["reinvention", "body"], stance: "change_prep_and_role", primaryMessage: "Ajustas preparación y forma de competir para reducir la carga que dispara el dolor tardío.", secondaryMessage: "La adaptación reduce algunos picos, aunque exige aceptar un perfil deportivo distinto.", primaryEffects: [n("professional.tacticalReading", 2), n("professional.matchSelectivity", 3), n("professional.roleAcceptance", 2)], secondaryEffects: [n("professional.statusInertia", -2)] }
  ]
});

const NT_OMISSION = veteranScene({
  id: "EVT_34_NT_002",
  family: "selection",
  title: "Te dejan fuera de una convocatoria",
  body: "Por primera vez quedas fuera de una lista internacional estando sano.",
  visible: ["Ves la lista y una explicación pública genérica."],
  uncertain: ["No sabes si es descanso, transición o un final no comunicado."],
  months: [10, 11, 3, 4],
  gates: [{ path: "professional.nationalStanding", op: "gte", value: 10 }, { path: "flags.NATIONAL_RETIRED", op: "neq", value: true }],
  seedsRead: ["SEED_FINAL_NT_POSTURE"],
  seedWrite: "SEED_NT_FIRST_OMISSION_LATE",
  choices: [
    { label: "Llamar al seleccionador", intentTags: ["selection", "clarity"], stance: "call_coach", primaryMessage: "Buscas una explicación directa y mantienes abierta la siguiente lista.", secondaryMessage: "La llamada aclara que ya compites desde atrás y puede cerrar parte de la ambigüedad a tu favor o en tu contra.", primaryEffects: [n("professional.careerControl", 2)], secondaryEffects: [n("professional.nationalStanding", -2)] },
    { label: "Felicitar a los convocados", intentTags: ["leadership", "public_tone"], stance: "congratulate_squad", primaryMessage: "Proteges el tono público y evitas convertir una ausencia en conflicto.", secondaryMessage: "El gesto mantiene reputación, pero no te da información nueva sobre la siguiente convocatoria.", primaryEffects: [n("professional.publicMyth", 2)], secondaryEffects: [n("professional.legacyAnxiety", 1)] },
    { label: "Anunciar retirada internacional", intentTags: ["selection_exit", "control"], stance: "international_retirement_after_omission", primaryMessage: "Cierras tu etapa internacional por decisión propia; sigues siendo futbolista de club y no activas la retirada de carrera.", secondaryMessage: "Recuperas control del relato, aunque quizá renuncias antes de una última llamada posible.", primaryEffects: [set("professional.nationalRole", "none"), flag("NATIONAL_RETIRED", true), n("professional.bodyLoad", -4)], secondaryEffects: [set("professional.nationalRole", "none"), flag("NATIONAL_RETIRED", true), n("professional.legacyAnxiety", 2)] },
    { label: "No reaccionar y esperar la siguiente lista", intentTags: ["patience", "selection"], stance: "wait_next_list", primaryMessage: "Mantienes la puerta abierta sin convertir una ausencia en ultimátum.", secondaryMessage: "Conservas reversibilidad, pero cedes al seleccionador el control del relato durante otra ventana.", primaryEffects: [n("professional.environmentStability", 1)], secondaryEffects: [n("professional.careerControl", -1)] }
  ]
});

export const T529_CAREER_EVENTS_34_PLUS: EventDefinition[] = [
  BRIDGE,
  PAY,
  NT_FIRST,
  HOME,
  AGENT,
  LOAD,
  DORSAL,
  CONTRACT,
  ROLE,
  MENTOR,
  BODY,
  NT_OMISSION
];
