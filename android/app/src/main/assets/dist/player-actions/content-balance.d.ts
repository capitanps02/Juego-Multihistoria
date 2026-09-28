export type PlayerActionPlannedMetric = "body.fatigue" | "body.fitness" | "body.risk" | "professional.technique" | "professional.tacticalReading" | "professional.matchEndurance" | "professional.commercialPower" | "professional.publicPolarization" | "professional.institutionalTrust" | "professional.motivationReserve" | "professional.lockerPower" | "relationship.affinity" | "relationship.trust" | "relationship.respect" | "relationship.resentment";
export interface PlayerActionPlannedDelta {
    metric: PlayerActionPlannedMetric;
    delta: number;
}
export interface PlayerActionOptionBalanceSpec {
    optionId: string;
    directDeltas: readonly PlayerActionPlannedDelta[];
}
export interface PlayerActionBalanceSpec {
    actionId: string;
    options: readonly PlayerActionOptionBalanceSpec[];
}
/**
 * Target V1 balance owned by A5.
 *
 * This data is deliberately not consumed by the executor. A1 still owns the
 * closed effect registry and must translate approved rows into registered
 * handlers. Keeping the target numbers here prevents balance decisions from
 * being hidden inside engine code.
 */
export declare const PLAYER_ACTION_BALANCE_SPECS: readonly PlayerActionBalanceSpec[];
