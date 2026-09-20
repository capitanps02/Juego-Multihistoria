import type { GameState } from "../../../core/types.js";
import { projectSeedMemory } from "../../../narrative/seed-memory.js";
import { contractEmploymentStatus, getEligibleCareerOffers } from "../../../simulation/offers.js";
import { getSportMatchModelStore } from "../../../simulation/match-model.js";
import { resolveCurrentPlayerClubLeadership } from "../../../simulation/player-leadership-authority.js";
import { resolveNationalTeamAuthority } from "../../../simulation/national-team-authority.js";
import { A8_ORDINARY_SEED_WRITERS } from "./staged-runtime.js";

const TERMINAL_SEEDS = new Set([
  "SEED_FAREWELL_ANNOUNCEMENT_TIMING",
  "SEED_FINAL_FAMILY_CONVERSATION",
  "SEED_LAST_REHAB_DECISION",
  "SEED_RETIRE_ON_HIGH_CHOICE",
  "SEED_RETIRE_AFTER_LOW",
  "SEED_DISCARDED_REBIRTH_FINAL",
  "SEED_RETIREMENT_ANNOUNCEMENT_PATH",
  "SEED_LAST_MATCH_SHAPE",
  "SEED_FAREWELL_CONTROL_FINAL"
]);

/**
 * Read-only Agent-8 -> Agent-9 boundary projection.
 * It reports only facts already present in authoritative state. Missing rich histories remain
 * explicitly unavailable; this function never manufactures retirement, offers, injuries or matches.
 */
export function buildAgent9LateCareerHandoff(state:GameState) {
  const store=getSportMatchModelStore(state);
  const currentClubRows=(store?.fixtures??[])
    .filter(row=>row.club===state.professional.registrationClub)
    .slice(-8)
    .map(row=>structuredClone(row));

  const ordinarySeedIds=[...new Set(A8_ORDINARY_SEED_WRITERS.map(row=>row.seedId))];
  const legacyMemories=ordinarySeedIds
    .map(seedId=>projectSeedMemory(state,seedId))
    .filter(memory=>memory.historicalExists)
    .map(memory=>structuredClone(memory));

  const unresolvedTerminalSeeds=state.seeds
    .filter(seed=>TERMINAL_SEEDS.has(seed.id) && seed.state!=="resolved" && seed.state!=="expired")
    .map(seed=>structuredClone(seed));

  return {
    generatedAtDate:state.date,
    age:state.age,
    careerStatus:state.retirement.status,
    club:{
      displayClub:state.club,
      registrationClub:state.professional.registrationClub,
      ownerClub:state.professional.ownerClub,
      leagueTier:state.professional.leagueTier
    },
    employment:{
      status:contractEmploymentStatus(state),
      contract:structuredClone(state.contract),
      eligibleCareerOffers:getEligibleCareerOffers(state).map(offer=>structuredClone(offer))
    },
    sport:{
      recentOfficialRows:currentClubRows,
      latestAppearance:[...currentClubRows].reverse().find(row=>row.player.appeared)??null,
      richResultGoalsAssistsCardsAuthorityAvailable:false
    },
    body:{
      acuteInjury:state.body.acuteInjury,
      availability:state.professional.availability,
      recoveryDebt:state.professional.recoveryDebt,
      bodyLoad:state.professional.bodyLoad,
      injuryWeeksRemaining:Number(state.world.injuryWeeksRemaining??0),
      episodeHistoryAuthorityAvailable:false
    },
    homeFamily:{
      relocationTradeoff:projectSeedMemory(state,"SEED_FINAL_RELOCATION_TRADEOFF"),
      finalHomeWindow:projectSeedMemory(state,"SEED_FINAL_HOME_WINDOW"),
      homeSuccessWithoutYou:projectSeedMemory(state,"SEED_HOME_SUCCESS_WITHOUT_YOU"),
      tenMatchHomeReturn:projectSeedMemory(state,"SEED_TEN_MATCH_HOME_RETURN")
    },
    leadership:structuredClone(resolveCurrentPlayerClubLeadership(state)),
    national:structuredClone(resolveNationalTeamAuthority(state)),
    ordinaryLateCareerMemories:legacyMemories,
    unresolvedTerminalSeeds,
    handoffRules:{
      agent8MayMutateRetirement:false,
      agent9OwnsTerminalTransition:true,
      missingRichSportHistoryMeansUnknown:true,
      missingInjuryEpisodeHistoryMeansUnknown:true
    }
  };
}
