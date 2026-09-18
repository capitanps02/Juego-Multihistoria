import type { EventDefinition, EventFamily, GameState } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

type Delta=readonly [string,number];
type C={id:string;label:string;stance:string;note:string;p:readonly Delta[];s:readonly Delta[]};
type S={id:string;age:number;family:EventFamily;title:string;body:string;visible:string[];uncertain:string[];seed:string;choices:C[]};

function build(spec:S):EventDefinition{
 return ambiguousEvent({
  id:spec.id,ageWindow:[spec.age,null],phase:"34_plus",family:spec.family,title:spec.title,body:spec.body,
  visible:spec.visible,uncertain:spec.uncertain,gates:[{path:"retirement.status",op:"eq",value:"playing"}],weight:10,
  choices:spec.choices.map(c=>({
   id:c.id,label:c.label,intentTags:["canonical_34plus","shared_authority"],
   primaryMessage:c.note,secondaryMessage:`${c.note} Ningún hecho externo se crea desde la elección narrativa.`,
   primaryEffects:c.p.map(([path,d])=>n(path,d)),secondaryEffects:c.s.map(([path,d])=>n(path,d)),
   primarySeedTransitions:[seedCreate(spec.seed,66,{stance:c.stance})],
   secondarySeedTransitions:[seedCreate(spec.seed,72,{stance:c.stance,secondary_cost:true})]
  })),
  seedsWrite:[spec.seed],tags:["canonical_34plus","staged_not_registered","awaiting_external_fact","shared_authority_consumer"],canonStatus:"verified"
 });
}

