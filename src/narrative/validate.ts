import type { EventDefinition } from "../core/types.js";

export interface ValidationIssue { level: "error" | "warning"; eventId: string; message: string; }

export function validateEvents(events: EventDefinition[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();
  for (const e of events) {
    if (ids.has(e.id)) issues.push({ level: "error", eventId: e.id, message: "Duplicate event ID" });
    ids.add(e.id);
    if (e.choices.length < 2) issues.push({ level: "warning", eventId: e.id, message: "Important narrative event has fewer than two choices" });
    const outcomeIds = new Set(e.outcomes.map(o => o.id));
    for (const c of e.choices) {
      for (const id of c.outcomeIds) if (!outcomeIds.has(id)) issues.push({ level: "error", eventId: e.id, message: `Choice ${c.id} references missing outcome ${id}` });
    }
    for (const o of e.outcomes) {
      if (o.baseWeight < 0) issues.push({ level: "error", eventId: e.id, message: `Outcome ${o.id} has negative baseWeight` });
    }
  }
  return issues;
}
