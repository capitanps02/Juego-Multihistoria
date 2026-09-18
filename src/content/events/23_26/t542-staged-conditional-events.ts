import type { EventDefinition, OutcomeModifier } from "../../../core/types.js";
import { ambiguousEvent, n } from "../18_20/helpers.js";

const planMod=(id:string,plan:string,reason:string,multiply:number):OutcomeModifier=>({
  id,conditions:[{path:"facts.loadManagementPlan",op:"eq",value:plan}],multiply,reason
});

const FAM24=ambiguousEvent({
  id:"CEVT_24_FAM_02",ageWindow:[24,25],phase:"23_26",family:"conditional",title:"El negocio pierde dinero",
  body:"El proyecto familiar en el que ya estabas implicado presenta pérdidas reales y necesita decidir si aporta más capital, reduce escala o incorpora gestión externa.",
  visible:["Conoces las cuentas del periodo, la pérdida registrada y cuánto dinero adicional se solicita."],
  uncertain:["No sabes si la caída es temporal, si el gestor actual puede corregirla ni qué coste relacional tendrá cambiar el control."],
  choices:[
    {id:"A",label:"Aportar capital adicional",intentTags:["family","capital"],primaryMessage:"Cubres parte de la necesidad de caja y compras tiempo al proyecto.",secondaryMessage:"La aportación evita una decisión inmediata y aumenta tu exposición a un negocio que sigue sin demostrar recuperación.",primaryEffects:[n("professional.moneyComfort",-4),n("professional.environmentStability",2)],secondaryEffects:[n("professional.moneyComfort",-6)]},
    {id:"B",label:"Prestar solo con calendario y condiciones",intentTags:["family","loan"],primaryMessage:"Separas apoyo familiar de una aportación abierta y exiges una devolución trazable.",secondaryMessage:"La estructura protege capital y puede convertir una tensión económica en tensión personal.",primaryEffects:[n("professional.careerControl",3),n("professional.moneyComfort",-2)],secondaryEffects:[n("professional.environmentStability",-2)]},
    {id:"C",label:"No poner más dinero",intentTags:["family","stop_loss"],primaryMessage:"Limitas tu exposición y obligas al negocio a resolver su viabilidad sin otra inyección tuya.",secondaryMessage:"Proteges patrimonio y asumes que familiares o socios pueden vivir la decisión como abandono.",primaryEffects:[n("professional.moneyComfort",2),n("professional.careerControl",3)],secondaryEffects:[n("professional.environmentStability",-3)]},
    {id:"D",label:"Aportar solo si entra un gestor externo",intentTags:["family","governance"],primaryMessage:"Condicionas cualquier apoyo adicional a un cambio verificable de gestión.",secondaryMessage:"La profesionalización puede mejorar disciplina o romper equilibrios familiares existentes.",primaryEffects:[n("professional.careerControl",4),n("professional.environmentStability",1)],secondaryEffects:[n("professional.environmentStability",-2),n("professional.moneyComfort",-2)]}
  ],
  gates:[{path:"flags.HAS_SEED_FAMILY_BUSINESS",op:"eq",value:true},{path:"facts.familyBusinessAdverseResult",op:"eq",value:true}],
  weight:12,cooldown:99999,seedsRead:["SEED_FAMILY_BUSINESS"],
  tags:["conditional","family_business","a6_ready_external_blocker","needs_factual_business_loss_not_seed_inference_or_random_proxy","t5_42"],canonStatus:"verified"
});

