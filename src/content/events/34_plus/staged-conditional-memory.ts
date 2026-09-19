import type { EventDefinition, GameState } from "../../../core/types.js";
import { ambiguousEvent, n } from "../18_20/helpers.js";
import { projectSeedMemory } from "../../../narrative/seed-memory.js";

export type MemoryConditionalId =
  | "CEVT_34_FAMILY_CLUB_BUYIN"
  | "CEVT_34_CLARA_EXCLUSIVE"
  | "CEVT_35_PUBLIC_FEUD_RETURNS";

function validMemory(state:GameState,seedId:string):boolean{
  const memory=projectSeedMemory(state,seedId);
  return memory.historicalExists && memory.scopeValid;
}

export function isMemoryConditionalEligible(state:GameState,id:MemoryConditionalId):boolean{
  if(state.retirement.status!=="playing") return false;
  switch(id){
    case "CEVT_34_FAMILY_CLUB_BUYIN":
      return state.age>=34 && (validMemory(state,"SEED_HOME_OWNERSHIP") || validMemory(state,"SEED_FAMILY_BUSINESS"));
    case "CEVT_34_CLARA_EXCLUSIVE":
      return state.age>=34 && validMemory(state,"SEED_CLARA_CHANNEL") && state.professional.retirementDistance>=45;
    case "CEVT_35_PUBLIC_FEUD_RETURNS":
      return state.age>=35 && validMemory(state,"SEED_PUBLIC_RIVALRY");
  }
}

const FAMILY=ambiguousEvent({
 id:"CEVT_34_FAMILY_CLUB_BUYIN",ageWindow:[34,null],phase:"34_plus",family:"conditional",
 title:"Tu entorno quiere entrar en un club",
 body:"Con una inversión o estructura familiar ya real en tu historia, tu entorno propone entrar en un proyecto deportivo mientras tú todavía juegas. La propuesta abre un conflicto de interés; no crea rentabilidad ni poder institucional por sí sola.",
 visible:["Existe memoria patrimonial/familiar previa","la propuesta llega mientras sigues siendo jugador"],
 uncertain:["No sabes si el proyecto será rentable","no sabes si tu nombre condicionará decisiones deportivas"],
 gates:[{path:"retirement.status",op:"eq",value:"playing"}],weight:7,
 choices:[
  {id:"LIMITED_BUYIN",label:"Aceptar una participación limitada",intentTags:["family","money","limits"],primaryMessage:"Aceptas una exposición acotada y separas tu carrera de la gestión diaria.",secondaryMessage:"La inversión sigue creando preguntas sobre conflicto de interés aunque sea pequeña.",primaryEffects:[n("professional.moneyComfort",-4),n("professional.careerControl",1)],secondaryEffects:[n("professional.moneyComfort",-6),n("professional.environmentStability",-2)]},
  {id:"WAIT_AFTER_CAREER",label:"Esperar a después de jugar",intentTags:["family","future"],primaryMessage:"Pospones la entrada para no mezclar propiedad y competición activa.",secondaryMessage:"Proteges el presente, pero el proyecto puede avanzar sin ti.",primaryEffects:[n("professional.careerControl",4),n("professional.environmentStability",2)],secondaryEffects:[n("professional.careerControl",2)]},
  {id:"INDEPENDENT_REVIEW",label:"Pedir evaluación independiente",intentTags:["money","governance"],primaryMessage:"Introduces una revisión externa antes de comprometer dinero o nombre.",secondaryMessage:"La prudencia mejora información, aunque enfría a quienes querían decidir rápido.",primaryEffects:[n("professional.careerControl",3),n("professional.moneyComfort",-1)],secondaryEffects:[n("professional.environmentStability",-1)]},
  {id:"DECLINE_CONFLICT",label:"Rechazar por conflicto de interés",intentTags:["family","independence"],primaryMessage:"Mantienes tu carrera separada del proyecto de propiedad.",secondaryMessage:"El límite es claro, aunque parte de tu entorno lo interpreta como falta de compromiso.",primaryEffects:[n("professional.careerControl",5),n("professional.moneyComfort",1)],secondaryEffects:[n("professional.environmentStability",-3)]}
 ],
 seedsRead:["SEED_HOME_OWNERSHIP","SEED_FAMILY_BUSINESS"],tags:["canonical_34plus","conditional","staged_not_registered","memory_causal"],canonStatus:"verified"
});

