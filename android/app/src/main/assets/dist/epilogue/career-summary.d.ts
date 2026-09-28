import type { GameState } from "../core/types.js";
import { retirementLastAppearanceFact } from "../simulation/retirement-authority.js";
export interface LastProfessionalAppearanceFact {
    observed: boolean;
    authority: "sport.match_history" | "sport.appearances_delta" | "none";
    fixtureId: string | null;
    fixture: string | null;
    date: string | null;
    competition: string | null;
    opponent: string | null;
    homeAway: "home" | "away" | null;
    club: string | null;
    started: boolean | null;
    appeared: boolean | null;
    minutes: number | null;
    result: ReturnType<typeof retirementLastAppearanceFact>["result"];
    goals: number | null;
    assists: number | null;
    cards: ReturnType<typeof retirementLastAppearanceFact>["cards"];
    postAnnouncement: boolean | null;
}
export interface CareerSummary {
    terminal: boolean;
    retirementStatus: GameState["retirement"]["status"];
    retirementReason: string | null;
    retirementClosureType: string | null;
    decisionAge: number | null;
    decidedDate: string | null;
    announcedDate: string | null;
    closedDate: string | null;
    careerAgeAtSnapshot: number;
    firstClub: string | null;
    lastClub: string | null;
    careerClubs: string[];
    careerAppearances: number;
    careerGoals: null;
    majorTrophies: null;
    mostImportantClub: null;
    clubWithMostSeasons: null;
    clubWithMostSuccess: null;
    nationalCaps: number;
    majorLongInjuries: number;
    lastProfessionalAppearance: LastProfessionalAppearanceFact;
    missingAuthoritativeFacts: string[];
}
export declare function buildLastProfessionalAppearanceFact(state: GameState): LastProfessionalAppearanceFact;
export declare function buildCareerSummary(state: GameState): CareerSummary;