const specs:S[]=[
 {id:"EVT_35_RECORD_001",age:35,family:"legacy",title:"El canterano rompe tu récord",body:"Un joven certificado del club supera una marca real asociada contigo. Récord e identidad deben venir de #199 y squad authority.",visible:["Récord real","valor superado","jugador joven certificado"],uncertain:["La prensa puede buscar homenaje","también puede buscar conflicto generacional"],seed:"SEED_RECORD_PASSED",choices:[
  {id:"A",label:"Felicitarlo con entusiasmo",stance:"celebrate_successor",note:"Reconoces el récord y reduces conflicto generacional.",p:[["professional.publicMyth",3],["professional.lockerPower",3]],s:[["professional.statusInertia",-1]]},
  {id:"B",label:"Respuesta breve",stance:"brief_reply",note:"Reconoces el hecho sin convertirlo en relato personal.",p:[["reputation.mediaHeat",-2],["professional.careerControl",2]],s:[["professional.publicPolarization",1]]},
  {id:"C",label:"Recordar que los récords cambian",stance:"records_change",note:"Normalizas el relevo sin negar lo que significó tu marca.",p:[["professional.publicMyth",2],["professional.careerControl",2]],s:[["reputation.mediaHeat",1]]},
  {id:"D",label:"Invitarlo a hablar en privado",stance:"private_talk",note:"Abres una conversación con el jugador real certificado.",p:[["professional.lockerPower",4],["professional.environmentStability",2]],s:[["professional.careerControl",1]]}
 ]},
 {id:"EVT_36_RECORD_001",age:36,family:"legacy",title:"El partido 700",body:"La appearance authority sitúa una posible aparición número 700 junto a una recomendación factual de descanso. La escena nunca garantiza que el hito ocurra.",visible:["Conteo profesional real","fixture real","recomendación de descanso"],uncertain:["Puede llegar la semana siguiente","una lesión podría impedirlo"],seed:"SEED_700_MATCH_CHOICE",choices:[
  {id:"A",label:"Jugar para asegurar hito",stance:"push_milestone",note:"Pides estar disponible; no escribes aparición ni titularidad.",p:[["professional.careerControl",3],["professional.publicMyth",2]],s:[["professional.recoveryDebt",3]]},
  {id:"B",label:"Descansar",stance:"rest",note:"Priorizas la recomendación corporal sobre el número.",p:[["professional.recoveryDebt",-5],["professional.bodyLoad",-3]],s:[["professional.motivationReserve",-1]]},
  {id:"C",label:"Entrar solo si el marcador lo permite",stance:"conditional_sub",note:"Expresas preferencia; una oportunidad de cambio debe existir en el partido real.",p:[["professional.matchSelectivity",3],["professional.careerControl",2]],s:[["professional.recoveryDebt",1]]},
  {id:"D",label:"No comunicar el hito al staff",stance:"keep_private",note:"No usas el número como presión deportiva.",p:[["professional.careerControl",2]],s:[["professional.environmentStability",-1]]}
 ]},
 {id:"EVT_37_PEN_001",age:37,family:"sport",title:"El penalti de despedida",body:"En un partido real con contexto de despedida factual, se concede un penalti y el lanzador habitual certificado te ofrece decidir. La escena nunca fabrica penalti, gol ni fallo.",visible:["Partido real","penalti real","lanzador habitual","marcador"],uncertain:["Aceptar puede parecer natural","también puede anteponer relato al resultado"],seed:"SEED_FAREWELL_PENALTY",choices:[
  {id:"A",label:"Tirarlo",stance:"take_penalty",note:"Aceptas ser lanzador si la authority de partido confirma la asignación.",p:[["professional.careerControl",3],["professional.publicMyth",2]],s:[["professional.environmentStability",-1]]},
  {id:"B",label:"Dejar al especialista",stance:"leave_specialist",note:"Mantienes la jerarquía habitual.",p:[["professional.environmentStability",4],["professional.lockerPower",2]],s:[["professional.publicMyth",-1]]},
  {id:"C",label:"Tirarlo solo si el partido está resuelto",stance:"take_if_safe",note:"Condicionas la decisión al marcador factual futuro.",p:[["professional.careerControl",2],["professional.environmentStability",2]],s:[["professional.statusInertia",-1]]},
  {id:"D",label:"Decidir según el capitán/entrenador",stance:"defer_authority",note:"Delegas en una autoridad certificada cuando exista.",p:[["professional.institutionalTrust",3],["professional.lockerPower",2]],s:[["professional.careerControl",-1]]}
 ]},
 {id:"EVT_34_DORSAL_001",age:34,family:"team",title:"Tu dorsal en la tienda",body:"El club hace una petición factual sobre tu dorsal histórico y existe un joven certificado implicado. La escena no inventa fichaje, dorsal ni sucesor.",visible:["Dorsal histórico real","petición del club","jugador real","campaña real"],uncertain:["Puede ser un gesto aislado","también puede señalar una sucesión"],seed:"SEED_FINAL_DORSAL",choices:[
  {id:"A",label:"Cederlo públicamente",stance:"cede_public",note:"Aceptas el gesto y lo haces público sin alterar identidades.",p:[["professional.publicMyth",3],["professional.lockerPower",3]],s:[["professional.statusInertia",-2]]},
  {id:"B",label:"Mantenerlo mientras sigas",stance:"keep_number",note:"Mantienes el dorsal durante tu etapa activa.",p:[["professional.careerControl",4],["professional.statusInertia",2]],s:[["professional.environmentStability",-2]]},
  {id:"C",label:"Hablar primero con el joven",stance:"talk_first",note:"Priorizar la conversación directa requiere el actor certificado.",p:[["professional.lockerPower",4],["professional.environmentStability",2]],s:[["professional.careerControl",1]]},
  {id:"D",label:"Proponer cambio la próxima temporada",stance:"defer_change",note:"Aplazas el gesto sin prometer que la próxima temporada exista.",p:[["professional.careerControl",3],["professional.environmentStability",1]],s:[["professional.statusInertia",-1]]}
 ]},
 {id:"EVT_34_MENTOR_001",age:34,family:"team",title:"El joven te pide tus vídeos",body:"Un compañero joven certificado y competidor real te pide revisar movimientos y vídeos. La identidad y relación no se deducen de edad o relationship score.",visible:["Petición privada","actor certificado","relación previa factual"],uncertain:["Puede admirarte","también puede buscar ventaja o seguir una sugerencia del club"],seed:"SEED_SUCCESSOR_ALLIANCE",choices:[
  {id:"A",label:"Ayudar sin reservas",stance:"full_help",note:"Compartes conocimiento con el competidor real.",p:[["professional.lockerPower",5],["professional.roleAdaptability",2]],s:[["professional.roleSecurity",-1]]},
  {id:"B",label:"Ayudar solo en aspectos no competitivos",stance:"limited_help",note:"Ayudas manteniendo límites competitivos.",p:[["professional.lockerPower",3],["professional.careerControl",2]],s:[["professional.environmentStability",-1]]},
  {id:"C",label:"Negarte con respeto",stance:"decline_help",note:"Proteges tu espacio competitivo sin crear conflicto automático.",p:[["professional.careerControl",4]],s:[["professional.lockerPower",-2]]},
  {id:"D",label:"Convertirlo en trabajo conjunto con el staff",stance:"staff_mentoring",note:"Propones una mentoría transparente, sujeta a staff factual.",p:[["professional.institutionalTrust",3],["professional.lockerPower",4]],s:[["professional.careerControl",-1]]}
 ]},
 {id:"EVT_35_DUAL_001",age:35,family:"contract",title:"Te ofrecen ser jugador y enlace",body:"Un club o institución certificada combina una oferta real de jugador con funciones de enlace explícitas. El rol institucional no se infiere de legado.",visible:["Contraparte real","oferta de jugador","salario","funciones de enlace"],uncertain:["El doble rol puede ampliar influencia","también puede convertirte en jugador a medias"],seed:"SEED_PLAYER_LIAISON_ROLE",choices:[
  {id:"A",label:"Aceptar",stance:"accept_dual",note:"Aceptas únicamente si las funciones y contrato son representables por authorities compartidas.",p:[["professional.institutionalPower",5],["professional.careerControl",2]],s:[["professional.roleSecurity",-2]]},
  {id:"B",label:"Jugar sin función institucional",stance:"player_only",note:"Contrapropones separar función y fútbol.",p:[["professional.roleSecurity",3],["professional.careerControl",3]],s:[["professional.institutionalPower",-1]]},
  {id:"C",label:"Pedir rol formal separado al retirarte",stance:"postcareer_request",note:"Registras una petición futura; no crea empleo poscarrera.",p:[["professional.careerControl",4],["professional.institutionalPower",2]],s:[["professional.environmentStability",-1]]},
  {id:"D",label:"Rechazar por conflicto de intereses",stance:"reject_conflict",note:"Rechazas el híbrido sin cerrar carrera.",p:[["professional.careerControl",4]],s:[["professional.institutionalTrust",-2]]}
 ]},
 {id:"EVT_36_CCH_001",age:36,family:"tactical",title:"Un entrenador más joven que tú",body:"La coach chronology acredita un cambio real y un técnico actual con edad factual inferior a la tuya. La escena no inventa entrenador.",visible:["Cambio de entrenador real","identidad certificada","edad real","primer discurso"],uncertain:["Puede verte como recurso","como problema cultural o como aliado"],seed:"SEED_YOUNGER_COACH",choices:[
  {id:"A",label:"Adaptarte sin mencionar edad",stance:"adapt",note:"Tratas la relación como profesional, no generacional.",p:[["professional.roleAdaptability",4],["professional.environmentStability",2]],s:[["professional.careerControl",1]]},
  {id:"B",label:"Hablar pronto sobre carga",stance:"load_talk",note:"Pones datos de carga reales sobre la mesa.",p:[["professional.careerControl",3],["professional.recoveryDebt",-2]],s:[["professional.environmentStability",-1]]},
  {id:"C",label:"Ofrecer liderazgo",stance:"offer_leadership",note:"Ofreces liderazgo sin reclamar poder formal.",p:[["professional.lockerPower",4],["professional.institutionalTrust",2]],s:[["professional.statusInertia",-1]]},
  {id:"D",label:"Esperar a que él defina relación",stance:"wait_coach",note:"Dejas que el técnico real marque primero la relación.",p:[["professional.environmentStability",2]],s:[["professional.careerControl",-1]]}
 ]},
 {id:"EVT_36_PEER_001",age:36,family:"social",title:"El compañero se retira antes que tú",body:"Un peer veterano certificado con relación previa real anuncia su retirada y te pregunta por la tuya. Su decisión nunca cambia tu retirement.status.",visible:["Identidad real","anuncio de retirada factual","relación previa"],uncertain:["No sabes cuánto te influirá su alivio"],seed:"SEED_PEER_RETIREMENT_MIRROR",choices:[
  {id:"A",label:"Reconocer dudas",stance:"admit_doubt",note:"Compartes incertidumbre sin decidir retirada.",p:[["professional.retirementDistance",3],["professional.environmentStability",2]],s:[["professional.motivationReserve",-1]]},
  {id:"B",label:"Decir que aún no",stance:"not_yet",note:"Mantienes la carrera abierta.",p:[["professional.motivationReserve",3],["professional.retirementDistance",-2]],s:[["professional.careerControl",1]]},
  {id:"C",label:"Pedirle que te cuente el proceso",stance:"ask_process",note:"Buscas información personal sin copiar su decisión.",p:[["professional.careerControl",3],["professional.environmentStability",2]],s:[["professional.retirementDistance",1]]},
  {id:"D",label:"Evitar compararte",stance:"avoid_compare",note:"Separas trayectorias y mantienes tu propio horizonte.",p:[["professional.careerControl",4],["professional.retirementDistance",-1]],s:[["professional.environmentStability",-1]]}
 ]}
];

export const STAGED_SHARED_BATCH_4:EventDefinition[]=specs.map(build);
export function isStagedSharedBatch4Eligible(state:GameState,id:string,facts:boolean):boolean{
 const e=STAGED_SHARED_BATCH_4.find(x=>x.id===id);
 return Boolean(e&&facts&&state.retirement.status==="playing"&&state.age>=e.ageWindow[0]);
}