const CLARA=ambiguousEvent({
 id:"CEVT_34_CLARA_EXCLUSIVE",ageWindow:[34,null],phase:"34_plus",family:"conditional",
 title:"Clara pide la exclusiva",
 body:"Después de años con un canal de confianza real, Clara pide la exclusiva del anuncio final y ofrece respetar un embargo. Hablar de una futura exclusiva no anuncia ni decide la retirada.",
 visible:["Existe el canal histórico con Clara","Clara ofrece respetar un embargo"],
 uncertain:["No sabes cuándo existirá una decisión final","no sabes cómo reaccionará el club si conoce el acuerdo"],
 gates:[{path:"retirement.status",op:"eq",value:"playing"}],npcRefs:["NPC_PRS_01"],weight:8,
 choices:[
  {id:"GRANT_EMBARGO",label:"Dar la exclusiva con embargo",intentTags:["media","trust"],primaryMessage:"Refuerzas el canal histórico sin publicar ninguna retirada.",secondaryMessage:"La confianza aumenta, pero también el coste de cambiar de plan sin filtrar nada.",primaryEffects:[n("rel.NPC_PRS_01.trust",5),n("professional.careerControl",1)],secondaryEffects:[n("rel.NPC_PRS_01.leverage",4)]},
  {id:"CLUB_FIRST",label:"Coordinar primero con el club",intentTags:["media","institution"],primaryMessage:"Mantienes la relación con Clara, pero cualquier anuncio futuro deberá respetar también al club.",secondaryMessage:"Ganas orden institucional y Clara percibe que ya no controla el canal.",primaryEffects:[n("professional.institutionalTrust",4),n("rel.NPC_PRS_01.trust",1)],secondaryEffects:[n("rel.NPC_PRS_01.trust",-2)]},
  {id:"WAIT_DECISION",label:"Pedir que espere a que exista una decisión",intentTags:["media","control"],primaryMessage:"No prometes una noticia que todavía no existe.",secondaryMessage:"Conservas control y dejas pasar una ventaja periodística que Clara valoraba.",primaryEffects:[n("professional.careerControl",5)],secondaryEffects:[n("rel.NPC_PRS_01.trust",-1)]},
  {id:"DECLINE_EXCLUSIVE",label:"No conceder exclusiva",intentTags:["media","independence"],primaryMessage:"El eventual anuncio seguirá sin dueño previo.",secondaryMessage:"Proteges independencia, pero enfrías un canal construido durante años.",primaryEffects:[n("professional.careerControl",4)],secondaryEffects:[n("rel.NPC_PRS_01.trust",-5)]}
 ],
 seedsRead:["SEED_CLARA_CHANNEL"],tags:["canonical_34plus","conditional","staged_not_registered","memory_causal","no_terminal_transition"],canonStatus:"verified"
});

const FEUD=ambiguousEvent({
 id:"CEVT_35_PUBLIC_FEUD_RETURNS",ageWindow:[35,null],phase:"34_plus",family:"conditional",
 title:"La rivalidad vuelve cuando parecía cerrada",
 body:"Una rivalidad pública antigua reaparece cuando un excompañero o rival reabre una polémica. La historia ya existía; esta escena no inventa el conflicto ni modifica resultados deportivos.",
 visible:["Existe memoria histórica de rivalidad pública","la nueva declaración es pública"],
 uncertain:["No sabes si responder cerrará el tema","puede convertir una anécdota tardía en el relato de tu despedida"],
 gates:[{path:"retirement.status",op:"eq",value:"playing"}],npcRefs:["NPC_PLR_15"],weight:7,
 choices:[
  {id:"ANSWER_FACTS",label:"Responder solo con hechos",intentTags:["press","facts"],primaryMessage:"Corriges el relato sin reabrir toda la rivalidad.",secondaryMessage:"La respuesta precisa el contexto, pero devuelve la polémica al centro.",primaryEffects:[n("professional.careerControl",3),n("reputation.mediaHeat",2)],secondaryEffects:[n("reputation.mediaHeat",5)]},
  {id:"PRIVATE_CONTACT",label:"Contactar en privado",intentTags:["rivalry","private"],primaryMessage:"Intentas cerrar el conflicto fuera de cámaras.",secondaryMessage:"La conversación reduce tensión personal, aunque públicamente queda un vacío.",primaryEffects:[n("rel.NPC_PLR_15.trust",3),n("reputation.mediaHeat",-2)],secondaryEffects:[n("rel.NPC_PLR_15.trust",-2)]},
  {id:"IGNORE_RETURN",label:"No reabrir la disputa",intentTags:["press","silence"],primaryMessage:"Dejas que la historia compita sola con veinte años de carrera.",secondaryMessage:"El silencio evita una escalada directa, pero otros rellenan el hueco.",primaryEffects:[n("reputation.mediaHeat",-1),n("professional.careerControl",2)],secondaryEffects:[n("professional.publicPolarization",2)]},
  {id:"MEDIATED_CLOSE",label:"Buscar una voz común para cerrarla",intentTags:["rivalry","closure"],primaryMessage:"Intentas convertir una rivalidad antigua en una memoria compartida sin fingir amistad.",secondaryMessage:"El cierre funciona a medias y vuelve a exponer episodios que ya estaban dormidos.",primaryEffects:[n("professional.publicMyth",2),n("professional.environmentStability",2)],secondaryEffects:[n("reputation.mediaHeat",3)]}
 ],
 seedsRead:["SEED_PUBLIC_RIVALRY"],tags:["canonical_34plus","conditional","staged_not_registered","memory_causal"],canonStatus:"verified"
});

export const STAGED_MEMORY_CONDITIONALS:EventDefinition[]=[FAMILY,CLARA,FEUD];
export function eligibleMemoryConditionals(state:GameState):EventDefinition[]{return STAGED_MEMORY_CONDITIONALS.filter(e=>isMemoryConditionalEligible(state,e.id as MemoryConditionalId));}
