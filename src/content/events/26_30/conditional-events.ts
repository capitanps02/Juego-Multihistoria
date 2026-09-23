import type { Condition, EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n } from "../18_20/helpers.js";

type Row={id:string;title:string;age:26|27|28|29;months:number[];gates:Condition[];read?:string[];verified?:boolean};
const rows:Row[]=[
 {id:"CEVT_26_RIVAS_01",title:"Rivas vuelve con poder",age:26,months:[7,8,9,10],gates:[{path:"flags.HAS_SEED_RIVAS_TRUST",op:"eq",value:true}],read:["SEED_RIVAS_TRUST"]},
 {id:"CEVT_26_ELITE_01",title:"El club ficha a otro nombre",age:26,months:[7,8,9],gates:[{path:"professional.clubPrestigeTier",op:"gte",value:4},{path:"sport.roleScore",op:"gte",value:55}]},
 {id:"CEVT_26_BODY_01",title:"La carga de dos calendarios",age:26,months:[9,10,11,3,4],gates:[{path:"flags.NATIONAL_CALLED",op:"eq",value:true},{path:"professional.bodyLoad",op:"gte",value:42}]},
 {id:"CEVT_26_HOME_01",title:"Un niño lleva tu dorsal en Valdoria",age:26,months:[10,11,12],gates:[{path:"flags.HAS_SEED_HOME_SYMBOL",op:"eq",value:true}],read:["SEED_HOME_SYMBOL"]},
 {id:"CEVT_26_AGENT_01",title:"Dos agencias cuentan versiones distintas",age:26,months:[11,12,1],gates:[{path:"flags.HAS_SEED_AGENT_PROOF",op:"eq",value:true}],read:["SEED_AGENT_PROOF"]},
 {id:"CEVT_26_EUR_01",title:"Te dejan fuera de un partido europeo",age:26,months:[2,3,4],gates:[{path:"flags.CONTINENTAL_REGISTERED",op:"eq",value:true},{path:"sport.roleScore",op:"lt",value:68}]},
 {id:"CEVT_27_SUCCESSOR_01",title:"El sucesor acelera",age:27,months:[7,8,9,10],gates:[{path:"flags.HAS_SEED_YOUNG_SUCCESSOR",op:"eq",value:true}],read:["SEED_YOUNG_SUCCESSOR"]},
 {id:"CEVT_27_NANO_01",title:"Nano te pide que no intervengas",age:27,months:[8,9,10,11],gates:[{path:"flags.HAS_SEED_NANO_SHADOW",op:"eq",value:true}],read:["SEED_NANO_SHADOW"]},
 {id:"CEVT_27_FINAL_01",title:"La final se gana sin ti",age:27,months:[4,5],gates:[{path:"flags.FINAL_CONTEXT",op:"eq",value:true},{path:"sport.roleScore",op:"lt",value:66}]},
 {id:"CEVT_27_MEDIA_01",title:"Una frase del documental se recorta",age:27,months:[10,11,12,1],gates:[{path:"flags.HAS_SEED_DOCUMENTARY_ACCESS",op:"eq",value:true}],read:["SEED_DOCUMENTARY_ACCESS"]},
 {id:"CEVT_27_CLUB_01",title:"El propietario cambia de entrenador",age:27,months:[1,2,3],gates:[{path:"flags.CLUB_OWNER_CHANGE",op:"eq",value:true}]},
 {id:"CEVT_27_RECORD_01",title:"Adrián alcanza tu cifra",age:27,months:[2,3,4,5],gates:[{path:"flags.HAS_SEED_PUBLIC_RIVALRY",op:"eq",value:true}],read:["SEED_PUBLIC_RIVALRY"]},
 {id:"CEVT_28_PROJECT_01",title:"El proyecto deja de girar alrededor de ti",age:28,months:[7,8,9,10],gates:[{path:"flags.HAS_SEED_PROJECT_FACE",op:"eq",value:true},{path:"professional.successionPressure",op:"gte",value:35}],read:["SEED_PROJECT_FACE"]},
 {id:"CEVT_28_NAT_01",title:"Un suplente te adelanta en la selección",age:28,months:[9,10,11,3,4],gates:[{path:"professional.nationalStanding",op:"gte",value:45},{path:"professional.nationalRole",op:"neq",value:"none"}]},
 {id:"CEVT_28_BODY_01",title:"Una resonancia no explica del todo el dolor",age:28,months:[10,11,12,1,2],gates:[{path:"professional.bodyLoad",op:"gte",value:55}]},
 {id:"CEVT_28_MKT_01",title:"La oferta desaparece en 48 horas",age:28,months:[7,8,1],gates:[{path:"reputation.marketHeat",op:"gte",value:58}]},
 {id:"CEVT_28_GALA_01",title:"Pierdes el premio que creías cercano",age:28,months:[10,11,12],gates:[{path:"professional.publicMyth",op:"gte",value:55},{path:"professional.peakStatus",op:"gte",value:55}]},
 {id:"CEVT_28_HOME_01",title:"UDV usa tu nombre en una campaña",age:28,months:[8,9,10,11],gates:[{path:"flags.HAS_SEED_HOME_INSTITUTION",op:"eq",value:true}],read:["SEED_HOME_INSTITUTION"]},
 {id:"CEVT_29_NAT_02",title:"Cambia el seleccionador",age:29,months:[7,8,9,10],gates:[{path:"professional.nationalStanding",op:"gte",value:42}],verified:true},
 {id:"CEVT_29_HOME_03",title:"UDV vive su mejor temporada",age:29,months:[3,4,5],gates:[{path:"flags.HAS_SEED_HOME_SYMBOL",op:"eq",value:true}],read:["SEED_HOME_SYMBOL"],verified:true},
 {id:"CEVT_29_BODY_04",title:"Recuperas mejor de lo esperado",age:29,months:[2,3,4,5],gates:[{path:"professional.bodyLoad",op:"gte",value:45}],verified:true},
 {id:"CEVT_29_RECORD_02",title:"Adrián o el sucesor rompe tu récord",age:29,months:[2,3,4,5],gates:[{path:"flags.HAS_SEED_RECORD_CHASE",op:"eq",value:true}],read:["SEED_RECORD_CHASE"],verified:true},
 {id:"CEVT_29_PROJECT_02",title:"El proyecto gira hacia otro",age:29,months:[7,8,9,10],gates:[{path:"flags.HAS_SEED_PROJECT_FACE",op:"eq",value:true},{path:"flags.CLUB_OWNER_CHANGE",op:"eq",value:true}],read:["SEED_PROJECT_FACE"],verified:true},
 {id:"CEVT_29_WEALTH_01",title:"El gran contrato empieza a aislarte",age:29,months:[10,11,12,1],gates:[{path:"flags.HAS_SEED_WEALTHY_PEAK_EXIT",op:"eq",value:true}],read:["SEED_WEALTHY_PEAK_EXIT"]}
];
function make(r:Row):EventDefinition{
 const nano=r.id==="CEVT_27_NANO_01";
 const body=nano
  ?"Nano te escribe después de una negociación que se ha complicado. Antes de contarte los detalles te pide que no llames a nadie por él: esta vez quiere tomar la decisión y asumir sus consecuencias."
  :"Algo que ocurrió antes vuelve a condicionar una decisión actual. Conoces el hecho que ha cambiado la situación, pero todavía no sabes cómo reaccionarán los demás.";
 const visible=nano
  ?["Nano te está contando el problema porque confía en ti, no porque quiera que le consigas una salida."]
  :["Conoces el hecho actual que ha abierto esta decisión."];
 const uncertain=nano
  ?["No sabes si limitarte a escuchar protegerá la amistad o si él esperaba un consejo que no se atreve a pedir."]
  :["No sabes qué hará la otra parte después de tu respuesta."];
 const choices=nano?[
  {id:"A",label:"Preguntarle qué quiere hacer y limitarte a escuchar",intentTags:["act"],primaryMessage:"Nano ordena sus opciones en voz alta y mantiene el control de su propia carrera.",secondaryMessage:"La conversación ayuda, aunque no resuelve la negociación que tiene delante.",primaryEffects:[n("professional.careerControl",3)],secondaryEffects:[n("professional.publicPolarization",2)]},
  {id:"B",label:"Decirle que estarás disponible solo si te pide algo concreto",intentTags:["wait"],primaryMessage:"Dejas la puerta abierta sin adelantarte a una petición que Nano no ha hecho.",secondaryMessage:"La prudencia evita otro choque, pero la distancia entre vuestras carreras sigue ahí.",primaryEffects:[n("professional.environmentStability",2)],secondaryEffects:[n("professional.careerControl",-1)]},
  {id:"C",label:"Llamar de todos modos a un contacto antes de que se cierre la oportunidad",intentTags:["protect"],primaryMessage:"Intentas proteger una salida que puede desaparecer en horas.",secondaryMessage:"Nano descubre que has vuelto a intervenir después de pedirte expresamente que no lo hicieras.",primaryEffects:[n("professional.roleSecurity",3)],secondaryEffects:[n("professional.institutionalTrust",-2)]}
 ]:[
  {id:"A",label:"Pedir una conversación ahora para saber qué cambia para ti",intentTags:["act"],primaryMessage:"Tomas la iniciativa y obligas a concretar la situación.",secondaryMessage:"La intervención provoca una reacción distinta a la que esperabas.",primaryEffects:[n("professional.careerControl",3)],secondaryEffects:[n("professional.publicPolarization",2)]},
  {id:"B",label:"Esperar a que la otra parte haga el siguiente movimiento",intentTags:["wait"],primaryMessage:"Ganas tiempo y aparece información que antes no tenías.",secondaryMessage:"Mientras esperas, otra persona aprovecha la ventana.",primaryEffects:[n("professional.environmentStability",2)],secondaryEffects:[n("professional.careerControl",-1)]},
  {id:"C",label:"Pedir que te expliquen por escrito qué cambia antes de aceptar nada",intentTags:["protect"],primaryMessage:"Aseguras una referencia concreta antes de comprometerte.",secondaryMessage:"Exigir claridad protege tu posición, pero desgasta la confianza de la otra parte.",primaryEffects:[n("professional.roleSecurity",3)],secondaryEffects:[n("professional.institutionalTrust",-2)]}
 ];
 return ambiguousEvent({
  id:r.id,ageWindow:[r.age,r.age],phase:"26_30",family:"conditional",title:r.title,body,visible,uncertain,choices,
  gates:r.gates,timeWindow:{months:r.months},weight:9,cooldown:99999,seedsRead:r.read,
  npcRefs:nano?["NPC_PLR_14"]:undefined,
  tags:["conditional","peak_callback"],canonStatus:r.verified?"verified":"technical_adaptation"
 });
}
export const CONDITIONAL_EVENTS_26_30:EventDefinition[]=rows.map(make);
