import type { EventDefinition, Effect, SeedTransition } from "../../../core/types.js";
import { ambiguousEvent, n } from "../18_20/helpers.js";

const intensify=(seedId:string,intensity:number):SeedTransition=>({seedId,action:"intensify",intensity});
const E=(path:string,delta:number):Effect=>n(path,delta);

export const A5_EXTERNAL_CONDITIONAL_REQUIREMENTS_20_23 = Object.freeze({
  CEVT_20_RIVAS_01:{owner:"A1/world",facts:["Rivas current institutional role and club/organization","operation involving protagonist"],forbidden:["SEED_RIVAS_TRUST creating promotion","relationship as job title"]},
  CEVT_20_VELA_01:{owner:"A1/world",facts:["Vela real staff/career transition and current role"],forbidden:["SEED_VELA_STANCE creating staff job","old club role assumed current"]},
  CEVT_20_PAULA_01:{owner:"medical/A1",facts:["compatible current injury/transfer context","authorized medical contact provenance"],forbidden:["physio seed creating injury","body.risk as diagnosis"]},
  CEVT_20_NANO_01:{owner:"A1/world",facts:["Nano real professional opportunity and current career state"],forbidden:["SEED_NANO_SHADOW creating opportunity","relationship as career fact"]},
  CEVT_20_MONT_01:{owner:"A1/world",facts:["Montalbán real current role and encounter context"],forbidden:["COACH_FIRED implying current role","SEED_COACH_PUBLIC creating employment"]},
  CEVT_20_ADR_01:{owner:"A1/A3 world",facts:["real shared-agency/operation involving Adrián and protagonist"],forbidden:["SEED_ADRIAN_MIRROR creating agency","same agent inferred from npcRefs"]},
  CEVT_21_BIGCLUB_01:{owner:"A4/medical-world",facts:["real third-party starter injury","three-match opportunity window","club request to delay loan"],forbidden:["roleScore as teammate injury","invented three-match window"]},
  CEVT_21_LOAN_01:{owner:"A3 market/contracts",facts:["registration-club real purchase interest","owner-club valuation/decision","loan ownership context"],forbidden:["loan flag as purchase offer","marketHeat as buy offer"]},
  CEVT_21_AGENT_02:{owner:"A3/A1 information provenance",facts:["real late-discovered opportunity","when agent learned it and why it was not surfaced"],forbidden:["SEED_AGENT_OMISSION creating offer","retrospective truth from choice"]},
  CEVT_21_INJ_01:{owner:"medical/A4",facts:["real relapse after recent return","medical provenance tying relapse to current episode without moral causality"],forbidden:["body.risk alone as relapse","narrative RNG injury"]},
  CEVT_22_UDV_01:{owner:"world/A3",facts:["actual UDV institutional crisis","real compatible return/loan market route"],forbidden:["exit seed creating UDV crisis","nostalgia as offer"]},
  CEVT_22_BRUNO_02:{owner:"A1/world",facts:["Bruno current specific need and authorized request"],forbidden:["SEED_BRUNO_FAVOR creating need","old favor as current crisis"]},
  CEVT_22_ADR_02:{owner:"A1/world",facts:["Adrián real tier/agency trajectory transition"],forbidden:["mirror seed changing his career","protagonist market state as Adrián fact"]},
  CEVT_22_FREE_01:{owner:"A3/world",facts:["expiring contract","real formal July preagreement interest","buyer sporting-crisis fact"],forbidden:["monthsRemaining alone as offer","marketHeat as preagreement","invented buyer crisis"]},
  CEVT_22_SOC_02:{owner:"A1/world/economy",facts:["Dani real investment proposal","project/amount/provenance"],forbidden:["moneyComfort creating proposal","SEED_DANI_NORMALITY creating business"]},
  CEVT_22_SHOCK_01:{owner:"world ownership",facts:["actual current-club ownership change with effective date/provenance"],forbidden:["random narrative shock","generic CLUB_OWNER_CHANGE without writer"]}
});

function scene(args:{
 id:string;age:[number,number|null];title:string;body:string;visible:string[];uncertain:string[];
 seedsRead?:string[];npcRefs?:string[];gates?:EventDefinition["gates"];
 choices:Array<{id:string;label:string;intentTags:string[];primaryMessage:string;secondaryMessage:string;primaryEffects?:Effect[];secondaryEffects?:Effect[];primarySeeds?:SeedTransition[];secondarySeeds?:SeedTransition[];eligibility?:EventDefinition["gates"];}>;
}):EventDefinition{
 return ambiguousEvent({
  id:args.id,ageWindow:args.age,phase:"20_23",family:"conditional",title:args.title,body:args.body,
  visible:args.visible,uncertain:args.uncertain,gates:args.gates,seedsRead:args.seedsRead,npcRefs:args.npcRefs,
  tags:["conditional","a5_ready_external_blocker","owner_complete"],canonStatus:"verified",weight:9,
  choices:args.choices.map(c=>({id:c.id,label:c.label,intentTags:c.intentTags,primaryMessage:c.primaryMessage,secondaryMessage:c.secondaryMessage,primaryEffects:c.primaryEffects,secondaryEffects:c.secondaryEffects,primarySeedTransitions:c.primarySeeds,secondarySeedTransitions:c.secondarySeeds,eligibility:c.eligibility}))
 });
}

