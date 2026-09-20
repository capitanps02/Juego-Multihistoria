import type { EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const seed = (seedId: string, choice: string, stance: string) => [
  seedCreate(seedId, 60, { choice, stance })
];

const FORMAL_MENTOR = ambiguousEvent({
  id: "EVT_31_TEAM_001",
  ageWindow: [31, 31],
  phase: "30_34",
  family: "team",
  title: "Mentor oficial",
  body: "El club quiere incluir en tu contrato una función informal de mentor de tres jóvenes. No es entrenador, pero esperan que los guíes y aceptes compartir parte de tu tiempo individual.",
  visible: ["Conoces el bonus, los nombres de los jugadores y las expectativas concretas."],
  uncertain: ["No sabes si uno de esos jóvenes terminará compitiendo directamente contigo."],
  seedsRead: ["SEED_MENTOR_ADVICE"],
  seedsWrite: ["SEED_FORMAL_MENTOR"],
  choices: [
    {
      id: "A", label: "Aceptar", intentTags: ["mentor", "accept"],
      primaryMessage: "Formalizas un papel que puede ampliar tu peso dentro del club sin convertirte en entrenador.",
      secondaryMessage: "La mentoría gana estructura, pero también te vincula a decisiones y carreras que no controlas.",
      primaryEffects: [n("professional.legacyCapital", 4), n("professional.lockerPower", 3)],
      secondaryEffects: [n("professional.recoveryDebt", 1)],
      primarySeedTransitions: seed("SEED_FORMAL_MENTOR", "A", "accept"),
      secondarySeedTransitions: seed("SEED_FORMAL_MENTOR", "A", "accept")
    },
    {
      id: "B", label: "Aceptar solo fuera de días de partido", intentTags: ["mentor", "protect_match_days"],
      primaryMessage: "Aceptas ayudar con un límite claro para no mezclar mentoría y preparación competitiva.",
      secondaryMessage: "El límite protege tu rutina, aunque reduce parte del acompañamiento que el club esperaba.",
      primaryEffects: [n("professional.legacyCapital", 3), n("professional.matchSelectivity", 2)],
      secondaryEffects: [n("professional.institutionalTrust", -1)],
      primarySeedTransitions: seed("SEED_FORMAL_MENTOR", "B", "off_match_days"),
      secondarySeedTransitions: seed("SEED_FORMAL_MENTOR", "B", "off_match_days")
    },
    {
      id: "C", label: "Rechazar formalizar algo que ya haces por elección", intentTags: ["mentor", "informal_only"],
      primaryMessage: "Mantienes la ayuda como una decisión personal y evitas convertirla en una obligación contractual.",
      secondaryMessage: "Proteges autonomía, pero el club puede leerlo como resistencia a asumir una función de legado.",
      primaryEffects: [n("professional.careerControl", 3)],
      secondaryEffects: [n("professional.institutionalTrust", -2)],
      primarySeedTransitions: seed("SEED_FORMAL_MENTOR", "C", "informal_only"),
      secondarySeedTransitions: seed("SEED_FORMAL_MENTOR", "C", "informal_only")
    },
    {
      id: "D", label: "Elegir tú a quién mentorizar", intentTags: ["mentor", "choose_players"],
      primaryMessage: "Aceptas la responsabilidad si puedes decidir dónde tu experiencia aporta más.",
      secondaryMessage: "La elección puede mejorar el trabajo o crear percepción de favoritos.",
      primaryEffects: [n("professional.careerControl", 3), n("professional.legacyCapital", 2)],
      secondaryEffects: [n("professional.publicPolarization", 1)],
      primarySeedTransitions: seed("SEED_FORMAL_MENTOR", "D", "choose_players"),
      secondarySeedTransitions: seed("SEED_FORMAL_MENTOR", "D", "choose_players")
    }
  ],
  tags: ["t51_shifted_prepared", "t51_blocked_legacy_capital_threshold", "t51_distinct_from_EVT_31_MENT_001"],
  canonStatus: "technical_adaptation"
});

const YOUTH_WAVE = ambiguousEvent({
  id: "EVT_31_SQUAD_001",
  ageWindow: [31, 31],
  phase: "30_34",
  family: "team",
  title: "Dos fichajes de 22",
  body: "El club ficha dos jugadores jóvenes capaces de ocupar tus funciones. La dirección dice que es profundidad; analistas externos hablan de transición generacional.",
  visible: ["Conoces perfiles, precio y declaraciones públicas de la dirección."],
  uncertain: ["No sabes si venderán a otro jugador ni si ambos se adaptarán."],
  seedsWrite: ["SEED_SQUAD_YOUTH_WAVE"],
  choices: [
    {
      id: "A", label: "Competir sin pedir explicaciones", intentTags: ["succession", "compete"],
      primaryMessage: "Respondes al mercado con competencia diaria y evitas convertir fichajes en una declaración de guerra.",
      secondaryMessage: "La postura protege el vestuario, pero deja al club definir en silencio cómo encajan todos.",
      primaryEffects: [n("professional.motivationReserve", 3), n("professional.statusInertia", 1)],
      secondaryEffects: [n("professional.careerControl", -1)],
      primarySeedTransitions: seed("SEED_SQUAD_YOUTH_WAVE", "A", "compete"),
      secondarySeedTransitions: seed("SEED_SQUAD_YOUTH_WAVE", "A", "compete")
    },
    {
      id: "B", label: "Preguntar si el plan a dos años te incluye", intentTags: ["succession", "clarify_plan"],
      primaryMessage: "Pides información estructural antes de convertir dos fichajes en conclusiones sobre tu futuro.",
      secondaryMessage: "Obtienes contexto, aunque una respuesta prudente puede no revelar la intención real del club.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.institutionalTrust", 1)],
      secondaryEffects: [n("professional.successionPressure", 1)],
      primarySeedTransitions: seed("SEED_SQUAD_YOUTH_WAVE", "B", "clarify_plan"),
      secondarySeedTransitions: seed("SEED_SQUAD_YOUTH_WAVE", "B", "clarify_plan")
    },
    {
      id: "C", label: "Abrir mercado discretamente", intentTags: ["succession", "market_probe"],
      primaryMessage: "Buscas información externa sin convertir la llegada de jóvenes en una ruptura inmediata.",
      secondaryMessage: "La exploración amplía opciones y puede deteriorar confianza si el club la detecta.",
      primaryEffects: [n("professional.veteranLeverage", 3), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.institutionalTrust", -2)],
      primarySeedTransitions: seed("SEED_SQUAD_YOUTH_WAVE", "C", "market_probe"),
      secondarySeedTransitions: seed("SEED_SQUAD_YOUTH_WAVE", "C", "market_probe")
    },
    {
      id: "D", label: "Proponer compartir roles y especializarte", intentTags: ["succession", "coexist"],
      primaryMessage: "Intentas convertir la competencia generacional en una distribución de funciones útil para el equipo.",
      secondaryMessage: "La especialización puede alargar tu impacto o consolidar una reducción de volumen.",
      primaryEffects: [n("professional.roleAdaptability", 4), n("professional.matchSelectivity", 2)],
      secondaryEffects: [n("professional.statusInertia", -2)],
      primarySeedTransitions: seed("SEED_SQUAD_YOUTH_WAVE", "D", "coexist"),
      secondarySeedTransitions: seed("SEED_SQUAD_YOUTH_WAVE", "D", "coexist")
    }
  ],
  tags: ["t51_shifted_prepared", "t51_blocked_succession_pressure_threshold", "t51_missing_SEED_SUCCESSION_DECISION_identity", "t51_distinct_from_EVT_31_TEAM_001"],
  canonStatus: "technical_adaptation"
});

