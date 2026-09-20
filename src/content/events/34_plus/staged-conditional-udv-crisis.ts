import type { EventDefinition, GameState } from "../../../core/types.js";
import { ambiguousEvent, n } from "../18_20/helpers.js";
import { projectSeedMemory } from "../../../narrative/seed-memory.js";

function udvRelevant(state:GameState):boolean{
  const home=projectSeedMemory(state,"SEED_HOME_INSTITUTION");
  return home.historicalExists && home.scopeValid
    && (state.club==="UDV" || state.professional.registrationClub==="UDV" || state.professional.route==="home");
}

export function isUdvFinancialCrisisEligible(state:GameState):boolean{
  return state.retirement.status==="playing" && state.age>=35 && udvRelevant(state);
}

export const CEVT_35_UDV_FINANCIAL_CRISIS:EventDefinition=ambiguousEvent({
  id:"CEVT_35_UDV_FINANCIAL_CRISIS",
  ageWindow:[35,null],
  phase:"34_plus",
  family:"conditional",
  title:"Valdoria necesita recortar",
  body:"UDV te comunica que necesita reducir costes. La crisis financiera ocurre en esta escena canónica; no se deduce de un flag genérico ni exige un motor financiero global. El club te pide renegociar salario o aceptar que busque una venta alternativa en la plantilla.",
  visible:["Existe un vínculo institucional real con UDV","el club declara una necesidad concreta de recorte en esta escena"],
  uncertain:["No sabes cuánto durará la crisis","no sabes si aceptar una rebaja protegerá realmente el proyecto deportivo"],
  gates:[{path:"retirement.status",op:"eq",value:"playing"}],
  weight:8,
  choices:[
    {id:"RENEGOTIATE",label:"Aceptar renegociar salario",intentTags:["home","money","solidarity"],primaryMessage:"Abres una renegociación formal sin cambiar todavía tus términos.",secondaryMessage:"El gesto ayuda a la relación, pero deja claro que tu contrato ya forma parte del problema económico.",primaryEffects:[n("professional.institutionalTrust",5),n("professional.careerControl",-1)],secondaryEffects:[n("professional.institutionalTrust",3),n("professional.contractPower",-3)]},
    {id:"PROTECT_TERMS",label:"Mantener tus condiciones",intentTags:["home","contract","boundary"],primaryMessage:"Separar lealtad y contrato obliga al club a buscar otra solución.",secondaryMessage:"Proteges tus términos, aunque la directiva siente menos margen para ordenar el proyecto.",primaryEffects:[n("professional.contractPower",4),n("professional.careerControl",3)],secondaryEffects:[n("professional.institutionalTrust",-4),n("professional.environmentStability",-2)]},
    {id:"ACCEPT_SALE_PATH",label:"Aceptar que el club busque otra venta",intentTags:["home","squad","tradeoff"],primaryMessage:"No cambias tu contrato y aceptas que el ajuste se busque en otra operación real.",secondaryMessage:"El club gana margen, pero tu decisión puede alterar la plantilla sin que controles quién saldrá.",primaryEffects:[n("professional.institutionalTrust",3),n("professional.environmentStability",-1)],secondaryEffects:[n("professional.environmentStability",-4)]},
    {id:"ASK_SHARED_SOLUTION",label:"Pedir una solución compartida",intentTags:["home","leadership","governance"],primaryMessage:"Pides que el recorte se distribuya y se explique antes de tocar un contrato concreto.",secondaryMessage:"La salida colectiva reduce el foco sobre ti, pero alarga una negociación difícil.",primaryEffects:[n("professional.institutionalPower",3),n("professional.institutionalTrust",2)],secondaryEffects:[n("professional.environmentStability",-2),n("professional.careerControl",1)]}
  ],
  seedsRead:["SEED_HOME_INSTITUTION"],
  tags:["canonical_34plus","conditional","staged_not_registered","event_establishes_incident","udv"],
  canonStatus:"verified"
});
