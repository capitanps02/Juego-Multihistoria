import type { EventDefinition, GameState } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";
import { getSportMatchModelStore, previousOfficialMatch } from "../../../simulation/match-model.js";
import { contractEmploymentStatus } from "../../../simulation/offers.js";

export type StagedSportBatchEventId =
  | "EVT_34_LOAD_001"
  | "EVT_34_BODY_001"
  | "EVT_35_BENCH_001";

function currentClubFixtures(state: GameState) {
  return (getSportMatchModelStore(state)?.fixtures ?? []).filter(row => row.club === state.professional.registrationClub);
}

function hasFactualLoadHistory(state: GameState): boolean {
  const rows=currentClubFixtures(state);
  const appeared=rows.filter(row=>row.player.appeared);
  return appeared.length >= 12 && (state.flags.BIG_CLUB === true || state.professional.matchSelectivity >= 20);
}

function hasDelayedPainContext(state: GameState): boolean {
  const previous=previousOfficialMatch(state);
  if(!previous || !previous.player.appeared) return false;
  return state.professional.recoveryDebt >= 18
    || state.professional.bodyLoad >= 60
    || state.professional.recoveryBetweenMatches <= 52;
}

function hasFiveFactualNonAppearances(state: GameState): boolean {
  if(!["active_contract","expiring"].includes(contractEmploymentStatus(state))) return false;
  const rows=currentClubFixtures(state).slice(-5);
  return rows.length===5 && rows.every(row=>!row.player.appeared && !row.player.injuryUnavailable);
}

export function isStagedSportBatchEligible(state: GameState,eventId:StagedSportBatchEventId):boolean{
  if(state.retirement.status!=="playing") return false;
  switch(eventId){
    case "EVT_34_LOAD_001": return state.age>=34 && hasFactualLoadHistory(state);
    case "EVT_34_BODY_001": return state.age>=34 && hasDelayedPainContext(state);
    case "EVT_35_BENCH_001": return state.age>=35 && hasFiveFactualNonAppearances(state);
  }
}

