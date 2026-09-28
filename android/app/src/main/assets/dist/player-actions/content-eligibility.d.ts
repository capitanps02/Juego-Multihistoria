import type { PlayerActionEligibilityPredicate } from "./types.js";
export interface PlayerActionEligibilitySpec {
    actionId: string;
    all: readonly PlayerActionEligibilityPredicate[];
}
/**
 * Target V1 eligibility owned by A5.
 *
 * This is intentionally declarative and closed. A1 may implement these
 * predicates in the core engine, but content never supplies executable
 * callbacks or arbitrary state paths.
 */
export declare const PLAYER_ACTION_ELIGIBILITY_SPECS: readonly PlayerActionEligibilitySpec[];
