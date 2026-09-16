import type { EventDefinition, GameState } from "../core/types.js";
import { contentIdentity, eventFingerprintMap, journalSemanticsFingerprint } from "./content-identity.js";
import {
  PRE_T51_CONTENT_IDENTITY,
  PRE_T51_EVENT_EVIDENCE,
  type LegacyEventEvidence
} from "./pre-t51-legacy-registry.js";

export interface ContentEvidenceSource {
  contentIdentity: string;
  engineBuild: string;
  sessionVersions: readonly number[];
  events: Readonly<Record<string, LegacyEventEvidence>>;
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

export const T51_B1A_CONTENT_IDENTITY = "1a8a5e2006fe7160f4fbc02060568d3abec99df038fe3a1a7799c8a0e802eac7";

const T51_B1A_FINGERPRINT_DELTA: Readonly<Record<string, string>> = Object.freeze({
  EVT_18_MED_001: "4c4aa41d92d751367da996fcf8e8fb6f0657a02128ba68f7c6f65245fdd28dd0",
  EVT_18_TEAM_001: "7a75ec92626db910450930df747cffe0679b5533467340b77932940e47be88d3",
  EVT_18_MATCH_002: "67494fabb6f6f61a8acc16789ca524ab99dfb39e0df608ab30c2a6b58854ab00"
});

/**
 * B1a changed only player-facing intel for three stable-ID scenes. Journal
 * semantics therefore remain exactly the frozen ones; only the event
 * fingerprints change. Keeping this as a delta avoids duplicating a 388-event
 * evidence registry for every canonical batch while still making B1a saves a
 * first-class migration source.
 */
export const T51_B1A_EVENT_EVIDENCE: Readonly<Record<string, LegacyEventEvidence>> = Object.freeze(
  Object.fromEntries(Object.entries(PRE_T51_EVENT_EVIDENCE).map(([eventId, evidence]) => {
    const fingerprint = T51_B1A_FINGERPRINT_DELTA[eventId];
    return [eventId, fingerprint ? { ...evidence, fingerprint } : evidence];
  }))
);

export const LEGACY_CONTENT_SOURCES: Readonly<Record<string, ContentEvidenceSource>> = {
  [PRE_T51_CONTENT_IDENTITY]: {
    contentIdentity: PRE_T51_CONTENT_IDENTITY,
    engineBuild: "0.8.0-t2.5",
    sessionVersions: [1, 2, 3],
    events: PRE_T51_EVENT_EVIDENCE
  },
  [T51_B1A_CONTENT_IDENTITY]: {
    contentIdentity: T51_B1A_CONTENT_IDENTITY,
    engineBuild: "0.8.0-t5.1-b1a",
    sessionVersions: [3],
    events: T51_B1A_EVENT_EVIDENCE
  }
};

/**
 * Target-specific routes are explicit and identity-bound. B1a only repairs the
 * information presented by three stable-ID scenes; they remain the same scene
 * for history, SEEN state, cooldown and pending-decision continuity.
 */
export const CONTENT_MIGRATION_ROUTES: readonly ContentMigrationRoute[] = [
  {
    sourceContentIdentity: PRE_T51_CONTENT_IDENTITY,
    targetContentIdentity: T51_B1A_CONTENT_IDENTITY,
    schedulerMappings: [
      { kind: "same_scene", legacyEventId: "EVT_18_MED_001", canonicalEventId: "EVT_18_MED_001" },
      { kind: "same_scene", legacyEventId: "EVT_18_TEAM_001", canonicalEventId: "EVT_18_TEAM_001" },
      { kind: "same_scene", legacyEventId: "EVT_18_MATCH_002", canonicalEventId: "EVT_18_MATCH_002" }
    ]
  }
];

const activeEvidenceCache = new Map<string, Readonly<Record<string, LegacyEventEvidence>>>();
activeEvidenceCache.set(PRE_T51_CONTENT_IDENTITY, PRE_T51_EVENT_EVIDENCE);
activeEvidenceCache.set(T51_B1A_CONTENT_IDENTITY, T51_B1A_EVENT_EVIDENCE);

export function findMigrationRoute(
  sourceContentIdentity: string,
  targetContentIdentity: string,
  routes: readonly ContentMigrationRoute[] = CONTENT_MIGRATION_ROUTES
): ContentMigrationRoute | undefined {
  return routes.find(route => route.sourceContentIdentity === sourceContentIdentity && route.targetContentIdentity === targetContentIdentity);
}

export function legacyContentSource(contentIdentity: string): ContentEvidenceSource | undefined {
  return LEGACY_CONTENT_SOURCES[contentIdentity];
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
