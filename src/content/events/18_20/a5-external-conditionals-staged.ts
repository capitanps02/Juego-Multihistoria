import type { EventDefinition, SeedTransition } from "../../../core/types.js";
import { ambiguousEvent, n } from "./helpers.js";

const intensify = (seedId: string, intensity: number): SeedTransition => ({ seedId, action: "intensify", intensity });

export const A5_EXTERNAL_CONDITIONAL_REQUIREMENTS_18_20 = Object.freeze({
  CEVT_18_EARLY_01: {
    owner:"A4 sport/world",
    facts:["real early official breakout action (debut/goal/assist) with provenance","public attention caused by that action"],
    forbidden:["role/form as breakout","FIRST_TEAM_ATTENTION alone","narrative RNG sporting fact"]
  },
  CEVT_19_AGENT_01: {
    owner:"A3/A1 information provenance",
    facts:["second real discrepancy","hidden source-quality truth materialized before player choice"],
    forbidden:["truth chosen retrospectively by response","SEED_AGENT_OMISSION presence as source quality","relationship as truth"]
  },
  CEVT_19_SOCIAL_01: {
    owner:"world/social",
    facts:["NIGHT_PHOTO or high exposure plus a real recent conflict with timestamp/provenance"],
    forbidden:["synthetic RECENT_CONFLICT flag","mediaHeat alone as conflict","seed presence as incident"]
  }
});

const CEVT_18_EARLY_01 = ambiguousEvent({
  id:"CEVT_18_EARLY_01",ageWindow:[18,18],phase:"18_20",family:"conditional",title:"Demasiado pronto",
  body:"Una acción oficial temprana empieza a circular a escala nacional y el club recibe llamadas. El breakout debe existir en sport authority; esta escena no fabrica debut, gol ni asistencia.",
  visible:["La acción deportiva concreta y su difusión son hechos ya ocurridos.","Las llamadas son interés, no una oferta formal."],
  uncertain:["No sabes cuánto interés sobrevivirá unos días ni qué parte es simple ruido.","Aumentar exposición puede acelerar mercado y expectativas al mismo tiempo."],
  weight:7,
  choices:[
    {id:"FEED_WAVE",label:"Alimentar la ola con alguna aparición pública",intentTags:["media","exposure"],primaryMessage:"Conviertes parte del momento deportivo en exposición sin prometer un siguiente paso.",secondaryMessage:"La ola gana alcance más rápido que tus minutos y eleva expectativas antes de tiempo.",primaryEffects:[n("reputation.mediaHeat",6),n("reputation.marketHeat",3)],secondaryEffects:[n("reputation.mediaHeat",10),n("narrativePressure.market",5)]},
    {id:"SHIELD_TRAINING",label:"Blindarte y centrarte en entrenar",intentTags:["focus","privacy"],primaryMessage:"Reduces ruido sin negar lo que ocurrió en el campo.",secondaryMessage:"El foco ayuda a estabilizarte y también deja caer contactos que solo existían mientras eras tendencia.",primaryEffects:[n("reputation.mediaHeat",-4),n("professional.environmentStability",3)],secondaryEffects:[n("reputation.marketHeat",-3)]},
    {id:"CLUB_FILTER",label:"Dejar que el club gestione cualquier contacto",intentTags:["institution","delegate"],primaryMessage:"La estructura filtra llamadas sin convertirlas automáticamente en propuestas.",secondaryMessage:"El filtro reduce ruido y cede al club parte del relato sobre qué interés merece atención.",primaryEffects:[n("professional.institutionalTrust",3)],secondaryEffects:[n("control.career",-3)]}
  ],
  tags:["conditional","early_breakout","a5_ready_external_blocker"],canonStatus:"verified"
});

