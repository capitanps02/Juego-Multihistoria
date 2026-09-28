import type { LegacyEventEvidence } from "./pre-t51-legacy-registry.js";
export interface PostT51ContentEvidenceSource {
    contentIdentity: string;
    engineBuild: string;
    sessionVersions: readonly number[];
    events: Readonly<Record<string, LegacyEventEvidence>>;
}
export declare const POST_T51_CONTENT_SOURCES: Readonly<Record<string, PostT51ContentEvidenceSource>>;
