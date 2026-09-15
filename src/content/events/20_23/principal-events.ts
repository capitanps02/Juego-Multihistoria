import type { EventDefinition, EventFamily, Condition, Effect } from "../../../core/types.js";
import { ambiguousEvent, flag, n, seedCreate, set } from "../18_20/helpers.js";

type Row = {
  id: string; title: string; age: 20|21|22; family: EventFamily; months: number[];
  seed?: string; read?: string[]; gates?: Condition[]; verified?: boolean; body?: string;
};

const rows: Row[] = [
  { id:"EVT_20_LIFE_001", title:"La primera casa que pagas tú", age:20, family:"life", months:[7,8], seed:"SEED_FIRST_BIG_MONEY" },
  { id:"EVT_20_AGT_001", title:"Ahora llama por ti", age:20, family:"agent", months:[7,8,9], seed:"SEED_AGENT_POWER" },
  { id:"EVT_20_ABR_001", title:"Un idioma dentro del vestuario", age:20, family:"social", months:[7,8,9,10], seed:"SEED_FOREIGN_ADAPT", gates:[{path:"flags.ABROAD_ROUTE",op:"eq",value:true}] },
  { id:"EVT_20_MED_001", title:"Lo que dices en la revisión", age:20, family:"medical", months:[7,8,9,1,2], seed:"SEED_MEDICAL_DISCLOSURE" },
  { id:"EVT_20_STATUS_001", title:"El dorsal libre", age:20, family:"team", months:[7,8], verified:true, gates:[{path:"sport.roleScore",op:"gte",value:35}], body:"Queda libre un dorsal simbólico. El club te lo ofrece o te deja pedirlo, pero un veterano cree que debería ir a otro jugador." },
  { id:"EVT_20_CCH_001", title:"La promesa de agosto", age:20, family:"tactical", months:[8,9], verified:true, body:"El entrenador te dice en privado que vas a jugar mucho si mantienes el nivel. Dos semanas después el club ficha a un futbolista en tu zona." },
  { id:"EVT_20_LOCK_001", title:"Un golpe de entrenamiento", age:20, family:"team", months:[9,10,11], verified:true, body:"Un veterano te entra durísimo después de que le hayas ganado dos veces. El entrenador deja seguir." },
  { id:"EVT_20_LOCK_002", title:"El compañero al que cubres", age:20, family:"team", months:[10,11,12], seed:"SEED_TEAMMATE_COVER" },
  { id:"EVT_20_BRUNO_001", title:"La llamada de Bruno", age:20, family:"market", months:[11,12,1,2], verified:true, read:["SEED_BRUNO_FAVOR"], gates:[{path:"flags.HAS_SEED_BRUNO_FAVOR",op:"eq",value:true}], body:"Bruno te llama: su director deportivo busca un jugador de tu perfil. Puede decir tu nombre, pero no garantizar nada." },
  { id:"EVT_20_MKT_001", title:"Una oferta que cambia el mapa", age:20, family:"market", months:[12,1], gates:[{path:"reputation.marketHeat",op:"gte",value:28}] },
  { id:"EVT_20_MATCH_001", title:"Tres partidos que pesan más", age:20, family:"sport", months:[2,3,4,5] },

  { id:"EVT_21_MONEY_001", title:"El primer contrato que cambia a tu familia", age:21, family:"money", months:[7,8], seed:"SEED_FAMILY_MONEY", verified:true, body:"Llega un contrato que multiplica tus ingresos —o, en una ruta modesta, el primer sueldo que permite ayudar de verdad en casa—." },
  { id:"EVT_21_AGT_001", title:"La comisión que ahora importa", age:21, family:"agent", months:[7,8,9], seed:"SEED_AGENT_POWER" },
  { id:"EVT_21_AGT_002", title:"Una llamada que no escuchaste", age:21, family:"agent", months:[9,10,11], seed:"SEED_AGENT_POWER", read:["SEED_AGENT_OMISSION"] },
  { id:"EVT_21_ABR_001", title:"Navidad lejos", age:21, family:"social", months:[11,12,1], seed:"SEED_FOREIGN_ADAPT", gates:[{path:"flags.ABROAD_ROUTE",op:"eq",value:true}] },
  { id:"EVT_21_IMG_001", title:"La campaña", age:21, family:"image", months:[7,8,9,10], seed:"SEED_SPONSOR_IMAGE", verified:true, gates:[{path:"reputation.mediaHeat",op:"gte",value:18}], body:"Una marca deportiva ofrece una campaña pequeña pero visible y quiere presentar tu historia de origen como parte del producto." },
  { id:"EVT_21_CAP_001", title:"El grupo de capitanes", age:21, family:"captaincy", months:[9,10,11,2,3], seed:"SEED_FIRST_CAPTAIN_ROOM", verified:true, gates:[{path:"professional.lockerPower",op:"gte",value:28}], body:"Tras una lesión o salida de un veterano, te invitan a una reunión de jugadores que decide primas internas, multas y mensajes al entrenador." },
  { id:"EVT_21_PRS_001", title:"La cifra publicada", age:21, family:"press", months:[9,10,11,12], seed:"SEED_PUBLIC_CONTRACT", verified:true, gates:[{path:"reputation.mediaHeat",op:"gte",value:20}], body:"Un medio publica tu salario con una cifra inflada. El club no desmiente porque la noticia puede convenirle." },
  { id:"EVT_21_NAT_001", title:"Tu nombre no está", age:21, family:"selection", months:[9,10,3,4], seed:"SEED_SELECTION_SNUB", gates:[{path:"flags.NATIONAL_RADAR",op:"eq",value:true}] },
  { id:"EVT_21_RIV_001", title:"Rivas vuelve a llamar", age:21, family:"legacy", months:[10,11,2,3], read:["SEED_RIVAS_TRUST"], gates:[{path:"flags.HAS_SEED_RIVAS_TRUST",op:"eq",value:true}] },
  { id:"EVT_21_CCH_001", title:"Un banquillo después de una promesa", age:21, family:"tactical", months:[10,11,12,1], gates:[{path:"professional.roleSecurity",op:"lt",value:52}] },
  { id:"EVT_21_CCH_002", title:"Otro entrenador, otra versión de ti", age:21, family:"tactical", months:[1,2,3,4], seed:"SEED_TACTICAL_SACRIFICE", verified:true, body:"Llega un técnico nuevo y te ve en un rol más trabajador y menos vistoso. Tu agente teme que desaparezcan tus números." },
  { id:"EVT_21_MED_001", title:"Jugar no significa estar bien", age:21, family:"medical", months:[2,3,4,5], read:["SEED_BODY_PRECEDENT"] },

  { id:"EVT_22_CON_001", title:"Veintidós y dieciocho meses", age:22, family:"contract", months:[7,8,9], seed:"SEED_FIRST_FREE_AGENCY", verified:true, body:"Te quedan aproximadamente dieciocho meses de contrato. El club quiere hablar ahora; tu agente insiste en que el próximo verano tendrás más poder." },
  { id:"EVT_22_CON_002", title:"La puerta de la libertad", age:22, family:"contract", months:[10,11,12,1], seed:"SEED_FIRST_FREE_AGENCY" },
  { id:"EVT_22_TACT_001", title:"Ser útil puede cambiar tu mercado", age:22, family:"tactical", months:[8,9,10,11], seed:"SEED_TACTICAL_SACRIFICE" },
  { id:"EVT_22_DDL_001", title:"Quedan horas", age:22, family:"market", months:[8,1], seed:"SEED_DEADLINE_DAY", gates:[{path:"reputation.marketHeat",op:"gte",value:30}] },
  { id:"EVT_22_LOCK_001", title:"La votación que divide el vestuario", age:22, family:"captaincy", months:[10,11,12,2], seed:"SEED_LOCKER_VOTE", gates:[{path:"professional.lockerPower",op:"gte",value:30}] },
  { id:"EVT_22_HOME_001", title:"Volver ya no significa volver igual", age:22, family:"family", months:[12,1,5,6], seed:"SEED_HOME_DISTANCE" },
  { id:"EVT_22_MED_001", title:"Lo que el nuevo club pregunta", age:22, family:"medical", months:[7,8,1], seed:"SEED_MEDICAL_DISCLOSURE" },
  { id:"EVT_22_MKT_001", title:"Dos proyectos, dos versiones de ti", age:22, family:"market", months:[6,7,8,1], gates:[{path:"reputation.marketHeat",op:"gte",value:36}] },
  { id:"EVT_22_LIFE_001", title:"Tu entorno ya es una decisión", age:22, family:"life", months:[9,10,3,4] },
  { id:"EVT_22_END_001", title:"Cumples 23", age:22, family:"legacy", months:[5,6] }
];

