import type { EventDefinition, SeedTransition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const intensifySelfOptimization = (amount: number): SeedTransition => ({
  seedId: "SEED_SELF_OPTIMIZATION",
  action: "intensify",
  intensity: amount
});

const PEAK_LOAD = ambiguousEvent({
  id: "EVT_27_BODY_001",
  ageWindow: [27, 27],
  phase: "26_30",
  family: "medical",
  title: "Vacaciones o laboratorio",
  body: "Tras una temporada enorme, tu preparador propone dos semanas extra de trabajo específico para buscar una ventaja física y técnica. El fisio recomienda desconexión completa.",
  visible: [
    "Conoces el plan de entrenamiento extra y la recomendación de recuperación.",
    "También conoces tu margen de recuperación actual; ninguna opción garantiza mejorar la temporada siguiente."
  ],
  uncertain: [
    "No sabes si el bloque extra añadirá una ventaja real o solo fatiga acumulada.",
    "Tampoco sabes cuánto valor tendrá cada patrón de carga meses después."
  ],
  choices: [
    {
      id: "EXTRA_BLOCK",
      label: "Hacer el bloque extra",
      intentTags: ["body", "optimization", "extra_load"],
      primaryMessage: "Aceptas las dos semanas extra. El patrón de optimización se refuerza, pero el coste inmediato es menos margen de recuperación.",
      secondaryMessage: "Trabajas más sin obtener una garantía de ventaja futura; lo que queda registrado es la decisión de añadir carga.",
      primaryEffects: [n("professional.bodyLoad", 5), n("professional.recoveryMargin", -4)],
      secondaryEffects: [n("professional.bodyLoad", 6), n("professional.recoveryMargin", -5)],
      primarySeedTransitions: [intensifySelfOptimization(12), seedCreate("SEED_PEAK_LOAD", 72, { stance: "extra_block" })],
      secondarySeedTransitions: [intensifySelfOptimization(10), seedCreate("SEED_PEAK_LOAD", 75, { stance: "extra_block" })]
    },
    {
      id: "FULL_REST",
      label: "Descansar completamente",
      intentTags: ["body", "recovery", "full_rest"],
      primaryMessage: "Priorizas desconexión completa. Recuperas margen ahora, sin convertir el descanso en una promesa de mejor rendimiento futuro.",
      secondaryMessage: "Descansas y llegas con menos carga, aunque nunca sabrás si renunciaste a una mejora marginal útil.",
      primaryEffects: [n("professional.bodyLoad", -6), n("professional.recoveryMargin", 7)],
      secondaryEffects: [n("professional.bodyLoad", -5), n("professional.recoveryMargin", 6)],
      primarySeedTransitions: [seedCreate("SEED_PEAK_LOAD", 58, { stance: "full_rest" })],
      secondarySeedTransitions: [seedCreate("SEED_PEAK_LOAD", 60, { stance: "full_rest" })]
    },
    {
      id: "LOW_LOAD_TECHNIQUE",
      label: "Hacer solo técnica de baja carga",
      intentTags: ["body", "technique", "low_load"],
      primaryMessage: "Mantienes trabajo técnico de baja carga y evitas convertir las vacaciones en otro bloque físico completo.",
      secondaryMessage: "La solución intermedia protege parte de la recuperación, aunque conserva disciplina y estructura durante el descanso.",
      primaryEffects: [n("professional.bodyLoad", -2), n("professional.recoveryMargin", 3)],
      secondaryEffects: [n("professional.bodyLoad", -1), n("professional.recoveryMargin", 2)],
      primarySeedTransitions: [intensifySelfOptimization(5), seedCreate("SEED_PEAK_LOAD", 64, { stance: "low_load_technique" })],
      secondarySeedTransitions: [intensifySelfOptimization(4), seedCreate("SEED_PEAK_LOAD", 65, { stance: "low_load_technique" })]
    },
    {
      id: "SPLIT_BREAK",
      label: "Dividir vacaciones: desconexión y mini-bloque final",
      intentTags: ["body", "balance", "split_break"],
      primaryMessage: "Separas una fase real de desconexión de un mini-bloque final. No maximizas ni trabajo ni descanso, pero haces explícito el compromiso.",
      secondaryMessage: "El reparto conserva flexibilidad y también deja abierta la duda de si ninguna de las dos fases fue tan completa como podía ser.",
      primaryEffects: [n("professional.bodyLoad", -3), n("professional.recoveryMargin", 4)],
      secondaryEffects: [n("professional.bodyLoad", -2), n("professional.recoveryMargin", 3)],
      primarySeedTransitions: [intensifySelfOptimization(6), seedCreate("SEED_PEAK_LOAD", 67, { stance: "split_break" })],
      secondarySeedTransitions: [intensifySelfOptimization(5), seedCreate("SEED_PEAK_LOAD", 68, { stance: "split_break" })]
    }
  ],
  gates: [],
  gateAlternatives: [
    [{ path: "professional.peakStatus", op: "gte", value: 55 }],
    [{ path: "flags.HAS_SEED_SELF_OPTIMIZATION", op: "eq", value: true }]
  ],
  weight: 18,
  cooldown: 99999,
  seedsRead: ["SEED_SELF_OPTIMIZATION"],
  seedsWrite: ["SEED_PEAK_LOAD", "SEED_SELF_OPTIMIZATION"],
  npcRefs: [],
  tags: ["medical", "peak_load", "recovery", "t5_18", "staged_candidate"],
  canonStatus: "verified"
});

/** Canonical semantic replacement candidate; active exact-ID swap remains integrator-owned. */
export const T518_STAGED_BODY_PRINCIPAL_EVENTS_27: EventDefinition[] = [PEAK_LOAD];
