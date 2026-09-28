import type { GameState } from "../core/types.js";
export declare const NATIONAL_FINAL_PUBLICATION_DELAY_DAYS = 21;
/**
 * Observe the simulator's national-selection publication boundary.
 *
 * The reader never infers membership from nationalStanding/caps/reputation/role.
 * Membership is written only here, at a concrete world-simulation boundary:
 * - preliminary list: the tournament-cycle opens;
 * - final list: 21 runtime days after the persisted preliminary publication.
 *
 * No RNG stream is read or advanced.
 */
export declare function publishNationalSelectionFactsInPlace(state: GameState, beforeTournamentCycleOpen: boolean): void;
