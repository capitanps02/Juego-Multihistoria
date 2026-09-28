import type { GameState } from "./types.js";
export type NpcKnowledgeSource = "witnessed" | "informed" | "public" | "reported";
export type NpcMemoryClass = "strong" | "temporary" | "practical";
export interface NpcKnowledgeRecord {
    factId: string;
    eventId: string;
    choiceId: string;
    outcomeId: string;
    learnedAt: string;
    source: NpcKnowledgeSource;
    certainty: number;
    memory: NpcMemoryClass;
    club: string;
    expiresAfter?: string;
    sourceNpcId?: string;
}
export interface RememberNpcFactOptions {
    factId: string;
    eventId: string;
    choiceId: string;
    outcomeId: string;
    source: NpcKnowledgeSource;
    certainty?: number;
    memory?: NpcMemoryClass;
    expiresAfterDays?: number;
    sourceNpcId?: string;
    relationshipMemory?: boolean;
    club?: string;
    /** Historical reconciliation only; normal runtime learns on state.date. */
    learnedAt?: string;
}
export interface InformNpcOptions {
    factId?: string;
    source?: Exclude<NpcKnowledgeSource, "witnessed">;
    certainty?: number;
    memory?: NpcMemoryClass;
    expiresAfterDays?: number;
    sourceNpcId?: string;
    relationshipMemory?: boolean;
}
export declare function getNpcKnowledgeRecord(state: GameState, npcId: string, factId: string): NpcKnowledgeRecord | undefined;
export declare function npcKnows(state: GameState, npcId: string, factId: string, asOfDate?: string): boolean;
export declare function rememberNpcFactInPlace(state: GameState, npcId: string, options: RememberNpcFactOptions): NpcKnowledgeRecord;
export declare function informNpcOfEventInPlace(state: GameState, npcId: string, eventId: string, options?: InformNpcOptions): NpcKnowledgeRecord;
export declare function forgetExpiredNpcKnowledgeInPlace(state: GameState): string[];
