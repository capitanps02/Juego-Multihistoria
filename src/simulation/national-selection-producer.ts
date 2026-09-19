import type { GameState } from "../core/types.js";
import {
  getNationalSelectionAuthorityStore,
  recordNationalFinalSquadInPlace,
  recordNationalPreselectionInPlace,
  type NationalSelectionMembership
} from "./national-team-authority.js";

const PRODUCER_ID = "world_national_selection_v1";
export const NATIONAL_FINAL_PUBLICATION_DELAY_DAYS = 21;

function cycleIdentity(state: GameState): { cycleId: string; tournamentId: string } | null {
  if (![24, 28, 32].includes(state.age)) return null;
  return {
    cycleId: `NT_MAJOR_${state.age}:${state.season}`,
    tournamentId: `NT_MAJOR_${state.age}`
  };
}

/**
 * Observe the simulator's national-selection publication boundary.
 *
 * The reader never infers membership from nationalStanding/caps/reputation/role.
 * Membership is written only here, at a concrete world-simulation boundary:
 * - preliminary list: the tournament-cycle opens;
 * - final list: 21 runtime days after the persisted preliminary publication.
 *
 * No RNG stream is read or advanced.
 */
export function publishNationalSelectionFactsInPlace(
  state: GameState,
  beforeTournamentCycleOpen: boolean
): void {
  const identity = cycleIdentity(state);
  if (!identity) return;

  const cycleOpen = state.flags.NATIONAL_TOURNAMENT_CYCLE === true;
  if (!beforeTournamentCycleOpen && cycleOpen) {
    recordNationalPreselectionInPlace(state, {
      ...identity,
      membership: state.flags.NATIONAL_RETIRED === true || state.flags.NATIONAL_GATE_OPEN !== true
        ? "omitted"
        : "selected",
      source: { kind: "simulation_publication", producerId: PRODUCER_ID }
    });
  }

  const store = getNationalSelectionAuthorityStore(state);
  const cycle = store?.cycles.find(row => row.cycleId === identity.cycleId);
  if (!cycle?.preliminary || cycle.preliminary.membership !== "selected" || cycle.final) return;
  if (state.runtime.day - cycle.preliminary.runtimeDay < NATIONAL_FINAL_PUBLICATION_DELAY_DAYS) return;

  let membership: NationalSelectionMembership;
  if (state.flags.NATIONAL_RETIRED === true) membership = "withdrawn";
  else membership = state.flags.NATIONAL_GATE_OPEN === true ? "selected" : "omitted";

  recordNationalFinalSquadInPlace(state, {
    cycleId: identity.cycleId,
    membership,
    role: null,
    source: { kind: "simulation_publication", producerId: PRODUCER_ID }
  });
}
