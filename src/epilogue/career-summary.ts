import type { GameState } from "../core/types.js";

const num = (value: unknown, fallback = 0): number => typeof value === "number" ? value : fallback;
const text = (value: unknown): string | null => typeof value === "string" && value.length > 0 ? value : null;

export interface LastProfessionalAppearanceFact {
  /** True only when a post-announcement appearance delta was observed. */
  observed: boolean;
  /** Current authority is aggregate sport.appearances; fixture-level authority is not yet available. */
  authority: "sport.appearances_delta" | "none";
  date: string | null;
  club: string | null;
  fixture: null;
  opponent: null;
  competition: null;
  minutes: null;
  starter: null;
  result: null;
  goals: null;
  assists: null;
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

function collectCareerClubs(state: GameState): string[] {
  const clubs = new Set<string>();
  for (const entry of state.history) if (entry.club) clubs.add(entry.club);
  if (state.club) clubs.add(state.club);
  if (state.professional.ownerClub) clubs.add(state.professional.ownerClub);
  if (state.professional.registrationClub) clubs.add(state.professional.registrationClub);

  const marketHistory = (state.market as any)?.history;
  if (Array.isArray(marketHistory)) {
    for (const decision of marketHistory) {
      if (decision?.accepted === true && typeof decision?.offer?.terms?.club === "string") clubs.add(decision.offer.terms.club);
      if (typeof decision?.offer?.before?.club === "string") clubs.add(decision.offer.before.club);
    }
  }
  return [...clubs];
}

function firstRecordedClub(state: GameState): string | null {
  const historyClub = state.history.find(entry => typeof entry.club === "string" && entry.club.length > 0)?.club;
  return text(historyClub) ?? text(state.professional.ownerClub) ?? text(state.club);
}

function lastRecordedClub(state: GameState): string | null {
  return text(state.professional.registrationClub) ?? text(state.club) ?? text(state.professional.ownerClub);
}

export function buildCareerSummary(state: GameState): CareerSummary {
  const observed = state.flags.LAST_MATCH_PLAYED === true;
  const lastAppearance: LastProfessionalAppearanceFact = {
    observed,
    authority: observed ? "sport.appearances_delta" : "none",
    date: observed ? text(state.world.retirementLastAppearanceDate) : null,
    club: observed ? lastRecordedClub(state) : null,
    fixture: null,
    opponent: null,
    competition: null,
    minutes: null,
    starter: null,
    result: null,
    goals: null,
    assists: null
  };

  return {
    terminal: state.retirement.status === "closed",
    retirementStatus: state.retirement.status,
    retirementReason: text(state.retirement.reason),
    retirementClosureType: text(state.retirement.closureType),
    decisionAge: state.retirement.decisionAge,
    decidedDate: state.retirement.decidedDate,
    announcedDate: state.retirement.announcedDate,
    closedDate: state.retirement.closedDate,
    careerAgeAtSnapshot: state.age,
    firstClub: firstRecordedClub(state),
    lastClub: lastRecordedClub(state),
    careerClubs: collectCareerClubs(state),
    careerAppearances: num(state.sport.appearances),
    careerGoals: null,
    majorTrophies: null,
    mostImportantClub: null,
    clubWithMostSeasons: null,
    clubWithMostSuccess: null,
    nationalCaps: num(state.professional.nationalCaps),
    majorLongInjuries: num(state.world.maturityLongInjuryCount),
    lastProfessionalAppearance: lastAppearance,
    missingAuthoritativeFacts: [
      "fixture identity",
      "opponent",
      "competition",
      "appearance minutes",
      "starter/bench status",
      "match result",
      "career goals",
      "last-appearance goals/assists",
      "structured trophy history",
      "structured captaincy history",
      "most-important-club authority"
    ]
  };
}
