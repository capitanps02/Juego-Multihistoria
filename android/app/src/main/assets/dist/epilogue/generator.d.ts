import type { EndingFamily, GameState } from "../core/types.js";
export declare const ENDING_FAMILIES: EndingFamily[];
export interface EndingFamilyAuditRule {
    positive: string[];
    negative: string[];
    conflicts: EndingFamily[];
    priority: number;
}
export declare const ENDING_FAMILY_RULES: Record<EndingFamily, EndingFamilyAuditRule>;
export declare function endingFamiliesCompatible(a: EndingFamily, b: EndingFamily): boolean;
export declare function endingFamilySupported(state: GameState, id: EndingFamily): boolean;
export declare function endingFamilyEvidence(state: GameState, id: EndingFamily): string[];
export declare function selectEndingFamilies(state: GameState): EndingFamily[];
export declare function buildEpilogueText(state: GameState): string[];
export declare function generateEpilogue(state: GameState): void;
