import type { EventDefinition, GameState } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";
import { projectSeedMemory } from "../../../narrative/seed-memory.js";

export type StagedWaveAEventId =
  | "EVT_35_FAM_001"
  | "EVT_35_BODY_001"
  | "EVT_35_IMG_001"
  | "EVT_36_MED_001";

function scopedMemory(state: GameState, seedId: string): boolean {
  const memory = projectSeedMemory(state, seedId);
  return memory.historicalExists && memory.scopeValid;
}

function accumulatedBodyEvidence(state: GameState): boolean {
  const longInjuries = Number(state.world.maturityLongInjuryCount ?? 0);
  const injuries = Number(state.world.maturityInjuryCount ?? 0);
  return state.professional.recoveryDebt >= 20
    || state.professional.bodyLoad >= 62
    || state.professional.recoveryBetweenMatches <= 48
    || state.professional.availability <= 68
    || longInjuries > 0
    || injuries >= 2;
}

function qualifyingImageContext(state: GameState): boolean {
  return state.professional.commercialPower >= 48
    || state.professional.publicMyth >= 50
    || Number(state.reputation.mediaHeat ?? 0) >= 45;
}

export function isStagedWaveAEligible(state: GameState, eventId: StagedWaveAEventId): boolean {
  if (state.retirement.status !== "playing") return false;
  switch (eventId) {
    case "EVT_35_FAM_001":
      return state.age >= 35
        && scopedMemory(state, "SEED_RELOCATION_LIMIT")
        && scopedMemory(state, "SEED_FAMILY_ANCHOR");
    case "EVT_35_BODY_001":
      return state.age >= 35 && accumulatedBodyEvidence(state);
    case "EVT_35_IMG_001":
      return state.age >= 35 && qualifyingImageContext(state);
    case "EVT_36_MED_001":
      return state.age >= 36
        && (scopedMemory(state, "SEED_MEDICAL_AUTHORITY") || accumulatedBodyEvidence(state));
  }
}

