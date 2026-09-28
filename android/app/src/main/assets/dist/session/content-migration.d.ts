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
export declare const T51_AGENT5_18_23_CONTENT_IDENTITY = "84871fae2bec92d74d1e607e0a48943e2e530a062d315a829cfe75eda9fe0886";
export declare const T51_AGE18_AUTHORITY_CONTENT_IDENTITY = "df1b8939f29c7bca65829dbfa2a0c4a2fcb5c8cc8f1ea08eb96592edc4dcd6fc";
export declare const T51_A5_POST_J_K_CONTENT_IDENTITY = "586055d1636c16c88e18ea4367325e377242a6fdbda53997d83f04e4f75e47b9";
export declare const T51_A5_REP_MARKET_CONTENT_IDENTITY = "73591bc91387fc94502f24d80aa48cc2a8e3957a1ad42964cf312c61cbba923d";
export declare const T51_A6_FIRST5_CONTENT_IDENTITY = "8bb987042cccdce110d4de200aad5c4da760c34a4fb717cccfc4d31f4f0c9b16";
export declare const T51_A6_SAFE3_CONTENT_IDENTITY = "4973518cdceb84b86be62179ada2c0782da9f007c443d7ffd132ec88353229a3";
export declare const T51_A7_SHIFTED5_CONTENT_IDENTITY = "ee5904632512feb3f99fe5b68a794ae12b4f73b4edd469a436d6f5431d7aa4bc";
export declare const T51_A7_FACTUAL2_CONTENT_IDENTITY = "4ac0ff3cb30f950f8241aee28cf47bfc092b7dc35fc7f8c703caf7602b127670";
export declare const T51_A7_ROLE31_CONTENT_IDENTITY = "96a196d6c66dc2d7c5d22a1a9272783ca748dec36812fc9f7ff6360ef4c2983a";
export declare const T51_A8_WAVE_A_CONTENT_IDENTITY = "b360a1ef1e0d0c19f4600f174bf9d3b2693ed88058a283ed2cdbfaf29d26200b";
export declare const T51_T5_161_CAPTAIN_CONTENT_IDENTITY = "56b9ca09b872ac6dc8fc78ec9459bf15fb7ab21c20707f354af06c99ee00d0f4";
export declare const T51_A8_ORDINARY_FINAL_CONTENT_IDENTITY = "ab7c3e62f7ca6d90973e657f2eb0a9cec0a745fe12369ac9df770bcf6614e658";
export declare const T51_A9_TERMINAL_FINAL_CONTENT_IDENTITY = "d0fee1ceef2c3bdb7d8cd933ce773341a3c375b39deedcc21cd801a8c3f67770";
export declare const T55_A18_NARRATIVE_CLEANUP_CONTENT_IDENTITY = "39945e3250c1238cad979e3957004a2b78bcedff7a727a16d70ef63e1d7269b0";
export declare const T55_A18_C46_TEMPLATE_CLEANUP_CONTENT_IDENTITY = "54f3f03a68b4d7f00f1e8486ee593a6f65bb7ba4d059a1a67fa3da17dc87dfe0";
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
