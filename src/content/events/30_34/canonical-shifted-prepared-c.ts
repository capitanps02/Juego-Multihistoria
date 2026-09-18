import type { EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const seed = (seedId: string, choice: string, stance: string) => [
  seedCreate(seedId, 60, { choice, stance })
];

const REPLACEMENT_BREAKOUT = ambiguousEvent({
  id: "EVT_32_SUCCESSOR_001",
  ageWindow: [32, 32],
  phase: "30_34",
  family: "team",
  title: "Tres semanas y aparece otro",
  body: "Una lesión menor te saca tres semanas. Tu sustituto encadena actuaciones excelentes y el equipo no pierde.",
  visible: ["Conoces el rendimiento del sustituto y tu fecha probable de vuelta."],
  uncertain: ["No sabes si el entrenador cree en competencia abierta o ya prefiere continuidad."],
  seedsWrite: ["SEED_REPLACEMENT_BREAKOUT"],
  choices: [
    {
      id: "A", label: "Volver exigiendo competir por once", intentTags: ["successor", "compete_start"],
      primaryMessage: "Pides que la vuelta reabra la competencia por el once sin negar lo que hizo el sustituto.",
      secondaryMessage: "La exigencia puede restaurar competencia abierta o tensar un equipo que estaba funcionando.",
      primaryEffects: [n("professional.motivationReserve", 3), n("professional.statusInertia", 2)],
      secondaryEffects: [n("professional.institutionalTrust", -2)],
      primarySeedTransitions: seed("SEED_REPLACEMENT_BREAKOUT", "A", "compete_start"),
      secondarySeedTransitions: seed("SEED_REPLACEMENT_BREAKOUT", "A", "compete_start")
    },
    {
      id: "B", label: "Aceptar empezar desde banquillo", intentTags: ["successor", "bench_return"],
      primaryMessage: "Aceptas que el rendimiento ajeno tenga consecuencias y vuelves desde un rol menor.",
      secondaryMessage: "La decisión protege la transición física, pero puede consolidar una jerarquía nueva.",
      primaryEffects: [n("professional.recoveryDebt", -3), n("professional.roleAdaptability", 2)],
      secondaryEffects: [n("professional.statusInertia", -2)],
      primarySeedTransitions: seed("SEED_REPLACEMENT_BREAKOUT", "B", "bench_return"),
      secondarySeedTransitions: seed("SEED_REPLACEMENT_BREAKOUT", "B", "bench_return")
    },
    {
      id: "C", label: "Pedir jugar otra posición juntos", intentTags: ["successor", "coexist"],
      primaryMessage: "Buscas coexistencia táctica para que el buen momento del sustituto no obligue a elegir entre uno y otro.",
      secondaryMessage: "La idea amplía opciones y puede llevarte a un rol menos natural.",
      primaryEffects: [n("professional.roleAdaptability", 4), n("professional.tacticalReading", 2)],
      secondaryEffects: [n("professional.statusInertia", -1)],
      primarySeedTransitions: seed("SEED_REPLACEMENT_BREAKOUT", "C", "coexist"),
      secondarySeedTransitions: seed("SEED_REPLACEMENT_BREAKOUT", "C", "coexist")
    },
    {
      id: "D", label: "Abrir mercado si el rol cambió", intentTags: ["successor", "market_if_changed"],
      primaryMessage: "Tratas un cambio estructural de rol como información de mercado, no como castigo al sustituto.",
      secondaryMessage: "Explorar protege opciones y puede convertir una transición temporal en una salida real.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.veteranLeverage", 2)],
      secondaryEffects: [n("professional.environmentStability", -2)],
      primarySeedTransitions: seed("SEED_REPLACEMENT_BREAKOUT", "D", "market_if_changed"),
      secondarySeedTransitions: seed("SEED_REPLACEMENT_BREAKOUT", "D", "market_if_changed")
    }
  ],
  tags: ["t51_shifted_prepared", "t51_blocked_absence_replacement_performance_authority", "t51_missing_SEED_SUCCESSION_DECISION_identity", "t51_distinct_from_EVT_32_TEAM_001"],
  canonStatus: "technical_adaptation"
});

