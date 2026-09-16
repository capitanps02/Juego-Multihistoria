import type { EventDefinition } from "../../../core/types.js";
import { PRINCIPAL_EVENTS_20_23 } from "./principal-events.js";
import { CONDITIONAL_EVENTS_20_23 } from "./conditional-events.js";
import { T55A_PRINCIPALS, T55A_CONDITIONALS } from "./canonical-t55-a.js";

function replaceById(base: readonly EventDefinition[], replacements: readonly EventDefinition[]): EventDefinition[] {
  const ids = new Set(replacements.map(event => event.id));
  return [...base.filter(event => !ids.has(event.id)), ...replacements];
}

export const ACTIVE_PRINCIPAL_EVENTS_20_23 = replaceById(PRINCIPAL_EVENTS_20_23, T55A_PRINCIPALS);
export const ACTIVE_CONDITIONAL_EVENTS_20_23 = replaceById(CONDITIONAL_EVENTS_20_23, T55A_CONDITIONALS);
export const EVENTS_20_23 = [...ACTIVE_PRINCIPAL_EVENTS_20_23, ...ACTIVE_CONDITIONAL_EVENTS_20_23];
