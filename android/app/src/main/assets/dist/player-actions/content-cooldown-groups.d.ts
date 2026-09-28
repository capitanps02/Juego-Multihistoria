export interface PlayerActionCooldownGroupSpec {
    actionId: string;
    groupId: string | null;
    groupDays: number;
}
/**
 * Optional family-level cooldown policy for the final V1.
 *
 * Existing action/action_target cooldowns remain authoritative until A1 adds
 * closed group cooldown support. These group rows only prevent family cycling;
 * they never replace the per-action cooldown stored in content-plan.ts.
 */
export declare const PLAYER_ACTION_COOLDOWN_GROUP_SPECS: readonly PlayerActionCooldownGroupSpec[];
