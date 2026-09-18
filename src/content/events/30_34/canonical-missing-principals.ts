import type { EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const seed = (seedId: string, choice: string, approach: string) => [
  seedCreate(seedId, 60, { choice, approach })
];

const ROLE_COMMUNICATION = ambiguousEvent({
  id: "EVT_30_CCH_001",
  ageWindow: [30, 30],
  phase: "30_34",
  family: "captaincy",
  title: "Te enteras por la pizarra",
  body: "Después de años de jerarquía, descubres una rotación importante al ver el once en la charla. No hubo conversación previa.",
  visible: [
    "Ves el once oficial y recibes una explicación táctica breve."
  ],
  uncertain: [
    "No sabes si fue olvido, una decisión deliberada para evitar presión o una nueva política del técnico."
  ],
  gates: [
    { path: "facts.playerClubLeadership.currentRole", op: "eq", value: "captain" }
  ],
  seedsWrite: ["SEED_ROLE_COMMUNICATION"],
  choices: [
    {
      id: "A",
      label: "Hablar con el entrenador después del partido",
      intentTags: ["role_communication", "direct_private"],
      primaryMessage: "Separáis la decisión deportiva de la forma en que se comunicó y acordáis un canal más claro.",
      secondaryMessage: "La conversación aclara posiciones, pero el entrenador interpreta la petición como presión sobre su autonomía.",
      primaryEffects: [n("professional.careerControl", 3), n("professional.institutionalTrust", 2)],
      secondaryEffects: [n("professional.careerControl", 1), n("professional.institutionalTrust", -2)],
      primarySeedTransitions: seed("SEED_ROLE_COMMUNICATION", "A", "direct_after_match"),
      secondarySeedTransitions: seed("SEED_ROLE_COMMUNICATION", "A", "direct_after_match")
    },
    {
      id: "B",
      label: "Preguntar antes de salir al calentamiento",
      intentTags: ["role_communication", "immediate_clarity"],
      primaryMessage: "Obtienes una explicación inmediata y sales a calentar sabiendo qué espera el técnico.",
      secondaryMessage: "La urgencia de la pregunta se lee como una discusión de jerarquía en un momento poco adecuado.",
      primaryEffects: [n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.institutionalTrust", -2)],
      primarySeedTransitions: seed("SEED_ROLE_COMMUNICATION", "B", "ask_before_warmup"),
      secondarySeedTransitions: seed("SEED_ROLE_COMMUNICATION", "B", "ask_before_warmup")
    },
    {
      id: "C",
      label: "No decir nada y responder en el campo cuando toque",
      intentTags: ["role_communication", "silent_response"],
      primaryMessage: "No conviertes la suplencia en un conflicto y mantienes el foco competitivo.",
      secondaryMessage: "El silencio evita fricción hoy, pero deja intacto el problema de enterarte de cambios importantes sin conversación previa.",
      primaryEffects: [n("professional.motivationReserve", 2)],
      secondaryEffects: [n("professional.careerControl", -2)],
      primarySeedTransitions: seed("SEED_ROLE_COMMUNICATION", "C", "silent_response"),
      secondarySeedTransitions: seed("SEED_ROLE_COMMUNICATION", "C", "silent_response")
    },
    {
      id: "D",
      label: "Pedir a un líder del vestuario que aclare el criterio general",
      intentTags: ["role_communication", "locker_process"],
      primaryMessage: "La cuestión se convierte en una regla general de comunicación para el vestuario y no solo en tu queja.",
      secondaryMessage: "Involucrar al vestuario puede parecer una maniobra de poder aunque el problema de proceso sea real.",
      primaryEffects: [n("professional.lockerPower", 3), n("professional.careerControl", 1)],
      secondaryEffects: [n("professional.institutionalTrust", -2), n("professional.lockerPower", 1)],
      primarySeedTransitions: seed("SEED_ROLE_COMMUNICATION", "D", "locker_process"),
      secondarySeedTransitions: seed("SEED_ROLE_COMMUNICATION", "D", "locker_process")
    }
  ],
  tags: [
    "t51_canonical_missing_addition",
    "t51_captain_route_authoritative",
    "t51_status_inertia_route_pending_canon_threshold"
  ],
  canonStatus: "technical_adaptation"
});

const FALSE_ULTIMATUM = ambiguousEvent({
  id: "EVT_30_PRS_001",
  ageWindow: [30, 30],
  phase: "30_34",
  family: "press",
  title: "El ultimátum que nunca diste",
  body: "Un periodista publica que has amenazado con irte si sigues rotando. La frase no existe, pero alguien de tu entorno sí comentó que estabas frustrado.",
  visible: ["Ves el artículo, la reacción del club y un posible origen difuso de la historia."],
  uncertain: ["No sabes quién habló ni si desmentir hará la noticia más grande."],
  seedsWrite: ["SEED_FALSE_ULTIMATUM"],
  choices: [
    {
      id: "A", label: "Desmentir con claridad", intentTags: ["deny", "clarity"],
      primaryMessage: "Niega una frase que nunca dijiste sin convertir la rotación en una amenaza contractual.",
      secondaryMessage: "El desmentido limpia tu posición, pero prolonga una noticia que algunos ya interpretaban como síntoma.",
      primaryEffects: [n("professional.institutionalTrust", 2), n("professional.publicPolarization", -2)],
      secondaryEffects: [n("professional.publicPolarization", 2)],
      primarySeedTransitions: seed("SEED_FALSE_ULTIMATUM", "A", "clear_denial"),
      secondarySeedTransitions: seed("SEED_FALSE_ULTIMATUM", "A", "clear_denial")
    },
    {
      id: "B", label: "No responder", intentTags: ["silence"],
      primaryMessage: "La noticia pierde oxígeno sin una segunda declaración.",
      secondaryMessage: "El silencio evita escalarla, aunque una parte del entorno lo toma como confirmación.",
      primaryEffects: [n("professional.environmentStability", 2)],
      secondaryEffects: [n("professional.publicPolarization", 2)],
      primarySeedTransitions: seed("SEED_FALSE_ULTIMATUM", "B", "silence"),
      secondarySeedTransitions: seed("SEED_FALSE_ULTIMATUM", "B", "silence")
    },
    {
      id: "C", label: "Decir que quieres jugar más sin hablar de salida", intentTags: ["role_clarity", "no_exit_threat"],
      primaryMessage: "Reconoces la frustración deportiva sin convertirla en una amenaza de salida.",
      secondaryMessage: "La distinción es real, pero titulares y club pueden seguir mezclando deseo de minutos con futuro contractual.",
      primaryEffects: [n("professional.careerControl", 3)],
      secondaryEffects: [n("professional.institutionalTrust", -1)],
      primarySeedTransitions: seed("SEED_FALSE_ULTIMATUM", "C", "minutes_not_exit"),
      secondarySeedTransitions: seed("SEED_FALSE_ULTIMATUM", "C", "minutes_not_exit")
    },
    {
      id: "D", label: "Preguntar internamente quién habló antes de reaccionar", intentTags: ["investigate", "private"],
      primaryMessage: "Buscas primero la ruta de la filtración antes de fijar una posición pública.",
      secondaryMessage: "Ganas contexto, pero mientras investigas otros actores fijan la primera versión de la historia.",
      primaryEffects: [n("professional.careerControl", 3), n("professional.institutionalTrust", 1)],
      secondaryEffects: [n("professional.publicPolarization", 1)],
      primarySeedTransitions: seed("SEED_FALSE_ULTIMATUM", "D", "trace_source"),
      secondarySeedTransitions: seed("SEED_FALSE_ULTIMATUM", "D", "trace_source")
    }
  ],
  tags: ["t51_canonical_missing_prepared", "t51_blocked_role_discussion_authority"],
  canonStatus: "technical_adaptation"
});

const NATIONAL_ABSENCE = ambiguousEvent({
  id: "EVT_30_NAT_002",
  ageWindow: [30, 30],
  phase: "30_34",
  family: "selection",
  title: "La selección gana sin ti",
  body: "Descansas o quedas fuera de una ventana internacional y tu selección juega muy bien con un joven en tu posición. La prensa pregunta si el equipo ha encontrado la transición.",
  visible: ["Ves el partido, el análisis posterior y las declaraciones públicas del seleccionador."],
  uncertain: ["No sabes si el joven será rival permanente, complemento o simplemente aprovechó un buen día."],
  seedsWrite: ["SEED_NATIONAL_ABSENCE"],
  choices: [
    {
      id: "A", label: "Felicitarlo públicamente", intentTags: ["support", "national_team"],
      primaryMessage: "Reconoces el rendimiento del joven sin convertir la situación en una guerra generacional.",
      secondaryMessage: "El gesto rebaja tensión pública, aunque también hace más cómoda una transición sin ti.",
      primaryEffects: [n("professional.publicMyth", 2), n("professional.nationalStanding", 1)],
      secondaryEffects: [n("professional.statusInertia", -1)],
      primarySeedTransitions: seed("SEED_NATIONAL_ABSENCE", "A", "public_congratulation"),
      secondarySeedTransitions: seed("SEED_NATIONAL_ABSENCE", "A", "public_congratulation")
    },
    {
      id: "B", label: "Recordar que quieres competir por el puesto", intentTags: ["compete", "national_team"],
      primaryMessage: "Dejas claro que una buena ventana del equipo no cambia tu voluntad de competir por el puesto.",
      secondaryMessage: "La ambición mantiene presión deportiva y puede alimentar una narrativa de choque generacional.",
      primaryEffects: [n("professional.motivationReserve", 3), n("professional.nationalStanding", 1)],
      secondaryEffects: [n("professional.publicPolarization", 2)],
      primarySeedTransitions: seed("SEED_NATIONAL_ABSENCE", "B", "compete_for_place"),
      secondarySeedTransitions: seed("SEED_NATIONAL_ABSENCE", "B", "compete_for_place")
    },
    {
      id: "C", label: "No entrar en narrativa generacional", intentTags: ["no_narrative", "national_team"],
      primaryMessage: "Evitas comparar carreras y dejas que la siguiente convocatoria responda con hechos.",
      secondaryMessage: "No alimentas el debate, pero tampoco obtienes información sobre tu posición en el siguiente ciclo.",
      primaryEffects: [n("professional.environmentStability", 2)],
      secondaryEffects: [n("professional.careerControl", -1)],
      primarySeedTransitions: seed("SEED_NATIONAL_ABSENCE", "C", "avoid_generational_frame"),
      secondarySeedTransitions: seed("SEED_NATIONAL_ABSENCE", "C", "avoid_generational_frame")
    },
    {
      id: "D", label: "Llamar al seleccionador en privado para saber el plan", intentTags: ["private_call", "national_team"],
      primaryMessage: "Intentas separar el ruido público del plan deportivo real del seleccionador.",
      secondaryMessage: "La llamada puede aclarar intención, pero no convierte una conversación privada en garantía de convocatoria.",
      primaryEffects: [n("professional.careerControl", 3), n("professional.nationalStanding", 1)],
      secondaryEffects: [n("professional.motivationReserve", -1)],
      primarySeedTransitions: seed("SEED_NATIONAL_ABSENCE", "D", "private_selector_call"),
      secondarySeedTransitions: seed("SEED_NATIONAL_ABSENCE", "D", "private_selector_call")
    }
  ],
  tags: ["t51_canonical_missing_prepared", "t51_blocked_national_match_authority"],
  canonStatus: "technical_adaptation"
});

const SPECIALIST_BIGCLUB = ambiguousEvent({
  id: "EVT_30_JAN_001",
  ageWindow: [30, 30],
  phase: "30_34",
  family: "market",
  title: "Enero: especialista de lujo",
  body: "Un gigante europeo pregunta por una cesión o traspaso corto para usarte en grandes noches y rotaciones. Jugarías menos liga que ahora, pero entrarías en una plantilla con opciones reales de título máximo.",
  visible: ["Conoces duración, salario, expectativa de minutos y competiciones de la propuesta."],
  uncertain: ["No sabes si acabarás siendo un arma de banquillo útil o simple seguro de plantilla."],
  seedsWrite: ["SEED_SPECIALIST_BIGCLUB"],
  choices: [
    {
      id: "A", label: "Aceptar el rol especialista", intentTags: ["specialist", "accept_role"],
      primaryMessage: "Aceptas que el valor del movimiento está en las noches grandes y no en acumular titularidades de liga.",
      secondaryMessage: "El proyecto puede darte un gran título o reducirte a seguro de plantilla.",
      primaryEffects: [n("professional.trophyCapital", 3), n("professional.statusInertia", 1)],
      secondaryEffects: [n("sport.roleScore", -3)],
      primarySeedTransitions: seed("SEED_SPECIALIST_BIGCLUB", "A", "accept_specialist"),
      secondarySeedTransitions: seed("SEED_SPECIALIST_BIGCLUB", "A", "accept_specialist")
    },
    {
      id: "B", label: "Quedarte donde juegas más", intentTags: ["minutes", "stay"],
      primaryMessage: "Priorizas continuidad de minutos frente al prestigio del escudo.",
      secondaryMessage: "Conservas rol y dejas pasar una oportunidad que quizá no vuelva con el mismo contexto.",
      primaryEffects: [n("professional.environmentStability", 3), n("sport.roleScore", 2)],
      secondaryEffects: [n("professional.veteranLeverage", -1)],
      primarySeedTransitions: seed("SEED_SPECIALIST_BIGCLUB", "B", "stay_for_minutes"),
      secondarySeedTransitions: seed("SEED_SPECIALIST_BIGCLUB", "B", "stay_for_minutes")
    },
    {
      id: "C", label: "Pedir obligación u objetivo de minutos", intentTags: ["minutes_target", "counter"],
      primaryMessage: "Intentas convertir una promesa de rotación en una condición deportiva comprobable.",
      secondaryMessage: "El club puede aceptar aclarar expectativas sin convertirlas en una obligación contractual real.",
      primaryEffects: [n("professional.careerControl", 3), n("professional.contractPower", 2)],
      secondaryEffects: [n("professional.veteranLeverage", 1)],
      primarySeedTransitions: seed("SEED_SPECIALIST_BIGCLUB", "C", "minutes_target"),
      secondarySeedTransitions: seed("SEED_SPECIALIST_BIGCLUB", "C", "minutes_target")
    },
    {
      id: "D", label: "Aceptar solo si el movimiento es definitivo y corto", intentTags: ["short_transfer", "no_loan"],
      primaryMessage: "Aceptas el riesgo deportivo solo con una salida contractual limpia y breve.",
      secondaryMessage: "La condición protege control futuro y puede hacer que el gigante abandone la operación.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.contractPower", 2)],
      secondaryEffects: [n("professional.veteranLeverage", -1)],
      primarySeedTransitions: seed("SEED_SPECIALIST_BIGCLUB", "D", "short_definitive_move"),
      secondarySeedTransitions: seed("SEED_SPECIALIST_BIGCLUB", "D", "short_definitive_move")
    }
  ],
  tags: ["t51_canonical_missing_prepared", "t51_blocked_specialist_offer_authority"],
  canonStatus: "technical_adaptation"
});

