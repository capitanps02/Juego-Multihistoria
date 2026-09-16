import type { EventDefinition, GameState } from "../core/types.js";
import { type LegacyEventEvidence } from "./pre-t51-legacy-registry.js";
import { type FrozenOfferBridgeEventEvidence } from "./frozen-offer-bridge-evidence.js";
export interface ContentEvidenceSource {
    contentIdentity: string;
    engineBuild: string;
    sessionVersions: readonly number[];
    events: Readonly<Record<string, LegacyEventEvidence>>;
    /** Validation-only contractual semantics. Never scheduled. */
    offerBridges?: Readonly<Record<string, FrozenOfferBridgeEventEvidence>>;
}
export interface SameSceneSchedulerMapping {
    kind: "same_scene";
    legacyEventId: string;
    canonicalEventId: string;
    migrateCooldown?: boolean;
}
export interface DistinctSceneSchedulerMapping {
    kind: "distinct_scene";
    legacyEventId: string;
    canonicalEventId: string;
    /** Required for exact-ID semantic collisions to avoid suppressing the new scene. */
    clearCanonicalSeen?: boolean;
    clearCanonicalCooldown?: boolean;
}
export type SchedulerMigrationMapping = SameSceneSchedulerMapping | DistinctSceneSchedulerMapping;
export interface SeedOriginMigrationMapping {
    seedId: string;
    fromEventId: string;
    toEventId: string;
    /** Existing saves are never relabelled unless this is explicitly true. */
    rewriteExisting: boolean;
}
export interface ContentMigrationRoute {
    sourceContentIdentity: string;
    targetContentIdentity: string;
    schedulerMappings?: readonly SchedulerMigrationMapping[];
    seedOriginMappings?: readonly SeedOriginMigrationMapping[];
}
/** Validation-only historical catalogs. They never join EventIndex or scheduling. */
export declare const LEGACY_CONTENT_SOURCES: Readonly<Record<string, ContentEvidenceSource>>;
export declare const T51_B1A_CONTENT_IDENTITY = "1a8a5e2006fe7160f4fbc02060568d3abec99df038fe3a1a7799c8a0e802eac7";
export declare const T51_T510_CONTENT_IDENTITY = "fee2ff875bac7979d3907f5ee1004ef736efa9a257237c6dee629dd8687fe136";
export declare const T51_T511_CONTENT_IDENTITY = "5d3fd71a8df42ed5b93fdde63ed386e9d776693addd62a30293dbecad7aa56d2";
export declare const T51_PRS_CONTENT_IDENTITY = "88751a2107c035826162968991e3a1808b2f4573afa3a3a20a3efa376fa8af1f";
/**
 * Explicit identity-bound edges. Successive canonical batches extend this as a
 * lineage (A -> B -> C), not as a matrix of shortcuts from every old version.
 */
export declare const CONTENT_MIGRATION_ROUTES: readonly ContentMigrationRoute[];
export declare function findMigrationRoute(sourceContentIdentity: string, targetContentIdentity: string, routes?: readonly ContentMigrationRoute[]): ContentMigrationRoute | undefined;
/**
 * Resolve exactly one acyclic migration path. Missing or ambiguous paths fail
 * closed. Declaration order never silently chooses between competing histories.
 */
export declare function findMigrationPath(sourceContentIdentity: string, targetContentIdentity: string, routes?: readonly ContentMigrationRoute[]): readonly ContentMigrationRoute[] | undefined;
export declare function legacyContentSource(contentIdentityValue: string, sources?: Readonly<Record<string, ContentEvidenceSource>>): ContentEvidenceSource | undefined;
export declare function buildActiveEventEvidence(events: readonly EventDefinition[], knownContentIdentity?: string): Promise<Readonly<Record<string, LegacyEventEvidence>>>;
/** Build validation-only offer bridge semantics from the exact active definitions. */
export declare function buildActiveOfferBridgeEvidence(events: readonly EventDefinition[], activeEvidence: Readonly<Record<string, LegacyEventEvidence>>): Readonly<Record<string, FrozenOfferBridgeEventEvidence>>;
export declare function applyMigrationRouteInPlace(state: GameState, route: ContentMigrationRoute): void;
export declare function applyMigrationPathInPlace(state: GameState, path: readonly ContentMigrationRoute[]): void;
/** Re-apply only scheduler semantics after resolving a preserved legacy pending scene. */
export declare function applyPostLegacyResolutionRouteInPlace(state: GameState, eventId: string, route: ContentMigrationRoute): void;
export declare function applyPostLegacyResolutionPathInPlace(state: GameState, eventId: string, path: readonly ContentMigrationRoute[]): void;
