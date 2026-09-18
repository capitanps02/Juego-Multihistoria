import type { EventDefinition, SeedTransition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const intensify = (seedId: string, intensity: number): SeedTransition => ({ seedId, action: "intensify", intensity });

export const A5_MEDICAL_EXTERNAL_REQUIREMENTS = Object.freeze({
  EVT_20_MED_001: {
    owner: "medical/shared-world",
    awaiting: ["current medical-service context", "recorded diagnosis vs unrecorded discomfort provenance"],
    forbidden: ["body.risk as diagnosis", "fatigue as diagnosis", "SEED_BODY_PRECEDENT as current medical record"]
  },
  EVT_21_MED_001: {
    owner: "medical/A4",
    awaiting: ["real high-value fixture", "compatible current diagnosis", "pain level", "medical recommendation"],
    forbidden: ["role/form as match importance", "injuryCount as diagnosis", "body.risk as treatment eligibility"]
  },
  EVT_22_MED_001: {
    owner: "medical/A3",
    awaiting: ["advanced real transfer", "requested imaging/exam", "historical finding provenance", "live buyer/time context"],
    forbidden: ["marketHeat as transfer", "generic medical risk as MRI finding", "invented second buyer"]
  }
});

const EVT_20_MED_001 = ambiguousEvent({
  id:"EVT_20_MED_001",ageWindow:[20,20],phase:"20_23",family:"medical",
  title:"El historial que viaja contigo",
  body:"Un nuevo servicio médico te pregunta por episodios del año anterior. Algunas cosas fueron diagnósticos registrados; otras fueron molestias que quizá solo conoció Paula. El juego no puede convertir riesgo agregado en un diagnóstico que nunca existió.",
  visible:["Sabes qué episodios están documentados solo cuando la autoridad médica los acredita.","Puedes decidir cuánto contexto adicional das sobre molestias no diagnosticadas."],
  uncertain:["No sabes qué documentación recibió el nuevo club ni cuánto peso dará a una omisión menor.","Más transparencia puede generar confianza o pruebas adicionales."],
  weight:13,
  choices:[
    {id:"FULL_DETAIL",label:"Contarlo todo con detalle",intentTags:["medical","transparency"],primaryMessage:"Entregas contexto completo y facilitas que el nuevo equipo médico evalúe con toda la información disponible.",secondaryMessage:"La transparencia evita dudas de credibilidad, aunque puede abrir pruebas adicionales antes de darte por disponible.",primaryEffects:[n("control.career",3),n("body.risk",-2)],secondaryEffects:[n("control.career",2)],primarySeedTransitions:[seedCreate("SEED_MEDICAL_DISCLOSURE",62,{stance:"full_detail"})],secondarySeedTransitions:[seedCreate("SEED_MEDICAL_DISCLOSURE",66,{stance:"full_detail",extra_checks:true})]},
    {id:"DIAGNOSED_ONLY",label:"Responder solo a lo que figure como diagnóstico",intentTags:["medical","privacy","records"],primaryMessage:"Te ciñes al historial formal y separas diagnóstico de molestias que nunca tuvieron esa categoría.",secondaryMessage:"La respuesta es defendible, pero un informe posterior puede hacer que parezca más selectiva de lo que pretendías.",primaryEffects:[n("control.career",4)],secondaryEffects:[n("control.career",2),n("professional.environmentStability",-1)],primarySeedTransitions:[seedCreate("SEED_MEDICAL_DISCLOSURE",56,{stance:"diagnosed_only"})],secondarySeedTransitions:[seedCreate("SEED_MEDICAL_DISCLOSURE",61,{stance:"diagnosed_only",credibility_risk:true})]},
    {id:"MINIMIZE",label:"Minimizar un episodio que consideras irrelevante",intentTags:["medical","minimize","risk"],primaryMessage:"Tratas una molestia no diagnosticada como un episodio menor, sin afirmar que no existió.",secondaryMessage:"Si aparece documentación más tarde, el problema puede pasar de médico a credibilidad.",primaryEffects:[n("control.career",1)],secondaryEffects:[n("body.risk",2),n("professional.environmentStability",-3)],primarySeedTransitions:[seedCreate("SEED_MEDICAL_DISCLOSURE",64,{stance:"minimize"})],secondarySeedTransitions:[seedCreate("SEED_MEDICAL_DISCLOSURE",72,{stance:"minimize",credibility_risk:true})]},
    {id:"ASK_RECORDS",label:"Preguntar primero qué información médica han recibido",intentTags:["medical","information","privacy"],primaryMessage:"Pides saber qué expediente ya existe antes de añadir contexto nuevo.",secondaryMessage:"La prudencia mejora información, aunque puede sonar defensiva si el staff esperaba una respuesta directa.",primaryEffects:[n("control.career",6)],secondaryEffects:[n("control.career",4),n("professional.environmentStability",-1)],primarySeedTransitions:[seedCreate("SEED_MEDICAL_DISCLOSURE",55,{stance:"ask_records"})],secondarySeedTransitions:[seedCreate("SEED_MEDICAL_DISCLOSURE",58,{stance:"ask_records",defensive_read:true})]}
  ],
  seedsRead:["SEED_BODY_PRECEDENT","SEED_PHYSIO_CONFIDENCE"],seedsWrite:["SEED_MEDICAL_DISCLOSURE"],
  tags:["medical","history","privacy","a5_ready_external_blocker"],canonStatus:"verified"
});

const EVT_21_MED_001 = ambiguousEvent({
  id:"EVT_21_MED_001",ageWindow:[21,21],phase:"20_23",family:"medical",
  title:"La inyección",
  body:"Antes de un partido realmente importante, el médico ofrece analgesia o infiltración permitida para jugar con dolor controlado y deja claro que el tratamiento no repara la lesión. La escena exige diagnóstico, dolor, recomendación y partido reales.",
  visible:["Conoces el diagnóstico y la recomendación médica cuando la autoridad los materializa.","El partido debe estar acreditado como de alto valor y tú debes poder participar."],
  uncertain:["No sabes cómo responderá tu cuerpo ni cuándo volverás a tener una oportunidad comparable.","Jugar con tratamiento puede salir bien y aun así no cambiar la naturaleza de la lesión."],
  weight:13,
  choices:[
    {id:"PLAY_TREATMENT",label:"Jugar con el tratamiento",intentTags:["medical","risk","match"],primaryMessage:"Aceptas el alivio sintomático sabiendo que no equivale a curación.",secondaryMessage:"La decisión te mantiene disponible, pero puede alargar la recuperación si el cuerpo responde peor de lo esperado.",primaryEffects:[n("body.risk",4),n("control.career",2)],secondaryEffects:[n("body.risk",9),n("professional.environmentStability",-2)],primarySeedTransitions:[intensify("SEED_MEDICAL_DISCLOSURE",4),intensify("SEED_BODY_PRECEDENT",4)],secondarySeedTransitions:[intensify("SEED_MEDICAL_DISCLOSURE",6),intensify("SEED_BODY_PRECEDENT",8)]},
    {id:"UNAVAILABLE",label:"Declararte no disponible",intentTags:["medical","protect","availability"],primaryMessage:"Proteges recuperación y renuncias a una ventana deportiva sin fingir que el partido deja de importar.",secondaryMessage:"La decisión reduce riesgo físico, pero otra persona ocupa un espacio competitivo real.",primaryEffects:[n("body.risk",-7),n("professional.environmentStability",2)],secondaryEffects:[n("body.risk",-5),n("sport.roleScore",-3)],primarySeedTransitions:[intensify("SEED_MEDICAL_DISCLOSURE",3),intensify("SEED_BODY_PRECEDENT",2)],secondarySeedTransitions:[intensify("SEED_MEDICAL_DISCLOSURE",4)]},
    {id:"SECOND_OPINION",label:"Pedir una segunda opinión rápida",intentTags:["medical","information"],primaryMessage:"Buscas información adicional antes de asumir el riesgo del tratamiento.",secondaryMessage:"La segunda opinión puede confirmar el plan y consumir parte del tiempo de decisión.",primaryEffects:[n("control.career",5),n("body.risk",-2)],secondaryEffects:[n("control.career",3)],primarySeedTransitions:[intensify("SEED_MEDICAL_DISCLOSURE",2)],secondarySeedTransitions:[intensify("SEED_MEDICAL_DISCLOSURE",3)]},
    {id:"TRAIN_EVE",label:"Aceptar solo si entrenas sin empeorar en la víspera",intentTags:["medical","conditional","evidence"],primaryMessage:"Conviertes la disponibilidad en una condición observable en vez de una promesa.",secondaryMessage:"La prueba aporta evidencia y puede demostrar que todavía no estás listo.",primaryEffects:[n("control.career",5),n("body.risk",-1)],secondaryEffects:[n("body.risk",-3),n("sport.roleScore",-2)],primarySeedTransitions:[intensify("SEED_MEDICAL_DISCLOSURE",3),intensify("SEED_BODY_PRECEDENT",2)],secondarySeedTransitions:[intensify("SEED_MEDICAL_DISCLOSURE",4)]}
  ],
  seedsRead:["SEED_MEDICAL_DISCLOSURE","SEED_BODY_PRECEDENT"],seedsWrite:["SEED_MEDICAL_DISCLOSURE","SEED_BODY_PRECEDENT"],
  tags:["medical","high_value_match","treatment","a5_ready_external_blocker"],canonStatus:"verified"
});

const EVT_22_MED_001 = ambiguousEvent({
  id:"EVT_22_MED_001",ageWindow:[22,22],phase:"20_23",family:"medical",
  title:"La resonancia antes de firmar",
  body:"Una transferencia avanzada queda condicionada a pruebas adicionales por una señal histórica. La prueba, la operación y el comprador deben ser reales; el juego no puede fabricar un hallazgo médico a partir de riesgo genérico.",
  visible:["Sabes qué prueba adicional pide el comprador y que la operación depende del reconocimiento cuando esas facts existen.","Tu historial de disclosure puede afectar credibilidad, no crear una lesión."],
  uncertain:["No sabes si el hallazgo tendrá relevancia clínica ni cuánto tiempo tolerará el comprador.","Tampoco sabes si existe de verdad una alternativa de mercado distinta."],
  weight:13,
  choices:[
    {id:"ALL_TESTS",label:"Hacer todas las pruebas",intentTags:["medical","transparency","transfer"],primaryMessage:"Aceptas ampliar el reconocimiento y dejas que el resultado médico real determine la siguiente decisión.",secondaryMessage:"Más pruebas pueden despejar dudas o consumir tiempo suficiente para complicar la operación.",primaryEffects:[n("control.career",3)],secondaryEffects:[n("professional.environmentStability",-2)],primarySeedTransitions:[seedCreate("SEED_MEDICAL_DISCLOSURE",66,{stance:"all_tests"})],secondarySeedTransitions:[seedCreate("SEED_MEDICAL_DISCLOSURE",70,{stance:"all_tests",timing_cost:true})]},
    {id:"SECOND_OPINION",label:"Aportar una segunda opinión propia en paralelo",intentTags:["medical","second_opinion","transfer"],primaryMessage:"Añades evidencia médica independiente sin pedir que el comprador ignore sus propias pruebas.",secondaryMessage:"La segunda opinión puede aclarar el hallazgo o aumentar el desacuerdo técnico antes del cierre.",primaryEffects:[n("control.career",5)],secondaryEffects:[n("professional.environmentStability",-1)],primarySeedTransitions:[seedCreate("SEED_MEDICAL_DISCLOSURE",64,{stance:"second_opinion"})],secondarySeedTransitions:[seedCreate("SEED_MEDICAL_DISCLOSURE",68,{stance:"second_opinion",disagreement:true})]},
    {id:"SIGN_LATER_REVIEW",label:"Presionar para firmar condicionado a revisión posterior",intentTags:["medical","contract","pressure"],primaryMessage:"Intentas separar la firma del calendario de pruebas, pero solo A3 puede convertirlo en un término formal.",secondaryMessage:"La presión puede acelerar el cierre o hacer que el comprador considere que el riesgo no compensa.",primaryEffects:[n("professional.contractPower",3),n("control.career",3)],secondaryEffects:[n("professional.environmentStability",-3)],primarySeedTransitions:[seedCreate("SEED_MEDICAL_DISCLOSURE",70,{stance:"conditional_sign"})],secondarySeedTransitions:[seedCreate("SEED_MEDICAL_DISCLOSURE",74,{stance:"conditional_sign",buyer_doubt:true})]},
    {id:"WITHDRAW",label:"Retirarte si sientes que dudan demasiado de ti",intentTags:["medical","withdraw","control"],primaryMessage:"Cortas una negociación que percibes como incompatible con el nivel de confianza que quieres.",secondaryMessage:"La retirada protege control y puede ser una mala lectura de prudencia médica legítima.",primaryEffects:[n("control.career",6)],secondaryEffects:[n("reputation.marketHeat",-3)],primarySeedTransitions:[seedCreate("SEED_MEDICAL_DISCLOSURE",60,{stance:"withdraw"})],secondarySeedTransitions:[seedCreate("SEED_MEDICAL_DISCLOSURE",64,{stance:"withdraw",misread_risk:true})]}
  ],
  seedsRead:["SEED_MEDICAL_DISCLOSURE"],seedsWrite:["SEED_MEDICAL_DISCLOSURE"],
  tags:["medical","transfer_exam","a5_ready_external_blocker"],canonStatus:"verified"
});

export const A5_MEDICAL_OWNER_READY_PRINCIPALS: EventDefinition[] = [
  EVT_20_MED_001, EVT_21_MED_001, EVT_22_MED_001
];