const STAR25=ambiguousEvent({
  id:"CEVT_25_STAR_01",ageWindow:[25,25],phase:"23_26",family:"conditional",title:"El fichaje estrella se lesiona",
  body:"El jugador estrella que competía contigo por espacio sufre una lesión confirmada. El entrenador debe redistribuir minutos y responsabilidades sin convertir su baja en una garantía para ti.",
  visible:["Conoces la lesión, el plazo médico comunicado y el plan inmediato del entrenador."],
  uncertain:["No sabes si responderás bien al aumento de minutos ni cómo cambiará la jerarquía cuando el compañero vuelva."],
  choices:[
    {id:"A",label:"Pedir asumir el rol completo mientras esté fuera",intentTags:["star","take_role"],primaryMessage:"Te ofreces a cubrir la responsabilidad deportiva de forma explícita.",secondaryMessage:"La oportunidad aumenta exposición y expectativas sin convertir la ausencia ajena en propiedad permanente del puesto.",primaryEffects:[n("professional.roleSecurity",3),n("professional.successionPressure",-1)],secondaryEffects:[n("professional.bodyLoad",3),n("professional.publicPolarization",1)]},
    {id:"B",label:"Aceptar más minutos sin reclamar jerarquía futura",intentTags:["star","temporary"],primaryMessage:"Aprovechas la ventana deportiva y separas el presente de la discusión sobre el regreso del compañero.",secondaryMessage:"La prudencia protege vestuario y puede dejar sin resolver tu posición cuando ambos estéis disponibles.",primaryEffects:[n("professional.environmentStability",3),n("professional.roleSecurity",2)],secondaryEffects:[n("professional.careerControl",1)]},
    {id:"C",label:"Pedir rotación para no disparar carga",intentTags:["star","load"],primaryMessage:"Aceptas responsabilidad con límites de carga mientras el calendario sigue.",secondaryMessage:"Proteges disponibilidad y cedes parte de una oportunidad que quizá no se repita.",primaryEffects:[n("professional.recoveryMargin",3),n("professional.bodyLoad",-2)],secondaryEffects:[n("professional.roleSecurity",-1)]},
    {id:"D",label:"No cambiar nada hasta hablar con el técnico",intentTags:["star","clarity"],primaryMessage:"Pides que el staff defina la redistribución antes de interpretar la lesión como una promoción automática.",secondaryMessage:"Ganas claridad institucional y pierdes velocidad para ocupar el espacio que acaba de abrirse.",primaryEffects:[n("professional.careerControl",3),n("professional.institutionalTrust",2)],secondaryEffects:[n("professional.roleSecurity",-1)]}
  ],
  gates:[{path:"flags.HAS_SEED_STAR_COMPETITION",op:"eq",value:true},{path:"facts.currentClubStarInjury",op:"eq",value:true}],
  weight:13,cooldown:99999,seedsRead:["SEED_STAR_COMPETITION"],
  tags:["conditional","team","a6_ready_external_blocker","needs_explicit_other_player_injury_and_current_club_identity","t5_42"],canonStatus:"verified"
});

const AGENT25=ambiguousEvent({
  id:"CEVT_25_AGENT_04",ageWindow:[25,25],phase:"23_26",family:"conditional",title:"Ordóñez sí tenía club",
  body:"El superagente al que mantuviste a distancia reaparece con prueba de que un club concreto quería hablar de un movimiento real. No demuestra que hubiera oferta firmable.",
  visible:["Ves la identidad del club, la cronología del contacto y qué parte estaba autorizada a negociar."],
  uncertain:["No sabes si la operación habría llegado a términos aceptables ni si Ordóñez exageró otras oportunidades."],
  choices:[
    {id:"A",label:"Reabrir relación con límites claros",intentTags:["agent","reopen"],primaryMessage:"Reconoces que existía una oportunidad concreta y permites un canal nuevo con reglas de información explícitas.",secondaryMessage:"Ganas acceso y reintroduces a un actor que antes decidiste mantener lejos.",primaryEffects:[n("professional.careerControl",3),n("reputation.marketHeat",2)],secondaryEffects:[n("professional.environmentStability",-2)]},
    {id:"B",label:"Pedir toda la documentación antes de hablar de representación",intentTags:["agent","proof"],primaryMessage:"Separas evidencia de una operación de cualquier decisión sobre quién debe representarte.",secondaryMessage:"La auditoría mejora información y puede hacer desaparecer la urgencia que el agente intenta crear.",primaryEffects:[n("professional.careerControl",5)],secondaryEffects:[n("reputation.marketHeat",-1)]},
    {id:"C",label:"Mantener a tu agente actual y autorizar solo ese contacto",intentTags:["agent","limited_mandate"],primaryMessage:"Usas la oportunidad concreta sin conceder control general de tu carrera al superagente.",secondaryMessage:"La estructura limita dependencia y crea fricción entre intermediarios.",primaryEffects:[n("professional.agentControl",4),n("professional.contractPower",2)],secondaryEffects:[n("professional.environmentStability",-2)]},
    {id:"D",label:"Rechazar incluso con la prueba",intentTags:["agent","reject"],primaryMessage:"Mantienes la decisión anterior: una oportunidad concreta no cambia tu valoración global de la relación.",secondaryMessage:"Proteges coherencia y quizá descartas una vía de mercado que sí existía.",primaryEffects:[n("professional.careerControl",3),n("professional.environmentStability",1)],secondaryEffects:[n("reputation.marketHeat",-2)]}
  ],
  gates:[
    {path:"facts.superAgentPriorDispositionCold",op:"eq",value:true},
    {path:"facts.superAgentConcreteClubInterest",op:"eq",value:true}
  ],
  weight:13,cooldown:99999,seedsRead:["SEED_FIRST_AGENT","SEED_AGENT_PROOF"],
  tags:["conditional","agent","a6_ready_external_blocker","needs_a1_active_agent_history_and_a3_concrete_club_interest","t5_42"],canonStatus:"verified"
});

