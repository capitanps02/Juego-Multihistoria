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

export const LEGACY_CONTENT_SOURCES: Readonly<Record<string, ContentEvidenceSource>> = {
  [PRE_T51_CONTENT_IDENTITY]: {
    contentIdentity: PRE_T51_CONTENT_IDENTITY,
    engineBuild: "0.8.0-t2.5",
    sessionVersions: [1, 2, 3],
    events: PRE_T51_EVENT_EVIDENCE
  }
};

/**
 * Target-specific routes belong here once a canonical content batch changes EVENTS.
 * Keeping this empty while active content still equals the frozen pre-T5.1 catalog is intentional.
 */
export const CONTENT_MIGRATION_ROUTES: readonly ContentMigrationRoute[] = [];

const activeEvidenceCache = new Map<string, Readonly<Record<string, LegacyEventEvidence>>>();
activeEvidenceCache.set(PRE_T51_CONTENT_IDENTITY, PRE_T51_EVENT_EVIDENCE);

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
