import { PRINCIPAL_EVENTS_34_PLUS } from "./principal-events.js";
import { CONDITIONAL_EVENTS_34_PLUS } from "./conditional-events.js";
import { applyRetirementTerminalOverrides } from "./retirement-terminal-overrides.js";

applyRetirementTerminalOverrides(PRINCIPAL_EVENTS_34_PLUS,CONDITIONAL_EVENTS_34_PLUS);

export const EVENTS_34_PLUS=[...PRINCIPAL_EVENTS_34_PLUS,...CONDITIONAL_EVENTS_34_PLUS];