const BODY25=ambiguousEvent({
  id:"CEVT_25_BODY_02",ageWindow:[25,25],phase:"23_26",family:"conditional",title:"Recaída sin culpable",
  body:"Una molestia o recaída aparece pese a que existe un plan de carga previo. La escena no juzga el plan por la mera presencia de la seed: necesita saber qué protocolo elegiste y qué parte se siguió.",
  visible:["Conoces diagnóstico, carga reciente y el plan exacto que elegiste a los 23."],
  uncertain:["No sabes si la recaída demuestra un fallo de estrategia, mala suerte o un riesgo que ningún plan podía eliminar."],
  choices:[
    {id:"A",label:"Mantener el plan y ajustar solo la recuperación actual",intentTags:["body","keep_plan"],primaryMessage:"Tratas la recaída como información nueva sin concluir que el plan anterior fuese incorrecto.",secondaryMessage:"La continuidad evita sobrerreacción y puede conservar un patrón que ahora necesite cambios.",primaryEffects:[n("professional.recoveryMargin",3),n("professional.careerControl",2)],secondaryEffects:[n("professional.bodyLoad",1)],primaryModifiers:[planMod("body-weekly-a","weekly_prevention","El plan preventivo semanal hace coherente evaluar antes de abandonarlo.",1.35),planMod("body-postfull-a","post_full_match","La gestión tras partidos completos ya era selectiva y puede ajustarse sin rediseño total.",1.25)]},
    {id:"B",label:"Rediseñar el plan con el equipo médico",intentTags:["body","redesign"],primaryMessage:"Usas la recaída para revisar criterios, no para buscar un culpable retrospectivo.",secondaryMessage:"El rediseño puede mejorar control o añadir otra capa de cambios sin evidencia concluyente.",primaryEffects:[n("professional.careerControl",4),n("professional.recoveryMargin",2)],secondaryEffects:[n("professional.environmentStability",-1)],primaryModifiers:[planMod("body-fullload-b","full_load_until_pain","Haber entrenado todo hasta dolor aumenta el valor informativo de revisar el patrón.",1.6)]},
    {id:"C",label:"Pedir una segunda opinión antes de cambiar nada",intentTags:["body","second_opinion"],primaryMessage:"Buscas evidencia adicional antes de atribuir causa al protocolo.",secondaryMessage:"Ganas otra lectura y retrasas una decisión mientras el calendario continúa.",primaryEffects:[n("professional.careerControl",4)],secondaryEffects:[n("professional.recoveryMargin",-1)],primaryModifiers:[planMod("body-review-c","external_review_first","El historial de segunda valoración hace natural contrastar de nuevo la decisión.",1.35)]},
    {id:"D",label:"Reducir carga de inmediato hasta recuperar estabilidad",intentTags:["body","de_load"],primaryMessage:"Priorizas disponibilidad futura y aceptas perder trabajo o minutos a corto plazo.",secondaryMessage:"La descarga reduce exposición inmediata y no demuestra qué causó la recaída.",primaryEffects:[n("professional.bodyLoad",-5),n("professional.recoveryMargin",4)],secondaryEffects:[n("professional.roleSecurity",-1)],primaryModifiers:[planMod("body-full-load-d","full_load_until_pain","El plan de carga completa hace más relevante una descarga inmediata tras recaída.",1.45)]}
  ],
  gates:[
    {path:"flags.HAS_SEED_LOAD_MANAGEMENT",op:"eq",value:true},
    {path:"facts.medicalRecurrenceAfterLoadPlan",op:"eq",value:true}
  ],
  gateAlternatives:[
    [{path:"facts.loadManagementPlan",op:"eq",value:"weekly_prevention"}],
    [{path:"facts.loadManagementPlan",op:"eq",value:"full_load_until_pain"}],
    [{path:"facts.loadManagementPlan",op:"eq",value:"post_full_match"}],
    [{path:"facts.loadManagementPlan",op:"eq",value:"external_review_first"}]
  ],
  weight:14,cooldown:99999,seedsRead:["SEED_LOAD_MANAGEMENT"],
  tags:["conditional","medical","a6_ready_external_blocker","consumes_a2_pr217_load_management_payload_plan_fact","needs_medical_recurrence_authority","t5_42"],canonStatus:"verified"
});

