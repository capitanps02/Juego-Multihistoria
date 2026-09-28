import type { EventDefinition } from "../core/types.js";
export declare function sha256Text(value: string): Promise<string>;
export declare function serializeEventDefinition(event: EventDefinition): string;
export declare function serializeJournalSemantics(title: string, choiceLabel: string, messages: readonly string[]): string;
export declare function eventFingerprint(event: EventDefinition): Promise<string>;
export declare function journalSemanticsFingerprint(title: string, choiceLabel: string, messages: readonly string[]): Promise<string>;
export declare function eventFingerprintMap(events: readonly EventDefinition[]): Promise<Map<string, string>>;
export declare function contentIdentity(events: readonly EventDefinition[]): Promise<string>;
