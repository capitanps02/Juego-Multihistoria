import type { EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const AGT27=ambiguousEvent({
  id:"EVT_27_AGT_001",ageWindow:[27,27],phase:"26_30",family:"agent",title:"Si no presionas, no te venden",
  body:"Existe interés serio de otro club, pero tu club no acepta las cifras recibidas. Tu agente sostiene que la única palanca que queda es que hagas pública tu voluntad de salir.",
  visible:["Sabes qué interés formal existe, qué ha rechazado tu club y qué vías privadas se han usado hasta ahora."],
  uncertain:["No sabes si el comprador subirá la oferta después de exponerte ni si tu agente realmente agotó todas las vías."],
  choices:[
    {id:"A",label:"Pedir salir en público",intentTags:["agent","public_exit"],primaryMessage:"Conviertes tu voluntad de salir en una posición pública para aumentar presión negociadora.",secondaryMessage:"La presión puede desbloquear la operación o dejarte expuesto si el comprador se retira.",primaryEffects:[n("reputation.mediaHeat",5),n("professional.careerControl",2),n("professional.institutionalTrust",-4)],secondaryEffects:[n("professional.publicPolarization",4),n("professional.environmentStability",-3)],primarySeedTransitions:[seedCreate("SEED_PUBLIC_EXIT_PRESSURE",76,{age27:"public_request"})],secondarySeedTransitions:[seedCreate("SEED_PUBLIC_EXIT_PRESSURE",82,{age27:"public_request"})]},
    {id:"B",label:"Filtrar deseo sin declaración directa",intentTags:["agent","leak"],primaryMessage:"Permites que el mercado conozca tu preferencia sin asumir una declaración frontal.",secondaryMessage:"La ambigüedad conserva negación plausible y hace más difícil controlar el relato o la fuente.",primaryEffects:[n("reputation.mediaHeat",4),n("professional.careerControl",2)],secondaryEffects:[n("professional.publicPolarization",3),n("professional.institutionalTrust",-2)],primarySeedTransitions:[seedCreate("SEED_PUBLIC_EXIT_PRESSURE",72,{age27:"indirect_leak"})],secondarySeedTransitions:[seedCreate("SEED_PUBLIC_EXIT_PRESSURE",78,{age27:"indirect_leak"})]},
    {id:"C",label:"Seguir solo por vía privada",intentTags:["agent","private_only"],primaryMessage:"Mantienes la negociación fuera del espacio público y obligas a que comprador, club y agente sigan trabajando con hechos formales.",secondaryMessage:"Proteges la relación institucional, pero renuncias a una palanca que quizá fuera necesaria.",primaryEffects:[n("professional.institutionalTrust",3),n("professional.careerControl",3)],secondaryEffects:[n("reputation.marketHeat",-1),n("professional.environmentStability",2)],primarySeedTransitions:[seedCreate("SEED_PUBLIC_EXIT_PRESSURE",58,{age27:"private_only"})],secondarySeedTransitions:[seedCreate("SEED_PUBLIC_EXIT_PRESSURE",54,{age27:"private_only"})]},
    {id:"D",label:"Dar un plazo a ambos clubes antes de hablar",intentTags:["agent","deadline"],primaryMessage:"Fijas una ventana privada para que comprador y vendedor muevan posiciones antes de decidir si haces pública tu postura.",secondaryMessage:"El plazo añade disciplina y también permite que una de las partes abandone la operación.",primaryEffects:[n("professional.careerControl",5),n("reputation.marketHeat",1)],secondaryEffects:[n("professional.environmentStability",-1),n("professional.careerControl",3)],primarySeedTransitions:[seedCreate("SEED_PUBLIC_EXIT_PRESSURE",66,{age27:"private_deadline"})],secondarySeedTransitions:[seedCreate("SEED_PUBLIC_EXIT_PRESSURE",70,{age27:"private_deadline"})]}
  ],
  gates:[{path:"facts.seriousTransferInterestCurrentClubReticent",op:"eq",value:true}],
  timeWindow:{months:[8,9,10,1]},weight:18,cooldown:99999,
  seedsRead:["SEED_FIRST_LEAK"],seedsWrite:["SEED_PUBLIC_EXIT_PRESSURE"],
  tags:["agent","market_pressure","a6_ready_external_blocker","needs_a3_formal_interest_and_negotiation_state","needs_a2_seed_origin_realign_evt27_agent","t5_40"],
  canonStatus:"verified"
});

const MONEY27=ambiguousEvent({
  id:"EVT_27_MONEY_001",ageWindow:[27,27],phase:"26_30",family:"money",title:"Tu patrimonio ya es una empresa",
  body:"Ingresos, inmuebles, patrocinios y familia ya requieren una estructura profesional. Un asesor propone separar formalmente gastos personales de inversiones.",
  visible:["Conoces honorarios, estructura propuesta y activos que entrarían en ella."],
  uncertain:["No sabes qué rendimiento tendrán las inversiones ni si profesionalizar la gestión aumentará distancia con familia o amigos."],
  choices:[
    {id:"A",label:"Profesionalizar todo",intentTags:["wealth","professionalize"],primaryMessage:"Centralizas gestión, cumplimiento y reporting en una estructura profesional.",secondaryMessage:"Reduces algunos riesgos operativos y aumentas costes y dependencia de asesores.",primaryEffects:[n("professional.careerControl",4),n("professional.moneyComfort",-2)],secondaryEffects:[n("professional.environmentStability",-1),n("professional.careerControl",3)],primarySeedTransitions:[seedCreate("SEED_WEALTH_STRUCTURE",76,{age27:"professionalize_all"})],secondarySeedTransitions:[seedCreate("SEED_WEALTH_STRUCTURE",72,{age27:"professionalize_all"})]},
    {id:"B",label:"Mantener inversiones simples y líquidas",intentTags:["wealth","simple"],primaryMessage:"Priorizas una estructura comprensible, líquida y con menos capas de gestión.",secondaryMessage:"La simplicidad reduce fricción y puede renunciar a oportunidades que una estructura profesional sí permitiría.",primaryEffects:[n("professional.moneyComfort",2),n("professional.careerControl",3)],secondaryEffects:[n("professional.moneyComfort",1)],primarySeedTransitions:[seedCreate("SEED_WEALTH_STRUCTURE",62,{age27:"simple_liquid"})],secondarySeedTransitions:[seedCreate("SEED_WEALTH_STRUCTURE",58,{age27:"simple_liquid"})]},
    {id:"C",label:"Dejar parte con familia y parte profesional",intentTags:["wealth","hybrid_family"],primaryMessage:"Separar bloques conserva participación familiar sin entregar toda la gestión patrimonial al mismo círculo.",secondaryMessage:"La solución híbrida diversifica dependencias y crea más fronteras que coordinar.",primaryEffects:[n("professional.environmentStability",2),n("professional.careerControl",2)],secondaryEffects:[n("professional.environmentStability",1),n("professional.moneyComfort",-1)],primarySeedTransitions:[seedCreate("SEED_WEALTH_STRUCTURE",68,{age27:"hybrid_family"})],secondarySeedTransitions:[seedCreate("SEED_WEALTH_STRUCTURE",64,{age27:"hybrid_family"})]},
    {id:"D",label:"Posponer un año",intentTags:["wealth","defer"],primaryMessage:"Mantienes la estructura actual mientras reúnes más información sobre costes y necesidades reales.",secondaryMessage:"Conservas flexibilidad y aceptas otro año de complejidad sin resolver.",primaryEffects:[n("professional.careerControl",2),n("professional.moneyComfort",1)],secondaryEffects:[n("professional.environmentStability",-1)],primarySeedTransitions:[seedCreate("SEED_WEALTH_STRUCTURE",54,{age27:"defer_year"})],secondarySeedTransitions:[seedCreate("SEED_WEALTH_STRUCTURE",50,{age27:"defer_year"})]}
  ],
  gates:[{path:"facts.highWealthStructureDecision",op:"eq",value:true}],
  timeWindow:{months:[2,3,4,5]},weight:16,cooldown:99999,
  seedsRead:["SEED_FAMILY_BUSINESS"],seedsWrite:["SEED_WEALTH_STRUCTURE"],
  npcRefs:["NPC_FAM_01","NPC_FAM_02"],
  tags:["money","wealth_governance","a6_ready_external_blocker","needs_factual_wealth_authority_no_arbitrary_threshold","needs_a2_seed_origin_realign_evt27_money","t5_40"],
  canonStatus:"verified"
});

const HOME27=ambiguousEvent({
  id:"EVT_27_HOME_001",ageWindow:[27,27],phase:"26_30",family:"family",title:"¿Comprar una parte de casa?",
  body:"UDV busca capital privado para instalaciones o cantera y te ofrece participar como inversor minoritario mediante una estructura compatible con las reglas del mundo.",
  visible:["Conoces valoración, porcentaje, aportación requerida y derechos de gobierno limitados."],
  uncertain:["No sabes si futuras decisiones deportivas del club chocarán con tu imagen o carrera ni cómo evolucionará el valor de la inversión."],
  choices:[
    {id:"A",label:"Invertir",intentTags:["home","ownership"],primaryMessage:"Aceptas entrar como inversor minoritario sin convertirte en responsable de decisiones deportivas.",secondaryMessage:"El vínculo económico puede revalorizarse o complicar una relación que antes era principalmente emocional.",primaryEffects:[n("professional.homePull",4),n("professional.legacyCapital",2)],secondaryEffects:[n("professional.environmentStability",-1),n("professional.homePull",3)],primarySeedTransitions:[seedCreate("SEED_HOME_OWNERSHIP",78,{age27:"invest",governance:"minority_limited"})],secondarySeedTransitions:[seedCreate("SEED_HOME_OWNERSHIP",82,{age27:"invest",governance:"minority_limited"})]},
    {id:"B",label:"Donar a cantera sin entrar en propiedad",intentTags:["home","academy_donation"],primaryMessage:"Apoyas el proyecto formativo sin adquirir derechos económicos o de gobierno.",secondaryMessage:"Reduces conflicto de intereses y también renuncias a control y retorno financiero.",primaryEffects:[n("professional.homePull",3),n("professional.legacyCapital",3)],secondaryEffects:[n("professional.moneyComfort",-1),n("professional.publicMyth",1)],primarySeedTransitions:[seedCreate("SEED_HOME_OWNERSHIP",62,{age27:"academy_donation",ownership:false})],secondarySeedTransitions:[seedCreate("SEED_HOME_OWNERSHIP",58,{age27:"academy_donation",ownership:false})]},
    {id:"C",label:"Esperar a la retirada",intentTags:["home","defer_retirement"],primaryMessage:"Separas tu carrera deportiva activa de una posible relación económica futura con el club de origen.",secondaryMessage:"Evitas mezclar incentivos ahora y aceptas que la oportunidad concreta puede no existir cuando te retires.",primaryEffects:[n("professional.careerControl",4),n("professional.homePull",1)],secondaryEffects:[n("professional.legacyCapital",1)],primarySeedTransitions:[seedCreate("SEED_HOME_OWNERSHIP",56,{age27:"wait_retirement",ownership:false})],secondarySeedTransitions:[seedCreate("SEED_HOME_OWNERSHIP",52,{age27:"wait_retirement",ownership:false})]},
    {id:"D",label:"Entrar solo mediante vehículo independiente y sin cargo público",intentTags:["home","independent_vehicle"],primaryMessage:"Condicionas la inversión a separar capital, imagen pública y gobierno deportivo.",secondaryMessage:"La estructura reduce exposición institucional y añade costes y complejidad.",primaryEffects:[n("professional.careerControl",4),n("professional.homePull",2)],secondaryEffects:[n("professional.moneyComfort",-1),n("professional.environmentStability",1)],primarySeedTransitions:[seedCreate("SEED_HOME_OWNERSHIP",72,{age27:"independent_vehicle",publicRole:false})],secondarySeedTransitions:[seedCreate("SEED_HOME_OWNERSHIP",68,{age27:"independent_vehicle",publicRole:false})]}
  ],
  gates:[
    {path:"flags.HAS_SEED_HOME_INSTITUTION",op:"eq",value:true},
    {path:"facts.homeMinorityInvestmentOffer",op:"eq",value:true},
    {path:"facts.wealthCapacityForHomeInvestment",op:"eq",value:true}
  ],
  timeWindow:{months:[2,3,4,5]},weight:16,cooldown:99999,
  seedsRead:["SEED_HOME_INSTITUTION"],seedsWrite:["SEED_HOME_OWNERSHIP"],
  npcRefs:["NPC_DIR_02"],
  tags:["family","home_institution","a6_ready_external_blocker","needs_home_offer_and_factual_wealth_capacity","needs_a2_seed_origin_realign_evt27_home","t5_40"],
  canonStatus:"verified"
});

export const T540_STAGED_PRINCIPAL_EVENTS:EventDefinition[]=[AGT27,MONEY27,HOME27];
