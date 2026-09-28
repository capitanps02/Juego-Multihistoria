export type PlayerActionEffectMode = "fact_only" | "direct_only" | "direct_and_fact" | "informational";
export interface PlayerActionOptionEffectPlan {
    actionId: string;
    optionId: string;
    mode: PlayerActionEffectMode;
    desiredEffectKey: string;
    desiredFactKind?: string;
    implemented: boolean;
}
/**
 * A5 effect/fact routing contract for every V1 option.
 *
 * desiredEffectKey names a closed registry handler A1 may implement.
 * desiredFactKind is present only when a persistent causal fact is actually
 * useful. Local relationship/image/life effects deliberately avoid A3 facts.
 */
export declare const PLAYER_ACTION_EFFECT_PLAN: readonly PlayerActionOptionEffectPlan[];
