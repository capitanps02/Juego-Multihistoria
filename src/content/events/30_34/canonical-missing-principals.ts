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
  timeWindow: { months: [1] },
  gates: [{ path: "facts.pendingCareerOffer.terms.bigClub", op: "eq", value: true }],
  gateAlternatives: [
    [{ path: "facts.pendingCareerOfferKind", op: "eq", value: "transfer" }],
    [{ path: "facts.pendingCareerOfferKind", op: "eq", value: "loan" }]
  ],
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
  tags: ["t51_canonical_missing_addition", "t51_offer_authority_bridge", "t51_bigclub_offer_required"],
  canonStatus: "technical_adaptation"
});

const SPECIALIST_BIGCLUB_ACTIVE = {
  ...SPECIALIST_BIGCLUB,
  offerBridge: { choiceActions: { A: "accept", B: "reject", C: "counter", D: "counter" } }
} as EventDefinition & { offerBridge: { choiceActions: Record<string, "accept" | "reject" | "counter"> } };

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


const VETERAN_LABEL_BRIDGE = ambiguousEvent({
  id: "EVT_30_BRIDGE_001",
  ageWindow: [30, 30],
  phase: "30_34",
  family: "legacy",
  title: "La palabra veterano",
  body: "En la primera reunión del verano el entrenador utiliza por primera vez contigo la palabra «veterano». No habla de retirarte: quiere administrar mejor tus semanas y reservarte para partidos que deciden temporadas.",
  visible: ["Ves un plan orientativo de minutos, calendario y el discurso del técnico."],
  uncertain: ["No sabes si «administrar» significa protegerte, reducirte o preparar al sucesor."],
  timeWindow: { months: [7, 8] },
  seedsRead: ["SEED_AGE30_PRIORITY"],
  seedsWrite: ["SEED_VETERAN_LABEL"],
  choices: [
    {
      id: "A", label: "Aceptar la gestión si se revisa cada mes", intentTags: ["veteran_management", "monthly_review"],
      primaryMessage: "Aceptas gestionar semanas con una revisión periódica que impida convertir el plan en una reducción silenciosa de rol.",
      secondaryMessage: "La gestión protege carga, pero una sucesión deportiva puede avanzar mientras esperas cada revisión.",
      primaryEffects: [n("professional.matchSelectivity", 4), n("professional.recoveryDebt", -3), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.statusInertia", -1)],
      primarySeedTransitions: seed("SEED_VETERAN_LABEL", "A", "managed_monthly_review"),
      secondarySeedTransitions: seed("SEED_VETERAN_LABEL", "A", "managed_monthly_review")
    },
    {
      id: "B", label: "Rechazar cualquier etiqueta y competir como uno más", intentTags: ["reject_label", "full_competition"],
      primaryMessage: "Rechazas que la edad defina tu disponibilidad y exiges competir por cada partido.",
      secondaryMessage: "La postura puede sostener estatus o convertir una buena racha en deuda de recuperación.",
      primaryEffects: [n("professional.statusInertia", 3), n("professional.motivationReserve", 2)],
      secondaryEffects: [n("professional.recoveryDebt", 4)],
      primarySeedTransitions: seed("SEED_VETERAN_LABEL", "B", "reject_label"),
      secondarySeedTransitions: seed("SEED_VETERAN_LABEL", "B", "reject_label")
    },
    {
      id: "C", label: "Pedir qué partidos concretos considera prioritarios", intentTags: ["priority_clarity", "calendar"],
      primaryMessage: "Obligas a convertir una etiqueta ambigua en un plan deportivo verificable.",
      secondaryMessage: "La concreción ayuda a decidir, aunque calendario, lesiones y eliminatorias pueden invalidar el plan después.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.matchSelectivity", 2)],
      secondaryEffects: [n("professional.institutionalTrust", -1)],
      primarySeedTransitions: seed("SEED_VETERAN_LABEL", "C", "ask_priority_matches"),
      secondarySeedTransitions: seed("SEED_VETERAN_LABEL", "C", "ask_priority_matches")
    },
    {
      id: "D", label: "No discutir el término y observar la pretemporada", intentTags: ["observe", "preseason"],
      primaryMessage: "No conviertes una palabra en conflicto antes de ver cómo se reparte realmente el trabajo.",
      secondaryMessage: "Esperar evita una pelea semántica, pero deja al club fijar la primera versión práctica del nuevo rol.",
      primaryEffects: [n("professional.environmentStability", 2)],
      secondaryEffects: [n("professional.careerControl", -2)],
      primarySeedTransitions: seed("SEED_VETERAN_LABEL", "D", "observe_preseason"),
      secondarySeedTransitions: seed("SEED_VETERAN_LABEL", "D", "observe_preseason")
    }
  ],
  tags: ["t51_shifted_canonical_addition", "t51_distinct_from_EVT_30_IDN_001"],
  canonStatus: "technical_adaptation"
});

