import type { EventDefinition, GameState, HistoryEntry } from "../core/types.js";
import { type State20Classification } from "./state20-classifier.js";
import { type State23Classification } from "./state23-classifier.js";
import { type State26Classification } from "./state26-classifier.js";
import { type State30Classification } from "./state30-classifier.js";
import { type State34Classification } from "./state34-classifier.js";
export type ChoiceStrategy = "random" | "first" | "balanced";
export interface CareerSimulationOptions {
    seed: number;
    days?: number;
    events?: EventDefinition[];
    choiceStrategy?: ChoiceStrategy;
    qa?: boolean;
    microfeeds?: boolean;
    untilRetirement?: boolean;
    maxAge?: number;
    /** Explicit headless policy, independent of interactive player authorization. */
    offerStrategy?: "accept" | "reject" | "delegate";
}
export interface CareerSimulationResult {
    seed: number;
    state: GameState;
    history: HistoryEntry[];
    narrativeSignature: string;
    signature: string;
    state20: State20Classification;
    state23?: State23Classification;
    state26?: State26Classification;
    state30?: State30Classification;
    state34?: State34Classification;
}
export declare function simulateCareer(options: CareerSimulationOptions): CareerSimulationResult;
