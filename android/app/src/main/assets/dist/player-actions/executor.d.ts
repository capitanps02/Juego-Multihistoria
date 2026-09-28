import type { PlayerActionDefinition, PlayerActionExecutionResult, PlayerActionGameState, PlayerActionPureExecution, PlayerActionRequest } from "./types.js";
export declare function playerActionAvailability(state: PlayerActionGameState, actionId: string, targetId?: string, catalog?: readonly PlayerActionDefinition[]): import("./types.js").PlayerActionAvailability | null;
export declare function executePlayerActionInPlace(state: PlayerActionGameState, request: PlayerActionRequest, catalog?: readonly PlayerActionDefinition[]): PlayerActionExecutionResult;
export declare function executePlayerAction(state: PlayerActionGameState, request: PlayerActionRequest, catalog?: readonly PlayerActionDefinition[]): PlayerActionPureExecution;
export declare function playerActionPublicResult(result: PlayerActionExecutionResult): PlayerActionExecutionResult;
