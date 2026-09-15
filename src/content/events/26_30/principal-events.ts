import type { Condition, Effect, EventDefinition, EventFamily } from "../../../core/types.js";
import { ambiguousEvent, flag, n, seedCreate, set } from "../18_20/helpers.js";

type Row={id:string;title:string;age:26|27|28|29;family:EventFamily;months:number[];seed?:string;read?:string[];gates?:Condition[];verified?:boolean;labels?:[string,string,string,string];choiceEffects?:[Effect[],Effect[],Effect[],Effect[]];weight?:number;tags?:string[];seedChoices?:string[]};

const rows:Row[]=[
  {id:"EVT_26_IDN_001",title:"Ahora te compran por lo que ya eres",age:26,family:"legacy",months:[7,8],seed:"SEED_PEAK_IDENTITY",verified:true},
  {id:"EVT_26_MKT_001",title:"Quieren construir alrededor de ti",age:26,family:"market",months:[7,8],seed:"SEED_SHADOW_ESCAPE",read:["SEED_ELITE_ROLE_BARGAIN"],verified:true,gates:[{path:"reputation.marketHeat",op:"gte",value:42}]},
  {id:"EVT_26_CLB_001",title:"Ser la cara del proyecto",age:26,family:"team",months:[7,8,9],seed:"SEED_PROJECT_FACE",seedChoices:["A","B","D"],gates:[{path:"professional.clubPrestigeTier",op:"gte",value:3}]},
  {id:"EVT_26_CON_001",title:"El contrato del pico",age:26,family:"contract",months:[7,8,9],seed:"SEED_PEAK_CONTRACT"},
  {id:"EVT_26_IMG_001",title:"Tu nombre fuera del fútbol",age:26,family:"image",months:[8,9,10],seed:"SEED_GLOBAL_IMAGE",gates:[{path:"professional.commercialPower",op:"gte",value:35}]},
  {id:"EVT_26_BODY_001",title:"Optimizarlo todo",age:26,family:"medical",months:[8,9,10,11],seed:"SEED_SELF_OPTIMIZATION"},
  {id:"EVT_26_TEAM_001",title:"El chico que han fichado para tu sitio",age:26,family:"team",months:[8,9,10,11],seed:"SEED_YOUNG_SUCCESSOR"},
  {id:"EVT_26_NAT_001",title:"Club, selección y descanso",age:26,family:"selection",months:[9,10,11,3,4,5],seed:"SEED_INTERNATIONAL_LOAD",gates:[{path:"flags.NATIONAL_CALLED",op:"eq",value:true}]},
  {id:"EVT_26_HOME_001",title:"UDV quiere algo más que una foto",age:26,family:"family",months:[9,10,11,12],seed:"SEED_HOME_INSTITUTION"},
  {id:"EVT_26_EUR_001",title:"Europa ya no es una novedad",age:26,family:"sport",months:[9,10,11,2,3,4],read:["SEED_EURO_REGISTRATION"],gates:[{path:"flags.CONTINENTAL_REGISTERED",op:"eq",value:true}]},
  {id:"EVT_26_AGT_001",title:"Tu agente ya no es el único teléfono",age:26,family:"agent",months:[10,11,12,1],read:["SEED_DIRECT_RECRUIT"],gates:[{path:"reputation.marketHeat",op:"gte",value:45}]},
  {id:"EVT_26_PRS_001",title:"La entrevista del pico",age:26,family:"press",months:[10,11,12,1,2],gates:[{path:"reputation.mediaHeat",op:"gte",value:30}]},
  {id:"EVT_26_JAN_001",title:"Enero: comprar tu siguiente versión",age:26,family:"market",months:[1],gates:[{path:"world.marketWindowOpen",op:"eq",value:true}]},

  {id:"EVT_27_REC_001",title:"El récord empieza a estar cerca",age:27,family:"legacy",months:[7,8,9],seed:"SEED_RECORD_CHASE"},
  {id:"EVT_27_LOCK_001",title:"El vestuario te mira antes de hablar",age:27,family:"captaincy",months:[7,8,9,10],seed:"SEED_LOCKER_ENDORSEMENT",gates:[{path:"professional.lockerPower",op:"gte",value:45}]},
  {id:"EVT_27_BODY_001",title:"Descansar cuando mejor estás",age:27,family:"medical",months:[8,9,10,11],seed:"SEED_PEAK_LOAD"},
  {id:"EVT_27_PRS_001",title:"El documental",age:27,family:"press",months:[8,9,10,11],seed:"SEED_DOCUMENTARY_ACCESS",gates:[{path:"professional.publicMyth",op:"gte",value:35}]},
  {id:"EVT_27_AGT_001",title:"Tu agencia gana más si te mueves",age:27,family:"agent",months:[8,9,10,1],seed:"SEED_AGENT_CONFLICT_PEAK",gates:[{path:"reputation.marketHeat",op:"gte",value:50}]},
  {id:"EVT_27_RIV_001",title:"Otra vez comparados",age:27,family:"press",months:[9,10,11,12],seed:"SEED_PUBLIC_RIVALRY",read:["SEED_ADRIAN_MIRROR"]},
  {id:"EVT_27_MENT_001",title:"¿Qué le dirías al de 19?",age:27,family:"team",months:[9,10,11,12],seed:"SEED_MENTOR_ADVICE"},
  {id:"EVT_27_NAT_001",title:"Tu sitio en la selección ya pesa",age:27,family:"selection",months:[9,10,11,3,4,5],seed:"SEED_NATIONAL_ROLE",gates:[{path:"professional.nationalCaps",op:"gte",value:2}]},
  {id:"EVT_27_MED_001",title:"La final y el isquio",age:27,family:"medical",months:[4,5],read:["SEED_BIG_MATCH_BODY"],gates:[{path:"flags.FINAL_CONTEXT",op:"eq",value:true},{path:"professional.bodyLoad",op:"gte",value:30}],verified:true,weight:22},
  {id:"EVT_27_FINAL_001",title:"La final empieza en el banquillo",age:27,family:"sport",months:[4,5],seed:"SEED_BIG_GAME_BENCH",gates:[{path:"flags.FINAL_CONTEXT",op:"eq",value:true},{path:"sport.roleScore",op:"lt",value:72}],verified:true,weight:24},
  {id:"EVT_27_MKT_001",title:"Una oferta que cambia tu escala",age:27,family:"market",months:[1,5,6],weight:18,gates:[{path:"reputation.marketHeat",op:"gte",value:55}]},
  {id:"EVT_27_TACT_001",title:"Cambiar para seguir arriba",age:27,family:"tactical",months:[2,3,4],verified:true},
  {id:"EVT_27_MONEY_001",title:"El patrimonio ya necesita estructura",age:27,family:"money",months:[2,3,4,5]},

  {id:"EVT_28_MKT_001",title:"El mega-traspaso",age:28,family:"market",months:[7,8],seed:"SEED_MEGA_TRANSFER",gates:[{path:"reputation.marketHeat",op:"gte",value:58}]},
  {id:"EVT_28_PRS_001",title:"La presión pública para salir",age:28,family:"press",months:[7,8,9],seed:"SEED_PUBLIC_EXIT_PRESSURE",gates:[{path:"professional.careerControl",op:"gte",value:45}]},
  {id:"EVT_28_MONEY_001",title:"Tu dinero ya es una empresa",age:28,family:"money",months:[7,8,9],seed:"SEED_WEALTH_STRUCTURE"},
  {id:"EVT_28_HOME_001",title:"Entrar en UDV sin volver",age:28,family:"family",months:[8,9,10],seed:"SEED_HOME_OWNERSHIP"},
  {id:"EVT_28_IMG_001",title:"Tu marca ya no quiere llevar el escudo",age:28,family:"image",months:[8,9,10],seed:"SEED_PERSONAL_BRAND_INDEPENDENCE",gates:[{path:"professional.commercialPower",op:"gte",value:45}]},
  {id:"EVT_28_TEAM_001",title:"Dos estrellas, un foco",age:28,family:"team",months:[8,9,10,11],seed:"SEED_SECOND_STAR",gates:[{path:"professional.clubPrestigeTier",op:"gte",value:4}]},
  {id:"EVT_28_TACT_001",title:"Tu nueva posición",age:28,family:"tactical",months:[9,10,11,12],seed:"SEED_POSITIONAL_REINVENTION",seedChoices:["A","B"],labels:["Aceptar la reconversión completa","Adaptarte solo en determinados partidos","Defender tu posición habitual","Probar el cambio antes de comprometerte"]},
  {id:"EVT_28_GALA_001",title:"La gala",age:28,family:"image",months:[10,11,12],seed:"SEED_GLOBAL_AWARD_BEHAVIOR",gates:[{path:"professional.peakStatus",op:"gte",value:58},{path:"professional.publicMyth",op:"gte",value:45}],verified:true},
  {id:"EVT_28_NAT_001",title:"La lista de 26",age:28,family:"selection",months:[5,6],read:["SEED_MAJOR_TOURNAMENT"],gates:[{path:"flags.NATIONAL_TOURNAMENT_CYCLE",op:"eq",value:true},{path:"professional.nationalStanding",op:"gte",value:45}],verified:true},
  {id:"EVT_28_FINAL_001",title:"Una final no garantiza protagonismo",age:28,family:"sport",months:[4,5],seed:"SEED_FINAL_BENCH",gates:[{path:"flags.FINAL_CONTEXT",op:"eq",value:true}],weight:22},
  {id:"EVT_28_CON_001",title:"El último contrato realmente largo",age:28,family:"contract",months:[7,8,9,1]},
  {id:"EVT_28_BODY_001",title:"La recuperación tarda un día más",age:28,family:"medical",months:[10,11,12,1,2],gates:[{path:"professional.bodyLoad",op:"gte",value:38}]},
  {id:"EVT_28_JAN_001",title:"El invierno del segundo gran proyecto",age:28,family:"market",months:[1],weight:20,gates:[{path:"world.marketWindowOpen",op:"eq",value:true}]},

  {id:"EVT_29_CCH_001",title:"El entrenador y tu poder",age:29,family:"captaincy",months:[7,8,9],seed:"SEED_MANAGER_POWER",gates:[{path:"professional.institutionalPower",op:"gte",value:48}]},
  {id:"EVT_29_FAN_001",title:"El estadio ya no está de acuerdo contigo",age:29,family:"press",months:[7,8,9,10],seed:"SEED_FAN_FRACTURE",gates:[{path:"reputation.mediaHeat",op:"gte",value:38}]},
  {id:"EVT_29_MED_001",title:"Operarte ahora o convivir con ello",age:29,family:"medical",months:[8,9,10,11],seed:"SEED_SURGERY_TIMING",gates:[{path:"professional.bodyLoad",op:"gte",value:45}]},
  {id:"EVT_29_NAT_001",title:"El brazalete de la selección",age:29,family:"selection",months:[9,10,11,3,4],seed:"SEED_NATIONAL_CAPTAINCY",gates:[{path:"professional.nationalPower",op:"gte",value:55}]},
  {id:"EVT_29_EUR_001",title:"Sacrificar números para ganar",age:29,family:"sport",months:[2,3,4,5],seed:"SEED_ELITE_SACRIFICE",gates:[{path:"flags.CONTINENTAL_CONTEXT",op:"eq",value:true}]},
  {id:"EVT_29_REC_001",title:"El récord y el mal día del equipo",age:29,family:"legacy",months:[2,3,4,5],seed:"SEED_RECORD_PUBLIC_TONE"},
  {id:"EVT_29_MKT_001",title:"La oferta financieramente absurda",age:29,family:"market",months:[7,8,1],seed:"SEED_WEALTHY_PEAK_EXIT",seedChoices:["A"],labels:["Aceptar el contrato y salir del máximo escaparate","Rechazarlo para mantener el nivel competitivo","Negociar una estructura que preserve una salida futura","No cerrar nada todavía"],gates:[{path:"reputation.marketHeat",op:"gte",value:55}],verified:true},
  {id:"EVT_29_HOME_001",title:"Volver antes de que sea una despedida",age:29,family:"family",months:[7,8,1,5],seed:"SEED_EARLY_HOME_RETURN",seedChoices:["A"],read:["SEED_HOME_INSTITUTION"],gates:[{path:"flags.HAS_SEED_HOME_INSTITUTION",op:"eq",value:true}],labels:["Volver ahora mientras todavía puedes competir arriba","Aplazar el regreso un año","Abrir conversaciones sin comprometerte","Descartar el regreso deportivo por ahora"],choiceEffects:[[set("professional.route","home"),set("professional.ownerClub","UDV"),set("professional.registrationClub","UDV"),set("club","UDV")],[],[],[]]},
  {id:"EVT_29_FORM_001",title:"Tu primer bajón que no dura dos semanas",age:29,family:"sport",months:[10,11,12,1,2],seed:"SEED_FIRST_PEAK_DIP",gates:[{path:"sport.form",op:"lt",value:58}]},
  {id:"EVT_29_PRS_001",title:"Clara pregunta por el vestuario",age:29,family:"press",months:[10,11,12,1],read:["SEED_PRIVATE_CHAT"],verified:true},
  {id:"EVT_29_CON_001",title:"El último contrato máximo",age:29,family:"contract",months:[1,2,3],verified:true},
  {id:"EVT_29_FIN_001",title:"A los 30, ¿qué estás protegiendo ahora?",age:29,family:"legacy",months:[5,6],seed:"SEED_AGE30_PRIORITY",verified:true,weight:26,tags:["hard_deadline"],choiceEffects:[[set("world.age30Priority","legacy")],[set("world.age30Priority","minutes")],[set("world.age30Priority","body")],[set("world.age30Priority","freedom")]]}
];

