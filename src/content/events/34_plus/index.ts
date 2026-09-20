import type { EventDefinition } from "../../../core/types.js";
import { PRINCIPAL_EVENTS_34_PLUS } from "./principal-events.js";
import { CONDITIONAL_EVENTS_34_PLUS } from "./conditional-events.js";
import {
  A8_STAGED_PRINCIPALS,
  A8_STAGED_ORDINARY_CONDITIONALS
} from "./staged-runtime.js";
import { applyRetirementTerminalOverrides } from "./retirement-terminal-overrides.js";
import { enforceRetirementTerminalCanonicalAccreditation } from "./retirement-terminal-canonical-guard.js";

const A9_SOURCE_PRINCIPAL_IDS = new Set([
  "EVT_37_ANNOUNCE_001",
  "EVT_RET_HOME_001",
  "EVT_RET_BODY_001",
  "EVT_RET_HIGH_001",
  "EVT_RET_LOW_001",
  "EVT_RET_ANNOUNCE_001",
  "EVT_RET_LAST_001"
]);

const A9_SOURCE_CONDITIONAL_IDS = new Set([
  "CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED",
  "CEVT_38_RETIREMENT_REVERSAL",
  "CEVT_RET_NO_LAST_MATCH",
  "CEVT_RET_STORYBOOK_LAST_GOAL"
]);

const A9_CANONICAL_CONDITIONAL_IDS = new Set([
  "CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED",
  "CEVT_38_RETIREMENT_REVERSAL",
  "CEVT_RET_NO_LAST_MATCH",
  "CEVT_RET_STORYBOOK_LAST_GOAL"
]);

const a9TerminalPrincipals = PRINCIPAL_EVENTS_34_PLUS
  .filter(event => A9_SOURCE_PRINCIPAL_IDS.has(event.id))
  .map(event => structuredClone(event));

const a9TerminalConditionalWorking = CONDITIONAL_EVENTS_34_PLUS
  .filter(event => A9_SOURCE_CONDITIONAL_IDS.has(event.id))
  .map(event => structuredClone(event));

applyRetirementTerminalOverrides(a9TerminalPrincipals,a9TerminalConditionalWorking);
enforceRetirementTerminalCanonicalAccreditation(a9TerminalConditionalWorking);

export const A9_TERMINAL_PRINCIPALS: EventDefinition[] = a9TerminalPrincipals;
export const A9_TERMINAL_CONDITIONALS: EventDefinition[] = a9TerminalConditionalWorking.filter(event =>
  A9_CANONICAL_CONDITIONAL_IDS.has(event.id)
);

/**
 * Final T5 34+ generation:
 * - 43 ordinary A8 principals + 7 canonical A9 terminal principals;
 * - 28 ordinary A8 conditionals + 4 canonical A9 terminal conditionals.
 *
 * Legacy CEVT_RET_RECONSIDER remains available only through frozen historical
 * evidence; it is never reinterpreted as CEVT_38_RETIREMENT_REVERSAL.
 */
export const PRINCIPAL_EVENTS_34_PLUS_A9_FINAL: EventDefinition[] = [
  ...A8_STAGED_PRINCIPALS,
  ...A9_TERMINAL_PRINCIPALS
];

export const CONDITIONAL_EVENTS_34_PLUS_A9_FINAL: EventDefinition[] = [
  ...A8_STAGED_ORDINARY_CONDITIONALS,
  ...A9_TERMINAL_CONDITIONALS
];

export const EVENTS_34_PLUS=[
  ...PRINCIPAL_EVENTS_34_PLUS_A9_FINAL,
  ...CONDITIONAL_EVENTS_34_PLUS_A9_FINAL
];
