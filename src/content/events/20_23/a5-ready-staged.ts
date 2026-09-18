import type { EventDefinition, SeedTransition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const intensify = (seedId: string, intensity: number): SeedTransition => ({
  seedId,
  action: "intensify",
  intensity
});

/**
 * Agent-5 post-J canonical batch.
 *
 * Generation J is the real predecessor on main. This file contains exactly the
 * five owner-ready A5 definitions admitted to the serialized post-J generation.
 */

const CEVT_18_PLAYOFF_01 = ambiguousEvent({
  id: "CEVT_18_PLAYOFF_01",
  ageWindow: [18, 19],
  phase: "18_20",
  family: "conditional",
  title: "Nadie lo esperaba",
  body: "UDV entra en un playoff real. El éxito colectivo cambia el valor de quedarse y también el coste de permitir que el mercado siga escuchando mientras todavía compites.",
  visible: [
    "UDV está realmente en playoff.",
    "Todavía puedes separar el compromiso deportivo de lo que decidas hacer con tu mercado."
  ],
  uncertain: [
    "No sabes cuánto durará el playoff ni qué ventanas externas seguirán abiertas al terminar.",
    "Tampoco sabes si el club interpretará tu postura como lealtad, prudencia o preparación de una salida."
  ],
  gates: [{ path: "flags.UDV_PLAYOFF", op: "eq", value: true }],
  timeWindow: { months: [5, 6] },
  weight: 7,
  choices: [
    {
      id: "COMMIT",
      label: "Cerrar conversaciones y centrarte en el playoff",
      intentTags: ["team", "retention", "focus"],
      primaryMessage: "La prioridad queda clara: mientras dure el playoff no utilizas el mercado como palanca.",
      secondaryMessage: "El compromiso protege el foco, pero algunas conversaciones externas pierden tiempo y temperatura.",
      primaryEffects: [n("sport.roleScore", 6), n("professional.environmentStability", 4)],
      secondaryEffects: [n("professional.environmentStability", 2), n("reputation.marketHeat", -3)],
      primarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 58, { playoff: "commit" })],
      secondarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 62, { playoff: "commit" })]
    },
    {
      id: "QUIET_MARKET",
      label: "Mantener el foco y permitir escucha discreta fuera",
      intentTags: ["parallel", "market", "discretion"],
      primaryMessage: "No mezclas vestuario y negociación, pero conservas información para el verano.",
      secondaryMessage: "La separación aguanta, aunque una conversación conocida puede convertir el mercado en tema interno.",
      primaryEffects: [n("control.career", 5), n("professional.environmentStability", 1)],
      secondaryEffects: [n("control.career", 3), n("reputation.mediaHeat", 3)],
      primarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 62, { playoff: "quiet_market" })],
      secondarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 66, { playoff: "quiet_market" })]
    },
    {
      id: "DELAY",
      label: "No decidir nada hasta saber cómo termina",
      intentTags: ["wait", "optionality", "risk"],
      primaryMessage: "Aplazas la decisión y conservas libertad para leer el resultado deportivo antes del verano.",
      secondaryMessage: "Esperar evita precipitarte, pero no obliga al mercado a esperarte a ti.",
      primaryEffects: [n("control.career", 3)],
      secondaryEffects: [n("control.career", 1), n("reputation.marketHeat", -2)],
      primarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 56, { playoff: "delay" })],
      secondarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 60, { playoff: "delay" })]
    }
  ],
  seedsWrite: ["SEED_EXIT_STYLE_UDV"],
  tags: ["playoff", "retention", "market", "a5_post_j"],
  canonStatus: "verified"
});

