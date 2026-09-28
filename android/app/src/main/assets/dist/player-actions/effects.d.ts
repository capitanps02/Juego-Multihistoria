import type { DataValue } from "../core/types.js";
import type { PlayerActionFactKind, PlayerActionGameState } from "./types.js";
export interface PlayerActionFactDraft {
    kind: PlayerActionFactKind;
    payload: Record<string, DataValue>;
    expiresInDays?: number;
}
export declare function hasPlayerActionEffect(effectKey: string): boolean;
export declare function applyPlayerActionEffect(state: PlayerActionGameState, effectKey: string, targetId?: string): readonly PlayerActionFactDraft[];
export declare const PLAYER_ACTION_EFFECT_KEYS: readonly string[];
