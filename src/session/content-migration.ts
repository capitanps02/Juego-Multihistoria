import type { EventDefinition, GameState } from "../core/types.js";
import { contentIdentity, eventFingerprintMap, journalSemanticsFingerprint } from "./content-identity.js";
import {
  PRE_T51_CONTENT_IDENTITY,
  PRE_T51_EVENT_EVIDENCE,
  type LegacyEventEvidence
} from "./pre-t51-legacy-registry.js";
import { POST_T51_CONTENT_SOURCES } from "./post-t51-legacy-registry.js";

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

/** Validation-only historical catalogs. They never join EventIndex or scheduling. */
export const LEGACY_CONTENT_SOURCES: Readonly<Record<string, ContentEvidenceSource>> = {
  [PRE_T51_CONTENT_IDENTITY]: {
    contentIdentity: PRE_T51_CONTENT_IDENTITY,
    engineBuild: "0.8.0-t2.5",
    sessionVersions: [1, 2, 3],
    events: PRE_T51_EVENT_EVIDENCE
  },
  ...POST_T51_CONTENT_SOURCES
};

export const T51_B1A_CONTENT_IDENTITY = "1a8a5e2006fe7160f4fbc02060568d3abec99df038fe3a1a7799c8a0e802eac7";

/**
 * Explicit identity-bound edges. Successive canonical batches extend this as a
 * lineage (A -> B -> C), not as a matrix of shortcuts from every old version.
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
