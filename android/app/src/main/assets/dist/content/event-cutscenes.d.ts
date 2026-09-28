import type { GameState } from "../core/types.js";
export interface EventCutscene {
    eventId: string;
    file: string;
    title: string;
}
export declare const PROLOGUE_CUTSCENE: EventCutscene;
export declare const EVENT_CUTSCENES: readonly EventCutscene[];
export declare function eventCutscene(state: GameState, screen: string, pendingEventId?: string): EventCutscene | null;
