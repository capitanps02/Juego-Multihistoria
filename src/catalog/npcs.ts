import type { CanonicalNPCDefinition, NPCState, RelationshipState } from "../core/types.js";

export const NPC_CATALOG: CanonicalNPCDefinition[] = [
  { id: "NPC_DIR_01", name: "Marta Valcárcel", role: "Presidenta UDV", visibleGoal: "Modernizar sin perder control.", privateAgenda: "Necesita cerrar el agujero financiero sin admitir debilidad; puede vender proyecto de cantera y a la vez monetizarla.", evolution: "Protectora, rival institucional o salida del club.", initialClub: "UDV" },
  { id: "NPC_DIR_02", name: "Óscar Ferrer", role: "Director deportivo", visibleGoal: "Plantilla barata que sobreviva.", privateAgenda: "Su posición mejora con balance positivo de traspasos; tenderá a valorar ventas más de lo que reconoce.", evolution: "Puede llegar a un club mayor y recordar negociaciones.", initialClub: "UDV" },
  { id: "NPC_CCH_01", name: "Darío Montalbán", role: "Entrenador", visibleGoal: "Permanencia y control.", privateAgenda: "Su renovación depende del resultado inmediato; desconfía del riesgo táctico de los jóvenes.", evolution: "Puede consolidar, bloquear o reencontrar al jugador.", initialClub: "UDV" },
  { id: "NPC_CCH_02", name: "Sergio Mena", role: "Segundo entrenador", visibleGoal: "Demostrar que puede dirigir.", privateAgenda: "Ve valor en datos y jóvenes, pero no quiere quemar su carrera contradiciendo al jefe.", evolution: "Entrenador principal futuro plausible.", initialClub: "UDV" },
  { id: "NPC_ACA_01", name: "Julián Rivas", role: "Técnico de cantera", visibleGoal: "Oportunidades reales para canteranos.", privateAgenda: "Resentimiento hacia agentes y directivos que, según él, venden demasiado pronto.", evolution: "Mentor sincero pero sesgado.", initialClub: "UDV" },
  { id: "NPC_MED_01", name: "Paula Requena", role: "Fisioterapeuta", visibleGoal: "Proteger salud y disponibilidad.", privateAgenda: "Su reputación depende de no forzar jugadores; puede chocar con técnico o futbolista.", evolution: "Clave en lesiones y confidencialidad.", initialClub: "UDV" },
  { id: "NPC_PLR_10", name: "Tomás Vela", role: "Central y capitán", visibleGoal: "Cerrar su carrera con dignidad.", privateAgenda: "Valora licencias de entrenador y sospecha que quieren apartarlo para liberar salario.", evolution: "Mentor, antagonista, técnico o director años después.", initialClub: "UDV" },
  { id: "NPC_PLR_11", name: "Leo Barreiro", role: "Portero y vicecapitán", visibleGoal: "Estabilidad del grupo.", privateAgenda: "Evita guerras públicas, pero guarda memoria de quien rompe códigos de vestuario.", evolution: "Influencia interna y posible veterano de referencia.", initialClub: "UDV" },
  { id: "NPC_PLR_12", name: "Bruno Leal", role: "Extremo derecho titular", visibleGoal: "Lograr un último salto.", privateAgenda: "Compite con el protagonista y tiene una promesa privada de salida si llega una oferta razonable.", evolution: "Mentor, bloqueo, venta o rival futuro.", initialClub: "UDV" },
  { id: "NPC_PLR_13", name: "Mamadou Diarra", role: "Centrocampista", visibleGoal: "Jugar y progresar.", privateAgenda: "Observador social; comparte información si confía y evita bandos hasta que le afectan.", evolution: "Puente de vestuario y extranjero.", initialClub: "UDV" },
  { id: "NPC_PLR_14", name: "Iván «Nano» Serrano", role: "Delantero canterano", visibleGoal: "Debutar junto a su amigo.", privateAgenda: "Impulsivo; teme quedarse atrás si el protagonista despega.", evolution: "Amistad, rivalidad, caída o carrera paralela.", initialClub: "UDV" },
  { id: "NPC_PLR_15", name: "Adrián Costa", role: "Mediapunta/extremo canterano", visibleGoal: "Ser la verdadera joya de Cerro Alto.", privateAgenda: "Percibe trato desigual; una gran agencia también lo observa.", evolution: "Rival espejo o aliado inesperado.", initialClub: "UDV" },
  { id: "NPC_AGT_01", name: "Héctor Salvatierra", role: "Agente local", visibleGoal: "Conseguir un cliente bandera.", privateAgenda: "Tiene relación comercial fuerte con un club de Segunda; su mejor consejo puede beneficiarle también.", evolution: "Primer agente plausible.", initialClub: null },
  { id: "NPC_AGT_02", name: "Lucía Falcón", role: "Agente, Prisma Sports", visibleGoal: "Captar talento antes de que se encarezca.", privateAgenda: "Solo invertirá recursos fuertes en uno de los dos jóvenes; usa prensa y contactos con agresividad.", evolution: "Ruta de poder y menor cercanía.", initialClub: null },
  { id: "NPC_PRS_01", name: "Clara Beltrán", role: "Periodista local", visibleGoal: "Saltar a prensa nacional.", privateAgenda: "Necesita exclusivas; puede respetar al jugador y publicar algo que le perjudique.", evolution: "Aliada informativa o relación transaccional.", initialClub: null },
  { id: "NPC_PRS_02", name: "Raúl Carrión", role: "Locutor deportivo", visibleGoal: "Audiencia e influencia.", privateAgenda: "Premia conflicto y cambia de tono según el sentir de la afición.", evolution: "Amplificador de reputación.", initialClub: null },
  { id: "NPC_FAM_01", name: "Elena", role: "Madre", visibleGoal: "Futuro y estabilidad.", privateAgenda: "Desconfía de promesas; valora formación y contratos seguros.", evolution: "Su prudencia puede salvar o cerrar oportunidades.", initialClub: null },
  { id: "NPC_FAM_02", name: "Julián", role: "Padre", visibleGoal: "Que aproveche la oportunidad.", privateAgenda: "Exjugador regional; proyecta parte de su arrepentimiento.", evolution: "Apoyo, presión o conflicto.", initialClub: null },
  { id: "NPC_FAM_03", name: "Mara", role: "Hermana menor", visibleGoal: "Relación normal con su hermano.", privateAgenda: "Entiende redes y detecta cambios de fama que los adultos no ven.", evolution: "Termómetro social/familiar.", initialClub: null },
  { id: "NPC_SOC_01", name: "Dani Lucas", role: "Amigo de infancia", visibleGoal: "Que no desaparezca la amistad.", privateAgenda: "Busca normalidad y diversión incluso cuando el calendario lo hace arriesgado.", evolution: "Apoyo, distracción o vínculo con Valdoria.", initialClub: null }
];

