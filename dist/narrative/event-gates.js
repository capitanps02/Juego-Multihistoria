import { conditionsPass } from "../core/conditions.js";
import { narrativeConditionRoot } from "../simulation/club-contract-intent.js";
export function gateAlternatives(event) {
    return event.gateAlternatives;
}
export function eventGatesPass(state, event) {
    const root = narrativeConditionRoot(state);
    if (!conditionsPass(root, event.gates))
        return false;
    const alternatives = gateAlternatives(event);
    if (alternatives === undefined)
        return true;
    // Explicit but malformed/empty alternative sets fail closed rather than
    // accidentally widening a scene to unconditional reachability.
    if (!Array.isArray(alternatives) || alternatives.length === 0)
        return false;
    return alternatives.some(group => Array.isArray(group) && group.length > 0 && conditionsPass(root, group));
}
