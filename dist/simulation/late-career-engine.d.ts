import type { GameState } from "../core/types.js";
export declare function syncRetirementState(state: GameState, previous: GameState["retirement"]["status"]): void;
export declare function closeCareer(state: GameState, reason: string, closureType: string): void;
export declare function reverseRetirement(state: GameState): void;
export declare function lateCareerPreseason(state: GameState): void;
export declare function lateCareerWeek(state: GameState): void;
