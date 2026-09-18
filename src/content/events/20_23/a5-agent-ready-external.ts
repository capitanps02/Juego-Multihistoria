import type { EventDefinition, SeedTransition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const intensify = (seedId: string, intensity: number): SeedTransition => ({
  seedId,
  action: "intensify",
  intensity
});

export const A5_AGENT_EXTERNAL_REQUIREMENTS = Object.freeze({
  EVT_20_AGT_001: {
    owner: "A1",
    awaiting: ["certified active-agent writer", "representation permissions/terms"],
    forbidden: ["contact flags", "relationship magnitude", "SEED_FIRST_AGENT as identity", "agentControl as identity"]
  },
  EVT_20_BRUNO_001: {
    owner: "A1/world",
    awaiting: ["current Bruno opportunity/club-need fact"],
    optional: ["certified active agent for notify-agent route"],
    forbidden: ["SEED_BRUNO_FAVOR as current club need", "marketHeat as offer"]
  },
  EVT_21_AGT_001: {
    owner: "A1",
    awaiting: ["certified active agent", "current representation commission/services fact"],
    forbidden: ["relationship magnitude as representation", "generic AGENT_ACTIVE flag as identity"]
  }
});

const EVT_20_AGT_001 = ambiguousEvent({
  id: "EVT_20_AGT_001",
  ageWindow: [20, 20],
  phase: "20_23",
  family: "agent",
  title: "El teléfono del agente",
  body: "Tu representante propone centralizar llamadas de clubes, periodistas y marcas. Aceptar más control puede profesionalizar el flujo; también puede hacer más difícil saber qué contactos fueron filtrados antes de llegar a ti.",
  visible: [
    "Sabes quién es tu representante solo cuando A1 lo ha certificado.",
    "La propuesta debe apoyarse en términos reales de representación antes de activarse."
  ],
  uncertain: [
    "No sabes qué oportunidades descartaría por pequeñas ni qué contactos le interesan más.",
    "Centralizar puede aumentar poder negociador y también el coste de una omisión."
  ],
  gates: [{ path: "facts.activeAgentNpcId", op: "exists" }],
  gateAlternatives: [
    [{ path: "professional.nationalHeat", op: "gte", value: 20 }],
    [{ path: "reputation.marketHeat", op: "gte", value: 28 }]
  ],
  weight: 16,
  choices: [
    {
      id: "BROAD_CONTROL",
      label: "Darle control amplio",
      intentTags: ["delegate", "agent", "leverage"],
      primaryMessage: "Centralizas negociación y reduces interlocutores, aceptando que tu representante filtre más antes de consultarte.",
      secondaryMessage: "El sistema es más eficiente, pero una oportunidad menor puede quedar fuera de tu vista sin que sepas cuándo ocurrió.",
      primaryEffects: [n("professional.agentControl", 8), n("control.career", -3)],
      secondaryEffects: [n("professional.agentControl", 9), n("control.career", -5)],
      primarySeedTransitions: [seedCreate("SEED_AGENT_POWER", 62, { choice: "A", control: "broad" })],
      secondarySeedTransitions: [seedCreate("SEED_AGENT_POWER", 68, { choice: "A", control: "broad", omissionRisk: true }), intensify("SEED_AGENT_OMISSION", 4)]
    },
    {
      id: "INFORM_FIRST",
      label: "Exigir que te informe de todo contacto serio antes de responder",
      intentTags: ["information", "control", "agent"],
      primaryMessage: "Mantienes al agente como negociador, pero conviertes la información previa en una regla explícita.",
      secondaryMessage: "La autonomía aumenta, aunque algunas operaciones pierden velocidad por necesitar una consulta adicional.",
      primaryEffects: [n("control.career", 7), n("professional.agentControl", 2)],
      secondaryEffects: [n("control.career", 5), n("professional.agentControl", 1)],
      primarySeedTransitions: [seedCreate("SEED_AGENT_POWER", 55, { choice: "B", control: "inform_first" }), intensify("SEED_AGENT_OMISSION", 2)],
      secondarySeedTransitions: [seedCreate("SEED_AGENT_POWER", 52, { choice: "B", control: "inform_first", slower: true })]
    },
    {
      id: "SPLIT_IMAGE",
      label: "Mantener prensa e imagen en tus manos y mercado en las suyas",
      intentTags: ["split_roles", "agent", "image"],
      primaryMessage: "Separar funciones crea un contrapeso claro entre mercado y exposición pública.",
      secondaryMessage: "La especialización evita concentración, pero aumenta el riesgo de mensajes cruzados entre canales.",
      primaryEffects: [n("professional.agentControl", 3), n("control.career", 5)],
      secondaryEffects: [n("professional.agentControl", 2), n("professional.environmentStability", -2)],
      primarySeedTransitions: [seedCreate("SEED_AGENT_POWER", 56, { choice: "C", control: "split_image" })],
      secondarySeedTransitions: [seedCreate("SEED_AGENT_POWER", 60, { choice: "C", control: "split_image", coordinationRisk: true })]
    },
    {
      id: "NO_CENTRALIZE",
      label: "Negarte a centralizar",
      intentTags: ["autonomy", "direct_contact", "agent"],
      primaryMessage: "Conservas acceso directo a tus contactos y dejas al agente como asesor/negociador, no como filtro único.",
      secondaryMessage: "Ganas visibilidad, pero varias conversaciones paralelas pueden debilitar coordinación y poder negociador.",
      primaryEffects: [n("control.career", 8), n("professional.agentControl", -5)],
      secondaryEffects: [n("control.career", 6), n("professional.environmentStability", -2)],
      primarySeedTransitions: [seedCreate("SEED_AGENT_POWER", 58, { choice: "D", control: "no_centralize" })],
      secondarySeedTransitions: [seedCreate("SEED_AGENT_POWER", 62, { choice: "D", control: "no_centralize", coordinationRisk: true })]
    }
  ],
  seedsRead: ["SEED_AGENT_OMISSION", "SEED_FIRST_AGENT"],
  seedsWrite: ["SEED_AGENT_POWER", "SEED_AGENT_OMISSION"],
  tags: ["agent", "representation", "a5_ready_external_blocker"],
  canonStatus: "verified"
});

const EVT_20_BRUNO_001 = ambiguousEvent({
  id: "EVT_20_BRUNO_001",
  ageWindow: [20, 20],
  phase: "20_23",
  family: "market",
  title: "La llamada de Bruno",
  body: "Bruno puede presentarte ante su club, pero un favor previo no demuestra por sí solo que exista una necesidad deportiva actual. La escena solo podrá activarse cuando el mundo certifique esa oportunidad concreta.",
  visible: [
    "Bruno puede decir tu nombre; no puede garantizar una oferta.",
    "Si tienes representante certificado, puedes decidir si informarle del contacto."
  ],
  uncertain: [
    "No sabes si el puesto es una prioridad real ni cuánto pesa Bruno en esa decisión.",
    "Una presentación puede quedarse en scouting, generar interés informal o no avanzar."
  ],
  gates: [{ path: "facts.brunoFavorStance", op: "exists" }],
  weight: 14,
  choices: [
    {
      id: "AUTHORIZE_NOTIFY",
      label: "Autorizarle y avisar a tu agente",
      intentTags: ["bruno", "agent", "transparent"],
      eligibility: [{ path: "facts.activeAgentNpcId", op: "exists" }],
      primaryMessage: "Autorizas la presentación y mantienes informado a tu representante sin tratar el contacto como oferta.",
      secondaryMessage: "La transparencia protege la relación de agencia, aunque el interés puede no pasar de una consulta inicial.",
      primaryEffects: [n("rel.NPC_PLR_12.trust", 4), n("professional.agentControl", 2)],
      secondaryEffects: [n("rel.NPC_PLR_12.trust", 2)],
      primarySeedTransitions: [intensify("SEED_BRUNO_FAVOR", 5), intensify("SEED_AGENT_POWER", 3)],
      secondarySeedTransitions: [intensify("SEED_BRUNO_FAVOR", 3)]
    },
    {
      id: "AUTHORIZE_PRIVATE",
      label: "Autorizarle sin avisar al agente todavía",
      intentTags: ["bruno", "private", "timing"],
      primaryMessage: "Bruno mueve tu nombre de forma informal y tú conservas el control sobre cuándo escalar el contacto.",
      secondaryMessage: "La vía puede ser rápida, pero si el contacto llega por otro canal tu agente puede descubrirlo tarde.",
      primaryEffects: [n("rel.NPC_PLR_12.trust", 5), n("control.career", 3)],
      secondaryEffects: [n("rel.NPC_PLR_12.trust", 3), n("professional.agentControl", -2)],
      primarySeedTransitions: [intensify("SEED_BRUNO_FAVOR", 6)],
      secondarySeedTransitions: [intensify("SEED_BRUNO_FAVOR", 5), intensify("SEED_AGENT_POWER", 2)]
    },
    {
      id: "ASK_MORE",
      label: "Pedir más información antes de usar el favor",
      intentTags: ["evidence", "bruno", "caution"],
      primaryMessage: "Proteges a Bruno de prometer más de lo que sabe y separas una necesidad real de un comentario informal.",
      secondaryMessage: "La cautela evita una falsa expectativa, pero una ventana pequeña puede cerrarse antes de que llegue más contexto.",
      primaryEffects: [n("control.career", 5), n("rel.NPC_PLR_12.trust", 2)],
      secondaryEffects: [n("control.career", 3), n("reputation.marketHeat", -1)],
      primarySeedTransitions: [intensify("SEED_BRUNO_FAVOR", 3)],
      secondarySeedTransitions: [intensify("SEED_BRUNO_FAVOR", 2)]
    },
    {
      id: "DECLINE_HELP_OTHER",
      label: "Decir que no, pero ofrecer ayudarle en otra cosa",
      intentTags: ["decline", "friendship", "boundary"],
      primaryMessage: "No utilizas el favor como palanca de mercado y mantienes la relación fuera de una operación que no te convence.",
      secondaryMessage: "El límite es limpio, aunque Bruno puede sentir que la oportunidad que intentó abrir no tenía valor para ti.",
      primaryEffects: [n("rel.NPC_PLR_12.trust", 4)],
      secondaryEffects: [n("rel.NPC_PLR_12.trust", 1)],
      primarySeedTransitions: [intensify("SEED_BRUNO_FAVOR", 2)],
      secondarySeedTransitions: [intensify("SEED_BRUNO_FAVOR", 3)]
    }
  ],
  seedsRead: ["SEED_BRUNO_FAVOR", "SEED_AGENT_POWER"],
  seedsWrite: ["SEED_BRUNO_FAVOR", "SEED_AGENT_POWER"],
  npcRefs: ["NPC_PLR_12"],
  tags: ["bruno", "market_contact", "a5_ready_external_blocker"],
  canonStatus: "verified"
});

const EVT_21_AGT_001 = ambiguousEvent({
  id: "EVT_21_AGT_001",
  ageWindow: [21, 21],
  phase: "20_23",
  family: "agent",
  title: "La agencia quiere otro porcentaje",
  body: "Tras una buena temporada, tu representante quiere revisar su comisión a cambio de más servicios. La escena necesita términos reales de representación; una relación alta o un flag de contacto no demuestran comisión ni servicios.",
  visible: [
    "Conoces la propuesta solo cuando A1 certifique los términos actuales y los nuevos servicios.",
    "La identidad del agente procede exclusivamente de la autoridad compartida."
  ],
  uncertain: [
    "No sabes cuánto del acceso prometido existe realmente.",
    "Cambiar de agencia o dividir funciones puede mejorar condiciones y también filtrar la negociación."
  ],
  gates: [{ path: "facts.activeAgentNpcId", op: "exists" }],
  gateAlternatives: [
    [{ path: "reputation.marketHeat", op: "gte", value: 45 }],
    [{ path: "professional.nationalHeat", op: "gte", value: 35 }]
  ],
  weight: 15,
  choices: [
    {
      id: "ACCEPT_TARGETS",
      label: "Aceptar la subida a cambio de objetivos concretos",
      intentTags: ["agent", "performance_terms", "commit"],
      primaryMessage: "Aceptas pagar más solo si los nuevos servicios quedan ligados a objetivos comprobables.",
      secondaryMessage: "El acuerdo alinea incentivos, pero también aumenta el coste de representación antes de saber cuánto valor generará.",
      primaryEffects: [n("professional.agentControl", 6), n("control.career", 2)],
      secondaryEffects: [n("professional.agentControl", 7), n("control.career", -2)],
      primarySeedTransitions: [intensify("SEED_AGENT_POWER", 7)],
      secondarySeedTransitions: [intensify("SEED_AGENT_POWER", 9)]
    },
    {
      id: "KEEP_TERMS",
      label: "Negarte y mantener el contrato actual",
      intentTags: ["agent", "hold_terms", "control"],
      primaryMessage: "Mantienes el acuerdo vigente sin presentar la negativa como ruptura.",
      secondaryMessage: "Conservas coste y control, pero la agencia puede priorizar menos recursos si esperaba revisar condiciones.",
      primaryEffects: [n("control.career", 5)],
      secondaryEffects: [n("professional.agentControl", -2)],
      primarySeedTransitions: [intensify("SEED_AGENT_POWER", 4)],
      secondarySeedTransitions: [intensify("SEED_AGENT_POWER", 5)]
    },
    {
      id: "SOUND_OTHER_AGENCY",
      label: "Abrir conversaciones discretas con otra agencia",
      intentTags: ["agent", "market_test", "privacy"],
      primaryMessage: "Obtienes una referencia externa para valorar precio y servicios sin cambiar representación todavía.",
      secondaryMessage: "El sondeo mejora información, pero una filtración puede convertir una revisión contractual en conflicto de confianza.",
      primaryEffects: [n("control.career", 7)],
      secondaryEffects: [n("control.career", 4), n("professional.environmentStability", -2)],
      primarySeedTransitions: [intensify("SEED_AGENT_POWER", 6)],
      secondarySeedTransitions: [intensify("SEED_AGENT_POWER", 8), intensify("SEED_AGENT_OMISSION", 2)]
    },
    {
      id: "SPLIT_RIGHTS",
      label: "Separar representación deportiva e imagen",
      intentTags: ["agent", "split_roles", "image"],
      primaryMessage: "La especialización reduce la concentración de poder y obliga a definir quién sabe qué.",
      secondaryMessage: "Separar funciones puede mejorar especialización y a la vez multiplicar actores con información sensible.",
      primaryEffects: [n("professional.agentControl", -2), n("control.career", 5)],
      secondaryEffects: [n("professional.environmentStability", -2), n("control.career", 3)],
      primarySeedTransitions: [intensify("SEED_AGENT_POWER", 6)],
      secondarySeedTransitions: [intensify("SEED_AGENT_POWER", 7)]
    }
  ],
  seedsRead: ["SEED_FIRST_AGENT", "SEED_AGENT_OMISSION", "SEED_AGENT_POWER"],
  seedsWrite: ["SEED_AGENT_POWER", "SEED_AGENT_OMISSION"],
  tags: ["agent", "commission", "services", "a5_ready_external_blocker"],
  canonStatus: "verified"
});

export const A5_AGENT_READY_EXTERNAL_EVENTS: EventDefinition[] = [
  EVT_20_AGT_001,
  EVT_20_BRUNO_001,
  EVT_21_AGT_001
];
