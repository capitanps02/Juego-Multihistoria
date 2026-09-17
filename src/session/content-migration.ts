import type { EventDefinition, GameState } from "../core/types.js";
import { offerBridgeSpec } from "../narrative/offer-bridge.js";
import { contentIdentity, eventFingerprintMap, journalSemanticsFingerprint } from "./content-identity.js";
import {
  PRE_T51_CONTENT_IDENTITY,
  PRE_T51_EVENT_EVIDENCE,
  type LegacyEventEvidence
} from "./pre-t51-legacy-registry.js";
import { POST_T51_CONTENT_SOURCES } from "./post-t51-legacy-registry.js";
import { PLAYCANVAS_PRE_T41_IDENTITY, PLAYCANVAS_PRE_T41_EVIDENCE } from "./playcanvas-legacy-registry.js";
import {
  FROZEN_OFFER_BRIDGE_SOURCES,
  type FrozenOfferBridgeEventEvidence
} from "./frozen-offer-bridge-evidence.js";

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

const postLegacySourcesWithBridgeEvidence: Readonly<Record<string, ContentEvidenceSource>> = Object.fromEntries(
  Object.entries(POST_T51_CONTENT_SOURCES).map(([identity, source]) => [identity, {
    ...source,
    offerBridges: FROZEN_OFFER_BRIDGE_SOURCES[identity] ?? {}
  }])
);

/** Validation-only historical catalogs. They never join EventIndex or scheduling. */
export const LEGACY_CONTENT_SOURCES: Readonly<Record<string, ContentEvidenceSource>> = {
  [PLAYCANVAS_PRE_T41_IDENTITY]: {
    contentIdentity: PLAYCANVAS_PRE_T41_IDENTITY,
    engineBuild: "0.8.0-t2.2",
    sessionVersions: [1, 2, 3],
    events: PLAYCANVAS_PRE_T41_EVIDENCE,
    offerBridges: {}
  },
  [PRE_T51_CONTENT_IDENTITY]: {
    contentIdentity: PRE_T51_CONTENT_IDENTITY,
    engineBuild: "0.8.0-t2.5",
    sessionVersions: [1, 2, 3],
    events: PRE_T51_EVENT_EVIDENCE,
    offerBridges: FROZEN_OFFER_BRIDGE_SOURCES[PRE_T51_CONTENT_IDENTITY] ?? {}
  },
  ...postLegacySourcesWithBridgeEvidence
};

export const T51_B1A_CONTENT_IDENTITY = "1a8a5e2006fe7160f4fbc02060568d3abec99df038fe3a1a7799c8a0e802eac7";
export const T51_T510_CONTENT_IDENTITY = "fee2ff875bac7979d3907f5ee1004ef736efa9a257237c6dee629dd8687fe136";
export const T51_T511_CONTENT_IDENTITY = "5d3fd71a8df42ed5b93fdde63ed386e9d776693addd62a30293dbecad7aa56d2";
export const T51_PRS_CONTENT_IDENTITY = "88751a2107c035826162968991e3a1808b2f4573afa3a3a20a3efa376fa8af1f";
export const T51_EUR_ELIGIBILITY_CONTENT_IDENTITY = "de9ef2f501c015705a28d54afd140259356f15566d424511e6dbf67769c9bd19";
export const T51_PRS_CAUSAL_CONTENT_IDENTITY = "303527efcc42c17e502257c3d7c613facafa10c8ed113810b64a1d7ebc6d0bb1";
export const T51_T55A_20_23_CONTENT_IDENTITY = "6a9c66ab3afaec76299662afb2a662e19203f8c6c430a87cc458b8608965a651";
export const T51_T55B_20_23_CONTENT_IDENTITY = "6e552f606ace400d7b535747fbf7ba6078c60fd92889d4a360eb4db0bfb1013a";
export const T51_T56A_20_23_CONTENT_IDENTITY = "ce2f30ea24934787fb116627c727e4adf6c7bd05f8b8e79f415a20643e3fd58f";
export const T51_COMBINED_PRS20_23_CONTENT_IDENTITY = "691401e78db356a03bf7bf13c7d2a2931d66431cc3108f22a8664f37d3afbdb8";
export const T51_COMBINED_18_23_CONTENT_IDENTITY = "84871fae2bec92d74d1e607e0a48943e2e530a062d315a829cfe75eda9fe0886";
export const T51_SPORT_CONTEXT_18_20_CONTENT_IDENTITY = "99ec70cdb10e20069e5281dac5b56e2146779cc462add1c47fc7d8ea6fa5ef28";
export const T51_AGE18_MARKET_AUTHORITY_CONTENT_IDENTITY = "df1b8939f29c7bca65829dbfa2a0c4a2fcb5c8cc8f1ea08eb96592edc4dcd6fc";
export const T51_CANON_30_34_CONTENT_IDENTITY = "189176d8799f9cd5da956ef7c5a43bdaa7733ad5e98b919232ecf7311b458b0a";

