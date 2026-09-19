import type { EventDefinition, SeedTransition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const transformSeed = (seedId: string, payload: Record<string, string | number | boolean | null>): SeedTransition => ({
  seedId,
  action: "transform",
  payload
});

const LOCK_27 = ambiguousEvent({
  id: "EVT_27_LOCK_001",
  ageWindow: [27, 27],
  phase: "26_30",
  family: "captaincy",
  title: "El entrenador ha perdido a medio vestuario",
  body: "Una parte del vestuario quiere la salida del técnico. La dirección te pregunta en privado si todavía puede recuperar al grupo.",
  visible: ["Conoces los conflictos que has presenciado y la pregunta concreta de la dirección."],
  uncertain: ["No sabes si tu opinión será una de muchas o la decisiva ni qué otras causas pesan en la continuidad del técnico."],
  choices: [
    {
      id: "A", label: "Decir que debe seguir", intentTags: ["locker", "coach_support"],
      primaryMessage: "Defiendes que el técnico todavía puede recuperar al grupo sin convertir tu opinión en una decisión institucional.",
      secondaryMessage: "Tu apoyo queda registrado, pero la dirección puede decidir otra cosa por motivos que no controlas.",
      primaryEffects: [n("professional.institutionalPower", 3), n("professional.institutionalTrust", 2)],
      secondaryEffects: [n("professional.institutionalPower", 2), n("professional.publicPolarization", 1)],
      primarySeedTransitions: [seedCreate("SEED_LOCKER_ENDORSEMENT", 64, { stance: "coach_stays" })],
      secondarySeedTransitions: [seedCreate("SEED_LOCKER_ENDORSEMENT", 60, { stance: "coach_stays" })]
    },
    {
      id: "B", label: "Decir que el ciclo terminó", intentTags: ["locker", "coach_exit"],
      primaryMessage: "Trasladas que, según tu lectura, el ciclo ya no es recuperable. La decisión final sigue siendo de la dirección.",
      secondaryMessage: "Tu postura gana peso interno y también el riesgo de que se conozca si el técnico continúa.",
      primaryEffects: [n("professional.institutionalPower", 4), n("professional.publicPolarization", 2)],
      secondaryEffects: [n("professional.institutionalPower", 3), n("professional.environmentStability", -2)],
      primarySeedTransitions: [seedCreate("SEED_LOCKER_ENDORSEMENT", 72, { stance: "cycle_over" })],
      secondarySeedTransitions: [seedCreate("SEED_LOCKER_ENDORSEMENT", 76, { stance: "cycle_over" })]
    },
    {
      id: "C", label: "Negarte a decidir sobre su puesto", intentTags: ["locker", "boundary"],
      primaryMessage: "Te niegas a convertir poder de vestuario en una votación sobre el empleo del entrenador.",
      secondaryMessage: "El límite protege tu posición, aunque dirección y compañeros pueden interpretar el silencio de formas opuestas.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.environmentStability", 1)],
      secondaryEffects: [n("professional.careerControl", 3), n("professional.publicPolarization", 1)],
      primarySeedTransitions: [seedCreate("SEED_LOCKER_ENDORSEMENT", 58, { stance: "refuse_decision" })],
      secondarySeedTransitions: [seedCreate("SEED_LOCKER_ENDORSEMENT", 62, { stance: "refuse_decision" })]
    },
    {
      id: "D", label: "Condicionar tu apoyo a cambios concretos", intentTags: ["locker", "conditional_support"],
      primaryMessage: "No das un sí o un no: explicas qué cambios necesitaría el vestuario para creer en una recuperación.",
      secondaryMessage: "La condición introduce una salida intermedia, pero también te coloca como actor explícito en la crisis.",
      primaryEffects: [n("professional.institutionalPower", 4), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.institutionalPower", 3), n("professional.environmentStability", -1)],
      primarySeedTransitions: [seedCreate("SEED_LOCKER_ENDORSEMENT", 70, { stance: "conditional_support" })],
      secondarySeedTransitions: [seedCreate("SEED_LOCKER_ENDORSEMENT", 74, { stance: "conditional_support" })]
    }
  ],
  gates: [
    { path: "professional.institutionalPower", op: "gte", value: 63 },
    { path: "facts.currentClubCoachCrisis", op: "eq", value: true }
  ],
  weight: 18,
  cooldown: 99999,
  seedsRead: ["SEED_CAPTAINCY_STYLE"],
  seedsWrite: ["SEED_LOCKER_ENDORSEMENT"],
  tags: ["locker", "coach_crisis", "a6_ready_external_blocker", "needs_current_club_coach_crisis_fact", "t5_24"],
  canonStatus: "verified"
});

