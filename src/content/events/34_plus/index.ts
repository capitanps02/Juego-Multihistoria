import type { EventDefinition } from "../../../core/types.js";
import { PRINCIPAL_EVENTS_34_PLUS } from "./principal-events.js";
import { CONDITIONAL_EVENTS_34_PLUS } from "./conditional-events.js";
import { STAGED_PRINCIPAL_WAVE_A } from "./staged-principal-wave-a.js";
import {
  A8_STAGED_PRINCIPALS,
  A8_STAGED_ORDINARY_CONDITIONALS
} from "./staged-runtime.js";

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

const a9TerminalPrincipals = PRINCIPAL_EVENTS_34_PLUS.filter(event =>
  A9_TERMINAL_PRINCIPAL_IDS.has(event.id)
);
const a9TerminalConditionals = CONDITIONAL_EVENTS_34_PLUS.filter(event =>
  A9_TERMINAL_CONDITIONAL_IDS.has(event.id)
);

/**
 * Final ordinary A8 catalog.
 *
 * 43 canonical A8 principals + the 7 still-A9-owned terminal principal rows.
 * 28 canonical A8 conditionals + the 4 still-A9-owned terminal conditional rows.
 * The total 34+ surface remains 82 events, preserving the global 388-event budget.
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
