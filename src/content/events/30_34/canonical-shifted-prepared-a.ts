import type { EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const seed = (seedId: string, choice: string, stance: string) => [
  seedCreate(seedId, 60, { choice, stance })
];

/**
 * Canonical 30-34 shifted principals whose narrative content is owner-complete,
 * but whose final authoritative trigger still belongs to another shared owner.
 * These definitions are deliberately NOT exported through EVENTS_30_34.
 */
const EURO_SEMIFINAL = ambiguousEvent({
  id: "EVT_30_EUR_001",
  ageWindow: [30, 30],
  phase: "30_34",
  family: "sport",
  title: "Semifinal, minuto cero",
  body: "Llegas a una semifinal continental en buena forma, pero el entrenador cree que el rival exige una presión que ahora ejecuta mejor el joven competidor. Te propone entrar en el 55 si el partido sigue vivo.",
  visible: ["Conoces el plan táctico y la conversación privada con el entrenador."],
  uncertain: ["No sabes si el plan es definitivo, si el marcador permitirá ejecutarlo o si tu reacción cambiará una decisión aún abierta."],
  seedsRead: ["SEED_BIG_GAME_BENCH"],
  seedsWrite: ["SEED_BIG_GAME_ROTATION_30"],
  choices: [
    {
      id: "A", label: "Aceptar el rol y prepararte para entrar", intentTags: ["big_game", "accept_rotation"],
      primaryMessage: "Aceptas el plan y preparas tu entrada como una decisión táctica, no como una degradación automática de estatus.",
      secondaryMessage: "La disciplina puede ayudarte a decidir el partido o dejarte sin minutos si el guion cambia.",
      primaryEffects: [n("professional.roleAdaptability", 3), n("professional.institutionalTrust", 2)],
      secondaryEffects: [n("professional.statusInertia", -1)],
      primarySeedTransitions: seed("SEED_BIG_GAME_ROTATION_30", "A", "accept_rotation"),
      secondarySeedTransitions: seed("SEED_BIG_GAME_ROTATION_30", "A", "accept_rotation")
    },
    {
      id: "B", label: "Argumentar por qué debes empezar", intentTags: ["big_game", "argue_start"],
      primaryMessage: "Defiendes tu lectura del partido con argumentos deportivos y obligas al técnico a explicitar su criterio.",
      secondaryMessage: "La defensa de tu sitio puede reforzar tu peso o tensar una decisión que el staff consideraba táctica.",
      primaryEffects: [n("professional.careerControl", 3), n("professional.statusInertia", 2)],
      secondaryEffects: [n("professional.institutionalTrust", -2)],
      primarySeedTransitions: seed("SEED_BIG_GAME_ROTATION_30", "B", "argue_start"),
      secondarySeedTransitions: seed("SEED_BIG_GAME_ROTATION_30", "B", "argue_start")
    },
    {
      id: "C", label: "Pedir comenzar si el equipo defiende más bajo", intentTags: ["big_game", "conditional_start"],
      primaryMessage: "Conviertes la discusión de jerarquía en una condición táctica verificable.",
      secondaryMessage: "La propuesta puede abrir una ruta útil o añadir complejidad a un plan ya trabajado.",
      primaryEffects: [n("professional.tacticalReading", 3), n("professional.roleAdaptability", 2)],
      secondaryEffects: [n("professional.institutionalTrust", -1)],
      primarySeedTransitions: seed("SEED_BIG_GAME_ROTATION_30", "C", "conditional_start"),
      secondarySeedTransitions: seed("SEED_BIG_GAME_ROTATION_30", "C", "conditional_start")
    },
    {
      id: "D", label: "Mostrar desacuerdo pero prometer no filtrarlo", intentTags: ["big_game", "private_disagreement"],
      primaryMessage: "Dejas clara tu discrepancia sin convertirla en una crisis pública antes de la semifinal.",
      secondaryMessage: "La privacidad protege al equipo, aunque el técnico registra que no compartes el plan.",
      primaryEffects: [n("professional.careerControl", 2), n("professional.publicPolarization", -2)],
      secondaryEffects: [n("professional.institutionalTrust", -1)],
      primarySeedTransitions: seed("SEED_BIG_GAME_ROTATION_30", "D", "private_disagreement"),
      secondarySeedTransitions: seed("SEED_BIG_GAME_ROTATION_30", "D", "private_disagreement")
    }
  ],
  tags: ["t51_shifted_prepared", "t51_blocked_sport_stage_authority", "t51_distinct_from_EVT_30_FINAL_001"],
  canonStatus: "technical_adaptation"
});

const MATCH_500 = ambiguousEvent({
  id: "EVT_30_RECORD_001",
  ageWindow: [30, 30],
  phase: "30_34",
  family: "legacy",
  title: "Partido 500",
  body: "Tu siguiente aparición puede ser la número 500 con el club o en una competición relevante, pero coincide con una semana en la que el staff recomendaba descanso.",
  visible: ["Conoces el hito, el rival y la recomendación física."],
  uncertain: ["No sabes si alcanzar el hito hoy cambiará algo ni si esperar puede retrasarlo por lesión o rotación."],
  seedsRead: ["SEED_RECORD_CHASE"],
  seedsWrite: ["SEED_MILESTONE_CHASE_500"],
  choices: [
    {
      id: "A", label: "Pedir jugar aunque sea 20 minutos", intentTags: ["record", "appearance"],
      primaryMessage: "Intentas alcanzar el hito sin convertirlo en una titularidad completa.",
      secondaryMessage: "Incluso pocos minutos añaden carga y pueden hacer que el récord condicione una semana que debía ser de descanso.",
      primaryEffects: [n("professional.legacyCapital", 3), n("professional.recoveryDebt", 2)],
      secondaryEffects: [n("professional.recoveryDebt", 4)],
      primarySeedTransitions: seed("SEED_MILESTONE_CHASE_500", "A", "ask_twenty_minutes"),
      secondarySeedTransitions: seed("SEED_MILESTONE_CHASE_500", "A", "ask_twenty_minutes")
    },
    {
      id: "B", label: "Respetar descanso", intentTags: ["record", "rest"],
      primaryMessage: "Priorizas la semana de recuperación aunque el número redondo tenga que esperar.",
      secondaryMessage: "El cuerpo gana margen, pero nadie puede garantizar cuándo llegará la siguiente aparición.",
      primaryEffects: [n("professional.recoveryDebt", -4), n("professional.matchSelectivity", 2)],
      secondaryEffects: [n("professional.motivationReserve", -1)],
      primarySeedTransitions: seed("SEED_MILESTONE_CHASE_500", "B", "respect_rest"),
      secondarySeedTransitions: seed("SEED_MILESTONE_CHASE_500", "B", "respect_rest")
    },
    {
      id: "C", label: "Dejar decisión al entrenador", intentTags: ["record", "coach_decides"],
      primaryMessage: "Evitas transformar el hito en una exigencia y dejas el reparto de minutos al criterio deportivo.",
      secondaryMessage: "La neutralidad reduce presión pública, aunque también cede control sobre una fecha irrepetible.",
      primaryEffects: [n("professional.institutionalTrust", 2)],
      secondaryEffects: [n("professional.careerControl", -2)],
      primarySeedTransitions: seed("SEED_MILESTONE_CHASE_500", "C", "coach_decides"),
      secondarySeedTransitions: seed("SEED_MILESTONE_CHASE_500", "C", "coach_decides")
    },
    {
      id: "D", label: "Jugar solo si el partido necesita tu entrada", intentTags: ["record", "match_need"],
      primaryMessage: "Vinculas el hito a una necesidad real del partido y no al número en sí.",
      secondaryMessage: "La condición protege el sentido deportivo, pero puede dejar el récord pendiente indefinidamente.",
      primaryEffects: [n("professional.matchSelectivity", 3), n("professional.legacyCapital", 1)],
      secondaryEffects: [n("professional.motivationReserve", -1)],
      primarySeedTransitions: seed("SEED_MILESTONE_CHASE_500", "D", "only_if_needed"),
      secondarySeedTransitions: seed("SEED_MILESTONE_CHASE_500", "D", "only_if_needed")
    }
  ],
  tags: ["t51_shifted_prepared", "t51_blocked_sport_milestone_authority", "t51_distinct_from_EVT_31_REC_001"],
  canonStatus: "technical_adaptation"
});

const PAIN_WITHOUT_SCAN = ambiguousEvent({
  id: "EVT_30_PAIN_001",
  ageWindow: [30, 30],
  phase: "30_34",
  family: "medical",
  title: "Duele, pero la imagen está limpia",
  body: "Sientes dolor persistente que limita algunos gestos, pero resonancia y pruebas no muestran una lesión clara. El club dice que puedes jugar según tolerancia.",
  visible: ["Conoces los resultados negativos de imagen y tu escala subjetiva de dolor."],
  uncertain: ["No sabes si es irritación menor, señal temprana o dolor que no implica daño estructural."],
  seedsRead: ["SEED_MEDICAL_AUTHORITY"],
  seedsWrite: ["SEED_PAIN_WITHOUT_SCAN"],
  choices: [
    {
      id: "A", label: "Seguir jugando con gestión", intentTags: ["pain", "managed_play"],
      primaryMessage: "Mantienes disponibilidad con una carga vigilada y criterios explícitos de parada.",
      secondaryMessage: "La gestión puede ser suficiente o permitir que un patrón todavía invisible gane peso.",
      primaryEffects: [n("professional.matchSelectivity", 2), n("professional.recoveryDebt", 2)],
      secondaryEffects: [n("body.risk", 4), n("professional.recoveryDebt", 3)],
      primarySeedTransitions: seed("SEED_PAIN_WITHOUT_SCAN", "A", "managed_play"),
      secondarySeedTransitions: seed("SEED_PAIN_WITHOUT_SCAN", "A", "managed_play")
    },
    {
      id: "B", label: "Parar hasta estar sin dolor", intentTags: ["pain", "stop"],
      primaryMessage: "Tratas el dolor como un límite suficiente aunque la imagen no muestre daño.",
      secondaryMessage: "El descanso protege el cuerpo pero puede no resolver el dolor y sí alterar tu rol.",
      primaryEffects: [n("body.risk", -5), n("professional.recoveryDebt", -4)],
      secondaryEffects: [n("sport.roleScore", -2)],
      primarySeedTransitions: seed("SEED_PAIN_WITHOUT_SCAN", "B", "stop_until_pain_free"),
      secondarySeedTransitions: seed("SEED_PAIN_WITHOUT_SCAN", "B", "stop_until_pain_free")
    },
    {
      id: "C", label: "Cambiar carga y posición temporalmente", intentTags: ["pain", "adapt_role"],
      primaryMessage: "Buscas una solución intermedia reduciendo gestos que disparan dolor sin desaparecer de la competición.",
      secondaryMessage: "La adaptación puede aliviar la carga o mover el problema sin resolver su causa.",
      primaryEffects: [n("professional.roleAdaptability", 3), n("professional.recoveryDebt", -2)],
      secondaryEffects: [n("professional.statusInertia", -1)],
      primarySeedTransitions: seed("SEED_PAIN_WITHOUT_SCAN", "C", "temporary_adaptation"),
      secondarySeedTransitions: seed("SEED_PAIN_WITHOUT_SCAN", "C", "temporary_adaptation")
    },
    {
      id: "D", label: "Buscar especialista en dolor crónico o deportivo", intentTags: ["pain", "specialist"],
      primaryMessage: "Amplías la información médica sin convertir una prueba limpia en ausencia de problema.",
      secondaryMessage: "Otra opinión puede aclarar el plan o aumentar la incertidumbre con un enfoque distinto.",
      primaryEffects: [n("professional.careerControl", 3), n("professional.recoveryMargin", 2)],
      secondaryEffects: [n("professional.environmentStability", -1)],
      primarySeedTransitions: seed("SEED_PAIN_WITHOUT_SCAN", "D", "specialist"),
      secondarySeedTransitions: seed("SEED_PAIN_WITHOUT_SCAN", "D", "specialist")
    }
  ],
  tags: ["t51_shifted_prepared", "t51_blocked_medical_pain_scan_authority", "t51_distinct_from_EVT_33_MED_001"],
  canonStatus: "technical_adaptation"
});

const NANO_CALL = ambiguousEvent({
  id: "EVT_30_NANO_001",
  ageWindow: [30, 30],
  phase: "30_34",
  family: "social",
  title: "Nano necesita una llamada",
  body: "Nano, cuya carrera ha seguido su propio camino, te pide que llames a un director deportivo que conoces. Dice que no quiere que le consigas contrato, solo que consiga una reunión.",
  visible: ["Conoces su situación deportiva y el contacto concreto que te pide."],
  uncertain: ["No sabes si recomendarlo dañará tu credibilidad ni cuánto de su versión del mercado es completa."],
  seedsRead: ["SEED_NANO_SHADOW"],
  seedsWrite: ["SEED_OLD_NETWORK_FAVOR"],
  npcRefs: ["NPC_PLR_14"],
  choices: [
    {
      id: "A", label: "Llamar y recomendar solo una reunión", intentTags: ["network", "limited_intro"],
      primaryMessage: "Usas tu red para abrir una conversación sin avalar un fichaje.",
      secondaryMessage: "La distinción es clara para ti, aunque el contacto puede interpretar la llamada como una recomendación implícita.",
      primaryEffects: [n("professional.legacyCapital", 2), n("professional.careerControl", 1)],
      secondaryEffects: [n("professional.publicPolarization", 1)],
      primarySeedTransitions: seed("SEED_OLD_NETWORK_FAVOR", "A", "meeting_only"),
      secondarySeedTransitions: seed("SEED_OLD_NETWORK_FAVOR", "A", "meeting_only")
    },
    {
      id: "B", label: "Recomendarlo deportivamente con tu nombre", intentTags: ["network", "endorse"],
      primaryMessage: "Pones parte de tu credibilidad detrás de su nivel deportivo.",
      secondaryMessage: "La ayuda puede abrir una puerta o convertir su siguiente resultado en un coste reputacional compartido.",
      primaryEffects: [n("professional.legacyCapital", 3)],
      secondaryEffects: [n("professional.publicPolarization", 2)],
      primarySeedTransitions: seed("SEED_OLD_NETWORK_FAVOR", "B", "sporting_endorsement"),
      secondarySeedTransitions: seed("SEED_OLD_NETWORK_FAVOR", "B", "sporting_endorsement")
    },
    {
      id: "C", label: "Negarte y explicar que no mezclas reputación", intentTags: ["network", "refuse"],
      primaryMessage: "Proteges la frontera profesional y explicas que tu nombre no funciona como aval de mercado.",
      secondaryMessage: "La decisión conserva independencia y puede sentirse como abandono en una relación antigua.",
      primaryEffects: [n("professional.careerControl", 3)],
      secondaryEffects: [n("professional.motivationReserve", -1)],
      primarySeedTransitions: seed("SEED_OLD_NETWORK_FAVOR", "C", "refuse_reputation"),
      secondarySeedTransitions: seed("SEED_OLD_NETWORK_FAVOR", "C", "refuse_reputation")
    },
    {
      id: "D", label: "Pasarle el contacto para que escriba él", intentTags: ["network", "self_contact"],
      primaryMessage: "Compartes acceso sin hablar por él ni convertir tu prestigio en garantía.",
      secondaryMessage: "Le das autonomía, aunque el mero origen del contacto puede seguir revelando tu intervención.",
      primaryEffects: [n("professional.careerControl", 2), n("professional.legacyCapital", 1)],
      secondaryEffects: [n("professional.publicPolarization", 1)],
      primarySeedTransitions: seed("SEED_OLD_NETWORK_FAVOR", "D", "share_contact"),
      secondarySeedTransitions: seed("SEED_OLD_NETWORK_FAVOR", "D", "share_contact")
    }
  ],
  tags: ["t51_shifted_prepared", "t51_blocked_network_power_threshold", "t51_distinct_from_EVT_33_NET_001"],
  canonStatus: "technical_adaptation"
});

const RELOCATION_LIMIT = ambiguousEvent({
  id: "EVT_31_FAM_001",
  ageWindow: [31, 31],
  phase: "30_34",
  family: "family",
  title: "No quiero otra mudanza",
  body: "Una persona central de tu entorno te dice que apoyará cualquier decisión, pero que personalmente no quiere volver a cambiar de país. No es un ultimátum.",
  visible: ["Conoces una preferencia honesta del entorno y los términos de una propuesta exterior."],
  uncertain: ["No sabes si rechazar la oferta generará arrepentimiento tuyo o si mudarte generará resentimiento ajeno."],
  seedsRead: ["SEED_FAMILY_ANCHOR"],
  seedsWrite: ["SEED_RELOCATION_LIMIT"],
  choices: [
    {
      id: "A", label: "Rechazar la mudanza", intentTags: ["family", "reject_move"],
      primaryMessage: "Das prioridad explícita a la estabilidad del entorno y rechazas que la carrera decida siempre la geografía familiar.",
      secondaryMessage: "La estabilidad gana peso, pero una oportunidad deportiva o económica concreta desaparece.",
      primaryEffects: [n("professional.environmentStability", 4), n("professional.homePull", 2)],
      secondaryEffects: [n("professional.veteranLeverage", -2)],
      primarySeedTransitions: seed("SEED_RELOCATION_LIMIT", "A", "reject_move"),
      secondarySeedTransitions: seed("SEED_RELOCATION_LIMIT", "A", "reject_move")
    },
    {
      id: "B", label: "Aceptarla aun sabiendo el coste", intentTags: ["family", "accept_move"],
      primaryMessage: "Eliges la oportunidad exterior sin fingir que la mudanza es neutral para tu entorno.",
      secondaryMessage: "La carrera gana una puerta y la estabilidad familiar absorbe un coste real.",
      primaryEffects: [n("professional.careerControl", 2), n("professional.foreignAdaptation", 2)],
      secondaryEffects: [n("professional.environmentStability", -4)],
      primarySeedTransitions: seed("SEED_RELOCATION_LIMIT", "B", "accept_move"),
      secondarySeedTransitions: seed("SEED_RELOCATION_LIMIT", "B", "accept_move")
    },
    {
      id: "C", label: "Proponer vivir parte de la semana separados", intentTags: ["family", "hybrid"],
      primaryMessage: "Buscas una solución híbrida que preserve la oferta sin exigir una mudanza completa.",
      secondaryMessage: "La fórmula reduce el choque inicial y puede multiplicar viajes, cansancio y distancia emocional.",
      primaryEffects: [n("professional.relocationTolerance", 2), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.environmentStability", -2), n("professional.recoveryDebt", 1)],
      primarySeedTransitions: seed("SEED_RELOCATION_LIMIT", "C", "hybrid_week"),
      secondarySeedTransitions: seed("SEED_RELOCATION_LIMIT", "C", "hybrid_week")
    },
    {
      id: "D", label: "Pedir al club una fórmula de viajes o temporada flexible", intentTags: ["family", "flexible_terms"],
      primaryMessage: "Intentas trasladar parte del coste de la mudanza al diseño práctico de la propuesta.",
      secondaryMessage: "La negociación puede reconocer el problema sin que el club acepte una solución viable.",
      primaryEffects: [n("professional.careerControl", 3), n("professional.contractPower", 1)],
      secondaryEffects: [n("professional.veteranLeverage", -1)],
      primarySeedTransitions: seed("SEED_RELOCATION_LIMIT", "D", "ask_flexible_formula"),
      secondarySeedTransitions: seed("SEED_RELOCATION_LIMIT", "D", "ask_flexible_formula")
    }
  ],
  tags: ["t51_shifted_prepared", "t51_blocked_family_anchor_threshold", "t51_blocked_external_offer_authority", "t51_distinct_from_EVT_30_LIFE_001"],
  canonStatus: "technical_adaptation"
});

export const PREPARED_SHIFTED_CANON_30_34_A: EventDefinition[] = [
  EURO_SEMIFINAL,
  MATCH_500,
  PAIN_WITHOUT_SCAN,
  NANO_CALL,
  RELOCATION_LIMIT
];