const TRAVEL_LOAD = ambiguousEvent({
  id: "EVT_32_LOAD_001",
  ageWindow: [32, 32],
  phase: "30_34",
  family: "medical",
  title: "No viajes",
  body: "El entrenador propone que no viajes a un partido de liga menor para evitar avión, hotel y 48 horas de recuperación, aunque podrías entrar desde el banquillo.",
  visible: ["Conoces la carga prevista y el rival."],
  uncertain: ["No sabes si el partido se complicará ni si quedarte en casa será leído por compañeros como privilegio."],
  seedsRead: ["SEED_MATCH_SELECTIVITY"],
  seedsWrite: ["SEED_TRAVEL_LOAD"],
  choices: [
    {
      id: "A", label: "Quedarte", intentTags: ["travel_load", "stay_home"],
      primaryMessage: "Aceptas que la recuperación incluya no viajar aunque sigas disponible en términos generales.",
      secondaryMessage: "El cuerpo gana margen y el vestuario puede leer una excepción donde el staff ve gestión de carga.",
      primaryEffects: [n("professional.recoveryDebt", -4), n("professional.matchSelectivity", 3)],
      secondaryEffects: [n("professional.lockerPower", -1)],
      primarySeedTransitions: seed("SEED_TRAVEL_LOAD", "A", "stay_home"),
      secondarySeedTransitions: seed("SEED_TRAVEL_LOAD", "A", "stay_home")
    },
    {
      id: "B", label: "Viajar aunque no juegues", intentTags: ["travel_load", "travel_anyway"],
      primaryMessage: "Priorizas presencia con el grupo aunque el plan no cuente contigo para empezar.",
      secondaryMessage: "El liderazgo visible aumenta y también el coste de una semana que buscaba recuperación.",
      primaryEffects: [n("professional.lockerPower", 3)],
      secondaryEffects: [n("professional.recoveryDebt", 3)],
      primarySeedTransitions: seed("SEED_TRAVEL_LOAD", "B", "travel_anyway"),
      secondarySeedTransitions: seed("SEED_TRAVEL_LOAD", "B", "travel_anyway")
    },
    {
      id: "C", label: "Viajar solo si eres titular", intentTags: ["travel_load", "starter_only"],
      primaryMessage: "Vinculas el coste del viaje a una contribución deportiva clara.",
      secondaryMessage: "El criterio es eficiente y puede convertir la titularidad en una negociación de carga.",
      primaryEffects: [n("professional.matchSelectivity", 3), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.institutionalTrust", -1)],
      primarySeedTransitions: seed("SEED_TRAVEL_LOAD", "C", "starter_only"),
      secondarySeedTransitions: seed("SEED_TRAVEL_LOAD", "C", "starter_only")
    },
    {
      id: "D", label: "Dejar que el grupo de capitanes conozca y valide el criterio", intentTags: ["travel_load", "captain_group"],
      primaryMessage: "Intentas que la excepción sea comprensible para el vestuario y no un privilegio opaco.",
      secondaryMessage: "La transparencia ayuda, aunque convierte una decisión física en asunto de jerarquía colectiva.",
      primaryEffects: [n("professional.lockerPower", 3), n("professional.institutionalTrust", 2)],
      secondaryEffects: [n("professional.publicPolarization", 1)],
      primarySeedTransitions: seed("SEED_TRAVEL_LOAD", "D", "captain_group"),
      secondarySeedTransitions: seed("SEED_TRAVEL_LOAD", "D", "captain_group")
    }
  ],
  tags: ["t51_shifted_prepared", "t51_blocked_dense_calendar_authority", "t51_distinct_from_EVT_32_BODY_001"],
  canonStatus: "technical_adaptation"
});

const BOSMAN_WINDOW = ambiguousEvent({
  id: "EVT_32_BOSMAN_001",
  ageWindow: [32, 32],
  phase: "30_34",
  family: "contract",
  title: "Enero: puedes firmar gratis",
  body: "Entrando en los últimos seis meses de contrato puedes negociar libremente tu próximo destino. Tu club actual quiere que esperes un mes porque aún estudia renovarte.",
  visible: ["Conoces las ofertas permitidas y la propuesta informal del club actual."],
  uncertain: ["No sabes si esperar mejorará el rol o si los compradores cerrarán otras opciones."],
  timeWindow: { months: [1] },
  seedsWrite: ["SEED_BOSMAN_33"],
  choices: [
    {
      id: "A", label: "Firmar precontrato ya", intentTags: ["bosman", "precontract_now"],
      primaryMessage: "Usas la libertad contractual para asegurar tu siguiente destino antes de que cambie el mercado.",
      secondaryMessage: "La certeza llega pronto y cierra opciones que todavía podían mejorar.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.contractPower", 2)],
      secondaryEffects: [n("professional.veteranLeverage", -1)],
      primarySeedTransitions: seed("SEED_BOSMAN_33", "A", "precontract_now"),
      secondarySeedTransitions: seed("SEED_BOSMAN_33", "A", "precontract_now")
    },
    {
      id: "B", label: "Dar un mes al club actual", intentTags: ["bosman", "club_month"],
      primaryMessage: "Concedes una ventana corta para que el club convierta interés en una propuesta real.",
      secondaryMessage: "El gesto conserva relación y consume tiempo de mercado.",
      primaryEffects: [n("professional.institutionalTrust", 2), n("professional.careerControl", 1)],
      secondaryEffects: [n("professional.veteranLeverage", -2)],
      primarySeedTransitions: seed("SEED_BOSMAN_33", "B", "club_month"),
      secondarySeedTransitions: seed("SEED_BOSMAN_33", "B", "club_month")
    },
    {
      id: "C", label: "Negociar dos destinos en paralelo", intentTags: ["bosman", "parallel"],
      primaryMessage: "Mantienes competencia entre destinos para comparar rol, duración y contexto.",
      secondaryMessage: "La estrategia aumenta información y exige una autoridad de mercado capaz de sostener varias negociaciones reales.",
      primaryEffects: [n("professional.veteranLeverage", 4), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.publicPolarization", 1)],
      primarySeedTransitions: seed("SEED_BOSMAN_33", "C", "parallel"),
      secondarySeedTransitions: seed("SEED_BOSMAN_33", "C", "parallel")
    },
    {
      id: "D", label: "No firmar hasta acabar temporada", intentTags: ["bosman", "wait_season_end"],
      primaryMessage: "Mantienes libertad total hasta que el contexto deportivo de la temporada quede cerrado.",
      secondaryMessage: "Esperar conserva opciones y permite que varios compradores desaparezcan.",
      primaryEffects: [n("professional.careerControl", 3)],
      secondaryEffects: [n("professional.veteranLeverage", -3)],
      primarySeedTransitions: seed("SEED_BOSMAN_33", "D", "wait_season_end"),
      secondarySeedTransitions: seed("SEED_BOSMAN_33", "D", "wait_season_end")
    }
  ],
  tags: ["t51_shifted_prepared", "t51_blocked_bosman_parallel_market_authority", "t51_missing_SEED_PARALLEL_NEGOTIATION_identity", "t51_distinct_from_EVT_32_BOS_001"],
  canonStatus: "technical_adaptation"
});

