export async function sha256Text(value) {
    const bytes = new TextEncoder().encode(value);
    const hash = await globalThis.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
}
export function serializeEventDefinition(event) {
    return JSON.stringify(event);
}
export function serializeJournalSemantics(title, choiceLabel, messages) {
    return JSON.stringify([title, choiceLabel, messages]);
}
export async function eventFingerprint(event) {
    return sha256Text(serializeEventDefinition(event));
}
export async function journalSemanticsFingerprint(title, choiceLabel, messages) {
    return sha256Text(serializeJournalSemantics(title, choiceLabel, messages));
}
export async function eventFingerprintMap(events) {
    const rows = await Promise.all(events.map(async (event) => [event.id, await eventFingerprint(event)]));
    return new Map(rows);
}
export async function contentIdentity(events) {
    return sha256Text(JSON.stringify(events));
}
