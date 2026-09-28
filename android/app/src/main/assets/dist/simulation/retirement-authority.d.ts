import type { GameState } from "../core/types.js";
import type { MatchResultFact } from "./match-model.js";
export interface RetirementLastAppearanceFact {
    status: "authoritative" | "authoritative_none" | "unavailable";
    fixtureId: string | null;
    date: string | null;
    competition: string | null;
    opponent: string | null;
    homeAway: "home" | "away" | null;
    club: string | null;
    started: boolean | null;
    appeared: boolean | null;
    minutes: number | null;
    result: MatchResultFact | null;
    goals: number | null;
    assists: number | null;
    cards: {
        yellow: number;
        red: number;
    } | null;
    postAnnouncement: boolean | null;
}
export declare function retirementLastAppearanceFact(state: GameState): RetirementLastAppearanceFact;
export interface RetirementStorybookLastGoalFact {
    eligible: boolean;
    fixtureId: string | null;
    date: string | null;
    goals: number | null;
}
export declare function retirementStorybookLastGoalFact(state: GameState): RetirementStorybookLastGoalFact;
export interface RetirementNoLastMatchFact {
    eligible: boolean;
    cause: "injury" | null;
    missedFixtureId: string | null;
    missedFixtureDate: string | null;
    lastAppearanceFixtureId: string | null;
}
export declare function retirementNoLastMatchFact(state: GameState): RetirementNoLastMatchFact;
export interface RetirementPostAnnouncementOfferFact {
    eligible: boolean;
    stage: "initial" | "reversal" | null;
    offerId: string | null;
    offerDate: string | null;
}
export declare function retirementPostAnnouncementOfferFact(state: GameState): RetirementPostAnnouncementOfferFact;
export declare function canonicalRetirementReversalTransitionAuthorized(state: GameState, eventId: string | undefined, choiceId: string | undefined): boolean;
