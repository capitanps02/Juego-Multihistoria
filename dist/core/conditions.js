import { getPath } from "./path.js";
function compare(actual, c) {
    switch (c.op) {
        case "exists": return actual !== undefined && actual !== null;
        case "eq": return actual === c.value;
        case "neq": return actual !== c.value;
        case "gt": return typeof actual === "number" && typeof c.value === "number" && actual > c.value;
        case "gte": return typeof actual === "number" && typeof c.value === "number" && actual >= c.value;
        case "lt": return typeof actual === "number" && typeof c.value === "number" && actual < c.value;
        case "lte": return typeof actual === "number" && typeof c.value === "number" && actual <= c.value;
        case "in": return Array.isArray(c.value) && c.value.includes(actual);
        case "notIn": return Array.isArray(c.value) && !c.value.includes(actual);
    }
}
export function conditionsPass(root, conditions = []) {
    return conditions.every(c => compare(getPath(root, c.path), c));
}