const NAT_27 = ambiguousEvent({
  id: "EVT_27_NAT_001",
  ageWindow: [27, 27],
  phase: "26_30",
  family: "selection",
  title: "El brazalete de tu país",
  body: "Por ausencia o cambio generacional, el seleccionador te ofrece capitanía temporal o permanente. También implica ruedas de prensa y mediar conflictos internos.",
  visible: ["Conoces el rol, las responsabilidades y el contexto del grupo."],
  uncertain: ["No sabes si el brazalete sobrevivirá al siguiente seleccionador."],
  choices: [
    {
      id: "A", label: "Aceptar", intentTags: ["national_captaincy", "accept"],
      primaryMessage: "Aceptas la capitanía y su carga pública sin asumir que será permanente.",
      secondaryMessage: "El brazalete eleva influencia y también exposición y trabajo interno.",
      primaryEffects: [n("professional.nationalPower", 5), n("professional.publicMyth", 2)],
      secondaryEffects: [n("professional.nationalPower", 4), n("professional.publicPolarization", 2)],
      primarySeedTransitions: [transformSeed("SEED_CAPTAINCY_STYLE", { national27: "accept" })],
      secondarySeedTransitions: [transformSeed("SEED_CAPTAINCY_STYLE", { national27: "accept" })]
    },
    {
      id: "B", label: "Aceptar solo como capitán temporal", intentTags: ["national_captaincy", "temporary"],
      primaryMessage: "Aceptas cubrir el liderazgo actual sin convertirlo en una reclamación sobre la siguiente etapa.",
      secondaryMessage: "La fórmula reduce rigidez, aunque puede dejar la jerarquía abierta cuando regrese otro veterano.",
      primaryEffects: [n("professional.nationalPower", 3), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.nationalPower", 2), n("professional.environmentStability", 1)],
      primarySeedTransitions: [transformSeed("SEED_CAPTAINCY_STYLE", { national27: "temporary" })],
      secondarySeedTransitions: [transformSeed("SEED_CAPTAINCY_STYLE", { national27: "temporary" })]
    },
    {
      id: "C", label: "Rechazar y apoyar a otro veterano", intentTags: ["national_captaincy", "decline"],
      primaryMessage: "Rechazas el brazalete y apoyas una alternativa sin abandonar tu compromiso deportivo con la selección.",
      secondaryMessage: "El gesto puede liberar carga o ser leído como renuncia a una responsabilidad de grupo.",
      primaryEffects: [n("professional.careerControl", 3), n("professional.nationalPower", -1)],
      secondaryEffects: [n("professional.careerControl", 2), n("professional.publicPolarization", 1)],
      primarySeedTransitions: [transformSeed("SEED_CAPTAINCY_STYLE", { national27: "decline_support_veteran" })],
      secondarySeedTransitions: [transformSeed("SEED_CAPTAINCY_STYLE", { national27: "decline_support_veteran" })]
    },
    {
      id: "D", label: "Pedir que el grupo vote o consulte internamente", intentTags: ["national_captaincy", "group_process"],
      primaryMessage: "Pides una consulta interna para que el brazalete no dependa solo de una decisión vertical.",
      secondaryMessage: "La consulta puede reforzar legitimidad o hacer visible una división que antes era implícita.",
      primaryEffects: [n("professional.nationalPower", 3), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.publicPolarization", 2), n("professional.environmentStability", -1)],
      primarySeedTransitions: [transformSeed("SEED_CAPTAINCY_STYLE", { national27: "group_consultation" })],
      secondarySeedTransitions: [transformSeed("SEED_CAPTAINCY_STYLE", { national27: "group_consultation" })]
    }
  ],
  gates: [{ path: "facts.nationalCaptaincyOffer", op: "eq", value: true }],
  weight: 18,
  cooldown: 99999,
  seedsRead: ["SEED_CAPTAINCY_STYLE"],
  seedsWrite: ["SEED_CAPTAINCY_STYLE"],
  tags: ["selection", "captaincy", "a6_ready_external_blocker", "needs_national_captaincy_offer_fact", "needs_seed_national_captaincy_catalog", "t5_24"],
  canonStatus: "verified"
});

const CONTRACT_28 = ambiguousEvent({
  id: "EVT_28_CON_001",
  ageWindow: [28, 28],
  phase: "26_30",
  family: "contract",
  title: "Cinco años o dos",
  body: "A los 28, dos ofertas equivalentes difieren en duración: una garantiza cinco años a salario alto; otra dos años con mejor rol y libertad posterior.",
  visible: ["Conoces duración, salario, rol, primas y cláusulas de ambos paquetes."],
  uncertain: ["No sabes cómo envejecerá tu cuerpo ni qué mercado tendrás a los 30 o 31."],
  choices: [
    {
      id: "A", label: "Cinco años", intentTags: ["contract", "long_security"],
      primaryMessage: "Priorizas seguridad larga y aceptas el coste de reducir libertad futura.",
      secondaryMessage: "El contrato largo protege un escenario físico peor, pero puede convertirse en freno si aparece un proyecto mejor.",
      primaryEffects: [n("professional.environmentStability", 4), n("professional.careerControl", -2)],
      secondaryEffects: [n("professional.environmentStability", 3), n("professional.careerControl", -3)],
      primarySeedTransitions: [transformSeed("SEED_CONTRACT_CEILING", { age28Duration: "five_years" })],
      secondarySeedTransitions: [transformSeed("SEED_CONTRACT_CEILING", { age28Duration: "five_years" })]
    },
    {
      id: "B", label: "Dos años", intentTags: ["contract", "short_freedom"],
      primaryMessage: "Priorizas rol y libertad para volver al mercado con treinta años.",
      secondaryMessage: "Conservas opcionalidad, pero asumes el riesgo de negociar de nuevo con menos poder o peor cuerpo.",
      primaryEffects: [n("professional.careerControl", 5), n("professional.environmentStability", -1)],
      secondaryEffects: [n("professional.careerControl", 4), n("professional.contractPower", -1)],
      primarySeedTransitions: [transformSeed("SEED_CONTRACT_CEILING", { age28Duration: "two_years" })],
      secondarySeedTransitions: [transformSeed("SEED_CONTRACT_CEILING", { age28Duration: "two_years" })]
    },
    {
      id: "C", label: "Pedir tres con opción del jugador", intentTags: ["contract", "player_option"],
      primaryMessage: "Intentas repartir seguridad y libertad con una estructura intermedia.",
      secondaryMessage: "La contraoferta protege opcionalidad si el otro lado la acepta, pero no obliga a ninguno de los dos paquetes actuales a transformarse.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.contractPower", 2)],
      secondaryEffects: [n("professional.careerControl", 3), n("professional.environmentStability", -1)],
      primarySeedTransitions: [transformSeed("SEED_CONTRACT_CEILING", { age28Duration: "three_player_option" })],
      secondarySeedTransitions: [transformSeed("SEED_CONTRACT_CEILING", { age28Duration: "three_player_option" })]
    },
    {
      id: "D", label: "Elegir según cláusula de salida y no duración", intentTags: ["contract", "release_clause"],
      primaryMessage: "Das prioridad a la puerta de salida real antes que al número de años escrito en portada.",
      secondaryMessage: "La cláusula puede proteger libertad, aunque su utilidad dependerá de que exista mercado dispuesto a pagarla.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.contractPower", 3)],
      secondaryEffects: [n("professional.careerControl", 3), n("professional.contractPower", 2)],
      primarySeedTransitions: [transformSeed("SEED_CONTRACT_CEILING", { age28Duration: "release_clause_first" })],
      secondarySeedTransitions: [transformSeed("SEED_CONTRACT_CEILING", { age28Duration: "release_clause_first" })]
    }
  ],
  gates: [{ path: "facts.age28LongShortOfferPackages", op: "eq", value: true }],
  weight: 18,
  cooldown: 99999,
  seedsRead: ["SEED_CONTRACT_CEILING"],
  seedsWrite: ["SEED_CONTRACT_CEILING"],
  tags: ["contract", "multi_offer", "a6_ready_external_blocker", "needs_multi_offer_authority", "needs_seed_long_vs_short_28_catalog", "t5_24"],
  canonStatus: "verified"
});

