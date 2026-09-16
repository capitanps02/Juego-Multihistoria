import { knownPlayerContacts } from "../core/player-contacts.js";
/**
 * Public presentation adapter for the protagonist's known NPC contacts.
 * It encapsulates the private snapshot and returns only id/name/role.
 * Historical introductions are evaluated with the matching decision provenance.
 */
export function getKnownPlayerContacts(session) {
    const snapshot = session.exportSnapshot();
    return knownPlayerContacts(snapshot.state, snapshot.decisionProvenance);
}
