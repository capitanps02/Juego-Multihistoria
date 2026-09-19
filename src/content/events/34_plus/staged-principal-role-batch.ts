import type { EventDefinition, GameState } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";
import { getSportMatchModelStore } from "../../../simulation/match-model.js";

export type StagedRoleBatchEventId = "EVT_34_ROLE_001" | "EVT_34_FAN_001";

function currentClubRows(state: GameState) {
  return (getSportMatchModelStore(state)?.fixtures ?? []).filter(row => row.club === state.professional.registrationClub);
}

function consecutiveBenchStarts(state: GameState, count: number): boolean {
  const rows=currentClubRows(state).slice(-count);
  return rows.length===count && rows.every(row=>row.player.calledUp && row.player.onBench && !row.player.started);
}

export function isStagedRoleBatchEligible(state:GameState,eventId:StagedRoleBatchEventId):boolean{
  if(state.retirement.status!=="playing" || state.age<34) return false;
  if(eventId==="EVT_34_ROLE_001") return consecutiveBenchStarts(state,2) && state.professional.legacyCapital>=45;
  return consecutiveBenchStarts(state,3) && state.professional.legacyCapital>=55;
}

const EVT_34_ROLE_001=ambiguousEvent({
  id:"EVT_34_ROLE_001",ageWindow:[34,null],phase:"34_plus",family:"sport",
  title:"Dos suplencias y una ovación",
  body:"Empiezas dos partidos seguidos en el banquillo. Mientras calientas, la afición te ovaciona. El banquillo viene de historial deportivo real; la ovación es el hecho público que esta escena canónica materializa.",
  visible:["Dos convocatorias consecutivas empezando en el banquillo","explicación del técnico","ovación del estadio en esta escena"],
  uncertain:["No sabes si el técnico te reserva","puede estar sacándote del núcleo"],
  gates:[{path:"retirement.status",op:"eq",value:"playing"}],weight:14,
  choices:[
    {id:"MEETING_NOW",label:"Pedir reunión ya",intentTags:["role","clarity"],primaryMessage:"Pides una explicación antes de que dos partidos se conviertan en una jerarquía permanente.",secondaryMessage:"La conversación aclara posiciones, pero el staff percibe urgencia por recuperar estatus.",primaryEffects:[n("professional.careerControl",4),n("professional.environmentStability",-1)],secondaryEffects:[n("professional.careerControl",2),n("professional.environmentStability",-3)],primarySeedTransitions:[seedCreate("SEED_FINAL_ROLE_ACCEPTANCE",66,{stance:"meeting_now"})],secondarySeedTransitions:[seedCreate("SEED_FINAL_ROLE_ACCEPTANCE",71,{stance:"meeting_now",staff_pressure:true})]},
    {id:"WAIT_FIVE",label:"Esperar cinco partidos",intentTags:["role","patience"],primaryMessage:"Decides observar si existe un patrón antes de convertirlo en conflicto.",secondaryMessage:"La paciencia compra información, pero también puede consolidar el nuevo reparto.",primaryEffects:[n("professional.environmentStability",3),n("professional.statusInertia",1)],secondaryEffects:[n("professional.statusInertia",-3),n("professional.motivationReserve",-2)],primarySeedTransitions:[seedCreate("SEED_FINAL_ROLE_ACCEPTANCE",62,{stance:"wait_five"})],secondarySeedTransitions:[seedCreate("SEED_FINAL_ROLE_ACCEPTANCE",68,{stance:"wait_five",role_may_settle:true})]},
    {id:"ACCEPT_IMPACT",label:"Aceptar y centrarse en impacto",intentTags:["role","adaptation"],primaryMessage:"Aceptas que tu valor puede medirse de otra forma sin renunciar a competir.",secondaryMessage:"La adaptación reduce fricción, pero el club puede leerla como aceptación definitiva del rol.",primaryEffects:[n("professional.roleAdaptability",5),n("professional.environmentStability",3),n("professional.motivationReserve",1)],secondaryEffects:[n("professional.roleAdaptability",4),n("professional.roleSecurity",-2)],primarySeedTransitions:[seedCreate("SEED_FINAL_ROLE_ACCEPTANCE",65,{stance:"accept_impact"})],secondarySeedTransitions:[seedCreate("SEED_FINAL_ROLE_ACCEPTANCE",70,{stance:"accept_impact",role_lock_in:true})]},
    {id:"PRESS_HINT",label:"Dejar caer en prensa que necesitas jugar",intentTags:["role","press"],primaryMessage:"Trasladas la presión al espacio público sin inventar una promesa de minutos.",secondaryMessage:"La grada amplifica el mensaje y el entrenador siente que la discusión ha salido del vestuario.",primaryEffects:[n("professional.careerControl",3),n("reputation.mediaHeat",3),n("professional.environmentStability",-3)],secondaryEffects:[n("reputation.mediaHeat",6),n("professional.environmentStability",-5)],primarySeedTransitions:[seedCreate("SEED_FINAL_ROLE_ACCEPTANCE",68,{stance:"press_hint"})],secondarySeedTransitions:[seedCreate("SEED_FINAL_ROLE_ACCEPTANCE",74,{stance:"press_hint",public_pressure:true})]}
  ],
  seedsWrite:["SEED_FINAL_ROLE_ACCEPTANCE"],tags:["late_career","canonical_34plus","staged_not_registered","sport_authority_consumer","event_establishes_crowd_ovation"],canonStatus:"verified"
});