const EVT_20_BRIDGE_001 = ambiguousEvent({
  id: "EVT_20_BRIDGE_001",
  ageWindow: [20, 20],
  phase: "20_23",
  family: "contract",
  title: "La reunión de los veinte",
  body: "Dos días después de cumplir 20, el club quiere ordenar tu plan. Si tienes representante puede participar, pero contrato, rol, minutos, categoría y cualquier oferta formal siguen siendo hechos separados que puedes contrastar.",
  visible: [
    "Ves tu contrato actual, rol, minutos y categoría.",
    "Si existe una CareerOffer compatible, puedes verla como oferta formal; la reunión no crea una por sí misma."
  ],
  uncertain: [
    "Club y representante pueden describir tu techo inmediato de forma distinta.",
    "Pedir más concreción puede darte información y también reducir margen político."
  ],
  gates: [
    { path: "professional.initializedAt20", op: "eq", value: true },
    { path: "contract.salaryMonthly", op: "gt", value: 0 }
  ],
  timeWindow: { months: [7] },
  weight: 30,
  choices: [
    {
      id: "WRITTEN_PLAN",
      label: "Pedir un plan deportivo por escrito con hitos revisables",
      intentTags: ["clarity", "sporting_plan", "control"],
      primaryMessage: "Consigues criterios revisables y reduces el espacio para reinterpretar el plan después.",
      secondaryMessage: "La petición aclara poco y hace visible que no das por suficiente una promesa verbal.",
      primaryEffects: [n("control.career", 6), n("professional.institutionalTrust", 2)],
      secondaryEffects: [n("control.career", 4), n("professional.institutionalTrust", -2)],
      primaryModifiers: [{ id: "PLAYOFF_COMMIT_PLAN", conditions: [{ path: "facts.exitStylePlayoff", op: "eq", value: "commit" }], add: 8, reason: "La postura de playoff favorece pedir continuidad concreta." }]
    },
    {
      id: "MONEY_FIRST",
      label: "Hablar primero de salario y duración",
      intentTags: ["contract", "money", "leverage"],
      primaryMessage: "Separar condiciones económicas del relato deportivo te permite saber cuánto valor contractual atribuye el club a tu situación.",
      secondaryMessage: "La conversación es legítima, pero llega antes de que todas las partes quieran fijar el plan deportivo.",
      primaryEffects: [n("professional.contractPower", 5), n("control.career", 2)],
      secondaryEffects: [n("professional.contractPower", 2), n("professional.institutionalTrust", -2)]
    },
    {
      id: "ASK_PRICE",
      label: "Preguntar qué oferta aceptarían hoy por ti",
      intentTags: ["market_information", "asset_value", "clarity"],
      primaryMessage: "La respuesta te ayuda a distinguir entre pieza deportiva y activo negociable sin convertir esa cifra en una oferta real.",
      secondaryMessage: "El club evita fijar precio o responde con una cifra estratégica que no equivale a una propuesta de compra.",
      primaryEffects: [n("control.career", 5), n("professional.contractPower", 2)],
      secondaryEffects: [n("control.career", 2)]
    },
    {
      id: "LISTEN_AND_CHECK",
      label: "Escuchar sin comprometerte y contrastar fuera",
      intentTags: ["wait", "information", "optionality"],
      primaryMessage: "Sales sin comprometer contrato ni mercado y conservas margen para contrastar la versión del club.",
      secondaryMessage: "Esperar protege opciones, pero deja que otros fijen parte del relato mientras tú contrastas.",
      primaryEffects: [n("control.career", 4)],
      secondaryEffects: [n("control.career", 1)],
      primaryModifiers: [{ id: "AGENT_POWER_CONTEXT", conditions: [{ path: "facts.agentPowerChoice", op: "exists" }], add: 6, reason: "Una memoria causal de agencia mejora la capacidad de contraste." }]
    }
  ],
  seedsRead: ["SEED_AGENT_POWER", "SEED_EXIT_STYLE_UDV"],
  tags: ["bridge", "state20", "contract", "role", "a5_post_j"],
  canonStatus: "verified"
});