const EVT_35_FAM_001 = ambiguousEvent({
  id: "EVT_35_FAM_001", ageWindow: [35, null], phase: "34_plus", family: "family",
  title: "Tu familia quiere una ciudad",
  body: "Después de años adaptando la vida al fútbol, en casa te piden que la próxima decisión también tenga una ciudad estable detrás. La carrera sigue abierta, pero otra mudanza ya no afecta solo a tu vestuario.",
  visible: ["Conoces el límite de mudanzas construido por tu propia historia familiar.", "La conversación usa un contexto familiar ya establecido y no inventa pareja ni hijos."],
  uncertain: ["No sabes si priorizar estabilidad cerrará la mejor oportunidad deportiva.", "Tampoco sabes si pedir un último año de libertad será realmente el último."],
  gates: [{ path: "retirement.status", op: "eq", value: "playing" }], timeWindow: { months: [11,12,1,2] }, weight: 12,
  choices: [
    { id:"STABLE_CITY", label:"Priorizar una ciudad estable", intentTags:["family","stability"], primaryMessage:"La siguiente decisión tendrá que caber en una vida más estable.", secondaryMessage:"La estabilidad baja el ruido familiar, pero reduce destinos.", primaryEffects:[n("professional.environmentStability",6),n("professional.relocationTolerance",-5),n("professional.careerControl",2)], secondaryEffects:[n("professional.environmentStability",4),n("professional.relocationTolerance",-7)], primarySeedTransitions:[seedCreate("SEED_FINAL_RELOCATION_TRADEOFF",64,{stance:"stable_city"})], secondarySeedTransitions:[seedCreate("SEED_FINAL_RELOCATION_TRADEOFF",70,{stance:"stable_city",cost:"fewer_destinations"})] },
    { id:"ONE_LAST_YEAR", label:"Pedir un último año de libertad geográfica", intentTags:["family","career"], primaryMessage:"Consigues margen para una última decisión abierta.", secondaryMessage:"El acuerdo aplaza el conflicto y hace que la siguiente mudanza pese más.", primaryEffects:[n("professional.careerControl",5),n("professional.relocationTolerance",3),n("professional.environmentStability",-2)], secondaryEffects:[n("professional.careerControl",3),n("professional.environmentStability",-4)], primarySeedTransitions:[seedCreate("SEED_FINAL_RELOCATION_TRADEOFF",62,{stance:"one_last_year"})], secondarySeedTransitions:[seedCreate("SEED_FINAL_RELOCATION_TRADEOFF",68,{stance:"one_last_year",deferred_cost:true})] },
    { id:"TEMPORARY_SPLIT", label:"Vivir separados temporalmente", intentTags:["family","distance"], primaryMessage:"Proteges la oportunidad deportiva sin presentar la distancia como gratuita.", secondaryMessage:"La logística funciona, pero el coste compite con el fútbol.", primaryEffects:[n("professional.careerControl",3),n("professional.moneyComfort",-3),n("professional.environmentStability",-3)], secondaryEffects:[n("professional.moneyComfort",-5),n("professional.environmentStability",-5),n("professional.motivationReserve",-2)], primarySeedTransitions:[seedCreate("SEED_FINAL_RELOCATION_TRADEOFF",66,{stance:"temporary_split"})], secondarySeedTransitions:[seedCreate("SEED_FINAL_RELOCATION_TRADEOFF",72,{stance:"temporary_split",strain:true})] },
    { id:"FOOTBALL_ONLY", label:"Elegir solo por fútbol", intentTags:["career","football"], primaryMessage:"Mantienes la decisión deportiva completamente abierta.", secondaryMessage:"La libertad deportiva aumenta, pero el entorno deja de sentirse parte de la decisión.", primaryEffects:[n("professional.careerControl",6),n("professional.environmentStability",-5),n("professional.relocationTolerance",-6)], secondaryEffects:[n("professional.careerControl",4),n("professional.environmentStability",-7),n("professional.motivationReserve",-2)], primarySeedTransitions:[seedCreate("SEED_FINAL_RELOCATION_TRADEOFF",70,{stance:"football_only"})], secondarySeedTransitions:[seedCreate("SEED_FINAL_RELOCATION_TRADEOFF",76,{stance:"football_only",family_cost:true})] }
  ],
  seedsRead:["SEED_RELOCATION_LIMIT","SEED_FAMILY_ANCHOR"], seedsWrite:["SEED_FINAL_RELOCATION_TRADEOFF"],
  tags:["late_career","canonical_34plus","staged_not_registered"], canonStatus:"verified"
});