const EVT_34_LOAD_001=ambiguousEvent({
  id:"EVT_34_LOAD_001",ageWindow:[34,null],phase:"34_plus",family:"medical",
  title:"El plan de 28 partidos",
  body:"El staff propone limitarte a 28-32 titularidades y reservarte para semanas concretas. La propuesta parte de carga e historial de uso reales; no escribe por adelantado ninguna titularidad.",
  visible:["Plan de carga","calendario oficial","historial de uso ya persistido"],
  uncertain:["No sabes si la limitación te alargará","puede hacerte perder ritmo o puesto"],
  gates:[{path:"retirement.status",op:"eq",value:"playing"}],timeWindow:{months:[7,8,9]},weight:12,
  choices:[
    {id:"ACCEPT_28",label:"Aceptar",intentTags:["load","accept"],primaryMessage:"Aceptas el plan y das prioridad a la disponibilidad sostenida.",secondaryMessage:"El plan reduce carga, pero hace más visible que ya no compites por todas las semanas.",primaryEffects:[n("professional.matchSelectivity",8),n("professional.recoveryDebt",-5),n("professional.roleSecurity",-1)],secondaryEffects:[n("professional.matchSelectivity",10),n("professional.recoveryDebt",-3),n("professional.statusInertia",-2)],primarySeedTransitions:[seedCreate("SEED_28_MATCH_PLAN",68,{plan:"accept_28_32"})],secondarySeedTransitions:[seedCreate("SEED_28_MATCH_PLAN",72,{plan:"accept_28_32",role_cost:true})]},
    {id:"NEGOTIATE_35",label:"Negociar 35 si el cuerpo responde",intentTags:["load","negotiate"],primaryMessage:"Aceptas gestionar carga, pero dejas abierta una revisión si la recuperación acompaña.",secondaryMessage:"La revisión conserva margen, aunque puede convertir cada buena semana en discusión sobre el plan.",primaryEffects:[n("professional.matchSelectivity",5),n("professional.careerControl",3),n("professional.recoveryDebt",-3)],secondaryEffects:[n("professional.matchSelectivity",4),n("professional.environmentStability",-2)],primarySeedTransitions:[seedCreate("SEED_28_MATCH_PLAN",64,{plan:"conditional_35"})],secondarySeedTransitions:[seedCreate("SEED_28_MATCH_PLAN",69,{plan:"conditional_35",review_pressure:true})]},
    {id:"NO_LIMIT",label:"Rechazar límite previo",intentTags:["load","competition"],primaryMessage:"Rechazas fijar un techo antes de ver cómo responde el cuerpo.",secondaryMessage:"Mantienes la competencia abierta, pero renuncias al margen preventivo que ofrecía el plan.",primaryEffects:[n("professional.careerControl",4),n("professional.matchSelectivity",-4),n("professional.recoveryDebt",2)],secondaryEffects:[n("professional.recoveryDebt",5),n("professional.bodyLoad",3)],primarySeedTransitions:[seedCreate("SEED_28_MATCH_PLAN",60,{plan:"no_prelimit"})],secondarySeedTransitions:[seedCreate("SEED_28_MATCH_PLAN",66,{plan:"no_prelimit",load_cost:true})]},
    {id:"TRAVEL_MINOR_ONLY",label:"Aceptar solo para viajes/partidos menores",intentTags:["load","travel"],primaryMessage:"Aceptas selectividad, concentrándola en semanas que más castigan el cuerpo.",secondaryMessage:"La solución reduce carga, pero el grupo puede leerla como un privilegio difícil de repartir.",primaryEffects:[n("professional.matchSelectivity",7),n("professional.recoveryDebt",-4),n("professional.environmentStability",-1)],secondaryEffects:[n("professional.matchSelectivity",8),n("professional.environmentStability",-3)],primarySeedTransitions:[seedCreate("SEED_28_MATCH_PLAN",65,{plan:"minor_travel_selectivity"})],secondarySeedTransitions:[seedCreate("SEED_28_MATCH_PLAN",70,{plan:"minor_travel_selectivity",locker_cost:true})]}
  ],
  seedsWrite:["SEED_28_MATCH_PLAN"],tags:["late_career","canonical_34plus","staged_not_registered","sport_authority_consumer"],canonStatus:"verified"
});

