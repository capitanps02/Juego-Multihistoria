import type { EventDefinition, SeedTransition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate, set } from "../18_20/helpers.js";

const transformSeed = (seedId: string, payload: Record<string, string | number | boolean | null>): SeedTransition => ({
  seedId,
  action: "transform",
  payload
});

const IMAGE_24 = ambiguousEvent({
  id: "EVT_24_IMG_001",
  ageWindow: [24, 24],
  phase: "23_26",
  family: "image",
  title: "La campaña que quiere una promesa",
  body: "Una marca te ofrece una campaña nacional basada en la frase «voy a quedarme para hacer historia», mientras tu contrato todavía permite salir.",
  visible: ["Conoces el lema propuesto, el calendario de publicación y que tu contrato todavía permite una salida."],
  uncertain: ["No sabes si el mercado cambiará después de grabar la campaña ni cómo leerá el público una frase promocional si acabas cambiando de club."],
  choices: [
    {
      id: "A",
      label: "Aceptar el lema",
      intentTags: ["image", "public_promise", "commercial"],
      primaryMessage: "Aceptas el lema sabiendo que es una campaña, no una obligación contractual de permanencia.",
      secondaryMessage: "La campaña gana fuerza comercial, pero deja una frase pública que puede entrar en tensión con una salida posterior.",
      primaryEffects: [n("professional.commercialPower", 5), n("professional.publicPolarization", 2)],
      secondaryEffects: [n("professional.commercialPower", 4), n("professional.publicPolarization", 4)],
      primarySeedTransitions: [transformSeed("SEED_SPONSOR_IMAGE", { campaign24: "promise_stay", publicPromise: true })],
      secondarySeedTransitions: [transformSeed("SEED_SPONSOR_IMAGE", { campaign24: "promise_stay", publicPromise: true })]
    },
    {
      id: "B",
      label: "Pedir un mensaje sin promesa de futuro",
      intentTags: ["image", "optionality", "commercial"],
      primaryMessage: "Mantienes el valor comercial de la campaña sin convertir tu futuro contractual en parte del mensaje.",
      secondaryMessage: "La marca acepta un mensaje más prudente, aunque la campaña pierde parte del gancho que buscaba.",
      primaryEffects: [n("professional.commercialPower", 3), n("professional.careerControl", 3)],
      secondaryEffects: [n("professional.commercialPower", 2), n("professional.careerControl", 2)],
      primarySeedTransitions: [transformSeed("SEED_SPONSOR_IMAGE", { campaign24: "no_future_promise", publicPromise: false })],
      secondarySeedTransitions: [transformSeed("SEED_SPONSOR_IMAGE", { campaign24: "no_future_promise", publicPromise: false })]
    },
    {
      id: "C",
      label: "Rechazar la campaña",
      intentTags: ["image", "decline", "control"],
      primaryMessage: "Renuncias a la campaña y mantienes tu futuro fuera de una promesa publicitaria.",
      secondaryMessage: "Proteges control narrativo, aunque pierdes exposición y una relación comercial útil.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.commercialPower", -2)],
      secondaryEffects: [n("professional.careerControl", 3), n("professional.commercialPower", -3)],
      primarySeedTransitions: [transformSeed("SEED_SPONSOR_IMAGE", { campaign24: "declined", publicPromise: false })],
      secondarySeedTransitions: [transformSeed("SEED_SPONSOR_IMAGE", { campaign24: "declined", publicPromise: false })]
    },
    {
      id: "D",
      label: "Aceptar solo si se publica tras cerrar mercado",
      intentTags: ["image", "timing", "optionality"],
      primaryMessage: "Aceptas la campaña pero separas su publicación del periodo en que todavía podría cambiar tu club.",
      secondaryMessage: "El calendario reduce la contradicción inmediata, aunque la marca pierde flexibilidad y puede recortar alcance.",
      primaryEffects: [n("professional.commercialPower", 3), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.commercialPower", 2), n("professional.environmentStability", 1)],
      primarySeedTransitions: [transformSeed("SEED_SPONSOR_IMAGE", { campaign24: "post_market", publicPromise: true, publishAfterMarket: true })],
      secondarySeedTransitions: [transformSeed("SEED_SPONSOR_IMAGE", { campaign24: "post_market", publicPromise: true, publishAfterMarket: true })]
    }
  ],
  gates: [{ path: "professional.commercialPower", op: "gte", value: 28 }],
  timeWindow: { months: [7, 8, 9] },
  weight: 18,
  cooldown: 99999,
  seedsRead: ["SEED_SPONSOR_IMAGE"],
  seedsWrite: ["SEED_SPONSOR_IMAGE"],
  tags: ["image", "brand", "public_promise", "t5_23", "staged_candidate"],
  canonStatus: "verified"
});

