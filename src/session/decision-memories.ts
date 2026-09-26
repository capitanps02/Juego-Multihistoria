import type { EventDefinition, GameState } from "../core/types.js";

export interface DecisionMemory {
  journalIndex: number;
  date: string;
  title: string;
  choiceLabel: string;
}

/** Only recall recorded choices, never expose seed payloads or predict outcomes. */
export function decisionMemories(
  state: GameState,
  event: EventDefinition,
  journal: readonly { date: string; title: string; choiceLabel: string }[]
): DecisionMemory[] {
  const reads = new Set(event.seedsRead ?? []);
  const indices = new Set<number>();
  for (const seed of state.seeds) {
    if (!reads.has(seed.id) || seed.state === "resolved" || seed.state === "expired"
      || (seed.expiresAfter && seed.expiresAfter <= state.date)) continue;
    const matches = state.history.flatMap((entry, index) =>
      entry.eventId === seed.originEvent && entry.season === seed.originSeason
        && entry.date <= state.date ? [index] : []);
    // Repeated origins without an instance identifier cannot be attributed safely.
    if (matches.length !== 1) continue;
    const index = matches[0];
    const entry = state.history[index], row = journal[index];
    if (entry.visibility === "hidden" || !row || row.date !== entry.date) continue;
    indices.add(index);
  }
  return [...indices].sort((a, b) => b - a).slice(0, 3).map(index => ({
    journalIndex: index, date: journal[index].date,
    title: journal[index].title, choiceLabel: journal[index].choiceLabel
  }));
}
