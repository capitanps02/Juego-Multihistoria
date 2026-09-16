import { EVENTS_18_20 as BASE_EVENTS_18_20 } from "./18_20/canonical-events.js";
import { PRINCIPAL_ADDITIONS_18_20 } from "./18_20/principal-additions.js";
import { CONDITIONAL_EVENTS_18_20 } from "./18_20/conditional-events.js";
import { applyT51B1aIntelRepairs } from "./18_20/t51-b1a-intel-overrides.js";
import { EVENTS_20_23 } from "./20_23/index.js";
import { EVENTS_23_26 } from "./23_26/index.js";
import { EVENTS_26_30 } from "./26_30/index.js";
import { EVENTS_30_34 } from "./30_34/index.js";
import { EVENTS_34_PLUS } from "./34_plus/index.js";

const REPAIRED_BASE_EVENTS_18_20 = applyT51B1aIntelRepairs(BASE_EVENTS_18_20);

export const EVENTS_18_20 = [
  ...REPAIRED_BASE_EVENTS_18_20,
  ...PRINCIPAL_ADDITIONS_18_20,
  ...CONDITIONAL_EVENTS_18_20
];

export { EVENTS_20_23, EVENTS_23_26, EVENTS_26_30, EVENTS_30_34, EVENTS_34_PLUS };
export const EVENTS = [...EVENTS_18_20, ...EVENTS_20_23, ...EVENTS_23_26, ...EVENTS_26_30, ...EVENTS_30_34, ...EVENTS_34_PLUS];