/**
 * Explicit identity-bound edges. Successive canonical batches extend this as a
 * lineage (A -> B -> C), not as a matrix of shortcuts from every old version.
 */
export const CONTENT_MIGRATION_ROUTES: readonly ContentMigrationRoute[] = [
  {
    sourceContentIdentity: PLAYCANVAS_PRE_T41_IDENTITY,
    targetContentIdentity: PRE_T51_CONTENT_IDENTITY,
    // Preserve the exact historical pending definition and all scheduler state.
    // This patch adds seed closure to future WITHDRAW outcomes, not a new scene.
    schedulerMappings: [],
    seedOriginMappings: []
  },
  {
    sourceContentIdentity: PRE_T51_CONTENT_IDENTITY,
    targetContentIdentity: T51_B1A_CONTENT_IDENTITY,
    schedulerMappings: [
      { kind: "same_scene", legacyEventId: "EVT_18_MED_001", canonicalEventId: "EVT_18_MED_001" },
      { kind: "same_scene", legacyEventId: "EVT_18_TEAM_001", canonicalEventId: "EVT_18_TEAM_001" },
      { kind: "same_scene", legacyEventId: "EVT_18_MATCH_002", canonicalEventId: "EVT_18_MATCH_002" }
    ]
  },
  {
    sourceContentIdentity: T51_B1A_CONTENT_IDENTITY,
    targetContentIdentity: T51_T510_CONTENT_IDENTITY,
    schedulerMappings: [
      {
        kind: "distinct_scene",
        legacyEventId: "EVT_23_BRIDGE_001",
        canonicalEventId: "EVT_23_BRIDGE_001",
        clearCanonicalSeen: true,
        clearCanonicalCooldown: true
      },
      {
        kind: "distinct_scene",
        legacyEventId: "EVT_23_AGT_001",
        canonicalEventId: "EVT_23_AGT_001",
        clearCanonicalSeen: true,
        clearCanonicalCooldown: true
      },
      {
        kind: "distinct_scene",
        legacyEventId: "EVT_23_BODY_001",
        canonicalEventId: "EVT_23_BODY_001",
        clearCanonicalSeen: true,
        clearCanonicalCooldown: true
      }
    ],
    seedOriginMappings: []
  },
  {
    sourceContentIdentity: T51_T510_CONTENT_IDENTITY,
    targetContentIdentity: T51_T511_CONTENT_IDENTITY,
    schedulerMappings: [
      {
        kind: "distinct_scene",
        legacyEventId: "EVT_23_MONEY_001",
        canonicalEventId: "EVT_23_MONEY_001",
        clearCanonicalSeen: true,
        clearCanonicalCooldown: true
      },
      {
        kind: "distinct_scene",
        legacyEventId: "EVT_23_HOME_001",
        canonicalEventId: "EVT_23_HOME_001",
        clearCanonicalSeen: true,
        clearCanonicalCooldown: true
      },
      {
        kind: "distinct_scene",
        legacyEventId: "EVT_23_EUR_001",
        canonicalEventId: "EVT_23_EUR_001",
        clearCanonicalSeen: true,
        clearCanonicalCooldown: true
      }
    ],
    seedOriginMappings: []
  },
  {
    sourceContentIdentity: T51_T511_CONTENT_IDENTITY,
    targetContentIdentity: T51_PRS_CONTENT_IDENTITY,
    schedulerMappings: [
      {
        kind: "distinct_scene",
        legacyEventId: "EVT_23_PRS_001",
        canonicalEventId: "EVT_23_PRS_001",
        clearCanonicalSeen: true,
        clearCanonicalCooldown: true
      }
    ],
    seedOriginMappings: []
  },
  {
  sourceContentIdentity: T51_PRS_CONTENT_IDENTITY,
  targetContentIdentity: T51_EUR_ELIGIBILITY_CONTENT_IDENTITY,
  schedulerMappings: [
    {
      kind: "same_scene",
      legacyEventId: "EVT_23_EUR_001",
      canonicalEventId: "EVT_23_EUR_001"
    }
  ],
  seedOriginMappings: []
  },
  {
    sourceContentIdentity: T51_EUR_ELIGIBILITY_CONTENT_IDENTITY,
    targetContentIdentity: T51_PRS_CAUSAL_CONTENT_IDENTITY,
    schedulerMappings: [
      { kind: "same_scene", legacyEventId: "EVT_23_PRS_001", canonicalEventId: "EVT_23_PRS_001" }
    ],
    seedOriginMappings: []
  },
  {
    sourceContentIdentity: T51_T55A_20_23_CONTENT_IDENTITY,
    targetContentIdentity: T51_T55B_20_23_CONTENT_IDENTITY,
    schedulerMappings: [
      { kind: "distinct_scene", legacyEventId: "EVT_21_CAP_001", canonicalEventId: "EVT_21_CAP_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_21_PRS_001", canonicalEventId: "EVT_21_PRS_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_22_CON_001", canonicalEventId: "EVT_22_CON_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_22_CON_002", canonicalEventId: "EVT_22_CON_002", clearCanonicalSeen: true, clearCanonicalCooldown: true }
    ],
    seedOriginMappings: []
  },
  {
    sourceContentIdentity: T51_T55B_20_23_CONTENT_IDENTITY,
    targetContentIdentity: T51_T56A_20_23_CONTENT_IDENTITY,
    schedulerMappings: [
      { kind: "distinct_scene", legacyEventId: "EVT_20_STATUS_001", canonicalEventId: "EVT_20_STATUS_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_20_LOCK_001", canonicalEventId: "EVT_20_LOCK_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_20_LOCK_002", canonicalEventId: "EVT_20_LOCK_002", clearCanonicalSeen: true, clearCanonicalCooldown: true }
    ],
    seedOriginMappings: []
  },
  {
    // Published PlayCanvas generation C gains only the PRS23 causal repair.
    sourceContentIdentity: T51_T56A_20_23_CONTENT_IDENTITY,
    targetContentIdentity: T51_COMBINED_PRS20_23_CONTENT_IDENTITY,
    schedulerMappings: [
      { kind: "same_scene", legacyEventId: "EVT_23_PRS_001", canonicalEventId: "EVT_23_PRS_001" }
    ],
    seedOriginMappings: []
  },
  {
    // Main's causal PRS23 generation receives the canonical 20–23 overlays.
    sourceContentIdentity: T51_PRS_CAUSAL_CONTENT_IDENTITY,
    targetContentIdentity: T51_COMBINED_PRS20_23_CONTENT_IDENTITY,
    schedulerMappings: [
      { kind: "distinct_scene", legacyEventId: "EVT_20_LIFE_001", canonicalEventId: "EVT_20_LIFE_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_20_ABR_001", canonicalEventId: "EVT_20_ABR_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_21_RIV_001", canonicalEventId: "EVT_21_RIV_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "CEVT_21_ABR_01", canonicalEventId: "CEVT_21_ABR_01", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "CEVT_21_MEDIA_01", canonicalEventId: "CEVT_21_MEDIA_01", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_21_CAP_001", canonicalEventId: "EVT_21_CAP_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_21_PRS_001", canonicalEventId: "EVT_21_PRS_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_22_CON_001", canonicalEventId: "EVT_22_CON_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_22_CON_002", canonicalEventId: "EVT_22_CON_002", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_20_STATUS_001", canonicalEventId: "EVT_20_STATUS_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_20_LOCK_001", canonicalEventId: "EVT_20_LOCK_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_20_LOCK_002", canonicalEventId: "EVT_20_LOCK_002", clearCanonicalSeen: true, clearCanonicalCooldown: true }
    ],
    seedOriginMappings: []
  },
  {
    // H is the published 20–23 generation. These early repairs retain their
    // event IDs, so completed scenes stay completed rather than replaying.
    sourceContentIdentity: T51_COMBINED_PRS20_23_CONTENT_IDENTITY,
    targetContentIdentity: T51_COMBINED_18_23_CONTENT_IDENTITY,
    schedulerMappings: [
      { kind: "same_scene", legacyEventId: "EVT_18_PRS_002", canonicalEventId: "EVT_18_PRS_002" },
      { kind: "same_scene", legacyEventId: "EVT_19_SUM_001", canonicalEventId: "EVT_19_SUM_001" },
      { kind: "same_scene", legacyEventId: "CEVT_18_BRUNO_01", canonicalEventId: "CEVT_18_BRUNO_01" },
      { kind: "same_scene", legacyEventId: "CEVT_18_CCH_01", canonicalEventId: "CEVT_18_CCH_01" },
      { kind: "same_scene", legacyEventId: "CEVT_18_RELEG_01", canonicalEventId: "CEVT_18_RELEG_01" },
      { kind: "same_scene", legacyEventId: "CEVT_19_INJ_01", canonicalEventId: "CEVT_19_INJ_01" },
      { kind: "same_scene", legacyEventId: "CEVT_19_RETURN_01", canonicalEventId: "CEVT_19_RETURN_01" }
    ],
    seedOriginMappings: []
  },
  {
    // The published Agent 5 generation gains simulation-owned sport context.
    // These retain their IDs and preserve any completed historical scene.
    sourceContentIdentity: T51_COMBINED_18_23_CONTENT_IDENTITY,
    targetContentIdentity: T51_SPORT_CONTEXT_18_20_CONTENT_IDENTITY,
    schedulerMappings: [
      { kind: "same_scene", legacyEventId: "EVT_18_MATCH_001", canonicalEventId: "EVT_18_MATCH_001" },
      { kind: "same_scene", legacyEventId: "EVT_18_PRS_001", canonicalEventId: "EVT_18_PRS_001" },
      { kind: "same_scene", legacyEventId: "EVT_18_SOC_001", canonicalEventId: "EVT_18_SOC_001" },
      { kind: "same_scene", legacyEventId: "EVT_18_END_001", canonicalEventId: "EVT_18_END_001" }
    ],
    seedOriginMappings: []
  },
  {
    // #123 only makes previously staged January/summer CareerOffer bridges
    // active. Exact scene IDs remain completed; no historical offer, contract
    // or scheduler state is replayed or rewritten during the transition.
    sourceContentIdentity: T51_SPORT_CONTEXT_18_20_CONTENT_IDENTITY,
    targetContentIdentity: T51_AGE18_MARKET_AUTHORITY_CONTENT_IDENTITY,
    schedulerMappings: [
      { kind: "same_scene", legacyEventId: "EVT_18_JAN_001", canonicalEventId: "EVT_18_JAN_001" },
      { kind: "same_scene", legacyEventId: "EVT_18_SUM_001", canonicalEventId: "EVT_18_SUM_001" }
    ],
    seedOriginMappings: []
  },
  {
    // Re-grounded canonical 30–34 overlays: exact-ID semantic collisions are
    // distinct scenes, so legacy history stays frozen and only new scheduling is released.
    sourceContentIdentity: T51_AGE18_MARKET_AUTHORITY_CONTENT_IDENTITY,
    targetContentIdentity: T51_CANON_30_34_CONTENT_IDENTITY,
    schedulerMappings: [
      { kind: "distinct_scene", legacyEventId: "EVT_30_CON_001", canonicalEventId: "EVT_30_CON_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_30_BODY_001", canonicalEventId: "EVT_30_BODY_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_30_MKT_001", canonicalEventId: "EVT_30_MKT_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_30_NAT_001", canonicalEventId: "EVT_30_NAT_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_30_FAM_001", canonicalEventId: "EVT_30_FAM_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_30_MED_001", canonicalEventId: "EVT_30_MED_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_30_FORM_001", canonicalEventId: "EVT_30_FORM_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_30_CAP_001", canonicalEventId: "EVT_30_CAP_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_31_MED_001", canonicalEventId: "EVT_31_MED_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_31_MKT_001", canonicalEventId: "EVT_31_MKT_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_31_HOME_001", canonicalEventId: "EVT_31_HOME_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_31_AGT_001", canonicalEventId: "EVT_31_AGT_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_31_LEGACY_001", canonicalEventId: "EVT_31_LEGACY_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_31_RETURN_001", canonicalEventId: "EVT_31_RETURN_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_31_TACT_001", canonicalEventId: "EVT_31_TACT_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_31_CCH_001", canonicalEventId: "EVT_31_CCH_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_31_NAT_001", canonicalEventId: "EVT_31_NAT_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_31_FINAL_001", canonicalEventId: "EVT_31_FINAL_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_32_CON_001", canonicalEventId: "EVT_32_CON_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_32_HOME_001", canonicalEventId: "EVT_32_HOME_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_32_AGT_001", canonicalEventId: "EVT_32_AGT_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_32_FAN_001", canonicalEventId: "EVT_32_FAN_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_32_NAT_001", canonicalEventId: "EVT_32_NAT_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_33_BODY_001", canonicalEventId: "EVT_33_BODY_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_33_CAP_001", canonicalEventId: "EVT_33_CAP_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_33_MKT_001", canonicalEventId: "EVT_33_MKT_001", clearCanonicalSeen: true, clearCanonicalCooldown: true },
      { kind: "distinct_scene", legacyEventId: "EVT_33_PRS_001", canonicalEventId: "EVT_33_PRS_001", clearCanonicalSeen: true, clearCanonicalCooldown: true }
    ],
    seedOriginMappings: []
  }
];

const activeEvidenceCache = new Map<string, Readonly<Record<string, LegacyEventEvidence>>>();
activeEvidenceCache.set(PRE_T51_CONTENT_IDENTITY, PRE_T51_EVENT_EVIDENCE);
for (const source of Object.values(POST_T51_CONTENT_SOURCES)) {
  activeEvidenceCache.set(source.contentIdentity, source.events);
}

export function findMigrationRoute(
  sourceContentIdentity: string,
  targetContentIdentity: string,
  routes: readonly ContentMigrationRoute[] = CONTENT_MIGRATION_ROUTES
): ContentMigrationRoute | undefined {
  return routes.find(route => route.sourceContentIdentity === sourceContentIdentity && route.targetContentIdentity === targetContentIdentity);
}

/**
 * Resolve exactly one acyclic migration path. Missing or ambiguous paths fail
 * closed. Declaration order never silently chooses between competing histories.
 */
export function findMigrationPath(
  sourceContentIdentity: string,
  targetContentIdentity: string,
  routes: readonly ContentMigrationRoute[] = CONTENT_MIGRATION_ROUTES
): readonly ContentMigrationRoute[] | undefined {
  if (sourceContentIdentity === targetContentIdentity) return [];

  const outgoing = new Map<string, ContentMigrationRoute[]>();
  for (const route of routes) {
    const list = outgoing.get(route.sourceContentIdentity) ?? [];
    list.push(route);
    outgoing.set(route.sourceContentIdentity, list);
  }

  const found: ContentMigrationRoute[][] = [];
  const walk = (current: string, path: ContentMigrationRoute[], visited: ReadonlySet<string>): void => {
    if (found.length > 1) return;
    for (const route of outgoing.get(current) ?? []) {
      const nextIdentity = route.targetContentIdentity;
      if (visited.has(nextIdentity)) continue;
      const nextPath = [...path, route];
      if (nextIdentity === targetContentIdentity) {
        found.push(nextPath);
        if (found.length > 1) return;
        continue;
      }
      const nextVisited = new Set(visited);
      nextVisited.add(nextIdentity);
      walk(nextIdentity, nextPath, nextVisited);
      if (found.length > 1) return;
    }
  };

  walk(sourceContentIdentity, [], new Set([sourceContentIdentity]));
  return found.length === 1 ? found[0] : undefined;
}

export function legacyContentSource(
  contentIdentityValue: string,
  sources: Readonly<Record<string, ContentEvidenceSource>> = LEGACY_CONTENT_SOURCES
): ContentEvidenceSource | undefined {
  return sources[contentIdentityValue];
}

export async function buildActiveEventEvidence(
  events: readonly EventDefinition[],
  knownContentIdentity?: string
): Promise<Readonly<Record<string, LegacyEventEvidence>>> {
  const identity = knownContentIdentity ?? await contentIdentity(events);
  const cached = activeEvidenceCache.get(identity);
  if (cached) return cached;

  const fingerprints = await eventFingerprintMap(events);
  const rows = await Promise.all(events.map(async event => {
    const fingerprint = fingerprints.get(event.id);
    if (!fingerprint) throw new Error(`Missing fingerprint for active event ${event.id}`);
    const journalDigests: Record<string, Record<string, string>> = {};
    const outcomes = new Map(event.outcomes.map(outcome => [outcome.id, outcome]));
    for (const choice of event.choices) {
      const byOutcome: Record<string, string> = {};
      for (const outcomeId of choice.outcomeIds) {
        const outcome = outcomes.get(outcomeId);
        if (!outcome) throw new Error(`Missing outcome ${outcomeId} for ${event.id}/${choice.id}`);
        byOutcome[outcomeId] = await journalSemanticsFingerprint(event.text.title, choice.label, outcome.messages);
      }
      journalDigests[choice.id] = byOutcome;
    }
    return [event.id, { fingerprint, journalDigests } satisfies LegacyEventEvidence] as const;
  }));
  const evidence = Object.fromEntries(rows) as Readonly<Record<string, LegacyEventEvidence>>;
  activeEvidenceCache.set(identity, evidence);
  return evidence;
}

/** Build validation-only offer bridge semantics from the exact active definitions. */
export function buildActiveOfferBridgeEvidence(
  events: readonly EventDefinition[],
  activeEvidence: Readonly<Record<string, LegacyEventEvidence>>
): Readonly<Record<string, FrozenOfferBridgeEventEvidence>> {
  const rows: Record<string, FrozenOfferBridgeEventEvidence> = {};
  for (const event of events) {
    const bridge = offerBridgeSpec(event);
    if (!bridge) continue;
    const evidence = activeEvidence[event.id];
    if (!evidence) throw new Error(`Missing active evidence for offer bridge ${event.id}`);
    rows[event.id] = {
      eventFingerprint: evidence.fingerprint,
      choiceActions: { ...bridge.choiceActions }
    };
  }
  return rows;
}

function completedEventIds(state: GameState): Set<string> {
  return new Set(state.history.map(entry => entry.eventId));
}

export function applyMigrationRouteInPlace(state: GameState, route: ContentMigrationRoute): void {
  const completed = completedEventIds(state);
  for (const mapping of route.schedulerMappings ?? []) {
    if (!completed.has(mapping.legacyEventId)) continue;
    if (mapping.kind === "same_scene") {
      state.flags[`SEEN_${mapping.canonicalEventId}`] = true;
      if (mapping.migrateCooldown) {
        const legacyCooldown = state.eventCooldowns[mapping.legacyEventId];
        if (legacyCooldown !== undefined) state.eventCooldowns[mapping.canonicalEventId] = legacyCooldown;
      }
      continue;
    }
    if (mapping.clearCanonicalSeen) state.flags[`SEEN_${mapping.canonicalEventId}`] = false;
    if (mapping.clearCanonicalCooldown) delete state.eventCooldowns[mapping.canonicalEventId];
  }

  for (const mapping of route.seedOriginMappings ?? []) {
    if (!mapping.rewriteExisting) continue;
    for (const seed of state.seeds) {
      if (seed.id === mapping.seedId && seed.originEvent === mapping.fromEventId) seed.originEvent = mapping.toEventId;
    }
  }
}

export function applyMigrationPathInPlace(state: GameState, path: readonly ContentMigrationRoute[]): void {
  for (const route of path) applyMigrationRouteInPlace(state, route);
}

/** Re-apply only scheduler semantics after resolving a preserved legacy pending scene. */
export function applyPostLegacyResolutionRouteInPlace(state: GameState, eventId: string, route: ContentMigrationRoute): void {
  for (const mapping of route.schedulerMappings ?? []) {
    if (mapping.legacyEventId !== eventId) continue;
    if (mapping.kind === "same_scene") {
      state.flags[`SEEN_${mapping.canonicalEventId}`] = true;
      if (mapping.migrateCooldown) {
        const legacyCooldown = state.eventCooldowns[mapping.legacyEventId];
        if (legacyCooldown !== undefined) state.eventCooldowns[mapping.canonicalEventId] = legacyCooldown;
      }
    } else {
      if (mapping.clearCanonicalSeen) state.flags[`SEEN_${mapping.canonicalEventId}`] = false;
      if (mapping.clearCanonicalCooldown) delete state.eventCooldowns[mapping.canonicalEventId];
    }
  }
}

export function applyPostLegacyResolutionPathInPlace(
  state: GameState,
  eventId: string,
  path: readonly ContentMigrationRoute[]
): void {
  for (const route of path) applyPostLegacyResolutionRouteInPlace(state, eventId, route);
}
