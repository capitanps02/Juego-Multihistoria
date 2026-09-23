import type { GameState } from "../core/types.js";
import { materializeAge18MarketOfferInPlace } from "./early-career-market.js";
import {
  advanceWorldDayInPlace as advanceCoreWorldDayInPlace,
  currentSportsCoachNpcId,
  currentSportsCoachTrust
} from "./world-simulator-core.js";
import {
  buildMatchPerformanceContext,
  closeLeagueObjectiveInPlace,
  recordOfficialMatchInPlace,
  remainingLeagueFixtures,
  setOfficialMatchEffectsInPlace
} from "./match-model.js";
import { recordCoreFinalCompetitionMomentInPlace } from "./competition-context.js";
import { recordPenaltyDecisionSetupInPlace } from "./match-penalty-context.js";
import { hasActiveClubEmployment } from "./employment.js";
import { linkFirstPostReturnAppearanceInPlace, recordInjuryClearanceInPlace, recordInjuryEpisodeStartInPlace } from "./injury-episode-authority.js";
import { publishNationalSelectionFactsInPlace } from "./national-selection-producer.js";

const num = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const clamp = (value: number, min = 0, max = 100): number => Math.min(max, Math.max(min, value));
const rounded = (value: number): number => Math.round(value * 1000) / 1000;

function applyMatchDisciplineInPlace(state: GameState, match: ReturnType<typeof recordOfficialMatchInPlace>): void {
  if (!match?.player.appeared || !match.stats) return;
  let yellowAccumulation = Math.max(0, Math.trunc(num(state.sport.yellowCardAccumulation, 0)));
  yellowAccumulation += match.stats.yellowCards;
  let suspensionMatches = Math.max(0, Math.trunc(num(state.sport.suspensionMatches, 0)));
  if (match.stats.redCards > 0) suspensionMatches = Math.max(suspensionMatches, 1);
  while (yellowAccumulation >= 5) {
    yellowAccumulation -= 5;
    suspensionMatches = Math.max(suspensionMatches, 1);
  }
  state.sport.yellowCardAccumulation = yellowAccumulation;
  state.sport.suspensionMatches = suspensionMatches;
}

function applyMatchPerformanceConsequencesInPlace(
  state: GameState,
  match: ReturnType<typeof recordOfficialMatchInPlace>,
  coachNpcIdAtKickoff: string | null
): number {
  if (!match?.player.appeared || !match.stats || typeof match.stats.rating !== "number") return 0;
  const load = match.player.minutes / 90;
  state.body.fatigue = Math.round(clamp(num(state.body.fatigue, 0) + load * 2.8) * 10) / 10;
  state.body.fitness = Math.round(clamp(num(state.body.fitness, 70) - load * 0.7) * 10) / 10;
  state.sport.form = Math.round(clamp(num(state.sport.form, 50) + (match.stats.rating - 6.5) * 0.9) * 10) / 10;

  const currentCoachId = currentSportsCoachNpcId(state);
  if (!coachNpcIdAtKickoff || currentCoachId !== coachNpcIdAtKickoff) return 0;
  const relation = state.relationships.find(row => row.npcId === currentCoachId);
  if (!relation) return 0;
  const before = relation.trust;
  const requested = clamp(
    (match.stats.rating - 6.5) * 0.75
      + match.stats.goals * 0.18
      + match.stats.assists * 0.12
      - match.stats.redCards * 0.45,
    -1.5,
    2.2
  );
  relation.trust = Math.round(clamp(before + requested) * 10) / 10;
  return rounded(relation.trust - before);
}

/**
 * Public world-simulation boundary.
 * The established simulator stays single-sourced in world-simulator-core.ts;
 * this wrapper materializes authoritative offer/sporting facts after that exact tick
 * and consumes zero additional RNG draws.
 */
