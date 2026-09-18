import type { GameState } from "../core/types.js";
import { getEligibleCareerOffers } from "./offers.js";
import { getLastPlayerAppearanceContext, getSportContext, type LastPlayerAppearanceContext } from "./sport-context.js";
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
  cards: LastPlayerAppearanceContext["cards"];
  postAnnouncement: boolean | null;
}

const unavailableLastAppearance = (): RetirementLastAppearanceFact => ({
  status: "unavailable",
  fixtureId: null,
  date: null,
  competition: null,
  opponent: null,
  homeAway: null,
  club: null,
  started: null,
  appeared: null,
  minutes: null,
  result: null,
  goals: null,
  assists: null,
  cards: null,
  postAnnouncement: null
});

export function retirementLastAppearanceFact(state: GameState): RetirementLastAppearanceFact {
  const context = getLastPlayerAppearanceContext(state);
  if (context.status === "historical_match_store_not_initialized") return unavailableLastAppearance();

  const row = context.match;
  if (!row) return { ...unavailableLastAppearance(), status: "authoritative_none" };
  if (row.player.appeared !== true) return unavailableLastAppearance();

  const announced = state.retirement.announcedDate;
  return {
    status: "authoritative",
    fixtureId: row.id,
    date: row.date,
    competition: row.competition,
    opponent: row.opponent,
    homeAway: row.homeAway,
    club: row.club,
    started: row.player.started,
    appeared: true,
    minutes: row.player.minutes,
    result: row.result ?? null,
    goals: row.stats?.goals ?? null,
    assists: row.stats?.assists ?? null,
    cards: row.stats ? { yellow: row.stats.yellowCards, red: row.stats.redCards } : null,
    postAnnouncement: announced === null ? null : row.date >= announced
  };
}

export interface RetirementStorybookLastGoalFact {
  eligible: boolean;
  fixtureId: string | null;
  date: string | null;
  goals: number | null;
}
export function retirementStorybookLastGoalFact(state: GameState): RetirementStorybookLastGoalFact {
  const sport = getSportContext(state);
  const atTerminalBoundary = sport.availability.remainingOfficialMatches === "known"
    && sport.remainingOfficialMatches === 0;
  const last = retirementLastAppearanceFact(state);
  const eligible = atTerminalBoundary
    && last.status === "authoritative"
    && last.postAnnouncement === true
    && last.goals !== null
    && last.goals > 0;
  return {
    eligible,
    fixtureId: eligible ? last.fixtureId : null,
    date: eligible ? last.date : null,
    goals: eligible ? last.goals : null
  };
}

export interface RetirementNoLastMatchFact {
  eligible: boolean;
  cause: "injury" | null;
  missedFixtureId: string | null;
  missedFixtureDate: string | null;
  lastAppearanceFixtureId: string | null;
}
const unavailableNoLastMatch = (): RetirementNoLastMatchFact => ({
  eligible: false,
  cause: null,
  missedFixtureId: null,
  missedFixtureDate: null,
  lastAppearanceFixtureId: null
});

export function retirementNoLastMatchFact(state: GameState): RetirementNoLastMatchFact {
  if (state.retirement.status !== "announced" || !state.retirement.announcedDate) return unavailableNoLastMatch();
  const sport = getSportContext(state);
  if (sport.availability.remainingOfficialMatches !== "known" || sport.remainingOfficialMatches !== 0) return unavailableNoLastMatch();
  if (sport.availability.previousFixture !== "known" || !sport.previousFixture) return unavailableNoLastMatch();

  const missed = sport.previousFixture;
  if (missed.date < state.retirement.announcedDate) return unavailableNoLastMatch();
  if (missed.player.appeared || missed.player.injuryUnavailable !== true) return unavailableNoLastMatch();

  const last = retirementLastAppearanceFact(state);
  if (last.status === "unavailable") return unavailableNoLastMatch();
  if (last.status === "authoritative" && last.postAnnouncement === true) return unavailableNoLastMatch();

  return {
    eligible: true,
    cause: "injury",
    missedFixtureId: missed.id,
    missedFixtureDate: missed.date,
    lastAppearanceFixtureId: last.fixtureId
  };
}

export interface RetirementPostAnnouncementOfferFact {
  eligible: boolean;
  stage: "initial" | "reversal" | null;
  offerId: string | null;
  offerDate: string | null;
}
function eligiblePostAnnouncementOffer(state: GameState) {
  const announced = state.retirement.announcedDate;
  if (!announced) return null;
  const offer = getEligibleCareerOffers(state)[0] ?? null;
  if (!offer || offer.date < announced) return null;
  return offer;
}
function hasPriorPostAnnouncementInterest(state: GameState): boolean {
  return (state.market?.history ?? []).some(decision =>
    decision.source?.kind === "narrative_choice"
    && decision.source.eventId === "CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED"
    && decision.source.choiceId === "ACKNOWLEDGE"
    && decision.source.disposition === "defer"
  );
}
export function retirementPostAnnouncementOfferFact(state: GameState): RetirementPostAnnouncementOfferFact {
  if (state.retirement.status !== "announced" || state.flags.RETIREMENT_WAS_ANNOUNCED !== true) {
    return { eligible: false, stage: null, offerId: null, offerDate: null };
  }
  const offer = eligiblePostAnnouncementOffer(state);
  if (!offer) return { eligible: false, stage: null, offerId: null, offerDate: null };
  return {
    eligible: true,
    stage: hasPriorPostAnnouncementInterest(state) ? "reversal" : "initial",
    offerId: offer.id,
    offerDate: offer.date
  };
}
export function canonicalRetirementReversalTransitionAuthorized(
  state: GameState,
  eventId: string | undefined,
  choiceId: string | undefined
): boolean {
  if (eventId !== "CEVT_38_RETIREMENT_REVERSAL" || choiceId !== "ACCEPT") return false;
  if (state.flags.RETIREMENT_WAS_ANNOUNCED !== true || !state.retirement.announcedDate || state.epilogue.generated) return false;
  const offer = eligiblePostAnnouncementOffer(state);
  return offer !== null && hasPriorPostAnnouncementInterest(state);
}
