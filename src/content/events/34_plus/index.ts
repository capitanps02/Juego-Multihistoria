import type { EventDefinition } from "../../../core/types.js";
import { PRINCIPAL_EVENTS_34_PLUS } from "./principal-events.js";
import { CONDITIONAL_EVENTS_34_PLUS } from "./conditional-events.js";
import { STAGED_PRINCIPAL_WAVE_A } from "./staged-principal-wave-a.js";
import {
  A8_STAGED_PRINCIPALS,
  A8_STAGED_ORDINARY_CONDITIONALS
} from "./staged-runtime.js";
import { applyRetirementTerminalOverrides } from "./retirement-terminal-overrides.js";
import { enforceRetirementTerminalCanonicalAccreditation } from "./retirement-terminal-canonical-guard.js";

const A8_WAVE_A_IDS = new Set(STAGED_PRINCIPAL_WAVE_A.map(event=>event.id));
const A8_WAVE_A_RETIRED_TECHNICAL = new Set(["EVT_34_MKT_001"]);

const ordinaryWaveABase = PRINCIPAL_EVENTS_34_PLUS.filter(event =>
  !A8_WAVE_A_IDS.has(event.id)
  && !A8_WAVE_A_RETIRED_TECHNICAL.has(event.id)
);

export const PRINCIPAL_EVENTS_34_PLUS_WAVE_A: EventDefinition[] = [
  ...ordinaryWaveABase,
  ...STAGED_PRINCIPAL_WAVE_A
];

const A9_TERMINAL_PRINCIPAL_IDS = new Set([
  "EVT_37_ANNOUNCE_001",
  "EVT_RET_HOME_001",
  "EVT_RET_BODY_001",
  "EVT_RET_HIGH_001",
  "EVT_RET_LOW_001",
  "EVT_RET_ANNOUNCE_001",
  "EVT_RET_LAST_001"
]);

const A9_TERMINAL_CONDITIONAL_IDS = new Set([
  "CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED",
  "CEVT_RET_RECONSIDER",
  "CEVT_RET_NO_LAST_MATCH",
  "CEVT_RET_STORYBOOK_LAST_GOAL"
]);

const a9TerminalPrincipals: EventDefinition[] = PRINCIPAL_EVENTS_34_PLUS.filter(event =>
  A9_TERMINAL_PRINCIPAL_IDS.has(event.id)
);
const a9TerminalConditionalsWorking: EventDefinition[] = CONDITIONAL_EVENTS_34_PLUS.filter(event =>
  A9_TERMINAL_CONDITIONAL_IDS.has(event.id)
);

applyRetirementTerminalOverrides(a9TerminalPrincipals,a9TerminalConditionalsWorking);

const a9TerminalConditionals = a9TerminalConditionalsWorking.filter(event =>
  event.id !== "CEVT_RET_RECONSIDER"
);
enforceRetirementTerminalCanonicalAccreditation(a9TerminalConditionals);

/**
 * Final T5 34+ catalog:
 * - 43 ordinary A8 principals + 7 terminal A9 principals
 * - 28 ordinary A8 conditionals + 4 terminal A9 conditionals
 * Total 82 events for 34+, preserving the global 388-event contract.
 */
export const PRINCIPAL_EVENTS_34_PLUS_A8_FINAL: EventDefinition[] = [
  ...A8_STAGED_PRINCIPALS,
  ...a9TerminalPrincipals
];

export const CONDITIONAL_EVENTS_34_PLUS_A8_FINAL: EventDefinition[] = [
  ...A8_STAGED_ORDINARY_CONDITIONALS,
  ...a9TerminalConditionals
];

export const EVENTS_34_PLUS=[
  ...PRINCIPAL_EVENTS_34_PLUS_A8_FINAL,
  ...CONDITIONAL_EVENTS_34_PLUS_A8_FINAL
];
