import type { Condition, Effect, EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n } from "../18_20/helpers.js";
type R={id:string;title:string;age:[23|24|25,23|24|25];gates:Condition[];months?:number[]};
const rows:R[]=[
 {id:"CEVT_23_RIVAS_02",title:"Rivas firma la recomendación",age:[23,25],gates:[{path:"flags.HAS_SEED_RIVAS_TRUST",op:"eq",value:true}]},
 {id:"CEVT_23_MENA_02",title:"Mena enfrente",age:[23,25],gates:[{path:"flags.HAS_SEED_MENA_EARLY_READ",op:"eq",value:true},{path:"flags.HIGH_PROFILE_MATCH",op:"eq",value:true}]},
 {id:"CEVT_23_VELA_02",title:"El curso de Vela",age:[23,25],gates:[{path:"flags.HAS_SEED_VELA_STANCE",op:"eq",value:true}]},
 {id:"CEVT_23_BRUNO_03",title:"Bruno necesita club",age:[23,25],gates:[{path:"flags.HAS_SEED_BRUNO_FAVOR",op:"eq",value:true}]},
 {id:"CEVT_23_ADR_03",title:"Los dos en la absoluta",age:[23,25],gates:[{path:"flags.HAS_SEED_ADRIAN_MIRROR",op:"eq",value:true},{path:"flags.NATIONAL_CALLED",op:"eq",value:true}]},
 {id:"CEVT_23_NANO_02",title:"Nano te pide que no llames",age:[23,25],gates:[{path:"flags.HAS_SEED_NANO_SHADOW",op:"eq",value:true}]},
 {id:"CEVT_23_CLARA_03",title:"La exclusiva antes de la lista",age:[23,25],gates:[{path:"flags.HAS_SEED_CLARA_CHANNEL",op:"eq",value:true},{path:"flags.NATIONAL_GATE_OPEN",op:"eq",value:true}]},
 {id:"CEVT_23_AGENT_03",title:"El otro agente llama a tu familia",age:[23,25],gates:[{path:"flags.HAS_SEED_FIRST_AGENT",op:"eq",value:true},{path:"professional.commercialPower",op:"gte",value:24}]},
 {id:"CEVT_23_MED_02",title:"Paula pide todos los informes",age:[23,25],gates:[{path:"flags.HAS_SEED_PHYSIO_CONFIDENCE",op:"eq",value:true},{path:"professional.bodyLoad",op:"gte",value:28}]},
 {id:"CEVT_23_UDV_02",title:"UDV elimina a un grande",age:[23,25],gates:[{path:"flags.HAS_SEED_HOME_DISTANCE",op:"eq",value:true}]},
 {id:"CEVT_24_CHAT_01",title:"La captura existe",age:[24,25],gates:[{path:"flags.HAS_SEED_PRIVATE_CHAT",op:"eq",value:true}]},
 {id:"CEVT_24_TOURN_01",title:"Entraste por una lesión",age:[24,25],months:[4,5,6],gates:[{path:"flags.NATIONAL_CALLED",op:"eq",value:true},{path:"professional.nationalStanding",op:"gte",value:32}]},
 {id:"CEVT_24_TOURN_02",title:"Te quedaste fuera por uno",age:[24,25],months:[4,5,6],gates:[{path:"flags.NATIONAL_CALLED",op:"eq",value:true},{path:"professional.nationalStanding",op:"gte",value:35}]},
 {id:"CEVT_24_OWNER_02",title:"El propietario quiere una estrella",age:[24,25],gates:[{path:"flags.CLUB_OWNER_CHANGE",op:"eq",value:true}]},
 {id:"CEVT_24_SPONSOR_02",title:"La campaña envejeció mal",age:[24,25],gates:[{path:"flags.HAS_SEED_SPONSOR_IMAGE",op:"eq",value:true},{path:"professional.commercialPower",op:"gte",value:38}]},
 {id:"CEVT_24_FAM_02",title:"El negocio pierde dinero",age:[24,25],gates:[{path:"flags.HAS_SEED_FAMILY_BUSINESS",op:"eq",value:true}]},
 {id:"CEVT_25_STAR_01",title:"El fichaje estrella se lesiona",age:[25,25],gates:[{path:"flags.STAR_COMPETITION",op:"eq",value:true},{path:"sport.roleScore",op:"lt",value:78}]},
 {id:"CEVT_25_AGENT_04",title:"Ordóñez sí tenía club",age:[25,25],gates:[{path:"flags.SUPER_AGENT",op:"eq",value:true}]},
 {id:"CEVT_25_BODY_02",title:"Recaída sin culpable",age:[25,25],gates:[{path:"professional.bodyLoad",op:"gte",value:50},{path:"flags.HAS_SEED_LOAD_MANAGEMENT",op:"eq",value:true}]},
 {id:"CEVT_25_SHOCK_02",title:"El entrenador cae antes de la final",age:[25,25],months:[4,5],gates:[{path:"flags.FINAL_CONTEXT",op:"eq",value:true}]}
];
const fx:[Effect[],Effect[],Effect[]]=[[n("professional.contractPower",3),n("professional.publicPolarization",2)],[n("professional.environmentStability",4),n("professional.institutionalTrust",2)],[n("professional.agentControl",3),n("reputation.mediaHeat",2)]];

