import type { EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n } from "../18_20/helpers.js";

const LOCKER = ambiguousEvent({
  id: "EVT_23_LOCK_001",
  ageWindow: [23, 23],
  phase: "23_26",
  family: "team",
  title: "Las cuatro de la mañana",
  body: "Un compañero importante teme llegar tarde después de una noche fuera y te pide una coartada falsa: que cenabais juntos y que el tráfico os retrasó. Sabes que esa versión no es cierta.",
  visible: [
    "Sabes que la coartada que te pide es falsa y que no hay un delito ni una situación de seguridad en curso."
  ],
  uncertain: [
    "No sabes si el club ya tiene pruebas del retraso ni si ese compañero te protegería a ti en una situación parecida."
  ],
  choices: [
    {
      id: "A",
      label: "Cubrirle",
      intentTags: ["locker_loyalty", "false_cover"],
      primaryMessage: "Sostienes la coartada. Dentro del vestuario el gesto puede leerse como lealtad, pero también aceptas que tu credibilidad quede ligada a una versión que sabes falsa.",
      secondaryMessage: "La versión empieza a hacer agua y el coste deja de ser solo suyo: haberla respaldado reduce tu margen frente al staff y convierte un favor de vestuario en un riesgo propio.",
      primaryEffects: [n("professional.lockerPower", 4), n("professional.environmentStability", 2), n("professional.institutionalTrust", -2)],
      secondaryEffects: [n("professional.lockerPower", -2), n("professional.environmentStability", -3), n("professional.institutionalTrust", -5)]
    },
    {
      id: "B",
      label: "Negarte pero no avisar a nadie",
      intentTags: ["boundary", "locker_discretion"],
      primaryMessage: "Te niegas a mentir y mantienes el asunto dentro de la conversación privada. Marcas un límite sin convertirte en acusador ni garante de su versión.",
      secondaryMessage: "El límite protege tu credibilidad, pero el compañero interpreta que no puede contar contigo cuando el vestuario se cierra sobre sí mismo.",
      primaryEffects: [n("professional.careerControl", 3), n("professional.institutionalTrust", 1), n("professional.lockerPower", -1)],
      secondaryEffects: [n("professional.careerControl", 2), n("professional.environmentStability", -2), n("professional.lockerPower", -3)]
    },
    {
      id: "C",
      label: "Decirle que admita el retraso y ofrecer acompañarlo",
      intentTags: ["accountability", "locker_support"],
      primaryMessage: "No avalas la mentira y le ofreces estar a su lado si decide asumir el retraso. La salida conserva apoyo personal sin trasladar al club una versión falsa.",
      secondaryMessage: "El compañero acepta que no mentirás, aunque vive la propuesta de admitirlo como una presión que quizá no te correspondía ejercer.",
      primaryEffects: [n("professional.environmentStability", 4), n("professional.institutionalTrust", 3), n("professional.lockerPower", 2)],
      secondaryEffects: [n("professional.environmentStability", 1), n("professional.institutionalTrust", 2), n("professional.lockerPower", -1)]
    },
    {
      id: "D",
      label: "Avisar al capitán para que gestione antes de que llegue al técnico",
      intentTags: ["captain_channel", "locker_governance"],
      eligibility: [{ path: "facts.lockerCaptainAffinity", op: "exists" }],
      primaryMessage: "Trasladas el problema al capitán antes de que llegue al cuerpo técnico. Si existe margen interno, la jerarquía del vestuario puede contener el daño sin que tú fabriques una coartada.",
      secondaryMessage: "El capitán conoce el problema, pero el compañero puede interpretar la escalada como una delación aunque tu intención fuese resolverlo dentro del grupo.",
      primaryEffects: [n("professional.institutionalTrust", 3), n("professional.environmentStability", 2), n("professional.lockerPower", 1)],
      secondaryEffects: [n("professional.institutionalTrust", 2), n("professional.environmentStability", -1), n("professional.lockerPower", -2)]
    }
  ],
  gates: [],
  gateAlternatives: [
    [{ path: "facts.lockerCaptainAffinity", op: "gte", value: 60 }],
    [{ path: "facts.lockerStarAffinity", op: "gte", value: 60 }],
    [{ path: "flags.HAS_SEED_TEAMMATE_COVER", op: "eq", value: true }]
  ],
  timeWindow: { months: [9, 10, 11, 12] },
  weight: 18,
  cooldown: 99999,
  seedsRead: ["SEED_TEAMMATE_COVER"],
  seedsWrite: [],
  tags: ["team", "locker", "adult_consolidation", "t5_14", "staged_candidate"],
  canonStatus: "verified"
});

/** Candidate only. Activation belongs to the integration/lineage owner. */
export const T514_STAGED_LOCK_PRINCIPAL_EVENTS_23: EventDefinition[] = [LOCKER];