const familyEffects: Record<string, [Effect[],Effect[],Effect[],Effect[]]> = {
  contract: [[n("professional.contractPower",8),n("professional.institutionalTrust",-4)],[n("professional.contractPower",3),n("professional.institutionalTrust",4)],[n("professional.contractPower",6),n("professional.roleSecurity",-3)],[n("professional.contractPower",-3),n("professional.institutionalTrust",6)]],
  market: [[n("reputation.marketHeat",7),n("professional.environmentStability",-4)],[n("professional.roleSecurity",5),n("reputation.marketHeat",-2)],[n("professional.contractPower",5),n("reputation.mediaHeat",3)],[n("professional.environmentStability",5),n("professional.contractPower",-2)]],
  medical: [[n("body.risk",6),n("professional.roleSecurity",3)],[n("body.risk",-5),n("professional.roleSecurity",-2)],[n("professional.institutionalTrust",4),n("body.risk",-2)],[n("professional.contractPower",2),n("professional.injuryMinutesImpact",4)]],
  team: [[n("professional.lockerPower",5),n("professional.environmentStability",-2)],[n("professional.lockerPower",2),n("professional.environmentStability",4)],[n("professional.lockerPower",-2),n("professional.roleSecurity",3)],[n("professional.lockerPower",4),n("professional.institutionalTrust",2)]],
  captaincy: [[n("professional.lockerPower",7)],[n("professional.lockerPower",3),n("professional.environmentStability",3)],[n("professional.lockerPower",5),n("professional.environmentStability",-4)],[n("professional.lockerPower",-2),n("professional.roleSecurity",2)]],
  press: [[n("reputation.mediaHeat",8),n("professional.contractPower",3)],[n("reputation.mediaHeat",3),n("professional.institutionalTrust",2)],[n("reputation.mediaHeat",-2),n("professional.contractPower",2)],[n("professional.institutionalTrust",4),n("reputation.mediaHeat",1)]],
  image: [[n("reputation.mediaHeat",9),n("professional.moneyComfort",4)],[n("reputation.mediaHeat",4),n("professional.moneyComfort",2)],[n("reputation.mediaHeat",-3)],[n("reputation.mediaHeat",7),n("professional.moneyComfort",2)]],
  agent: [[n("professional.agentControl",-7),n("professional.contractPower",5)],[n("professional.agentControl",3),n("professional.contractPower",2)],[n("professional.agentControl",7),n("reputation.marketHeat",-2)],[n("professional.agentControl",-2),n("professional.environmentStability",3)]],
  social: [[n("professional.foreignAdaptation",7),n("professional.environmentStability",3)],[n("professional.foreignAdaptation",4),n("professional.roleSecurity",2)],[n("professional.foreignAdaptation",-1),n("professional.environmentStability",5)],[n("professional.foreignAdaptation",5),n("professional.moneyComfort",-1)]],
  tactical: [[n("sport.roleScore",5),n("professional.roleSecurity",4)],[n("sport.roleScore",2),n("reputation.marketHeat",3)],[n("sport.roleScore",-2),n("reputation.marketHeat",5)],[n("professional.contractPower",3),n("professional.institutionalTrust",-2)]],
  sport: [[n("sport.form",5),n("body.risk",4)],[n("sport.form",2),n("body.risk",-2)],[n("sport.roleScore",4),n("sport.form",-1)],[n("professional.roleSecurity",3),n("sport.form",1)]],
  money: [[n("professional.moneyComfort",8),n("professional.environmentStability",-2)],[n("professional.moneyComfort",4),n("professional.environmentStability",4)],[n("professional.moneyComfort",1),n("professional.environmentStability",2)],[n("professional.moneyComfort",3),n("professional.agentControl",2)]],
  family: [[n("professional.environmentStability",5),n("professional.moneyComfort",-2)],[n("professional.environmentStability",3)],[n("professional.environmentStability",-2),n("professional.agentControl",2)],[n("professional.environmentStability",4),n("reputation.mediaHeat",-1)]],
  life: [[n("professional.environmentStability",5),n("professional.moneyComfort",-2)],[n("professional.moneyComfort",5),n("professional.environmentStability",-2)],[n("professional.agentControl",3),n("professional.environmentStability",2)],[n("professional.environmentStability",1),n("body.risk",-2)]],
  selection: [[n("professional.nationalHeat",7),n("reputation.mediaHeat",3)],[n("professional.nationalHeat",3),n("professional.environmentStability",2)],[n("professional.nationalHeat",5),n("reputation.mediaHeat",-1)],[n("professional.nationalHeat",2),n("professional.agentControl",2)]],
  legacy: [[n("reputation.prestige",4),n("professional.environmentStability",2)],[n("professional.lockerPower",4)],[n("professional.contractPower",3),n("reputation.mediaHeat",2)],[n("professional.environmentStability",4),n("reputation.prestige",1)]]
};

