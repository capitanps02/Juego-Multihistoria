import type { EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const EVT_21_CAP_001 = ambiguousEvent({
  id: "EVT_21_CAP_001",
  ageWindow: [21, 21],
  phase: "20_23",
  family: "captaincy",
  title: "El grupo de capitanes",
  body: "Una baja en la jerarquía abre un hueco y el capitán te invita a una reunión cerrada. No te ofrecen un brazalete: te preguntan si quieres entrar en el espacio donde el vestuario fija multas, primas internas y qué problemas llegan juntos al entrenador.",
  visible: [
    "Tu peso actual en el vestuario ya es suficiente para que tu presencia tenga consecuencias.",
    "La reunión es concreta y el capitán está presente; lo que digas allí puede atribuirse a ti dentro del grupo."
  ],
  uncertain: [
    "No sabes si entrar ahora te dará influencia real o te convertirá en responsable de decisiones impopulares.",
    "Tampoco sabes cuánto tolerará el grupo una discrepancia abierta cuando todavía no tienes autoridad formal."
  ],
  gates: [{ path: "professional.lockerPower", op: "gte", value: 28 }],
  timeWindow: { months: [9, 10, 11, 2, 3] },
  weight: 18,
  choices: [
    {
      id: "PARTICIPATE_VOTE",
      label: "Entrar, participar y votar",
      intentTags: ["leadership", "collective", "accountability"],
      primaryMessage: "Aceptas que influir implica quedar asociado a las decisiones del grupo. Tu voz pesa más porque también asumes el coste.",
      secondaryMessage: "Ganas acceso, pero una decisión discutida te salpica antes de haber construido toda la autoridad que exige el puesto.",
      primaryEffects: [n("professional.lockerPower", 7), n("professional.environmentStability", 2)],
      secondaryEffects: [n("professional.lockerPower", 4), n("professional.environmentStability", -3)],
      primarySeedTransitions: [seedCreate("SEED_FIRST_CAPTAIN_ROOM", 66, { stance: "participate_vote" })],
      secondarySeedTransitions: [seedCreate("SEED_FIRST_CAPTAIN_ROOM", 62, { stance: "participate_vote", backlash: true })]
    },
    {
      id: "LISTEN_NO_NAME",
      label: "Entrar para escuchar, sin prestar tu nombre",
      intentTags: ["leadership", "caution", "information"],
      primaryMessage: "Aprendes cómo se reparte el poder sin convertirte todavía en aval público de una postura concreta.",
      secondaryMessage: "La cautela protege tu margen, aunque algunos compañeros leen tu silencio como comodidad cuando toca mojarse.",
      primaryEffects: [n("professional.lockerPower", 3), n("professional.environmentStability", 3)],
      secondaryEffects: [n("professional.lockerPower", 1), n("professional.environmentStability", 1)],
      primarySeedTransitions: [seedCreate("SEED_FIRST_CAPTAIN_ROOM", 54, { stance: "listen_no_name" })],
      secondarySeedTransitions: [seedCreate("SEED_FIRST_CAPTAIN_ROOM", 50, { stance: "listen_no_name", ambiguity: true })]
    },
    {
      id: "DISSENT_MINORITY",
      label: "Discrepar aunque quedes en minoría",
      intentTags: ["leadership", "dissent", "principle"],
      primaryMessage: "Tu desacuerdo no cambia la votación, pero deja claro que tu presencia no es decorativa y algunos respetan que argumentes en minoría.",
      secondaryMessage: "La misma franqueza rompe una comodidad interna y te obliga a convivir con compañeros que recuerdan exactamente dónde te colocaste.",
      primaryEffects: [n("professional.lockerPower", 6), n("professional.environmentStability", -1)],
      secondaryEffects: [n("professional.lockerPower", 3), n("professional.environmentStability", -5)],
      primarySeedTransitions: [seedCreate("SEED_FIRST_CAPTAIN_ROOM", 68, { stance: "minority_dissent" })],
      secondarySeedTransitions: [seedCreate("SEED_FIRST_CAPTAIN_ROOM", 70, { stance: "minority_dissent", friction: true })]
    },
    {
      id: "DECLINE_FOR_NOW",
      label: "Rechazar entrar por ahora",
      intentTags: ["boundary", "football_first", "timing"],
      primaryMessage: "Evitas asumir una jerarquía que todavía no deseas y mantienes el foco en competir por tu sitio.",
      secondaryMessage: "La negativa es legítima, pero la próxima vez el grupo puede buscar a otro antes de volver a ofrecerte espacio.",
      primaryEffects: [n("professional.environmentStability", 3), n("professional.lockerPower", -2)],
      secondaryEffects: [n("professional.environmentStability", 1), n("professional.lockerPower", -4)],
      primarySeedTransitions: [seedCreate("SEED_FIRST_CAPTAIN_ROOM", 44, { stance: "decline_for_now" })],
      secondarySeedTransitions: [seedCreate("SEED_FIRST_CAPTAIN_ROOM", 48, { stance: "decline_for_now", opportunity_cost: true })]
    }
  ],
  seedsWrite: ["SEED_FIRST_CAPTAIN_ROOM"],
  npcRefs: ["NPC_PLR_11"],
  tags: ["captaincy", "locker", "leadership", "canonical_t55_b"],
  canonStatus: "verified"
});

const EVT_21_PRS_001 = ambiguousEvent({
  id: "EVT_21_PRS_001",
  ageWindow: [21, 21],
  phase: "20_23",
  family: "press",
  title: "La cifra publicada",
  body: "Un medio publica que cobras una cifra claramente superior a la que figura en tu contrato. Tú conoces el salario real. El club también sabe que el dato es falso, pero no tiene prisa por corregir una historia que puede hacerte parecer más caro de lo que eres.",
  visible: [
    "Conoces tu salario contractual real y sabes que la cifra publicada es falsa.",
    "La noticia ya es pública; corregirla puede revelar información privada que hasta ahora no habías confirmado."
  ],
  uncertain: [
    "No sabes quién proporcionó la cifra inflada ni si el error fue deliberado.",
    "Tampoco sabes si publicar el número real te dará control del relato o fijará tu contrato como referencia para futuras negociaciones."
  ],
  gateAlternatives: [
    [{ path: "reputation.mediaHeat", op: "gte", value: 20 }],
    [{ path: "professional.nationalHeat", op: "gte", value: 24 }]
  ],
  timeWindow: { months: [9, 10, 11, 12] },
  weight: 17,
  choices: [
    {
      id: "CORRECT_WITH_NUMBER",
      label: "Desmentir y dar la cifra real",
      intentTags: ["truth", "public", "privacy_cost"],
      primaryMessage: "Cierras la falsedad con un dato verificable y ganas credibilidad inmediata, a cambio de convertir una condición privada en información pública.",
      secondaryMessage: "La corrección funciona, pero tu salario real queda disponible para comparaciones, renovaciones y titulares futuros.",
      primaryEffects: [n("reputation.mediaHeat", -3), n("professional.institutionalTrust", -1), n("professional.contractPower", 2)],
      secondaryEffects: [n("reputation.mediaHeat", 2), n("professional.contractPower", -1), n("professional.environmentStability", -1)],
      primarySeedTransitions: [seedCreate("SEED_PUBLIC_CONTRACT", 72, { stance: "publish_real_number", privacy: "open" })],
      secondarySeedTransitions: [seedCreate("SEED_PUBLIC_CONTRACT", 76, { stance: "publish_real_number", comparison_cost: true })]
    },
    {
      id: "DENY_NO_NUMBER",
      label: "Negar la cifra sin publicar la real",
      intentTags: ["truth", "privacy", "public"],
      primaryMessage: "Corriges el dato falso sin regalar el dato verdadero y mantienes una frontera útil entre información pública y contrato.",
      secondaryMessage: "Al no aportar una cifra alternativa, parte de la conversación se desplaza a si tu desmentido es completo o estratégico.",
      primaryEffects: [n("reputation.mediaHeat", -1), n("professional.environmentStability", 2)],
      secondaryEffects: [n("reputation.mediaHeat", 3), n("professional.environmentStability", -1)],
      primarySeedTransitions: [seedCreate("SEED_PUBLIC_CONTRACT", 62, { stance: "deny_without_number", privacy: "protected" })],
      secondarySeedTransitions: [seedCreate("SEED_PUBLIC_CONTRACT", 66, { stance: "deny_without_number", ambiguity: true })]
    },
    {
      id: "LET_STAND",
      label: "No corregir la noticia",
      intentTags: ["silence", "leverage", "privacy"],
      primaryMessage: "No confirmas nada y dejas que el mercado interprete la cifra por su cuenta; tu contrato real sigue siendo privado.",
      secondaryMessage: "El silencio evita revelar tu salario, pero permite que una falsedad se consolide y complique conversaciones internas y externas.",
      primaryEffects: [n("professional.contractPower", 3), n("reputation.mediaHeat", 1)],
      secondaryEffects: [n("professional.contractPower", 1), n("reputation.mediaHeat", 4), n("professional.environmentStability", -2)],
      primarySeedTransitions: [seedCreate("SEED_PUBLIC_CONTRACT", 58, { stance: "leave_false_number", privacy: "protected" })],
      secondarySeedTransitions: [seedCreate("SEED_PUBLIC_CONTRACT", 64, { stance: "leave_false_number", misinformation_cost: true })]
    },
    {
      id: "CLUB_CORRECT",
      label: "Pedir al club que corrija y tú callar",
      intentTags: ["institution", "privacy", "delegation"],
      primaryMessage: "La corrección sale de la institución que conoce el contrato y tú no conviertes tu salario en una declaración personal.",
      secondaryMessage: "El club corrige el dato, pero la petición deja una conversación interna sobre por qué fue necesario intervenir y quién permitió que el rumor creciera.",
      primaryEffects: [n("professional.institutionalTrust", 3), n("reputation.mediaHeat", -2)],
      secondaryEffects: [n("professional.institutionalTrust", -1), n("reputation.mediaHeat", 1), n("professional.environmentStability", -1)],
      primarySeedTransitions: [seedCreate("SEED_PUBLIC_CONTRACT", 64, { stance: "club_correction", privacy: "protected" })],
      secondarySeedTransitions: [seedCreate("SEED_PUBLIC_CONTRACT", 68, { stance: "club_correction", internal_friction: true })]
    }
  ],
  seedsWrite: ["SEED_PUBLIC_CONTRACT"],
  npcRefs: ["NPC_PRS_01", "NPC_DIR_02"],
  tags: ["press", "contract", "privacy", "canonical_t55_b"],
  canonStatus: "verified"
});

const EVT_22_CON_001 = ambiguousEvent({
  id: "EVT_22_CON_001",
  ageWindow: [22, 22],
  phase: "20_23",
  family: "contract",
  title: "Veintidós y dieciocho meses",
  body: "Tu contrato entra en una zona nueva: quedan entre doce y veinticuatro meses. Aún no hay ninguna firma que resolver en esta escena. La decisión es estratégica: cuándo abrir la negociación y qué poder quieres conservar antes de que una oferta formal tenga autoridad contractual.",
  visible: [
    "Conoces los meses restantes, tu salario actual y las condiciones vigentes de tu contrato.",
    "Cualquier renovación real tendrá que llegar como CareerOffer; esta conversación solo fija tu disposición y tu estrategia."
  ],
  uncertain: [
    "No sabes si esperar aumentará tu poder o si una lesión, un cambio de rol o un mercado frío reducirá tus opciones.",
    "Tampoco sabes qué valorará más el club cuando llegue una propuesta formal: seguridad, duración, cláusula o coste salarial."
  ],
  gates: [
    { path: "contract.monthsRemaining", op: "gte", value: 12 },
    { path: "contract.monthsRemaining", op: "lte", value: 24 }
  ],
  timeWindow: { months: [7, 8, 9] },
  weight: 19,
  choices: [
    {
      id: "OPEN_RENEWAL_NOW",
      label: "Abrir la renovación pronto",
      intentTags: ["security", "renewal", "club_dialogue"],
      primaryMessage: "Das al club una señal clara para empezar a hablar sin aceptar términos que todavía no existen. Ganas previsibilidad, pero reduces parte del misterio sobre tu intención.",
      secondaryMessage: "La apertura mejora el clima, aunque el club interpreta tu interés como una razón para no apresurarse con su primera cifra.",
      primaryEffects: [n("professional.institutionalTrust", 4), n("professional.environmentStability", 3), n("professional.contractPower", -1)],
      secondaryEffects: [n("professional.institutionalTrust", 3), n("professional.contractPower", -3)],
      primarySeedTransitions: [seedCreate("SEED_FIRST_FREE_AGENCY", 52, { strategy: "early_renewal_talks" })],
      secondarySeedTransitions: [seedCreate("SEED_FIRST_FREE_AGENCY", 56, { strategy: "early_renewal_talks", leverage_cost: true })]
    },
    {
      id: "WAIT_SUMMER",
      label: "Esperar al verano para hablar",
      intentTags: ["patience", "leverage", "risk"],
      primaryMessage: "Mantienes abiertas más variables y pospones la negociación hasta que tu temporada aporte información nueva.",
      secondaryMessage: "Esperar aumenta tu margen potencial, pero también deja que el reloj contractual empiece a trabajar contra la estabilidad del proyecto.",
      primaryEffects: [n("professional.contractPower", 4), n("professional.environmentStability", -1)],
      secondaryEffects: [n("professional.contractPower", 2), n("professional.environmentStability", -3), n("professional.roleSecurity", -1)],
      primarySeedTransitions: [seedCreate("SEED_FIRST_FREE_AGENCY", 60, { strategy: "wait_until_summer" })],
      secondarySeedTransitions: [seedCreate("SEED_FIRST_FREE_AGENCY", 64, { strategy: "wait_until_summer", timing_risk: true })]
    },
    {
      id: "SHORT_EXTENSION_CLAUSE",
      label: "Priorizar una ampliación corta con cláusula manejable",
      intentTags: ["flexibility", "clause", "security"],
      primaryMessage: "Defines una preferencia: algo de seguridad sin cerrar la puerta a un salto posterior. Ningún término cambia hasta que exista y aceptes una oferta formal.",
      secondaryMessage: "El equilibrio parece razonable, pero puede ser justo el punto que menos interese a un club que busca control a largo plazo.",
      primaryEffects: [n("professional.contractPower", 3), n("professional.institutionalTrust", 1), n("professional.environmentStability", 1)],
      secondaryEffects: [n("professional.contractPower", 2), n("professional.institutionalTrust", -2)],
      primarySeedTransitions: [seedCreate("SEED_FIRST_FREE_AGENCY", 62, { strategy: "short_extension_clause" })],
      secondarySeedTransitions: [seedCreate("SEED_FIRST_FREE_AGENCY", 65, { strategy: "short_extension_clause", club_mismatch: true })]
    },
    {
      id: "NO_RENEWAL_FOR_NOW",
      label: "Comunicar que por ahora no renovarás",
      intentTags: ["autonomy", "leverage", "boundary"],
      primaryMessage: "No pides salir ni rompes el contrato: marcas que prefieres conservar tiempo y poder antes de abrir una renovación.",
      secondaryMessage: "La posición es legítima, pero el club empieza a planificar con la posibilidad de que no controles tu rol del mismo modo si el reloj sigue bajando.",
      primaryEffects: [n("professional.contractPower", 6), n("professional.institutionalTrust", -3), n("professional.environmentStability", -2)],
      secondaryEffects: [n("professional.contractPower", 4), n("professional.institutionalTrust", -5), n("professional.roleSecurity", -3)],
      primarySeedTransitions: [seedCreate("SEED_FIRST_FREE_AGENCY", 70, { strategy: "no_renewal_for_now" })],
      secondarySeedTransitions: [seedCreate("SEED_FIRST_FREE_AGENCY", 74, { strategy: "no_renewal_for_now", sporting_response_risk: true })]
    }
  ],
  seedsRead: ["SEED_CONTRACT_HARDLINE"],
  seedsWrite: ["SEED_FIRST_FREE_AGENCY"],
  npcRefs: ["NPC_DIR_02"],
  tags: ["contract", "renewal", "leverage", "canonical_t55_b"],
  canonStatus: "verified"
});

const EVT_22_CON_002 = ambiguousEvent({
  id: "EVT_22_CON_002",
  ageWindow: [22, 22],
  phase: "20_23",
  family: "contract",
  title: "Agotar",
  body: "El contrato ha entrado en su último año y ninguna renovación ha cambiado todavía tus términos vigentes. El reloj abre libertad futura, pero también da al club motivos para proteger valor deportivo o económico mientras aún puede negociar una salida.",
  visible: [
    "Te quedan doce meses o menos de contrato y sigues bajo las condiciones actuales.",
    "Una venta o una renovación solo se ejecutará mediante la autoridad contractual correspondiente; aquí decides qué ruta estás dispuesto a explorar."
  ],
  uncertain: [
    "No sabes si agotar el contrato te dará mejores opciones o si perderás minutos, confianza o mercado antes de llegar libre.",
    "Tampoco sabes qué clubes seguirán interesados cuando puedas negociar tu siguiente etapa con más autonomía."
  ],
  gates: [
    { path: "contract.monthsRemaining", op: "gte", value: 1 },
    { path: "contract.monthsRemaining", op: "lte", value: 12 }
  ],
  timeWindow: { months: [10, 11, 12, 1] },
  weight: 20,
  choices: [
    {
      id: "RUN_DOWN",
      label: "Agotar el contrato",
      intentTags: ["free_agency", "autonomy", "sporting_risk"],
      primaryMessage: "Aceptas el riesgo del último año para conservar la posibilidad de elegir tu siguiente club sin una venta que condicione la operación.",
      secondaryMessage: "La libertad futura gana valor, pero el club empieza a protegerse y tu situación deportiva se vuelve parte de la negociación aunque nadie cambie el contrato.",
      primaryEffects: [n("professional.contractPower", 7), n("professional.institutionalTrust", -2), n("professional.roleSecurity", -2)],
      secondaryEffects: [n("professional.contractPower", 5), n("professional.institutionalTrust", -4), n("professional.roleSecurity", -5)],
      primarySeedTransitions: [seedCreate("SEED_FIRST_FREE_AGENCY", 78, { strategy: "run_down" })],
      secondarySeedTransitions: [seedCreate("SEED_FIRST_FREE_AGENCY", 82, { strategy: "run_down", minutes_risk: true })]
    },
    {
      id: "ACCEPT_SALE_PATH",
      label: "Aceptar una venta razonable ahora",
      intentTags: ["controlled_exit", "value", "stability"],
      primaryMessage: "Te muestras dispuesto a una salida ordenada si aparece una oferta real que encaje. No aceptas ningún destino por adelantado.",
      secondaryMessage: "La disposición reduce tensión con el club, pero abre conversaciones externas que pueden alterar tu estabilidad antes de que exista una propuesta convincente.",
      primaryEffects: [n("professional.institutionalTrust", 4), n("professional.contractPower", 2), n("professional.environmentStability", -2)],
      secondaryEffects: [n("professional.institutionalTrust", 2), n("reputation.marketHeat", 2), n("professional.environmentStability", -4)],
      primarySeedTransitions: [seedCreate("SEED_FIRST_FREE_AGENCY", 68, { strategy: "controlled_sale" })],
      secondarySeedTransitions: [seedCreate("SEED_FIRST_FREE_AGENCY", 72, { strategy: "controlled_sale", market_noise: true })]
    },
    {
      id: "RENEW_STRONG_UPGRADE",
      label: "Renovar solo con una mejora fuerte",
      intentTags: ["renewal", "hardline", "value"],
      primaryMessage: "No cierras la puerta a seguir, pero conviertes la mejora de condiciones en requisito de una futura oferta formal.",
      secondaryMessage: "La postura fija un suelo claro; si club y jugador valoran de forma distinta tu situación, la negociación puede endurecerse mientras el tiempo sigue corriendo.",
      primaryEffects: [n("professional.contractPower", 5), n("professional.institutionalTrust", -1)],
      secondaryEffects: [n("professional.contractPower", 3), n("professional.institutionalTrust", -4), n("professional.environmentStability", -2)],
      primarySeedTransitions: [seedCreate("SEED_FIRST_FREE_AGENCY", 74, { strategy: "renew_only_strong_upgrade" })],
      secondarySeedTransitions: [seedCreate("SEED_FIRST_FREE_AGENCY", 77, { strategy: "renew_only_strong_upgrade", negotiation_gap: true })]
    },
    {
      id: "SIGNAL_PREAGREEMENT",
      label: "Filtrar que escucharás preacuerdos cuando sea legal",
      intentTags: ["market", "leak", "future_option"],
      primaryMessage: "La señal aumenta el interés sin inventar una oferta ni firmar nada; otros clubes saben que valorarás propuestas cuando el marco contractual lo permita.",
      secondaryMessage: "La misma señal crea mercado, pero también convierte tu futuro en conversación pública y endurece la relación con quien aún posee tu contrato.",
      primaryEffects: [n("reputation.marketHeat", 5), n("reputation.mediaHeat", 2), n("professional.contractPower", 4)],
      secondaryEffects: [n("reputation.marketHeat", 4), n("reputation.mediaHeat", 5), n("professional.institutionalTrust", -5)],
      primarySeedTransitions: [seedCreate("SEED_FIRST_FREE_AGENCY", 80, { strategy: "signal_preagreement" })],
      secondarySeedTransitions: [seedCreate("SEED_FIRST_FREE_AGENCY", 84, { strategy: "signal_preagreement", publicity_cost: true })]
    }
  ],
  seedsRead: ["SEED_FIRST_FREE_AGENCY", "SEED_CONTRACT_HARDLINE"],
  seedsWrite: ["SEED_FIRST_FREE_AGENCY"],
  npcRefs: ["NPC_DIR_02"],
  tags: ["contract", "free_agency", "leverage", "canonical_t55_b"],
  canonStatus: "verified"
});

export const T55B_PRINCIPALS: EventDefinition[] = [
  EVT_21_CAP_001,
  EVT_21_PRS_001,
  EVT_22_CON_001,
  EVT_22_CON_002
];