function make(r:R):EventDefinition{
 const nano=r.id==="CEVT_23_NANO_02";
 const body=nano
  ?"Nano te llama antes de que puedas ofrecer ayuda. Un contacto ha vuelto a mencionar su nombre y él quiere dejar una cosa clara: si decide mover su carrera, la llamada saldrá de su teléfono, no del tuyo."
  :"Una decisión antigua vuelve a tener consecuencias concretas en tu carrera. La otra parte recuerda lo ocurrido y ahora te obliga a decidir qué haces con esa relación.";
 const visible=nano
  ?["Ya hubo una ocasión en la que intentaste abrirle una puerta; esta vez Nano te pide que no intervengas por él."]
  :["Reconoces qué relación o decisión del pasado ha traído esta situación hasta el presente."];
 const uncertain=nano
  ?["No sabes si está poniendo distancia contigo o protegiendo una amistad que ya sufrió cuando intentaste ayudar sin preguntar."]
  :["No sabes cuánto ha cambiado la otra parte ni qué espera ahora de ti."];
 const choices=nano?[
  {id:"A",label:"Decirle que respetarás el límite y preguntarle qué necesita de ti",intentTags:["direct"],primaryMessage:"Nano agradece que preguntes antes de actuar y la conversación vuelve a ser entre amigos, no entre intermediarios.",secondaryMessage:"Aunque aceptas el límite, la conversación deja claro que el tema sigue siendo sensible.",primaryEffects:fx[0],secondaryEffects:[...fx[0],n("professional.environmentStability",-2)]},
  {id:"B",label:"Aceptar que no te corresponde mover nada y cambiar de tema",intentTags:["distance"],primaryMessage:"Dejas su carrera en sus manos y rebajas la tensión entre vosotros.",secondaryMessage:"El silencio evita otro choque, pero también deja una distancia que ninguno de los dos termina de nombrar.",primaryEffects:fx[1],secondaryEffects:[...fx[1],n("professional.contractPower",-1)]},
  {id:"C",label:"Pedir a un contacto común que le pase información sin hablar en su nombre",intentTags:["channel"],primaryMessage:"La información llega sin convertirte en quien negocia por Nano.",secondaryMessage:"Usar un tercero evita la llamada directa, pero Nano percibe que has buscado otra forma de intervenir.",primaryEffects:fx[2],secondaryEffects:[...fx[2],n("professional.publicPolarization",2)]}
 ]:[
  {id:"A",label:"Pedir una conversación directa para aclarar qué ha cambiado",intentTags:["direct"],primaryMessage:"La conversación mueve el conflicto y te da una respuesta concreta.",secondaryMessage:"Hablar de frente también expone una tensión que podía seguir oculta.",primaryEffects:fx[0],secondaryEffects:[...fx[0],n("professional.environmentStability",-2)]},
  {id:"B",label:"No intervenir y dejar que la otra parte haga el siguiente movimiento",intentTags:["distance"],primaryMessage:"Mantienes margen y evitas forzar una respuesta prematura.",secondaryMessage:"No actuar también es una decisión y la otra parte puede interpretarla a su manera.",primaryEffects:fx[1],secondaryEffects:[...fx[1],n("professional.contractPower",-1)]},
  {id:"C",label:"Hablar con la persona que puede mediar sin convertirlo en un asunto público",intentTags:["channel"],primaryMessage:"El canal intermedio reduce el choque directo y abre otra vía.",secondaryMessage:"Introducir a un tercero cambia quién controla la conversación.",primaryEffects:fx[2],secondaryEffects:[...fx[2],n("professional.publicPolarization",2)]}
 ];
 return ambiguousEvent({
  id:r.id,ageWindow:r.age,phase:"23_26",family:"conditional",title:r.title,body,visible,uncertain,
  gates:r.gates,timeWindow:r.months?{months:r.months}:undefined,weight:11,cooldown:99999,
  npcRefs:nano?["NPC_PLR_14"]:undefined,
  choices,tags:["conditional","causal_callback","adult"],canonStatus:"technical_adaptation"
 });
}
export const CONDITIONAL_EVENTS_23_26:EventDefinition[]=rows.map(make);