const EVT_35_BODY_001 = ambiguousEvent({
  id:"EVT_35_BODY_001", ageWindow:[35,null], phase:"34_plus", family:"medical",
  title:"El cuerpo pide seis semanas",
  body:"La pretemporada empieza con una propuesta distinta: seis semanas de carga progresiva antes de exigirte como al resto. No hay una lesión nueva que justificar; hay historial corporal suficiente para discutir cómo preparar el año.",
  visible:["Ves carga, recuperación y disponibilidad acumuladas.","La propuesta gestiona exposición y no diagnostica una lesión nueva."],
  uncertain:["No sabes si empezar más lento te hará llegar mejor o perder jerarquía.","Tampoco sabes si un plan personal funcionará fuera de tu rutina."],
  gates:[{path:"retirement.status",op:"eq",value:"playing"}], timeWindow:{months:[7,8]}, weight:13,
  choices:[
    {id:"SIX_WEEKS",label:"Aceptar seis semanas",intentTags:["body","load_management"],primaryMessage:"Aceptas una pretemporada más lenta para comprar margen de recuperación.",secondaryMessage:"El plan reduce carga, aunque durante unas semanas tienes menos ritmo.",primaryEffects:[n("professional.recoveryDebt",-8),n("professional.bodyLoad",-6),n("professional.matchSelectivity",4)],secondaryEffects:[n("professional.recoveryDebt",-5),n("professional.bodyLoad",-4),n("professional.statusInertia",-2)],primarySeedTransitions:[seedCreate("SEED_SLOW_PRESEASON_35",66,{preseasonPlan:"six_weeks"})],secondarySeedTransitions:[seedCreate("SEED_SLOW_PRESEASON_35",70,{preseasonPlan:"six_weeks",rhythm_cost:true})]},
    {id:"THREE_WEEKS",label:"Reducirlo a tres",intentTags:["body","compromise"],primaryMessage:"Buscas un compromiso entre recuperar y competir pronto.",secondaryMessage:"La carga llega antes y el margen de recuperación es menor.",primaryEffects:[n("professional.recoveryDebt",-4),n("professional.bodyLoad",-3),n("professional.matchSelectivity",2)],secondaryEffects:[n("professional.recoveryDebt",-2),n("professional.bodyLoad",1)],primarySeedTransitions:[seedCreate("SEED_SLOW_PRESEASON_35",60,{preseasonPlan:"three_weeks"})],secondarySeedTransitions:[seedCreate("SEED_SLOW_PRESEASON_35",64,{preseasonPlan:"three_weeks",load_risk:true})]},
    {id:"PERSONAL_PLAN",label:"Hacer un plan propio",intentTags:["body","autonomy"],primaryMessage:"Tomas más control de la preparación sin afirmar que tu método sea superior.",secondaryMessage:"La autonomía ayuda a tus sensaciones, pero reduce coordinación con el grupo.",primaryEffects:[n("professional.careerControl",4),n("professional.recoveryDebt",-4),n("professional.environmentStability",-1)],secondaryEffects:[n("professional.careerControl",3),n("professional.environmentStability",-3)],primarySeedTransitions:[seedCreate("SEED_SLOW_PRESEASON_35",63,{preseasonPlan:"personal_plan"})],secondarySeedTransitions:[seedCreate("SEED_SLOW_PRESEASON_35",68,{preseasonPlan:"personal_plan",coordination_cost:true})]},
    {id:"NORMAL_REASSESS",label:"Entrenar normal y reevaluar",intentTags:["body","reassess"],primaryMessage:"Mantienes el plan normal y aceptas revisar la decisión con datos posteriores.",secondaryMessage:"No aparece una lesión nueva, pero la carga acumulada tarda más en bajar.",primaryEffects:[n("professional.statusInertia",2),n("professional.recoveryDebt",2)],secondaryEffects:[n("professional.recoveryDebt",5),n("professional.bodyLoad",3)],primarySeedTransitions:[seedCreate("SEED_SLOW_PRESEASON_35",58,{preseasonPlan:"normal_reassess"})],secondarySeedTransitions:[seedCreate("SEED_SLOW_PRESEASON_35",66,{preseasonPlan:"normal_reassess",accumulated_cost:true})]}
  ],
  seedsWrite:["SEED_SLOW_PRESEASON_35"], tags:["late_career","canonical_34plus","staged_not_registered"], canonStatus:"verified"
});

