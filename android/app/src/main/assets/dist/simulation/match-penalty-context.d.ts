import type { GameState } from "../core/types.js";
import { type OfficialMatchRecord } from "./match-model.js";
export interface PenaltyDecisionSetup {
    id: string;
    fixtureId: string;
    date: string;
    club: string;
    designatedTakerRef: string;
    priorMissMinute: number;
    decisionMinute: number;
    scoreHome: number;
    scoreAway: number;
    highProfile: true;
}
export interface PenaltySetupStore {
    version: 1;
    contexts: PenaltyDecisionSetup[];
}
export interface PenaltySetupIssue {
    path: string;
    reason: string;
}
export declare function getPenaltySetupStore(state: GameState): PenaltySetupStore | null;
/**
 * Materialize the pre-choice sporting setup for MATCH24-like moments.
 * This does not resolve who ultimately takes the second penalty and never resolves scored/missed.
 */
export declare function recordPenaltyDecisionSetupInPlace(state: GameState, match?: OfficialMatchRecord | null): PenaltyDecisionSetup | null;
export declare function currentPenaltyDecisionSetup(state: GameState): PenaltyDecisionSetup | null;
/** Read-only validation for the optional penalty-setup store. */
export declare function inspectPenaltySetupStore(value: unknown, state: GameState): PenaltySetupIssue | null;
