import type { GameState } from "../core/types.js";
export declare function currentSportsCoachNpcId(state: GameState): string | null;
export declare function currentSportsCoachTrust(state: GameState): number | null;
export declare function advanceWorldDayInPlace(next: GameState): GameState;
export declare function advanceWorldDay(state: GameState): GameState;