const EVT_34_BODY_001=ambiguousEvent({
  id:"EVT_34_BODY_001",ageWindow:[34,null],phase:"34_plus",family:"medical",
  title:"Dolor que tarda dos días",
  body:"Después de un partido real, el dolor aparece 36 horas más tarde. La evaluación de esta propia escena no muestra una lesión visible: la decisión es cómo gestionar una señal incierta, no inventar una lesión.",
  visible:["Partido previo real","sensaciones tardías","pruebas sin lesión visible en esta observación"],
  uncertain:["No sabes si es carga puntual","puede ser el inicio de un patrón crónico"],
  gates:[{path:"retirement.status",op:"eq",value:"playing"}],timeWindow:{months:[9,10,11,12,1,2,3,4]},weight:12,
  choices:[
    {id:"MANAGE_PLAY",label:"Gestionar sin parar",intentTags:["body","manage"],primaryMessage:"Mantienes disponibilidad y ajustas la carga sin afirmar que el dolor sea inocuo.",secondaryMessage:"Sigues jugando, pero la recuperación tardía continúa ocupando espacio en el plan.",primaryEffects:[n("professional.matchSelectivity",3),n("professional.recoveryDebt",-2)],secondaryEffects:[n("professional.recoveryDebt",3),n("professional.bodyLoad",2)],primarySeedTransitions:[seedCreate("SEED_POST_MATCH_PAIN",68,{management:"manage_without_stop",scan:"no_visible_injury"})],secondarySeedTransitions:[seedCreate("SEED_POST_MATCH_PAIN",74,{management:"manage_without_stop",scan:"no_visible_injury",persistent:true})]},
    {id:"LOWER_MONTH",label:"Bajar carga un mes",intentTags:["body","load"],primaryMessage:"Reduces exposición durante un mes sin convertir la señal en diagnóstico.",secondaryMessage:"La carga baja, aunque pierdes continuidad justo cuando el rol sigue en discusión.",primaryEffects:[n("professional.recoveryDebt",-7),n("professional.bodyLoad",-5),n("professional.matchSelectivity",5)],secondaryEffects:[n("professional.recoveryDebt",-4),n("professional.roleSecurity",-2)],primarySeedTransitions:[seedCreate("SEED_POST_MATCH_PAIN",70,{management:"lower_month",scan:"no_visible_injury"})],secondarySeedTransitions:[seedCreate("SEED_POST_MATCH_PAIN",74,{management:"lower_month",scan:"no_visible_injury",role_cost:true})]},
    {id:"STOP_PAIN_FREE",label:"Parar hasta desaparecer",intentTags:["body","stop"],primaryMessage:"Priorizas que el síntoma desaparezca antes de volver a cargar.",secondaryMessage:"El descanso protege margen físico, pero deja abierta la pregunta de cuánto espacio recuperarás.",primaryEffects:[n("professional.recoveryDebt",-9),n("professional.bodyLoad",-7),n("professional.roleSecurity",-3)],secondaryEffects:[n("professional.recoveryDebt",-6),n("professional.statusInertia",-3)],primarySeedTransitions:[seedCreate("SEED_POST_MATCH_PAIN",73,{management:"stop_until_pain_free",scan:"no_visible_injury"})],secondarySeedTransitions:[seedCreate("SEED_POST_MATCH_PAIN",78,{management:"stop_until_pain_free",scan:"no_visible_injury",return_uncertain:true})]},
    {id:"CHANGE_PREP_ROLE",label:"Cambiar preparación y rol",intentTags:["body","reinvention"],primaryMessage:"Usas la señal para cambiar cómo te preparas y qué esfuerzos concentras.",secondaryMessage:"El ajuste puede alargar disponibilidad y también alejarte del rol que conocías.",primaryEffects:[n("professional.roleAdaptability",5),n("professional.matchSelectivity",5),n("professional.recoveryDebt",-4)],secondaryEffects:[n("professional.roleAdaptability",4),n("professional.statusInertia",-3)],primarySeedTransitions:[seedCreate("SEED_POST_MATCH_PAIN",69,{management:"change_preparation_role",scan:"no_visible_injury"})],secondarySeedTransitions:[seedCreate("SEED_POST_MATCH_PAIN",75,{management:"change_preparation_role",scan:"no_visible_injury",identity_cost:true})]}
  ],
  seedsWrite:["SEED_POST_MATCH_PAIN"],tags:["late_career","canonical_34plus","staged_not_registered","sport_authority_consumer","event_establishes_medical_observation"],canonStatus:"verified"
});