const familyFx:Partial<Record<EventFamily,[Effect[],Effect[],Effect[],Effect[]]>>={
 market:[[n("reputation.marketHeat",6),n("professional.careerControl",-2)],[n("professional.careerControl",5),n("professional.roleSecurity",2)],[n("professional.clubPrestigeTier",1,1,5),n("professional.roleSecurity",-5)],[n("professional.contractPower",5),n("professional.institutionalTrust",-3)]],
 contract:[[n("professional.contractPower",7),n("professional.careerControl",4)],[n("professional.roleSecurity",6),n("professional.careerControl",-2)],[n("professional.careerControl",7),n("professional.institutionalTrust",-3)],[n("professional.moneyComfort",6),n("professional.contractPower",-2)]],
 medical:[[n("professional.bodyLoad",5),n("sport.roleScore",3)],[n("professional.recoveryMargin",6),n("sport.roleScore",-2)],[n("professional.recoveryMargin",3),n("professional.bodyLoad",-3)],[n("professional.roleAdaptability",3),n("professional.recoveryMargin",2)]],
 selection:[[n("professional.nationalPower",6),n("professional.bodyLoad",3)],[n("professional.nationalPower",3),n("professional.recoveryMargin",2)],[n("professional.nationalStanding",5),n("professional.publicMyth",2)],[n("professional.nationalPower",2),n("professional.careerControl",2)]],
 sport:[[n("professional.peakStatus",6),n("professional.bodyLoad",3)],[n("professional.trophyCapital",5),n("professional.peakStatus",2)],[n("sport.roleScore",5),n("professional.recoveryMargin",-2)],[n("professional.careerControl",3),n("professional.trophyCapital",2)]],
 team:[[n("professional.institutionalPower",6),n("professional.successionPressure",3)],[n("professional.institutionalPower",3),n("professional.environmentStability",4)],[n("professional.successionPressure",-3),n("professional.roleAdaptability",3)],[n("professional.careerControl",3),n("professional.institutionalTrust",2)]],
 captaincy:[[n("professional.institutionalPower",7),n("professional.publicMyth",2)],[n("professional.institutionalPower",3),n("professional.environmentStability",4)],[n("professional.careerControl",4),n("professional.institutionalTrust",-2)],[n("professional.institutionalPower",4),n("professional.careerControl",2)]],
 press:[[n("reputation.mediaHeat",7),n("professional.publicMyth",5),n("professional.publicPolarization",3)],[n("professional.publicMyth",2),n("professional.institutionalTrust",3)],[n("professional.careerControl",4),n("professional.publicPolarization",2)],[n("professional.publicMyth",4),n("professional.commercialPower",3)]],
 image:[[n("professional.publicMyth",7),n("professional.commercialPower",6)],[n("professional.commercialPower",4),n("professional.publicPolarization",-2)],[n("professional.careerControl",4),n("professional.commercialPower",-2)],[n("professional.commercialPower",5),n("professional.careerControl",3)]],
 tactical:[[n("professional.roleAdaptability",7),n("sport.roleScore",2)],[n("professional.roleAdaptability",4),n("professional.roleSecurity",3)],[n("sport.roleScore",4),n("professional.roleAdaptability",-2)],[n("professional.roleAdaptability",5),n("professional.careerControl",2)]],
 money:[[n("professional.moneyComfort",8),n("professional.careerControl",2)],[n("professional.moneyComfort",5),n("professional.environmentStability",3)],[n("professional.careerControl",4),n("professional.moneyComfort",2)],[n("professional.moneyComfort",4),n("professional.publicMyth",2)]],
 family:[[n("professional.environmentStability",6),n("professional.publicMyth",2)],[n("professional.careerControl",3),n("professional.environmentStability",3)],[n("professional.moneyComfort",-2),n("professional.environmentStability",5)],[n("professional.publicMyth",3),n("professional.careerControl",2)]],
 legacy:[[n("professional.publicMyth",5),n("professional.trophyCapital",2)],[n("professional.careerControl",5),n("professional.peakStatus",1)],[n("professional.recoveryMargin",4),n("professional.publicMyth",1)],[n("professional.contractPower",4),n("professional.careerControl",4)]],
 agent:[[n("professional.agentControl",-5),n("professional.contractPower",5)],[n("professional.agentControl",5),n("professional.careerControl",2)],[n("professional.agentControl",8),n("reputation.marketHeat",-2)],[n("professional.agentControl",2),n("professional.contractPower",3)]]
};

