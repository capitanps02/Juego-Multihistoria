import type { GameState } from "../core/types.js";
import { advanceWorldDayInPlace as advanceCoreWorldDayInPlace } from "./world-simulator-core.js";
import { closeLeagueObjectiveInPlace, recordOfficialMatchInPlace, remainingLeagueFixtures } from "./match-model.js";
import { recordPenaltyHierarchyContextInPlace } from "./penalty-context.js";

const num = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

/**
 * Public world-simulation boundary.
 * The established simulator stays single-sourced in world-simulator-core.ts;
 * this wrapper materializes authoritative sporting facts after that exact tick
 * and consumes zero additional RNG draws.
 */
export function advanceWorldDayInPlace(next: GameState): GameState {
  const beforeDate = next.date;
  const beforeAppearances = num(next.sport.appearances);
  const beforeDebut = next.flags.OFFICIAL_DEBUT === true;

  advanceCoreWorldDayInPlace(next);
  if (next.date === beforeDate) return next;

  if (next.runtime.day % 7 === 0) {
    const appeared = num(next.sport.appearances) > beforeAppearances;
    const match = recordOfficialMatchInPlace(next, {
      appeared,
      debutOccurred: !beforeDebut && next.flags.OFFICIAL_DEBUT === true,
      injuryUnavailable: next.body.acuteInjury === true && !appeared
    });

    if (match) recordPenaltyHierarchyContextInPlace(next, match);

    // The legacy udvSeasonResolved flag can flip on the first May tick while
    // scheduled league fixtures still remain. It is therefore not authoritative
    // evidence that the concrete league objective is closed. Close the objective
    // only when the producer's own fixture calendar is exhausted.
    if (match && remainingLeagueFixtures(next) === 0) {
      const outcome = next.professional.registrationClub === "UDV"
        ? next.flags.UDV_RELEGATED === true
          ? "relegated"
          : next.flags.UDV_PLAYOFF === true
            ? "playoff"
            : "safe"
        : "season_complete";
      closeLeagueObjectiveInPlace(next, outcome);
    }
  }

  return next;
}

export function advanceWorldDay(state: GameState): GameState {
  return advanceWorldDayInPlace(structuredClone(state));
}
