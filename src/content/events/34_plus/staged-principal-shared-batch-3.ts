import type { EventDefinition, EventFamily, GameState } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";
import { getSportMatchModelStore } from "../../../simulation/match-model.js";
import { hasNationalTeamHistory } from "../../../simulation/national-team-authority.js";

type Delta=readonly [string,number];
type C={id:string;label:string;stance:string;note:string;p:readonly Delta[];s:readonly Delta[]};
type S={id:string;age:number;family:EventFamily;title:string;body:string;visible:string[];uncertain:string[];seed:string;choices:C[]};

function build(spec:S):EventDefinition{
 return ambiguousEvent({
  id:spec.id,ageWindow:[spec.age,null],phase:"34_plus",family:spec.family,title:spec.title,body:spec.body,
  visible:spec.visible,uncertain:spec.uncertain,gates:[{path:"retirement.status",op:"eq",value:"playing"}],weight:11,
  choices:spec.choices.map(c=>({
   id:c.id,label:c.label,intentTags:["canonical_34plus","shared_authority"],
   primaryMessage:c.note,secondaryMessage:`${c.note} El resultado externo dependerá de lo que ocurra realmente después de esta conversación.`,
   primaryEffects:c.p.map(([path,d])=>n(path,d)),secondaryEffects:c.s.map(([path,d])=>n(path,d)),
   primarySeedTransitions:[seedCreate(spec.seed,66,{stance:c.stance})],
   secondarySeedTransitions:[seedCreate(spec.seed,72,{stance:c.stance,secondary_cost:true})]
  })),
  seedsWrite:[spec.seed],tags:["canonical_34plus","staged_not_registered","awaiting_external_fact","shared_authority_consumer"],canonStatus:"verified"
 });
}