function make(row: Row): EventDefinition {
  const ef = familyEffects[row.family] ?? familyEffects.life!;
  const seed = row.seed;
  const choices = [
    {id:"A",label:"Tomar la iniciativa",intentTags:["initiative"],primaryMessage:"La iniciativa abre margen, pero también hace visible tu posición.",secondaryMessage:"La misma iniciativa es interpretada como precipitación por parte del entorno.",primaryEffects:ef[0],secondaryEffects:[...ef[0],n("professional.environmentStability",-2)],primarySeedTransitions:seed?[seedCreate(seed,55,{choice:"A"})]:undefined,secondarySeedTransitions:seed?[seedCreate(seed,48,{choice:"A"})]:undefined},
    {id:"B",label:"Esperar y reunir información",intentTags:["patience"],primaryMessage:"Esperar aporta información que cambia la lectura del problema.",secondaryMessage:"El tiempo también consume parte de la ventana disponible.",primaryEffects:ef[1],secondaryEffects:[...ef[1],n("professional.contractPower",-1)],primarySeedTransitions:seed?[seedCreate(seed,48,{choice:"B"})]:undefined,secondarySeedTransitions:seed?[seedCreate(seed,42,{choice:"B"})]:undefined},
    {id:"C",label:"Proteger tu posición",intentTags:["self_protection"],primaryMessage:"Proteges tu margen de decisión y el coste inmediato queda contenido.",secondaryMessage:"Otros leen la cautela como distancia o falta de compromiso.",primaryEffects:ef[2],secondaryEffects:[...ef[2],n("professional.institutionalTrust",-2)],primarySeedTransitions:seed?[seedCreate(seed,52,{choice:"C"})]:undefined,secondarySeedTransitions:seed?[seedCreate(seed,46,{choice:"C"})]:undefined},
    {id:"D",label:"Buscar una solución intermedia",intentTags:["compromise"],primaryMessage:"La solución intermedia conserva varias puertas abiertas.",secondaryMessage:"Intentar conservar todas las puertas reduce la claridad de tu postura.",primaryEffects:ef[3],secondaryEffects:[...ef[3],n("professional.roleSecurity",-1)],primarySeedTransitions:seed?[seedCreate(seed,50,{choice:"D"})]:undefined,secondarySeedTransitions:seed?[seedCreate(seed,44,{choice:"D"})]:undefined}
  ];
  return ambiguousEvent({
    id:row.id, ageWindow:[row.age,row.age], phase:"20_23", family:row.family, title:row.title,
    body:row.body ?? "La carrera profesional te obliga a elegir entre objetivos compatibles en teoría, pero difíciles de conservar a la vez.",
    visible:["Conoces los hechos formales de la situación y las condiciones que ya se han producido."],
    uncertain:["No conoces la agenda completa de terceros ni cómo cambiará el contexto durante las próximas semanas."],
    choices, gates:row.gates, timeWindow:{months:row.months}, weight: row.id==="EVT_22_END_001"?95:row.id==="EVT_22_DDL_001"?34:12,
    cooldown:99999, seedsRead:row.read, seedsWrite:seed?[seed]:undefined,
    tags:[row.family, row.age===22?"transition23":"professionalization"], canonStatus:row.verified?"verified":"technical_adaptation"
  });
}

export const PRINCIPAL_EVENTS_20_23: EventDefinition[] = rows.map(make);
