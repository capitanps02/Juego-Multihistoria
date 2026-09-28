import type { EventDefinition } from "../core/types.js";
import { type ContentEvidenceSource } from "./content-migration.js";
import type { LegacyEventEvidence } from "./pre-t51-legacy-registry.js";
export interface SessionValidationContext {
    events: readonly EventDefinition[];
    activeContentIdentity: string;
    activeEvidence?: Readonly<Record<string, LegacyEventEvidence>>;
    contentSources?: Readonly<Record<string, ContentEvidenceSource>>;
}
export declare function assertSessionSnapshot(value: unknown, context: SessionValidationContext): Promise<void>;
