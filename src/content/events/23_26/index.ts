import { PRINCIPAL_EVENTS_23_26 } from "./principal-events.js";
import { CONDITIONAL_EVENTS_23_26 } from "./conditional-events.js";
import { T510_PRINCIPAL_EVENTS_23 } from "./t510-principal-events.js";
import { T511_PRINCIPAL_EVENTS_23 } from "./t511-principal-events.js";
import { T511_PRS_PRINCIPAL_EVENTS_23 } from "./t511-prs-principal-events.js";
import { T512_STAGED_MARKET_PRINCIPAL_EVENTS_25 } from "./t512-staged-market-principal-events.js";
import { T513_STAGED_OFFER_PRINCIPAL_EVENTS_23_25 } from "./t513-staged-offer-principal-events.js";
import { T514_STAGED_LOCK_PRINCIPAL_EVENTS_23 } from "./t514-staged-lock-principal-events.js";

const principalOverrides = new Map(
  [
    ...T510_PRINCIPAL_EVENTS_23,
    ...T511_PRINCIPAL_EVENTS_23,
    ...T511_PRS_PRINCIPAL_EVENTS_23,
    ...T512_STAGED_MARKET_PRINCIPAL_EVENTS_25,
    ...T513_STAGED_OFFER_PRINCIPAL_EVENTS_23_25,
    ...T514_STAGED_LOCK_PRINCIPAL_EVENTS_23
  ].map(event => [event.id, event] as const)
);
const activePrincipals = PRINCIPAL_EVENTS_23_26.map(event => principalOverrides.get(event.id) ?? event);

export const EVENTS_23_26=[...activePrincipals,...CONDITIONAL_EVENTS_23_26];