function make(r:Row):EventDefinition{
 const fx=familyFx[r.family]??familyFx.legacy!;
 const labels=r.labels??["Apostar por el máximo techo","Proteger la posición actual","Ganar control aunque pierdas algo de techo","Mantener varias puertas abiertas"];
 const choiceExtra=r.choiceEffects??[[],[],[],[]];
 const choices=labels.map((label,i)=>({id:String.fromCharCode(65+i),label,intentTags:[["ceiling"],["stability"],["control"],["balance"]][i]!,primaryMessage:["El movimiento funciona, pero eleva también las expectativas.","La estabilidad protege una parte de la carrera sin congelar el entorno.","Ganas margen de decisión a costa de otra ventaja inmediata.","El compromiso mantiene opciones abiertas, aunque nadie obtiene exactamente lo que quería."][i]!,secondaryMessage:["El techo prometido resulta menos controlable de lo esperado.","Mientras proteges estabilidad, el contexto cambia alrededor.","El control adicional tiene un coste deportivo o relacional.","La solución intermedia aplaza parte del conflicto en lugar de resolverlo."][i]!,immediateEffects:choiceExtra[i],primaryEffects:fx[i]!,secondaryEffects:[...fx[i]!,n("professional.environmentStability",i===1?1:-1)],primarySeedTransitions:r.seed&&(!r.seedChoices||r.seedChoices.includes(String.fromCharCode(65+i)))?[seedCreate(r.seed,55,{choice:String.fromCharCode(65+i)})]:undefined,secondarySeedTransitions:r.seed&&(!r.seedChoices||r.seedChoices.includes(String.fromCharCode(65+i)))?[seedCreate(r.seed,45,{choice:String.fromCharCode(65+i)})]:undefined}));
 return ambiguousEvent({id:r.id,ageWindow:[r.age,r.age],phase:"26_30",family:r.family,title:r.title,body:"En la cima o cerca de ella, prestigio, títulos, dinero, minutos y control ya no avanzan necesariamente juntos.",visible:["Conoces tu rol, contrato y contexto competitivo inmediato."],uncertain:["No conoces por completo las prioridades de club, mercado, selección o entorno."],choices,gates:r.gates,timeWindow:{months:r.months},weight:r.weight??13,cooldown:99999,seedsRead:r.read,seedsWrite:r.seed?[r.seed]:undefined,tags:[r.family,"peak",...(r.tags??[])],canonStatus:r.verified?"verified":"technical_adaptation"});
}

export const PRINCIPAL_EVENTS_26_30:EventDefinition[]=rows.map(make);
