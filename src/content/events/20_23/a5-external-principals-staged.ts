import type { EventDefinition, EventFamily, Effect, SeedTransition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const intensify = (seedId: string, intensity: number): SeedTransition => ({ seedId, action: "intensify", intensity });
const E = (path: string, delta: number): Effect => n(path, delta);

export interface A5ExternalRequirement {
  eventId: string;
  owner: string;
  fact: string;
  integrationApi: string;
  forbiddenProxies: readonly string[];
}

/**
 * Owner-side complete principals that remain outside active EVENTS until the listed
 * shared fact exists. No fake REAL_* flags or proxy gates are introduced here.
 */
export const A5_EXTERNAL_PRINCIPAL_REQUIREMENTS: readonly A5ExternalRequirement[] = [
  { eventId:"EVT_20_MKT_001", owner:"A3 market/contracts", fact:"formal signable CareerOffer with sporting-plan/loan fallback terms", integrationApi:"CareerOffer + pendingCareerOffer facts", forbiddenProxies:["marketHeat","role as offer","direct contract mutation"] },
  { eventId:"EVT_20_MED_001", owner:"medical/world", fact:"authoritative prior diagnosis/medical-record disclosure context", integrationApi:"medical fact resolver", forbiddenProxies:["body.risk as diagnosis","fatigue as diagnosis","injuryCount as diagnosis"] },
  { eventId:"EVT_20_AGT_001", owner:"A1 NPC/representation", fact:"certified active representative plus representation permission/commission terms", integrationApi:"resolveActiveAgent + representation contract fact", forbiddenProxies:["AGENT_ACTIVE","contact flags","SEED_FIRST_AGENT","relationship magnitude"] },
  { eventId:"EVT_20_MATCH_003", owner:"A4 sport", fact:"live match minute/score/player-on-pitch/tactical order context", integrationApi:"rich current-match SportContext", forbiddenProxies:["roleScore","form","seasonDay","narrative RNG"] },
  { eventId:"EVT_20_JAN_001", owner:"A3 market", fact:"conditional buyer interest tied to a real prerequisite sale and market deadline", integrationApi:"market opportunity/deadline authority", forbiddenProxies:["marketHeat","HAS_OFFER","invented destination"] },
  { eventId:"EVT_20_BRUNO_001", owner:"A1/world + A3", fact:"Bruno current-club need and authorized introduction provenance", integrationApi:"external NPC career fact + market contact authority", forbiddenProxies:["SEED_BRUNO_FAVOR as current need","relationship as market fact"] },
  { eventId:"EVT_21_MONEY_001", owner:"family/economy world", fact:"actual family debt/request amount and provenance", integrationApi:"family financial request fact", forbiddenProxies:["money threshold as debt","SEED_FIRST_BIG_MONEY as debt"] },
  { eventId:"EVT_21_AGT_001", owner:"A1 representation", fact:"active representation contract with current commission/services and switch permission", integrationApi:"resolveActiveAgent + representation contract fact", forbiddenProxies:["agentControl as contract","contact flags","relationship"] },
  { eventId:"EVT_21_MKT_001", owner:"A3 market/contracts", fact:"formal CareerOffer whose project includes a real loan/development plan", integrationApi:"CareerOffer rich sporting-plan terms", forbiddenProxies:["marketHeat","BIG_CLUB flag as offer","invented loan destination"] },
  { eventId:"EVT_21_NAT_001", owner:"A4/shared national selection", fact:"official senior-list publication proving protagonist omitted", integrationApi:"national selection-cycle authority", forbiddenProxies:["nationalStanding","caps","nationalHeat","tournamentCycleWindow"] },
  { eventId:"EVT_21_IMG_001", owner:"market/image world", fact:"real image-rights campaign proposal with payment/use/duration terms", integrationApi:"commercial proposal authority", forbiddenProxies:["mediaHeat as proposal","prestige as proposal","sponsor seed as proposal"] },
  { eventId:"EVT_21_MED_001", owner:"medical + A4 sport", fact:"concrete compatible diagnosis/pain/recommendation plus high-value real match", integrationApi:"medical fact + SportContext", forbiddenProxies:["body.risk as diagnosis","HIGH_PROFILE_MATCH legacy flag","roleScore"] },
  { eventId:"EVT_21_CCH_002", owner:"A1/shared coach", fact:"recent current-club coach change plus concrete new tactical-role assignment", integrationApi:"coach chronology + tactical assignment fact", forbiddenProxies:["COACH_FIRED alone","coachSecurity threshold","roleScore as tactical order"] },
  { eventId:"EVT_22_LOCK_001", owner:"A1/world", fact:"real teammate sale/salary conflict with identifiable participants and knowledge provenance", integrationApi:"locker conflict fact", forbiddenProxies:["lockerPower as conflict","generic teammate flag"] },
  { eventId:"EVT_22_HOME_001", owner:"A4 sport", fact:"real scheduled fixture against UDV/current former club", integrationApi:"SportContext fixture identity", forbiddenProxies:["month proxy","HOME fixture flag","route alone"] },
  { eventId:"EVT_22_MKT_001", owner:"A3 market/contracts", fact:"formal CareerOffer from an actual sporting rival with role/project terms", integrationApi:"CareerOffer + rivalry identity", forbiddenProxies:["marketHeat","club prestige","invented rival"] },
  { eventId:"EVT_22_MED_001", owner:"medical + A3", fact:"advanced real transfer plus requested medical test/historical finding", integrationApi:"CareerOffer transfer context + medical test authority", forbiddenProxies:["body.risk as scan","pending offer without medical request"] },
  { eventId:"EVT_22_TACT_001", owner:"A4 sport + A1 coach", fact:"real high-value match and concrete tactical assignment", integrationApi:"SportContext + tactical order authority", forbiddenProxies:["roleScore","form","match importance guessed from competition name"] },
  { eventId:"EVT_22_DDL_001", owner:"A3 market/contracts", fact:"live formal deadline CareerOffer with authoritative remaining time and explicit role/exit condition support", integrationApi:"CareerOffer deadline context", forbiddenProxies:["month/day proxy","marketHeat","direct signing"] }
] as const;

const byId = new Map(A5_EXTERNAL_PRINCIPAL_REQUIREMENTS.map(row => [row.eventId, row]));
export function a5ExternalPrincipalRequirement(eventId: string): A5ExternalRequirement | null {
  return byId.get(eventId) ?? null;
}

function scene(args: {
  id:string; age:number; family:EventFamily; title:string; body:string; visible:string[]; uncertain:string[];
  months?:number[]; gates?:EventDefinition["gates"]; seedsRead?:string[]; seedsWrite?:string[]; npcRefs?:string[];
  choices:Array<{
    id:string; label:string; intentTags:string[]; primaryMessage:string; secondaryMessage:string;
    primaryEffects?:Effect[]; secondaryEffects?:Effect[]; primarySeeds?:SeedTransition[]; secondarySeeds?:SeedTransition[];
    eligibility?:EventDefinition["gates"];
  }>;
}): EventDefinition {
  return ambiguousEvent({
    id:args.id, ageWindow:[args.age,args.age], phase:"20_23", family:args.family, title:args.title, body:args.body,
    visible:args.visible, uncertain:args.uncertain, timeWindow:args.months?{months:args.months}:undefined,
    gates:args.gates, seedsRead:args.seedsRead, seedsWrite:args.seedsWrite, npcRefs:args.npcRefs,
    tags:["a5_ready_external_blocker","owner_complete"],
    canonStatus:"verified",
    choices:args.choices.map(c=>({
      id:c.id,label:c.label,intentTags:c.intentTags,primaryMessage:c.primaryMessage,secondaryMessage:c.secondaryMessage,
      primaryEffects:c.primaryEffects,secondaryEffects:c.secondaryEffects,
      primarySeedTransitions:c.primarySeeds,secondarySeedTransitions:c.secondarySeeds,eligibility:c.eligibility
    }))
  });
}

const EVT_20_MKT_001 = scene({
  id:"EVT_20_MKT_001", age:20, family:"market", title:"Titular aquí, promesa allí",
  body:"Aparece una oferta de un escalón superior que no promete titularidad. Tu club actual sí te da minutos o una ruta plausible hacia ellos.",
  visible:["La oferta formal, si existe, muestra salario, duración y categoría.","Tu rol actual es un hecho separado de las promesas del comprador."],
  uncertain:["«Vas a jugar» y «te vemos cerca del once» no son garantías contractuales.","No sabes si el salto acelerará tu techo o congelará minutos."],
  months:[7,8,1], gates:[{path:"facts.pendingCareerOffer",op:"exists"}], seedsRead:["SEED_AGENT_POWER","SEED_EXIT_STYLE_UDV"], npcRefs:[],
  choices:[
    {id:"ACCEPT_STEP",label:"Aceptar el salto",intentTags:["ambition","transfer"],primaryMessage:"Priorizas techo y contexto superior sin convertir una promesa verbal en garantía.",secondaryMessage:"El salto mejora el escaparate, pero la competencia real puede dejarte más lejos de los minutos.",primaryEffects:[E("control.career",2)],secondaryEffects:[E("professional.environmentStability",-3)]},
    {id:"LOAN_PLAN",label:"Pedir un plan de cesión si no alcanzas cierto rol",intentTags:["plan","loan","control"],primaryMessage:"Intentas convertir una promesa abierta en un mecanismo revisable.",secondaryMessage:"El comprador acepta hablar de desarrollo, pero no necesariamente de un destino cerrado.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("professional.contractPower",2)]},
    {id:"REJECT_RENEW",label:"Rechazar y buscar renovar donde juegas",intentTags:["minutes","stability"],primaryMessage:"Das prioridad al rol conocido y a negociar desde minutos reales.",secondaryMessage:"La continuidad protege tu presente, aunque la ventana superior puede no repetirse.",primaryEffects:[E("professional.environmentStability",4)],secondaryEffects:[E("reputation.marketHeat",-2)]},
    {id:"LEVERAGE_CURRENT",label:"Usar la oferta para mejorar condiciones sin decidir aún salir",intentTags:["leverage","contract"],primaryMessage:"La oferta real te da palanca sin obligarte a firmar otro contrato.",secondaryMessage:"Usarla como presión puede hacer que el club actual empiece a preparar alternativas.",primaryEffects:[E("professional.contractPower",5)],secondaryEffects:[E("professional.institutionalTrust",-4)]}
  ]
});

const EVT_20_MED_001 = scene({
  id:"EVT_20_MED_001", age:20, family:"medical", title:"El historial que viaja contigo",
  body:"En un reconocimiento de fichaje o de inicio de temporada te preguntan por episodios previos. Algunos fueron diagnósticos; otros solo molestias conocidas por el antiguo staff.",
  visible:["Sabes qué episodios fueron diagnosticados y cuáles no.","La privacidad médica y la credibilidad contractual no son la misma cosa."],
  uncertain:["No sabes qué información recibió ya el nuevo servicio médico.","Tampoco sabes qué peso dará el médico a una omisión menor."],
  months:[7,8,9], seedsRead:["SEED_BODY_PRECEDENT","SEED_PHYSIO_CONFIDENCE"], seedsWrite:["SEED_MEDICAL_DISCLOSURE"], npcRefs:["NPC_MED_01"],
  choices:[
    {id:"FULL_DETAIL",label:"Contarlo todo con detalle",intentTags:["transparency","medical"],primaryMessage:"Das una cronología amplia y facilitas que el staff distinga diagnóstico de molestia.",secondaryMessage:"La transparencia aumenta pruebas y preguntas, aunque no demuestra por sí sola un problema.",primaryEffects:[E("control.career",3)],secondaryEffects:[E("professional.environmentStability",-1)],primarySeeds:[seedCreate("SEED_MEDICAL_DISCLOSURE",62,{stance:"full_detail"})],secondarySeeds:[seedCreate("SEED_MEDICAL_DISCLOSURE",66,{stance:"full_detail",extra_review:true})]},
    {id:"DIAGNOSED_ONLY",label:"Responder solo a lo que figure como diagnóstico",intentTags:["privacy","medical"],primaryMessage:"Te ciñes a hechos documentados y evitas convertir cada molestia en patología.",secondaryMessage:"La respuesta es defendible, pero puede parecer estrecha si aparece otro registro.",primaryEffects:[E("control.career",4)],secondaryEffects:[E("professional.institutionalTrust",-2)],primarySeeds:[seedCreate("SEED_MEDICAL_DISCLOSURE",54,{stance:"diagnosed_only"})],secondarySeeds:[seedCreate("SEED_MEDICAL_DISCLOSURE",58,{stance:"diagnosed_only",credibility_risk:true})]},
    {id:"MINIMIZE",label:"Minimizar un episodio que consideras irrelevante",intentTags:["privacy","risk"],primaryMessage:"El episodio realmente menor no altera la evaluación.",secondaryMessage:"Si el informe lo menciona, la discusión pasa de salud a credibilidad.",primaryEffects:[E("control.career",1)],secondaryEffects:[E("professional.institutionalTrust",-5)],primarySeeds:[seedCreate("SEED_MEDICAL_DISCLOSURE",48,{stance:"minimize"})],secondarySeeds:[seedCreate("SEED_MEDICAL_DISCLOSURE",65,{stance:"minimize",credibility_cost:true})]},
    {id:"ASK_RECORDS",label:"Pedir primero qué información médica han recibido",intentTags:["information","privacy"],primaryMessage:"Aclara qué datos están sobre la mesa antes de ampliar la conversación.",secondaryMessage:"La petición es prudente, aunque puede percibirse como defensiva.",primaryEffects:[E("control.career",6)],secondaryEffects:[E("professional.institutionalTrust",-1)],primarySeeds:[seedCreate("SEED_MEDICAL_DISCLOSURE",55,{stance:"ask_records"})],secondarySeeds:[seedCreate("SEED_MEDICAL_DISCLOSURE",57,{stance:"ask_records",defensive_read:true})]}
  ]
});

const EVT_20_AGT_001 = scene({
  id:"EVT_20_AGT_001", age:20, family:"agent", title:"El teléfono del agente",
  body:"Tu representante propone centralizar clubes, periodistas y marcas. Delegar puede profesionalizar tu carrera y también decidir qué información llega hasta ti.",
  visible:["La identidad del agente debe estar certificada.","La comisión y los permisos reales de representación deben ser conocidos antes de elegir."],
  uncertain:["No sabes qué oportunidades filtrará por considerarlas pequeñas.","Tampoco sabes cuánto valor real añade centralizar todos los canales."],
  months:[7,8,9], gates:[{path:"facts.activeAgentNpcId",op:"exists"}], seedsRead:["SEED_AGENT_OMISSION"], seedsWrite:["SEED_AGENT_POWER"], npcRefs:[],
  choices:[
    {id:"BROAD_CONTROL",label:"Darle control amplio",intentTags:["delegate","agent"],primaryMessage:"Centralizas negociación y reduces interlocutores.",secondaryMessage:"El filtro gana eficiencia, pero también más capacidad para decidir qué merece llegar a ti.",primaryEffects:[E("professional.agentControl",8)],secondaryEffects:[E("professional.agentControl",7),E("control.career",-3)],primarySeeds:[seedCreate("SEED_AGENT_POWER",66,{choice:"broad_control"})],secondarySeeds:[seedCreate("SEED_AGENT_POWER",72,{choice:"broad_control",omission_risk:true})]},
    {id:"REPORT_ALL",label:"Exigir información de todo contacto serio antes de responder",intentTags:["oversight","agent"],primaryMessage:"Mantienes al agente como negociador, pero te reservas el mapa de oportunidades.",secondaryMessage:"La supervisión protege autonomía y puede ralentizar ventanas rápidas.",primaryEffects:[E("control.career",7),E("professional.agentControl",2)],secondaryEffects:[E("control.career",5),E("professional.agentControl",-1)],primarySeeds:[seedCreate("SEED_AGENT_POWER",58,{choice:"report_all"})],secondarySeeds:[seedCreate("SEED_AGENT_POWER",61,{choice:"report_all",speed_cost:true})]},
    {id:"SPLIT_FUNCTIONS",label:"Mantener prensa e imagen en tus manos y mercado en las suyas",intentTags:["split","agent","media"],primaryMessage:"Separas funciones y creas un contrapeso claro.",secondaryMessage:"La especialización ayuda, aunque varios canales pueden producir mensajes incompatibles.",primaryEffects:[E("control.career",6),E("professional.agentControl",1)],secondaryEffects:[E("reputation.mediaHeat",2),E("professional.environmentStability",-1)],primarySeeds:[seedCreate("SEED_AGENT_POWER",56,{choice:"split_functions"})],secondarySeeds:[seedCreate("SEED_AGENT_POWER",60,{choice:"split_functions",message_conflict:true})]},
    {id:"NO_CENTRALIZE",label:"Negarte a centralizar",intentTags:["autonomy","agent"],primaryMessage:"Conservas acceso directo a tus canales y obligas a que la representación conviva con tu autonomía.",secondaryMessage:"Mantienes control, pero asumes más ruido y negociación fragmentada.",primaryEffects:[E("control.career",8),E("professional.agentControl",-4)],secondaryEffects:[E("control.career",5),E("professional.environmentStability",-2)],primarySeeds:[seedCreate("SEED_AGENT_POWER",52,{choice:"no_centralize"})],secondarySeeds:[seedCreate("SEED_AGENT_POWER",56,{choice:"no_centralize",coordination_cost:true})]}
  ]
});

const EVT_20_MATCH_003 = scene({
  id:"EVT_20_MATCH_003", age:20, family:"sport", title:"El minuto 65",
  body:"Vas ganando y el técnico te ordena bajar diez metros y reducir el uno contra uno. Necesitas números para consolidarte, pero el partido tiene un contexto táctico real.",
  visible:["Conoces marcador, minuto, si estás realmente en campo y la orden concreta.","La escena no decide el resultado deportivo por narrativa."],
  uncertain:["No sabes qué valoran los observadores ni cómo terminará la acción.","Disciplina, producción individual y resultado de equipo pueden separarse."],
  seedsRead:["SEED_MENA_EARLY_READ"], seedsWrite:["SEED_TACTICAL_SACRIFICE"],
  choices:[
    {id:"STRICT",label:"Cumplir de forma estricta",intentTags:["discipline","team"],primaryMessage:"Aceptas el sacrificio táctico y haces visible tu fiabilidad.",secondaryMessage:"La disciplina protege el plan, aunque reduce tu presencia ofensiva.",primaryEffects:[E("professional.institutionalTrust",5)],secondaryEffects:[E("reputation.marketHeat",-1)],primarySeeds:[seedCreate("SEED_TACTICAL_SACRIFICE",60,{stance:"strict"})],secondarySeeds:[seedCreate("SEED_TACTICAL_SACRIFICE",63,{stance:"strict",visibility_cost:true})]},
    {id:"HYBRID",label:"Cumplir sin renunciar a atacar cuando el contexto lo permita",intentTags:["balance","tactical"],primaryMessage:"Intentas respetar la estructura sin apagar por completo tu amenaza.",secondaryMessage:"El equilibrio puede parecer inteligente o demasiado ambiguo para ambos objetivos.",primaryEffects:[E("professional.institutionalTrust",3),E("control.career",2)],secondaryEffects:[E("professional.environmentStability",-1)],primarySeeds:[seedCreate("SEED_TACTICAL_SACRIFICE",55,{stance:"hybrid"})],secondarySeeds:[seedCreate("SEED_TACTICAL_SACRIFICE",58,{stance:"hybrid",ambiguity:true})]},
    {id:"KEEP_GAME",label:"Mantener tu juego y asumir el riesgo",intentTags:["identity","risk"],primaryMessage:"Priorizas tu impacto ofensivo y aceptas que el técnico juzgue la desobediencia por separado.",secondaryMessage:"La apuesta mantiene tu identidad, pero el coste político existe aunque una jugada salga bien.",primaryEffects:[E("control.career",4),E("reputation.marketHeat",2)],secondaryEffects:[E("professional.institutionalTrust",-6)],primarySeeds:[seedCreate("SEED_TACTICAL_SACRIFICE",68,{stance:"keep_game"})],secondarySeeds:[seedCreate("SEED_TACTICAL_SACRIFICE",72,{stance:"keep_game",coach_cost:true})]}
  ]
});

const EVT_20_JAN_001 = scene({
  id:"EVT_20_JAN_001", age:20, family:"market", title:"Enero: la compra que depende de otro",
  body:"Un club quiere ficharte solo si vende antes a su titular. Tu club pide renovar mientras espera. La incertidumbre es real y el reloj también.",
  visible:["Sabes que todavía no existe una oferta firme del comprador condicionado.","Conoces tu contrato actual; ningún botón firma o inventa un destino por sí mismo."],
  uncertain:["Una fuente cree que la venta está avanzada y otra la pone en duda.","Esperar puede crear una oferta o dejarte sin ella."],
  months:[1], seedsWrite:["SEED_DEADLINE_DAY"],
  choices:[
    {id:"RENEW_NOW",label:"Renovar ahora",intentTags:["security","contract"],primaryMessage:"Priorizas certeza contractual sin fingir que la operación condicionada ya existe.",secondaryMessage:"Compras seguridad, pero reduces parte de tu opcionalidad si la venta finalmente ocurre.",primaryEffects:[E("professional.environmentStability",5)],secondaryEffects:[E("professional.contractPower",-2)],primarySeeds:[seedCreate("SEED_DEADLINE_DAY",52,{stance:"renew_now"})],secondarySeeds:[seedCreate("SEED_DEADLINE_DAY",56,{stance:"renew_now",option_cost:true})]},
    {id:"WAIT_LATE",label:"Esperar hasta el último tramo",intentTags:["wait","optionality"],primaryMessage:"Conservas la ventana condicionada y aceptas que el tiempo erosione seguridad.",secondaryMessage:"La venta ajena no depende de ti y la espera puede no producir nada firmable.",primaryEffects:[E("control.career",4)],secondaryEffects:[E("professional.environmentStability",-4)],primarySeeds:[seedCreate("SEED_DEADLINE_DAY",60,{stance:"wait"})],secondarySeeds:[seedCreate("SEED_DEADLINE_DAY",65,{stance:"wait",no_offer_risk:true})]},
    {id:"RENEW_EXIT",label:"Renovar solo con una salida pactada o cláusula razonable",intentTags:["contract","optionality"],primaryMessage:"Intentas combinar seguridad con una vía futura documentada.",secondaryMessage:"La petición puede mejorar tu control o encarecer una renovación que el club quería simple.",primaryEffects:[E("professional.contractPower",5),E("control.career",3)],secondaryEffects:[E("professional.institutionalTrust",-2)],primarySeeds:[seedCreate("SEED_DEADLINE_DAY",58,{stance:"renew_exit_condition"})],secondarySeeds:[seedCreate("SEED_DEADLINE_DAY",62,{stance:"renew_exit_condition",friction:true})]},
    {id:"THIRD_DESTINATION",label:"Buscar un tercer destino menos atractivo pero inmediato",intentTags:["fallback","market"],primaryMessage:"Buscas certeza real en lugar de esperar una operación dependiente de terceros.",secondaryMessage:"El destino inmediato reduce incertidumbre, pero puede ser una decisión tomada bajo presión temporal.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("reputation.marketHeat",-1)],primarySeeds:[seedCreate("SEED_DEADLINE_DAY",61,{stance:"third_destination"})],secondarySeeds:[seedCreate("SEED_DEADLINE_DAY",64,{stance:"third_destination",fear_cost:true})]}
  ]
});

const EVT_20_BRUNO_001 = scene({
  id:"EVT_20_BRUNO_001", age:20, family:"market", title:"La llamada de Bruno",
  body:"Bruno puede presentar tu nombre ante su club, pero un favor previo no demuestra que su director deportivo necesite ahora un jugador de tu perfil.",
  visible:["Bruno ofrece una introducción, no una oferta.","Si tienes agente activo, puedes decidir cuándo informarle."],
  uncertain:["No sabes la prioridad real del puesto ni cuánto pesa Bruno en esa decisión.","El contacto puede acabar en scouting, propuesta o nada."],
  months:[11,12,1,2], seedsRead:["SEED_BRUNO_FAVOR","SEED_AGENT_POWER"], npcRefs:["NPC_PLR_12"],
  choices:[
    {id:"AUTHORIZE_NOTIFY",label:"Autorizarle y avisar a tu agente",intentTags:["favor","agent","transparent"],eligibility:[{path:"facts.activeAgentNpcId",op:"exists"}],primaryMessage:"Usas el favor sin saltarte el canal de representación.",secondaryMessage:"La coordinación protege relaciones, aunque puede ralentizar un contacto pequeño.",primaryEffects:[E("control.career",4),E("rel.NPC_PLR_12.trust",3)],secondaryEffects:[E("professional.agentControl",1)],primarySeeds:[intensify("SEED_BRUNO_FAVOR",4),intensify("SEED_AGENT_POWER",2)],secondarySeeds:[intensify("SEED_BRUNO_FAVOR",3),intensify("SEED_AGENT_POWER",3)]},
    {id:"AUTHORIZE_PRIVATE",label:"Autorizarle sin avisar al agente todavía",intentTags:["favor","private","speed"],primaryMessage:"Permites la introducción como contacto exploratorio y conservas el momento.",secondaryMessage:"Si progresa sin tu representante, el ahorro de tiempo puede convertirse en conflicto de información.",primaryEffects:[E("rel.NPC_PLR_12.trust",4),E("control.career",2)],secondaryEffects:[E("professional.agentControl",-3)],primarySeeds:[intensify("SEED_BRUNO_FAVOR",5)],secondarySeeds:[intensify("SEED_BRUNO_FAVOR",6),intensify("SEED_AGENT_POWER",5)]},
    {id:"ASK_DETAILS",label:"Pedir más información antes de usar el favor",intentTags:["information","favor"],primaryMessage:"Proteges a Bruno de comprometer su nombre sin saber qué busca realmente el club.",secondaryMessage:"La prudencia mejora información y puede perder timing.",primaryEffects:[E("control.career",5),E("rel.NPC_PLR_12.trust",2)],secondaryEffects:[E("reputation.marketHeat",-1)],primarySeeds:[intensify("SEED_BRUNO_FAVOR",2)],secondarySeeds:[intensify("SEED_BRUNO_FAVOR",3)]},
    {id:"DECLINE_HELP",label:"Decirle que no, pero ofrecer ayudarle en otra cosa",intentTags:["boundary","friendship"],primaryMessage:"Separas amistad y mercado sin despreciar el gesto.",secondaryMessage:"Rechazar protege límites, aunque Bruno puede sentir que el favor ya no tiene sitio en tu carrera.",primaryEffects:[E("rel.NPC_PLR_12.trust",3)],secondaryEffects:[E("rel.NPC_PLR_12.affinity",-2)],primarySeeds:[intensify("SEED_BRUNO_FAVOR",2)],secondarySeeds:[intensify("SEED_BRUNO_FAVOR",3)]}
  ]
});

const EVT_21_MONEY_001 = scene({
  id:"EVT_21_MONEY_001", age:21, family:"money", title:"El primer contrato que cambia a tu familia",
  body:"Una petición familiar concreta aparece cuando por primera vez puedes ayudar de verdad. El hecho externo debe existir; tu sueldo por sí solo no crea una deuda.",
  visible:["Conoces la cantidad solicitada y tus ingresos reales.","La petición tiene una persona y una causa concretas."],
  uncertain:["No sabes si será puntual ni qué expectativa generará.","Ayudar y poner límites pueden afectar la relación de formas distintas."],
  months:[7,8], seedsRead:["SEED_FIRST_BIG_MONEY"], seedsWrite:["SEED_FAMILY_MONEY"], npcRefs:["NPC_FAM_01","NPC_FAM_02"],
  choices:[
    {id:"PAY_ALL",label:"Pagar la deuda completa",intentTags:["family","money","support"],primaryMessage:"El problema inmediato desaparece y tu capacidad económica cambia el equilibrio familiar.",secondaryMessage:"La ayuda funciona, pero puede convertir tu disponibilidad económica en una expectativa estable.",primaryEffects:[E("professional.moneyComfort",-7),E("professional.environmentStability",3)],secondaryEffects:[E("professional.moneyComfort",-8),E("control.career",-2)],primarySeeds:[seedCreate("SEED_FAMILY_MONEY",68,{stance:"pay_all"})],secondarySeeds:[seedCreate("SEED_FAMILY_MONEY",74,{stance:"pay_all",dependency_risk:true})]},
    {id:"PART_LIMIT",label:"Ayudar con una parte y fijar límite",intentTags:["family","boundary","money"],primaryMessage:"Participas sin asumir que todos los problemas futuros serán tuyos.",secondaryMessage:"El límite protege autonomía, aunque puede sentirse frío en el momento.",primaryEffects:[E("professional.moneyComfort",-4),E("control.career",3)],secondaryEffects:[E("professional.environmentStability",-1)],primarySeeds:[seedCreate("SEED_FAMILY_MONEY",58,{stance:"part_limit"})],secondarySeeds:[seedCreate("SEED_FAMILY_MONEY",62,{stance:"part_limit",family_friction:true})]},
    {id:"NO_MONEY",label:"No intervenir económicamente",intentTags:["boundary","autonomy"],primaryMessage:"Mantienes separados tus ingresos y la responsabilidad familiar.",secondaryMessage:"La decisión protege autonomía y deja abierto un problema real que puede crecer.",primaryEffects:[E("control.career",4)],secondaryEffects:[E("professional.environmentStability",-4)],primarySeeds:[seedCreate("SEED_FAMILY_MONEY",54,{stance:"no_money"})],secondarySeeds:[seedCreate("SEED_FAMILY_MONEY",60,{stance:"no_money",unresolved_problem:true})]},
    {id:"ASK_DOCUMENTS",label:"Pedir documentos y entender primero el problema",intentTags:["information","family"],primaryMessage:"Intentas distinguir urgencia, cantidad y alternativas antes de transferir dinero.",secondaryMessage:"La petición puede ser sensata y también vivirse como una falta de confianza.",primaryEffects:[E("control.career",6)],secondaryEffects:[E("professional.environmentStability",-2)],primarySeeds:[seedCreate("SEED_FAMILY_MONEY",56,{stance:"ask_documents"})],secondarySeeds:[seedCreate("SEED_FAMILY_MONEY",59,{stance:"ask_documents",trust_cost:true})]}
  ]
});

const EVT_21_AGT_001 = scene({
  id:"EVT_21_AGT_001", age:21, family:"agent", title:"La agencia quiere otro porcentaje",
  body:"La agencia propone revisar comisión y servicios. La escena necesita contrato de representación real; agentControl no demuestra comisión ni exclusividad.",
  visible:["Conoces la comisión vigente, la propuesta y los servicios incluidos.","Sabes quién es tu representante activo."],
  uncertain:["No sabes cuánto acceso prometido es realmente diferencial.","Otra agencia puede ser mejor, igual o peor aunque cobre distinto."],
  months:[7,8,9], gates:[{path:"facts.activeAgentNpcId",op:"exists"}], seedsRead:["SEED_AGENT_POWER"], seedsWrite:["SEED_AGENT_POWER"],
  choices:[
    {id:"ACCEPT_TARGETS",label:"Aceptar la subida a cambio de objetivos concretos",intentTags:["agent","incentives"],primaryMessage:"Vinculas más comisión a servicios definidos en lugar de premiar una promesa abierta.",secondaryMessage:"Los objetivos aclaran expectativas, pero aumentan el coste si la agencia cumple.",primaryEffects:[E("professional.agentControl",4),E("control.career",2)],secondaryEffects:[E("professional.contractPower",-2)],primarySeeds:[seedCreate("SEED_AGENT_POWER",67,{choice:"accept_targets"})],secondarySeeds:[seedCreate("SEED_AGENT_POWER",70,{choice:"accept_targets",cost:true})]},
    {id:"KEEP_TERMS",label:"Negarte y mantener el contrato",intentTags:["agent","boundary"],primaryMessage:"Mantienes el marco actual y obligas a justificar cualquier revisión futura con hechos.",secondaryMessage:"La negativa protege coste, pero puede reducir inversión de una agencia que esperaba crecer contigo.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("professional.agentControl",-2)],primarySeeds:[seedCreate("SEED_AGENT_POWER",55,{choice:"keep_terms"})],secondarySeeds:[seedCreate("SEED_AGENT_POWER",58,{choice:"keep_terms",friction:true})]},
    {id:"SOUND_OTHER",label:"Abrir conversaciones discretas con otra agencia",intentTags:["agent","market","optionality"],primaryMessage:"Creas una referencia externa antes de decidir.",secondaryMessage:"El sondeo puede mejorar tu información o filtrarse y erosionar confianza.",primaryEffects:[E("control.career",6)],secondaryEffects:[E("professional.environmentStability",-2)],primarySeeds:[seedCreate("SEED_AGENT_POWER",63,{choice:"sound_other"})],secondarySeeds:[seedCreate("SEED_AGENT_POWER",68,{choice:"sound_other",leak_risk:true})]},
    {id:"SPLIT_IMAGE",label:"Separar representación deportiva e imagen",intentTags:["agent","image","specialization"],primaryMessage:"Repartes funciones y reduces dependencia de un único intermediario.",secondaryMessage:"La especialización crea contrapesos y también más puntos de coordinación.",primaryEffects:[E("control.career",5),E("professional.agentControl",-1)],secondaryEffects:[E("reputation.mediaHeat",2)],primarySeeds:[seedCreate("SEED_AGENT_POWER",60,{choice:"split_image"})],secondarySeeds:[seedCreate("SEED_AGENT_POWER",64,{choice:"split_image",coordination_cost:true})]}
  ]
});

const EVT_21_MKT_001 = scene({
  id:"EVT_21_MKT_001", age:21, family:"market", title:"El club que te quiere… cedido",
  body:"Un club grande te quiere comprar y desarrollar mediante cesión. El prestigio del propietario y el lugar donde jugarías son hechos distintos.",
  visible:["La oferta formal debe existir y mostrar precio/salario/duración.","El plan de cesión solo es visible si la propia oferta lo acredita."],
  uncertain:["El destino puede no estar cerrado.","«Te queremos para el futuro» no fija una fecha de primer equipo."],
  months:[7,8,1], gates:[{path:"facts.pendingCareerOffer",op:"exists"}], seedsRead:["SEED_AGENT_POWER"],
  choices:[
    {id:"SIGN_MODEL",label:"Firmar y aceptar el modelo",intentTags:["bigclub","loan","ambition"],primaryMessage:"Aceptas que propiedad y minutos puedan estar separados.",secondaryMessage:"El salto eleva techo y puede convertirte en activo encadenado a destinos que no controlas.",primaryEffects:[E("reputation.marketHeat",3)],secondaryEffects:[E("control.career",-3)]},
    {id:"KNOW_DESTINATION",label:"Exigir conocer el destino antes de cerrar",intentTags:["clarity","loan","control"],primaryMessage:"Pides una decisión sobre dónde competir, no solo quién poseerá tu contrato.",secondaryMessage:"Reducir incertidumbre mejora control y puede romper una operación aún incompleta.",primaryEffects:[E("control.career",7)],secondaryEffects:[E("reputation.marketHeat",-2)]},
    {id:"EXIT_PROTECTION",label:"Pedir una salida protegida si encadenas cesiones",intentTags:["contract","loan","protection"],primaryMessage:"Intentas limitar un futuro de préstamos sin ruta clara.",secondaryMessage:"La protección aumenta tu control y puede ser incompatible con el modelo del comprador.",primaryEffects:[E("professional.contractPower",5)],secondaryEffects:[E("professional.institutionalTrust",-2)]},
    {id:"DECLINE_CONTROL",label:"Rechazar y mantener control de tu próximo paso",intentTags:["control","stability"],primaryMessage:"Renuncias al escudo grande para conservar capacidad de elegir dónde juegas.",secondaryMessage:"La autonomía se mantiene y la oportunidad de propiedad élite puede no repetirse.",primaryEffects:[E("control.career",7),E("professional.environmentStability",2)],secondaryEffects:[E("reputation.marketHeat",-2)]}
  ]
});

const EVT_21_NAT_001 = scene({
  id:"EVT_21_NAT_001", age:21, family:"selection", title:"La ausencia",
  body:"Se publica una lista absoluta y tu nombre no aparece. La escena solo puede activarse cuando una lista oficial demuestra la omisión; standing, caps o heat no bastan.",
  visible:["La lista oficial es un hecho publicado.","Sabes que estás fuera de esa convocatoria concreta."],
  uncertain:["No sabes si estuviste cerca ni qué criterio pesó.","Cualquier explicación privada puede seguir siendo parcial."],
  months:[9,10,11,3,4], seedsRead:["SEED_CLARA_CHANNEL"], seedsWrite:["SEED_SELECTION_SNUB"],
  choices:[
    {id:"DO_MORE",label:"Decir que debes hacer más",intentTags:["humility","selection"],primaryMessage:"Evitas atribuirte información que no tienes y conviertes la ausencia en motivación pública.",secondaryMessage:"La respuesta es prudente y puede quedar invisible en un ciclo mediático que busca conflicto.",primaryEffects:[E("professional.environmentStability",3)],secondaryEffects:[E("reputation.mediaHeat",-1)],primarySeeds:[seedCreate("SEED_SELECTION_SNUB",54,{stance:"do_more"})],secondarySeeds:[seedCreate("SEED_SELECTION_SNUB",56,{stance:"do_more",low_visibility:true})]},
    {id:"MERIT_FIELD",label:"Decir que los méritos deberían medirse en el campo",intentTags:["challenge","selection"],primaryMessage:"Defiendes tu rendimiento sin afirmar que conoces la causa de la omisión.",secondaryMessage:"El mensaje proyecta hambre y puede interpretarse como crítica al seleccionador.",primaryEffects:[E("reputation.mediaHeat",2)],secondaryEffects:[E("reputation.mediaHeat",5),E("professional.environmentStability",-2)],primarySeeds:[seedCreate("SEED_SELECTION_SNUB",65,{stance:"merit_field"})],secondarySeeds:[seedCreate("SEED_SELECTION_SNUB",70,{stance:"merit_field",conflict_read:true})]},
    {id:"NO_COMMENT",label:"No hablar de selección",intentTags:["silence","selection"],primaryMessage:"No conviertes una lista ajena en una explicación inventada.",secondaryMessage:"El silencio evita especular, aunque otros rellenan el hueco.",primaryEffects:[E("professional.environmentStability",2)],secondaryEffects:[E("reputation.mediaHeat",2)],primarySeeds:[seedCreate("SEED_SELECTION_SNUB",48,{stance:"no_comment"})],secondarySeeds:[seedCreate("SEED_SELECTION_SNUB",52,{stance:"no_comment",others_speculate:true})]},
    {id:"PRIVATE_INFO",label:"Pedir a tu agente información privada antes de responder",intentTags:["agent","information","selection"],eligibility:[{path:"facts.activeAgentNpcId",op:"exists"}],primaryMessage:"Buscas contexto sin convertirlo automáticamente en verdad oficial.",secondaryMessage:"La vía privada puede aportar señales y también falsas certezas.",primaryEffects:[E("control.career",4)],secondaryEffects:[E("professional.agentControl",2)],primarySeeds:[seedCreate("SEED_SELECTION_SNUB",58,{stance:"private_info"})],secondarySeeds:[seedCreate("SEED_SELECTION_SNUB",63,{stance:"private_info",uncertain_source:true})]}
  ]
});

const EVT_21_IMG_001 = scene({
  id:"EVT_21_IMG_001", age:21, family:"image", title:"La campaña",
  body:"Una marca propone usar tu origen y trayectoria en una campaña. Pago, uso de imagen y duración deben venir de una propuesta comercial real.",
  visible:["Conoces pago, uso de imagen y duración de la propuesta.","El relato publicitario puede compararse con tu historia real."],
  uncertain:["No sabes cómo reaccionarán club y afición.","Tampoco sabes cuánto crecerá la campaña fuera del alcance inicial."],
  months:[10,11,12,1], seedsRead:["SEED_EXIT_STYLE_UDV"], seedsWrite:["SEED_SPONSOR_IMAGE","SEED_HOME_DISTANCE"],
  choices:[
    {id:"ACCEPT_SCRIPT",label:"Aceptar tal cual",intentTags:["image","commercial"],primaryMessage:"Aceptas el relato comercial y su exposición.",secondaryMessage:"La campaña puede reforzar marca y parecer oportunista si simplifica demasiado tu historia.",primaryEffects:[E("reputation.mediaHeat",4),E("professional.moneyComfort",4)],secondaryEffects:[E("reputation.mediaHeat",7),E("professional.environmentStability",-2)],primarySeeds:[seedCreate("SEED_SPONSOR_IMAGE",60,{stance:"accept_script"})],secondarySeeds:[seedCreate("SEED_SPONSOR_IMAGE",66,{stance:"accept_script",opportunism_read:true})]},
    {id:"CHANGE_STORY",label:"Pedir un relato menos personal",intentTags:["image","boundary"],primaryMessage:"Mantienes la campaña y reduces cuánto de tu historia privada se convierte en producto.",secondaryMessage:"El mensaje gana precisión y puede perder fuerza comercial.",primaryEffects:[E("control.career",4),E("professional.moneyComfort",2)],secondaryEffects:[E("reputation.mediaHeat",-1)],primarySeeds:[seedCreate("SEED_SPONSOR_IMAGE",54,{stance:"change_story"})],secondarySeeds:[seedCreate("SEED_SPONSOR_IMAGE",56,{stance:"change_story",lower_reach:true})]},
    {id:"DECLINE_ORIGIN",label:"Rechazar por no mezclar origen y marca",intentTags:["identity","boundary"],primaryMessage:"Separar identidad y patrocinio te da control sobre un vínculo emocional real.",secondaryMessage:"Proteges el relato y renuncias a una oportunidad comercial concreta.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("professional.moneyComfort",-2)],primarySeeds:[seedCreate("SEED_SPONSOR_IMAGE",48,{stance:"decline_origin"})],secondarySeeds:[seedCreate("SEED_SPONSOR_IMAGE",50,{stance:"decline_origin",commercial_cost:true})]},
    {id:"LOCAL_USE",label:"Aceptar y destinar parte del pago a una iniciativa local sin anunciarlo de inicio",intentTags:["community","image"],primaryMessage:"La decisión económica existe antes de cualquier posible relato público.",secondaryMessage:"El gesto puede ser privado y, si se filtra, convertirse también en marketing involuntario.",primaryEffects:[E("professional.moneyComfort",1),E("professional.environmentStability",3)],secondaryEffects:[E("reputation.mediaHeat",3)],primarySeeds:[seedCreate("SEED_SPONSOR_IMAGE",58,{stance:"local_use"}),seedCreate("SEED_HOME_DISTANCE",45,{source:"campaign_local_use"})],secondarySeeds:[seedCreate("SEED_SPONSOR_IMAGE",62,{stance:"local_use",publicized:true}),seedCreate("SEED_HOME_DISTANCE",48,{source:"campaign_local_use"})]}
  ]
});

const EVT_21_MED_001 = scene({
  id:"EVT_21_MED_001", age:21, family:"medical", title:"La inyección",
  body:"Antes de un partido de alto valor recibes una recomendación médica concreta sobre una lesión compatible. El juego debe conocer diagnóstico, dolor y partido; no inferirlos de riesgo o fatiga.",
  visible:["Conoces diagnóstico, dolor y recomendación médica.","Sabes qué partido es y por qué tiene valor deportivo real."],
  uncertain:["No sabes cómo responderá tu cuerpo.","Tampoco sabes cuándo aparecerá otra ventana deportiva similar."],
  months:[2,3,4,5], seedsRead:["SEED_MEDICAL_DISCLOSURE","SEED_BODY_PRECEDENT"],
  choices:[
    {id:"PLAY_TREATMENT",label:"Jugar con el tratamiento",intentTags:["medical","risk","sport"],primaryMessage:"Aceptas el riesgo explicado por el staff sin convertir la elección en un resultado predeterminado.",secondaryMessage:"La oportunidad existe, pero la decisión no garantiza rendimiento ni ausencia de secuelas.",primaryEffects:[E("control.career",2)],secondaryEffects:[E("professional.environmentStability",-2)],primarySeeds:[intensify("SEED_BODY_PRECEDENT",5)],secondarySeeds:[intensify("SEED_BODY_PRECEDENT",8)]},
    {id:"UNAVAILABLE",label:"Declararte no disponible",intentTags:["medical","caution"],primaryMessage:"Priorizas la recomendación conservadora y asumes perder esa ventana concreta.",secondaryMessage:"Proteges margen físico, aunque el coste deportivo del partido es real.",primaryEffects:[E("control.career",4)],secondaryEffects:[E("reputation.marketHeat",-1)],primarySeeds:[intensify("SEED_MEDICAL_DISCLOSURE",3)],secondarySeeds:[intensify("SEED_MEDICAL_DISCLOSURE",4)]},
    {id:"SECOND_OPINION",label:"Pedir una segunda opinión rápida",intentTags:["medical","information"],primaryMessage:"Añades información independiente antes de decidir.",secondaryMessage:"La segunda opinión puede confirmar lo mismo y consumir tiempo de preparación.",primaryEffects:[E("control.career",6)],secondaryEffects:[E("professional.environmentStability",-1)],primarySeeds:[intensify("SEED_MEDICAL_DISCLOSURE",2)],secondarySeeds:[intensify("SEED_MEDICAL_DISCLOSURE",3)]},
    {id:"TRAINING_TEST",label:"Aceptar solo si entrenas sin empeorar en la víspera",intentTags:["medical","conditional"],primaryMessage:"Vinculas la decisión a una observación clínica/deportiva posterior y no a una promesa.",secondaryMessage:"La prueba añade evidencia, pero puede dejar la decisión abierta hasta muy tarde.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("professional.environmentStability",-1)],primarySeeds:[intensify("SEED_BODY_PRECEDENT",3)],secondarySeeds:[intensify("SEED_BODY_PRECEDENT",4)]}
  ]
});

const EVT_21_CCH_002 = scene({
  id:"EVT_21_CCH_002", age:21, family:"tactical", title:"Otro entrenador, otra versión de ti",
  body:"Un técnico nuevo te asigna un rol táctico distinto. La escena requiere un cambio de entrenador reciente y una instrucción real, no un flag histórico ni roleScore.",
  visible:["Conoces posición y tareas concretas de entrenamiento.","El cambio de técnico pertenece a tu club actual."],
  uncertain:["No sabes cuánto durará el técnico ni el experimento.","Scouts y mercado pueden valorar el nuevo rol de forma distinta."],
  months:[8,9,10,11], seedsRead:["SEED_TACTICAL_SACRIFICE"], seedsWrite:["SEED_TACTICAL_SACRIFICE"],
  choices:[
    {id:"EMBRACE",label:"Abrazar el rol",intentTags:["adapt","coach"],primaryMessage:"Aceptas medir tu valor por la función nueva y no solo por tus números anteriores.",secondaryMessage:"La adaptación puede hacerte más útil y menos visible en el corto plazo.",primaryEffects:[E("professional.institutionalTrust",5),E("control.career",2)],secondaryEffects:[E("reputation.marketHeat",-1)],primarySeeds:[intensify("SEED_TACTICAL_SACRIFICE",5)],secondarySeeds:[intensify("SEED_TACTICAL_SACRIFICE",7)]},
    {id:"FREEDOM_GAMES",label:"Aceptarlo y pedir libertad en ciertos partidos",intentTags:["adapt","negotiate"],primaryMessage:"Negocias excepciones concretas sin rechazar el plan general.",secondaryMessage:"La flexibilidad puede funcionar o dejar al técnico dudas sobre tu adhesión.",primaryEffects:[E("control.career",5),E("professional.institutionalTrust",2)],secondaryEffects:[E("professional.institutionalTrust",-2)],primarySeeds:[intensify("SEED_TACTICAL_SACRIFICE",4)],secondarySeeds:[intensify("SEED_TACTICAL_SACRIFICE",6)]},
    {id:"RESIST_PROFILE",label:"Resistirte y competir por tu perfil anterior",intentTags:["identity","coach"],primaryMessage:"Defiendes el perfil que te trajo hasta aquí y obligas a que la discusión sea explícita.",secondaryMessage:"La identidad se conserva, pero puedes quedar fuera de la idea del nuevo técnico.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("professional.institutionalTrust",-5)],primarySeeds:[intensify("SEED_TACTICAL_SACRIFICE",6)],secondarySeeds:[intensify("SEED_TACTICAL_SACRIFICE",8)]},
    {id:"AGENT_SOUND",label:"Pedir a tu agente que sondee mercado antes de decidir",intentTags:["agent","market","optionality"],eligibility:[{path:"facts.activeAgentNpcId",op:"exists"}],primaryMessage:"Buscas alternativas sin afirmar que exista una oferta.",secondaryMessage:"El sondeo aumenta información y puede erosionar confianza si llega al club.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("professional.institutionalTrust",-3)],primarySeeds:[intensify("SEED_TACTICAL_SACRIFICE",3)],secondarySeeds:[intensify("SEED_TACTICAL_SACRIFICE",5)]}
  ]
});

const EVT_22_LOCK_001 = scene({
  id:"EVT_22_LOCK_001", age:22, family:"team", title:"El compañero al que quieren vender",
  body:"Un compañero en conflicto salarial pide al vestuario rechazar una prima colectiva hasta negociar su salida. La petición y sus participantes deben existir como hecho externo.",
  visible:["Conoces la petición y parte de las cifras colectivas.","Sabes quién está implicado y quién conoce la conversación."],
  uncertain:["No conoces todas sus condiciones individuales ni la urgencia financiera del club.","Solidaridad y negociación personal pueden estar mezcladas."],
  months:[9,10,11,1], seedsWrite:["SEED_LOCKER_VOTE"],
  choices:[
    {id:"SUPPORT",label:"Apoyar la medida",intentTags:["locker","solidarity"],primaryMessage:"Te alineas con la presión colectiva aunque no conozcas todo el contrato individual.",secondaryMessage:"La solidaridad gana fuerza y aumenta el coste con dirección.",primaryEffects:[E("professional.lockerPower",5)],secondaryEffects:[E("professional.institutionalTrust",-5)],primarySeeds:[seedCreate("SEED_LOCKER_VOTE",64,{stance:"support"})],secondarySeeds:[seedCreate("SEED_LOCKER_VOTE",68,{stance:"support",club_cost:true})]},
    {id:"OPPOSE",label:"Oponerte y separar primas colectivas de su caso",intentTags:["locker","boundary"],primaryMessage:"Defiendes que el grupo no se convierta automáticamente en parte de una negociación individual.",secondaryMessage:"La postura puede proteger al colectivo o romper códigos internos.",primaryEffects:[E("control.career",3)],secondaryEffects:[E("professional.lockerPower",-4)],primarySeeds:[seedCreate("SEED_LOCKER_VOTE",58,{stance:"oppose"})],secondarySeeds:[seedCreate("SEED_LOCKER_VOTE",62,{stance:"oppose",locker_cost:true})]},
    {id:"MEETING",label:"Proponer una reunión con dirección sin amenaza",intentTags:["mediation","locker"],primaryMessage:"Intentas trasladar el conflicto a una conversación verificable.",secondaryMessage:"La vía intermedia reduce temperatura y también puede dar tiempo a la dirección.",primaryEffects:[E("professional.institutionalTrust",2),E("professional.lockerPower",2)],secondaryEffects:[E("control.career",1)],primarySeeds:[seedCreate("SEED_LOCKER_VOTE",56,{stance:"meeting"})],secondarySeeds:[seedCreate("SEED_LOCKER_VOTE",58,{stance:"meeting",delay_cost:true})]},
    {id:"FOLLOW_MAJORITY",label:"No tomar posición y aceptar lo que decida la mayoría",intentTags:["wait","locker"],primaryMessage:"No te atribuyes información que no tienes y sigues la decisión colectiva.",secondaryMessage:"La neutralidad reduce exposición y también deja que otros definan tu postura.",primaryEffects:[E("professional.environmentStability",2)],secondaryEffects:[E("professional.lockerPower",-1)],primarySeeds:[seedCreate("SEED_LOCKER_VOTE",50,{stance:"majority"})],secondarySeeds:[seedCreate("SEED_LOCKER_VOTE",53,{stance:"majority",low_agency:true})]}
  ]
});

const EVT_22_HOME_001 = scene({
  id:"EVT_22_HOME_001", age:22, family:"legacy", title:"El partido contra casa",
  body:"El calendario te lleva de verdad contra UDV por primera vez desde tu salida. El cruce debe existir en SportContext; la ruta previa solo cambia su significado.",
  visible:["Conoces el rival, la competición y tu propia forma de salida.","Sabes qué gestos decides tú y cuáles dependen de lo que ocurra en el partido."],
  uncertain:["No sabes cómo reaccionará la mayoría de la grada.","Tampoco sabes si prensa y afición actual leerán igual un gesto de respeto."],
  seedsRead:["SEED_EXIT_STYLE_UDV"], seedsWrite:["SEED_HOME_DISTANCE"],
  choices:[
    {id:"GREET",label:"Saludar a la grada antes del partido",intentTags:["home","respect"],primaryMessage:"Haces un gesto previo que no depende de marcar ni del resultado.",secondaryMessage:"El saludo puede reconciliar o parecer calculado según la salida recordada.",primaryEffects:[E("professional.environmentStability",3)],secondaryEffects:[E("reputation.mediaHeat",2)],primarySeeds:[seedCreate("SEED_HOME_DISTANCE",55,{stance:"greet"})],secondarySeeds:[seedCreate("SEED_HOME_DISTANCE",60,{stance:"greet",calculated_read:true})]},
    {id:"ROUTINE",label:"Mantener rutina y no teatralizar",intentTags:["focus","home"],primaryMessage:"Tratas el partido como competición real y evitas diseñar una ceremonia propia.",secondaryMessage:"La neutralidad protege foco, aunque algunos esperaban una señal.",primaryEffects:[E("professional.environmentStability",4)],secondaryEffects:[E("reputation.mediaHeat",1)],primarySeeds:[seedCreate("SEED_HOME_DISTANCE",48,{stance:"routine"})],secondarySeeds:[seedCreate("SEED_HOME_DISTANCE",52,{stance:"routine",distance_read:true})]},
    {id:"NO_CELEBRATE",label:"Si marcas, no celebrar",intentTags:["home","conditional"],primaryMessage:"Fijas una postura para un hecho que solo tendrá efecto si el match authority registra realmente un gol.",secondaryMessage:"El gesto puede respetar origen y molestar a parte de tu afición actual.",primaryEffects:[E("control.career",2)],secondaryEffects:[E("reputation.mediaHeat",2)],primarySeeds:[seedCreate("SEED_HOME_DISTANCE",58,{stance:"no_celebrate_if_goal"})],secondarySeeds:[seedCreate("SEED_HOME_DISTANCE",62,{stance:"no_celebrate_if_goal",current_fans_cost:true})]},
    {id:"READ_ATMOSPHERE",label:"Decidir la celebración solo en el momento según el ambiente",intentTags:["home","adapt"],primaryMessage:"No inventas un gol ni una reacción: conservas la decisión condicionada al contexto real.",secondaryMessage:"La flexibilidad evita una promesa previa y puede parecer ambigua después.",primaryEffects:[E("control.career",4)],secondaryEffects:[E("reputation.mediaHeat",1)],primarySeeds:[seedCreate("SEED_HOME_DISTANCE",52,{stance:"read_atmosphere"})],secondarySeeds:[seedCreate("SEED_HOME_DISTANCE",55,{stance:"read_atmosphere",ambiguity:true})]}
  ]
});

const EVT_22_MKT_001 = scene({
  id:"EVT_22_MKT_001", age:22, family:"market", title:"La oferta de tu rival deportivo",
  body:"Un rival deportivo real presenta una CareerOffer que encaja en lo futbolístico y tiene un coste social claro.",
  visible:["Conoces las condiciones formales y el rol/proyecto acreditado.","La identidad de rival no se inventa desde prestigio o liga."],
  uncertain:["No sabes cuánto durará el rechazo público.","Tampoco sabes si el proyecto cumplirá sus promesas no contractuales."],
  months:[7,8,1], gates:[{path:"facts.pendingCareerOffer",op:"exists"}], seedsRead:["SEED_PUBLIC_CONTRACT","SEED_EXIT_STYLE_UDV"],
  choices:[
    {id:"ACCEPT",label:"Aceptar",intentTags:["transfer","rival"],primaryMessage:"Aceptas una decisión deportiva real y asumes su coste reputacional por separado.",secondaryMessage:"El encaje puede ser bueno y convertirte en villano para parte del entorno.",primaryEffects:[E("control.career",3)],secondaryEffects:[E("reputation.mediaHeat",7)]},
    {id:"DECLINE_PERSONAL",label:"Rechazar por coste personal",intentTags:["identity","rival"],primaryMessage:"Das peso explícito al coste humano aunque la oferta sea competitiva.",secondaryMessage:"Proteges una relación simbólica y renuncias a condiciones mejores.",primaryEffects:[E("professional.environmentStability",4)],secondaryEffects:[E("professional.contractPower",-2)]},
    {id:"NO_LEAK",label:"Pedir que la operación no se filtre hasta cerrar",intentTags:["privacy","transfer"],primaryMessage:"Intentas separar negociación y debate público mientras no haya firma.",secondaryMessage:"El secreto reduce ruido si aguanta y lo multiplica si se rompe.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("reputation.mediaHeat",5)]},
    {id:"LEVERAGE_RENEWAL",label:"Usar la oferta para renovar donde estás",intentTags:["leverage","contract"],primaryMessage:"La CareerOffer real se convierte en palanca, no en una firma automática.",secondaryMessage:"La estrategia puede mejorar términos y quemar confianza en ambos lados.",primaryEffects:[E("professional.contractPower",5)],secondaryEffects:[E("professional.institutionalTrust",-4)]}
  ]
});

const EVT_22_MED_001 = scene({
  id:"EVT_22_MED_001", age:22, family:"medical", title:"La resonancia antes de firmar",
  body:"Una transferencia avanzada se detiene para pedir pruebas adicionales por un hallazgo previo. La prueba y el hallazgo deben existir como hechos médicos reales.",
  visible:["Sabes qué prueba piden y que la operación depende del reconocimiento.","El mercado y el dato médico son autoridades separadas."],
  uncertain:["No sabes si el hallazgo es clínicamente relevante.","Tampoco sabes si existe de verdad otro comprador esperando."],
  months:[7,8,1], seedsRead:["SEED_MEDICAL_DISCLOSURE"], seedsWrite:["SEED_MEDICAL_DISCLOSURE"],
  choices:[
    {id:"ALL_TESTS",label:"Hacer todas las pruebas",intentTags:["medical","transparency"],primaryMessage:"Aceptas ampliar evidencia clínica antes de cerrar.",secondaryMessage:"Más información puede protegerte y también consumir una ventana de mercado real.",primaryEffects:[E("control.career",3)],secondaryEffects:[E("reputation.marketHeat",-2)],primarySeeds:[intensify("SEED_MEDICAL_DISCLOSURE",4)],secondarySeeds:[intensify("SEED_MEDICAL_DISCLOSURE",6)]},
    {id:"SECOND_PARALLEL",label:"Aportar segunda opinión propia en paralelo",intentTags:["medical","information"],primaryMessage:"Añades contraste sin sustituir las pruebas del comprador.",secondaryMessage:"La doble revisión mejora contexto y puede generar interpretaciones distintas.",primaryEffects:[E("control.career",6)],secondaryEffects:[E("professional.environmentStability",-1)],primarySeeds:[intensify("SEED_MEDICAL_DISCLOSURE",3)],secondarySeeds:[intensify("SEED_MEDICAL_DISCLOSURE",5)]},
    {id:"CONDITIONAL_SIGN",label:"Presionar para firmar condicionado a revisión posterior",intentTags:["contract","medical","risk"],primaryMessage:"Intentas separar compromiso comercial y cierre médico sin dar por resuelta la prueba.",secondaryMessage:"La presión puede demostrar interés mutuo o parecer intento de saltar prudencia clínica.",primaryEffects:[E("professional.contractPower",4)],secondaryEffects:[E("professional.institutionalTrust",-3)],primarySeeds:[intensify("SEED_MEDICAL_DISCLOSURE",5)],secondarySeeds:[intensify("SEED_MEDICAL_DISCLOSURE",7)]},
    {id:"WITHDRAW",label:"Retirarte si sientes que dudan demasiado de ti",intentTags:["boundary","medical"],primaryMessage:"Conservas control sobre una operación que ya no te convence.",secondaryMessage:"La retirada protege dignidad y puede ser una lectura equivocada de prudencia normal.",primaryEffects:[E("control.career",6)],secondaryEffects:[E("reputation.marketHeat",-3)],primarySeeds:[intensify("SEED_MEDICAL_DISCLOSURE",4)],secondarySeeds:[intensify("SEED_MEDICAL_DISCLOSURE",5)]}
  ]
});

const EVT_22_TACT_001 = scene({
  id:"EVT_22_TACT_001", age:22, family:"tactical", title:"Noventa minutos que no te favorecen",
  body:"Antes de un partido grande real, el técnico te ofrece ser titular con una tarea que reducirá tu presencia ofensiva. El partido y la orden deben existir en authority deportiva.",
  visible:["Conoces la tarea táctica y el coste probable en estadísticas.","La escena no inventa titularidad, rival, marcador ni resultado."],
  uncertain:["No sabes si el plan funcionará ni cómo lo leerán scouts.","Ser útil al equipo y vender tu perfil pueden divergir."],
  seedsRead:["SEED_TACTICAL_SACRIFICE"], seedsWrite:["SEED_TACTICAL_SACRIFICE"],
  choices:[
    {id:"ACCEPT",label:"Aceptar sin discutir",intentTags:["team","tactical"],primaryMessage:"Aceptas el sacrificio como una función concreta del partido.",secondaryMessage:"La obediencia puede hacerte imprescindible y menos visible.",primaryEffects:[E("professional.institutionalTrust",5)],secondaryEffects:[E("reputation.marketHeat",-1)],primarySeeds:[intensify("SEED_TACTICAL_SACRIFICE",5)],secondarySeeds:[intensify("SEED_TACTICAL_SACRIFICE",7)]},
    {id:"OFFENSIVE_FREEDOM",label:"Aceptar y pedir una libertad ofensiva concreta",intentTags:["tactical","negotiate"],primaryMessage:"Negocias una excepción precisa sin rechazar el trabajo defensivo.",secondaryMessage:"El ajuste puede mejorar el plan o generar dudas sobre disciplina.",primaryEffects:[E("control.career",4),E("professional.institutionalTrust",2)],secondaryEffects:[E("professional.institutionalTrust",-2)],primarySeeds:[intensify("SEED_TACTICAL_SACRIFICE",4)],secondarySeeds:[intensify("SEED_TACTICAL_SACRIFICE",6)]},
    {id:"MORE_BALL",label:"Decir que puedes ayudar más con balón",intentTags:["identity","tactical"],primaryMessage:"Defiendes una lectura distinta de cómo ayudar al equipo.",secondaryMessage:"La propuesta puede mejorar el plan o sonar como rechazo del rol.",primaryEffects:[E("control.career",4)],secondaryEffects:[E("professional.institutionalTrust",-3)],primarySeeds:[intensify("SEED_TACTICAL_SACRIFICE",5)],secondarySeeds:[intensify("SEED_TACTICAL_SACRIFICE",7)]},
    {id:"SCOUT_CONTEXT",label:"Aceptar y pedir al agente que dé contexto a scouts",intentTags:["agent","image","tactical"],eligibility:[{path:"facts.activeAgentNpcId",op:"exists"}],primaryMessage:"Gestionas el relato sin alterar el partido ni fabricar observadores.",secondaryMessage:"Contextualizar puede ser profesional o parecer obsesión por imagen.",primaryEffects:[E("professional.agentControl",2),E("control.career",2)],secondaryEffects:[E("reputation.mediaHeat",2)],primarySeeds:[intensify("SEED_TACTICAL_SACRIFICE",4)],secondarySeeds:[intensify("SEED_TACTICAL_SACRIFICE",5)]}
  ]
});

const EVT_22_DDL_001 = scene({
  id:"EVT_22_DDL_001", age:22, family:"market", title:"Último día, 17:40",
  body:"Quedan horas reales de mercado y existe una CareerOffer con comprador, plazo y términos. El reloj debe venir del mercado authority, no del mes ni de seasonDay.",
  visible:["Conoces contrato, comprador y tiempo restante.","El club actual ha cambiado su postura por un hecho materializado, no por narrativa."],
  uncertain:["No conoces por completo por qué cambió la postura.","Tampoco sabes si habrá otra oferta en verano."],
  months:[8,1], gates:[{path:"facts.pendingCareerOffer",op:"exists"}], seedsWrite:["SEED_DEADLINE_DAY"],
  choices:[
    {id:"ACCEPT_AS_IS",label:"Aceptar sin pedir mejoras",intentTags:["deadline","accept"],primaryMessage:"Priorizas cerrar la operación dentro del plazo real.",secondaryMessage:"Reduces riesgo temporal y renuncias a negociar margen adicional.",primaryEffects:[E("control.career",2)],secondaryEffects:[E("professional.contractPower",-2)],primarySeeds:[seedCreate("SEED_DEADLINE_DAY",66,{stance:"accept_as_is"})],secondarySeeds:[seedCreate("SEED_DEADLINE_DAY",68,{stance:"accept_as_is",leverage_left:true})]},
    {id:"NEGOTIATE_CLOCK",label:"Negociar una mejora aunque el reloj corra",intentTags:["deadline","negotiate"],primaryMessage:"Usas el poco tiempo como parte de una negociación real.",secondaryMessage:"La mejora puede llegar o el comprador puede activar su alternativa.",primaryEffects:[E("professional.contractPower",5)],secondaryEffects:[E("reputation.marketHeat",-3)],primarySeeds:[seedCreate("SEED_DEADLINE_DAY",72,{stance:"negotiate"})],secondarySeeds:[seedCreate("SEED_DEADLINE_DAY",78,{stance:"negotiate",lost_risk:true})]},
    {id:"REJECT_TIME",label:"Rechazar por falta de tiempo para evaluar",intentTags:["deadline","control"],primaryMessage:"Decides que la presión temporal no sustituye la información que necesitas.",secondaryMessage:"Conservas control y puedes perder una ventana irrepetible.",primaryEffects:[E("control.career",7)],secondaryEffects:[E("reputation.marketHeat",-3)],primarySeeds:[seedCreate("SEED_DEADLINE_DAY",64,{stance:"reject_time"})],secondarySeeds:[seedCreate("SEED_DEADLINE_DAY",68,{stance:"reject_time",window_lost:true})]},
    {id:"CONDITION",label:"Aceptar sujeto a una condición concreta de rol o salida",intentTags:["deadline","condition"],primaryMessage:"Intentas cerrar sin renunciar a una protección explícita.",secondaryMessage:"La condición puede ser aceptada, diluida o romper el acuerdo; A5 no la inventa si CareerOffer no la soporta.",primaryEffects:[E("professional.contractPower",4),E("control.career",3)],secondaryEffects:[E("professional.institutionalTrust",-2)],primarySeeds:[seedCreate("SEED_DEADLINE_DAY",70,{stance:"condition"})],secondarySeeds:[seedCreate("SEED_DEADLINE_DAY",75,{stance:"condition",counter_risk:true})]}
  ]
});

export const A5_EXTERNAL_PRINCIPALS_20_23: EventDefinition[] = [
  EVT_20_MKT_001, EVT_20_MED_001, EVT_20_AGT_001, EVT_20_MATCH_003, EVT_20_JAN_001, EVT_20_BRUNO_001,
  EVT_21_MONEY_001, EVT_21_AGT_001, EVT_21_MKT_001, EVT_21_NAT_001, EVT_21_IMG_001, EVT_21_MED_001, EVT_21_CCH_002,
  EVT_22_LOCK_001, EVT_22_HOME_001, EVT_22_MKT_001, EVT_22_MED_001, EVT_22_TACT_001, EVT_22_DDL_001
];
