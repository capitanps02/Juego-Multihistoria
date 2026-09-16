import type { EventDefinition } from "../core/types.js";

export async function sha256Text(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
}

export function serializeEventDefinition(event: EventDefinition): string {
  return JSON.stringify(event);
}

export function serializeJournalSemantics(title: string, choiceLabel: string, messages: readonly string[]): string {
  return JSON.stringify([title, choiceLabel, messages]);
}

export async function eventFingerprint(event: EventDefinition): Promise<string> {
  return sha256Text(serializeEventDefinition(event));
}

export async function journalSemanticsFingerprint(title: string, choiceLabel: string, messages: readonly string[]): Promise<string> {
  return sha256Text(serializeJournalSemantics(title, choiceLabel, messages));
}

export async function eventFingerprintMap(events: readonly EventDefinition[]): Promise<Map<string, string>> {
  const rows = await Promise.all(events.map(async event => [event.id, await eventFingerprint(event)] as const));
  return new Map(rows);
}

export async function contentIdentity(events: readonly EventDefinition[]): Promise<string> {
  return sha256Text(JSON.stringify(events));
}