const AGE34_BRIDGE = ambiguousEvent({
  id: "EVT_33_FIN_001",
  ageWindow: [33, 33],
  phase: "30_34",
  family: "legacy",
  title: "Cumples 34",
  body: "El juego presenta una radiografía sin nota final: nivel actual, tendencia física por dimensiones, rol, club, selección, patrimonio, relaciones, legado y deseo de continuar. También muestra puertas, no probabilidades.",
  visible: ["Ves toda la información visible acumulada de tu carrera y tu situación actual."],
  uncertain: ["No sabes cuánto durará el cuerpo ni qué oferta o entrenador aparecerá a los 35–38."],
  timeWindow: { months: [5, 6] },
  gates: [{ path: "flags.EARLY_RETIRED_30_34", op: "eq", value: false }],
  seedsWrite: ["SEED_AGE34_PRIORITY", "SEED_RETIREMENT_DISTANCE_PROFILE"],
  choices: [
    {
      id: "A", label: "Quiero seguir en máximo nivel aunque juegue menos", intentTags: ["age34_priority", "elite_less_minutes"],
      primaryMessage: "Priorizas seguir en el máximo nivel aceptando que el volumen de minutos pueda bajar.",
      secondaryMessage: "La elección orienta recomendaciones futuras, pero no garantiza club, entrenador ni rol.",
      primaryEffects: [n("professional.matchSelectivity", 3), n("professional.veteranLeverage", 2)],
      secondaryEffects: [n("professional.statusInertia", -1)],
      primarySeedTransitions: [seedCreate("SEED_AGE34_PRIORITY", 65, { choice: "A", priority: "elite_less_minutes" }), seedCreate("SEED_RETIREMENT_DISTANCE_PROFILE", 50, { choice: "A", stance: "continue" })],
      secondarySeedTransitions: [seedCreate("SEED_AGE34_PRIORITY", 58, { choice: "A", priority: "elite_less_minutes" }), seedCreate("SEED_RETIREMENT_DISTANCE_PROFILE", 46, { choice: "A", stance: "continue" })]
    },
    {
      id: "B", label: "Quiero jugar mucho, aunque baje de nivel", intentTags: ["age34_priority", "minutes"],
      primaryMessage: "Priorizas competir con volumen por encima del prestigio del nivel.",
      secondaryMessage: "Más minutos pueden sostener identidad deportiva o acelerar desgaste según el contexto.",
      primaryEffects: [n("sport.roleScore", 2), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.recoveryDebt", 2)],
      primarySeedTransitions: [seedCreate("SEED_AGE34_PRIORITY", 65, { choice: "B", priority: "minutes" }), seedCreate("SEED_RETIREMENT_DISTANCE_PROFILE", 50, { choice: "B", stance: "continue" })],
      secondarySeedTransitions: [seedCreate("SEED_AGE34_PRIORITY", 58, { choice: "B", priority: "minutes" }), seedCreate("SEED_RETIREMENT_DISTANCE_PROFILE", 46, { choice: "B", stance: "continue" })]
    },
    {
      id: "C", label: "Quiero volver o quedarme en casa", intentTags: ["age34_priority", "home"],
      primaryMessage: "Das más peso al arraigo y a la vida alrededor del fútbol.",
      secondaryMessage: "La prioridad orienta decisiones futuras sin fabricar una oferta ni un regreso.",
      primaryEffects: [n("professional.homePull", 5), n("professional.environmentStability", 3)],
      secondaryEffects: [n("professional.veteranLeverage", -1)],
      primarySeedTransitions: [seedCreate("SEED_AGE34_PRIORITY", 65, { choice: "C", priority: "home" }), seedCreate("SEED_RETIREMENT_DISTANCE_PROFILE", 50, { choice: "C", stance: "continue" })],
      secondarySeedTransitions: [seedCreate("SEED_AGE34_PRIORITY", 58, { choice: "C", priority: "home" }), seedCreate("SEED_RETIREMENT_DISTANCE_PROFILE", 46, { choice: "C", stance: "continue" })]
    },
    {
      id: "D", label: "Quiero maximizar seguridad y libertad", intentTags: ["age34_priority", "security_freedom"],
      primaryMessage: "Priorizas una estructura contractual que preserve control y reduzca dependencia de promesas deportivas.",
      secondaryMessage: "La preferencia no crea términos contractuales: solo orienta cómo evaluar propuestas futuras.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.contractPower", 2)],
      secondaryEffects: [n("professional.veteranLeverage", 1)],
      primarySeedTransitions: [seedCreate("SEED_AGE34_PRIORITY", 65, { choice: "D", priority: "security_freedom" }), seedCreate("SEED_RETIREMENT_DISTANCE_PROFILE", 50, { choice: "D", stance: "continue" })],
      secondarySeedTransitions: [seedCreate("SEED_AGE34_PRIORITY", 58, { choice: "D", priority: "security_freedom" }), seedCreate("SEED_RETIREMENT_DISTANCE_PROFILE", 46, { choice: "D", stance: "continue" })]
    },
    {
      id: "E", label: "Quiero ir año a año", intentTags: ["age34_priority", "year_to_year"],
      primaryMessage: "Evitas fijar hoy una trayectoria de varios años y dejas que cuerpo, deseo y mercado se revisen por ciclos cortos.",
      secondaryMessage: "La flexibilidad preserva opciones y también reduce certeza.",
      primaryEffects: [n("professional.careerControl", 3), n("professional.matchSelectivity", 2)],
      secondaryEffects: [n("professional.veteranLeverage", -1)],
      primarySeedTransitions: [seedCreate("SEED_AGE34_PRIORITY", 65, { choice: "E", priority: "year_to_year" }), seedCreate("SEED_RETIREMENT_DISTANCE_PROFILE", 54, { choice: "E", stance: "open" })],
      secondarySeedTransitions: [seedCreate("SEED_AGE34_PRIORITY", 58, { choice: "E", priority: "year_to_year" }), seedCreate("SEED_RETIREMENT_DISTANCE_PROFILE", 50, { choice: "E", stance: "open" })]
    },
    {
      id: "F", label: "Empiezo a imaginar la retirada", intentTags: ["age34_priority", "retirement_reflection"],
      primaryMessage: "Admites que el final existe como posibilidad sin convertir la reflexión en una retirada.",
      secondaryMessage: "La idea puede ganar o perder peso más adelante; no cierra la carrera ni fija una fecha.",
      primaryEffects: [n("professional.retirementDistance", 5), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.motivationReserve", -1)],
      primarySeedTransitions: [seedCreate("SEED_AGE34_PRIORITY", 65, { choice: "F", priority: "retirement_reflection" }), seedCreate("SEED_RETIREMENT_DISTANCE_PROFILE", 65, { choice: "F", stance: "reflect" })],
      secondarySeedTransitions: [seedCreate("SEED_AGE34_PRIORITY", 58, { choice: "F", priority: "retirement_reflection" }), seedCreate("SEED_RETIREMENT_DISTANCE_PROFILE", 60, { choice: "F", stance: "reflect" })]
    }
  ],
  tags: ["t51_shifted_canonical_addition", "t51_distinct_from_EVT_33_END_001", "t51_nonterminal_retirement_reflection"],
  canonStatus: "technical_adaptation"
});

export const BLOCKED_CANONICAL_ADDITIONS_30_34: EventDefinition[] = [
  FALSE_ULTIMATUM,
  NATIONAL_ABSENCE,
  FORM_VS_PLAN
];

export const CANONICAL_ADDITIONS_30_34: EventDefinition[] = [
  VETERAN_LABEL_BRIDGE,
  ROLE_COMMUNICATION,
  SPECIALIST_BIGCLUB_ACTIVE,
  AGE34_BRIDGE
];