const BASAL: Partial<Record<string, Partial<RelationshipState>>> = {
  NPC_CCH_01: { trust: 42, affinity: 45, respect: 45, leverage: 65 },
  NPC_CCH_02: { trust: 52, affinity: 52, respect: 55, leverage: 45 },
  NPC_ACA_01: { trust: 68, affinity: 65, respect: 76, leverage: 30 },
  NPC_PLR_10: { trust: 48, affinity: 48, respect: 50, leverage: 45 },
  NPC_PLR_12: { trust: 47, affinity: 52, respect: 52, leverage: 35 },
  NPC_PLR_14: { trust: 74, affinity: 82, respect: 58, leverage: 10 },
  NPC_PLR_15: { trust: 42, affinity: 45, respect: 54, resentment: 8, leverage: 10 },
  NPC_AGT_01: { trust: 35, affinity: 40, respect: 42, leverage: 20 },
  NPC_AGT_02: { trust: 30, affinity: 35, respect: 50, leverage: 20 },
  NPC_PRS_01: { trust: 35, affinity: 40, respect: 42, leverage: 15 },
  NPC_FAM_01: { trust: 82, affinity: 90, respect: 75, leverage: 35 },
  NPC_FAM_02: { trust: 78, affinity: 88, respect: 70, leverage: 38 },
  NPC_FAM_03: { trust: 82, affinity: 92, respect: 68, leverage: 8 },
  NPC_SOC_01: { trust: 78, affinity: 88, respect: 60, leverage: 8 }
};

export function instantiateNpcStates(): NPCState[] {
  return NPC_CATALOG.map(n => ({
    id: n.id,
    role: n.role,
    club: n.initialClub ?? null,
    careerState: "active",
    trustAxes: {},
    agenda: [n.privateAgenda],
    knowledge: {},
    reliability: 50,
    access: n.initialClub === "UDV" ? 65 : 35,
    memories: []
  }));
}

export function instantiateRelationships(): RelationshipState[] {
  return NPC_CATALOG.map(n => ({
    npcId: n.id,
    trust: BASAL[n.id]?.trust ?? 50,
    affinity: BASAL[n.id]?.affinity ?? 50,
    respect: BASAL[n.id]?.respect ?? 50,
    resentment: BASAL[n.id]?.resentment ?? 0,
    leverage: BASAL[n.id]?.leverage ?? 20,
    memories: []
  }));
}
