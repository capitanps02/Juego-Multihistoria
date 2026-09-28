import type { GameState } from "../core/types.js";
export declare const MAX_SAVE_BYTES: number;
export declare class SaveValidationError extends Error {
    readonly path: string;
    readonly code = "INVALID_SAVE";
    constructor(path: string, reason: string);
}
export declare function ensure(ok: unknown, path: string, reason: string): asserts ok;
export declare function record(value: unknown, path: string): Record<string, unknown>;
export declare function string(value: unknown, path: string, empty?: boolean): asserts value is string;
export declare function number(value: unknown, path: string, min?: number, max?: number): asserts value is number;
export declare function integer(value: unknown, path: string, min?: number, max?: number): asserts value is number;
export declare function boolean(value: unknown, path: string): asserts value is boolean;
export declare function list(value: unknown, path: string): unknown[];
export declare function strings(value: unknown, path: string): void;
export declare function oneOf(value: unknown, options: readonly string[], path: string): void;
export declare function date(value: unknown, path: string): asserts value is string;
/** Reject non-JSON values, excessive nesting, cycles and dangerous dictionary keys. */
export declare function validateData(value: unknown): void;
export declare function parseSaveJson(raw: string): unknown;
/** Validate the input schema BEFORE migration can supply defaults or coerce values. */
export declare function validateGameSave(value: unknown, version: number): void;
export declare function assertGameState(value: unknown): asserts value is GameState;
