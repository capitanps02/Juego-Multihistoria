import type { EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const DOCUMENTARY = ambiguousEvent({
  id: "EVT_26_DOC_001",
  ageWindow: [26, 26],
  phase: "26_30",
  family: "press",
  title: "Dentro de tu temporada",
  body: "Una plataforma propone un documental con acceso al vestuario, la familia y la recuperación. El club quiere controlar la aprobación final; la productora avisa de que, sin espontaneidad, el proyecto pierde valor.",
  visible: [
    "Conoces el pago, el calendario, los derechos y el nivel de acceso que solicita la propuesta.",
    "Aceptar acceso no equivale a publicar todavía ninguna escena ni convierte información privada en conocimiento público."
  ],
  uncertain: [
    "No sabes qué momento difícil podría acabar grabado durante la temporada.",
    "Tampoco sabes cuánto intentaría editar el club si el contexto deportivo se complica."
  ],
  choices: [
    {
      id: "BROAD_ACCESS",
      label: "Dar acceso amplio",
      intentTags: ["documentary", "broad_access", "authenticity"],
      primaryMessage: "Aceptas un acceso amplio y priorizas autenticidad. El acuerdo queda como memoria de acceso; todavía no publica hechos privados por sí solo.",
      secondaryMessage: "La cercanía aumenta el valor del proyecto, pero reduce tu margen si la temporada entra en crisis.",
      primaryEffects: [n("professional.commercialPower", 5), n("professional.publicMyth", 4), n("professional.environmentStability", -2)],
      secondaryEffects: [n("professional.commercialPower", 3), n("professional.publicPolarization", 3), n("professional.environmentStability", -3)],
      primarySeedTransitions: [seedCreate("SEED_DOCUMENTARY_ACCESS", 72, { stance: "broad_access", accessScope: "locker_family_recovery", veto: "none", published: false })],
      secondarySeedTransitions: [seedCreate("SEED_DOCUMENTARY_ACCESS", 76, { stance: "broad_access", accessScope: "locker_family_recovery", veto: "none", published: false })]
    },
    {
      id: "PRIVATE_ZONES",
      label: "Aceptar con zonas privadas excluidas",
      intentTags: ["documentary", "privacy_boundary"],
      primaryMessage: "Aceptas el proyecto, pero dejas familia y recuperación privada fuera del acceso automático.",
      secondaryMessage: "La frontera protege intimidad, aunque la productora considera que pierde parte de la historia que quería contar.",
      primaryEffects: [n("professional.commercialPower", 3), n("professional.careerControl", 3), n("professional.publicMyth", 2)],
      secondaryEffects: [n("professional.commercialPower", 2), n("professional.careerControl", 2)],
      primarySeedTransitions: [seedCreate("SEED_DOCUMENTARY_ACCESS", 64, { stance: "private_zones", accessScope: "professional_only", privateZonesExcluded: true, published: false })],
      secondarySeedTransitions: [seedCreate("SEED_DOCUMENTARY_ACCESS", 66, { stance: "private_zones", accessScope: "professional_only", privateZonesExcluded: true, published: false })]
    },
    {
      id: "LIMITED_VETO",
      label: "Aceptar solo si tú tienes veto limitado",
      intentTags: ["documentary", "limited_veto", "editorial_control"],
      primaryMessage: "Aceptas condicionado a un veto limitado y explícito. El veto protege casos concretos, no una aprobación total del montaje.",
      secondaryMessage: "Obtienes una red de seguridad parcial, pero la productora rebaja expectativas de espontaneidad y credibilidad.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.commercialPower", 2), n("professional.institutionalTrust", -1)],
      secondaryEffects: [n("professional.careerControl", 2), n("professional.commercialPower", 1)],
      primarySeedTransitions: [seedCreate("SEED_DOCUMENTARY_ACCESS", 68, { stance: "limited_veto", accessScope: "broad_with_limited_veto", veto: "limited", published: false })],
      secondarySeedTransitions: [seedCreate("SEED_DOCUMENTARY_ACCESS", 70, { stance: "limited_veto", accessScope: "broad_with_limited_veto", veto: "limited", published: false })]
    },
    {
      id: "REJECT",
      label: "Rechazar",
      intentTags: ["documentary", "reject_access", "privacy"],
      primaryMessage: "Rechazas el documental. No se concede acceso y la temporada sigue sin una cámara adicional dentro de los espacios privados.",
      secondaryMessage: "Conservas control, aunque renuncias a una oportunidad de ampliar marca y relato personal.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.commercialPower", -1)],
      secondaryEffects: [n("professional.careerControl", 3), n("professional.publicMyth", -1)],
      primarySeedTransitions: [seedCreate("SEED_DOCUMENTARY_ACCESS", 45, { stance: "reject", accessScope: "none", published: false })],
      secondarySeedTransitions: [seedCreate("SEED_DOCUMENTARY_ACCESS", 48, { stance: "reject", accessScope: "none", published: false })]
    }
  ],
  gates: [{ path: "professional.publicMyth", op: "gte", value: 35 }],
  weight: 18,
  cooldown: 99999,
  seedsRead: ["SEED_GLOBAL_IMAGE", "SEED_SPONSOR_IMAGE"],
  seedsWrite: ["SEED_DOCUMENTARY_ACCESS"],
  npcRefs: [],
  tags: ["press", "documentary", "privacy", "media_profile", "t5_16", "staged_candidate"],
  canonStatus: "verified"
});

/** Candidate only; active catalog/seed-origin lineage is integrator-owned. */
export const T516_STAGED_DOC_PRINCIPAL_EVENTS_26: EventDefinition[] = [DOCUMENTARY];