const CEVT_20_RIVAS_01=scene({
 id:"CEVT_20_RIVAS_01",age:[20,22],title:"Rivas tiene despacho",
 body:"Rivas reaparece con responsabilidad institucional real y participa en una operación que te afecta. La memoria de confianza cambia el tono; no crea su ascenso.",
 visible:["Sabes qué cargo ocupa Rivas y qué responsabilidad tiene en la operación."],uncertain:["No sabes cuánto puede ayudarte sin incumplir su deber con la organización."],seedsRead:["SEED_RIVAS_TRUST"],npcRefs:["NPC_ACA_01"],
 choices:[
  {id:"ASK_RECOMMEND",label:"Pedirle una recomendación honesta, no un favor",intentTags:["mentor","institution"],primaryMessage:"Le permites separar afecto previo y criterio profesional.",secondaryMessage:"La conversación aporta contexto, aunque su obligación actual limita cuánto puede inclinar la operación.",primaryEffects:[E("rel.NPC_ACA_01.trust",4),E("control.career",3)],secondaryEffects:[E("control.career",2)]},
  {id:"ASK_PATIENCE",label:"Preguntar por qué te pide paciencia",intentTags:["information","mentor"],primaryMessage:"Buscas entender el calendario institucional antes de interpretar la espera como rechazo.",secondaryMessage:"La explicación puede ser sincera y seguir sin darte una solución inmediata.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("professional.environmentStability",-1)]},
  {id:"KEEP_DISTANCE",label:"Tratarlo como actor institucional y no usar la relación previa",intentTags:["boundary","institution"],primaryMessage:"Proteges la relación de una deuda implícita y aceptas que su rol actual tiene límites.",secondaryMessage:"La distancia evita conflicto de intereses y puede perder información que Rivas sí podía compartir.",primaryEffects:[E("rel.NPC_ACA_01.respect",4)],secondaryEffects:[E("control.career",-1)]}
 ]
});

const CEVT_20_VELA_01=scene({
 id:"CEVT_20_VELA_01",age:[20,22],title:"El mensaje de Vela",
 body:"Vela reaparece desde un rol profesional nuevo y te ofrece opinión o referencia. Lo que hiciste cuando estaba débil condiciona la relación, no su carrera actual.",
 visible:["Conoces el cargo real que ocupa Vela y por qué puede hablarte."],uncertain:["No sabes cuánto pesa su referencia ni si su lectura está condicionada por vuestra historia."],seedsRead:["SEED_VELA_STANCE"],npcRefs:["NPC_PLR_10"],
 choices:[
  {id:"HEAR_REFERENCE",label:"Escuchar su referencia y pedir límites concretos",intentTags:["vela","information"],primaryMessage:"Usas la relación para obtener contexto sin asumir que Vela controla la decisión.",secondaryMessage:"La referencia ayuda, pero su peso depende de una estructura que ninguno de los dos domina.",primaryEffects:[E("rel.NPC_PLR_10.trust",4),E("control.career",3)],secondaryEffects:[E("control.career",1)],primarySeeds:[intensify("SEED_VELA_STANCE",3)],secondarySeeds:[intensify("SEED_VELA_STANCE",4)]},
  {id:"DECLINE_REFERENCE",label:"Agradecerlo y no usar la referencia",intentTags:["boundary","vela"],primaryMessage:"Evitas convertir una memoria de vestuario en palanca profesional automática.",secondaryMessage:"Proteges independencia y dejas pasar una ayuda que podía ser legítima.",primaryEffects:[E("control.career",4)],secondaryEffects:[E("rel.NPC_PLR_10.affinity",-1)],primarySeeds:[intensify("SEED_VELA_STANCE",2)],secondarySeeds:[intensify("SEED_VELA_STANCE",3)]},
  {id:"ASK_HIS_VIEW",label:"Preguntarle cómo lee tu situación desde su nuevo rol",intentTags:["mentor","vela"],primaryMessage:"Buscas una mirada profesional actual, no recompensa por el pasado.",secondaryMessage:"La conversación separa memoria y presente, aunque Vela sigue viendo la carrera desde su posición concreta.",primaryEffects:[E("rel.NPC_PLR_10.respect",3),E("control.career",3)],secondaryEffects:[E("control.career",2)],primarySeeds:[intensify("SEED_VELA_STANCE",2)],secondarySeeds:[intensify("SEED_VELA_STANCE",3)]}
 ]
});

const CEVT_20_PAULA_01=scene({
 id:"CEVT_20_PAULA_01",age:[20,22],title:"Una llamada médica",
 body:"Paula puede aclarar un antecedente cuando una lesión o transferencia real lo vuelve relevante, pero solo con contacto autorizado y dentro de lo documentado.",
 visible:["Sabes qué antecedente necesita aclaración y quién solicita información."],uncertain:["Paula puede recordar contexto útil y aun limitarse correctamente a lo registrado."],seedsRead:["SEED_PHYSIO_CONFIDENCE","SEED_BODY_PRECEDENT"],npcRefs:["NPC_MED_01"],
 choices:[
  {id:"AUTHORIZE_RECORDS",label:"Autorizar que Paula comparta solo lo documentado",intentTags:["medical","privacy"],primaryMessage:"Defines un canal clínico limitado y verificable.",secondaryMessage:"La autorización protege causalidad y puede dejar fuera impresiones no registradas.",primaryEffects:[E("rel.NPC_MED_01.trust",4),E("control.career",3)],secondaryEffects:[E("control.career",2)],primarySeeds:[intensify("SEED_PHYSIO_CONFIDENCE",3)],secondarySeeds:[intensify("SEED_PHYSIO_CONFIDENCE",4)]},
  {id:"JOIN_CALL",label:"Participar en la llamada y distinguir diagnóstico de sensación",intentTags:["medical","information"],primaryMessage:"Aportas tu recuerdo sin pedir a Paula que certifique más de lo que sabe.",secondaryMessage:"La conversación gana matiz y no elimina incertidumbre clínica.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("professional.environmentStability",-1)],primarySeeds:[intensify("SEED_PHYSIO_CONFIDENCE",2)],secondarySeeds:[intensify("SEED_PHYSIO_CONFIDENCE",3)]},
  {id:"NO_CONTACT",label:"No autorizar contacto adicional y usar el informe existente",intentTags:["privacy","medical"],primaryMessage:"Mantienes la frontera de privacidad y aceptas decidir con lo ya documentado.",secondaryMessage:"La decisión es válida y puede dejar preguntas que una conversación habría aclarado.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("professional.institutionalTrust",-1)],primarySeeds:[intensify("SEED_PHYSIO_CONFIDENCE",2)],secondarySeeds:[intensify("SEED_PHYSIO_CONFIDENCE",3)]}
 ]
});

const CEVT_20_NANO_01=scene({
 id:"CEVT_20_NANO_01",age:[20,22],title:"Nano firma lejos",
 body:"Nano recibe una oportunidad profesional propia. Tu memoria compartida afecta cuánto os contáis; no crea su contrato ni decide por él.",
 visible:["Conoces la oportunidad solo en la medida en que Nano te la cuenta."],uncertain:["No sabes si quiere consejo, contacto o simplemente compartir la noticia."],seedsRead:["SEED_NANO_SHADOW"],npcRefs:["NPC_PLR_14"],
 choices:[
  {id:"ASK_WHAT_HE_WANTS",label:"Preguntarle qué necesita de ti antes de intervenir",intentTags:["nano","autonomy"],primaryMessage:"Le devuelves control sobre su oportunidad y separas escuchar de arreglar.",secondaryMessage:"La pregunta protege autonomía aunque puede sonar distante si solo buscaba apoyo.",primaryEffects:[E("rel.NPC_PLR_14.trust",5)],secondaryEffects:[E("rel.NPC_PLR_14.affinity",-1)],primarySeeds:[intensify("SEED_NANO_SHADOW",2)],secondarySeeds:[intensify("SEED_NANO_SHADOW",3)]},
  {id:"OFFER_CONTACT",label:"Ofrecer un contacto solo si él lo pide",intentTags:["nano","help"],primaryMessage:"La ayuda queda disponible sin convertirse en una intervención no solicitada.",secondaryMessage:"El límite evita repetir viejas dinámicas y puede dejar una oportunidad más pequeña.",primaryEffects:[E("rel.NPC_PLR_14.respect",4)],secondaryEffects:[E("control.career",1)],primarySeeds:[intensify("SEED_NANO_SHADOW",2)],secondarySeeds:[intensify("SEED_NANO_SHADOW",3)]},
  {id:"CELEBRATE",label:"Celebrar la noticia sin convertirla en comparación contigo",intentTags:["friendship","nano"],primaryMessage:"La oportunidad de Nano existe por sí misma y la relación recupera simetría.",secondaryMessage:"El apoyo ayuda aunque no borra de golpe años de comparación.",primaryEffects:[E("rel.NPC_PLR_14.affinity",6)],secondaryEffects:[E("rel.NPC_PLR_14.affinity",3)],primarySeeds:[intensify("SEED_NANO_SHADOW",2)],secondarySeeds:[intensify("SEED_NANO_SHADOW",3)]}
 ]
});

const CEVT_20_MONT_01=scene({
 id:"CEVT_20_MONT_01",age:[20,22],title:"Otra vez Montalbán",
 body:"Montalbán reaparece desde un rol actual certificado —rival, técnico o asesor— y recuerda tu postura pública sin dejar que esa memoria sustituya sus obligaciones presentes.",
 visible:["Sabes qué rol ocupa ahora y por qué os cruzáis."],uncertain:["No sabes cuánto pesa el pasado frente a su trabajo actual."],seedsRead:["SEED_COACH_PUBLIC"],npcRefs:["NPC_CCH_01"],
 choices:[
  {id:"ACKNOWLEDGE_HISTORY",label:"Reconocer el pasado sin pedir trato especial",intentTags:["coach","history"],primaryMessage:"Nombras la memoria compartida y dejas claro que no esperas una recompensa.",secondaryMessage:"La conversación limpia el contexto y no cambia sus deberes actuales.",primaryEffects:[E("rel.NPC_CCH_01.trust",4)],secondaryEffects:[E("rel.NPC_CCH_01.respect",3)],primarySeeds:[intensify("SEED_COACH_PUBLIC",2)],secondarySeeds:[intensify("SEED_COACH_PUBLIC",3)]},
  {id:"PROFESSIONAL_ONLY",label:"Tratar el encuentro como estrictamente profesional",intentTags:["coach","boundary"],primaryMessage:"Evitas que una postura antigua se convierta en deuda.",secondaryMessage:"La distancia protege claridad y puede parecer frialdad si la relación era cercana.",primaryEffects:[E("control.career",4)],secondaryEffects:[E("rel.NPC_CCH_01.affinity",-1)],primarySeeds:[intensify("SEED_COACH_PUBLIC",2)],secondarySeeds:[intensify("SEED_COACH_PUBLIC",3)]},
  {id:"ASK_CURRENT_VIEW",label:"Preguntarle cómo te ve ahora, no entonces",intentTags:["coach","information"],primaryMessage:"Fuerzas la conversación hacia evidencia actual.",secondaryMessage:"La opinión aporta contexto y sigue siendo la de alguien situado en un rol concreto.",primaryEffects:[E("control.career",5),E("rel.NPC_CCH_01.respect",2)],secondaryEffects:[E("control.career",3)],primarySeeds:[intensify("SEED_COACH_PUBLIC",2)],secondarySeeds:[intensify("SEED_COACH_PUBLIC",3)]}
 ]
});

const CEVT_20_ADR_01=scene({
 id:"CEVT_20_ADR_01",age:[20,22],title:"Mismo representante",
 body:"Una agencia real quiere representarte junto a Adrián o colocaros en una misma operación. La rivalidad previa cambia incentivos; no crea la relación de agencia.",
 visible:["Sabes qué agencia y operación os conectan."],uncertain:["No sabes si la comparación mejora poder negociador o vuelve a enfrentar vuestros intereses."],seedsRead:["SEED_ADRIAN_MIRROR"],npcRefs:["NPC_PLR_15"],
 choices:[
  {id:"ACCEPT_SHARED",label:"Aceptar compartir estructura con reglas de conflicto claras",intentTags:["adrian","agent"],primaryMessage:"Admites incentivos cruzados y exiges separarlos cuando compitan.",secondaryMessage:"La regla ayuda, pero una misma agencia sigue teniendo intereses múltiples.",primaryEffects:[E("control.career",5),E("rel.NPC_PLR_15.respect",2)],secondaryEffects:[E("professional.environmentStability",-1)],primarySeeds:[intensify("SEED_ADRIAN_MIRROR",3)],secondarySeeds:[intensify("SEED_ADRIAN_MIRROR",5)]},
  {id:"SEPARATE_FILES",label:"Pedir que vuestra representación y datos se mantengan separados",intentTags:["privacy","adrian"],primaryMessage:"Intentas que la comparación pública no se convierta en información comercial compartida.",secondaryMessage:"La separación protege autonomía y no elimina todos los incentivos comunes.",primaryEffects:[E("control.career",6)],secondaryEffects:[E("professional.agentControl",-1)],primarySeeds:[intensify("SEED_ADRIAN_MIRROR",2)],secondarySeeds:[intensify("SEED_ADRIAN_MIRROR",3)]},
  {id:"DECLINE_SHARED",label:"Rechazar la estructura compartida",intentTags:["boundary","adrian"],primaryMessage:"Evitas mezclar una rivalidad persistente con representación comercial.",secondaryMessage:"La decisión protege independencia y puede dejar pasar una agencia útil.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("reputation.marketHeat",-1)],primarySeeds:[intensify("SEED_ADRIAN_MIRROR",2)],secondarySeeds:[intensify("SEED_ADRIAN_MIRROR",3)]}
 ]
});

const CEVT_21_BIGCLUB_01=scene({
 id:"CEVT_21_BIGCLUB_01",age:[21,22],title:"La lesión del titular",
 body:"Una lesión real de un tercero abre una ventana deportiva de tres partidos y el club te pide retrasar una cesión. La lesión y la ventana deben venir del mundo deportivo.",
 visible:["Sabes quién se ha lesionado, cuánto dura la ventana y qué pide el club."],uncertain:["No sabes si aprovecharás los minutos ni si la oportunidad sobrevivirá al retorno."],
 choices:[
  {id:"STAY_WINDOW",label:"Quedarte para competir durante la ventana",intentTags:["minutes","bigclub"],primaryMessage:"Aceptas una oportunidad concreta sin convertirla en titularidad garantizada.",secondaryMessage:"La ventana existe y puede cerrarse sin que hayas hecho nada mal.",primaryEffects:[E("control.career",3),E("professional.environmentStability",2)],secondaryEffects:[E("professional.roleSecurity",-1)]},
  {id:"KEEP_LOAN_PLAN",label:"Mantener el plan de cesión",intentTags:["loan","control"],primaryMessage:"No dejas que una lesión ajena cambie por completo un plan de minutos ya trabajado.",secondaryMessage:"La coherencia protege control y puede hacerte perder una oportunidad interna real.",primaryEffects:[E("control.career",6)],secondaryEffects:[E("reputation.marketHeat",-1)]},
  {id:"REVIEW_AFTER_THREE",label:"Acordar revisar la salida al terminar los tres partidos",intentTags:["conditional","loan"],primaryMessage:"Vinculas la decisión a una ventana factual y acotada.",secondaryMessage:"El acuerdo reduce incertidumbre y no obliga a que el mercado siga disponible después.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("professional.environmentStability",-1)]}
 ]
});

const CEVT_21_LOAN_01=scene({
 id:"CEVT_21_LOAN_01",age:[21,22],title:"Te quieren comprar",
 body:"Tu club de cesión formula interés real de compra mientras el propietario cree que tu valor puede crecer. La conversación solo existe con ownership y valoración autoritativos.",
 visible:["Sabes quién posee tu contrato, dónde juegas y qué parte de la compra es formal."],uncertain:["No sabes cuánto subirá tu valor ni si el lugar donde juegas puede ofrecer el mismo proyecto a largo plazo."],
 choices:[
  {id:"FAVOR_BUY",label:"Pedir que escuchen seriamente la compra",intentTags:["loan","stability"],primaryMessage:"Das valor al lugar donde ya compites sin firmar nada desde narrativa.",secondaryMessage:"La preferencia puede acercar posturas y chocar con la valoración del propietario.",primaryEffects:[E("control.career",4),E("professional.environmentStability",3)],secondaryEffects:[E("professional.contractPower",-1)]},
  {id:"OWNER_PLAN",label:"Pedir al propietario su plan antes de tomar postura",intentTags:["ownership","information"],primaryMessage:"Exiges comparar proyecto y valor en lugar de decidir solo por afecto.",secondaryMessage:"La información puede aclarar el conflicto y seguir sin resolver quién cede.",primaryEffects:[E("control.career",6)],secondaryEffects:[E("professional.environmentStability",-1)]},
  {id:"NO_PRESSURE",label:"No presionar y dejar que clubes negocien",intentTags:["wait","loan"],primaryMessage:"Evitas convertir una preferencia personal en una falsa autoridad contractual.",secondaryMessage:"La neutralidad reduce fricción y deja menos control sobre el desenlace.",primaryEffects:[E("professional.environmentStability",2)],secondaryEffects:[E("control.career",-2)]}
 ]
});

const CEVT_21_AGENT_02=scene({
 id:"CEVT_21_AGENT_02",age:[21,22],title:"La oferta que llegó tarde",
 body:"Descubres que existió una oportunidad concreta antes de cerrar otra operación. La memoria de omisión solo cambia cómo interpretas el hecho; no crea la oportunidad ni decide por qué se filtró.",
 visible:["Sabes cuándo apareció la oportunidad y cuándo la conoció tu representante."],uncertain:["No sabes si era realmente mejor ni si ocultarla fue error, criterio o conflicto de interés."],seedsRead:["SEED_AGENT_OMISSION"],gates:[{path:"facts.activeAgentNpcId",op:"exists"}],
 choices:[
  {id:"ASK_TIMELINE",label:"Pedir cronología completa y criterio usado",intentTags:["agent","evidence"],primaryMessage:"Conviertes la discrepancia en una revisión de proceso.",secondaryMessage:"La cronología aclara decisiones y puede seguir dejando una zona de juicio profesional.",primaryEffects:[E("control.career",7)],secondaryEffects:[E("professional.agentControl",-1)],primarySeeds:[intensify("SEED_AGENT_OMISSION",3)],secondarySeeds:[intensify("SEED_AGENT_OMISSION",4)]},
  {id:"ACCEPT_JUDGMENT",label:"Aceptar que el agente la descartó por criterio profesional",intentTags:["agent","trust"],primaryMessage:"Das margen a la representación sin afirmar que la oportunidad era irrelevante.",secondaryMessage:"La confianza evita ruptura y aumenta el coste de una futura omisión parecida.",primaryEffects:[E("professional.agentControl",4)],secondaryEffects:[E("control.career",-2)],primarySeeds:[intensify("SEED_AGENT_OMISSION",3)],secondarySeeds:[intensify("SEED_AGENT_OMISSION",5)]},
  {id:"NEW_RULE",label:"Fijar que toda oportunidad seria debe comunicarse",intentTags:["agent","boundary"],primaryMessage:"No juzgas el pasado como fraude; cambias la regla para el futuro.",secondaryMessage:"La regla aumenta transparencia y puede ralentizar decisiones rápidas.",primaryEffects:[E("control.career",6),E("professional.agentControl",1)],secondaryEffects:[E("professional.environmentStability",-1)],primarySeeds:[intensify("SEED_AGENT_OMISSION",2)],secondarySeeds:[intensify("SEED_AGENT_OMISSION",3)]}
 ]
});

const CEVT_21_INJ_01=scene({
 id:"CEVT_21_INJ_01",age:[21,22],title:"La recaída estadísticamente improbable",
 body:"Una acción normal produce una recaída real después de un retorno reciente. El evento médico ya ocurrió fuera de narrativa y no se presenta como castigo por la decisión anterior.",
 visible:["Conoces el diagnóstico de recaída y su relación temporal con el retorno."],uncertain:["No sabes cuánto pesa mala suerte, carga o vulnerabilidad previa dentro de los límites médicos disponibles."],seedsRead:["SEED_BODY_PRECEDENT","SEED_MEDICAL_DISCLOSURE"],
 choices:[
  {id:"REBUILD_PLAN",label:"Aceptar un plan de reconstrucción sin buscar culpables",intentTags:["medical","recovery"],primaryMessage:"Tratas la recaída como hecho clínico y no como veredicto moral.",secondaryMessage:"La respuesta estabiliza el proceso y no recupera el tiempo perdido.",primaryEffects:[E("control.career",3),E("professional.environmentStability",3)],secondaryEffects:[E("professional.environmentStability",1)],primarySeeds:[intensify("SEED_BODY_PRECEDENT",4)],secondarySeeds:[intensify("SEED_BODY_PRECEDENT",5)]},
  {id:"SECOND_REVIEW",label:"Pedir revisión externa del retorno y las cargas",intentTags:["medical","information"],primaryMessage:"Buscas causalidad clínica sin inventarla a partir de riesgo genérico.",secondaryMessage:"La revisión puede detectar un ajuste o confirmar que la recaída era plausible pese a un buen plan.",primaryEffects:[E("control.career",6)],secondaryEffects:[E("professional.environmentStability",-1)],primarySeeds:[intensify("SEED_MEDICAL_DISCLOSURE",3)],secondarySeeds:[intensify("SEED_MEDICAL_DISCLOSURE",4)]},
  {id:"RESET_EXPECTATIONS",label:"Revisar expectativas deportivas mientras te recuperas",intentTags:["career","recovery"],primaryMessage:"Adaptas calendario y presión a un hecho médico nuevo.",secondaryMessage:"Reducir expectativas protege estabilidad y puede enfriar mercado temporalmente.",primaryEffects:[E("professional.environmentStability",4)],secondaryEffects:[E("reputation.marketHeat",-2)],primarySeeds:[intensify("SEED_BODY_PRECEDENT",3)],secondarySeeds:[intensify("SEED_BODY_PRECEDENT",4)]}
 ]
});

const CEVT_22_UDV_01=scene({
 id:"CEVT_22_UDV_01",age:[22,22],title:"La llamada de casa",
 body:"UDV atraviesa una crisis institucional real y pregunta por una cesión o regreso temporal compatible con tu situación. La memoria de salida afecta el tono, no crea la crisis ni una oferta.",
 visible:["Sabes qué crisis existe y qué tipo de contacto ha hecho UDV."],uncertain:["No sabes cuánto de la llamada es necesidad deportiva, política o ambas."],seedsRead:["SEED_EXIT_STYLE_UDV"],
 choices:[
  {id:"ASK_FORMAL",label:"Pedir términos concretos antes de hablar de volver",intentTags:["home","market","information"],primaryMessage:"Separar nostalgia y propuesta te permite evaluar un regreso real.",secondaryMessage:"La claridad puede demostrar que aún no existe una operación firmable.",primaryEffects:[E("control.career",6)],secondaryEffects:[E("professional.environmentStability",-1)],primarySeeds:[intensify("SEED_EXIT_STYLE_UDV",3)],secondarySeeds:[intensify("SEED_EXIT_STYLE_UDV",4)]},
  {id:"TEMPORARY_ONLY",label:"Mostrar apertura solo a un regreso temporal",intentTags:["home","loan","boundary"],primaryMessage:"Definirías alcance si A3 materializa términos compatibles.",secondaryMessage:"La postura reduce riesgo de sentimentalismo y puede no encajar con lo que UDV necesita.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("reputation.marketHeat",-1)],primarySeeds:[intensify("SEED_EXIT_STYLE_UDV",3)],secondarySeeds:[intensify("SEED_EXIT_STYLE_UDV",4)]},
  {id:"DECLINE_NOSTALGIA",label:"Rechazar que la historia pese más que tu situación actual",intentTags:["home","boundary"],primaryMessage:"Mantienes el vínculo simbólico separado de una decisión profesional.",secondaryMessage:"La negativa protege tu ruta y puede enfriar parte de la relación con casa.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("professional.environmentStability",-2)],primarySeeds:[intensify("SEED_EXIT_STYLE_UDV",2)],secondarySeeds:[intensify("SEED_EXIT_STYLE_UDV",3)]}
 ]
});

const CEVT_22_BRUNO_02=scene({
 id:"CEVT_22_BRUNO_02",age:[22,22],title:"Ahora te pide él",
 body:"Bruno tiene una necesidad actual concreta y te pide que hables con alguien por él. El favor antiguo modifica la deuda relacional; no crea su problema.",
 visible:["Sabes qué necesita Bruno y qué acción concreta te pide."],uncertain:["No sabes si tu intervención ayudará o convertirá amistad y mercado en la misma cosa."],seedsRead:["SEED_BRUNO_FAVOR"],npcRefs:["NPC_PLR_12"],
 choices:[
  {id:"HELP_DIRECT",label:"Ayudar dentro del límite exacto que te pide",intentTags:["bruno","favor"],primaryMessage:"Devuelves parte del favor sin prometer un resultado que no controlas.",secondaryMessage:"La ayuda puede funcionar profesionalmente y mezclar más vuestra relación con intermediación.",primaryEffects:[E("rel.NPC_PLR_12.trust",6)],secondaryEffects:[E("rel.NPC_PLR_12.leverage",3)],primarySeeds:[intensify("SEED_BRUNO_FAVOR",4)],secondarySeeds:[intensify("SEED_BRUNO_FAVOR",6)]},
  {id:"ASK_CONTEXT",label:"Pedir contexto antes de poner tu nombre",intentTags:["bruno","information"],primaryMessage:"Proteges a ambos de una recomendación que no entiendes.",secondaryMessage:"La prudencia conserva credibilidad y puede sentirse como falta de reciprocidad.",primaryEffects:[E("control.career",4),E("rel.NPC_PLR_12.respect",3)],secondaryEffects:[E("rel.NPC_PLR_12.affinity",-1)],primarySeeds:[intensify("SEED_BRUNO_FAVOR",3)],secondarySeeds:[intensify("SEED_BRUNO_FAVOR",4)]},
  {id:"DECLINE_KINDLY",label:"Negarte sin presentar el favor antiguo como deuda",intentTags:["bruno","boundary"],primaryMessage:"No conviertes la memoria del favor en obligación permanente.",secondaryMessage:"La frontera es legítima y puede doler si Bruno esperaba reciprocidad.",primaryEffects:[E("control.career",4)],secondaryEffects:[E("rel.NPC_PLR_12.trust",-2)],primarySeeds:[intensify("SEED_BRUNO_FAVOR",2)],secondarySeeds:[intensify("SEED_BRUNO_FAVOR",3)]}
 ]
});

const CEVT_22_ADR_02=scene({
 id:"CEVT_22_ADR_02",age:[22,22],title:"Adrián te adelanta",
 body:"Adrián sube de nivel o cambia de estructura profesional de forma real. La comparación cambia porque su trayectoria cambió, no porque tu seed lo empuje.",
 visible:["Conoces el hecho concreto de su progresión."],uncertain:["No sabes cuánto afectará a tu mercado, agencia o relación personal."],seedsRead:["SEED_ADRIAN_MIRROR"],npcRefs:["NPC_PLR_15"],
 choices:[
  {id:"CONGRATULATE",label:"Felicitarle sin convertirlo en comparación contigo",intentTags:["adrian","respect"],primaryMessage:"Reconoces su progreso como hecho propio.",secondaryMessage:"El gesto protege relación y no elimina el relato comparativo externo.",primaryEffects:[E("rel.NPC_PLR_15.affinity",5)],secondaryEffects:[E("reputation.mediaHeat",1)],primarySeeds:[intensify("SEED_ADRIAN_MIRROR",2)],secondarySeeds:[intensify("SEED_ADRIAN_MIRROR",3)]},
  {id:"AGENT_BOUNDARY",label:"Pedir a tu agente que no use su éxito para presionarte",intentTags:["adrian","agent","boundary"],eligibility:[{path:"facts.activeAgentNpcId",op:"exists"}],primaryMessage:"Separar carreras evita que un tercero convierta su salto en argumento automático sobre la tuya.",secondaryMessage:"La regla protege autonomía y puede reducir una palanca negociadora real.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("professional.agentControl",-1)],primarySeeds:[intensify("SEED_ADRIAN_MIRROR",2)],secondarySeeds:[intensify("SEED_ADRIAN_MIRROR",3)]},
  {id:"USE_AS_BENCHMARK",label:"Usarlo como referencia deportiva, no como amenaza personal",intentTags:["adrian","competition"],primaryMessage:"La comparación te aporta información sin convertirla en resentimiento.",secondaryMessage:"El benchmark puede motivarte y aumentar presión si el entorno insiste en medir ambas carreras juntas.",primaryEffects:[E("control.career",3)],secondaryEffects:[E("professional.environmentStability",-2)],primarySeeds:[intensify("SEED_ADRIAN_MIRROR",3)],secondarySeeds:[intensify("SEED_ADRIAN_MIRROR",5)]}
 ]
});

const CEVT_22_FREE_01=scene({
 id:"CEVT_22_FREE_01",age:[22,22],title:"Oferta de enero para julio",
 body:"Con contrato próximo a expirar, un club formula interés formal para julio mientras atraviesa una crisis deportiva real. Ni el preacuerdo ni la crisis se deducen de marketHeat.",
 visible:["Conoces los términos formales y el hecho deportivo que complica el proyecto."],uncertain:["No sabes cómo estará ese club en julio ni si aparecerán alternativas mejores."],
 choices:[
  {id:"ACCEPT_PREAGREEMENT",label:"Aceptar el preacuerdo si sus términos siguen siendo firmables",intentTags:["free_agent","security"],primaryMessage:"Priorizas certeza contractual con la información disponible.",secondaryMessage:"La seguridad tiene valor y te ata a un proyecto cuyo contexto puede cambiar antes de julio.",primaryEffects:[E("professional.environmentStability",4)],secondaryEffects:[E("control.career",-2)]},
  {id:"WAIT_PROJECT",label:"Esperar a saber cómo evoluciona la crisis deportiva",intentTags:["free_agent","wait"],primaryMessage:"Mantienes opcionalidad y asumes que el interés formal puede caducar.",secondaryMessage:"Esperar compra información y puede dejarte sin la propuesta.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("reputation.marketHeat",-2)]},
  {id:"ASK_PROTECTION",label:"Pedir una protección si el proyecto cambia antes de julio",intentTags:["free_agent","contract"],primaryMessage:"Intentas convertir una incertidumbre deportiva en término verificable si A3 lo soporta.",secondaryMessage:"La protección mejora control y puede ser incompatible con la propuesta.",primaryEffects:[E("professional.contractPower",5)],secondaryEffects:[E("professional.institutionalTrust",-2)]},
  {id:"DECLINE",label:"Rechazar y mantenerte abierto a otras opciones",intentTags:["free_agent","control"],primaryMessage:"Renuncias a certeza para conservar libertad.",secondaryMessage:"La libertad puede abrir mejores rutas o dejarte negociando más tarde con menos margen.",primaryEffects:[E("control.career",6)],secondaryEffects:[E("professional.environmentStability",-2)]}
 ]
});

const CEVT_22_SOC_02=scene({
 id:"CEVT_22_SOC_02",age:[22,22],title:"El negocio de Dani",
 body:"Dani presenta un proyecto pequeño y una cantidad concreta de inversión. La amistad previa afecta confianza; no crea el negocio ni garantiza éxito o fraude.",
 visible:["Conoces proyecto, importe y papel que Dani espera de ti."],uncertain:["No sabes si funcionará ni cómo cambiará la amistad si pierde dinero."],seedsRead:["SEED_DANI_NORMALITY"],npcRefs:["NPC_SOC_01"],
 choices:[
  {id:"SMALL_INVEST",label:"Invertir una cantidad limitada y asumible",intentTags:["dani","money","support"],primaryMessage:"Participas sin convertir la amistad en garantía de rentabilidad.",secondaryMessage:"El límite reduce exposición económica y no evita tensiones si el proyecto falla.",primaryEffects:[E("rel.NPC_SOC_01.trust",4)],secondaryEffects:[E("rel.NPC_SOC_01.resentment",2)],primarySeeds:[intensify("SEED_DANI_NORMALITY",3)],secondarySeeds:[intensify("SEED_DANI_NORMALITY",4)]},
  {id:"ASK_PLAN",label:"Pedir un plan básico antes de decidir",intentTags:["dani","information"],primaryMessage:"Tratas el proyecto como propuesta real sin humillar a tu amigo.",secondaryMessage:"Pedir datos protege decisión y puede sentirse como examen personal.",primaryEffects:[E("control.career",5),E("rel.NPC_SOC_01.respect",2)],secondaryEffects:[E("rel.NPC_SOC_01.affinity",-1)],primarySeeds:[intensify("SEED_DANI_NORMALITY",2)],secondarySeeds:[intensify("SEED_DANI_NORMALITY",3)]},
  {id:"DECLINE_MONEY",label:"No mezclar dinero y amistad",intentTags:["dani","boundary"],primaryMessage:"Rechazas la inversión sin juzgar el proyecto como fraude.",secondaryMessage:"La frontera puede proteger la relación o sentirse como falta de confianza.",primaryEffects:[E("control.career",4)],secondaryEffects:[E("rel.NPC_SOC_01.trust",-2)],primarySeeds:[intensify("SEED_DANI_NORMALITY",2)],secondarySeeds:[intensify("SEED_DANI_NORMALITY",3)]}
 ]
});

const CEVT_22_SHOCK_01=scene({
 id:"CEVT_22_SHOCK_01",age:[22,22],title:"El club cambia de dueño",
 body:"Una compra real del club cambia prioridades institucionales en semanas. La adquisición debe estar materializada por el mundo; narrativa no lanza un cisne negro por RNG.",
 visible:["Sabes quién compra, cuándo entra y qué decisiones ha anunciado de verdad."],uncertain:["No sabes qué promesas sobrevivirán ni qué personas conservarán poder."],
 choices:[
  {id:"ASK_MEETING",label:"Pedir una reunión para saber qué cambia en tu situación",intentTags:["ownership","information"],primaryMessage:"Buscas hechos sobre rol y contrato sin asumir que todo el proyecto anterior murió.",secondaryMessage:"La reunión aporta información parcial mientras la nueva propiedad todavía decide.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("professional.environmentStability",-1)]},
  {id:"WAIT_ACTIONS",label:"Esperar decisiones concretas antes de reaccionar",intentTags:["ownership","wait"],primaryMessage:"No conviertes titulares de compra en hechos sobre tu carrera.",secondaryMessage:"Esperar evita especular y deja que otros ganen posición durante la transición.",primaryEffects:[E("professional.environmentStability",2)],secondaryEffects:[E("control.career",-2)]},
  {id:"SOUND_MARKET",label:"Pedir al agente que mida alternativas sin presentar una salida",intentTags:["ownership","agent","market"],eligibility:[{path:"facts.activeAgentNpcId",op:"exists"}],primaryMessage:"Aumentas información sin fingir que ya decidiste marcharte.",secondaryMessage:"El sondeo protege opcionalidad y puede llegar a una nueva dirección especialmente sensible.",primaryEffects:[E("control.career",5)],secondaryEffects:[E("professional.institutionalTrust",-2)]},
  {id:"PUBLIC_CALM",label:"No valorar la compra públicamente hasta conocer hechos",intentTags:["ownership","press"],primaryMessage:"Evitas respaldar o atacar un proyecto que todavía no conoces.",secondaryMessage:"La prudencia reduce errores y puede interpretarse como distancia.",primaryEffects:[E("reputation.mediaHeat",-2)],secondaryEffects:[E("reputation.mediaHeat",1)]}
 ]
});

export const A5_EXTERNAL_CONDITIONALS_20_23: EventDefinition[]=[
 CEVT_20_RIVAS_01,CEVT_20_VELA_01,CEVT_20_PAULA_01,CEVT_20_NANO_01,CEVT_20_MONT_01,CEVT_20_ADR_01,
 CEVT_21_BIGCLUB_01,CEVT_21_LOAN_01,CEVT_21_AGENT_02,CEVT_21_INJ_01,
 CEVT_22_UDV_01,CEVT_22_BRUNO_02,CEVT_22_ADR_02,CEVT_22_FREE_01,CEVT_22_SOC_02,CEVT_22_SHOCK_01
];
