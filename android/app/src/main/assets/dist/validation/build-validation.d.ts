import type { EventDefinition } from "../core/types.js";
export interface BuildIssue {
    level: "error" | "warning";
    code: string;
    subject: string;
    message: string;
}
export declare function validateBuild(events?: EventDefinition[]): BuildIssue[];