const specs:S[]=[
 {id:"EVT_34_NT_001",age:34,family:"selection",title:"Última ventana de selección",body:"Una prelista internacional te incluye, pero el seleccionador avisa de que ya no garantizará convocatoria. La lista está confirmada antes de que tengas que responder.",visible:["Prelista real","calendario internacional","mensaje del seleccionador"],uncertain:["Aceptar rol secundario puede abrir un último torneo","también puede sumar viajes sin jugar"],seed:"SEED_FINAL_NT_POSTURE",choices:[
  {id:"A",label:"Seguir disponible para cualquier rol",stance:"available_any_role",note:"Mantienes disponibilidad internacional sin prometer convocatoria.",p:[["professional.nationalStanding",2],["professional.motivationReserve",2]],s:[["professional.recoveryDebt",2]]},
  {id:"B",label:"Pedir claridad",stance:"ask_clarity",note:"Pides contexto sobre tu lugar sin fabricar selección.",p:[["professional.careerControl",3]],s:[["professional.environmentStability",-1]]},
  {id:"C",label:"Retirarte internacionalmente ahora",stance:"international_retirement",note:"Cierras disponibilidad internacional únicamente; la carrera de club sigue jugando.",p:[["professional.careerControl",4],["professional.retirementDistance",2]],s:[["professional.nationalStanding",-3]]},
  {id:"D",label:"Estar disponible solo para ventanas competitivas",stance:"competitive_windows_only",note:"Limitas disponibilidad internacional sin crear ninguna convocatoria.",p:[["professional.matchSelectivity",4],["professional.recoveryDebt",-2]],s:[["professional.nationalStanding",-1]]}
 ]},
 {id:"EVT_34_MATCH_001",age:34,family:"sport",title:"Un gol que rompe el plan",body:"En una eliminatoria real entras y marcas un gol decisivo. La conversación posterior parte de lo que ocurrió en el campo.",visible:["Fixture real","entrada registrada","gol decisivo acreditado","resultado real"],uncertain:["No sabes si el técnico cambiará un plan estructural por un momento heroico"],seed:"SEED_LAST_HERO_MOMENT",choices:[
  {id:"A",label:"Pedir titularidad aprovechando el momento",stance:"ask_start",note:"Usas el hecho deportivo como argumento, no como garantía de titularidad.",p:[["professional.careerControl",4],["professional.publicMyth",3]],s:[["professional.environmentStability",-2]]},
  {id:"B",label:"Repetir que aceptas el rol",stance:"accept_role",note:"Mantienes coherencia con el rol pese al momento heroico.",p:[["professional.environmentStability",4],["professional.roleAdaptability",2]],s:[["professional.careerControl",-1]]},
  {id:"C",label:"No hablar",stance:"silence",note:"Dejas que el hecho deportivo hable sin convertirlo en campaña personal.",p:[["reputation.mediaHeat",-2],["professional.careerControl",1]],s:[["professional.statusInertia",-1]]},
  {id:"D",label:"Usarlo para abrir renovación",stance:"renewal_request",note:"Abres una negociación, pero el club todavía tiene que presentar una oferta formal.",p:[["professional.contractPower",3],["professional.careerControl",3]],s:[["professional.environmentStability",-1]]}
 ]},
 {id:"EVT_34_NT_002",age:34,family:"selection",title:"Te dejan fuera de una convocatoria",body:"Una lista internacional te deja fuera pese a estar disponible y tener trayectoria previa con la selección.",visible:["Lista real","estado sano acreditado","historial previo de selección"],uncertain:["Puede ser descanso, transición o un final no comunicado"],seed:"SEED_NT_FIRST_OMISSION_LATE",choices:[
  {id:"A",label:"Llamar al seleccionador",stance:"call_coach",note:"Pides explicación sin alterar la lista.",p:[["professional.careerControl",3]],s:[["professional.environmentStability",-1]]},
  {id:"B",label:"Felicitar a los convocados",stance:"support_squad",note:"Evitas convertir la omisión en conflicto público.",p:[["professional.publicMyth",2],["reputation.mediaHeat",-2]],s:[["professional.motivationReserve",-1]]},
  {id:"C",label:"Anunciar retirada internacional",stance:"international_retirement",note:"Cierras etapa internacional, nunca la carrera profesional.",p:[["professional.careerControl",4],["professional.retirementDistance",2]],s:[["professional.nationalStanding",-3]]},
  {id:"D",label:"No reaccionar y esperar siguiente lista",stance:"wait_next_list",note:"Mantienes disponibilidad y esperas a la siguiente lista.",p:[["professional.environmentStability",2]],s:[["professional.motivationReserve",-2]]}
 ]},
 {id:"EVT_34_TRAVEL_001",age:34,family:"sport",title:"El viaje que no haces",body:"El plan de carga te deja fuera de un desplazamiento y el equipo consigue una victoria importante sin ti.",visible:["Fixture omitido real","motivo de carga acreditado","resultado real"],uncertain:["El éxito puede reforzar la política de descansarte","también puede reducir tu centralidad"],seed:"SEED_TEAM_WINS_WITHOUT_YOU",choices:[
  {id:"A",label:"Celebrar el plan",stance:"support_plan",note:"Validas la gestión de carga sin asumir pérdida definitiva de rol.",p:[["professional.recoveryDebt",-3],["professional.environmentStability",3]],s:[["professional.statusInertia",-1]]},
  {id:"B",label:"Pedir volver al siguiente once",stance:"ask_next_start",note:"Pides competir de nuevo; no escribes titularidad.",p:[["professional.careerControl",4],["professional.motivationReserve",2]],s:[["professional.environmentStability",-2]]},
  {id:"C",label:"No cambiar nada",stance:"keep_plan",note:"Mantienes el acuerdo de carga sin añadir narrativa.",p:[["professional.environmentStability",2],["professional.recoveryDebt",-2]],s:[["professional.motivationReserve",-1]]},
  {id:"D",label:"Viajar siempre aunque no juegues",stance:"travel_anyway",note:"Priorizas presencia con el grupo sin inventar participación.",p:[["professional.environmentStability",3],["professional.lockerPower",2]],s:[["professional.recoveryDebt",1]]}
 ]},
 {id:"EVT_35_TACT_001",age:35,family:"tactical",title:"El nuevo rol funciona demasiado bien",body:"La reconversión te da minutos y buenas métricas pese a reducir tus cifras ofensivas.",visible:["Rol actual","minutos reales","métricas reales","feedback del cuerpo técnico"],uncertain:["No sabes si el mercado exterior entenderá el valor","otro entrenador puede no usar el mismo rol"],seed:"SEED_FINAL_REINVENTION",choices:[
  {id:"A",label:"Especializarte del todo",stance:"full_reinvention",note:"Aceptas la nueva identidad táctica.",p:[["professional.roleAdaptability",5],["professional.motivationReserve",2]],s:[["professional.publicMyth",-1]]},
  {id:"B",label:"Mantener capacidades antiguas",stance:"hybrid",note:"Conservas versatilidad para no depender de una sola función.",p:[["professional.roleAdaptability",4],["professional.careerControl",2]],s:[["professional.recoveryDebt",1]]},
  {id:"C",label:"Buscar club que valore ese rol",stance:"market_interest",note:"Abres interés de mercado sin fabricar oferta.",p:[["professional.careerControl",4]],s:[["professional.environmentStability",-2]]},
  {id:"D",label:"Usarlo para renovar",stance:"renewal_request",note:"Abres negociación de renovación usando hechos de rendimiento.",p:[["professional.contractPower",3],["professional.careerControl",2]],s:[["professional.environmentStability",-1]]}
 ]},
 {id:"EVT_35_NT_001",age:35,family:"selection",title:"Te llaman por una emergencia internacional",body:"Una llamada internacional de emergencia llega por una necesidad concreta de la selección. Si habías cerrado esa etapa, volver exige que tú aceptes reabrirla.",visible:["Llamada real","fixture/torneo real","rol probable","motivo de la llamada si te lo explican"],uncertain:["Puede darte un cierre mejor","también puede convertirte en parche simbólico"],seed:"SEED_EMERGENCY_NT_RETURN",choices:[
  {id:"A",label:"Volver",stance:"accept_return",note:"Aceptas volver a estar disponible para esta convocatoria.",p:[["professional.nationalStanding",3],["professional.motivationReserve",3]],s:[["professional.recoveryDebt",2]]},
  {id:"B",label:"Rechazar",stance:"decline_return",note:"Rechazas la llamada sin alterar tu carrera de club.",p:[["professional.careerControl",4],["professional.recoveryDebt",-1]],s:[["professional.nationalStanding",-2]]},
  {id:"C",label:"Aceptar solo si puedes competir",stance:"competitive_only",note:"Condicionas tu disponibilidad a un papel competitivo claro, sin exigir minutos garantizados.",p:[["professional.careerControl",3],["professional.nationalStanding",1]],s:[["professional.environmentStability",-1]]},
  {id:"D",label:"Pedir 24 horas para hablar con club/familia",stance:"delay_24h",note:"Difieres respuesta sin inventar cambios en la lista.",p:[["professional.careerControl",2]],s:[["professional.environmentStability",-1]]}
 ]},
 {id:"EVT_35_FINAL_001",age:35,family:"sport",title:"La final que miras desde fuera",body:"La final existe, estás convocado y el cuerpo técnico ya ha hablado contigo sobre posibles escenarios de uso.",visible:["Final real","convocatoria real","plan de uso acreditado"],uncertain:["El partido puede pedir tu perfil","no sabes si será tu última final"],seed:"SEED_LAST_FINAL_BENCH",choices:[
  {id:"A",label:"Prepararte sin protestar",stance:"prepare",note:"Mantienes foco competitivo sin reclamar un cambio que aún no existe.",p:[["professional.environmentStability",4],["professional.motivationReserve",2]],s:[["professional.statusInertia",-1]]},
  {id:"B",label:"Pedir conversación táctica",stance:"tactical_talk",note:"Pides claridad de escenarios de uso, no minutos garantizados.",p:[["professional.careerControl",3],["professional.roleAdaptability",2]],s:[["professional.environmentStability",-1]]},
  {id:"C",label:"Mostrar que quieres entrar si hay prórroga",stance:"extra_time_ready",note:"Declaras disponibilidad por si el partido se alarga, sin dar por hecho que habrá prórroga.",p:[["professional.motivationReserve",3],["professional.careerControl",2]],s:[["professional.recoveryDebt",1]]},
  {id:"D",label:"Filtrar malestar después, nunca antes",stance:"post_match_press",note:"Pospones cualquier señal pública hasta después del hecho deportivo.",p:[["professional.careerControl",2]],s:[["reputation.mediaHeat",3],["professional.environmentStability",-2]]}
 ]},
 {id:"EVT_36_BODY_001",age:36,family:"medical",title:"Ya no puedes jugar domingo-miércoles-domingo",body:"Tu historial reciente muestra una caída repetida después de tres partidos en ocho días y una recuperación cada vez más lenta.",visible:["Secuencias reales","patrón medido","calendario real"],uncertain:["No sabes qué partidos serán decisivos cuando hagas el plan"],seed:"SEED_COMPETITION_SELECTIVITY",choices:[
  {id:"A",label:"Elegir uno de cada tres",stance:"one_of_three",note:"Aumentas selectividad sin escribir alineaciones futuras.",p:[["professional.matchSelectivity",7],["professional.recoveryDebt",-5]],s:[["professional.roleSecurity",-2]]},
  {id:"B",label:"Dejar al técnico elegir",stance:"coach_selects",note:"Delegas selección de carga sin inventar decisiones concretas.",p:[["professional.environmentStability",3],["professional.matchSelectivity",3]],s:[["professional.careerControl",-2]]},
  {id:"C",label:"Priorizar Europa/copa",stance:"cups_priority",note:"Defines preferencia que solo puede aplicarse a calendario real.",p:[["professional.matchSelectivity",5],["professional.careerControl",2]],s:[["professional.recoveryDebt",-2]]},
  {id:"D",label:"Priorizar liga",stance:"league_priority",note:"Defines preferencia de competición sin alterar fixtures.",p:[["professional.matchSelectivity",5],["professional.careerControl",2]],s:[["professional.recoveryDebt",-2]]}
 ]}
];

export const STAGED_SHARED_BATCH_3:EventDefinition[]=specs.map(build);
export function isStagedSharedBatch3Eligible(state:GameState,id:string,facts:boolean):boolean{
 const e=STAGED_SHARED_BATCH_3.find(x=>x.id===id);
 if(!e||!facts||state.retirement.status!=="playing"||state.age<e.ageWindow[0]) return false;
 if(id==="EVT_34_NT_001"||id==="EVT_34_NT_002"||id==="EVT_35_NT_001") return hasNationalTeamHistory(state);
 return (getSportMatchModelStore(state)?.fixtures.length??0)>0;
}
