import type { EventDefinition, GameState } from "../../../core/types.js";
export type MemoryConditionalId = "CEVT_34_FAMILY_CLUB_BUYIN" | "CEVT_34_CLARA_EXCLUSIVE" | "CEVT_35_PUBLIC_FEUD_RETURNS";
export declare function isMemoryConditionalEligible(state: GameState, id: MemoryConditionalId): boolean;
export declare const STAGED_MEMORY_CONDITIONALS: EventDefinition[];
export declare function eligibleMemoryConditionals(state: GameState): EventDefinition[];