const SHOCK25=ambiguousEvent({
  id:"CEVT_25_SHOCK_02",ageWindow:[25,25],phase:"23_26",family:"conditional",title:"El entrenador cae antes de la final",
  body:"Una crisis institucional de tu club provoca la salida del entrenador poco antes de una final importante. El cambio es un hecho del club actual, no una inferencia desde tu relación con el técnico.",
  visible:["Conoces que el entrenador ha salido, la causa institucional comunicada, quién dirige de forma interina y la final programada."],
  uncertain:["No sabes cuánto cambiará el plan de partido ni si la dirección interina sobrevivirá después de la final."],
  choices:[
    {id:"A",label:"Cerrar filas con el interino hasta la final",intentTags:["coach","stability"],primaryMessage:"Priorizas preparación inmediata y aplazas cualquier debate sobre el ciclo siguiente.",secondaryMessage:"La estabilidad corta reduce ruido y puede ser leída como apoyo político al sustituto.",primaryEffects:[n("professional.environmentStability",4),n("professional.institutionalTrust",2)],secondaryEffects:[n("professional.publicPolarization",1)]},
    {id:"B",label:"Pedir claridad táctica antes de hablar públicamente",intentTags:["coach","clarity"],primaryMessage:"Buscas saber qué cambia en el campo antes de prestar tu voz a la transición.",secondaryMessage:"Ganas contexto y haces visible que la salida alteró preparación real.",primaryEffects:[n("professional.careerControl",3),n("professional.tacticalReading",2)],secondaryEffects:[n("reputation.mediaHeat",1)]},
    {id:"C",label:"No entrar en la disputa institucional",intentTags:["coach","boundary"],primaryMessage:"Separás tu papel deportivo de la causa que provocó la salida del entrenador.",secondaryMessage:"La frontera reduce exposición y deja a otros definir el relato del vestuario.",primaryEffects:[n("professional.careerControl",4)],secondaryEffects:[n("professional.institutionalPower",-1)]},
    {id:"D",label:"Pedir una reunión de capitanes y dirección",intentTags:["coach","locker"],primaryMessage:"Intentas alinear vestuario y dirección sobre los días previos a la final sin decidir quién debe entrenar después.",secondaryMessage:"La reunión puede ordenar prioridades o convertirte en actor institucional de una crisis mayor.",primaryEffects:[n("professional.institutionalPower",3),n("professional.environmentStability",2)],secondaryEffects:[n("professional.publicPolarization",2)]}
  ],
  gates:[
    {path:"facts.currentClubCoachDismissedByInstitutionalCrisis",op:"eq",value:true},
    {path:"facts.majorFinalUpcoming",op:"eq",value:true}
  ],
  timeWindow:{months:[4,5]},weight:14,cooldown:99999,
  tags:["conditional","coach_crisis","a6_ready_external_blocker","needs_a1_current_club_coach_chronology_and_a4_real_final_stage","t5_42"],canonStatus:"verified"
});

export const T542_STAGED_CONDITIONAL_EVENTS:EventDefinition[]=[FAM24,STAR25,AGENT25,BODY25,SHOCK25];