const EVT_20_CCH_001 = ambiguousEvent({
  id: "EVT_20_CCH_001",
  ageWindow: [20, 20],
  phase: "20_23",
  family: "tactical",
  title: "La promesa de agosto",
  body: "El entrenador te dijo en privado que jugarías mucho si mantenías el nivel. Dos semanas después aparece competencia real en tu zona. La promesa no era contractual y todavía no sabes por qué llegó el fichaje.",
  visible: [
    "La nueva competencia existe y la promesa previa fue verbal.",
    "Puedes separar al técnico, la dirección del club y tu representante si existe."
  ],
  uncertain: [
    "No sabes si el fichaje fue petición técnica, oportunidad de mercado o cobertura.",
    "Pedir claridad demasiado pronto y esperar demasiado tienen costes distintos."
  ],
  gates: [{ path: "professional.initializedAt20", op: "eq", value: true }],
  timeWindow: { months: [8, 9] },
  weight: 18,
  choices: [
    {
      id: "COACH_NOW",
      label: "Pedir una conversación inmediata al técnico",
      intentTags: ["coach", "clarity", "direct"],
      primaryMessage: "La conversación concreta qué parte de la promesa sigue viva sin convertirla en garantía contractual.",
      secondaryMessage: "Preguntar tan pronto aclara poco y puede leerse como inseguridad ante la competencia.",
      primaryEffects: [n("professional.roleSecurity", 3), n("control.career", 3)],
      secondaryEffects: [n("professional.environmentStability", -2), n("control.career", 1)]
    },
    {
      id: "WAIT_THREE_MATCHES",
      label: "Esperar tres jornadas antes de reaccionar",
      intentTags: ["wait", "evidence", "patience"],
      primaryMessage: "Aplazas la conversación. Desde ahora solo cuentan los partidos oficiales posteriores de este club; todavía no hay una conclusión sobre la promesa.",
      secondaryMessage: "Te comprometes a observar tres jornadas reales antes de reaccionar. El coste deportivo no se inventa ahora: lo decidirán esos partidos y el contexto que exista entonces.",
      primaryEffects: [n("control.career", 1)],
      secondaryEffects: [n("professional.environmentStability", -1)]
    },
    {
      id: "ASK_DIRECTOR",
      label: "Preguntar al director deportivo, no al técnico",
      intentTags: ["institution", "clarity", "hierarchy"],
      eligibility: [{ path: "facts.currentClubInstitutionalNpcId", op: "exists" }],
      primaryMessage: "La dirección explica su parte de la operación sin convertir al director de UDV en interlocutor de otro club.",
      secondaryMessage: "Saltarte al técnico aporta contexto institucional, pero puede aumentar el coste político de la consulta.",
      primaryEffects: [n("professional.institutionalTrust", 2), n("control.career", 3)],
      secondaryEffects: [n("professional.institutionalTrust", -3), n("control.career", 2)]
    },
    {
      id: "AGENT_SOUND",
      label: "Usar a tu agente para sondear salidas sin confrontar",
      intentTags: ["agent", "optionality", "private"],
      eligibility: [{ path: "facts.activeAgentNpcId", op: "exists" }],
      primaryMessage: "El sondeo te da contexto externo sin fabricar una oferta ni cambiar tu contrato.",
      secondaryMessage: "La consulta externa crea ruido si vuelve al club antes de que exista una propuesta formal.",
      primaryEffects: [n("control.career", 5), n("professional.agentControl", 2)],
      secondaryEffects: [n("control.career", 2), n("professional.environmentStability", -2)],
      primaryModifiers: [{ id: "AGENT_POWER_MEMORY", conditions: [{ path: "facts.agentPowerChoice", op: "exists" }], add: 6, reason: "La relación causal previa con la agencia condiciona el sondeo." }]
    }
  ],
  seedsRead: ["SEED_AGENT_POWER"],
  tags: ["coach", "competition", "institution", "agent", "distinct_scene", "a5_post_j"],
  canonStatus: "verified"
});

