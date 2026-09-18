import type { EventDefinition, GameState } from "../../../core/types.js";
import { ambiguousEvent, n } from "../18_20/helpers.js";
import { projectSeedMemory } from "../../../narrative/seed-memory.js";

/**
 * This canonical conditional establishes the late commercial boom itself.
 * It is not a CareerOffer, does not mutate football employment and does not
 * require a generic sponsor/world-incident engine.
 */
export function isSponsorLateBoomEligible(state:GameState):boolean{
  if(state.retirement.status!=="playing" || state.age<35) return false;
  const prior=projectSeedMemory(state,"SEED_SPONSOR_IMAGE");
  return prior.historicalExists || state.professional.commercialPower>=45;
}

export const CEVT_35_SPONSOR_LATE_BOOM:EventDefinition=ambiguousEvent({
  id:"CEVT_35_SPONSOR_LATE_BOOM",
  ageWindow:[35,null],
  phase:"34_plus",
  family:"conditional",
  title:"Tu imagen vale más justo cuando juegas menos",
  body:"Una marca propone una campaña tardía porque tu historia de longevidad y legado ha ganado valor comercial. La propuesta nace en esta escena canónica y no es una oferta de club ni una señal de mercado futbolístico.",
  visible:["Propuesta comercial concreta","alcance y calendario de campaña","tu historial real de imagen cuando exista"],
  uncertain:["No sabes si la exposición reforzará tu libertad o acelerará la narrativa de despedida","el valor comercial puede separarse cada vez más de tu rol deportivo"],
  gates:[{path:"retirement.status",op:"eq",value:"playing"}],
  weight:8,
  choices:[
    {id:"TAKE_CAMPAIGN",label:"Aceptar la campaña completa",intentTags:["image","commercial"],primaryMessage:"Aceptas explotar el valor tardío de tu imagen sin convertirlo en anuncio de retirada.",secondaryMessage:"La campaña amplifica tu figura y puede alimentar una lectura de cierre aunque tú sigas jugando.",primaryEffects:[n("professional.commercialPower",5),n("professional.publicMyth",4),n("reputation.mediaHeat",3)],secondaryEffects:[n("professional.commercialPower",3),n("professional.publicPolarization",2)]},
    {id:"LIMIT_COMMITMENT",label:"Limitar duración y mensajes",intentTags:["image","control"],primaryMessage:"Aceptas solo una versión acotada y mantienes control sobre el relato.",secondaryMessage:"Proteges flexibilidad, pero renuncias a parte del valor económico y alcance.",primaryEffects:[n("professional.careerControl",4),n("professional.commercialPower",2)],secondaryEffects:[n("professional.publicMyth",1)]},
    {id:"USE_FOR_FREEDOM",label:"Usar el ingreso para ganar libertad deportiva",intentTags:["image","money","control"],primaryMessage:"Tratas la campaña como colchón económico, no como sustituto de una oferta deportiva.",secondaryMessage:"Ganas margen para elegir contratos futuros, pero aumenta la separación entre fama y fútbol.",primaryEffects:[n("professional.moneyComfort",5),n("professional.careerControl",4)],secondaryEffects:[n("professional.publicPolarization",1)]},
    {id:"DECLINE_BOOM",label:"Rechazar la campaña",intentTags:["image","focus"],primaryMessage:"Evitas que el tramo final quede dominado por una campaña comercial.",secondaryMessage:"Mantienes foco deportivo y dejas pasar una ventana económica que puede no repetirse.",primaryEffects:[n("professional.careerControl",3),n("reputation.mediaHeat",-2)],secondaryEffects:[n("professional.commercialPower",-2)]}
  ],
  seedsRead:["SEED_SPONSOR_IMAGE"],
  tags:["canonical_34plus","conditional","staged_not_registered","event_establishes_incident","commercial_not_football_offer"],
  canonStatus:"verified"
});