const BUSINESS_SHOCK = ambiguousEvent({
  id: "EVT_31_BIZ_001",
  ageWindow: [31, 31],
  phase: "30_34",
  family: "money",
  title: "El problema es de tu socio",
  body: "Un proyecto empresarial donde aparece tu nombre recibe críticas por una decisión tomada por un socio. Tú no participaste directamente, pero medios y patrocinadores te asocian al caso.",
  visible: ["Conoces los hechos públicos, el contrato y la postura del socio."],
  uncertain: ["No sabes si distanciarte protege tu imagen o parece abandonar a alguien antes de conocer todo."],
  seedsRead: ["SEED_WEALTH_STRUCTURE"],
  seedsWrite: ["SEED_BUSINESS_REPUTATION_SHOCK"],
  choices: [
    {
      id: "A", label: "Defender al socio mientras se aclara", intentTags: ["business", "defend_partner"],
      primaryMessage: "Proteges la relación hasta que existan hechos más sólidos.",
      secondaryMessage: "La lealtad evita un juicio prematuro, pero vincula más tu nombre al caso si empeora.",
      primaryEffects: [n("professional.environmentStability", 2)],
      secondaryEffects: [n("professional.publicPolarization", 4)],
      primarySeedTransitions: seed("SEED_BUSINESS_REPUTATION_SHOCK", "A", "defend_partner"),
      secondarySeedTransitions: seed("SEED_BUSINESS_REPUTATION_SHOCK", "A", "defend_partner")
    },
    {
      id: "B", label: "Distanciarte de inmediato", intentTags: ["business", "distance"],
      primaryMessage: "Separas tu imagen de una decisión que no tomaste.",
      secondaryMessage: "El corte protege marca a corto plazo y puede parecer oportunista si el caso se matiza.",
      primaryEffects: [n("professional.publicPolarization", -2), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.environmentStability", -3)],
      primarySeedTransitions: seed("SEED_BUSINESS_REPUTATION_SHOCK", "B", "distance"),
      secondarySeedTransitions: seed("SEED_BUSINESS_REPUTATION_SHOCK", "B", "distance")
    },
    {
      id: "C", label: "Comunicar solo hechos y abrir auditoría independiente", intentTags: ["business", "audit"],
      primaryMessage: "Evitas defender o condenar antes de tiempo y creas una vía independiente para conocer qué ocurrió.",
      secondaryMessage: "La auditoría mejora credibilidad, pero mantiene el asunto vivo y puede encontrar problemas mayores.",
      primaryEffects: [n("professional.institutionalTrust", 3), n("professional.careerControl", 3)],
      secondaryEffects: [n("professional.publicPolarization", 1)],
      primarySeedTransitions: seed("SEED_BUSINESS_REPUTATION_SHOCK", "C", "independent_audit"),
      secondarySeedTransitions: seed("SEED_BUSINESS_REPUTATION_SHOCK", "C", "independent_audit")
    },
    {
      id: "D", label: "No hablar hasta tener información completa", intentTags: ["business", "wait"],
      primaryMessage: "Priorizas precisión y evitas fijar una versión pública antes de conocer los hechos.",
      secondaryMessage: "El silencio reduce riesgo de contradicción y permite que otros definan el relato inicial.",
      primaryEffects: [n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.publicPolarization", 2)],
      primarySeedTransitions: seed("SEED_BUSINESS_REPUTATION_SHOCK", "D", "wait_for_facts"),
      secondarySeedTransitions: seed("SEED_BUSINESS_REPUTATION_SHOCK", "D", "wait_for_facts")
    }
  ],
  tags: ["t51_shifted_prepared", "t51_blocked_wealth_brand_threshold", "t51_distinct_from_EVT_32_IMG_001"],
  canonStatus: "technical_adaptation"
});

const RICH_OFFER_BASE = ambiguousEvent({
  id: "EVT_32_RICH_001",
  ageWindow: [32, 32],
  phase: "30_34",
  family: "market",
  title: "La oferta que paga el resto de tu vida",
  body: "Una liga de enorme capacidad económica te ofrece dos o tres temporadas por una cifra muy superior al mercado europeo, además de rol de embajador.",
  visible: ["Conoces dinero, duración, vivienda, calendario y rol comercial de la propuesta."],
  uncertain: ["No sabes cuánto afectará a selección, competitividad, felicidad o posibilidad de volver después."],
  seedsRead: ["SEED_WEALTHY_PEAK_EXIT"],
  seedsWrite: ["SEED_LATE_RICH_OFFER"],
  choices: [
    {
      id: "A", label: "Aceptar", intentTags: ["rich_offer", "accept"],
      primaryMessage: "Aceptas que el valor de la operación es financiero y de libertad futura además de deportivo.",
      secondaryMessage: "La seguridad económica crece y la distancia competitiva puede hacerlo también.",
      primaryEffects: [n("professional.moneyComfort", 5), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.nationalStanding", -2)],
      primarySeedTransitions: seed("SEED_LATE_RICH_OFFER", "A", "accept"),
      secondarySeedTransitions: seed("SEED_LATE_RICH_OFFER", "A", "accept")
    },
    {
      id: "B", label: "Rechazar por competición", intentTags: ["rich_offer", "reject_competition"],
      primaryMessage: "Priorizas nivel competitivo y continuidad en el contexto deportivo actual.",
      secondaryMessage: "Proteges el objetivo deportivo y renuncias a una oportunidad económica difícil de repetir.",
      primaryEffects: [n("professional.motivationReserve", 3), n("professional.statusInertia", 2)],
      secondaryEffects: [n("professional.moneyComfort", -1)],
      primarySeedTransitions: seed("SEED_LATE_RICH_OFFER", "B", "reject_competition"),
      secondarySeedTransitions: seed("SEED_LATE_RICH_OFFER", "B", "reject_competition")
    },
    {
      id: "C", label: "Pedir un solo año", intentTags: ["rich_offer", "counter_one_year"],
      primaryMessage: "Intentas capturar parte del valor económico sin cerrar varios años de carrera competitiva.",
      secondaryMessage: "La contraoferta preserva opcionalidad y puede destruir una propuesta diseñada para varios años.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.contractPower", 2)],
      secondaryEffects: [n("professional.veteranLeverage", -1)],
      primarySeedTransitions: seed("SEED_LATE_RICH_OFFER", "C", "one_year"),
      secondarySeedTransitions: seed("SEED_LATE_RICH_OFFER", "C", "one_year")
    },
    {
      id: "D", label: "Aceptar solo después del próximo gran torneo", intentTags: ["rich_offer", "defer_after_tournament"],
      primaryMessage: "Intentas separar el siguiente objetivo internacional del cambio de liga.",
      secondaryMessage: "La espera protege ese ciclo y deja abierta la posibilidad de que la oferta desaparezca.",
      primaryEffects: [n("professional.careerControl", 3), n("professional.nationalStanding", 1)],
      secondaryEffects: [n("professional.veteranLeverage", -2)],
      primarySeedTransitions: seed("SEED_LATE_RICH_OFFER", "D", "after_tournament"),
      secondarySeedTransitions: seed("SEED_LATE_RICH_OFFER", "D", "after_tournament")
    }
  ],
  tags: ["t51_shifted_prepared", "t51_blocked_rich_offer_threshold", "t51_offer_bridge_ready", "t51_distinct_from_EVT_32_MKT_001"],
  canonStatus: "technical_adaptation"
});
const RICH_OFFER = {
  ...RICH_OFFER_BASE,
  offerBridge: { choiceActions: { A: "accept", B: "reject", C: "counter", D: "defer" } }
} as EventDefinition & { offerBridge: { choiceActions: Record<string, "accept" | "reject" | "counter" | "defer"> } };

const CONTENDER_BENCH_BASE = ambiguousEvent({
  id: "EVT_32_ELITE_001",
  ageWindow: [32, 32],
  phase: "30_34",
  family: "market",
  title: "Doceavo hombre de un candidato",
  body: "Un club de máximo nivel te ofrece rol explícito de rotación: 20-25 titularidades potenciales, grandes noches según rival y liderazgo.",
  visible: ["Conoces un rol sorprendentemente honesto y una duración corta."],
  uncertain: ["No sabes si veinte titularidades se convertirán en treinta y cinco por rendimiento o en ocho por competencia."],
  seedsRead: ["SEED_SPECIALIST_BIGCLUB"],
  seedsWrite: ["SEED_LATE_CONTENDER_BENCH"],
  choices: [
    {
      id: "A", label: "Aceptar el rol tal como es", intentTags: ["contender", "accept_rotation"],
      primaryMessage: "Aceptas menos volumen a cambio de competir por objetivos máximos con expectativas claras.",
      secondaryMessage: "La honestidad del rol reduce ambigüedad, no el riesgo de acabar jugando todavía menos.",
      primaryEffects: [n("professional.trophyCapital", 4), n("professional.matchSelectivity", 3)],
      secondaryEffects: [n("professional.statusInertia", -2)],
      primarySeedTransitions: seed("SEED_LATE_CONTENDER_BENCH", "A", "accept_rotation"),
      secondarySeedTransitions: seed("SEED_LATE_CONTENDER_BENCH", "A", "accept_rotation")
    },
    {
      id: "B", label: "Preferir ser titular en club menor", intentTags: ["contender", "reject_for_minutes"],
      primaryMessage: "Priorizas centralidad deportiva por encima del techo competitivo del candidato.",
      secondaryMessage: "La elección protege minutos y deja pasar una ventana de títulos que puede no repetirse.",
      primaryEffects: [n("professional.statusInertia", 3), n("professional.motivationReserve", 2)],
      secondaryEffects: [n("professional.trophyCapital", -1)],
      primarySeedTransitions: seed("SEED_LATE_CONTENDER_BENCH", "B", "reject_for_minutes"),
      secondarySeedTransitions: seed("SEED_LATE_CONTENDER_BENCH", "B", "reject_for_minutes")
    },
    {
      id: "C", label: "Pedir bonus por titularidad sin exigirla", intentTags: ["contender", "counter_bonus"],
      primaryMessage: "Aceptas que el once lo decide el entrenador, pero intentas alinear contrato y uso real.",
      secondaryMessage: "La fórmula evita una garantía deportiva y puede parecer una negociación demasiado fina para el club.",
      primaryEffects: [n("professional.contractPower", 3), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.veteranLeverage", -1)],
      primarySeedTransitions: seed("SEED_LATE_CONTENDER_BENCH", "C", "counter_bonus"),
      secondarySeedTransitions: seed("SEED_LATE_CONTENDER_BENCH", "C", "counter_bonus")
    },
    {
      id: "D", label: "Esperar otra oferta", intentTags: ["contender", "defer"],
      primaryMessage: "Mantienes abierta la ventana de mercado sin comprometerte con un rol que todavía dudas.",
      secondaryMessage: "Ganas opcionalidad y arriesgas perder la propuesta más transparente.",
      primaryEffects: [n("professional.careerControl", 3)],
      secondaryEffects: [n("professional.veteranLeverage", -2)],
      primarySeedTransitions: seed("SEED_LATE_CONTENDER_BENCH", "D", "wait"),
      secondarySeedTransitions: seed("SEED_LATE_CONTENDER_BENCH", "D", "wait")
    }
  ],
  tags: ["t51_shifted_prepared", "t51_blocked_trophy_hunger_threshold", "t51_offer_bridge_ready", "t51_distinct_from_EVT_32_CLB_001"],
  canonStatus: "technical_adaptation"
});
const CONTENDER_BENCH = {
  ...CONTENDER_BENCH_BASE,
  offerBridge: { choiceActions: { A: "accept", B: "reject", C: "counter", D: "defer" } }
} as EventDefinition & { offerBridge: { choiceActions: Record<string, "accept" | "reject" | "counter" | "defer"> } };

export const PREPARED_SHIFTED_CANON_30_34_B: EventDefinition[] = [
  FORMAL_MENTOR,
  YOUTH_WAVE,
  BUSINESS_SHOCK,
  RICH_OFFER,
  CONTENDER_BENCH
];
