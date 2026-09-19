import { EVENTS_18_20 as BASE_EVENTS_18_20 } from "./18_20/canonical-events.js";
import { PRINCIPAL_ADDITIONS_18_20 } from "./18_20/principal-additions.js";
import { CONDITIONAL_EVENTS_18_20 } from "./18_20/conditional-events.js";
import { applyT51B1aIntelRepairs } from "./18_20/t51-b1a-intel-overrides.js";
import { applyT51B1bLocalRepairs } from "./18_20/t51-b1b-local-repairs.js";
import { applyT51124SportContextRepairs } from "./18_20/t51-124-sport-context-repairs.js";
import { applyAge18MarketOfferBridges } from "./18_20/t51-age18-market-offer-bridges.js";
import { applyT51SeedConsumerRepairs } from "./18_20/t51-seed-consumer-repairs.js";
import { EVENTS_20_23 as BASE_EVENTS_20_23 } from "./20_23/index.js";
import { A5_READY_EVENTS_18_23 } from "./20_23/a5-ready-staged.js";
import { EVENTS_23_26 } from "./23_26/index.js";
import { EVENTS_26_30 } from "./26_30/index.js";
import { EVENTS_30_34 } from "./30_34/index.js";
import { EVENTS_34_PLUS } from "./34_plus/index.js";

const REPAIRED_BASE_EVENTS_18_20 = applyAge18MarketOfferBridges(
  applyT51124SportContextRepairs(
    applyT51B1bLocalRepairs(
      applyT51B1aIntelRepairs(BASE_EVENTS_18_20)
    )
  )
);
const REPAIRED_CONDITIONAL_EVENTS_18_20 = applyT51SeedConsumerRepairs(CONDITIONAL_EVENTS_18_20);

function replaceById(base: readonly import("../../core/types.js").EventDefinition[], replacements: readonly import("../../core/types.js").EventDefinition[]) {
  const ids = new Set(replacements.map(event => event.id));
  return [...base.filter(event => !ids.has(event.id)), ...replacements];
}

const A5_READY_18_20 = A5_READY_EVENTS_18_23.filter(event => event.phase === "18_20");
const A5_READY_20_23 = A5_READY_EVENTS_18_23.filter(event => event.phase === "20_23");
const RETIRED_TECHNICAL_20_23 = new Set(["EVT_20_MATCH_001", "EVT_21_CCH_001", "EVT_22_LIFE_001"]);

export const EVENTS_18_20 = replaceById([
  ...REPAIRED_BASE_EVENTS_18_20,
  ...PRINCIPAL_ADDITIONS_18_20,
  ...REPAIRED_CONDITIONAL_EVENTS_18_20
], A5_READY_18_20);

export const EVENTS_20_23 = replaceById(
  BASE_EVENTS_20_23.filter(event => !RETIRED_TECHNICAL_20_23.has(event.id)),
  A5_READY_20_23
);

export { EVENTS_23_26, EVENTS_26_30, EVENTS_30_34, EVENTS_34_PLUS };
export const EVENTS = [...EVENTS_18_20, ...EVENTS_20_23, ...EVENTS_23_26, ...EVENTS_26_30, ...EVENTS_30_34, ...EVENTS_34_PLUS];
