import { PRINCIPAL_EVENTS_26_30 } from "./principal-events.js";
import { CONDITIONAL_EVENTS_26_30 } from "./conditional-events.js";
import { T515_STAGED_PRINCIPAL_EVENTS_26 } from "./t515-principal-events.js";
import { T516_STAGED_DOC_PRINCIPAL_EVENTS_26 } from "./t516-staged-doc-principal-events.js";
import { T518_STAGED_BODY_PRINCIPAL_EVENTS_27 } from "./t518-staged-body-principal-events.js";
import { T519_STAGED_CONTRACT_PRINCIPAL_EVENTS_27 } from "./t519-staged-contract-principal-events.js";
import { T521_STAGED_FIN29_PRINCIPAL_EVENTS } from "./t521-staged-fin29-principal-events.js";

const bridge26 = T515_STAGED_PRINCIPAL_EVENTS_26[0];
const exactOverrides = new Map(
  [
    ...T516_STAGED_DOC_PRINCIPAL_EVENTS_26,
    ...T518_STAGED_BODY_PRINCIPAL_EVENTS_27,
    ...T519_STAGED_CONTRACT_PRINCIPAL_EVENTS_27,
    ...T521_STAGED_FIN29_PRINCIPAL_EVENTS
  ].map(event => [event.id, event] as const)
);

const activePrincipals = PRINCIPAL_EVENTS_26_30.map(event => {
  if (event.id === "EVT_26_IDN_001") return bridge26;
  return exactOverrides.get(event.id) ?? event;
});

export const EVENTS_26_30=[...activePrincipals,...CONDITIONAL_EVENTS_26_30];
