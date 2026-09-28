import type { PlayerActionDefinition } from "./types.js";
/**
 * Production catalog is derived from A5's frozen content manifests plus the
 * A1/A3 closed effect registry. Unsupported effect keys are omitted, so content
 * can never expose an action option that would fail with EFFECT_FORBIDDEN.
 *
 * Adding a certified closed handler is enough to make its option executable;
 * actions with no executable options remain absent from runtime.
 */
export declare const PLAYER_ACTION_CATALOG: readonly PlayerActionDefinition[];
export declare function findPlayerActionDefinition(actionId: string, catalog?: readonly PlayerActionDefinition[]): PlayerActionDefinition | null;