const EVT_35_IMG_001 = ambiguousEvent({
  id:"EVT_35_IMG_001", ageWindow:[35,null], phase:"34_plus", family:"image",
  title:"Te ofrecen un último gran patrocinio",
  body:"Una marca plantea una campaña grande y quiere venderla como el cierre de una época. La propuesta comercial existe en esta escena; aceptar ese marco no equivale a anunciar una retirada deportiva.",
  visible:["La campaña y su marco público son explícitos.","No existe una CareerOffer de fútbol dentro de esta decisión."],
  uncertain:["No sabes si una campaña de despedida condicionará cómo se interpreta tu futuro.","Tampoco sabes si reformularla alrededor de longevidad reducirá su valor."],
  gates:[{path:"retirement.status",op:"eq",value:"playing"}], timeWindow:{months:[8,9,10,11,12,1,2]}, weight:10,
  choices:[
    {id:"FAREWELL_FRAME",label:"Aceptar el concepto de despedida",intentTags:["image","farewell_frame"],primaryMessage:"Aceptas el lenguaje de despedida como campaña comercial sin anunciar retirada.",secondaryMessage:"La campaña funciona, pero el público empieza a leer cada gesto como un final.",primaryEffects:[n("professional.commercialPower",6),n("professional.moneyComfort",4),n("professional.publicMyth",3)],secondaryEffects:[n("professional.commercialPower",7),n("professional.publicPolarization",4),n("professional.retirementDistance",3)],primarySeedTransitions:[seedCreate("SEED_RETIREMENT_MARKETING",68,{campaignFrame:"farewell"})],secondarySeedTransitions:[seedCreate("SEED_RETIREMENT_MARKETING",74,{campaignFrame:"farewell",narrative_pressure:true})]},
    {id:"LONGEVITY_FRAME",label:"Reformular la campaña alrededor de la longevidad",intentTags:["image","longevity"],primaryMessage:"La campaña habla de seguir compitiendo y conserva margen de decisión.",secondaryMessage:"Mantienes control del relato, aunque la marca pierde parte del dramatismo.",primaryEffects:[n("professional.commercialPower",4),n("professional.careerControl",3),n("professional.retirementDistance",-2)],secondaryEffects:[n("professional.commercialPower",2),n("professional.careerControl",4)],primarySeedTransitions:[seedCreate("SEED_RETIREMENT_MARKETING",64,{campaignFrame:"longevity"})],secondarySeedTransitions:[seedCreate("SEED_RETIREMENT_MARKETING",67,{campaignFrame:"longevity",commercial_cost:true})]},
    {id:"REJECT",label:"Rechazarla",intentTags:["image","independence"],primaryMessage:"Evitas que una marca decida el tono del final de tu carrera.",secondaryMessage:"Conservas independencia narrativa, pero dejas pasar una oportunidad económica.",primaryEffects:[n("professional.careerControl",4),n("professional.commercialPower",-2)],secondaryEffects:[n("professional.careerControl",3),n("professional.moneyComfort",-2)],primarySeedTransitions:[seedCreate("SEED_RETIREMENT_MARKETING",58,{campaignFrame:"rejected"})],secondarySeedTransitions:[seedCreate("SEED_RETIREMENT_MARKETING",62,{campaignFrame:"rejected",opportunity_cost:true})]},
    {id:"ONE_YEAR",label:"Firmar solo un año",intentTags:["image","commercial"],primaryMessage:"Aceptas el patrocinio sin entregar una narrativa plurianual sobre tu retirada.",secondaryMessage:"El contrato corto conserva flexibilidad, pero concentra la atención.",primaryEffects:[n("professional.commercialPower",5),n("professional.moneyComfort",3),n("professional.careerControl",2)],secondaryEffects:[n("professional.commercialPower",5),n("reputation.mediaHeat",3)],primarySeedTransitions:[seedCreate("SEED_RETIREMENT_MARKETING",63,{campaignFrame:"one_year"})],secondarySeedTransitions:[seedCreate("SEED_RETIREMENT_MARKETING",68,{campaignFrame:"one_year",concentrated_attention:true})]}
  ],
  seedsRead:["SEED_RETIREMENT_PUBLIC_TONE"], seedsWrite:["SEED_RETIREMENT_MARKETING"],
  tags:["late_career","canonical_34plus","staged_not_registered"], canonStatus:"verified"
});

