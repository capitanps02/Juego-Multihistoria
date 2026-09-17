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
export declare const T51_EUR_ELIGIBILITY_CONTENT_IDENTITY = "de9ef2f501c015705a28d54afd140259356f15566d424511e6dbf67769c9bd19";
export declare const T51_PRS_CAUSAL_CONTENT_IDENTITY = "303527efcc42c17e502257c3d7c613facafa10c8ed113810b64a1d7ebc6d0bb1";
export declare const T51_T55A_20_23_CONTENT_IDENTITY = "6a9c66ab3afaec76299662afb2a662e19203f8c6c430a87cc458b8608965a651";
export declare const T51_T55B_20_23_CONTENT_IDENTITY = "6e552f606ace400d7b535747fbf7ba6078c60fd92889d4a360eb4db0bfb1013a";
export declare const T51_T56A_20_23_CONTENT_IDENTITY = "ce2f30ea24934787fb116627c727e4adf6c7bd05f8b8e79f415a20643e3fd58f";
export declare const T51_COMBINED_PRS20_23_CONTENT_IDENTITY = "691401e78db356a03bf7bf13c7d2a2931d66431cc3108f22a8664f37d3afbdb8";
export declare const T51_COMBINED_18_23_CONTENT_IDENTITY = "84871fae2bec92d74d1e607e0a48943e2e530a062d315a829cfe75eda9fe0886";
export declare const T51_SPORT_CONTEXT_18_20_CONTENT_IDENTITY = "99ec70cdb10e20069e5281dac5b56e2146779cc462add1c47fc7d8ea6fa5ef28";
export declare const T51_AGE18_MARKET_AUTHORITY_CONTENT_IDENTITY = "df1b8939f29c7bca65829dbfa2a0c4a2fcb5c8cc8f1ea08eb96592edc4dcd6fc";
export declare const T51_CANON_30_34_CONTENT_IDENTITY = "189176d8799f9cd5da956ef7c5a43bdaa7733ad5e98b919232ecf7311b458b0a";
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
