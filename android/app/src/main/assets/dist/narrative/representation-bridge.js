import { resolveCurrentRepresentation, updateRepresentationTermsInPlace } from "../simulation/representation-authority.js";
const SERVICES = new Set(["market", "media", "image"]);
const POLICIES = new Set(["inform_first", "broad_delegation"]);
function validTerms(value) {
    if (!value || typeof value !== "object" || Array.isArray(value))
        return false;
    const row = value;
    if (Object.keys(row).sort().join(",") !== ["contactPolicy", "services"].sort().join(","))
        return false;
    if (typeof row.contactPolicy !== "string" || !POLICIES.has(row.contactPolicy))
        return false;
    if (row.services === "preserve")
        return true;
    return Array.isArray(row.services)
        && row.services.length >= 1
        && row.services.length <= 3
        && row.services.every(x => typeof x === "string" && SERVICES.has(x))
        && new Set(row.services).size === row.services.length;
}
export function representationBridgeSpec(event) {
    const spec = event.representationBridge;
    if (spec === undefined)
        return undefined;
    if (!spec || typeof spec !== "object" || Array.isArray(spec) || !spec.choices || typeof spec.choices !== "object") {
        throw new Error(`Invalid representation bridge metadata for ${event.id}`);
    }
    const choiceIds = event.choices.map(choice => choice.id).sort();
    const mapped = Object.keys(spec.choices).sort();
    if (JSON.stringify(choiceIds) !== JSON.stringify(mapped)) {
        throw new Error(`Representation bridge ${event.id} must map every choice exactly once`);
    }
    for (const [choiceId, terms] of Object.entries(spec.choices)) {
        if (!validTerms(terms))
            throw new Error(`Invalid representation terms for ${event.id}/${choiceId}`);
    }
    return spec;
}
export function representationTermsForChoice(event, choiceId) {
    return representationBridgeSpec(event)?.choices[choiceId];
}
/**
 * Applies only an explicitly-declared representation choice after the narrative
 * history entry has been persisted. The current agreement must exist; identity-only
 * agent state fails closed.
 */
export function applyRepresentationBridgeChoiceInPlace(state, event, choiceId, outcomeId) {
    const terms = representationTermsForChoice(event, choiceId);
    if (!terms)
        return;
    const current = resolveCurrentRepresentation(state);
    if (!current)
        throw new Error(`Representation bridge ${event.id}/${choiceId} requires an exact current agreement`);
    const services = terms.services === "preserve" ? [...current.services] : [...terms.services];
    updateRepresentationTermsInPlace(state, {
        commissionPct: current.commissionPct,
        services,
        contactPolicy: terms.contactPolicy
    }, `narrative:${event.id}:${choiceId}:${outcomeId}`);
}
