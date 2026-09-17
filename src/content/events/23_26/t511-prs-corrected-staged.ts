import type { EventDefinition } from "../../../core/types.js";
import { T511_PRS_PRINCIPAL_EVENTS_23 } from "./t511-prs-principal-events.js";

const base = T511_PRS_PRINCIPAL_EVENTS_23.find(event => event.id === "EVT_23_PRS_001");
if (!base) throw new Error("Missing active EVT_23_PRS_001 baseline");

/**
 * Staged causal correction for PRS23.
 *
 * The 12-point threshold is a technical material-drop threshold: it preserves the
 * intent of the previous low-role gate while measuring actual decline from the
 * authoritative age-23 snapshot instead of treating a low absolute role as proof of
 * decline. Exact role-expectation provenance is independently required.
 */
const PRS23_CORRECTED: EventDefinition = {
  ...base,
  gates: [
    { path: "facts.roleGuaranteeAt23", op: "eq", value: true },
    { path: "facts.roleDropSince23", op: "gte", value: 12 },
    { path: "professional.roleSecurity", op: "lte", value: 55 }
  ],
  tags: [...(base.tags ?? []), "agent6_role_provenance_candidate"]
};

/** Staged only: activation changes EVENTS/contentIdentity and belongs to the integrator. */
export const T511_PRS_CORRECTED_STAGED_23: EventDefinition[] = [PRS23_CORRECTED];