const LIFE_24 = ambiguousEvent({
  id: "EVT_24_LIFE_001",
  ageWindow: [24, 24],
  phase: "23_26",
  family: "life",
  title: "Quién trabaja para ti",
  body: "Entre viajes, prensa y contratos necesitas ayuda para agenda y asuntos diarios. Dani quiere encargarse de parte; tu agencia ofrece un profesional; tu familia prefiere a alguien conocido.",
  visible: ["Conoces quién haría cada tarea, quién le pagaría y qué acceso tendría a tu agenda diaria."],
  uncertain: ["No sabes cómo cambiará la relación personal cuando una persona cercana pase a trabajar para ti."],
  choices: [
    {
      id: "A",
      label: "Contratar a Dani",
      intentTags: ["personal_staff", "trusted_friend"],
      primaryMessage: "Conviertes una relación cercana en una relación también profesional y ganas coordinación diaria.",
      secondaryMessage: "La confianza facilita el trabajo, pero mezclar amistad y empleo introduce nuevas fronteras que todavía no habéis probado.",
      primaryEffects: [n("professional.environmentStability", 4), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.environmentStability", 2), n("professional.careerControl", 1)],
      primarySeedTransitions: [seedCreate("SEED_PERSONAL_STAFF", 62, { structure: "dani" })],
      secondarySeedTransitions: [seedCreate("SEED_PERSONAL_STAFF", 58, { structure: "dani" })]
    },
    {
      id: "B",
      label: "Elegir profesional de la agencia",
      intentTags: ["personal_staff", "agency"],
      primaryMessage: "Centralizas agenda y logística con la agencia y reduces coordinación entre proveedores.",
      secondaryMessage: "La solución es eficiente, pero aumenta la parte de tu vida cotidiana que pasa por la estructura de representación.",
      primaryEffects: [n("professional.environmentStability", 3), n("professional.agentControl", -4)],
      secondaryEffects: [n("professional.environmentStability", 2), n("professional.agentControl", -5)],
      primarySeedTransitions: [seedCreate("SEED_PERSONAL_STAFF", 60, { structure: "agency_professional" })],
      secondarySeedTransitions: [seedCreate("SEED_PERSONAL_STAFF", 64, { structure: "agency_professional" })]
    },
    {
      id: "C",
      label: "Contratar a un independiente",
      intentTags: ["personal_staff", "independent"],
      primaryMessage: "Separas vida diaria y representación con un profesional que no depende de tu agencia ni de tu familia.",
      secondaryMessage: "Ganas independencia, aunque el nuevo profesional tarda en entender tus rutinas y relaciones.",
      primaryEffects: [n("professional.careerControl", 5), n("professional.environmentStability", 2)],
      secondaryEffects: [n("professional.careerControl", 4), n("professional.environmentStability", 1)],
      primarySeedTransitions: [seedCreate("SEED_PERSONAL_STAFF", 66, { structure: "independent" })],
      secondarySeedTransitions: [seedCreate("SEED_PERSONAL_STAFF", 61, { structure: "independent" })]
    },
    {
      id: "D",
      label: "Repartir tareas entre alguien cercano y un profesional",
      intentTags: ["personal_staff", "hybrid"],
      primaryMessage: "Separar tareas permite conservar confianza personal y criterio profesional sin entregar todo el acceso a una sola persona.",
      secondaryMessage: "El reparto reduce dependencia, pero obliga a coordinar mejor información y responsabilidades.",
      primaryEffects: [n("professional.environmentStability", 4), n("professional.careerControl", 3)],
      secondaryEffects: [n("professional.environmentStability", 3), n("professional.careerControl", 2)],
      primarySeedTransitions: [seedCreate("SEED_PERSONAL_STAFF", 68, { structure: "hybrid" })],
      secondarySeedTransitions: [seedCreate("SEED_PERSONAL_STAFF", 63, { structure: "hybrid" })]
    }
  ],
  timeWindow: { months: [8, 9, 10] },
  weight: 16,
  cooldown: 99999,
  seedsWrite: ["SEED_PERSONAL_STAFF"],
  npcRefs: ["NPC_SOC_01"],
  tags: ["life", "staff", "boundaries", "t5_23", "staged_candidate"],
  canonStatus: "verified"
});

const PRESS_24 = ambiguousEvent({
  id: "EVT_24_PRS_001",
  ageWindow: [24, 24],
  phase: "23_26",
  family: "press",
  title: "El precio que nadie pidió",
  body: "Un medio publica que tu club no escuchará ofertas por debajo de una cifra enorme. Nadie te había informado de ese precio.",
  visible: ["La cifra se ha publicado y puedes comparar el mensaje público con lo que conoces de tu contrato."],
  uncertain: ["No sabes si la cifra nace del club, de un intermediario, de una estimación periodística o de una negociación que no conoces."],
  choices: [
    {
      id: "A",
      label: "Preguntar internamente y no hablar",
      intentTags: ["press", "internal_clarity"],
      primaryMessage: "Buscas contexto dentro del club antes de añadir otra versión pública.",
      secondaryMessage: "La consulta te da información parcial, pero el silencio deja que la cifra siga circulando sin corrección.",
      primaryEffects: [n("professional.careerControl", 3), n("professional.institutionalTrust", 2)],
      secondaryEffects: [n("professional.careerControl", 2), n("reputation.mediaHeat", 2)],
      primarySeedTransitions: [transformSeed("SEED_PUBLIC_CONTRACT", { price24: "internal_first" })],
      secondarySeedTransitions: [transformSeed("SEED_PUBLIC_CONTRACT", { price24: "internal_first" })]
    },
    {
      id: "B",
      label: "Negar públicamente que exista precio acordado",
      intentTags: ["press", "public_denial"],
      primaryMessage: "Aclara que tú no has acordado esa cifra sin afirmar que conozcas todas las conversaciones del club.",
      secondaryMessage: "La aclaración protege tu posición, pero convierte la cifra en un debate público de mayor alcance.",
      primaryEffects: [n("professional.careerControl", 4), n("reputation.mediaHeat", 4), n("professional.publicPolarization", 2)],
      secondaryEffects: [n("professional.careerControl", 3), n("reputation.mediaHeat", 6), n("professional.publicPolarization", 3)],
      primarySeedTransitions: [transformSeed("SEED_PUBLIC_CONTRACT", { price24: "public_denial" })],
      secondarySeedTransitions: [transformSeed("SEED_PUBLIC_CONTRACT", { price24: "public_denial" })]
    },
    {
      id: "C",
      label: "Autorizar a tu agente a decir que escucharías proyectos",
      intentTags: ["press", "market_signal"],
      primaryMessage: "Sin discutir la cifra, dejas claro que una valoración pública no equivale a cerrar el mercado.",
      secondaryMessage: "La señal recupera opcionalidad, pero eleva el ruido sobre tu futuro.",
      primaryEffects: [n("professional.careerControl", 3), n("reputation.marketHeat", 3), n("reputation.mediaHeat", 2)],
      secondaryEffects: [n("professional.careerControl", 2), n("reputation.marketHeat", 4), n("reputation.mediaHeat", 4)],
      primarySeedTransitions: [transformSeed("SEED_PUBLIC_CONTRACT", { price24: "open_to_projects" })],
      secondarySeedTransitions: [transformSeed("SEED_PUBLIC_CONTRACT", { price24: "open_to_projects" })]
    },
    {
      id: "D",
      label: "Llamar a Clara para intentar conocer la fuente",
      intentTags: ["press", "source_check"],
      primaryMessage: "Intentas entender el origen de la cifra sin convertir una fuente periodística en verdad automática.",
      secondaryMessage: "Obtienes contexto útil, aunque no una prueba definitiva de quién fijó el precio.",
      primaryEffects: [n("professional.careerControl", 3), n("reputation.mediaHeat", 1)],
      secondaryEffects: [n("professional.careerControl", 2), n("reputation.mediaHeat", 2)],
      primarySeedTransitions: [transformSeed("SEED_PUBLIC_CONTRACT", { price24: "source_check" })],
      secondarySeedTransitions: [transformSeed("SEED_PUBLIC_CONTRACT", { price24: "source_check" })]
    }
  ],
  gates: [{ path: "reputation.marketHeat", op: "gte", value: 48 }],
  timeWindow: { months: [9, 10, 11, 12, 1] },
  weight: 17,
  cooldown: 99999,
  seedsRead: ["SEED_PUBLIC_CONTRACT"],
  seedsWrite: ["SEED_PUBLIC_CONTRACT"],
  tags: ["press", "valuation", "market_signal", "t5_23", "staged_candidate"],
  canonStatus: "verified"
});

const FAMILY_25 = ambiguousEvent({
  id: "EVT_25_FAM_001",
  ageWindow: [25, 25],
  phase: "23_26",
  family: "family",
  title: "El negocio ya no es pequeño",
  body: "La inversión o proyecto familiar de años anteriores ha crecido, necesita capital adicional o atraviesa una mala fase. La cantidad solicitada ya no es simbólica.",
  visible: ["Conoces la cantidad solicitada, la estructura actual del proyecto y qué familiar asumiría la gestión."],
  uncertain: ["No sabes si aportar más capital resolverá el problema ni si un gestor externo mejorará realmente el proyecto."],
  choices: [
    {
      id: "A",
      label: "Aportar capital",
      intentTags: ["family_business", "capital"],
      primaryMessage: "Aumentas tu exposición al proyecto familiar y das margen financiero para continuar.",
      secondaryMessage: "El apoyo compra tiempo, pero también concentra más patrimonio y responsabilidad dentro del mismo proyecto.",
      primaryEffects: [n("professional.moneyComfort", -6), n("professional.environmentStability", 2)],
      secondaryEffects: [n("professional.moneyComfort", -9), n("professional.environmentStability", 1)],
      primarySeedTransitions: [seedCreate("SEED_FAMILY_BUSINESS", 72, { stage25: "add_capital" })],
      secondarySeedTransitions: [seedCreate("SEED_FAMILY_BUSINESS", 78, { stage25: "add_capital" })]
    },
    {
      id: "B",
      label: "Prestar con contrato y calendario",
      intentTags: ["family_business", "loan", "boundaries"],
      primaryMessage: "Ayudas al proyecto pero separas apoyo familiar y obligación financiera con un calendario explícito.",
      secondaryMessage: "La estructura reduce ambigüedad, aunque formalizar la deuda cambia la relación cuando llegan los primeros vencimientos.",
      primaryEffects: [n("professional.moneyComfort", -4), n("professional.careerControl", 3)],
      secondaryEffects: [n("professional.moneyComfort", -5), n("professional.environmentStability", -1), n("professional.careerControl", 2)],
      primarySeedTransitions: [seedCreate("SEED_FAMILY_BUSINESS", 68, { stage25: "formal_loan" })],
      secondarySeedTransitions: [seedCreate("SEED_FAMILY_BUSINESS", 72, { stage25: "formal_loan" })]
    },
    {
      id: "C",
      label: "No poner más dinero",
      intentTags: ["family_business", "limit"],
      primaryMessage: "Fijas un límite financiero sin afirmar que el proyecto vaya a fracasar.",
      secondaryMessage: "Proteges tu exposición, aunque la familia tiene que buscar otra solución y puede leer tu límite como distancia.",
      primaryEffects: [n("professional.moneyComfort", 3), n("professional.careerControl", 3)],
      secondaryEffects: [n("professional.moneyComfort", 2), n("professional.environmentStability", -3)],
      primarySeedTransitions: [seedCreate("SEED_FAMILY_BUSINESS", 58, { stage25: "no_more_money" })],
      secondarySeedTransitions: [seedCreate("SEED_FAMILY_BUSINESS", 62, { stage25: "no_more_money" })]
    },
    {
      id: "D",
      label: "Financiar solo si entra un gestor externo",
      intentTags: ["family_business", "governance"],
      primaryMessage: "Condicionas el nuevo capital a una estructura profesional de gestión.",
      secondaryMessage: "El criterio profesional reduce dependencia familiar, pero puede sentirse como una pérdida de control para quien llevaba el proyecto.",
      primaryEffects: [n("professional.moneyComfort", -3), n("professional.careerControl", 4), n("professional.environmentStability", 1)],
      secondaryEffects: [n("professional.moneyComfort", -4), n("professional.careerControl", 3), n("professional.environmentStability", -1)],
      primarySeedTransitions: [seedCreate("SEED_FAMILY_BUSINESS", 74, { stage25: "external_manager" })],
      secondarySeedTransitions: [seedCreate("SEED_FAMILY_BUSINESS", 78, { stage25: "external_manager" })]
    }
  ],
  timeWindow: { months: [2, 3, 4, 5] },
  weight: 16,
  cooldown: 99999,
  seedsRead: ["SEED_FAMILY_BUSINESS", "SEED_FAMILY_MONEY"],
  seedsWrite: ["SEED_FAMILY_BUSINESS"],
  npcRefs: ["NPC_FAM_01", "NPC_FAM_02"],
  tags: ["family", "money", "governance", "t5_23", "staged_candidate"],
  canonStatus: "verified"
});

const END_25 = ambiguousEvent({
  id: "EVT_25_END_001",
  ageWindow: [25, 25],
  phase: "23_26",
  family: "legacy",
  title: "A los 26, ¿qué estás protegiendo?",
  body: "Al cerrar la tercera temporada del bloque, tu agente o persona de confianza te pide ordenar prioridades antes del siguiente contrato.",
  visible: ["Puedes ordenar prioridades sin convertirlas en una obligación futura."],
  uncertain: ["No sabes qué oferta, entrenador, lesión o cambio personal alterará ese orden durante la siguiente etapa."],
  choices: [
    {
      id: "A",
      label: "Proteger techo deportivo",
      intentTags: ["age26_priority", "ceiling"],
      primaryMessage: "Entras en la siguiente etapa priorizando el máximo techo deportivo.",
      secondaryMessage: "La prioridad queda registrada como guía, no como veto a decisiones futuras.",
      immediateEffects: [set("world.nextCyclePriority", "ceiling")],
      primarySeedTransitions: [seedCreate("SEED_AGE26_PRIORITY", 70, { priority: "ceiling", advisory: true })],
      secondarySeedTransitions: [seedCreate("SEED_AGE26_PRIORITY", 70, { priority: "ceiling", advisory: true })]
    },
    {
      id: "B",
      label: "Proteger minutos e identidad",
      intentTags: ["age26_priority", "role"],
      primaryMessage: "Entras en la siguiente etapa priorizando minutos y una identidad deportiva reconocible.",
      secondaryMessage: "La prioridad queda registrada como guía, no como veto a decisiones futuras.",
      immediateEffects: [set("world.nextCyclePriority", "role")],
      primarySeedTransitions: [seedCreate("SEED_AGE26_PRIORITY", 70, { priority: "role", advisory: true })],
      secondarySeedTransitions: [seedCreate("SEED_AGE26_PRIORITY", 70, { priority: "role", advisory: true })]
    },
    {
      id: "C",
      label: "Proteger cuerpo y estabilidad",
      intentTags: ["age26_priority", "body_stability"],
      primaryMessage: "Entras en la siguiente etapa priorizando cuerpo, continuidad y estabilidad.",
      secondaryMessage: "La prioridad queda registrada como guía, no como veto a decisiones futuras.",
      immediateEffects: [set("world.nextCyclePriority", "body_stability")],
      primarySeedTransitions: [seedCreate("SEED_AGE26_PRIORITY", 70, { priority: "body_stability", advisory: true })],
      secondarySeedTransitions: [seedCreate("SEED_AGE26_PRIORITY", 70, { priority: "body_stability", advisory: true })]
    },
    {
      id: "D",
      label: "Proteger libertad",
      intentTags: ["age26_priority", "freedom"],
      primaryMessage: "Entras en la siguiente etapa priorizando libertad contractual y capacidad de cambiar de contexto.",
      secondaryMessage: "La prioridad queda registrada como guía, no como veto a decisiones futuras.",
      immediateEffects: [set("world.nextCyclePriority", "freedom")],
      primarySeedTransitions: [seedCreate("SEED_AGE26_PRIORITY", 70, { priority: "freedom", advisory: true })],
      secondarySeedTransitions: [seedCreate("SEED_AGE26_PRIORITY", 70, { priority: "freedom", advisory: true })]
    }
  ],
  timeWindow: { months: [5, 6] },
  weight: 96,
  cooldown: 99999,
  seedsWrite: ["SEED_AGE26_PRIORITY"],
  tags: ["legacy", "transition26", "hard_deadline", "t5_23", "staged_candidate"],
  canonStatus: "verified"
});

export const T523_STAGED_INDEPENDENT_PRINCIPAL_EVENTS: EventDefinition[] = [
  IMAGE_24,
  LIFE_24,
  PRESS_24,
  FAMILY_25,
  END_25
];
