import type { EventDefinition, EventFamily, GameState } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

type Delta = readonly [string, number];
type ChoiceSpec = { id:string; label:string; stance:string; primary:readonly Delta[]; secondary:readonly Delta[]; note:string };
type Spec = {
  id:string; age:number; family:EventFamily; title:string; body:string; visible:string[]; uncertain:string[];
  seeds:string[]; choices:ChoiceSpec[];
};

function build(spec:Spec):EventDefinition{
  return ambiguousEvent({
    id:spec.id,ageWindow:[spec.age,null],phase:"34_plus",family:spec.family,title:spec.title,body:spec.body,
    visible:spec.visible,uncertain:spec.uncertain,gates:[{path:"retirement.status",op:"eq",value:"playing"}],weight:10,
    choices:spec.choices.map(choice=>({
      id:choice.id,label:choice.label,intentTags:["late_career","market"],
      primaryMessage:choice.note,
      secondaryMessage:`${choice.note} El coste secundario queda registrado sin fabricar oferta, fichaje, minutos ni retirada.`,
      primaryEffects:choice.primary.map(([path,delta])=>n(path,delta)),
      secondaryEffects:choice.secondary.map(([path,delta])=>n(path,delta)),
      primarySeedTransitions:spec.seeds.map(seed=>seedCreate(seed,66,{stance:choice.stance})),
      secondarySeedTransitions:spec.seeds.map(seed=>seedCreate(seed,72,{stance:choice.stance,secondary_cost:true}))
    })),
    seedsWrite:spec.seeds,
    tags:["canonical_34plus","staged_not_registered","awaiting_external_fact","market_authority_consumer"],
    canonStatus:"verified"
  });
}