const RECORD_VS_BODY = ambiguousEvent({
  id: "EVT_33_RECORD_001",
  ageWindow: [33, 33],
  phase: "30_34",
  family: "legacy",
  title: "El récord está a seis partidos",
  body: "Te quedan seis apariciones para superar un récord importante del club, pero el entrenador planea darte cuatro o cinco titularidades como máximo antes de final de temporada.",
  visible: ["Conoces la distancia exacta al récord y el calendario restante."],
  uncertain: ["No sabes si el próximo año seguirás ni si perseguirlo dañará la preparación de otros partidos."],
  seedsRead: ["SEED_RECORD_PUBLIC_TONE"],
  seedsWrite: ["SEED_RECORD_VS_BODY"],
  choices: [
    {
      id: "A", label: "Pedir oportunidades para batirlo", intentTags: ["record", "ask_opportunities"],
      primaryMessage: "Haces explícito que el récord importa y pides margen para perseguirlo.",
      secondaryMessage: "La petición puede parecer legítima o poner al entrenador en una trampa entre carga y legado.",
      primaryEffects: [n("professional.legacyCapital", 3), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.institutionalTrust", -2)],
      primarySeedTransitions: seed("SEED_RECORD_VS_BODY", "A", "ask_opportunities"),
      secondarySeedTransitions: seed("SEED_RECORD_VS_BODY", "A", "ask_opportunities")
    },
    {
      id: "B", label: "No mencionarlo", intentTags: ["record", "silence"],
      primaryMessage: "Dejas que las necesidades deportivas decidan si el récord llega.",
      secondaryMessage: "Evitas presión externa y puedes perder una ventana estadística irrepetible.",
      primaryEffects: [n("professional.environmentStability", 2)],
      secondaryEffects: [n("professional.motivationReserve", -1)],
      primarySeedTransitions: seed("SEED_RECORD_VS_BODY", "B", "silence"),
      secondarySeedTransitions: seed("SEED_RECORD_VS_BODY", "B", "silence")
    },
    {
      id: "C", label: "Aceptar minutos finales para sumar apariciones", intentTags: ["record", "late_minutes"],
      primaryMessage: "Buscas apariciones de menor carga para acercarte al récord sin exigir titularidades.",
      secondaryMessage: "La solución reduce volumen por partido y puede vaciar de sentido deportivo parte de la persecución.",
      primaryEffects: [n("professional.matchSelectivity", 3), n("professional.legacyCapital", 2)],
      secondaryEffects: [n("professional.statusInertia", -1)],
      primarySeedTransitions: seed("SEED_RECORD_VS_BODY", "C", "late_minutes"),
      secondarySeedTransitions: seed("SEED_RECORD_VS_BODY", "C", "late_minutes")
    },
    {
      id: "D", label: "Decir públicamente que el récord no condicionará decisiones", intentTags: ["record", "public_no_pressure"],
      primaryMessage: "Reduces presión pública sobre el entrenador y separas legado estadístico de decisiones de carga.",
      secondaryMessage: "La declaración protege al grupo y te obliga a convivir con la posibilidad de quedarte a una aparición.",
      primaryEffects: [n("professional.publicPolarization", -2), n("professional.institutionalTrust", 2)],
      secondaryEffects: [n("professional.motivationReserve", -1)],
      primarySeedTransitions: seed("SEED_RECORD_VS_BODY", "D", "public_no_pressure"),
      secondarySeedTransitions: seed("SEED_RECORD_VS_BODY", "D", "public_no_pressure")
    }
  ],
  tags: ["t51_shifted_prepared", "t51_blocked_record_distance_role_plan_authority", "t51_distinct_from_EVT_33_REC_001"],
  canonStatus: "technical_adaptation"
});

export const PREPARED_SHIFTED_CANON_30_34_C: EventDefinition[] = [
  REPLACEMENT_BREAKOUT,
  TRAVEL_LOAD,
  BOSMAN_WINDOW,
  RECORD_VS_BODY
];
