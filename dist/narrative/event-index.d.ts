import type { EventDefinition, EventFamily, GameState } from "../core/types.js";
export declare class EventIndex {
    readonly events: EventDefinition[];
    private byPhase;
    private byFamily;
    private byAge;
    constructor(events: EventDefinition[]);
    candidates(state: GameState): EventDefinition[];
    family(family: EventFamily): EventDefinition[];
}