const FORM_VS_PLAN = ambiguousEvent({
  id: "EVT_31_ROLE_001",
  ageWindow: [31, 31],
  phase: "30_34",
  family: "team",
  title: "Tres goles y al banquillo",
  body: "Marcas tres goles en dos partidos, pero el técnico vuelve al plan de rotación previsto. Para la prensa es incomprensible; para él, la racha no cambia la carga objetivo.",
  visible: ["Ves una forma excelente y recibes la explicación del entrenador sobre el plan veterano."],
  uncertain: ["No sabes si la disciplina del plan es inteligente o si el técnico infravalora tu momento."],
  choices: [
    {
      id: "A", label: "Aceptar coherencia del plan", intentTags: ["accept_plan", "load_management"],
      primaryMessage: "Mantienes la lógica pactada aunque la racha invite a pedir más.",
      secondaryMessage: "La gestión puede sostener tu rendimiento o enfriar un momento excepcional.",
      primaryEffects: [n("professional.matchSelectivity", 3), n("professional.recoveryDebt", -2)],
      secondaryEffects: [n("professional.statusInertia", -1)]
    },
    {
      id: "B", label: "Pedir excepción por forma", intentTags: ["form_exception"],
      primaryMessage: "Pides que el plan responda también a lo que está ocurriendo en el campo.",
      secondaryMessage: "La excepción puede aprovechar la racha o romper la disciplina de carga que pretendía protegerte.",
      primaryEffects: [n("professional.careerControl", 3), n("sport.roleScore", 2)],
      secondaryEffects: [n("professional.recoveryDebt", 3)]
    },
    {
      id: "C", label: "Hacer pública solo tu disponibilidad, sin criticar", intentTags: ["public_availability", "no_criticism"],
      primaryMessage: "Dejas constancia de que estás disponible sin convertir la rotación en una crítica al entrenador.",
      secondaryMessage: "La frase es prudente, pero puede presionar al técnico a través de la conversación pública.",
      primaryEffects: [n("professional.publicMyth", 1)],
      secondaryEffects: [n("professional.institutionalTrust", -1)]
    },
    {
      id: "D", label: "Cambiar objetivos individuales para medir impacto por 90 minutos", intentTags: ["impact_per_90", "adapt_objectives"],
      primaryMessage: "Redefines éxito para que menos minutos no equivalgan automáticamente a una peor temporada.",
      secondaryMessage: "La adaptación protege perspectiva, aunque también puede normalizar un rol menor del que aún podrías sostener.",
      primaryEffects: [n("professional.roleAdaptability", 3), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.statusInertia", -1)]
    }
  ],
  tags: [
    "t51_canonical_missing_prepared",
    "t51_blocked_three_goals_and_bench_authority",
    "t51_blocked_SEED_FORM_VS_PLAN_identity"
  ],
  canonStatus: "technical_adaptation"
});

export const BLOCKED_CANONICAL_ADDITIONS_30_34: EventDefinition[] = [
  FALSE_ULTIMATUM,
  NATIONAL_ABSENCE,
  SPECIALIST_BIGCLUB,
  FORM_VS_PLAN
];

export const CANONICAL_ADDITIONS_30_34: EventDefinition[] = [
  ROLE_COMMUNICATION
];
