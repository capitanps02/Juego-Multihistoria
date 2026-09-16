import { knownPlayerContacts, type PublicPlayerContact } from "../core/player-contacts.js";
import type { GameSession } from "./game-session.js";

/**
 * Public presentation adapter for the protagonist's known NPC contacts.
 * It encapsulates the private snapshot and returns only id/name/role.
 */
export function getKnownPlayerContacts(
  session: Pick<GameSession, "exportSnapshot">
): PublicPlayerContact[] {
  return knownPlayerContacts(session.exportSnapshot().state);
}
