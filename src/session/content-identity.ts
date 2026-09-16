import type { EventDefinition } from "../core/types.js";

export async function sha256Text(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
}

export function serializeEventDefinition(event: EventDefinition): string {
  return JSON.stringify(event);
}

export async function eventFingerprint(event: EventDefinition): Promise<string> {
  return sha256Text(serializeEventDefinition(event));
}

export async function contentIdentity(events: EventDefinition[]): Promise<string> {
  return sha256Text(JSON.stringify(events));
}