const CEVT_19_AGENT_01 = ambiguousEvent({
  id:"CEVT_19_AGENT_01",ageWindow:[19,19],phase:"18_20",family:"conditional",title:"Dos versiones del mismo martes",
  body:"Tu agente y otra fuente describen de forma incompatible una oportunidad pasada. La calidad real de cada fuente debe estar fijada antes de que respondas; tu elección no decide retrospectivamente quién tenía razón.",
  visible:["Sabes exactamente qué dos versiones chocan.","Existe una segunda discrepancia real además de la memoria previa."],
  uncertain:["No sabes si hubo cambio de condiciones, mala comunicación u omisión interesada.","Ninguna parte tiene por qué mentir conscientemente."],
  seedsRead:["SEED_AGENT_OMISSION"],seedsWrite:["SEED_AGENT_OMISSION"],npcRefs:["NPC_AGT_01","NPC_AGT_02","NPC_PRS_01"],weight:8,
  choices:[
    {id:"TRUST_AGENT",label:"Aceptar la explicación del agente por ahora",intentTags:["agent","trust"],primaryMessage:"Mantienes la relación sin afirmar que su versión sea objetivamente correcta.",secondaryMessage:"La confianza conserva velocidad y deja pendiente una discrepancia que puede reaparecer.",primaryEffects:[n("professional.agentControl",3)],secondaryEffects:[n("control.career",-2)],primarySeedTransitions:[intensify("SEED_AGENT_OMISSION",3)],secondarySeedTransitions:[intensify("SEED_AGENT_OMISSION",5)]},
    {id:"TRUST_SOURCE",label:"Dar más peso provisional a la otra fuente",intentTags:["source","skeptic"],primaryMessage:"Tomas la discrepancia en serio sin convertir la fuente alternativa en verdad automática.",secondaryMessage:"La duda aumenta tu control y puede erosionar una relación de representación que todavía no has probado culpable.",primaryEffects:[n("control.career",4)],secondaryEffects:[n("professional.agentControl",-3)],primarySeedTransitions:[intensify("SEED_AGENT_OMISSION",3)],secondarySeedTransitions:[intensify("SEED_AGENT_OMISSION",5)]},
    {id:"ASK_TIMELINE",label:"Pedir cronología y mensajes antes de decidir",intentTags:["evidence","information"],primaryMessage:"Intentas reconstruir qué sabía cada parte y cuándo.",secondaryMessage:"La evidencia reduce espacio para relatos simples, pero puede seguir sin explicar una negociación que cambió varias veces.",primaryEffects:[n("control.career",7)],secondaryEffects:[n("control.career",4)],primarySeedTransitions:[intensify("SEED_AGENT_OMISSION",2)],secondarySeedTransitions:[intensify("SEED_AGENT_OMISSION",3)]}
  ],
  tags:["conditional","agent","source_quality","a5_ready_external_blocker"],canonStatus:"verified"
});

const CEVT_19_SOCIAL_01 = ambiguousEvent({
  id:"CEVT_19_SOCIAL_01",ageWindow:[19,19],phase:"18_20",family:"conditional",title:"La captura",
  body:"Una imagen o mensaje antiguo reaparece cuando el contexto actual puede volverlo relevante. Debe existir una foto real o un conflicto reciente real; mediaHeat por sí solo no crea el incidente.",
  visible:["El contenido recuperado es auténtico y puedes ver su fecha/contexto.","Si existe conflicto reciente, sabes cuál fue y quién participó."],
  uncertain:["No sabes quién reactivó el contenido ni cuánto recorrido tendrá.","El mismo material puede ser irrelevante, gracioso o munición según hechos posteriores."],
  seedsRead:["SEED_DANI_NORMALITY","SEED_CLARA_CHANNEL"],npcRefs:["NPC_SOC_01","NPC_PRS_01"],weight:7,
  choices:[
    {id:"CONTEXT_NOW",label:"Dar contexto tú mismo",intentTags:["public","context"],primaryMessage:"Tu versión queda registrada antes de que otros completen la historia.",secondaryMessage:"Responder puede limitar una interpretación y también amplificar una pieza que todavía era pequeña.",primaryEffects:[n("reputation.mediaHeat",-2),n("control.career",2)],secondaryEffects:[n("reputation.mediaHeat",5)]},
    {id:"LET_DIE",label:"No reaccionar y dejar que el ciclo se consuma",intentTags:["silence","wait"],primaryMessage:"No añades combustible mientras el contenido no cruza un umbral mayor.",secondaryMessage:"El silencio evita una segunda noticia y deja espacio para que el conflicto actual coloree la lectura.",primaryEffects:[n("reputation.mediaHeat",-2)],secondaryEffects:[n("reputation.mediaHeat",4)]},
    {id:"TRUSTED_CHANNEL",label:"Pedir contraste a Clara si el canal sigue vivo",intentTags:["media","channel"],eligibility:[{path:"facts.claraChannelMode",op:"exists"}],primaryMessage:"Usas un canal previo para aportar contexto sin convertir a Clara en portavoz automática.",secondaryMessage:"El contraste puede enfriar el tema o hacer que el proceso de verificación se vuelva parte de la noticia.",primaryEffects:[n("rel.NPC_PRS_01.trust",3)],secondaryEffects:[n("reputation.mediaHeat",3)]},
    {id:"DANI_FIRST",label:"Hablar primero con Dani si el contenido afecta a vuestra historia",intentTags:["friendship","private"],eligibility:[{path:"facts.daniNormalityPattern",op:"exists"}],primaryMessage:"Proteges la relación privada antes de diseñar una respuesta pública.",secondaryMessage:"La conversación aclara límites personales aunque no controle lo que ya circula.",primaryEffects:[n("rel.NPC_SOC_01.trust",4),n("professional.environmentStability",2)],secondaryEffects:[n("reputation.mediaHeat",1)]}
  ],
  tags:["conditional","social","incident","a5_ready_external_blocker"],canonStatus:"verified"
});

export const A5_EXTERNAL_CONDITIONALS_18_20: EventDefinition[] = [
  CEVT_18_EARLY_01, CEVT_19_AGENT_01, CEVT_19_SOCIAL_01
];
