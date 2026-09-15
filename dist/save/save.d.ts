import type { GameState } from "../core/types.js";
export declare const CURRENT_SCHEMA_VERSION = 8;
export declare function serializeSave(state: GameState, pretty?: boolean): string;
export declare function loadSave(raw: string): GameState;
