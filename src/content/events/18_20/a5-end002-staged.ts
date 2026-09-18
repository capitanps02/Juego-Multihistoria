import type { EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "./helpers.js";

/**
 * Canon B382/B383 resolves the former A5 canon ambiguity:
 * the scene premise is current-club coach questioned while continuity is still undecided.
 *
 * A5 owns the complete scene below. It is not active until the shared coach/world owner
 * exposes a factual read that proves that premise for the current club. Media heat is a
 * separate canonical requirement and cannot stand in for coach status.
 */
export const EVT_18_END_002_EXTERNAL_REQUIREMENT = Object.freeze({
  owner: "A1/shared-coach",
  source: "B382/B383",
  premise: "current-club coach is questioned and continuity is not yet decided",
  mustProve: ["questioned=true", "continuityDecided=false", "currentClubContext=true"],
  forbiddenProxies: ["world.coachSecurity", "flags.COACH_FIRED", "reputation.mediaHeat as coach-status proof"]
});

export const A5_EVT_18_END_002_OWNER_READY: EventDefinition = ambiguousEvent({
  id: "EVT_18_END_002",
  ageWindow: [18, 18],
  phase: "18_20",
  family: "press",
  title: "El pasillo vacío",
  body: "Tras una derrota, Raúl Carrión pregunta si Montalbán ha perdido al vestuario. Al salir, Clara te encuentra solo y pregunta: «¿Tú confías en él?». Su continuidad todavía no está decidida.",
  visible: [
    "No sabes si Montalbán seguirá.",
    "La pregunta llega cuando su continuidad está realmente en discusión."
  ],
  uncertain: [
    "Tu agente puede creer que un cambio te beneficiaría, pero esa opinión no decide la continuidad.",
    "Vela puede estar enfrentado o alineado con el técnico según lo vivido antes."
  ],
  // The shared coach-status condition is intentionally NOT fabricated here. This
  // staged definition stays outside EVENTS until that factual condition exists.
  gates: [{ path: "reputation.mediaHeat", op: "gte", value: 8 }],
  timeWindow: { months: [5] },
  weight: 12,
  choices: [
    {
      id: "DEFEND",
      label: "Defenderlo de forma clara",
      intentTags: ["loyalty", "public"],
      primaryMessage: "Si Montalbán continúa, recordará que lo defendiste cuando su posición era débil.",
      secondaryMessage: "Si el técnico sale, tu apoyo público queda registrado para quien llegue después.",
      primaryEffects: [n("rel.NPC_CCH_01.trust", 9)],
      secondaryEffects: [n("reputation.mediaHeat", 4)],
      primarySeedTransitions: [seedCreate("SEED_COACH_PUBLIC", 55, { stance: "defended" })],
      secondarySeedTransitions: [seedCreate("SEED_COACH_PUBLIC", 62, { stance: "defended_then_left" })]
    },
    {
      id: "CLUB_DECIDES",
      label: "Decir que las decisiones corresponden al club",
      intentTags: ["neutral", "public"],
      primaryMessage: "Mantienes una distancia institucional y evitas adjudicarte una decisión que no te corresponde.",
      secondaryMessage: "La distancia puede interpretarse como falta de apoyo aunque no hayas pedido ningún cambio.",
      primaryEffects: [n("control.career", 2)],
      secondaryEffects: [n("rel.NPC_CCH_01.trust", -3)],
      primarySeedTransitions: [seedCreate("SEED_COACH_PUBLIC", 32, { stance: "neutral" })],
      secondarySeedTransitions: [seedCreate("SEED_COACH_PUBLIC", 36, { stance: "distance" })]
    },
    {
      id: "NEED_DIFFERENT_ROLE",
      label: "Decir que personalmente necesitas un rol distinto la próxima temporada",
      intentTags: ["self", "public"],
      primaryMessage: "Hablas de tu encaje sin afirmar quién debe entrenar al equipo.",
      secondaryMessage: "El comentario puede parecer una negociación pública aprovechando la debilidad del técnico.",
      primaryEffects: [n("control.career", 5)],
      secondaryEffects: [n("reputation.mediaHeat", 6), n("rel.NPC_CCH_01.trust", -6)],
      primarySeedTransitions: [seedCreate("SEED_COACH_PUBLIC", 48, { stance: "role_claim" })],
      secondarySeedTransitions: [seedCreate("SEED_COACH_PUBLIC", 55, { stance: "opportunist_read" })]
    },
    {
      id: "SILENCE",
      label: "No contestar y marcharte",
      intentTags: ["silence", "control"],
      primaryMessage: "No conviertes una incertidumbre real en una valoración pública propia.",
      secondaryMessage: "El silencio no evita que otros le den significado.",
      primaryEffects: [],
      secondaryEffects: [n("reputation.mediaHeat", 3)],
      primarySeedTransitions: [seedCreate("SEED_COACH_PUBLIC", 25, { stance: "silence" })],
      secondarySeedTransitions: [seedCreate("SEED_COACH_PUBLIC", 30, { stance: "silence_interpreted" })]
    }
  ],
  seedsWrite: ["SEED_COACH_PUBLIC"],
  npcRefs: ["NPC_PRS_01", "NPC_PRS_02", "NPC_CCH_01", "NPC_PLR_10"],
  tags: ["coach", "press", "uncertainty", "a5_ready_external_blocker"],
  canonStatus: "verified"
});
