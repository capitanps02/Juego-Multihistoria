import type { EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const PERSONAL_BRAND = ambiguousEvent({
  id: "EVT_27_IMG_001",
  ageWindow: [27, 27],
  phase: "26_30",
  family: "image",
  title: "Tu nombre sin tu club",
  body: "Tu equipo de marca propone una identidad visual y campañas globales independientes del club. La institución teme que tus patrocinadores compitan con sus propios socios.",
  visible: [
    "Conoces tus contratos de marca y las restricciones comerciales que el club ya ha comunicado.",
    "Separar marca personal y club aumenta autonomía, pero también puede crear conflictos reales de patrocinio."
  ],
  uncertain: [
    "No sabes cuánto crecerá tu valor fuera del fútbol.",
    "Tampoco sabes cuánto tolerará la institución una marca personal cada vez más independiente."
  ],
  choices: [
    {
      id: "INDEPENDENT_BRAND",
      label: "Construir marca independiente fuerte",
      intentTags: ["brand", "independence", "ceiling"],
      primaryMessage: "Impulsas una marca claramente separada del club. Ganas autonomía comercial y también una nueva fuente de fricción institucional.",
      secondaryMessage: "La marca crece, pero cada incompatibilidad entre patrocinadores deja de ser un problema abstracto.",
      primaryEffects: [n("professional.commercialPower", 7), n("professional.careerControl", 4), n("professional.institutionalTrust", -4)],
      secondaryEffects: [n("professional.commercialPower", 5), n("professional.publicPolarization", 3), n("professional.institutionalTrust", -5)],
      primarySeedTransitions: [seedCreate("SEED_PERSONAL_BRAND_INDEPENDENCE", 75, { stance: "independent", clubCoordination: "low" })],
      secondarySeedTransitions: [seedCreate("SEED_PERSONAL_BRAND_INDEPENDENCE", 78, { stance: "independent", clubCoordination: "low" })]
    },
    {
      id: "CLUB_COORDINATED",
      label: "Coordinar todo con club",
      intentTags: ["brand", "coordination", "stability"],
      primaryMessage: "Coordinas campañas y conflictos de patrocinio con el club. Cedes parte de la autonomía a cambio de una relación comercial más estable.",
      secondaryMessage: "La coordinación reduce choques, aunque tu marca queda más ligada al ciclo deportivo e institucional del club.",
      primaryEffects: [n("professional.institutionalTrust", 5), n("professional.environmentStability", 3), n("professional.careerControl", -2), n("professional.commercialPower", 2)],
      secondaryEffects: [n("professional.institutionalTrust", 4), n("professional.commercialPower", 1), n("professional.careerControl", -3)],
      primarySeedTransitions: [seedCreate("SEED_PERSONAL_BRAND_INDEPENDENCE", 48, { stance: "club_coordinated", clubCoordination: "high" })],
      secondarySeedTransitions: [seedCreate("SEED_PERSONAL_BRAND_INDEPENDENCE", 45, { stance: "club_coordinated", clubCoordination: "high" })]
    },
    {
      id: "REST_WINDOWS",
      label: "Limitar campañas a ventanas de descanso",
      intentTags: ["brand", "load_management", "balance"],
      primaryMessage: "Aceptas crecer, pero concentras campañas en ventanas de descanso para evitar que la expansión comercial invada la preparación diaria.",
      secondaryMessage: "La regla protege estabilidad y cuerpo, aunque algunas oportunidades globales no esperan al calendario ideal.",
      primaryEffects: [n("professional.commercialPower", 3), n("professional.environmentStability", 4), n("professional.recoveryMargin", 2)],
      secondaryEffects: [n("professional.commercialPower", 2), n("professional.environmentStability", 2)],
      primarySeedTransitions: [seedCreate("SEED_PERSONAL_BRAND_INDEPENDENCE", 60, { stance: "rest_windows", clubCoordination: "medium" })],
      secondarySeedTransitions: [seedCreate("SEED_PERSONAL_BRAND_INDEPENDENCE", 58, { stance: "rest_windows", clubCoordination: "medium" })]
    },
    {
      id: "REJECT_EXPANSION",
      label: "Rechazar expansión internacional",
      intentTags: ["brand", "restraint", "control"],
      primaryMessage: "Rechazas la expansión internacional y mantienes una estructura comercial más pequeña y controlable.",
      secondaryMessage: "Proteges foco y autonomía, pero renuncias a parte del valor que una buena temporada podía convertir en alcance global.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.environmentStability", 3), n("professional.commercialPower", -2)],
      secondaryEffects: [n("professional.careerControl", 3), n("professional.commercialPower", -3), n("professional.publicMyth", -1)],
      primarySeedTransitions: [seedCreate("SEED_PERSONAL_BRAND_INDEPENDENCE", 40, { stance: "reject_expansion", clubCoordination: "none" })],
      secondarySeedTransitions: [seedCreate("SEED_PERSONAL_BRAND_INDEPENDENCE", 42, { stance: "reject_expansion", clubCoordination: "none" })]
    }
  ],
  gates: [],
  gateAlternatives: [
    [{ path: "flags.HAS_SEED_GLOBAL_IMAGE", op: "eq", value: true }],
    [
      { path: "professional.commercialPower", op: "gte", value: 60 },
      { path: "reputation.mediaHeat", op: "gte", value: 50 },
      { path: "professional.publicPolarization", op: "gte", value: 18 }
    ]
  ],
  weight: 17,
  cooldown: 99999,
  seedsRead: ["SEED_GLOBAL_IMAGE", "SEED_IMAGE_RIGHTS", "SEED_SPONSOR_IMAGE"],
  seedsWrite: ["SEED_PERSONAL_BRAND_INDEPENDENCE"],
  npcRefs: [],
  tags: ["image", "personal_brand", "media_power", "t5_17", "staged_candidate"],
  canonStatus: "verified"
});

/** Candidate only; active catalog and corrected seed lineage are integrator-owned. */
export const T517_STAGED_IMAGE_PRINCIPAL_EVENTS_27: EventDefinition[] = [PERSONAL_BRAND];
