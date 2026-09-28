export type PlayerActionContentClass = "CORE" | "CONTEXTUAL" | "LATE_CAREER" | "OPTIONAL_FLAVOR";
export type PlayerActionContentCategory = "career" | "training" | "health" | "representative" | "relationships" | "image" | "life";
export type PlayerActionContentStatus = "implemented" | "blocked";
export interface PlayerActionContentPlanRow {
    id: string;
    classification: PlayerActionContentClass;
    category: PlayerActionContentCategory;
    ageRange: readonly [number, number | null];
    cooldownDays: number;
    targetKind: "none" | "coach" | "agent" | "teammate";
    status: PlayerActionContentStatus;
    requiredContext: string;
    blockedBy?: string;
}
export declare const PLAYER_ACTION_CONTENT_PLAN: readonly PlayerActionContentPlanRow[];