const specs:Spec[]=[
 {
  id:"EVT_35_FAREWELL_001",age:35,family:"contract",title:"El club ofrece homenaje... si te vas",
  body:"Tu club propone una despedida enorme si no renuevas y una continuidad limitada si sigues. Salir del club nunca equivale a retirar la carrera.",
  visible:["Propuesta de homenaje","contexto contractual real","alternativa de renovación o salida"],uncertain:["No sabes si continuar hará perder un cierre perfecto","no sabes si quieres un cierre diseñado por otros"],
  seeds:["SEED_FAREWELL_AS_LEVERAGE","SEED_PUBLIC_MYTH_FINAL"],
  choices:[
   {id:"A",label:"Aceptar despedida y salir",stance:"farewell_exit",note:"Aceptas el cierre institucional del club, no el cierre de carrera.",primary:[["professional.publicMyth",4],["professional.institutionalTrust",3]],secondary:[["professional.motivationReserve",-2],["professional.environmentStability",-2]]},
   {id:"B",label:"Renovar y renunciar al timing perfecto",stance:"renew_continue",note:"Priorizas seguir jugando sobre el momento ceremonial.",primary:[["professional.motivationReserve",4],["professional.careerControl",2]],secondary:[["professional.publicMyth",-1]]},
   {id:"C",label:"Salir sin gran ceremonia",stance:"quiet_exit",note:"Separas la salida contractual del relato de despedida.",primary:[["professional.careerControl",5],["reputation.mediaHeat",-2]],secondary:[["professional.institutionalTrust",-2]]},
   {id:"D",label:"Pedir homenaje independientemente del futuro",stance:"separate_homage",note:"Pides que reconocimiento y contrato no funcionen como palanca mutua.",primary:[["professional.institutionalPower",4],["professional.careerControl",3]],secondary:[["professional.environmentStability",-2]]}
  ]
 },
 {
  id:"EVT_35_AGT_001",age:35,family:"agent",title:"Sin agente por primera vez",
  body:"Una negociación real parece suficientemente sencilla para plantear otra estructura de representación. Ninguna opción inventa abogado, agente sustituto ni firma un contrato.",
  visible:["Negociación real","honorarios","estado certificado de representación"],uncertain:["No sabes qué conversaciones invisibles perderías","tu agente tiene incentivos al defender su utilidad"],
  seeds:["SEED_FINAL_AGENT_STRUCTURE"],
  choices:[
   {id:"A",label:"Negociar tú con abogado",stance:"self_plus_lawyer",note:"Pides una estructura de negociación directa con apoyo legal no persistente.",primary:[["professional.careerControl",5],["professional.contractPower",2]],secondary:[["professional.environmentStability",-2]]},
   {id:"B",label:"Mantener agente",stance:"keep_agent",note:"Mantienes la representación certificada actual.",primary:[["professional.environmentStability",4],["professional.careerControl",-1]],secondary:[["professional.contractPower",-1]]},
   {id:"C",label:"Pagar tarifa fija sin comisión",stance:"fixed_fee",note:"Propones otra estructura económica sin inventar una identidad nueva.",primary:[["professional.contractPower",4],["professional.careerControl",3]],secondary:[["professional.environmentStability",-1]]},
   {id:"D",label:"Cambiar de agente para el cierre",stance:"change_agent_request",note:"Solicitas un cambio; una nueva identidad persistente necesita authority propia.",primary:[["professional.careerControl",4],["professional.environmentStability",-3]],secondary:[["professional.contractPower",-1]]}
  ]
 },
 {
  id:"EVT_35_JAN_001",age:35,family:"market",title:"Una oferta en enero",
  body:"Un club con una oferta formal de invierno te ofrece más participación. El contexto de ambos clubes debe ser factual y ninguna elección ejecuta el movimiento directamente.",
  visible:["Oferta real","situación competitiva actual","ventana de enero"],uncertain:["No sabes cuánto durará la necesidad del nuevo club","tu club actual puede necesitarte después"],
  seeds:["SEED_LAST_JANUARY_MOVE"],
  choices:[
   {id:"A",label:"Irte",stance:"accept_move",note:"Aceptas la oferta mediante market authority.",primary:[["professional.careerControl",3],["professional.motivationReserve",3]],secondary:[["professional.environmentStability",-3]]},
   {id:"B",label:"Quedarte",stance:"stay",note:"Rechazas la oferta y mantienes el proyecto actual.",primary:[["professional.environmentStability",4],["professional.institutionalTrust",2]],secondary:[["professional.motivationReserve",-2]]},
   {id:"C",label:"Pedir cesión corta",stance:"short_loan_counter",note:"Contrapropones una cesión solo si la authority puede representarla.",primary:[["professional.careerControl",4],["professional.contractPower",2]],secondary:[["professional.environmentStability",-2]]},
   {id:"D",label:"Negociar salida solo si juegas menos en dos semanas",stance:"defer_usage_condition",note:"Difieres la decisión a un hecho de uso futuro; no fabricas una garantía.",primary:[["professional.careerControl",3]],secondary:[["professional.motivationReserve",-1]]}
  ]
 },
 {
  id:"EVT_35_HOME_001",age:35,family:"market",title:"El ascenso de Valdoria",
  body:"UDV vive un éxito deportivo factual sin ti justo cuando tu contrato se acerca al final. La escena puede abrir contacto, pero nunca fabricar una oferta.",
  visible:["Resultado histórico real de UDV","mensajes del entorno","contexto contractual actual"],uncertain:["No sabes si ahora necesitan menos tu nombre","el nuevo nivel puede hacerte más útil"],
  seeds:["SEED_HOME_SUCCESS_WITHOUT_YOU"],
  choices:[
   {id:"A",label:"Llamar tú",stance:"call_udv",note:"Abres contacto; no existe oferta hasta que market authority la cree.",primary:[["professional.careerControl",4],["professional.homePull",4]],secondary:[["professional.environmentStability",-1]]},
   {id:"B",label:"Esperar a que llamen",stance:"wait_call",note:"Mantienes la puerta abierta sin alterar el mercado.",primary:[["professional.homePull",2]],secondary:[["professional.motivationReserve",-1]]},
   {id:"C",label:"No mezclar emoción con mercado",stance:"separate_emotion",note:"No conviertes el éxito de UDV en una decisión contractual automática.",primary:[["professional.careerControl",5],["professional.homePull",-2]],secondary:[["professional.environmentStability",1]]},
   {id:"D",label:"Felicitar públicamente dejando la puerta abierta",stance:"public_door",note:"Haces una señal pública, no una oferta ni una firma.",primary:[["professional.publicMyth",2],["professional.homePull",3]],secondary:[["reputation.mediaHeat",2]]}
  ]
 },
 {
  id:"EVT_36_CON_001",age:36,family:"contract",title:"Renovar después de una gran temporada",
  body:"Después de una temporada factual mejor de lo esperado y con evidencia corporal sostenible, el club presenta una oferta multianual real.",
  visible:["Rendimiento reciente acreditado","evidencia corporal","oferta real"],uncertain:["No sabes si encontraste un nuevo equilibrio","la temporada puede ser difícil de repetir"],
  seeds:["SEED_AGE36_LONG_DEAL"],
  choices:[
   {id:"A",label:"Dos años",stance:"two_years",note:"Aceptas la oferta multianual por authority contractual.",primary:[["professional.environmentStability",5],["professional.contractPower",1]],secondary:[["professional.careerControl",-2]]},
   {id:"B",label:"Uno",stance:"one_year_counter",note:"Contrapropones un año para conservar flexibilidad.",primary:[["professional.careerControl",4],["professional.contractPower",3]],secondary:[["professional.environmentStability",-1]]},
   {id:"C",label:"Esperar mercado",stance:"wait_market",note:"Difieres sin fabricar alternativas.",primary:[["professional.careerControl",4]],secondary:[["professional.contractPower",-2],["professional.environmentStability",-2]]},
   {id:"D",label:"Renovar con salida bilateral",stance:"bilateral_exit",note:"Solo firmas si la salida bilateral está representada por authority.",primary:[["professional.contractPower",4],["professional.careerControl",3]],secondary:[["professional.environmentStability",-1]]}
  ]
 },
 {
  id:"EVT_36_LOWER_001",age:36,family:"market",title:"Un año en una liga menor",
  body:"Existe una oferta formal de una categoría inferior con contexto de rol real. Elegir dejar de competir arriba no equivale a retirarse.",
  visible:["Nivel real","salario","contexto de rol"],uncertain:["No sabes si disfrutarás competir más abajo","un fútbol distinto puede cambiar la carga corporal"],
  seeds:["SEED_DROP_LEVEL_TO_PLAY"],
  choices:[
   {id:"A",label:"Aceptar",stance:"accept_lower",note:"Aceptas la oferta inferior mediante market authority.",primary:[["professional.roleSecurity",4],["professional.motivationReserve",3]],secondary:[["professional.publicMyth",-2]]},
   {id:"B",label:"Preferir retirarte en nivel alto",stance:"retirement_intent",note:"Registras intención para Agent 9; A8 no cambia retirement.status.",primary:[["professional.careerControl",3],["professional.retirementDistance",5]],secondary:[["professional.motivationReserve",-2]]},
   {id:"C",label:"Buscar UDV",stance:"seek_udv",note:"Abres interés hacia UDV sin fabricar oferta.",primary:[["professional.homePull",5],["professional.careerControl",2]],secondary:[["professional.environmentStability",-1]]},
   {id:"D",label:"Esperar otro mercado",stance:"wait_market",note:"Mantienes búsqueda abierta.",primary:[["professional.careerControl",3]],secondary:[["professional.motivationReserve",-2]]}
  ]
 },
 {
  id:"EVT_37_SHORT_001",age:37,family:"contract",title:"Contrato de tres meses",
  body:"Con estado de agente libre factual, un club presenta una oferta real de tres meses. Cualquier opción automática requiere términos representables.",
  visible:["Estado unattached real","duración","rol","calendario"],uncertain:["No sabes si será escaparate","puede acabar siendo un simple parche"],
  seeds:["SEED_THREE_MONTH_CONTRACT"],
  choices:[
   {id:"A",label:"Aceptar",stance:"accept_three_months",note:"Aceptas el contrato corto mediante market authority.",primary:[["professional.motivationReserve",4],["professional.careerControl",1]],secondary:[["professional.environmentStability",-2]]},
   {id:"B",label:"Rechazar por falta de proyecto",stance:"reject_short",note:"Rechazas la oferta sin decidir retirada.",primary:[["professional.careerControl",4]],secondary:[["professional.motivationReserve",-2]]},
   {id:"C",label:"Pedir opción automática",stance:"automatic_option_counter",note:"Contrapropones opción automática solo si puede persistirse.",primary:[["professional.contractPower",4],["professional.careerControl",3]],secondary:[["professional.environmentStability",-1]]},
   {id:"D",label:"Aceptar sin promesas y decidir después",stance:"accept_no_promise",note:"Aceptas los tres meses sin añadir garantías ficticias.",primary:[["professional.motivationReserve",3],["professional.careerControl",2]],secondary:[["professional.environmentStability",-2]]}
  ]
 },
 {
  id:"EVT_37_HOME_001",age:37,family:"market",title:"Valdoria te ofrece diez partidos",
  body:"UDV presenta una oferta corta de regreso con papel parcial. La promesa deportiva debe venir de authority y no se convierte en titularidades futuras.",
  visible:["Oferta UDV real","contexto de rol parcial"],uncertain:["No sabes si pocos minutos en casa pesarán más que seguir fuera"],
  seeds:["SEED_TEN_MATCH_HOME_RETURN"],
  choices:[
   {id:"A",label:"Volver aunque sea poco",stance:"return_partial",note:"Aceptas la oferta de regreso mediante market authority.",primary:[["professional.homePull",6],["professional.environmentStability",4]],secondary:[["professional.roleSecurity",-2]]},
   {id:"B",label:"Pedir un año completo",stance:"counter_full_year",note:"Contrapropones duración sin escribirla directamente.",primary:[["professional.contractPower",4],["professional.careerControl",3]],secondary:[["professional.environmentStability",-1]]},
   {id:"C",label:"Seguir fuera",stance:"stay_out",note:"Rechazas UDV sin cerrar la carrera.",primary:[["professional.careerControl",4],["professional.homePull",-2]],secondary:[["professional.motivationReserve",-1]]},
   {id:"D",label:"Volver solo si el equipo lo necesita deportivamente",stance:"sport_need_condition",note:"La condición solo puede firmarse si existe representación factual de necesidad/rol.",primary:[["professional.careerControl",4],["professional.homePull",3]],secondary:[["professional.environmentStability",-1]]}
  ]
 },
 {
  id:"EVT_38_RICH_001",age:38,family:"market",title:"Una última oferta enorme",
  body:"Existe una oferta formal de un año y valor excepcional. Ni reputación ni deseo de parar pueden crearla; la decisión terminal, si aparece, pertenece a Agent 9.",
  visible:["Dinero real","duración","rol de embajador solo si está representado"],uncertain:["No sabes si te quieren como futbolista o como nombre","no sabes cuánto disfrutarás el año"],
  seeds:["SEED_LAST_HUGE_OFFER"],
  choices:[
   {id:"A",label:"Aceptar",stance:"accept_huge",note:"Aceptas la oferta formal mediante market authority.",primary:[["professional.moneyComfort",5],["professional.motivationReserve",2]],secondary:[["professional.environmentStability",-2]]},
   {id:"B",label:"Rechazar y retirarte",stance:"reject_retirement_intent",note:"Rechazas y entregas intención terminal a Agent 9; A8 no retira.",primary:[["professional.careerControl",4],["professional.retirementDistance",6]],secondary:[["professional.motivationReserve",-2]]},
   {id:"C",label:"Pedir calendario/rol deportivo mínimo",stance:"sporting_counter",note:"Contrapropones solo si el contexto rico de oferta puede representar ese mínimo.",primary:[["professional.contractPower",4],["professional.careerControl",3]],secondary:[["professional.environmentStability",-1]]},
   {id:"D",label:"Aceptar solo seis meses",stance:"six_month_counter",note:"Contrapropones seis meses mediante market authority.",primary:[["professional.careerControl",3],["professional.contractPower",2]],secondary:[["professional.environmentStability",-1]]}
  ]
 },
 {
  id:"EVT_38_MARKET_001",age:38,family:"market",title:"Nadie llama en julio",
  body:"Con estado unattached real, pasan semanas sin una oferta profesional aceptable según el historial formal. marketHeat y monthsRemaining nunca prueban este silencio.",
  visible:["Estado laboral real","semanas transcurridas","historial de ofertas/contactos","condiciones de búsqueda"],uncertain:["Una lesión en agosto puede reabrir mercado","también puede haberse terminado"],
  seeds:["SEED_MARKET_SILENCE_END","SEED_MARKET_FLOOR_FINAL"],
  choices:[
   {id:"A",label:"Bajar salario",stance:"lower_salary",note:"Cambias postura de búsqueda; no firmas ni mutas salario contractual actual.",primary:[["professional.careerControl",3],["professional.contractPower",-2]],secondary:[["professional.motivationReserve",-1]]},
   {id:"B",label:"Bajar nivel",stance:"lower_level",note:"Amplías destinos aceptables; no cambias tier directamente.",primary:[["professional.careerControl",3],["professional.roleSecurity",2]],secondary:[["professional.publicMyth",-1]]},
   {id:"C",label:"Esperar hasta septiembre",stance:"wait_september",note:"Mantienes condiciones y dejas pasar tiempo real.",primary:[["professional.careerControl",2]],secondary:[["professional.motivationReserve",-3]]},
   {id:"D",label:"Retirarte",stance:"retirement_intent",note:"Entregas intención a Agent 9; no hay transición terminal en A8.",primary:[["professional.retirementDistance",7],["professional.careerControl",3]],secondary:[["professional.motivationReserve",-2]]},
   {id:"E",label:"Llamar tú a UDV/club concreto",stance:"direct_contact",note:"Abres un contacto; no aparece oferta hasta que market authority la produzca.",primary:[["professional.careerControl",5],["professional.homePull",3]],secondary:[["professional.environmentStability",-1]]}
  ]
 }
];

export const STAGED_MARKET_BATCH_2:EventDefinition[]=specs.map(build);

export function isStagedMarketBatch2Eligible(state:GameState,id:string,authoritativeFactsSatisfied:boolean):boolean{
 const event=STAGED_MARKET_BATCH_2.find(row=>row.id===id);
 return Boolean(event && authoritativeFactsSatisfied && state.retirement.status==="playing" && state.age>=event.ageWindow[0]);
}