const EVT_34_FAN_001=ambiguousEvent({
  id:"EVT_34_FAN_001",ageWindow:[34,null],phase:"34_plus",family:"press",
  title:"La grada pide que empieces",
  body:"Después de varias suplencias reales, un sector canta tu nombre antes de los partidos. La reacción de grada ocurre en esta escena; no se deduce de mediaHeat ni de una puntuación de rol.",
  visible:["Historial reciente de suplencias","cánticos de un sector","pregunta de prensa"],
  uncertain:["No sabes si alimentar la presión te dará minutos","puede volver tóxica tu presencia para el técnico"],
  gates:[{path:"retirement.status",op:"eq",value:"playing"}],weight:10,
  choices:[
    {id:"TEAM_SUPPORT",label:"Pedir públicamente que apoyen al equipo",intentTags:["fans","team"],primaryMessage:"Intentas desactivar la presión personal sin rechazar el cariño de la grada.",secondaryMessage:"El gesto ayuda al grupo, aunque algunos lo leen como resignación al nuevo rol.",primaryEffects:[n("professional.environmentStability",4),n("professional.institutionalTrust",3),n("professional.publicMyth",1)],secondaryEffects:[n("professional.environmentStability",2),n("professional.statusInertia",-1)],primarySeedTransitions:[seedCreate("SEED_FAREWELL_CROWD_POWER",62,{stance:"team_support"})],secondarySeedTransitions:[seedCreate("SEED_FAREWELL_CROWD_POWER",67,{stance:"team_support",read_as_resignation:true})]},
    {id:"THANK_ONLY",label:"Agradecer sin frenar",intentTags:["fans","power"],primaryMessage:"Agradeces el apoyo y dejas que la grada mantenga su propia presión.",secondaryMessage:"El vínculo se fortalece, pero el staff percibe una fuerza externa que ya no controla.",primaryEffects:[n("professional.publicMyth",4),n("professional.institutionalPower",2)],secondaryEffects:[n("professional.publicMyth",5),n("professional.environmentStability",-3)],primarySeedTransitions:[seedCreate("SEED_FAREWELL_CROWD_POWER",68,{stance:"thank_only"})],secondarySeedTransitions:[seedCreate("SEED_FAREWELL_CROWD_POWER",74,{stance:"thank_only",manager_pressure:true})]},
    {id:"NO_COMMENT",label:"No comentar",intentTags:["fans","silence"],primaryMessage:"No conviertes los cánticos en una campaña personal.",secondaryMessage:"El silencio evita una frase nueva, pero deja a otros interpretar tu postura.",primaryEffects:[n("professional.careerControl",2),n("reputation.mediaHeat",-1)],secondaryEffects:[n("professional.publicPolarization",2)],primarySeedTransitions:[seedCreate("SEED_FAREWELL_CROWD_POWER",58,{stance:"no_comment"})],secondarySeedTransitions:[seedCreate("SEED_FAREWELL_CROWD_POWER",63,{stance:"no_comment",interpretation_open:true})]},
    {id:"ALIGN_COACH",label:"Hablar con el técnico sobre cómo manejarlo juntos",intentTags:["fans","coach","alignment"],primaryMessage:"Intentas que la reacción de la grada no se convierta en una disputa entre jugador y técnico.",secondaryMessage:"La conversación baja tensión, aunque confirma al staff que el tema ya tiene peso real.",primaryEffects:[n("professional.environmentStability",5),n("professional.institutionalTrust",3),n("professional.careerControl",2)],secondaryEffects:[n("professional.environmentStability",2),n("professional.institutionalTrust",1)],primarySeedTransitions:[seedCreate("SEED_FAREWELL_CROWD_POWER",64,{stance:"align_coach"})],secondarySeedTransitions:[seedCreate("SEED_FAREWELL_CROWD_POWER",69,{stance:"align_coach",issue_acknowledged:true})]}
  ],
  seedsWrite:["SEED_FAREWELL_CROWD_POWER"],tags:["late_career","canonical_34plus","staged_not_registered","sport_authority_consumer","event_establishes_crowd_chant"],canonStatus:"verified"
});

export const STAGED_PRINCIPAL_ROLE_BATCH:EventDefinition[]=[EVT_34_ROLE_001,EVT_34_FAN_001];
export function eligibleStagedRoleBatch(state:GameState):EventDefinition[]{return STAGED_PRINCIPAL_ROLE_BATCH.filter(e=>isStagedRoleBatchEligible(state,e.id as StagedRoleBatchEventId));}