const PRESS_29 = ambiguousEvent({
  id: "EVT_29_PRS_001",
  ageWindow: [29, 29],
  phase: "26_30",
  family: "press",
  title: "Clara pregunta por el vestuario",
  body: "Clara Beltrán, ya periodista de mucho más alcance si su carrera prosperó, sabe que existe tensión interna. Te pregunta una sola cosa: «¿el entrenador ha perdido al grupo?»",
  visible: ["Sabes la tensión real y el historial que mantienes con Clara."],
  uncertain: ["No sabes qué otras fuentes tiene ni cómo formulará la pieza."],
  choices: [
    {
      id: "A", label: "Confirmar off the record", intentTags: ["press", "off_record"],
      primaryMessage: "Confirmas tu lectura de forma privada sin convertirla en declaración atribuible.",
      secondaryMessage: "El canal gana información y también riesgo: Clara puede publicar con otras fuentes aunque respete tu atribución.",
      primaryEffects: [n("professional.careerControl", 2), n("reputation.mediaHeat", 2)],
      secondaryEffects: [n("professional.publicPolarization", 2), n("reputation.mediaHeat", 3)],
      primarySeedTransitions: [transformSeed("SEED_CLARA_CHANNEL", { age29Locker: "confirm_off_record" })],
      secondarySeedTransitions: [transformSeed("SEED_CLARA_CHANNEL", { age29Locker: "confirm_off_record" })]
    },
    {
      id: "B", label: "Negarlo", intentTags: ["press", "deny"],
      primaryMessage: "Proteges al grupo con una negación clara, aun sabiendo que Clara puede contrastarla con otras fuentes.",
      secondaryMessage: "Si Clara conoce hechos incompatibles, el canal de confianza puede deteriorarse aunque la intención fuera proteger al vestuario.",
      primaryEffects: [n("professional.environmentStability", 2), n("professional.careerControl", 1)],
      secondaryEffects: [n("professional.publicPolarization", 2), n("professional.careerControl", -1)],
      primarySeedTransitions: [transformSeed("SEED_CLARA_CHANNEL", { age29Locker: "deny" })],
      secondarySeedTransitions: [transformSeed("SEED_CLARA_CHANNEL", { age29Locker: "deny" })]
    },
    {
      id: "C", label: "Decir que no hablarás de vestuario", intentTags: ["press", "boundary"],
      primaryMessage: "Mantienes una frontera explícita entre canal periodístico y conversaciones internas.",
      secondaryMessage: "No aportas la confirmación que busca, pero tampoco impides que la noticia avance por otras fuentes.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.environmentStability", 1)],
      secondaryEffects: [n("professional.careerControl", 3), n("reputation.mediaHeat", 1)],
      primarySeedTransitions: [transformSeed("SEED_CLARA_CHANNEL", { age29Locker: "no_locker_comment" })],
      secondarySeedTransitions: [transformSeed("SEED_CLARA_CHANNEL", { age29Locker: "no_locker_comment" })]
    },
    {
      id: "D", label: "Dar una respuesta parcial sobre fútbol, no personas", intentTags: ["press", "partial_answer"],
      primaryMessage: "Hablas de funcionamiento deportivo sin juzgar la continuidad o autoridad personal del entrenador.",
      secondaryMessage: "La respuesta contiene información real, aunque puede ser leída como una forma indirecta de confirmar que existe un problema.",
      primaryEffects: [n("professional.careerControl", 3), n("reputation.mediaHeat", 1)],
      secondaryEffects: [n("professional.publicPolarization", 2), n("reputation.mediaHeat", 2)],
      primarySeedTransitions: [transformSeed("SEED_CLARA_CHANNEL", { age29Locker: "football_only" })],
      secondarySeedTransitions: [transformSeed("SEED_CLARA_CHANNEL", { age29Locker: "football_only" })]
    }
  ],
  gates: [
    { path: "flags.HAS_SEED_CLARA_CHANNEL", op: "eq", value: true },
    { path: "facts.currentClubCoachCrisis", op: "eq", value: true }
  ],
  weight: 18,
  cooldown: 99999,
  seedsRead: ["SEED_CLARA_CHANNEL", "SEED_PRIVATE_CHAT"],
  seedsWrite: ["SEED_CLARA_CHANNEL"],
  npcRefs: ["NPC_PRS_01"],
  tags: ["press", "locker_crisis", "a6_ready_external_blocker", "needs_current_club_coach_crisis_fact", "needs_seed_clara_power_catalog", "t5_24"],
  canonStatus: "verified"
});