const EVT_36_MED_001 = ambiguousEvent({
  id:"EVT_36_MED_001", ageWindow:[36,null], phase:"34_plus", family:"medical",
  title:"El médico te habla de después",
  body:"Una revisión de tu historial ya no habla solo del próximo partido. El médico plantea cuánto riesgo acumulado quieres aceptar pensando también en el cuerpo que tendrás después del fútbol.",
  visible:["La conversación parte de historial corporal o médico ya existente.","No diagnostica una discapacidad futura ni obliga a retirarte."],
  uncertain:["No sabes qué riesgo futuro se materializará.","Tampoco sabes cuánto cambiaría tu rendimiento si reduces exposición."],
  gates:[{path:"retirement.status",op:"eq",value:"playing"}], timeWindow:{months:[8,9,10,11,12,1,2,3]}, weight:11,
  choices:[
    {id:"REDUCE_EXPOSURE",label:"Reducir exposición",intentTags:["medical","risk"],primaryMessage:"Reduces carga futura sin convertir la decisión en retirada.",secondaryMessage:"El cuerpo gana margen, aunque tu disponibilidad se vuelve más selectiva.",primaryEffects:[n("professional.recoveryDebt",-7),n("professional.bodyLoad",-5),n("professional.matchSelectivity",6),n("professional.retirementDistance",3)],secondaryEffects:[n("professional.recoveryDebt",-4),n("professional.matchSelectivity",8),n("professional.statusInertia",-2)],primarySeedTransitions:[seedCreate("SEED_POST_CAREER_BODY_RISK",72,{riskStance:"reduce_exposure"})],secondarySeedTransitions:[seedCreate("SEED_POST_CAREER_BODY_RISK",76,{riskStance:"reduce_exposure",role_cost:true})]},
    {id:"CONTINUE_CLEARED",label:"Seguir mientras tengas permiso médico",intentTags:["medical","continue"],primaryMessage:"Mantienes abierta la carrera y aceptas revisar el riesgo con nueva evidencia.",secondaryMessage:"Sigues jugando sin inventar una lesión, pero el riesgo acumulado continúa presente.",primaryEffects:[n("professional.motivationReserve",3),n("professional.careerControl",2)],secondaryEffects:[n("professional.recoveryDebt",2),n("professional.motivationReserve",1)],primarySeedTransitions:[seedCreate("SEED_POST_CAREER_BODY_RISK",64,{riskStance:"continue_if_cleared"})],secondarySeedTransitions:[seedCreate("SEED_POST_CAREER_BODY_RISK",69,{riskStance:"continue_if_cleared",accepted_uncertainty:true})]},
    {id:"MORE_OPINIONS",label:"Buscar más opiniones",intentTags:["medical","information"],primaryMessage:"Aplazas una conclusión definitiva y buscas más información.",secondaryMessage:"Obtienes margen, aunque opiniones distintas también aumentan incertidumbre.",primaryEffects:[n("professional.careerControl",4),n("professional.environmentStability",1)],secondaryEffects:[n("professional.careerControl",2),n("professional.environmentStability",-2)],primarySeedTransitions:[seedCreate("SEED_POST_CAREER_BODY_RISK",62,{riskStance:"seek_more_opinions"})],secondarySeedTransitions:[seedCreate("SEED_POST_CAREER_BODY_RISK",66,{riskStance:"seek_more_opinions",uncertainty:true})]},
    {id:"TENTATIVE_DATE",label:"Fijar una fecha tentativa de retirada",intentTags:["medical","future"],primaryMessage:"Pones un horizonte tentativo sin convertirlo en una decisión terminal.",secondaryMessage:"La fecha ordena el futuro, pero empieza a pesar en cada señal del cuerpo.",primaryEffects:[n("professional.retirementDistance",8),n("professional.careerControl",4),n("professional.matchSelectivity",3)],secondaryEffects:[n("professional.retirementDistance",10),n("professional.motivationReserve",-2)],primarySeedTransitions:[seedCreate("SEED_POST_CAREER_BODY_RISK",70,{riskStance:"tentative_retirement_date",terminal:false})],secondarySeedTransitions:[seedCreate("SEED_POST_CAREER_BODY_RISK",74,{riskStance:"tentative_retirement_date",terminal:false,pressure:true})]}
  ],
  seedsRead:["SEED_MEDICAL_AUTHORITY"], seedsWrite:["SEED_POST_CAREER_BODY_RISK"],
  tags:["late_career","canonical_34plus","staged_not_registered"], canonStatus:"verified"
});

export const STAGED_PRINCIPAL_WAVE_A: EventDefinition[]=[EVT_35_FAM_001,EVT_35_BODY_001,EVT_35_IMG_001,EVT_36_MED_001];

export function eligibleStagedPrincipalWaveA(state: GameState): EventDefinition[] {
  return STAGED_PRINCIPAL_WAVE_A.filter(event => isStagedWaveAEligible(state,event.id as StagedWaveAEventId));
}
