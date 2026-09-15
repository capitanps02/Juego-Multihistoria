import { getPath } from "./path.js";
import type { Condition } from "./types.js";

function compare(actual: unknown, c: Condition): boolean {
  switch (c.op) {
    case "exists": return actual !== undefined && actual !== null;
    case "eq": return actual === c.value;
    case "neq": return actual !== c.value;
    case "gt": return typeof actual === "number" && typeof c.value === "number" && actual > c.value;
    case "gte": return typeof actual === "number" && typeof c.value === "number" && actual >= c.value;
    case "lt": return typeof actual === "number" && typeof c.value === "number" && actual < c.value;
    case "lte": return typeof actual === "number" && typeof c.value === "number" && actual <= c.value;
    case "in": return Array.isArray(c.value) && c.value.includes(actual as never);
    case "notIn": return Array.isArray(c.value) && !c.value.includes(actual as never);
  }
}

export function conditionsPass(root: unknown, conditions: Condition[] = []): boolean {
  return conditions.every(c => compare(getPath(root, c.path), c));
}
