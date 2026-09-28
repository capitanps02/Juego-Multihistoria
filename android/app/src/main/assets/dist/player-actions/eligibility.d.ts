import type { PlayerActionAvailability, PlayerActionDefinition, PlayerActionErrorCode, PlayerActionGameState } from "./types.js";
export interface PlayerActionTargetValidation {
    valid: boolean;
    code: PlayerActionErrorCode | null;
    reason: string | null;
}
export declare function validatePlayerActionTarget(state: PlayerActionGameState, definition: PlayerActionDefinition, targetId?: string): PlayerActionTargetValidation;
export declare function evaluatePlayerAction(state: PlayerActionGameState, definition: PlayerActionDefinition, targetId?: string): PlayerActionAvailability;
export declare function isPlayerActionAvailable(state: PlayerActionGameState, definition: PlayerActionDefinition, targetId?: string): boolean;
export declare function getAvailablePlayerActionOptions(state: PlayerActionGameState, definition: PlayerActionDefinition, targetId?: string): PlayerActionAvailability["options"];
export declare function listPlayerActions(state: PlayerActionGameState, catalog?: readonly PlayerActionDefinition[], targetByAction?: Readonly<Record<string, string | undefined>>): PlayerActionAvailability[];
export declare function getAvailablePlayerActions(state: PlayerActionGameState, catalog?: readonly PlayerActionDefinition[], targetByAction?: Readonly<Record<string, string | undefined>>): PlayerActionAvailability[];
