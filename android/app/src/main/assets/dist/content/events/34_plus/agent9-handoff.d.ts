import type { GameState } from "../../../core/types.js";
/**
 * Read-only Agent-8 -> Agent-9 boundary projection.
 * It reports only facts already present in authoritative state. Missing rich histories remain
 * explicitly unavailable; this function never manufactures retirement, offers, injuries or matches.
 */
export declare function buildAgent9LateCareerHandoff(state: GameState): {
    generatedAtDate: string;
    age: number;
    careerStatus: "playing" | "decided" | "announced" | "closed";
    club: {
        displayClub: string;
        registrationClub: string;
        ownerClub: string;
        leagueTier: number;
    };
    employment: {
        status: import("../../../simulation/offers.js").ContractEmploymentStatus;
        contract: Record<string, import("../../../core/types.js").DataValue>;
        eligibleCareerOffers: import("../../../simulation/offers.js").CareerOffer[];
    };
    sport: {
        recentOfficialRows: import("../../../simulation/match-model.js").OfficialMatchRecord[];
        latestAppearance: import("../../../simulation/match-model.js").OfficialMatchRecord | null;
        richResultGoalsAssistsCardsAuthorityAvailable: boolean;
    };
    body: {
        acuteInjury: import("../../../core/types.js").DataValue;
        availability: number;
        recoveryDebt: number;
        bodyLoad: number;
        injuryWeeksRemaining: number;
        episodeHistoryAuthorityAvailable: boolean;
    };
    homeFamily: {
        relocationTradeoff: import("../../../narrative/seed-memory.js").SeedMemoryProjection;
        finalHomeWindow: import("../../../narrative/seed-memory.js").SeedMemoryProjection;
        homeSuccessWithoutYou: import("../../../narrative/seed-memory.js").SeedMemoryProjection;
        tenMatchHomeReturn: import("../../../narrative/seed-memory.js").SeedMemoryProjection;
    };
    leadership: import("../../../simulation/player-leadership-authority.js").PlayerClubLeadershipCertification | null;
    national: import("../../../simulation/national-team-authority.js").NationalTeamAuthorityContext;
    ordinaryLateCareerMemories: import("../../../narrative/seed-memory.js").SeedMemoryProjection[];
    unresolvedTerminalSeeds: import("../../../core/types.js").SeedInstance[];
    handoffRules: {
        agent8MayMutateRetirement: boolean;
        agent9OwnsTerminalTransition: boolean;
        missingRichSportHistoryMeansUnknown: boolean;
        missingInjuryEpisodeHistoryMeansUnknown: boolean;
    };
};
