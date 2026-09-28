import type { PlayerActionState } from "./types.js";
export declare function inspectPlayerActionState(value: unknown, currentDate?: string): string | null;
export declare function assertPlayerActionState(value: unknown, currentDate?: string): asserts value is PlayerActionState;
