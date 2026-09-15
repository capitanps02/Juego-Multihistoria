import type { EventDefinition, GameState, ScheduledEvent } from "../core/types.js";
import { EventIndex } from "./event-index.js";
export interface SchedulerOptions {
    qa?: boolean;
    currentTick?: number;
    ignoreRhythmGate?: boolean;
}
export declare function scheduleEvent(state: GameState, source: EventDefinition[] | EventIndex, options?: SchedulerOptions): ScheduledEvent | null;
