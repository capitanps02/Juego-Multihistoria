import { PRINCIPAL_EVENTS_23_26 } from "./principal-events.js";
import { CONDITIONAL_EVENTS_23_26 } from "./conditional-events.js";
import { T510_PRINCIPAL_EVENTS_23 } from "./t510-principal-events.js";

const t510ById = new Map(T510_PRINCIPAL_EVENTS_23.map(event => [event.id, event] as const));
const activePrincipals = PRINCIPAL_EVENTS_23_26.map(event => t510ById.get(event.id) ?? event);

export const EVENTS_23_26=[...activePrincipals,...CONDITIONAL_EVENTS_23_26];