const EVT_35_BENCH_001=ambiguousEvent({
  id:"EVT_35_BENCH_001",ageWindow:[35,null],phase:"34_plus",family:"sport",
  title:"Un mes sin jugar y sigues entrenando",
  body:"Cinco partidos oficiales consecutivos han quedado registrados sin participación y sin lesión. El contrato sigue vigente; lo incierto es si el patrón cambiará.",
  visible:["Cinco registros oficiales de no participación","ausencia de baja por lesión en esos partidos","contrato vigente"],
  uncertain:["No sabes si volverás por calendario","puede aparecer una lesión ajena o no volver la oportunidad"],
  gates:[{path:"retirement.status",op:"eq",value:"playing"}],weight:13,
  choices:[
    {id:"WAIT_WINTER",label:"Aguantar hasta invierno",intentTags:["role","patience"],primaryMessage:"Mantienes el contrato y esperas una ventana deportiva real antes de forzar nada.",secondaryMessage:"La paciencia evita una ruptura inmediata, pero consume semanas que no vuelven.",primaryEffects:[n("professional.environmentStability",3),n("professional.motivationReserve",-1)],secondaryEffects:[n("professional.motivationReserve",-4),n("professional.statusInertia",-2)],primarySeedTransitions:[seedCreate("SEED_FIVE_MATCHES_UNUSED",68,{stance:"wait_winter"})],secondarySeedTransitions:[seedCreate("SEED_FIVE_MATCHES_UNUSED",74,{stance:"wait_winter",time_cost:true})]},
    {id:"REQUEST_TERMINATION",label:"Pedir rescisión",intentTags:["role","contract_request"],primaryMessage:"Pides abrir una salida contractual; la escena no rescinde ni modifica el contrato por sí sola.",secondaryMessage:"La petición deja claro que el rol ya no te sirve, aunque el club puede no aceptarla.",primaryEffects:[n("professional.careerControl",4),n("professional.environmentStability",-3)],secondaryEffects:[n("professional.careerControl",2),n("professional.environmentStability",-5)],primarySeedTransitions:[seedCreate("SEED_FIVE_MATCHES_UNUSED",70,{stance:"request_termination",contract_mutated:false})],secondarySeedTransitions:[seedCreate("SEED_FIVE_MATCHES_UNUSED",75,{stance:"request_termination",contract_mutated:false,request_rejected_possible:true})]},
    {id:"PRESS_MINUTES",label:"Presionar por minutos",intentTags:["role","pressure"],primaryMessage:"Pones el problema deportivo sobre la mesa sin fabricar una titularidad futura.",secondaryMessage:"La presión puede acelerar una conversación y también tensar la relación con el staff.",primaryEffects:[n("professional.careerControl",3),n("professional.environmentStability",-2)],secondaryEffects:[n("professional.environmentStability",-4),n("professional.motivationReserve",-1)],primarySeedTransitions:[seedCreate("SEED_FIVE_MATCHES_UNUSED",66,{stance:"press_minutes"})],secondarySeedTransitions:[seedCreate("SEED_FIVE_MATCHES_UNUSED",71,{stance:"press_minutes",staff_friction:true})]},
    {id:"MENTOR_WAIT",label:"Convertirte en mentor activo y esperar",intentTags:["role","mentor"],primaryMessage:"Usas el tiempo fuera para aumentar valor de vestuario sin dar por perdido el campo.",secondaryMessage:"El club aprecia el rol, aunque esa utilidad puede hacer más cómodo mantenerte fuera.",primaryEffects:[n("professional.lockerPower",5),n("professional.environmentStability",2),n("professional.motivationReserve",1)],secondaryEffects:[n("professional.lockerPower",4),n("professional.roleSecurity",-2)],primarySeedTransitions:[seedCreate("SEED_FIVE_MATCHES_UNUSED",67,{stance:"mentor_wait"})],secondarySeedTransitions:[seedCreate("SEED_FIVE_MATCHES_UNUSED",73,{stance:"mentor_wait",role_lock_in:true})]}
  ],
  seedsWrite:["SEED_FIVE_MATCHES_UNUSED"],tags:["late_career","canonical_34plus","staged_not_registered","sport_authority_consumer"],canonStatus:"verified"
});

export const STAGED_PRINCIPAL_SPORT_BATCH:EventDefinition[]=[EVT_34_LOAD_001,EVT_34_BODY_001,EVT_35_BENCH_001];
export function eligibleStagedSportBatch(state:GameState):EventDefinition[]{return STAGED_PRINCIPAL_SPORT_BATCH.filter(event=>isStagedSportBatchEligible(state,event.id as StagedSportBatchEventId));}
