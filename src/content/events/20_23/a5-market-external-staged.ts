import type { EventDefinition, SeedTransition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const intensify = (seedId: string, intensity: number): SeedTransition => ({ seedId, action: "intensify", intensity });

export const A5_MARKET_EXTERNAL_REQUIREMENTS = Object.freeze({
  EVT_20_MKT_001: {
    owner: "A3",
    facts: ["compatible CareerOffer", "formal sporting-role/plan terms"],
    forbidden: ["marketHeat as offer", "invented destination", "direct CareerTerms mutation"]
  },
  EVT_20_JAN_001: {
    owner: "A3/world",
    facts: ["third-party sale state", "conditional interest provenance", "formal renewal/third-destination offer when signable"],
    forbidden: ["HAS_OFFER", "marketHeat as transaction", "invented sale"]
  },
  EVT_21_MKT_001: {
    owner: "A3",
    facts: ["purchase CareerOffer", "planned loan destination/terms"],
    forbidden: ["prestige as owner offer", "invented loan destination", "direct club mutation"]
  },
  EVT_21_IMG_001: {
    owner: "A3/world-commercial",
    facts: ["real sponsorship/image proposal", "payment/use/duration terms"],
    forbidden: ["mediaHeat as sponsorship", "synthetic brand flag"]
  },
  EVT_22_MKT_001: {
    owner: "A3",
    facts: ["real rival-club CareerOffer", "sporting project attached to that proposal"],
    forbidden: ["rivalry flag as offer", "marketHeat as offer", "direct signing effects"]
  },
  EVT_22_DDL_001: {
    owner: "A3",
    facts: ["live formal deadline CareerOffer", "remaining decision time", "role/exit condition when choice D is available"],
    forbidden: ["month alone as deadline", "fake countdown", "direct signing effects"]
  }
});

const EVT_20_MKT_001 = ambiguousEvent({
  id: "EVT_20_MKT_001", ageWindow: [20, 20], phase: "20_23", family: "market",
  title: "Titular aquí, promesa allí",
  body: "Una propuesta formal puede ofrecer un salto de nivel mientras tu situación actual sí te da minutos. Salario, duración y categoría son hechos; el rol prometido y el plan de desarrollo solo cuentan cuando A3 los acredita.",
  visible: ["Si existe una CareerOffer compatible, puedes leer sus términos formales.", "Tu rol y minutos actuales siguen siendo hechos separados."],
  uncertain: ["Una frase como «vas a jugar» no es una garantía contractual.", "No sabes si un salto acelerará tu desarrollo o te congelará."],
  gates: [{ path: "facts.pendingCareerOffer", op: "exists" }],
  weight: 12,
  choices: [
    { id: "ACCEPT_JUMP", label: "Aceptar el salto", intentTags: ["market","ambition"], primaryMessage: "La decisión prioriza techo y nuevo contexto; la firma seguirá perteneciendo al bridge formal.", secondaryMessage: "El salto puede elevar tu entorno y reducir el control inmediato sobre minutos.", primaryEffects: [n("control.career",1),n("professional.environmentStability",-2)], secondaryEffects: [n("professional.environmentStability",-4)] },
    { id: "LOAN_PLAN", label: "Pedir un plan de cesión si no alcanzas cierto rol", intentTags: ["development","counter"], primaryMessage: "Intentas convertir una promesa de desarrollo en una condición comprobable antes de firmar.", secondaryMessage: "Pedir protección reduce incertidumbre, pero puede enfriar a un comprador que no quiere fijar ese compromiso.", primaryEffects: [n("control.career",5),n("professional.contractPower",2)], secondaryEffects: [n("control.career",3)] },
    { id: "REJECT_RENEW", label: "Rechazar y buscar renovar donde juegas", intentTags: ["stability","reject"], primaryMessage: "Priorizas continuidad deportiva sin fabricar una renovación que todavía no exista.", secondaryMessage: "Rechazar preserva minutos actuales, pero la renovación debe materializarse por su autoridad propia.", primaryEffects: [n("professional.environmentStability",4),n("control.career",2)], secondaryEffects: [n("professional.environmentStability",2)] },
    { id: "LEVERAGE", label: "Usar la oferta para mejorar condiciones sin intención clara de irte", intentTags: ["leverage","risk"], primaryMessage: "La oferta aporta palanca real, no una firma automática.", secondaryMessage: "La maniobra puede mejorar poder negociador o hacer que tu club empiece a preparar una alternativa.", primaryEffects: [n("professional.contractPower",5),n("control.career",2)], secondaryEffects: [n("professional.institutionalTrust",-4),n("reputation.mediaHeat",2)], primaryModifiers: [{id:"EXIT_STYLE_CONTEXT",conditions:[{path:"facts.exitStylePlayoff",op:"exists"}],add:4,reason:"La postura previa ante retención y mercado condiciona cómo se interpreta la palanca."}] }
  ],
  offerBridge: {
    choiceActions: {
      ACCEPT_JUMP: "accept",
      LOAN_PLAN: "counter",
      REJECT_RENEW: "reject",
      LEVERAGE: "defer"
    }
  },
  seedsRead: ["SEED_AGENT_POWER","SEED_EXIT_STYLE_UDV"],
  tags: ["market","career_offer","a5_ready_external_blocker"], canonStatus: "verified"
});

const EVT_20_JAN_001 = ambiguousEvent({
  id: "EVT_20_JAN_001", ageWindow: [20,20], phase: "20_23", family: "market",
  title: "Enero: la compra que depende de otro",
  body: "Un club te tiene en su lista, pero su movimiento depende de vender antes a otro jugador. No existe una oferta firme hasta que esa venta ocurra; tu decisión es cómo gestionar una ventana condicional.",
  visible: ["Sabes que el interés todavía no equivale a una CareerOffer.", "Cualquier renovación o tercer destino signable debe existir formalmente antes de elegirlo."],
  uncertain: ["Tu agente puede creer que la venta está avanzada y otra fuente dudarlo.", "Cada día cambia el poder contractual real."],
  timeWindow: { months:[1] }, weight: 11,
  choices: [
    { id:"RENEW_NOW", label:"Renovar ahora", intentTags:["renewal","stability"], primaryMessage:"Aceptas seguridad solo si A3 ha materializado una renovación real.", secondaryMessage:"La seguridad puede cerrar una ventana externa que nunca llegó a ser oferta firme.", primaryEffects:[n("professional.environmentStability",4)], secondaryEffects:[n("control.career",-2)] },
    { id:"WAIT_LATE", label:"Esperar hasta el último tramo", intentTags:["wait","risk"], primaryMessage:"Conservas la posibilidad condicionada sin fingir que ya existe una oferta.", secondaryMessage:"La venta ajena puede no ocurrir y la espera reduce otras opciones.", primaryEffects:[n("control.career",3)], secondaryEffects:[n("professional.contractPower",-2)] },
    { id:"RENEW_EXIT", label:"Renovar solo con una salida pactada o cláusula razonable", intentTags:["counter","control"], primaryMessage:"Intentas comprar seguridad sin perder toda movilidad; los términos deben llegar como propuesta formal.", secondaryMessage:"La condición puede ser rechazada y mantener abierta la incertidumbre.", primaryEffects:[n("control.career",5),n("professional.contractPower",2)], secondaryEffects:[n("professional.institutionalTrust",-2)] },
    { id:"THIRD_DESTINATION", label:"Buscar un tercer destino menos atractivo pero inmediato", intentTags:["market","certainty"], primaryMessage:"Solo puedes elegirlo si existe una tercera propuesta real; el interés condicional no fabrica destino.", secondaryMessage:"La certeza puede resolver enero a costa de techo deportivo.", primaryEffects:[n("control.career",4)], secondaryEffects:[n("professional.environmentStability",-2)] }
  ],
  tags:["market","conditional_interest","a5_ready_external_blocker"], canonStatus:"verified"
});

const EVT_21_MKT_001 = ambiguousEvent({
  id:"EVT_21_MKT_001",ageWindow:[21,21],phase:"20_23",family:"market",
  title:"El club que te quiere… cedido",
  body:"Un gran club plantea comprarte para cederte. El precio y el contrato pueden ser formales; el destino de cesión y el calendario de regreso solo son hechos si aparecen en la propuesta acreditada.",
  visible:["La CareerOffer de compra, si existe, tiene identidad y términos exactos.","El plan de cesión no puede deducirse del prestigio del comprador."],
  uncertain:["«Te queremos para el futuro» no fija una fecha.","El destino puede seguir abierto hasta después de la compra."],
  gates:[{path:"facts.pendingCareerOfferKind",op:"eq",value:"transfer"}],weight:11,
  choices:[
    {id:"SIGN_MODEL",label:"Firmar y aceptar el modelo",intentTags:["accept","big_club"],primaryMessage:"Aceptar solo podrá aplicar los términos exactos de la oferta formal.",secondaryMessage:"El propietario puede ser prestigioso mientras tus minutos dependen de otro club.",primaryEffects:[n("professional.environmentStability",-2)],secondaryEffects:[n("control.career",-3)]},
    {id:"KNOW_LOAN",label:"Exigir conocer el destino antes de cerrar",intentTags:["information","counter"],primaryMessage:"Pides que el siguiente club deje de ser una promesa abstracta antes de decidir.",secondaryMessage:"La exigencia reduce incertidumbre y también puede romper una operación aún incompleta.",primaryEffects:[n("control.career",6)],secondaryEffects:[n("professional.contractPower",1)]},
    {id:"EXIT_IF_LOANS",label:"Pedir una condición de salida si encadenas cesiones",intentTags:["protection","counter"],primaryMessage:"Intentas limitar un laberinto de cesiones mediante términos verificables.",secondaryMessage:"El comprador puede rechazar una protección que reduzca su control futuro.",primaryEffects:[n("control.career",6),n("professional.contractPower",3)],secondaryEffects:[n("professional.institutionalTrust",-2)]},
    {id:"REJECT_CONTROL",label:"Rechazar y mantener control de tu próximo paso",intentTags:["reject","control"],primaryMessage:"Conservas control contractual; rechazar no crea una alternativa mejor.",secondaryMessage:"La decisión protege agencia propia y puede cerrar un salto de prestigio.",primaryEffects:[n("control.career",6),n("professional.environmentStability",2)],secondaryEffects:[n("reputation.marketHeat",-2)]}
  ],
  seedsRead:["SEED_AGENT_POWER"],tags:["market","loan_plan","career_offer","a5_ready_external_blocker"],canonStatus:"verified"
});

const EVT_21_IMG_001 = ambiguousEvent({
  id:"EVT_21_IMG_001",ageWindow:[21,21],phase:"20_23",family:"image",
  title:"La campaña",
  body:"Una marca quiere construir una campaña alrededor de tu origen. Pago, uso de imagen y duración deben existir como propuesta comercial real; exposición mediática no equivale a oferta.",
  visible:["Conoces los términos comerciales solo cuando el productor los materializa.","La historia propuesta puede mezclar hechos reales y una narrativa de marca."],
  uncertain:["No sabes cómo reaccionarán club y afición.","Una iniciativa genuina puede convertirse también en marketing involuntario."],
  weight:10,
  choices:[
    {id:"ACCEPT",label:"Aceptar tal cual",intentTags:["sponsor","accept"],primaryMessage:"Aceptas el relato comercial con sus términos reales.",secondaryMessage:"La campaña gana alcance y puede simplificar tu historia más de lo que esperabas.",primaryEffects:[n("professional.commercialPower",5),n("professional.moneyComfort",4)],secondaryEffects:[n("reputation.mediaHeat",4),n("professional.publicPolarization",3)],primarySeedTransitions:[seedCreate("SEED_SPONSOR_IMAGE",60,{stance:"accept"})],secondarySeedTransitions:[seedCreate("SEED_SPONSOR_IMAGE",66,{stance:"accept",friction:true})]},
    {id:"CHANGE_STORY",label:"Pedir un relato menos personal",intentTags:["sponsor","counter","privacy"],primaryMessage:"Intentas conservar el acuerdo reduciendo cuánto de tu origen se convierte en producto.",secondaryMessage:"La marca acepta menos personalización o decide que pierde parte del valor de campaña.",primaryEffects:[n("professional.commercialPower",3),n("control.career",3)],secondaryEffects:[n("professional.commercialPower",1)],primarySeedTransitions:[seedCreate("SEED_SPONSOR_IMAGE",54,{stance:"change_story"})],secondarySeedTransitions:[seedCreate("SEED_SPONSOR_IMAGE",58,{stance:"change_story",commercial_cost:true})]},
    {id:"REJECT",label:"Rechazar por no mezclar origen y marca",intentTags:["reject","identity"],primaryMessage:"Mantienes fuera de la campaña una parte de tu identidad que no quieres vender.",secondaryMessage:"La frontera es clara y renuncias también al pago y a la exposición asociados.",primaryEffects:[n("control.career",4),n("professional.environmentStability",2)],secondaryEffects:[n("professional.commercialPower",-2)],primarySeedTransitions:[seedCreate("SEED_SPONSOR_IMAGE",46,{stance:"reject"})],secondarySeedTransitions:[seedCreate("SEED_SPONSOR_IMAGE",48,{stance:"reject",opportunity_cost:true})]},
    {id:"LOCAL_INITIATIVE",label:"Aceptar y dedicar parte del pago a una iniciativa local sin anunciarlo",intentTags:["accept","origin","private_giving"],primaryMessage:"La campaña financia una acción local sin convertir la donación en condición publicitaria.",secondaryMessage:"Si la aportación se conoce después, un gesto privado puede volver a entrar en el relato de marca.",primaryEffects:[n("professional.commercialPower",4),n("professional.environmentStability",3)],secondaryEffects:[n("reputation.mediaHeat",3),n("professional.publicPolarization",2)],primarySeedTransitions:[seedCreate("SEED_SPONSOR_IMAGE",62,{stance:"local_initiative"}),seedCreate("SEED_HOME_DISTANCE",45,{stance:"private_local_support"})],secondarySeedTransitions:[seedCreate("SEED_SPONSOR_IMAGE",66,{stance:"local_initiative",leak:true}),seedCreate("SEED_HOME_DISTANCE",48,{stance:"support_became_public"})]}
  ],
  seedsWrite:["SEED_SPONSOR_IMAGE","SEED_HOME_DISTANCE"],tags:["image","commercial_proposal","a5_ready_external_blocker"],canonStatus:"verified"
});

const EVT_22_MKT_001 = ambiguousEvent({
  id:"EVT_22_MKT_001",ageWindow:[22,22],phase:"20_23",family:"market",
  title:"La oferta de tu rival deportivo",
  body:"Un rival deportivo presenta una propuesta formal. El coste reputacional es real, pero no convierte el fichaje en una prohibición moral ni permite inventar un proyecto deportivo que no esté en los términos.",
  visible:["Contrato y comprador proceden de una CareerOffer real.","El rol proyectado requiere evidencia propia."],
  uncertain:["No sabes cuánto durará el rechazo público ni si el proyecto cumplirá su parte deportiva."],
  gates:[{path:"facts.pendingCareerOfferKind",op:"eq",value:"transfer"}],weight:11,
  choices:[
    {id:"ACCEPT",label:"Aceptar",intentTags:["accept","rival"],primaryMessage:"La firma, si se ejecuta, aplicará exactamente la CareerOffer seleccionada.",secondaryMessage:"El salto puede ser bueno deportivamente y costoso en identidad pública.",primaryEffects:[n("control.career",2),n("reputation.mediaHeat",4)],secondaryEffects:[n("professional.publicPolarization",6)]},
    {id:"REJECT_PERSONAL",label:"Rechazar por coste personal",intentTags:["reject","identity"],primaryMessage:"Rechazas una opción real por un coste que para ti pesa más que sus condiciones.",secondaryMessage:"La decisión protege vínculo e identidad, sin garantizar que aparezca otra oferta.",primaryEffects:[n("professional.environmentStability",4)],secondaryEffects:[n("reputation.marketHeat",-2)]},
    {id:"SECRET_UNTIL_CLOSE",label:"Pedir que no haya filtraciones hasta cerrar",intentTags:["privacy","negotiation"],primaryMessage:"Intentas separar la negociación de la reacción pública antes de que exista una firma.",secondaryMessage:"La discreción puede funcionar o hacer más explosiva una filtración posterior.",primaryEffects:[n("control.career",4),n("reputation.mediaHeat",-1)],secondaryEffects:[n("reputation.mediaHeat",4)]},
    {id:"LEVERAGE_RENEW",label:"Usar la oferta para renovar donde estás",intentTags:["leverage","renewal"],primaryMessage:"La oferta aporta palanca, pero una renovación actual debe ser otra propuesta formal.",secondaryMessage:"La maniobra puede mejorar poder o quemar simultáneamente ambas vías.",primaryEffects:[n("professional.contractPower",5)],secondaryEffects:[n("professional.institutionalTrust",-5),n("reputation.mediaHeat",3)],primaryModifiers:[{id:"PUBLIC_CONTRACT_MEMORY",conditions:[{path:"facts.publicContractChoice",op:"exists"}],add:4,reason:"La postura contractual pública previa condiciona la credibilidad de la palanca."}]}
  ],
  seedsRead:["SEED_PUBLIC_CONTRACT","SEED_EXIT_STYLE_UDV"],tags:["market","rival","career_offer","a5_ready_external_blocker"],canonStatus:"verified"
});

const EVT_22_DDL_001 = ambiguousEvent({
  id:"EVT_22_DDL_001",ageWindow:[22,22],phase:"20_23",family:"market",
  title:"Último día, 17:40",
  body:"Quedan horas y hay una oferta formal viva. El reloj es un hecho del mercado, no el mes del calendario; comprador, contrato y tiempo restante deben venir de A3.",
  visible:["Conoces el contrato del comprador y el tiempo real que queda cuando A3 lo acredita.","No necesitas adivinar por qué cambió la postura del club para decidir."],
  uncertain:["No sabes si habrá otra oferta en verano.","Negociar puede mejorar términos o hacer que el comprador pase a otra opción."],
  gates:[{path:"facts.pendingCareerOffer",op:"exists"}],weight:14,
  choices:[
    {id:"ACCEPT_NOW",label:"Aceptar sin pedir mejoras",intentTags:["accept","deadline"],primaryMessage:"Priorizas certeza; la firma queda en la autoridad formal de la oferta.",secondaryMessage:"Cerrar rápido elimina riesgo de reloj y también margen de negociación.",primaryEffects:[n("control.career",1)],secondaryEffects:[n("professional.contractPower",-1)],primarySeedTransitions:[seedCreate("SEED_DEADLINE_DAY",62,{stance:"accept_now"})],secondarySeedTransitions:[seedCreate("SEED_DEADLINE_DAY",66,{stance:"accept_now",margin_lost:true})]},
    {id:"NEGOTIATE",label:"Negociar una mejora aunque el reloj corra",intentTags:["counter","deadline"],primaryMessage:"Arriesgas la ventana para intentar elevar los términos formales.",secondaryMessage:"El comprador puede mejorar la propuesta o pasar a su plan B antes de que respondas.",primaryEffects:[n("professional.contractPower",4),n("control.career",3)],secondaryEffects:[n("reputation.marketHeat",-2)],primarySeedTransitions:[seedCreate("SEED_DEADLINE_DAY",68,{stance:"negotiate"})],secondarySeedTransitions:[seedCreate("SEED_DEADLINE_DAY",72,{stance:"negotiate",timing_cost:true})]},
    {id:"REJECT_TIME",label:"Rechazar por falta de tiempo para evaluar",intentTags:["reject","deadline","caution"],primaryMessage:"Prefieres una decisión informada a firmar por presión temporal.",secondaryMessage:"Proteges control y puedes perder una ventana que no regrese.",primaryEffects:[n("control.career",5),n("professional.environmentStability",2)],secondaryEffects:[n("reputation.marketHeat",-3)],primarySeedTransitions:[seedCreate("SEED_DEADLINE_DAY",56,{stance:"reject_time"})],secondarySeedTransitions:[seedCreate("SEED_DEADLINE_DAY",60,{stance:"reject_time",window_lost:true})]},
    {id:"CONDITIONAL_ACCEPT",label:"Aceptar sujeto a una condición concreta de rol o salida",intentTags:["counter","condition","deadline"],primaryMessage:"La condición debe convertirse en término verificable antes de que exista firma.",secondaryMessage:"La protección mejora el encaje si la aceptan y puede romper el acuerdo si el reloj vence.",primaryEffects:[n("control.career",6),n("professional.contractPower",3)],secondaryEffects:[n("reputation.marketHeat",-2)],primarySeedTransitions:[seedCreate("SEED_DEADLINE_DAY",70,{stance:"conditional"})],secondarySeedTransitions:[seedCreate("SEED_DEADLINE_DAY",74,{stance:"conditional",deal_broke:true})]}
  ],
  seedsWrite:["SEED_DEADLINE_DAY"],tags:["market","deadline","career_offer","a5_ready_external_blocker"],canonStatus:"verified"
});

export const A5_MARKET_OWNER_READY_PRINCIPALS: EventDefinition[] = [
  EVT_20_MKT_001, EVT_20_JAN_001, EVT_21_MKT_001, EVT_21_IMG_001, EVT_22_MKT_001, EVT_22_DDL_001
];


/** A0/A5 post-authority handoff: only EVT_20_MKT_001 is formally offer-ready in this file. */
export const A5_MARKET_READY_EVENTS: EventDefinition[] = [EVT_20_MKT_001];