const TACT_29 = ambiguousEvent({
  id: "EVT_29_TACT_001",
  ageWindow: [29, 29],
  phase: "26_30",
  family: "tactical",
  title: "Reinventarte de verdad",
  body: "Tu velocidad, resistencia o explosividad han cambiado respecto a los 23. Un técnico propone un rol de interior, segundo punta o creador con menos recorridos y más lectura.",
  visible: ["Ves datos comparativos y ejemplos tácticos del nuevo rol."],
  uncertain: ["No sabes si la reconversión te mantendrá en la élite o acelerará la percepción de declive."],
  choices: [
    {
      id: "A", label: "Adoptar el nuevo rol como posición principal", intentTags: ["tactical", "full_reinvention"],
      primaryMessage: "Aceptas que tu identidad principal evolucione hacia un rol de más lectura y menos recorrido.",
      secondaryMessage: "La adaptación puede reducir números visibles mientras aumenta encaje y vida útil.",
      primaryEffects: [n("professional.roleAdaptability", 7), n("professional.tacticalReading", 5)],
      secondaryEffects: [n("professional.roleAdaptability", 5), n("professional.publicPolarization", 1)],
      primarySeedTransitions: [transformSeed("SEED_POSITIONAL_REINVENTION", { age29: "primary_role" })],
      secondarySeedTransitions: [transformSeed("SEED_POSITIONAL_REINVENTION", { age29: "primary_role" })]
    },
    {
      id: "B", label: "Mantener rol histórico", intentTags: ["tactical", "historical_role"],
      primaryMessage: "Defiendes la versión de juego que te llevó al pico mientras siga siendo competitiva.",
      secondaryMessage: "La continuidad protege marca e identidad, pero reduce algunos encajes si cambian tus capacidades físicas.",
      primaryEffects: [n("professional.careerControl", 3), n("professional.roleAdaptability", -1)],
      secondaryEffects: [n("professional.careerControl", 2), n("professional.environmentStability", -1)],
      primarySeedTransitions: [transformSeed("SEED_POSITIONAL_REINVENTION", { age29: "historical_role" })],
      secondarySeedTransitions: [transformSeed("SEED_POSITIONAL_REINVENTION", { age29: "historical_role" })]
    },
    {
      id: "C", label: "Usarlo solo en club", intentTags: ["tactical", "club_only"],
      primaryMessage: "Aceptas la reconversión en el club sin convertirla automáticamente en tu identidad internacional.",
      secondaryMessage: "La separación conserva flexibilidad, aunque exige alternar referencias tácticas entre contextos.",
      primaryEffects: [n("professional.roleAdaptability", 4), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.roleAdaptability", 3), n("professional.environmentStability", 1)],
      primarySeedTransitions: [transformSeed("SEED_POSITIONAL_REINVENTION", { age29: "club_only" })],
      secondarySeedTransitions: [transformSeed("SEED_POSITIONAL_REINVENTION", { age29: "club_only" })]
    },
    {
      id: "D", label: "Usarlo solo cuando no compitas con el sucesor joven", intentTags: ["tactical", "situational"],
      primaryMessage: "Usas el nuevo rol como herramienta situacional y preservas competencia directa cuando importa la jerarquía.",
      secondaryMessage: "La flexibilidad abre soluciones, pero puede impedir que una nueva identidad termine de consolidarse.",
      primaryEffects: [n("professional.roleAdaptability", 4), n("professional.successionPressure", -2)],
      secondaryEffects: [n("professional.roleAdaptability", 2), n("professional.successionPressure", -1)],
      primarySeedTransitions: [transformSeed("SEED_POSITIONAL_REINVENTION", { age29: "situational_successor" })],
      secondarySeedTransitions: [transformSeed("SEED_POSITIONAL_REINVENTION", { age29: "situational_successor" })]
    }
  ],
  gates: [{ path: "professional.roleAdaptability", op: "gte", value: 52 }],
  weight: 18,
  cooldown: 99999,
  seedsRead: ["SEED_POSITIONAL_REINVENTION"],
  seedsWrite: ["SEED_POSITIONAL_REINVENTION"],
  tags: ["tactical", "reinvention", "a6_owner_complete", "needs_seed_mature_reinvention_catalog", "t5_24"],
  canonStatus: "verified"
});

export const T524_STAGED_PRINCIPAL_EVENTS: EventDefinition[] = [LOCK_27, NAT_27, CONTRACT_28, PRESS_29, TACT_29];
