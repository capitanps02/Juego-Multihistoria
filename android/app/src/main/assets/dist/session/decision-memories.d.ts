import type { EventDefinition, GameState } from "../core/types.js";
export interface DecisionMemory {
    journalIndex: number;
    date: string;
    title: string;
    choiceLabel: string;
}
/** Only recall recorded choices, never expose seed payloads or predict outcomes. */
export declare function decisionMemories(state: GameState, event: EventDefinition, journal: readonly {
    date: string;
    title: string;
    choiceLabel: string;
}[]): DecisionMemory[];
