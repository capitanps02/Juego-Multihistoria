export interface PlayerActionContentOptionSpec {
    id: string;
    label: string;
    publicResult: string;
}
export interface PlayerActionContentSpec {
    id: string;
    label: string;
    description: string;
    options: readonly PlayerActionContentOptionSpec[];
}
/**
 * Public-facing content for the complete A5 V1 catalog.
 *
 * This is intentionally NOT a PlayerActionDefinition registry. Blocked actions
 * live here so copy/options can be certified without pretending A1 already owns
 * the required health, eligibility, effect or target-predicate contracts.
 */
export declare const PLAYER_ACTION_CONTENT_SPECS: readonly PlayerActionContentSpec[];
