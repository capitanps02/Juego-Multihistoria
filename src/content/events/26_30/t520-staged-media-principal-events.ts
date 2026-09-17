import type { EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const DOCUMENTARY_RELEASE = ambiguousEvent({
  id: "EVT_28_MEDIA_001",
  ageWindow: [28, 28],
  phase: "26_30",
  family: "press",
  title: "El documental se estrena cuando ya eres otro",
  body: "Se publica material grabado una temporada atrás. Una frase sobre entrenador, rival o futuro ahora parece contradictoria por hechos posteriores, aunque fuera cierta en su contexto original.",
  visible: [
    "Conoces el montaje final que acaba de publicarse y recuerdas el contexto en el que se grabó el material.",
    "La publicación convierte el montaje en información pública; no convierte automáticamente en públicos los fragmentos privados que quedaron fuera."
  ],
  uncertain: [
    "No sabes qué fragmento se viralizará ni si explicar el contexto reducirá o amplificará el ruido.",
    "Tampoco sabes si la productora responderá a una crítica o si el club preferirá que guardes silencio."
  ],
  choices: [
    {
      id: "NO_RESPONSE",
      label: "No responder",
      intentTags: ["documentary", "silence", "containment"],
      primaryMessage: "No añades una segunda noticia al estreno. Dejas que el montaje circule sin convertir tu reacción en otra pieza pública.",
      secondaryMessage: "El silencio evita una escalada inmediata, pero también deja el contexto en manos de terceros.",
      primaryEffects: [n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.publicPolarization", 2)],
      primarySeedTransitions: [seedCreate("SEED_DOCUMENTARY_FALLOUT", 52, { stance: "silence", released: true })],
      secondarySeedTransitions: [seedCreate("SEED_DOCUMENTARY_FALLOUT", 58, { stance: "silence", released: true })]
    },
    {
      id: "EXPLAIN_CONTEXT",
      label: "Explicar contexto",
      intentTags: ["documentary", "context", "public_response"],
      primaryMessage: "Explicas cuándo y por qué dijiste esa frase sin afirmar que el montaje sea falso.",
      secondaryMessage: "El contexto ayuda a parte del público, aunque vuelve a poner la frase en circulación.",
      primaryEffects: [n("professional.careerControl", 3), n("professional.publicPolarization", 1)],
      secondaryEffects: [n("reputation.mediaHeat", 3), n("professional.publicPolarization", 3)],
      primarySeedTransitions: [seedCreate("SEED_DOCUMENTARY_FALLOUT", 60, { stance: "explain_context", released: true })],
      secondarySeedTransitions: [seedCreate("SEED_DOCUMENTARY_FALLOUT", 66, { stance: "explain_context", released: true })]
    },
    {
      id: "REQUEST_EXTRA_MATERIAL",
      label: "Pedir a productora publicar material adicional",
      intentTags: ["documentary", "additional_material", "context"],
      primaryMessage: "Pides material adicional para reconstruir mejor la conversación. La petición no garantiza que la productora lo publique ni autoriza material fuera del acceso concedido.",
      secondaryMessage: "Intentas corregir el contexto con más evidencia, pero cedes a la productora una nueva oportunidad de controlar el montaje público.",
      primaryEffects: [n("professional.careerControl", 2), n("reputation.mediaHeat", 2)],
      secondaryEffects: [n("professional.publicPolarization", 3)],
      primarySeedTransitions: [seedCreate("SEED_DOCUMENTARY_FALLOUT", 64, { stance: "request_extra_material", released: true, extraMaterialPublished: false })],
      secondarySeedTransitions: [seedCreate("SEED_DOCUMENTARY_FALLOUT", 69, { stance: "request_extra_material", released: true, extraMaterialPublished: false })]
    },
    {
      id: "CRITICIZE_EDIT",
      label: "Criticar públicamente el montaje",
      intentTags: ["documentary", "criticism", "escalation"],
      primaryMessage: "Criticas el montaje como representación de tu posición actual. No afirmas que material privado no publicado sea público ni que la productora haya falsificado hechos.",
      secondaryMessage: "La crítica puede defender tu relato y también transformar el estreno en un conflicto abierto con la productora.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.publicPolarization", 3), n("reputation.mediaHeat", 3)],
      secondaryEffects: [n("professional.publicPolarization", 5), n("reputation.mediaHeat", 5)],
      primarySeedTransitions: [seedCreate("SEED_DOCUMENTARY_FALLOUT", 70, { stance: "criticize_edit", released: true })],
      secondarySeedTransitions: [seedCreate("SEED_DOCUMENTARY_FALLOUT", 76, { stance: "criticize_edit", released: true })]
    }
  ],
  gates: [{ path: "flags.HAS_SEED_DOCUMENTARY_ACCESS", op: "eq", value: true }],
  weight: 18,
  cooldown: 99999,
  seedsRead: ["SEED_DOCUMENTARY_ACCESS"],
  seedsWrite: ["SEED_DOCUMENTARY_FALLOUT"],
  npcRefs: [],
  tags: ["press", "documentary", "publication", "t5_20", "staged_candidate", "blocked_seed_catalog"],
  canonStatus: "verified"
});

/** Candidate is gate-complete; fallout seed catalog registration/activation is integrator-owned. */
export const T520_STAGED_MEDIA_PRINCIPAL_EVENTS_28: EventDefinition[] = [DOCUMENTARY_RELEASE];
