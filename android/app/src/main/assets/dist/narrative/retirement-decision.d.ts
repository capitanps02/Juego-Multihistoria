import type { GameState } from "../core/types.js";
export declare const RETIREMENT_DECISION_EVENT_ID = "EVT_RET_FAM_001";
/**
 * Read-only eligibility for the player-initiated "Considerar retirada" action.
 *
 * The canonical retirement scene remains the authority. This helper deliberately
 * bypasses scheduler rhythm/period-budget selection because the player is asking
 * to open the decision surface explicitly; it does not bypass the event's actual
 * age/phase, cooldown, canonical runtime, gates, guards, exclusions, knowledge or
 * choice eligibility.
 *
 * No RNG is consumed and no GameState field is written.
 */
export declare function retirementDecisionAvailable(state: GameState): boolean;
