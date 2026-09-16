import { offerBridgeSpec } from "../narrative/offer-bridge.js";
import { contentIdentity, eventFingerprintMap, journalSemanticsFingerprint } from "./content-identity.js";
import { PRE_T51_CONTENT_IDENTITY, PRE_T51_EVENT_EVIDENCE } from "./pre-t51-legacy-registry.js";
import { POST_T51_CONTENT_SOURCES } from "./post-t51-legacy-registry.js";
import { FROZEN_OFFER_BRIDGE_SOURCES } from "./frozen-offer-bridge-evidence.js";
const postLegacySourcesWithBridgeEvidence = Object.fromEntries(Object.entries(POST_T51_CONTENT_SOURCES).map(([identity, source]) => [identity, {
        ...source,
        offerBridges: FROZEN_OFFER_BRIDGE_SOURCES[identity] ?? {}
    }]));
/** Validation-only historical catalogs. They never join EventIndex or scheduling. */
export const LEGACY_CONTENT_SOURCES = {
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
/**
 * Explicit identity-bound edges. Successive canonical batches extend this as a
 * lineage (A -> B -> C), not as a matrix of shortcuts from every old version.
 */
export const CONTENT_MIGRATION_ROUTES = [
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
    }
];
const activeEvidenceCache = new Map();
activeEvidenceCache.set(PRE_T51_CONTENT_IDENTITY, PRE_T51_EVENT_EVIDENCE);
for (const source of Object.values(POST_T51_CONTENT_SOURCES)) {
    activeEvidenceCache.set(source.contentIdentity, source.events);
}
export function findMigrationRoute(sourceContentIdentity, targetContentIdentity, routes = CONTENT_MIGRATION_ROUTES) {
    return routes.find(route => route.sourceContentIdentity === sourceContentIdentity && route.targetContentIdentity === targetContentIdentity);
}
/**
 * Resolve exactly one acyclic migration path. Missing or ambiguous paths fail
 * closed. Declaration order never silently chooses between competing histories.
 */
export function findMigrationPath(sourceContentIdentity, targetContentIdentity, routes = CONTENT_MIGRATION_ROUTES) {
    if (sourceContentIdentity === targetContentIdentity)
        return [];
    const outgoing = new Map();
    for (const route of routes) {
        const list = outgoing.get(route.sourceContentIdentity) ?? [];
        list.push(route);
        outgoing.set(route.sourceContentIdentity, list);
    }
    const found = [];
    const walk = (current, path, visited) => {
        if (found.length > 1)
            return;
        for (const route of outgoing.get(current) ?? []) {
            const nextIdentity = route.targetContentIdentity;
            if (visited.has(nextIdentity))
                continue;
            const nextPath = [...path, route];
            if (nextIdentity === targetContentIdentity) {
                found.push(nextPath);
                if (found.length > 1)
                    return;
                continue;
            }
            const nextVisited = new Set(visited);
            nextVisited.add(nextIdentity);
            walk(nextIdentity, nextPath, nextVisited);
            if (found.length > 1)
                return;
        }
    };
    walk(sourceContentIdentity, [], new Set([sourceContentIdentity]));
    return found.length === 1 ? found[0] : undefined;
}
export function legacyContentSource(contentIdentityValue, sources = LEGACY_CONTENT_SOURCES) {
    return sources[contentIdentityValue];
}
export async function buildActiveEventEvidence(events, knownContentIdentity) {
    const identity = knownContentIdentity ?? await contentIdentity(events);
    const cached = activeEvidenceCache.get(identity);
    if (cached)
        return cached;
    const fingerprints = await eventFingerprintMap(events);
    const rows = await Promise.all(events.map(async (event) => {
        const fingerprint = fingerprints.get(event.id);
        if (!fingerprint)
            throw new Error(`Missing fingerprint for active event ${event.id}`);
        const journalDigests = {};
        const outcomes = new Map(event.outcomes.map(outcome => [outcome.id, outcome]));
        for (const choice of event.choices) {
            const byOutcome = {};
            for (const outcomeId of choice.outcomeIds) {
                const outcome = outcomes.get(outcomeId);
                if (!outcome)
                    throw new Error(`Missing outcome ${outcomeId} for ${event.id}/${choice.id}`);
                byOutcome[outcomeId] = await journalSemanticsFingerprint(event.text.title, choice.label, outcome.messages);
            }
            journalDigests[choice.id] = byOutcome;
        }
        return [event.id, { fingerprint, journalDigests }];
    }));
    const evidence = Object.fromEntries(rows);
    activeEvidenceCache.set(identity, evidence);
    return evidence;
}
/** Build validation-only offer bridge semantics from the exact active definitions. */
export function buildActiveOfferBridgeEvidence(events, activeEvidence) {
    const rows = {};
    for (const event of events) {
        const bridge = offerBridgeSpec(event);
        if (!bridge)
            continue;
        const evidence = activeEvidence[event.id];
        if (!evidence)
            throw new Error(`Missing active evidence for offer bridge ${event.id}`);
        rows[event.id] = {
            eventFingerprint: evidence.fingerprint,
            choiceActions: { ...bridge.choiceActions }
        };
    }
    return rows;
}
function completedEventIds(state) {
    return new Set(state.history.map(entry => entry.eventId));
}
export function applyMigrationRouteInPlace(state, route) {
    const completed = completedEventIds(state);
    for (const mapping of route.schedulerMappings ?? []) {
        if (!completed.has(mapping.legacyEventId))
            continue;
        if (mapping.kind === "same_scene") {
            state.flags[`SEEN_${mapping.canonicalEventId}`] = true;
            if (mapping.migrateCooldown) {
                const legacyCooldown = state.eventCooldowns[mapping.legacyEventId];
                if (legacyCooldown !== undefined)
                    state.eventCooldowns[mapping.canonicalEventId] = legacyCooldown;
            }
            continue;
        }
        if (mapping.clearCanonicalSeen)
            state.flags[`SEEN_${mapping.canonicalEventId}`] = false;
        if (mapping.clearCanonicalCooldown)
            delete state.eventCooldowns[mapping.canonicalEventId];
    }
    for (const mapping of route.seedOriginMappings ?? []) {
        if (!mapping.rewriteExisting)
            continue;
        for (const seed of state.seeds) {
            if (seed.id === mapping.seedId && seed.originEvent === mapping.fromEventId)
                seed.originEvent = mapping.toEventId;
        }
    }
}
export function applyMigrationPathInPlace(state, path) {
    for (const route of path)
        applyMigrationRouteInPlace(state, route);
}
/** Re-apply only scheduler semantics after resolving a preserved legacy pending scene. */
export function applyPostLegacyResolutionRouteInPlace(state, eventId, route) {
    for (const mapping of route.schedulerMappings ?? []) {
        if (mapping.legacyEventId !== eventId)
            continue;
        if (mapping.kind === "same_scene") {
            state.flags[`SEEN_${mapping.canonicalEventId}`] = true;
            if (mapping.migrateCooldown) {
                const legacyCooldown = state.eventCooldowns[mapping.legacyEventId];
                if (legacyCooldown !== undefined)
                    state.eventCooldowns[mapping.canonicalEventId] = legacyCooldown;
            }
        }
        else {
            if (mapping.clearCanonicalSeen)
                state.flags[`SEEN_${mapping.canonicalEventId}`] = false;
            if (mapping.clearCanonicalCooldown)
                delete state.eventCooldowns[mapping.canonicalEventId];
        }
    }
}
export function applyPostLegacyResolutionPathInPlace(state, eventId, path) {
    for (const route of path)
        applyPostLegacyResolutionRouteInPlace(state, eventId, route);
}