export function advanceWorldDayInPlace(next: GameState): GameState {
  const beforeDate = next.date;
  const beforeAppearances = num(next.sport.appearances);
  const beforeDebut = next.flags.OFFICIAL_DEBUT === true;
  const beforeFinalContext = next.flags.FINAL_CONTEXT === true;
  const beforeInjuryWeeks = num(next.world.injuryWeeksRemaining, 0);
  const beforeRecovering = next.flags.RECOVERING_INJURY === true;
  const beforeSuspensionMatches = Math.max(0, Math.trunc(num(next.sport.suspensionMatches, 0)));
  const beforeNationalTournamentCycle = next.flags.NATIONAL_TOURNAMENT_CYCLE === true;
  const beforeForm = num(next.sport.form, 50);
  const beforeFatigue = num(next.body.fatigue, 0);
  const beforeFitness = num(next.body.fitness, 70);
  const beforeRoleScore = num(next.sport.roleScore, 0);
  const coachNpcIdAtKickoff = currentSportsCoachNpcId(next);
  const coachTrustAtKickoff = currentSportsCoachTrust(next);

  advanceCoreWorldDayInPlace(next);
  if (next.date === beforeDate) return next;

  // Retirement closure is terminal for the player's active career. The calendar may
  // advance for persistence/UI purposes, but no new match, call-up or market fact may
  // be materialized after the terminal state.
  if (next.retirement.status === "closed") return next;

  publishNationalSelectionFactsInPlace(next, beforeNationalTournamentCycle);

  const afterInjuryWeeks = num(next.world.injuryWeeksRemaining, 0);
  if (beforeInjuryWeeks <= 0 && afterInjuryWeeks > 0 && next.flags.RECOVERING_INJURY === true) {
    recordInjuryEpisodeStartInPlace(next, Math.trunc(afterInjuryWeeks), next.flags.LONG_INJURY === true ? "long" : "standard");
  } else if (beforeInjuryWeeks > 0 && afterInjuryWeeks <= 0 && beforeRecovering && next.flags.RECOVERING_INJURY !== true) {
    recordInjuryClearanceInPlace(next);
  }

  // Age-18 JAN/SUM offers are formal CareerOffer rows produced at the world boundary.
  // The paired active content overlay consumes them through the existing offer bridge.
  materializeAge18MarketOfferInPlace(next);

  if (hasActiveClubEmployment(next) && !beforeFinalContext && next.flags.FINAL_CONTEXT === true) {
    recordCoreFinalCompetitionMomentInPlace(next);
  }

  if (next.runtime.day % 7 === 0 && hasActiveClubEmployment(next) && next.retirement.status !== "closed") {
    const appeared = num(next.sport.appearances) > beforeAppearances;
    const performanceContext = buildMatchPerformanceContext(next, coachTrustAtKickoff);
    const match = recordOfficialMatchInPlace(next, {
      appeared,
      debutOccurred: !beforeDebut && next.flags.OFFICIAL_DEBUT === true,
      injuryUnavailable: next.body.acuteInjury === true && !appeared,
      suspensionUnavailable: beforeSuspensionMatches > 0 && !appeared,
      ...(performanceContext ? { performanceContext } : {})
    });

    if (match) {
      const coachTrustDelta = applyMatchPerformanceConsequencesInPlace(next, match, coachNpcIdAtKickoff);
      applyMatchDisciplineInPlace(next, match);
      setOfficialMatchEffectsInPlace(next, match.id, {
        formDelta: rounded(num(next.sport.form, 50) - beforeForm),
        fatigueDelta: rounded(num(next.body.fatigue, 0) - beforeFatigue),
        fitnessDelta: rounded(num(next.body.fitness, 70) - beforeFitness),
        coachTrustDelta,
        roleScoreDelta: rounded(num(next.sport.roleScore, 0) - beforeRoleScore)
      });
      recordPenaltyDecisionSetupInPlace(next, match);
      linkFirstPostReturnAppearanceInPlace(next, match);
    }

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