const EVT_21_SOC_001 = ambiguousEvent({
  id: "EVT_21_SOC_001",
  ageWindow: [21, 21],
  phase: "20_23",
  family: "social",
  title: "Tu amigo contra tu agente",
  body: "Dani te cuenta que alguien de tu agencia le pidió que dejara de subir fotos antiguas contigo. Tu representante reconoce el contacto y dice que intentaba protegerte de ruido innecesario.",
  visible: [
    "Dani y tu representante reconocen que el contacto ocurrió.",
    "Tu decisión puede fijar límites distintos con amistad y representación."
  ],
  uncertain: [
    "No conoces el tono exacto ni quién dio cada instrucción dentro de la agencia.",
    "No sabes si intervenir apagará el asunto o lo convertirá en una regla más rígida."
  ],
  gates: [
    { path: "facts.daniNormalityPattern", op: "exists" },
    { path: "facts.activeAgentNpcId", op: "exists" },
    { path: "professional.agentControl", op: "gte", value: 35 }
  ],
  weight: 15,
  choices: [
    {
      id: "BACK_AGENT",
      label: "Respaldar al agente",
      intentTags: ["agent", "image_control", "boundary"],
      primaryMessage: "Das prioridad a la gestión profesional de tu exposición y dejas claro a Dani que esa frontera existe.",
      secondaryMessage: "La regla protege imagen, pero Dani siente que una relación personal empieza a administrarse desde fuera.",
      primaryEffects: [n("professional.agentControl", 4), n("rel.NPC_SOC_01.trust", -3)],
      secondaryEffects: [n("professional.agentControl", 3), n("rel.NPC_SOC_01.resentment", 7)],
      primarySeedTransitions: [intensify("SEED_DANI_NORMALITY", 4), intensify("SEED_AGENT_POWER", 4)],
      secondarySeedTransitions: [intensify("SEED_DANI_NORMALITY", 7), intensify("SEED_AGENT_POWER", 6)]
    },
    {
      id: "APOLOGIZE_LIMIT",
      label: "Pedir disculpas a Dani y prohibir contactos con tu entorno",
      intentTags: ["friendship", "agent_boundary", "repair"],
      primaryMessage: "Dani recupera una frontera clara y tu representante recibe una instrucción explícita sobre el entorno personal.",
      secondaryMessage: "Reparas la amistad, pero la limitación reduce margen operativo de la agencia y abre una discusión interna.",
      primaryEffects: [n("rel.NPC_SOC_01.trust", 7), n("professional.agentControl", -4)],
      secondaryEffects: [n("rel.NPC_SOC_01.trust", 4), n("professional.agentControl", -6)],
      primarySeedTransitions: [intensify("SEED_DANI_NORMALITY", 5), intensify("SEED_AGENT_POWER", 5)],
      secondarySeedTransitions: [intensify("SEED_DANI_NORMALITY", 6), intensify("SEED_AGENT_POWER", 7)]
    },
    {
      id: "MEDIATE",
      label: "Mediar sin señalar culpable",
      intentTags: ["mediation", "friendship", "agent"],
      primaryMessage: "Fijas una regla común sin convertir el conflicto en un juicio sobre las intenciones de nadie.",
      secondaryMessage: "La mediación evita escalar, pero deja zonas grises sobre quién puede intervenir la próxima vez.",
      primaryEffects: [n("rel.NPC_SOC_01.trust", 4), n("professional.environmentStability", 3)],
      secondaryEffects: [n("rel.NPC_SOC_01.trust", 2), n("professional.environmentStability", 1)],
      primarySeedTransitions: [intensify("SEED_DANI_NORMALITY", 3), intensify("SEED_AGENT_POWER", 3)],
      secondarySeedTransitions: [intensify("SEED_DANI_NORMALITY", 4), intensify("SEED_AGENT_POWER", 4)]
    },
    {
      id: "LET_PASS",
      label: "Dejarlo pasar si no se ha publicado nada",
      intentTags: ["silence", "wait", "risk"],
      primaryMessage: "El episodio se enfría sin convertirse en otra conversación pública.",
      secondaryMessage: "No intervenir evita ruido hoy, pero ambas partes pueden interpretar que aceptas ese tipo de contacto.",
      primaryEffects: [n("professional.environmentStability", 2)],
      secondaryEffects: [n("professional.environmentStability", -2), n("rel.NPC_SOC_01.resentment", 3)],
      primarySeedTransitions: [intensify("SEED_DANI_NORMALITY", 2), intensify("SEED_AGENT_POWER", 2)],
      secondarySeedTransitions: [intensify("SEED_DANI_NORMALITY", 4), intensify("SEED_AGENT_POWER", 4)]
    }
  ],
  seedsRead: ["SEED_DANI_NORMALITY", "SEED_AGENT_POWER"],
  seedsWrite: ["SEED_DANI_NORMALITY", "SEED_AGENT_POWER"],
  npcRefs: ["NPC_SOC_01"],
  tags: ["social", "dani", "agent", "boundaries", "distinct_scene", "a5_post_j"],
  canonStatus: "verified"
});

