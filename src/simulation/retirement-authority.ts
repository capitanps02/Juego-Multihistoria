import type { GameState } from "../core/types.js";
import { getLastPlayerAppearanceContext, getSportContext } from "./sport-context.js";

export interface RetirementNoLastMatchFact {
  eligible: boolean;
  cause: "injury" | null;
  missedFixtureId: string | null;
  missedFixtureDate: string | null;
  lastAppearanceFixtureId: string | null;
}

const unavailable = (): RetirementNoLastMatchFact => ({
  eligible: false,
  cause: null,
  missedFixtureId: null,
  missedFixtureDate: null,
  lastAppearanceFixtureId: null
});

/**
 * Read-only factual proof for the canonical injury-caused no-last-match route.
 * It consumes only public Sport authority: a completed season, the final persisted
 * official fixture, and the latest actual player appearance. No RNG or state mutation.
 */
export function retirementNoLastMatchFact(state: GameState): RetirementNoLastMatchFact {
  if (state.retirement.status !== "announced" || !state.retirement.announcedDate) return unavailable();

  const sport = getSportContext(state);
  if (sport.availability.remainingOfficialMatches !== "known" || sport.remainingOfficialMatches !== 0) return unavailable();
  if (sport.availability.previousFixture !== "known" || !sport.previousFixture) return unavailable();

  const missed = sport.previousFixture;
  if (missed.date < state.retirement.announcedDate) return unavailable();
  if (missed.player.appeared || missed.player.injuryUnavailable !== true) return unavailable();

  const lastAppearance = getLastPlayerAppearanceContext(state);
  if (lastAppearance.status !== "authoritative") return unavailable();
  if (lastAppearance.match && lastAppearance.match.date >= state.retirement.announcedDate) return unavailable();

  return {
    eligible: true,
    cause: "injury",
    missedFixtureId: missed.id,
    missedFixtureDate: missed.date,
    lastAppearanceFixtureId: lastAppearance.match?.id ?? null
  };
}
