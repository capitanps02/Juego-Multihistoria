import type { EventDefinition } from "../core/types.js";
export interface ValidationIssue {
    level: "error" | "warning";
    eventId: string;
    message: string;
}
export declare function validateEvents(events: EventDefinition[]): ValidationIssue[];