const EVT_21_PRS_002 = ambiguousEvent({
  id: "EVT_21_PRS_002",
  ageWindow: [21, 21],
  phase: "20_23",
  family: "press",
  title: "La llamada que llega por Clara",
  body: "Clara te avisa de que un director deportivo preguntó por ti y pide confirmar tu situación contractual antes de decirte el nombre. Es una información periodística útil; no es una CareerOffer.",
  visible: [
    "El canal con Clara está vivo y ella tiene un dato que puede ser útil.",
    "La duración de tu contrato procede de tu estado contractual real."
  ],
  uncertain: [
    "No sabes si Clara está protegiendo una fuente o contrastando una noticia que publicará igualmente.",
    "La pregunta de un director deportivo no equivale a una propuesta formal ni garantiza negociación."
  ],
  gates: [{ path: "facts.claraChannelMode", op: "exists" }],
  weight: 14,
  choices: [
    {
      id: "EXACT_DURATION",
      label: "Darle la duración exacta de contrato",
      intentTags: ["trade_information", "clarity", "media"],
      primaryMessage: "Intercambias un dato contractual exacto por contexto periodístico sin convertirlo en una oferta.",
      secondaryMessage: "La precisión ayuda a Clara, pero también aumenta cuánto de tu contrato circula fuera del club.",
      primaryEffects: [n("rel.NPC_PRS_01.trust", 5), n("reputation.mediaHeat", 1)],
      secondaryEffects: [n("rel.NPC_PRS_01.trust", 2), n("reputation.mediaHeat", 3)],
      primarySeedTransitions: [intensify("SEED_CLARA_CHANNEL", 5), intensify("SEED_PUBLIC_CONTRACT", 4)],
      secondarySeedTransitions: [intensify("SEED_CLARA_CHANNEL", 6), intensify("SEED_PUBLIC_CONTRACT", 6)]
    },
    {
      id: "RANGE",
      label: "Darle una horquilla o versión incompleta",
      intentTags: ["partial_information", "media", "control"],
      primaryMessage: "Conservas margen contractual y Clara obtiene suficiente contexto para seguir contrastando.",
      secondaryMessage: "La imprecisión protege datos, pero reduce la confianza de una fuente que te pidió confirmar un hecho concreto.",
      primaryEffects: [n("control.career", 3), n("rel.NPC_PRS_01.trust", 1)],
      secondaryEffects: [n("control.career", 2), n("rel.NPC_PRS_01.trust", -3)],
      primarySeedTransitions: [intensify("SEED_CLARA_CHANNEL", 3), intensify("SEED_PUBLIC_CONTRACT", 2)],
      secondarySeedTransitions: [intensify("SEED_CLARA_CHANNEL", 4), intensify("SEED_PUBLIC_CONTRACT", 3)]
    },
    {
      id: "PUBLICABLE_ONLY",
      label: "Negarte y preguntar solo si la información es publicable",
      intentTags: ["boundary", "source_check", "privacy"],
      primaryMessage: "No entregas datos contractuales y conviertes la conversación en una pregunta sobre qué puede afirmarse públicamente.",
      secondaryMessage: "Proteges el contrato, pero Clara puede interpretar que el canal sirve menos cuando necesita contraste.",
      primaryEffects: [n("control.career", 5), n("rel.NPC_PRS_01.trust", 1)],
      secondaryEffects: [n("control.career", 4), n("rel.NPC_PRS_01.trust", -2)],
      primarySeedTransitions: [intensify("SEED_CLARA_CHANNEL", 2)],
      secondarySeedTransitions: [intensify("SEED_CLARA_CHANNEL", 3)]
    },
    {
      id: "PASS_TO_AGENT",
      label: "Pasar el contacto a tu agente",
      intentTags: ["agent", "professionalize", "boundary"],
      eligibility: [{ path: "facts.activeAgentNpcId", op: "exists" }],
      primaryMessage: "Profesionalizas la conversación y mantienes separado el dato periodístico de cualquier negociación formal.",
      secondaryMessage: "El filtro protege tu contrato, aunque el canal directo con Clara puede enfriarse.",
      primaryEffects: [n("professional.agentControl", 3), n("control.career", 2)],
      secondaryEffects: [n("professional.agentControl", 2), n("rel.NPC_PRS_01.trust", -3)],
      primarySeedTransitions: [intensify("SEED_CLARA_CHANNEL", 2)],
      secondarySeedTransitions: [intensify("SEED_CLARA_CHANNEL", 4)]
    }
  ],
  seedsRead: ["SEED_CLARA_CHANNEL", "SEED_PUBLIC_CONTRACT"],
  seedsWrite: ["SEED_CLARA_CHANNEL", "SEED_PUBLIC_CONTRACT"],
  npcRefs: ["NPC_PRS_01"],
  tags: ["press", "clara", "contract_information", "distinct_scene", "a5_post_j"],
  canonStatus: "verified"
});

export const A5_READY_EVENTS_18_23: EventDefinition[] = [
  CEVT_18_PLAYOFF_01,
  EVT_20_BRIDGE_001,
  EVT_20_CCH_001,
  EVT_21_SOC_001,
  EVT_21_PRS_002
];

export const A5_READY_EVENT_IDS = A5_READY_EVENTS_18_23.map(event => event.id);
