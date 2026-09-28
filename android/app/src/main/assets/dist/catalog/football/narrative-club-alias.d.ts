import type { GameState } from "../../core/types.js";
export type NarrativeClubAlias = "NEW_CLUB" | "DEVELOPMENT_CLUB" | "DEVELOPMENT_CLUB_2" | "HIGHER_CLUB" | "BIG_CLUB" | "FOREIGN_DEV_CLUB";
export declare function isNarrativeClubAlias(value: unknown): value is NarrativeClubAlias;
export interface NarrativeClubAliasContext {
    eventId: string;
    choiceId: string;
    targetTier: number | null;
}
/**
 * Canonical event definitions keep their historical alias strings. At resolution,
 * aliases become catalog IDs via a pure hash projection with zero RNG draws.
 */
export declare function materializeNarrativeClubAlias(state: GameState, alias: NarrativeClubAlias, context: NarrativeClubAliasContext): string;
/**
 * Some canonical choices model "sign for parent club, then go on loan" with the
 * same alias in club + world.ownerClub. Once that alias becomes a concrete parent
 * identity, A3 must still preserve loan authority: registration/playing club must
 * be distinct from ownerClub. This pure projection resolves only that collision.
 */
export declare function materializeNarrativeLoanRegistration(state: GameState, ownerClubId: string, context: NarrativeClubAliasContext): string;
