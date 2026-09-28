import type { PlayerActionDefinition, PlayerActionFact, PlayerActionGameState, PlayerActionState } from "./types.js";
export declare function addPlayerActionDays(isoDate: string, days: number): string;
export declare function readPlayerActionState(state: PlayerActionGameState): Readonly<PlayerActionState>;
export declare function playerActionStateSnapshot(state: PlayerActionGameState): PlayerActionState | null;
export declare function ensurePlayerActionStateInPlace(state: PlayerActionGameState): PlayerActionState;
export declare function playerActionCooldownKey(definition: PlayerActionDefinition, targetId?: string): string | null;
export declare function playerActionGroupCooldownKey(definition: PlayerActionDefinition): string | null;
export declare function isPlayerActionCooldownGroupValid(definition: PlayerActionDefinition): boolean;
export declare function getPlayerActionCooldown(state: PlayerActionGameState, definition: PlayerActionDefinition, targetId?: string): string | null;
export declare function isPlayerActionCooldownActive(currentDate: string, cooldownUntil: string | null): boolean;
export declare function getPlayerActionFacts(state: PlayerActionGameState, options?: {
    activeOnly?: boolean;
    kind?: PlayerActionFact["kind"];
}): PlayerActionFact[];
