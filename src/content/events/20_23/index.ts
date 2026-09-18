import type { EventDefinition } from "../../../core/types.js";
import { PRINCIPAL_EVENTS_20_23 } from "./principal-events.js";
import { CONDITIONAL_EVENTS_20_23 } from "./conditional-events.js";
import { T55A_PRINCIPALS, T55A_CONDITIONALS } from "./canonical-t55-a.js";
import { T55B_PRINCIPALS } from "./canonical-t55-b.js";
import { T56A_PRINCIPALS } from "./canonical-t56-a.js";
import { A5_READY_EVENTS_18_23 } from "./a5-ready-staged.js";

function replaceById(base: readonly EventDefinition[], replacements: readonly EventDefinition[]): EventDefinition[] {
  const ids = new Set(replacements.map(event => event.id));
  return [...base.filter(event => !ids.has(event.id)), ...replacements];
}

function routeSafeT55BNpcRefs(event: EventDefinition): EventDefinition {
  if (event.id === "EVT_21_PRS_001") return { ...event, npcRefs: ["NPC_PRS_01"] };
  if (["EVT_21_CAP_001", "EVT_22_CON_001", "EVT_22_CON_002"].includes(event.id)) return { ...event, npcRefs: [] };
  return event;
}

const ACTIVE_T55B_PRINCIPALS = T55B_PRINCIPALS.map(routeSafeT55BNpcRefs);
const A5_POST_J_PRINCIPALS = A5_READY_EVENTS_18_23.filter(event => event.phase === "20_23");
const A5_RETIRED_LEGACY_PRINCIPAL_IDS = new Set([
  "EVT_20_MATCH_001",
  "EVT_21_CCH_001",
  "EVT_22_LIFE_001"
]);
const A5_POST_J_BASE_PRINCIPALS = PRINCIPAL_EVENTS_20_23.filter(event => !A5_RETIRED_LEGACY_PRINCIPAL_IDS.has(event.id));

export const ACTIVE_PRINCIPAL_EVENTS_20_23 = replaceById(
  A5_POST_J_BASE_PRINCIPALS,
  [...T55A_PRINCIPALS, ...ACTIVE_T55B_PRINCIPALS, ...T56A_PRINCIPALS, ...A5_POST_J_PRINCIPALS]
);
export const ACTIVE_CONDITIONAL_EVENTS_20_23 = replaceById(CONDITIONAL_EVENTS_20_23, T55A_CONDITIONALS);
export const EVENTS_20_23 = [...ACTIVE_PRINCIPAL_EVENTS_20_23, ...ACTIVE_CONDITIONAL_EVENTS_20_23];
